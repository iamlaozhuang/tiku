import { createHash } from "node:crypto";

import { createContentAdminFormalReviewedDraftPayload } from "@/lib/admin-ai-generation-formal-draft-payload";

import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createPaginatedResponse,
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
  type ApiPagination,
} from "../contracts/api-response";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationLocalContractGeneratedResultDto,
  AdminAiGenerationLocalContractBaseDto,
  AdminAiGenerationLocalContractDto,
  AdminAiGenerationLocalContractOrganizationOwnedDraftBoundaryDto,
  AdminAiGenerationLocalContractPaperAssemblyDto,
  AdminAiGenerationLocalContractRuntimeBridgeDto,
  AdminAiGenerationLocalContractTaskPersistenceDto,
  AdminAiGenerationRejectedErrorDto,
  AdminAiGenerationRejectedReason,
  AdminAiGenerationTaskHistoryDto,
  AdminAiGenerationTaskHistoryGeneratedResultDto,
  AdminAiGenerationTaskHistoryItemDto,
  AdminAiGenerationRuntimeBridgeExecutionSummaryDto,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type { RedactedJsonObject } from "../models/ai-rag";
import { createAdminAiGenerationCitationSnapshot } from "../models/admin-ai-generation-citation";

type AdminAiGenerationLocalContractRuntimeBridgeWithLog =
  AdminAiGenerationLocalContractRuntimeBridgeDto & {
    aiCallLogPublicId: string | null;
  };
type AdminAiGenerationLocalContractRuntimeBridgeWithCitation =
  AdminAiGenerationLocalContractRuntimeBridgeWithLog & {
    citationRedactedSnapshot: RedactedJsonObject | null;
  };
import type {
  AdminAiGenerationResultDto,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  CreateAdminAiGenerationResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type {
  AdminAiGenerationRouteIntegratedProviderExecutionControl,
  AdminAiGenerationRuntimeBridgeDto,
  AdminAiGenerationRuntimeBridgeInput,
} from "../contracts/admin-ai-generation-runtime-bridge-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedProfession,
  AiGenerationRouteIntegratedQuestionDraftSummary,
  AiGenerationRouteIntegratedSubject,
} from "../contracts/route-integrated-provider-execution-contract";
import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperSelectedQuestionDto,
} from "../contracts/ai-paper-plan-and-select-contract";
import type {
  OrganizationTrainingAdminPaperSectionDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
} from "../contracts/organization-training-contract";
import {
  normalizeAiGenerationRouteIntegratedKnowledgeScope,
  normalizeAiGenerationRouteIntegratedPaperStructure,
  normalizeAiGenerationRouteIntegratedQuestionTypeDistribution,
} from "../contracts/route-integrated-provider-execution-contract";
import {
  getAiGenerationSharedTaskSpec,
  type AiGenerationSharedTaskType,
} from "../contracts/ai-generation-task-spec-contract";
import {
  resolveAndAssembleAiPaperFromRoute,
  type AiPaperRoutePlanSelectWiringResult,
} from "./ai-paper-route-plan-select-wiring-service";
import type {
  AdminAiGenerationTaskHistoryQuery,
  AdminAiGenerationTaskPersistenceDto,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminRole } from "../models/auth";
import type { AiGenerationTaskFailureCategory } from "../models/ai-generation-task";
import { createPostgresAdminAiGenerationTaskPersistenceRepository } from "../repositories/admin-ai-generation-task-persistence-db-adapter";
import { AdminAiGenerationSnapshotConflictError } from "../repositories/admin-ai-generation-task-persistence-repository";
import { createPostgresAdminAiGenerationResultPersistenceRepository } from "../repositories/admin-ai-generation-result-persistence-db-adapter";
import {
  createPostgresAiGenerationTaskLifecycleRepository,
  type AiGenerationTaskAttemptIdentity,
  type AiGenerationTaskLifecycleRepository,
} from "../repositories/ai-generation-task-lifecycle-repository";
import {
  createPostgresOrganizationTrainingRepository,
  type OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import {
  createPostgresQuestionRepository,
  type AiPaperQuestionSourceRepository,
  type QuestionAccessRow,
} from "../repositories/question-repository";
import { buildAiGenerationTaskRequestPolicyReadModel } from "./ai-generation-task-request-service";
import { parseCurrentAiGenerationQuestionType } from "./ai-generation-question-type-contract";
import {
  buildAdminAiGenerationRuntimeBridgeReadModel,
  buildAdminAiGenerationRuntimeBridgeReadModelForRoute,
} from "./admin-ai-generation-runtime-bridge-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import {
  createRouteIntegratedStructuredPreviewOptionsForGenerationKind,
  isRouteIntegratedVisibleGeneratedContentAcceptableForDraft,
} from "./route-integrated-provider-execution-service";
import type { SessionService } from "./session-service";
import { selectAuthorizationObjectScope } from "./authorization-object-scope";

export type { AdminAiGenerationWorkspace };

export type AdminAiGenerationLocalContractRouteOptions = {
  createRequestPublicId?: (
    input: AdminAiGenerationRequestPublicIdInput,
  ) => string;
  requestClock?: () => Date;
  sessionService?: Pick<SessionService, "getCurrentSession">;
  runtimeBridgeControl?: AdminAiGenerationRuntimeBridgeControl;
  paperAssemblyResolver?: AdminAiGenerationPaperAssemblyResolver;
  questionRepository?: AdminAiGenerationPaperAssemblyQuestionRepository;
  organizationTrainingRepository?: AdminAiGenerationPaperAssemblyOrganizationTrainingRepository;
  resultPersistenceRepository?: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
  lifecycleRepository?: AiGenerationTaskLifecycleRepository;
};

type AdminAiGenerationActor = {
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary;
  publicId: string;
  roles: AdminRole[];
};

type ServiceComputedOrganizationAiGenerationCapability =
  AdminWorkspaceCapabilitySummary & {
    organizationAuthorizationPublicId: string;
    organizationPublicId: string;
    organizationEffectiveEdition: "advanced";
    organizationAuthorizationSource: "org_auth";
    capabilitySource: "service_computed";
    canUseOrganizationAdvancedWorkspace: true;
  };

type AdminAiGenerationRuntimeBridgeControlInput =
  AdminAiGenerationRuntimeBridgeInput;

type AdminAiGenerationRequestPublicIdInput = {
  actorPublicId: string;
  generationKind: AdminAiGenerationKind;
  idempotencyKey: string;
  taskPublicId?: string | null;
  workspace: AdminAiGenerationWorkspace;
};

type AdminAiGenerationProviderDisabledRuntimeBridgeOutcome = {
  blockedReasons?: string[];
  executionSummary?: AdminAiGenerationRuntimeBridgeExecutionSummaryDto;
};

type AdminAiGenerationPaperAssemblyQuestionRepository =
  AiPaperQuestionSourceRepository;

type AdminAiGenerationPaperAssemblyOrganizationTrainingRepository = Pick<
  OrganizationTrainingRepository,
  | "listAdminLifecycleVersions"
  | "listAdminVisibleQuestionSnapshotsForAiPaperSource"
  | "listEmployeeVisibleVersions"
  | "findOrganizationAuthorizationContext"
>;

type OrganizationTrainingPaperDraftDetailSnapshot = {
  paperSections: OrganizationTrainingAdminPaperSectionDetailDto[];
  questions: OrganizationTrainingAdminQuestionDetailDto[];
};

type OrganizationTrainingPaperSourceQuestionDetail = {
  questionPublicId: string;
  sourceKind: AiPaperSelectedQuestionDto["sourceKind"];
  questionType: OrganizationTrainingAdminQuestionDetailDto["questionType"];
  materialTitle: string | null;
  materialContent: string | null;
  materialPublicId: string | null;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  questionGroupQuestionSortOrder: number | null;
  questionGroupQuestionCount: number | null;
  stem: string;
  options: OrganizationTrainingAdminQuestionDetailDto["options"];
  standardAnswer: string | null;
  analysis: string | null;
  evidenceStatus: OrganizationTrainingAdminQuestionDetailDto["evidenceSummary"]["evidenceStatus"];
  citationCount: number;
};

type AdminAiGenerationPaperAssemblyResolverInput = {
  actor: AdminAiGenerationActor;
  generationKind: AdminAiGenerationKind;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  requestPublicId: string;
  resultPublicId: string;
  runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeDto;
  taskRequest: AdminAiGenerationLocalContractBaseDto["taskRequest"];
  workspace: AdminAiGenerationWorkspace;
};

export type AdminAiGenerationPaperAssemblyResolver = (
  input: AdminAiGenerationPaperAssemblyResolverInput,
) =>
  | AiPaperRoutePlanSelectWiringResult
  | Promise<AiPaperRoutePlanSelectWiringResult>;

function createDefaultAdminAiGenerationPaperAssemblyResolver(input: {
  organizationTrainingRepository: AdminAiGenerationPaperAssemblyOrganizationTrainingRepository;
  questionRepository: AdminAiGenerationPaperAssemblyQuestionRepository;
}): AdminAiGenerationPaperAssemblyResolver {
  return (resolverInput) =>
    resolveAndAssembleAiPaperFromRoute({
      role: resolveAdminAiGenerationPaperAssemblyRole(resolverInput.workspace),
      organizationPublicId: resolverInput.taskRequest.organizationPublicId,
      generationParameters: resolverInput.generationParameters,
      visibleGeneratedContent:
        resolverInput.runtimeBridge.visibleGeneratedContent,
      questionRepository: input.questionRepository,
      organizationTrainingRepository: input.organizationTrainingRepository,
    });
}

function resolveAdminAiGenerationPaperAssemblyRole(
  workspace: AdminAiGenerationWorkspace,
) {
  return workspace === "content" ? "content_admin" : "org_advanced_admin";
}

export type AdminAiGenerationRuntimeBridgeControl = {
  bridgeMode?: "controlled_runner";
  explicitLocalSwitchPresent?: true;
  providerExecution?: AdminAiGenerationRouteIntegratedProviderExecutionControl;
  createProviderDisabledOutcome?: (
    input: AdminAiGenerationRuntimeBridgeControlInput,
  ) =>
    | AdminAiGenerationProviderDisabledRuntimeBridgeOutcome
    | Promise<AdminAiGenerationProviderDisabledRuntimeBridgeOutcome>;
};

const ADMIN_AI_GENERATION_PERMISSION_DENIED_CODE = 403011;
const ADMIN_AI_GENERATION_INVALID_INPUT_CODE = 400013;
const ADMIN_AI_GENERATION_UNACCEPTABLE_RESULT_CODE = 409015;
const ADMIN_AI_GENERATION_IDEMPOTENCY_CONFLICT_CODE = 409016;
const ADMIN_AI_GENERATION_HISTORY_UNAVAILABLE_CODE = 409018;
const ADMIN_AI_GENERATION_QUOTA_UNAVAILABLE_CODE = 409019;
const ADMIN_AI_GENERATION_HISTORY_DEFAULT_PAGE = 1;
const ADMIN_AI_GENERATION_HISTORY_DEFAULT_PAGE_SIZE = 10;
const ADMIN_AI_GENERATION_HISTORY_MAX_PAGE_SIZE = 50;
const ADMIN_AI_GENERATION_RESULT_PREVIEW_MASKED = "生成草稿已创建，待评审查看";

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminAiGenerationPermissionDeniedResponse = createErrorResponse(
  ADMIN_AI_GENERATION_PERMISSION_DENIED_CODE,
  "Admin AI generation is not available for this role.",
);
const invalidAdminAiGenerationRequestResponse = createErrorResponse(
  ADMIN_AI_GENERATION_INVALID_INPUT_CODE,
  "Invalid admin AI generation request input.",
);
const adminAiGenerationHistoryUnavailableResponse = createErrorResponse(
  ADMIN_AI_GENERATION_HISTORY_UNAVAILABLE_CODE,
  "AI generation history is unavailable.",
);
const adminAiGenerationQuotaUnavailableResponse = createErrorResponse(
  ADMIN_AI_GENERATION_QUOTA_UNAVAILABLE_CODE,
  "AI generation quota facts are unavailable pending Cost Calibration.",
);

type AdminAiGenerationLocalContractRouteResponseData =
  | AdminAiGenerationLocalContractDto
  | AdminAiGenerationRejectedErrorDto
  | null;

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeGenerationKind(value: unknown): AdminAiGenerationKind | null {
  return value === "question" || value === "paper" ? value : null;
}

function normalizeIdempotencyKey(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(
    normalized,
  )
    ? normalized
    : null;
}

const routeIntegratedProfessionValues = [
  "monopoly",
  "marketing",
  "logistics",
] as const;
const routeIntegratedSubjectValues = ["theory", "skill"] as const;

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length === 0 ? null : normalizedValue;
}

function normalizeRouteIntegratedProfession(
  value: unknown,
): AiGenerationRouteIntegratedProfession | null {
  return typeof value === "string" &&
    routeIntegratedProfessionValues.includes(
      value as AiGenerationRouteIntegratedProfession,
    )
    ? (value as AiGenerationRouteIntegratedProfession)
    : null;
}

function normalizeRouteIntegratedSubject(
  value: unknown,
): AiGenerationRouteIntegratedSubject | null {
  return typeof value === "string" &&
    routeIntegratedSubjectValues.includes(
      value as AiGenerationRouteIntegratedSubject,
    )
    ? (value as AiGenerationRouteIntegratedSubject)
    : null;
}

function normalizeRouteIntegratedLevel(
  value: unknown,
): AiGenerationRouteIntegratedGenerationParameters["level"] | null {
  const parsedLevel =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  return parsedLevel === 1 ||
    parsedLevel === 2 ||
    parsedLevel === 3 ||
    parsedLevel === 4 ||
    parsedLevel === 5
    ? parsedLevel
    : null;
}

function normalizeRouteIntegratedQuestionCount(
  value: unknown,
  taskType: AiGenerationSharedTaskType,
): number | null {
  const parsedCount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;
  const maxQuestionCount =
    getAiGenerationSharedTaskSpec(taskType).maxQuestionCount;

  return parsedCount !== null &&
    Number.isInteger(parsedCount) &&
    parsedCount > 0 &&
    parsedCount <= maxQuestionCount
    ? parsedCount
    : null;
}

function normalizeRouteIntegratedGenerationParameters(
  value: unknown,
  taskType: AiGenerationSharedTaskType,
): AiGenerationRouteIntegratedGenerationParameters | null {
  if (!isRecord(value)) {
    return null;
  }

  const profession = normalizeRouteIntegratedProfession(value.profession);
  const level = normalizeRouteIntegratedLevel(value.level);
  const subject = normalizeRouteIntegratedSubject(value.subject);
  const questionCount = normalizeRouteIntegratedQuestionCount(
    value.questionCount,
    taskType,
  );
  const knowledgeScope = normalizeAiGenerationRouteIntegratedKnowledgeScope({
    includeDescendants: value.includeDescendants,
    knowledgeNode: value.knowledgeNode,
    knowledgeNodeMode: value.knowledgeNodeMode,
    knowledgeNodePublicIds: value.knowledgeNodePublicIds,
    knowledgeNodeSupplement: value.knowledgeNodeSupplement,
    sourcePreference: value.sourcePreference,
  });
  const questionTypeDistribution =
    normalizeAiGenerationRouteIntegratedQuestionTypeDistribution(
      value.questionTypeDistribution,
    );
  const paperStructure = normalizeAiGenerationRouteIntegratedPaperStructure(
    value.paperStructure,
  );
  const questionType =
    value.questionType === null
      ? null
      : parseCurrentAiGenerationQuestionType(value.questionType);

  if (
    profession === null ||
    level === null ||
    subject === null ||
    questionCount === null ||
    knowledgeScope === null ||
    (value.questionType !== null && questionType === null) ||
    questionTypeDistribution === "invalid" ||
    paperStructure === "invalid"
  ) {
    return null;
  }

  return {
    profession,
    level,
    subject,
    ...knowledgeScope,
    questionType,
    questionCount,
    difficulty: normalizeOptionalText(value.difficulty),
    learningObjective: normalizeOptionalText(value.learningObjective),
    questionTypeDistribution:
      taskType === "ai_paper_generation"
        ? (questionTypeDistribution ?? "weak_point_priority")
        : null,
    paperStructure:
      taskType === "ai_paper_generation"
        ? (paperStructure ?? "by_question_type")
        : null,
  };
}

function normalizePositiveInteger(
  value: string | null,
  fallbackValue: number,
): number {
  if (value === null || !/^\d+$/.test(value)) {
    return fallbackValue;
  }

  const parsedValue = Number(value);

  return parsedValue > 0 ? parsedValue : fallbackValue;
}

function normalizeAdminAiGenerationHistoryQueryInput(request: Request): {
  generationKind: AdminAiGenerationKind | null;
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
} {
  const searchParams = new URL(request.url).searchParams;
  const generationKindInput = searchParams.get("generationKind");
  const generationKind =
    generationKindInput === null
      ? "question"
      : normalizeGenerationKind(generationKindInput);
  const page = normalizePositiveInteger(
    searchParams.get("page"),
    ADMIN_AI_GENERATION_HISTORY_DEFAULT_PAGE,
  );
  const requestedPageSize = normalizePositiveInteger(
    searchParams.get("pageSize"),
    ADMIN_AI_GENERATION_HISTORY_DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(
    requestedPageSize,
    ADMIN_AI_GENERATION_HISTORY_MAX_PAGE_SIZE,
  );

  return {
    generationKind,
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

function hasRole(actor: AdminAiGenerationActor, role: AdminRole): boolean {
  return actor.roles.includes(role);
}

function resolveServiceComputedOrganizationAiGenerationCapability(
  actor: AdminAiGenerationActor,
): ServiceComputedOrganizationAiGenerationCapability | null {
  const capabilitySummary = actor.adminWorkspaceCapability;
  const organizationAuthorizationPublicId = normalizeOptionalText(
    capabilitySummary?.organizationAuthorizationPublicId,
  );

  if (
    capabilitySummary === undefined ||
    capabilitySummary.capabilitySource !== "service_computed" ||
    capabilitySummary.organizationAuthorizationSource !== "org_auth" ||
    organizationAuthorizationPublicId === null ||
    capabilitySummary.organizationPublicId === null ||
    capabilitySummary.organizationEffectiveEdition !== "advanced" ||
    capabilitySummary.canUseOrganizationAdvancedWorkspace !== true
  ) {
    return null;
  }

  return {
    ...capabilitySummary,
    organizationAuthorizationPublicId,
  } as ServiceComputedOrganizationAiGenerationCapability;
}

function canUseOrganizationAdminAiGeneration(
  actor: AdminAiGenerationActor,
): boolean {
  return (
    (hasRole(actor, "org_advanced_admin") || hasRole(actor, "super_admin")) &&
    resolveServiceComputedOrganizationAiGenerationCapability(actor) !== null
  );
}

function canUseAdminAiGeneration(
  workspace: AdminAiGenerationWorkspace,
  actor: AdminAiGenerationActor,
): boolean {
  if (workspace === "content") {
    return hasRole(actor, "super_admin") || hasRole(actor, "content_admin");
  }

  return canUseOrganizationAdminAiGeneration(actor);
}

function resolveTaskType(
  generationKind: AdminAiGenerationKind,
): AiGenerationSharedTaskType {
  return generationKind === "question"
    ? "ai_question_generation"
    : "ai_paper_generation";
}

function createTaskPublicId(input: {
  actorPublicId: string;
  generationKind: AdminAiGenerationKind;
  requestScopeIdentity: string;
  workspace: AdminAiGenerationWorkspace;
}): string {
  return [
    "admin_ai_generation_task",
    input.workspace,
    input.generationKind,
    input.actorPublicId,
    createPublicIdScopeSegment(input.requestScopeIdentity),
  ].join("_");
}

function createPublicIdScopeSegment(publicId: string): string {
  return createHash("sha256").update(publicId).digest("hex").slice(0, 16);
}

function createDefaultRequestPublicId(
  input: AdminAiGenerationRequestPublicIdInput,
): string {
  return [
    "admin_ai_generation_request",
    input.workspace,
    input.generationKind,
    input.actorPublicId,
    input.idempotencyKey.replaceAll("-", ""),
  ].join("_");
}

function createAdminAiGenerationPolicyInput(input: {
  actor: AdminAiGenerationActor;
  generationKind: AdminAiGenerationKind;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  idempotencyKey: string;
  organizationAuthorizationContext?: EffectiveAuthorizationContextDto;
  requestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
}) {
  const taskType = resolveTaskType(input.generationKind);
  const authorizationPublicId =
    input.workspace === "content"
      ? "admin_role_content_ai_generation"
      : (input.organizationAuthorizationContext?.authorizationPublicId ?? null);
  const requestScopeIdentity = JSON.stringify([
    input.requestPublicId,
    authorizationPublicId,
    input.generationParameters?.profession ?? null,
    input.generationParameters?.level ?? null,
  ]);
  const taskPublicId = createTaskPublicId({
    actorPublicId: input.actor.publicId,
    generationKind: input.generationKind,
    requestScopeIdentity,
    workspace: input.workspace,
  });
  const idempotencyScopeDigest = createHash("sha256")
    .update(
      JSON.stringify([
        input.workspace,
        input.actor.publicId,
        input.idempotencyKey,
      ]),
    )
    .digest("hex");

  if (input.workspace === "content") {
    return {
      taskPublicId,
      taskType,
      actorPublicId: input.actor.publicId,
      authorizationSource: "admin_role",
      authorizationPublicId,
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
      quotaOwnerType: "platform",
      quotaOwnerPublicId: "platform_content_review_pool",
      effectiveEdition: "advanced",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: false,
      isRuntimeConfigReady: true,
      idempotencyKeyHash: `sha256:admin_${idempotencyScopeDigest}`,
      existingTaskPublicId: null,
      existingTaskStatus: null,
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      auditLogPublicId: null,
      aiCallLogPublicId: null,
    };
  }

  const organizationCapability =
    resolveServiceComputedOrganizationAiGenerationCapability(input.actor);
  const organizationAuthorizationContext =
    input.organizationAuthorizationContext;

  if (
    organizationCapability === null ||
    organizationAuthorizationContext === undefined
  ) {
    return null;
  }

  return {
    taskPublicId,
    taskType,
    actorPublicId: input.actor.publicId,
    authorizationSource: "org_auth",
    authorizationPublicId:
      organizationAuthorizationContext.authorizationPublicId,
    ownerType: "organization",
    ownerPublicId: organizationAuthorizationContext.ownerPublicId,
    organizationPublicId: organizationAuthorizationContext.organizationPublicId,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: organizationAuthorizationContext.quotaOwnerPublicId,
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: false,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: `sha256:admin_${idempotencyScopeDigest}`,
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
  };
}

async function resolveOrganizationAiGenerationAuthorizationContext(input: {
  actor: AdminAiGenerationActor;
  generationKind: AdminAiGenerationKind;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  now: Date;
  organizationTrainingRepository: AdminAiGenerationPaperAssemblyOrganizationTrainingRepository;
}): Promise<EffectiveAuthorizationContextDto | null> {
  const capability = resolveServiceComputedOrganizationAiGenerationCapability(
    input.actor,
  );
  const findAuthorizationContext =
    input.organizationTrainingRepository.findOrganizationAuthorizationContext;

  if (capability === null || typeof findAuthorizationContext !== "function") {
    return null;
  }

  const authorizationContext = await findAuthorizationContext({
    authorizationPublicId: capability.organizationAuthorizationPublicId,
    organizationPublicId: capability.organizationPublicId,
    now: input.now,
  });

  if (authorizationContext === null) {
    return null;
  }

  return selectAuthorizationObjectScope([authorizationContext], {
    authorizationPublicId: capability.organizationAuthorizationPublicId,
    authorizationSource: "org_auth",
    ownerType: "organization",
    ownerPublicId: capability.organizationPublicId,
    organizationPublicId: capability.organizationPublicId,
    profession: input.generationParameters.profession,
    level: input.generationParameters.level,
    requiredCapability:
      input.generationKind === "question"
        ? "canGenerateAiQuestion"
        : "canGenerateAiPaper",
    allowedBlockedReasons: [],
  });
}

function resolveAdminAiGenerationTaskHistoryQuery(input: {
  actor: AdminAiGenerationActor;
  historyQueryInput: {
    generationKind: AdminAiGenerationKind;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  };
  workspace: AdminAiGenerationWorkspace;
}): AdminAiGenerationTaskHistoryQuery | null {
  const historyQueryInput = input.historyQueryInput;

  if (input.workspace === "content") {
    return {
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      ...historyQueryInput,
    };
  }

  const organizationCapability =
    resolveServiceComputedOrganizationAiGenerationCapability(input.actor);

  if (organizationCapability === null) {
    return null;
  }

  return {
    workspace: "organization",
    ownerType: "organization",
    ownerPublicId: organizationCapability.organizationPublicId,
    ...historyQueryInput,
  };
}

function createDefaultAdminAiGenerationRuntimeBridge(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationLocalContractRuntimeBridgeWithCitation {
  const runtimeBridge = buildAdminAiGenerationRuntimeBridgeReadModel(input);

  return {
    ...mapAdminAiGenerationRuntimeBridgeReadModelToLocalContract(runtimeBridge),
    citationRedactedSnapshot: null,
  };
}

function mapAdminAiGenerationRuntimeBridgeReadModelToLocalContract(
  runtimeBridge: AdminAiGenerationRuntimeBridgeDto,
): AdminAiGenerationLocalContractRuntimeBridgeWithLog {
  return {
    bridgeStatus: runtimeBridge.bridgeStatus,
    providerCallExecuted: runtimeBridge.providerCallExecuted,
    envSecretAccessed: runtimeBridge.envSecretAccessed,
    providerConfigurationRead: runtimeBridge.providerConfigurationRead,
    costCalibrationExecuted: runtimeBridge.costCalibrationExecuted,
    executionSummary: {
      ...runtimeBridge.providerExecutionSummary,
      failureCategory:
        runtimeBridge.providerExecutionSummary.failureCategory ===
        "governance_context_unavailable"
          ? "provider_call_blocked"
          : runtimeBridge.providerExecutionSummary.failureCategory ===
              "ai_call_log_unavailable"
            ? "provider_error"
            : runtimeBridge.providerExecutionSummary.failureCategory,
    },
    aiCallLogPublicId: runtimeBridge.aiCallLogPublicId,
    visibleGeneratedContent: runtimeBridge.visibleGeneratedContent,
    redactionStatus: runtimeBridge.redactionStatus,
    blockedReasons: runtimeBridge.blockedReasons,
  };
}

function createPublicAdminAiGenerationRuntimeBridge(
  runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeWithCitation,
): AdminAiGenerationLocalContractRuntimeBridgeWithLog {
  return {
    bridgeStatus: runtimeBridge.bridgeStatus,
    providerCallExecuted: runtimeBridge.providerCallExecuted,
    envSecretAccessed: runtimeBridge.envSecretAccessed,
    providerConfigurationRead: runtimeBridge.providerConfigurationRead,
    costCalibrationExecuted: runtimeBridge.costCalibrationExecuted,
    executionSummary: runtimeBridge.executionSummary,
    aiCallLogPublicId: runtimeBridge.aiCallLogPublicId,
    visibleGeneratedContent: runtimeBridge.visibleGeneratedContent,
    redactionStatus: runtimeBridge.redactionStatus,
    blockedReasons: runtimeBridge.blockedReasons,
  };
}

function ensureProviderDisabledExecutionSummary(
  executionSummary:
    | AdminAiGenerationRuntimeBridgeExecutionSummaryDto
    | undefined,
  defaultSummary: AdminAiGenerationRuntimeBridgeExecutionSummaryDto,
): AdminAiGenerationRuntimeBridgeExecutionSummaryDto {
  if (!executionSummary) {
    return defaultSummary;
  }

  const isProviderDisabled =
    executionSummary.requestCount === 0 &&
    executionSummary.resultStatus === "blocked" &&
    executionSummary.failureCategory === "provider_call_blocked" &&
    executionSummary.redactionStatus === "redacted";

  return isProviderDisabled ? executionSummary : defaultSummary;
}

function resolveAdminAiGenerationRejectedReason(
  runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeDto,
): AdminAiGenerationRejectedReason {
  const failureCategory = runtimeBridge.executionSummary.failureCategory;

  if (failureCategory === "provider_call_blocked") {
    return "provider_execution_unavailable";
  }

  if (failureCategory === "missing_provider_credential") {
    return "provider_credential_unavailable";
  }

  if (failureCategory === "insufficient_grounding_evidence") {
    return "grounding_evidence_insufficient";
  }

  if (
    failureCategory === "provider_error" ||
    failureCategory === "timeout" ||
    failureCategory === "redaction_violation"
  ) {
    return "provider_execution_failed";
  }

  return "generated_output_unacceptable";
}

function createUnacceptableAdminAiGenerationResultResponse(
  runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeDto,
): ApiResponse<AdminAiGenerationRejectedErrorDto> {
  return {
    code: ADMIN_AI_GENERATION_UNACCEPTABLE_RESULT_CODE,
    message:
      "Admin AI generation requires sufficient grounded structured output.",
    data: {
      rejectionReason: resolveAdminAiGenerationRejectedReason(runtimeBridge),
      runtimeBridgeStatus: runtimeBridge.bridgeStatus,
      providerCallExecuted: runtimeBridge.providerCallExecuted,
      envSecretAccessed: runtimeBridge.envSecretAccessed,
      providerConfigurationRead: runtimeBridge.providerConfigurationRead,
      costCalibrationExecuted: runtimeBridge.costCalibrationExecuted,
      redactionStatus: "redacted",
    },
  };
}

async function resolveAdminAiGenerationRuntimeBridge(input: {
  runtimeBridgeControl: AdminAiGenerationRuntimeBridgeControl | undefined;
  runtimeBridgeInput: AdminAiGenerationRuntimeBridgeInput;
  attempt: AiGenerationTaskAttemptIdentity;
}): Promise<AdminAiGenerationLocalContractRuntimeBridgeWithCitation> {
  if (
    input.runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    input.runtimeBridgeControl.explicitLocalSwitchPresent === true &&
    input.runtimeBridgeControl.providerExecution !== undefined
  ) {
    const providerExecution = input.runtimeBridgeControl.providerExecution;
    const resolveGroundingContext = providerExecution.resolveGroundingContext;
    let citationRedactedSnapshot: RedactedJsonObject | null = null;
    const runtimeBridge =
      await buildAdminAiGenerationRuntimeBridgeReadModelForRoute(
        input.runtimeBridgeInput,
        {
          runtimeBridgeControl: {
            bridgeMode: "controlled_runner",
            explicitLocalSwitchPresent: true,
            providerExecution: {
              ...providerExecution,
              attempt: input.attempt,
              ...(resolveGroundingContext === undefined
                ? {}
                : {
                    resolveGroundingContext: async (requestContextInput) => {
                      const groundingContext =
                        await resolveGroundingContext(requestContextInput);
                      citationRedactedSnapshot =
                        groundingContext.evidenceStatus === "sufficient"
                          ? createAdminAiGenerationCitationSnapshot(
                              groundingContext,
                            )
                          : null;
                      return groundingContext;
                    },
                  }),
            },
          },
        },
      );
    return {
      ...mapAdminAiGenerationRuntimeBridgeReadModelToLocalContract(
        runtimeBridge,
      ),
      citationRedactedSnapshot,
    };
  }

  const defaultRuntimeBridge = createDefaultAdminAiGenerationRuntimeBridge(
    input.runtimeBridgeInput,
  );
  const providerDisabledOutcome =
    await input.runtimeBridgeControl?.createProviderDisabledOutcome?.(
      input.runtimeBridgeInput,
    );

  if (!providerDisabledOutcome) {
    return defaultRuntimeBridge;
  }

  return {
    ...defaultRuntimeBridge,
    executionSummary: ensureProviderDisabledExecutionSummary(
      providerDisabledOutcome.executionSummary,
      defaultRuntimeBridge.executionSummary,
    ),
    blockedReasons:
      providerDisabledOutcome.blockedReasons ??
      defaultRuntimeBridge.blockedReasons,
  };
}

function createAdminAiGenerationRuntimeBridgeInput(input: {
  actor: AdminAiGenerationActor;
  generationKind: AdminAiGenerationKind;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  requestPublicId: string;
  resultPublicId: string;
  taskRequest: AdminAiGenerationLocalContractBaseDto["taskRequest"];
  workspace: AdminAiGenerationWorkspace;
}): AdminAiGenerationRuntimeBridgeInput {
  return {
    actorPublicId: input.actor.publicId,
    workspace: input.workspace,
    generationKind: input.generationKind,
    requestPublicId: input.requestPublicId,
    taskPublicId: input.taskRequest.taskPublicId,
    resultPublicId: input.resultPublicId,
    ownerType:
      input.taskRequest.ownerType === "organization"
        ? "organization"
        : "platform",
    ownerPublicId: input.taskRequest.ownerPublicId,
    organizationPublicId: input.taskRequest.organizationPublicId,
    generationParameters: input.generationParameters,
  };
}

function createAdminAiGenerationOrganizationOwnedDraftBoundary(input: {
  workspace: AdminAiGenerationWorkspace;
  ownerPublicId: string;
  organizationPublicId: string | null;
}): AdminAiGenerationLocalContractOrganizationOwnedDraftBoundaryDto {
  const isOrganizationOwned =
    input.workspace === "organization" && input.organizationPublicId !== null;

  return {
    generatedResultScope: isOrganizationOwned
      ? "organization_private"
      : "platform_review_pool",
    organizationDraftAdoptionStatus: isOrganizationOwned
      ? "allowed_as_organization_private_draft"
      : "not_applicable_to_content_workspace",
    organizationTrainingSourceStatus: isOrganizationOwned
      ? "allowed_as_organization_private_training_source"
      : "not_applicable_to_content_workspace",
    platformFormalDraftStatus: "blocked_requires_content_admin_review",
    publishStatus: "blocked_requires_fresh_publish_task",
    studentVisibleStatus: "blocked",
    ownerType: isOrganizationOwned ? "organization" : "platform",
    ownerPublicId: input.ownerPublicId,
    organizationPublicId: input.organizationPublicId,
    redactionStatus: "redacted",
  };
}

async function buildAdminAiGenerationLocalContract(input: {
  actor: AdminAiGenerationActor;
  createRequestPublicId: (
    requestPublicIdInput: AdminAiGenerationRequestPublicIdInput,
  ) => string;
  generationKind: AdminAiGenerationKind;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  idempotencyKey: string;
  organizationTrainingRepository: AdminAiGenerationPaperAssemblyOrganizationTrainingRepository;
  organizationAuthorizationContext?: EffectiveAuthorizationContextDto;
  questionRepository: AdminAiGenerationPaperAssemblyQuestionRepository;
  requestClock: () => Date;
  runtimeBridgeControl: AdminAiGenerationRuntimeBridgeControl | undefined;
  paperAssemblyResolver: AdminAiGenerationPaperAssemblyResolver | undefined;
  taskPersistenceRepository: AdminAiGenerationTaskPersistenceRepository;
  resultPersistenceRepository: AdminAiGenerationResultPersistenceRepository;
  lifecycleRepository: AiGenerationTaskLifecycleRepository;
  workspace: AdminAiGenerationWorkspace;
}): Promise<ApiResponse<AdminAiGenerationLocalContractRouteResponseData>> {
  const requestedAt = input.requestClock();
  const requestPublicId = input.createRequestPublicId({
    actorPublicId: input.actor.publicId,
    generationKind: input.generationKind,
    idempotencyKey: input.idempotencyKey,
    taskPublicId: null,
    workspace: input.workspace,
  });
  const taskPolicyInput = createAdminAiGenerationPolicyInput({
    ...input,
    requestPublicId,
  });

  if (taskPolicyInput === null) {
    return invalidAdminAiGenerationRequestResponse;
  }

  const taskRequestResponse =
    buildAiGenerationTaskRequestPolicyReadModel(taskPolicyInput);

  if (taskRequestResponse.code !== 0 || taskRequestResponse.data === null) {
    return invalidAdminAiGenerationRequestResponse;
  }

  const taskRequest = taskRequestResponse.data;

  if (
    taskRequest.decision === "reject_request" &&
    taskRequest.blockedFailureCategory === "quota_insufficient"
  ) {
    return adminAiGenerationQuotaUnavailableResponse;
  }

  const resultPublicId = createAdminAiGenerationResultPublicId(
    taskRequest.taskPublicId,
  );
  const runtimeBridgeInput = createAdminAiGenerationRuntimeBridgeInput({
    actor: input.actor,
    generationKind: input.generationKind,
    generationParameters: input.generationParameters,
    requestPublicId,
    resultPublicId,
    taskRequest,
    workspace: input.workspace,
  });
  const claimLocalContract = {
    runtimeStatus: "local_contract_only",
    workspace: input.workspace,
    generationKind: input.generationKind,
    flowStatus: "accepted",
    redactionStatus: "redacted",
    taskRequest,
    resultState: {
      status: taskRequest.initialStatus ?? "pending",
      taskPublicId: taskRequest.taskPublicId,
      resultPublicId: null,
      contentVisibility: "summary_only",
      evidenceStatus: "none",
      citationCount: 0,
      redactionStatus: "redacted",
    },
    runtimeBridge:
      createDefaultAdminAiGenerationRuntimeBridge(runtimeBridgeInput),
    formalContentBoundary: {
      questionWriteStatus: "blocked_without_follow_up_task",
      paperWriteStatus: "blocked_without_follow_up_task",
    },
    organizationOwnedDraftBoundary:
      createAdminAiGenerationOrganizationOwnedDraftBoundary({
        workspace: input.workspace,
        ownerPublicId: taskRequest.ownerPublicId,
        organizationPublicId: taskRequest.organizationPublicId,
      }),
    paperAssembly: null,
  } satisfies AdminAiGenerationLocalContractBaseDto;
  let taskPersistence: AdminAiGenerationTaskPersistenceResult;

  try {
    taskPersistence = await input.taskPersistenceRepository.createOrReuseTask({
      localContract: claimLocalContract,
      generationParameters: input.generationParameters,
      requestPublicId,
      requestedAt,
    });
  } catch (error) {
    if (error instanceof AdminAiGenerationSnapshotConflictError) {
      return createErrorResponse(
        ADMIN_AI_GENERATION_IDEMPOTENCY_CONFLICT_CODE,
        "Admin AI generation idempotency input conflicts with the existing task.",
      );
    }

    throw error;
  }

  const claimResult = await input.lifecycleRepository.claimTask({
    taskPublicId: taskPersistence.task.taskPublicId,
    ownerType: taskPersistence.task.ownerType,
    ownerPublicId: taskPersistence.task.ownerPublicId,
    organizationPublicId: taskPersistence.task.organizationPublicId,
    taskTypes: [taskPersistence.task.taskType],
    claimedAt: requestedAt,
  });

  if (claimResult.disposition !== "claimed" || claimResult.attempt === null) {
    return createReusedAdminAiGenerationLocalContractResponse({
      localContract: claimLocalContract,
      resultPersistenceRepository: input.resultPersistenceRepository,
      taskPersistence,
    });
  }
  const attempt = claimResult.attempt;

  let runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeWithCitation;

  try {
    runtimeBridge = await resolveAdminAiGenerationRuntimeBridge({
      runtimeBridgeControl: input.runtimeBridgeControl,
      runtimeBridgeInput,
      attempt,
    });
  } catch {
    await input.lifecycleRepository.failTask({
      taskPublicId: taskPersistence.task.taskPublicId,
      ownerType: taskPersistence.task.ownerType,
      ownerPublicId: taskPersistence.task.ownerPublicId,
      organizationPublicId: taskPersistence.task.organizationPublicId,
      taskTypes: [taskPersistence.task.taskType],
      attempt,
      failureCategory: "system_error",
      aiCallLogPublicId: null,
      finishedAt: input.requestClock(),
    });
    throw new Error("admin AI generation Provider execution unavailable");
  }
  const expectedStructuredPreviewKind =
    createRouteIntegratedStructuredPreviewOptionsForGenerationKind(
      input.generationKind,
      {
        generationParameters: input.generationParameters,
      },
    ).kind;

  if (
    !isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
      runtimeBridge.visibleGeneratedContent,
      expectedStructuredPreviewKind,
    )
  ) {
    await input.lifecycleRepository.failTask({
      taskPublicId: taskPersistence.task.taskPublicId,
      ownerType: taskPersistence.task.ownerType,
      ownerPublicId: taskPersistence.task.ownerPublicId,
      organizationPublicId: taskPersistence.task.organizationPublicId,
      taskTypes: [taskPersistence.task.taskType],
      attempt,
      failureCategory: resolveAdminAiGenerationLifecycleFailureCategory(
        runtimeBridge.executionSummary.failureCategory,
      ),
      aiCallLogPublicId: runtimeBridge.aiCallLogPublicId,
      finishedAt: input.requestClock(),
    });
    return createUnacceptableAdminAiGenerationResultResponse(runtimeBridge);
  }

  let paperAssemblyResult: AdminAiGenerationPaperAssemblyResolveResult;

  try {
    paperAssemblyResult = await resolveAdminAiGenerationPaperAssembly({
      actor: input.actor,
      generationKind: input.generationKind,
      generationParameters: input.generationParameters,
      paperAssemblyResolver: input.paperAssemblyResolver,
      requestPublicId,
      resultPublicId,
      runtimeBridge,
      taskRequest,
      workspace: input.workspace,
    });
  } catch {
    await input.lifecycleRepository.failTask({
      taskPublicId: taskPersistence.task.taskPublicId,
      ownerType: taskPersistence.task.ownerType,
      ownerPublicId: taskPersistence.task.ownerPublicId,
      organizationPublicId: taskPersistence.task.organizationPublicId,
      taskTypes: [taskPersistence.task.taskType],
      attempt,
      failureCategory: "system_error",
      aiCallLogPublicId: runtimeBridge.aiCallLogPublicId,
      finishedAt: input.requestClock(),
    });
    throw new Error("admin AI generation paper assembly unavailable");
  }

  if (paperAssemblyResult.status === "rejected") {
    await input.lifecycleRepository.failTask({
      taskPublicId: taskPersistence.task.taskPublicId,
      ownerType: taskPersistence.task.ownerType,
      ownerPublicId: taskPersistence.task.ownerPublicId,
      organizationPublicId: taskPersistence.task.organizationPublicId,
      taskTypes: [taskPersistence.task.taskType],
      attempt,
      failureCategory: "system_error",
      aiCallLogPublicId: runtimeBridge.aiCallLogPublicId,
      finishedAt: input.requestClock(),
    });
    return createUnacceptableAdminAiGenerationResultResponse(runtimeBridge);
  }

  const publicRuntimeBridge =
    createPublicAdminAiGenerationRuntimeBridge(runtimeBridge);
  const localContract = {
    runtimeStatus: "local_contract_only",
    workspace: input.workspace,
    generationKind: input.generationKind,
    flowStatus: "accepted",
    redactionStatus: "redacted",
    taskRequest,
    resultState: {
      status: taskRequest.initialStatus ?? "pending",
      taskPublicId: taskRequest.taskPublicId,
      resultPublicId: taskRequest.resultReference.resultPublicId,
      contentVisibility: taskRequest.resultReference.contentVisibility,
      evidenceStatus: taskRequest.resultReference.evidenceStatus,
      citationCount: taskRequest.resultReference.citationCount,
      redactionStatus: "redacted",
    },
    runtimeBridge: publicRuntimeBridge,
    formalContentBoundary: {
      questionWriteStatus: "blocked_without_follow_up_task",
      paperWriteStatus: "blocked_without_follow_up_task",
    },
    organizationOwnedDraftBoundary:
      createAdminAiGenerationOrganizationOwnedDraftBoundary({
        workspace: input.workspace,
        ownerPublicId: taskRequest.ownerPublicId,
        organizationPublicId: taskRequest.organizationPublicId,
      }),
    paperAssembly: paperAssemblyResult.paperAssembly,
  } satisfies AdminAiGenerationLocalContractBaseDto;

  let generatedResult: AdminAiGenerationResultPersistenceResult;

  try {
    const organizationTrainingPaperDraftDetail =
      await resolveOrganizationTrainingPaperDraftDetailSnapshot({
        localContractSummary: localContract,
        organizationTrainingRepository: input.organizationTrainingRepository,
        questionRepository: input.questionRepository,
      });
    generatedResult =
      await input.resultPersistenceRepository.createOrReuseDraftResult(
        createAdminAiGenerationLocalContractResultInput({
          attempt,
          localContract,
          taskPersistence,
          createdAt: requestedAt,
          generationParameters: input.generationParameters,
          citationRedactedSnapshot:
            input.workspace === "content"
              ? runtimeBridge.citationRedactedSnapshot
              : null,
          organizationTrainingPaperDraftDetail,
        }),
      );
  } catch {
    await input.lifecycleRepository.failTask({
      taskPublicId: taskPersistence.task.taskPublicId,
      ownerType: taskPersistence.task.ownerType,
      ownerPublicId: taskPersistence.task.ownerPublicId,
      organizationPublicId: taskPersistence.task.organizationPublicId,
      taskTypes: [taskPersistence.task.taskType],
      attempt,
      failureCategory: "system_error",
      aiCallLogPublicId: runtimeBridge.aiCallLogPublicId,
      finishedAt: input.requestClock(),
    });
    throw new Error("admin AI generation result persistence unavailable");
  }

  return createSuccessResponse({
    ...createAdminAiGenerationResolvedLocalContract({
      generatedResult,
      localContract,
    }),
    taskPersistence:
      mapAdminAiGenerationTaskPersistenceResultToLocalContractDto({
        generatedResult,
        taskPersistence,
      }),
    generatedResult:
      mapAdminAiGenerationResultPersistenceResultToLocalContractDto(
        generatedResult,
      ),
  });
}

function resolveAdminAiGenerationLifecycleFailureCategory(
  failureCategory: string | null,
): AiGenerationTaskFailureCategory {
  if (failureCategory === "timeout") {
    return "network_error";
  }

  if (failureCategory === "provider_error") {
    return "provider_temporary_error";
  }

  if (failureCategory === "missing_provider_credential") {
    return "configuration_missing";
  }

  if (failureCategory === "insufficient_grounding_evidence") {
    return "rag_temporary_error";
  }

  if (failureCategory === "provider_call_blocked") {
    return "production_enablement_blocked";
  }

  return "system_error";
}

type AdminAiGenerationPaperAssemblyResolveResult =
  | {
      status: "resolved" | "not_applicable";
      paperAssembly: AdminAiGenerationLocalContractPaperAssemblyDto;
    }
  | {
      status: "rejected";
      paperAssembly: null;
    };

async function resolveAdminAiGenerationPaperAssembly(input: {
  actor: AdminAiGenerationActor;
  generationKind: AdminAiGenerationKind;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  paperAssemblyResolver: AdminAiGenerationPaperAssemblyResolver | undefined;
  requestPublicId: string;
  resultPublicId: string;
  runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeDto;
  taskRequest: AdminAiGenerationLocalContractBaseDto["taskRequest"];
  workspace: AdminAiGenerationWorkspace;
}): Promise<AdminAiGenerationPaperAssemblyResolveResult> {
  if (
    input.generationKind !== "paper" ||
    input.generationParameters === null ||
    input.paperAssemblyResolver === undefined
  ) {
    return {
      status: "not_applicable",
      paperAssembly: null,
    };
  }

  const result = await input.paperAssemblyResolver({
    actor: input.actor,
    generationKind: input.generationKind,
    generationParameters: input.generationParameters,
    requestPublicId: input.requestPublicId,
    resultPublicId: input.resultPublicId,
    runtimeBridge: input.runtimeBridge,
    taskRequest: input.taskRequest,
    workspace: input.workspace,
  });

  if (result.status === "rejected") {
    return {
      status: "rejected",
      paperAssembly: null,
    };
  }

  return {
    status: "resolved",
    paperAssembly: {
      status: result.status,
      sourceDiagnostics: result.sourceDiagnostics,
      container: result.assembly.container,
      insufficiency: result.assembly.insufficiency,
      redactionStatus: "redacted",
    },
  };
}

async function createReusedAdminAiGenerationLocalContractResponse(input: {
  localContract: AdminAiGenerationLocalContractBaseDto;
  resultPersistenceRepository: AdminAiGenerationResultPersistenceRepository;
  taskPersistence: AdminAiGenerationTaskPersistenceResult;
}): Promise<ApiResponse<AdminAiGenerationLocalContractDto>> {
  const task = input.taskPersistence.task;
  if (task.ownerType === "personal") {
    throw new Error("invalid admin AI generation task owner boundary.");
  }
  const existingResult =
    await input.resultPersistenceRepository.findDraftResultByTaskPublicId({
      workspace: task.workspace,
      ownerType: task.ownerType,
      ownerPublicId: task.ownerPublicId,
      taskPublicId: task.taskPublicId,
    });
  const generatedResult: AdminAiGenerationResultPersistenceResult | null =
    existingResult === null
      ? null
      : {
          persistenceStatus: "reused",
          result: existingResult,
        };
  const localContract =
    generatedResult === null
      ? {
          ...input.localContract,
          resultState: {
            ...input.localContract.resultState,
            status: task.status,
            taskPublicId: task.taskPublicId,
            resultPublicId: task.resultPublicId,
            evidenceStatus: task.evidenceStatus,
            citationCount: task.citationCount,
          },
        }
      : createAdminAiGenerationResolvedLocalContract({
          generatedResult,
          localContract: input.localContract,
        });

  return createSuccessResponse({
    ...localContract,
    taskPersistence:
      mapAdminAiGenerationTaskPersistenceResultToLocalContractDto({
        generatedResult,
        taskPersistence: input.taskPersistence,
      }),
    generatedResult:
      generatedResult === null
        ? null
        : mapAdminAiGenerationResultPersistenceResultToLocalContractDto(
            generatedResult,
          ),
  });
}

function mapAdminAiGenerationTaskPersistenceResultToLocalContractDto(input: {
  generatedResult: AdminAiGenerationResultPersistenceResult | null;
  taskPersistence: AdminAiGenerationTaskPersistenceResult;
}): AdminAiGenerationLocalContractTaskPersistenceDto {
  const result = input.taskPersistence;
  const generatedResult = input.generatedResult?.result ?? null;

  return {
    persistenceStatus: result.persistenceStatus,
    requestPublicId: result.task.requestPublicId,
    taskPublicId: result.task.taskPublicId,
    status: generatedResult === null ? result.task.status : "succeeded",
    resultPublicId:
      generatedResult?.resultPublicId ?? result.task.resultPublicId,
    contentVisibility: result.task.contentVisibility,
    evidenceStatus:
      generatedResult?.evidenceReference.evidenceStatus ??
      result.task.evidenceStatus,
    citationCount:
      generatedResult?.evidenceReference.citationCount ??
      result.task.citationCount,
    redactionStatus: result.task.redactionStatus,
  };
}

function mapAdminAiGenerationResultPersistenceResultToLocalContractDto(
  result: AdminAiGenerationResultPersistenceResult,
): AdminAiGenerationLocalContractGeneratedResultDto {
  return {
    persistenceStatus: result.persistenceStatus,
    resultPublicId: result.result.resultPublicId,
    contentVisibility: result.result.contentReference.contentVisibility,
    evidenceStatus: result.result.evidenceReference.evidenceStatus,
    citationCount: result.result.evidenceReference.citationCount,
    formalAdoptionStatus: result.result.formalAdoption.status,
    formalAdoptionReviewStatus: result.result.formalAdoption.reviewStatus,
    formalTargetWriteStatus:
      result.result.formalAdoption.formalTargetWriteStatus,
    formalQuestionPublicId: result.result.formalAdoption.formalQuestionPublicId,
    formalPaperPublicId: result.result.formalAdoption.formalPaperPublicId,
    formalAdoptionReviewedAt: result.result.formalAdoption.reviewedAt,
    reviewedDraft: result.result.contentReference.reviewedDraft,
    redactionStatus: result.result.contentReference.redactionStatus,
  };
}

function createAdminAiGenerationResolvedLocalContract(input: {
  generatedResult: AdminAiGenerationResultPersistenceResult;
  localContract: AdminAiGenerationLocalContractBaseDto;
}): AdminAiGenerationLocalContractBaseDto {
  return {
    ...input.localContract,
    resultState: {
      ...input.localContract.resultState,
      status: "succeeded",
      resultPublicId: input.generatedResult.result.resultPublicId,
      evidenceStatus:
        input.generatedResult.result.evidenceReference.evidenceStatus,
      citationCount:
        input.generatedResult.result.evidenceReference.citationCount,
    },
    taskRequest: {
      ...input.localContract.taskRequest,
      resultReference: {
        ...input.localContract.taskRequest.resultReference,
        resultPublicId: input.generatedResult.result.resultPublicId,
        evidenceStatus:
          input.generatedResult.result.evidenceReference.evidenceStatus,
        citationCount:
          input.generatedResult.result.evidenceReference.citationCount,
      },
    },
  };
}

function createAdminAiGenerationLocalContractResultInput(input: {
  attempt: AiGenerationTaskAttemptIdentity;
  citationRedactedSnapshot: RedactedJsonObject | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  localContract: AdminAiGenerationLocalContractBaseDto & {
    runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeWithLog;
  };
  organizationTrainingPaperDraftDetail: OrganizationTrainingPaperDraftDetailSnapshot | null;
  taskPersistence: AdminAiGenerationTaskPersistenceResult;
  createdAt: Date;
}): CreateAdminAiGenerationResultInput {
  const task = input.taskPersistence.task;
  const resultPublicId = createAdminAiGenerationResultPublicId(
    task.taskPublicId,
  );
  const contentRedactedSnapshot =
    createAdminAiGenerationLocalContractRedactedSnapshot({
      createdAt: input.createdAt,
      generationParameters: input.generationParameters,
      localContract: input.localContract,
      organizationTrainingPaperDraftDetail:
        input.organizationTrainingPaperDraftDetail,
      sourceIdentity: {
        requestPublicId: task.requestPublicId,
        resultPublicId,
        taskPublicId: task.taskPublicId,
      },
    });

  return {
    resultPublicId,
    taskPublicId: task.taskPublicId,
    workspace: task.workspace,
    generationKind: task.generationKind,
    ownerType: task.ownerType === "organization" ? "organization" : "platform",
    ownerPublicId: task.ownerPublicId,
    organizationPublicId: task.organizationPublicId,
    taskType: task.taskType,
    contentRedactedSnapshot,
    contentDigest: createAdminAiGenerationContentDigest(
      contentRedactedSnapshot,
    ),
    contentPreviewMasked: ADMIN_AI_GENERATION_RESULT_PREVIEW_MASKED,
    citationRedactedSnapshot: input.citationRedactedSnapshot,
    evidenceStatus:
      input.localContract.runtimeBridge.visibleGeneratedContent
        ?.groundingSummary?.evidenceStatus ?? "none",
    citationCount:
      input.localContract.runtimeBridge.visibleGeneratedContent
        ?.groundingSummary?.citationCount ?? 0,
    aiCallLogPublicId: input.localContract.runtimeBridge.aiCallLogPublicId,
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    createdAt: input.createdAt,
    attempt: input.attempt,
  };
}

function createAdminAiGenerationResultPublicId(taskPublicId: string): string {
  const taskPrefix = "admin_ai_generation_task_";

  return taskPublicId.startsWith(taskPrefix)
    ? `admin_ai_generation_result_${taskPublicId.slice(taskPrefix.length)}`
    : `${taskPublicId}_result`;
}

function createAdminAiGenerationLocalContractRedactedSnapshot(input: {
  createdAt: Date;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  localContract: AdminAiGenerationLocalContractBaseDto;
  organizationTrainingPaperDraftDetail: OrganizationTrainingPaperDraftDetailSnapshot | null;
  sourceIdentity: {
    requestPublicId: string;
    resultPublicId: string;
    taskPublicId: string;
  };
}) {
  const formalReviewedDraft =
    input.generationParameters === null
      ? null
      : createContentAdminFormalReviewedDraftPayload({
          generationParameters: input.generationParameters,
          localContractSummary: input.localContract,
          requestedAt: input.createdAt.toISOString(),
          sourceIdentity: input.sourceIdentity,
          createSourceContentDigest: (source) =>
            `sha256:${createHash("sha256")
              .update(JSON.stringify(source))
              .digest("hex")}`,
        });
  const organizationTrainingQuestionDraft =
    input.generationParameters === null
      ? null
      : createOrganizationTrainingQuestionDraftSnapshot({
          generationParameters: input.generationParameters,
          localContractSummary: input.localContract,
        });
  const organizationTrainingPaperDraft =
    input.generationParameters === null
      ? null
      : createOrganizationTrainingPaperDraftSnapshot({
          localContractSummary: input.localContract,
          paperDraftDetail: input.organizationTrainingPaperDraftDetail,
        });

  return {
    redactionStatus: "redacted",
    summaryKind: "admin_ai_generation_local_contract",
    runtimeStatus: input.localContract.runtimeStatus,
    workspace: input.localContract.workspace,
    generationKind: input.localContract.generationKind,
    taskType: input.localContract.taskRequest.taskType,
    resultKind: input.localContract.taskRequest.resultReference.resultKind,
    contentVisibility: input.localContract.resultState.contentVisibility,
    providerCallExecuted:
      input.localContract.runtimeBridge.providerCallExecuted,
    runtimeBridgeStatus: input.localContract.runtimeBridge.bridgeStatus,
    formalQuestionWriteStatus:
      input.localContract.formalContentBoundary.questionWriteStatus,
    formalPaperWriteStatus:
      input.localContract.formalContentBoundary.paperWriteStatus,
    organizationDraftAdoptionStatus:
      input.localContract.organizationOwnedDraftBoundary
        .organizationDraftAdoptionStatus,
    organizationTrainingSourceStatus:
      input.localContract.organizationOwnedDraftBoundary
        .organizationTrainingSourceStatus,
    platformFormalDraftStatus:
      input.localContract.organizationOwnedDraftBoundary
        .platformFormalDraftStatus,
    publishStatus:
      input.localContract.organizationOwnedDraftBoundary.publishStatus,
    studentVisibleStatus:
      input.localContract.organizationOwnedDraftBoundary.studentVisibleStatus,
    generationParameters: input.generationParameters,
    ...(input.localContract.paperAssembly === null
      ? {}
      : {
          paperAssembly: createAdminAiGenerationPaperAssemblyRedactedSnapshot(
            input.localContract.paperAssembly,
          ),
        }),
    ...(formalReviewedDraft === null ? {} : { formalReviewedDraft }),
    ...(organizationTrainingQuestionDraft === null
      ? {}
      : { organizationTrainingQuestionDraft }),
    ...(organizationTrainingPaperDraft === null
      ? {}
      : { organizationTrainingPaperDraft }),
  };
}

function createOrganizationTrainingQuestionDraftSnapshot(input: {
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  localContractSummary: AdminAiGenerationLocalContractBaseDto;
}): { questions: OrganizationTrainingAdminQuestionDetailDto[] } | null {
  if (
    input.localContractSummary.workspace !== "organization" ||
    input.localContractSummary.generationKind !== "question"
  ) {
    return null;
  }

  const visibleGeneratedContent =
    input.localContractSummary.runtimeBridge.visibleGeneratedContent;
  const structuredPreview = visibleGeneratedContent?.structuredPreview;

  if (
    structuredPreview?.kind !== "question_set" ||
    structuredPreview.parseStatus !== "parsed"
  ) {
    return null;
  }

  if (
    structuredPreview.draftSummaries.length !==
    structuredPreview.requestedQuestionCount
  ) {
    return null;
  }

  const questions: OrganizationTrainingAdminQuestionDetailDto[] = [];

  for (const questionDraft of structuredPreview.draftSummaries) {
    const question = createOrganizationTrainingQuestionDetailFromDraft({
      citationCount:
        visibleGeneratedContent?.groundingSummary?.citationCount ??
        input.localContractSummary.resultState.citationCount,
      evidenceStatus:
        visibleGeneratedContent?.groundingSummary?.evidenceStatus ??
        input.localContractSummary.resultState.evidenceStatus,
      generationParameters: input.generationParameters,
      questionDraft,
      taskPublicId: input.localContractSummary.taskRequest.taskPublicId,
    });

    if (question === null) {
      return null;
    }

    questions.push(question);
  }

  return questions.length === structuredPreview.requestedQuestionCount
    ? { questions }
    : null;
}

function createOrganizationTrainingQuestionDetailFromDraft(input: {
  citationCount: number;
  evidenceStatus: OrganizationTrainingAdminQuestionDetailDto["evidenceSummary"]["evidenceStatus"];
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  questionDraft: AiGenerationRouteIntegratedQuestionDraftSummary;
  taskPublicId: string;
}): OrganizationTrainingAdminQuestionDetailDto | null {
  const stem = normalizeRequiredText(input.questionDraft.questionStem ?? null);
  const standardAnswer = normalizeRequiredText(
    input.questionDraft.standardAnswer ?? null,
  );
  const analysis = normalizeRequiredText(input.questionDraft.analysis ?? null);

  if (stem === null || standardAnswer === null || analysis === null) {
    return null;
  }

  const questionType = resolveOrganizationTrainingQuestionType(
    input.questionDraft.questionType ?? input.generationParameters.questionType,
  );
  if (questionType === null) {
    return null;
  }

  const publicId = `${input.taskPublicId}_question_${input.questionDraft.draftNumber}`;
  const options = createOrganizationTrainingQuestionOptions({
    publicId,
    questionDraft: input.questionDraft,
    questionType,
  });

  if (options === null) {
    return null;
  }
  const scoringPoints = (input.questionDraft.scoringPoints ?? []).map(
    (scoringPoint) => ({
      description: scoringPoint.description,
      score: Number(scoringPoint.score),
      sortOrder: scoringPoint.sortOrder,
    }),
  );
  const fillBlankAnswers = (input.questionDraft.fillBlankAnswers ?? []).map(
    (fillBlankAnswer) => ({
      blankKey: fillBlankAnswer.blankKey,
      standardAnswers: [...fillBlankAnswer.standardAnswers],
      score: Number(fillBlankAnswer.score),
      sortOrder: fillBlankAnswer.sortOrder,
    }),
  );

  if (
    scoringPoints.some(
      (scoringPoint) =>
        !Number.isFinite(scoringPoint.score) || scoringPoint.score <= 0,
    ) ||
    fillBlankAnswers.some(
      (fillBlankAnswer) =>
        !Number.isFinite(fillBlankAnswer.score) || fillBlankAnswer.score <= 0,
    )
  ) {
    return null;
  }

  return {
    publicId,
    sequenceNumber: input.questionDraft.draftNumber,
    questionType,
    materialTitle: null,
    materialContent: null,
    stem,
    options:
      questionType === "single_choice" || questionType === "multi_choice"
        ? options
        : [],
    scoringPoints,
    fillBlankAnswers,
    score: 1,
    evidenceSummary: {
      evidenceStatus: input.evidenceStatus,
      citationCount: input.citationCount,
    },
    answerAndAnalysis: {
      visibility: "collapsed_by_default",
      standardAnswer,
      analysis,
    },
  };
}

function resolveOrganizationTrainingQuestionType(
  value: string | null | undefined,
): OrganizationTrainingAdminQuestionDetailDto["questionType"] | null {
  return parseCurrentAiGenerationQuestionType(value);
}

function createOrganizationTrainingQuestionOptions(input: {
  publicId: string;
  questionDraft: AiGenerationRouteIntegratedQuestionDraftSummary;
  questionType: OrganizationTrainingAdminQuestionDetailDto["questionType"];
}): OrganizationTrainingAdminQuestionDetailDto["options"] | null {
  const options = input.questionDraft.questionOptions ?? [];
  const isChoiceQuestion =
    input.questionType === "single_choice" ||
    input.questionType === "multi_choice";

  if (
    (isChoiceQuestion && options.length === 0) ||
    (!isChoiceQuestion && options.length > 0)
  ) {
    return null;
  }

  const normalizedOptions: OrganizationTrainingAdminQuestionDetailDto["options"] =
    [];
  const labels = new Set<string>();
  const foldedLabels = new Set<string>();
  for (const option of options) {
    const label = normalizeRequiredText(option.optionLabel ?? null);
    const content = normalizeRequiredText(option.optionText);

    if (
      label === null ||
      content === null ||
      labels.has(label) ||
      foldedLabels.has(label.toLowerCase())
    ) {
      return null;
    }
    labels.add(label);
    foldedLabels.add(label.toLowerCase());
    normalizedOptions.push({
      publicId: `${input.publicId}_option_${label.toLowerCase()}`,
      label,
      content,
    });
  }

  return normalizedOptions;
}

async function resolveOrganizationTrainingPaperDraftDetailSnapshot(input: {
  localContractSummary: AdminAiGenerationLocalContractBaseDto;
  organizationTrainingRepository: AdminAiGenerationPaperAssemblyOrganizationTrainingRepository;
  questionRepository: AdminAiGenerationPaperAssemblyQuestionRepository;
}): Promise<OrganizationTrainingPaperDraftDetailSnapshot | null> {
  const paperAssembly = input.localContractSummary.paperAssembly;

  if (
    input.localContractSummary.workspace !== "organization" ||
    input.localContractSummary.generationKind !== "paper" ||
    paperAssembly === null ||
    paperAssembly.status !== "assembled" ||
    paperAssembly.container.selectedQuestionCount < 1
  ) {
    return null;
  }

  const sourceQuestionDetails =
    await resolveOrganizationTrainingPaperSourceQuestionDetails({
      container: paperAssembly.container,
      organizationPublicId:
        input.localContractSummary.taskRequest.organizationPublicId,
      organizationTrainingRepository: input.organizationTrainingRepository,
      questionRepository: input.questionRepository,
    });
  const sourceQuestionByKey = new Map(
    sourceQuestionDetails.map((sourceQuestion) => [
      createSelectedPaperQuestionKey(sourceQuestion),
      sourceQuestion,
    ]),
  );
  let sequenceNumber = 1;
  const paperSections: OrganizationTrainingAdminPaperSectionDetailDto[] = [];

  for (const paperSection of paperAssembly.container.sections) {
    const sectionQuestionType = normalizeOrganizationTrainingQuestionType(
      paperSection.questionType,
    );
    const sectionQuestions: OrganizationTrainingAdminQuestionDetailDto[] = [];

    if (sectionQuestionType === null) {
      return null;
    }

    for (const selectedQuestion of paperSection.selectedQuestions) {
      const sourceQuestion = sourceQuestionByKey.get(
        createSelectedPaperQuestionKey(selectedQuestion),
      );

      if (sourceQuestion === undefined) {
        return null;
      }

      const questionDetail = createOrganizationTrainingPaperQuestionDetail({
        selectedQuestion,
        sequenceNumber,
        sourceQuestion,
      });

      if (questionDetail === null) {
        return null;
      }

      sectionQuestions.push(questionDetail);
      sequenceNumber += 1;
    }

    paperSections.push({
      sectionKey: paperSection.sectionKey,
      title: paperSection.title,
      questionType: sectionQuestionType,
      targetQuestionCount: paperSection.targetQuestionCount,
      selectedQuestionCount: paperSection.selectedQuestionCount,
      totalScore: sectionQuestions.reduce(
        (totalScore, question) => totalScore + question.score,
        0,
      ),
      questions: sectionQuestions,
    });
  }

  const questions = paperSections.flatMap(
    (paperSection) => paperSection.questions,
  );

  return questions.length === paperAssembly.container.selectedQuestionCount
    ? { paperSections, questions }
    : null;
}

async function resolveOrganizationTrainingPaperSourceQuestionDetails(input: {
  container: AiPaperPlanAndSelectContainerDto;
  organizationPublicId: string | null;
  organizationTrainingRepository: AdminAiGenerationPaperAssemblyOrganizationTrainingRepository;
  questionRepository: AdminAiGenerationPaperAssemblyQuestionRepository;
}): Promise<OrganizationTrainingPaperSourceQuestionDetail[]> {
  const selectedPlatformQuestionIds = collectSelectedPaperQuestionIdsBySource(
    input.container,
    "platform_formal_question",
  );
  const selectedEnterpriseQuestionIds = collectSelectedPaperQuestionIdsBySource(
    input.container,
    "enterprise_training_snapshot",
  );
  const [platformQuestions, enterpriseQuestions] = await Promise.all([
    resolvePlatformPaperSourceQuestionDetails({
      container: input.container,
      questionRepository: input.questionRepository,
      selectedQuestionIds: selectedPlatformQuestionIds,
    }),
    resolveEnterprisePaperSourceQuestionDetails({
      organizationPublicId: input.organizationPublicId,
      organizationTrainingRepository: input.organizationTrainingRepository,
      selectedQuestionIds: selectedEnterpriseQuestionIds,
    }),
  ]);

  return [...platformQuestions, ...enterpriseQuestions];
}

async function resolvePlatformPaperSourceQuestionDetails(input: {
  container: AiPaperPlanAndSelectContainerDto;
  questionRepository: AdminAiGenerationPaperAssemblyQuestionRepository;
  selectedQuestionIds: ReadonlySet<string>;
}): Promise<OrganizationTrainingPaperSourceQuestionDetail[]> {
  if (input.selectedQuestionIds.size === 0) {
    return [];
  }

  const rows =
    await input.questionRepository.listAvailableAiPaperSourceQuestions({
      profession: input.container.profession,
      level: input.container.level,
      subject: input.container.subject,
      knowledgeNodePublicIds: null,
      questionPublicIds: [...input.selectedQuestionIds],
    });

  return rows
    .filter(
      (questionRow) =>
        input.selectedQuestionIds.has(questionRow.public_id) &&
        questionRow.status === "available",
    )
    .map(mapPlatformQuestionRowToPaperSourceDetail)
    .filter(
      (
        sourceQuestion,
      ): sourceQuestion is OrganizationTrainingPaperSourceQuestionDetail =>
        sourceQuestion !== null,
    );
}

async function resolveEnterprisePaperSourceQuestionDetails(input: {
  organizationPublicId: string | null;
  organizationTrainingRepository: AdminAiGenerationPaperAssemblyOrganizationTrainingRepository;
  selectedQuestionIds: ReadonlySet<string>;
}): Promise<OrganizationTrainingPaperSourceQuestionDetail[]> {
  if (
    input.selectedQuestionIds.size === 0 ||
    input.organizationPublicId === null
  ) {
    return [];
  }

  const snapshots =
    await input.organizationTrainingRepository.listAdminVisibleQuestionSnapshotsForAiPaperSource(
      {
        visibleOrganizationPublicIds: [input.organizationPublicId],
      },
    );

  return snapshots
    .filter((snapshot) => input.selectedQuestionIds.has(snapshot.publicId))
    .map(mapEnterpriseQuestionSnapshotToPaperSourceDetail)
    .filter(
      (
        sourceQuestion,
      ): sourceQuestion is OrganizationTrainingPaperSourceQuestionDetail =>
        sourceQuestion !== null,
    );
}

function mapPlatformQuestionRowToPaperSourceDetail(
  questionRow: QuestionAccessRow,
): OrganizationTrainingPaperSourceQuestionDetail | null {
  const questionType = normalizeOrganizationTrainingQuestionType(
    questionRow.question_type,
  );

  if (questionType === null) {
    return null;
  }

  return {
    questionPublicId: questionRow.public_id,
    sourceKind: "platform_formal_question",
    questionType,
    materialTitle: normalizeRequiredText(questionRow.material_title),
    materialContent: normalizeRequiredText(
      questionRow.material_content_rich_text,
    ),
    materialPublicId: questionRow.material_public_id,
    questionGroupPublicId: null,
    questionGroupTitle: null,
    questionGroupQuestionSortOrder: null,
    questionGroupQuestionCount: null,
    stem: questionRow.stem_rich_text,
    options: questionRow.question_options.map((questionOption) => ({
      publicId: `${questionRow.public_id}_option_${questionOption.label.toLowerCase()}`,
      label: questionOption.label,
      content: questionOption.content_rich_text,
    })),
    standardAnswer: normalizeRequiredText(
      questionRow.standard_answer_rich_text,
    ),
    analysis: normalizeRequiredText(questionRow.analysis_rich_text),
    evidenceStatus: "sufficient",
    citationCount: questionRow.knowledge_node_public_ids.length,
  };
}

function mapEnterpriseQuestionSnapshotToPaperSourceDetail(
  snapshot: Awaited<
    ReturnType<
      AdminAiGenerationPaperAssemblyOrganizationTrainingRepository["listAdminVisibleQuestionSnapshotsForAiPaperSource"]
    >
  >[number],
): OrganizationTrainingPaperSourceQuestionDetail | null {
  const questionType = normalizeOrganizationTrainingQuestionType(
    snapshot.questionType,
  );

  if (questionType === null) {
    return null;
  }

  const questionGroupSnapshot = snapshot as typeof snapshot & {
    questionGroupPublicId?: string;
    questionGroupTitle?: string;
    questionGroupQuestionSortOrder?: number;
    questionGroupQuestionCount?: number;
  };

  return {
    questionPublicId: snapshot.publicId,
    sourceKind: "enterprise_training_snapshot",
    questionType,
    materialTitle: snapshot.materialTitle,
    materialContent: snapshot.materialContent,
    materialPublicId: null,
    questionGroupPublicId: questionGroupSnapshot.questionGroupPublicId ?? null,
    questionGroupTitle: questionGroupSnapshot.questionGroupTitle ?? null,
    questionGroupQuestionSortOrder:
      questionGroupSnapshot.questionGroupQuestionSortOrder ?? null,
    questionGroupQuestionCount:
      questionGroupSnapshot.questionGroupQuestionCount ?? null,
    stem: snapshot.stem,
    options: snapshot.options.map((option) => ({ ...option })),
    standardAnswer: normalizeRequiredText(snapshot.standardAnswer),
    analysis: normalizeRequiredText(snapshot.analysisSummary),
    evidenceStatus: snapshot.evidenceStatus,
    citationCount: snapshot.citationCount,
  };
}

function createOrganizationTrainingPaperQuestionDetail(input: {
  selectedQuestion: AiPaperSelectedQuestionDto;
  sequenceNumber: number;
  sourceQuestion: OrganizationTrainingPaperSourceQuestionDetail;
}): OrganizationTrainingAdminQuestionDetailDto | null {
  const selectedGroup = input.selectedQuestion.questionGroup;

  if (
    !doesSelectedGroupMatchCurrentSource(selectedGroup, input.sourceQuestion)
  ) {
    return null;
  }

  return {
    publicId: input.sourceQuestion.questionPublicId,
    sequenceNumber: input.sequenceNumber,
    questionType: input.sourceQuestion.questionType,
    ...(selectedGroup === null || selectedGroup === undefined
      ? {}
      : {
          questionGroupPublicId: selectedGroup.publicId,
          questionGroupTitle: selectedGroup.title,
          questionGroupQuestionSortOrder: selectedGroup.questionSortOrder,
          questionGroupQuestionCount:
            selectedGroup.memberQuestionPublicIds.length,
        }),
    materialTitle:
      selectedGroup?.materialSnapshot.title ??
      input.sourceQuestion.materialTitle,
    materialContent:
      selectedGroup?.materialSnapshot.contentRichText ??
      input.sourceQuestion.materialContent,
    stem: input.sourceQuestion.stem,
    options: input.sourceQuestion.options.map((option) => ({ ...option })),
    score: input.selectedQuestion.score,
    evidenceSummary: {
      evidenceStatus: input.sourceQuestion.evidenceStatus,
      citationCount: input.sourceQuestion.citationCount,
    },
    answerAndAnalysis: {
      visibility: "collapsed_by_default",
      standardAnswer: input.sourceQuestion.standardAnswer,
      analysis: input.sourceQuestion.analysis,
    },
  };
}

function doesSelectedGroupMatchCurrentSource(
  selectedGroup: AiPaperSelectedQuestionDto["questionGroup"],
  sourceQuestion: OrganizationTrainingPaperSourceQuestionDetail,
): boolean {
  if (selectedGroup === null || selectedGroup === undefined) {
    return (
      sourceQuestion.materialPublicId === null &&
      sourceQuestion.materialTitle === null &&
      sourceQuestion.materialContent === null &&
      sourceQuestion.questionGroupPublicId === null
    );
  }

  if (
    !selectedGroup.memberQuestionPublicIds.includes(
      sourceQuestion.questionPublicId,
    )
  ) {
    return false;
  }

  if (sourceQuestion.sourceKind === "platform_formal_question") {
    return (
      selectedGroup.materialSnapshot.materialPublicId !== null &&
      sourceQuestion.materialPublicId ===
        selectedGroup.materialSnapshot.materialPublicId
    );
  }

  return (
    sourceQuestion.questionGroupPublicId === selectedGroup.publicId &&
    sourceQuestion.questionGroupTitle === selectedGroup.title &&
    sourceQuestion.questionGroupQuestionSortOrder ===
      selectedGroup.questionSortOrder &&
    sourceQuestion.questionGroupQuestionCount ===
      selectedGroup.memberQuestionPublicIds.length &&
    sourceQuestion.materialTitle === selectedGroup.materialSnapshot.title &&
    sourceQuestion.materialContent ===
      selectedGroup.materialSnapshot.contentRichText
  );
}

function collectSelectedPaperQuestionIdsBySource(
  container: AiPaperPlanAndSelectContainerDto,
  sourceKind: AiPaperSelectedQuestionDto["sourceKind"],
): Set<string> {
  return new Set(
    container.sections
      .flatMap((paperSection) => paperSection.selectedQuestions)
      .filter((selectedQuestion) => selectedQuestion.sourceKind === sourceKind)
      .map((selectedQuestion) => selectedQuestion.questionPublicId),
  );
}

function createSelectedPaperQuestionKey(input: {
  questionPublicId: string;
  sourceKind: AiPaperSelectedQuestionDto["sourceKind"];
}): string {
  return `${input.sourceKind}:${input.questionPublicId}`;
}

function normalizeOrganizationTrainingQuestionType(
  value: string,
): OrganizationTrainingAdminQuestionDetailDto["questionType"] | null {
  return parseCurrentAiGenerationQuestionType(value);
}

function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const normalizedValue = value?.trim() ?? "";

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function createOrganizationTrainingPaperDraftSnapshot(input: {
  localContractSummary: AdminAiGenerationLocalContractBaseDto;
  paperDraftDetail: OrganizationTrainingPaperDraftDetailSnapshot | null;
}) {
  const paperAssembly = input.localContractSummary.paperAssembly;

  if (
    input.localContractSummary.workspace !== "organization" ||
    input.localContractSummary.generationKind !== "paper" ||
    paperAssembly === null ||
    paperAssembly.status !== "assembled" ||
    paperAssembly.container.selectedQuestionCount < 1
  ) {
    return null;
  }

  return {
    paperTitle: paperAssembly.container.title,
    requestedQuestionCount: paperAssembly.container.requestedQuestionCount,
    selectedQuestionCount: paperAssembly.container.selectedQuestionCount,
    sourceComposition: paperAssembly.container.sourceComposition,
    matchQuality: paperAssembly.container.matchQuality,
    ...(paperAssembly.container.constraintLineage === undefined
      ? {}
      : {
          constraintLineage: {
            request: {
              difficulty:
                paperAssembly.container.constraintLineage.request.difficulty,
              knowledgeNodePublicIds: [
                ...paperAssembly.container.constraintLineage.request
                  .knowledgeNodePublicIds,
              ],
            },
            plan: {
              difficulty:
                paperAssembly.container.constraintLineage.plan.difficulty,
              knowledgeNodePublicIds: [
                ...paperAssembly.container.constraintLineage.plan
                  .knowledgeNodePublicIds,
              ],
              parentKnowledgeNodePublicIds: [
                ...paperAssembly.container.constraintLineage.plan
                  .parentKnowledgeNodePublicIds,
              ],
            },
          },
        }),
    assemblySections: paperAssembly.container.sections.map((paperSection) => ({
      sectionKey: paperSection.sectionKey,
      title: paperSection.title,
      questionType: paperSection.questionType,
      targetQuestionCount: paperSection.targetQuestionCount,
      selectedQuestionCount: paperSection.selectedQuestionCount,
      selectedQuestions: paperSection.selectedQuestions.map(
        (selectedQuestion) => ({
          questionPublicId: selectedQuestion.questionPublicId,
          sourceKind: selectedQuestion.sourceKind,
          matchTier: selectedQuestion.matchTier,
          score: selectedQuestion.score,
          ...(selectedQuestion.questionGroup === null ||
          selectedQuestion.questionGroup === undefined
            ? {}
            : {
                questionGroup: {
                  ...selectedQuestion.questionGroup,
                  materialSnapshot: {
                    ...selectedQuestion.questionGroup.materialSnapshot,
                  },
                  memberQuestionPublicIds: [
                    ...selectedQuestion.questionGroup.memberQuestionPublicIds,
                  ],
                },
              }),
          ...(selectedQuestion.constraintMatchBasis === undefined
            ? {}
            : {
                constraintMatchBasis: {
                  difficulty: selectedQuestion.constraintMatchBasis.difficulty,
                  knowledgeNodePublicIds: [
                    ...selectedQuestion.constraintMatchBasis
                      .knowledgeNodePublicIds,
                  ],
                  parentKnowledgeNodePublicIds: [
                    ...selectedQuestion.constraintMatchBasis
                      .parentKnowledgeNodePublicIds,
                  ],
                  ancestorKnowledgeNodePublicIds: [
                    ...selectedQuestion.constraintMatchBasis
                      .ancestorKnowledgeNodePublicIds,
                  ],
                  matchTier: selectedQuestion.constraintMatchBasis.matchTier,
                },
              }),
        }),
      ),
    })),
    ...(input.paperDraftDetail === null
      ? {}
      : {
          paperSections: input.paperDraftDetail.paperSections,
          questions: input.paperDraftDetail.questions,
        }),
    redactionStatus: "admin_safe_detail",
  };
}

function createAdminAiGenerationPaperAssemblyRedactedSnapshot(
  paperAssembly: Exclude<AdminAiGenerationLocalContractPaperAssemblyDto, null>,
) {
  return {
    status: paperAssembly.status,
    redactionStatus: "redacted",
    requestedQuestionCount: paperAssembly.container.requestedQuestionCount,
    selectedQuestionCount: paperAssembly.container.selectedQuestionCount,
    sourceComposition: paperAssembly.container.sourceComposition,
    matchQuality: paperAssembly.container.matchQuality,
    constraintLineage: paperAssembly.container.constraintLineage ?? null,
    sectionCount: paperAssembly.container.sections.length,
    insufficiency: paperAssembly.insufficiency,
  };
}

function createAdminAiGenerationContentDigest(
  redactedSnapshot: Record<string, unknown>,
): string {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(redactedSnapshot))
    .digest("hex")}`;
}

function resolveOrganizationTrainingReviewDraft(
  task: AdminAiGenerationTaskPersistenceDto,
  result: AdminAiGenerationResultDto,
):
  | AdminAiGenerationTaskHistoryGeneratedResultDto["organizationTrainingReviewDraft"]
  | undefined {
  const hasMatchingIdentity =
    result.taskPublicId === task.taskPublicId &&
    result.requestPublicId === task.requestPublicId &&
    result.workspace === task.workspace &&
    result.generationKind === task.generationKind &&
    result.ownerPublicId === task.ownerPublicId &&
    result.organizationPublicId === task.organizationPublicId &&
    result.taskType === task.taskType &&
    result.resultPublicId === task.resultPublicId;

  if (!hasMatchingIdentity) {
    return undefined;
  }

  const questionDraft = result.contentReference.organizationTrainingDraft;
  const paperDraft = result.contentReference.organizationTrainingPaperDraft;

  if (task.workspace === "content") {
    return questionDraft === null && paperDraft === null ? null : undefined;
  }

  if (
    result.ownerType !== "organization" ||
    task.organizationPublicId === null ||
    task.ownerPublicId !== task.organizationPublicId
  ) {
    return undefined;
  }

  if (task.generationKind === "question") {
    const questionPublicIds = questionDraft?.questions.map(
      (question) => question.publicId,
    );
    return questionDraft !== null &&
      paperDraft === null &&
      Array.isArray(questionDraft.questions) &&
      questionDraft.questions.length > 0 &&
      questionPublicIds !== undefined &&
      new Set(questionPublicIds).size === questionPublicIds.length
      ? {
          kind: "question_draft",
          questionDraft,
          redactionStatus: "admin_safe_detail",
        }
      : undefined;
  }

  const paperSectionQuestions =
    paperDraft?.paperSections?.flatMap((section) => section.questions) ?? [];
  const paperQuestions =
    paperSectionQuestions.length > 0
      ? paperSectionQuestions
      : (paperDraft?.questions ?? []);
  const paperQuestionPublicIds = paperQuestions.map(
    (question) => question.publicId,
  );
  const hasCompletePaperQuestions =
    paperDraft !== null &&
    paperQuestions.length === paperDraft.selectedQuestionCount &&
    new Set(paperQuestionPublicIds).size === paperQuestionPublicIds.length;

  return questionDraft === null &&
    paperDraft !== null &&
    paperDraft.redactionStatus === "admin_safe_detail" &&
    paperDraft.selectedQuestionCount > 0 &&
    paperDraft.requestedQuestionCount >= paperDraft.selectedQuestionCount &&
    hasCompletePaperQuestions
    ? {
        kind: "paper_draft",
        paperDraft,
        redactionStatus: "admin_safe_detail",
      }
    : undefined;
}

function mapAdminAiGenerationResultDtoToHistoryGeneratedResult(
  task: AdminAiGenerationTaskPersistenceDto,
  result: AdminAiGenerationResultDto,
): AdminAiGenerationTaskHistoryGeneratedResultDto | null {
  const organizationTrainingReviewDraft =
    resolveOrganizationTrainingReviewDraft(task, result);

  if (organizationTrainingReviewDraft === undefined) {
    return null;
  }

  return {
    resultPublicId: result.resultPublicId,
    persistedAt: result.persistedAt,
    status: result.status,
    contentDigest: result.contentReference.contentDigest,
    contentPreviewMasked: result.contentReference.contentPreviewMasked,
    contentVisibility: result.contentReference.contentVisibility,
    evidenceStatus: result.evidenceReference.evidenceStatus,
    citationCount: result.evidenceReference.citationCount,
    formalAdoptionStatus: result.formalAdoption.status,
    formalAdoptionReviewStatus: result.formalAdoption.reviewStatus,
    formalTargetWriteStatus: result.formalAdoption.formalTargetWriteStatus,
    formalQuestionPublicId: result.formalAdoption.formalQuestionPublicId,
    formalPaperPublicId: result.formalAdoption.formalPaperPublicId,
    formalAdoptionReviewedAt: result.formalAdoption.reviewedAt,
    reviewedDraft: result.contentReference.reviewedDraft,
    organizationTrainingReviewDraft,
    redactionStatus: result.contentReference.redactionStatus,
  };
}

function mapAdminAiGenerationTaskPersistenceDtoToHistoryItem(
  task: AdminAiGenerationTaskPersistenceDto,
  generatedResult: AdminAiGenerationResultDto | null,
):
  | (AdminAiGenerationTaskHistoryItemDto &
      Pick<
        AdminAiGenerationTaskPersistenceDto,
        | "retryCount"
        | "failureCategory"
        | "startedAt"
        | "finishedAt"
        | "canRetry"
        | "canCancel"
      >)
  | null {
  const mappedGeneratedResult =
    generatedResult === null
      ? null
      : mapAdminAiGenerationResultDtoToHistoryGeneratedResult(
          task,
          generatedResult,
        );

  if (generatedResult !== null && mappedGeneratedResult === null) {
    return null;
  }

  return {
    requestPublicId: task.requestPublicId,
    taskPublicId: task.taskPublicId,
    taskType: task.taskType,
    generationKind: task.generationKind,
    status: task.status,
    retryCount: task.retryCount,
    failureCategory: task.failureCategory,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    canRetry: task.canRetry,
    canCancel: task.canCancel,
    requestedAt: task.requestedAt,
    resultPublicId: task.resultPublicId,
    contentVisibility: task.contentVisibility,
    evidenceStatus: task.evidenceStatus,
    citationCount: task.citationCount,
    authorizationPublicId: task.authorizationPublicId,
    ownerPublicId: task.ownerPublicId,
    organizationPublicId: task.organizationPublicId,
    runtimeStatus: task.runtimeStatus,
    runtimeBridgeStatus: task.runtimeBridgeStatus,
    providerCallExecuted: task.providerCallExecuted,
    envSecretAccessed: task.envSecretAccessed,
    providerConfigurationRead: task.providerConfigurationRead,
    costCalibrationExecuted: task.costCalibrationExecuted,
    formalContentBoundary: task.formalContentBoundary,
    organizationOwnedDraftBoundary:
      createAdminAiGenerationOrganizationOwnedDraftBoundary({
        workspace: task.workspace,
        ownerPublicId: task.ownerPublicId,
        organizationPublicId: task.organizationPublicId,
      }),
    generatedResult: mappedGeneratedResult,
    redactionStatus: task.redactionStatus,
  };
}

async function listAdminAiGenerationTaskHistory(input: {
  actor: AdminAiGenerationActor;
  historyQueryInput: {
    generationKind: AdminAiGenerationKind;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  };
  resultPersistenceRepository: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository: AdminAiGenerationTaskPersistenceRepository;
  workspace: AdminAiGenerationWorkspace;
}): Promise<ApiResponse<AdminAiGenerationTaskHistoryDto | null>> {
  const historyQuery = resolveAdminAiGenerationTaskHistoryQuery({
    actor: input.actor,
    historyQueryInput: input.historyQueryInput,
    workspace: input.workspace,
  });

  if (historyQuery === null) {
    return adminAiGenerationPermissionDeniedResponse;
  }

  if (
    historyQuery.ownerType !== "platform" &&
    historyQuery.ownerType !== "organization"
  ) {
    return adminAiGenerationPermissionDeniedResponse;
  }

  const taskHistoryItems =
    await input.taskPersistenceRepository.listTaskHistory(historyQuery);
  const [generatedResults, historyTotal] = await Promise.all([
    taskHistoryItems.length === 0
      ? Promise.resolve([])
      : input.resultPersistenceRepository.listDraftResultsByTaskPublicIds({
          workspace: historyQuery.workspace,
          ownerType: historyQuery.ownerType,
          ownerPublicId: historyQuery.ownerPublicId,
          generationKind: historyQuery.generationKind,
          taskPublicIds: taskHistoryItems.map((task) => task.taskPublicId),
        }),
    input.taskPersistenceRepository.countTaskHistory === undefined
      ? Promise.resolve(taskHistoryItems.length)
      : input.taskPersistenceRepository.countTaskHistory(historyQuery),
  ]);
  const requestedTaskPublicIds = new Set(
    taskHistoryItems.map((task) => task.taskPublicId),
  );
  const generatedResultTaskPublicIds = new Set<string>();
  const hasInvalidGeneratedResultSet = generatedResults.some((result) => {
    if (
      !requestedTaskPublicIds.has(result.taskPublicId) ||
      generatedResultTaskPublicIds.has(result.taskPublicId)
    ) {
      return true;
    }

    generatedResultTaskPublicIds.add(result.taskPublicId);
    return false;
  });

  if (hasInvalidGeneratedResultSet) {
    return adminAiGenerationHistoryUnavailableResponse;
  }
  const generatedResultsByTaskPublicId = new Map(
    generatedResults.map((result) => [result.taskPublicId, result]),
  );
  const historyItems = taskHistoryItems.map((task) =>
    mapAdminAiGenerationTaskPersistenceDtoToHistoryItem(
      task,
      generatedResultsByTaskPublicId.get(task.taskPublicId) ?? null,
    ),
  );
  if (historyItems.some((historyItem) => historyItem === null)) {
    return adminAiGenerationHistoryUnavailableResponse;
  }
  const availableHistoryItems = historyItems.filter(
    (historyItem): historyItem is NonNullable<typeof historyItem> =>
      historyItem !== null,
  );
  return createPaginatedResponse(
    {
      workspace: input.workspace,
      latestTask: availableHistoryItems[0] ?? null,
      items: availableHistoryItems,
      redactionStatus: "redacted",
    },
    {
      page: historyQuery.page,
      pageSize: historyQuery.pageSize,
      total: historyTotal,
      sortBy: "requestedAt",
      sortOrder: "desc",
    } satisfies ApiPagination,
  );
}

async function resolveAdminAiGenerationActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminAiGenerationActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getRequestAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const publicId = sessionResponse.data.user.adminPublicId ?? null;
  const roles = sessionResponse.data.user.adminRoles ?? [];

  if (publicId === null || roles.length === 0) {
    return null;
  }

  return {
    adminWorkspaceCapability:
      sessionResponse.data.user.adminWorkspaceCapability,
    publicId,
    roles,
  };
}

export function createAdminAiGenerationLocalContractRouteHandlers(
  workspace: AdminAiGenerationWorkspace,
  options: AdminAiGenerationLocalContractRouteOptions = {},
) {
  const createRequestPublicId =
    options.createRequestPublicId ?? createDefaultRequestPublicId;
  const requestClock = options.requestClock ?? (() => new Date());
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const taskPersistenceRepository =
    options.taskPersistenceRepository ??
    createPostgresAdminAiGenerationTaskPersistenceRepository();
  const resultPersistenceRepository =
    options.resultPersistenceRepository ??
    createPostgresAdminAiGenerationResultPersistenceRepository();
  const lifecycleRepository =
    options.lifecycleRepository ??
    createPostgresAiGenerationTaskLifecycleRepository();
  const questionRepository =
    options.questionRepository ?? createPostgresQuestionRepository();
  const organizationTrainingRepository =
    options.organizationTrainingRepository ??
    createPostgresOrganizationTrainingRepository();
  const paperAssemblyResolver =
    options.paperAssemblyResolver ??
    createDefaultAdminAiGenerationPaperAssemblyResolver({
      questionRepository,
      organizationTrainingRepository,
    });

  return createRouteHandlersWithErrorEnvelope({
    collection: {
      GET: async (request: Request): Promise<Response> => {
        const actor = await resolveAdminAiGenerationActor(
          request,
          sessionService,
        );

        if (actor === null) {
          return createJsonResponse(adminSessionRequiredResponse);
        }

        if (!canUseAdminAiGeneration(workspace, actor)) {
          return createJsonResponse(adminAiGenerationPermissionDeniedResponse);
        }

        const historyQueryInput =
          normalizeAdminAiGenerationHistoryQueryInput(request);

        if (historyQueryInput.generationKind === null) {
          return createJsonResponse(invalidAdminAiGenerationRequestResponse);
        }

        return createJsonResponse(
          await listAdminAiGenerationTaskHistory({
            actor,
            historyQueryInput: {
              ...historyQueryInput,
              generationKind: historyQueryInput.generationKind,
            },
            resultPersistenceRepository,
            taskPersistenceRepository,
            workspace,
          }),
        );
      },
      POST: async (request: Request): Promise<Response> => {
        const actor = await resolveAdminAiGenerationActor(
          request,
          sessionService,
        );

        if (actor === null) {
          return createJsonResponse(adminSessionRequiredResponse);
        }

        const body = await readJsonBody(request);
        const generationKind = normalizeGenerationKind(
          isRecord(body) ? body.generationKind : null,
        );
        const generationParameters =
          generationKind === null
            ? null
            : normalizeRouteIntegratedGenerationParameters(
                isRecord(body) ? body.generationParameters : null,
                resolveTaskType(generationKind),
              );
        const idempotencyKey = normalizeIdempotencyKey(
          isRecord(body) ? body.idempotencyKey : null,
        );

        if (
          generationKind === null ||
          generationParameters === null ||
          idempotencyKey === null
        ) {
          return createJsonResponse(invalidAdminAiGenerationRequestResponse);
        }

        if (!canUseAdminAiGeneration(workspace, actor)) {
          return createJsonResponse(adminAiGenerationPermissionDeniedResponse);
        }

        const requestedAt = requestClock();
        const organizationAuthorizationContext =
          workspace === "organization"
            ? await resolveOrganizationAiGenerationAuthorizationContext({
                actor,
                generationKind,
                generationParameters,
                now: requestedAt,
                organizationTrainingRepository,
              })
            : undefined;

        if (
          workspace === "organization" &&
          organizationAuthorizationContext === null
        ) {
          return createJsonResponse(adminAiGenerationPermissionDeniedResponse);
        }

        return createJsonResponse(
          await buildAdminAiGenerationLocalContract({
            actor,
            createRequestPublicId,
            generationKind,
            generationParameters,
            idempotencyKey,
            organizationTrainingRepository,
            organizationAuthorizationContext:
              organizationAuthorizationContext ?? undefined,
            paperAssemblyResolver,
            questionRepository,
            requestClock: () => requestedAt,
            resultPersistenceRepository,
            lifecycleRepository,
            runtimeBridgeControl: options.runtimeBridgeControl,
            taskPersistenceRepository,
            workspace,
          }),
        );
      },
    },
  });
}

type AiGenerationCancelRouteContext = {
  params: Promise<{ publicId: string }>;
};

function createNoStoreAdminAiGenerationResponse(
  response: ApiResponse<unknown>,
  status: number,
): Response {
  return Response.json(response, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function createAdminAiGenerationTaskCancelRouteHandler(
  workspace: AdminAiGenerationWorkspace,
  options: Pick<
    AdminAiGenerationLocalContractRouteOptions,
    "sessionService" | "lifecycleRepository" | "requestClock"
  > = {},
) {
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const lifecycleRepository =
    options.lifecycleRepository ??
    createPostgresAiGenerationTaskLifecycleRepository();
  const requestClock = options.requestClock ?? (() => new Date());

  return async (
    request: Request,
    context: AiGenerationCancelRouteContext,
  ): Promise<Response> => {
    const actor = await resolveAdminAiGenerationActor(request, sessionService);

    if (actor === null) {
      return createNoStoreAdminAiGenerationResponse(
        adminSessionRequiredResponse,
        401,
      );
    }

    if (!canUseAdminAiGeneration(workspace, actor)) {
      return createNoStoreAdminAiGenerationResponse(
        adminAiGenerationPermissionDeniedResponse,
        403,
      );
    }

    const { publicId } = await context.params;
    const taskPublicId = normalizeRequiredText(publicId);
    const organizationCapability =
      workspace === "organization"
        ? resolveServiceComputedOrganizationAiGenerationCapability(actor)
        : null;
    const cancellationScope =
      workspace === "content"
        ? {
            ownerType: "platform" as const,
            ownerPublicId: "platform_content_review_pool",
            organizationPublicId: null,
          }
        : organizationCapability === null
          ? null
          : {
              ownerType: "organization" as const,
              ownerPublicId: organizationCapability.organizationPublicId,
              organizationPublicId: organizationCapability.organizationPublicId,
            };

    if (taskPublicId === null || cancellationScope === null) {
      return createNoStoreAdminAiGenerationResponse(
        invalidAdminAiGenerationRequestResponse,
        400,
      );
    }

    const cancellation = await lifecycleRepository.cancelTask({
      taskPublicId,
      ...cancellationScope,
      taskTypes: ["ai_question_generation", "ai_paper_generation"],
      finishedAt: requestClock(),
    });

    if (cancellation.task === null) {
      return createNoStoreAdminAiGenerationResponse(
        createErrorResponse(404001, "AI generation task was not found."),
        404,
      );
    }

    return createNoStoreAdminAiGenerationResponse(
      createSuccessResponse({
        taskPublicId: cancellation.task.taskPublicId,
        status: cancellation.task.taskStatus,
        failureCategory: cancellation.task.failureCategory,
        retryCount: cancellation.task.retryCount,
        canRetry: cancellation.task.canRetry,
        canCancel: cancellation.task.canCancel,
        cancellationEffect:
          "Prevents result persistence or continued adoption; remote Provider cost or transmission may already have occurred.",
        redactionStatus: "redacted",
      }),
      200,
    );
  };
}
