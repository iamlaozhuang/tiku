import { readFileSync } from "node:fs";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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

function createPaperResultHistoryPayload() {
  const resultPublicId = "personal_ai_paper_result_public_ui_601";
  const taskPublicId = "ai_generation_paper_task_public_ui_601";

  return {
    resultPublicId,
    taskPublicId,
    payload: {
      ...createResultHistoryPayload(),
      results: [
        {
          ...createResultHistoryPayload().results[0],
          resultPublicId,
          taskPublicId,
          taskType: "ai_paper_generation",
          evidenceReference: {
            ...createResultHistoryPayload().results[0].evidenceReference,
            evidenceStatus: "sufficient",
            citationCount: 2,
          },
          paperAssembly: {
            status: "assembled",
            sourceDiagnostics: {
              role: "personal_advanced_student",
              platformQuestionCount: 1,
              enterpriseQuestionCount: 0,
              enterpriseSourceStatus: "not_applicable",
            },
            container: {
              title: "persisted self-test paper",
              profession: "monopoly",
              level: 3,
              subject: "theory",
              requestedQuestionCount: 1,
              selectedQuestionCount: 1,
              sourceComposition: {
                platformFormalQuestionCount: 1,
                enterpriseTrainingSnapshotCount: 0,
              },
              matchQuality: "fully_matched",
              sections: [
                {
                  sectionKey: "single-choice",
                  title: "单选题",
                  questionType: "single_choice",
                  targetQuestionCount: 1,
                  selectedQuestionCount: 1,
                  selectedQuestions: [
                    {
                      questionPublicId: "question_public_ui_601",
                      sourceKind: "platform_formal_question",
                      matchTier: "exact",
                      score: 2,
                    },
                  ],
                  degradationSummary: {
                    exactCount: 1,
                    nearbyKnowledgeCount: 0,
                    sameScopeCount: 0,
                  },
                },
              ],
            },
            insufficiency: null,
            redactionStatus: "redacted",
          },
        },
      ],
    },
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

function createPersonalAndOrganizationAuthorizationListPayload(): EffectiveAuthorizationListDto {
  const personalPayload = createAdvancedAuthorizationListPayload("personal");
  const organizationPayload =
    createAdvancedAuthorizationListPayload("organization");

  return {
    authorizations: [],
    effectiveAuthorizations: [],
    authorizationContexts: [
      ...(personalPayload.authorizationContexts ?? []),
      ...((organizationPayload.authorizationContexts ?? []).map(
        (authorizationContext) => ({
          ...authorizationContext,
          authorizationPublicId: "organization_authorization_context_ui_502",
        }),
      ) ?? []),
    ],
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function createLearningHistoryQuestion(
  sessionPublicId: string,
  questionSuffix = "q_1",
) {
  return {
    sessionQuestionPublicId: `${sessionPublicId}_${questionSuffix}`,
    sourceDraftNumber: 1,
    questionType: "single_choice",
    difficulty: "medium",
    knowledgeNodeLabels: ["专卖基础"],
    questionStem: `服务端学习题目 ${sessionPublicId}`,
    questionOptions: [
      { optionLabel: "A", optionText: "正确选项" },
      { optionLabel: "B", optionText: "干扰选项" },
    ],
    maxScore: "1.0",
    reviewStatus: "draft_review_required",
  };
}

function createLearningHistorySession(
  sessionPublicId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    sessionPublicId,
    sourceResultPublicId: `${sessionPublicId}_result`,
    sourceTaskPublicId: `${sessionPublicId}_task`,
    lifecycleAvailability: "current",
    sessionStatus: "in_progress",
    sessionRevision: 1,
    questionCount: 1,
    submittedCount: 0,
    completionRate: 0,
    score: null,
    maxScore: null,
    canResume: true,
    canReview: false,
    canComplete: false,
    createdAt: "2026-07-24T08:00:00.000Z",
    updatedAt: "2026-07-24T08:00:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

function createLearningProgressResponse(
  sessionPublicId: string,
  answerFeedbacks: unknown[] = [],
) {
  return {
    code: 0,
    message: "ok",
    data: {
      status: "ready",
      blockReason: null,
      progress: {
        sessionPublicId,
        lifecycleAvailability: "current",
        sessionStatus: "in_progress",
        sessionRevision: 1,
        completedAt: null,
        completionSummary: null,
        questions: [createLearningHistoryQuestion(sessionPublicId)],
        answerFeedbacks,
      },
    },
  };
}

function createLearningStatisticsResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      attemptCount: 2,
      inProgressCount: 2,
      completedCount: 0,
      completedQuestionCount: 0,
      submittedCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      reviewRequiredCount: 0,
      completionRate: null,
      accuracyRate: null,
      score: "0.0",
      maxScore: "0.0",
    },
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
        "/api/v1/personal-ai-generation-results/personal_ai_result_public_ui_501?authorizationPublicId=authorization_context_ui_501"
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
    window.history.replaceState({}, "", "/ai-generation");
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

  it("keeps answer revision ownership in progress and refreshes a CAS conflict", () => {
    const source = readFileSync(
      "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
      "utf8",
    );

    expect(source).toContain("answerFeedback.answerRevision === null");
    expect(source).toMatch(/\?\.answerRevision \?\? 0/u);
    expect(source).toContain("isAiLearningAnswerSubmissionInFlightRef.current");
    expect(source).toContain(
      'answerResponse.data?.blockReason === "answer_revision_conflict"',
    );
    expect(source).toContain("await refreshAiLearningProgress(");
  });

  it("funnels authorization selection and invalidation through one atomic lifecycle helper", () => {
    const source = readFileSync(
      "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
      "utf8",
    );

    expect(source).toContain(
      "const applyPersonalAiAuthorizationSelection = useCallback(",
    );
    expect(source.match(/setSelectedAuthorizationPublicId\(/gu)).toHaveLength(
      1,
    );
    expect(source).toContain("aiLearningSessionActionSequenceRef.current += 1");
    expect(source).toContain("selectedAuthorizationPublicIdRef.current =");
  });

  it("routes successful generation refresh through the sequence-invalidating history loader", () => {
    const source = readFileSync(
      "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
      "utf8",
    );

    expect(source).toMatch(
      /setExperience\(response\.data\);[\s\S]*?await loadAiGenerationHistories\(\s*taskType,\s*PERSONAL_AI_GENERATION_HISTORY_PAGE,\s*PERSONAL_AI_GENERATION_HISTORY_PAGE,\s*generationAuthorizationContext\.authorizationPublicId,\s*\);/u,
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
      fireEvent.click(screen.getByText("生成设置"));
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

  it("keeps history and authorization navigation usable while generation is closed", async () => {
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
      {
        authorizationPayload:
          createPersonalAndOrganizationAuthorizationListPayload(),
        generationAvailability: "closed",
      },
    );

    render(<StudentPersonalAiGenerationPage />);

    expect(
      await screen.findByText("AI 生成服务当前未开放"),
    ).toBeInTheDocument();
    expect(screen.getByText("个人 AI 训练")).toBeInTheDocument();
    expect(screen.getByText(/请先确认一个具体授权/u)).toBeInTheDocument();

    const organizationContext = screen.getByRole("radio", {
      name: "组织授权 · 高级版 · 专卖 3级",
    });
    expect(organizationContext).not.toBeDisabled();
    fireEvent.click(organizationContext);
    expect(organizationContext).toBeChecked();
    expect(screen.getByText("企业员工 AI 训练")).toBeInTheDocument();

    const paperTab = screen.getByRole("tab", { name: "AI组卷" });
    expect(paperTab).not.toBeDisabled();
    fireEvent.click(paperTab);
    expect(paperTab).toHaveAttribute("aria-selected", "true");
    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results?taskType=ai_paper_generation&page=1&pageSize=10&authorizationPublicId=organization_authorization_context_ui_502",
        "local-session-token",
        { method: "GET" },
      );
    });
    expect(screen.getAllByText("当前筛选：AI组卷").length).toBeGreaterThan(0);

    const historyZone = screen.getByTestId("student-ai-zone-result-history");
    const generationSettings = screen.getByTestId(
      "student-ai-generation-settings",
    );
    expect(
      generationSettings.compareDocumentPosition(historyZone) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(generationSettings).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("生成设置"));
    expect(
      screen.getByText("当前无法生成：AI 生成服务暂未开放。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "生成企业自测试卷" }),
    ).toBeDisabled();
    expect(document.body).not.toHaveTextContent("Provider");
    expect(
      studentRuntimeApiMock.fetchStudentApi.mock.calls.some(
        (requestCall) =>
          (requestCall[2] as RequestInit | undefined)?.method === "POST",
      ),
    ).toBe(false);
  });

  it("requires explicit selection among multiple contexts before scoped history reads", async () => {
    const authorizationPayload =
      createPersonalAndOrganizationAuthorizationListPayload();
    const personalAuthorizationContext = {
      ...authorizationPayload.authorizationContexts?.[0],
      authorizationPublicId: "personal-auth-context/ui?selected=1",
    };
    const organizationAuthorizationContext =
      authorizationPayload.authorizationContexts?.[1];

    studentRuntimeApiMock.fetchStudentApi.mockImplementation(
      async (url: string) => {
        if (url === "/api/v1/authorizations") {
          return {
            code: 0,
            message: "ok",
            data: {
              ...authorizationPayload,
              authorizationContexts: [
                organizationAuthorizationContext,
                personalAuthorizationContext,
              ],
            },
          };
        }

        if (url === "/api/v1/ai-generation/availability") {
          return {
            code: 0,
            message: "ok",
            data: { generationAvailability: "closed" },
          };
        }

        if (url.startsWith("/api/v1/personal-ai-generation-requests?")) {
          return { code: 0, message: "ok", data: [] };
        }

        if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
          return {
            code: 0,
            message: "ok",
            data: createResultHistoryPayload(),
          };
        }

        if (
          url.startsWith(
            "/api/v1/personal-ai-generation-results/personal_ai_result_public_ui_501?",
          )
        ) {
          return {
            code: 0,
            message: "ok",
            data: createResultDetailPayload(),
          };
        }

        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);

    const personalContext = await screen.findByRole("radio", {
      name: "个人授权 · 高级版 · 专卖 3级",
    });
    const organizationContext = screen.getByRole("radio", {
      name: "组织授权 · 高级版 · 专卖 3级",
    });

    expect(personalContext).not.toBeChecked();
    expect(organizationContext).not.toBeChecked();
    expect(
      studentRuntimeApiMock.fetchStudentApi.mock.calls.some(([url]) =>
        url.startsWith("/api/v1/personal-ai-generation-requests?"),
      ),
    ).toBe(false);

    fireEvent.click(personalContext);
    expect(personalContext).toBeChecked();
    expect(
      new URL(window.location.href).searchParams.get("authorizationPublicId"),
    ).toBe("personal-auth-context/ui?selected=1");

    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=personal-auth-context%2Fui%3Fselected%3D1",
        "local-session-token",
        { method: "GET" },
      );
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=personal-auth-context%2Fui%3Fselected%3D1",
        "local-session-token",
        { method: "GET" },
      );
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "查看结果详情" }),
    );
    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results/personal_ai_result_public_ui_501?authorizationPublicId=personal-auth-context%2Fui%3Fselected%3D1",
        "local-session-token",
        { method: "GET" },
      );
    });

    const historyReadCountBeforeSameSelection =
      studentRuntimeApiMock.fetchStudentApi.mock.calls.filter(
        ([url]) => url.includes("personal-ai-generation-") && url.includes("?"),
      ).length;
    fireEvent.click(personalContext);
    expect(
      studentRuntimeApiMock.fetchStudentApi.mock.calls.filter(
        ([url]) => url.includes("personal-ai-generation-") && url.includes("?"),
      ),
    ).toHaveLength(historyReadCountBeforeSameSelection);
  });

  it("honors an exact authorization context carried by a home deep link", async () => {
    window.history.replaceState(
      {},
      "",
      "/ai-generation?authorizationPublicId=organization_authorization_context_ui_502",
    );
    mockAuthorizationAndResultHistoryResponse(
      {
        code: 0,
        message: "ok",
        data: createResultHistoryPayload(),
      },
      undefined,
      {
        authorizationPayload:
          createPersonalAndOrganizationAuthorizationListPayload(),
        generationAvailability: "closed",
      },
    );

    render(<StudentPersonalAiGenerationPage />);

    expect(
      await screen.findByRole("radio", {
        name: "组织授权 · 高级版 · 专卖 3级",
      }),
    ).toBeChecked();
    await waitFor(() => {
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=organization_authorization_context_ui_502",
        "local-session-token",
        { method: "GET" },
      );
    });
  });

  it("ignores delayed personal histories after switching to organization context", async () => {
    const delayedPersonalRequest = createDeferred<unknown>();
    const delayedPersonalResult = createDeferred<unknown>();
    const delayedPersonalLearningHistory = createDeferred<unknown>();
    const delayedPersonalLearningStatistics = createDeferred<unknown>();

    studentRuntimeApiMock.fetchStudentApi.mockImplementation(
      async (url: string) => {
        if (url === "/api/v1/authorizations") {
          return {
            code: 0,
            message: "ok",
            data: createPersonalAndOrganizationAuthorizationListPayload(),
          };
        }

        if (url === "/api/v1/ai-generation/availability") {
          return {
            code: 0,
            message: "ok",
            data: { generationAvailability: "closed" },
          };
        }

        if (
          url.startsWith(
            "/api/v1/personal-ai-generation-learning-sessions/statistics?",
          )
        ) {
          const authorizationPublicId = new URL(
            url,
            "https://tiku.local",
          ).searchParams.get("authorizationPublicId");
          return authorizationPublicId === "authorization_context_ui_501"
            ? delayedPersonalLearningStatistics.promise
            : {
                code: 0,
                message: "ok",
                data: {
                  attemptCount: 9,
                  inProgressCount: 1,
                  completedCount: 8,
                  completedQuestionCount: 8,
                  submittedCount: 8,
                  correctCount: 7,
                  incorrectCount: 1,
                  reviewRequiredCount: 0,
                  completionRate: 1,
                  accuracyRate: 0.875,
                  score: "7.0",
                  maxScore: "8.0",
                },
              };
        }

        if (
          url.startsWith("/api/v1/personal-ai-generation-learning-sessions?")
        ) {
          const authorizationPublicId = new URL(
            url,
            "https://tiku.local",
          ).searchParams.get("authorizationPublicId");
          return authorizationPublicId === "authorization_context_ui_501"
            ? delayedPersonalLearningHistory.promise
            : {
                code: 0,
                message: "ok",
                data: {
                  sessions: [
                    {
                      sessionPublicId: "organization_learning_session_ui_001",
                      sourceResultPublicId: "organization_result_ui_001",
                      sourceTaskPublicId: "organization_task_ui_001",
                      lifecycleAvailability: "current",
                      sessionStatus: "in_progress",
                      sessionRevision: 1,
                      questionCount: 7,
                      submittedCount: 7,
                      completionRate: 1,
                      score: "7.0",
                      maxScore: "7.0",
                      canResume: true,
                      canReview: false,
                      canComplete: true,
                      createdAt: "2026-07-24T08:00:00.000Z",
                      updatedAt: "2026-07-24T08:10:00.000Z",
                      completedAt: null,
                    },
                  ],
                  page: 1,
                  pageSize: 10,
                  total: 1,
                  totalPages: 1,
                },
              };
        }

        const authorizationPublicId = new URL(
          url,
          "https://tiku.local",
        ).searchParams.get("authorizationPublicId");
        if (authorizationPublicId === "authorization_context_ui_501") {
          return url.includes("-requests?")
            ? delayedPersonalRequest.promise
            : delayedPersonalResult.promise;
        }

        if (
          authorizationPublicId === "organization_authorization_context_ui_502"
        ) {
          return url.includes("-requests?")
            ? { code: 0, message: "ok", data: [] }
            : {
                code: 0,
                message: "ok",
                data: {
                  ...createResultHistoryPayload(),
                  results: [
                    {
                      ...createResultHistoryPayload().results[0],
                      contentReference: {
                        ...createResultHistoryPayload().results[0]
                          .contentReference,
                        contentPreviewMasked: "organization history",
                      },
                    },
                  ],
                },
              };
        }

        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);
    const organizationContext = await screen.findByRole("radio", {
      name: "组织授权 · 高级版 · 专卖 3级",
    });
    fireEvent.click(organizationContext);

    expect(await screen.findByText("organization history")).toBeInTheDocument();
    expect(await screen.findByText("已提交 7/7 题")).toBeInTheDocument();
    expect(
      screen.getByText("共 9 次 · 已完成 8 次 · 进行中 1 次"),
    ).toBeInTheDocument();

    delayedPersonalRequest.resolve({
      code: 0,
      message: "ok",
      data: createRequestHistoryPayload(),
    });
    delayedPersonalResult.resolve({
      code: 0,
      message: "ok",
      data: {
        ...createResultHistoryPayload(),
        results: [
          {
            ...createResultHistoryPayload().results[0],
            contentReference: {
              ...createResultHistoryPayload().results[0].contentReference,
              contentPreviewMasked: "stale personal history",
            },
          },
        ],
      },
    });
    delayedPersonalLearningHistory.resolve({
      code: 0,
      message: "ok",
      data: {
        sessions: [
          {
            sessionPublicId: "stale_personal_learning_session_ui_001",
            sourceResultPublicId: null,
            sourceTaskPublicId: "stale_personal_task_ui_001",
            lifecycleAvailability: "legacy_unavailable",
            sessionStatus: null,
            sessionRevision: null,
            questionCount: 1,
            submittedCount: null,
            completionRate: null,
            score: null,
            maxScore: null,
            canResume: false,
            canReview: false,
            canComplete: false,
            createdAt: "2026-07-24T07:00:00.000Z",
            updatedAt: "2026-07-24T07:00:00.000Z",
            completedAt: null,
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    });
    delayedPersonalLearningStatistics.resolve({
      code: 0,
      message: "ok",
      data: {
        attemptCount: 99,
        inProgressCount: 99,
        completedCount: 0,
        completedQuestionCount: 0,
        submittedCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        reviewRequiredCount: 0,
        completionRate: null,
        accuracyRate: null,
        score: "0.0",
        maxScore: "0.0",
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("stale personal history"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("organization history")).toBeInTheDocument();
    expect(
      screen.queryByText("历史学习记录（状态不可用）"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("共 99 次 · 已完成 0 次 · 进行中 99 次"),
    ).not.toBeInTheDocument();
  });

  it("clears selected personal result and ignores its delayed detail after context switch", async () => {
    const delayedPersonalDetail = createDeferred<unknown>();

    studentRuntimeApiMock.fetchStudentApi.mockImplementation(
      async (url: string) => {
        if (url === "/api/v1/authorizations") {
          return {
            code: 0,
            message: "ok",
            data: createPersonalAndOrganizationAuthorizationListPayload(),
          };
        }

        if (url === "/api/v1/ai-generation/availability") {
          return {
            code: 0,
            message: "ok",
            data: { generationAvailability: "closed" },
          };
        }

        if (url.includes("/personal_ai_result_public_ui_501?")) {
          return delayedPersonalDetail.promise;
        }

        const authorizationPublicId = new URL(
          url,
          "https://tiku.local",
        ).searchParams.get("authorizationPublicId");
        if (url.includes("-requests?")) {
          return { code: 0, message: "ok", data: [] };
        }

        if (
          url.includes("-results?") &&
          authorizationPublicId === "authorization_context_ui_501"
        ) {
          return {
            code: 0,
            message: "ok",
            data: createResultHistoryPayload(),
            pagination: {
              page: 1,
              pageSize: 10,
              total: 11,
              sortBy: "persistedAt",
              sortOrder: "desc",
            },
          };
        }

        if (url.includes("-results?")) {
          return {
            code: 0,
            message: "ok",
            data: { ...createResultHistoryPayload(), results: [] },
          };
        }

        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);
    fireEvent.click(
      await screen.findByRole("radio", {
        name: "个人授权 · 高级版 · 专卖 3级",
      }),
    );
    expect(
      await screen.findByText("masked preview ui 501"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "查看结果详情" }));
    expect(await screen.findByText("结果详情同步中")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("radio", { name: "组织授权 · 高级版 · 专卖 3级" }),
    );
    expect(screen.queryByText("masked preview ui 501")).not.toBeInTheDocument();
    expect(screen.queryByText("结果详情同步中")).not.toBeInTheDocument();

    delayedPersonalDetail.resolve({
      code: 0,
      message: "ok",
      data: createResultDetailPayload({
        unsafeGeneratedEcho: "stale personal detail",
      }),
    });
    await waitFor(() => {
      expect(
        screen.queryByText("stale personal detail"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("masked preview detail 501"),
      ).not.toBeInTheDocument();
    });
  });

  it("settles request then result pagination independently when their responses interleave", async () => {
    const delayedRequestPage = createDeferred<unknown>();
    const delayedResultPage = createDeferred<unknown>();

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
            data: { generationAvailability: "closed" },
          };
        }

        const requestUrl = new URL(url, "https://tiku.local");
        const page = requestUrl.searchParams.get("page");
        if (url.includes("-requests?")) {
          if (page === "2") {
            return delayedRequestPage.promise;
          }

          return {
            code: 0,
            message: "ok",
            data: createRequestHistoryPayload(),
            pagination: {
              page: 1,
              pageSize: 10,
              total: 20,
              sortBy: "requestedAt",
              sortOrder: "desc",
            },
          };
        }

        if (url.includes("-results?")) {
          if (page === "2") {
            return delayedResultPage.promise;
          }

          return {
            code: 0,
            message: "ok",
            data: createResultHistoryPayload(),
            pagination: {
              page: 1,
              pageSize: 10,
              total: 20,
              sortBy: "persistedAt",
              sortOrder: "desc",
            },
          };
        }

        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);

    const requestPagination = await screen.findByRole("navigation", {
      name: "AI请求历史分页",
    });
    const resultPagination = await screen.findByRole("navigation", {
      name: "AI生成结果历史分页",
    });
    fireEvent.click(
      within(requestPagination).getByRole("button", { name: "下一页" }),
    );
    fireEvent.click(
      within(resultPagination).getByRole("button", { name: "下一页" }),
    );

    delayedResultPage.resolve({
      code: 0,
      message: "ok",
      data: {
        ...createResultHistoryPayload(),
        results: [
          {
            ...createResultHistoryPayload().results[0],
            contentReference: {
              ...createResultHistoryPayload().results[0].contentReference,
              contentPreviewMasked: "result page two after request pagination",
            },
          },
        ],
      },
      pagination: {
        page: 2,
        pageSize: 10,
        total: 20,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });
    expect(
      await screen.findByText("result page two after request pagination"),
    ).toBeInTheDocument();

    delayedRequestPage.resolve({
      code: 0,
      message: "ok",
      data: [
        {
          ...createRequestHistoryPayload()[0],
          requestedAt: "2026-06-15T09:00:00.000Z",
        },
      ],
      pagination: {
        page: 2,
        pageSize: 10,
        total: 20,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });

    expect(await screen.findByText("2026年6月15日 17:00")).toBeInTheDocument();
    expect(screen.queryByText("历史请求同步中")).not.toBeInTheDocument();
    expect(screen.queryByText("结果历史同步中")).not.toBeInTheDocument();
    expect(screen.queryByText("2026年6月14日 17:00")).not.toBeInTheDocument();
    expect(screen.queryByText("masked preview ui 501")).not.toBeInTheDocument();
  });

  it("settles result then request pagination independently when their responses interleave", async () => {
    const delayedRequestPage = createDeferred<unknown>();
    const delayedResultPage = createDeferred<unknown>();

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
            data: { generationAvailability: "closed" },
          };
        }

        const requestUrl = new URL(url, "https://tiku.local");
        const page = requestUrl.searchParams.get("page");
        if (url.includes("-requests?")) {
          if (page === "2") {
            return delayedRequestPage.promise;
          }

          return {
            code: 0,
            message: "ok",
            data: createRequestHistoryPayload(),
            pagination: {
              page: 1,
              pageSize: 10,
              total: 20,
              sortBy: "requestedAt",
              sortOrder: "desc",
            },
          };
        }

        if (url.includes("-results?")) {
          if (page === "2") {
            return delayedResultPage.promise;
          }

          return {
            code: 0,
            message: "ok",
            data: createResultHistoryPayload(),
            pagination: {
              page: 1,
              pageSize: 10,
              total: 20,
              sortBy: "persistedAt",
              sortOrder: "desc",
            },
          };
        }

        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);

    const requestPagination = await screen.findByRole("navigation", {
      name: "AI请求历史分页",
    });
    const resultPagination = await screen.findByRole("navigation", {
      name: "AI生成结果历史分页",
    });
    fireEvent.click(
      within(resultPagination).getByRole("button", { name: "下一页" }),
    );
    fireEvent.click(
      within(requestPagination).getByRole("button", { name: "下一页" }),
    );

    delayedRequestPage.resolve({
      code: 0,
      message: "ok",
      data: [
        {
          ...createRequestHistoryPayload()[0],
          requestedAt: "2026-06-16T09:00:00.000Z",
        },
      ],
      pagination: {
        page: 2,
        pageSize: 10,
        total: 20,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });
    expect(await screen.findByText("2026年6月16日 17:00")).toBeInTheDocument();

    delayedResultPage.resolve({
      code: 0,
      message: "ok",
      data: {
        ...createResultHistoryPayload(),
        results: [
          {
            ...createResultHistoryPayload().results[0],
            contentReference: {
              ...createResultHistoryPayload().results[0].contentReference,
              contentPreviewMasked: "result page two before request pagination",
            },
          },
        ],
      },
      pagination: {
        page: 2,
        pageSize: 10,
        total: 20,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });

    expect(
      await screen.findByText("result page two before request pagination"),
    ).toBeInTheDocument();
    expect(screen.queryByText("历史请求同步中")).not.toBeInTheDocument();
    expect(screen.queryByText("结果历史同步中")).not.toBeInTheDocument();
    expect(screen.queryByText("2026年6月14日 17:00")).not.toBeInTheDocument();
    expect(screen.queryByText("masked preview ui 501")).not.toBeInTheDocument();
  });

  it("keeps the initial result load live while request pagination advances", async () => {
    const delayedInitialResult = createDeferred<unknown>();
    const delayedRequestPage = createDeferred<unknown>();

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
            data: { generationAvailability: "closed" },
          };
        }

        const requestUrl = new URL(url, "https://tiku.local");
        const page = requestUrl.searchParams.get("page");
        if (url.includes("-requests?")) {
          if (page === "2") {
            return delayedRequestPage.promise;
          }

          return {
            code: 0,
            message: "ok",
            data: createRequestHistoryPayload(),
            pagination: {
              page: 1,
              pageSize: 10,
              total: 20,
              sortBy: "requestedAt",
              sortOrder: "desc",
            },
          };
        }

        if (url.includes("-results?")) {
          return delayedInitialResult.promise;
        }

        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);

    const requestPagination = await screen.findByRole("navigation", {
      name: "AI请求历史分页",
    });
    fireEvent.click(
      within(requestPagination).getByRole("button", { name: "下一页" }),
    );

    delayedRequestPage.resolve({
      code: 0,
      message: "ok",
      data: [
        {
          ...createRequestHistoryPayload()[0],
          requestedAt: "2026-06-17T09:00:00.000Z",
        },
      ],
      pagination: {
        page: 2,
        pageSize: 10,
        total: 20,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });
    expect(await screen.findByText("2026年6月17日 17:00")).toBeInTheDocument();

    delayedInitialResult.resolve({
      code: 0,
      message: "ok",
      data: {
        ...createResultHistoryPayload(),
        results: [
          {
            ...createResultHistoryPayload().results[0],
            contentReference: {
              ...createResultHistoryPayload().results[0].contentReference,
              contentPreviewMasked:
                "initial result completed after request page",
            },
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    });

    expect(
      await screen.findByText("initial result completed after request page"),
    ).toBeInTheDocument();
    expect(screen.queryByText("历史请求同步中")).not.toBeInTheDocument();
    expect(screen.queryByText("结果历史同步中")).not.toBeInTheDocument();
  });

  it("ignores a stale history response after rapid mode switching", async () => {
    let resolvePaperHistory!: (value: unknown) => void;
    const delayedPaperHistory = new Promise((resolve) => {
      resolvePaperHistory = resolve;
    });
    let questionHistoryRequestCount = 0;

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
            data: { generationAvailability: "closed" },
          };
        }

        if (url.startsWith("/api/v1/personal-ai-generation-requests")) {
          return { code: 0, message: "ok", data: [] };
        }

        if (url.includes("taskType=ai_paper_generation")) {
          return delayedPaperHistory;
        }

        if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
          questionHistoryRequestCount += 1;
          const payload = createResultHistoryPayload();

          return {
            code: 0,
            message: "ok",
            data:
              questionHistoryRequestCount === 1
                ? { ...payload, results: [] }
                : {
                    ...payload,
                    results: [
                      {
                        ...payload.results[0],
                        contentReference: {
                          ...payload.results[0].contentReference,
                          contentPreviewMasked: "latest question history",
                        },
                      },
                    ],
                  },
          };
        }

        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);
    const paperTab = await screen.findByRole("tab", { name: "AI组卷" });
    fireEvent.click(paperTab);
    fireEvent.click(screen.getByRole("tab", { name: "AI出题" }));

    expect(
      await screen.findByText("latest question history"),
    ).toBeInTheDocument();
    resolvePaperHistory({
      code: 0,
      message: "ok",
      data: {
        ...createResultHistoryPayload(),
        results: [
          {
            ...createResultHistoryPayload().results[0],
            contentReference: {
              ...createResultHistoryPayload().results[0].contentReference,
              contentPreviewMasked: "stale paper history",
            },
          },
        ],
      },
    });

    await waitFor(() => {
      expect(screen.queryByText("stale paper history")).not.toBeInTheDocument();
    });
    expect(screen.getAllByText("当前筛选：AI出题").length).toBeGreaterThan(0);
  });

  it.each(["personal", "organization"] as const)(
    "starts or resumes a persisted AI paper after refresh for the %s owner",
    async (ownerType) => {
      const paperHistory = createPaperResultHistoryPayload();
      const sessionPublicId = `ai_learning_session_${paperHistory.resultPublicId}`;
      const sessionQuestion = {
        sessionQuestionPublicId: `${sessionPublicId}_q_1`,
        sourceDraftNumber: 1,
        questionType: "single_choice",
        difficulty: "medium",
        knowledgeNodeLabels: ["专卖基础"],
        questionStem: "服务端恢复的自测题目",
        questionOptions: [
          { optionLabel: "A", optionText: "正确选项", isCorrect: null },
          { optionLabel: "B", optionText: "干扰选项", isCorrect: null },
        ],
        standardAnswerLabels: [],
        standardAnswerText: null,
        analysis: null,
        maxScore: "2.0",
        reviewStatus: "draft_review_required",
        questionGroup: {
          publicId: "question_group_public_ui_501",
          title: "供应链案例题组",
          materialSnapshot: {
            materialPublicId: "material_public_ui_501",
            title: "供应链案例材料",
            contentRichText: "服务端冻结的供应链材料正文",
          },
          memberQuestionPublicIds: [
            "platform_formal_question_ui_501",
            "platform_formal_question_ui_502",
          ],
          questionSortOrder: 1,
        },
      };
      const secondSessionQuestion = {
        ...sessionQuestion,
        sessionQuestionPublicId: `${sessionPublicId}_q_2`,
        sourceDraftNumber: 2,
        questionStem: "服务端恢复的自测题目二",
        questionGroup: {
          ...sessionQuestion.questionGroup,
          questionSortOrder: 2,
        },
      };
      const postBodies: unknown[] = [];

      studentRuntimeApiMock.fetchStudentApi.mockImplementation(
        async (url: string, _token: string | null, init?: RequestInit) => {
          if (url === "/api/v1/authorizations") {
            return {
              code: 0,
              message: "ok",
              data: createAdvancedAuthorizationListPayload(ownerType),
            };
          }

          if (url === "/api/v1/ai-generation/availability") {
            return {
              code: 0,
              message: "ok",
              data: { generationAvailability: "closed" },
            };
          }

          if (url.startsWith("/api/v1/personal-ai-generation-requests")) {
            return { code: 0, message: "ok", data: [] };
          }

          if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
            return {
              code: 0,
              message: "ok",
              data: url.includes("taskType=ai_paper_generation")
                ? paperHistory.payload
                : { ...paperHistory.payload, results: [] },
            };
          }

          if (
            url === "/api/v1/personal-ai-generation-learning-sessions" &&
            init?.method === "POST"
          ) {
            postBodies.push(JSON.parse(String(init.body)));
            return {
              code: 0,
              message: "ok",
              data: {
                status: "created",
                blockReason: null,
                session: {
                  sessionPublicId,
                  contentDomain: "personal_ai_learning",
                  sourceResultPublicId: paperHistory.resultPublicId,
                  sourceTaskPublicId: paperHistory.taskPublicId,
                  ownerType,
                  ownerPublicId:
                    ownerType === "organization"
                      ? "organization_public_ui_501"
                      : "student_public_ui_501",
                  actorPublicId: "student_public_ui_501",
                  lifecycleAvailability: "current",
                  sessionStatus: "in_progress",
                  sessionRevision: 1,
                  completedAt: null,
                  completionSummary: null,
                  evidenceStatus: "sufficient",
                  citationCount: 2,
                  questionCount: 2,
                  questions: [sessionQuestion, secondSessionQuestion],
                  formalWriteBoundary: {
                    questionWriteStatus: "blocked",
                    paperWriteStatus: "blocked",
                    practiceWriteStatus: "blocked",
                    answerRecordWriteStatus: "blocked",
                    examReportWriteStatus: "blocked",
                    mistakeBookWriteStatus: "blocked",
                  },
                  createdAt: "2026-07-12T10:30:00.000Z",
                },
              },
            };
          }

          if (
            new URL(url, "http://localhost").pathname ===
            `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress`
          ) {
            return {
              code: 0,
              message: "ok",
              data: {
                status: "ready",
                blockReason: null,
                progress: {
                  sessionPublicId,
                  lifecycleAvailability: "current",
                  sessionStatus: "in_progress",
                  sessionRevision: 1,
                  completedAt: null,
                  completionSummary: null,
                  questions: [sessionQuestion, secondSessionQuestion],
                  answerFeedbacks: [],
                },
              },
            };
          }

          if (
            url.startsWith(
              "/api/v1/personal-ai-generation-learning-sessions/statistics?",
            )
          ) {
            return {
              code: 0,
              message: "ok",
              data: {
                attemptCount: 1,
                inProgressCount: 1,
                completedCount: 0,
                completedQuestionCount: 0,
                submittedCount: 0,
                correctCount: 0,
                incorrectCount: 0,
                reviewRequiredCount: 0,
                completionRate: null,
                accuracyRate: null,
                score: "0.0",
                maxScore: "0.0",
              },
            };
          }

          if (
            url.startsWith("/api/v1/personal-ai-generation-learning-sessions?")
          ) {
            const page = Number(
              new URL(url, "https://tiku.local").searchParams.get("page"),
            );
            const isSecondPage = page === 2;
            return {
              code: 0,
              message: "ok",
              data: {
                sessions: [
                  {
                    sessionPublicId,
                    sourceResultPublicId: paperHistory.resultPublicId,
                    sourceTaskPublicId: paperHistory.taskPublicId,
                    lifecycleAvailability: "current",
                    sessionStatus: isSecondPage ? "completed" : "in_progress",
                    sessionRevision: isSecondPage ? 2 : 1,
                    questionCount: 2,
                    submittedCount: 0,
                    completionRate: 0,
                    score: null,
                    maxScore: null,
                    canResume: !isSecondPage,
                    canReview: isSecondPage,
                    canComplete: !isSecondPage,
                    createdAt: "2026-07-12T10:30:00.000Z",
                    updatedAt: "2026-07-12T10:30:00.000Z",
                    completedAt: isSecondPage
                      ? "2026-07-12T10:40:00.000Z"
                      : null,
                  },
                  ...(isSecondPage
                    ? [
                        {
                          sessionPublicId: `${sessionPublicId}_legacy`,
                          sourceResultPublicId: null,
                          sourceTaskPublicId: `${paperHistory.taskPublicId}_legacy`,
                          lifecycleAvailability: "legacy_unavailable",
                          sessionStatus: null,
                          sessionRevision: null,
                          questionCount: 1,
                          submittedCount: null,
                          completionRate: null,
                          score: null,
                          maxScore: null,
                          canResume: false,
                          canReview: false,
                          canComplete: false,
                          createdAt: "2026-07-01T10:30:00.000Z",
                          updatedAt: "2026-07-01T10:30:00.000Z",
                          completedAt: null,
                        },
                      ]
                    : []),
                ],
                page,
                pageSize: 10,
                total: 11,
                totalPages: 2,
              },
            };
          }

          return { code: 500019, message: "unexpected", data: null };
        },
      );

      render(<StudentPersonalAiGenerationPage />);
      const paperTab = await screen.findByRole("tab", { name: "AI组卷" });
      fireEvent.click(paperTab);
      fireEvent.click(
        await screen.findByRole("button", { name: "开始或继续自测" }),
      );

      expect(
        await screen.findByText("服务端恢复的自测题目"),
      ).toBeInTheDocument();
      expect(screen.getByText("服务端恢复的自测题目二")).toBeInTheDocument();
      expect(screen.getAllByText("供应链案例题组")).toHaveLength(1);
      expect(screen.getAllByText("服务端冻结的供应链材料正文")).toHaveLength(1);
      expect(
        screen.getByRole("button", { name: "完成本次学习" }),
      ).toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: "加载学习记录" }));
      expect(await screen.findByText("进行中的学习")).toBeInTheDocument();
      expect(
        screen.getByText("共 1 次 · 已完成 0 次 · 进行中 1 次"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "继续学习" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "完成学习" }),
      ).toBeInTheDocument();
      const learningHistoryPanel = screen.getByTestId(
        "student-ai-learning-history",
      );
      fireEvent.click(
        within(learningHistoryPanel).getByRole("button", { name: "下一页" }),
      );
      expect(
        await within(learningHistoryPanel).findByText("第 2 / 2 页"),
      ).toBeInTheDocument();
      const legacyHistoryRow = within(learningHistoryPanel)
        .getByText("历史学习记录（状态不可用）")
        .closest("div");
      expect(legacyHistoryRow).not.toBeNull();
      expect(
        within(legacyHistoryRow!).queryByRole("button"),
      ).not.toBeInTheDocument();
      fireEvent.click(
        within(learningHistoryPanel).getByRole("button", { name: "复核记录" }),
      );
      expect(
        await screen.findByText("服务端恢复的自测题目"),
      ).toBeInTheDocument();
      expect(postBodies).toEqual([
        {
          authorizationPublicId: "authorization_context_ui_501",
          sourceResultPublicId: paperHistory.resultPublicId,
        },
      ]);
      expect(studentRuntimeApiMock.fetchStudentApi).toHaveBeenCalledWith(
        `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress?authorizationPublicId=authorization_context_ui_501`,
        "local-session-token",
        { method: "GET" },
      );
    },
  );

  it("keeps only the latest historical learning action when two rows resolve out of order", async () => {
    const firstSessionPublicId = "learning_history_action_ui_001";
    const secondSessionPublicId = "learning_history_action_ui_002";
    const firstProgress = createDeferred<unknown>();
    const secondProgress = createDeferred<unknown>();

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
            data: { generationAvailability: "closed" },
          };
        }
        if (url.startsWith("/api/v1/personal-ai-generation-requests")) {
          return { code: 0, message: "ok", data: [] };
        }
        if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
          return {
            code: 0,
            message: "ok",
            data: { ...createResultHistoryPayload(), results: [] },
          };
        }
        if (
          url.startsWith(
            "/api/v1/personal-ai-generation-learning-sessions/statistics?",
          )
        ) {
          return createLearningStatisticsResponse();
        }
        if (
          url.startsWith("/api/v1/personal-ai-generation-learning-sessions?")
        ) {
          return {
            code: 0,
            message: "ok",
            data: {
              sessions: [
                createLearningHistorySession(firstSessionPublicId),
                createLearningHistorySession(secondSessionPublicId),
              ],
              page: 1,
              pageSize: 10,
              total: 2,
              totalPages: 1,
            },
          };
        }
        if (url.includes(`/${firstSessionPublicId}/progress?`)) {
          return firstProgress.promise;
        }
        if (url.includes(`/${secondSessionPublicId}/progress?`)) {
          return secondProgress.promise;
        }
        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);
    const resumeButtons = await screen.findAllByRole("button", {
      name: "继续学习",
    });
    fireEvent.click(resumeButtons[0]!);
    fireEvent.click(resumeButtons[1]!);

    firstProgress.resolve(createLearningProgressResponse(firstSessionPublicId));
    await waitFor(() => {
      expect(resumeButtons[1]).toBeDisabled();
      expect(
        screen.queryByText(`服务端学习题目 ${firstSessionPublicId}`),
      ).not.toBeInTheDocument();
    });

    secondProgress.resolve(
      createLearningProgressResponse(secondSessionPublicId),
    );
    expect(
      await screen.findByText(`服务端学习题目 ${secondSessionPublicId}`),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(`服务端学习题目 ${firstSessionPublicId}`),
    ).not.toBeInTheDocument();
  });

  it("submits one completion while in flight and refreshes exact progress and lifecycle after a conflict", async () => {
    const sessionPublicId = "learning_completion_ui_001";
    const question = createLearningHistoryQuestion(sessionPublicId);
    const completion = createDeferred<unknown>();
    let progressReadCount = 0;
    let historyReadCount = 0;
    let statisticsReadCount = 0;
    let completionWriteCount = 0;
    const answerFeedback = {
      status: "scored",
      blockReason: null,
      sessionPublicId,
      sessionQuestionPublicId: question.sessionQuestionPublicId,
      actorPublicId: "student_public_ui_501",
      answerRevision: 1,
      selectedOptionLabels: ["A"],
      textAnswer: null,
      isCorrect: true,
      score: "1.0",
      maxScore: "1.0",
      standardAnswerLabels: ["A"],
      standardAnswerText: null,
      analysis: "服务端解析",
      aiScoringStatus: "blocked",
      formalWriteBoundary: {
        questionWriteStatus: "blocked",
        paperWriteStatus: "blocked",
        practiceWriteStatus: "blocked",
        answerRecordWriteStatus: "blocked",
        examReportWriteStatus: "blocked",
        mistakeBookWriteStatus: "blocked",
      },
      mistakeBookPublicId: null,
      submittedAt: "2026-07-24T08:05:00.000Z",
    };

    studentRuntimeApiMock.fetchStudentApi.mockImplementation(
      async (url: string, _token: string | null, init?: RequestInit) => {
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
            data: { generationAvailability: "closed" },
          };
        }
        if (url.startsWith("/api/v1/personal-ai-generation-requests")) {
          return { code: 0, message: "ok", data: [] };
        }
        if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
          return {
            code: 0,
            message: "ok",
            data: { ...createResultHistoryPayload(), results: [] },
          };
        }
        if (
          url.startsWith(
            "/api/v1/personal-ai-generation-learning-sessions/statistics?",
          )
        ) {
          statisticsReadCount += 1;
          return createLearningStatisticsResponse();
        }
        if (
          url.startsWith("/api/v1/personal-ai-generation-learning-sessions?")
        ) {
          historyReadCount += 1;
          return {
            code: 0,
            message: "ok",
            data: {
              sessions: [createLearningHistorySession(sessionPublicId)],
              page: 1,
              pageSize: 10,
              total: 1,
              totalPages: 1,
            },
          };
        }
        if (url.includes(`/${sessionPublicId}/progress?`)) {
          progressReadCount += 1;
          return createLearningProgressResponse(sessionPublicId, [
            answerFeedback,
          ]);
        }
        if (
          new URL(url, "https://tiku.local").pathname.endsWith(
            `/${sessionPublicId}/complete`,
          ) &&
          init?.method === "POST"
        ) {
          completionWriteCount += 1;
          return completion.promise;
        }
        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);
    fireEvent.click(await screen.findByRole("button", { name: "继续学习" }));
    const completeButton = await screen.findByRole("button", {
      name: "完成本次学习",
    });
    expect(completeButton).toBeEnabled();
    fireEvent.click(completeButton);
    fireEvent.click(completeButton);
    await waitFor(() => {
      expect(completionWriteCount).toBe(1);
    });

    completion.resolve({
      code: 409019,
      message: "conflict",
      data: {
        status: "blocked",
        blockReason: "session_revision_conflict",
        sessionRevision: null,
        completedAt: null,
        completionSummary: null,
      },
    });

    await waitFor(() => {
      expect(progressReadCount).toBeGreaterThanOrEqual(2);
      expect(historyReadCount).toBeGreaterThanOrEqual(2);
      expect(statisticsReadCount).toBeGreaterThanOrEqual(2);
    });
  });

  it("starts an immutable learning session from an AI question result", async () => {
    const result = createResultHistoryPayload().results[0];
    const sessionPublicId = `ai_learning_session_${result.resultPublicId}`;
    const question = {
      sessionQuestionPublicId: `${sessionPublicId}_q_1`,
      sourceDraftNumber: 1,
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["专卖基础"],
      questionStem: "服务端冻结的 AI 出题练习",
      questionOptions: [
        { optionLabel: "A", optionText: "正确选项" },
        { optionLabel: "B", optionText: "干扰选项" },
      ],
      maxScore: "1.0",
      reviewStatus: "draft_review_required",
    };
    const postBodies: unknown[] = [];

    studentRuntimeApiMock.fetchStudentApi.mockImplementation(
      async (url: string, _token: string | null, init?: RequestInit) => {
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
            data: { generationAvailability: "closed" },
          };
        }
        if (url.startsWith("/api/v1/personal-ai-generation-requests")) {
          return { code: 0, message: "ok", data: [] };
        }
        if (url.startsWith("/api/v1/personal-ai-generation-results?")) {
          return { code: 0, message: "ok", data: createResultHistoryPayload() };
        }
        if (
          url === "/api/v1/personal-ai-generation-learning-sessions" &&
          init?.method === "POST"
        ) {
          postBodies.push(JSON.parse(String(init.body)));
          return {
            code: 0,
            message: "ok",
            data: {
              status: "created",
              blockReason: null,
              session: {
                sessionPublicId,
                sourceResultPublicId: result.resultPublicId,
                sourceTaskPublicId: result.taskPublicId,
                ownerType: "personal",
                ownerPublicId: "student_public_ui_501",
                actorPublicId: "student_public_ui_501",
                lifecycleAvailability: "current",
                sessionStatus: "in_progress",
                sessionRevision: 1,
                completedAt: null,
                completionSummary: null,
                questions: [question],
              },
            },
          };
        }
        if (url.includes(`/${sessionPublicId}/progress?`)) {
          return {
            code: 0,
            message: "ok",
            data: {
              status: "ready",
              blockReason: null,
              progress: {
                sessionPublicId,
                lifecycleAvailability: "current",
                sessionStatus: "in_progress",
                sessionRevision: 1,
                completedAt: null,
                completionSummary: null,
                questions: [question],
                answerFeedbacks: [],
              },
            },
          };
        }
        return { code: 500019, message: "unexpected", data: null };
      },
    );

    render(<StudentPersonalAiGenerationPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: "开始或继续自测" }),
    );

    expect(
      await screen.findByText("服务端冻结的 AI 出题练习"),
    ).toBeInTheDocument();
    expect(postBodies).toEqual([
      {
        authorizationPublicId: "authorization_context_ui_501",
        sourceResultPublicId: result.resultPublicId,
      },
    ]);
  });

  it("localizes profession and learner-facing dates", async () => {
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

    expect(
      await screen.findByRole("radio", {
        name: "个人授权 · 高级版 · 专卖 3级",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("到期 2027年6月14日")).toBeInTheDocument();
    expect(screen.getByText("2026年6月14日 17:00")).toBeInTheDocument();
    expect(screen.getByText("2026年6月14日 18:00")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("monopoly");
    expect(document.body).not.toHaveTextContent("2026-06-14T09:00:00.000Z");
  });

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
        "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization_context_ui_501",
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
        "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization_context_ui_501",
        "local-session-token",
        {
          method: "GET",
        },
      );
    });
    expect(await screen.findByText("2026年6月14日 17:00")).toBeInTheDocument();
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
        "/api/v1/personal-ai-generation-results/personal_ai_result_public_ui_501?authorizationPublicId=authorization_context_ui_501",
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
