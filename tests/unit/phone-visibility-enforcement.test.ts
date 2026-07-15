import { describe, expect, it } from "vitest";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import { maskPhoneForDisplay } from "@/server/mappers/phone-display-mapper";
import type { AdminFlowRuntimeRepositories } from "@/server/repositories/admin-flow-runtime-repository";
import type { AdminOrganizationOrgAuthRuntimeRepositories } from "@/server/repositories/admin-organization-org-auth-runtime-repository";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import { createAdminOrganizationOrgAuthRuntimeRouteHandlers } from "@/server/services/admin-organization-org-auth-runtime";
import type { SessionService } from "@/server/services/session-service";

const sessionCredential = "phone-visibility-test-session";

function createSessionService(
  roles: AuthContextDto["user"]["adminRoles"],
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
      return {
        code: 0,
        message: "ok",
        data: {
          user: {
            publicId: "admin-user-public-001",
            phone: "已绑定手机号",
            name: "Operations Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: roles,
          },
          session: {
            expiresAt: "2026-07-12T23:00:00.000Z",
          },
        },
      };
    },
  };
}

function createAdminFlowRepositories(input: {
  onListUsers?: (keyword: string | null) => void;
  phone?: string | null;
  onAudit?: (metadata: {
    actionType: string;
    metadataSummary: string;
    resultStatus: string;
  }) => void;
}): AdminFlowRuntimeRepositories {
  const pagination = {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "updatedAt",
    sortOrder: "desc" as const,
  };
  const rawPhone = "13800000000";

  return {
    userOrgAuthRepository: {
      async listAdminAccounts() {
        return {
          adminAccounts: [
            {
              publicId: "admin-public-001",
              phone: rawPhone,
              name: "Operations Admin",
              adminRoles: ["ops_admin"],
              status: "active",
              registeredAt: "2026-07-12T23:00:00.000Z",
              updatedAt: "2026-07-12T23:00:00.000Z",
              accountDomain: "admin",
              organizations: [],
            },
          ],
          pagination,
        };
      },
      async listUsers(query) {
        input.onListUsers?.(query.keyword);

        return {
          users: [
            {
              publicId: "user-public-001",
              phone: rawPhone,
              name: "Visible User",
              registeredAt: "2026-07-12T23:00:00.000Z",
              status: "active",
              userType: "employee",
              organizationPublicId: "organization-public-001",
              organizationName: "Test Organization",
              authStatus: "active",
            },
          ],
          pagination,
        };
      },
      async getUserDetail() {
        return {
          user: {
            publicId: "user-public-001",
            phone: rawPhone,
            name: "Visible User",
            registeredAt: "2026-07-12T23:00:00.000Z",
            status: "active",
            userType: "employee",
            organizationPublicId: "organization-public-001",
            organizationName: "Test Organization",
            authStatus: "active",
          },
          enterpriseBinding: null,
          authorizations: [],
        };
      },
      async getUserPhoneForDisclosure() {
        return input.phone === undefined ? rawPhone : input.phone;
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        return { questions: [], pagination };
      },
      async listPapers() {
        return { papers: [], pagination };
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLog) {
        input.onAudit?.({
          actionType: auditLog.actionType,
          metadataSummary: auditLog.metadataSummary ?? "",
          resultStatus: auditLog.resultStatus,
        });
      },
      async listAuditLogs() {
        return { auditLogs: [], pagination };
      },
    },
  };
}

function createEmployeeRepositories(): AdminOrganizationOrgAuthRuntimeRepositories {
  const pagination = {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "registeredAt",
    sortOrder: "desc" as const,
  };

  return {
    async listOrganizations() {
      return { organizations: [], pagination };
    },
    async listOrgAuths() {
      return { orgAuths: [], pagination };
    },
    async listEmployees() {
      return {
        employees: [
          {
            publicId: "employee-public-001",
            userPublicId: "user-public-001",
            phone: "13900000000",
            name: "Employee User",
            organizationPublicId: "organization-public-001",
            status: "active",
          },
        ],
        pagination,
      };
    },
  };
}

describe("phone visibility enforcement", () => {
  it("returns a masked display value and never falls back to the raw value", () => {
    expect(maskPhoneForDisplay("13800000000")).toBe("138****0000");
    expect(maskPhoneForDisplay("138****0000")).toBe("138****0000");
    expect(maskPhoneForDisplay("not-a-phone")).toBe("已绑定手机号");
  });

  it("masks ordinary operations list and detail responses at the route boundary", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({}),
      sessionService: createSessionService(["ops_admin"]),
    });
    const request = new Request("http://localhost/api/v1/users", {
      headers: { authorization: `Bearer ${sessionCredential}` },
    });

    const [userResponse, detailResponse, adminResponse] = await Promise.all([
      handlers.users.collection.GET(request),
      handlers.users.detail.GET(request, {
        params: Promise.resolve({ publicId: "user-public-001" }),
      }),
      handlers.adminAccounts.collection.GET(request),
    ]);

    await expect(userResponse.json()).resolves.toMatchObject({
      code: 0,
      data: { users: [{ phone: "138****0000" }] },
    });
    await expect(detailResponse.json()).resolves.toMatchObject({
      code: 0,
      data: { user: { phone: "138****0000" } },
    });
    await expect(adminResponse.json()).resolves.toMatchObject({
      code: 0,
      data: { adminAccounts: [{ phone: "138****0000" }] },
    });
  });

  it("keeps exact phone search server-side while masking its response", async () => {
    let receivedKeyword: string | null = null;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        onListUsers: (keyword) => {
          receivedKeyword = keyword;
        },
      }),
      sessionService: createSessionService(["ops_admin"]),
    });

    const response = await handlers.users.collection.GET(
      new Request("http://localhost/api/v1/users?keyword=13800000000", {
        headers: { authorization: `Bearer ${sessionCredential}` },
      }),
    );

    expect(receivedKeyword).toBe("13800000000");
    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { users: [{ phone: "138****0000" }] },
    });
  });

  it("masks employee list responses even when a repository returns a raw phone", async () => {
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createEmployeeRepositories(),
      sessionService: createSessionService(["super_admin"]),
    });

    const response = await handlers.employees.collection.GET(
      new Request("http://localhost/api/v1/employees", {
        headers: { authorization: `Bearer ${sessionCredential}` },
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { employees: [{ phone: "139****0000" }] },
    });
  });

  it("returns a full phone only through a no-store reveal action and records redacted audits", async () => {
    const audits: {
      actionType: string;
      metadataSummary: string;
      resultStatus: string;
    }[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        onAudit: (auditLog) => audits.push(auditLog),
      }),
      sessionService: createSessionService(["ops_admin"]),
    });
    const context = {
      params: Promise.resolve({ publicId: "user-public-001" }),
    };
    const request = new Request(
      "http://localhost/api/v1/users/user-public-001/reveal-phone",
      {
        headers: { authorization: `Bearer ${sessionCredential}` },
        method: "POST",
      },
    );

    const revealResponse = await handlers.users.revealPhone.POST(
      request,
      context,
    );
    const copyResponse = await handlers.users.copyPhone.POST(request, context);

    expect(revealResponse.headers.get("cache-control")).toBe("no-store");
    expect(copyResponse.headers.get("cache-control")).toBe("no-store");
    await expect(revealResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: { phone: "13800000000" },
    });
    await expect(copyResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(audits).toEqual([
      expect.objectContaining({
        actionType: "user.phone_reveal",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actionType: "user.phone_copy",
        resultStatus: "success",
      }),
    ]);
    expect(JSON.stringify(audits)).not.toContain("13800000000");
  });

  it("fails closed for malformed, missing, and ineligible disclosures", async () => {
    const audits: { actionType: string; resultStatus: string }[] = [];
    const opsAdminHandlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        phone: null,
        onAudit: (auditLog) => audits.push(auditLog),
      }),
      sessionService: createSessionService(["ops_admin"]),
    });
    const contentAdminHandlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        onAudit: (auditLog) => audits.push(auditLog),
      }),
      sessionService: createSessionService(["content_admin"]),
    });
    const request = new Request("http://localhost/api/v1/users", {
      headers: { authorization: `Bearer ${sessionCredential}` },
      method: "POST",
    });

    const invalidResponse = await opsAdminHandlers.users.copyPhone.POST(
      request,
      { params: Promise.resolve({ publicId: "invalid public id" }) },
    );
    const missingResponse = await opsAdminHandlers.users.revealPhone.POST(
      request,
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );
    const deniedResponse = await contentAdminHandlers.users.revealPhone.POST(
      request,
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(invalidResponse.json()).resolves.toMatchObject({
      code: 422601,
      data: null,
    });
    await expect(missingResponse.json()).resolves.toMatchObject({
      code: 404601,
      data: null,
    });
    await expect(deniedResponse.json()).resolves.toMatchObject({
      code: 403601,
      data: null,
    });
    expect(invalidResponse.headers.get("cache-control")).toBe("no-store");
    expect(missingResponse.headers.get("cache-control")).toBe("no-store");
    expect(deniedResponse.headers.get("cache-control")).toBe("no-store");
    expect(audits).toEqual([
      expect.objectContaining({
        actionType: "user.phone_copy",
        resultStatus: "failed",
      }),
      expect.objectContaining({
        actionType: "user.phone_reveal",
        resultStatus: "failed",
      }),
      expect.objectContaining({
        actionType: "user.phone_reveal",
        resultStatus: "failed",
      }),
    ]);
  });

  it("does not disclose or audit when no authenticated actor exists", async () => {
    const audits: unknown[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        onAudit: (auditLog) => audits.push(auditLog),
      }),
      sessionService: {
        async getCurrentSession() {
          return {
            code: 401001,
            message: "Unauthorized.",
            data: null,
          };
        },
      },
    });

    const response = await handlers.users.revealPhone.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reveal-phone",
        {
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      code: 401001,
      data: null,
    });
    expect(audits).toEqual([]);
  });
});
