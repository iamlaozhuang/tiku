import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

function createResultDetailPayload(
  unsafeEchoFields: Record<string, string> = {},
) {
  return {
    runtimeStatus: "local_contract_only",
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    formalAdoptionWriteStatus: "blocked_without_follow_up_task",
    result: {
      ...createResultHistoryPayload().results[0],
      contentReference: {
        contentDigest: "sha256:content_detail_501",
        contentPreviewMasked: "masked preview detail 501",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
      },
      ...unsafeEchoFields,
    },
  };
}

function mockResultHistoryAndDetailResponses({
  detailResponse,
}: {
  detailResponse:
    | Promise<unknown>
    | {
        code: number;
        message: string;
        data: unknown;
      };
}) {
  studentRuntimeApiMock.fetchStudentApi.mockImplementation(
    async (url: string) => {
      if (url === "/api/v1/personal-ai-generation-results") {
        return {
          code: 0,
          message: "ok",
          data: createResultHistoryPayload(),
        };
      }

      if (
        url ===
        "/api/v1/personal-ai-generation-results/personal_ai_result_public_ui_501"
      ) {
        return detailResponse;
      }

      return {
        code: 500019,
        message: "Unexpected student API request.",
        data: null,
      };
    },
  );
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

  it("opens redacted result detail from the result history entry", async () => {
    mockResultHistoryAndDetailResponses({
      detailResponse: {
        code: 0,
        message: "ok",
        data: createResultDetailPayload({
          unsafeProviderEcho: "DO_NOT_RENDER_PROVIDER_ECHO",
          unsafePrivateEcho: "DO_NOT_RENDER_PRIVATE_ECHO",
          unsafeGeneratedEcho: "DO_NOT_RENDER_GENERATED_ECHO",
        }),
      },
    });

    render(<StudentPersonalAiGenerationPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "\u67e5\u770b\u8131\u654f\u8be6\u60c5",
      }),
    );

    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results/personal_ai_result_public_ui_501",
        "local-session-token",
        {
          method: "GET",
        },
      );
    });
    expect(
      await screen.findByText("\u8131\u654f\u7ed3\u679c\u8be6\u60c5"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("local_contract_only").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("redacted_snapshot").length).toBeGreaterThan(0);
    expect(screen.getAllByText("redacted").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("blocked_without_follow_up_task").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("masked preview detail 501")).toBeInTheDocument();
    expect(
      screen.queryByText("DO_NOT_RENDER_PROVIDER_ECHO"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("DO_NOT_RENDER_PRIVATE_ECHO"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("DO_NOT_RENDER_GENERATED_ECHO"),
    ).not.toBeInTheDocument();
  });

  it("renders the result detail loading state", async () => {
    mockResultHistoryAndDetailResponses({
      detailResponse: new Promise(() => {}),
    });

    render(<StudentPersonalAiGenerationPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "\u67e5\u770b\u8131\u654f\u8be6\u60c5",
      }),
    );

    expect(
      await screen.findByText("\u7ed3\u679c\u8be6\u60c5\u540c\u6b65\u4e2d"),
    ).toBeInTheDocument();
  });

  it("renders the result detail empty state", async () => {
    mockResultHistoryAndDetailResponses({
      detailResponse: {
        code: 404019,
        message: "Personal AI generation result detail was not found.",
        data: null,
      },
    });

    render(<StudentPersonalAiGenerationPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "\u67e5\u770b\u8131\u654f\u8be6\u60c5",
      }),
    );

    expect(
      await screen.findByText(
        "\u7ed3\u679c\u8be6\u60c5\u6682\u65e0\u53ef\u7528\u8131\u654f\u5feb\u7167",
      ),
    ).toBeInTheDocument();
  });

  it("renders the result detail error state", async () => {
    mockResultHistoryAndDetailResponses({
      detailResponse: {
        code: 500019,
        message:
          "Personal AI generation result detail is temporarily unavailable.",
        data: null,
      },
    });

    render(<StudentPersonalAiGenerationPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "\u67e5\u770b\u8131\u654f\u8be6\u60c5",
      }),
    );

    expect(
      await screen.findByText(
        "\u7ed3\u679c\u8be6\u60c5\u6682\u4e0d\u53ef\u7528",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("personal_ai_result_public_ui_501"),
    ).toBeInTheDocument();
  });
});
