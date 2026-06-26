import { createHash, randomUUID } from "node:crypto";

import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationLocalContractGeneratedResultDto,
  AdminAiGenerationLocalContractBaseDto,
  AdminAiGenerationLocalContractDto,
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
import type { AdminAiGenerationRuntimeBridgeInput } from "../contracts/admin-ai-generation-runtime-bridge-contract";
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
import { buildAdminAiGenerationRuntimeBridgeReadModel } from "./admin-ai-generation-runtime-bridge-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
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
  publicId: string;
  roles: AdminRole[];
  organizationPublicId: string | null;
};

type AdminAiGenerationRuntimeBridgeControlInput =
  AdminAiGenerationRuntimeBridgeInput;

type AdminAiGenerationRequestPublicIdInput = {
  actorPublicId: string;
  generationKind: AdminAiGenerationKind;
  taskPublicId: string;
  workspace: AdminAiGenerationWorkspace;
};

type AdminAiGenerationProviderDisabledRuntimeBridgeOutcome = {
  blockedReasons?: string[];
  executionSummary?: AdminAiGenerationRuntimeBridgeExecutionSummaryDto;
};

export type AdminAiGenerationRuntimeBridgeControl = {
  createProviderDisabledOutcome?: (
    input: AdminAiGenerationRuntimeBridgeControlInput,
  ) =>
    | AdminAiGenerationProviderDisabledRuntimeBridgeOutcome
    | Promise<AdminAiGenerationProviderDisabledRuntimeBridgeOutcome>;
};

const ADMIN_AI_GENERATION_PERMISSION_DENIED_CODE = 403011;
const ADMIN_AI_GENERATION_INVALID_INPUT_CODE = 400013;
const ADMIN_AI_GENERATION_HISTORY_LIMIT = 10;

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

function hasRole(actor: AdminAiGenerationActor, role: AdminRole): boolean {
  return actor.roles.includes(role);
}

function canUseAdminAiGeneration(
  workspace: AdminAiGenerationWorkspace,
  actor: AdminAiGenerationActor,
): boolean {
  if (workspace === "content") {
    return hasRole(actor, "super_admin") || hasRole(actor, "content_admin");
  }

  return (
    (hasRole(actor, "org_advanced_admin") || hasRole(actor, "super_admin")) &&
    actor.organizationPublicId !== null
  );
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
  workspace: AdminAiGenerationWorkspace;
}): string {
  return [
    "admin_ai_generation_task",
    input.workspace,
    input.generationKind,
    input.actorPublicId,
  ].join("_");
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
  workspace: AdminAiGenerationWorkspace;
}) {
  const taskType = resolveTaskType(input.generationKind);
  const taskPublicId = createTaskPublicId({
    actorPublicId: input.actor.publicId,
    generationKind: input.generationKind,
    workspace: input.workspace,
  });

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
      idempotencyKeyHash: `sha256:content_${input.generationKind}_${input.actor.publicId}`,
      existingTaskPublicId: null,
      existingTaskStatus: null,
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      auditLogPublicId: null,
      aiCallLogPublicId: null,
    };
  }

  const organizationPublicId = input.actor.organizationPublicId;

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
    idempotencyKeyHash: `sha256:organization_${input.generationKind}_${input.actor.publicId}`,
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
  workspace: AdminAiGenerationWorkspace;
}): AdminAiGenerationTaskHistoryQuery | null {
  if (input.workspace === "content") {
    return {
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      limit: ADMIN_AI_GENERATION_HISTORY_LIMIT,
    };
  }

  if (input.actor.organizationPublicId === null) {
    return null;
  }

  return {
    workspace: "organization",
    ownerType: "organization",
    ownerPublicId: input.actor.organizationPublicId,
    limit: ADMIN_AI_GENERATION_HISTORY_LIMIT,
  };
}

function createDefaultAdminAiGenerationRuntimeBridge(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationLocalContractRuntimeBridgeDto {
  const runtimeBridge = buildAdminAiGenerationRuntimeBridgeReadModel(input);

  return {
    bridgeStatus: "provider_call_blocked",
    providerCallExecuted: runtimeBridge.providerCallExecuted,
    envSecretAccessed: runtimeBridge.envSecretAccessed,
    providerConfigurationRead: runtimeBridge.providerConfigurationRead,
    costCalibrationExecuted: runtimeBridge.costCalibrationExecuted,
    executionSummary: runtimeBridge.providerExecutionSummary,
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
  };
}

async function buildAdminAiGenerationLocalContract(input: {
  actor: AdminAiGenerationActor;
  createRequestPublicId: (
    requestPublicIdInput: AdminAiGenerationRequestPublicIdInput,
  ) => string;
  generationKind: AdminAiGenerationKind;
  requestClock: () => Date;
  runtimeBridgeControl: AdminAiGenerationRuntimeBridgeControl | undefined;
  taskPersistenceRepository: AdminAiGenerationTaskPersistenceRepository;
  resultPersistenceRepository: AdminAiGenerationResultPersistenceRepository;
  workspace: AdminAiGenerationWorkspace;
}): Promise<ApiResponse<AdminAiGenerationLocalContractDto | null>> {
  const taskRequestResponse = buildAiGenerationTaskRequestPolicyReadModel(
    createAdminAiGenerationPolicyInput(input),
  );

  if (taskRequestResponse.code !== 0 || taskRequestResponse.data === null) {
    return invalidAdminAiGenerationRequestResponse;
  }

  const taskRequest = taskRequestResponse.data;
  const requestedAt = input.requestClock();
  const requestPublicId = input.createRequestPublicId({
    actorPublicId: input.actor.publicId,
    generationKind: input.generationKind,
    taskPublicId: taskRequest.taskPublicId,
    workspace: input.workspace,
  });
  const resultPublicId = createAdminAiGenerationResultPublicId(
    taskRequest.taskPublicId,
  );
  const runtimeBridge = await resolveAdminAiGenerationRuntimeBridge({
    runtimeBridgeControl: input.runtimeBridgeControl,
    runtimeBridgeInput: createAdminAiGenerationRuntimeBridgeInput({
      actor: input.actor,
      generationKind: input.generationKind,
      requestPublicId,
      resultPublicId,
      taskRequest,
      workspace: input.workspace,
    }),
  });

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
    contentPreviewMasked: "redacted admin AI generation local contract summary",
    citationRedactedSnapshot: null,
    evidenceStatus: "none",
    citationCount: 0,
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
    providerCallExecuted: false,
    runtimeBridgeStatus: localContract.runtimeBridge.bridgeStatus,
    formalQuestionWriteStatus:
      localContract.formalContentBoundary.questionWriteStatus,
    formalPaperWriteStatus:
      localContract.formalContentBoundary.paperWriteStatus,
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
    runtimeStatus: task.runtimeStatus,
    runtimeBridgeStatus: task.runtimeBridgeStatus,
    providerCallExecuted: task.providerCallExecuted,
    envSecretAccessed: task.envSecretAccessed,
    providerConfigurationRead: task.providerConfigurationRead,
    costCalibrationExecuted: task.costCalibrationExecuted,
    formalContentBoundary: task.formalContentBoundary,
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
    limit: historyQuery.limit,
  };
}

async function listAdminAiGenerationTaskHistory(input: {
  actor: AdminAiGenerationActor;
  resultPersistenceRepository: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository: AdminAiGenerationTaskPersistenceRepository;
  workspace: AdminAiGenerationWorkspace;
}): Promise<ApiResponse<AdminAiGenerationTaskHistoryDto | null>> {
  const historyQuery = resolveAdminAiGenerationTaskHistoryQuery({
    actor: input.actor,
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

  return createSuccessResponse({
    workspace: input.workspace,
    latestTask: historyItems[0] ?? null,
    items: historyItems,
    redactionStatus: "redacted",
  });
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
    publicId,
    roles,
    organizationPublicId: sessionResponse.data.user.organizationPublicId,
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

        return createJsonResponse(
          await listAdminAiGenerationTaskHistory({
            actor,
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

        if (generationKind === null) {
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
