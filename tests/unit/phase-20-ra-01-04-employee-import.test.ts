import { describe, expect, it } from "vitest";

import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
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
      const employeeInput = employeeAccountInput as {
        name: string;
        organizationPublicId: string;
        phone: string;
      };
      const suffix = employeeInput.phone.slice(-4);

      return {
        code: 0,
        message: "ok",
        data: {
          employeeAccount: {
            employee: {
              publicId: `employee-public-${suffix}`,
              userPublicId: `user-public-${suffix}`,
              organizationPublicId: employeeInput.organizationPublicId,
              createdAt: "2026-05-31T08:00:00.000Z",
              updatedAt: "2026-05-31T08:00:00.000Z",
            },
            user: {
              publicId: `user-public-${suffix}`,
              phone: employeeInput.phone,
              name: employeeInput.name,
              userType: "employee",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: `employee-public-${suffix}`,
              organizationPublicId: employeeInput.organizationPublicId,
            },
            organization: {
              publicId: employeeInput.organizationPublicId,
              name: "Hangzhou Test Tobacco",
            },
          },
        },
      };
    },
  };
}

describe("phase 20 RA-01-04 employee import", () => {
  it("imports employee accounts from Excel-compatible CSV text without parser dependencies", async () => {
    const auditInputs: unknown[] = [];
    const serviceInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      employeeAccountService: createEmployeeAccountService({ serviceInputs }),
      repositories: createRepositories({ auditInputs }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "x-forwarded-for": "203.0.113.70, 10.0.0.1",
        },
        body: JSON.stringify({
          sourceFormat: "csv",
          content: [
            "phone,name,initialPassword,organizationPublicId",
            "13900001001,Employee One,abc12345,organization-public-001",
            "13900001002,Employee Two,def67890,organization-public-001",
          ].join("\n"),
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        importedEmployees: [
          {
            publicId: "employee-public-1001",
            userPublicId: "user-public-1001",
            phone: "13900001001",
            name: "Employee One",
            organizationPublicId: "organization-public-001",
            status: "active",
          },
          {
            publicId: "employee-public-1002",
            userPublicId: "user-public-1002",
            phone: "13900001002",
            name: "Employee Two",
            organizationPublicId: "organization-public-001",
            status: "active",
          },
        ],
        rejectedRows: [],
      },
    });
    expect(serviceInputs).toEqual([
      {
        phone: "13900001001",
        name: "Employee One",
        initialPassword: "abc12345",
        organizationPublicId: "organization-public-001",
      },
      {
        phone: "13900001002",
        name: "Employee Two",
        initialPassword: "def67890",
        organizationPublicId: "organization-public-001",
      },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "employee.import",
        actorRole: "ops_admin",
        targetResourceType: "employee",
        targetPublicId: null,
        resultStatus: "success",
        metadataSummary:
          "redacted employee import metadata; imported=2 rejected=0",
        requestIp: "203.0.113.70",
      }),
    ]);
    expect(JSON.stringify(auditInputs)).not.toContain("abc12345");
    expect(JSON.stringify(auditInputs)).not.toContain("def67890");
    expect(JSON.stringify(auditInputs)).not.toContain("admin-session-token");
  });

  it("returns per-row rejected results for duplicate and invalid CSV rows before creating accounts", async () => {
    const auditInputs: unknown[] = [];
    const serviceInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      employeeAccountService: createEmployeeAccountService({ serviceInputs }),
      repositories: createRepositories({ auditInputs }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          sourceFormat: "csv",
          content: [
            "phone,name,initialPassword,organizationPublicId",
            "13900001001,Employee One,abc12345,organization-public-001",
            "13900001001,Employee Duplicate,abc12345,organization-public-001",
            "not-phone,Employee Invalid,abc12345,organization-public-001",
          ].join("\n"),
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        importedEmployees: [],
        rejectedRows: [
          {
            rowNumber: 2,
            userPublicId: null,
            organizationPublicId: "organization-public-001",
            reason: "duplicate_phone",
          },
          {
            rowNumber: 3,
            userPublicId: null,
            organizationPublicId: "organization-public-001",
            reason: "duplicate_phone",
          },
          {
            rowNumber: 4,
            userPublicId: null,
            organizationPublicId: "organization-public-001",
            reason: "invalid_row",
          },
        ],
      },
    });
    expect(serviceInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "employee.import",
        resultStatus: "failed",
        metadataSummary:
          "redacted employee import metadata; imported=0 rejected=3",
      }),
    ]);
    expect(JSON.stringify(auditInputs)).not.toContain("abc12345");
  });

  it("rejects employee import CSV headers that include authorization scope fields", async () => {
    const auditInputs: unknown[] = [];
    const serviceInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      employeeAccountService: createEmployeeAccountService({ serviceInputs }),
      repositories: createRepositories({ auditInputs }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          sourceFormat: "csv",
          content: [
            "phone,name,initialPassword,organizationPublicId,profession,level,edition,orgAuthScopePublicId",
            "13900001001,Employee One,abc12345,organization-public-001,monopoly,3,advanced,scope-public-001",
          ].join("\n"),
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        importedEmployees: [],
        rejectedRows: [
          {
            rowNumber: 1,
            userPublicId: null,
            organizationPublicId: null,
            reason: "invalid_row",
          },
        ],
      },
    });
    expect(serviceInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "employee.import",
        resultStatus: "failed",
        metadataSummary:
          "redacted employee import metadata; imported=0 rejected=1",
      }),
    ]);
    expect(JSON.stringify(auditInputs)).not.toContain("scope-public-001");
    expect(JSON.stringify(auditInputs)).not.toContain("abc12345");
  });
});
