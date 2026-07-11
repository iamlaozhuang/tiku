import { describe, expect, it, vi } from "vitest";

import { createPostgresAdminFlowRuntimeRepositories } from "./admin-flow-runtime-repository";

describe("admin flow runtime repository backend accounts", () => {
  it("maps relation-loaded organizations without credential or numeric id fields", async () => {
    const now = new Date("2026-07-11T00:00:00.000Z");
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 101,
        public_id: "admin-public-read-model",
        auth_user_id: "auth-user-internal",
        phone: "redacted-account",
        name: "组织管理员",
        admin_role: "org_standard_admin",
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
          phone: "redacted-account",
          name: "组织管理员",
          adminRole: "org_standard_admin",
          status: "active",
          registeredAt: now.toISOString(),
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
});
