import { describe, expect, it } from "vitest";
import {
  aiQuestionDraftSchemaVersion,
  promptTemplateDefinitions,
} from "@/ai/prompts/templates";

import {
  createAdminAiGenerationTaskCancelRouteHandler,
  createAdminAiGenerationLocalContractRouteHandlers,
  type AdminAiGenerationRuntimeBridgeControl,
  type AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract-route";
import type { AdminAiGenerationRuntimeBridgeExecutionSummaryDto } from "../contracts/admin-ai-generation-local-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import type {
  AdminAiGenerationResultDto,
  AdminAiGenerationResultHistoryQuery,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  CreateAdminAiGenerationResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type {
  AdminAiGenerationRouteIntegratedProviderExecutionInput,
  AdminAiGenerationRuntimeBridgeInput,
  AdminAiGenerationRuntimeBridgeRouteWorkflow,
} from "../contracts/admin-ai-generation-runtime-bridge-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGovernanceContext,
  AiGenerationRouteIntegratedGroundingContext,
} from "../contracts/route-integrated-provider-execution-contract";
import { createModelConfigSnapshot } from "../models/ai-rag";
import type { AiPaperRoutePlanSelectWiringResult } from "./ai-paper-route-plan-select-wiring-service";
import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type {
  AdminAiGenerationTaskHistoryQuery,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
  AdminAiGenerationTaskPersistenceDto,
  CreateOrReuseAdminAiGenerationTaskInput,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminRole } from "../models/auth";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type {
  AiPaperQuestionSourceRepository,
  QuestionAccessRow,
} from "../repositories/question-repository";
import type { SessionService } from "./session-service";
import type { AiGenerationTaskLifecycleRepository } from "../repositories/ai-generation-task-lifecycle-repository";

const providerDisabledExecutionSummary: AdminAiGenerationRuntimeBridgeExecutionSummaryDto =
  {
    requestCount: 0,
    resultStatus: "blocked",
    failureCategory: "provider_call_blocked",
    durationMs: 0,
    usageSummary: null,
    providerErrorSummary: null,
    redactionStatus: "redacted",
  };
const visibleAdminProviderContent = "后台本次可见 AI 草稿预览";
const defaultAdminGenerationParameters: AiGenerationRouteIntegratedGenerationParameters =
  {
    profession: "marketing",
    level: 3,
    subject: "theory",
    knowledgeNode: "卷烟营销基础",
    knowledgeNodeMode: "balanced",
    knowledgeNodePublicIds: [],
    includeDescendants: false,
    knowledgeNodeSupplement: "卷烟营销基础",
    sourcePreference: null,
    questionType: "single_choice",
    questionCount: 10,
    difficulty: "medium",
    learningObjective: "专项练习",
  };

function createTestAdminGovernanceContext(
  taskType: "ai_question_generation" | "ai_paper_generation",
): AiGenerationRouteIntegratedGovernanceContext {
  const promptTemplate = promptTemplateDefinitions.find(
    (definition) => definition.aiFuncType === taskType,
  );
  if (promptTemplate === undefined) {
    throw new Error("missing admin route prompt fixture");
  }

  return {
    modelConfigSnapshot: createModelConfigSnapshot({
      providerPublicId: "model-provider-admin-route-test",
      providerKey: "alibaba_qwen",
      providerDisplayName: "Alibaba Qwen",
      modelConfigPublicId: `model-config-admin-route-${taskType}`,
      aiFuncType: taskType,
      modelName: "qwen3.7-max",
      displayName: "Qwen Generation",
      configVersion: 1,
      pricingVersion: null,
      inputTokenPriceCnyPerMillion: null,
      outputTokenPriceCnyPerMillion: null,
      timeoutSecond: 30,
      maxRetryCount: 0,
      fallbackModelConfigPublicId: null,
      promptTemplateKey: promptTemplate.promptTemplateKey,
      promptTemplateVersion: promptTemplate.version,
    }),
    promptTemplate: { ...promptTemplate, aiFuncType: taskType },
  };
}

function withTestAdminGenerationProvenance(
  control: AdminAiGenerationRuntimeBridgeControl,
): AdminAiGenerationRuntimeBridgeControl {
  if (control.providerExecution === undefined) {
    return control;
  }

  return {
    ...control,
    providerExecution: {
      resolveGovernanceContext: ({ requestContext }) =>
        createTestAdminGovernanceContext(requestContext.taskType),
      reserveAiCallLog: async () => ({
        publicId: "ai-call-log-admin-route-test",
      }),
      appendAiCallLog: async () => ({
        publicId: "ai-call-log-admin-route-test",
      }),
      ...control.providerExecution,
    },
  };
}
const sufficientAdminGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    evidenceStatus: "sufficient",
    citationCount: 1,
    generationParameters: defaultAdminGenerationParameters,
    citations: [
      {
        resourceTitle: "脱敏营销资料",
        headingPath: ["脱敏章节"],
        chunkIndex: 0,
        chunkText: "脱敏资料片段",
        score: 0.91,
      },
    ],
  };
const insufficientAdminGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    ...sufficientAdminGroundingContext,
    evidenceStatus: "none",
    citationCount: 0,
    citations: [],
  };

function createStructuredAdminProviderContent(
  generationKind: "question" | "paper",
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null = defaultAdminGenerationParameters,
): string {
  const resolvedGenerationParameters =
    generationParameters ?? defaultAdminGenerationParameters;

  if (generationKind === "question") {
    return JSON.stringify({
      schemaVersion: aiQuestionDraftSchemaVersion,
      kind: "question_set",
      questions: Array.from(
        { length: resolvedGenerationParameters.questionCount },
        (_, index) => {
          const questionType =
            resolvedGenerationParameters.questionType ?? "single_choice";
          const isChoice =
            questionType === "single_choice" || questionType === "multi_choice";
          const isFillBlank = questionType === "fill_blank";
          const requiresScoringPoints =
            questionType === "short_answer" ||
            questionType === "case_analysis" ||
            questionType === "calculation";

          return {
            questionType,
            difficulty: resolvedGenerationParameters.difficulty ?? "medium",
            knowledgeNodeLabels: ["redacted_knowledge_node"],
            questionStem: `脱敏题干 ${index + 1}`,
            questionOptions: isChoice
              ? [
                  { optionLabel: "A", optionText: "脱敏正确选项" },
                  { optionLabel: "B", optionText: "脱敏干扰选项" },
                ]
              : [],
            standardAnswer:
              questionType === "multi_choice"
                ? "A,B"
                : questionType === "true_false"
                  ? "true"
                  : isFillBlank
                    ? "脱敏填空答案"
                    : isChoice
                      ? "A"
                      : "脱敏标准答案",
            analysis: "脱敏解析",
            scoringPoints: requiresScoringPoints
              ? [{ description: "脱敏评分点", score: "1", sortOrder: 1 }]
              : [],
            fillBlankAnswers: isFillBlank
              ? [
                  {
                    blankKey: "blank_1",
                    standardAnswers: ["脱敏填空答案"],
                    score: "1",
                    sortOrder: 1,
                  },
                ]
              : [],
          };
        },
      ),
    });
  }

  const questionTypeDistribution =
    resolvedGenerationParameters.questionTypeDistribution ??
    "balanced_40_30_30";
  const paperStructure =
    resolvedGenerationParameters.paperStructure ?? "by_question_type";

  return JSON.stringify({
    totalQuestionCount: resolvedGenerationParameters.questionCount,
    sourcePreference:
      resolvedGenerationParameters.sourcePreference ?? "balanced",
    questionTypeDistribution,
    paperStructure,
    paperSections: createStructuredAdminProviderPaperSections(
      resolvedGenerationParameters,
      questionTypeDistribution,
      paperStructure,
    ),
    knowledgeCoverage: ["redacted_knowledge_node"],
  });
}

function createStructuredAdminProviderPaperSections(
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
  questionTypeDistribution: NonNullable<
    AiGenerationRouteIntegratedGenerationParameters["questionTypeDistribution"]
  >,
  paperStructure: NonNullable<
    AiGenerationRouteIntegratedGenerationParameters["paperStructure"]
  >,
) {
  const questionTypeCounts = createStructuredAdminProviderQuestionTypeCounts(
    questionTypeDistribution,
    generationParameters.questionCount,
  );
  const knowledgeNodePublicIds =
    generationParameters.knowledgeNodePublicIds.length > 0
      ? generationParameters.knowledgeNodePublicIds
      : ["knowledge_node_public_default"];

  return Array.from(questionTypeCounts.entries()).map(
    ([paperSectionType, questionCount], index) => ({
      paperSectionType,
      questionCount,
      ...(paperStructure === "by_knowledge_node"
        ? {
            knowledgeNodePublicIds,
            title: `脱敏知识点模块 ${index + 1}`,
          }
        : {}),
    }),
  );
}

function createStructuredAdminProviderQuestionTypeCounts(
  questionTypeDistribution: NonNullable<
    AiGenerationRouteIntegratedGenerationParameters["questionTypeDistribution"]
  >,
  questionCount: number,
): Map<string, number> {
  const ratios: Array<readonly [string, number]> =
    questionTypeDistribution === "single_50_multi_25_true_false_25"
      ? [
          ["single_choice", 50],
          ["multi_choice", 25],
          ["true_false", 25],
        ]
      : questionTypeDistribution === "balanced_40_30_30"
        ? [
            ["single_choice", 40],
            ["multi_choice", 30],
            ["true_false", 30],
          ]
        : [
            [
              defaultAdminGenerationParameters.questionType ?? "single_choice",
              100,
            ],
          ];

  const ratioTotal = ratios.reduce((total, [, ratio]) => total + ratio, 0);
  const counts = ratios.map(([questionType, ratio], index) => {
    const exactCount = (questionCount * ratio) / ratioTotal;

    return {
      questionType,
      count: Math.floor(exactCount),
      remainder: exactCount - Math.floor(exactCount),
      index,
    };
  });
  let remainingCount =
    questionCount - counts.reduce((total, item) => total + item.count, 0);

  for (const item of [...counts].sort(
    (first, second) =>
      second.remainder - first.remainder || first.index - second.index,
  )) {
    if (remainingCount <= 0) {
      break;
    }

    item.count += 1;
    remainingCount -= 1;
  }

  return new Map(
    counts
      .filter((item) => item.count > 0)
      .map((item) => [item.questionType, item.count]),
  );
}

function scopedAdminAiGenerationPublicId(prefix: string) {
  return expect.stringMatching(new RegExp(`^${prefix}_[a-f0-9]{16}$`, "u"));
}

function createDefaultAdminWorkspaceCapability(input: {
  adminRoles: AdminRole[];
  organizationPublicId: string | null;
}): AdminWorkspaceCapabilitySummary | undefined {
  const isOrganizationAdvancedRole =
    input.adminRoles.includes("org_advanced_admin") ||
    input.adminRoles.includes("super_admin");
  const isOrganizationStandardRole =
    input.adminRoles.includes("org_standard_admin");

  if (!isOrganizationAdvancedRole && !isOrganizationStandardRole) {
    return undefined;
  }

  return {
    adminRoles: input.adminRoles,
    organizationAuthorizationPublicId:
      isOrganizationAdvancedRole && input.organizationPublicId !== null
        ? "org_auth_public_123"
        : null,
    organizationPublicId: input.organizationPublicId,
    organizationEffectiveEdition: isOrganizationAdvancedRole
      ? "advanced"
      : "standard",
    organizationAuthorizationSource: "org_auth",
    capabilitySource: "service_computed",
    canUseOrganizationAdvancedWorkspace:
      isOrganizationAdvancedRole && input.organizationPublicId !== null,
  };
}

function createAdminSessionService(input: {
  adminPublicId?: string | null;
  adminRoles?: AdminRole[];
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary | null;
  organizationPublicId?: string | null;
}): Pick<SessionService, "getCurrentSession"> {
  const adminRoles = input.adminRoles ?? [];
  const organizationPublicId = input.organizationPublicId ?? null;
  const adminWorkspaceCapability =
    input.adminWorkspaceCapability === null
      ? undefined
      : (input.adminWorkspaceCapability ??
        createDefaultAdminWorkspaceCapability({
          adminRoles,
          organizationPublicId,
        }));

  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          user: {
            publicId: "admin_user_public_123",
            phone: "13800000000",
            name: "local admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId,
            adminPublicId: input.adminPublicId ?? "admin_public_123",
            adminRoles,
            ...(adminWorkspaceCapability === undefined
              ? {}
              : { adminWorkspaceCapability }),
          },
          session: {
            expiresAt: "2026-06-26T20:00:00.000Z",
          },
        },
      };
    },
  };
}

function createPostRequest(
  workspace: AdminAiGenerationWorkspace,
  body: Record<string, unknown>,
): Request {
  const requestBody =
    (body.generationKind === "question" || body.generationKind === "paper") &&
    body.generationParameters === undefined
      ? {
          ...body,
          generationParameters: {
            ...defaultAdminGenerationParameters,
            questionCount: body.generationKind === "question" ? 10 : 50,
          },
        }
      : body;

  return new Request(
    `http://localhost/api/v1/${workspace}-ai-generation-requests`,
    {
      body: JSON.stringify(requestBody),
      headers: {
        authorization: "Bearer synthetic-admin-session",
        "content-type": "application/json",
      },
      method: "POST",
    },
  );
}

function createGetRequest(
  workspace: AdminAiGenerationWorkspace,
  searchParams = "",
): Request {
  return new Request(
    `http://localhost/api/v1/${workspace}-ai-generation-requests${searchParams}`,
    {
      headers: {
        authorization: "Bearer synthetic-admin-session",
      },
      method: "GET",
    },
  );
}

async function postLocalContractRequest(input: {
  workspace: AdminAiGenerationWorkspace;
  adminRoles: AdminRole[];
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary | null;
  organizationPublicId?: string | null;
  body: Record<string, unknown>;
  requestPublicId?: string;
  useDefaultRequestPublicId?: boolean;
  requestedAt?: Date;
  runtimeBridgeControl?: AdminAiGenerationRuntimeBridgeControl;
  paperAssemblyResolver?: () =>
    | AiPaperRoutePlanSelectWiringResult
    | Promise<AiPaperRoutePlanSelectWiringResult>;
  questionRepository?: AiPaperQuestionSourceRepository;
  organizationTrainingRepository?: Pick<
    OrganizationTrainingRepository,
    "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
  >;
  resultPersistenceRepository?: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
  lifecycleRepository?: AiGenerationTaskLifecycleRepository;
}) {
  const taskPersistence =
    input.taskPersistenceRepository ??
    createTaskPersistenceRecorder().repository;
  const resultPersistence =
    input.resultPersistenceRepository ??
    createGeneratedResultPersistenceRecorder().repository;
  const questionRepository =
    input.questionRepository ??
    createQuestionRepository([
      createQuestionRow({ public_id: "platform_question_public_default_a" }),
      createQuestionRow({ public_id: "platform_question_public_default_b" }),
    ]);
  const organizationTrainingRepository =
    input.organizationTrainingRepository ??
    createOrganizationTrainingRepository({
      organizationPublicId:
        input.organizationPublicId ?? "organization_public_123",
    });
  const defaultAuthorizationContextRepository =
    createOrganizationTrainingRepository({
      organizationPublicId:
        input.organizationPublicId ?? "organization_public_123",
    });
  const routeOrganizationTrainingRepository = {
    ...organizationTrainingRepository,
    findOrganizationAuthorizationContext:
      (
        organizationTrainingRepository as Partial<
          Pick<
            OrganizationTrainingRepository,
            "findOrganizationAuthorizationContext"
          >
        >
      ).findOrganizationAuthorizationContext ??
      defaultAuthorizationContextRepository.findOrganizationAuthorizationContext,
  };
  const routeOptions = {
    sessionService: createAdminSessionService({
      adminRoles: input.adminRoles,
      adminWorkspaceCapability: input.adminWorkspaceCapability,
      organizationPublicId: input.organizationPublicId,
    }),
    taskPersistenceRepository: taskPersistence,
    lifecycleRepository:
      input.lifecycleRepository ?? createClaimingLifecycleRepository(),
    resultPersistenceRepository: resultPersistence,
    requestClock: () =>
      input.requestedAt ?? new Date("2026-06-26T20:00:00.000Z"),
    ...(input.runtimeBridgeControl
      ? {
          runtimeBridgeControl: withTestAdminGenerationProvenance(
            input.runtimeBridgeControl,
          ),
        }
      : {}),
    ...(input.paperAssemblyResolver
      ? { paperAssemblyResolver: input.paperAssemblyResolver }
      : {}),
    questionRepository,
    organizationTrainingRepository: routeOrganizationTrainingRepository,
    ...(input.useDefaultRequestPublicId
      ? {}
      : {
          createRequestPublicId: () =>
            input.requestPublicId ??
            "admin_ai_generation_request_public_route_test",
        }),
  } as unknown as Parameters<
    typeof createAdminAiGenerationLocalContractRouteHandlers
  >[1];
  const { collection } = createAdminAiGenerationLocalContractRouteHandlers(
    input.workspace,
    routeOptions,
  );

  return collection.POST(
    createPostRequest(input.workspace, {
      idempotencyKey: "018f47ac-7c2e-4f4d-8f5a-9d6c2c1e4901",
      ...input.body,
    }),
  );
}

function createFakeProviderRuntimeBridgeControl(
  providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[],
  input: {
    content?: string;
    groundingContext?: AiGenerationRouteIntegratedGroundingContext;
  } = {},
): AdminAiGenerationRuntimeBridgeControl {
  return {
    bridgeMode: "controlled_runner",
    explicitLocalSwitchPresent: true,
    providerExecution: {
      executionMode: "route_integrated_provider",
      realProviderExecutionApproved: true,
      maxRequests: 1,
      maxRetries: 0,
      maxOutputTokens: 220,
      timeoutMs: 30000,
      readProviderCredential: () => "synthetic-admin-provider-credential",
      resolveGroundingContext: () =>
        input.groundingContext ?? sufficientAdminGroundingContext,
      executeProviderRequest: async (providerInput) => {
        providerInputs.push(providerInput);

        return {
          requestCount: 1,
          resultStatus: "pass",
          failureCategory: null,
          durationMs: 21,
          usageSummary: {
            promptTokens: 5,
            completionTokens: 2,
            totalTokens: 7,
          },
          providerErrorSummary: null,
          visibleGeneratedContent: {
            content:
              input.content ??
              createStructuredAdminProviderContent(
                providerInput.requestContext.generationKind,
                providerInput.requestContext.generationParameters,
              ),
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
          },
        };
      },
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
    profession: "marketing",
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

function createQuestionRepository(
  questionRows: readonly QuestionAccessRow[],
): AiPaperQuestionSourceRepository {
  return {
    async listAvailableAiPaperSourceQuestions() {
      return [...questionRows];
    },
  };
}

function createOrganizationTrainingRepository(input: {
  organizationPublicId: string;
  authorizationPublicId?: string;
  authorizationProfession?: "monopoly" | "marketing" | "logistics";
  authorizationLevel?: number;
}): Pick<
  OrganizationTrainingRepository,
  | "listAdminLifecycleVersions"
  | "listAdminVisibleQuestionSnapshotsForAiPaperSource"
  | "listEmployeeVisibleVersions"
  | "findOrganizationAuthorizationContext"
> {
  return {
    async findOrganizationAuthorizationContext({
      authorizationPublicId,
      organizationPublicId,
    }) {
      if (
        (input.authorizationPublicId !== undefined &&
          authorizationPublicId !== input.authorizationPublicId) ||
        organizationPublicId !== input.organizationPublicId
      ) {
        return null;
      }

      return {
        profession: input.authorizationProfession ?? "marketing",
        level: input.authorizationLevel ?? 3,
        contextDisplayStatus: "display_only",
        effectiveEdition: "advanced",
        authorizationSource: "org_auth",
        authorizationPublicId,
        ownerType: "organization",
        ownerPublicId: organizationPublicId,
        organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: organizationPublicId,
        capabilities: {
          canGenerateAiQuestion: true,
          canGenerateAiPaper: true,
          canCreateOrganizationTraining: true,
          canAnswerOrganizationTraining: true,
          canViewOrganizationTrainingSummary: true,
          canManageAuthorizationQuota: false,
        },
        blockedReason: null,
      };
    },
    async listAdminLifecycleVersions() {
      return [
        createTrainingVersion({
          organizationPublicId: input.organizationPublicId,
          questions: [
            createTrainingQuestion("enterprise_question_public_default"),
          ],
        }),
      ];
    },
    async listAdminVisibleQuestionSnapshotsForAiPaperSource() {
      return [
        {
          ...createTrainingQuestion("enterprise_question_public_default"),
          standardAnswer: "A",
          analysisSummary: "SENSITIVE_ENTERPRISE_ANALYSIS",
          evidenceStatus: "sufficient",
          citationCount: 1,
        },
      ];
    },
    async listEmployeeVisibleVersions() {
      throw new Error("employee training repository should not be called");
    },
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
    profession: "marketing",
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

function createTrainingQuestion(
  publicId: string,
  override: Partial<
    NonNullable<OrganizationTrainingPublishedVersionDto["questions"]>[number]
  > = {},
) {
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
    ...override,
  } satisfies NonNullable<
    OrganizationTrainingPublishedVersionDto["questions"]
  >[number];
}

async function getLocalContractHistory(input: {
  workspace: AdminAiGenerationWorkspace;
  adminRoles: AdminRole[];
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary | null;
  organizationPublicId?: string | null;
  searchParams?: string;
  resultPersistenceRepository?: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
}) {
  const taskPersistence =
    input.taskPersistenceRepository ??
    createTaskPersistenceRecorder().repository;
  const resultPersistence =
    input.resultPersistenceRepository ??
    createGeneratedResultPersistenceRecorder().repository;
  const { collection } = createAdminAiGenerationLocalContractRouteHandlers(
    input.workspace,
    {
      sessionService: createAdminSessionService({
        adminRoles: input.adminRoles,
        adminWorkspaceCapability: input.adminWorkspaceCapability,
        organizationPublicId: input.organizationPublicId,
      }),
      resultPersistenceRepository: resultPersistence,
      taskPersistenceRepository: taskPersistence,
    },
  );

  const getHandler = (
    collection as {
      GET: (request: Request) => Promise<Response>;
    }
  ).GET;

  return getHandler(createGetRequest(input.workspace, input.searchParams));
}

function createTaskPersistenceResult(
  input: CreateOrReuseAdminAiGenerationTaskInput,
  persistenceStatus: AdminAiGenerationTaskPersistenceResult["persistenceStatus"],
): AdminAiGenerationTaskPersistenceResult {
  const taskRequest = input.localContract.taskRequest;

  return {
    persistenceStatus,
    task: {
      requestPublicId: input.requestPublicId,
      taskPublicId: taskRequest.taskPublicId,
      taskType:
        taskRequest.taskType === "ai_paper_generation"
          ? "ai_paper_generation"
          : "ai_question_generation",
      workspace: input.localContract.workspace,
      generationKind: input.localContract.generationKind,
      status: "pending",
      retryCount: 0,
      failureCategory: null,
      startedAt: null,
      finishedAt: null,
      canRetry: false,
      canCancel: true,
      requestedAt: input.requestedAt.toISOString(),
      authorizationSource: taskRequest.authorizationSource,
      authorizationPublicId: taskRequest.authorizationPublicId,
      actorPublicId: taskRequest.actorPublicId,
      ownerType: taskRequest.ownerType,
      ownerPublicId: taskRequest.ownerPublicId,
      organizationPublicId: taskRequest.organizationPublicId,
      quotaOwnerType: taskRequest.quotaOwnerType,
      quotaOwnerPublicId: taskRequest.quotaOwnerPublicId,
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      runtimeStatus: "local_contract_only",
      runtimeBridgeStatus: "provider_call_blocked",
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      costCalibrationExecuted: false,
      formalContentBoundary: {
        questionWriteStatus: "blocked_without_follow_up_task",
        paperWriteStatus: "blocked_without_follow_up_task",
      },
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
      contentVisibility: "summary_only",
      redactionStatus: "redacted",
    },
  };
}

function createTaskHistoryItem(input: {
  generationKind: "question" | "paper";
  requestedAt: string;
  resultPublicId?: string | null;
  status?: AdminAiGenerationTaskPersistenceDto["status"];
  taskPublicId: string;
  workspace: AdminAiGenerationWorkspace;
}): AdminAiGenerationTaskPersistenceDto {
  const isContent = input.workspace === "content";
  const ownerPublicId = isContent
    ? "platform_content_review_pool"
    : "organization_public_123";

  return {
    requestPublicId: `${input.taskPublicId}_request`,
    taskPublicId: input.taskPublicId,
    taskType:
      input.generationKind === "question"
        ? "ai_question_generation"
        : "ai_paper_generation",
    workspace: input.workspace,
    generationKind: input.generationKind,
    status: input.status ?? "pending",
    retryCount: 0,
    failureCategory: null,
    startedAt: null,
    finishedAt: null,
    canRetry: false,
    canCancel:
      (input.status ?? "pending") === "pending" ||
      (input.status ?? "pending") === "running",
    requestedAt: input.requestedAt,
    authorizationSource: isContent ? "admin_role" : "org_auth",
    authorizationPublicId: isContent
      ? "admin_role_content_ai_generation"
      : "org_auth_public_123",
    actorPublicId: "admin_public_123",
    ownerType: isContent ? "platform" : "organization",
    ownerPublicId,
    organizationPublicId: isContent ? null : "organization_public_123",
    quotaOwnerType: isContent ? "platform" : "organization",
    quotaOwnerPublicId: ownerPublicId,
    resultPublicId: input.resultPublicId ?? null,
    evidenceStatus: "none",
    citationCount: 0,
    aiCallLogPublicId: null,
    runtimeStatus: "local_contract_only",
    runtimeBridgeStatus: "provider_call_blocked",
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    costCalibrationExecuted: false,
    formalContentBoundary: {
      questionWriteStatus: "blocked_without_follow_up_task",
      paperWriteStatus: "blocked_without_follow_up_task",
    },
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    contentVisibility: "summary_only",
    redactionStatus: "redacted",
  };
}

function createGeneratedResultHistoryItem(input: {
  generationKind: "question" | "paper";
  persistedAt: string;
  resultPublicId: string;
  taskPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  formalAdoption?: AdminAiGenerationResultDto["formalAdoption"] & {
    formalPaperPublicId?: string | null;
    formalQuestionPublicId?: string | null;
    formalTargetWriteStatus?: string | null;
    reviewStatus?: string | null;
    reviewedAt?: string | null;
  };
  reviewedDraft?: AdminAiGenerationResultDto["contentReference"]["reviewedDraft"];
}): AdminAiGenerationResultDto {
  const isContent = input.workspace === "content";
  const ownerPublicId = isContent
    ? "platform_content_review_pool"
    : "organization_public_123";

  return {
    resultPublicId: input.resultPublicId,
    taskPublicId: input.taskPublicId,
    requestPublicId: `${input.taskPublicId}_request`,
    workspace: input.workspace,
    generationKind: input.generationKind,
    ownerType: isContent ? "platform" : "organization",
    ownerPublicId,
    organizationPublicId: isContent ? null : "organization_public_123",
    taskType:
      input.generationKind === "question"
        ? "ai_question_generation"
        : "ai_paper_generation",
    status: "draft",
    persistedAt: input.persistedAt,
    contentReference: {
      contentDigest: "sha256:omitted-from-history-response",
      contentPreviewMasked: `redacted generated result summary for ${input.workspace} ${input.generationKind}`,
      contentVisibility: "redacted_snapshot",
      reviewedDraft: input.reviewedDraft ?? null,
      organizationTrainingDraft: null,
      organizationTrainingPaperDraft: null,
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: "ai_call_log_public_omitted_from_history_response",
      redactionStatus: "redacted",
    },
    sourceReference: {
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
      reviewStatus: null,
      formalTargetWriteStatus: null,
      formalQuestionPublicId: null,
      formalPaperPublicId: null,
      reviewedAt: null,
      ...input.formalAdoption,
    },
  };
}

function createTaskPersistenceRecorder(
  input: {
    persistenceStatus?: AdminAiGenerationTaskPersistenceResult["persistenceStatus"];
    persistenceStatuses?: AdminAiGenerationTaskPersistenceResult["persistenceStatus"][];
    taskHistoryItems?: AdminAiGenerationTaskPersistenceDto[];
  } = {},
): {
  calls: CreateOrReuseAdminAiGenerationTaskInput[];
  historyQueries: AdminAiGenerationTaskHistoryQuery[];
  repository: AdminAiGenerationTaskPersistenceRepository;
} {
  const calls: CreateOrReuseAdminAiGenerationTaskInput[] = [];
  const historyQueries: AdminAiGenerationTaskHistoryQuery[] = [];

  return {
    calls,
    historyQueries,
    repository: {
      async createOrReuseTask(createInput) {
        calls.push(createInput);

        return createTaskPersistenceResult(
          createInput,
          input.persistenceStatuses?.[calls.length - 1] ??
            input.persistenceStatus ??
            "created",
        );
      },
      async listTaskHistory(query) {
        historyQueries.push(query);

        return input.taskHistoryItems ?? [];
      },
    },
  };
}

function createClaimingLifecycleRepository(): AiGenerationTaskLifecycleRepository {
  const claimedTaskPublicIds = new Set<string>();

  return {
    async claimTask(input) {
      const taskType = input.taskTypes[0] ?? "ai_question_generation";

      if (claimedTaskPublicIds.has(input.taskPublicId)) {
        return {
          disposition: "not_claimed",
          attempt: null,
          task: {
            taskPublicId: input.taskPublicId,
            taskType,
            ownerType: input.ownerType,
            ownerPublicId: input.ownerPublicId,
            organizationPublicId: input.organizationPublicId,
            taskStatus: "running",
            retryCount: 0,
            failureCategory: null,
            startedAt: input.claimedAt,
            finishedAt: null,
            resultPublicId: null,
            canCancel: true,
            canRetry: false,
          },
        };
      }

      claimedTaskPublicIds.add(input.taskPublicId);

      return {
        disposition: "claimed",
        attempt: {
          taskPublicId: input.taskPublicId,
          retryCount: 0,
          startedAt: input.claimedAt,
        },
        task: {
          taskPublicId: input.taskPublicId,
          taskType,
          ownerType: input.ownerType,
          ownerPublicId: input.ownerPublicId,
          organizationPublicId: input.organizationPublicId,
          taskStatus: "running",
          retryCount: 0,
          failureCategory: null,
          startedAt: input.claimedAt,
          finishedAt: null,
          resultPublicId: null,
          canCancel: true,
          canRetry: false,
        },
      };
    },
    async failTask(input) {
      return {
        disposition: "failed",
        task: {
          taskPublicId: input.taskPublicId,
          taskType: input.taskTypes[0] ?? "ai_question_generation",
          ownerType: input.ownerType,
          ownerPublicId: input.ownerPublicId,
          organizationPublicId: input.organizationPublicId,
          taskStatus: "failed",
          retryCount: input.attempt.retryCount,
          failureCategory: input.failureCategory,
          startedAt: input.attempt.startedAt,
          finishedAt: input.finishedAt,
          resultPublicId: null,
          canCancel: false,
          canRetry: true,
        },
      };
    },
    async cancelTask() {
      throw new Error("unexpected lifecycle cancellation transition");
    },
  };
}

function createGeneratedResultPersistenceResult(
  input: CreateAdminAiGenerationResultInput,
  persistenceStatus: AdminAiGenerationResultPersistenceResult["persistenceStatus"],
): AdminAiGenerationResultPersistenceResult {
  return {
    persistenceStatus,
    result: {
      resultPublicId: input.resultPublicId,
      taskPublicId: input.taskPublicId,
      requestPublicId: `${input.taskPublicId}_request`,
      workspace: input.workspace,
      generationKind: input.generationKind,
      ownerType: input.ownerType,
      ownerPublicId: input.ownerPublicId,
      organizationPublicId: input.organizationPublicId,
      taskType: input.taskType,
      status: "draft",
      persistedAt: input.createdAt.toISOString(),
      contentReference: {
        contentDigest: input.contentDigest,
        contentPreviewMasked: input.contentPreviewMasked,
        contentVisibility: "redacted_snapshot",
        reviewedDraft: (input.contentRedactedSnapshot.formalReviewedDraft ??
          null) as AdminAiGenerationResultDto["contentReference"]["reviewedDraft"],
        organizationTrainingDraft: (input.contentRedactedSnapshot
          .organizationTrainingQuestionDraft ??
          null) as AdminAiGenerationResultDto["contentReference"]["organizationTrainingDraft"],
        organizationTrainingPaperDraft: (input.contentRedactedSnapshot
          .organizationTrainingPaperDraft ??
          null) as AdminAiGenerationResultDto["contentReference"]["organizationTrainingPaperDraft"],
        redactionStatus: "redacted",
      },
      evidenceReference: {
        evidenceStatus: input.evidenceStatus,
        citationCount: input.citationCount,
        aiCallLogPublicId: input.aiCallLogPublicId,
        redactionStatus: "redacted",
      },
      sourceReference: {
        sourceQuestionPublicId: input.sourceQuestionPublicId,
        sourcePaperPublicId: input.sourcePaperPublicId,
      },
      formalAdoption: {
        isBlocked: true,
        status: "blocked",
        reviewStatus: null,
        formalTargetWriteStatus: null,
        formalQuestionPublicId: null,
        formalPaperPublicId: null,
        reviewedAt: null,
      },
    },
  };
}

function createGeneratedResultPersistenceRecorder(
  input: {
    draftResults?: AdminAiGenerationResultDto[];
    persistenceStatus?: AdminAiGenerationResultPersistenceResult["persistenceStatus"];
  } = {},
): {
  calls: CreateAdminAiGenerationResultInput[];
  historyQueries: AdminAiGenerationResultHistoryQuery[];
  taskBatchQueries: Array<
    Pick<
      AdminAiGenerationResultHistoryQuery,
      "workspace" | "ownerType" | "ownerPublicId" | "generationKind"
    > & { taskPublicIds: string[] }
  >;
  repository: AdminAiGenerationResultPersistenceRepository;
} {
  const calls: CreateAdminAiGenerationResultInput[] = [];
  const historyQueries: AdminAiGenerationResultHistoryQuery[] = [];
  const taskBatchQueries: Array<
    Pick<
      AdminAiGenerationResultHistoryQuery,
      "workspace" | "ownerType" | "ownerPublicId" | "generationKind"
    > & { taskPublicIds: string[] }
  > = [];

  return {
    calls,
    historyQueries,
    taskBatchQueries,
    repository: {
      async listDraftResults(query) {
        historyQueries.push(query);

        return (input.draftResults ?? []).slice(
          query.offset,
          query.offset + (query.limit ?? query.pageSize),
        );
      },
      async listDraftResultsByTaskPublicIds(query) {
        taskBatchQueries.push(query);
        const taskPublicIds = new Set(query.taskPublicIds);

        return (input.draftResults ?? []).filter((result) =>
          taskPublicIds.has(result.taskPublicId),
        );
      },
      async findDraftResultByTaskPublicId() {
        return null;
      },
      async createOrReuseDraftResult(createInput) {
        calls.push(createInput);

        return createGeneratedResultPersistenceResult(
          createInput,
          input.persistenceStatus ?? "created",
        );
      },
    },
  };
}

function createAssembledPaperRouteResult(): AiPaperRoutePlanSelectWiringResult {
  return {
    status: "assembled",
    sourceDiagnostics: {
      role: "org_advanced_admin",
      platformQuestionCount: 2,
      enterpriseQuestionCount: 1,
      enterpriseSourceStatus: "resolved",
    },
    assembly: {
      status: "assembled",
      container: {
        title: "redacted paper container",
        profession: "marketing",
        level: 3,
        subject: "theory",
        requestedQuestionCount: 3,
        selectedQuestionCount: 3,
        sourceComposition: {
          platformFormalQuestionCount: 2,
          enterpriseTrainingSnapshotCount: 1,
        },
        matchQuality: "fully_matched",
        sections: [
          {
            sectionKey: "single_choice",
            title: "redacted section",
            questionType: "single_choice",
            targetQuestionCount: 3,
            selectedQuestionCount: 3,
            selectedQuestions: [
              {
                questionPublicId: "platform_question_public_a",
                sourceKind: "platform_formal_question",
                matchTier: "exact",
                score: 1,
              },
              {
                questionPublicId: "platform_question_public_b",
                sourceKind: "platform_formal_question",
                matchTier: "exact",
                score: 1,
              },
              {
                questionPublicId: "enterprise_question_public_a",
                sourceKind: "enterprise_training_snapshot",
                matchTier: "exact",
                score: 1,
              },
            ],
            degradationSummary: {
              exactCount: 3,
              nearbyKnowledgeCount: 0,
              sameScopeCount: 0,
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
      role: "org_advanced_admin",
      platformQuestionCount: 0,
      enterpriseQuestionCount: 0,
      enterpriseSourceStatus: "resolved",
    },
    assembly: null,
    rejection: {
      failureCategory: "provider_question_content_forbidden",
    },
  };
}

describe("admin AI generation local contract route handlers", () => {
  it("rejects unauthorized content cancellation before lifecycle lookup", async () => {
    const cancelCalls: unknown[] = [];
    const lifecycleRepository: AiGenerationTaskLifecycleRepository = {
      async claimTask() {
        throw new Error("not expected");
      },
      async failTask() {
        throw new Error("not expected");
      },
      async cancelTask(input) {
        cancelCalls.push(input);
        return { disposition: "cancelled", task: null };
      },
    };
    const handler = createAdminAiGenerationTaskCancelRouteHandler("content", {
      sessionService: createAdminSessionService({ adminRoles: ["ops_admin"] }),
      lifecycleRepository,
    });

    const response = await handler(
      new Request(
        "http://localhost/api/v1/content-ai-generation-requests/task/cancel",
        {
          method: "POST",
        },
      ),
      {
        params: Promise.resolve({ publicId: "admin_task_public_unauthorized" }),
      },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(cancelCalls).toHaveLength(0);
  });

  it("cancels only a content-owned pending task with the shared lifecycle repository", async () => {
    const cancelCalls: unknown[] = [];
    const handler = createAdminAiGenerationTaskCancelRouteHandler("content", {
      sessionService: createAdminSessionService({
        adminRoles: ["content_admin"],
      }),
      requestClock: () => new Date("2026-07-22T13:00:00.123Z"),
      lifecycleRepository: {
        async claimTask() {
          throw new Error("not expected");
        },
        async failTask() {
          throw new Error("not expected");
        },
        async cancelTask(input) {
          cancelCalls.push(input);
          return {
            disposition: "cancelled",
            task: {
              taskPublicId: input.taskPublicId,
              taskType: "ai_question_generation",
              ownerType: input.ownerType,
              ownerPublicId: input.ownerPublicId,
              organizationPublicId: input.organizationPublicId,
              taskStatus: "cancelled",
              retryCount: 0,
              failureCategory: null,
              startedAt: null,
              finishedAt: input.finishedAt,
              resultPublicId: null,
              canCancel: false,
              canRetry: false,
            },
          };
        },
      },
    });

    const response = await handler(
      new Request("http://localhost/cancel", { method: "POST" }),
      { params: Promise.resolve({ publicId: "admin_task_public_pending" }) },
    );
    const payload = await response.json();

    expect(cancelCalls).toEqual([
      expect.objectContaining({
        taskPublicId: "admin_task_public_pending",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
      }),
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: { status: "cancelled", canCancel: false },
    });
    expect(JSON.stringify(payload)).toContain("remote Provider cost");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("accepts content admin AI question requests as platform-owned local contracts", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
        idempotencyKey: "018f47ac-7c2e-4f4d-8f5a-9d6c2c1e4901",
        requestedRuntimeMode: "route_integrated_provider",
        clientOnlyFixtureA: "OMITTED_FIXTURE_A",
        clientOnlyFixtureB: "OMITTED_FIXTURE_B",
        clientOnlyFixtureC: "OMITTED_FIXTURE_C",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        workspace: "content",
        generationKind: "question",
        flowStatus: "accepted",
        redactionStatus: "redacted",
        taskRequest: {
          decision: "create_pending_task",
          taskType: "ai_question_generation",
          authorizationSource: "admin_role",
          ownerType: "platform",
          ownerPublicId: "platform_content_review_pool",
          quotaOwnerType: "platform",
          quotaOwnerPublicId: "platform_content_review_pool",
          resultReference: {
            resultKind: "ai_generated_question_set",
            resultPublicId: scopedAdminAiGenerationPublicId(
              "admin_ai_generation_result_content_question_admin_public_123",
            ),
            contentVisibility: "summary_only",
            redactionStatus: "redacted",
            evidenceStatus: "sufficient",
            citationCount: 1,
          },
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
          executionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            redactionStatus: "redacted",
          },
          blockedReasons: [],
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
        taskPersistence: {
          persistenceStatus: "created",
          requestPublicId: "admin_ai_generation_request_public_route_test",
          taskPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_task_content_question_admin_public_123",
          ),
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_content_question_admin_public_123",
          ),
          contentVisibility: "summary_only",
          evidenceStatus: "sufficient",
          citationCount: 1,
          redactionStatus: "redacted",
        },
        generatedResult: {
          persistenceStatus: "created",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_content_question_admin_public_123",
          ),
          contentVisibility: "redacted_snapshot",
          evidenceStatus: "sufficient",
          citationCount: 1,
          formalAdoptionStatus: "blocked",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedPayload).not.toContain("route_integrated_provider");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_A");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_B");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_C");
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(providerInputs).toHaveLength(1);
  });

  it("persists a server-owned unresolved generated-label candidate for balanced content questions", async () => {
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const requestPublicId =
      "admin_ai_generation_request_public_generated_candidate";

    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId,
      taskPersistenceRepository: createTaskPersistenceRecorder().repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl([]),
      body: {
        generationKind: "question",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 1,
          knowledgeNodeMode: "balanced",
          knowledgeNodePublicIds: [],
        },
      },
    });

    expect(generatedResultPersistenceRecorder.calls).toHaveLength(1);
    const persistedInput = generatedResultPersistenceRecorder.calls[0];
    const candidate = persistedInput?.contentRedactedSnapshot
      .formalReviewedDraft as Record<string, unknown>;

    expect(candidate).toMatchObject({
      difficulty: "medium",
      knowledgeNodePublicIds: [],
      knowledgeNodeConfirmation: {
        schemaVersion: 1,
        status: "unresolved",
        generationMode: "balanced",
        requestPublicId,
        resultPublicId: persistedInput?.resultPublicId,
        taskPublicId: persistedInput?.taskPublicId,
        sourceContentDigest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
        generatedLabels: ["redacted_knowledge_node"],
      },
    });
    expect(JSON.stringify(candidate)).not.toContain("providerPayload");
  });

  it("scopes admin generation task identity to each request so stale actor-level results are not reused", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const resultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();

    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_first_attempt",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
        idempotencyKey: "018f47ac-7c2e-4f4d-8f5a-9d6c2c1e4902",
      },
    });
    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_second_attempt",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
        idempotencyKey: "018f47ac-7c2e-4f4d-8f5a-9d6c2c1e4901",
      },
    });

    expect(taskPersistenceRecorder.calls).toHaveLength(2);
    expect(resultPersistenceRecorder.calls).toHaveLength(2);
    expect(providerInputs).toHaveLength(2);

    const [firstTaskCall, secondTaskCall] = taskPersistenceRecorder.calls;
    const [firstResultCall, secondResultCall] = resultPersistenceRecorder.calls;

    expect(firstTaskCall.localContract.taskRequest.taskPublicId).not.toBe(
      secondTaskCall.localContract.taskRequest.taskPublicId,
    );
    expect(
      firstTaskCall.localContract.taskRequest.idempotency.keyHash,
    ).not.toBe(secondTaskCall.localContract.taskRequest.idempotency.keyHash);
    expect(firstResultCall.resultPublicId).not.toBe(
      secondResultCall.resultPublicId,
    );
  });

  it("claims one stable admin task before Provider execution for the same client intent", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      persistenceStatuses: ["created", "reused"],
    });
    const lifecycleRepository = createClaimingLifecycleRepository();
    const body = {
      generationKind: "question",
      idempotencyKey: "018f47ac-7c2e-4f4d-8f5a-9d6c2c1e4901",
    };

    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      useDefaultRequestPublicId: true,
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      lifecycleRepository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body,
    });
    const replayResponse = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      useDefaultRequestPublicId: true,
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      lifecycleRepository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body,
    });
    const replayPayload = await replayResponse.json();

    expect(providerInputs).toHaveLength(1);
    expect(taskPersistenceRecorder.calls).toHaveLength(2);
    expect(taskPersistenceRecorder.calls[0].requestPublicId).toBe(
      taskPersistenceRecorder.calls[1].requestPublicId,
    );
    expect(
      taskPersistenceRecorder.calls[0].localContract.taskRequest.taskPublicId,
    ).toBe(
      taskPersistenceRecorder.calls[1].localContract.taskRequest.taskPublicId,
    );
    expect(replayPayload).toMatchObject({
      code: 0,
      data: {
        taskPersistence: {
          persistenceStatus: "reused",
          status: "pending",
          resultPublicId: null,
        },
        generatedResult: null,
      },
    });
  });

  it("persists a running attempt before admin Provider execution", async () => {
    const events: string[] = [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const lifecycleRepository: AiGenerationTaskLifecycleRepository = {
      async claimTask(input) {
        events.push("claim");
        return {
          disposition: "claimed",
          attempt: {
            taskPublicId: input.taskPublicId,
            retryCount: 0,
            startedAt: input.claimedAt,
          },
          task: {
            taskPublicId: input.taskPublicId,
            taskType: "ai_question_generation",
            ownerType: "platform",
            ownerPublicId: input.ownerPublicId,
            organizationPublicId: null,
            taskStatus: "running",
            retryCount: 0,
            failureCategory: null,
            startedAt: input.claimedAt,
            finishedAt: null,
            resultPublicId: null,
            canCancel: true,
            canRetry: false,
          },
        };
      },
      async failTask() {
        throw new Error("not expected");
      },
      async cancelTask() {
        throw new Error("not expected");
      },
    };
    const providerControl = createFakeProviderRuntimeBridgeControl([]);
    const executeProviderRequest =
      providerControl.providerExecution?.executeProviderRequest;

    if (
      providerControl.providerExecution === undefined ||
      executeProviderRequest === undefined
    ) {
      throw new Error("test Provider control is unavailable");
    }

    providerControl.providerExecution.executeProviderRequest = async (
      input,
    ) => {
      events.push("provider");
      return executeProviderRequest(input);
    };

    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      lifecycleRepository,
      runtimeBridgeControl: providerControl,
      body: { generationKind: "question" },
    });

    expect(events.slice(0, 2)).toEqual(["claim", "provider"]);
  });

  it("persists a redacted admin failure for the current running attempt", async () => {
    const failCalls: unknown[] = [];
    const claimedAt = new Date("2026-07-22T12:05:00.123Z");
    const lifecycleRepository: AiGenerationTaskLifecycleRepository = {
      async claimTask(input) {
        return {
          disposition: "claimed",
          attempt: {
            taskPublicId: input.taskPublicId,
            retryCount: 0,
            startedAt: claimedAt,
          },
          task: {
            taskPublicId: input.taskPublicId,
            taskType: "ai_question_generation",
            ownerType: "platform",
            ownerPublicId: input.ownerPublicId,
            organizationPublicId: null,
            taskStatus: "running",
            retryCount: 0,
            failureCategory: null,
            startedAt: claimedAt,
            finishedAt: null,
            resultPublicId: null,
            canCancel: true,
            canRetry: false,
          },
        };
      },
      async failTask(input) {
        failCalls.push(input);
        return { disposition: "failed", task: null };
      },
      async cancelTask() {
        throw new Error("not expected");
      },
    };
    const runtimeBridgeControl = createFakeProviderRuntimeBridgeControl([]);

    if (runtimeBridgeControl.providerExecution === undefined) {
      throw new Error("test Provider control is unavailable");
    }

    runtimeBridgeControl.providerExecution.executeProviderRequest =
      async () => ({
        requestCount: 1,
        resultStatus: "fail",
        failureCategory: "timeout",
        durationMs: 30000,
        usageSummary: null,
        providerErrorSummary: {
          httpStatus: null,
          providerErrorCode: null,
        },
        visibleGeneratedContent: null,
      });

    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestedAt: claimedAt,
      lifecycleRepository,
      runtimeBridgeControl,
      body: { generationKind: "question" },
    });

    expect(failCalls).toEqual([
      expect.objectContaining({
        attempt: expect.objectContaining({
          retryCount: 0,
          startedAt: claimedAt,
        }),
        failureCategory: "network_error",
      }),
    ]);
    expect(JSON.stringify(failCalls)).not.toContain("providerErrorSummary");
  });

  it("fails the claimed attempt when atomic result persistence rejects", async () => {
    const failCalls: unknown[] = [];
    const claimedAt = new Date("2026-07-22T12:05:00.123Z");
    const baseResultRepository =
      createGeneratedResultPersistenceRecorder().repository;
    const baseLifecycleRepository = createClaimingLifecycleRepository();
    const lifecycleRepository: AiGenerationTaskLifecycleRepository = {
      ...baseLifecycleRepository,
      failTask: async (input) => {
        failCalls.push(input);
        return { disposition: "failed", task: null };
      },
    };
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestedAt: claimedAt,
      lifecycleRepository,
      resultPersistenceRepository: {
        ...baseResultRepository,
        async createOrReuseDraftResult() {
          throw new Error("SENSITIVE_PROVIDER_RESULT_MARKER");
        },
      },
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl([]),
      body: { generationKind: "question" },
    });
    const serializedResponse = JSON.stringify(await response.json());

    expect(failCalls).toEqual([
      expect.objectContaining({
        attempt: expect.objectContaining({ startedAt: claimedAt }),
        failureCategory: "system_error",
      }),
    ]);
    expect(serializedResponse).not.toContain(
      "SENSITIVE_PROVIDER_RESULT_MARKER",
    );
  });

  it("fails the claimed attempt when Provider execution throws", async () => {
    const failCalls: unknown[] = [];
    const claimedAt = new Date("2026-07-22T12:05:00.123Z");
    const baseLifecycleRepository = createClaimingLifecycleRepository();
    const lifecycleRepository: AiGenerationTaskLifecycleRepository = {
      ...baseLifecycleRepository,
      failTask: async (input) => {
        failCalls.push(input);
        return { disposition: "failed", task: null };
      },
    };
    const runtimeBridgeControl = createFakeProviderRuntimeBridgeControl([]);

    if (runtimeBridgeControl.providerExecution === undefined) {
      throw new Error("test Provider control is unavailable");
    }
    runtimeBridgeControl.providerExecution.executeProviderRequest =
      async () => {
        throw new Error("SENSITIVE_PROVIDER_THROW_MARKER");
      };

    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestedAt: claimedAt,
      lifecycleRepository,
      runtimeBridgeControl,
      body: { generationKind: "question" },
    });
    const serializedResponse = JSON.stringify(await response.json());

    expect(failCalls).toEqual([
      expect.objectContaining({
        attempt: expect.objectContaining({ startedAt: claimedAt }),
        failureCategory: "system_error",
      }),
    ]);
    expect(serializedResponse).not.toContain("SENSITIVE_PROVIDER_THROW_MARKER");
  });

  it("fails the claimed attempt when paper assembly throws", async () => {
    const failCalls: unknown[] = [];
    const claimedAt = new Date("2026-07-22T12:05:00.123Z");
    const baseLifecycleRepository = createClaimingLifecycleRepository();
    const lifecycleRepository: AiGenerationTaskLifecycleRepository = {
      ...baseLifecycleRepository,
      failTask: async (input) => {
        failCalls.push(input);
        return { disposition: "failed", task: null };
      },
    };
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestedAt: claimedAt,
      lifecycleRepository,
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl([]),
      paperAssemblyResolver: async () => {
        throw new Error("SENSITIVE_PAPER_ASSEMBLY_MARKER");
      },
      body: { generationKind: "paper" },
    });
    const serializedResponse = JSON.stringify(await response.json());

    expect(failCalls).toEqual([
      expect.objectContaining({
        attempt: expect.objectContaining({ startedAt: claimedAt }),
        failureCategory: "system_error",
      }),
    ]);
    expect(serializedResponse).not.toContain("SENSITIVE_PAPER_ASSEMBLY_MARKER");
  });

  it("persists content admin local contracts through the injected task persistence repository", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_content_route_123",
      requestedAt: new Date("2026-06-26T20:10:00.000Z"),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
        clientOnlyFixtureF: "OMITTED_FIXTURE_F",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(taskPersistenceRecorder.calls[0]).toMatchObject({
      requestPublicId: "admin_ai_generation_request_public_content_route_123",
      requestedAt: new Date("2026-06-26T20:10:00.000Z"),
      localContract: {
        runtimeStatus: "local_contract_only",
        workspace: "content",
        generationKind: "question",
        runtimeBridge: {
          bridgeStatus: "provider_call_blocked",
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          costCalibrationExecuted: false,
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
      },
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        taskPersistence: {
          persistenceStatus: "created",
          requestPublicId:
            "admin_ai_generation_request_public_content_route_123",
          taskPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_task_content_question_admin_public_123",
          ),
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_content_question_admin_public_123",
          ),
          contentVisibility: "summary_only",
          evidenceStatus: "sufficient",
          citationCount: 1,
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_F");
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(providerInputs).toHaveLength(1);
  });

  it("blocks content admin provider-disabled requests before task or result persistence", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_content_route_123",
      requestedAt: new Date("2026-06-26T20:10:00.000Z"),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        clientOnlyFixtureI: "OMITTED_FIXTURE_I",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 409015,
      data: {
        rejectionReason: "provider_execution_unavailable",
        runtimeBridgeStatus: "provider_call_blocked",
        providerCallExecuted: false,
        providerConfigurationRead: false,
        envSecretAccessed: false,
        costCalibrationExecuted: false,
        redactionStatus: "redacted",
      },
    });
    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(generatedResultPersistenceRecorder.calls).toHaveLength(0);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_I");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("claims a reused pending organization task before Provider execution", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      persistenceStatus: "reused",
    });
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      requestPublicId: "admin_ai_generation_request_public_org_route_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        clientOnlyFixtureG: "OMITTED_FIXTURE_G",
      },
    });
    const payload = await response.json();

    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(taskPersistenceRecorder.calls[0]).toMatchObject({
      localContract: {
        workspace: "organization",
        generationKind: "paper",
        taskRequest: {
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          quotaOwnerType: "organization",
          quotaOwnerPublicId: "organization_public_123",
        },
      },
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        taskPersistence: {
          persistenceStatus: "reused",
          requestPublicId: "admin_ai_generation_request_public_org_route_123",
          taskPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_task_organization_paper_admin_public_123",
          ),
          status: "succeeded",
          resultPublicId: expect.any(String),
          redactionStatus: "redacted",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("OMITTED_FIXTURE_G");
    expect(providerInputs).toHaveLength(1);
  });

  it("persists organization advanced admin grounded generated result summaries", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        persistenceStatus: "reused",
      });
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      requestPublicId: "admin_ai_generation_request_public_org_route_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        clientOnlyFixtureJ: "OMITTED_FIXTURE_J",
      },
    });
    const payload = await response.json();

    expect(generatedResultPersistenceRecorder.calls).toHaveLength(1);
    expect(generatedResultPersistenceRecorder.calls[0]).toMatchObject({
      resultPublicId: scopedAdminAiGenerationPublicId(
        "admin_ai_generation_result_organization_paper_admin_public_123",
      ),
      taskPublicId: scopedAdminAiGenerationPublicId(
        "admin_ai_generation_task_organization_paper_admin_public_123",
      ),
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_123",
      organizationPublicId: "organization_public_123",
      taskType: "ai_paper_generation",
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        resultState: {
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_organization_paper_admin_public_123",
          ),
        },
        generatedResult: {
          persistenceStatus: "reused",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_organization_paper_admin_public_123",
          ),
          formalAdoptionStatus: "blocked",
        },
        runtimeBridge: {
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("OMITTED_FIXTURE_J");
    expect(providerInputs).toHaveLength(1);
  });

  it("persists organization AI question results with enterprise training question draft snapshots", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      requestPublicId: "admin_ai_generation_request_public_org_question_123",
      taskPersistenceRepository: createTaskPersistenceRecorder().repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl(
        providerInputs,
        {
          content: JSON.stringify({
            schemaVersion: aiQuestionDraftSchemaVersion,
            kind: "question_set",
            questions: [
              {
                questionType: "single_choice",
                difficulty: "medium",
                knowledgeNodeLabels: ["synthetic_node"],
                questionStem: "Synthetic organization training stem",
                questionOptions: [
                  {
                    optionLabel: "A",
                    optionText: "Synthetic option A",
                  },
                  {
                    optionLabel: "B",
                    optionText: "Synthetic option B",
                  },
                ],
                standardAnswer: "A",
                analysis: "Synthetic analysis",
                scoringPoints: [],
                fillBlankAnswers: [],
              },
            ],
          }),
        },
      ),
      body: {
        generationKind: "question",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 1,
          questionType: "single_choice",
        },
        clientOnlyFixtureQuestionSnapshot: "OMITTED_FIXTURE_QUESTION_SNAPSHOT",
      },
    });
    const payload = await response.json();

    expect(generatedResultPersistenceRecorder.calls).toHaveLength(1);
    expect(
      generatedResultPersistenceRecorder.calls[0]?.contentRedactedSnapshot,
    ).toMatchObject({
      generationParameters: {
        profession: "marketing",
        level: 3,
        subject: "theory",
        questionCount: 1,
        questionType: "single_choice",
      },
      organizationTrainingQuestionDraft: {
        questions: [
          {
            sequenceNumber: 1,
            questionType: "single_choice",
            stem: "Synthetic organization training stem",
            options: [
              {
                label: "A",
                content: "Synthetic option A",
              },
              {
                label: "B",
                content: "Synthetic option B",
              },
            ],
            score: 1,
            evidenceSummary: {
              evidenceStatus: "sufficient",
              citationCount: 1,
            },
            answerAndAnalysis: {
              visibility: "collapsed_by_default",
              standardAnswer: "A",
              analysis: "Synthetic analysis",
            },
          },
        ],
      },
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        generatedResult: {
          formalAdoptionStatus: "blocked",
          redactionStatus: "redacted",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain(
      "OMITTED_FIXTURE_QUESTION_SNAPSHOT",
    );
    expect(JSON.stringify(payload)).not.toContain("providerPayload");
  });

  it("hands off assembled AI paper containers in organization advanced admin local contracts before persistence", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const paperAssemblyResolverCalls: string[] = [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      requestPublicId: "admin_ai_generation_request_public_org_route_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      paperAssemblyResolver: () => {
        paperAssemblyResolverCalls.push("called");

        return createAssembledPaperRouteResult();
      },
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 3,
        },
        clientOnlyFixturePaperAssembly: "OMITTED_FIXTURE_PAPER_ASSEMBLY",
      },
    });
    const payload = await response.json();

    expect(paperAssemblyResolverCalls).toHaveLength(1);
    expect(taskPersistenceRecorder.calls[0]?.localContract).toMatchObject({
      paperAssembly: null,
    });
    expect(
      generatedResultPersistenceRecorder.calls[0]?.contentRedactedSnapshot,
    ).toMatchObject({
      paperAssembly: {
        status: "assembled",
        redactionStatus: "redacted",
        selectedQuestionCount: 3,
        sourceComposition: {
          platformFormalQuestionCount: 2,
          enterpriseTrainingSnapshotCount: 1,
        },
      },
      organizationTrainingPaperDraft: {
        paperTitle: "redacted paper container",
        selectedQuestionCount: 3,
        sourceComposition: {
          platformFormalQuestionCount: 2,
          enterpriseTrainingSnapshotCount: 1,
        },
        matchQuality: "fully_matched",
        assemblySections: [
          {
            sectionKey: "single_choice",
            title: "redacted section",
            questionType: "single_choice",
            selectedQuestionCount: 3,
            selectedQuestions: [
              {
                questionPublicId: "platform_question_public_a",
                sourceKind: "platform_formal_question",
                score: 1,
              },
              {
                questionPublicId: "platform_question_public_b",
                sourceKind: "platform_formal_question",
                score: 1,
              },
              {
                questionPublicId: "enterprise_question_public_a",
                sourceKind: "enterprise_training_snapshot",
                score: 1,
              },
            ],
          },
        ],
        redactionStatus: "admin_safe_detail",
      },
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        paperAssembly: {
          status: "assembled",
          redactionStatus: "redacted",
          sourceDiagnostics: {
            role: "org_advanced_admin",
            platformQuestionCount: 2,
            enterpriseQuestionCount: 1,
            enterpriseSourceStatus: "resolved",
          },
          container: {
            requestedQuestionCount: 3,
            selectedQuestionCount: 3,
            matchQuality: "fully_matched",
          },
          insufficiency: null,
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain(
      "OMITTED_FIXTURE_PAPER_ASSEMBLY",
    );
    expect(JSON.stringify(payload)).not.toMatch(/"id":/);
    expect(providerInputs).toHaveLength(1);
  });

  it("uses repository-backed paper assembly by default for organization advanced admin paper requests", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const questionRepositoryCalls: unknown[] = [];
    const trainingRepositoryCalls: unknown[] = [];
    const questionRepository: AiPaperQuestionSourceRepository = {
      async listAvailableAiPaperSourceQuestions(query) {
        questionRepositoryCalls.push(query);

        return [
          createQuestionRow({
            public_id: "platform_question_public_route_a",
            question_type: "single_choice",
          }),
          createQuestionRow({
            public_id: "platform_question_public_route_b",
            question_type: "multi_choice",
          }),
        ];
      },
    };
    const organizationTrainingRepository: Pick<
      OrganizationTrainingRepository,
      | "listAdminLifecycleVersions"
      | "listAdminVisibleQuestionSnapshotsForAiPaperSource"
      | "listEmployeeVisibleVersions"
    > = {
      async listAdminLifecycleVersions(input) {
        trainingRepositoryCalls.push(input);

        return [
          createTrainingVersion({
            organizationPublicId: "organization_public_123",
            questions: [
              createTrainingQuestion("enterprise_question_public_route_a", {
                questionType: "true_false",
              }),
            ],
          }),
        ];
      },
      async listAdminVisibleQuestionSnapshotsForAiPaperSource() {
        return [
          {
            ...createTrainingQuestion("enterprise_question_public_route_a", {
              questionType: "true_false",
            }),
            standardAnswer: "A",
            analysisSummary: "SENSITIVE_ENTERPRISE_ANALYSIS",
            evidenceStatus: "sufficient",
            citationCount: 1,
          },
        ];
      },
      async listEmployeeVisibleVersions() {
        throw new Error("employee training repository should not be called");
      },
    };
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      questionRepository,
      organizationTrainingRepository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 3,
        },
      },
    });
    const payload = await response.json();

    expect(questionRepositoryCalls).toEqual([
      {
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNodePublicIds: null,
        questionPublicIds: null,
      },
      {
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNodePublicIds: null,
        questionPublicIds: [
          "platform_question_public_route_a",
          "platform_question_public_route_b",
        ],
      },
    ]);
    expect(trainingRepositoryCalls).toHaveLength(1);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        paperAssembly: {
          status: "assembled",
          redactionStatus: "redacted",
          sourceDiagnostics: {
            role: "org_advanced_admin",
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
    });
    const paperDraftSnapshot = (
      generatedResultPersistenceRecorder.calls[0]?.contentRedactedSnapshot as {
        organizationTrainingPaperDraft?: {
          paperSections?: unknown[];
          questions?: unknown[];
        };
      }
    ).organizationTrainingPaperDraft;

    expect(paperDraftSnapshot).toMatchObject({
      paperTitle: "AI组卷方案",
      selectedQuestionCount: 3,
      redactionStatus: "admin_safe_detail",
    });
    expect(paperDraftSnapshot?.paperSections).toHaveLength(3);
    expect(paperDraftSnapshot?.paperSections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selectedQuestionCount: 1,
          questions: [
            expect.objectContaining({
              stem: "SENSITIVE_STEM_MARKER",
              answerAndAnalysis: {
                visibility: "collapsed_by_default",
                standardAnswer: "SENSITIVE_ANSWER_MARKER",
                analysis: "SENSITIVE_ANALYSIS_MARKER",
              },
            }),
          ],
        }),
        expect.objectContaining({
          selectedQuestionCount: 1,
          questions: [
            expect.objectContaining({
              stem: "SENSITIVE_ENTERPRISE_STEM",
              answerAndAnalysis: {
                visibility: "collapsed_by_default",
                standardAnswer: "A",
                analysis: "SENSITIVE_ENTERPRISE_ANALYSIS",
              },
            }),
          ],
        }),
      ]),
    );
    expect(paperDraftSnapshot?.questions).toHaveLength(3);
    expect(JSON.stringify(payload)).not.toContain("SENSITIVE_STEM_MARKER");
    expect(JSON.stringify(payload)).not.toContain("SENSITIVE_ENTERPRISE_STEM");
    expect(providerInputs).toHaveLength(1);
  });

  it("does not invoke AI paper assembly for admin AI question local contracts", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const paperAssemblyResolverCalls: string[] = [];
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      paperAssemblyResolver: () => {
        paperAssemblyResolverCalls.push("called");

        return createAssembledPaperRouteResult();
      },
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        generationKind: "question",
        paperAssembly: null,
      },
    });
    expect(paperAssemblyResolverCalls).toHaveLength(0);
    expect(providerInputs).toHaveLength(1);
  });

  it("blocks admin AI paper persistence when local paper assembly rejects the provider plan", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const paperAssemblyResolverCalls: string[] = [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      paperAssemblyResolver: () => {
        paperAssemblyResolverCalls.push("called");

        return createRejectedPaperRouteResult();
      },
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 3,
        },
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 409015,
      data: {
        rejectionReason: "generated_output_unacceptable",
        redactionStatus: "redacted",
      },
    });
    expect(paperAssemblyResolverCalls).toHaveLength(1);
    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(generatedResultPersistenceRecorder.calls).toHaveLength(0);
    expect(providerInputs).toHaveLength(1);
  });

  it("exposes organization-owned draft and training source boundaries without platform publish access", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        organizationOwnedDraftBoundary: {
          generatedResultScope: "organization_private",
          organizationDraftAdoptionStatus:
            "allowed_as_organization_private_draft",
          organizationTrainingSourceStatus:
            "allowed_as_organization_private_training_source",
          platformFormalDraftStatus: "blocked_requires_content_admin_review",
          publishStatus: "blocked_requires_fresh_publish_task",
          studentVisibleStatus: "blocked",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          redactionStatus: "redacted",
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
        runtimeBridge: {
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
        },
      },
    });
    expect(providerInputs).toHaveLength(1);
  });

  it("accepts organization advanced admin AI paper requests as organization-owned local contracts", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        clientOnlyFixtureD: "OMITTED_FIXTURE_D",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        runtimeStatus: "local_contract_only",
        workspace: "organization",
        generationKind: "paper",
        flowStatus: "accepted",
        taskRequest: {
          taskType: "ai_paper_generation",
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          quotaOwnerType: "organization",
          quotaOwnerPublicId: "organization_public_123",
          resultReference: {
            resultKind: "ai_generated_paper_draft",
            resultPublicId: scopedAdminAiGenerationPublicId(
              "admin_ai_generation_result_organization_paper_admin_public_123",
            ),
            contentVisibility: "summary_only",
          },
        },
        resultState: {
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_organization_paper_admin_public_123",
          ),
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
          executionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            redactionStatus: "redacted",
          },
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_D");
    expect(providerInputs).toHaveLength(1);
  });

  it("passes admin runtime bridge context into provider-disabled diagnostics", async () => {
    const runtimeBridgeInputs: AdminAiGenerationRuntimeBridgeInput[] = [];
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      body: {
        generationKind: "paper",
      },
      runtimeBridgeControl: {
        createProviderDisabledOutcome: (input) => {
          runtimeBridgeInputs.push(input);

          return {
            blockedReasons: [
              "provider_call_blocked",
              "real_provider_execution_requires_follow_up_task",
            ],
            executionSummary: providerDisabledExecutionSummary,
          };
        },
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 409015,
      data: {
        rejectionReason: "provider_execution_unavailable",
        runtimeBridgeStatus: "provider_call_blocked",
        providerCallExecuted: false,
        providerConfigurationRead: false,
        envSecretAccessed: false,
        costCalibrationExecuted: false,
        redactionStatus: "redacted",
      },
    });
    expect(runtimeBridgeInputs).toEqual([
      {
        actorPublicId: "admin_public_123",
        workspace: "organization",
        generationKind: "paper",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 50,
          questionTypeDistribution: "balanced_40_30_30",
          paperStructure: "by_question_type",
        },
        requestPublicId: "admin_ai_generation_request_public_route_test",
        taskPublicId: scopedAdminAiGenerationPublicId(
          "admin_ai_generation_task_organization_paper_admin_public_123",
        ),
        resultPublicId: scopedAdminAiGenerationPublicId(
          "admin_ai_generation_result_organization_paper_admin_public_123",
        ),
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        organizationPublicId: "organization_public_123",
      },
    ]);
  });

  it("allows injected provider-disabled diagnostics without enabling provider execution", async () => {
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "paper",
      },
      runtimeBridgeControl: {
        createProviderDisabledOutcome: () => ({
          blockedReasons: [
            "provider_call_blocked",
            "admin_runtime_bridge_control_injected",
          ],
          executionSummary: {
            ...providerDisabledExecutionSummary,
            durationMs: 12,
          },
        }),
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 409015,
      data: {
        rejectionReason: "provider_execution_unavailable",
        runtimeBridgeStatus: "provider_call_blocked",
        providerCallExecuted: false,
        providerConfigurationRead: false,
        envSecretAccessed: false,
        costCalibrationExecuted: false,
        redactionStatus: "redacted",
      },
    });
  });

  it("returns a redacted missing Provider credential category without persistence", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const resultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "question",
        clientOnlyFixtureP: "OMITTED_FIXTURE_P",
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
          readProviderCredential: () => null,
          resolveGroundingContext: () => sufficientAdminGroundingContext,
        },
      },
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 409015,
      data: {
        rejectionReason: "provider_credential_unavailable",
        runtimeBridgeStatus: "provider_call_blocked",
        providerCallExecuted: false,
        providerConfigurationRead: true,
        envSecretAccessed: true,
        costCalibrationExecuted: false,
        redactionStatus: "redacted",
      },
    });
    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(resultPersistenceRecorder.calls).toHaveLength(0);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_P");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it.each<{
    adminRoles: AdminRole[];
    generationKind: "question" | "paper";
    organizationPublicId?: string | null;
    routeWorkflow: AdminAiGenerationRuntimeBridgeRouteWorkflow;
    workspace: AdminAiGenerationWorkspace;
  }>([
    {
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "question",
      organizationPublicId: null,
      routeWorkflow: "content_ai_question_generation",
    },
    {
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "paper",
      organizationPublicId: null,
      routeWorkflow: "content_ai_paper_generation",
    },
    {
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      generationKind: "question",
      organizationPublicId: "organization_public_123",
      routeWorkflow: "organization_ai_question_generation",
    },
    {
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      generationKind: "paper",
      organizationPublicId: "organization_public_123",
      routeWorkflow: "organization_ai_paper_generation",
    },
  ])(
    "runs provider-enabled fake Provider route workflow $routeWorkflow",
    async (routeCase) => {
      const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
        [];
      const resultPersistenceRecorder =
        createGeneratedResultPersistenceRecorder();
      const response = await postLocalContractRequest({
        workspace: routeCase.workspace,
        adminRoles: routeCase.adminRoles,
        organizationPublicId: routeCase.organizationPublicId,
        body: {
          generationKind: routeCase.generationKind,
          clientOnlyFixtureK: "OMITTED_FIXTURE_K",
        },
        runtimeBridgeControl:
          createFakeProviderRuntimeBridgeControl(providerInputs),
        resultPersistenceRepository: resultPersistenceRecorder.repository,
      });
      const payload = await response.json();
      const serializedPayload = JSON.stringify(payload);

      expect(providerInputs).toHaveLength(1);
      expect(providerInputs[0]).toMatchObject({
        providerMetadata: {
          providerName: "alibaba-qwen",
          modelName: "qwen3.7-max",
        },
        limits: {
          maxRequests: 1,
          maxRetries: 0,
          maxOutputTokens: 220,
          timeoutMs: 30000,
        },
        requestContext: {
          routeWorkflow: routeCase.routeWorkflow,
          workspace: routeCase.workspace,
          generationKind: routeCase.generationKind,
          ownerType:
            routeCase.workspace === "content" ? "platform" : "organization",
          ownerPublicId:
            routeCase.workspace === "content"
              ? "platform_content_review_pool"
              : "organization_public_123",
          organizationPublicId:
            routeCase.workspace === "content"
              ? null
              : "organization_public_123",
        },
      });
      expect(payload).toMatchObject({
        code: 0,
        data: {
          runtimeStatus: "local_contract_only",
          workspace: routeCase.workspace,
          generationKind: routeCase.generationKind,
          runtimeBridge: {
            bridgeStatus: "provider_call_succeeded",
            providerCallExecuted: true,
            envSecretAccessed: true,
            providerConfigurationRead: true,
            costCalibrationExecuted: false,
            executionSummary: {
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 21,
              usageSummary: {
                promptTokens: 5,
                completionTokens: 2,
                totalTokens: 7,
              },
              providerErrorSummary: null,
              redactionStatus: "redacted",
            },
            visibleGeneratedContent: {
              content: expect.any(String),
              contentVisibility: "transient_response_only",
              persistenceStatus: "not_persisted",
              safetyStatus: "checked",
              groundingSummary: {
                evidenceStatus: "sufficient",
                citationCount: 1,
              },
              structuredPreview: expect.objectContaining({
                kind:
                  routeCase.generationKind === "question"
                    ? "question_set"
                    : "paper_draft",
                parseStatus: "parsed",
              }),
            },
            blockedReasons: [],
          },
          formalContentBoundary: {
            questionWriteStatus: "blocked_without_follow_up_task",
            paperWriteStatus: "blocked_without_follow_up_task",
          },
        },
      });
      expect(serializedPayload).not.toContain(
        "synthetic-admin-provider-credential",
      );
      expect(serializedPayload).not.toContain("OMITTED_FIXTURE_K");
      expect(serializedPayload).not.toContain("rawPrompt");
      expect(serializedPayload).not.toContain("rawOutput");
      expect(serializedPayload).not.toContain("providerPayload");
      expect(serializedPayload).not.toContain("Authorization");
      expect(serializedPayload).not.toMatch(/"id":/);
      expect(
        JSON.stringify(
          (payload.data as { runtimeBridge: { executionSummary: unknown } })
            .runtimeBridge.executionSummary,
        ),
      ).not.toContain(visibleAdminProviderContent);
      expect(JSON.stringify(resultPersistenceRecorder.calls)).not.toContain(
        visibleAdminProviderContent,
      );
    },
  );

  it("blocks admin result persistence when Provider grounding evidence is insufficient", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const resultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "question",
        clientOnlyFixtureM: "OMITTED_FIXTURE_M",
      },
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl(
        providerInputs,
        {
          groundingContext: insufficientAdminGroundingContext,
        },
      ),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 409015,
      data: {
        rejectionReason: "grounding_evidence_insufficient",
        runtimeBridgeStatus: "provider_call_blocked",
        providerCallExecuted: false,
        providerConfigurationRead: false,
        envSecretAccessed: false,
        costCalibrationExecuted: false,
        redactionStatus: "redacted",
      },
    });
    expect(providerInputs).toHaveLength(0);
    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(resultPersistenceRecorder.calls).toHaveLength(0);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_M");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it("blocks admin result persistence when Provider output cannot be parsed into the requested draft kind", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const resultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "question",
        clientOnlyFixtureN: "OMITTED_FIXTURE_N",
      },
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl(
        providerInputs,
        {
          content: JSON.stringify({
            questions: [{ questionType: "single_choice" }],
          }),
        },
      ),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 409015,
      data: {
        rejectionReason: "generated_output_unacceptable",
        runtimeBridgeStatus: "provider_call_succeeded",
        providerCallExecuted: true,
        providerConfigurationRead: true,
        envSecretAccessed: true,
        costCalibrationExecuted: false,
        redactionStatus: "redacted",
      },
    });
    expect(providerInputs).toHaveLength(1);
    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(resultPersistenceRecorder.calls).toHaveLength(0);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_N");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it("uses service-computed org_auth public id for organization AI task persistence", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_advanced_admin"],
        organizationAuthorizationPublicId: "org_auth_route_public_123",
        organizationPublicId: "organization_public_123",
        organizationEffectiveEdition: "advanced",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: true,
      },
      organizationPublicId: "organization_public_123",
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        requestedRuntimeMode: "route_integrated_provider",
        clientOnlyFixtureO: "OMITTED_FIXTURE_O",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        taskRequest: {
          authorizationSource: "org_auth",
          authorizationPublicId: "org_auth_route_public_123",
          organizationPublicId: "organization_public_123",
        },
      },
    });
    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(
      taskPersistenceRecorder.calls[0]?.localContract.taskRequest
        .authorizationPublicId,
    ).toBe("org_auth_route_public_123");
    expect(serializedPayload).not.toContain("org_auth_local_contract");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_O");
  });

  it("denies organization AI generation when the selected org_auth does not cover the requested profession and level", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      organizationTrainingRepository: createOrganizationTrainingRepository({
        organizationPublicId: "organization_public_123",
        authorizationProfession: "monopoly",
        authorizationLevel: 4,
      }),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        generationParameters: defaultAdminGenerationParameters,
      },
    });

    await expect(response.json()).resolves.toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
  });

  it("keeps one raw request identity across selected org_auth scopes for snapshot conflict detection", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const requestPublicId = "admin_ai_generation_request_shared_scope_key";

    for (const requestScope of [
      {
        authorizationPublicId: "org_auth_marketing_public_123",
        profession: "marketing",
        level: 3,
      },
      {
        authorizationPublicId: "org_auth_monopoly_public_456",
        profession: "monopoly",
        level: 4,
      },
    ] as const) {
      const response = await postLocalContractRequest({
        workspace: "organization",
        adminRoles: ["org_advanced_admin"],
        adminWorkspaceCapability: {
          adminRoles: ["org_advanced_admin"],
          organizationAuthorizationPublicId: requestScope.authorizationPublicId,
          organizationPublicId: "organization_public_123",
          organizationEffectiveEdition: "advanced",
          organizationAuthorizationSource: "org_auth",
          capabilitySource: "service_computed",
          canUseOrganizationAdvancedWorkspace: true,
        },
        organizationPublicId: "organization_public_123",
        organizationTrainingRepository: createOrganizationTrainingRepository({
          organizationPublicId: "organization_public_123",
          authorizationPublicId: requestScope.authorizationPublicId,
          authorizationProfession: requestScope.profession,
          authorizationLevel: requestScope.level,
        }),
        taskPersistenceRepository: taskPersistenceRecorder.repository,
        runtimeBridgeControl:
          createFakeProviderRuntimeBridgeControl(providerInputs),
        requestPublicId,
        body: {
          generationKind: "question",
          generationParameters: {
            ...defaultAdminGenerationParameters,
            profession: requestScope.profession,
            level: requestScope.level,
          },
        },
      });

      expect(response.status).toBe(200);
    }

    expect(taskPersistenceRecorder.calls).toHaveLength(2);
    expect(providerInputs).toHaveLength(2);
    const [firstCall, secondCall] = taskPersistenceRecorder.calls;
    expect(firstCall.localContract.taskRequest.taskPublicId).not.toBe(
      secondCall.localContract.taskRequest.taskPublicId,
    );
    expect(firstCall.localContract.taskRequest.idempotency.keyHash).toBe(
      secondCall.localContract.taskRequest.idempotency.keyHash,
    );
  });

  it("denies organization advanced admin direct POST when service-computed capability is absent", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: null,
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        clientOnlyFixtureL: "OMITTED_FIXTURE_L",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_L");
  });

  it("denies organization advanced admin direct GET when service-computed capability is false", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await getLocalContractHistory({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_advanced_admin"],
        organizationPublicId: "organization_public_123",
        organizationEffectiveEdition: "advanced",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: false,
      },
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
    });
    const payload = await response.json();

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.historyQueries).toEqual([]);
  });

  it("denies organization standard admin direct POST without creating a task contract", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_standard_admin"],
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        clientOnlyFixtureE: "OMITTED_FIXTURE_E",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_E");
  });

  it("does not persist invalid admin AI generation requests", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "unsupported",
        clientOnlyFixtureH: "OMITTED_FIXTURE_H",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 400013,
      message: "Invalid admin AI generation request input.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_H");
  });

  it("passes structured knowledge scope through admin AI generation local contracts", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        requestedRuntimeMode: "route_integrated_provider",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          knowledgeNodeMode: "selected",
          knowledgeNodePublicIds: ["knowledge_node_public_admin"],
          includeDescendants: true,
          knowledgeNodeSupplement: "admin supplement",
          sourcePreference: "prefer_platform",
        },
      },
    });

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        taskRequest: {
          taskType: "ai_question_generation",
        },
      },
    });
    expect(
      providerInputs[0]?.requestContext.generationParameters,
    ).toMatchObject({
      knowledgeNodeMode: "selected",
      knowledgeNodePublicIds: ["knowledge_node_public_admin"],
      includeDescendants: true,
      knowledgeNodeSupplement: "admin supplement",
      sourcePreference: "prefer_platform",
    });
    expect(
      taskPersistenceRecorder.calls[0]?.localContract.taskRequest.taskType,
    ).toBe("ai_question_generation");
  });

  it("passes organization AI paper distribution and structure parameters through local contracts", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "paper",
        requestedRuntimeMode: "route_integrated_provider",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 30,
          sourcePreference: "prefer_platform",
          questionTypeDistribution: "single_50_multi_25_true_false_25",
          paperStructure: "by_knowledge_node",
        },
      },
    });

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        taskRequest: {
          taskType: "ai_paper_generation",
        },
      },
    });
    expect(
      providerInputs[0]?.requestContext.generationParameters,
    ).toMatchObject({
      questionCount: 30,
      sourcePreference: "prefer_platform",
      questionTypeDistribution: "single_50_multi_25_true_false_25",
      paperStructure: "by_knowledge_node",
    });
  });

  it("rejects malformed admin AI generation knowledge node public ids", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          knowledgeNodePublicIds: ["invalid public id"],
        },
      },
    });

    await expect(response.json()).resolves.toEqual({
      code: 400013,
      message: "Invalid admin AI generation request input.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
  });

  it("rejects malformed organization AI paper parameter enum values", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "paper",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionTypeDistribution: "unsupported_distribution",
          paperStructure: "unsupported_structure",
        },
      },
    });

    await expect(response.json()).resolves.toEqual({
      code: 400013,
      message: "Invalid admin AI generation request input.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
  });

  it("rejects admin AI generation question counts above the product contract before persistence", async () => {
    const questionTaskPersistenceRecorder = createTaskPersistenceRecorder();
    const questionResponse = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      taskPersistenceRepository: questionTaskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 11,
        },
      },
    });

    await expect(questionResponse.json()).resolves.toEqual({
      code: 400013,
      message: "Invalid admin AI generation request input.",
      data: null,
    });
    expect(questionTaskPersistenceRecorder.calls).toEqual([]);

    const paperTaskPersistenceRecorder = createTaskPersistenceRecorder();
    const paperResponse = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      taskPersistenceRepository: paperTaskPersistenceRecorder.repository,
      body: {
        generationKind: "paper",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 81,
        },
      },
    });

    await expect(paperResponse.json()).resolves.toEqual({
      code: 400013,
      message: "Invalid admin AI generation request input.",
      data: null,
    });
    expect(paperTaskPersistenceRecorder.calls).toEqual([]);
  });

  it("returns content admin metadata-only task history scoped to the content review workspace", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "content",
          generationKind: "paper",
          taskPublicId: "admin_ai_generation_task_content_paper_history_123",
          requestedAt: "2026-06-26T20:30:00.000Z",
        }),
      ],
    });
    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=paper&page=1&pageSize=10",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(taskPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "paper",
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
      data: {
        workspace: "content",
        latestTask: {
          taskPublicId: "admin_ai_generation_task_content_paper_history_123",
          generationKind: "paper",
          status: "pending",
          resultPublicId: null,
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          runtimeStatus: "local_contract_only",
          runtimeBridgeStatus: "provider_call_blocked",
          providerCallExecuted: false,
          costCalibrationExecuted: false,
          redactionStatus: "redacted",
          formalContentBoundary: {
            questionWriteStatus: "blocked_without_follow_up_task",
            paperWriteStatus: "blocked_without_follow_up_task",
          },
        },
        items: [
          {
            taskPublicId: "admin_ai_generation_task_content_paper_history_123",
            runtimeBridgeStatus: "provider_call_blocked",
          },
        ],
        redactionStatus: "redacted",
      },
    });
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain("prompt");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toContain("Authorization");
  });

  it("passes generation kind and pagination query into admin AI history repositories", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();

    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=paper&page=2&pageSize=5",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });
    const payload = await response.json();

    expect(taskPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "paper",
        page: 2,
        pageSize: 5,
        limit: 5,
        offset: 5,
      },
    ]);
    expect(generatedResultPersistenceRecorder.historyQueries).toEqual([]);
    expect(generatedResultPersistenceRecorder.taskBatchQueries).toEqual([]);
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

  it("joins results to the task page after earlier failed tasks shift the result subset", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_second_page_success";
    const resultPublicId =
      "admin_ai_generation_result_content_question_second_page_success";
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "content",
          generationKind: "question",
          taskPublicId,
          resultPublicId,
          status: "succeeded",
          requestedAt: "2026-06-26T20:45:00.000Z",
        }),
      ],
    });
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        draftResults: [
          createGeneratedResultHistoryItem({
            workspace: "content",
            generationKind: "question",
            taskPublicId,
            resultPublicId,
            persistedAt: "2026-06-26T20:46:00.000Z",
          }),
        ],
      });

    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=question&page=2&pageSize=5",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        items: [
          {
            taskPublicId,
            status: "succeeded",
            generatedResult: { resultPublicId },
          },
        ],
      },
      pagination: { page: 2, pageSize: 5 },
    });
    expect(generatedResultPersistenceRecorder.historyQueries).toEqual([]);
    expect(generatedResultPersistenceRecorder.taskBatchQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "question",
        taskPublicIds: [taskPublicId],
      },
    ]);
  });

  it("returns content admin generated result history summaries without raw result payloads", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_history_456";
    const resultPublicId =
      "admin_ai_generation_result_content_question_history_456";
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "content",
          generationKind: "question",
          taskPublicId,
          resultPublicId,
          status: "succeeded",
          requestedAt: "2026-06-26T20:40:00.000Z",
        }),
      ],
    });
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        draftResults: [
          createGeneratedResultHistoryItem({
            workspace: "content",
            generationKind: "question",
            taskPublicId,
            resultPublicId,
            persistedAt: "2026-06-26T20:41:00.000Z",
          }),
        ],
      });
    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=question&page=1&pageSize=10",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(generatedResultPersistenceRecorder.historyQueries).toEqual([]);
    expect(generatedResultPersistenceRecorder.taskBatchQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "question",
        taskPublicIds: [taskPublicId],
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        latestTask: {
          taskPublicId,
          resultPublicId,
          generatedResult: {
            resultPublicId,
            persistedAt: "2026-06-26T20:41:00.000Z",
            status: "draft",
            contentDigest: "sha256:omitted-from-history-response",
            contentPreviewMasked:
              "redacted generated result summary for content question",
            contentVisibility: "redacted_snapshot",
            evidenceStatus: "none",
            citationCount: 0,
            formalAdoptionStatus: "blocked",
            redactionStatus: "redacted",
          },
        },
        items: [
          {
            taskPublicId,
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for content question",
              formalAdoptionStatus: "blocked",
            },
          },
        ],
      },
    });
    expect(serializedPayload).toContain(
      '"contentDigest":"sha256:omitted-from-history-response"',
    );
    expect(serializedPayload).not.toContain("contentRedactedSnapshot");
    expect(serializedPayload).not.toContain("aiCallLogPublicId");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("returns content admin persisted formal adoption status in generated result history", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_adopted_history";
    const resultPublicId =
      "admin_ai_generation_result_content_question_adopted_history";
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "content",
          generationKind: "question",
          taskPublicId,
          resultPublicId,
          status: "succeeded",
          requestedAt: "2026-06-26T21:10:00.000Z",
        }),
      ],
    });
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        draftResults: [
          createGeneratedResultHistoryItem({
            workspace: "content",
            generationKind: "question",
            taskPublicId,
            resultPublicId,
            persistedAt: "2026-06-26T21:11:00.000Z",
            formalAdoption: {
              isBlocked: true,
              status: "draft_created",
              reviewStatus: "approved_for_formal_adoption",
              formalTargetWriteStatus: "draft_created",
              formalQuestionPublicId: "formal_question_public_adopted",
              formalPaperPublicId: null,
              reviewedAt: "2026-06-26T21:12:00.000Z",
            } as unknown as AdminAiGenerationResultDto["formalAdoption"],
          }),
        ],
      });
    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=question&page=1&pageSize=10",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        latestTask: {
          taskPublicId,
          generatedResult: {
            resultPublicId,
            formalAdoptionStatus: "draft_created",
            formalTargetWriteStatus: "draft_created",
            formalQuestionPublicId: "formal_question_public_adopted",
            formalPaperPublicId: null,
            formalAdoptionReviewedAt: "2026-06-26T21:12:00.000Z",
          },
        },
      },
    });
    expect(serializedPayload).toContain(
      '"contentDigest":"sha256:omitted-from-history-response"',
    );
    expect(serializedPayload).not.toContain("aiCallLogPublicId");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("returns organization advanced admin generated result history scoped to the current organization", async () => {
    const taskPublicId =
      "admin_ai_generation_task_organization_paper_history_789";
    const resultPublicId =
      "admin_ai_generation_result_organization_paper_history_789";
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "organization",
          generationKind: "paper",
          taskPublicId,
          resultPublicId,
          status: "succeeded",
          requestedAt: "2026-06-26T20:50:00.000Z",
        }),
      ],
    });
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        draftResults: [
          createGeneratedResultHistoryItem({
            workspace: "organization",
            generationKind: "paper",
            taskPublicId,
            resultPublicId,
            persistedAt: "2026-06-26T20:51:00.000Z",
          }),
        ],
      });
    const response = await getLocalContractHistory({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      searchParams: "?generationKind=paper&page=1&pageSize=10",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(generatedResultPersistenceRecorder.historyQueries).toEqual([]);
    expect(generatedResultPersistenceRecorder.taskBatchQueries).toEqual([
      {
        workspace: "organization",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        generationKind: "paper",
        taskPublicIds: [taskPublicId],
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        workspace: "organization",
        latestTask: {
          taskPublicId,
          organizationOwnedDraftBoundary: {
            generatedResultScope: "organization_private",
            organizationDraftAdoptionStatus:
              "allowed_as_organization_private_draft",
            organizationTrainingSourceStatus:
              "allowed_as_organization_private_training_source",
            platformFormalDraftStatus: "blocked_requires_content_admin_review",
            publishStatus: "blocked_requires_fresh_publish_task",
            studentVisibleStatus: "blocked",
            ownerType: "organization",
            ownerPublicId: "organization_public_123",
            organizationPublicId: "organization_public_123",
            redactionStatus: "redacted",
          },
          generatedResult: {
            resultPublicId,
            contentPreviewMasked:
              "redacted generated result summary for organization paper",
            contentVisibility: "redacted_snapshot",
            formalAdoptionStatus: "blocked",
            redactionStatus: "redacted",
          },
        },
      },
    });
    expect(serializedPayload).toContain(
      '"contentDigest":"sha256:omitted-from-history-response"',
    );
    expect(serializedPayload).not.toContain("ai_call_log_public_omitted");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it("denies organization standard admin direct GET without listing task history", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await getLocalContractHistory({
      workspace: "organization",
      adminRoles: ["org_standard_admin"],
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
    });
    const payload = await response.json();

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.historyQueries).toEqual([]);
  });
});
