import { readFileSync } from "node:fs";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StudentPersonalAiGenerationPage } from "./StudentPersonalAiGenerationPage";
import type { EffectiveAuthorizationListDto } from "@/server/contracts/effective-authorization-contract";

const studentRuntimeApiMock = vi.hoisted(() => ({
  COOKIE_BACKED_SESSION_MARKER: "__cookie_backed_session__",
  fetchCurrentStudentSession: vi.fn(),
  fetchPersonalAiGenerationRequestHistory: vi.fn(),
  fetchStudentApi: vi.fn(),
  getStoredStudentSessionToken: vi.fn(),
  hasStoredStudentSessionSignal: vi.fn(),
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

function createRequestHistoryPayload() {
  return [
    {
      requestPublicId: "personal_ai_request_history_public_ui_701",
      taskPublicId: "ai_generation_task_history_public_ui_701",
      status: "succeeded",
      requestedAt: "2026-06-14T09:00:00.000Z",
      resultPublicId: "personal_ai_result_history_public_ui_701",
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: "ai_call_log_history_public_ui_701",
      redactionStatus: "redacted",
    },
  ];
}

function createAdvancedAuthorizationListPayload(
  ownerType: "personal" | "organization" = "personal",
): EffectiveAuthorizationListDto {
  const isOrganizationOwner = ownerType === "organization";

  return {
    authorizations: [],
    effectiveAuthorizations: [],
    authorizationContexts: [
      {
        profession: "monopoly",
        level: 3,
        contextDisplayStatus: "display_only",
        edition: "advanced",
        effectiveEdition: "advanced",
        upgradeStatus: "none",
        expiresAt: "2027-06-14T00:00:00.000Z",
        displayStatus: "active",
        authorizationSource: isOrganizationOwner ? "org_auth" : "personal_auth",
        authorizationPublicId: "authorization_context_ui_501",
        ownerType,
        ownerPublicId: isOrganizationOwner
          ? "organization_public_ui_501"
          : "student_public_ui_501",
        organizationPublicId: isOrganizationOwner
          ? "organization_public_ui_501"
          : null,
        quotaOwnerType: ownerType,
        quotaOwnerPublicId: isOrganizationOwner
          ? "organization_public_ui_501"
          : "student_public_ui_501",
        blockedReason: null,
        capabilities: {
          canGenerateAiQuestion: true,
          canGenerateAiPaper: true,
          canCreateOrganizationTraining: false,
          canAnswerOrganizationTraining: false,
          canViewOrganizationTrainingSummary: false,
          canManageAuthorizationQuota: false,
        },
      },
    ],
  };
}

function createStandardAuthorizationListPayload(): EffectiveAuthorizationListDto {
  const payload = createAdvancedAuthorizationListPayload();
  const authorizationContext = payload.authorizationContexts?.[0];

  return {
    ...payload,
    authorizationContexts:
      authorizationContext === undefined
        ? []
        : [
            {
              ...authorizationContext,
              edition: "standard",
              effectiveEdition: "standard",
              capabilities: {
                ...authorizationContext.capabilities,
                canGenerateAiQuestion: false,
                canGenerateAiPaper: false,
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

function mockAuthorizationAndResultHistoryResponse(
  resultResponse: {
    code: number;
    message: string;
    data: unknown;
  },
  requestHistoryResponse: {
    code: number;
    message: string;
    data: unknown;
  } = {
    code: 0,
    message: "ok",
    data: [],
  },
  options: {
    authorizationPayload?: EffectiveAuthorizationListDto;
    generationAvailability?: "available" | "closed" | "error";
  } = {},
) {
  studentRuntimeApiMock.fetchStudentApi.mockImplementation(
    async (url: string) => {
      if (url === "/api/v1/authorizations") {
        return {
          code: 0,
          message: "ok",
          data:
            options.authorizationPayload ??
            createAdvancedAuthorizationListPayload(),
        };
      }

      if (url === "/api/v1/ai-generation/availability") {
        if (options.generationAvailability === "error") {
          return {
            code: 500019,
            message: "AI generation availability is temporarily unavailable.",
            data: null,
          };
        }

        return {
          code: 0,
          message: "ok",
          data: {
            generationAvailability:
              options.generationAvailability ?? "available",
          },
        };
      }

      if (url.startsWith("/api/v1/personal-ai-generation-requests")) {
        return requestHistoryResponse;
      }

      if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
        return resultResponse;
      }

      return {
        code: 500019,
        message: "Unexpected student API request.",
        data: null,
      };
    },
  );
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
      if (url === "/api/v1/authorizations") {
        return {
          code: 0,
          message: "ok",
          data: createAdvancedAuthorizationListPayload(),
        };
      }

      if (url === "/api/v1/ai-generation/availability") {
        return {
          code: 0,
          message: "ok",
          data: { generationAvailability: "available" },
        };
      }

      if (url.startsWith("/api/v1/personal-ai-generation-requests")) {
        return {
          code: 0,
          message: "ok",
          data: [],
        };
      }

      if (
        url ===
        "/api/v1/personal-ai-generation-results/personal_ai_result_public_ui_501"
      ) {
        return detailResponse;
      }

      if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
        return {
          code: 0,
          message: "ok",
          data: createResultHistoryPayload(),
        };
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
    studentRuntimeApiMock.hasStoredStudentSessionSignal.mockReturnValue(true);
    studentRuntimeApiMock.fetchPersonalAiGenerationRequestHistory.mockResolvedValue(
      {
        code: 0,
        message: "ok",
        data: [],
      },
    );
    mockAuthorizationAndResultHistoryResponse({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        formalAdoptionWriteStatus: "blocked_without_follow_up_task",
        results: [],
      },
    });
  });

  it("does not pass technical field names as ordinary visible labels", () => {
    const source = readFileSync(
      "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
      "utf8",
    );

    expect(source).not.toMatch(
      /<ContractField\s+label="(?:evidenceStatus|citationCount|formalAdoptionStatus|isFormalAdoptionBlocked|taskType|persistedAt|requestedAt)"/u,
    );
  });

  it.each([["personal"], ["organization"]] as const)(
    "fails closed before submit for the %s authorization context",
    async (ownerType) => {
      mockAuthorizationAndResultHistoryResponse(
        {
          code: 0,
          message: "ok",
          data: {
            runtimeStatus: "local_contract_only",
            contentVisibility: "redacted_snapshot",
            redactionStatus: "redacted",
            formalAdoptionWriteStatus: "blocked_without_follow_up_task",
            results: [],
          },
        },
        undefined,
        {
          authorizationPayload:
            createAdvancedAuthorizationListPayload(ownerType),
          generationAvailability: "closed",
        },
      );

      render(<StudentPersonalAiGenerationPage />);

      expect(
        await screen.findByText("AI 生成服务当前未开放"),
      ).toBeInTheDocument();
      const submitButton = screen.getByRole("button", {
        name: "生成练习题草稿",
      });
      expect(submitButton).toBeDisabled();
      fireEvent.click(submitButton);
      expect(studentRuntimeApiMock.fetchStudentApi).not.toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-requests",
        expect.anything(),
        expect.objectContaining({ method: "POST" }),
      );
      expect(document.body).not.toHaveTextContent("Provider");
    },
  );

  it("fails closed when the learner availability status cannot be loaded", async () => {
    mockAuthorizationAndResultHistoryResponse(
      {
        code: 0,
        message: "ok",
        data: {
          runtimeStatus: "local_contract_only",
          contentVisibility: "redacted_snapshot",
          redactionStatus: "redacted",
          formalAdoptionWriteStatus: "blocked_without_follow_up_task",
          results: [],
        },
      },
      undefined,
      { generationAvailability: "error" },
    );

    render(<StudentPersonalAiGenerationPage />);

    expect(
      await screen.findByText("AI 生成服务状态暂不可用"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "生成练习题草稿" }),
    ).toBeDisabled();
    expect(studentRuntimeApiMock.fetchStudentApi).not.toHaveBeenCalledWith(
      "/api/v1/personal-ai-generation-requests",
      expect.anything(),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("keeps standard authorization unavailable without loading generation availability", async () => {
    mockAuthorizationAndResultHistoryResponse(
      {
        code: 0,
        message: "ok",
        data: {
          runtimeStatus: "local_contract_only",
          contentVisibility: "redacted_snapshot",
          redactionStatus: "redacted",
          formalAdoptionWriteStatus: "blocked_without_follow_up_task",
          results: [],
        },
      },
      undefined,
      { authorizationPayload: createStandardAuthorizationListPayload() },
    );

    render(<StudentPersonalAiGenerationPage />);

    expect(
      await screen.findByText("当前授权暂未开放 AI 训练"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "生成练习题草稿" }),
    ).not.toBeInTheDocument();
    expect(studentRuntimeApiMock.fetchStudentApi).not.toHaveBeenCalledWith(
      "/api/v1/ai-generation/availability",
      expect.anything(),
      expect.anything(),
    );
  });

  it("uses learner-facing AI training labels for question and paper generation", async () => {
    render(<StudentPersonalAiGenerationPage />);

    expect(screen.getByRole("heading", { name: "AI训练" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "生成练习题草稿" }),
    ).toBeInTheDocument();

    const paperTab = screen.getByRole("tab", { name: "AI组卷" });
    await waitFor(() => expect(paperTab).not.toBeDisabled());
    fireEvent.click(paperTab);

    expect(
      screen.getByRole("button", { name: "生成自测试卷" }),
    ).toBeInTheDocument();
  });

  it("loads and renders redacted personal AI generation result history", async () => {
    mockAuthorizationAndResultHistoryResponse({
      code: 0,
      message: "ok",
      data: createResultHistoryPayload(),
    });

    render(<StudentPersonalAiGenerationPage />);

    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10",
        "local-session-token",
        {
          method: "GET",
        },
      );
    });
    expect(await screen.findByText("暂不可用")).toBeInTheDocument();
    expect(screen.getByText("masked preview ui 501")).toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_result_public_ui_501"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_generation_task_public_ui_501"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_request_public_ui_501"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_call_log_public_ui_501"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("local-session-token")).not.toBeInTheDocument();
  });

  it("renders request history metadata without public identifier text", async () => {
    mockAuthorizationAndResultHistoryResponse(
      {
        code: 0,
        message: "ok",
        data: createResultHistoryPayload(),
      },
      {
        code: 0,
        message: "ok",
        data: createRequestHistoryPayload(),
      },
    );

    render(<StudentPersonalAiGenerationPage />);

    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10",
        "local-session-token",
        {
          method: "GET",
        },
      );
    });
    expect(
      await screen.findByText("2026-06-14T09:00:00.000Z"),
    ).toBeInTheDocument();
    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByText("依据较少")).toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_request_history_public_ui_701"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_generation_task_history_public_ui_701"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_result_history_public_ui_701"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_call_log_history_public_ui_701"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("local-session-token")).not.toBeInTheDocument();
  });

  it("renders the result history error state without hiding request history", async () => {
    mockAuthorizationAndResultHistoryResponse({
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
        name: "\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
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
      await screen.findByText("\u7ed3\u679c\u8be6\u60c5"),
    ).toBeInTheDocument();
    expect(screen.queryByText("仅本地合约")).not.toBeInTheDocument();
    expect(screen.queryByText("脱敏快照")).not.toBeInTheDocument();
    expect(screen.queryByText("已脱敏")).not.toBeInTheDocument();
    expect(screen.queryByText("evidenceStatus")).not.toBeInTheDocument();
    expect(screen.queryByText("citationCount")).not.toBeInTheDocument();
    expect(screen.queryByText("formalAdoptionStatus")).not.toBeInTheDocument();
    expect(screen.queryByText("redactionStatus")).not.toBeInTheDocument();
    expect(screen.getAllByText("暂不可用").length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent("正式采用");
    expect(document.body).not.toHaveTextContent("需审核后采用");
    expect(document.body).not.toHaveTextContent("可采用");
    expect(screen.getAllByText("依据资料状态").length).toBeGreaterThan(0);
    expect(screen.getByText("masked preview detail 501")).toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_result_public_ui_501"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_generation_task_public_ui_501"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_request_public_ui_501"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_call_log_public_ui_501"),
    ).not.toBeInTheDocument();
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
        name: "\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
      }),
    );

    expect(
      await screen.findByText("\u7ed3\u679c\u8be6\u60c5\u540c\u6b65\u4e2d"),
    ).toBeInTheDocument();
  });

  it("renders the result detail empty state", async () => {
    mockResultHistoryAndDetailResponses({
      detailResponse: {
        code: 404045,
        message: "Personal AI generation result detail was not found.",
        data: null,
      },
    });

    render(<StudentPersonalAiGenerationPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
      }),
    );

    expect(
      await screen.findByText(
        "\u7ed3\u679c\u8be6\u60c5\u6682\u65e0\u53ef\u7528\u8bad\u7ec3\u5185\u5bb9",
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
        name: "\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
      }),
    );

    expect(
      await screen.findByText(
        "\u7ed3\u679c\u8be6\u60c5\u6682\u4e0d\u53ef\u7528",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_result_public_ui_501"),
    ).not.toBeInTheDocument();
  });
});
