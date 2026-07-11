import { describe, expect, it, vi } from "vitest";

import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = new Date("2026-05-22T10:00:00.000Z");
const testAdminSessionCredential = "admin-session-token";
const expectedAdminAuthorization = `Bearer ${testAdminSessionCredential}`;

function createSessionService(role: "super_admin" | "content_admin") {
  return {
    async login() {
      throw new Error("login should not be called by admin org auth runtime");
    },
    async getCurrentSession(input) {
      if (input.authorization !== expectedAdminAuthorization) {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: {
            expiresAt: "2027-05-22T10:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Admin User",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: [role],
          },
        },
      };
    },
  } satisfies SessionService;
}

function createRepositories(): AdminOrganizationOrgAuthRuntimeRepositories {
  return {
    async listOrganizationTreeNodes(query) {
      return {
        nodes: [
          {
            publicId: "organization-public-station",
            name: "测试站点",
            orgTier: "station",
            parentOrganizationPublicId: "organization-public-district",
            status: "active",
            employeeCount: 2,
            childCount: 0,
            authSummary: "monopoly / level 3",
            ancestorPath: [
              {
                publicId: "organization-public-province",
                name: "测试省",
                orgTier: "province",
              },
              {
                publicId: "organization-public-city",
                name: "测试地市",
                orgTier: "city",
              },
              {
                publicId: "organization-public-district",
                name: "测试县区",
                orgTier: "district",
              },
            ],
          },
        ],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: "name",
          sortOrder: query.sortOrder,
          total: 1,
        },
      };
    },
    async listOrganizations(query) {
      return {
        organizations: [
          {
            publicId: "organization-public-001",
            name: "杭州烟草",
            orgTier: "city",
            parentOrganizationPublicId: "organization-public-000",
            status: "active",
            employeeCount: 2,
            authSummary: "monopoly / level 3",
          },
        ],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 1,
        },
      };
    },
    async listOrgAuths(query) {
      return {
        orgAuths: [
          {
            publicId: "org-auth-public-001",
            name: "杭州企业授权",
            purchaserOrganizationPublicId: "organization-public-001",
            authScopeType: "current_and_descendants",
            profession: "monopoly",
            level: 3,
            edition: "advanced",
            effectiveEdition: "advanced",
            upgradeStatus: "none",
            accountQuota: 100,
            usedQuota: 2,
            startsAt: now.toISOString(),
            expiresAt: "2027-05-22T10:00:00.000Z",
            status: "active",
            cancelledAt: null,
            organizationPublicIds: ["organization-public-001"],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        ],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 1,
        },
      };
    },
    async listEmployees(query) {
      return {
        employees: [
          {
            publicId: "employee-public-001",
            userPublicId: "user-public-001",
            phone: "13900000001",
            name: "员工甲",
            organizationPublicId: "organization-public-001",
            status: "active",
          },
        ],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 1,
        },
      };
    },
  };
}

function createCookieBackedAdminRequest(url: string) {
  return new Request(url, {
    headers: {
      authorization: "Bearer __cookie_backed_session__",
      cookie: `tiku_session=${encodeURIComponent(testAdminSessionCredential)}`,
    },
  });
}

describe("phase 8 admin organization org auth runtime", () => {
  it("requires an authenticated admin session before returning enterprise data", async () => {
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const response = await handlers.organizations.collection.GET(
      new Request("http://localhost/api/v1/organizations"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
  });

  it("rejects admin roles that cannot read enterprise authorization data", async () => {
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("content_admin"),
    });

    const response = await handlers.orgAuths.collection.GET(
      new Request("http://localhost/api/v1/org-auths", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("returns organization, org_auth, and employee lists with public identifiers only", async () => {
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const organizationsResponse = await handlers.organizations.collection.GET(
      new Request("http://localhost/api/v1/organizations?page=2&pageSize=50", {
        headers,
      }),
    );
    const orgAuthsResponse = await handlers.orgAuths.collection.GET(
      new Request("http://localhost/api/v1/org-auths?page=1&pageSize=20", {
        headers,
      }),
    );
    const employeesResponse = await handlers.employees.collection.GET(
      new Request("http://localhost/api/v1/employees?page=1&pageSize=20", {
        headers,
      }),
    );

    const organizationsPayload = await organizationsResponse.json();
    const orgAuthsPayload = await orgAuthsResponse.json();
    const employeesPayload = await employeesResponse.json();

    expect(organizationsPayload).toMatchObject({
      code: 0,
      data: {
        organizations: [
          {
            publicId: "organization-public-001",
            employeeCount: 2,
          },
        ],
      },
      pagination: {
        page: 2,
        pageSize: 50,
        total: 1,
      },
    });
    expect(orgAuthsPayload).toMatchObject({
      code: 0,
      data: {
        orgAuths: [
          {
            publicId: "org-auth-public-001",
            edition: "advanced",
            effectiveEdition: "advanced",
            upgradeStatus: "none",
            organizationPublicIds: ["organization-public-001"],
          },
        ],
      },
    });
    expect(employeesPayload).toMatchObject({
      code: 0,
      data: {
        employees: [
          {
            publicId: "employee-public-001",
            userPublicId: "user-public-001",
          },
        ],
      },
    });

    const combinedPayload = JSON.stringify({
      organizationsPayload,
      orgAuthsPayload,
      employeesPayload,
    });
    expect(combinedPayload).not.toContain('"id"');
    expect(combinedPayload).not.toContain("authUserId");
    expect(combinedPayload).not.toContain("password");
    expect(combinedPayload).not.toContain("admin-session-token");
  });

  it("returns a server-scoped tree query with branch and ancestor-path filters", async () => {
    const repositories = createRepositories();
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService("super_admin"),
    });
    const listOrganizationTreeNodes = vi.spyOn(
      repositories,
      "listOrganizationTreeNodes",
    );

    const response = await handlers.organizationTreeNodes.collection.GET(
      new Request(
        "http://localhost/api/v1/organization-tree-nodes?page=2&pageSize=50&parentOrganizationPublicId=organization-public-district&keyword=%E7%AB%99%E7%82%B9&status=active&orgTier=station&sortOrder=asc",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );

    expect(listOrganizationTreeNodes).toHaveBeenCalledWith({
      page: 2,
      pageSize: 50,
      parentOrganizationPublicId: "organization-public-district",
      keyword: "站点",
      status: "active",
      orgTier: "station",
      sortOrder: "asc",
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        nodes: [
          {
            name: "测试站点",
            orgTier: "station",
            childCount: 0,
            ancestorPath: [
              { name: "测试省", orgTier: "province" },
              { name: "测试地市", orgTier: "city" },
              { name: "测试县区", orgTier: "district" },
            ],
          },
        ],
      },
      pagination: { page: 2, pageSize: 50, total: 1 },
    });
    expect(JSON.stringify(payload)).not.toContain('"id"');
  });

  it("resolves organization, org_auth, and employee lists from cookie-backed admin sessions", async () => {
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const organizationsResponse = await handlers.organizations.collection.GET(
      createCookieBackedAdminRequest(
        "http://localhost/api/v1/organizations?page=1&pageSize=20",
      ),
    );
    const orgAuthsResponse = await handlers.orgAuths.collection.GET(
      createCookieBackedAdminRequest(
        "http://localhost/api/v1/org-auths?page=1&pageSize=20",
      ),
    );
    const employeesResponse = await handlers.employees.collection.GET(
      createCookieBackedAdminRequest(
        "http://localhost/api/v1/employees?page=1&pageSize=20",
      ),
    );

    await expect(organizationsResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        organizations: [
          expect.objectContaining({ publicId: "organization-public-001" }),
        ],
      },
      message: "ok",
    });
    await expect(orgAuthsResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuths: [
          expect.objectContaining({ publicId: "org-auth-public-001" }),
        ],
      },
      message: "ok",
    });
    await expect(employeesResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        employees: [
          expect.objectContaining({ publicId: "employee-public-001" }),
        ],
      },
      message: "ok",
    });
  });

  it("keeps mutation routes authenticated but safely unavailable in this slice", async () => {
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const createOrganizationResponse =
      await handlers.organizations.collection.POST(
        new Request("http://localhost/api/v1/organizations", {
          method: "POST",
          headers,
        }),
      );
    const createOrgAuthResponse = await handlers.orgAuths.collection.POST(
      new Request("http://localhost/api/v1/org-auths", {
        method: "POST",
        headers,
      }),
    );
    const createEmployeeResponse = await handlers.employees.collection.POST(
      new Request("http://localhost/api/v1/employees", {
        method: "POST",
        headers,
      }),
    );

    await expect(createOrganizationResponse.json()).resolves.toEqual({
      code: 503005,
      message: "Organization mutation runtime is not configured.",
      data: null,
    });
    await expect(createOrgAuthResponse.json()).resolves.toEqual({
      code: 503006,
      message: "Org auth mutation runtime is not configured.",
      data: null,
    });
    await expect(createEmployeeResponse.json()).resolves.toEqual({
      code: 503007,
      message: "Employee account mutation runtime is not configured.",
      data: null,
    });
  });
});
