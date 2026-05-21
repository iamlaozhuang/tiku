import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { and, eq, isNotNull } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { verifyPassword } from "better-auth/crypto";
import postgres from "postgres";

import * as authSchema from "@/db/schema/auth";
import type { AuthSessionSnapshot } from "./auth-boundary";
import { createSessionRouteHandlers } from "./session-route";
import type {
  CreateSingleActiveSessionInput,
  PasswordCredentialInput,
  SessionCredentialAdapter,
} from "./session-boundary";
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
import { createAuthService } from "../services/auth-service";
import {
  createSessionService,
  type SessionService,
} from "../services/session-service";

type LocalSessionRuntimeDatabase = PostgresJsDatabase<typeof authSchema>;

type LocalSessionCredentialAdapter = SessionCredentialAdapter & {
  findSessionByToken(token: string): Promise<AuthSessionSnapshot | null>;
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

const { admin, authAccount, authSession, employee, organization, user } =
  authSchema;

const SESSION_RUNTIME_UNAVAILABLE_CODE = 503001;
const CREDENTIAL_PROVIDER_ID = "credential";

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

function normalizeAdminRoles(value: unknown): AdminRole[] {
  return Array.isArray(value) ? (value as AdminRole[]) : [];
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

    async resetLoginFailures(userId) {
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
          password: authAccount.password,
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
        password: input.password,
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
            token: options.createToken(),
            user_agent: null,
            user_id: input.authUserId,
          })
          .returning({
            auth_user_id: authSession.user_id,
            expires_at: authSession.expires_at,
            token: authSession.token,
          });

        if (row === undefined) {
          throw new Error("Session insert did not return a row.");
        }

        return row;
      });
    },

    async findSessionByToken(token) {
      const database = getDatabase();
      const [row] = await database
        .select({
          auth_user_id: authSession.user_id,
          expires_at: authSession.expires_at,
          token: authSession.token,
        })
        .from(authSession)
        .where(eq(authSession.token, token))
        .limit(1);

      return row ?? null;
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
  const credentialAdapter =
    options.credentialAdapter ??
    createPostgresSessionCredentialAdapter(getDatabase, {
      createSessionId: options.createSessionId ?? createDefaultSessionId,
      createToken: options.createToken ?? createDefaultToken,
      verifyPasswordHash:
        options.verifyPasswordHash ??
        ((input) =>
          verifyPassword({
            hash: input.hash,
            password: input.password,
          })),
    });
  const authUserRepository =
    options.authUserRepository ?? createPostgresAuthUserRepository(getDatabase);
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
      phone: admin.phone,
      public_id: admin.public_id,
      status: admin.status,
    })
    .from(admin)
    .where(
      and(
        eq(admin.auth_user_id, authUserId),
        eq(admin.status, "active"),
        isNotNull(admin.auth_user_id),
      ),
    )
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
      phone: admin.phone,
      public_id: admin.public_id,
      status: admin.status,
    })
    .from(admin)
    .where(and(eq(admin.phone, phone), isNotNull(admin.auth_user_id)))
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    ...mapAdminAccountRow(row),
    login_failed_count: 0,
    login_failure_user_id: null,
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
  name: string;
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
    locked_until_at: null,
    name: row.name,
    organization_public_id: null,
    phone: row.phone,
    public_id: row.public_id,
    status: row.status,
    user_type: null,
  };
}

function createLocalRuntimeDatabase(): LocalSessionRuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for session runtime.");
  }

  const client = postgres(databaseUrl, { max: 5 });

  return drizzle(client, {
    schema: authSchema,
  });
}

function isRuntimeConfigurationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === "DATABASE_URL is required for session runtime."
  );
}

function loadLocalEnv(): void {
  const localEnvPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(localEnvPath)) {
    return;
  }

  const localEnvContent = readFileSync(localEnvPath, "utf8");

  for (const line of localEnvContent.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/gu, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
