import { describe, expect, it } from "vitest";

import {
  createLocalSessionRuntime,
  createLocalUserRegistrationRuntime,
} from "./local-session-runtime";
import type { AdminRole } from "../models/auth";
import type { AuthUserRepository } from "../repositories/auth-repository";
import type { SessionUserRepository } from "../repositories/session-repository";

const TEST_PASSWORD_FIELD = "password";
const TEST_TOKEN_FIELD = "token";

type SelectBuilder = {
  from(table?: unknown): SelectBuilder;
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
};

type SequentialRuntimeDatabase = {
  insert(table?: unknown): ReturnType<TransactionDatabase["insert"]>;
  select(selection?: unknown): SelectBuilder;
  transaction<T>(
    callback: (transaction: TransactionDatabase) => Promise<T> | T,
  ): Promise<T>;
};

function createSelectBuilder(rows: unknown[]): SelectBuilder {
  const builder: SelectBuilder = {
    from() {
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

function createSequentialRuntimeDatabase(rowsBySelectCall: unknown[][]): {
  database: SequentialRuntimeDatabase;
  getSelectCallCount(): number;
} {
  let selectCallCount = 0;
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
    async transaction(callback) {
      return callback(transactionDatabase);
    },
  };

  return {
    database,
    getSelectCallCount() {
      return selectCallCount;
    },
  };
}

function createAdminAccountRow(input: {
  adminRole: AdminRole;
  authUserId: string;
  id: number;
  organizationPublicId: string | null;
  phone: string;
  publicId: string;
}): Record<string, unknown> {
  return {
    admin_role: input.adminRole,
    auth_user_id: input.authUserId,
    id: input.id,
    name: "Organization Admin",
    organization_public_id: input.organizationPublicId,
    phone: input.phone,
    public_id: input.publicId,
    status: "active",
  };
}

describe("local session runtime", () => {
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
        async resetLoginFailures(userId) {
          resetUserIds.push(userId);
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
          phone: "13900000002",
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
    const createdUsers: unknown[] = [];
    const runtime = createLocalUserRegistrationRuntime({
      credentialAdapter: {
        async createPasswordCredential(input) {
          createdCredentials.push(input);

          return {
            authUserId: "auth-user-registered-student",
          };
        },
      },
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
          phone: "13900000003",
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
          phone: "13900000001",
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
          organizationPublicId: "organization-standard-public-001",
          phone: "13900000004",
          publicId: "admin-org-standard-public-001",
        }),
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
          phone: "13900000004",
          userType: null,
          organizationPublicId: "organization-standard-public-001",
          adminPublicId: "admin-org-standard-public-001",
          adminRoles: ["org_standard_admin"],
        },
      },
    });
    expect(getSelectCallCount()).toBe(3);
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
          organizationPublicId: "organization-advanced-public-001",
          phone: "13900000005",
          publicId: "admin-org-advanced-public-001",
        }),
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
          phone: "13900000005",
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
    expect(getSelectCallCount()).toBe(3);
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
