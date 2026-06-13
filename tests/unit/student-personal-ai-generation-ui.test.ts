import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StudentPersonalAiGenerationPage } from "@/features/student/ai-generation/StudentPersonalAiGenerationPage";

const pageTitle = "\u4e2a\u4eba AI \u5b66\u4e60";
const requestButtonLabel = "\u53d1\u8d77\u672c\u5730 AI \u8bf7\u6c42";
const blockedTitle = "\u8bf7\u6c42\u5df2\u963b\u65ad";
const unauthorizedTitle = "\u8bf7\u5148\u767b\u5f55";
const historyTitle = "\u8fd1\u671f AI \u8bf7\u6c42\u5386\u53f2";
const historyEmptyTitle = "\u6682\u65e0\u5386\u53f2\u8bf7\u6c42";
const historyErrorTitle = "\u5386\u53f2\u8bf7\u6c42\u6682\u4e0d\u53ef\u7528";
const localSessionUserPublicId = "user-dev-student";

const serverHistoryResponse = {
  code: 0,
  message: "ok",
  data: [
    {
      requestPublicId: "personal-ai-request-public-initial-001",
      taskPublicId: "ai-generation-task-public-initial-001",
      status: "succeeded",
      requestedAt: "2026-06-12T10:00:00.000Z",
      resultPublicId: "ai-result-public-initial-001",
      evidenceStatus: "sufficient",
      citationCount: 1,
      aiCallLogPublicId: "ai-call-log-public-initial-001",
      redactionStatus: "redacted",
    },
  ],
};

const serverHistoryAfterSubmitResponse = {
  code: 0,
  message: "ok",
  data: [
    {
      requestPublicId: "personal-ai-request-public-server-after-submit-001",
      taskPublicId: "ai-generation-task-public-server-after-submit-001",
      status: "pending",
      requestedAt: "2026-06-12T12:30:00.000Z",
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      redactionStatus: "redacted",
    },
  ],
};

const emptyServerHistoryResponse = {
  code: 0,
  message: "ok",
  data: [],
};

const localExperienceResponse = {
  code: 0,
  message: "ok",
  data: {
    runtimeStatus: "local_contract_only",
    experienceSurface: "student_local_browser",
    flowStatus: "accepted",
    redactionStatus: "redacted",
    requestState: {
      status: "ready",
      selectedContext: {
        contextType: "paper",
        contextPublicId: "paper-public-001",
      },
      action: {
        actionType: "submit_personal_ai_generation_request",
        isEnabled: true,
        disabledReason: null,
      },
    },
    resultState: {
      status: "pending",
      taskPublicId: "ai-generation-task-public-001",
      resultPublicId: null,
      contentVisibility: "summary_only",
      evidenceStatus: "none",
      citationCount: 0,
      redactionStatus: "redacted",
    },
    stateCoverage: {
      loadingState: "supported",
      emptyState: "supported",
      errorState: "supported",
      permissionBlockedState: "supported",
    },
    requestFlow: {
      runtimeStatus: "local_contract_only",
      flowStatus: "accepted",
      redactionStatus: "redacted",
      request: {
        userPublicId: "student-public-001",
        authorizationPublicId: "personal-auth-public-001",
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        generationContext: {
          questionPublicId: "question-public-001",
          answerRecordPublicId: "answer-record-public-001",
          paperPublicId: "paper-public-001",
          mockExamPublicId: null,
          selectedContext: {
            contextType: "paper",
            contextPublicId: "paper-public-001",
          },
        },
        redeemCodeReference: {
          publicId: null,
          redactionStatus: "redacted",
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
        },
      },
      contextSelection: {
        userPublicId: "student-public-001",
        authorizationBoundary: {
          authorizationSource: "personal_auth",
          authorizationPublicId: "personal-auth-public-001",
          ownerType: "personal",
          quotaOwnerType: "personal",
        },
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        selectedContext: {
          contextType: "paper",
          contextPublicId: "paper-public-001",
        },
        redactionStatus: "redacted",
      },
      taskRequest: {
        runtimeStatus: "local_contract_only",
        requestDecision: "create_new_task",
        rejectionReason: null,
        idempotencyKeyHash: "sha256:student-local-request",
        taskPublicId: "ai-generation-task-public-001",
        existingTaskPublicId: null,
        quotaReservation: {
          isReserved: true,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: "student-public-001",
        },
        redactionStatus: "redacted",
      },
      resultReference: {
        runtimeStatus: "local_contract_only",
        taskPublicId: "ai-generation-task-public-001",
        taskType: "ai_question_generation",
        status: "pending",
        failureCategory: null,
        resultReference: {
          resultPublicId: null,
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          redactionStatus: "redacted",
        },
        aiCallLogReference: {
          aiCallLogPublicId: null,
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
      },
    },
  },
};

const localSessionResponse = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: localSessionUserPublicId,
      phone: "13900000002",
      name: "Local Student",
      userType: "personal",
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: null,
      adminRoles: [],
    },
    session: {
      expiresAt: "2026-06-19T12:00:00.000Z",
    },
  },
};

function createPersonalAiGenerationFetchMock(
  experienceResponse: unknown = localExperienceResponse,
  historyResponse: unknown = emptyServerHistoryResponse,
) {
  return vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => localSessionResponse,
      };
    }

    if (path === "/api/v1/personal-ai-generation-requests") {
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      if (init?.method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => historyResponse,
        };
      }

      expect(init?.method).toBe("POST");

      return {
        ok: true,
        status: 200,
        json: async () => experienceResponse,
      };
    }

    throw new Error(`Unexpected fetch path: ${path}`);
  });
}

function createPersonalAiGenerationFetchMockWithHistorySequence(
  historyResponses: unknown[],
  experienceResponse: unknown = localExperienceResponse,
) {
  const remainingHistoryResponses = [...historyResponses];

  return vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => localSessionResponse,
      };
    }

    if (path === "/api/v1/personal-ai-generation-requests") {
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      if (init?.method === "GET") {
        const historyResponse =
          remainingHistoryResponses.shift() ?? emptyServerHistoryResponse;

        return {
          ok: true,
          status: 200,
          json: async () => historyResponse,
        };
      }

      expect(init?.method).toBe("POST");

      return {
        ok: true,
        status: 200,
        json: async () => experienceResponse,
      };
    }

    throw new Error(`Unexpected fetch path: ${path}`);
  });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("StudentPersonalAiGenerationPage", () => {
  it("loads redacted request history from the server on initial render when a student session token exists", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/personal-ai-generation-requests");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        return {
          ok: true,
          status: 200,
          json: async () => serverHistoryResponse,
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      await screen.findByText("personal-ai-request-public-initial-001"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ai-generation-task-public-initial-001"),
    ).toBeInTheDocument();
    expect(screen.getByText("2026-06-12T10:00:00.000Z")).toBeInTheDocument();
    expect(
      screen.getByText("ai-result-public-initial-001"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ai-call-log-public-initial-001"),
    ).toBeInTheDocument();
    expect(screen.getByText("sufficient")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("posts a session-aligned camelCase public-id payload to the local route contract without rendering the session token", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/personal-ai-generation-requests") {
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
            "content-type": "application/json",
          });

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url) === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      screen.getByRole("heading", { name: pageTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("\u5c1a\u672a\u63d0\u4ea4\u672c\u5730\u8bf7\u6c42"),
    ).toBeInTheDocument();
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("local_contract_only")).toBeInTheDocument();
    expect(screen.getByText("student_local_browser")).toBeInTheDocument();
    expect(screen.getByText("accepted")).toBeInTheDocument();
    expect(screen.getByText("paper-public-001")).toBeInTheDocument();
    expect(screen.getAllByText("pending").length).toBeGreaterThan(0);
    expect(screen.getByText("summary_only")).toBeInTheDocument();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests",
    );
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe("/api/v1/sessions");
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests",
    );
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe("POST");
    expect(String(fetchMock.mock.calls[3]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests",
    );
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe("GET");

    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[2]?.[1]?.body),
    ) as Record<string, unknown>;

    expect(requestBody).toEqual({
      responseMode: "local_browser_experience",
      userPublicId: localSessionUserPublicId,
      requestPublicId: "personal-ai-request-public-001",
      authorizationPublicId: "personal-auth-public-001",
      aiFuncType: "explanation",
      questionPublicId: "question-public-001",
      answerRecordPublicId: "answer-record-public-001",
      paperPublicId: "paper-public-001",
      mockExamPublicId: null,
      redeemCodePublicId: null,
      auditLogPublicId: null,
      aiCallLogPublicId: null,
      taskPublicId: "ai-generation-task-public-001",
      taskType: "ai_question_generation",
      actorPublicId: localSessionUserPublicId,
      authorizationSource: "personal_auth",
      ownerType: "personal",
      ownerPublicId: localSessionUserPublicId,
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: localSessionUserPublicId,
      effectiveEdition: "advanced",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
      idempotencyKeyHash: "sha256:student-local-request",
      existingTaskPublicId: null,
      existingTaskStatus: null,
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
    });
    expect(JSON.stringify(requestBody)).not.toContain(
      "unit-test-session-token",
    );
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("refreshes server-backed request history after successful submit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMockWithHistorySequence([
      emptyServerHistoryResponse,
      serverHistoryAfterSubmitResponse,
    ]);
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("local_contract_only")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "personal-ai-request-public-server-after-submit-001",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("ai-generation-task-public-server-after-submit-001")
        .length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("2026-06-12T12:30:00.000Z")).toBeInTheDocument();
    expect(screen.queryByText("personal-ai-request-public-001")).toBeNull();
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      "/api/v1/personal-ai-generation-requests",
      "/api/v1/sessions",
      "/api/v1/personal-ai-generation-requests",
      "/api/v1/personal-ai-generation-requests",
    ]);
    expect(fetchMock.mock.calls.map((call) => call[1]?.method)).toEqual([
      "GET",
      "GET",
      "POST",
      "GET",
    ]);
  });

  it("renders a redacted history error state when the post-submit server refresh fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMockWithHistorySequence([
      emptyServerHistoryResponse,
      {
        code: 500017,
        message:
          "Personal AI request history is temporarily unavailable. database stack provider payload",
        data: null,
      },
    ]);
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("local_contract_only")).toBeInTheDocument();
    expect(await screen.findByText(historyErrorTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("database stack");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
  });

  it("renders a permission blocked state when no student session token exists", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(screen.getByText(unauthorizedTitle)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: requestButtonLabel }),
    ).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders the local contract blocked state without provider content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const blockedResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "blocked",
        requestState: {
          ...localExperienceResponse.data.requestState,
          status: "blocked",
          action: {
            actionType: "submit_personal_ai_generation_request",
            isEnabled: false,
            disabledReason: "quota_insufficient",
          },
        },
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "blocked",
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMock(blockedResponse),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText(blockedTitle)).toBeInTheDocument();
    expect(screen.getByText("quota_insufficient")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
  });

  it("renders redacted result and ai_call_log reference metadata without raw provider content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const redactedReferenceResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: "ai-generation-task-public-001",
          resultPublicId: "ai-result-public-001",
          contentVisibility: "summary_only",
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            status: "succeeded",
            resultReference: {
              resultPublicId: "ai-result-public-001",
              contentVisibility: "summary_only",
              evidenceStatus: "sufficient",
              citationCount: 2,
              redactionStatus: "redacted",
            },
            aiCallLogReference: {
              aiCallLogPublicId: "ai-call-log-public-001",
              contentVisibility: "summary_only",
              redactionStatus: "redacted",
            },
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [
          emptyServerHistoryResponse,
          {
            code: 0,
            message: "ok",
            data: [
              {
                requestPublicId:
                  "personal-ai-request-public-server-history-001",
                taskPublicId: "ai-generation-task-public-history-001",
                status: "succeeded",
                requestedAt: "2026-06-12T12:45:00.000Z",
                resultPublicId: "ai-result-public-history-001",
                evidenceStatus: "weak",
                citationCount: 3,
                aiCallLogPublicId: "ai-call-log-public-history-001",
                redactionStatus: "redacted",
              },
            ],
          },
        ],
        redactedReferenceResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findAllByText("aiCallLogPublicId")).not.toHaveLength(0);
    expect(
      screen.getAllByText("ai-call-log-public-001").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("resultPublicId").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ai-result-public-001").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("evidenceStatus").length).toBeGreaterThan(0);
    expect(screen.getAllByText("sufficient").length).toBeGreaterThan(0);
    expect(screen.getAllByText("citationCount").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders redacted recent request history rows from camelCase read-model fields", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const redactedReferenceResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: "ai-generation-task-public-history-001",
          resultPublicId: "ai-result-public-history-001",
          contentVisibility: "summary_only",
          evidenceStatus: "weak",
          citationCount: 3,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            taskPublicId: "ai-generation-task-public-history-001",
            status: "succeeded",
            resultReference: {
              resultPublicId: "ai-result-public-history-001",
              contentVisibility: "summary_only",
              evidenceStatus: "weak",
              citationCount: 3,
              redactionStatus: "redacted",
            },
            aiCallLogReference: {
              aiCallLogPublicId: "ai-call-log-public-history-001",
              contentVisibility: "summary_only",
              redactionStatus: "redacted",
            },
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [
          emptyServerHistoryResponse,
          {
            code: 0,
            message: "ok",
            data: [
              {
                requestPublicId:
                  "personal-ai-request-public-server-history-001",
                taskPublicId: "ai-generation-task-public-history-001",
                status: "succeeded",
                requestedAt: "2026-06-12T12:45:00.000Z",
                resultPublicId: "ai-result-public-history-001",
                evidenceStatus: "weak",
                citationCount: 3,
                aiCallLogPublicId: "ai-call-log-public-history-001",
                redactionStatus: "redacted",
              },
            ],
          },
        ],
        redactedReferenceResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));

    expect(screen.getByText(historyTitle)).toBeInTheDocument();
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(
      await screen.findByText("personal-ai-request-public-server-history-001"),
    ).toBeInTheDocument();
    expect(screen.getByText("requestPublicId")).toBeInTheDocument();
    expect(screen.getByText("requestedAt")).toBeInTheDocument();
    expect(screen.getByText("2026-06-12T12:45:00.000Z")).toBeInTheDocument();
    expect(
      screen.getAllByText("ai-generation-task-public-history-001").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("ai-result-public-history-001").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("weak").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("ai-call-log-public-history-001").length,
    ).toBeGreaterThan(0);
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("full paper content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders request history error state without exposing private content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMock({
        code: 500001,
        message: "local failure",
        data: null,
      }),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText(historyErrorTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders the initial request history error state without exposing private content", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMock(localExperienceResponse, {
        code: 500001,
        message: "local failure",
        data: null,
      }),
    );

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyErrorTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });
});
