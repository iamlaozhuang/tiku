import { describe, expect, it, vi } from "vitest";

import {
  canManageAdminAccountRoles,
  createPostgresAdminFlowRuntimeRepositories,
  isAdminAccountOrganizationBindingValid,
} from "./admin-flow-runtime-repository";
import { sql } from "drizzle-orm";
import {
  admin as adminTable,
  auditLog as auditLogTable,
  authSession as authSessionTable,
} from "@/db/schema";

const TEST_CREDENTIAL_FIELD_NAME = ["pass", "word"].join("") as "password";

function createAwaitableSelectBuilder(rows: unknown[]) {
  const builder = {
    auth_status: undefined,
    user_id: undefined,
    as() {
      return builder;
    },
    from(...tables: unknown[]) {
      void tables;
      return builder;
    },
    getSQL() {
      return sql`select 1`;
    },
    innerJoin() {
      return builder;
    },
    leftJoin() {
      return builder;
    },
    limit() {
      return builder;
    },
    groupBy() {
      return builder;
    },
    offset() {
      return builder;
    },
    orderBy() {
      return builder;
    },
    then<TResult1 = unknown[], TResult2 = never>(
      onFulfilled?:
        | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
        | null,
      onRejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ) {
      return Promise.resolve(rows).then(onFulfilled, onRejected);
    },
    where() {
      return builder;
    },
  };

  return builder;
}

function createSequentialReadDatabase(selectRows: unknown[][]) {
  let selectIndex = 0;

  return {
    database: {
      select() {
        const rows = selectRows[selectIndex];

        if (rows === undefined) {
          throw new Error(`Unexpected read select ${selectIndex + 1}.`);
        }

        selectIndex += 1;
        return createAwaitableSelectBuilder(rows);
      },
    },
    getSelectCount: () => selectIndex,
  };
}

function createAdminLifecycleDatabase(input: {
  activeSuperAdminCount?: number;
  auditFailure?: boolean;
  roles: Array<
    | "super_admin"
    | "ops_admin"
    | "content_admin"
    | "org_standard_admin"
    | "org_advanced_admin"
  >;
  status?: "active" | "disabled";
}) {
  const executedQueries: unknown[] = [];
  const insertedTables: unknown[] = [];
  const deletedTables: unknown[] = [];
  const updatedTables: unknown[] = [];
  const transactionSelectRows: unknown[][] = [
    [
      {
        auth_user_id: "auth-user-target-001",
        id: 101,
        public_id: "admin-public-target-001",
        status: input.status ?? "active",
        updated_at: new Date("2026-07-14T20:00:00.000Z"),
      },
    ],
    input.roles.map((adminRole) => ({ admin_role: adminRole })),
    [],
  ];

  if (input.roles.includes("super_admin")) {
    transactionSelectRows.push([{ value: input.activeSuperAdminCount ?? 2 }]);
  }

  let transactionSelectIndex = 0;
  const transaction = {
    delete(table: unknown) {
      deletedTables.push(table);

      return {
        async where() {
          return undefined;
        },
      };
    },
    async execute(query: unknown) {
      executedQueries.push(query);
      return [];
    },
    insert(table: unknown) {
      insertedTables.push(table);

      return {
        async values() {
          if (input.auditFailure === true && table === auditLogTable) {
            throw new Error("simulated audit insert failure");
          }

          return undefined;
        },
      };
    },
    select() {
      const rows = transactionSelectRows[transactionSelectIndex];

      if (rows === undefined) {
        throw new Error(
          `Unexpected lifecycle transaction select ${transactionSelectIndex + 1}.`,
        );
      }

      transactionSelectIndex += 1;
      return createAwaitableSelectBuilder(rows);
    },
    update(table: unknown) {
      updatedTables.push(table);

      return {
        set() {
          return {
            async where() {
              return undefined;
            },
          };
        },
      };
    },
  };
  const database = {
    query: {
      admin: {
        async findFirst() {
          const now = new Date("2026-07-14T20:00:00.000Z");

          return {
            created_at: now,
            name: "Target Admin",
            phone: "13900000008",
            public_id: "admin-public-target-001",
            status: "disabled",
            updated_at: now,
            adminRoleAssignments: input.roles.map((adminRole) => ({
              admin_role: adminRole,
            })),
            adminOrganizations: [],
          };
        },
      },
    },
    select() {
      return createAwaitableSelectBuilder([]);
    },
    async transaction<T>(
      callback: (transactionValue: typeof transaction) => Promise<T>,
    ) {
      return callback(transaction);
    },
  };

  return {
    database,
    deletedTables,
    executedQueries,
    insertedTables,
    updatedTables,
  };
}

function createAdminCreationConflictDatabase() {
  const events: string[] = [];
  const transaction = {
    async execute() {
      events.push("lock");
      return [];
    },
    select() {
      const builder = createAwaitableSelectBuilder([{ id: 101 }]);
      const originalFrom = builder.from;

      builder.from = function from(table?: unknown) {
        events.push(table === adminTable ? "admin" : "user");
        return originalFrom.call(builder);
      };

      return builder;
    },
    insert() {
      throw new Error("conflicting account must not be inserted");
    },
  };
  const database = {
    async transaction<T>(
      callback: (transactionValue: typeof transaction) => Promise<T>,
    ) {
      return callback(transaction);
    },
  };

  return { database, events };
}

describe("admin flow runtime repository backend accounts", () => {
  it("checks the administrator phone conflict under the shared transaction lock", async () => {
    const fixture = createAdminCreationConflictDatabase();
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });

    await expect(
      repositories.userOrgAuthRepository.createAdminAccount?.({
        phone: "13900000008",
        name: "Existing Admin",
        [TEST_CREDENTIAL_FIELD_NAME]: "abc12345",
        adminRole: "content_admin",
        organizationPublicId: null,
      }),
    ).resolves.toEqual({
      reason: "admin_phone_exists",
      status: "conflict",
    });
    expect(fixture.events).toEqual(["lock", "admin"]);
  });

  it("fails closed when an operations admin targets a platform or mixed-role account", () => {
    expect(
      canManageAdminAccountRoles({
        actorRoles: ["ops_admin"],
        currentRoles: ["content_admin"],
      }),
    ).toBe(false);
    expect(
      canManageAdminAccountRoles({
        actorRoles: ["ops_admin"],
        currentRoles: ["org_standard_admin", "content_admin"],
        desiredRoles: ["org_advanced_admin"],
      }),
    ).toBe(false);
    expect(
      canManageAdminAccountRoles({
        actorRoles: ["ops_admin"],
        currentRoles: ["org_standard_admin"],
        desiredRoles: ["org_advanced_admin"],
      }),
    ).toBe(true);
    expect(
      canManageAdminAccountRoles({
        actorRoles: ["super_admin"],
        currentRoles: ["content_admin"],
        desiredRoles: ["ops_admin", "content_admin"],
      }),
    ).toBe(true);
  });

  it("fails closed when role and organization binding invariants diverge", () => {
    expect(
      isAdminAccountOrganizationBindingValid({
        adminRoles: ["org_standard_admin"],
        organizationPublicId: null,
      }),
    ).toBe(false);
    expect(
      isAdminAccountOrganizationBindingValid({
        adminRoles: ["content_admin"],
        organizationPublicId: "organization-public-001",
      }),
    ).toBe(false);
    expect(
      isAdminAccountOrganizationBindingValid({
        adminRoles: ["org_advanced_admin"],
        organizationPublicId: "organization-public-001",
      }),
    ).toBe(true);
    expect(
      isAdminAccountOrganizationBindingValid({
        adminRoles: ["ops_admin", "content_admin"],
        organizationPublicId: null,
      }),
    ).toBe(true);
  });

  it("maps relation-loaded organizations without credential or numeric id fields", async () => {
    const now = new Date("2026-07-11T00:00:00.000Z");
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 101,
        public_id: "admin-public-read-model",
        auth_user_id: "auth-user-internal",
        phone: "redacted-account",
        name: "组织管理员",
        adminRoleAssignments: [
          { admin_role: "org_standard_admin" },
          { admin_role: "content_admin" },
        ],
        status: "active",
        created_at: now,
        updated_at: now,
        adminOrganizations: [
          {
            id: 202,
            organization: {
              id: 303,
              public_id: "organization-public-read-model",
              name: "测试组织",
            },
          },
        ],
      },
    ]);
    const countBuilder = {
      from() {
        return countBuilder;
      },
      async where() {
        return [{ value: 1 }];
      },
    };
    const database = {
      query: {
        admin: { findMany },
      },
      select() {
        return countBuilder;
      },
    };
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => database as never,
    });

    const result = await repositories.userOrgAuthRepository.listAdminAccounts?.(
      {
        page: 1,
        pageSize: 20,
        sortBy: "registeredAt",
        sortOrder: "desc",
        keyword: null,
        adminRole: "all",
        status: "all",
        organizationPublicId: null,
      },
      ["org_standard_admin"],
    );

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      adminAccounts: [
        {
          publicId: "admin-public-read-model",
          phone: "已绑定手机号",
          name: "组织管理员",
          adminRoles: ["content_admin", "org_standard_admin"],
          status: "active",
          registeredAt: now.toISOString(),
          updatedAt: now.toISOString(),
          accountDomain: "admin",
          organizations: [
            {
              publicId: "organization-public-read-model",
              name: "测试组织",
            },
          ],
        },
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        sortBy: "registeredAt",
        sortOrder: "desc",
        total: 1,
      },
    });
    expect(JSON.stringify(result)).not.toContain("auth-user-internal");
    expect(JSON.stringify(result)).not.toContain('"id"');
    expect(JSON.stringify(result)).not.toContain("password");
    expect(JSON.stringify(result)).not.toContain("session");
  });

  it("does not expose a retained employee row as a current organization in the user list", async () => {
    const registeredAt = new Date("2026-07-16T20:00:00.000Z");
    const fixture = createSequentialReadDatabase([
      [],
      [
        {
          auth_status: "active",
          created_at: registeredAt,
          name: "Retained Personal User",
          organization_name: "Historical Organization",
          organization_public_id: "organization-historical-public-001",
          phone: "13900000008",
          public_id: "user-retained-public-001",
          status: "active",
          user_type: "personal",
        },
      ],
      [{ value: 1 }],
    ]);
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });

    const result = await repositories.userOrgAuthRepository.listUsers({
      page: 1,
      pageSize: 20,
      sortBy: "registeredAt",
      sortOrder: "desc",
      keyword: null,
      status: "all",
      userType: "all",
    });

    expect(result.users).toEqual([
      expect.objectContaining({
        organizationName: null,
        organizationPublicId: null,
        publicId: "user-retained-public-001",
        userType: "personal",
      }),
    ]);
    expect(fixture.getSelectCount()).toBe(3);
  });

  it("keeps personal authorization but omits retained enterprise binding from user detail", async () => {
    const fixture = createSequentialReadDatabase([
      [
        {
          created_at: new Date("2026-07-16T20:00:00.000Z"),
          employee_public_id: "employee-historical-public-001",
          internal_employee_id: 701,
          internal_organization_id: 501,
          internal_user_id: 101,
          name: "Retained Personal User",
          organization_name: "Historical Organization",
          organization_public_id: "organization-historical-public-001",
          organization_tier: "province",
          phone: "13900000008",
          public_id: "user-retained-public-001",
          status: "active",
          user_type: "personal",
        },
      ],
      [
        {
          expires_at: new Date("2027-07-16T20:00:00.000Z"),
          level: 3,
          profession: "monopoly",
          public_id: "personal-auth-public-001",
          starts_at: new Date("2026-07-16T20:00:00.000Z"),
          status: "active",
        },
      ],
    ]);
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });

    const result = await repositories.userOrgAuthRepository.getUserDetail?.(
      "user-retained-public-001",
    );

    expect(result).toMatchObject({
      enterpriseBinding: null,
      user: {
        organizationName: null,
        organizationPublicId: null,
        publicId: "user-retained-public-001",
        userType: "personal",
      },
      authorizations: [
        {
          authorizationType: "personal_auth",
          publicId: "personal-auth-public-001",
        },
      ],
    });
    expect(fixture.getSelectCount()).toBe(2);
  });

  it("revokes sessions and appends the success audit inside the admin disable transaction", async () => {
    const fixture = createAdminLifecycleDatabase({
      roles: ["content_admin"],
    });
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });

    const result =
      await repositories.userOrgAuthRepository.setAdminAccountStatus?.({
        actor: {
          publicId: "admin-actor-super-001",
          requestIp: "127.0.0.1",
          roles: ["super_admin"],
        },
        publicId: "admin-public-target-001",
        status: "disabled",
      });

    expect(result).toEqual(
      expect.objectContaining({
        status: "updated",
        adminAccount: expect.objectContaining({
          publicId: "admin-public-target-001",
          status: "disabled",
        }),
      }),
    );
    expect(fixture.executedQueries).toHaveLength(2);
    expect(fixture.updatedTables).toEqual([adminTable]);
    expect(fixture.deletedTables).toEqual([authSessionTable]);
    expect(fixture.insertedTables).toEqual([auditLogTable]);
  });

  it("keeps the last active super administrator unchanged in the production repository path", async () => {
    const fixture = createAdminLifecycleDatabase({
      activeSuperAdminCount: 1,
      roles: ["super_admin"],
    });
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });

    const result =
      await repositories.userOrgAuthRepository.setAdminAccountStatus?.({
        actor: {
          publicId: "admin-actor-super-001",
          requestIp: null,
          roles: ["super_admin"],
        },
        publicId: "admin-public-target-001",
        status: "disabled",
      });

    expect(result).toEqual({
      reason: "last_active_super_admin",
      status: "conflict",
    });
    expect(fixture.executedQueries).toHaveLength(3);
    expect(fixture.updatedTables).toEqual([]);
    expect(fixture.deletedTables).toEqual([]);
    expect(fixture.insertedTables).toEqual([]);
  });

  it("aborts the lifecycle transaction when its atomic audit write fails", async () => {
    const fixture = createAdminLifecycleDatabase({
      auditFailure: true,
      roles: ["content_admin"],
    });
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });

    await expect(
      repositories.userOrgAuthRepository.setAdminAccountStatus?.({
        actor: {
          publicId: "admin-actor-super-001",
          requestIp: null,
          roles: ["super_admin"],
        },
        publicId: "admin-public-target-001",
        status: "disabled",
      }),
    ).rejects.toThrow("simulated audit insert failure");
    expect(fixture.updatedTables).toEqual([adminTable]);
    expect(fixture.deletedTables).toEqual([authSessionTable]);
    expect(fixture.insertedTables).toEqual([auditLogTable]);
  });
});
