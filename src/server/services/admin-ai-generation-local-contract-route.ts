import { randomUUID } from "node:crypto";

import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationLocalContractBaseDto,
  AdminAiGenerationLocalContractDto,
  AdminAiGenerationLocalContractRuntimeBridgeDto,
  AdminAiGenerationLocalContractTaskPersistenceDto,
  AdminAiGenerationTaskHistoryDto,
  AdminAiGenerationTaskHistoryItemDto,
  AdminAiGenerationRuntimeBridgeExecutionSummaryDto,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type {
  AdminAiGenerationTaskHistoryQuery,
  AdminAiGenerationTaskPersistenceDto,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminRole } from "../models/auth";
import type { AiGenerationTaskType } from "../models/ai-generation-task";
import { createPostgresAdminAiGenerationTaskPersistenceRepository } from "../repositories/admin-ai-generation-task-persistence-db-adapter";
import { buildAiGenerationTaskRequestPolicyReadModel } from "./ai-generation-task-request-service";
import { createDefaultBlockedRouteIntegratedProviderExecutionOutcome } from "./personal-ai-generation-route-integrated-provider-execution-service";
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
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
};

type AdminAiGenerationActor = {
  publicId: string;
  roles: AdminRole[];
  organizationPublicId: string | null;
};

type AdminAiGenerationRuntimeBridgeControlInput = {
  actorPublicId: string;
  organizationPublicId: string | null;
  generationKind: AdminAiGenerationKind;
  workspace: AdminAiGenerationWorkspace;
};

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

function createDefaultAdminAiGenerationRuntimeBridge(): AdminAiGenerationLocalContractRuntimeBridgeDto {
  const providerDisabledOutcome =
    createDefaultBlockedRouteIntegratedProviderExecutionOutcome();

  return {
    bridgeStatus: "provider_call_blocked",
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    costCalibrationExecuted: false,
    executionSummary: providerDisabledOutcome.executionSummary,
    redactionStatus: "redacted",
    blockedReasons: [
      "provider_call_blocked",
      "env_secret_access_blocked",
      "cost_calibration_gate_blocked",
      "real_provider_execution_requires_follow_up_task",
    ],
  };
}

function ensureProviderDisabledExecutionSummary(
  executionSummary:
    | AdminAiGenerationRuntimeBridgeExecutionSummaryDto
    | undefined,
): AdminAiGenerationRuntimeBridgeExecutionSummaryDto {
  const defaultSummary =
    createDefaultBlockedRouteIntegratedProviderExecutionOutcome()
      .executionSummary;

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
  actor: AdminAiGenerationActor;
  generationKind: AdminAiGenerationKind;
  runtimeBridgeControl: AdminAiGenerationRuntimeBridgeControl | undefined;
  workspace: AdminAiGenerationWorkspace;
}): Promise<AdminAiGenerationLocalContractRuntimeBridgeDto> {
  const defaultRuntimeBridge = createDefaultAdminAiGenerationRuntimeBridge();
  const providerDisabledOutcome =
    await input.runtimeBridgeControl?.createProviderDisabledOutcome?.({
      actorPublicId: input.actor.publicId,
      organizationPublicId: input.actor.organizationPublicId,
      generationKind: input.generationKind,
      workspace: input.workspace,
    });

  if (!providerDisabledOutcome) {
    return defaultRuntimeBridge;
  }

  return {
    ...defaultRuntimeBridge,
    executionSummary: ensureProviderDisabledExecutionSummary(
      providerDisabledOutcome.executionSummary,
    ),
    blockedReasons:
      providerDisabledOutcome.blockedReasons ??
      defaultRuntimeBridge.blockedReasons,
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
  workspace: AdminAiGenerationWorkspace;
}): Promise<ApiResponse<AdminAiGenerationLocalContractDto | null>> {
  const taskRequestResponse = buildAiGenerationTaskRequestPolicyReadModel(
    createAdminAiGenerationPolicyInput(input),
  );

  if (taskRequestResponse.code !== 0 || taskRequestResponse.data === null) {
    return invalidAdminAiGenerationRequestResponse;
  }

  const taskRequest = taskRequestResponse.data;
  const runtimeBridge = await resolveAdminAiGenerationRuntimeBridge(input);

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
      requestPublicId: input.createRequestPublicId({
        actorPublicId: input.actor.publicId,
        generationKind: input.generationKind,
        taskPublicId: taskRequest.taskPublicId,
        workspace: input.workspace,
      }),
      requestedAt: input.requestClock(),
    });

  return createSuccessResponse({
    ...localContract,
    taskPersistence:
      mapAdminAiGenerationTaskPersistenceResultToLocalContractDto(
        taskPersistence,
      ),
  });
}

function mapAdminAiGenerationTaskPersistenceResultToLocalContractDto(
  result: AdminAiGenerationTaskPersistenceResult,
): AdminAiGenerationLocalContractTaskPersistenceDto {
  return {
    persistenceStatus: result.persistenceStatus,
    requestPublicId: result.task.requestPublicId,
    taskPublicId: result.task.taskPublicId,
    status: result.task.status,
    resultPublicId: result.task.resultPublicId,
    contentVisibility: result.task.contentVisibility,
    evidenceStatus: result.task.evidenceStatus,
    citationCount: result.task.citationCount,
    redactionStatus: result.task.redactionStatus,
  };
}

function mapAdminAiGenerationTaskPersistenceDtoToHistoryItem(
  task: AdminAiGenerationTaskPersistenceDto,
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
    redactionStatus: task.redactionStatus,
  };
}

async function listAdminAiGenerationTaskHistory(input: {
  actor: AdminAiGenerationActor;
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

  const historyItems = (
    await input.taskPersistenceRepository.listTaskHistory(historyQuery)
  ).map((task) => mapAdminAiGenerationTaskPersistenceDtoToHistoryItem(task));

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
            runtimeBridgeControl: options.runtimeBridgeControl,
            taskPersistenceRepository,
            workspace,
          }),
        );
      },
    },
  });
}
