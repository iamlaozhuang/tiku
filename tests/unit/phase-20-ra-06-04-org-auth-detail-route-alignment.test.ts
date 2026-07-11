import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminOrgAuthPage } from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";
import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { OrgAuthDetailDto } from "@/server/contracts/organization-auth-contract";
import type { SessionService } from "@/server/services/session-service";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-dev-admin",
      phone: "13900000001",
      name: "Dev Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-dev-super-admin",
      adminRoles: ["super_admin"],
    },
    session: {
      expiresAt: "2026-05-31T04:00:00.000Z",
    },
  },
};

const orgAuthDetail = {
  publicId: "org-auth-public-001",
  name: "杭州烟草企业授权详情",
  purchaserOrganizationPublicId: "organization-public-001",
  authScopeType: "specified_nodes",
  profession: "monopoly",
  level: 3,
  accountQuota: 100,
  usedQuota: 42,
  startsAt: "2026-05-22T00:00:00.000Z",
  expiresAt: "2026-08-22T00:00:00.000Z",
  status: "active",
  cancelledAt: null,
  organizationPublicIds: ["organization-public-001"],
  createdAt: "2026-05-22T00:00:00.000Z",
  updatedAt: "2026-05-22T00:00:00.000Z",
  purchaserOrganization: {
    publicId: "organization-public-001",
    name: "杭州烟草",
    orgTier: "city",
    status: "active",
  },
  coveredOrganizations: [
    {
      publicId: "organization-public-001",
      name: "杭州烟草",
      orgTier: "city",
      parentOrganizationPublicId: "organization-public-000",
      employeeCount: 42,
    },
  ],
  occupancy: {
    accountQuota: 100,
    usedQuota: 42,
    availableQuota: 58,
  },
} satisfies OrgAuthDetailDto;

function createJsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

function createAdminSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): Pick<SessionService, "getCurrentSession"> {
  return {
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
          session: { expiresAt: "2026-05-31T15:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
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
  };
}

function createRepositories(input: {
  detailCalls: string[];
}): AdminOrganizationOrgAuthRuntimeRepositories {
  return {
    async listOrganizations(query) {
      return {
        organizations: [],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 0,
        },
      };
    },
    async listOrgAuths(query) {
      return {
        orgAuths: [],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 0,
        },
      };
    },
    async listEmployees(query) {
      return {
        employees: [],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 0,
        },
      };
    },
    async getOrgAuthDetail(publicId) {
      input.detailCalls.push(publicId);

      return orgAuthDetail;
    },
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("phase 20 RA-06-04 org_auth detail route alignment", () => {
  it("serves org_auth detail through a standard envelope with public identifiers only", async () => {
    const detailCalls: string[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ detailCalls }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.orgAuths.item.GET(
      new Request("http://localhost/api/v1/org-auths/org-auth-public-001", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
      { params: Promise.resolve({ publicId: "org-auth-public-001" }) },
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        orgAuth: orgAuthDetail,
      },
    });
    expect(detailCalls).toEqual(["org-auth-public-001"]);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
  });

  it("denies content admins from reading org_auth detail without touching the repository", async () => {
    const detailCalls: string[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ detailCalls }),
      sessionService: createAdminSessionService("content_admin"),
    });

    const response = await handlers.orgAuths.item.GET(
      new Request("http://localhost/api/v1/org-auths/org-auth-public-001", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
      { params: Promise.resolve({ publicId: "org-auth-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(detailCalls).toEqual([]);
  });

  it("loads org_auth detail from the detail API when the admin opens the detail panel", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organizations: [
              {
                publicId: "organization-public-001",
                name: "杭州烟草",
                orgTier: "city",
                parentOrganizationPublicId: "organization-public-000",
                status: "active",
                employeeCount: 42,
                authSummary: "专卖 3级 / 42 / 100",
                id: 101,
              },
            ],
          },
          pagination: null,
        });
      }

      if (path.startsWith("/api/v1/org-auths?")) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuths: [
              {
                publicId: "org-auth-public-001",
                name: "杭州烟草企业授权",
                purchaserOrganizationPublicId: "organization-public-001",
                purchaserOrganizationName: "杭州烟草",
                coveredOrganizationCount: 1,
                coveredOrganizationNames: ["杭州烟草"],
                authScopeType: "specified_nodes",
                profession: "monopoly",
                level: 3,
                edition: "advanced",
                effectiveEdition: "advanced",
                upgradeStatus: "none",
                accountQuota: 100,
                usedQuota: 42,
                startsAt: "2026-05-22T00:00:00.000Z",
                expiresAt: "2026-08-22T00:00:00.000Z",
                status: "active",
                cancelledAt: null,
                organizationPublicIds: ["organization-public-001"],
                createdAt: "2026-05-22T00:00:00.000Z",
                updatedAt: "2026-05-22T00:00:00.000Z",
                id: 201,
              },
            ],
          },
          pagination: null,
        });
      }

      if (path === "/api/v1/employees?page=1&pageSize=20") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { employees: [] },
          pagination: null,
        });
      }

      if (path === "/api/v1/org-auths/org-auth-public-001") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { orgAuth: orgAuthDetail },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrgAuthPage));

    fireEvent.click(
      await screen.findByTestId("ops-organization-view-org-auth"),
    );
    const orgAuthRow = await screen.findByTestId(
      "admin-org-auth-org-auth-public-001",
    );
    fireEvent.click(
      within(orgAuthRow).getByRole("button", { name: "查看详情" }),
    );

    const detailPanel = await screen.findByTestId(
      "admin-org-auth-detail-org-auth-public-001",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/org-auths/org-auth-public-001",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
    expect(
      within(detailPanel).getByText("杭州烟草企业授权详情"),
    ).toBeInTheDocument();
    expect(within(detailPanel).getByText("可用额度 58")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("201");
  });
});
