import { describe, expect, it } from "vitest";

import { SESSION_COOKIE_NAME } from "../auth/session-cookie";
import type { ApiResponse } from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import type {
  AdminAccountListQuery,
  AdminAuthOperationListQuery,
} from "../contracts/admin-user-org-auth-ops-contract";
import type { AdminRole } from "../models/auth";
import type { AdminFlowRuntimeRepositories } from "../repositories/admin-flow-runtime-repository";
import type { AuthRequestInput } from "./auth-service";
import { createAdminFlowRuntimeRouteHandlers } from "./admin-flow-runtime";

const testSessionCredential = "admin_flow_test_session";
const expectedAuthorization = `Bearer ${testSessionCredential}`;

function createTestAdminContext(
  adminRoles: AuthContextDto["user"]["adminRoles"] = ["content_admin"],
): AuthContextDto {
  return {
    user: {
      publicId: "test_user_public_id",
      phone: "redacted-test-phone",
      name: "Content Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "test_admin_public_id",
      adminRoles,
    },
    session: {
      expiresAt: "2026-07-04T21:00:00.000Z",
    },
  };
}

function createTestRepositories(
  onListPapers: () => void = () => undefined,
  onListUsers: (query: AdminAuthOperationListQuery) => void = () => undefined,
  onListAdminAccounts: (
    query: AdminAccountListQuery,
    visibleAdminRoles: readonly AdminRole[],
  ) => void = () => undefined,
): AdminFlowRuntimeRepositories {
  const pagination = {
    page: 1,
    pageSize: 20,
    total: 0,
    sortBy: "updatedAt",
    sortOrder: "desc" as const,
  };

  return {
    userOrgAuthRepository: {
      async listAdminAccounts(query, visibleAdminRoles) {
        onListAdminAccounts(query, visibleAdminRoles);

        return {
          adminAccounts: [],
          pagination,
        };
      },
      async listUsers(query) {
        onListUsers(query);

        return {
          users: [],
          pagination,
        };
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        return {
          questions: [],
          pagination,
        };
      },
      async listPapers() {
        onListPapers();

        return {
          papers: [],
          pagination,
        };
      },
    },
    auditLogRepository: {
      async appendAuditLog() {
        return undefined;
      },
      async listAuditLogs() {
        return {
          auditLogs: [],
          pagination,
        };
      },
    },
  };
}

describe("createAdminFlowRuntimeRouteHandlers", () => {
  it("lists backend accounts with validated filters and super-admin visibility", async () => {
    let observedQuery: AdminAccountListQuery | null = null;
    let observedVisibleRoles: readonly AdminRole[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createTestRepositories(
        () => undefined,
        () => undefined,
        (query, visibleRoles) => {
          observedQuery = query;
          observedVisibleRoles = visibleRoles;
        },
      ),
      sessionService: {
        async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["super_admin"]),
          };
        },
      },
    });

    const response = await handlers.adminAccounts.collection.GET(
      new Request(
        "http://localhost/api/v1/admin-accounts?page=2&pageSize=50&sortBy=registeredAt&sortOrder=asc&keyword=%20manager%20&adminRole=content_admin&status=disabled&organizationPublicId=organization-public-001",
        {
          headers: {
            cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
          },
        },
      ),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { adminAccounts: [] },
      pagination: { page: 1, pageSize: 20, total: 0 },
    });
    expect(observedQuery).toEqual({
      page: 2,
      pageSize: 50,
      sortBy: "registeredAt",
      sortOrder: "asc",
      keyword: "manager",
      adminRole: "content_admin",
      status: "disabled",
      organizationPublicId: "organization-public-001",
    });
    expect(observedVisibleRoles).toEqual([
      "super_admin",
      "ops_admin",
      "content_admin",
      "org_standard_admin",
      "org_advanced_admin",
    ]);
  });

  it("crops operations-admin backend account visibility before repository access", async () => {
    let observedVisibleRoles: readonly AdminRole[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createTestRepositories(
        () => undefined,
        () => undefined,
        (_query, visibleRoles) => {
          observedVisibleRoles = visibleRoles;
        },
      ),
      sessionService: {
        async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["ops_admin"]),
          };
        },
      },
    });

    await handlers.adminAccounts.collection.GET(
      new Request(
        "http://localhost/api/v1/admin-accounts?adminRole=super_admin",
        {
          headers: {
            cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
          },
        },
      ),
    );

    expect(observedVisibleRoles).toEqual([
      "org_standard_admin",
      "org_advanced_admin",
    ]);
    expect(observedVisibleRoles).not.toContain("super_admin");
    expect(observedVisibleRoles).not.toContain("ops_admin");
    expect(observedVisibleRoles).not.toContain("content_admin");
  });

  it("denies backend account reads to content administrators", async () => {
    let repositoryCallCount = 0;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createTestRepositories(
        () => undefined,
        () => undefined,
        () => {
          repositoryCallCount += 1;
        },
      ),
      sessionService: {
        async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["content_admin"]),
          };
        },
      },
    });

    const response = await handlers.adminAccounts.collection.GET(
      new Request("http://localhost/api/v1/admin-accounts", {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(repositoryCallCount).toBe(0);
  });

  it("forwards user filters, normalized keyword, and registration ordering", async () => {
    let observedQuery: AdminAuthOperationListQuery | null = null;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createTestRepositories(
        () => undefined,
        (query) => {
          observedQuery = query;
        },
      ),
      sessionService: {
        async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["ops_admin"]),
          };
        },
      },
    });

    const response = await handlers.users.collection.GET(
      new Request(
        "http://localhost/api/v1/users?page=3&pageSize=50&sortBy=registeredAt&sortOrder=asc&status=disabled&userType=employee&userCategory=disabled&authFilter=expired&keyword=%20target%20",
        {
          headers: {
            cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
          },
        },
      ),
    );

    expect(response.status).toBe(200);
    expect(observedQuery).toEqual({
      page: 3,
      pageSize: 50,
      sortBy: "registeredAt",
      sortOrder: "asc",
      keyword: "target",
      status: "disabled",
      userType: "employee",
      userCategory: "disabled",
      authFilter: "expired",
    });
  });

  it("uses the cookie-backed admin session for paper collection reads", async () => {
    let observedAuthorization: string | null | undefined;
    let paperListCallCount = 0;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createTestRepositories(() => {
        paperListCallCount += 1;
      }),
      sessionService: {
        async getCurrentSession(
          input: AuthRequestInput,
        ): Promise<ApiResponse<AuthContextDto | null>> {
          observedAuthorization = input.authorization ?? null;

          return input.authorization === expectedAuthorization
            ? {
                code: 0,
                message: "ok",
                data: createTestAdminContext(),
              }
            : {
                code: 401001,
                message: "Unauthorized.",
                data: null,
              };
        },
      },
    });

    const response = await handlers.papers.collection.GET(
      new Request("http://localhost/api/v1/papers", {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        papers: [],
      },
      pagination: {
        page: 1,
        pageSize: 20,
        sortBy: "updatedAt",
        sortOrder: "desc",
        total: 0,
      },
    });
    expect(observedAuthorization).toBe(expectedAuthorization);
    expect(paperListCallCount).toBe(1);
  });

  it("keeps paper collection reads denied when no session material exists", async () => {
    let observedAuthorization: string | null | undefined;
    let paperListCallCount = 0;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createTestRepositories(() => {
        paperListCallCount += 1;
      }),
      sessionService: {
        async getCurrentSession(
          input: AuthRequestInput,
        ): Promise<ApiResponse<AuthContextDto | null>> {
          observedAuthorization = input.authorization ?? null;

          return {
            code: 401001,
            message: "Unauthorized.",
            data: null,
          };
        },
      },
    });

    const response = await handlers.papers.collection.GET(
      new Request("http://localhost/api/v1/papers"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
    expect(observedAuthorization).toBeNull();
    expect(paperListCallCount).toBe(0);
  });

  it("denies paper collection reads for operations admins", async () => {
    let paperListCallCount = 0;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createTestRepositories(() => {
        paperListCallCount += 1;
      }),
      sessionService: {
        async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["ops_admin"]),
          };
        },
      },
    });

    const response = await handlers.papers.collection.GET(
      new Request("http://localhost/api/v1/papers", {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
    expect(paperListCallCount).toBe(0);
  });

  it("returns a multi-role backend account detail to a super administrator", async () => {
    const repositories = createTestRepositories();
    repositories.userOrgAuthRepository.getAdminAccountDetail = async () => ({
      adminAccount: {
        accountDomain: "admin",
        adminRoles: ["content_admin", "org_advanced_admin"],
        name: "区域内容管理员",
        organizations: [
          {
            name: "示例组织",
            publicId: "organization-public-001",
          },
        ],
        phone: "13900000008",
        publicId: "admin-public-008",
        registeredAt: "2026-07-14T19:00:00.000Z",
        status: "active",
        updatedAt: "2026-07-14T20:00:00.000Z",
      },
    });
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories,
      sessionService: {
        async getCurrentSession() {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["super_admin"]),
          };
        },
      },
    });
    const adminAccountHandlers = handlers.adminAccounts as unknown as {
      detail: {
        GET(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response>;
      };
    };

    const response = await adminAccountHandlers.detail.GET(
      new Request("http://localhost/api/v1/admin-accounts/admin-public-008", {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
        },
      }),
      { params: Promise.resolve({ publicId: "admin-public-008" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        adminAccount: {
          adminRoles: ["content_admin", "org_advanced_admin"],
          phone: "139****0008",
          publicId: "admin-public-008",
        },
      },
    });
  });

  it("returns a one-time password with no-store after an atomic admin reset", async () => {
    const observedInputs: unknown[] = [];
    const repositories = createTestRepositories();
    repositories.userOrgAuthRepository.resetAdminAccountPassword = async (
      input,
    ) => {
      observedInputs.push(input);

      return {
        status: "updated",
        adminAccount: {
          accountDomain: "admin",
          adminRoles: ["content_admin"],
          name: "内容管理员",
          organizations: [],
          phone: "139****0008",
          publicId: "admin-public-008",
          registeredAt: "2026-07-14T19:00:00.000Z",
          status: "active",
          updatedAt: "2026-07-14T20:00:00.000Z",
        },
      };
    };
    const handlers = createAdminFlowRuntimeRouteHandlers({
      createOneTimePassword: () => "TemporaryA123456",
      repositories,
      sessionService: {
        async getCurrentSession() {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["super_admin"]),
          };
        },
      },
    } as never);
    const adminAccountHandlers = handlers.adminAccounts as unknown as {
      resetPassword: {
        POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response>;
      };
    };

    const response = await adminAccountHandlers.resetPassword.POST(
      new Request(
        "http://localhost/api/v1/admin-accounts/admin-public-008/reset-password",
        {
          method: "POST",
          headers: {
            cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
          },
        },
      ),
      { params: Promise.resolve({ publicId: "admin-public-008" }) },
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        adminAccountPublicId: "admin-public-008",
        oneTimePasswordPlainText: "TemporaryA123456",
        distributionWindow: {
          visibleOnce: true,
          sessionRevocation: "revoked_active_sessions",
        },
      },
    });
    expect(observedInputs).toEqual([
      expect.objectContaining({
        newPassword: "TemporaryA123456",
        publicId: "admin-public-008",
      }),
    ]);
  });

  it("keeps operations admins denied when a target has any platform role", async () => {
    const auditedActions: string[] = [];
    const repositories = createTestRepositories();
    repositories.userOrgAuthRepository.updateAdminAccount = async () => ({
      status: "forbidden",
    });
    repositories.auditLogRepository.appendAuditLog = async (input) => {
      auditedActions.push(input.actionType);
    };
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories,
      sessionService: {
        async getCurrentSession() {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["ops_admin"]),
          };
        },
      },
    });

    const response = await handlers.adminAccounts.detail.PATCH(
      new Request("http://localhost/api/v1/admin-accounts/admin-public-008", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
        },
        body: JSON.stringify({
          name: "Mixed Role Target",
          adminRoles: ["org_standard_admin"],
          organizationPublicId: "organization-public-001",
          expectedUpdatedAt: "2026-07-14T20:00:00.000Z",
        }),
      }),
      { params: Promise.resolve({ publicId: "admin-public-008" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(auditedActions).toEqual(["admin_account.update"]);
  });

  it("reports a conflict instead of disabling the last active super administrator", async () => {
    const repositories = createTestRepositories();
    repositories.userOrgAuthRepository.setAdminAccountStatus = async () => ({
      status: "conflict",
      reason: "last_active_super_admin",
    });
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories,
      sessionService: {
        async getCurrentSession() {
          return {
            code: 0,
            message: "ok",
            data: createTestAdminContext(["super_admin"]),
          };
        },
      },
    });

    const response = await handlers.adminAccounts.disable.POST(
      new Request(
        "http://localhost/api/v1/admin-accounts/admin-public-001/disable",
        {
          method: "POST",
          headers: {
            cookie: `${SESSION_COOKIE_NAME}=${testSessionCredential}`,
          },
        },
      ),
      { params: Promise.resolve({ publicId: "admin-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 409601,
      message: "The last active super administrator must be preserved.",
      data: { reason: "last_active_super_admin" },
    });
  });
});
