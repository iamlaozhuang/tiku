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
        resultPublicId: null,
        contentVisibility: "summary_only",
        evidenceStatus: "none",
        citationCount: 0,
        aiCallLogReference: {
          publicId: null,
          redactionStatus: "redacted",
        },
        redactionStatus: "redacted",
      },
    },
  },
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("StudentPersonalAiGenerationPage", () => {
  it("posts a camelCase public-id payload to the local route contract without rendering the session token", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/personal-ai-generation-requests");
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

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("local_contract_only")).toBeInTheDocument();
    expect(screen.getByText("student_local_browser")).toBeInTheDocument();
    expect(screen.getByText("accepted")).toBeInTheDocument();
    expect(screen.getByText("paper-public-001")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("summary_only")).toBeInTheDocument();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>;

    expect(requestBody).toEqual({
      responseMode: "local_browser_experience",
      userPublicId: "student-public-001",
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
      actorPublicId: "student-public-001",
      authorizationSource: "personal_auth",
      ownerType: "personal",
      ownerPublicId: "student-public-001",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student-public-001",
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
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => blockedResponse,
      })),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText(blockedTitle)).toBeInTheDocument();
    expect(screen.getByText("quota_insufficient")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
  });
});
