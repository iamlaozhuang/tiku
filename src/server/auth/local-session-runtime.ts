import { randomBytes, randomUUID } from "node:crypto";

import { and, asc, eq, isNotNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { hashPassword, verifyPassword } from "better-auth/crypto";

import * as authSchema from "@/db/schema/auth";
import type { AuthSessionSnapshot } from "./auth-boundary";
import { createSessionRouteHandlers } from "./session-route";
import type {
  CreateSingleActiveSessionInput,
  PasswordCredentialInput,
  SessionCredentialAdapter,
} from "./session-boundary";
import type { UserRegistrationCredentialAdapter } from "./user-registration-boundary";
import { createUserRegistrationRouteHandlers } from "./user-registration-route";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthContextDto,
  SessionLoginDto,
} from "../contracts/auth-contract";
import type { AdminRole, UserStatus, UserType } from "../models/auth";
import type {
  AuthUserAccessRow,
  AuthUserRepository,
} from "../repositories/auth-repository";
import type {
  LoginFailureInput,
  SessionLoginUserRow,
  SessionUserRepository,
} from "../repositories/session-repository";
import type { UserRegistrationRepository } from "../repositories/user-registration-repository";
import { createRuntimeDatabaseForSchema } from "../repositories/runtime-database";
import { createAuthService } from "../services/auth-service";
import {
  createSessionService,
  type SessionService,
} from "../services/session-service";
import {
  createUserRegistrationService,
  type UserRegistrationService,
} from "../services/user-registration-service";
import {
  findLocalAcceptanceSessionByToken,
  findLocalAcceptanceUserByAuthUserId,
  isLocalAcceptanceRuntimeEnabled,
} from "../services/local-acceptance-session-service";

type LocalSessionRuntimeDatabase = PostgresJsDatabase<typeof authSchema>;

type LocalSessionCredentialAdapter = SessionCredentialAdapter & {
  findSessionByToken(sessionToken: string): Promise<AuthSessionSnapshot | null>;
};

export type VerifyPasswordHashInput = {
  hash: string;
  password: string;
};

export type LocalSessionRuntimeOptions = {
  authUserRepository?: AuthUserRepository;
  createDatabase?: () => LocalSessionRuntimeDatabase;
  createSessionId?: () => string;
  createToken?: () => string;
  credentialAdapter?: LocalSessionCredentialAdapter;
  now?: () => Date;
  sessionUserRepository?: SessionUserRepository;
  verifyPasswordHash?: (input: VerifyPasswordHashInput) => Promise<boolean>;
};

export type LocalUserRegistrationRuntimeOptions = {
  createAuthAccountId?: () => string;
  createAuthUserId?: () => string;
  createDatabase?: () => LocalSessionRuntimeDatabase;
  createUserPublicId?: () => string;
  credentialAdapter?: UserRegistrationCredentialAdapter;
  hashPasswordValue?: (password: string) => Promise<string>;
  userRegistrationRepository?: UserRegistrationRepository;
};

const {
  admin,
  adminOrganization,
  authAccount,
  authSession,
  authUser,
  employee,
  organization,
  student,
  user,
} = authSchema;

const SESSION_RUNTIME_UNAVAILABLE_CODE = 503001;
const CREDENTIAL_PROVIDER_ID = "credential";
const PASSWORD_FIELD = "password";
const SESSION_TOKEN_FIELD = "token";
const localAdminLoginFailureState = new Map<
  number,
  { loginFailedCount: number; lockedUntilAt: Date | null }
>();

function createRuntimeUnavailableResponse<TData>(): ApiResponse<TData | null> {
  return createErrorResponse(
    SESSION_RUNTIME_UNAVAILABLE_CODE,
    "Session runtime is not configured.",
  );
}

function createDefaultSessionId(): string {
  return `session-${randomUUID()}`;
}

function createDefaultToken(): string {
  return randomBytes(32).toString("base64url");
}

function createDefaultAuthUserId(): string {
  return `auth-user-${randomUUID()}`;
}

function createDefaultAuthAccountId(): string {
  return `auth-account-${randomUUID()}`;
}

function createDefaultUserPublicId(): string {
  return `user-${randomUUID()}`;
}

function normalizeAdminRoles(value: unknown): AdminRole[] {
  return Array.isArray(value) ? (value as AdminRole[]) : [];
}

function isOrganizationAdminRole(adminRole: AdminRole): boolean {
  return (
    adminRole === "org_standard_admin" || adminRole === "org_advanced_admin"
  );
}

function createPostgresAuthUserRepository(
  getDatabase: () => LocalSessionRuntimeDatabase,
): AuthUserRepository {
  return {
    async findActiveUserByAuthUserId(authUserId) {
      const database = getDatabase();
      const userRow = await findActiveUserAccountByAuthUserId(
        database,
        authUserId,
      );

      if (userRow !== null) {
        return userRow;
      }

      return findActiveAdminAccountByAuthUserId(database, authUserId);
    },
  };
}

function createPostgresSessionUserRepository(
  getDatabase: () => LocalSessionRuntimeDatabase,
): SessionUserRepository {
  return {
    async findLoginUserByPhone(phone) {
      const database = getDatabase();
      const userRow = await findLoginUserAccountByPhone(database, phone);

      if (userRow !== null) {
        return userRow;
      }

      return findLoginAdminAccountByPhone(database, phone);
    },

    async recordLoginFailure(input: LoginFailureInput) {
      if (input.userKind === "admin") {
        localAdminLoginFailureState.set(input.userId, {
          loginFailedCount: input.loginFailedCount,
          lockedUntilAt: input.lockedUntilAt,
        });
        return;
      }

      const database = getDatabase();

      await database
        .update(user)
        .set({
          locked_until_at: input.lockedUntilAt,
          login_failed_count: input.loginFailedCount,
          updated_at: new Date(),
        })
        .where(eq(user.id, input.userId));
    },

    async resetLoginFailures(userId, userKind) {
      if (userKind === "admin") {
        localAdminLoginFailureState.delete(userId);
        return;
      }

      const database = getDatabase();

      await database
        .update(user)
        .set({
          locked_until_at: null,
          login_failed_count: 0,
          updated_at: new Date(),
        })
        .where(eq(user.id, userId));
    },
  };
}

function createPostgresSessionCredentialAdapter(
  getDatabase: () => LocalSessionRuntimeDatabase,
  options: Required<
    Pick<
      LocalSessionRuntimeOptions,
      "createSessionId" | "createToken" | "verifyPasswordHash"
    >
  >,
): LocalSessionCredentialAdapter {
  return {
    async verifyPasswordCredential(input: PasswordCredentialInput) {
      const database = getDatabase();
      const [row] = await database
        .select({
          [PASSWORD_FIELD]: authAccount.password,
        })
        .from(authAccount)
        .where(
          and(
            eq(authAccount.user_id, input.authUserId),
            eq(authAccount.provider_id, CREDENTIAL_PROVIDER_ID),
          ),
        )
        .limit(1);
      const storedPasswordHash = row?.password;

      if (typeof storedPasswordHash !== "string") {
        return false;
      }

      return options.verifyPasswordHash({
        hash: storedPasswordHash,
        [PASSWORD_FIELD]: input.password,
      });
    },

    async createSingleActiveSession(input: CreateSingleActiveSessionInput) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        await transaction
          .delete(authSession)
          .where(eq(authSession.user_id, input.authUserId));

        const [row] = await transaction
          .insert(authSession)
          .values({
            expires_at: input.expiresAt,
            id: options.createSessionId(),
            ip_address: null,
            [SESSION_TOKEN_FIELD]: options.createToken(),
            user_agent: null,
            user_id: input.authUserId,
          })
          .returning({
            auth_user_id: authSession.user_id,
            expires_at: authSession.expires_at,
            [SESSION_TOKEN_FIELD]: authSession.token,
          });

        if (row === undefined) {
          throw new Error("Session insert did not return a row.");
        }

        return row;
      });
    },

    async createSession(input: CreateSingleActiveSessionInput) {
      const database = getDatabase();
      const [row] = await database
        .insert(authSession)
        .values({
          expires_at: input.expiresAt,
          id: options.createSessionId(),
          ip_address: null,
          [SESSION_TOKEN_FIELD]: options.createToken(),
          user_agent: null,
          user_id: input.authUserId,
        })
        .returning({
          auth_user_id: authSession.user_id,
          expires_at: authSession.expires_at,
          [SESSION_TOKEN_FIELD]: authSession.token,
        });

      if (row === undefined) {
        throw new Error("Session insert did not return a row.");
      }

      return row;
    },

    async findSessionByToken(sessionToken) {
      const database = getDatabase();
      const [row] = await database
        .select({
          auth_user_id: authSession.user_id,
          expires_at: authSession.expires_at,
          [SESSION_TOKEN_FIELD]: authSession.token,
        })
        .from(authSession)
        .where(eq(authSession.token, sessionToken))
        .limit(1);

      return row ?? null;
    },
  };
}

function createPostgresUserRegistrationCredentialAdapter(
  getDatabase: () => LocalSessionRuntimeDatabase,
  options: Required<
    Pick<
      LocalUserRegistrationRuntimeOptions,
      "createAuthAccountId" | "createAuthUserId" | "hashPasswordValue"
    >
  >,
): UserRegistrationCredentialAdapter {
  return {
    async createPasswordCredential(input) {
      const database = getDatabase();
      const authUserId = options.createAuthUserId();
      const passwordHash = await options.hashPasswordValue(input.password);

      await database.transaction(async (transaction) => {
        await transaction.insert(authUser).values({
          created_at: new Date(),
          email: `phone-${input.phone}@tiku.local`,
          email_verified: new Date(),
          id: authUserId,
          image: null,
          name: input.phone,
          updated_at: new Date(),
        });

        await transaction.insert(authAccount).values({
          access_token: null,
          access_token_expires_at: null,
          account_id: authUserId,
          created_at: new Date(),
          id: options.createAuthAccountId(),
          id_token: null,
          [PASSWORD_FIELD]: passwordHash,
          provider_id: CREDENTIAL_PROVIDER_ID,
          refresh_token: null,
          refresh_token_expires_at: null,
          scope: null,
          updated_at: new Date(),
          user_id: authUserId,
        });
      });

      return { authUserId };
    },
  };
}

function createPostgresUserRegistrationRepository(
  getDatabase: () => LocalSessionRuntimeDatabase,
  options: Required<
    Pick<LocalUserRegistrationRuntimeOptions, "createUserPublicId">
  >,
): UserRegistrationRepository {
  return {
    async findRegisteredUserByPhone(phone) {
      const database = getDatabase();
      const [row] = await database
        .select({
          auth_user_id: user.auth_user_id,
          employee_public_id: employee.public_id,
          id: user.id,
          locked_until_at: user.locked_until_at,
          name: user.name,
          organization_public_id: organization.public_id,
          phone: user.phone,
          public_id: user.public_id,
          status: user.status,
          user_type: user.user_type,
        })
        .from(user)
        .leftJoin(employee, eq(employee.user_id, user.id))
        .leftJoin(organization, eq(organization.id, employee.organization_id))
        .where(and(eq(user.phone, phone), isNotNull(user.auth_user_id)))
        .limit(1);

      return row === undefined ? null : mapUserAccountRow(row);
    },

    async createPersonalUser(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const [userRow] = await transaction
          .insert(user)
          .values({
            auth_user_id: input.authUserId,
            disabled_at: null,
            locked_until_at: null,
            login_failed_count: 0,
            name: input.name,
            phone: input.phone,
            public_id: options.createUserPublicId(),
            status: "active",
            user_type: "personal",
          })
          .returning({
            auth_user_id: user.auth_user_id,
            id: user.id,
            locked_until_at: user.locked_until_at,
            name: user.name,
            phone: user.phone,
            public_id: user.public_id,
            status: user.status,
            user_type: user.user_type,
          });

        if (userRow === undefined) {
          throw new Error("Personal user insert did not return a row.");
        }

        await transaction.insert(student).values({
          user_id: userRow.id,
        });

        return {
          ...mapUserAccountRow({
            ...userRow,
            employee_public_id: null,
            organization_public_id: null,
          }),
          admin_public_id: null,
          admin_roles: [],
        };
      });
    },
  };
}

function createLazyDatabaseGetter(
  createDatabase: () => LocalSessionRuntimeDatabase,
): () => LocalSessionRuntimeDatabase {
  let cachedDatabase: LocalSessionRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function createRuntimeService(
  options: LocalSessionRuntimeOptions,
): SessionService {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );
  const baseCredentialAdapter =
    options.credentialAdapter ??
    createPostgresSessionCredentialAdapter(getDatabase, {
      createSessionId: options.createSessionId ?? createDefaultSessionId,
      createToken: options.createToken ?? createDefaultToken,
      verifyPasswordHash:
        options.verifyPasswordHash ??
        ((input) =>
          verifyPassword({
            hash: input.hash,
            [PASSWORD_FIELD]: input.password,
          })),
    });
  const credentialAdapter = isLocalAcceptanceRuntimeEnabled()
    ? {
        ...baseCredentialAdapter,
        async findSessionByToken(sessionToken: string) {
          const localAcceptanceSession = findLocalAcceptanceSessionByToken(
            sessionToken,
            options.now?.() ?? new Date(),
          );

          return (
            localAcceptanceSession ??
            baseCredentialAdapter.findSessionByToken(sessionToken)
          );
        },
      }
    : baseCredentialAdapter;
  const baseAuthUserRepository =
    options.authUserRepository ?? createPostgresAuthUserRepository(getDatabase);
  const authUserRepository = isLocalAcceptanceRuntimeEnabled()
    ? {
        async findActiveUserByAuthUserId(authUserId: string) {
          const localAcceptanceUser = findLocalAcceptanceUserByAuthUserId(
            authUserId,
            options.now?.() ?? new Date(),
          );

          return (
            localAcceptanceUser ??
            baseAuthUserRepository.findActiveUserByAuthUserId(authUserId)
          );
        },
      }
    : baseAuthUserRepository;
  const sessionUserRepository =
    options.sessionUserRepository ??
    createPostgresSessionUserRepository(getDatabase);
  const authService = createAuthService(credentialAdapter, authUserRepository, {
    now: options.now,
  });

  return createSessionService(
    credentialAdapter,
    sessionUserRepository,
    {
      now: options.now,
    },
    authService,
  );
}

export function createLocalSessionRuntime(
  options: LocalSessionRuntimeOptions = {},
): SessionService {
  const sessionService = createRuntimeService(options);

  return {
    async login(input) {
      try {
        return await sessionService.login(input);
      } catch (error) {
        if (isRuntimeConfigurationError(error)) {
          return createRuntimeUnavailableResponse<SessionLoginDto>();
        }

        throw error;
      }
    },

    async getCurrentSession(input) {
      try {
        return await sessionService.getCurrentSession(input);
      } catch (error) {
        if (isRuntimeConfigurationError(error)) {
          return createRuntimeUnavailableResponse<AuthContextDto>();
        }

        throw error;
      }
    },
  };
}

export function createLocalSessionRouteHandlers(
  options: LocalSessionRuntimeOptions = {},
) {
  return createSessionRouteHandlers(createLocalSessionRuntime(options));
}

function createUserRegistrationRuntimeService(
  options: LocalUserRegistrationRuntimeOptions,
): UserRegistrationService {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );
  const credentialAdapter =
    options.credentialAdapter ??
    createPostgresUserRegistrationCredentialAdapter(getDatabase, {
      createAuthAccountId:
        options.createAuthAccountId ?? createDefaultAuthAccountId,
      createAuthUserId: options.createAuthUserId ?? createDefaultAuthUserId,
      hashPasswordValue: options.hashPasswordValue ?? hashPassword,
    });
  const userRegistrationRepository =
    options.userRegistrationRepository ??
    createPostgresUserRegistrationRepository(getDatabase, {
      createUserPublicId:
        options.createUserPublicId ?? createDefaultUserPublicId,
    });

  return createUserRegistrationService(
    credentialAdapter,
    userRegistrationRepository,
  );
}

export function createLocalUserRegistrationRuntime(
  options: LocalUserRegistrationRuntimeOptions = {},
): UserRegistrationService {
  const userRegistrationService = createUserRegistrationRuntimeService(options);

  return {
    async registerPersonalUser(input) {
      try {
        return await userRegistrationService.registerPersonalUser(input);
      } catch (error) {
        if (isRuntimeConfigurationError(error)) {
          return createRuntimeUnavailableResponse();
        }

        throw error;
      }
    },
  };
}

export function createLocalUserRegistrationRouteHandlers(
  options: LocalUserRegistrationRuntimeOptions = {},
) {
  return createUserRegistrationRouteHandlers(
    createLocalUserRegistrationRuntime(options),
  );
}

async function findActiveUserAccountByAuthUserId(
  database: LocalSessionRuntimeDatabase,
  authUserId: string,
): Promise<AuthUserAccessRow | null> {
  const [row] = await database
    .select({
      auth_user_id: user.auth_user_id,
      employee_public_id: employee.public_id,
      id: user.id,
      locked_until_at: user.locked_until_at,
      name: user.name,
      organization_public_id: organization.public_id,
      phone: user.phone,
      public_id: user.public_id,
      status: user.status,
      user_type: user.user_type,
    })
    .from(user)
    .leftJoin(employee, eq(employee.user_id, user.id))
    .leftJoin(organization, eq(organization.id, employee.organization_id))
    .where(
      and(
        eq(user.auth_user_id, authUserId),
        eq(user.status, "active"),
        isNotNull(user.auth_user_id),
      ),
    )
    .limit(1);

  return row === undefined ? null : mapUserAccountRow(row);
}

async function findActiveAdminAccountByAuthUserId(
  database: LocalSessionRuntimeDatabase,
  authUserId: string,
): Promise<AuthUserAccessRow | null> {
  const [row] = await database
    .select({
      admin_role: admin.admin_role,
      auth_user_id: admin.auth_user_id,
      id: admin.id,
      name: admin.name,
      organization_public_id: organization.public_id,
      phone: admin.phone,
      public_id: admin.public_id,
      status: admin.status,
    })
    .from(admin)
    .leftJoin(adminOrganization, eq(adminOrganization.admin_id, admin.id))
    .leftJoin(
      organization,
      eq(organization.id, adminOrganization.organization_id),
    )
    .where(
      and(
        eq(admin.auth_user_id, authUserId),
        eq(admin.status, "active"),
        isNotNull(admin.auth_user_id),
      ),
    )
    .orderBy(asc(organization.public_id))
    .limit(1);

  return row === undefined ? null : mapAdminAccountRow(row);
}

async function findLoginUserAccountByPhone(
  database: LocalSessionRuntimeDatabase,
  phone: string,
): Promise<SessionLoginUserRow | null> {
  const [row] = await database
    .select({
      auth_user_id: user.auth_user_id,
      employee_public_id: employee.public_id,
      id: user.id,
      locked_until_at: user.locked_until_at,
      login_failed_count: user.login_failed_count,
      name: user.name,
      organization_public_id: organization.public_id,
      phone: user.phone,
      public_id: user.public_id,
      status: user.status,
      user_type: user.user_type,
    })
    .from(user)
    .leftJoin(employee, eq(employee.user_id, user.id))
    .leftJoin(organization, eq(organization.id, employee.organization_id))
    .where(and(eq(user.phone, phone), isNotNull(user.auth_user_id)))
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    ...mapUserAccountRow(row),
    login_failed_count: row.login_failed_count,
    login_failure_user_id: row.id,
  };
}

async function findLoginAdminAccountByPhone(
  database: LocalSessionRuntimeDatabase,
  phone: string,
): Promise<SessionLoginUserRow | null> {
  const [row] = await database
    .select({
      admin_role: admin.admin_role,
      auth_user_id: admin.auth_user_id,
      id: admin.id,
      name: admin.name,
      organization_public_id: organization.public_id,
      phone: admin.phone,
      public_id: admin.public_id,
      status: admin.status,
    })
    .from(admin)
    .leftJoin(adminOrganization, eq(adminOrganization.admin_id, admin.id))
    .leftJoin(
      organization,
      eq(organization.id, adminOrganization.organization_id),
    )
    .where(and(eq(admin.phone, phone), isNotNull(admin.auth_user_id)))
    .orderBy(asc(organization.public_id))
    .limit(1);

  if (row === undefined) {
    return null;
  }
  const loginFailureState = localAdminLoginFailureState.get(row.id) ?? {
    loginFailedCount: 0,
    lockedUntilAt: null,
  };

  return {
    ...mapAdminAccountRow({
      ...row,
      locked_until_at: loginFailureState.lockedUntilAt,
    }),
    login_failed_count: loginFailureState.loginFailedCount,
    login_failure_user_id: row.id,
    login_failure_user_kind: "admin",
  };
}

function mapUserAccountRow(row: {
  auth_user_id: string | null;
  employee_public_id: string | null;
  id: number;
  locked_until_at: Date | null;
  name: string;
  organization_public_id: string | null;
  phone: string;
  public_id: string;
  status: UserStatus;
  user_type: UserType;
}): AuthUserAccessRow {
  if (row.auth_user_id === null) {
    throw new Error("Active user account is missing auth_user_id.");
  }

  return {
    admin_public_id: null,
    admin_roles: [],
    auth_user_id: row.auth_user_id,
    employee_public_id: row.employee_public_id,
    id: row.id,
    locked_until_at: row.locked_until_at,
    name: row.name,
    organization_public_id: row.organization_public_id,
    phone: row.phone,
    public_id: row.public_id,
    status: row.status,
    user_type: row.user_type,
  };
}

function mapAdminAccountRow(row: {
  admin_role: AdminRole;
  auth_user_id: string | null;
  id: number;
  locked_until_at?: Date | null;
  name: string;
  organization_public_id?: string | null;
  phone: string;
  public_id: string;
  status: UserStatus;
}): AuthUserAccessRow {
  if (row.auth_user_id === null) {
    throw new Error("Active admin account is missing auth_user_id.");
  }

  return {
    admin_public_id: row.public_id,
    admin_roles: normalizeAdminRoles([row.admin_role]),
    auth_user_id: row.auth_user_id,
    employee_public_id: null,
    id: row.id,
    locked_until_at: row.locked_until_at ?? null,
    name: row.name,
    organization_public_id: isOrganizationAdminRole(row.admin_role)
      ? (row.organization_public_id ?? null)
      : null,
    phone: row.phone,
    public_id: row.public_id,
    status: row.status,
    user_type: null,
  };
}

function createLocalRuntimeDatabase(): LocalSessionRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    authSchema,
    "DATABASE_URL is required for session runtime.",
  );
}

function isRuntimeConfigurationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === "DATABASE_URL is required for session runtime."
  );
}
