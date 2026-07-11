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
        "http://localhost/api/v1/users?page=3&pageSize=50&sortBy=registeredAt&sortOrder=asc&status=disabled&userType=employee&keyword=%20target%20",
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
      userCategory: "all",
      authFilter: "all",
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
});
