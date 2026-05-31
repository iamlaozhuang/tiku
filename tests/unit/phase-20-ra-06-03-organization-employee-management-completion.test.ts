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
  EmployeeListDto,
  EmployeeImportResultDto,
  EmployeeUnbindResultDto,
  OrganizationListDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type {
  OrgAuthDetailResultDto,
  OrgAuthListDto,
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
    ],
  },
};

const orgAuthListPayload: {
  code: number;
  message: string;
  data: OrgAuthListDto;
} = {
  code: 0,
  message: "ok",
  data: {
    orgAuths: [
      {
        publicId: "org-auth-public-001",
        name: "Hangzhou Enterprise Auth",
        purchaserOrganizationPublicId: "org-city-001",
        authScopeType: "current_and_descendants",
        profession: "monopoly",
        level: 3,
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

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

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
          total: 1,
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
          total: 1,
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
      input.mutationInputs.push({ action: "unbindEmployee", publicId });

      return {
        employeePublicId: publicId,
        userPublicId: "user-public-001",
        previousOrganizationPublicId: "org-city-001",
        status: "unbound",
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

      if (path === "/api/v1/organizations?page=1&pageSize=20") {
        return createJsonResponse(organizationListPayload);
      }

      if (path === "/api/v1/org-auths?page=1&pageSize=20") {
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
  it("adds organization enable, employee batch import, and employee unbind runtime routes with redacted audits", async () => {
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
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      sessionToken,
    );
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      '"id"',
    );
  });

  it("denies content admins for employee import and unbind without touching employee records", async () => {
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
    ]);
  });

  it("closes local UI controls for organization enable, employee import and unbind, and auth detail evidence", async () => {
    localStorage.setItem("tiku.localSessionToken", sessionToken);
    const fetchMock = mockOrganizationPageFetch();

    render(createElement(AdminOrgAuthPage));

    await screen.findByRole("heading", { name: "企业授权运营" });

    const orgAuthRow = screen.getByTestId("admin-org-auth-org-auth-public-001");
    fireEvent.click(
      within(orgAuthRow).getByRole("button", { name: "查看详情" }),
    );
    expect(
      await screen.findByTestId("admin-org-auth-detail-org-auth-public-001"),
    ).toHaveTextContent("100");
    expect(
      screen.getByTestId("admin-org-auth-detail-org-auth-public-001"),
    ).toHaveTextContent("org-city-001");

    fireEvent.click(screen.getByTestId("organization-enable-org-city-001"));
    fireEvent.click(screen.getByTestId("organization-confirm-action"));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/organizations/org-city-001/enable",
        expect.objectContaining({ method: "POST" }),
      ),
    );

    fireEvent.change(screen.getByTestId("employee-import-textarea"), {
      target: { value: "user-public-002,org-city-001" },
    });
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

    fireEvent.click(screen.getByTestId("employee-unbind-employee-public-001"));
    fireEvent.click(screen.getByTestId("employee-confirm-action"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/employees/employee-public-001/unbind",
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
