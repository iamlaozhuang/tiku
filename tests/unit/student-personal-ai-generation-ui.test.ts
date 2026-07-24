import { createElement } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StudentPersonalAiGenerationPage } from "@/features/student/ai-generation/StudentPersonalAiGenerationPage";
import { COOKIE_BACKED_SESSION_MARKER } from "@/features/student/studentRuntimeApi";
import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperQuestionSourceKind,
} from "@/server/contracts/ai-paper-plan-and-select-contract";
import type {
  EffectiveAuthorizationCapabilitiesDto,
  EffectiveAuthorizationContextDto,
} from "@/server/contracts/effective-authorization-contract";
import type {
  PersonalAiGenerationLearningFormalWriteBoundaryDto,
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionQuestionDto,
} from "@/server/contracts/personal-ai-generation-learning-session-contract";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "@/server/contracts/route-integrated-provider-execution-contract";
import {
  collectPersonalAiLearningQuestionDrafts,
  createPersonalAiLearningSessionQuestion,
} from "@/server/validators/personal-ai-generation-learning-session";

vi.mock("@/features/student/studentRuntimeApi", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/student/studentRuntimeApi")
    >();

  return {
    ...actual,
    async fetchStudentApi<TData>(
      path: string,
      sessionToken: string | null,
      init: RequestInit = {},
    ) {
      if (path === "/api/v1/ai-generation/availability") {
        return {
          code: 0,
          message: "ok",
          data: { generationAvailability: "available" } as TData,
        };
      }

      return actual.fetchStudentApi<TData>(path, sessionToken, init);
    },
  };
});

const pageTitle = "AI训练";
const aiPaperTabLabel = "AI组卷";
const requestButtonLabel = "生成练习题草稿";
const paperButtonLabel = "生成自测试卷";
const employeePaperButtonLabel = "生成企业自测试卷";
const blockedTitle = "\u8bf7\u6c42\u5df2\u963b\u65ad";
const unauthorizedTitle = "\u8bf7\u5148\u767b\u5f55";
const unavailableTitle =
  "\u5f53\u524d\u6388\u6743\u6682\u672a\u5f00\u653e AI \u8bad\u7ec3";
const historyTitle = "\u751f\u6210\u8bf7\u6c42\u5386\u53f2\u8bb0\u5f55";
const resultHistoryTitle = "\u8bad\u7ec3\u7ed3\u679c\u5386\u53f2\u8bb0\u5f55";
const historyEmptyTitle = "\u6682\u65e0\u5386\u53f2\u8bf7\u6c42";
const historyErrorTitle = "\u5386\u53f2\u8bf7\u6c42\u6682\u4e0d\u53ef\u7528";
const localSessionUserPublicId = "user-dev-student";
const workspaceRoot = process.cwd();

const serverHistoryResponse = {
  code: 0,
  message: "ok",
  data: [
    {
      requestPublicId: "personal-ai-request-public-initial-001",
      taskPublicId: "ai-generation-task-public-initial-001",
      status: "succeeded",
      requestedAt: "2026-06-12T10:00:00.000Z",
      taskType: "ai_question_generation",
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
      taskType: "ai_question_generation",
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

const emptyResultHistoryResponse = {
  code: 0,
  message: "ok",
  data: {
    runtimeStatus: "local_contract_only",
    contentVisibility: "redacted_snapshot",
    redactionStatus: "redacted",
    formalAdoptionWriteStatus: "blocked_without_follow_up_task",
    results: [],
  },
};

const emptyAiKnowledgeNodeOptionsResponse = {
  code: 0,
  message: "ok",
  data: {
    knowledgeNodes: [],
  },
  pagination: {
    page: 1,
    pageSize: 100,
    total: 0,
    sortBy: "sortOrder",
    sortOrder: "asc",
  },
};

const marketingAiKnowledgeNodeOptionsResponse = {
  code: 0,
  message: "ok",
  data: {
    knowledgeNodes: [
      {
        publicId: "knowledge-node-public-marketing-3",
        parentKnowledgeNodePublicId: null,
        profession: "marketing",
        levelList: [3],
        name: "市场调研",
        pathName: "营销/基础知识/市场调研",
        sortOrder: 10,
        knStatus: "active",
        questionCount: 0,
        isRecommendable: true,
        updatedAt: "2026-07-08T10:00:00.000Z",
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 100,
    total: 1,
    sortBy: "sortOrder",
    sortOrder: "asc",
  },
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
      isFormalAdoptionBlocked: true,
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
    runtimeBridge: {
      bridgeStatus: "provider_call_blocked",
      bridgeMode: "default_blocked",
      runnerMode: "provider_call_blocked_runner",
      localSwitchRequired: true,
      explicitLocalSwitchPresent: false,
      realProviderExecutionApproved: false,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      providerRetryAttempted: false,
      providerStreamingEnabled: false,
      costCalibrationExecuted: false,
      redactionStatus: "redacted",
      providerMetadata: {
        modelProvider: "openai_compatible",
        providerName: "alibaba-qwen",
        modelName: "qwen3.7-max",
        baseUrlHost: "dashscope.aliyuncs.com",
        envKeyAlias: "ALIBABA_API_KEY",
      },
      redactionProbe: {
        requestContext: {
          redactionStatus: "redacted",
          reason: "user_answer",
        },
        modelOutput: {
          redactionStatus: "redacted",
          reason: "model_output",
        },
        providerRequestPayload: null,
        providerResponsePayload: null,
        providerErrorPayload: null,
      },
      providerExecutionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "provider_call_blocked",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      resultMaterializationSummary: {
        materializationStatus: "not_requested",
        failureCategory: "not_requested",
        resultPublicId: null,
        contentDigest: null,
        contentPreviewMasked: null,
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        evidenceStatus: "none",
        citationCount: 0,
        formalAdoptionStatus: "blocked",
      },
      visibleGeneratedContent: null,
      blockedReasons: ["provider_call_blocked"],
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
          ownerPublicId: "student-public-001",
          organizationPublicId: null,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: "student-public-001",
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
          isFormalAdoptionBlocked: true,
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

const employeeSessionResponse = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "employee-session-user-public-123",
      phone: "13900000003",
      name: "Organization Employee",
      userType: "employee",
      status: "active",
      lockedUntilAt: null,
      employeePublicId: "employee-public-123",
      organizationPublicId: "organization-public-123",
      adminPublicId: null,
      adminRoles: [],
    },
    session: {
      expiresAt: "2026-06-19T12:00:00.000Z",
    },
  },
};

const baseAuthorizationCapabilities = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
} satisfies EffectiveAuthorizationCapabilitiesDto;

type AuthorizationContextOverrides = Omit<
  Partial<EffectiveAuthorizationContextDto>,
  "capabilities"
> & {
  capabilities?: Partial<EffectiveAuthorizationCapabilitiesDto>;
};

function createAuthorizationContext(
  overrides: AuthorizationContextOverrides = {},
): EffectiveAuthorizationContextDto {
  return {
    profession: "monopoly",
    level: 3,
    contextDisplayStatus: "display_only",
    edition: "advanced",
    effectiveEdition: "advanced",
    upgradeStatus: "none",
    expiresAt: "2027-06-23T00:00:00.000Z",
    displayStatus: "active",
    authorizationSource: "personal_auth",
    authorizationPublicId: "authorization-context-ui-001",
    ownerType: "personal",
    ownerPublicId: "student-public-ui-001",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student-public-ui-001",
    blockedReason: null,
    ...overrides,
    capabilities: {
      ...baseAuthorizationCapabilities,
      canGenerateAiQuestion: true,
      canGenerateAiPaper: true,
      ...(overrides.capabilities ?? {}),
    },
  };
}

function createAdvancedAuthorizationListResponse(
  overrides: AuthorizationContextOverrides = {},
) {
  return createAuthorizationListResponse([
    createAuthorizationContext(overrides),
  ]);
}

function createPersonalAndOrganizationAdvancedAuthorizationListResponse() {
  return createAuthorizationListResponse([
    createAuthorizationContext({
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal-auth-context-dual-001",
      ownerType: "personal",
      ownerPublicId: "employee-session-user-public-123",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "employee-session-user-public-123",
    }),
    createAuthorizationContext({
      authorizationSource: "org_auth",
      authorizationPublicId: "org-auth-context-dual-001",
      ownerType: "organization",
      ownerPublicId: "organization-public-123",
      organizationPublicId: "organization-public-123",
      quotaOwnerType: "organization",
      quotaOwnerPublicId: "organization-public-123",
    }),
  ]);
}

function createAuthorizationListResponse(
  authorizationContexts: EffectiveAuthorizationContextDto[],
) {
  return {
    code: 0,
    message: "ok",
    data: {
      authorizations: [],
      effectiveAuthorizations: [],
      authorizationContexts,
    },
  };
}

function createPersonalAiGenerationFetchMock(
  experienceResponse: unknown = localExperienceResponse,
  historyResponse: unknown = emptyServerHistoryResponse,
  learningSessionObservers: {
    onAnswerSubmitBody?: (body: Record<string, unknown>) => void;
  } = {},
) {
  const learningSessionMockState = createPersonalAiLearningSessionMockState();

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

    if (path === "/api/v1/authorizations") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => createAdvancedAuthorizationListResponse(),
      };
    }

    if (path.startsWith("/api/v1/ai-generation/knowledge-nodes?")) {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => emptyAiKnowledgeNodeOptionsResponse,
      };
    }

    if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
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

    if (path.startsWith("/api/v1/personal-ai-generation-results")) {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => emptyResultHistoryResponse,
      };
    }

    const learningSessionResponse = await handlePersonalAiLearningSessionFetch({
      actorPublicId: localSessionUserPublicId,
      init,
      ownerPublicId: "student-public-ui-001",
      ownerType: "personal",
      path,
      persistedSourceTaskPublicId:
        readMockExperienceSourceTaskPublicId(experienceResponse),
      persistedVisibleGeneratedContent:
        readMockExperienceVisibleGeneratedContent(experienceResponse),
      onAnswerSubmitBody: learningSessionObservers.onAnswerSubmitBody,
      state: learningSessionMockState,
    });

    if (learningSessionResponse !== null) {
      return learningSessionResponse;
    }

    throw new Error(`Unexpected fetch path: ${path}`);
  });
}

function createPersonalAiGenerationFetchMockWithHistorySequence(
  historyResponses: unknown[],
  experienceResponse: unknown = localExperienceResponse,
) {
  const remainingHistoryResponses = [...historyResponses];
  const learningSessionMockState = createPersonalAiLearningSessionMockState();

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

    if (path === "/api/v1/authorizations") {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => createAdvancedAuthorizationListResponse(),
      };
    }

    if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
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

    if (path.startsWith("/api/v1/personal-ai-generation-results")) {
      expect(init?.method).toBe("GET");
      expect(init?.headers).toMatchObject({
        authorization: "Bearer unit-test-session-token",
      });

      return {
        ok: true,
        status: 200,
        json: async () => emptyResultHistoryResponse,
      };
    }

    const learningSessionResponse = await handlePersonalAiLearningSessionFetch({
      actorPublicId: localSessionUserPublicId,
      init,
      ownerPublicId: "student-public-ui-001",
      ownerType: "personal",
      path,
      persistedSourceTaskPublicId:
        readMockExperienceSourceTaskPublicId(experienceResponse),
      persistedVisibleGeneratedContent:
        readMockExperienceVisibleGeneratedContent(experienceResponse),
      state: learningSessionMockState,
    });

    if (learningSessionResponse !== null) {
      return learningSessionResponse;
    }

    throw new Error(`Unexpected fetch path: ${path}`);
  });
}

function createLearningSessionFormalWriteBoundary(): PersonalAiGenerationLearningFormalWriteBoundaryDto {
  return {
    questionWriteStatus: "blocked",
    paperWriteStatus: "blocked",
    practiceWriteStatus: "blocked",
    answerRecordWriteStatus: "blocked",
    examReportWriteStatus: "blocked",
    mistakeBookWriteStatus: "blocked",
  };
}

function createLearnerAiPaperAssemblyContainer(input: {
  selectedQuestionCount: number;
  sourceKind?: Exclude<AiPaperQuestionSourceKind, "ai_generated_draft">;
  enterpriseTrainingSnapshotCount?: number;
}): AiPaperPlanAndSelectContainerDto {
  const selectedQuestions = Array.from(
    { length: input.selectedQuestionCount },
    (_, index) => ({
      questionPublicId: `formal-question-public-${index + 1}`,
      sourceKind: input.sourceKind ?? "platform_formal_question",
      matchTier: "exact" as const,
      score: 1,
    }),
  );

  return {
    title: "synthetic assembled learner paper",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    requestedQuestionCount: input.selectedQuestionCount,
    selectedQuestionCount: input.selectedQuestionCount,
    sourceComposition: {
      platformFormalQuestionCount:
        input.sourceKind === "enterprise_training_snapshot"
          ? 0
          : input.selectedQuestionCount,
      enterpriseTrainingSnapshotCount:
        input.enterpriseTrainingSnapshotCount ??
        (input.sourceKind === "enterprise_training_snapshot"
          ? input.selectedQuestionCount
          : 0),
    },
    matchQuality:
      input.selectedQuestionCount > 0 ? "fully_matched" : "insufficient",
    constraintLineage: {
      request: {
        difficulty: "medium",
        knowledgeNodePublicIds: ["knowledge_node_public_a"],
      },
      plan: {
        difficulty: "medium",
        knowledgeNodePublicIds: ["knowledge_node_public_a"],
        parentKnowledgeNodePublicIds: [],
      },
    },
    sections: [
      {
        sectionKey: "single_choice",
        title: "synthetic assembled paper section",
        questionType: "single_choice",
        targetQuestionCount: input.selectedQuestionCount,
        selectedQuestionCount: input.selectedQuestionCount,
        selectedQuestions,
        degradationSummary: {
          exactCount: input.selectedQuestionCount,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
    ],
  };
}

function createLearningSessionQuestion(input: {
  sessionPublicId: string;
  questionStem: string;
  correctOptionLabel: string;
  correctOptionText: string;
  wrongOptionLabel: string;
  wrongOptionText: string;
  analysis: string;
}): PersonalAiGenerationLearningSessionQuestionDto {
  return {
    sessionQuestionPublicId: `${input.sessionPublicId}_q_1`,
    sourceDraftNumber: 1,
    questionType: "single_choice",
    difficulty: "medium",
    knowledgeNodeLabels: ["synthetic knowledge node"],
    questionStem: input.questionStem,
    questionOptions: [
      {
        optionLabel: input.correctOptionLabel,
        optionText: input.correctOptionText,
        isCorrect: true,
      },
      {
        optionLabel: input.wrongOptionLabel,
        optionText: input.wrongOptionText,
        isCorrect: false,
      },
    ],
    standardAnswerLabels: [input.correctOptionLabel],
    standardAnswerText: input.correctOptionLabel,
    analysis: input.analysis,
    maxScore: "1.0",
    reviewStatus: "draft_review_required",
  };
}

function createLearningSessionCreatedResponse(input: {
  sessionPublicId: string;
  sourceResultPublicId: string;
  sourceTaskPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  actorPublicId: string;
  question?: PersonalAiGenerationLearningSessionQuestionDto;
  questions?: PersonalAiGenerationLearningSessionQuestionDto[];
}) {
  const questions = input.questions ?? (input.question ? [input.question] : []);

  return {
    code: 0,
    message: "ok",
    data: {
      status: "created",
      blockReason: null,
      session: {
        sessionPublicId: input.sessionPublicId,
        contentDomain: "personal_ai_learning",
        sourceResultPublicId: input.sourceResultPublicId,
        sourceTaskPublicId: input.sourceTaskPublicId,
        ownerType: input.ownerType,
        ownerPublicId: input.ownerPublicId,
        actorPublicId: input.actorPublicId,
        evidenceStatus: "sufficient",
        citationCount: 2,
        questionCount: questions.length,
        questions,
        formalWriteBoundary: createLearningSessionFormalWriteBoundary(),
        createdAt: "2026-07-06T03:50:00.000Z",
      },
    },
  };
}

function createLearningAnswerFeedbackResponse(input: {
  sessionPublicId: string;
  actorPublicId: string;
  question: PersonalAiGenerationLearningSessionQuestionDto;
  selectedOptionLabels: string[];
  answerRevision?: number;
  textAnswer?: string | null;
}): {
  code: 0;
  message: "ok";
  data: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
} {
  const isCorrect =
    input.selectedOptionLabels.join("|") ===
    input.question.standardAnswerLabels.join("|");
  const isSubjective = [
    "fill_blank",
    "short_answer",
    "case_analysis",
    "calculation",
  ].includes(input.question.questionType);

  return {
    code: 0,
    message: "ok",
    data: {
      status: isSubjective ? "submitted_review_required" : "scored",
      blockReason: null,
      answerRevision: input.answerRevision ?? 1,
      sessionPublicId: input.sessionPublicId,
      sessionQuestionPublicId: input.question.sessionQuestionPublicId,
      actorPublicId: input.actorPublicId,
      selectedOptionLabels: input.selectedOptionLabels,
      textAnswer: input.textAnswer?.trim() || null,
      isCorrect: isSubjective ? null : isCorrect,
      score: isSubjective ? null : isCorrect ? "1.0" : "0.0",
      maxScore: "1.0",
      standardAnswerLabels: input.question.standardAnswerLabels,
      standardAnswerText: input.question.standardAnswerText,
      analysis: input.question.analysis,
      aiScoringStatus: "blocked",
      formalWriteBoundary: createLearningSessionFormalWriteBoundary(),
      mistakeBookPublicId: null,
      submittedAt: "2026-07-06T03:51:00.000Z",
    },
  };
}

function createLearningProgressResponse(input: {
  sessionPublicId: string;
  sourceResultPublicId: string;
  sourceTaskPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  actorPublicId: string;
  answerFeedback?: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
  answerFeedbacks?: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  questionCount?: number;
}) {
  const answerFeedbacks =
    input.answerFeedbacks ??
    (input.answerFeedback ? [input.answerFeedback] : []);
  const correctCount = answerFeedbacks.filter(
    (answerFeedback) => answerFeedback.isCorrect === true,
  ).length;
  const submittedCount = answerFeedbacks.length;
  const questionCount = input.questionCount ?? submittedCount;
  const score = answerFeedbacks
    .reduce(
      (totalScore, answerFeedback) =>
        totalScore + Number(answerFeedback.score ?? "0"),
      0,
    )
    .toFixed(1);
  const maxScore = answerFeedbacks
    .reduce(
      (totalScore, answerFeedback) =>
        totalScore + Number(answerFeedback.maxScore ?? "0"),
      0,
    )
    .toFixed(1);

  return {
    code: 0,
    message: "ok",
    data: {
      status: "ready",
      blockReason: null,
      progress: {
        sessionPublicId: input.sessionPublicId,
        contentDomain: "personal_ai_learning",
        sourceResultPublicId: input.sourceResultPublicId,
        sourceTaskPublicId: input.sourceTaskPublicId,
        ownerType: input.ownerType,
        ownerPublicId: input.ownerPublicId,
        actorPublicId: input.actorPublicId,
        persistenceStatus: "repository_persisted",
        resumeStatus: "resumable",
        evidenceStatus: "sufficient",
        citationCount: 2,
        questionCount,
        answerFeedbacks,
        statistics: {
          questionCount,
          submittedCount,
          correctCount,
          incorrectCount: submittedCount - correctCount,
          reviewRequiredCount: 0,
          completionRate:
            questionCount > 0 ? submittedCount / questionCount : 0,
          accuracyRate:
            submittedCount > 0 ? correctCount / submittedCount : null,
          score,
          maxScore,
          updatedAt: "2026-07-06T03:52:00.000Z",
        },
        formalWriteBoundary: createLearningSessionFormalWriteBoundary(),
        createdAt: "2026-07-06T03:50:00.000Z",
      },
    },
  };
}

type PersonalAiLearningSessionFetchResponse = {
  ok: true;
  status: 200;
  json: () => Promise<unknown>;
};

type PersonalAiLearningSessionMockSession = {
  sessionPublicId: string;
  sourceResultPublicId: string;
  sourceTaskPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  actorPublicId: string;
  questions: PersonalAiGenerationLearningSessionQuestionDto[];
  answerFeedbacksByQuestionPublicId: Map<
    string,
    PersonalAiGenerationLearningSessionAnswerFeedbackDto
  >;
};

type PersonalAiLearningSessionMockState = {
  sessionsByPublicId: Map<string, PersonalAiLearningSessionMockSession>;
};

function createPersonalAiLearningSessionMockState(): PersonalAiLearningSessionMockState {
  return {
    sessionsByPublicId: new Map(),
  };
}

async function handlePersonalAiLearningSessionFetch(input: {
  actorPublicId: string;
  init: RequestInit | undefined;
  onAnswerSubmitBody?: (body: Record<string, unknown>) => void;
  onProgressUrl?: (path: string) => void;
  onSessionCreateBody?: (body: Record<string, unknown>) => void;
  ownerPublicId: string;
  ownerType: "personal" | "organization";
  path: string;
  persistedSourceTaskPublicId?: string | null;
  persistedVisibleGeneratedContent?: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
  state: PersonalAiLearningSessionMockState;
}): Promise<PersonalAiLearningSessionFetchResponse | null> {
  const basePath = "/api/v1/personal-ai-generation-learning-sessions";
  const routePath = new URL(input.path, "http://localhost").pathname;

  if (routePath === basePath) {
    expect(input.init?.method).toBe("POST");
    expect(input.init?.headers).toMatchObject({
      authorization: "Bearer unit-test-session-token",
      "content-type": "application/json",
    });

    const body = readPersonalAiLearningSessionJsonBody(input.init);
    input.onSessionCreateBody?.(body);

    const sourceResultPublicId = String(body.sourceResultPublicId);
    const sessionPublicId =
      typeof body.sessionPublicId === "string"
        ? body.sessionPublicId
        : `ai_learning_session_${sourceResultPublicId}`;
    const existingSession = input.state.sessionsByPublicId.get(sessionPublicId);

    if (existingSession !== undefined) {
      return {
        ok: true,
        status: 200,
        json: async () =>
          createLearningSessionCreatedResponse({
            actorPublicId: existingSession.actorPublicId,
            ownerPublicId: existingSession.ownerPublicId,
            ownerType: existingSession.ownerType,
            questions: existingSession.questions,
            sessionPublicId: existingSession.sessionPublicId,
            sourceResultPublicId: existingSession.sourceResultPublicId,
            sourceTaskPublicId: existingSession.sourceTaskPublicId,
          }),
      };
    }
    const sourceTaskPublicId =
      typeof body.sourceTaskPublicId === "string"
        ? body.sourceTaskPublicId
        : (input.persistedSourceTaskPublicId ?? "persisted_task_public_id");
    const visibleGeneratedContent =
      (body.visibleGeneratedContent as
        | AiGenerationRouteIntegratedVisibleGeneratedContent
        | undefined) ?? input.persistedVisibleGeneratedContent;
    const questions =
      visibleGeneratedContent == null
        ? []
        : createPersonalAiLearningSessionQuestions({
            sessionPublicId,
            visibleGeneratedContent,
          });
    const session: PersonalAiLearningSessionMockSession = {
      actorPublicId: input.actorPublicId,
      answerFeedbacksByQuestionPublicId: new Map(),
      ownerPublicId: input.ownerPublicId,
      ownerType: input.ownerType,
      questions,
      sessionPublicId,
      sourceResultPublicId,
      sourceTaskPublicId,
    };
    input.state.sessionsByPublicId.set(sessionPublicId, session);

    return {
      ok: true,
      status: 200,
      json: async () =>
        createLearningSessionCreatedResponse({
          actorPublicId: input.actorPublicId,
          ownerPublicId: input.ownerPublicId,
          ownerType: input.ownerType,
          questions,
          sessionPublicId,
          sourceResultPublicId,
          sourceTaskPublicId,
        }),
    };
  }

  const answersSuffix = "/answers";
  const progressSuffix = "/progress";

  if (
    routePath.startsWith(`${basePath}/`) &&
    routePath.endsWith(answersSuffix)
  ) {
    expect(input.init?.method).toBe("POST");
    expect(input.init?.headers).toMatchObject({
      authorization: "Bearer unit-test-session-token",
      "content-type": "application/json",
    });

    const sessionPublicId = routePath.slice(
      `${basePath}/`.length,
      -answersSuffix.length,
    );
    const session = input.state.sessionsByPublicId.get(sessionPublicId);
    const body = readPersonalAiLearningSessionJsonBody(input.init);
    input.onAnswerSubmitBody?.(body);
    const question = session?.questions.find(
      (sessionQuestion) =>
        sessionQuestion.sessionQuestionPublicId ===
        String(body.sessionQuestionPublicId),
    );

    if (!session || !question) {
      throw new Error(`Unexpected learning session answer path: ${input.path}`);
    }

    const selectedOptionLabels = Array.isArray(body.selectedOptionLabels)
      ? body.selectedOptionLabels.map((label) => String(label))
      : [];
    const response = createLearningAnswerFeedbackResponse({
      actorPublicId: session.actorPublicId,
      answerRevision: Number(body.expectedAnswerRevision) + 1,
      question,
      selectedOptionLabels,
      sessionPublicId,
      textAnswer: typeof body.textAnswer === "string" ? body.textAnswer : null,
    });
    session.answerFeedbacksByQuestionPublicId.set(
      question.sessionQuestionPublicId,
      response.data,
    );

    return {
      ok: true,
      status: 200,
      json: async () => response,
    };
  }

  if (
    routePath.startsWith(`${basePath}/`) &&
    routePath.endsWith(progressSuffix)
  ) {
    expect(input.init?.method).toBe("GET");
    expect(input.init?.headers).toMatchObject({
      authorization: "Bearer unit-test-session-token",
    });

    input.onProgressUrl?.(input.path);
    const sessionPublicId = routePath.slice(
      `${basePath}/`.length,
      -progressSuffix.length,
    );
    const session = input.state.sessionsByPublicId.get(sessionPublicId);

    if (!session) {
      throw new Error(
        `Unexpected learning session progress path: ${input.path}`,
      );
    }

    return {
      ok: true,
      status: 200,
      json: async () =>
        createLearningProgressResponse({
          actorPublicId: session.actorPublicId,
          answerFeedbacks: Array.from(
            session.answerFeedbacksByQuestionPublicId.values(),
          ),
          ownerPublicId: session.ownerPublicId,
          ownerType: session.ownerType,
          questionCount: session.questions.length,
          sessionPublicId,
          sourceResultPublicId: session.sourceResultPublicId,
          sourceTaskPublicId: session.sourceTaskPublicId,
        }),
    };
  }

  return null;
}

function readMockExperienceVisibleGeneratedContent(
  experienceResponse: unknown,
): AiGenerationRouteIntegratedVisibleGeneratedContent | null {
  if (typeof experienceResponse !== "object" || experienceResponse === null) {
    return null;
  }

  const data = (experienceResponse as { data?: unknown }).data;

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const runtimeBridge = (data as { runtimeBridge?: unknown }).runtimeBridge;

  if (typeof runtimeBridge !== "object" || runtimeBridge === null) {
    return null;
  }

  return (runtimeBridge as { visibleGeneratedContent?: unknown })
    .visibleGeneratedContent as AiGenerationRouteIntegratedVisibleGeneratedContent | null;
}

function readMockExperienceSourceTaskPublicId(
  experienceResponse: unknown,
): string | null {
  if (typeof experienceResponse !== "object" || experienceResponse === null) {
    return null;
  }

  const data = (experienceResponse as { data?: unknown }).data;

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const resultState = (data as { resultState?: unknown }).resultState;

  if (typeof resultState !== "object" || resultState === null) {
    return null;
  }

  const taskPublicId = (resultState as { taskPublicId?: unknown }).taskPublicId;

  return typeof taskPublicId === "string" ? taskPublicId : null;
}

function createPersonalAiLearningSessionQuestions(input: {
  sessionPublicId: string;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent;
}): PersonalAiGenerationLearningSessionQuestionDto[] {
  const structuredPreview = input.visibleGeneratedContent.structuredPreview;

  if (!structuredPreview) {
    return [];
  }

  const questionDrafts =
    collectPersonalAiLearningQuestionDrafts(structuredPreview);

  if (questionDrafts === null) {
    return [];
  }

  return questionDrafts
    .map((draft, draftIndex) =>
      createPersonalAiLearningSessionQuestion({
        draft,
        sessionPublicId: input.sessionPublicId,
        usableQuestionIndex: draftIndex + 1,
      }),
    )
    .filter(
      (question): question is PersonalAiGenerationLearningSessionQuestionDto =>
        question !== null,
    );
}

function readPersonalAiLearningSessionJsonBody(
  init: RequestInit | undefined,
): Record<string, unknown> {
  return JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
}

function expectRenderedTextToHideValues(
  values: Array<string | null | undefined>,
) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }

    expect(screen.queryByText(value)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain(value);
  }
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

beforeEach(() => {
  window.history.replaceState({}, "", "/ai-generation");
});

describe("StudentPersonalAiGenerationPage", () => {
  it("uses server-authoritative cancellation and states the Provider boundary accurately", () => {
    const source = readFileSync(
      join(
        workspaceRoot,
        "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("historyRow.canCancel === true");
    expect(source).toContain("/${encodeURIComponent(taskPublicId)}/cancel");
    expect(source).toContain("不保证停止远端 Provider");
    expect(source).not.toContain("Date.now() - historyRow");
  });

  it.each([
    {
      roleName: "standard personal learner",
      authorizationContext: createAuthorizationContext({
        edition: "standard",
        effectiveEdition: "standard",
        authorizationSource: "personal_auth",
        ownerType: "personal",
        ownerPublicId: "student-public-ui-001",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "student-public-ui-001",
        capabilities: {
          canGenerateAiQuestion: false,
          canGenerateAiPaper: false,
        },
      }),
    },
    {
      roleName: "standard organization employee",
      authorizationContext: createAuthorizationContext({
        edition: "standard",
        effectiveEdition: "standard",
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: "organization-public-ui-001",
        organizationPublicId: "organization-public-ui-001",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization-public-ui-001",
        capabilities: {
          canGenerateAiQuestion: false,
          canGenerateAiPaper: false,
        },
      }),
    },
  ])(
    "renders unavailable state for direct AI route access by $roleName",
    async ({ authorizationContext }) => {
      localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
      const fetchMock = vi.fn(
        async (url: RequestInfo | URL, init?: RequestInit) => {
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          if (String(url) === "/api/v1/authorizations") {
            expect(init?.method).toBe("GET");

            return {
              ok: true,
              status: 200,
              json: async () =>
                createAuthorizationListResponse([authorizationContext]),
            };
          }

          if (
            String(url).startsWith("/api/v1/personal-ai-generation-requests")
          ) {
            expect(init?.method).toBe("GET");

            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          if (
            String(url).startsWith("/api/v1/personal-ai-generation-results")
          ) {
            expect(init?.method).toBe("GET");

            return {
              ok: true,
              status: 200,
              json: async () => emptyResultHistoryResponse,
            };
          }

          throw new Error(`Unexpected fetch path: ${String(url)}`);
        },
      );
      vi.stubGlobal("fetch", fetchMock);

      render(createElement(StudentPersonalAiGenerationPage));

      expect(await screen.findByText(unavailableTitle)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: requestButtonLabel }),
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: paperButtonLabel }),
      ).toBeNull();
      expect(screen.queryByRole("tablist", { name: "AI训练类型" })).toBeNull();
      expect(screen.queryByText(historyTitle)).toBeNull();
      expect(screen.queryByText(resultHistoryTitle)).toBeNull();
      expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
        "/api/v1/authorizations",
      ]);
    },
  );

  it("loads redacted request history from the server on initial render when a student session token exists", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => serverHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText("2026年6月12日 18:00")).toBeInTheDocument();
    expect(screen.getByText("状态")).toBeInTheDocument();
    expect(screen.getByText("已完成")).toBeInTheDocument();
    expect(screen.getByText("请求时间")).toBeInTheDocument();
    expect(screen.queryByText("脱敏状态")).not.toBeInTheDocument();
    expect(screen.queryByText("已脱敏")).not.toBeInTheDocument();
    expect(screen.getByText("依据充足")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expectRenderedTextToHideValues([
      serverHistoryResponse.data[0].requestPublicId,
      serverHistoryResponse.data[0].taskPublicId,
      serverHistoryResponse.data[0].resultPublicId,
      serverHistoryResponse.data[0].aiCallLogPublicId,
    ]);
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("switches between AI出题 and AI组卷 tabs without submitting a generation request", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyServerHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));

    expect(
      screen.getByRole("button", { name: paperButtonLabel }),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls.map((call) => call[1]?.method)).toEqual([
      "GET",
      "GET",
      "GET",
      "GET",
      "GET",
    ]);
  });

  it("renders advanced learner AI as five accountable zones without provider terminology", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyServerHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    const contextZone = screen.getByTestId("student-ai-zone-context");
    const modeZone = screen.getByTestId("student-ai-zone-mode");
    const parametersZone = screen.getByTestId("student-ai-zone-parameters");
    const boundaryZone = screen.getByTestId("student-ai-zone-boundary");
    const resultHistoryZone = screen.getByTestId(
      "student-ai-zone-result-history",
    );

    expect(within(contextZone).getByText("授权上下文")).toBeInTheDocument();
    expect(
      within(modeZone).getByRole("tab", { name: "AI出题" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      within(parametersZone).getByRole("group", { name: "AI出题参数" }),
    ).toBeInTheDocument();
    expect(boundaryZone).toHaveTextContent("不写入正式题目");
    expect(boundaryZone).toHaveTextContent("不写入正式试卷");
    expect(
      within(resultHistoryZone).getByText(historyTitle),
    ).toBeInTheDocument();
    expect(
      within(resultHistoryZone).getByText(resultHistoryTitle),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("Provider");
    expect(document.body.textContent).not.toContain("payload");
    expect(document.body.textContent).not.toContain("raw prompt");
  });

  it("renders learner AI paper assembly summaries from result history and detail without selected refs", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const paperAssemblyContainer = createLearnerAiPaperAssemblyContainer({
      selectedQuestionCount: 2,
      sourceKind: "enterprise_training_snapshot",
      enterpriseTrainingSnapshotCount: 2,
    });
    const paperAssembly = {
      status: "assembled" as const,
      sourceDiagnostics: {
        role: "org_advanced_employee" as const,
        platformQuestionCount: 0,
        enterpriseQuestionCount: 2,
        enterpriseSourceStatus: "resolved" as const,
      },
      container: paperAssemblyContainer,
      insufficiency: null,
      redactionStatus: "redacted" as const,
    };
    const result = {
      resultPublicId: "ai-result-public-paper-history-001",
      taskPublicId: "ai-task-public-paper-history-001",
      requestPublicId: "ai-request-public-paper-history-001",
      taskType: "ai_paper_generation" as const,
      status: "succeeded" as const,
      persistedAt: "2026-07-09T09:00:00.000Z",
      contentReference: {
        contentDigest: "sha256:redacted-paper-history",
        contentPreviewMasked: "AI组卷摘要已脱敏",
        contentVisibility: "redacted_snapshot" as const,
        redactionStatus: "redacted" as const,
      },
      evidenceReference: {
        evidenceStatus: "sufficient" as const,
        citationCount: 2,
        aiCallLogPublicId: null,
        redactionStatus: "redacted" as const,
      },
      formalAdoption: {
        isBlocked: true as const,
        status: "blocked" as const,
      },
      paperAssembly,
    };
    const resultHistoryResponse = {
      ...emptyResultHistoryResponse,
      data: {
        ...emptyResultHistoryResponse.data,
        results: [result],
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        sortBy: "persistedAt",
        sortOrder: "desc",
      },
    };
    const resultDetailResponse = {
      code: 0,
      message: "ok",
      data: {
        ...emptyResultHistoryResponse.data,
        result,
      },
    };
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return {
          ok: true,
          status: 200,
          json: async () => localSessionResponse,
        };
      }

      if (path === "/api/v1/authorizations") {
        return {
          ok: true,
          status: 200,
          json: async () => createAdvancedAuthorizationListResponse(),
        };
      }

      if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
        return {
          ok: true,
          status: 200,
          json: async () => emptyServerHistoryResponse,
        };
      }

      if (
        path ===
        "/api/v1/personal-ai-generation-results/ai-result-public-paper-history-001?authorizationPublicId=authorization-context-ui-001"
      ) {
        return {
          ok: true,
          status: 200,
          json: async () => resultDetailResponse,
        };
      }

      if (path.startsWith("/api/v1/personal-ai-generation-results")) {
        return {
          ok: true,
          status: 200,
          json: async () => resultHistoryResponse,
        };
      }

      throw new Error(`Unexpected fetch path: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(resultHistoryTitle)).toBeInTheDocument();
    const historyPaperSummary = screen.getByTestId(
      "student-ai-paper-assembly-summary",
    );
    expect(historyPaperSummary).toHaveTextContent("企业自测试卷预览");
    expect(historyPaperSummary).toHaveTextContent(
      "请求难度 medium · 计划难度 medium · 请求知识点 1 个 · 计划知识点 1 个",
    );
    expect(historyPaperSummary).toHaveTextContent("2/2 题");
    expect(historyPaperSummary).toHaveTextContent("企业训练题 2 题");
    expect(historyPaperSummary).toHaveTextContent("完全匹配");

    fireEvent.click(screen.getByRole("button", { name: "查看结果详情" }));

    expect(await screen.findByText("结果详情")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getAllByTestId("student-ai-paper-assembly-summary"),
      ).toHaveLength(2),
    );
    expect(document.body.textContent).not.toContain("formal-question-public-1");
    expect(document.body.textContent).not.toContain("standardAnswer");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("shows and submits the learner AI出题 default quantity as 3", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url) === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          submittedBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题题目数量")).toHaveValue(3);

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      taskType: "ai_question_generation",
      generationParameters: {
        includeDescendants: false,
        knowledgeNode: null,
        knowledgeNodeMode: "balanced",
        knowledgeNodePublicIds: [],
        knowledgeNodeSupplement: null,
        questionCount: 3,
        sourcePreference: null,
      },
    });
  });

  it("submits every visible learner AI question parameter exactly as displayed", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题科目")).toHaveValue("理论");
    expect(screen.getByLabelText("AI出题题型")).toHaveValue("单选题");
    expect(
      Array.from(
        (screen.getByLabelText("AI出题题型") as HTMLSelectElement).options,
        (option) => option.value,
      ),
    ).toEqual([
      "单选题",
      "多选题",
      "判断题",
      "填空题",
      "简答题",
      "案例分析题",
      "计算题",
    ]);
    expect(screen.getByLabelText("AI出题难度")).toHaveValue("中等");
    expect(screen.getByLabelText("AI出题学习目标")).toHaveValue("弱项巩固");

    fireEvent.change(screen.getByLabelText("AI出题科目"), {
      target: { value: "技能" },
    });
    fireEvent.change(screen.getByLabelText("AI出题题型"), {
      target: { value: "计算题" },
    });
    fireEvent.change(screen.getByLabelText("AI出题题目数量"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("AI出题难度"), {
      target: { value: "提高" },
    });
    fireEvent.change(screen.getByLabelText("AI出题学习目标"), {
      target: { value: "综合辨析训练" },
    });
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (call) =>
            String(call[0]) === "/api/v1/personal-ai-generation-requests" &&
            call[1]?.method === "POST",
        ),
      ).toBe(true);
    });
    const postCall = fetchMock.mock.calls.find(
      (call) =>
        String(call[0]) === "/api/v1/personal-ai-generation-requests" &&
        call[1]?.method === "POST",
    );
    const requestBody = JSON.parse(String(postCall?.[1]?.body)) as {
      generationParameters?: Record<string, unknown>;
    };

    expect(requestBody.generationParameters).toMatchObject({
      subject: "skill",
      questionType: "calculation",
      questionCount: 7,
      difficulty: "hard",
      learningObjective: "综合辨析训练",
    });
  });

  it("submits every supported learner AI paper parameter and hides unsupported duration", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    expect(screen.queryByLabelText("AI组卷时长目标")).toBeNull();

    fireEvent.change(screen.getByLabelText("AI组卷科目"), {
      target: { value: "技能" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷题目数量"), {
      target: { value: "45" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷题型分布"), {
      target: { value: "薄弱点优先" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷大题结构"), {
      target: { value: "按知识点分大题" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷难度"), {
      target: { value: "基础" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷学习目标"), {
      target: { value: "阶段技能自测" },
    });
    fireEvent.click(screen.getByRole("button", { name: paperButtonLabel }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (call) =>
            String(call[0]) === "/api/v1/personal-ai-generation-requests" &&
            call[1]?.method === "POST",
        ),
      ).toBe(true);
    });
    const postCall = fetchMock.mock.calls.find(
      (call) =>
        String(call[0]) === "/api/v1/personal-ai-generation-requests" &&
        call[1]?.method === "POST",
    );
    const requestBody = JSON.parse(String(postCall?.[1]?.body)) as {
      generationParameters?: Record<string, unknown>;
    };

    expect(requestBody.generationParameters).toMatchObject({
      subject: "skill",
      questionCount: 45,
      questionTypeDistribution: "weak_point_priority",
      paperStructure: "by_knowledge_node",
      difficulty: "easy",
      learningObjective: "阶段技能自测",
    });
  });

  it("submits learner AI knowledge supplement as a structured soft constraint", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("AI出题知识点补充说明"), {
      target: { value: "synthetic focus area" },
    });
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (call) =>
            String(call[0]) === "/api/v1/personal-ai-generation-requests" &&
            call[1]?.method === "POST",
        ),
      ).toBe(true);
    });

    const postCall = fetchMock.mock.calls.find(
      (call) =>
        String(call[0]) === "/api/v1/personal-ai-generation-requests" &&
        call[1]?.method === "POST",
    );
    const requestBody = JSON.parse(String(postCall?.[1]?.body)) as {
      generationParameters?: Record<string, unknown>;
    };

    expect(requestBody.generationParameters).toMatchObject({
      includeDescendants: false,
      knowledgeNode: "synthetic focus area",
      knowledgeNodeMode: "balanced",
      knowledgeNodePublicIds: [],
      knowledgeNodeSupplement: "synthetic focus area",
      sourcePreference: null,
    });
  });

  it("disables learner AI submit when selected knowledge-node mode has no selectable nodes", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = createPersonalAiGenerationFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("AI出题知识点覆盖"), {
      target: { value: "selected" },
    });

    expect(
      await screen.findByText(
        "当前授权范围暂无可选知识点，请改用均衡覆盖或联系内容管理员维护知识点。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: requestButtonLabel }),
    ).toBeDisabled();
    expect(
      fetchMock.mock.calls.some((call) => call[1]?.method === "POST"),
    ).toBe(false);
  });

  it("loads learner AI knowledge-node options and submits selected public ids", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                profession: "marketing",
              }),
          };
        }

        if (path === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (path.startsWith("/api/v1/ai-generation/knowledge-nodes?")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });
          expect(path).toContain("profession=marketing");
          expect(path).toContain("level=3");

          return {
            ok: true,
            status: 200,
            json: async () => marketingAiKnowledgeNodeOptionsResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          submittedBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("AI出题知识点覆盖"), {
      target: { value: "selected" },
    });
    fireEvent.click(await screen.findByLabelText("营销/基础知识/市场调研"));
    fireEvent.change(screen.getByLabelText("AI出题包含下级知识点"), {
      target: { value: "true" },
    });
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      taskType: "ai_question_generation",
      generationParameters: {
        includeDescendants: true,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge-node-public-marketing-3"],
      },
    });
  });

  it("shows personal learner AI组卷 source and submits the visible default quantity as 30", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url) === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          submittedBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));

    expect(screen.getByText("题源说明")).toBeInTheDocument();
    expect(screen.getByText("平台正式题库")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷题目数量")).toHaveValue(30);

    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(screen.getByRole("button", { name: paperButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      taskType: "ai_paper_generation",
      generationParameters: {
        includeDescendants: false,
        knowledgeNode: null,
        knowledgeNodeMode: "balanced",
        knowledgeNodePublicIds: [],
        knowledgeNodeSupplement: null,
        difficulty: "medium",
        learningObjective: "阶段自测",
        paperStructure: "by_question_type",
        questionCount: 30,
        questionTypeDistribution: "weak_point_priority",
        sourcePreference: null,
      },
    });
  });

  it("shows organization employee AI组卷 sources, preference, and enterprise submit label", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                authorizationPublicId: "org-auth-context-ui-001",
                ownerType: "organization",
                ownerPublicId: "organization-public-ui-001",
                organizationPublicId: "organization-public-ui-001",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-ui-001",
              }),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyServerHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));

    expect(
      screen.getByText("平台正式题库 + 本企业可用题库"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("题源偏好")).toHaveValue("均衡使用");
    expect(screen.getByText("优先使用企业题")).toBeInTheDocument();
    expect(screen.getByText("优先使用平台题")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: employeePaperButtonLabel }),
    ).toBeInTheDocument();
  });

  it("submits organization employee AI组卷 selected knowledge-node public ids", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                authorizationPublicId: "org-auth-context-ui-001",
                ownerType: "organization",
                ownerPublicId: "organization-public-ui-001",
                organizationPublicId: "organization-public-ui-001",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-ui-001",
                profession: "marketing",
              }),
          };
        }

        if (path === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        if (path.startsWith("/api/v1/ai-generation/knowledge-nodes?")) {
          expect(init?.method).toBe("GET");
          expect(path).toContain("profession=marketing");
          expect(path).toContain("level=3");

          return {
            ok: true,
            status: 200,
            json: async () => marketingAiKnowledgeNodeOptionsResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          submittedBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.change(screen.getByLabelText("AI组卷题型分布"), {
      target: { value: "薄弱点优先" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷大题结构"), {
      target: { value: "按知识点分大题" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷难度"), {
      target: { value: "提高" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷学习目标"), {
      target: { value: "企业薄弱点自测" },
    });
    fireEvent.change(screen.getByLabelText("AI组卷知识点覆盖"), {
      target: { value: "selected" },
    });
    fireEvent.click(await screen.findByLabelText("营销/基础知识/市场调研"));
    fireEvent.click(
      screen.getByRole("button", { name: employeePaperButtonLabel }),
    );

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      taskType: "ai_paper_generation",
      authorizationSource: "org_auth",
      generationParameters: {
        difficulty: "hard",
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge-node-public-marketing-3"],
        learningObjective: "企业薄弱点自测",
        paperStructure: "by_knowledge_node",
        questionTypeDistribution: "weak_point_priority",
        sourcePreference: "balanced",
      },
    });
  });

  it("posts a session-aligned camelCase public-id payload to the local route contract without rendering the session token", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const insufficientGeneratedPracticeResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          resultPublicId: "ai-result-public-insufficient-001",
          evidenceStatus: "none",
          citationCount: 0,
        },
      },
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
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
            json: async () => insufficientGeneratedPracticeResponse,
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

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
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
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("生成任务已受理")).toBeInTheDocument();
    expect(screen.queryByText("仅本地合约")).not.toBeInTheDocument();
    expect(screen.queryByText("学员本地页面")).not.toBeInTheDocument();
    expect(screen.queryByText("内容可见性")).not.toBeInTheDocument();
    expect(screen.queryByText("引用脱敏状态")).not.toBeInTheDocument();
    expect(screen.getAllByText("已完成").length).toBeGreaterThan(0);
    expect(screen.queryByText("仅摘要")).not.toBeInTheDocument();
    expect(screen.queryByText("是否阻断正式入库")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("正式采用");
    expect(document.body).not.toHaveTextContent("需审核后采用");
    expect(document.body).not.toHaveTextContent("可采用");
    expect(screen.getAllByText("依据资料状态").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "开始作答" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "提交作答" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "查看解析" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "重试生成" })).toBeEnabled();
    expect(
      screen.getByText("依据或正式题源不足时请调整参数后重试生成"),
    ).toBeInTheDocument();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8));
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("/api/v1/authorizations");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
    );
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
    );
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[3]?.[0])).toBe("/api/v1/sessions");
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[4]?.[0])).toBe("/api/v1/authorizations");
    expect(fetchMock.mock.calls[4]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[5]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests",
    );
    expect(fetchMock.mock.calls[5]?.[1]?.method).toBe("POST");
    expect(
      JSON.parse(String(fetchMock.mock.calls[5]?.[1]?.body)),
    ).toMatchObject({
      generationParameters: {
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionCount: 3,
      },
    });
    expect(String(fetchMock.mock.calls[6]?.[0])).toBe(
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
    );
    expect(fetchMock.mock.calls[6]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[7]?.[0])).toBe(
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
    );
    expect(fetchMock.mock.calls[7]?.[1]?.method).toBe("GET");

    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[5]?.[1]?.body),
    ) as Record<string, unknown>;

    expect(requestBody).toEqual({
      responseMode: "local_browser_experience",
      userPublicId: localSessionUserPublicId,
      requestPublicId: expect.stringMatching(/^personal-ai-request-public-/),
      authorizationPublicId: "authorization-context-ui-001",
      redeemCodePublicId: null,
      auditLogPublicId: null,
      aiCallLogPublicId: null,
      taskPublicId: expect.stringMatching(/^ai-generation-task-public-/),
      taskType: "ai_question_generation",
      actorPublicId: localSessionUserPublicId,
      authorizationSource: "personal_auth",
      ownerType: "personal",
      ownerPublicId: "student-public-ui-001",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student-public-ui-001",
      effectiveEdition: "advanced",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: false,
      isRuntimeConfigReady: true,
      idempotencyKeyHash: expect.stringMatching(
        /^sha256:student-local-request-/,
      ),
      existingTaskPublicId: null,
      existingTaskStatus: null,
      generationParameters: {
        difficulty: "medium",
        includeDescendants: false,
        knowledgeNode: null,
        knowledgeNodeMode: "balanced",
        knowledgeNodePublicIds: [],
        knowledgeNodeSupplement: null,
        learningObjective: "弱项巩固",
        level: 3,
        profession: "monopoly",
        questionCount: 3,
        questionType: "single_choice",
        sourcePreference: null,
        subject: "theory",
      },
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
    });
    expect(JSON.stringify(requestBody)).not.toContain(
      "unit-test-session-token",
    );
    expect(requestBody.requestPublicId).not.toBe(
      "personal-ai-request-public-001",
    );
    expect(requestBody.taskPublicId).not.toBe("ai-generation-task-public-001");
    expect(requestBody.idempotencyKeyHash).not.toBe(
      "sha256:student-local-request",
    );
    expectRenderedTextToHideValues([
      String(requestBody.requestPublicId),
      String(requestBody.taskPublicId),
      String(requestBody.authorizationPublicId),
      String(requestBody.userPublicId),
      insufficientGeneratedPracticeResponse.data.resultState.resultPublicId,
    ]);
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("keeps retry disabled while the current accepted generation is still pending", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    vi.stubGlobal("fetch", createPersonalAiGenerationFetchMock());

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("生成任务已受理")).toBeInTheDocument();
    expect(screen.getAllByText("处理中").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "开始作答" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "提交作答" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "查看解析" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "重试生成" })).toBeDisabled();
    expect(
      screen.getByText("生成后可进入作答、提交答案并查看解析"),
    ).toBeInTheDocument();
  });

  it("posts an organization-context local route contract payload for employee sessions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                organizationPublicId: "organization-public-123",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-123",
              }),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");
          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        if (String(url) === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      userPublicId: "employee-session-user-public-123",
      actorPublicId: "employee-session-user-public-123",
      authorizationSource: "org_auth",
      ownerType: "organization",
      ownerPublicId: "organization-public-123",
      organizationPublicId: "organization-public-123",
      quotaOwnerType: "organization",
      quotaOwnerPublicId: "organization-public-123",
    });
    expect(JSON.stringify(submittedBodies[0])).not.toContain(
      "unit-test-session-token",
    );
  });

  it("requires explicit learner context and uses the selected quota owner", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const observedGetUrls: string[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () =>
              createPersonalAndOrganizationAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            observedGetUrls.push(String(url));
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");
          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");
          observedGetUrls.push(String(url));

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        if (String(url) === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      await screen.findByText(
        "请先确认一个具体授权，再查看历史或使用生成设置。",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("授权上下文")).toBeInTheDocument();
    expect(
      screen.getByLabelText("个人授权 · 高级版 · 专卖 3级"),
    ).not.toBeChecked();
    expect(
      screen.getByLabelText("组织授权 · 高级版 · 专卖 3级"),
    ).not.toBeChecked();
    expect(observedGetUrls).toEqual([]);

    fireEvent.click(screen.getByLabelText("个人授权 · 高级版 · 专卖 3级"));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(screen.getByText("额度归属确认")).toBeInTheDocument();
    expect(screen.getByText(/当前将使用个人额度/u)).toBeInTheDocument();
    expect(observedGetUrls).toEqual(
      expect.arrayContaining([
        "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=personal-auth-context-dual-001",
        "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=personal-auth-context-dual-001",
      ]),
    );

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      authorizationPublicId: "personal-auth-context-dual-001",
      authorizationSource: "personal_auth",
      ownerType: "personal",
      ownerPublicId: "employee-session-user-public-123",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "employee-session-user-public-123",
    });

    fireEvent.click(screen.getByLabelText("组织授权 · 高级版 · 专卖 3级"));
    expect(screen.getByText(/当前将使用组织额度/u)).toBeInTheDocument();
    await waitFor(() => {
      expect(observedGetUrls).toEqual(
        expect.arrayContaining([
          "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=org-auth-context-dual-001",
          "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=org-auth-context-dual-001",
        ]),
      );
    });
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.change(screen.getByLabelText("题源偏好"), {
      target: { value: "优先使用企业题" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: employeePaperButtonLabel }),
    );

    await waitFor(() => expect(submittedBodies).toHaveLength(2));
    expect(submittedBodies[1]).toMatchObject({
      authorizationPublicId: "org-auth-context-dual-001",
      authorizationSource: "org_auth",
      ownerType: "organization",
      ownerPublicId: "organization-public-123",
      organizationPublicId: "organization-public-123",
      quotaOwnerType: "organization",
      quotaOwnerPublicId: "organization-public-123",
      taskType: "ai_paper_generation",
      generationParameters: {
        knowledgeNodeMode: "balanced",
        knowledgeNodePublicIds: [],
        sourcePreference: "prefer_enterprise",
      },
    });
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
  });

  it("renders learner AI detail controls for advanced organization employee before submitting", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                organizationPublicId: "organization-public-123",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-123",
              }),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyServerHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "AI出题参数" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "AI组卷参数" })).toBeNull();
    expect(screen.getByLabelText("AI出题专业")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题等级")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题科目")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题知识点覆盖")).toHaveValue("balanced");
    expect(screen.getByLabelText("AI出题包含下级知识点")).toBeDisabled();
    expect(screen.getByLabelText("AI出题知识点补充说明")).toBeInTheDocument();
    expect(screen.getByText("当前授权范围暂无可选知识点")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题题型")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题题目数量")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题难度")).toBeInTheDocument();
    expect(screen.getByLabelText("AI出题学习目标")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: requestButtonLabel }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    expect(
      screen.getByRole("group", { name: "AI组卷参数" }),
    ).toBeInTheDocument();
    expect(screen.getByText("题源说明")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷专业")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷等级")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷科目")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷题目数量")).toHaveValue(30);
    expect(screen.getByLabelText("AI组卷题型分布")).toHaveValue("薄弱点优先");
    expect(screen.getByLabelText("AI组卷知识点覆盖")).toHaveValue("balanced");
    expect(screen.getByLabelText("AI组卷包含下级知识点")).toBeDisabled();
    expect(screen.getByLabelText("AI组卷知识点补充说明")).toBeInTheDocument();
    expect(screen.getByLabelText("AI组卷大题结构")).toHaveValue("按题型分大题");
    expect(screen.getByLabelText("AI组卷难度")).toHaveValue("中等");
    expect(screen.queryByLabelText("AI组卷时长目标")).toBeNull();
    expect(screen.getByLabelText("AI组卷学习目标")).toHaveValue("阶段自测");
    expect(
      screen.getByRole("button", { name: employeePaperButtonLabel }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "开始作答" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "提交作答" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "查看解析" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "重试生成" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock.mock.calls.map((call) => call[1]?.method)).toEqual([
      "GET",
      "GET",
      "GET",
      "GET",
      "GET",
    ]);
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
  });

  it("posts an AI paper generation local route contract payload from the paper action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Record<string, unknown>[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
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

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
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
          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    const paperButton = screen.getByRole("button", {
      name: paperButtonLabel,
    });
    expect(paperButton).toBeEnabled();

    fireEvent.click(paperButton);

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(submittedBodies[0]).toMatchObject({
      taskType: "ai_paper_generation",
      responseMode: "local_browser_experience",
      effectiveEdition: "advanced",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: false,
      isRuntimeConfigReady: true,
    });
    expect(submittedBodies[0]).not.toHaveProperty("aiFuncType");
    expect(submittedBodies[0]).not.toHaveProperty("questionPublicId");
    expect(submittedBodies[0]).not.toHaveProperty("answerRecordPublicId");
    expect(submittedBodies[0]).not.toHaveProperty("paperPublicId");
    expect(JSON.stringify(submittedBodies[0])).not.toContain(
      "unit-test-session-token",
    );
  });

  it("generates unique request identifiers for consecutive personal AI generation submits", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url) === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");
          expect(init?.headers).toMatchObject({
            authorization: "Bearer unit-test-session-token",
          });

          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          expect(init).toBeDefined();
          expect(init?.method).toBe("POST");
          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () => localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    expect(await screen.findByText("生成任务已受理")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    await waitFor(() => expect(submittedBodies).toHaveLength(2));

    const [firstRequestBody, secondRequestBody] = submittedBodies as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];

    expect(firstRequestBody.userPublicId).toBe(localSessionUserPublicId);
    expect(secondRequestBody.userPublicId).toBe(localSessionUserPublicId);
    expect(firstRequestBody.requestPublicId).not.toBe(
      secondRequestBody.requestPublicId,
    );
    expect(firstRequestBody.taskPublicId).not.toBe(
      secondRequestBody.taskPublicId,
    );
    expect(firstRequestBody.idempotencyKeyHash).not.toBe(
      secondRequestBody.idempotencyKeyHash,
    );
  });

  it("reuses request identifiers for an unchanged failed personal AI generation retry", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const submittedBodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url) === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url) === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          submittedBodies.push(
            JSON.parse(String(init?.body)) as Record<string, unknown>,
          );

          return {
            ok: true,
            status: 200,
            json: async () =>
              submittedBodies.length === 1
                ? {
                    code: 500018,
                    message: "Personal AI generation request failed.",
                    data: null,
                  }
                : localExperienceResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));
    await waitFor(() => expect(submittedBodies).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));
    await waitFor(() => expect(submittedBodies).toHaveLength(2));

    expect(submittedBodies[1]).toMatchObject({
      requestPublicId: submittedBodies[0].requestPublicId,
      taskPublicId: submittedBodies[0].taskPublicId,
      idempotencyKeyHash: submittedBodies[0].idempotencyKeyHash,
    });
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

    expect(await screen.findByText("生成任务已受理")).toBeInTheDocument();
    expect(await screen.findByText("2026年6月12日 20:30")).toBeInTheDocument();
    expect(screen.getAllByText("处理中").length).toBeGreaterThan(0);
    expect(screen.getAllByText("依据不足").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.queryByText("已脱敏")).not.toBeInTheDocument();
    expectRenderedTextToHideValues([
      serverHistoryAfterSubmitResponse.data[0].requestPublicId,
      serverHistoryAfterSubmitResponse.data[0].taskPublicId,
      serverHistoryAfterSubmitResponse.data[0].resultPublicId,
      serverHistoryAfterSubmitResponse.data[0].aiCallLogPublicId,
      "personal-ai-request-public-001",
    ]);
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8));
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      "/api/v1/authorizations",
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
      "/api/v1/sessions",
      "/api/v1/authorizations",
      "/api/v1/personal-ai-generation-requests",
      "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
      "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
    ]);
    expect(fetchMock.mock.calls.map((call) => call[1]?.method)).toEqual([
      "GET",
      "GET",
      "GET",
      "GET",
      "GET",
      "POST",
      "GET",
      "GET",
    ]);
  });

  it("renders transient visible generated content from a provider-enabled local response", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          resultPublicId: "ai-generation-result-visible-learner-001",
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          bridgeMode: "controlled_runner",
          runnerMode: "route_integrated_provider_runner",
          explicitLocalSwitchPresent: true,
          realProviderExecutionApproved: true,
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          providerExecutionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            durationMs: 42,
            usageSummary: {
              inputTokens: 12,
              outputTokens: 24,
              totalTokens: 36,
            },
            providerErrorSummary: null,
            redactionStatus: "redacted",
          },
          visibleGeneratedContent: {
            content: "学生端本次生成内容：先复习知识点，再完成两道自练题。",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 10,
              actualQuestionCount: 10,
              draftCount: 10,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  knowledgeNodeLabels: ["synthetic knowledge node"],
                  questionStem: "synthetic visible learner question stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText: "synthetic visible learner option",
                      isCorrect: true,
                    },
                  ],
                  standardAnswer: "A",
                  analysis: "synthetic visible learner analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          blockedReasons: [],
        },
      },
    };
    const fetchMock = createPersonalAiGenerationFetchMockWithHistorySequence(
      [emptyServerHistoryResponse, emptyServerHistoryResponse],
      visibleResponse,
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(
      await screen.findByTestId("student-visible-generated-content"),
    ).toHaveTextContent("生成题目草稿");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).toHaveTextContent("结构化预览");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).toHaveTextContent("草稿 10/10");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).toHaveTextContent("生成题目草稿");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).toHaveTextContent("synthetic visible learner question stem");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).toHaveTextContent("synthetic visible learner option");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).not.toHaveTextContent("标准答案");
    expect(
      screen.getByTestId("student-visible-generated-content"),
    ).not.toHaveTextContent("synthetic visible learner analysis");
    const startLearningButton = screen.getByRole("button", {
      name: "开始作答",
    });
    expect(startLearningButton).not.toBeDisabled();
    fireEvent.click(startLearningButton);
    const learningSession = await screen.findByTestId(
      "student-ai-learning-session",
    );
    expect(learningSession).toHaveTextContent("隔离 AI 学习");
    expect(learningSession).toHaveTextContent(
      "synthetic visible learner question stem",
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /A synthetic visible learner option/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "提交作答" }));
    expect(await screen.findByText("回答正确")).toBeInTheDocument();
    expect(learningSession).toHaveTextContent("正式练习未写入");
    expect(learningSession).toHaveTextContent("错题本未写入");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders organization employee AI question drafts from org authorization context", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const visibleResponse = {
      code: 0,
      message: "ok",
      data: {
        ...localExperienceResponse.data,
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          resultPublicId: "ai-generation-result-visible-employee-001",
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          bridgeMode: "controlled_runner",
          runnerMode: "route_integrated_provider_runner",
          explicitLocalSwitchPresent: true,
          realProviderExecutionApproved: true,
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          providerExecutionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            durationMs: 42,
            usageSummary: {
              inputTokens: 12,
              outputTokens: 24,
              totalTokens: 36,
            },
            providerErrorSummary: null,
            redactionStatus: "redacted",
          },
          visibleGeneratedContent: {
            content: "生成草稿已创建，待训练页查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 1,
              actualQuestionCount: 1,
              draftCount: 1,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  questionStem: "synthetic visible employee question stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText: "synthetic visible employee option",
                      isCorrect: true,
                    },
                    {
                      optionLabel: "B",
                      optionText: "synthetic visible employee distractor",
                      isCorrect: false,
                    },
                  ],
                  standardAnswer: "A",
                  analysis: "synthetic visible employee analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          blockedReasons: [],
        },
      },
    };
    const historyResponses = [
      emptyServerHistoryResponse,
      emptyServerHistoryResponse,
    ];
    const learningSessionMockState = createPersonalAiLearningSessionMockState();
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (path === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        if (path === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                organizationPublicId: "organization-public-123",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-123",
              }),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () =>
                historyResponses.shift() ?? emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");

          return {
            ok: true,
            status: 200,
            json: async () => visibleResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        const learningSessionResponse =
          await handlePersonalAiLearningSessionFetch({
            actorPublicId: "employee-session-user-public-123",
            init,
            ownerPublicId: "organization-public-123",
            ownerType: "organization",
            path,
            persistedSourceTaskPublicId:
              readMockExperienceSourceTaskPublicId(visibleResponse),
            persistedVisibleGeneratedContent:
              readMockExperienceVisibleGeneratedContent(visibleResponse),
            state: learningSessionMockState,
          });

        if (learningSessionResponse !== null) {
          return learningSessionResponse;
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    const visibleGeneratedContent = await screen.findByTestId(
      "student-visible-generated-content",
    );
    expect(visibleGeneratedContent).toHaveTextContent("生成题目草稿");
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible employee question stem",
    );
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic visible employee option",
    );
    expect(visibleGeneratedContent).toHaveTextContent("A");
    expect(visibleGeneratedContent).not.toHaveTextContent(
      "synthetic visible employee analysis",
    );
    const organizationStartLearningButton = screen.getByRole("button", {
      name: "开始作答",
    });
    expect(organizationStartLearningButton).not.toBeDisabled();
    fireEvent.click(organizationStartLearningButton);
    await waitFor(() =>
      expect(learningSessionMockState.sessionsByPublicId.size).toBe(1),
    );
    const learningSession = await screen.findByTestId(
      "student-ai-learning-session",
    );
    expect(learningSession).toHaveTextContent("隔离 AI 学习");
    fireEvent.click(
      screen.getByRole("radio", {
        name: /B synthetic visible employee distractor/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "提交作答" }));
    expect(await screen.findByText("回答错误")).toBeInTheDocument();
    expect(learningSession).toHaveTextContent("正确答案 A");
    expect(learningSession).toHaveTextContent("正式练习未写入");
    expect(learningSession).toHaveTextContent("错题本未写入");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
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

    expect(await screen.findByText("生成任务已受理")).toBeInTheDocument();
    expect(await screen.findByText(historyErrorTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("database stack");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8));
  });

  it("renders a true unauthorized state after the cookie-backed session probe fails when no local token exists", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(String(url)).toBe("/api/v1/sessions");
        expect(init).toMatchObject({
          credentials: "same-origin",
          method: "GET",
        });
        expect(init).not.toHaveProperty("headers");

        return {
          ok: true,
          status: 200,
          json: async () => ({
            code: 401001,
            message: "User session is required.",
            data: null,
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      screen.getByText("\u6b63\u5728\u6821\u9a8c\u5b66\u5458\u4f1a\u8bdd"),
    ).toBeInTheDocument();
    expect(await screen.findByText(unauthorizedTitle)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: requestButtonLabel }),
    ).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("loads histories through the cookie-backed session marker without a bearer header", async () => {
    localStorage.setItem(
      "tiku.localSessionToken",
      COOKIE_BACKED_SESSION_MARKER,
    );
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        expect(init).toMatchObject({
          credentials: "same-origin",
          method: "GET",
        });
        expect(init).not.toHaveProperty("headers");

        if (String(url) === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (String(url) === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-requests")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyServerHistoryResponse,
          };
        }

        if (String(url).startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${String(url)}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(
      await screen.findByText("\u6682\u65e0\u5386\u53f2\u7ed3\u679c"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(
      COOKIE_BACKED_SESSION_MARKER,
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
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
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText(blockedTitle)).toBeInTheDocument();
    expect(screen.getByText("额度不足")).toBeInTheDocument();
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
                taskType: "ai_question_generation",
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
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    expect(await screen.findByText("生成任务已受理")).toBeInTheDocument();
    expect(screen.queryByText("内容可见性")).not.toBeInTheDocument();
    expect(screen.queryByText("仅摘要")).not.toBeInTheDocument();
    expect(screen.getAllByText("依据资料状态").length).toBeGreaterThan(0);
    expect(screen.getAllByText("依据充足").length).toBeGreaterThan(0);
    expect(screen.getAllByText("依据数量").length).toBeGreaterThan(0);
    expect(screen.queryByText("引用脱敏状态")).not.toBeInTheDocument();
    expectRenderedTextToHideValues([
      redactedReferenceResponse.data.resultState.taskPublicId,
      redactedReferenceResponse.data.resultState.resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference.resultReference
        .resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference
        .aiCallLogReference.aiCallLogPublicId,
    ]);
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("places transient visible generated content next to the submit action before practice feedback", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "本次临时预览摘要",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 10,
              actualQuestionCount: 10,
              draftCount: 10,
              draftSummaries: [],
            },
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [emptyServerHistoryResponse, serverHistoryAfterSubmitResponse],
        visibleResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));

    const visibleGeneratedContent = await screen.findByTestId(
      "student-visible-generated-content",
    );
    const practiceFeedbackHeading = screen.getByText(
      "\u4f5c\u7b54\u4e0e\u89e3\u6790",
    );

    expect(
      visibleGeneratedContent.compareDocumentPosition(practiceFeedbackHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(visibleGeneratedContent).toHaveTextContent("草稿 10/10");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("renders transient AI paper draft preview counts and multi-question self-test from the learner paper action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const paperAssemblyContainer = createLearnerAiPaperAssemblyContainer({
      selectedQuestionCount: 2,
    });
    const paperVisibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          resultPublicId: "ai-generation-result-visible-paper-learner-001",
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            taskType: "ai_paper_generation",
          },
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "本次自测试卷草稿摘要",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 2,
              questionCount: 50,
              questionTypeDistributionCount: 3,
              knowledgeCoverageCount: 4,
              paperSectionSummaries: [
                {
                  sectionNumber: 1,
                  paperSectionType: "single_choice",
                  title: "synthetic learner paper section",
                  questionCount: 20,
                  questionDrafts: [
                    {
                      draftNumber: 1,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      questionStem: "synthetic visible learner paper stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText: "synthetic visible learner paper option",
                          isCorrect: true,
                        },
                        {
                          optionLabel: "B",
                          optionText:
                            "synthetic visible learner paper distractor",
                          isCorrect: false,
                        },
                      ],
                      standardAnswer: "A",
                      analysis: "synthetic visible learner paper analysis",
                      reviewStatus: "draft_review_required",
                    },
                    {
                      draftNumber: 2,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      questionStem:
                        "synthetic visible learner paper second stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText:
                            "synthetic visible learner paper second distractor",
                          isCorrect: false,
                        },
                        {
                          optionLabel: "B",
                          optionText:
                            "synthetic visible learner paper second correct",
                          isCorrect: true,
                        },
                      ],
                      standardAnswer: "B",
                      analysis:
                        "synthetic visible learner paper second analysis",
                      reviewStatus: "draft_review_required",
                    },
                  ],
                },
              ],
              reviewStatus: "draft_review_required",
            },
          },
          paperAssembly: {
            status: "assembled",
            sourceDiagnostics: {
              role: "personal_advanced_student",
              platformQuestionCount: 2,
              enterpriseQuestionCount: 0,
              enterpriseSourceStatus: "not_applicable",
            },
            container: paperAssemblyContainer,
            insufficiency: null,
            redactionStatus: "redacted",
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [emptyServerHistoryResponse, emptyServerHistoryResponse],
        paperVisibleResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(screen.getByRole("button", { name: paperButtonLabel }));

    const visibleGeneratedContent = await screen.findByTestId(
      "student-visible-generated-content",
    );

    expect(visibleGeneratedContent).toHaveTextContent("自测试卷预览");
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic learner paper section",
    );
    expect(visibleGeneratedContent).not.toHaveTextContent(
      "synthetic visible learner paper stem",
    );
    expect(visibleGeneratedContent).not.toHaveTextContent(
      "synthetic visible learner paper option",
    );
    expect(visibleGeneratedContent).not.toHaveTextContent("标准答案");
    expect(visibleGeneratedContent).not.toHaveTextContent(
      "synthetic visible learner paper analysis",
    );
    expect(visibleGeneratedContent).toHaveTextContent("结构化预览");
    expect(visibleGeneratedContent).toHaveTextContent("大题模块 2");
    expect(visibleGeneratedContent).toHaveTextContent("题量 50");
    const paperAssemblySummary = screen.getByTestId(
      "student-ai-paper-assembly-summary",
    );
    expect(paperAssemblySummary).toHaveTextContent("自测试卷预览");
    expect(paperAssemblySummary).toHaveTextContent(
      "synthetic assembled learner paper",
    );
    expect(paperAssemblySummary).toHaveTextContent("可开始作答");
    expect(paperAssemblySummary).toHaveTextContent("2/2 题");
    expect(paperAssemblySummary).toHaveTextContent("平台正式题 2 题");
    expect(paperAssemblySummary).toHaveTextContent("完全匹配");
    expect(paperAssemblySummary).toHaveTextContent("单选题");
    expect(paperAssemblySummary).not.toHaveTextContent(
      "synthetic visible learner paper stem",
    );
    expect(paperAssemblySummary).not.toHaveTextContent("标准答案");
    expect(screen.getAllByText("当前筛选：AI组卷").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "开始作答" }));
    const learningSession = await screen.findByTestId(
      "student-ai-learning-session",
    );
    expect(learningSession).toHaveTextContent("自测 2 题");
    expect(learningSession).toHaveTextContent(
      "synthetic visible learner paper stem",
    );
    expect(learningSession).toHaveTextContent(
      "synthetic visible learner paper second stem",
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /A synthetic visible learner paper option/,
      }),
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /B synthetic visible learner paper second correct/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "提交作答" }));
    expect(await screen.findByText("自测结果")).toBeInTheDocument();
    expect(learningSession).toHaveTextContent("正确 2 题");
    expect(learningSession).toHaveTextContent("得分 2.0/2.0");
    expect(screen.getAllByText("回答正确")).toHaveLength(2);
    expect(learningSession).toHaveTextContent("正式练习未写入");
    expect(learningSession).toHaveTextContent("错题本未写入");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("Authorization");
    expect(document.body.textContent).not.toContain("localStorage");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("blocks learner AI paper practice when formal source assembly is insufficient", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const paperVisibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          resultPublicId: "ai-generation-result-insufficient-paper-learner-001",
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            taskType: "ai_paper_generation",
          },
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "本次自测试卷草稿摘要",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 1,
              questionCount: 1,
              questionTypeDistributionCount: 1,
              knowledgeCoverageCount: 1,
              paperSectionSummaries: [
                {
                  sectionNumber: 1,
                  paperSectionType: "single_choice",
                  title: "synthetic insufficient paper section",
                  questionCount: 1,
                  questionDrafts: [
                    {
                      draftNumber: 1,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      questionStem: "synthetic blocked preview stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText: "synthetic blocked preview option",
                          isCorrect: true,
                        },
                      ],
                      standardAnswer: "A",
                      analysis: "synthetic blocked preview analysis",
                      reviewStatus: "draft_review_required",
                    },
                  ],
                },
              ],
              reviewStatus: "draft_review_required",
            },
          },
          paperAssembly: {
            status: "insufficient",
            sourceDiagnostics: {
              role: "personal_advanced_student",
              platformQuestionCount: 0,
              enterpriseQuestionCount: 0,
              enterpriseSourceStatus: "not_applicable",
            },
            container: createLearnerAiPaperAssemblyContainer({
              selectedQuestionCount: 0,
            }),
            insufficiency: {
              requestedQuestionCount: 1,
              selectedQuestionCount: 0,
              missingQuestionCount: 1,
              failureCategory: "insufficient_formal_question_source",
            },
            redactionStatus: "redacted",
          },
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      createPersonalAiGenerationFetchMockWithHistorySequence(
        [emptyServerHistoryResponse, emptyServerHistoryResponse],
        paperVisibleResponse,
      ),
    );

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(screen.getByRole("button", { name: paperButtonLabel }));

    expect((await screen.findAllByText("自测试卷预览")).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByTestId("student-ai-paper-assembly-summary"),
    ).toHaveTextContent("暂不能作答");
    expect(
      screen.getByTestId("student-ai-paper-assembly-blocked-reason"),
    ).toHaveTextContent("正式题源不足");
    expect(
      screen.getByTestId("student-ai-paper-assembly-blocked-reason"),
    ).toHaveTextContent("缺少 1 题");
    expect(screen.getByRole("button", { name: "开始作答" })).toBeDisabled();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
  });

  it("renders organization employee AI paper drafts from org authorization context", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const paperAssemblyContainer = createLearnerAiPaperAssemblyContainer({
      selectedQuestionCount: 1,
      sourceKind: "enterprise_training_snapshot",
      enterpriseTrainingSnapshotCount: 1,
    });
    const paperVisibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          resultPublicId: "ai-generation-result-visible-paper-employee-001",
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            taskType: "ai_paper_generation",
          },
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "生成试卷草稿已创建，待训练页查看",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 1,
              questionCount: 20,
              questionTypeDistributionCount: 1,
              knowledgeCoverageCount: 1,
              paperSectionSummaries: [
                {
                  sectionNumber: 1,
                  paperSectionType: "single_choice",
                  title: "synthetic employee paper section",
                  questionCount: 20,
                  questionDrafts: [
                    {
                      draftNumber: 1,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      questionStem: "synthetic visible employee paper stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText: "synthetic visible employee paper option",
                          isCorrect: true,
                        },
                        {
                          optionLabel: "B",
                          optionText:
                            "synthetic visible employee paper distractor",
                          isCorrect: false,
                        },
                      ],
                      standardAnswer: "A",
                      analysis: "synthetic visible employee paper analysis",
                      reviewStatus: "draft_review_required",
                    },
                  ],
                },
              ],
              reviewStatus: "draft_review_required",
            },
          },
          paperAssembly: {
            status: "assembled",
            sourceDiagnostics: {
              role: "org_advanced_employee",
              platformQuestionCount: 0,
              enterpriseQuestionCount: 1,
              enterpriseSourceStatus: "resolved",
            },
            container: paperAssemblyContainer,
            insufficiency: null,
            redactionStatus: "redacted",
          },
        },
      },
    };
    const historyResponses = [
      emptyServerHistoryResponse,
      emptyServerHistoryResponse,
    ];
    const learningSessionMockState = createPersonalAiLearningSessionMockState();
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (path === "/api/v1/sessions") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        if (path === "/api/v1/authorizations") {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                organizationPublicId: "organization-public-123",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-123",
              }),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () =>
                historyResponses.shift() ?? emptyServerHistoryResponse,
            };
          }

          expect(init?.method).toBe("POST");

          return {
            ok: true,
            status: 200,
            json: async () => paperVisibleResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          expect(init?.method).toBe("GET");

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        const learningSessionResponse =
          await handlePersonalAiLearningSessionFetch({
            actorPublicId: "employee-session-user-public-123",
            init,
            ownerPublicId: "organization-public-123",
            ownerType: "organization",
            path,
            persistedSourceTaskPublicId:
              paperVisibleResponse.data.resultState.taskPublicId,
            persistedVisibleGeneratedContent: paperVisibleResponse.data
              .runtimeBridge
              .visibleGeneratedContent as AiGenerationRouteIntegratedVisibleGeneratedContent,
            state: learningSessionMockState,
          });

        if (learningSessionResponse !== null) {
          return learningSessionResponse;
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(
      screen.getByRole("button", { name: employeePaperButtonLabel }),
    );

    const visibleGeneratedContent = await screen.findByTestId(
      "student-visible-generated-content",
    );
    expect(visibleGeneratedContent).toHaveTextContent("自测试卷预览");
    expect(visibleGeneratedContent).toHaveTextContent(
      "synthetic employee paper section",
    );
    expect(visibleGeneratedContent).not.toHaveTextContent(
      "synthetic visible employee paper stem",
    );
    expect(visibleGeneratedContent).not.toHaveTextContent(
      "synthetic visible employee paper option",
    );
    expect(visibleGeneratedContent).not.toHaveTextContent("标准答案");
    expect(visibleGeneratedContent).not.toHaveTextContent(
      "synthetic visible employee paper analysis",
    );
    const paperAssemblySummary = screen.getByTestId(
      "student-ai-paper-assembly-summary",
    );
    expect(paperAssemblySummary).toHaveTextContent("企业自测试卷预览");
    expect(paperAssemblySummary).toHaveTextContent("企业训练题 1 题");
    expect(paperAssemblySummary).toHaveTextContent("企业题源");
    expect(paperAssemblySummary).toHaveTextContent("已纳入");
    expect(paperAssemblySummary).not.toHaveTextContent(
      "synthetic visible employee paper stem",
    );
    expect(paperAssemblySummary).not.toHaveTextContent("标准答案");
    fireEvent.click(screen.getByRole("button", { name: "开始作答" }));
    const learningSession = await screen.findByTestId(
      "student-ai-learning-session",
    );
    expect(learningSession).toHaveTextContent("自测 1 题");
    fireEvent.click(
      screen.getByRole("radio", {
        name: /B synthetic visible employee paper distractor/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "提交作答" }));
    expect(await screen.findByText("回答错误")).toBeInTheDocument();
    expect(learningSession).toHaveTextContent("正确 0 题");
    expect(learningSession).toHaveTextContent("得分 0.0/1.0");
    expect(learningSession).toHaveTextContent("正式练习未写入");
    expect(learningSession).toHaveTextContent("错题本未写入");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
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
                taskType: "ai_question_generation",
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

    expect(await screen.findByText("2026年6月12日 20:45")).toBeInTheDocument();
    expect(screen.queryByText("requestPublicId")).not.toBeInTheDocument();
    expect(screen.queryByText("taskPublicId")).not.toBeInTheDocument();
    expect(screen.queryByText("resultPublicId")).not.toBeInTheDocument();
    expect(screen.queryByText("aiCallLogPublicId")).not.toBeInTheDocument();
    expect(screen.getByText("请求时间")).toBeInTheDocument();
    expect(screen.getAllByText("依据较少").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.queryByText("已脱敏")).not.toBeInTheDocument();
    expectRenderedTextToHideValues([
      redactedReferenceResponse.data.resultState.taskPublicId,
      redactedReferenceResponse.data.resultState.resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference.taskPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference.resultReference
        .resultPublicId,
      redactedReferenceResponse.data.requestFlow.resultReference
        .aiCallLogReference.aiCallLogPublicId,
      "personal-ai-request-public-server-history-001",
      "ai-generation-task-public-history-001",
      "ai-result-public-history-001",
      "ai-call-log-public-history-001",
    ]);
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("generated content");
    expect(document.body.textContent).not.toContain("full paper content");
    expect(document.body.textContent).not.toContain("unit-test-session-token");
  });

  it("requests task-type isolated paginated histories and shows the active history filter", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const observedGetUrls: string[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (path === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            observedGetUrls.push(path);

            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          return {
            ok: true,
            status: 200,
            json: async () => ({
              ...localExperienceResponse,
              data: {
                ...localExperienceResponse.data,
                requestFlow: {
                  ...localExperienceResponse.data.requestFlow,
                  resultReference: {
                    ...localExperienceResponse.data.requestFlow.resultReference,
                    taskType: "ai_paper_generation",
                  },
                },
              },
            }),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          observedGetUrls.push(path);

          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    expect(screen.getAllByText("当前筛选：AI出题").length).toBeGreaterThan(0);
    expect(observedGetUrls).toEqual(
      expect.arrayContaining([
        "/api/v1/personal-ai-generation-requests?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
        "/api/v1/personal-ai-generation-results?taskType=ai_question_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
      ]),
    );

    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(screen.getByRole("button", { name: paperButtonLabel }));

    await waitFor(() => {
      expect(observedGetUrls).toEqual(
        expect.arrayContaining([
          "/api/v1/personal-ai-generation-requests?taskType=ai_paper_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
          "/api/v1/personal-ai-generation-results?taskType=ai_paper_generation&page=1&pageSize=10&authorizationPublicId=authorization-context-ui-001",
        ]),
      );
    });
    expect(screen.getAllByText("当前筛选：AI组卷").length).toBeGreaterThan(0);
  });

  it("persists a personal advanced AI question learning session before answer and progress review", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const sourceResultPublicId =
      "ai-generation-result-visible-personal-api-001";
    const sourceTaskPublicId = "ai-generation-task-visible-personal-api-001";
    const sessionPublicId = `ai_learning_session_${sourceResultPublicId}`;
    const learningSessionQuestion = createLearningSessionQuestion({
      sessionPublicId,
      questionStem: "synthetic server personal learner stem",
      correctOptionLabel: "A",
      correctOptionText: "synthetic server personal correct option",
      wrongOptionLabel: "B",
      wrongOptionText: "synthetic server personal distractor",
      analysis: "synthetic server personal analysis",
    });
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: sourceTaskPublicId,
          resultPublicId: sourceResultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "synthetic persisted personal content",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            groundingSummary: {
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 1,
              actualQuestionCount: 1,
              draftCount: 1,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  knowledgeNodeLabels: ["synthetic knowledge node"],
                  questionStem: "synthetic persisted personal learner stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText: "synthetic persisted personal correct option",
                      isCorrect: true,
                    },
                    {
                      optionLabel: "B",
                      optionText: "synthetic persisted personal distractor",
                      isCorrect: false,
                    },
                  ],
                  standardAnswer: "A",
                  analysis: "synthetic persisted personal analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          blockedReasons: [],
        },
      },
    };
    const sessionCreateBodies: unknown[] = [];
    const answerSubmitBodies: unknown[] = [];
    const progressUrls: string[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => localSessionResponse,
          };
        }

        if (path === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () => createAdvancedAuthorizationListResponse(),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          return {
            ok: true,
            status: 200,
            json: async () => visibleResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        if (path === "/api/v1/personal-ai-generation-learning-sessions") {
          sessionCreateBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () =>
              createLearningSessionCreatedResponse({
                sessionPublicId,
                sourceResultPublicId,
                sourceTaskPublicId,
                ownerType: "personal",
                ownerPublicId: "student-public-ui-001",
                actorPublicId: localSessionUserPublicId,
                question: learningSessionQuestion,
              }),
          };
        }

        if (
          new URL(path, "http://localhost").pathname ===
          `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/answers`
        ) {
          answerSubmitBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () => {
              const response = createLearningAnswerFeedbackResponse({
                sessionPublicId,
                actorPublicId: localSessionUserPublicId,
                question: learningSessionQuestion,
                selectedOptionLabels: ["A"],
              });

              return {
                ...response,
                data: {
                  ...response.data,
                  status: "blocked" as const,
                  blockReason: "answer_revision_conflict" as const,
                  answerRevision: null,
                  isCorrect: null,
                  score: null,
                },
              };
            },
          };
        }

        if (
          new URL(path, "http://localhost").pathname ===
          `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress`
        ) {
          progressUrls.push(path);
          const answerFeedback = createLearningAnswerFeedbackResponse({
            sessionPublicId,
            actorPublicId: localSessionUserPublicId,
            question: learningSessionQuestion,
            selectedOptionLabels: ["A"],
          }).data;

          return {
            ok: true,
            status: 200,
            json: async () =>
              createLearningProgressResponse({
                sessionPublicId,
                sourceResultPublicId,
                sourceTaskPublicId,
                ownerType: "personal",
                ownerPublicId: "student-public-ui-001",
                actorPublicId: localSessionUserPublicId,
                answerFeedback:
                  progressUrls.length > 1 ? answerFeedback : undefined,
                questionCount: 1,
              }),
          };
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));
    expect(
      await screen.findByText("synthetic persisted personal learner stem"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "开始作答" }));
    const learningSession = await screen.findByTestId(
      "student-ai-learning-session",
    );
    expect(learningSession).toHaveTextContent(
      "synthetic server personal learner stem",
    );
    expect(learningSession).not.toHaveTextContent(
      "synthetic persisted personal learner stem",
    );
    await waitFor(() => expect(sessionCreateBodies).toHaveLength(1));
    expect(sessionCreateBodies[0]).toEqual({
      authorizationPublicId: "authorization-context-ui-001",
      sourceResultPublicId,
    });

    fireEvent.click(
      screen.getByRole("radio", {
        name: /A synthetic server personal correct option/,
      }),
    );
    const submitAnswerButton = screen.getByRole("button", {
      name: "提交作答",
    });
    fireEvent.click(submitAnswerButton);
    fireEvent.click(submitAnswerButton);
    await waitFor(() => expect(answerSubmitBodies).toHaveLength(1));
    expect(answerSubmitBodies[0]).toMatchObject({
      expectedAnswerRevision: 0,
      sessionQuestionPublicId: `${sessionPublicId}_q_1`,
      selectedOptionLabels: ["A"],
      textAnswer: null,
    });
    expect(await screen.findByText("回答正确")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "查看解析" }));
    await waitFor(() =>
      expect(progressUrls).toEqual([
        `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress?authorizationPublicId=authorization-context-ui-001`,
        `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress?authorizationPublicId=authorization-context-ui-001`,
        `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress?authorizationPublicId=authorization-context-ui-001`,
      ]),
    );
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
  });

  it("requires, submits, and restores a bounded subjective learning answer", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const sourceResultPublicId = "ai-generation-result-subjective-ui-001";
    const sourceTaskPublicId = "ai-generation-task-subjective-ui-001";
    const answerSubmitBodies: Array<Record<string, unknown>> = [];
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: sourceTaskPublicId,
          resultPublicId: sourceResultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "synthetic subjective learning draft",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            groundingSummary: {
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 1,
              actualQuestionCount: 1,
              draftCount: 1,
              draftSummaries: [
                {
                  draftPublicId: "ai_question_draft_subjective_ui_001",
                  draftNumber: 1,
                  questionType: "short_answer",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  knowledgeNodeLabels: ["synthetic knowledge node"],
                  questionStem: "synthetic subjective learner stem",
                  questionOptions: [],
                  standardAnswer: "synthetic server-only standard answer",
                  analysis: "synthetic server-only analysis",
                  scoringPoints: [
                    {
                      description: "synthetic scoring point",
                      score: "1.0",
                      sortOrder: 1,
                    },
                  ],
                  fillBlankAnswers: [],
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          blockedReasons: [],
        },
      },
    };
    const fetchMock = createPersonalAiGenerationFetchMock(
      visibleResponse,
      emptyServerHistoryResponse,
      {
        onAnswerSubmitBody(body) {
          answerSubmitBodies.push(body);
        },
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));
    expect(
      await screen.findByText("synthetic subjective learner stem"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "开始作答" }));

    const submitButton = screen.getByRole("button", { name: "提交作答" });
    expect(submitButton).toBeDisabled();
    const textArea = await screen.findByRole("textbox", {
      name: "题目 1 主观答案",
    });
    fireEvent.change(textArea, {
      target: { value: "  synthetic learner subjective answer  " },
    });
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);

    await waitFor(() => expect(answerSubmitBodies).toHaveLength(1));
    expect(answerSubmitBodies[0]).toMatchObject({
      expectedAnswerRevision: 0,
      selectedOptionLabels: [],
      textAnswer: "synthetic learner subjective answer",
    });
    expect(await screen.findByText("已提交，待人工评阅")).toBeInTheDocument();

    cleanup();
    render(createElement(StudentPersonalAiGenerationPage));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));
    await screen.findByText("synthetic subjective learner stem");
    fireEvent.click(screen.getByRole("button", { name: "开始作答" }));

    const restoredTextArea = await screen.findByRole("textbox", {
      name: "题目 1 主观答案",
    });
    expect(restoredTextArea).toHaveValue("synthetic learner subjective answer");
    expect(restoredTextArea).toBeDisabled();
    expect(screen.getByTestId("student-ai-learning-session")).toHaveTextContent(
      "已提交 1 题",
    );
  });

  it("persists an organization employee personal-authorization AI question learning session under personal owner context", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const sourceResultPublicId =
      "ai-generation-result-visible-employee-personal-api-001";
    const sourceTaskPublicId =
      "ai-generation-task-visible-employee-personal-api-001";
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: sourceTaskPublicId,
          resultPublicId: sourceResultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          contextSelection: {
            ...localExperienceResponse.data.requestFlow.contextSelection,
            userPublicId: "employee-session-user-public-123",
            authorizationBoundary: {
              authorizationSource: "personal_auth",
              authorizationPublicId: "personal-auth-context-dual-001",
              ownerType: "personal",
              ownerPublicId: "employee-session-user-public-123",
              organizationPublicId: null,
              quotaOwnerType: "personal",
              quotaOwnerPublicId: "employee-session-user-public-123",
            },
          },
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "synthetic employee personal content",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            groundingSummary: {
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              requestedQuestionCount: 1,
              actualQuestionCount: 1,
              draftCount: 1,
              draftSummaries: [
                {
                  draftNumber: 1,
                  questionType: "single_choice",
                  difficulty: "medium",
                  knowledgeNodeCount: 1,
                  knowledgeNodeLabels: ["synthetic knowledge node"],
                  questionStem:
                    "synthetic persisted employee personal learner stem",
                  questionOptions: [
                    {
                      optionLabel: "A",
                      optionText:
                        "synthetic persisted employee personal correct option",
                      isCorrect: true,
                    },
                    {
                      optionLabel: "B",
                      optionText:
                        "synthetic persisted employee personal distractor",
                      isCorrect: false,
                    },
                  ],
                  standardAnswer: "A",
                  analysis: "synthetic persisted employee personal analysis",
                  reviewStatus: "draft_review_required",
                },
              ],
            },
          },
          blockedReasons: [],
        },
      },
    };
    const historyResponses = [
      emptyServerHistoryResponse,
      emptyServerHistoryResponse,
    ];
    const sessionCreateBodies: unknown[] = [];
    const learningSessionMockState = createPersonalAiLearningSessionMockState();
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        expect(init?.headers).toMatchObject({
          authorization: "Bearer unit-test-session-token",
        });

        if (path === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        if (path === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () =>
              createPersonalAndOrganizationAdvancedAuthorizationListResponse(),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () =>
                historyResponses.shift() ?? emptyServerHistoryResponse,
            };
          }

          return {
            ok: true,
            status: 200,
            json: async () => visibleResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        const learningSessionResponse =
          await handlePersonalAiLearningSessionFetch({
            actorPublicId: "employee-session-user-public-123",
            init,
            onSessionCreateBody: (body) => sessionCreateBodies.push(body),
            ownerPublicId: "employee-session-user-public-123",
            ownerType: "personal",
            path,
            state: learningSessionMockState,
          });

        if (learningSessionResponse !== null) {
          return learningSessionResponse;
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(
      await screen.findByText(
        "请先确认一个具体授权，再查看历史或使用生成设置。",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("个人授权 · 高级版 · 专卖 3级"));
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: requestButtonLabel }));
    expect(
      await screen.findByText(
        "synthetic persisted employee personal learner stem",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "开始作答" }));
    await waitFor(() => expect(sessionCreateBodies).toHaveLength(1));
    expect(sessionCreateBodies[0]).toEqual({
      authorizationPublicId: "personal-auth-context-dual-001",
      sourceResultPublicId,
    });
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("raw prompt");
    expect(document.body.textContent).not.toContain("provider payload");
  });

  it("persists an organization employee AI paper learning session under organization context", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-session-token");
    const sourceResultPublicId =
      "ai-generation-result-visible-employee-paper-api-001";
    const sourceTaskPublicId =
      "ai-generation-task-visible-employee-paper-api-001";
    const sessionPublicId = `ai_learning_session_${sourceResultPublicId}`;
    const paperAssemblyContainer = createLearnerAiPaperAssemblyContainer({
      selectedQuestionCount: 1,
      sourceKind: "enterprise_training_snapshot",
      enterpriseTrainingSnapshotCount: 1,
    });
    const learningSessionQuestion = createLearningSessionQuestion({
      sessionPublicId,
      questionStem: "synthetic server employee paper stem",
      correctOptionLabel: "A",
      correctOptionText: "synthetic server employee paper correct option",
      wrongOptionLabel: "B",
      wrongOptionText: "synthetic server employee paper distractor",
      analysis: "synthetic server employee paper analysis",
    });
    const visibleResponse = {
      ...localExperienceResponse,
      data: {
        ...localExperienceResponse.data,
        flowStatus: "accepted",
        resultState: {
          ...localExperienceResponse.data.resultState,
          status: "succeeded",
          taskPublicId: sourceTaskPublicId,
          resultPublicId: sourceResultPublicId,
          evidenceStatus: "sufficient",
          citationCount: 2,
        },
        requestFlow: {
          ...localExperienceResponse.data.requestFlow,
          contextSelection: {
            ...localExperienceResponse.data.requestFlow.contextSelection,
            authorizationBoundary: {
              authorizationSource: "org_auth",
              authorizationPublicId: "org-auth-context-api-001",
              ownerType: "organization",
              ownerPublicId: "organization-public-123",
              organizationPublicId: "organization-public-123",
              quotaOwnerType: "organization",
              quotaOwnerPublicId: "organization-public-123",
            },
          },
          resultReference: {
            ...localExperienceResponse.data.requestFlow.resultReference,
            taskType: "ai_paper_generation",
          },
        },
        runtimeBridge: {
          ...localExperienceResponse.data.runtimeBridge,
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            content: "synthetic persisted employee paper content",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            groundingSummary: {
              evidenceStatus: "sufficient",
              citationCount: 2,
            },
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 1,
              questionCount: 50,
              questionTypeDistributionCount: 1,
              knowledgeCoverageCount: 1,
              reviewStatus: "draft_review_required",
              paperSectionSummaries: [
                {
                  sectionNumber: 1,
                  paperSectionType: "single_choice",
                  title: "synthetic persisted employee paper section",
                  questionCount: 1,
                  questionDrafts: [
                    {
                      draftNumber: 1,
                      questionType: "single_choice",
                      difficulty: "medium",
                      knowledgeNodeCount: 1,
                      knowledgeNodeLabels: ["synthetic knowledge node"],
                      questionStem: "synthetic persisted employee paper stem",
                      questionOptions: [
                        {
                          optionLabel: "A",
                          optionText:
                            "synthetic persisted employee paper correct option",
                          isCorrect: true,
                        },
                        {
                          optionLabel: "B",
                          optionText:
                            "synthetic persisted employee paper distractor",
                          isCorrect: false,
                        },
                      ],
                      standardAnswer: "A",
                      analysis: "synthetic persisted employee paper analysis",
                      reviewStatus: "draft_review_required",
                    },
                  ],
                },
              ],
            },
          },
          paperAssembly: {
            status: "assembled",
            sourceDiagnostics: {
              role: "org_advanced_employee",
              platformQuestionCount: 0,
              enterpriseQuestionCount: 1,
              enterpriseSourceStatus: "resolved",
            },
            container: paperAssemblyContainer,
            insufficiency: null,
            redactionStatus: "redacted",
          },
          blockedReasons: [],
        },
      },
    };
    const sessionCreateBodies: unknown[] = [];
    const answerSubmitBodies: unknown[] = [];
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return {
            ok: true,
            status: 200,
            json: async () => employeeSessionResponse,
          };
        }

        if (path === "/api/v1/authorizations") {
          return {
            ok: true,
            status: 200,
            json: async () =>
              createAdvancedAuthorizationListResponse({
                authorizationSource: "org_auth",
                authorizationPublicId: "org-auth-context-api-001",
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                organizationPublicId: "organization-public-123",
                quotaOwnerType: "organization",
                quotaOwnerPublicId: "organization-public-123",
              }),
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-requests")) {
          if (init?.method === "GET") {
            return {
              ok: true,
              status: 200,
              json: async () => emptyServerHistoryResponse,
            };
          }

          return {
            ok: true,
            status: 200,
            json: async () => visibleResponse,
          };
        }

        if (path.startsWith("/api/v1/personal-ai-generation-results")) {
          return {
            ok: true,
            status: 200,
            json: async () => emptyResultHistoryResponse,
          };
        }

        if (path === "/api/v1/personal-ai-generation-learning-sessions") {
          sessionCreateBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () =>
              createLearningSessionCreatedResponse({
                sessionPublicId,
                sourceResultPublicId,
                sourceTaskPublicId,
                ownerType: "organization",
                ownerPublicId: "organization-public-123",
                actorPublicId: "employee-session-user-public-123",
                question: learningSessionQuestion,
              }),
          };
        }

        if (
          new URL(path, "http://localhost").pathname ===
          `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/answers`
        ) {
          answerSubmitBodies.push(JSON.parse(String(init?.body)));

          return {
            ok: true,
            status: 200,
            json: async () =>
              createLearningAnswerFeedbackResponse({
                sessionPublicId,
                actorPublicId: "employee-session-user-public-123",
                question: learningSessionQuestion,
                selectedOptionLabels: ["B"],
              }),
          };
        }

        if (
          new URL(path, "http://localhost").pathname ===
          `/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress`
        ) {
          return {
            ok: true,
            status: 200,
            json: async () =>
              createLearningProgressResponse({
                actorPublicId: "employee-session-user-public-123",
                answerFeedbacks: [],
                ownerPublicId: "organization-public-123",
                ownerType: "organization",
                questionCount: 1,
                sessionPublicId,
                sourceResultPublicId,
                sourceTaskPublicId,
              }),
          };
        }

        throw new Error(`Unexpected fetch path: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentPersonalAiGenerationPage));

    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: aiPaperTabLabel }));
    fireEvent.click(
      screen.getByRole("button", { name: employeePaperButtonLabel }),
    );
    expect(await screen.findByText("自测试卷预览")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(
      "synthetic persisted employee paper analysis",
    );

    fireEvent.click(screen.getByRole("button", { name: "开始作答" }));
    const learningSession = await screen.findByTestId(
      "student-ai-learning-session",
    );
    expect(learningSession).toHaveTextContent(
      "synthetic server employee paper stem",
    );
    expect(learningSession).not.toHaveTextContent(
      "synthetic persisted employee paper stem",
    );
    expect(
      await screen.findByText("synthetic server employee paper stem"),
    ).toBeInTheDocument();
    await waitFor(() => expect(sessionCreateBodies).toHaveLength(1));
    expect(sessionCreateBodies).toEqual([
      {
        authorizationPublicId: "org-auth-context-api-001",
        sourceResultPublicId,
      },
    ]);

    fireEvent.click(
      screen.getByRole("radio", {
        name: /B synthetic server employee paper distractor/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "提交作答" }));
    await waitFor(() => expect(answerSubmitBodies).toHaveLength(1));
    expect(answerSubmitBodies[0]).toMatchObject({
      expectedAnswerRevision: 0,
      sessionQuestionPublicId: `${sessionPublicId}_q_1`,
      selectedOptionLabels: ["B"],
      textAnswer: null,
    });
    expect(await screen.findByText("回答错误")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-session-token");
    expect(document.body.textContent).not.toContain("provider payload");
    expect(document.body.textContent).not.toContain("raw prompt");
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
    expect(await screen.findByText(historyEmptyTitle)).toBeInTheDocument();
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
