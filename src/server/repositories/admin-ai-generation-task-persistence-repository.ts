import type {
  AdminAiGenerationPersistenceTaskType,
  AdminAiGenerationTaskPersistenceDto,
  AdminAiGenerationTaskPersistenceGateway,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceRow,
  CreateAdminAiGenerationTaskPersistenceInput,
  CreateOrReuseAdminAiGenerationTaskInput,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminAiGenerationLocalContractDto } from "../contracts/admin-ai-generation-local-contract";
import type { AiGenerationTaskType } from "../models/ai-generation-task";
import type { AiGenerationTaskResultKind } from "../models/ai-generation-task-request";

export const ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES = [
  "ai_question_generation",
  "ai_paper_generation",
] as const satisfies readonly AdminAiGenerationPersistenceTaskType[];

const UNSAFE_ADMIN_AI_GENERATION_PERSISTENCE_BOUNDARY_ERROR =
  "unsafe admin AI generation task persistence boundary";

export function createAdminAiGenerationTaskPersistenceRepository(
  gateway: AdminAiGenerationTaskPersistenceGateway,
): AdminAiGenerationTaskPersistenceRepository {
  return {
    async createOrReuseTask(input) {
      const createInput = createAdminAiGenerationTaskPersistenceInput(input);
      const existingRow = await gateway.findTaskByIdempotencyKey({
        ownerType: createInput.ownerType,
        ownerPublicId: createInput.ownerPublicId,
        idempotencyKeyHash: createInput.idempotencyKeyHash,
        taskTypes: ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
      });

      if (existingRow !== null) {
        return {
          persistenceStatus: "reused",
          task: mapAdminAiGenerationTaskPersistenceRowToDto(existingRow),
        };
      }

      const insertedRow = await gateway.insertPendingTask(
        createServerOwnedPendingTaskInput(createInput),
      );
      const resolvedRow =
        insertedRow ??
        (await gateway.findTaskByIdempotencyKey({
          ownerType: createInput.ownerType,
          ownerPublicId: createInput.ownerPublicId,
          idempotencyKeyHash: createInput.idempotencyKeyHash,
          taskTypes: ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
        }));

      if (resolvedRow === null) {
        throw new Error("admin AI generation task persistence failed.");
      }

      return {
        persistenceStatus: insertedRow === null ? "reused" : "created",
        task: mapAdminAiGenerationTaskPersistenceRowToDto(resolvedRow),
      };
    },
  };
}

export function createAdminAiGenerationTaskPersistenceInput(
  input: CreateOrReuseAdminAiGenerationTaskInput,
): CreateAdminAiGenerationTaskPersistenceInput {
  assertAcceptedProviderDisabledAdminLocalContract(input.localContract);

  const taskRequest = input.localContract.taskRequest;
  const taskType = resolveAdminAiGenerationPersistenceTaskType(
    taskRequest.taskType,
  );

  return {
    requestPublicId: input.requestPublicId,
    taskPublicId: taskRequest.taskPublicId,
    taskType,
    workspace: input.localContract.workspace,
    generationKind: input.localContract.generationKind,
    taskStatus: "pending",
    requestedAt: input.requestedAt,
    authorizationSource: taskRequest.authorizationSource,
    authorizationPublicId: taskRequest.authorizationPublicId,
    actorPublicId: taskRequest.actorPublicId,
    ownerType: taskRequest.ownerType,
    ownerPublicId: taskRequest.ownerPublicId,
    organizationPublicId: taskRequest.organizationPublicId,
    quotaOwnerType: taskRequest.quotaOwnerType,
    quotaOwnerPublicId: taskRequest.quotaOwnerPublicId,
    effectiveEdition: "advanced",
    idempotencyKeyHash: taskRequest.idempotency.keyHash,
    resultKind: taskRequest.resultReference.resultKind,
    resultPublicId: null,
    contentVisibility: "summary_only",
    evidenceStatus: "none",
    citationCount: 0,
    aiCallLogPublicId: null,
    runtimeStatus: input.localContract.runtimeStatus,
    runtimeBridgeStatus: input.localContract.runtimeBridge.bridgeStatus,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    costCalibrationExecuted: false,
    questionWriteStatus:
      input.localContract.formalContentBoundary.questionWriteStatus,
    paperWriteStatus:
      input.localContract.formalContentBoundary.paperWriteStatus,
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    redactionStatus: "redacted",
  };
}

export function mapAdminAiGenerationTaskPersistenceRowToDto(
  row: AdminAiGenerationTaskPersistenceRow,
): AdminAiGenerationTaskPersistenceDto {
  return {
    requestPublicId: row.request_public_id,
    taskPublicId: row.public_id,
    taskType: row.task_type,
    workspace: row.workspace,
    generationKind: row.generation_kind,
    status: row.task_status,
    requestedAt: row.requested_at.toISOString(),
    authorizationSource: row.authorization_source,
    authorizationPublicId: row.authorization_public_id,
    actorPublicId: row.actor_public_id,
    ownerType: row.owner_type,
    ownerPublicId: row.owner_public_id,
    organizationPublicId: row.organization_public_id,
    quotaOwnerType: row.quota_owner_type,
    quotaOwnerPublicId: row.quota_owner_public_id,
    resultPublicId: row.result_public_id,
    evidenceStatus: row.evidence_status,
    citationCount: row.citation_count,
    aiCallLogPublicId: row.ai_call_log_public_id,
    runtimeStatus: row.runtime_status,
    runtimeBridgeStatus: row.runtime_bridge_status,
    providerCallExecuted: row.provider_call_executed,
    envSecretAccessed: row.env_secret_accessed,
    providerConfigurationRead: row.provider_configuration_read,
    costCalibrationExecuted: row.cost_calibration_executed,
    formalContentBoundary: {
      questionWriteStatus: row.question_write_status,
      paperWriteStatus: row.paper_write_status,
    },
    sourceQuestionPublicId: row.source_question_public_id,
    sourcePaperPublicId: row.source_paper_public_id,
    contentVisibility: "summary_only",
    redactionStatus: row.redaction_status,
  };
}

function createServerOwnedPendingTaskInput(
  input: CreateAdminAiGenerationTaskPersistenceInput,
): CreateAdminAiGenerationTaskPersistenceInput {
  return {
    ...input,
    taskStatus: "pending",
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    aiCallLogPublicId: null,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    costCalibrationExecuted: false,
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    redactionStatus: "redacted",
  };
}

function assertAcceptedProviderDisabledAdminLocalContract(
  localContract: AdminAiGenerationLocalContractDto,
): void {
  const taskRequest = localContract.taskRequest;
  const resultReference = taskRequest.resultReference;
  const runtimeBridge = localContract.runtimeBridge;
  const executionSummary = runtimeBridge.executionSummary;

  const isAcceptedLocalContract =
    localContract.runtimeStatus === "local_contract_only" &&
    localContract.flowStatus === "accepted" &&
    localContract.redactionStatus === "redacted" &&
    taskRequest.runtimeStatus === "local_contract_only" &&
    taskRequest.decision === "create_pending_task" &&
    taskRequest.initialStatus === "pending" &&
    taskRequest.blockedFailureCategory === null &&
    localContract.resultState.status === "pending" &&
    localContract.resultState.resultPublicId === null &&
    localContract.resultState.contentVisibility === "summary_only" &&
    localContract.resultState.evidenceStatus === "none" &&
    localContract.resultState.citationCount === 0 &&
    localContract.resultState.redactionStatus === "redacted" &&
    resultReference.resultPublicId === null &&
    resultReference.contentVisibility === "summary_only" &&
    resultReference.evidenceStatus === "none" &&
    resultReference.citationCount === 0 &&
    resultReference.redactionStatus === "redacted";

  const isProviderDisabled =
    runtimeBridge.bridgeStatus === "provider_call_blocked" &&
    runtimeBridge.providerCallExecuted === false &&
    runtimeBridge.envSecretAccessed === false &&
    runtimeBridge.providerConfigurationRead === false &&
    runtimeBridge.costCalibrationExecuted === false &&
    runtimeBridge.redactionStatus === "redacted" &&
    executionSummary.requestCount === 0 &&
    executionSummary.resultStatus === "blocked" &&
    executionSummary.failureCategory === "provider_call_blocked" &&
    executionSummary.usageSummary === null &&
    executionSummary.providerErrorSummary === null &&
    executionSummary.redactionStatus === "redacted";

  const isFormalWriteBlocked =
    localContract.formalContentBoundary.questionWriteStatus ===
      "blocked_without_follow_up_task" &&
    localContract.formalContentBoundary.paperWriteStatus ===
      "blocked_without_follow_up_task";

  const isAdminOwnerBoundary =
    matchesContentAdminOwnerBoundary(localContract) ||
    matchesOrganizationAdminOwnerBoundary(localContract);

  if (
    !isAcceptedLocalContract ||
    !isProviderDisabled ||
    !isFormalWriteBlocked ||
    !isAdminOwnerBoundary
  ) {
    throw new Error(UNSAFE_ADMIN_AI_GENERATION_PERSISTENCE_BOUNDARY_ERROR);
  }
}

function matchesContentAdminOwnerBoundary(
  localContract: AdminAiGenerationLocalContractDto,
): boolean {
  const taskRequest = localContract.taskRequest;

  return (
    localContract.workspace === "content" &&
    taskRequest.authorizationSource === "admin_role" &&
    taskRequest.ownerType === "platform" &&
    taskRequest.quotaOwnerType === "platform" &&
    taskRequest.organizationPublicId === null &&
    taskRequest.ownerPublicId === taskRequest.quotaOwnerPublicId
  );
}

function matchesOrganizationAdminOwnerBoundary(
  localContract: AdminAiGenerationLocalContractDto,
): boolean {
  const taskRequest = localContract.taskRequest;

  return (
    localContract.workspace === "organization" &&
    taskRequest.authorizationSource === "org_auth" &&
    taskRequest.ownerType === "organization" &&
    taskRequest.quotaOwnerType === "organization" &&
    taskRequest.organizationPublicId !== null &&
    taskRequest.ownerPublicId === taskRequest.organizationPublicId &&
    taskRequest.quotaOwnerPublicId === taskRequest.organizationPublicId
  );
}

function resolveAdminAiGenerationPersistenceTaskType(
  taskType: AiGenerationTaskType,
): AdminAiGenerationPersistenceTaskType {
  if (
    ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES.includes(
      taskType as AdminAiGenerationPersistenceTaskType,
    )
  ) {
    return taskType as AdminAiGenerationPersistenceTaskType;
  }

  throw new Error(UNSAFE_ADMIN_AI_GENERATION_PERSISTENCE_BOUNDARY_ERROR);
}

export function resolveAdminAiGenerationPersistenceResultKind(
  taskType: AdminAiGenerationPersistenceTaskType,
): AiGenerationTaskResultKind {
  return taskType === "ai_question_generation"
    ? "ai_generated_question_set"
    : "ai_generated_paper_draft";
}
