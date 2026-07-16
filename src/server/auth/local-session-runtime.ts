import { randomBytes, randomUUID } from "node:crypto";

import {
  and,
  asc,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  lte,
  sql,
} from "drizzle-orm";
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
import { SessionAccountStateError } from "./session-boundary";
import { createUserRegistrationRouteHandlers } from "./user-registration-route";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthContextDto,
  SessionLoginDto,
} from "../contracts/auth-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
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
import {
  createRegistrationSessionId,
  type UserRegistrationRepository,
} from "../repositories/user-registration-repository";
import { findAccountPhoneIdentityConflictUnderLock } from "../repositories/account-phone-identity-lock";
import { createRuntimeDatabaseForSchema } from "../repositories/runtime-database";
import { createOrgAuthCoversOrganizationCondition } from "../repositories/organization-scope-query";
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
  createRegistrationSessionId?: (idempotencyKey: string) => string;
  createToken?: () => string;
  createUserPublicId?: () => string;
  hashPasswordValue?: (password: string) => Promise<string>;
  now?: () => Date;
  userRegistrationRepository?: UserRegistrationRepository;
  verifyPasswordHash?: (input: VerifyPasswordHashInput) => Promise<boolean>;
};

const {
  admin,
  adminOrganization,
  adminRoleAssignment,
  authUpgrade,
  authAccount,
  authSession,
  authUser,
  employee,
  organization,
  orgAuth,
  student,
  user,
} = authSchema;

const SESSION_RUNTIME_UNAVAILABLE_CODE = 503001;
const CREDENTIAL_PROVIDER_ID = "credential";
const PASSWORD_FIELD = "password";
const SESSION_TOKEN_FIELD = "token";

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
  getNow: () => Date,
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

      return findActiveAdminAccountByAuthUserId(database, authUserId, getNow());
    },
  };
}

export function createPostgresSessionUserRepository(
  getDatabase: () => LocalSessionRuntimeDatabase,
  getNow: () => Date,
): SessionUserRepository {
  return {
    async findLoginUserByPhone(phone) {
      const database = getDatabase();
      const userRow = await findLoginUserAccountByPhone(database, phone);

      if (userRow !== null) {
        return userRow;
      }

      return findLoginAdminAccountByPhone(database, phone, getNow());
    },

    async recordLoginFailure(input: LoginFailureInput) {
      const database = getDatabase();

      if (input.userKind === "admin") {
        const [transition] = await database
          .update(admin)
          .set({
            locked_until_at: sql<Date | null>`case
              when ${admin.login_failed_count} + 1 >= ${input.lockThreshold}
              then ${input.lockUntilAt}
              else null
            end`,
            login_failed_count: sql<number>`${admin.login_failed_count} + 1`,
            updated_at: sql<Date>`clock_timestamp()`,
          })
          .where(eq(admin.id, input.userId))
          .returning({
            lockedUntilAt: admin.locked_until_at,
            loginFailedCount: admin.login_failed_count,
          });

        return transition ?? null;
      }

      const [transition] = await database
        .update(user)
        .set({
          locked_until_at: sql<Date | null>`case
            when ${user.login_failed_count} + 1 >= ${input.lockThreshold}
            then ${input.lockUntilAt}
            else null
          end`,
          login_failed_count: sql<number>`${user.login_failed_count} + 1`,
          updated_at: sql<Date>`clock_timestamp()`,
        })
        .where(eq(user.id, input.userId))
        .returning({
          lockedUntilAt: user.locked_until_at,
          loginFailedCount: user.login_failed_count,
        });

      return transition ?? null;
    },

    async resetLoginFailures(input) {
      const database = getDatabase();
      const accountTable = input.userKind === "admin" ? admin : user;

      const resetRows = await database
        .update(accountTable)
        .set({
          locked_until_at: null,
          login_failed_count: 0,
          updated_at: sql<Date>`clock_timestamp()`,
        })
        .where(
          and(
            eq(accountTable.id, input.userId),
            eq(accountTable.login_failed_count, input.expectedLoginFailedCount),
          ),
        )
        .returning({ id: accountTable.id });

      return resetRows.length > 0;
    },
  };
}

type LocalSessionRuntimeTransaction = Parameters<
  Parameters<LocalSessionRuntimeDatabase["transaction"]>[0]
>[0];

async function assertAccountCanCreateSession(
  transaction: LocalSessionRuntimeTransaction,
  authUserId: string,
  now: Date,
): Promise<void> {
  await transaction.execute(
    sql`select pg_advisory_xact_lock(hashtext(${authUserId}))`,
  );
  const [adminAccount] = await transaction
    .select({
      locked_until_at: admin.locked_until_at,
      status: admin.status,
    })
    .from(admin)
    .where(eq(admin.auth_user_id, authUserId))
    .limit(1);
  const account =
    adminAccount ??
    (
      await transaction
        .select({
          locked_until_at: user.locked_until_at,
          status: user.status,
        })
        .from(user)
        .where(eq(user.auth_user_id, authUserId))
        .limit(1)
    )[0];

  if (account === undefined || account.status !== "active") {
    throw new SessionAccountStateError("disabled");
  }

  if (account.locked_until_at !== null && account.locked_until_at > now) {
    throw new SessionAccountStateError("locked");
  }
}

async function assertPasswordCredentialStillValid(
  transaction: LocalSessionRuntimeTransaction,
  input: PasswordCredentialInput,
  verifyPasswordHash: (input: VerifyPasswordHashInput) => Promise<boolean>,
): Promise<void> {
  const [row] = await transaction
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

  if (
    typeof storedPasswordHash !== "string" ||
    !(await verifyPasswordHash({
      hash: storedPasswordHash,
      [PASSWORD_FIELD]: input.password,
    }))
  ) {
    throw new SessionAccountStateError("changed");
  }
}

function createPostgresSessionCredentialAdapter(
  getDatabase: () => LocalSessionRuntimeDatabase,
  getNow: () => Date,
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
        await assertAccountCanCreateSession(
          transaction,
          input.authUserId,
          getNow(),
        );
        if (input.passwordForReverification !== undefined) {
          await assertPasswordCredentialStillValid(
            transaction,
            {
              authUserId: input.authUserId,
              [PASSWORD_FIELD]: input.passwordForReverification,
            },
            options.verifyPasswordHash,
          );
        }
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

      return database.transaction(async (transaction) => {
        await assertAccountCanCreateSession(
          transaction,
          input.authUserId,
          getNow(),
        );
        if (input.passwordForReverification !== undefined) {
          await assertPasswordCredentialStillValid(
            transaction,
            {
              authUserId: input.authUserId,
              [PASSWORD_FIELD]: input.passwordForReverification,
            },
            options.verifyPasswordHash,
          );
        }
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

const REGISTRATION_IDEMPOTENCY_LOCK_NAMESPACE = 200129;

async function lockRegistrationAttempt(
  transaction: Pick<LocalSessionRuntimeTransaction, "execute">,
  registrationSessionId: string,
): Promise<void> {
  await transaction.execute(
    sql`select pg_advisory_xact_lock(${REGISTRATION_IDEMPOTENCY_LOCK_NAMESPACE}, hashtext(${registrationSessionId})) as registration_idempotency_lock`,
  );
}

function mapPersonalRegistrationUser(row: {
  auth_user_id: string;
  id: number;
  locked_until_at: Date | null;
  name: string;
  phone: string;
  public_id: string;
  status: UserStatus;
  user_type: UserType;
}): AuthUserAccessRow {
  return {
    admin_public_id: null,
    admin_roles: [],
    auth_user_id: row.auth_user_id,
    employee_public_id: null,
    id: row.id,
    locked_until_at: row.locked_until_at,
    name: row.name,
    organization_public_id: null,
    phone: row.phone,
    public_id: row.public_id,
    status: row.status,
    user_type: row.user_type,
  };
}

export function createPostgresUserRegistrationRepository(
  getDatabase: () => LocalSessionRuntimeDatabase,
  options: Required<
    Pick<
      LocalUserRegistrationRuntimeOptions,
      | "createAuthAccountId"
      | "createAuthUserId"
      | "createRegistrationSessionId"
      | "createToken"
      | "createUserPublicId"
      | "hashPasswordValue"
      | "verifyPasswordHash"
    >
  >,
): UserRegistrationRepository {
  return {
    async createPersonalRegistration(input) {
      const database = getDatabase();
      const registrationSessionId = options.createRegistrationSessionId(
        input.idempotencyKey,
      );

      return database.transaction(async (transaction) => {
        await lockRegistrationAttempt(transaction, registrationSessionId);

        const [existingSession] = await transaction
          .select({
            auth_user_id: authSession.user_id,
            created_at: authSession.created_at,
            expires_at: authSession.expires_at,
            [SESSION_TOKEN_FIELD]: authSession.token,
          })
          .from(authSession)
          .where(eq(authSession.id, registrationSessionId))
          .limit(1);
        const accountPhoneConflict =
          await findAccountPhoneIdentityConflictUnderLock(
            transaction,
            input.phone,
          );

        if (existingSession !== undefined) {
          if (
            accountPhoneConflict !== "user" ||
            existingSession.expires_at <= input.registeredAt
          ) {
            return {
              status: "conflict" as const,
              reason: accountPhoneConflict ?? "user",
            };
          }

          const [existingUser] = await transaction
            .select({
              auth_user_id: user.auth_user_id,
              created_at: user.created_at,
              disabled_at: user.disabled_at,
              id: user.id,
              locked_until_at: user.locked_until_at,
              login_failed_count: user.login_failed_count,
              name: user.name,
              phone: user.phone,
              public_id: user.public_id,
              status: user.status,
              user_type: user.user_type,
            })
            .from(user)
            .where(
              and(
                eq(user.auth_user_id, existingSession.auth_user_id),
                eq(user.phone, input.phone),
              ),
            )
            .limit(1);

          if (
            existingUser === undefined ||
            existingUser.auth_user_id === null ||
            existingUser.phone !== input.phone ||
            existingUser.name !== input.name ||
            existingUser.user_type !== "personal" ||
            existingUser.status !== "active" ||
            existingUser.disabled_at !== null ||
            existingUser.login_failed_count !== 0 ||
            (existingUser.locked_until_at !== null &&
              existingUser.locked_until_at > input.registeredAt) ||
            existingSession.created_at.getTime() !==
              existingUser.created_at.getTime()
          ) {
            return { status: "conflict" as const, reason: "user" as const };
          }

          const [studentRow] = await transaction
            .select({ id: student.id })
            .from(student)
            .where(eq(student.user_id, existingUser.id))
            .limit(1);
          const [credentialRow] = await transaction
            .select({
              [PASSWORD_FIELD]: authAccount.password,
            })
            .from(authAccount)
            .where(
              and(
                eq(authAccount.user_id, existingUser.auth_user_id),
                eq(authAccount.provider_id, CREDENTIAL_PROVIDER_ID),
              ),
            )
            .limit(1);

          if (
            studentRow === undefined ||
            credentialRow === undefined ||
            credentialRow.password === null ||
            !(await options.verifyPasswordHash({
              hash: credentialRow.password,
              [PASSWORD_FIELD]: input.password,
            }))
          ) {
            return { status: "conflict" as const, reason: "user" as const };
          }

          return {
            status: "recovered" as const,
            session: existingSession,
            user: mapPersonalRegistrationUser({
              ...existingUser,
              auth_user_id: existingUser.auth_user_id,
            }),
          };
        }

        if (accountPhoneConflict !== null) {
          return {
            status: "conflict" as const,
            reason: accountPhoneConflict,
          };
        }

        const authUserId = options.createAuthUserId();
        const passwordHash = await options.hashPasswordValue(input.password);
        const [authUserRow] = await transaction
          .insert(authUser)
          .values({
            created_at: input.registeredAt,
            email: `phone-${input.phone}@tiku.local`,
            email_verified: input.registeredAt,
            id: authUserId,
            image: null,
            name: input.phone,
            updated_at: input.registeredAt,
          })
          .returning({ id: authUser.id });

        if (authUserRow === undefined) {
          throw new Error("Authentication user insert did not return a row.");
        }

        const [authAccountRow] = await transaction
          .insert(authAccount)
          .values({
            access_token: null,
            access_token_expires_at: null,
            account_id: authUserId,
            created_at: input.registeredAt,
            id: options.createAuthAccountId(),
            id_token: null,
            [PASSWORD_FIELD]: passwordHash,
            provider_id: CREDENTIAL_PROVIDER_ID,
            refresh_token: null,
            refresh_token_expires_at: null,
            scope: null,
            updated_at: input.registeredAt,
            user_id: authUserId,
          })
          .returning({ id: authAccount.id });

        if (authAccountRow === undefined) {
          throw new Error(
            "Authentication account insert did not return a row.",
          );
        }

        const [userRow] = await transaction
          .insert(user)
          .values({
            auth_user_id: authUserId,
            created_at: input.registeredAt,
            disabled_at: null,
            locked_until_at: null,
            login_failed_count: 0,
            name: input.name,
            phone: input.phone,
            public_id: options.createUserPublicId(),
            status: "active",
            updated_at: input.registeredAt,
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

        if (userRow === undefined || userRow.auth_user_id === null) {
          throw new Error("Personal user insert did not return a valid row.");
        }

        const [studentRow] = await transaction
          .insert(student)
          .values({
            created_at: input.registeredAt,
            updated_at: input.registeredAt,
            user_id: userRow.id,
          })
          .returning({ id: student.id });

        if (studentRow === undefined) {
          throw new Error("Student insert did not return a row.");
        }

        const [sessionRow] = await transaction
          .insert(authSession)
          .values({
            created_at: input.registeredAt,
            expires_at: input.expiresAt,
            id: registrationSessionId,
            ip_address: null,
            [SESSION_TOKEN_FIELD]: options.createToken(),
            updated_at: input.registeredAt,
            user_agent: null,
            user_id: authUserId,
          })
          .returning({
            auth_user_id: authSession.user_id,
            created_at: authSession.created_at,
            expires_at: authSession.expires_at,
            [SESSION_TOKEN_FIELD]: authSession.token,
          });

        if (sessionRow === undefined) {
          throw new Error("Session insert did not return a row.");
        }

        return {
          status: "created" as const,
          session: sessionRow,
          user: mapPersonalRegistrationUser({
            ...userRow,
            auth_user_id: userRow.auth_user_id,
          }),
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
  const getNow = () => options.now?.() ?? new Date();
  const baseCredentialAdapter =
    options.credentialAdapter ??
    createPostgresSessionCredentialAdapter(getDatabase, getNow, {
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
    options.authUserRepository ??
    createPostgresAuthUserRepository(getDatabase, getNow);
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
    createPostgresSessionUserRepository(getDatabase, getNow);
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
  const userRegistrationRepository =
    options.userRegistrationRepository ??
    createPostgresUserRegistrationRepository(getDatabase, {
      createAuthAccountId:
        options.createAuthAccountId ?? createDefaultAuthAccountId,
      createAuthUserId: options.createAuthUserId ?? createDefaultAuthUserId,
      createRegistrationSessionId:
        options.createRegistrationSessionId ?? createRegistrationSessionId,
      createToken: options.createToken ?? createDefaultToken,
      createUserPublicId:
        options.createUserPublicId ?? createDefaultUserPublicId,
      hashPasswordValue: options.hashPasswordValue ?? hashPassword,
      verifyPasswordHash:
        options.verifyPasswordHash ??
        ((input) =>
          verifyPassword({
            hash: input.hash,
            [PASSWORD_FIELD]: input.password,
          })),
    });

  return createUserRegistrationService(userRegistrationRepository, {
    now: options.now,
  });
}

export function createLocalUserRegistrationRuntime(
  options: LocalUserRegistrationRuntimeOptions = {},
): UserRegistrationService {
  const userRegistrationService = createUserRegistrationRuntimeService(options);

  return {
    async registerPersonalUser(input, idempotencyKey) {
      try {
        return await userRegistrationService.registerPersonalUser(
          input,
          idempotencyKey,
        );
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
  now: Date,
): Promise<AuthUserAccessRow | null> {
  const [row] = await database
    .select({
      admin_roles: createAdminRolesSql(),
      auth_user_id: admin.auth_user_id,
      id: admin.id,
      locked_until_at: admin.locked_until_at,
      name: admin.name,
      organization_id: organization.id,
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

  if (row === undefined) {
    return null;
  }

  return hydrateOrganizationAdminWorkspaceCapability(
    database,
    mapAdminAccountRow(row),
    row.organization_id,
    now,
  );
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
  now: Date,
): Promise<SessionLoginUserRow | null> {
  const [row] = await database
    .select({
      admin_roles: createAdminRolesSql(),
      auth_user_id: admin.auth_user_id,
      id: admin.id,
      locked_until_at: admin.locked_until_at,
      login_failed_count: admin.login_failed_count,
      name: admin.name,
      organization_id: organization.id,
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
  const adminAccountRow = await hydrateOrganizationAdminWorkspaceCapability(
    database,
    mapAdminAccountRow(row),
    row.organization_id,
    now,
  );

  return {
    ...adminAccountRow,
    login_failed_count: row.login_failed_count,
    login_failure_user_id: row.id,
    login_failure_user_kind: "admin",
  };
}

function canComputeOrganizationAdminWorkspaceCapability(
  authUser: AuthUserAccessRow,
  organizationId: number | null,
): boolean {
  return (
    typeof organizationId === "number" &&
    authUser.organization_public_id !== null &&
    authUser.admin_roles !== undefined &&
    authUser.admin_roles.some(isOrganizationAdminRole)
  );
}

async function findOrganizationAdminWorkspaceCapability(input: {
  database: LocalSessionRuntimeDatabase;
  authUser: AuthUserAccessRow;
  organizationId: number;
  now: Date;
}): Promise<AdminWorkspaceCapabilitySummary | null> {
  const [row] = await input.database
    .select({
      authorization_public_id: orgAuth.public_id,
      effective_edition: sql<"standard" | "advanced">`
        case
          when ${orgAuth.edition} = 'advanced' or ${authUpgrade.id} is not null
          then 'advanced'
          else 'standard'
        end
      `,
    })
    .from(orgAuth)
    .leftJoin(
      authUpgrade,
      and(
        eq(authUpgrade.org_auth_id, orgAuth.id),
        eq(authUpgrade.status, "active"),
        eq(authUpgrade.target_edition, "advanced"),
        isNull(authUpgrade.revoked_at),
        lte(authUpgrade.starts_at, input.now),
        gt(authUpgrade.expires_at, input.now),
      ),
    )
    .innerJoin(organization, eq(organization.id, input.organizationId))
    .where(
      and(
        eq(organization.status, "active"),
        eq(orgAuth.status, "active"),
        lte(orgAuth.starts_at, input.now),
        gt(orgAuth.expires_at, input.now),
        createOrgAuthCoversOrganizationCondition({
          authScopeType: orgAuth.auth_scope_type,
          orgAuthId: orgAuth.id,
          organizationId: organization.id,
          purchaserOrganizationId: orgAuth.purchaser_organization_id,
        }),
      ),
    )
    .orderBy(
      sql`
        case
          when ${orgAuth.edition} = 'advanced' or ${authUpgrade.id} is not null
          then 0
          else 1
        end
      `,
      desc(orgAuth.expires_at),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  const adminRoles = input.authUser.admin_roles ?? [];

  return {
    adminRoles,
    organizationAuthorizationPublicId: row.authorization_public_id,
    organizationPublicId: input.authUser.organization_public_id,
    organizationEffectiveEdition: row.effective_edition,
    organizationAuthorizationSource: "org_auth",
    capabilitySource: "service_computed",
    canUseOrganizationAdvancedWorkspace:
      row.effective_edition === "advanced" &&
      adminRoles.includes("org_advanced_admin"),
  };
}

async function hydrateOrganizationAdminWorkspaceCapability(
  database: LocalSessionRuntimeDatabase,
  authUser: AuthUserAccessRow,
  organizationId: number | null,
  now: Date,
): Promise<AuthUserAccessRow> {
  if (
    typeof organizationId !== "number" ||
    !canComputeOrganizationAdminWorkspaceCapability(authUser, organizationId)
  ) {
    return authUser;
  }

  const adminWorkspaceCapability =
    await findOrganizationAdminWorkspaceCapability({
      database,
      authUser,
      organizationId,
      now,
    });

  if (adminWorkspaceCapability === null) {
    return authUser;
  }

  return {
    ...authUser,
    admin_workspace_capability: adminWorkspaceCapability,
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

function createAdminRolesSql() {
  return sql<AdminRole[]>`array(
    select ${adminRoleAssignment.admin_role}
    from ${adminRoleAssignment}
    where ${adminRoleAssignment.admin_id} = ${admin.id}
    order by ${adminRoleAssignment.admin_role}
  )`;
}

function mapAdminAccountRow(row: {
  admin_roles: AdminRole[];
  auth_user_id: string | null;
  id: number;
  locked_until_at: Date | null;
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
    admin_roles: normalizeAdminRoles(row.admin_roles),
    auth_user_id: row.auth_user_id,
    employee_public_id: null,
    id: row.id,
    locked_until_at: row.locked_until_at,
    name: row.name,
    organization_public_id: row.admin_roles.some(isOrganizationAdminRole)
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
