import { describe, expect, it } from "vitest";

import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeOptions,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { EmployeeAccountService } from "@/server/services/employee-account-service";
import type { SessionService } from "@/server/services/session-service";

type AdminRole = "super_admin" | "ops_admin" | "content_admin";

function createAdminSessionService(
  role: AdminRole,
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
          session: { expiresAt: "2026-06-01T08:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "Ops Admin",
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
  auditInputs: unknown[];
  mutationInputs: unknown[];
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
    async createEmployee(inputPayload) {
      input.mutationInputs.push({
        action: "createEmployeeByExistingUser",
        inputPayload,
      });

      return null;
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
    },
  };
}

function createEmployeeAccountService(input: {
  serviceInputs: unknown[];
}): EmployeeAccountService {
  return {
    async createEmployeeAccount(employeeAccountInput) {
      input.serviceInputs.push(employeeAccountInput);

      return {
        code: 0,
        message: "ok",
        data: {
          employeeAccount: {
            employee: {
              publicId: "employee-public-001",
              userPublicId: "user-public-001",
              organizationPublicId: "organization-public-001",
              createdAt: "2026-05-31T08:00:00.000Z",
              updatedAt: "2026-05-31T08:00:00.000Z",
            },
            user: {
              publicId: "user-public-001",
              phone: "13900000002",
              name: "Employee One",
              userType: "employee",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: "employee-public-001",
              organizationPublicId: "organization-public-001",
            },
            organization: {
              publicId: "organization-public-001",
              name: "Hangzhou Test Tobacco",
            },
          },
        },
      };
    },
  };
}

describe("phase 20 RA-01-03 employee account runtime", () => {
  it("lets ops_admin create a full employee account through the active employees route with redacted audit metadata", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const serviceInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      employeeAccountService: createEmployeeAccountService({ serviceInputs }),
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService("ops_admin"),
    } as AdminOrganizationOrgAuthRuntimeOptions & {
      employeeAccountService: EmployeeAccountService;
    });

    const response = await handlers.employees.collection.POST(
      new Request("http://localhost/api/v1/employees", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "x-forwarded-for": "203.0.113.60, 10.0.0.1",
        },
        body: JSON.stringify({
          phone: "13900000002",
          name: "Employee One",
          initialPassword: "abc12345",
          organizationPublicId: "organization-public-001",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        employeeAccount: {
          employee: {
            publicId: "employee-public-001",
            userPublicId: "user-public-001",
            organizationPublicId: "organization-public-001",
            createdAt: "2026-05-31T08:00:00.000Z",
            updatedAt: "2026-05-31T08:00:00.000Z",
          },
          user: {
            publicId: "user-public-001",
            phone: "13900000002",
            name: "Employee One",
            userType: "employee",
            status: "active",
            lockedUntilAt: null,
            employeePublicId: "employee-public-001",
            organizationPublicId: "organization-public-001",
          },
          organization: {
            publicId: "organization-public-001",
            name: "Hangzhou Test Tobacco",
          },
        },
      },
    });
    expect(serviceInputs).toEqual([
      {
        phone: "13900000002",
        name: "Employee One",
        initialPassword: "abc12345",
        organizationPublicId: "organization-public-001",
      },
    ]);
    expect(mutationInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "employee.create",
        actorRole: "ops_admin",
        targetResourceType: "employee",
        targetPublicId: "employee-public-001",
        resultStatus: "success",
        metadataSummary: "redacted employee account create metadata",
        requestIp: "203.0.113.60",
      }),
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      "abc12345",
    );
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      "admin-session-token",
    );
  });
});
