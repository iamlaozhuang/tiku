import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminUserOrgAuthOpsBaseline } from "@/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline";
import {
  AdminOrgAuthPage,
  AdminRedeemCodePage,
} from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";
import {
  ADMIN_AUTH_OPERATION_ERROR_CODES,
  ADMIN_AUTH_OPERATION_PAGE_SIZE_OPTIONS,
  ADMIN_AUTH_OPERATION_SORT_FIELDS,
  createAdminAuthOperationListQuery,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import {
  createAdminUserOrgAuthOpsService,
  createUnavailableAdminUserOrgAuthOpsService,
} from "@/server/services/admin-user-org-auth-ops-service";
import { createAdminUserOrgAuthOpsRouteHandlers } from "@/server/services/admin-user-org-auth-ops-route";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function openOpsOrganizationManagementView(testId: string) {
  await screen.findByRole("heading", { name: "企业管理" });
  fireEvent.click(screen.getByTestId(testId));
}

async function openEmployeeImportDrawer() {
  await openOpsOrganizationManagementView("ops-organization-view-employees");
  fireEvent.click(screen.getByRole("button", { name: "批量导入员工" }));
  await screen.findByTestId("employee-import-textarea");
}

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-ops",
      phone: "13900000001",
      name: "System Ops",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-ops-public-001",
      adminRoles: ["ops_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const organizationPayload = {
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
      },
      {
        publicId: "organization-public-002",
        name: "宁波烟草",
        orgTier: "city",
        parentOrganizationPublicId: "organization-public-000",
        status: "active",
        employeeCount: 100,
        authSummary: "专卖 3级 / 100 / 100",
      },
    ],
  },
};

const organizationTreePayload = {
  code: 0,
  message: "ok",
  data: {
    organizations: [
      {
        publicId: "org-province-001",
        name: "浙江省烟草公司",
        orgTier: "province",
        parentOrganizationPublicId: null,
        status: "active",
        employeeCount: 0,
        authSummary: null,
      },
      {
        publicId: "org-city-001",
        name: "杭州市烟草公司",
        orgTier: "city",
        parentOrganizationPublicId: "org-province-001",
        status: "active",
        employeeCount: 3,
        authSummary: null,
      },
      {
        publicId: "org-district-001",
        name: "西湖区烟草公司",
        orgTier: "district",
        parentOrganizationPublicId: "org-city-001",
        status: "active",
        employeeCount: 2,
        authSummary: null,
      },
    ],
  },
};

const orgAuthPayload = {
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
        authScopeType: "current_and_descendants",
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
      },
      {
        publicId: "org-auth-public-002",
        name: "宁波烟草企业授权",
        purchaserOrganizationPublicId: "organization-public-002",
        purchaserOrganizationName: "宁波烟草",
        coveredOrganizationCount: 1,
        coveredOrganizationNames: ["宁波烟草"],
        authScopeType: "current_and_descendants",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        usedQuota: 100,
        startsAt: "2026-05-22T00:00:00.000Z",
        expiresAt: "2026-08-22T00:00:00.000Z",
        status: "active",
        cancelledAt: null,
        organizationPublicIds: ["organization-public-002"],
        createdAt: "2026-05-22T00:00:00.000Z",
        updatedAt: "2026-05-22T00:00:00.000Z",
      },
    ],
  },
};

const employeePayload = {
  code: 0,
  message: "ok",
  data: {
    employees: [
      {
        publicId: "employee-public-001",
        userPublicId: "user-employee-public-001",
        phone: "13800000000",
        name: "张三",
        organizationPublicId: "organization-public-001",
        organizationName: "杭州烟草",
        activeOrgAuthCount: 1,
        registeredAt: "2026-05-22T00:00:00.000Z",
        status: "active",
      },
    ],
  },
};

const redeemCodePayload = {
  code: 0,
  message: "ok",
  data: {
    redeemCodes: [
      {
        publicId: "redeem-code-public-001",
        codeDisplay: "RC-2026-****",
        codePlainText: "RC-2026-LIST-PLAIN",
        redeemCodeType: "personal_standard_activation",
        canViewPlainText: true,
        profession: "monopoly",
        level: 3,
        status: "unused",
        redeemedUserPublicId: null,
        redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
        createdAt: "2026-05-22T00:00:00.000Z",
      },
    ],
  },
};

function createRedeemCodeListPayload(path: string) {
  const searchParams = new URLSearchParams(path.split("?")[1] ?? "");
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const sortOrder = searchParams.get("sortOrder");

  return {
    ...redeemCodePayload,
    pagination: {
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize: Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 20,
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      total: 4,
    },
  };
}

const redeemCodeDetailPayload = {
  code: 0,
  message: "ok",
  data: {
    redeemCode: {
      publicId: "redeem-code-public-001",
      codeDisplay: "RC-2026-****",
      codePlainText: "RC-2026-DETAIL-PLAIN",
      redeemCodeType: "personal_standard_activation",
      canViewPlainText: true,
      profession: "monopoly",
      level: 3,
      status: "unused",
      redeemedUserPublicId: null,
      redeemedAt: null,
      durationDay: 365,
      redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
      generationGroupId: "redeem-code-batch-public-001",
      createdAt: "2026-05-22T00:00:00.000Z",
      updatedAt: "2026-05-23T09:00:00.000Z",
      redactionStatus: "redacted",
      redactionReason: "code_hash_hidden_plaintext_role_allowed",
      id: 402,
      code_hash: "detail-do-not-render",
    },
  },
};

const generatedRedeemCodePayload = {
  code: 0,
  message: "ok",
  data: {
    generation: {
      generationGroupId: "redeem-code-batch-public-001",
      count: 2,
      redeemCodeType: "edition_upgrade",
      profession: "logistics",
      level: 4,
      durationDay: 180,
      redeemDeadlineAt: "2026-07-01T15:59:59.999Z",
    },
    redeemCodes: [
      {
        publicId: "redeem-code-public-generated-001",
        codePlainText: "LOCALTST",
        codeDisplay: "LOCALTST",
        redeemCodeType: "edition_upgrade",
        profession: "logistics",
        level: 4,
        status: "unused",
        redeemDeadlineAt: "2026-07-01T15:59:59.999Z",
        createdAt: "2026-05-25T00:00:00.000Z",
      },
    ],
  },
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

type OrganizationTreeFixture = {
  authSummary: string | null;
  employeeCount: number;
  name: string;
  orgTier: string;
  parentOrganizationPublicId: string | null;
  publicId: string;
  status: string;
};

function createOrganizationTreeNodesPayload(
  path: string,
  organizations: OrganizationTreeFixture[],
) {
  const requestUrl = new URL(path, "http://localhost");
  const parentOrganizationPublicId = requestUrl.searchParams.get(
    "parentOrganizationPublicId",
  );
  const keyword = requestUrl.searchParams.get("keyword")?.toLowerCase() ?? "";
  const orgTier = requestUrl.searchParams.get("orgTier");
  const status = requestUrl.searchParams.get("status");
  const page = Number(requestUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(requestUrl.searchParams.get("pageSize") ?? "50");
  const organizationByPublicId = new Map(
    organizations.map((organization) => [organization.publicId, organization]),
  );
  const hasFilters = keyword.length > 0 || orgTier !== null || status !== null;
  const candidates = organizations.filter((organization) => {
    if (hasFilters) {
      return (
        (keyword.length === 0 ||
          organization.name.toLowerCase().includes(keyword)) &&
        (orgTier === null || organization.orgTier === orgTier) &&
        (status === null || organization.status === status)
      );
    }

    if (parentOrganizationPublicId !== null) {
      return (
        organization.parentOrganizationPublicId === parentOrganizationPublicId
      );
    }

    return (
      organization.parentOrganizationPublicId === null ||
      !organizationByPublicId.has(organization.parentOrganizationPublicId)
    );
  });
  const start = (page - 1) * pageSize;
  const nodes = candidates
    .slice(start, start + pageSize)
    .map((organization) => {
      const ancestorPath: Array<{
        name: string;
        orgTier: OrganizationTreeFixture["orgTier"];
        publicId: string;
      }> = [];
      const visitedPublicIds = new Set<string>();
      let parentPublicId = organization.parentOrganizationPublicId;

      while (parentPublicId !== null && !visitedPublicIds.has(parentPublicId)) {
        visitedPublicIds.add(parentPublicId);
        const parent = organizationByPublicId.get(parentPublicId);

        if (parent === undefined) {
          break;
        }

        ancestorPath.unshift({
          name: parent.name,
          orgTier: parent.orgTier,
          publicId: parent.publicId,
        });
        parentPublicId = parent.parentOrganizationPublicId;
      }

      return {
        ...organization,
        ancestorPath,
        childCount: organizations.filter(
          (candidate) =>
            candidate.parentOrganizationPublicId === organization.publicId,
        ).length,
      };
    });

  return {
    code: 0,
    message: "ok",
    data: { nodes },
    pagination: {
      page,
      pageSize,
      sortBy: "name",
      sortOrder: "asc",
      total: candidates.length,
    },
  };
}

function mockSystemOpsFetch() {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      void init;
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/organization-tree-nodes?")) {
        return createJsonResponse(
          createOrganizationTreeNodesPayload(
            path,
            organizationPayload.data.organizations,
          ),
        );
      }

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse(organizationPayload);
      }

      if (path.startsWith("/api/v1/org-auths?")) {
        return createJsonResponse(orgAuthPayload);
      }

      if (path.startsWith("/api/v1/employees?")) {
        return createJsonResponse(employeePayload);
      }

      if (path === "/api/v1/employees/employee-public-001/unbind") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            employeePublicId: "employee-public-001",
            userPublicId: "user-employee-public-001",
            previousOrganizationPublicId: "organization-public-001",
            status: "unbound",
          },
        });
      }

      if (path.startsWith("/api/v1/redeem-codes?")) {
        return createJsonResponse(createRedeemCodeListPayload(path));
      }

      if (path === "/api/v1/redeem-codes/redeem-code-public-001") {
        return createJsonResponse(redeemCodeDetailPayload);
      }

      if (path === "/api/v1/org-auths") {
        const createdOrgAuth = {
          ...orgAuthPayload.data.orgAuths[0],
          publicId: "org-auth-public-created-001",
          name: "本地验证企业授权",
          usedQuota: 0,
        };

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuth: createdOrgAuth,
            orgAuths: [createdOrgAuth],
          },
        });
      }

      if (path === "/api/v1/org-auths/org-auth-public-001/cancel") {
        const cancelledOrgAuth = {
          ...orgAuthPayload.data.orgAuths[0],
          status: "cancelled",
          cancelledAt: "2026-05-25T00:00:00.000Z",
        };

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuth: cancelledOrgAuth,
            orgAuths: [cancelledOrgAuth],
          },
        });
      }

      if (path === "/api/v1/redeem-codes") {
        return createJsonResponse(generatedRedeemCodePayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockSystemOpsFetchWithOrganizationTree() {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/organization-tree-nodes?")) {
        return createJsonResponse(
          createOrganizationTreeNodesPayload(
            path,
            organizationTreePayload.data.organizations,
          ),
        );
      }

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse(organizationTreePayload);
      }

      if (path.startsWith("/api/v1/org-auths?")) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuths: [
              {
                publicId: "org-auth-import-public-001",
                name: "西湖区员工导入授权",
                purchaserOrganizationPublicId: "org-city-001",
                purchaserOrganizationName: "杭州市烟草公司",
                coveredOrganizationCount: 1,
                coveredOrganizationNames: ["西湖区烟草公司"],
                authScopeType: "current_and_descendants",
                profession: "monopoly",
                level: 3,
                edition: "advanced",
                effectiveEdition: "advanced",
                upgradeStatus: "none",
                accountQuota: 10,
                usedQuota: 3,
                startsAt: "2026-05-22T00:00:00.000Z",
                expiresAt: "2026-08-22T00:00:00.000Z",
                status: "active",
                cancelledAt: null,
                organizationPublicIds: ["org-district-001"],
                createdAt: "2026-05-22T00:00:00.000Z",
                updatedAt: "2026-05-22T00:00:00.000Z",
              },
            ],
          },
        });
      }

      if (path.startsWith("/api/v1/employees?")) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { employees: [] },
        });
      }

      if (path === "/api/v1/employees/import") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            generatedInitialPasswords: [
              {
                rowNumber: 2,
                phone: "13900001111",
                name: "Import One",
                organizationPublicId: "org-district-001",
                initialPassword: "Generated123",
              },
            ],
            importedEmployees: [
              {
                publicId: "employee-imported-public-001",
                userPublicId: "user-imported-public-001",
                phone: "13900001111",
                name: "Import One",
                organizationPublicId: "org-district-001",
                status: "active",
              },
            ],
            rejectedRows: [
              {
                rowNumber: 3,
                userPublicId: "user-rejected-public-001",
                organizationPublicId: "org-missing-public-001",
                reason: "duplicate_phone",
              },
            ],
          },
        });
      }

      if (path === "/api/v1/org-auths") {
        const body = JSON.parse(String(init?.body));

        if (body.name === "Overlap Test") {
          return createJsonResponse({
            code: 409001,
            message:
              "Org auth scope overlaps an existing active authorization.",
            data: null,
          });
        }

        const scopeSelections =
          Array.isArray(body.scopeSelections) && body.scopeSelections.length > 0
            ? body.scopeSelections
            : [{ level: body.level, profession: body.profession }];
        const createdOrgAuths = scopeSelections.map(
          (
            scopeSelection: { level: number; profession: string },
            index: number,
          ) => ({
            publicId: `org-auth-public-created-tree-${index + 1}`,
            name: body.name,
            purchaserOrganizationPublicId: body.purchaserOrganizationPublicId,
            authScopeType: body.authScopeType,
            profession: scopeSelection.profession,
            level: scopeSelection.level,
            accountQuota: body.accountQuota,
            usedQuota: 0,
            startsAt: body.startsAt,
            expiresAt: body.expiresAt,
            status: "active",
            cancelledAt: null,
            organizationPublicIds: body.organizationPublicIds,
            createdAt: "2026-05-26T00:00:00.000Z",
            updatedAt: "2026-05-26T00:00:00.000Z",
          }),
        );

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            orgAuth: createdOrgAuths[0],
            orgAuths: createdOrgAuths,
          },
        });
      }

      if (path === "/api/v1/organizations") {
        const body = JSON.parse(String(init?.body));

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              publicId: "org-province-created",
              name: body.name,
              orgTier: body.orgTier,
              parentOrganizationPublicId: body.parentOrganizationPublicId,
              status: "active",
              contactName: body.contactName,
              contactPhone: body.contactPhone,
              remark: body.remark,
              createdAt: "2026-05-26T00:00:00.000Z",
              updatedAt: "2026-05-26T00:00:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/organizations/org-city-001") {
        const body = JSON.parse(String(init?.body));

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              publicId: "org-city-001",
              name: body.name,
              orgTier: body.orgTier,
              parentOrganizationPublicId: body.parentOrganizationPublicId,
              status: body.status,
              contactName: body.contactName,
              contactPhone: body.contactPhone,
              remark: body.remark,
              createdAt: "2026-05-26T00:00:00.000Z",
              updatedAt: "2026-05-26T00:10:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/organizations/org-city-001/disable") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              ...organizationTreePayload.data.organizations[1],
              status: "disabled",
              contactName: null,
              contactPhone: null,
              remark: null,
              createdAt: "2026-05-26T00:00:00.000Z",
              updatedAt: "2026-05-26T00:20:00.000Z",
            },
            affectedOrganizationPublicIds: ["org-city-001"],
          },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("admin user organization authorization ops baseline", () => {
  it("defines list query and operation contracts with public identifiers only", () => {
    const query = createAdminAuthOperationListQuery({
      page: 3,
      pageSize: 100,
      sortBy: "registeredAt",
      sortOrder: "asc",
      keyword: "  13800000000  ",
      status: "active",
      userType: "employee",
      userCategory: "employee",
      authFilter: "advanced",
    });

    expect(ADMIN_AUTH_OPERATION_PAGE_SIZE_OPTIONS).toEqual([20, 50, 100]);
    expect(ADMIN_AUTH_OPERATION_SORT_FIELDS).toEqual([
      "registeredAt",
      "updatedAt",
      "expiresAt",
      "createdAt",
    ]);
    expect(ADMIN_AUTH_OPERATION_ERROR_CODES).toMatchObject({
      adminPermissionDenied: 403601,
      resourceNotFound: 404601,
      concurrentConflict: 409601,
      validationFailed: 422601,
    });
    expect(query).toMatchObject({
      page: 3,
      pageSize: 100,
      sortBy: "registeredAt",
      sortOrder: "asc",
      keyword: "13800000000",
      status: "active",
      userType: "employee",
      userCategory: "employee",
      authFilter: "advanced",
    });
    expect(query).not.toHaveProperty("id");
  });

  it("returns safe admin operation summaries and denies content admin user credential mutations", async () => {
    const service = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-content-001",
        roles: ["content_admin"],
        canViewRedeemCodePlainText: false,
      },
    });

    const userList = await service.listUsers({ page: 1, pageSize: 20 });
    const organizationList = await service.listOrganizations({});
    const authorizationList = await service.listAuthorizations({});
    const redeemCodeList = await service.listRedeemCodes({});
    const adminRoleList = await service.listAdminRoles();
    const resetPassword = await service.resetUserPassword("user-public-001");

    expect(userList).toMatchObject({
      code: 0,
      message: "ok",
      pagination: { page: 1, pageSize: 20, total: 7 },
    });
    expect(userList.data?.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userCategory: "no_auth_personal",
          authEditionLabel: "none",
          accountDomain: "learner_employee",
          isPhoneEditable: false,
          canBePhysicallyDeleted: false,
        }),
        expect.objectContaining({
          userCategory: "personal_standard",
          authEditionLabel: "standard",
        }),
        expect.objectContaining({
          userCategory: "personal_advanced",
          authEditionLabel: "advanced",
        }),
        expect.objectContaining({
          userCategory: "backend_admin",
          accountDomain: "admin",
          managedBy: "super_admin",
        }),
      ]),
    );
    expect(
      userList.data?.users.find((user) => user.publicId === "user-public-001"),
    ).toMatchObject({
      publicId: "user-public-001",
      phone: "13800000000",
      userType: "employee",
      organizationName: "杭州烟草",
      authStatus: "active",
    });
    expect(userList.data?.users[0]).not.toHaveProperty("id");
    expect(organizationList.data?.organizations[0]).not.toHaveProperty("id");
    expect(authorizationList.data?.authorizations[0]).not.toHaveProperty("id");
    expect(redeemCodeList.data?.redeemCodes[0]).toMatchObject({
      publicId: "redeem-code-public-001",
      codeDisplay: "RC-2026-****",
      codePlainText: null,
      redeemCodeType: "personal_standard_activation",
      canViewPlainText: false,
    });
    expect(redeemCodeList.data?.redeemCodes[0]).not.toHaveProperty("id");
    expect(adminRoleList.data?.adminRoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: "org_standard_admin",
          scope: "organization",
          managedBy: "ops_admin_scoped_org_admin",
        }),
        expect.objectContaining({
          role: "org_advanced_admin",
          scope: "organization",
          managedBy: "ops_admin_scoped_org_admin",
        }),
      ]),
    );
    expect(resetPassword).toMatchObject({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("applies admin user filters and role-scoped reset-password boundaries", async () => {
    const opsService = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-ops-001",
        roles: ["ops_admin"],
        canViewRedeemCodePlainText: false,
      },
    });
    const superService = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-super-001",
        roles: ["super_admin"],
        canViewRedeemCodePlainText: false,
      },
    });

    const filteredUsers = await superService.listUsers({
      userCategory: "personal_advanced",
      authFilter: "advanced",
    });
    const deniedBackendReset =
      await opsService.resetUserPassword("admin-public-001");
    const allowedOrgAdminReset = await opsService.resetUserPassword(
      "admin-org-public-001",
    );
    const superBackendReset =
      await superService.resetUserPassword("admin-public-001");

    expect(filteredUsers).toMatchObject({
      code: 0,
      pagination: { total: 1 },
      data: {
        users: [
          expect.objectContaining({
            publicId: "user-public-advanced-001",
            userCategory: "personal_advanced",
            authEditionLabel: "advanced",
          }),
        ],
      },
    });
    expect(deniedBackendReset).toMatchObject({
      code: 403601,
      data: null,
    });
    expect(allowedOrgAdminReset).toMatchObject({
      code: 0,
      data: {
        userPublicId: "admin-org-public-001",
        distributionWindow: {
          visibleOnce: true,
          sessionRevocation: "not_executed_in_local_contract",
        },
      },
    });
    expect(superBackendReset).toMatchObject({
      code: 0,
      data: {
        userPublicId: "admin-public-001",
        oneTimePasswordPlainText: expect.any(String),
      },
    });
  });

  it("keeps unavailable route services in the standard response envelope", async () => {
    const unavailableService = createUnavailableAdminUserOrgAuthOpsService();

    await expect(unavailableService.listUsers({})).resolves.toEqual({
      code: 503601,
      message:
        "Admin user organization authorization runtime is not configured.",
      data: null,
      pagination: null,
    });
  });

  it("adapts admin operation route requests to standard paginated responses", async () => {
    const handlers = createAdminUserOrgAuthOpsRouteHandlers(
      createAdminUserOrgAuthOpsService({
        actor: {
          publicId: "admin-super-001",
          roles: ["super_admin", "ops_admin"],
          canViewRedeemCodePlainText: true,
        },
      }),
    );

    const usersResponse = await handlers.users.GET(
      new Request(
        "http://localhost/api/v1/users?page=2&pageSize=50&userCategory=employee&authFilter=advanced",
      ),
    );
    const redeemCodesResponse = await handlers.redeemCodes.GET(
      new Request("http://localhost/api/v1/redeem-codes?page=1&pageSize=20"),
    );
    const resetPasswordResponse = await handlers.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reset-password",
        {
          method: "POST",
        },
      ),
      {
        params: Promise.resolve({
          publicId: "user-public-001",
        }),
      },
    );

    const usersJson = await usersResponse.json();

    expect(usersJson).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 50,
        total: 1,
      },
      data: {
        users: expect.arrayContaining([
          expect.objectContaining({
            publicId: "user-public-001",
            userCategory: "employee",
            authEditionLabel: "advanced",
          }),
        ]),
      },
    });
    await expect(redeemCodesResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        redeemCodes: [
          {
            codeDisplay: "RC-2026-0001-PLAIN",
            codePlainText: "RC-2026-0001-PLAIN",
            redeemCodeType: "personal_standard_activation",
            canViewPlainText: true,
          },
        ],
      },
    });
    await expect(resetPasswordResponse.json()).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user-public-001",
        distributionWindow: {
          visibleOnce: true,
          sessionRevocation: "not_executed_in_local_contract",
        },
      },
    });
  });

  it("renders admin operation states, guarded redeem codes, confirmations, and toast feedback", () => {
    render(createElement(AdminUserOrgAuthOpsBaseline, { state: "loading" }));
    expect(screen.getByText("正在加载用户与授权运营数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminUserOrgAuthOpsBaseline, { state: "empty" }));
    expect(screen.getByText("暂无用户与授权运营数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminUserOrgAuthOpsBaseline, { state: "error" }));
    expect(screen.getByText("用户与授权运营数据加载失败")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminUserOrgAuthOpsBaseline));

    expect(
      screen.getByRole("heading", { name: "用户、组织与授权运营" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("admin-user-user-public-001")).toHaveAttribute(
      "data-public-id",
      "user-public-001",
    );
    expect(
      screen.getByTestId("admin-user-user-public-001"),
    ).not.toHaveAttribute("data-id");
    expect(screen.getByLabelText("用户分类")).toHaveValue("all");
    expect(screen.getByLabelText("授权状态")).toHaveValue("all");
    expect(
      screen.getByRole("option", { name: "未授权个人" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "标准版个人" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "高级版个人" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "企业员工" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "后台管理员" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "停用用户" }),
    ).toBeInTheDocument();
    expect(document.body).toHaveTextContent("后台管理员账号域");
    expect(
      screen.getAllByText("手机号不可修改；首期不做物理删除"),
    ).toHaveLength(7);
    expect(screen.queryByRole("button", { name: "删除" })).toBeNull();
    expect(screen.getByText("RC-2026-****")).toBeInTheDocument();
    expect(screen.queryByText("RC-2026-0001-PLAIN")).not.toBeInTheDocument();

    const employeeUser = screen.getByTestId("admin-user-user-public-001");
    fireEvent.click(
      within(employeeUser).getByRole("button", { name: "重置密码" }),
    );
    expect(
      screen.getByTestId("admin-user-reset-distribution-window"),
    ).toHaveTextContent("一次性密码分发窗口");
    expect(
      screen.getByTestId("admin-user-reset-distribution-window"),
    ).toHaveTextContent("LOCAL-RESET-ONCE");
    expect(
      screen.getByTestId("admin-user-reset-distribution-window"),
    ).toHaveTextContent("正式重置流程会撤销该账号已有活跃会话");
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(
      screen.queryByTestId("admin-user-reset-distribution-window"),
    ).toBeNull();

    expect(screen.getByText("标准版企业管理员")).toBeInTheDocument();
    expect(screen.getByText("高级版企业管理员")).toBeInTheDocument();
    expect(screen.getAllByText("运营管理员限明确组织范围维护")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认创建企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));
    expect(screen.getByRole("status")).toHaveTextContent("企业授权已提交");

    fireEvent.click(screen.getByRole("button", { name: "生成卡密" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "卡密生成需要二次确认",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认生成" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "数据已被其他操作更新，请刷新后重试",
    );
  });

  it("keeps organization authorization creation discoverable as the page primary action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetch();

    render(createElement(AdminRedeemCodePage));

    expect(
      await screen.findByRole("heading", { name: "卡密管理" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("system-ops-redeem-code-generate-entry"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "生成卡密" })).toBeVisible();
    expect(
      screen.queryByTestId("redeem-code-generation-type-select"),
    ).not.toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");
    await screen.findByRole("table", { name: "企业授权列表" });
    expect(screen.getByRole("button", { name: "新增企业授权" })).toBeVisible();
    expect(
      screen.queryByTestId("org-auth-create-form"),
    ).not.toBeInTheDocument();
  });

  it("does not expose sampled visible technical labels on ops org auth and redeem code pages", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");
    await screen.findByRole("table", { name: "企业授权列表" });
    expect(document.body).not.toHaveTextContent(
      /publicId|org_auth|runtime API|contact_config/,
    );

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetch();

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("table", { name: "卡密列表" });
    expect(document.body).not.toHaveTextContent(
      /publicId|org_auth|runtime API|contact_config/,
    );
  });

  it("closes org_auth create and cancel actions on the organization page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");
    fireEvent.click(screen.getByRole("button", { name: "新增企业授权" }));
    await screen.findByTestId("org-auth-create-form");
    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "standard" },
    });

    await screen.findByRole("heading", { name: "企业管理" });

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认创建企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业授权已创建",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/org-auths",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/org-auths",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      purchaserOrganizationPublicId: "organization-public-001",
      authScopeType: "current_and_descendants",
      scopeSelections: [{ profession: "monopoly", level: 3 }],
      edition: "standard",
      accountQuota: 100,
      organizationPublicIds: ["organization-public-001"],
    });

    const activeOrgAuthRow = screen.getByTestId(
      "admin-org-auth-org-auth-public-001",
    );
    fireEvent.click(
      within(activeOrgAuthRow).getByRole("button", { name: "取消授权" }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认取消企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认取消" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业授权已取消",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/org-auths/org-auth-public-001/cancel",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("requires explicit org_auth edition selection before create submit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");
    fireEvent.click(screen.getByRole("button", { name: "新增企业授权" }));
    await screen.findByTestId("org-auth-create-form");

    const atomicScopePreview = screen.getByTestId(
      "org-auth-atomic-scope-preview",
    );
    expect(atomicScopePreview).toHaveTextContent("原子范围预览");
    expect(atomicScopePreview).toHaveTextContent("杭州烟草");
    expect(atomicScopePreview).toHaveTextContent("专卖 3级");
    expect(atomicScopePreview).toHaveTextContent("请选择授权版本");

    const overlapGuidance = screen.getByTestId(
      "org-auth-overlap-closure-guidance",
    );
    expect(overlapGuidance).toHaveTextContent("重叠授权必须显式闭环");
    expect(overlapGuidance).toHaveTextContent("续费接续");
    expect(overlapGuidance).toHaveTextContent("手动升级");
    expect(overlapGuidance).toHaveTextContent("替换授权");
    expect(overlapGuidance).toHaveTextContent("增量扩容");
    expect(overlapGuidance).toHaveTextContent("系统不会自动续费");

    const createButton = screen.getByTestId("org-auth-create-button");

    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "advanced" },
    });

    expect(createButton).not.toBeDisabled();
    expect(atomicScopePreview).toHaveTextContent("高级版");

    fireEvent.click(createButton);
    expect(screen.getByRole("alertdialog")).toHaveTextContent("advanced");
    fireEvent.click(screen.getByTestId("org-auth-confirm-action"));

    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/org-auths",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      edition: "advanced",
    });
  });

  it("submits full org_auth scope fields for specified organization nodes", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");
    fireEvent.click(screen.getByRole("button", { name: "新增企业授权" }));

    fireEvent.change(screen.getByLabelText("授权名称"), {
      target: { value: "杭州市县区联合授权" },
    });
    fireEvent.change(screen.getByLabelText("购买主体"), {
      target: { value: "org-city-001" },
    });
    fireEvent.change(screen.getByLabelText("授权范围类型"), {
      target: { value: "specified_nodes" },
    });
    fireEvent.click(screen.getByLabelText("西湖区烟草公司"));
    fireEvent.click(screen.getByTestId("org-auth-profession-monopoly"));
    fireEvent.click(screen.getByTestId("org-auth-profession-logistics"));
    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "advanced" },
    });
    fireEvent.click(screen.getByTestId("org-auth-level-3"));
    fireEvent.click(screen.getByTestId("org-auth-level-5"));
    fireEvent.change(screen.getByLabelText("账号额度"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText("开始日期"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("到期日期"), {
      target: { value: "2027-06-01" },
    });

    const atomicScopePreview = screen.getByTestId(
      "org-auth-atomic-scope-preview",
    );
    expect(atomicScopePreview).toHaveTextContent("西湖区烟草公司");
    expect(atomicScopePreview).toHaveTextContent("物流 5级");
    expect(atomicScopePreview).toHaveTextContent("高级版");
    expect(atomicScopePreview).toHaveTextContent("额度 30人");

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认创建企业授权？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "企业授权已创建",
    );

    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/org-auths",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toEqual({
      accountQuota: 30,
      authScopeType: "specified_nodes",
      expiresAt: "2027-06-01T00:00:00.000Z",
      name: "杭州市县区联合授权",
      organizationPublicIds: ["org-district-001"],
      edition: "advanced",
      purchaserOrganizationPublicId: "org-city-001",
      scopeSelections: [{ profession: "logistics", level: 5 }],
      startsAt: "2026-06-01T00:00:00.000Z",
    });
  });

  it("maps organization auth overlap failure to explicit closure actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");
    fireEvent.click(screen.getByRole("button", { name: "新增企业授权" }));

    fireEvent.change(screen.getByLabelText("授权名称"), {
      target: { value: "Overlap Test" },
    });
    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "standard" },
    });

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));

    const alertMessage = await screen.findByRole("alert");
    expect(alertMessage).toHaveTextContent("系统不会自动合并");
    expect(alertMessage).toHaveTextContent("续费接续");
    expect(alertMessage).toHaveTextContent("增量扩容");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/org-auths",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("submits one organization auth package with multiple profession and level atoms", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");
    fireEvent.click(screen.getByRole("button", { name: "新增企业授权" }));

    fireEvent.change(screen.getByLabelText("授权名称"), {
      target: { value: "多专业等级联合授权" },
    });
    fireEvent.change(screen.getByTestId("org-auth-edition-select"), {
      target: { value: "advanced" },
    });
    fireEvent.change(screen.getByLabelText("购买主体"), {
      target: { value: "org-city-001" },
    });
    fireEvent.change(screen.getByLabelText("授权范围类型"), {
      target: { value: "specified_nodes" },
    });
    fireEvent.click(screen.getByLabelText("西湖区烟草公司"));
    fireEvent.change(screen.getByLabelText("账号额度"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText("开始日期"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("到期日期"), {
      target: { value: "2027-06-01" },
    });

    fireEvent.click(screen.getByTestId("org-auth-profession-marketing"));
    fireEvent.click(screen.getByTestId("org-auth-level-4"));

    const preview = screen.getByTestId("org-auth-atomic-scope-preview");
    expect(preview).toHaveTextContent("4 个原子专业等级");
    expect(preview).toHaveTextContent("专卖 3级");
    expect(preview).toHaveTextContent("专卖 4级");
    expect(preview).toHaveTextContent("营销 3级");
    expect(preview).toHaveTextContent("营销 4级");

    fireEvent.click(screen.getByRole("button", { name: "创建企业授权" }));
    fireEvent.click(screen.getByRole("button", { name: "确认创建" }));

    await screen.findByRole("status");

    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/org-auths",
    );

    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      accountQuota: 50,
      authScopeType: "specified_nodes",
      edition: "advanced",
      expiresAt: "2027-06-01T00:00:00.000Z",
      name: "多专业等级联合授权",
      organizationPublicIds: ["org-district-001"],
      purchaserOrganizationPublicId: "org-city-001",
      scopeSelections: [
        { profession: "monopoly", level: 3 },
        { profession: "monopoly", level: 4 },
        { profession: "marketing", level: 3 },
        { profession: "marketing", level: 4 },
      ],
      startsAt: "2026-06-01T00:00:00.000Z",
    });
    expect(JSON.stringify(createCall?.[1]?.body)).not.toContain(
      "orgAuthScopePublicId",
    );
  });

  it("creates, edits, and disables organization tree nodes from the organization page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("admin-organization-org-province-001");
    fireEvent.click(screen.getByRole("button", { name: "新增省级组织" }));
    await screen.findByTestId("organization-tree-management-form");

    const organizationTreeGuidance = screen.getByTestId(
      "organization-tree-guidance",
    );
    expect(organizationTreeGuidance).toHaveTextContent("组织树权限说明");
    expect(organizationTreeGuidance).toHaveTextContent(
      "组织树写操作由平台处理",
    );
    expect(organizationTreeGuidance).toHaveTextContent(
      "员工不在导入或资料里单独分配专业、等级或版本",
    );
    expect(organizationTreeGuidance).toHaveTextContent("节点移动仅超级管理员");
    expect(
      screen.queryByRole("button", { name: /移动企业组织/ }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("organization-name-input"), {
      target: { value: "Fujian Test Tobacco" },
    });
    fireEvent.change(screen.getByTestId("organization-tier-select"), {
      target: { value: "province" },
    });
    fireEvent.click(screen.getByTestId("organization-submit-button"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));

    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/organizations",
    );
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      name: "Fujian Test Tobacco",
      orgTier: "province",
      parentOrganizationPublicId: null,
    });

    await screen.findByRole("status");
    const provinceNode = await screen.findByTestId(
      "admin-organization-org-province-001",
    );
    fireEvent.click(within(provinceNode).getByRole("button", { name: "展开" }));
    const cityNode = await screen.findByTestId(
      "admin-organization-org-city-001",
    );
    fireEvent.click(within(cityNode).getByRole("button", { name: "详情" }));
    fireEvent.click(screen.getByTestId("organization-edit-org-city-001"));
    fireEvent.change(screen.getByTestId("organization-name-input"), {
      target: { value: "Quanzhou Test Tobacco" },
    });
    fireEvent.change(screen.getByTestId("organization-parent-select"), {
      target: { value: "org-province-001" },
    });
    fireEvent.click(screen.getByTestId("organization-submit-button"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));

    const updateCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/organizations/org-city-001",
    );
    expect(JSON.parse(String(updateCall?.[1]?.body))).toMatchObject({
      name: "Quanzhou Test Tobacco",
      orgTier: "city",
      parentOrganizationPublicId: "org-province-001",
      status: "active",
    });

    await screen.findByRole("status");
    const refreshedProvinceNode = await screen.findByTestId(
      "admin-organization-org-province-001",
    );
    fireEvent.click(
      within(refreshedProvinceNode).getByRole("button", { name: "展开" }),
    );
    const refreshedCityNode = await screen.findByTestId(
      "admin-organization-org-city-001",
    );
    fireEvent.click(
      within(refreshedCityNode).getByRole("button", { name: "详情" }),
    );
    fireEvent.click(screen.getByTestId("organization-disable-org-city-001"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/organizations/org-city-001/disable",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("renders organization detail management without leaking internal identifiers", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    const organization = await screen.findByTestId(
      "admin-organization-organization-public-001",
    );
    fireEvent.click(within(organization).getByRole("button", { name: "详情" }));

    const organizationDetail = screen.getByTestId(
      "admin-organization-detail-organization-public-001",
    );

    expect(organizationDetail).toHaveAttribute(
      "data-public-id",
      "organization-public-001",
    );
    expect(organizationDetail).not.toHaveAttribute("data-id");
    expect(organizationDetail).toHaveTextContent("当前组织");
    expect(organizationDetail).toHaveTextContent("杭州烟草");
    expect(organizationDetail).toHaveTextContent("地市");
    expect(organizationDetail).toHaveTextContent("直属员工");
    expect(organizationDetail).toHaveTextContent("42");
    expect(organizationDetail).toHaveTextContent("授权摘要");
    expect(organizationDetail).toHaveTextContent("专卖 3级 / 42 / 100");
    expect(organizationDetail).not.toHaveTextContent("organization-public-000");
    expect(organizationDetail).not.toHaveTextContent("101");
    expect(organizationDetail).not.toHaveTextContent("201");
    expect(organizationDetail).not.toHaveTextContent("301");

    fireEvent.click(
      within(organizationDetail).getByRole("button", { name: "编辑组织" }),
    );
    expect(screen.getByTestId("organization-name-input")).toHaveValue(
      "杭州烟草",
    );
  });

  it("renders the organization tree as four user-facing levels", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("admin-organization-org-province-001");
    fireEvent.click(screen.getByRole("button", { name: "新增省级组织" }));
    await screen.findByTestId("organization-tree-management-form");

    const tierSelect = screen.getByTestId("organization-tier-select");
    expect(within(tierSelect).getByRole("option", { name: "省" })).toHaveValue(
      "province",
    );
    expect(
      within(tierSelect).getByRole("option", { name: "地市" }),
    ).toHaveValue("city");
    expect(
      within(tierSelect).getByRole("option", { name: "县区" }),
    ).toHaveValue("district");
    expect(
      within(tierSelect).getByRole("option", { name: "站点" }),
    ).toHaveValue("station");

    expect(
      screen.getByTestId("organization-tree-management-form"),
    ).toHaveTextContent("维护省、地市、县区及站点层级");
  });

  it("blocks organization tree mutations with invalid tier parent selection", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();

    render(createElement(AdminOrgAuthPage));

    await screen.findByTestId("admin-organization-org-province-001");
    fireEvent.click(screen.getByRole("button", { name: "新增省级组织" }));
    await screen.findByTestId("organization-tree-management-form");

    fireEvent.change(screen.getByTestId("organization-name-input"), {
      target: { value: "Invalid District Test" },
    });
    fireEvent.change(screen.getByTestId("organization-tier-select"), {
      target: { value: "district" },
    });
    fireEvent.change(screen.getByTestId("organization-parent-select"), {
      target: { value: "org-province-001" },
    });

    expect(screen.getByTestId("organization-form-error")).toHaveTextContent(
      /./,
    );
    expect(screen.getByTestId("organization-submit-button")).toBeDisabled();
    expect(
      fetchMock.mock.calls.some(
        ([url]) => String(url) === "/api/v1/organizations",
      ),
    ).toBe(false);
  });

  it("previews employee import content and renders redacted rejection feedback", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();
    const employeeImportContent = [
      "phone,name",
      "13900001111,Import One",
      "13900002222,Import Two",
    ].join("\n");
    const expectedSubmittedContent = [
      "phone,name,initialPassword,organizationPublicId",
      "13900001111,Import One,,org-district-001",
      "13900002222,Import Two,,org-district-001",
    ].join("\n");

    render(createElement(AdminOrgAuthPage));

    await openEmployeeImportDrawer();

    fireEvent.change(screen.getByTestId("employee-import-textarea"), {
      target: { value: employeeImportContent },
    });

    expect(screen.getByTestId("employee-import-preview")).toHaveTextContent(
      "请选择员工导入目标组织。",
    );
    expect(screen.getByTestId("employee-import-submit")).toBeDisabled();

    fireEvent.change(
      screen.getByTestId("employee-import-organization-select"),
      {
        target: { value: "org-district-001" },
      },
    );

    const importPreview = screen.getByTestId("employee-import-preview");
    expect(importPreview).toHaveTextContent("员工账号 CSV");
    expect(importPreview).toHaveTextContent("2 行");
    expect(importPreview).toHaveTextContent("2 行未填写初始密码");
    expect(
      screen.getByTestId("employee-import-inherited-auth-category"),
    ).toHaveTextContent("已发现目标组织有效企业授权");
    expect(
      screen.getByTestId("employee-import-quota-impact-category"),
    ).toHaveTextContent("授权额度足够");

    fireEvent.click(screen.getByTestId("employee-import-submit"));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认导入员工？");
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    const importResult = await screen.findByTestId("employee-import-result");
    expect(importResult).toHaveTextContent("成功 1");
    expect(importResult).toHaveTextContent("拒绝 1");
    expect(importResult).toHaveTextContent("第 3 行：手机号重复");
    expect(importResult).toHaveTextContent("初始密码一次性分发窗口");
    expect(importResult).toHaveTextContent("Generated123");
    expect(importResult).not.toHaveTextContent("user-rejected-public-001");
    expect(importResult).not.toHaveTextContent("org-missing-public-001");
    expect(importResult).not.toHaveTextContent("13900002222");

    const importCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/employees/import",
    );
    expect(JSON.parse(String(importCall?.[1]?.body))).toEqual({
      content: expectedSubmittedContent,
      sourceFormat: "csv",
    });
  });

  it("downloads an employee import template and loads roster file content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetchWithOrganizationTree();
    const createObjectUrlMock = vi.fn(() => "blob:employee-import-template");
    const revokeObjectUrlMock = vi.fn();
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    vi.stubGlobal("URL", {
      createObjectURL: createObjectUrlMock,
      revokeObjectURL: revokeObjectUrlMock,
    });

    render(createElement(AdminOrgAuthPage));

    await openEmployeeImportDrawer();

    fireEvent.click(screen.getByTestId("employee-import-template-download"));

    expect(createObjectUrlMock).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith(
      "blob:employee-import-template",
    );

    const employeeImportContent = [
      "phone,name,initialPassword",
      "13900003333,Import File,abc12345",
    ].join("\n");
    const file = new File([employeeImportContent], "employee-import.csv", {
      type: "text/csv",
    });

    fireEvent.change(screen.getByTestId("employee-import-file-input"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("employee-import-textarea")).toHaveValue(
        employeeImportContent,
      );
    });
  });

  it("blocks employee import preview when selected organization quota is insufficient", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockSystemOpsFetchWithOrganizationTree();
    const employeeImportContent = [
      "phone,name",
      "13900010001,Import One",
      "13900010002,Import Two",
      "13900010003,Import Three",
      "13900010004,Import Four",
      "13900010005,Import Five",
      "13900010006,Import Six",
      "13900010007,Import Seven",
      "13900010008,Import Eight",
    ].join("\n");

    render(createElement(AdminOrgAuthPage));

    await openEmployeeImportDrawer();

    fireEvent.change(screen.getByTestId("employee-import-textarea"), {
      target: { value: employeeImportContent },
    });
    fireEvent.change(
      screen.getByTestId("employee-import-organization-select"),
      {
        target: { value: "org-district-001" },
      },
    );

    expect(
      screen.getByTestId("employee-import-quota-impact-category"),
    ).toHaveTextContent("授权额度不足");
    expect(screen.getByTestId("employee-import-submit")).toBeDisabled();
  });

  it("blocks employee import templates that contain authorization scope fields", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetchWithOrganizationTree();
    const employeeImportContent = [
      "phone,name,initialPassword,profession,level,edition,orgAuthScopePublicId",
      "13900001111,Import One,Passw0rd!,monopoly,3,advanced,scope-public-001",
    ].join("\n");

    render(createElement(AdminOrgAuthPage));

    await openEmployeeImportDrawer();

    fireEvent.change(screen.getByTestId("employee-import-textarea"), {
      target: { value: employeeImportContent },
    });

    const importPreview = screen.getByTestId("employee-import-preview");
    expect(importPreview).toHaveTextContent("profession");
    expect(importPreview).toHaveTextContent("level");
    expect(importPreview).toHaveTextContent("edition");
    expect(importPreview).toHaveTextContent("orgAuthScopePublicId");
    expect(screen.getByTestId("employee-import-submit")).toBeDisabled();

    fireEvent.click(screen.getByTestId("employee-import-submit"));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(
      fetchMock.mock.calls.some(
        ([url]) => String(url) === "/api/v1/employees/import",
      ),
    ).toBe(false);
  });

  it("manages employee unbind feedback and shows transfer quota session review", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-employees");
    const employee = await screen.findByTestId(
      "admin-employee-employee-public-001",
    );
    fireEvent.click(within(employee).getByRole("button", { name: "转移员工" }));
    const transferBoundary = screen.getByTestId(
      "employee-transfer-session-review",
    );
    fireEvent.change(within(transferBoundary).getByLabelText("目标企业"), {
      target: { value: "organization-public-002" },
    });

    expect(transferBoundary).toHaveTextContent("员工调动影响复核");
    expect(transferBoundary).toHaveTextContent("目标授权额度不足时阻断");
    expect(transferBoundary).toHaveTextContent("撤销员工已有活跃会话");
    expect(transferBoundary).toHaveTextContent("作答时企业归属快照");
    expect(transferBoundary).toHaveTextContent("原组织未提交企业训练");
    expect(transferBoundary).toHaveTextContent("宁波烟草");
    expect(transferBoundary).toHaveTextContent("目标授权额度不足");
    expect(transferBoundary).not.toHaveTextContent("approval_required");
    fireEvent.keyDown(document, { key: "Escape" });

    fireEvent.click(screen.getByTestId("employee-unbind-employee-public-001"));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认解绑员工？");
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    expect(await screen.findByRole("status")).toHaveTextContent("员工已解绑");
    const unbindResult = screen.getByTestId("employee-unbind-result");

    expect(unbindResult).toHaveTextContent("解绑成功");
    expect(unbindResult).toHaveTextContent("杭州烟草");
    expect(unbindResult).not.toHaveAttribute("data-id");
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(([url]) =>
          String(url).startsWith("/api/v1/employees?"),
        ).length,
      ).toBeGreaterThanOrEqual(2);
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employees/employee-public-001/unbind",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("closes redeem_code generation and filtering on the redeem code page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("heading", { name: "卡密管理" });

    fireEvent.change(screen.getByLabelText("卡密状态"), {
      target: { value: "unused" },
    });
    fireEvent.change(screen.getByLabelText("卡密搜索"), {
      target: { value: "RC-2026" },
    });

    expect(await screen.findByText("RC-2026-LIST-PLAIN")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "卡密列表" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "列表分页" })).toHaveTextContent(
      "显示 1-4 / 共 4 个卡密",
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/redeem-codes?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc&status=unused&keyword=RC-2026",
        expect.anything(),
      ),
    );

    fireEvent.change(screen.getByLabelText("卡密每页条数"), {
      target: { value: "50" },
    });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/redeem-codes?page=1&pageSize=50&sortBy=createdAt&sortOrder=desc&status=unused&keyword=RC-2026",
        expect.anything(),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: /创建时间/ }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/redeem-codes?page=1&pageSize=50&sortBy=createdAt&sortOrder=asc&status=unused&keyword=RC-2026",
        expect.anything(),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "生成卡密" }));
    const generationDrawer = screen.getByRole("dialog", { name: "生成卡密" });
    fireEvent.click(
      within(generationDrawer).getByTestId("redeem-code-generation-mode-batch"),
    );
    fireEvent.change(screen.getByTestId("redeem-code-generation-type-select"), {
      target: { value: "edition_upgrade" },
    });
    fireEvent.change(screen.getByTestId("redeem-code-generation-count-input"), {
      target: { value: "2" },
    });
    fireEvent.change(
      screen.getByTestId("redeem-code-generation-profession-select"),
      {
        target: { value: "logistics" },
      },
    );
    fireEvent.change(screen.getByTestId("redeem-code-generation-level-input"), {
      target: { value: "4" },
    });
    fireEvent.change(
      screen.getByTestId("redeem-code-generation-duration-input"),
      {
        target: { value: "180" },
      },
    );
    fireEvent.change(
      screen.getByTestId("redeem-code-generation-deadline-input"),
      {
        target: { value: "2026-07-01" },
      },
    );

    fireEvent.click(screen.getByTestId("redeem-code-generate-button"));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认生成卡密？");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("2");
    expect(screen.getByRole("alertdialog")).not.toHaveTextContent("LOCALTST");
    fireEvent.click(
      screen.getByTestId("redeem-code-generation-confirm-action"),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "卡密已生成，请在受控分发窗口核对并复制",
    );
    const generationSummary = await screen.findByTestId(
      "redeem-code-generation-redacted-summary",
    );
    expect(generationSummary).toHaveTextContent("redeem-code-batch-public-001");
    expect(generationSummary).toHaveTextContent("2");
    expect(generationSummary).toHaveTextContent("edition_upgrade");
    expect(generationSummary).toHaveTextContent("logistics");
    expect(generationSummary).toHaveTextContent("4");
    expect(generationSummary).not.toHaveTextContent("LOCALTST");
    expect(
      screen.getByTestId("redeem-code-distribution-window"),
    ).toHaveTextContent("LOCALTST");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/redeem-codes",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const generateCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/v1/redeem-codes",
    );
    expect(JSON.parse(String(generateCall?.[1]?.body))).toMatchObject({
      count: 2,
      redeemCodeType: "edition_upgrade",
      profession: "logistics",
      level: 4,
      durationDay: 180,
      redeemDeadlineDate: "2026-07-01",
    });
  });

  it("renders a redacted redeem_code detail view from the redeem code page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockSystemOpsFetch();

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("heading", { name: "卡密管理" });

    const redeemCodeRow = await screen.findByTestId(
      "admin-redeem-code-redeem-code-public-001",
    );

    fireEvent.click(
      within(redeemCodeRow).getByRole("button", { name: "详情" }),
    );

    const redeemCodeDetail = await screen.findByTestId(
      "admin-redeem-code-detail-redeem-code-public-001",
    );

    expect(redeemCodeDetail).toHaveAttribute(
      "data-public-id",
      "redeem-code-public-001",
    );
    expect(redeemCodeDetail).not.toHaveAttribute("data-id");
    expect(redeemCodeDetail).toHaveTextContent("RC-2026-DETAIL-PLAIN");
    expect(redeemCodeDetail).toHaveTextContent("redeem-code-public-001");
    expect(redeemCodeDetail).toHaveTextContent("redeem-code-batch-public-001");
    expect(redeemCodeDetail).toHaveTextContent("365");
    expect(redeemCodeDetail).toHaveTextContent("redacted");
    expect(redeemCodeDetail).toHaveTextContent("校验值已隐藏，明文已授权显示");
    expect(redeemCodeDetail).toHaveTextContent("未兑换");
    expect(redeemCodeDetail).toHaveTextContent("2026-06-24");
    expect(redeemCodeDetail).not.toHaveTextContent("LOCALTST");
    expect(redeemCodeDetail).not.toHaveTextContent("code_hash");
    expect(redeemCodeDetail).not.toHaveTextContent("detail-do-not-render");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/redeem-codes/redeem-code-public-001",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );

    fireEvent.click(
      within(redeemCodeDetail).getByRole("button", { name: "关闭" }),
    );
    expect(
      screen.queryByTestId("admin-redeem-code-detail-redeem-code-public-001"),
    ).not.toBeInTheDocument();
  });
});
