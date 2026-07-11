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

import { AdminOrgAuthPage } from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";
import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type {
  AdminOrgAuthListDto,
  EmployeeListDto,
  EmployeeImportResultDto,
  EmployeeTransferResultDto,
  EmployeeUnbindResultDto,
  OrganizationListDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type {
  OrgAuthDetailResultDto,
  OrganizationDto,
} from "@/server/contracts/organization-auth-contract";
import type { SessionService } from "@/server/services/session-service";

type AdminRole = "super_admin" | "ops_admin" | "content_admin";

type EmployeeImportInput = {
  employees: {
    userPublicId: string;
    organizationPublicId: string;
  }[];
};

type ExtendedEnterpriseRepositories =
  AdminOrganizationOrgAuthRuntimeRepositories & {
    enableOrganization?(publicId: string): Promise<OrganizationDto | null>;
    importEmployees?(
      input: EmployeeImportInput,
    ): Promise<EmployeeImportResultDto | null>;
    transferEmployee?(input: {
      employeePublicId: string;
      targetOrganizationPublicId: string;
    }): Promise<EmployeeTransferResultDto | null>;
    unbindEmployee?(publicId: string): Promise<EmployeeUnbindResultDto | null>;
  };

type ExtendedEnterpriseHandlers = ReturnType<
  typeof createAdminOrganizationOrgAuthRuntimeRouteHandlers
> & {
  organizations: ReturnType<
    typeof createAdminOrganizationOrgAuthRuntimeRouteHandlers
  >["organizations"] & {
    enable: {
      POST(request: Request, context: RouteContext): Promise<Response>;
    };
  };
  employees: ReturnType<
    typeof createAdminOrganizationOrgAuthRuntimeRouteHandlers
  >["employees"] & {
    importBatch: {
      POST(request: Request): Promise<Response>;
    };
    transfer: {
      POST(request: Request, context: RouteContext): Promise<Response>;
    };
    unbind: {
      POST(request: Request, context: RouteContext): Promise<Response>;
    };
  };
};

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

const sessionToken = "unit-test-admin-token";

const organizationListPayload: {
  code: number;
  message: string;
  data: OrganizationListDto;
} = {
  code: 0,
  message: "ok",
  data: {
    organizations: [
      {
        publicId: "org-city-001",
        name: "Hangzhou Test Tobacco",
        orgTier: "city",
        parentOrganizationPublicId: "org-province-001",
        status: "disabled",
        employeeCount: 1,
        authSummary: "monopoly / level 3",
      },
      {
        publicId: "org-target-001",
        name: "Target Test Tobacco",
        orgTier: "district",
        parentOrganizationPublicId: "org-city-001",
        status: "active",
        employeeCount: 0,
        authSummary: "monopoly / level 3",
      },
    ],
  },
};

const orgAuthListPayload: {
  code: number;
  message: string;
  data: AdminOrgAuthListDto;
} = {
  code: 0,
  message: "ok",
  data: {
    orgAuths: [
      {
        publicId: "org-auth-public-001",
        name: "Hangzhou Enterprise Auth",
        purchaserOrganizationPublicId: "org-city-001",
        purchaserOrganizationName: "Hangzhou Test Tobacco",
        coveredOrganizationCount: 1,
        coveredOrganizationNames: ["Hangzhou Test Tobacco"],
        authScopeType: "current_and_descendants",
        profession: "monopoly",
        level: 3,
        edition: "advanced",
        effectiveEdition: "advanced",
        upgradeStatus: "none",
        accountQuota: 100,
        usedQuota: 1,
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2027-06-01T00:00:00.000Z",
        status: "active",
        cancelledAt: null,
        organizationPublicIds: ["org-city-001"],
        createdAt: "2026-05-31T00:00:00.000Z",
        updatedAt: "2026-05-31T00:00:00.000Z",
      },
      {
        publicId: "org-auth-target-001",
        name: "Target Enterprise Auth",
        purchaserOrganizationPublicId: "org-target-001",
        purchaserOrganizationName: "Target Organization",
        coveredOrganizationCount: 1,
        coveredOrganizationNames: ["Target Organization"],
        authScopeType: "current_and_descendants",
        profession: "monopoly",
        level: 3,
        edition: "standard",
        effectiveEdition: "standard",
        upgradeStatus: "none",
        accountQuota: 10,
        usedQuota: 0,
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2027-06-01T00:00:00.000Z",
        status: "active",
        cancelledAt: null,
        organizationPublicIds: ["org-target-001"],
        createdAt: "2026-05-31T00:00:00.000Z",
        updatedAt: "2026-05-31T00:00:00.000Z",
      },
    ],
  },
};

const orgAuthDetailPayload: {
  code: number;
  message: string;
  data: OrgAuthDetailResultDto;
} = {
  code: 0,
  message: "ok",
  data: {
    orgAuth: {
      ...orgAuthListPayload.data.orgAuths[0],
      purchaserOrganization: {
        publicId: "org-city-001",
        name: "Hangzhou Test Tobacco",
        orgTier: "city",
        status: "disabled",
      },
      coveredOrganizations: [
        {
          publicId: "org-city-001",
          name: "Hangzhou Test Tobacco",
          orgTier: "city",
          parentOrganizationPublicId: "org-province-001",
          employeeCount: 1,
        },
      ],
      occupancy: {
        accountQuota: 100,
        usedQuota: 1,
        availableQuota: 99,
      },
    },
  },
};

const employeeListPayload: {
  code: number;
  message: string;
  data: EmployeeListDto;
} = {
  code: 0,
  message: "ok",
  data: {
    employees: [
      {
        publicId: "employee-public-001",
        userPublicId: "user-public-001",
        phone: "13900000001",
        name: "Employee One",
        organizationPublicId: "org-city-001",
        status: "active",
      },
    ],
  },
};

const emptyOrganizationListPayload: {
  code: number;
  message: string;
  data: OrganizationListDto;
} = {
  code: 0,
  message: "ok",
  data: {
    organizations: [],
  },
};

const emptyOrgAuthListPayload: {
  code: number;
  message: string;
  data: AdminOrgAuthListDto;
} = {
  code: 0,
  message: "ok",
  data: {
    orgAuths: [],
  },
};

const emptyEmployeeListPayload: {
  code: number;
  message: string;
  data: EmployeeListDto;
} = {
  code: 0,
  message: "ok",
  data: {
    employees: [],
  },
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});

async function openOpsOrganizationManagementView(testId: string) {
  await screen.findByRole("heading", { name: "企业管理" });
  fireEvent.click(screen.getByTestId(testId));
}

function createAdminSessionService(
  role: AdminRole,
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer unit-test-admin-token") {
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
          session: { expiresAt: "2027-05-31T00:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000000",
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

function createOrganization(
  overrides: Partial<OrganizationDto> = {},
): OrganizationDto {
  return {
    publicId: "org-city-001",
    name: "Hangzhou Test Tobacco",
    orgTier: "city",
    parentOrganizationPublicId: "org-province-001",
    status: "active",
    contactName: null,
    contactPhone: null,
    remark: null,
    createdAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:00:00.000Z",
    ...overrides,
  };
}

function createEnterpriseRepositories(input: {
  auditInputs: unknown[];
  mutationInputs: unknown[];
}): ExtendedEnterpriseRepositories {
  return {
    async listOrganizations(query) {
      return {
        organizations: organizationListPayload.data.organizations,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 2,
        },
      };
    },
    async listOrgAuths(query) {
      return {
        orgAuths: orgAuthListPayload.data.orgAuths,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 2,
        },
      };
    },
    async listEmployees(query) {
      return {
        employees: employeeListPayload.data.employees,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 1,
        },
      };
    },
    async enableOrganization(publicId) {
      input.mutationInputs.push({ action: "enableOrganization", publicId });

      return createOrganization({ publicId, status: "active" });
    },
    async importEmployees(importInput) {
      input.mutationInputs.push({
        action: "importEmployees",
        importInput,
      });

      return {
        importedEmployees: importInput.employees.map(
          (employeeInput, index) => ({
            publicId: `employee-imported-${index + 1}`,
            userPublicId: employeeInput.userPublicId,
            phone: `1390000000${index + 2}`,
            name: `Imported Employee ${index + 1}`,
            organizationPublicId: employeeInput.organizationPublicId,
            status: "active",
          }),
        ),
        rejectedRows: [],
      };
    },
    async unbindEmployee(publicId) {
      const employeePublicId =
        typeof publicId === "string" ? publicId : publicId.employeePublicId;
      input.mutationInputs.push({ action: "unbindEmployee", publicId });

      return {
        employeePublicId,
        userPublicId: "user-public-001",
        previousOrganizationPublicId: "org-city-001",
        status: "unbound",
      };
    },
    async transferEmployee(transferInput) {
      input.mutationInputs.push({
        action: "transferEmployee",
        transferInput,
      });

      return {
        employeePublicId: transferInput.employeePublicId,
        userPublicId: "user-public-001",
        previousOrganizationPublicId: "org-city-001",
        targetOrganizationPublicId: transferInput.targetOrganizationPublicId,
        quotaRefreshStatus: "refreshed",
        sessionRevocationStatus: "revoked",
        historicalSnapshotStatus: "preserved",
        oldOrganizationInProgressTrainingStatus: "blocked",
        status: "transferred",
      };
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
    },
  };
}

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function createOrganizationTreeNodesPayload(
  path: string,
  organizations: OrganizationListDto["organizations"],
) {
  const requestUrl = new URL(path, "http://localhost");
  const parentOrganizationPublicId = requestUrl.searchParams.get(
    "parentOrganizationPublicId",
  );
  const page = Number(requestUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(requestUrl.searchParams.get("pageSize") ?? "50");
  const organizationByPublicId = new Map(
    organizations.map((organization) => [organization.publicId, organization]),
  );
  const candidates = organizations.filter((organization) => {
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
    .map((organization) => ({
      ...organization,
      ancestorPath: [],
      childCount: organizations.filter(
        (candidate) =>
          candidate.parentOrganizationPublicId === organization.publicId,
      ).length,
    }));

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

function mockOrganizationPageFetch() {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            session: { expiresAt: "2027-05-31T00:00:00.000Z" },
            user: {
              publicId: "admin-user-public-001",
              phone: "13900000000",
              name: "Admin User",
              userType: null,
              status: "active",
              lockedUntilAt: null,
              employeePublicId: null,
              organizationPublicId: null,
              adminPublicId: "admin-public-001",
              adminRoles: ["ops_admin"],
            },
          },
        });
      }

      if (path.startsWith("/api/v1/organization-tree-nodes?")) {
        return createJsonResponse(
          createOrganizationTreeNodesPayload(
            path,
            organizationListPayload.data.organizations,
          ),
        );
      }

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse(organizationListPayload);
      }

      if (path.startsWith("/api/v1/org-auths?")) {
        return createJsonResponse(orgAuthListPayload);
      }

      if (path === "/api/v1/org-auths/org-auth-public-001") {
        return createJsonResponse(orgAuthDetailPayload);
      }

      if (path === "/api/v1/employees?page=1&pageSize=20") {
        return createJsonResponse(employeeListPayload);
      }

      if (path === "/api/v1/organizations/org-city-001/enable") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              ...organizationListPayload.data.organizations[0],
              status: "active",
              contactName: null,
              contactPhone: null,
              remark: null,
              createdAt: "2026-05-31T00:00:00.000Z",
              updatedAt: "2026-05-31T00:10:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/employees/import") {
        const body = JSON.parse(String(init?.body));

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            importedEmployees: body.employees.map(
              (
                employeeInput: {
                  userPublicId: string;
                  organizationPublicId: string;
                },
                index: number,
              ) => ({
                publicId: `employee-imported-${index + 1}`,
                userPublicId: employeeInput.userPublicId,
                phone: "13900000002",
                name: "Imported Employee",
                organizationPublicId: employeeInput.organizationPublicId,
                status: "active",
              }),
            ),
            rejectedRows: [],
          },
        });
      }

      if (path === "/api/v1/employees/employee-public-001/unbind") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            employeePublicId: "employee-public-001",
            userPublicId: "user-public-001",
            previousOrganizationPublicId: "org-city-001",
            status: "unbound",
          },
        });
      }

      if (path === "/api/v1/employees/employee-public-001/transfer") {
        const body = JSON.parse(String(init?.body));

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            employeePublicId: "employee-public-001",
            userPublicId: "user-public-001",
            previousOrganizationPublicId: "org-city-001",
            targetOrganizationPublicId: body.targetOrganizationPublicId,
            quotaRefreshStatus: "refreshed",
            sessionRevocationStatus: "revoked",
            historicalSnapshotStatus: "preserved",
            oldOrganizationInProgressTrainingStatus: "blocked",
            status: "transferred",
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

function mockEmptyOrganizationPageFetch() {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            session: { expiresAt: "2027-05-31T00:00:00.000Z" },
            user: {
              publicId: "admin-user-public-001",
              phone: "13900000000",
              name: "Admin User",
              userType: null,
              status: "active",
              lockedUntilAt: null,
              employeePublicId: null,
              organizationPublicId: null,
              adminPublicId: "admin-public-001",
              adminRoles: ["ops_admin"],
            },
          },
        });
      }

      if (path.startsWith("/api/v1/organization-tree-nodes?")) {
        return createJsonResponse(
          createOrganizationTreeNodesPayload(
            path,
            emptyOrganizationListPayload.data.organizations,
          ),
        );
      }

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse(emptyOrganizationListPayload);
      }

      if (path.startsWith("/api/v1/org-auths?")) {
        return createJsonResponse(emptyOrgAuthListPayload);
      }

      if (path === "/api/v1/employees?page=1&pageSize=20") {
        return createJsonResponse(emptyEmployeeListPayload);
      }

      if (path === "/api/v1/organizations" && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as {
          name: string;
          orgTier: OrganizationDto["orgTier"];
          parentOrganizationPublicId: string | null;
        };

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            organization: {
              publicId: "org-province-001",
              name: body.name,
              orgTier: body.orgTier,
              parentOrganizationPublicId: body.parentOrganizationPublicId,
              status: "active",
              contactName: null,
              contactPhone: null,
              remark: null,
              createdAt: "2026-05-31T00:00:00.000Z",
              updatedAt: "2026-05-31T00:10:00.000Z",
            },
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

describe("phase 20 RA-06-03 organization employee management completion", () => {
  it("adds organization enable, employee batch import, employee transfer, and employee unbind runtime routes with redacted audits", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createEnterpriseRepositories({
        auditInputs,
        mutationInputs,
      }),
      sessionService: createAdminSessionService("ops_admin"),
    }) as ExtendedEnterpriseHandlers;
    const headers = {
      authorization: `Bearer ${sessionToken}`,
      "x-forwarded-for": "203.0.113.50, 10.0.0.1",
    };

    const enableResponse = await handlers.organizations.enable.POST(
      new Request("http://localhost/api/v1/organizations/org-city-001/enable", {
        method: "POST",
        headers,
      }),
      { params: Promise.resolve({ publicId: "org-city-001" }) },
    );
    const importResponse = await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers,
        body: JSON.stringify({
          employees: [
            {
              userPublicId: "user-public-002",
              organizationPublicId: "org-city-001",
            },
          ],
        }),
      }),
    );
    const unbindResponse = await handlers.employees.unbind.POST(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/unbind",
        {
          method: "POST",
          headers,
        },
      ),
      { params: Promise.resolve({ publicId: "employee-public-001" }) },
    );
    const transferResponse = await handlers.employees.transfer.POST(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/transfer",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            targetOrganizationPublicId: "org-target-001",
          }),
        },
      ),
      { params: Promise.resolve({ publicId: "employee-public-001" }) },
    );

    await expect(enableResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        organization: {
          publicId: "org-city-001",
          status: "active",
        },
      },
    });
    await expect(importResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        importedEmployees: [
          {
            publicId: "employee-imported-1",
            userPublicId: "user-public-002",
            organizationPublicId: "org-city-001",
          },
        ],
        rejectedRows: [],
      },
    });
    await expect(unbindResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        employeePublicId: "employee-public-001",
        userPublicId: "user-public-001",
        previousOrganizationPublicId: "org-city-001",
        status: "unbound",
      },
    });
    await expect(transferResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        employeePublicId: "employee-public-001",
        userPublicId: "user-public-001",
        previousOrganizationPublicId: "org-city-001",
        targetOrganizationPublicId: "org-target-001",
        quotaRefreshStatus: "refreshed",
        sessionRevocationStatus: "revoked",
        historicalSnapshotStatus: "preserved",
        oldOrganizationInProgressTrainingStatus: "blocked",
        status: "transferred",
      },
    });
    expect(mutationInputs).toEqual([
      { action: "enableOrganization", publicId: "org-city-001" },
      {
        action: "importEmployees",
        importInput: {
          employees: [
            {
              userPublicId: "user-public-002",
              organizationPublicId: "org-city-001",
            },
          ],
        },
      },
      { action: "unbindEmployee", publicId: "employee-public-001" },
      {
        action: "transferEmployee",
        transferInput: {
          employeePublicId: "employee-public-001",
          targetOrganizationPublicId: "org-target-001",
        },
      },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "organization.enable",
        actorRole: "ops_admin",
        targetResourceType: "organization",
        targetPublicId: "org-city-001",
        resultStatus: "success",
        metadataSummary: "redacted organization enable metadata",
        requestIp: "203.0.113.50",
      }),
      expect.objectContaining({
        actionType: "employee.import",
        actorRole: "ops_admin",
        targetResourceType: "employee",
        targetPublicId: null,
        resultStatus: "success",
        metadataSummary:
          "redacted employee import metadata; imported=1 rejected=0",
      }),
      expect.objectContaining({
        actionType: "employee.unbind",
        actorRole: "ops_admin",
        targetResourceType: "employee",
        targetPublicId: "employee-public-001",
        resultStatus: "success",
        metadataSummary: "redacted employee unbind metadata",
      }),
      expect.objectContaining({
        actionType: "employee.transfer",
        actorRole: "ops_admin",
        targetResourceType: "employee",
        targetPublicId: "employee-public-001",
        resultStatus: "success",
        metadataSummary: "redacted employee transfer metadata",
      }),
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      sessionToken,
    );
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      '"id"',
    );
  });

  it("denies content admins for employee import, transfer and unbind without touching employee records", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createEnterpriseRepositories({
        auditInputs,
        mutationInputs,
      }),
      sessionService: createAdminSessionService("content_admin"),
    }) as ExtendedEnterpriseHandlers;
    const headers = { authorization: `Bearer ${sessionToken}` };

    const importResponse = await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers,
        body: JSON.stringify({
          employees: [
            {
              userPublicId: "user-public-002",
              organizationPublicId: "org-city-001",
            },
          ],
        }),
      }),
    );
    const unbindResponse = await handlers.employees.unbind.POST(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/unbind",
        {
          method: "POST",
          headers,
        },
      ),
      { params: Promise.resolve({ publicId: "employee-public-001" }) },
    );
    const transferResponse = await handlers.employees.transfer.POST(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/transfer",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            targetOrganizationPublicId: "org-target-001",
          }),
        },
      ),
      { params: Promise.resolve({ publicId: "employee-public-001" }) },
    );

    await expect(importResponse.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    await expect(unbindResponse.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    await expect(transferResponse.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(mutationInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "employee.import",
        resultStatus: "failed",
        metadataSummary: "redacted employee permission denial metadata",
      }),
      expect.objectContaining({
        actionType: "employee.unbind",
        resultStatus: "failed",
        metadataSummary: "redacted employee permission denial metadata",
      }),
      expect.objectContaining({
        actionType: "employee.transfer",
        resultStatus: "failed",
        metadataSummary: "redacted employee permission denial metadata",
      }),
    ]);
  });

  it("closes local UI controls for organization enable, employee import, transfer and unbind, and auth detail evidence", async () => {
    localStorage.setItem("tiku.localSessionToken", sessionToken);
    const fetchMock = mockOrganizationPageFetch();

    render(createElement(AdminOrgAuthPage));

    await openOpsOrganizationManagementView("ops-organization-view-org-auth");

    const orgAuthRow = screen.getByTestId("admin-org-auth-org-auth-public-001");
    fireEvent.click(
      within(orgAuthRow).getByRole("button", { name: "查看详情" }),
    );
    expect(
      await screen.findByTestId("admin-org-auth-detail-org-auth-public-001"),
    ).toHaveTextContent("100");
    expect(
      screen.getByTestId("admin-org-auth-detail-org-auth-public-001"),
    ).toHaveTextContent("Hangzhou Test Tobacco");
    expect(
      screen.getByTestId("admin-org-auth-detail-org-auth-public-001"),
    ).not.toHaveTextContent("org-city-001");

    fireEvent.click(
      screen.getByTestId("ops-organization-view-organization-tree"),
    );
    await screen.findByTestId("admin-organization-org-city-001");
    fireEvent.click(screen.getByTestId("organization-enable-org-city-001"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/organizations/org-city-001/enable",
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.click(screen.getByTestId("ops-organization-view-employees"));
    fireEvent.change(screen.getByTestId("employee-import-textarea"), {
      target: { value: "user-public-002,org-city-001" },
    });
    fireEvent.change(
      screen.getByTestId("employee-import-organization-select"),
      {
        target: { value: "org-city-001" },
      },
    );
    fireEvent.click(screen.getByTestId("employee-import-submit"));
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/employees/import",
        expect.objectContaining({
          body: JSON.stringify({
            employees: [
              {
                userPublicId: "user-public-002",
                organizationPublicId: "org-city-001",
              },
            ],
          }),
          method: "POST",
        }),
      ),
    );

    fireEvent.click(
      screen.getByTestId(
        "employee-transfer-employee-public-001-org-target-001",
      ),
    );
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/employees/employee-public-001/transfer",
        expect.objectContaining({
          body: JSON.stringify({
            targetOrganizationPublicId: "org-target-001",
          }),
          method: "POST",
        }),
      ),
    );

    fireEvent.click(screen.getByTestId("employee-unbind-employee-public-001"));
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/employees/employee-public-001/unbind",
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });

  it("keeps the organization first-create surface available when enterprise data is empty", async () => {
    localStorage.setItem("tiku.localSessionToken", sessionToken);
    const fetchMock = mockEmptyOrganizationPageFetch();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业管理" });

    expect(screen.queryByText("暂无企业管理数据")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "新增省级组织" }));
    expect(
      screen.getByTestId("organization-tree-management-form"),
    ).toBeVisible();
    expect(screen.getByTestId("organization-submit-button")).toBeDisabled();

    fireEvent.change(screen.getByTestId("organization-name-input"), {
      target: { value: "Scenario Root Organization" },
    });
    fireEvent.change(screen.getByTestId("organization-tier-select"), {
      target: { value: "province" },
    });

    expect(screen.getByTestId("organization-submit-button")).toBeEnabled();

    fireEvent.click(screen.getByTestId("organization-submit-button"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/organizations",
        expect.objectContaining({
          body: JSON.stringify({
            contactName: null,
            contactPhone: null,
            name: "Scenario Root Organization",
            orgTier: "province",
            parentOrganizationPublicId: null,
            remark: null,
            status: "active",
          }),
          method: "POST",
        }),
      ),
    );
  });
});
