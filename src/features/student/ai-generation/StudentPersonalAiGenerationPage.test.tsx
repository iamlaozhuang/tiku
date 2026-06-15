import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StudentPersonalAiGenerationPage } from "./StudentPersonalAiGenerationPage";

const studentRuntimeApiMock = vi.hoisted(() => ({
  fetchCurrentStudentSession: vi.fn(),
  fetchPersonalAiGenerationRequestHistory: vi.fn(),
  fetchStudentApi: vi.fn(),
  getStoredStudentSessionToken: vi.fn(),
  isStudentUnauthorizedResponse: vi.fn((payload: { code: number }) => {
    return payload.code === 401001;
  }),
}));

vi.mock("@/features/student/studentRuntimeApi", () => studentRuntimeApiMock);

function createResultHistoryPayload() {
  return {
    runtimeStatus: "local_contract_only",
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    formalAdoptionWriteStatus: "blocked_without_follow_up_task",
    results: [
      {
        resultPublicId: "personal_ai_result_public_ui_501",
        taskPublicId: "ai_generation_task_public_ui_501",
        requestPublicId: "personal_ai_request_public_ui_501",
        taskType: "ai_question_generation",
        status: "draft",
        persistedAt: "2026-06-14T10:00:00.000Z",
        contentReference: {
          contentDigest: "sha256:content_ui_501",
          contentPreviewMasked: "masked preview ui 501",
          contentVisibility: "redacted_snapshot",
          redactionStatus: "redacted",
        },
        evidenceReference: {
          evidenceStatus: "sufficient",
          citationCount: 2,
          aiCallLogPublicId: "ai_call_log_public_ui_501",
          redactionStatus: "redacted",
        },
        formalAdoption: {
          isBlocked: true,
          status: "blocked",
        },
      },
    ],
  };
}

describe("StudentPersonalAiGenerationPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    studentRuntimeApiMock.getStoredStudentSessionToken.mockReturnValue(
      "local-session-token",
    );
    studentRuntimeApiMock.fetchPersonalAiGenerationRequestHistory.mockResolvedValue(
      {
        code: 0,
        message: "ok",
        data: [],
      },
    );
  });

  it("loads and renders redacted personal AI generation result history", async () => {
    studentRuntimeApiMock.fetchStudentApi.mockResolvedValue({
      code: 0,
      message: "ok",
      data: createResultHistoryPayload(),
    });

    render(<StudentPersonalAiGenerationPage />);

    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results",
        "local-session-token",
        {
          method: "GET",
        },
      );
    });
    expect(
      await screen.findByText("personal_ai_result_public_ui_501"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("blocked_without_follow_up_task"),
    ).toBeInTheDocument();
    expect(screen.getByText("masked preview ui 501")).toBeInTheDocument();
    expect(screen.queryByText("local-session-token")).not.toBeInTheDocument();
  });

  it("renders the result history error state without hiding request history", async () => {
    studentRuntimeApiMock.fetchStudentApi.mockResolvedValue({
      code: 500019,
      message:
        "Personal AI generation result history is temporarily unavailable.",
      data: null,
    });

    render(<StudentPersonalAiGenerationPage />);

    expect(
      await screen.findByText(
        "\u7ed3\u679c\u5386\u53f2\u6682\u4e0d\u53ef\u7528",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("\u6682\u65e0\u5386\u53f2\u8bf7\u6c42"),
    ).toBeInTheDocument();
  });
});
