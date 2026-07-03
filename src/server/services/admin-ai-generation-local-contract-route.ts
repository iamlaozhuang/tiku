import { createHash, randomUUID } from "node:crypto";

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
  AdminAiGenerationLocalContractRuntimeBridgeDto,
  AdminAiGenerationLocalContractTaskPersistenceDto,
  AdminAiGenerationTaskHistoryDto,
  AdminAiGenerationTaskHistoryGeneratedResultDto,
  AdminAiGenerationTaskHistoryItemDto,
  AdminAiGenerationRuntimeBridgeExecutionSummaryDto,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type {
  AdminAiGenerationResultDto,
  AdminAiGenerationResultHistoryQuery,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  CreateAdminAiGenerationResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import type {
  AdminAiGenerationRouteIntegratedProviderExecutionControl,
  AdminAiGenerationRuntimeBridgeDto,
  AdminAiGenerationRuntimeBridgeInput,
} from "../contracts/admin-ai-generation-runtime-bridge-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedProfession,
  AiGenerationRouteIntegratedSubject,
} from "../contracts/route-integrated-provider-execution-contract";
import type {
  AdminAiGenerationTaskHistoryQuery,
  AdminAiGenerationTaskPersistenceDto,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminRole } from "../models/auth";
import type { AiGenerationTaskType } from "../models/ai-generation-task";
import { createPostgresAdminAiGenerationTaskPersistenceRepository } from "../repositories/admin-ai-generation-task-persistence-db-adapter";
import { createPostgresAdminAiGenerationResultPersistenceRepository } from "../repositories/admin-ai-generation-result-persistence-db-adapter";
import { buildAiGenerationTaskRequestPolicyReadModel } from "./ai-generation-task-request-service";
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

export type { AdminAiGenerationWorkspace };

export type AdminAiGenerationLocalContractRouteOptions = {
  createRequestPublicId?: (
    input: AdminAiGenerationRequestPublicIdInput,
  ) => string;
  requestClock?: () => Date;
  sessionService?: Pick<SessionService, "getCurrentSession">;
  runtimeBridgeControl?: AdminAiGenerationRuntimeBridgeControl;
  resultPersistenceRepository?: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
};

type AdminAiGenerationActor = {
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary;
  publicId: string;
  roles: AdminRole[];
};

type ServiceComputedOrganizationAiGenerationCapability =
  AdminWorkspaceCapabilitySummary & {
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
  taskPublicId?: string | null;
  workspace: AdminAiGenerationWorkspace;
};

type AdminAiGenerationProviderDisabledRuntimeBridgeOutcome = {
  blockedReasons?: string[];
  executionSummary?: AdminAiGenerationRuntimeBridgeExecutionSummaryDto;
};

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
const unacceptableAdminAiGenerationResultResponse = createErrorResponse(
  ADMIN_AI_GENERATION_UNACCEPTABLE_RESULT_CODE,
  "Admin AI generation requires sufficient grounded structured output.",
);

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

function normalizeRouteIntegratedQuestionCount(value: unknown): number | null {
  const parsedCount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  return parsedCount !== null &&
    Number.isInteger(parsedCount) &&
    parsedCount > 0 &&
    parsedCount <= 100
    ? parsedCount
    : null;
}

function normalizeRouteIntegratedGenerationParameters(
  value: unknown,
): AiGenerationRouteIntegratedGenerationParameters | null {
  if (!isRecord(value)) {
    return null;
  }

  const profession = normalizeRouteIntegratedProfession(value.profession);
  const level = normalizeRouteIntegratedLevel(value.level);
  const subject = normalizeRouteIntegratedSubject(value.subject);
  const questionCount = normalizeRouteIntegratedQuestionCount(
    value.questionCount,
  );

  if (
    profession === null ||
    level === null ||
    subject === null ||
    questionCount === null
  ) {
    return null;
  }

  return {
    profession,
    level,
    subject,
    knowledgeNode: normalizeOptionalText(value.knowledgeNode),
    questionType: normalizeOptionalText(value.questionType),
    questionCount,
    difficulty: normalizeOptionalText(value.difficulty),
    learningObjective: normalizeOptionalText(value.learningObjective),
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

  if (
    capabilitySummary === undefined ||
    capabilitySummary.capabilitySource !== "service_computed" ||
    capabilitySummary.organizationAuthorizationSource !== "org_auth" ||
    capabilitySummary.organizationPublicId === null ||
    capabilitySummary.organizationEffectiveEdition !== "advanced" ||
    capabilitySummary.canUseOrganizationAdvancedWorkspace !== true
  ) {
    return null;
  }

  return capabilitySummary as ServiceComputedOrganizationAiGenerationCapability;
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
): AiGenerationTaskType {
  return generationKind === "question"
    ? "ai_question_generation"
    : "ai_paper_generation";
}

function createTaskPublicId(input: {
  actorPublicId: string;
  generationKind: AdminAiGenerationKind;
  requestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
}): string {
  return [
    "admin_ai_generation_task",
    input.workspace,
    input.generationKind,
    input.actorPublicId,
    createPublicIdScopeSegment(input.requestPublicId),
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
    randomUUID().replaceAll("-", ""),
  ].join("_");
}

function createAdminAiGenerationPolicyInput(input: {
  actor: AdminAiGenerationActor;
  generationKind: AdminAiGenerationKind;
  requestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
}) {
  const taskType = resolveTaskType(input.generationKind);
  const taskPublicId = createTaskPublicId({
    actorPublicId: input.actor.publicId,
    generationKind: input.generationKind,
    requestPublicId: input.requestPublicId,
    workspace: input.workspace,
  });
  const idempotencyScopeSegment = createPublicIdScopeSegment(
    input.requestPublicId,
  );

  if (input.workspace === "content") {
    return {
      taskPublicId,
      taskType,
      actorPublicId: input.actor.publicId,
      authorizationSource: "admin_role",
      authorizationPublicId: "admin_role_content_ai_generation",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
      quotaOwnerType: "platform",
      quotaOwnerPublicId: "platform_content_review_pool",
      effectiveEdition: "advanced",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
      idempotencyKeyHash: `sha256:content_${input.generationKind}_${input.actor.publicId}_${idempotencyScopeSegment}`,
      existingTaskPublicId: null,
      existingTaskStatus: null,
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      auditLogPublicId: null,
      aiCallLogPublicId: null,
    };
  }

  const organizationPublicId =
    resolveServiceComputedOrganizationAiGenerationCapability(input.actor)
      ?.organizationPublicId ?? null;

  return {
    taskPublicId,
    taskType,
    actorPublicId: input.actor.publicId,
    authorizationSource: "org_auth",
    authorizationPublicId: `org_auth_local_contract_${organizationPublicId}`,
    ownerType: "organization",
    ownerPublicId: organizationPublicId,
    organizationPublicId,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: organizationPublicId,
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: `sha256:organization_${input.generationKind}_${input.actor.publicId}_${idempotencyScopeSegment}`,
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
  };
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
): AdminAiGenerationLocalContractRuntimeBridgeDto {
  const runtimeBridge = buildAdminAiGenerationRuntimeBridgeReadModel(input);

  return mapAdminAiGenerationRuntimeBridgeReadModelToLocalContract(
    runtimeBridge,
  );
}

function mapAdminAiGenerationRuntimeBridgeReadModelToLocalContract(
  runtimeBridge: AdminAiGenerationRuntimeBridgeDto,
): AdminAiGenerationLocalContractRuntimeBridgeDto {
  return {
    bridgeStatus: runtimeBridge.bridgeStatus,
    providerCallExecuted: runtimeBridge.providerCallExecuted,
    envSecretAccessed: runtimeBridge.envSecretAccessed,
    providerConfigurationRead: runtimeBridge.providerConfigurationRead,
    costCalibrationExecuted: runtimeBridge.costCalibrationExecuted,
    executionSummary: runtimeBridge.providerExecutionSummary,
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

async function resolveAdminAiGenerationRuntimeBridge(input: {
  runtimeBridgeControl: AdminAiGenerationRuntimeBridgeControl | undefined;
  runtimeBridgeInput: AdminAiGenerationRuntimeBridgeInput;
}): Promise<AdminAiGenerationLocalContractRuntimeBridgeDto> {
  if (
    input.runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    input.runtimeBridgeControl.explicitLocalSwitchPresent === true &&
    input.runtimeBridgeControl.providerExecution !== undefined
  ) {
    return mapAdminAiGenerationRuntimeBridgeReadModelToLocalContract(
      await buildAdminAiGenerationRuntimeBridgeReadModelForRoute(
        input.runtimeBridgeInput,
        {
          runtimeBridgeControl: {
            bridgeMode: "controlled_runner",
            explicitLocalSwitchPresent: true,
            providerExecution: input.runtimeBridgeControl.providerExecution,
          },
        },
      ),
    );
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
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
  requestClock: () => Date;
  runtimeBridgeControl: AdminAiGenerationRuntimeBridgeControl | undefined;
  taskPersistenceRepository: AdminAiGenerationTaskPersistenceRepository;
  resultPersistenceRepository: AdminAiGenerationResultPersistenceRepository;
  workspace: AdminAiGenerationWorkspace;
}): Promise<ApiResponse<AdminAiGenerationLocalContractDto | null>> {
  const requestedAt = input.requestClock();
  const requestPublicId = input.createRequestPublicId({
    actorPublicId: input.actor.publicId,
    generationKind: input.generationKind,
    taskPublicId: null,
    workspace: input.workspace,
  });
  const taskRequestResponse = buildAiGenerationTaskRequestPolicyReadModel(
    createAdminAiGenerationPolicyInput({
      ...input,
      requestPublicId,
    }),
  );

  if (taskRequestResponse.code !== 0 || taskRequestResponse.data === null) {
    return invalidAdminAiGenerationRequestResponse;
  }

  const taskRequest = taskRequestResponse.data;
  const resultPublicId = createAdminAiGenerationResultPublicId(
    taskRequest.taskPublicId,
  );
  const runtimeBridge = await resolveAdminAiGenerationRuntimeBridge({
    runtimeBridgeControl: input.runtimeBridgeControl,
    runtimeBridgeInput: createAdminAiGenerationRuntimeBridgeInput({
      actor: input.actor,
      generationKind: input.generationKind,
      generationParameters: input.generationParameters,
      requestPublicId,
      resultPublicId,
      taskRequest,
      workspace: input.workspace,
    }),
  });
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
    return unacceptableAdminAiGenerationResultResponse;
  }

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
    runtimeBridge,
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
  } satisfies AdminAiGenerationLocalContractBaseDto;

  const taskPersistence =
    await input.taskPersistenceRepository.createOrReuseTask({
      localContract,
      requestPublicId,
      requestedAt,
    });
  const generatedResult =
    await input.resultPersistenceRepository.createOrReuseDraftResult(
      createAdminAiGenerationLocalContractResultInput({
        localContract,
        taskPersistence,
        createdAt: requestedAt,
      }),
    );

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

function mapAdminAiGenerationTaskPersistenceResultToLocalContractDto(input: {
  generatedResult: AdminAiGenerationResultPersistenceResult;
  taskPersistence: AdminAiGenerationTaskPersistenceResult;
}): AdminAiGenerationLocalContractTaskPersistenceDto {
  const result = input.taskPersistence;

  return {
    persistenceStatus: result.persistenceStatus,
    requestPublicId: result.task.requestPublicId,
    taskPublicId: result.task.taskPublicId,
    status: "succeeded",
    resultPublicId: input.generatedResult.result.resultPublicId,
    contentVisibility: result.task.contentVisibility,
    evidenceStatus:
      input.generatedResult.result.evidenceReference.evidenceStatus,
    citationCount: input.generatedResult.result.evidenceReference.citationCount,
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
  localContract: AdminAiGenerationLocalContractBaseDto;
  taskPersistence: AdminAiGenerationTaskPersistenceResult;
  createdAt: Date;
}): CreateAdminAiGenerationResultInput {
  const task = input.taskPersistence.task;
  const contentRedactedSnapshot =
    createAdminAiGenerationLocalContractRedactedSnapshot(input.localContract);

  return {
    resultPublicId: createAdminAiGenerationResultPublicId(task.taskPublicId),
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
    citationRedactedSnapshot: null,
    evidenceStatus:
      input.localContract.runtimeBridge.visibleGeneratedContent
        ?.groundingSummary?.evidenceStatus ?? "none",
    citationCount:
      input.localContract.runtimeBridge.visibleGeneratedContent
        ?.groundingSummary?.citationCount ?? 0,
    aiCallLogPublicId: null,
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    createdAt: input.createdAt,
  };
}

function createAdminAiGenerationResultPublicId(taskPublicId: string): string {
  const taskPrefix = "admin_ai_generation_task_";

  return taskPublicId.startsWith(taskPrefix)
    ? `admin_ai_generation_result_${taskPublicId.slice(taskPrefix.length)}`
    : `${taskPublicId}_result`;
}

function createAdminAiGenerationLocalContractRedactedSnapshot(
  localContract: AdminAiGenerationLocalContractBaseDto,
) {
  return {
    redactionStatus: "redacted",
    summaryKind: "admin_ai_generation_local_contract",
    runtimeStatus: localContract.runtimeStatus,
    workspace: localContract.workspace,
    generationKind: localContract.generationKind,
    taskType: localContract.taskRequest.taskType,
    resultKind: localContract.taskRequest.resultReference.resultKind,
    contentVisibility: localContract.resultState.contentVisibility,
    providerCallExecuted: localContract.runtimeBridge.providerCallExecuted,
    runtimeBridgeStatus: localContract.runtimeBridge.bridgeStatus,
    formalQuestionWriteStatus:
      localContract.formalContentBoundary.questionWriteStatus,
    formalPaperWriteStatus:
      localContract.formalContentBoundary.paperWriteStatus,
    organizationDraftAdoptionStatus:
      localContract.organizationOwnedDraftBoundary
        .organizationDraftAdoptionStatus,
    organizationTrainingSourceStatus:
      localContract.organizationOwnedDraftBoundary
        .organizationTrainingSourceStatus,
    platformFormalDraftStatus:
      localContract.organizationOwnedDraftBoundary.platformFormalDraftStatus,
    publishStatus: localContract.organizationOwnedDraftBoundary.publishStatus,
    studentVisibleStatus:
      localContract.organizationOwnedDraftBoundary.studentVisibleStatus,
  };
}

function createAdminAiGenerationContentDigest(
  redactedSnapshot: Record<string, unknown>,
): string {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(redactedSnapshot))
    .digest("hex")}`;
}

function mapAdminAiGenerationResultDtoToHistoryGeneratedResult(
  result: AdminAiGenerationResultDto,
): AdminAiGenerationTaskHistoryGeneratedResultDto {
  return {
    resultPublicId: result.resultPublicId,
    persistedAt: result.persistedAt,
    status: result.status,
    contentPreviewMasked: result.contentReference.contentPreviewMasked,
    contentVisibility: result.contentReference.contentVisibility,
    evidenceStatus: result.evidenceReference.evidenceStatus,
    citationCount: result.evidenceReference.citationCount,
    formalAdoptionStatus: result.formalAdoption.status,
    redactionStatus: result.contentReference.redactionStatus,
  };
}

function mapAdminAiGenerationTaskPersistenceDtoToHistoryItem(
  task: AdminAiGenerationTaskPersistenceDto,
  generatedResult: AdminAiGenerationResultDto | null,
): AdminAiGenerationTaskHistoryItemDto {
  return {
    requestPublicId: task.requestPublicId,
    taskPublicId: task.taskPublicId,
    taskType: task.taskType,
    generationKind: task.generationKind,
    status: task.status,
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
    generatedResult:
      generatedResult === null
        ? null
        : mapAdminAiGenerationResultDtoToHistoryGeneratedResult(
            generatedResult,
          ),
    redactionStatus: task.redactionStatus,
  };
}

function resolveAdminAiGenerationResultHistoryQuery(
  historyQuery: AdminAiGenerationTaskHistoryQuery,
): AdminAiGenerationResultHistoryQuery | null {
  if (
    historyQuery.ownerType !== "platform" &&
    historyQuery.ownerType !== "organization"
  ) {
    return null;
  }

  return {
    workspace: historyQuery.workspace,
    ownerType: historyQuery.ownerType,
    ownerPublicId: historyQuery.ownerPublicId,
    generationKind: historyQuery.generationKind,
    page: historyQuery.page,
    pageSize: historyQuery.pageSize,
    limit: historyQuery.limit,
    offset: historyQuery.offset,
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

  const generatedResultHistoryQuery =
    resolveAdminAiGenerationResultHistoryQuery(historyQuery);

  if (generatedResultHistoryQuery === null) {
    return adminAiGenerationPermissionDeniedResponse;
  }

  const [taskHistoryItems, generatedResults] = await Promise.all([
    input.taskPersistenceRepository.listTaskHistory(historyQuery),
    input.resultPersistenceRepository.listDraftResults(
      generatedResultHistoryQuery,
    ),
  ]);
  const generatedResultsByTaskPublicId = new Map(
    generatedResults.map((result) => [result.taskPublicId, result]),
  );
  const historyItems = taskHistoryItems.map((task) =>
    mapAdminAiGenerationTaskPersistenceDtoToHistoryItem(
      task,
      generatedResultsByTaskPublicId.get(task.taskPublicId) ?? null,
    ),
  );
  const historyTotal =
    input.taskPersistenceRepository.countTaskHistory === undefined
      ? historyItems.length
      : await input.taskPersistenceRepository.countTaskHistory(historyQuery);

  return createPaginatedResponse(
    {
      workspace: input.workspace,
      latestTask: historyItems[0] ?? null,
      items: historyItems,
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
          normalizeRouteIntegratedGenerationParameters(
            isRecord(body) ? body.generationParameters : null,
          );

        if (generationKind === null || generationParameters === null) {
          return createJsonResponse(invalidAdminAiGenerationRequestResponse);
        }

        if (!canUseAdminAiGeneration(workspace, actor)) {
          return createJsonResponse(adminAiGenerationPermissionDeniedResponse);
        }

        return createJsonResponse(
          await buildAdminAiGenerationLocalContract({
            actor,
            createRequestPublicId,
            generationKind,
            generationParameters,
            requestClock,
            resultPersistenceRepository,
            runtimeBridgeControl: options.runtimeBridgeControl,
            taskPersistenceRepository,
            workspace,
          }),
        );
      },
    },
  });
}
