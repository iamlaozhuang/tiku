import { describe, expect, it } from "vitest";

import {
  createPersonalAiGenerationRequestRouteHandlers,
  createPersonalAiGenerationRequestUserResolver,
} from "./personal-ai-generation-request-route";
import { SESSION_COOKIE_NAME } from "../auth/session-cookie";
import type {
  CreatePersonalAiGenerationRequestInput,
  PersonalAiGenerationRequestPersistenceResult,
  PersonalAiGenerationRequestRepository,
} from "../repositories/personal-ai-generation-request-repository";
import type { PersonalAiGenerationResultRepository } from "../repositories/personal-ai-generation-result-repository";
import type {
  QuestionAccessRow,
  QuestionRepository,
} from "../repositories/question-repository";
import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";
import type { SessionService } from "./session-service";
import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type { EffectiveAuthorizationService } from "./effective-authorization-service";
import type { AiPaperRoutePlanSelectWiringResult } from "./ai-paper-route-plan-select-wiring-service";

const userContext = {
  userPublicId: "resolver_user_public_123",
  userType: "personal",
  employeePublicId: null,
  organizationPublicId: null,
} as const;

const employeeUserContext = {
  userPublicId: "employee_session_user_public_123",
  userType: "employee",
  employeePublicId: "employee_public_123",
  organizationPublicId: "organization_public_123",
} as const;

const disabledAiCapabilities = {
  canGenerateAiQuestion: false,
  canGenerateAiPaper: false,
  canCreateOrganizationTraining: false,
  canAnswerOrganizationTraining: false,
  canViewOrganizationTrainingSummary: false,
  canManageAuthorizationQuota: false,
} as const;

const sufficientGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    generationParameters: {
      profession: "monopoly",
      level: 3,
      subject: "theory",
      knowledgeNode: "synthetic knowledge node",
      knowledgeNodeMode: "balanced",
      knowledgeNodePublicIds: [],
      includeDescendants: false,
      knowledgeNodeSupplement: "synthetic knowledge node",
      sourcePreference: null,
      questionType: "single_choice",
      questionCount: 10,
      difficulty: "medium",
      learningObjective: "synthetic learning goal",
    },
    evidenceStatus: "sufficient",
    citationCount: 1,
    citations: [
      {
        resourceTitle: "synthetic resource title",
        headingPath: ["synthetic heading"],
        chunkIndex: 0,
        chunkText: "synthetic bounded grounding evidence",
        score: 0.91,
      },
    ],
  };
const insufficientGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    ...sufficientGroundingContext,
    evidenceStatus: "none",
    citationCount: 0,
    citations: [],
  };

function createBaseBody() {
  const omittedTextA = ["OMITTED", "A"].join("-");
  const omittedTextB = ["OMITTED", "B"].join("-");
  const omittedTextC = ["OMITTED", "C"].join("-");
  const omittedTextD = ["OMITTED", "D"].join("-");
  const omittedTextE = ["OMITTED", "E"].join("-");

  return {
    id: 701,
    userPublicId: "body_user_public_999",
    authorizationPublicId: "personal_auth_public_123",
    aiFuncType: "explanation",
    questionPublicId: "question_public_123",
    answerRecordPublicId: "answer_record_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: null,
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    omittedFixtureOne: omittedTextA,
    omittedFixtureTwo: omittedTextB,
    omittedFixtureThree: omittedTextC,
    omittedFixtureFour: omittedTextD,
    omittedFixtureFive: omittedTextE,
  };
}

function createBaseFlowBody() {
  return {
    ...createBaseBody(),
    responseMode: "local_browser_experience",
    requestPublicId: "personal_ai_request_public_route_123",
    taskPublicId: "ai_generation_task_public_route_123",
    taskType: "ai_question_generation",
    actorPublicId: userContext.userPublicId,
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: userContext.userPublicId,
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: userContext.userPublicId,
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:personal_generation_route_123",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
  };
}

function createPostRequest(body: Record<string, unknown>): Request {
  return new Request(
    "http://localhost/api/v1/personal-ai-generation-requests",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

function createGetRequest(query = ""): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-requests${query}`,
    {
      method: "GET",
    },
  );
}

function getPersonalAiGenerationRequestHistoryRouteHandler(
  collection: unknown,
) {
  const getHandler = (
    collection as {
      GET?: (request: Request) => Promise<Response>;
    }
  ).GET;

  expect(getHandler).toEqual(expect.any(Function));

  return getHandler as (request: Request) => Promise<Response>;
}

function createRequestRepository(
  historyRows: Awaited<
    ReturnType<PersonalAiGenerationRequestRepository["listRequestHistory"]>
  > = [],
  options: {
    createError?: Error;
    createResult?: PersonalAiGenerationRequestPersistenceResult;
  } = {},
): Pick<
  PersonalAiGenerationRequestRepository,
  "createOrReuseRequest" | "listRequestHistory"
> & {
  calls: Array<{
    ownerPublicId: string;
    taskType?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
  }>;
  createCalls: CreatePersonalAiGenerationRequestInput[];
} {
  const calls: Array<{
    ownerPublicId: string;
    taskType?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
  }> = [];
  const createCalls: CreatePersonalAiGenerationRequestInput[] = [];

  return {
    calls,
    createCalls,
    async listRequestHistory(query) {
      calls.push(query);

      return historyRows;
    },
    async createOrReuseRequest(input) {
      createCalls.push(input);

      if (options.createError !== undefined) {
        throw options.createError;
      }

      return (
        options.createResult ?? {
          persistenceStatus: "created",
          historyItem: {
            requestPublicId: input.requestPublicId,
            taskPublicId: input.taskPublicId,
            status: "pending",
            requestedAt: input.requestedAt.toISOString(),
            taskType: input.taskType,
            resultPublicId: input.resultPublicId ?? null,
            evidenceStatus: input.evidenceStatus ?? "none",
            citationCount: input.citationCount ?? 0,
            aiCallLogPublicId: input.aiCallLogPublicId ?? null,
            redactionStatus: "redacted",
          },
        }
      );
    },
  };
}

function createResultRepository(): Pick<
  PersonalAiGenerationResultRepository,
  "createOrReuseDraftResult"
> & {
  createCalls: Parameters<
    PersonalAiGenerationResultRepository["createOrReuseDraftResult"]
  >[0][];
} {
  const createCalls: Parameters<
    PersonalAiGenerationResultRepository["createOrReuseDraftResult"]
  >[0][] = [];

  return {
    createCalls,
    async createOrReuseDraftResult(input) {
      createCalls.push(input);

      return {
        persistenceStatus: "created",
        result: {
          resultPublicId: input.resultPublicId,
          taskPublicId: input.taskPublicId,
          requestPublicId: "personal_ai_request_public_route_123",
          taskType: input.taskType,
          status: "draft",
          persistedAt: input.createdAt.toISOString(),
          contentReference: {
            contentDigest: input.contentDigest,
            contentPreviewMasked: input.contentPreviewMasked,
            contentVisibility: "redacted_snapshot",
            redactionStatus: "redacted",
          },
          evidenceReference: {
            evidenceStatus: input.evidenceStatus,
            citationCount: input.citationCount,
            aiCallLogPublicId: input.aiCallLogPublicId,
            redactionStatus: "redacted",
          },
          formalAdoption: {
            isBlocked: true,
            status: "blocked",
          },
        },
      };
    },
  };
}

function createEffectiveAuthorizationService(
  authorizationContexts: EffectiveAuthorizationContextDto[],
): Pick<EffectiveAuthorizationService, "listEffectiveAuthorizations"> {
  return {
    async listEffectiveAuthorizations() {
      return {
        code: 0,
        message: "ok",
        data: {
          authorizations: [],
          effectiveAuthorizations: [],
          authorizationContexts,
        },
      };
    },
  };
}

function createPaperPlanProviderContent(questionCount: number) {
  return JSON.stringify({
    title: "redacted paper plan",
    totalQuestionCount: questionCount,
    paperSections: [
      {
        paperSectionType: "single_choice",
        title: "redacted section",
        questionCount,
      },
    ],
    questionTypeDistribution: {
      single_choice: questionCount,
    },
    knowledgeCoverage: {
      knowledgeNodePublicIds: ["knowledge_node_public_default"],
    },
  });
}

function createQuestionSetProviderContent(questionCount: number) {
  return JSON.stringify({
    questions: Array.from({ length: questionCount }, (_, index) => ({
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["redacted knowledge node"],
      stem: `redacted stem ${index + 1}`,
      options: ["A", "B", "C", "D"],
      answer: "A",
      analysis: "redacted analysis",
    })),
  });
}

function createAssembledPaperRouteResult(
  input: {
    role: "personal_advanced_student" | "org_advanced_employee";
    platformQuestionCount: number;
    enterpriseQuestionCount: number;
  } = {
    role: "org_advanced_employee",
    platformQuestionCount: 2,
    enterpriseQuestionCount: 1,
  },
): AiPaperRoutePlanSelectWiringResult {
  const selectedQuestions = [
    ...Array.from({ length: input.platformQuestionCount }, (_, index) => ({
      questionPublicId: `platform_question_public_${index + 1}`,
      sourceKind: "platform_formal_question" as const,
      matchTier: "exact" as const,
      score: 1,
    })),
    ...Array.from({ length: input.enterpriseQuestionCount }, (_, index) => ({
      questionPublicId: `enterprise_question_public_${index + 1}`,
      sourceKind: "enterprise_training_snapshot" as const,
      matchTier: "same_scope" as const,
      score: 1,
    })),
  ];
  const selectedQuestionCount = selectedQuestions.length;

  return {
    status: "assembled",
    sourceDiagnostics: {
      role: input.role,
      platformQuestionCount: input.platformQuestionCount,
      enterpriseQuestionCount: input.enterpriseQuestionCount,
      enterpriseSourceStatus:
        input.role === "personal_advanced_student"
          ? "not_applicable"
          : "resolved",
    },
    assembly: {
      status: "assembled",
      container: {
        title: "redacted paper container",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        requestedQuestionCount: selectedQuestionCount,
        selectedQuestionCount,
        sourceComposition: {
          platformFormalQuestionCount: input.platformQuestionCount,
          enterpriseTrainingSnapshotCount: input.enterpriseQuestionCount,
        },
        matchQuality: "fully_matched",
        sections: [
          {
            sectionKey: "single_choice",
            title: "redacted section",
            questionType: "single_choice",
            targetQuestionCount: selectedQuestionCount,
            selectedQuestionCount,
            selectedQuestions,
            degradationSummary: {
              exactCount: input.platformQuestionCount,
              nearbyKnowledgeCount: 0,
              sameScopeCount: input.enterpriseQuestionCount,
            },
          },
        ],
      },
      insufficiency: null,
    },
    rejection: null,
  };
}

function createRejectedPaperRouteResult(): AiPaperRoutePlanSelectWiringResult {
  return {
    status: "rejected",
    sourceDiagnostics: {
      role: "org_advanced_employee",
      platformQuestionCount: 0,
      enterpriseQuestionCount: 0,
      enterpriseSourceStatus: "not_resolved",
    },
    assembly: null,
    rejection: {
      failureCategory: "provider_question_content_forbidden",
    },
  };
}

function createQuestionRow(
  override: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 101,
    public_id: "platform_question_public_default",
    question_type: "single_choice",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    stem_rich_text: "SENSITIVE_STEM_MARKER",
    analysis_rich_text: "SENSITIVE_ANALYSIS_MARKER",
    standard_answer_rich_text: "SENSITIVE_ANSWER_MARKER",
    status: "available",
    is_locked: false,
    locked_at: null,
    multi_choice_rule: "all_correct_only",
    scoring_method: "auto_match",
    fill_blank_answers: [],
    material_id: null,
    material_public_id: null,
    question_options: [
      {
        id: 201,
        question_id: 101,
        label: "A",
        content_rich_text: "SENSITIVE_OPTION_MARKER",
        is_correct: true,
        sort_order: 1,
        created_at: new Date("2026-07-06T00:00:00.000Z"),
        updated_at: new Date("2026-07-06T00:00:00.000Z"),
      },
    ],
    scoring_points: [],
    knowledge_node_public_ids: ["knowledge_node_public_default"],
    tag_public_ids: [],
    created_at: new Date("2026-07-06T00:00:00.000Z"),
    updated_at: new Date("2026-07-06T00:00:00.000Z"),
    ...override,
  };
}

function createTrainingVersion(
  override: Partial<OrganizationTrainingPublishedVersionDto> = {},
): OrganizationTrainingPublishedVersionDto {
  return {
    publicId: "training_version_public_default",
    draftPublicId: "training_draft_public_default",
    versionNumber: 1,
    organizationPublicId: "organization_public_123",
    publishScopeSnapshot: {
      organizationPublicIds: ["organization_public_123"],
      capturedAt: "2026-07-06T00:00:00.000Z",
    },
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "SENSITIVE_TRAINING_TITLE",
    description: "SENSITIVE_TRAINING_DESCRIPTION",
    questionCount: 1,
    totalScore: 1,
    status: "published",
    publishedAt: "2026-07-06T00:00:00.000Z",
    takenDownAt: null,
    takedownReason: null,
    questions: [createTrainingQuestion("enterprise_question_public_default")],
    ...override,
  };
}

function createTrainingQuestion(publicId: string) {
  return {
    publicId,
    sequenceNumber: 1,
    questionType: "single_choice",
    materialTitle: "SENSITIVE_ENTERPRISE_MATERIAL_TITLE",
    materialContent: "SENSITIVE_ENTERPRISE_MATERIAL_CONTENT",
    stem: "SENSITIVE_ENTERPRISE_STEM",
    options: [
      {
        publicId: `${publicId}_option_a`,
        label: "A",
        content: "SENSITIVE_ENTERPRISE_OPTION",
      },
    ],
    score: 1,
  } satisfies NonNullable<
    OrganizationTrainingPublishedVersionDto["questions"]
  >[number];
}

describe("personal AI generation request route handlers", () => {
  it("resolves user public id from the local session runtime without exposing session material", async () => {
    const observedAuthorizationValues: Array<string | null | undefined> = [];
    const sessionService: Pick<SessionService, "getCurrentSession"> = {
      async getCurrentSession(input) {
        observedAuthorizationValues.push(input.authorization);

        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "session_user_public_123",
              phone: "13800000000",
              name: "本地学员",
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
      },
    };
    const resolveUserContext =
      createPersonalAiGenerationRequestUserResolver(sessionService);

    const resolvedUserContext = await resolveUserContext(
      new Request("http://localhost/api/v1/personal-ai-generation-requests", {
        headers: {
          authorization: "Bearer synthetic-local-session-token",
        },
      }),
    );

    expect(resolvedUserContext).toEqual({
      userPublicId: "session_user_public_123",
      userType: "personal",
      employeePublicId: null,
      organizationPublicId: null,
    });
    expect(observedAuthorizationValues).toEqual([
      "Bearer synthetic-local-session-token",
    ]);
    expect(JSON.stringify(resolvedUserContext)).not.toContain(
      "synthetic-local-session-token",
    );
  });

  it("resolves cookie-backed personal sessions without requiring an authorization header", async () => {
    const observedAuthorizationValues: Array<string | null | undefined> = [];
    const sessionService: Pick<SessionService, "getCurrentSession"> = {
      async getCurrentSession(input) {
        observedAuthorizationValues.push(input.authorization);

        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "cookie_session_user_public_123",
              phone: "13800000000",
              name: "cookie learner",
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
      },
    };
    const resolveUserContext =
      createPersonalAiGenerationRequestUserResolver(sessionService);

    const resolvedUserContext = await resolveUserContext(
      new Request("http://localhost/api/v1/personal-ai-generation-requests", {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=synthetic-cookie-session-token`,
        },
      }),
    );

    expect(resolvedUserContext).toEqual({
      userPublicId: "cookie_session_user_public_123",
      userType: "personal",
      employeePublicId: null,
      organizationPublicId: null,
    });
    expect(observedAuthorizationValues).toEqual([
      "Bearer synthetic-cookie-session-token",
    ]);
    expect(JSON.stringify(resolvedUserContext)).not.toContain(
      "synthetic-cookie-session-token",
    );
  });

  it("resolves employee sessions as organization-context local AI requests instead of unauthenticated", async () => {
    const sessionService: Pick<SessionService, "getCurrentSession"> = {
      async getCurrentSession() {
        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "employee_session_user_public_123",
              phone: "13900000000",
              name: "企业员工",
              userType: "employee",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: "employee_public_123",
              organizationPublicId: "organization_public_123",
              adminPublicId: null,
              adminRoles: [],
            },
            session: {
              expiresAt: "2026-06-19T12:00:00.000Z",
            },
          },
        };
      },
    };
    const resolveUserContext =
      createPersonalAiGenerationRequestUserResolver(sessionService);
    const resolvedUserContext = await resolveUserContext(
      new Request("http://localhost/api/v1/personal-ai-generation-requests"),
    );

    expect(resolvedUserContext).toEqual({
      userPublicId: "employee_session_user_public_123",
      userType: "employee",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });

    const { collection } =
      createPersonalAiGenerationRequestRouteHandlers(resolveUserContext);

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationPublicId: "org_auth_public_123",
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        organizationPublicId: "organization_public_123",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization_public_123",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: expect.objectContaining({
        requestFlow: expect.objectContaining({
          contextSelection: expect.objectContaining({
            userPublicId: "employee_session_user_public_123",
            authorizationBoundary: {
              authorizationSource: "org_auth",
              authorizationPublicId: "org_auth_public_123",
              ownerType: "organization",
              ownerPublicId: "organization_public_123",
              organizationPublicId: "organization_public_123",
              quotaOwnerType: "organization",
              quotaOwnerPublicId: "organization_public_123",
            },
          }),
          taskRequest: expect.objectContaining({
            authorizationSource: "org_auth",
            actorPublicId: "employee_session_user_public_123",
            ownerType: "organization",
            ownerPublicId: "organization_public_123",
            organizationPublicId: "organization_public_123",
            quotaOwnerType: "organization",
            quotaOwnerPublicId: "organization_public_123",
          }),
        }),
      }),
    });
  });

  it("persists employee local browser POST metadata under the organization owner", async () => {
    const requestedAt = new Date("2026-06-12T18:30:00.000Z");
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository,
        now: () => requestedAt,
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationPublicId: "org_auth_public_123",
        authorizationSource: "personal_auth",
        ownerType: "personal",
        ownerPublicId: "stale_personal_owner_public_999",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "stale_quota_owner_public_999",
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        requestFlow: {
          taskRequest: {
            authorizationSource: "org_auth",
            actorPublicId: employeeUserContext.userPublicId,
            ownerType: "organization",
            ownerPublicId: employeeUserContext.organizationPublicId,
            organizationPublicId: employeeUserContext.organizationPublicId,
            quotaOwnerType: "organization",
            quotaOwnerPublicId: employeeUserContext.organizationPublicId,
          },
        },
      },
    });
    expect(requestRepository.createCalls).toEqual([
      expect.objectContaining({
        authorizationPublicId: "org_auth_public_123",
        actorPublicId: employeeUserContext.userPublicId,
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
        requestedAt,
      }),
    ]);
    expect(serializedPayload).not.toContain("stale_personal_owner_public_999");
    expect(serializedPayload).not.toContain("stale_quota_owner_public_999");
  });

  it("rejects employee local browser POST when the server effective authorization is not advanced AI capable", async () => {
    const requestRepository = createRequestRepository();
    const providerExecutorCalls: unknown[] = [];
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository,
        effectiveAuthorizationService: createEffectiveAuthorizationService([
          {
            profession: "monopoly",
            level: 3,
            contextDisplayStatus: "display_only",
            effectiveEdition: "standard",
            authorizationSource: "org_auth",
            authorizationPublicId: "org_auth_standard_public_123",
            ownerType: "organization",
            ownerPublicId: employeeUserContext.organizationPublicId,
            organizationPublicId: employeeUserContext.organizationPublicId,
            quotaOwnerType: "organization",
            quotaOwnerPublicId: employeeUserContext.organizationPublicId,
            capabilities: disabledAiCapabilities,
            blockedReason: null,
          },
        ]),
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => sufficientGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async (executionInput) => {
              providerExecutorCalls.push(executionInput);

              return {
                requestCount: 1,
                resultStatus: "pass",
                failureCategory: null,
                durationMs: 37,
                usageSummary: null,
                providerErrorSummary: null,
                visibleGeneratedContent: null,
              };
            },
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationPublicId: "org_auth_standard_public_123",
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 403057,
      message:
        "Personal AI generation is not available for this authorization.",
      data: null,
    });
    expect(requestRepository.createCalls).toHaveLength(0);
    expect(providerExecutorCalls).toHaveLength(0);
    expect(serializedPayload).not.toContain("synthetic-test-credential");
  });

  it("allows advanced employee local browser POST when only production enablement is blocked", async () => {
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository,
        effectiveAuthorizationService: createEffectiveAuthorizationService([
          {
            profession: "monopoly",
            level: 3,
            contextDisplayStatus: "display_only",
            effectiveEdition: "advanced",
            authorizationSource: "org_auth",
            authorizationPublicId: "org_auth_advanced_public_123",
            ownerType: "organization",
            ownerPublicId: employeeUserContext.organizationPublicId,
            organizationPublicId: employeeUserContext.organizationPublicId,
            quotaOwnerType: "organization",
            quotaOwnerPublicId: employeeUserContext.organizationPublicId,
            capabilities: {
              ...disabledAiCapabilities,
              canGenerateAiQuestion: true,
              canGenerateAiPaper: true,
            },
            blockedReason: "production_enablement_blocked",
          },
        ]),
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationPublicId: "org_auth_advanced_public_123",
        authorizationSource: "personal_auth",
        ownerType: "personal",
        ownerPublicId: "stale_personal_owner_public_999",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "stale_quota_owner_public_999",
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        requestFlow: {
          taskRequest: {
            authorizationSource: "org_auth",
            authorizationPublicId: "org_auth_advanced_public_123",
            ownerType: "organization",
            ownerPublicId: employeeUserContext.organizationPublicId,
            organizationPublicId: employeeUserContext.organizationPublicId,
            quotaOwnerType: "organization",
            quotaOwnerPublicId: employeeUserContext.organizationPublicId,
          },
        },
      },
    });
    expect(requestRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toContain("stale_personal_owner_public_999");
    expect(serializedPayload).not.toContain("stale_quota_owner_public_999");
  });

  it("merges resolver user context and returns a redacted local request contract", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(createPostRequest(createBaseBody()));

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "resolver_user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        generationContext: {
          questionPublicId: "question_public_123",
          answerRecordPublicId: "answer_record_public_123",
          paperPublicId: "paper_public_123",
          mockExamPublicId: null,
          selectedContext: {
            contextType: "paper",
            contextPublicId: "paper_public_123",
          },
        },
        generationParameters: null,
        redeemCodeReference: {
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
      },
    });
  });

  it("returns the standard unauthorized response when user context is missing", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => null,
    );

    const response = await collection.POST(createPostRequest(createBaseBody()));

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("returns the standard unauthorized response when request history user context is missing", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => null,
    );

    const response =
      await getPersonalAiGenerationRequestHistoryRouteHandler(collection)(
        createGetRequest(),
      );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("returns a session-owned empty request history list without echoing query user ids", async () => {
    const staleQueryUserPublicId = "query_stale_user_public_999";
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await getPersonalAiGenerationRequestHistoryRouteHandler(
      collection,
    )(createGetRequest(`?userPublicId=${staleQueryUserPublicId}&id=701`));
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });
    expect(requestRepository.calls).toEqual([
      {
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        taskType: undefined,
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
      },
    ]);
    expect(serializedPayload).not.toContain(staleQueryUserPublicId);
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("queries employee request history with the organization owner scope", async () => {
    const staleQueryUserPublicId = "query_stale_employee_user_public_999";
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository,
      },
    );

    const response = await getPersonalAiGenerationRequestHistoryRouteHandler(
      collection,
    )(
      createGetRequest(
        `?userPublicId=${staleQueryUserPublicId}&taskType=ai_question_generation&page=2&pageSize=5`,
      ),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 5,
        total: 0,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });
    expect(requestRepository.calls).toEqual([
      {
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        taskType: "ai_question_generation",
        page: 2,
        pageSize: 5,
        limit: 5,
        offset: 5,
      },
    ]);
    expect(serializedPayload).not.toContain(staleQueryUserPublicId);
  });

  it("passes task type and pagination query to personal request history repository", async () => {
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await getPersonalAiGenerationRequestHistoryRouteHandler(
      collection,
    )(createGetRequest("?taskType=ai_paper_generation&page=2&pageSize=5"));
    const payload = await response.json();

    expect(requestRepository.calls).toEqual([
      {
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        taskType: "ai_paper_generation",
        page: 2,
        pageSize: 5,
        limit: 5,
        offset: 5,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 5,
        total: 0,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });
  });

  it("returns persisted redacted request history rows from the repository", async () => {
    const requestRepository = createRequestRepository([
      {
        requestPublicId: "personal_ai_request_public_route_301",
        taskPublicId: "ai_generation_task_public_route_301",
        status: "succeeded",
        requestedAt: "2026-06-12T16:30:00.000Z",
        taskType: "ai_question_generation",
        resultPublicId: "ai_generation_result_public_route_301",
        evidenceStatus: "sufficient",
        citationCount: 2,
        aiCallLogPublicId: "ai_call_log_public_route_301",
        redactionStatus: "redacted",
      },
    ]);
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await getPersonalAiGenerationRequestHistoryRouteHandler(
      collection,
    )(createGetRequest("?userPublicId=stale_client_user&id=701"));
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: [
        {
          requestPublicId: "personal_ai_request_public_route_301",
          taskPublicId: "ai_generation_task_public_route_301",
          status: "succeeded",
          requestedAt: "2026-06-12T16:30:00.000Z",
          taskType: "ai_question_generation",
          resultPublicId: "ai_generation_result_public_route_301",
          evidenceStatus: "sufficient",
          citationCount: 2,
          aiCallLogPublicId: "ai_call_log_public_route_301",
          redactionStatus: "redacted",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });
    expect(requestRepository.calls).toEqual([
      {
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        taskType: undefined,
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
      },
    ]);
    expect(serializedPayload).not.toContain("stale_client_user");
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("generated content");
  });

  it("returns a standard error envelope when persistent history lookup fails", async () => {
    const requestRepository: Pick<
      PersonalAiGenerationRequestRepository,
      "listRequestHistory"
    > = {
      async listRequestHistory() {
        throw new Error("database stack with internal connection details");
      },
    };
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response =
      await getPersonalAiGenerationRequestHistoryRouteHandler(collection)(
        createGetRequest(),
      );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 500017,
      message: "Personal AI request history is temporarily unavailable.",
      data: null,
    });
    expect(serializedPayload).not.toContain("database stack");
    expect(serializedPayload).not.toContain("internal connection details");
  });

  it("returns the local browser experience contract when requested", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );

    await expect(response.json()).resolves.toMatchObject({
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
            contextPublicId: "paper_public_123",
          },
          action: {
            actionType: "submit_personal_ai_generation_request",
            isEnabled: true,
            disabledReason: null,
          },
        },
        resultState: {
          status: "pending",
          taskPublicId: "ai_generation_task_public_route_123",
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
          explicitLocalSwitchPresent: false,
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          blockedReasons: [
            "explicit_local_switch_required",
            "provider_call_blocked",
            "env_secret_access_blocked",
            "real_provider_execution_requires_fresh_approval",
          ],
        },
        requestFlow: {
          request: {
            userPublicId: "resolver_user_public_123",
          },
        },
      },
    });
  });

  it("rejects personal AI generation question counts above the product contract before persistence", async () => {
    const questionRequestRepository = createRequestRepository();
    const { collection: questionCollection } =
      createPersonalAiGenerationRequestRouteHandlers(async () => userContext, {
        requestRepository: questionRequestRepository,
      });

    const questionResponse = await questionCollection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        generationParameters: {
          ...sufficientGroundingContext.generationParameters,
          questionCount: 11,
        },
      }),
    );

    await expect(questionResponse.json()).resolves.toEqual({
      code: 400015,
      message: "Invalid personal AI generation request flow input.",
      data: null,
    });
    expect(questionRequestRepository.createCalls).toEqual([]);

    const paperRequestRepository = createRequestRepository();
    const { collection: paperCollection } =
      createPersonalAiGenerationRequestRouteHandlers(async () => userContext, {
        requestRepository: paperRequestRepository,
      });

    const paperResponse = await paperCollection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        taskType: "ai_paper_generation",
        generationParameters: {
          ...sufficientGroundingContext.generationParameters,
          questionCount: 81,
        },
      }),
    );

    await expect(paperResponse.json()).resolves.toEqual({
      code: 400015,
      message: "Invalid personal AI generation request flow input.",
      data: null,
    });
    expect(paperRequestRepository.createCalls).toEqual([]);
  });

  it("does not allow the client request body to enable the runtime bridge", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
        },
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        runtimeBridge: {
          bridgeStatus: "provider_call_blocked",
          bridgeMode: "default_blocked",
          explicitLocalSwitchPresent: false,
          providerCallExecuted: false,
          envSecretAccessed: false,
          resultMaterializationSummary: {
            materializationStatus: "not_requested",
            failureCategory: "not_requested",
          },
        },
      },
    });
  });

  it("exposes controlled runner state only from server-side route dependencies", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
        },
      },
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        runtimeBridge: {
          bridgeStatus: "controlled_runner_ready",
          bridgeMode: "controlled_runner",
          runnerMode: "deterministic_fake_runner",
          explicitLocalSwitchPresent: true,
          realProviderExecutionApproved: false,
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          providerRetryAttempted: false,
          providerStreamingEnabled: false,
          costCalibrationExecuted: false,
          blockedReasons: ["real_provider_execution_requires_fresh_approval"],
        },
      },
    });
  });

  it("executes the route-integrated provider only from server-side route dependencies", async () => {
    const providerExecutorCalls: unknown[] = [];
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => sufficientGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async (executionInput) => {
              providerExecutorCalls.push(executionInput);

              return {
                requestCount: 1,
                resultStatus: "pass",
                failureCategory: null,
                durationMs: 37,
                usageSummary: {
                  inputTokens: 12,
                  outputTokens: 3,
                  totalTokens: 15,
                },
                providerErrorSummary: null,
                visibleGeneratedContent: {
                  content: "学生端本次可见 AI 预览内容",
                  contentVisibility: "transient_response_only",
                  persistenceStatus: "not_persisted",
                  safetyStatus: "checked",
                },
              };
            },
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(providerExecutorCalls).toHaveLength(1);
    expect(providerExecutorCalls[0]).toMatchObject({
      providerMetadata: {
        modelProvider: "openai_compatible",
        providerName: "alibaba-qwen",
        modelName: "qwen3.7-max",
        baseUrlHost: "dashscope.aliyuncs.com",
        envKeyAlias: "ALIBABA_API_KEY",
      },
      limits: {
        maxRequests: 1,
        maxRetries: 0,
        maxOutputTokens: 220,
        timeoutMs: 30000,
      },
      requestContext: {
        taskPublicId: "ai_generation_task_public_route_123",
        aiFuncType: "explanation",
        questionPublicId: "question_public_123",
        answerRecordPublicId: "answer_record_public_123",
      },
    });
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          bridgeMode: "controlled_runner",
          runnerMode: "route_integrated_provider_runner",
          explicitLocalSwitchPresent: true,
          realProviderExecutionApproved: true,
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          providerRetryAttempted: false,
          providerStreamingEnabled: false,
          costCalibrationExecuted: false,
          providerExecutionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            durationMs: 37,
            usageSummary: {
              inputTokens: 12,
              outputTokens: 3,
              totalTokens: 15,
            },
            providerErrorSummary: null,
            redactionStatus: "redacted",
          },
          blockedReasons: [],
          visibleGeneratedContent: {
            content: "学生端本次可见 AI 预览内容",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
          },
        },
      },
    });
    expect(serializedPayload).not.toContain("synthetic-test-credential");
    expect(serializedPayload).not.toContain("provider payload");
    expect(
      payload.data.runtimeBridge.providerExecutionSummary,
    ).not.toHaveProperty("visibleGeneratedContent");
  });

  it("closes provider success into current visible content and a redacted draft result", async () => {
    const resultRepository = createResultRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        createResultPublicId: () => "personal_ai_result_public_visible_route",
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => sufficientGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: {
                inputTokens: 18,
                outputTokens: 9,
                totalTokens: 27,
              },
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: createQuestionSetProviderContent(10),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        resultState: {
          status: "succeeded",
          resultPublicId: "personal_ai_result_public_visible_route",
          evidenceStatus: "sufficient",
          citationCount: 1,
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "question_set",
              parseStatus: "parsed",
              actualQuestionCount: 10,
            },
          },
          resultMaterializationSummary: {
            materializationStatus: "created",
            resultPublicId: "personal_ai_result_public_visible_route",
            contentVisibility: "redacted_snapshot",
            evidenceStatus: "sufficient",
            citationCount: 1,
            formalAdoptionStatus: "blocked",
          },
        },
      },
    });
    expect(resultRepository.createCalls).toHaveLength(1);
    expect(resultRepository.createCalls[0]).toMatchObject({
      ownerType: "organization",
      ownerPublicId: employeeUserContext.organizationPublicId,
      taskPublicId: "ai_generation_task_public_route_123",
      taskType: "ai_question_generation",
      resultPublicId: "personal_ai_result_public_visible_route",
      evidenceStatus: "sufficient",
      citationCount: 1,
    });
    expect(resultRepository.createCalls[0]?.contentPreviewMasked).toContain(
      "题目 10/10",
    );
    expect(serializedPayload).not.toContain("synthetic-test-credential");
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("raw prompt");
  });

  it("closes provider paper success into a parsed paper draft result", async () => {
    const resultRepository = createResultRepository();
    const paperGroundingContext: AiGenerationRouteIntegratedGroundingContext = {
      ...sufficientGroundingContext,
      generationParameters: {
        ...sufficientGroundingContext.generationParameters,
        questionCount: 50,
      },
    };
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        createResultPublicId: () => "personal_ai_result_public_paper_route",
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => paperGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: {
                inputTokens: 18,
                outputTokens: 9,
                totalTokens: 27,
              },
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: JSON.stringify({
                  totalQuestionCount: 50,
                  paperSections: [
                    {
                      paperSectionType: "single_choice",
                      questionCount: 50,
                    },
                  ],
                  questionTypeDistribution: {
                    single_choice: 50,
                  },
                  knowledgeCoverage: ["redacted_knowledge_node"],
                }),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        taskType: "ai_paper_generation",
        generationParameters: paperGroundingContext.generationParameters,
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        resultState: {
          status: "succeeded",
          resultPublicId: "personal_ai_result_public_paper_route",
          evidenceStatus: "sufficient",
          citationCount: 1,
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
            structuredPreview: {
              kind: "paper_draft",
              parseStatus: "parsed",
              paperSectionCount: 1,
              questionCount: 50,
            },
          },
          resultMaterializationSummary: {
            materializationStatus: "created",
            resultPublicId: "personal_ai_result_public_paper_route",
            contentVisibility: "redacted_snapshot",
            evidenceStatus: "sufficient",
            citationCount: 1,
            formalAdoptionStatus: "blocked",
          },
        },
      },
    });
    expect(resultRepository.createCalls).toHaveLength(1);
    expect(resultRepository.createCalls[0]).toMatchObject({
      ownerType: "organization",
      ownerPublicId: employeeUserContext.organizationPublicId,
      taskPublicId: "ai_generation_task_public_route_123",
      taskType: "ai_paper_generation",
      resultPublicId: "personal_ai_result_public_paper_route",
      evidenceStatus: "sufficient",
      citationCount: 1,
    });
    expect(resultRepository.createCalls[0]?.contentPreviewMasked).toContain(
      "题量 50",
    );
    expect(serializedPayload).not.toContain("synthetic-test-credential");
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("raw prompt");
  });

  it("hands off assembled AI paper containers for organization advanced employees before result materialization", async () => {
    const resultRepository = createResultRepository();
    const paperAssemblyResolverCalls: string[] = [];
    const paperGroundingContext: AiGenerationRouteIntegratedGroundingContext = {
      ...sufficientGroundingContext,
      generationParameters: {
        ...sufficientGroundingContext.generationParameters,
        questionCount: 3,
      },
    };
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        createResultPublicId: () =>
          "personal_ai_result_public_employee_paper_container_route",
        paperAssemblyResolver: () => {
          paperAssemblyResolverCalls.push("called");

          return createAssembledPaperRouteResult();
        },
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => paperGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: {
                inputTokens: 18,
                outputTokens: 9,
                totalTokens: 27,
              },
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: createPaperPlanProviderContent(3),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        taskType: "ai_paper_generation",
        generationParameters: paperGroundingContext.generationParameters,
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(paperAssemblyResolverCalls).toHaveLength(1);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        resultState: {
          status: "succeeded",
          resultPublicId:
            "personal_ai_result_public_employee_paper_container_route",
        },
        runtimeBridge: {
          paperAssembly: {
            status: "assembled",
            redactionStatus: "redacted",
            sourceDiagnostics: {
              role: "org_advanced_employee",
              platformQuestionCount: 2,
              enterpriseQuestionCount: 1,
              enterpriseSourceStatus: "resolved",
            },
            container: {
              requestedQuestionCount: 3,
              selectedQuestionCount: 3,
              sourceComposition: {
                platformFormalQuestionCount: 2,
                enterpriseTrainingSnapshotCount: 1,
              },
              matchQuality: "fully_matched",
            },
            insufficiency: null,
          },
          resultMaterializationSummary: {
            materializationStatus: "created",
          },
        },
      },
    });
    expect(resultRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toContain("synthetic-test-credential");
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("SENSITIVE_STEM_MARKER");
    expect(serializedPayload).not.toContain("SENSITIVE_ENTERPRISE_STEM");
  });

  it("uses repository-backed AI paper assembly for organization advanced employee paper requests", async () => {
    const resultRepository = createResultRepository();
    const questionRepositoryCalls: unknown[] = [];
    const trainingRepositoryCalls: unknown[] = [];
    const questionRepository: Pick<QuestionRepository, "listQuestions"> = {
      async listQuestions(query) {
        questionRepositoryCalls.push(query);

        return {
          rows: [
            createQuestionRow({
              public_id: "platform_question_public_employee_a",
            }),
            createQuestionRow({
              public_id: "platform_question_public_employee_b",
            }),
          ],
          total: 2,
        };
      },
    };
    const organizationTrainingRepository: Pick<
      OrganizationTrainingRepository,
      "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
    > = {
      async listAdminLifecycleVersions() {
        throw new Error("admin lifecycle repository should not be called");
      },
      async listEmployeeVisibleVersions(input) {
        trainingRepositoryCalls.push(input);

        return [
          createTrainingVersion({
            questions: [
              createTrainingQuestion("enterprise_question_public_employee_a"),
            ],
          }),
        ];
      },
    };
    const paperGroundingContext: AiGenerationRouteIntegratedGroundingContext = {
      ...sufficientGroundingContext,
      generationParameters: {
        ...sufficientGroundingContext.generationParameters,
        questionCount: 3,
      },
    };
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        createResultPublicId: () =>
          "personal_ai_result_public_employee_default_paper_route",
        questionRepository,
        organizationTrainingRepository,
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => paperGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: null,
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: createPaperPlanProviderContent(3),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        taskType: "ai_paper_generation",
        generationParameters: paperGroundingContext.generationParameters,
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(questionRepositoryCalls).toHaveLength(1);
    expect(trainingRepositoryCalls).toEqual([
      {
        employeePublicId: employeeUserContext.employeePublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        runtimeBridge: {
          paperAssembly: {
            status: "assembled",
            sourceDiagnostics: {
              role: "org_advanced_employee",
              platformQuestionCount: 2,
              enterpriseQuestionCount: 1,
              enterpriseSourceStatus: "resolved",
            },
            container: {
              requestedQuestionCount: 3,
              selectedQuestionCount: 3,
              sourceComposition: {
                platformFormalQuestionCount: 2,
                enterpriseTrainingSnapshotCount: 1,
              },
            },
            insufficiency: null,
          },
        },
      },
    });
    expect(resultRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toContain("SENSITIVE_STEM_MARKER");
    expect(serializedPayload).not.toContain("SENSITIVE_ENTERPRISE_STEM");
    expect(serializedPayload).not.toContain("synthetic-test-credential");
  });

  it("uses only platform formal questions for personal advanced student paper assembly", async () => {
    const resultRepository = createResultRepository();
    const trainingRepositoryCalls: unknown[] = [];
    const questionRepository: Pick<QuestionRepository, "listQuestions"> = {
      async listQuestions() {
        return {
          rows: [
            createQuestionRow({
              public_id: "platform_question_public_personal_a",
            }),
            createQuestionRow({
              public_id: "platform_question_public_personal_b",
            }),
            createQuestionRow({
              public_id: "platform_question_public_personal_c",
            }),
          ],
          total: 3,
        };
      },
    };
    const organizationTrainingRepository: Pick<
      OrganizationTrainingRepository,
      "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
    > = {
      async listAdminLifecycleVersions(input) {
        trainingRepositoryCalls.push(input);

        return [];
      },
      async listEmployeeVisibleVersions(input) {
        trainingRepositoryCalls.push(input);

        return [];
      },
    };
    const paperGroundingContext: AiGenerationRouteIntegratedGroundingContext = {
      ...sufficientGroundingContext,
      generationParameters: {
        ...sufficientGroundingContext.generationParameters,
        questionCount: 3,
      },
    };
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        createResultPublicId: () =>
          "personal_ai_result_public_personal_default_paper_route",
        questionRepository,
        organizationTrainingRepository,
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => paperGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: null,
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: createPaperPlanProviderContent(3),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        taskType: "ai_paper_generation",
        generationParameters: paperGroundingContext.generationParameters,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(trainingRepositoryCalls).toHaveLength(0);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        runtimeBridge: {
          paperAssembly: {
            status: "assembled",
            sourceDiagnostics: {
              role: "personal_advanced_student",
              platformQuestionCount: 3,
              enterpriseQuestionCount: 0,
              enterpriseSourceStatus: "not_applicable",
            },
            container: {
              requestedQuestionCount: 3,
              selectedQuestionCount: 3,
              sourceComposition: {
                platformFormalQuestionCount: 3,
                enterpriseTrainingSnapshotCount: 0,
              },
            },
          },
        },
      },
    });
    expect(resultRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toContain("SENSITIVE_STEM_MARKER");
    expect(serializedPayload).not.toContain("synthetic-test-credential");
  });

  it("does not invoke AI paper assembly for personal AI question requests", async () => {
    const resultRepository = createResultRepository();
    const paperAssemblyResolverCalls: string[] = [];
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        paperAssemblyResolver: () => {
          paperAssemblyResolverCalls.push("called");

          return createAssembledPaperRouteResult();
        },
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => sufficientGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: null,
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: createQuestionSetProviderContent(10),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        resultState: {
          status: "succeeded",
        },
        runtimeBridge: {
          paperAssembly: null,
          resultMaterializationSummary: {
            materializationStatus: "created",
          },
        },
      },
    });
    expect(paperAssemblyResolverCalls).toHaveLength(0);
    expect(resultRepository.createCalls).toHaveLength(1);
  });

  it("blocks personal paper result materialization when local paper assembly rejects the provider plan", async () => {
    const resultRepository = createResultRepository();
    const paperAssemblyResolverCalls: string[] = [];
    const paperGroundingContext: AiGenerationRouteIntegratedGroundingContext = {
      ...sufficientGroundingContext,
      generationParameters: {
        ...sufficientGroundingContext.generationParameters,
        questionCount: 3,
      },
    };
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        paperAssemblyResolver: () => {
          paperAssemblyResolverCalls.push("called");

          return createRejectedPaperRouteResult();
        },
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => paperGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: null,
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: createPaperPlanProviderContent(3),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        taskType: "ai_paper_generation",
        generationParameters: paperGroundingContext.generationParameters,
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        resultState: {
          status: "failed",
          resultPublicId: null,
        },
        runtimeBridge: {
          providerCallExecuted: true,
          paperAssembly: null,
          resultMaterializationSummary: {
            materializationStatus: "not_requested",
          },
        },
      },
    });
    expect(paperAssemblyResolverCalls).toHaveLength(1);
    expect(resultRepository.createCalls).toHaveLength(0);
    expect(serializedPayload).not.toContain("synthetic-test-credential");
    expect(serializedPayload).not.toContain("provider payload");
  });

  it("marks malformed personal Provider output failed without materializing a draft result", async () => {
    const resultRepository = createResultRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        createResultPublicId: () => "personal_ai_result_public_malformed_route",
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => sufficientGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => ({
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 42,
              usageSummary: null,
              providerErrorSummary: null,
              visibleGeneratedContent: {
                content: JSON.stringify({
                  questions: [{ questionType: "single_choice" }],
                }),
                contentVisibility: "transient_response_only",
                persistenceStatus: "not_persisted",
                safetyStatus: "checked",
              },
            }),
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        resultState: {
          status: "failed",
          resultPublicId: null,
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          visibleGeneratedContent: {
            structuredPreview: {
              kind: "question_set",
              parseStatus: "failed",
            },
          },
          resultMaterializationSummary: {
            materializationStatus: "not_requested",
          },
        },
      },
    });
    expect(resultRepository.createCalls).toHaveLength(0);
    expect(serializedPayload).not.toContain("synthetic-test-credential");
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("raw prompt");
  });

  it("blocks personal Provider execution before request when grounding evidence is insufficient", async () => {
    const resultRepository = createResultRepository();
    let providerExecuted = false;
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => employeeUserContext,
      {
        requestRepository: createRequestRepository(),
        resultRepository,
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 220,
            timeoutMs: 30000,
            resolveGroundingContext: () => insufficientGroundingContext,
            readProviderCredential: async () => "synthetic-test-credential",
            executeProviderRequest: async () => {
              providerExecuted = true;

              return {
                requestCount: 1,
                resultStatus: "pass",
                failureCategory: null,
                durationMs: 42,
                usageSummary: null,
                providerErrorSummary: null,
                visibleGeneratedContent: null,
              };
            },
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        authorizationSource: "org_auth",
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: employeeUserContext.organizationPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        resultState: {
          status: "failed",
          resultPublicId: null,
        },
        runtimeBridge: {
          providerCallExecuted: false,
          providerExecutionSummary: {
            resultStatus: "blocked",
            failureCategory: "insufficient_grounding_evidence",
          },
          resultMaterializationSummary: {
            materializationStatus: "not_requested",
          },
        },
      },
    });
    expect(providerExecuted).toBe(false);
    expect(resultRepository.createCalls).toHaveLength(0);
    expect(serializedPayload).not.toContain("synthetic-test-credential");
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("raw prompt");
  });

  it("materializes only redacted result references from server-side route dependencies", async () => {
    const persistedInputs: unknown[] = [];
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          resultMaterialization: {
            materializationMode: "fake_sanitized_in_memory_output",
            resultPublicId: "ai_generation_result_public_route_123",
            contentDigest: "sha256:route_materialized_digest_123",
            contentPreviewMasked: "masked route result preview",
            evidenceStatus: "none",
            citationCount: 0,
            persistDraftResult: async (input) => {
              persistedInputs.push(input);

              return {
                code: 0,
                message: "ok",
                data: {
                  persistenceStatus: "created",
                  result: {
                    resultPublicId: "ai_generation_result_public_route_123",
                    taskPublicId: "ai_generation_task_public_route_123",
                    requestPublicId: "personal_ai_request_public_route_123",
                    taskType: "ai_question_generation",
                    status: "draft",
                    persistedAt: "2026-06-19T00:00:00.000Z",
                    contentReference: {
                      contentDigest: "sha256:route_materialized_digest_123",
                      contentPreviewMasked: "masked route result preview",
                      contentVisibility: "redacted_snapshot",
                      redactionStatus: "redacted",
                    },
                    evidenceReference: {
                      evidenceStatus: "none",
                      citationCount: 0,
                      aiCallLogPublicId: null,
                      redactionStatus: "redacted",
                    },
                    formalAdoption: {
                      isBlocked: true,
                      status: "blocked",
                    },
                  },
                },
              };
            },
          },
        },
      },
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        runtimeBridge: {
          bridgeStatus: "controlled_runner_ready",
          bridgeMode: "controlled_runner",
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          resultMaterializationSummary: {
            materializationStatus: "created",
            resultPublicId: "ai_generation_result_public_route_123",
            contentDigest: "sha256:route_materialized_digest_123",
            contentPreviewMasked: "masked route result preview",
            contentVisibility: "redacted_snapshot",
            redactionStatus: "redacted",
            evidenceStatus: "none",
            citationCount: 0,
            formalAdoptionStatus: "blocked",
          },
        },
      },
    });
    expect(persistedInputs).toEqual([
      expect.objectContaining({
        resultPublicId: "ai_generation_result_public_route_123",
        taskPublicId: "ai_generation_task_public_route_123",
        ownerPublicId: userContext.userPublicId,
        taskType: "ai_question_generation",
        contentDigest: "sha256:route_materialized_digest_123",
        contentPreviewMasked: "masked route result preview",
        evidenceStatus: "none",
        citationCount: 0,
      }),
    ]);
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("raw prompt");
    expect(serializedPayload).not.toContain("raw response");
    expect(serializedPayload).not.toContain("raw error");
    expect(serializedPayload).not.toContain("synthetic-test-credential");
  });

  it("persists local browser POST metadata with session-normalized ownership public ids", async () => {
    const staleBodyPublicId = "body_stale_owner_public_999";
    const requestedAt = new Date("2026-06-12T18:00:00.000Z");
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
        now: () => requestedAt,
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        actorPublicId: staleBodyPublicId,
        ownerPublicId: staleBodyPublicId,
        quotaOwnerPublicId: staleBodyPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        requestFlow: {
          taskRequest: {
            actorPublicId: userContext.userPublicId,
            ownerPublicId: userContext.userPublicId,
            quotaOwnerPublicId: userContext.userPublicId,
          },
        },
      },
    });
    expect(requestRepository.createCalls).toEqual([
      {
        requestPublicId: "personal_ai_request_public_route_123",
        taskPublicId: "ai_generation_task_public_route_123",
        taskType: "ai_question_generation",
        aiFuncType: "explanation",
        authorizationPublicId: "personal_auth_public_123",
        actorPublicId: userContext.userPublicId,
        ownerType: "personal",
        ownerPublicId: userContext.userPublicId,
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: userContext.userPublicId,
        effectiveEdition: "advanced",
        questionPublicId: "question_public_123",
        answerRecordPublicId: "answer_record_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: null,
        idempotencyKeyHash: "sha256:personal_generation_route_123",
        requestedAt,
        resultPublicId: null,
        evidenceStatus: "none",
        citationCount: 0,
        aiCallLogPublicId: null,
        isAuthorizationActive: true,
        isScopeAllowed: true,
        isQuotaAvailable: true,
        isRuntimeConfigReady: true,
      },
    ]);
    expect(serializedPayload).not.toContain(staleBodyPublicId);
  });

  it("uses server-owned pending metadata instead of client-supplied result and evidence references", async () => {
    const staleClientResultPublicId = "client_result_public_stale_route";
    const staleClientAiCallLogPublicId =
      "client_ai_call_log_public_stale_route";
    const staleClientAuditLogPublicId = "client_audit_log_public_stale_route";
    const requestRepository = createRequestRepository();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        resultPublicId: staleClientResultPublicId,
        evidenceStatus: "sufficient",
        citationCount: 9,
        aiCallLogPublicId: staleClientAiCallLogPublicId,
        auditLogPublicId: staleClientAuditLogPublicId,
        isAuthorizationActive: false,
        isScopeAllowed: false,
        isQuotaAvailable: false,
        isRuntimeConfigReady: false,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "accepted",
        requestFlow: {
          request: {
            evidenceReferences: {
              auditLogPublicId: null,
              aiCallLogPublicId: null,
            },
          },
          taskRequest: {
            decision: "create_pending_task",
            resultReference: {
              resultPublicId: null,
              evidenceStatus: "none",
              citationCount: 0,
            },
            evidenceReferences: {
              auditLogPublicId: null,
              aiCallLogPublicId: null,
            },
          },
          resultReference: {
            resultReference: {
              resultPublicId: null,
              isFormalAdoptionBlocked: true,
              evidenceStatus: "none",
              citationCount: 0,
            },
          },
        },
        resultState: {
          status: "pending",
          resultPublicId: null,
          isFormalAdoptionBlocked: true,
          evidenceStatus: "none",
          citationCount: 0,
        },
      },
    });
    expect(requestRepository.createCalls).toHaveLength(1);
    expect(requestRepository.createCalls[0]).toMatchObject({
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
    });
    expect(serializedPayload).not.toContain(staleClientResultPublicId);
    expect(serializedPayload).not.toContain(staleClientAiCallLogPublicId);
    expect(serializedPayload).not.toContain(staleClientAuditLogPublicId);
  });

  it("uses reused persistent task metadata for idempotent local browser POST responses", async () => {
    const requestRepository = createRequestRepository([], {
      createResult: {
        persistenceStatus: "reused",
        historyItem: {
          requestPublicId: "personal_ai_request_public_existing_route",
          taskPublicId: "ai_generation_task_public_existing_route",
          status: "running",
          requestedAt: "2026-06-12T17:00:00.000Z",
          taskType: "ai_question_generation",
          resultPublicId: "ai_generation_result_public_existing_route",
          evidenceStatus: "weak",
          citationCount: 2,
          aiCallLogPublicId: "ai_call_log_public_existing_route",
          redactionStatus: "redacted",
        },
      },
    });
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        flowStatus: "reused",
        resultState: {
          status: "running",
          taskPublicId: "ai_generation_task_public_existing_route",
          resultPublicId: "ai_generation_result_public_existing_route",
          evidenceStatus: "weak",
          citationCount: 2,
        },
        requestFlow: {
          taskRequest: {
            decision: "reuse_existing_task",
            idempotency: {
              keyHash: "sha256:personal_generation_route_123",
              reuseTaskPublicId: "ai_generation_task_public_existing_route",
            },
          },
        },
      },
    });
    expect(requestRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain("provider payload");
    expect(serializedPayload).not.toContain("generated content");
  });

  it("returns a redacted error envelope when local browser POST persistence fails", async () => {
    const requestRepository = createRequestRepository([], {
      createError: new Error("database stack with internal connection details"),
    });
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
      {
        requestRepository,
      },
    );

    const response = await collection.POST(
      createPostRequest(createBaseFlowBody()),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 500018,
      message: "Personal AI generation request could not be persisted.",
      data: null,
    });
    expect(requestRepository.createCalls).toHaveLength(1);
    expect(serializedPayload).not.toContain("database stack");
    expect(serializedPayload).not.toContain("internal connection details");
  });

  it("normalizes request ownership public ids from the resolver user context", async () => {
    const staleBodyPublicId = "body_stale_owner_public_999";
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseFlowBody(),
        actorPublicId: staleBodyPublicId,
        ownerPublicId: staleBodyPublicId,
        quotaOwnerPublicId: staleBodyPublicId,
      }),
    );
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        requestFlow: {
          request: {
            userPublicId: userContext.userPublicId,
          },
          taskRequest: {
            actorPublicId: userContext.userPublicId,
            ownerPublicId: userContext.userPublicId,
            quotaOwnerPublicId: userContext.userPublicId,
          },
        },
      },
    });
    expect(serializedPayload).not.toContain(staleBodyPublicId);
  });

  it("does not expose body user id or sensitive request payload fields", async () => {
    const body = createBaseBody();
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(createPostRequest(body));
    const serializedResponse = JSON.stringify(await response.json());

    expect(serializedResponse).toContain("resolver_user_public_123");
    expect(serializedResponse).not.toContain("body_user_public_999");
    expect(serializedResponse).not.toMatch(/"id":/);
    expect(serializedResponse).not.toContain(body.omittedFixtureOne);
    expect(serializedResponse).not.toContain(body.omittedFixtureTwo);
    expect(serializedResponse).not.toContain(body.omittedFixtureThree);
    expect(serializedResponse).not.toContain(body.omittedFixtureFour);
    expect(serializedResponse).not.toContain(body.omittedFixtureFive);
  });

  it("returns the generation-only validation error for ai_scoring", async () => {
    const { collection } = createPersonalAiGenerationRequestRouteHandlers(
      async () => userContext,
    );

    const response = await collection.POST(
      createPostRequest({
        ...createBaseBody(),
        aiFuncType: "scoring",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 400011,
      message: "Invalid personal AI generation request input.",
      data: null,
    });
  });
});
