import { createHash } from "node:crypto";

import type {
  AdminAiGenerationPersistenceTaskType,
  AdminAiGenerationTaskPersistenceDto,
  AdminAiGenerationTaskPersistenceGateway,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceRow,
  CreateAdminAiGenerationTaskPersistenceInput,
  CreateOrReuseAdminAiGenerationTaskInput,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminAiGenerationLocalContractBaseDto } from "../contracts/admin-ai-generation-local-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";
import type { AiGenerationTaskType } from "../models/ai-generation-task";
import { createAiGenerationTaskLifecycleProjection } from "./ai-generation-task-lifecycle-repository";
import type { AiGenerationTaskResultKind } from "../models/ai-generation-task-request";

export const ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES = [
  "ai_question_generation",
  "ai_paper_generation",
] as const satisfies readonly AdminAiGenerationPersistenceTaskType[];

const UNSAFE_ADMIN_AI_GENERATION_PERSISTENCE_BOUNDARY_ERROR =
  "unsafe admin AI generation task persistence boundary";

export class AdminAiGenerationSnapshotConflictError extends Error {
  constructor() {
    super("admin AI generation idempotency snapshot conflict.");
    this.name = "AdminAiGenerationSnapshotConflictError";
  }
}

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
        assertMatchingAdminAiGenerationSnapshot(existingRow, createInput);
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

      assertMatchingAdminAiGenerationSnapshot(resolvedRow, createInput);

      return {
        persistenceStatus: insertedRow === null ? "reused" : "created",
        task: mapAdminAiGenerationTaskPersistenceRowToDto(resolvedRow),
      };
    },
    async listTaskHistory(query) {
      const rows = await gateway.listTaskHistory(query);

      return rows.map((row) =>
        mapAdminAiGenerationTaskPersistenceRowToDto(row),
      );
    },
    countTaskHistory:
      gateway.countTaskHistory === undefined
        ? undefined
        : async (query) => gateway.countTaskHistory?.(query) ?? 0,
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
  const snapshot = createAdminAiGenerationSnapshotEnvelope({
    ...input,
    taskType,
  });

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
    providerCallExecuted:
      input.localContract.runtimeBridge.providerCallExecuted,
    envSecretAccessed: input.localContract.runtimeBridge.envSecretAccessed,
    providerConfigurationRead:
      input.localContract.runtimeBridge.providerConfigurationRead,
    costCalibrationExecuted: false,
    questionWriteStatus:
      input.localContract.formalContentBoundary.questionWriteStatus,
    paperWriteStatus:
      input.localContract.formalContentBoundary.paperWriteStatus,
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    redactionStatus: "redacted",
    ...snapshot,
  };
}

function compareCanonicalStrings(
  leftValue: string,
  rightValue: string,
): number {
  return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
}

function canonicalizeJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJsonValue);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([leftKey], [rightKey]) =>
        compareCanonicalStrings(leftKey, rightKey),
      )
      .map(([key, childValue]) => [key, canonicalizeJsonValue(childValue)]),
  );
}

function stringifyCanonicalJson(value: unknown): string {
  return JSON.stringify(canonicalizeJsonValue(value));
}

function canonicalizeGenerationParameters(
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
): AiGenerationRouteIntegratedGenerationParameters {
  return {
    profession: generationParameters.profession,
    level: generationParameters.level,
    subject: generationParameters.subject,
    knowledgeNode: generationParameters.knowledgeNode,
    knowledgeNodeMode: generationParameters.knowledgeNodeMode,
    knowledgeNodePublicIds: [
      ...new Set(generationParameters.knowledgeNodePublicIds),
    ].sort(compareCanonicalStrings),
    includeDescendants: generationParameters.includeDescendants,
    knowledgeNodeSupplement: generationParameters.knowledgeNodeSupplement,
    sourcePreference: generationParameters.sourcePreference,
    questionType: generationParameters.questionType,
    questionCount: generationParameters.questionCount,
    difficulty: generationParameters.difficulty,
    learningObjective: generationParameters.learningObjective,
    questionTypeDistribution:
      generationParameters.questionTypeDistribution ?? null,
    paperStructure: generationParameters.paperStructure ?? null,
  };
}

function createAdminAiGenerationSnapshotEnvelope(
  input: CreateOrReuseAdminAiGenerationTaskInput & {
    taskType: AdminAiGenerationPersistenceTaskType;
  },
): Pick<
  CreateAdminAiGenerationTaskPersistenceInput,
  | "generationSnapshotVersion"
  | "generationInputSnapshot"
  | "generationConstraintSnapshot"
  | "generationSnapshotDigest"
> {
  const taskRequest = input.localContract.taskRequest;
  const generationInputSnapshot = {
    generationParameters: canonicalizeGenerationParameters(
      input.generationParameters,
    ),
  };
  const generationConstraintSnapshot = {
    workspace: input.localContract.workspace,
    actorPublicId: taskRequest.actorPublicId,
    authorizationSource: taskRequest.authorizationSource,
    authorizationPublicId: taskRequest.authorizationPublicId,
    ownerType: taskRequest.ownerType,
    ownerPublicId: taskRequest.ownerPublicId,
    organizationPublicId: taskRequest.organizationPublicId,
    quotaOwnerType: taskRequest.quotaOwnerType,
    quotaOwnerPublicId: taskRequest.quotaOwnerPublicId,
    effectiveEdition: "advanced",
    profession: input.generationParameters.profession,
    level: input.generationParameters.level,
  };
  const digestPayload = {
    schemaVersion: 1,
    taskType: input.taskType,
    generationInputSnapshot,
    generationConstraintSnapshot,
  };

  return {
    generationSnapshotVersion: 1,
    generationInputSnapshot,
    generationConstraintSnapshot,
    generationSnapshotDigest: `sha256:${createHash("sha256")
      .update(stringifyCanonicalJson(digestPayload))
      .digest("hex")}`,
  };
}

function assertMatchingAdminAiGenerationSnapshot(
  row: AdminAiGenerationTaskPersistenceRow,
  expected: CreateAdminAiGenerationTaskPersistenceInput,
): void {
  if (
    row.generation_snapshot_version !== expected.generationSnapshotVersion ||
    row.generation_snapshot_digest !== expected.generationSnapshotDigest ||
    stringifyCanonicalJson(row.generation_input_snapshot) !==
      stringifyCanonicalJson(expected.generationInputSnapshot) ||
    stringifyCanonicalJson(row.generation_constraint_snapshot) !==
      stringifyCanonicalJson(expected.generationConstraintSnapshot)
  ) {
    throw new AdminAiGenerationSnapshotConflictError();
  }
}

export function mapAdminAiGenerationTaskPersistenceRowToDto(
  row: AdminAiGenerationTaskPersistenceRow,
): AdminAiGenerationTaskPersistenceDto {
  const lifecycle = createAiGenerationTaskLifecycleProjection(
    {
      taskPublicId: row.public_id,
      taskType: row.task_type,
      ownerType: row.owner_type,
      ownerPublicId: row.owner_public_id,
      organizationPublicId: row.organization_public_id,
      taskStatus: row.task_status,
      retryCount: row.retry_count,
      failureCategory: row.failure_category,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      resultPublicId: row.result_public_id,
    },
    new Date(),
  );

  return {
    requestPublicId: row.request_public_id,
    taskPublicId: row.public_id,
    taskType: row.task_type,
    workspace: row.workspace,
    generationKind: row.generation_kind,
    status: row.task_status,
    retryCount: lifecycle.retryCount,
    failureCategory: lifecycle.failureCategory,
    startedAt: lifecycle.startedAt?.toISOString() ?? null,
    finishedAt: lifecycle.finishedAt?.toISOString() ?? null,
    canRetry: lifecycle.canRetry,
    canCancel: lifecycle.canCancel,
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
    contentVisibility: row.content_visibility,
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
    costCalibrationExecuted: false,
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    redactionStatus: "redacted",
  };
}

function assertAcceptedProviderDisabledAdminLocalContract(
  localContract: AdminAiGenerationLocalContractBaseDto,
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

  const isProviderBoundarySafe =
    runtimeBridge.costCalibrationExecuted === false &&
    runtimeBridge.redactionStatus === "redacted" &&
    executionSummary.redactionStatus === "redacted" &&
    matchesSafeProviderBridgeState(localContract);

  const isFormalWriteBlocked =
    localContract.formalContentBoundary.questionWriteStatus ===
      "blocked_without_follow_up_task" &&
    localContract.formalContentBoundary.paperWriteStatus ===
      "blocked_without_follow_up_task";

  const isAdminOwnerBoundary =
    matchesContentAdminOwnerBoundary(localContract) ||
    matchesOrganizationAdminOwnerBoundary(localContract);
  const isOrganizationOwnedDraftBoundary =
    matchesContentAdminOrganizationOwnedDraftBoundary(localContract) ||
    matchesOrganizationAdminOrganizationOwnedDraftBoundary(localContract);

  if (
    !isAcceptedLocalContract ||
    !isProviderBoundarySafe ||
    !isFormalWriteBlocked ||
    !isAdminOwnerBoundary ||
    !isOrganizationOwnedDraftBoundary
  ) {
    throw new Error(UNSAFE_ADMIN_AI_GENERATION_PERSISTENCE_BOUNDARY_ERROR);
  }
}

function matchesSafeProviderBridgeState(
  localContract: AdminAiGenerationLocalContractBaseDto,
): boolean {
  const runtimeBridge = localContract.runtimeBridge;
  const executionSummary = runtimeBridge.executionSummary;
  const visibleGeneratedContent = runtimeBridge.visibleGeneratedContent;

  if (runtimeBridge.costCalibrationExecuted !== false) {
    return false;
  }

  if (visibleGeneratedContent !== null) {
    const isVisibleContentTransient =
      visibleGeneratedContent.contentVisibility === "transient_response_only" &&
      visibleGeneratedContent.persistenceStatus === "not_persisted" &&
      visibleGeneratedContent.safetyStatus === "checked";

    if (!isVisibleContentTransient) {
      return false;
    }
  }

  if (runtimeBridge.bridgeStatus === "provider_call_succeeded") {
    return (
      runtimeBridge.providerCallExecuted === true &&
      runtimeBridge.envSecretAccessed === true &&
      runtimeBridge.providerConfigurationRead === true &&
      executionSummary.requestCount === 1 &&
      executionSummary.resultStatus === "pass" &&
      executionSummary.failureCategory === null &&
      executionSummary.providerErrorSummary === null &&
      visibleGeneratedContent !== null
    );
  }

  if (runtimeBridge.bridgeStatus === "provider_call_failed") {
    return (
      runtimeBridge.providerCallExecuted === true &&
      runtimeBridge.envSecretAccessed === true &&
      runtimeBridge.providerConfigurationRead === true &&
      executionSummary.requestCount === 1 &&
      executionSummary.resultStatus === "fail" &&
      executionSummary.failureCategory !== null &&
      visibleGeneratedContent === null
    );
  }

  return (
    runtimeBridge.providerCallExecuted === false &&
    executionSummary.requestCount === 0 &&
    executionSummary.resultStatus === "blocked" &&
    executionSummary.failureCategory !== null &&
    visibleGeneratedContent === null
  );
}

function matchesContentAdminOwnerBoundary(
  localContract: AdminAiGenerationLocalContractBaseDto,
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

function matchesContentAdminOrganizationOwnedDraftBoundary(
  localContract: AdminAiGenerationLocalContractBaseDto,
): boolean {
  const taskRequest = localContract.taskRequest;
  const boundary = localContract.organizationOwnedDraftBoundary;

  return (
    localContract.workspace === "content" &&
    boundary.generatedResultScope === "platform_review_pool" &&
    boundary.organizationDraftAdoptionStatus ===
      "not_applicable_to_content_workspace" &&
    boundary.organizationTrainingSourceStatus ===
      "not_applicable_to_content_workspace" &&
    boundary.platformFormalDraftStatus ===
      "blocked_requires_content_admin_review" &&
    boundary.publishStatus === "blocked_requires_fresh_publish_task" &&
    boundary.studentVisibleStatus === "blocked" &&
    boundary.ownerType === "platform" &&
    boundary.ownerPublicId === taskRequest.ownerPublicId &&
    boundary.organizationPublicId === null &&
    boundary.redactionStatus === "redacted"
  );
}

function matchesOrganizationAdminOrganizationOwnedDraftBoundary(
  localContract: AdminAiGenerationLocalContractBaseDto,
): boolean {
  const taskRequest = localContract.taskRequest;
  const boundary = localContract.organizationOwnedDraftBoundary;

  return (
    localContract.workspace === "organization" &&
    boundary.generatedResultScope === "organization_private" &&
    boundary.organizationDraftAdoptionStatus ===
      "allowed_as_organization_private_draft" &&
    boundary.organizationTrainingSourceStatus ===
      "allowed_as_organization_private_training_source" &&
    boundary.platformFormalDraftStatus ===
      "blocked_requires_content_admin_review" &&
    boundary.publishStatus === "blocked_requires_fresh_publish_task" &&
    boundary.studentVisibleStatus === "blocked" &&
    boundary.ownerType === "organization" &&
    boundary.ownerPublicId === taskRequest.ownerPublicId &&
    boundary.organizationPublicId === taskRequest.organizationPublicId &&
    boundary.redactionStatus === "redacted"
  );
}

function matchesOrganizationAdminOwnerBoundary(
  localContract: AdminAiGenerationLocalContractBaseDto,
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
