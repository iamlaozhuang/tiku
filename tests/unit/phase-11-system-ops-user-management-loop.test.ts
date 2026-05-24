import { describe, expect, it } from "vitest";

import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { AdminFlowRuntimeRepositories } from "@/server/services/admin-flow-runtime";
import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { SessionService } from "@/server/services/session-service";

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
          session: { expiresAt: "2026-05-24T14:10:00.000Z" },
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

function createAdminFlowRepositories(input: {
  auditInputs: unknown[];
  mutationInputs: unknown[];
}): AdminFlowRuntimeRepositories {
  return {
    userOrgAuthRepository: {
      async listUsers(query) {
        return {
          users: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
      async resetUserPassword() {
        throw new Error("resetUserPassword is not used by this test");
      },
      async disableUser(publicId) {
        input.mutationInputs.push({ action: "disableUser", publicId });
        return publicId === "user-public-001";
      },
      async enableUser(publicId) {
        input.mutationInputs.push({ action: "enableUser", publicId });
        return publicId === "user-public-001";
      },
      async revokeUserSessions(publicId) {
        input.mutationInputs.push({ action: "revokeUserSessions", publicId });
        return publicId === "user-public-001";
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        throw new Error("not used");
      },
      async listPapers() {
        throw new Error("not used");
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
      async listAuditLogs(query) {
        return {
          auditLogs: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
    },
  };
}

function createEnterpriseRepositories(input: {
  auditInputs: unknown[];
  employeeMutationInputs: unknown[];
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
    async createEmployee(employeeInput) {
      input.employeeMutationInputs.push({
        action: "createEmployee",
        employeeInput,
      });

      return {
        publicId: "employee-public-001",
        userPublicId: "user-public-001",
        phone: "13900000002",
        name: "Employee User",
        organizationPublicId: employeeInput.organizationPublicId,
        status: "active",
      };
    },
    async disableEmployee(publicId) {
      input.employeeMutationInputs.push({
        action: "disableEmployee",
        publicId,
      });

      return publicId === "employee-public-001";
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
    },
  };
}

describe("phase 11 system ops user management loop", () => {
  it("disables and enables users by publicId, revokes sessions, and writes redacted audit logs", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        auditInputs,
        mutationInputs,
      }),
      sessionService: createAdminSessionService("super_admin"),
    });
    const headers = {
      authorization: "Bearer admin-session-token",
      "x-forwarded-for": "203.0.113.20, 10.0.0.1",
    };

    const disableResponse = await handlers.users.disable.POST(
      new Request("http://localhost/api/v1/users/user-public-001/disable", {
        method: "POST",
        headers,
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );
    const enableResponse = await handlers.users.enable.POST(
      new Request("http://localhost/api/v1/users/user-public-001/enable", {
        method: "POST",
        headers,
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(disableResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    await expect(enableResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(mutationInputs).toEqual([
      { action: "disableUser", publicId: "user-public-001" },
      { action: "revokeUserSessions", publicId: "user-public-001" },
      { action: "enableUser", publicId: "user-public-001" },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "user.disable",
        targetResourceType: "user",
        targetPublicId: "user-public-001",
        resultStatus: "success",
        metadataSummary: "redacted user disable metadata",
        requestIp: "203.0.113.20",
      }),
      expect.objectContaining({
        actionType: "user.enable",
        targetResourceType: "user",
        targetPublicId: "user-public-001",
        resultStatus: "success",
        metadataSummary: "redacted user enable metadata",
        requestIp: "203.0.113.20",
      }),
    ]);
    expect(JSON.stringify(auditInputs)).not.toContain("admin-session-token");
  });

  it("denies user lifecycle mutation for non-super admins without touching users", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        auditInputs,
        mutationInputs,
      }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.users.disable.POST(
      new Request("http://localhost/api/v1/users/user-public-001/disable", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(mutationInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "user.disable",
        resultStatus: "failed",
        metadataSummary: "redacted user lifecycle permission denial metadata",
      }),
    ]);
  });

  it("creates and disables employees with public identifiers and redacted audit metadata", async () => {
    const auditInputs: unknown[] = [];
    const employeeMutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createEnterpriseRepositories({
        auditInputs,
        employeeMutationInputs,
      }),
      sessionService: createAdminSessionService("super_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const createResponse = await handlers.employees.collection.POST(
      new Request("http://localhost/api/v1/employees", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userPublicId: "user-public-001",
          organizationPublicId: "organization-public-001",
        }),
      }),
    );
    const disableResponse = await handlers.employees.disable.POST(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/disable",
        {
          method: "POST",
          headers,
        },
      ),
      { params: Promise.resolve({ publicId: "employee-public-001" }) },
    );

    await expect(createResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        employee: {
          publicId: "employee-public-001",
          userPublicId: "user-public-001",
          organizationPublicId: "organization-public-001",
          status: "active",
        },
      },
    });
    await expect(disableResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(employeeMutationInputs).toEqual([
      {
        action: "createEmployee",
        employeeInput: {
          userPublicId: "user-public-001",
          organizationPublicId: "organization-public-001",
        },
      },
      { action: "disableEmployee", publicId: "employee-public-001" },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "employee.create",
        targetResourceType: "employee",
        targetPublicId: "employee-public-001",
        resultStatus: "success",
        metadataSummary: "redacted employee create metadata",
      }),
      expect.objectContaining({
        actionType: "employee.disable",
        targetResourceType: "employee",
        targetPublicId: "employee-public-001",
        resultStatus: "success",
        metadataSummary: "redacted employee disable metadata",
      }),
    ]);
    expect(
      JSON.stringify({ auditInputs, employeeMutationInputs }),
    ).not.toContain("admin-session-token");
  });
});
