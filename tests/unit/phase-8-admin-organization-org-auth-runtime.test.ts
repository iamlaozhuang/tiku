import { describe, expect, it } from "vitest";

import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = new Date("2026-05-22T10:00:00.000Z");

function createSessionService(role: "super_admin" | "content_admin") {
  return {
    async login() {
      throw new Error("login should not be called by admin org auth runtime");
    },
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
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
