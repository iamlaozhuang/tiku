import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchAdminApi,
  getStoredSessionToken,
} from "@/features/admin/content-admin-runtime";
import { getRequestAuthorization } from "@/server/auth/session-cookie";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import { createContentQuestionMaterialRuntimeRouteHandlers } from "@/server/services/content-question-material-runtime";
import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";
import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";

const cookieBackedSessionToken = "__cookie_backed_session__";
const testCookieCredential = "cookie-session-for-unit-test";
const expectedCookieAuthorization = `Bearer ${testCookieCredential}`;

const adminSessionPayload: ApiResponse<AuthContextDto> = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-cookie-unit",
      phone: "13900000000",
      name: "Cookie Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-cookie-unit",
      adminRoles: ["content_admin"],
    },
    session: {
      expiresAt: "2026-06-15T12:00:00.000Z",
    },
  },
};

const unauthorizedPayload: ApiResponse<null> = {
  code: 401001,
  message: "Admin session is required.",
  data: null,
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function expectFetchRequestWithAuthorization(
  fetchMock: ReturnType<typeof vi.fn>,
  path: string,
  authorization: string,
) {
  const matchedCall = fetchMock.mock.calls.find(
    ([requestUrl]) => String(requestUrl) === path,
  );

  expect(matchedCall).toBeDefined();
  expect(matchedCall?.[1]).toEqual(
    expect.objectContaining({
      credentials: "same-origin",
    }),
  );
  expect(new Headers(matchedCall?.[1]?.headers).get("authorization")).toBe(
    authorization,
  );
}

function createCookieRequest(path: string) {
  return new Request(`http://localhost${path}`, {
    headers: {
      authorization: `Bearer ${cookieBackedSessionToken}`,
      cookie: `tiku_session=${encodeURIComponent(testCookieCredential)}`,
    },
  });
}

function createRawCookieRequest(path: string) {
  return new Request(`http://localhost${path}`, {
    headers: {
      cookie: `tiku_session=${encodeURIComponent(testCookieCredential)}`,
    },
  });
}

function createCookieBackedSessionService() {
  return {
    getCurrentSession: vi.fn(async (input: { authorization: string | null }) =>
      input.authorization === expectedCookieAuthorization
        ? adminSessionPayload
        : unauthorizedPayload,
    ),
  };
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("Phase 22 content admin cookie-backed session repair", () => {
  it("uses an explicit cookie-backed marker when no local bearer token exists", async () => {
    localStorage.removeItem("tiku.localSessionToken");
    const fetchMock = vi.fn(async () =>
      createJsonResponse(adminSessionPayload),
    );
    vi.stubGlobal("fetch", fetchMock);

    const sessionToken = getStoredSessionToken();
    const response = await fetchAdminApi("/api/v1/sessions", sessionToken);

    expect(response.code).toBe(0);
    expect(sessionToken).toBe(cookieBackedSessionToken);
    expectFetchRequestWithAuthorization(
      fetchMock,
      "/api/v1/sessions",
      `Bearer ${cookieBackedSessionToken}`,
    );
  });

  it("keeps bearer authorization when a local bearer token exists", async () => {
    localStorage.setItem("tiku.localSessionToken", "local-bearer-token");
    const fetchMock = vi.fn(async () =>
      createJsonResponse(adminSessionPayload),
    );
    vi.stubGlobal("fetch", fetchMock);

    const sessionToken = getStoredSessionToken();
    await fetchAdminApi("/api/v1/sessions", sessionToken);

    expectFetchRequestWithAuthorization(
      fetchMock,
      "/api/v1/sessions",
      "Bearer local-bearer-token",
    );
  });

  it("resolves cookie-backed marker headers through the session cookie", () => {
    const request = new Request("http://localhost/api/v1/sessions", {
      headers: {
        authorization: `Bearer ${cookieBackedSessionToken}`,
        cookie: `tiku_session=${encodeURIComponent(testCookieCredential)}`,
      },
    });

    expect(getRequestAuthorization(request)).toBe(expectedCookieAuthorization);
  });

  it("keeps raw cookie-only session checks compatible with route guards", () => {
    expect(
      getRequestAuthorization(createRawCookieRequest("/api/v1/sessions")),
    ).toBe(expectedCookieAuthorization);
  });

  it("resolves question/material runtime admin actors from session cookies", async () => {
    const sessionService = createCookieBackedSessionService();
    const listQuestions = vi.fn(async () => ({ rows: [], total: 0 }));
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: {
        auditLogRepository: { appendAuditLog: vi.fn() },
        knowledgeNodeRepository: {},
        materialRepository: {},
        questionRepository: { listQuestions },
      } as never,
      sessionService,
    });

    const response = await handlers.questions.collection.GET(
      createCookieRequest("/api/v1/questions"),
    );
    const payload = (await response.json()) as { code: number };

    expect(payload.code).toBe(0);
    expect(sessionService.getCurrentSession).toHaveBeenCalledWith({
      authorization: expectedCookieAuthorization,
    });
    expect(listQuestions).toHaveBeenCalled();
  });

  it("resolves paper runtime admin actors from session cookies", async () => {
    const sessionService = createCookieBackedSessionService();
    const listPapers = vi.fn(async () => ({ rows: [], total: 0 }));
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: {
        auditLogRepository: { appendAuditLog: vi.fn() },
        paperAssetRepository: {},
        paperRepository: { listPapers },
      } as never,
      sessionService,
    });

    const response = await handlers.papers.collection.GET(
      createCookieRequest("/api/v1/papers"),
    );
    const payload = (await response.json()) as { code: number };

    expect(payload.code).toBe(0);
    expect(sessionService.getCurrentSession).toHaveBeenCalledWith({
      authorization: expectedCookieAuthorization,
    });
    expect(listPapers).toHaveBeenCalled();
  });

  it("resolves admin-flow paper list actors from session cookies", async () => {
    const sessionService = createCookieBackedSessionService();
    const listPapers = vi.fn(async () => ({
      papers: [],
      pagination: {
        page: 1,
        pageSize: 20,
        sortBy: "updatedAt",
        sortOrder: "desc",
        total: 0,
      },
    }));
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: {
        aiAuditLogRepository: {},
        auditLogRepository: {},
        contentKnowledgeRepository: { listPapers },
        userOrgAuthRepository: {},
      } as never,
      sessionService,
    });

    const response = await handlers.papers.collection.GET(
      createCookieRequest("/api/v1/papers"),
    );
    const payload = (await response.json()) as { code: number };

    expect(payload.code).toBe(0);
    expect(sessionService.getCurrentSession).toHaveBeenCalledWith({
      authorization: expectedCookieAuthorization,
    });
    expect(listPapers).toHaveBeenCalled();
  });

  it("authenticates raw cookie-only admin-flow user reads before enforcing role permissions", async () => {
    const sessionService = createCookieBackedSessionService();
    const listUsers = vi.fn(async () => ({
      pagination: {
        page: 1,
        pageSize: 20,
        sortBy: "updatedAt",
        sortOrder: "desc",
        total: 0,
      },
      users: [],
    }));
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: {
        aiAuditLogRepository: {},
        auditLogRepository: {},
        contentKnowledgeRepository: {},
        userOrgAuthRepository: {
          listUsers,
        },
      } as never,
      sessionService,
    });

    const response = await handlers.users.collection.GET(
      createRawCookieRequest("/api/v1/users"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      data: null,
      message: "Admin permission denied.",
    });
    expect(sessionService.getCurrentSession).toHaveBeenCalledWith({
      authorization: expectedCookieAuthorization,
    });
    expect(listUsers).not.toHaveBeenCalled();
  });

  it("resolves resource/knowledge runtime admin actors from session cookies", async () => {
    const sessionService = createCookieBackedSessionService();
    const listKnowledgeNodes = vi.fn(async () => ({
      knowledgeNodes: [],
      pagination: {
        page: 1,
        pageSize: 20,
        sortBy: "updatedAt",
        sortOrder: "desc",
        total: 0,
      },
    }));
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: {
        auditLogRepository: { appendAuditLog: vi.fn() },
        knowledgeNodeRepository: { listKnowledgeNodes },
        resourceRepository: {},
      } as never,
      sessionService,
    });

    const response = await handlers.knowledgeNodes.collection.GET(
      createCookieRequest("/api/v1/knowledge-nodes"),
    );
    const payload = (await response.json()) as { code: number };

    expect(payload.code).toBe(0);
    expect(sessionService.getCurrentSession).toHaveBeenCalledWith({
      authorization: expectedCookieAuthorization,
    });
    expect(listKnowledgeNodes).toHaveBeenCalled();
  });
});
