import { describe, expect, it } from "vitest";

import { SESSION_COOKIE_NAME } from "../auth/session-cookie";
import type { ApiResponse } from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { AdminAuthOperationListQuery } from "../contracts/admin-user-org-auth-ops-contract";
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
