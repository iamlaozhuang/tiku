import { describe, expect, it } from "vitest";

import {
  createLocalSessionRuntime,
  createLocalUserRegistrationRuntime,
  createPostgresSessionUserRepository,
} from "./local-session-runtime";
import { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { admin as adminTable } from "@/db/schema/auth";
import type { AdminRole } from "../models/auth";
import type { AuthUserRepository } from "../repositories/auth-repository";
import type { SessionUserRepository } from "../repositories/session-repository";

const TEST_PASSWORD_FIELD = "password";
const TEST_TOKEN_FIELD = "token";

type SelectBuilder = {
  from(table?: unknown): SelectBuilder;
  innerJoin(table?: unknown, condition?: unknown): SelectBuilder;
  leftJoin(table?: unknown, condition?: unknown): SelectBuilder;
  orderBy(...conditions: unknown[]): SelectBuilder;
  where(condition?: unknown): SelectBuilder;
  limit(count: number): Promise<unknown[]>;
};

type TransactionDatabase = {
  delete(table?: unknown): {
    where(condition?: unknown): Promise<void>;
  };
  insert(table?: unknown): {
    values(row: Record<string, unknown>): {
      returning(selection?: unknown): Promise<unknown[]>;
    };
  };
  execute(query?: unknown): Promise<unknown>;
  select(selection?: unknown): SelectBuilder;
};

type SequentialRuntimeDatabase = {
  insert(table?: unknown): ReturnType<TransactionDatabase["insert"]>;
  select(selection?: unknown): SelectBuilder;
  update(table?: unknown): {
    set(values: Record<string, unknown>): {
      where(condition?: unknown): {
        returning(selection?: unknown): Promise<unknown[]>;
      };
    };
  };
  transaction<T>(
    callback: (transaction: TransactionDatabase) => Promise<T> | T,
  ): Promise<T>;
};

function createSelectBuilder(rows: unknown[]): SelectBuilder {
  const builder: SelectBuilder = {
    from() {
      return builder;
    },
    innerJoin() {
      return builder;
    },
    leftJoin() {
      return builder;
    },
    orderBy() {
      return builder;
    },
    where() {
      return builder;
    },
    async limit() {
      return rows;
    },
  };

  return builder;
}

function createSequentialRuntimeDatabase(
  rowsBySelectCall: unknown[][],
  transactionAccountRow: Record<string, unknown> = {
    locked_until_at: null,
    status: "active",
  },
  transactionCredentialRow: Record<string, unknown> = {
    [TEST_PASSWORD_FIELD]: "stored-admin-password-hash",
  },
): {
  database: SequentialRuntimeDatabase;
  getSelectCallCount(): number;
  getTransactionInsertCount(): number;
} {
  let selectCallCount = 0;
  let transactionInsertCount = 0;
  let transactionSelectCallCount = 0;
  const transactionDatabase: TransactionDatabase = {
    delete() {
      return {
        async where() {
          return undefined;
        },
      };
    },
    insert() {
      return {
        values(row) {
          return {
            async returning() {
              transactionInsertCount += 1;
              return [
                {
                  auth_user_id: row.user_id,
                  expires_at: row.expires_at,
                  [TEST_TOKEN_FIELD]: row.token,
                },
              ];
            },
          };
        },
      };
    },
    async execute() {
      return [];
    },
    select() {
      const row =
        transactionSelectCallCount % 2 === 0
          ? transactionAccountRow
          : transactionCredentialRow;
      transactionSelectCallCount += 1;

      return createSelectBuilder([row]);
    },
  };
  const database: SequentialRuntimeDatabase = {
    insert(table) {
      return transactionDatabase.insert(table);
    },
    select() {
      const rows = rowsBySelectCall[selectCallCount];

      if (rows === undefined) {
        throw new Error(`Unexpected select call ${selectCallCount + 1}.`);
      }

      selectCallCount += 1;

      return createSelectBuilder(rows);
    },
    update() {
      return {
        set() {
          return {
            where() {
              return {
                async returning() {
                  return [];
                },
              };
            },
          };
        },
      };
    },
    async transaction(callback) {
      return callback(transactionDatabase);
    },
  };

  return {
    database,
    getSelectCallCount() {
      return selectCallCount;
    },
    getTransactionInsertCount() {
      return transactionInsertCount;
    },
  };
}

function createAdminAccountRow(input: {
  adminRole?: AdminRole;
  adminRoles?: AdminRole[];
  authUserId: string;
  id: number;
  lockedUntilAt?: Date | null;
  loginFailedCount?: number;
  organizationId?: number | null;
  organizationPublicId: string | null;
  phone: string;
  publicId: string;
}): Record<string, unknown> {
  return {
    admin_roles: input.adminRoles ?? [input.adminRole],
    auth_user_id: input.authUserId,
    id: input.id,
    locked_until_at: input.lockedUntilAt ?? null,
    login_failed_count: input.loginFailedCount ?? 0,
    name: "Organization Admin",
    organization_id:
      input.organizationPublicId === null
        ? null
        : (input.organizationId ?? 201),
    organization_public_id: input.organizationPublicId,
    phone: input.phone,
    public_id: input.publicId,
    status: "active",
  };
}

describe("local session runtime", () => {
  it("persists admin failure transitions through one atomic database update", async () => {
    const updatedTables: unknown[] = [];
    const updatedValues: Record<string, unknown>[] = [];
    const database = {
      update(table: unknown) {
        updatedTables.push(table);

        return {
          set(values: Record<string, unknown>) {
            updatedValues.push(values);

            return {
              where() {
                return {
                  async returning() {
                    return [
                      {
                        loginFailedCount: 5,
                        lockedUntilAt: new Date("2026-07-14T20:15:00.000Z"),
                      },
                    ];
                  },
                };
              },
            };
          },
        };
      },
    };
    const repository = createPostgresSessionUserRepository(
      () => database as never,
      () => new Date("2026-07-14T20:00:00.000Z"),
    );

    await expect(
      repository.recordLoginFailure({
        userId: 7,
        userKind: "admin",
        lockThreshold: 5,
        lockUntilAt: new Date("2026-07-14T20:15:00.000Z"),
      }),
    ).resolves.toEqual({
      loginFailedCount: 5,
      lockedUntilAt: new Date("2026-07-14T20:15:00.000Z"),
    });
    expect(updatedTables).toEqual([adminTable]);
    expect(updatedValues).toHaveLength(1);
    expect(updatedValues[0]?.updated_at).toBeInstanceOf(SQL);
  });

  it("uses the observed failure count as a compare-and-set guard before a successful reset", async () => {
    let resetCondition: SQL | undefined;
    const database = {
      update() {
        return {
          set() {
            return {
              where(condition: SQL) {
                resetCondition = condition;

                return {
                  async returning() {
                    return [{ id: 7 }];
                  },
                };
              },
            };
          },
        };
      },
    };
    const repository = createPostgresSessionUserRepository(
      () => database as never,
      () => new Date("2026-07-14T20:00:00.000Z"),
    );

    await expect(
      repository.resetLoginFailures({
        expectedLoginFailedCount: 2,
        userId: 7,
        userKind: "admin",
      }),
    ).resolves.toBe(true);

    expect(resetCondition).toBeDefined();
    const query = new PgDialect().sqlToQuery(resetCondition as SQL);
    expect(query.sql.replace(/\s+/g, " ")).toContain(
      '"admin"."id" = $1 and "admin"."login_failed_count" = $2',
    );
    expect(query.params).toEqual([7, 2]);
  });

  it("reads a persisted admin lock after the runtime is reconstructed", async () => {
    const { database, getSelectCallCount } = createSequentialRuntimeDatabase([
      [],
      [
        createAdminAccountRow({
          adminRole: "super_admin",
          authUserId: "auth-user-locked-admin",
          id: 109,
          lockedUntilAt: new Date("2026-07-14T20:15:00.000Z"),
          loginFailedCount: 5,
          organizationPublicId: null,
          phone: "13900000009",
          publicId: "admin-locked-public-009",
        }),
      ],
    ]);
    const runtimeAfterRestart = createLocalSessionRuntime({
      createDatabase: () => database as never,
      now: () => new Date("2026-07-14T20:05:00.000Z"),
      verifyPasswordHash: async () => {
        throw new Error("locked account must not verify credentials");
      },
    });

    await expect(
      runtimeAfterRestart.login({
        phone: "13900000009",
        [TEST_PASSWORD_FIELD]: "WrongPassword1",
      }),
    ).resolves.toEqual({
      code: 423001,
      data: null,
      message: "Account locked.",
    });
    expect(getSelectCallCount()).toBe(2);
  });

  it("rejects an old verified password when the admin account state changed before session creation", async () => {
    const { database, getSelectCallCount, getTransactionInsertCount } =
      createSequentialRuntimeDatabase(
        [
          [],
          [
            createAdminAccountRow({
              adminRole: "super_admin",
              authUserId: "auth-user-password-reset-admin",
              id: 110,
              organizationPublicId: null,
              phone: "13900000010",
              publicId: "admin-password-reset-public-010",
            }),
          ],
          [
            {
              [TEST_PASSWORD_FIELD]: "stored-pre-reset-password-hash",
            },
          ],
        ],
        {
          locked_until_at: null,
          status: "active",
        },
        {
          [TEST_PASSWORD_FIELD]: "stored-post-reset-password-hash",
        },
      );
    const runtime = createLocalSessionRuntime({
      createDatabase: () => database as never,
      now: () => new Date("2026-07-14T20:02:00.000Z"),
      verifyPasswordHash: async ({ hash }) =>
        hash === "stored-pre-reset-password-hash",
    });

    await expect(
      runtime.login({
        phone: "13900000010",
        [TEST_PASSWORD_FIELD]: "PasswordBeforeReset1",
      }),
    ).resolves.toEqual({
      code: 401002,
      data: null,
      message: "Invalid phone or password.",
    });
    expect(getSelectCallCount()).toBe(3);
    expect(getTransactionInsertCount()).toBe(0);
  });

  it("creates an opaque single active session for a seeded student credential login", async () => {
    const verifiedCredentials: unknown[] = [];
    const resetUserIds: number[] = [];
    const runtime = createLocalSessionRuntime({
      authUserRepository: {
        async findActiveUserByAuthUserId() {
          throw new Error("current session repository should not be called");
        },
      },
      credentialAdapter: {
        async findSessionByToken() {
          throw new Error("current session adapter should not be called");
        },
        async verifyPasswordCredential(input) {
          verifiedCredentials.push({
            hash: "stored-student-password-hash",
            [TEST_PASSWORD_FIELD]: input.password,
          });

          return true;
        },
        async createSingleActiveSession(input) {
          return {
            [TEST_TOKEN_FIELD]: "opaque-student-session-token",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      },
      now: () => new Date("2026-05-21T12:00:00.000Z"),
      sessionUserRepository: {
        async findLoginUserByPhone() {
          return {
            id: 42,
            auth_user_id: "auth-user-dev-student",
            public_id: "user-dev-student",
            phone: "13900000002",
            name: "本地学员",
            user_type: "personal",
            status: "active",
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
            login_failed_count: 0,
            login_failure_user_id: 42,
          };
        },
        async recordLoginFailure() {
          throw new Error("login failure should not be recorded");
        },
        async resetLoginFailures(input) {
          resetUserIds.push(input.userId);
          return true;
        },
      },
    });

    await expect(
      runtime.login({
        phone: "13900000002",
        [TEST_PASSWORD_FIELD]: "TikuDevStudent#2026",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        [TEST_TOKEN_FIELD]: "opaque-student-session-token",
        user: {
          publicId: "user-dev-student",
          phone: "139****0002",
          name: "本地学员",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: null,
          adminRoles: [],
        },
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });
    expect(verifiedCredentials).toEqual([
      {
        hash: "stored-student-password-hash",
        [TEST_PASSWORD_FIELD]: "TikuDevStudent#2026",
      },
    ]);
    expect(resetUserIds).toEqual([42]);
  });

  it("creates a personal user registration without exposing credential internals", async () => {
    const createdCredentials: unknown[] = [];
    const createdSessions: unknown[] = [];
    const createdUsers: unknown[] = [];
    const runtime = createLocalUserRegistrationRuntime({
      credentialAdapter: {
        async createPasswordCredential(input) {
          createdCredentials.push(input);

          return {
            authUserId: "auth-user-registered-student",
          };
        },
        async createSingleActiveSession(input) {
          createdSessions.push(input);

          return {
            [TEST_TOKEN_FIELD]: "opaque-registration-session-token",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      },
      now: () => new Date("2026-05-21T12:00:00.000Z"),
      userRegistrationRepository: {
        async findRegisteredUserByPhone() {
          return null;
        },
        async createPersonalUser(input) {
          createdUsers.push(input);

          return {
            id: 99,
            auth_user_id: input.authUserId,
            public_id: "user-registered-student",
            phone: input.phone,
            name: input.name,
            user_type: "personal",
            status: "active",
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: null,
            admin_roles: [],
          };
        },
      },
    });

    const response = await runtime.registerPersonalUser({
      phone: "13900000003",
      [TEST_PASSWORD_FIELD]: "abc12345",
      name: "新学员",
    });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "user-registered-student",
          phone: "139****0003",
          name: "新学员",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: null,
          adminRoles: [],
        },
        nextAction: "redeem_code",
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
        [TEST_TOKEN_FIELD]: "opaque-registration-session-token",
      },
    });
    expect(createdCredentials).toEqual([
      {
        phone: "13900000003",
        [TEST_PASSWORD_FIELD]: "abc12345",
      },
    ]);
    expect(createdUsers).toEqual([
      {
        authUserId: "auth-user-registered-student",
        phone: "13900000003",
        name: "新学员",
      },
    ]);
    expect(createdSessions).toEqual([
      {
        authUserId: "auth-user-registered-student",
        expiresAt: new Date("2026-05-28T12:00:00.000Z"),
      },
    ]);
    expect(JSON.stringify(response)).not.toContain("abc12345");
    expect(JSON.stringify(response)).not.toContain("auth-user-registered");
  });

  it("resolves a seeded admin session without returning the session token", async () => {
    const runtime = createLocalSessionRuntime({
      authUserRepository: {
        async findActiveUserByAuthUserId(authUserId) {
          return {
            id: 7,
            auth_user_id: authUserId,
            public_id: "admin-dev-super-admin",
            phone: "13900000001",
            name: "本地超级管理员",
            user_type: null,
            status: "active",
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
            admin_public_id: "admin-dev-super-admin",
            admin_roles: ["super_admin"],
          };
        },
      } satisfies AuthUserRepository,
      credentialAdapter: {
        async findSessionByToken() {
          return {
            [TEST_TOKEN_FIELD]: "opaque-admin-session-token",
            auth_user_id: "auth-user-dev-super-admin",
            expires_at: new Date("2026-05-28T12:00:00.000Z"),
          };
        },
        async verifyPasswordCredential() {
          throw new Error("login adapter should not be called");
        },
        async createSingleActiveSession() {
          throw new Error("login adapter should not create session");
        },
      },
      now: () => new Date("2026-05-21T12:00:00.000Z"),
      sessionUserRepository: {
        async findLoginUserByPhone() {
          throw new Error("login repository should not be called");
        },
        async recordLoginFailure() {
          throw new Error("login repository should not record failure");
        },
        async resetLoginFailures() {
          throw new Error("login repository should not reset failure");
        },
      } satisfies SessionUserRepository,
    });

    const response = await runtime.getCurrentSession({
      authorization: "Bearer opaque-admin-session-token",
    });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "admin-dev-super-admin",
          phone: "139****0001",
          name: "本地超级管理员",
          userType: null,
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: "admin-dev-super-admin",
          adminRoles: ["super_admin"],
        },
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });
    expect(response.data?.session).not.toHaveProperty("token");
  });

  it("hydrates organization admin login role and organization binding from the default local runtime source", async () => {
    const { database, getSelectCallCount } = createSequentialRuntimeDatabase([
      [],
      [
        createAdminAccountRow({
          adminRole: "org_standard_admin",
          authUserId: "auth-user-org-standard-admin",
          id: 101,
          organizationId: 301,
          organizationPublicId: "organization-standard-public-001",
          phone: "13900000004",
          publicId: "admin-org-standard-public-001",
        }),
      ],
      [
        {
          effective_edition: "standard",
        },
      ],
      [
        {
          [TEST_PASSWORD_FIELD]: "stored-admin-password-hash",
        },
      ],
    ]);
    const runtime = createLocalSessionRuntime({
      createDatabase: () => database as never,
      createSessionId: () => "session-org-standard-admin",
      createToken: () => "opaque-org-standard-admin-token",
      now: () => new Date("2026-05-21T12:00:00.000Z"),
      verifyPasswordHash: async () => true,
    });

    const response = await runtime.login({
      phone: "13900000004",
      [TEST_PASSWORD_FIELD]: "TikuDevOrgStandardAdmin#2026",
    });

    expect(response).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        [TEST_TOKEN_FIELD]: "opaque-org-standard-admin-token",
        user: {
          publicId: "admin-org-standard-public-001",
          phone: "139****0004",
          userType: null,
          organizationPublicId: "organization-standard-public-001",
          adminPublicId: "admin-org-standard-public-001",
          adminRoles: ["org_standard_admin"],
          adminWorkspaceCapability: {
            adminRoles: ["org_standard_admin"],
            organizationPublicId: "organization-standard-public-001",
            organizationEffectiveEdition: "standard",
            organizationAuthorizationSource: "org_auth",
            capabilitySource: "service_computed",
            canUseOrganizationAdvancedWorkspace: false,
          },
        },
      },
    });
    expect(getSelectCallCount()).toBe(4);
  });

  it("hydrates organization admin current session role and organization binding from the default local runtime source", async () => {
    const { database, getSelectCallCount } = createSequentialRuntimeDatabase([
      [
        {
          [TEST_TOKEN_FIELD]: "opaque-org-advanced-admin-token",
          auth_user_id: "auth-user-org-advanced-admin",
          expires_at: new Date("2026-05-28T12:00:00.000Z"),
        },
      ],
      [],
      [
        createAdminAccountRow({
          adminRole: "org_advanced_admin",
          authUserId: "auth-user-org-advanced-admin",
          id: 102,
          organizationId: 302,
          organizationPublicId: "organization-advanced-public-001",
          phone: "13900000005",
          publicId: "admin-org-advanced-public-001",
        }),
      ],
      [],
    ]);
    const runtime = createLocalSessionRuntime({
      createDatabase: () => database as never,
      now: () => new Date("2026-05-21T12:00:00.000Z"),
    });

    const response = await runtime.getCurrentSession({
      authorization: "Bearer opaque-org-advanced-admin-token",
    });

    expect(response).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "admin-org-advanced-public-001",
          phone: "139****0005",
          userType: null,
          organizationPublicId: "organization-advanced-public-001",
          adminPublicId: "admin-org-advanced-public-001",
          adminRoles: ["org_advanced_admin"],
        },
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });
    expect(response.data?.session).not.toHaveProperty("token");
    expect(getSelectCallCount()).toBe(4);
  });

  it("hydrates advanced organization admin workspace capability from active org_auth", async () => {
    const { database, getSelectCallCount } = createSequentialRuntimeDatabase([
      [
        {
          [TEST_TOKEN_FIELD]: "opaque-org-advanced-admin-token",
          auth_user_id: "auth-user-org-advanced-admin",
          expires_at: new Date("2026-05-28T12:00:00.000Z"),
        },
      ],
      [],
      [
        createAdminAccountRow({
          adminRoles: ["content_admin", "org_advanced_admin"],
          authUserId: "auth-user-org-advanced-admin",
          id: 102,
          organizationId: 302,
          organizationPublicId: "organization-advanced-public-001",
          phone: "13900000005",
          publicId: "admin-org-advanced-public-001",
        }),
      ],
      [
        {
          authorization_public_id: "org-auth-advanced-public-001",
          effective_edition: "advanced",
        },
      ],
    ]);
    const runtime = createLocalSessionRuntime({
      createDatabase: () => database as never,
      now: () => new Date("2026-05-21T12:00:00.000Z"),
    });

    const response = await runtime.getCurrentSession({
      authorization: "Bearer opaque-org-advanced-admin-token",
    });

    expect(response).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "admin-org-advanced-public-001",
          userType: null,
          organizationPublicId: "organization-advanced-public-001",
          adminPublicId: "admin-org-advanced-public-001",
          adminRoles: ["content_admin", "org_advanced_admin"],
          adminWorkspaceCapability: {
            adminRoles: ["content_admin", "org_advanced_admin"],
            organizationAuthorizationPublicId: "org-auth-advanced-public-001",
            organizationPublicId: "organization-advanced-public-001",
            organizationEffectiveEdition: "advanced",
            organizationAuthorizationSource: "org_auth",
            capabilitySource: "service_computed",
            canUseOrganizationAdvancedWorkspace: true,
          },
        },
      },
    });
    expect(getSelectCallCount()).toBe(4);
  });

  it("does not expose organization binding for global admin roles from the default local runtime source", async () => {
    const { database } = createSequentialRuntimeDatabase([
      [
        {
          [TEST_TOKEN_FIELD]: "opaque-super-admin-token",
          auth_user_id: "auth-user-super-admin",
          expires_at: new Date("2026-05-28T12:00:00.000Z"),
        },
      ],
      [],
      [
        createAdminAccountRow({
          adminRole: "super_admin",
          authUserId: "auth-user-super-admin",
          id: 103,
          organizationPublicId: "organization-admin-binding-ignored-001",
          phone: "13900000001",
          publicId: "admin-super-public-001",
        }),
      ],
    ]);
    const runtime = createLocalSessionRuntime({
      createDatabase: () => database as never,
      now: () => new Date("2026-05-21T12:00:00.000Z"),
    });

    const response = await runtime.getCurrentSession({
      authorization: "Bearer opaque-super-admin-token",
    });

    expect(response).toMatchObject({
      code: 0,
      data: {
        user: {
          organizationPublicId: null,
          adminPublicId: "admin-super-public-001",
          adminRoles: ["super_admin"],
        },
      },
    });
  });
});
