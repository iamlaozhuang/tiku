import { adminAiGenerationTaskMetadata, aiGenerationTask } from "@/db/schema";
import { and, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import type {
  AdminAiGenerationPersistenceTaskType,
  AdminAiGenerationTaskPersistenceRedactionStatus,
  AdminAiGenerationTaskPersistenceGateway,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceRow,
  AdminAiGenerationTaskHistoryQuery,
  AdminAiGenerationTaskPersistenceRuntimeBridgeStatus,
  CreateAdminAiGenerationTaskPersistenceInput,
  FindAdminAiGenerationTaskByIdempotencyKeyQuery,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationLocalContractFormalContentBoundaryDto,
  AdminAiGenerationLocalContractRuntimeStatus,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type { AiGenerationTaskStatus } from "../models/ai-generation-task";
import type {
  AiGenerationTaskRequestAuthorizationSource,
  AiGenerationTaskRequestOwnerType,
  AiGenerationTaskResultContentVisibility,
} from "../models/ai-generation-task-request";
import type { EvidenceStatus } from "../models/ai-rag";
import {
  createAdminAiGenerationTaskPersistenceRepository,
  ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
} from "./admin-ai-generation-task-persistence-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

type AdminAiGenerationTaskInsertValue = typeof aiGenerationTask.$inferInsert;

type AdminAiGenerationTaskMetadataInsertValue =
  typeof adminAiGenerationTaskMetadata.$inferInsert;

export type AdminAiGenerationTaskPersistenceDbRow = {
  id: number;
  metadata_id: number;
  public_id: string;
  request_public_id: string;
  task_type: string;
  workspace: string;
  generation_kind: string;
  task_status: string;
  requested_at: Date;
  authorization_source: string;
  authorization_public_id: string;
  actor_public_id: string;
  owner_type: string;
  owner_public_id: string;
  organization_public_id: string | null;
  quota_owner_type: string;
  quota_owner_public_id: string;
  idempotency_key_hash: string;
  result_public_id: string | null;
  content_visibility: string;
  evidence_status: string;
  citation_count: number;
  ai_call_log_public_id: string | null;
  runtime_status: string;
  runtime_bridge_status: string;
  provider_call_executed: boolean;
  env_secret_accessed: boolean;
  provider_configuration_read: boolean;
  cost_calibration_executed: boolean;
  question_write_status: string;
  paper_write_status: string;
  source_question_public_id: string | null;
  source_paper_public_id: string | null;
  redaction_status: string;
  generation_snapshot_version: number | null;
  generation_input_snapshot: unknown | null;
  generation_constraint_snapshot: unknown | null;
  generation_snapshot_digest: string | null;
};

const adminAiGenerationTaskPersistenceDbSelection = {
  id: aiGenerationTask.id,
  metadata_id: adminAiGenerationTaskMetadata.id,
  public_id: aiGenerationTask.public_id,
  request_public_id: aiGenerationTask.request_public_id,
  task_type: aiGenerationTask.task_type,
  workspace: adminAiGenerationTaskMetadata.workspace,
  generation_kind: adminAiGenerationTaskMetadata.generation_kind,
  task_status: aiGenerationTask.task_status,
  requested_at: aiGenerationTask.requested_at,
  authorization_source: adminAiGenerationTaskMetadata.authorization_source,
  authorization_public_id: aiGenerationTask.authorization_public_id,
  actor_public_id: aiGenerationTask.actor_public_id,
  owner_type: aiGenerationTask.owner_type,
  owner_public_id: aiGenerationTask.owner_public_id,
  organization_public_id: aiGenerationTask.organization_public_id,
  quota_owner_type: aiGenerationTask.quota_owner_type,
  quota_owner_public_id: aiGenerationTask.quota_owner_public_id,
  idempotency_key_hash: aiGenerationTask.idempotency_key_hash,
  result_public_id: aiGenerationTask.result_public_id,
  content_visibility: adminAiGenerationTaskMetadata.content_visibility,
  evidence_status: aiGenerationTask.evidence_status,
  citation_count: aiGenerationTask.citation_count,
  ai_call_log_public_id: aiGenerationTask.ai_call_log_public_id,
  runtime_status: adminAiGenerationTaskMetadata.runtime_status,
  runtime_bridge_status: adminAiGenerationTaskMetadata.runtime_bridge_status,
  provider_call_executed: adminAiGenerationTaskMetadata.provider_call_executed,
  env_secret_accessed: adminAiGenerationTaskMetadata.env_secret_accessed,
  provider_configuration_read:
    adminAiGenerationTaskMetadata.provider_configuration_read,
  cost_calibration_executed:
    adminAiGenerationTaskMetadata.cost_calibration_executed,
  question_write_status: adminAiGenerationTaskMetadata.question_write_status,
  paper_write_status: adminAiGenerationTaskMetadata.paper_write_status,
  source_question_public_id:
    adminAiGenerationTaskMetadata.source_question_public_id,
  source_paper_public_id: adminAiGenerationTaskMetadata.source_paper_public_id,
  redaction_status: adminAiGenerationTaskMetadata.redaction_status,
  generation_snapshot_version: aiGenerationTask.generation_snapshot_version,
  generation_input_snapshot: aiGenerationTask.generation_input_snapshot,
  generation_constraint_snapshot:
    aiGenerationTask.generation_constraint_snapshot,
  generation_snapshot_digest: aiGenerationTask.generation_snapshot_digest,
};

export function createAdminAiGenerationTaskMetadataPublicId(
  taskPublicId: string,
): string {
  return `${taskPublicId}_metadata`;
}

export function createAdminAiGenerationTaskInsertValue(
  input: CreateAdminAiGenerationTaskPersistenceInput,
): AdminAiGenerationTaskInsertValue {
  return {
    public_id: input.taskPublicId,
    request_public_id: input.requestPublicId,
    task_type: input.taskType,
    ai_func_type: null,
    authorization_public_id: input.authorizationPublicId,
    actor_public_id: input.actorPublicId,
    owner_type: input.ownerType,
    owner_public_id: input.ownerPublicId,
    organization_public_id: input.organizationPublicId,
    quota_owner_type: input.quotaOwnerType,
    quota_owner_public_id: input.quotaOwnerPublicId,
    effective_edition: input.effectiveEdition,
    question_public_id: null,
    answer_record_public_id: null,
    paper_public_id: null,
    mock_exam_public_id: null,
    idempotency_key_hash: input.idempotencyKeyHash,
    task_status: "pending",
    retry_count: 0,
    result_public_id: null,
    evidence_status: "none",
    citation_count: 0,
    is_authorization_active: true,
    is_scope_allowed: true,
    is_quota_available: true,
    is_runtime_config_ready: true,
    ai_call_log_public_id: null,
    generation_snapshot_version: input.generationSnapshotVersion,
    generation_input_snapshot: input.generationInputSnapshot,
    generation_constraint_snapshot: input.generationConstraintSnapshot,
    generation_snapshot_digest: input.generationSnapshotDigest,
    requested_at: input.requestedAt,
    created_at: input.requestedAt,
    updated_at: input.requestedAt,
  };
}

export function createAdminAiGenerationTaskMetadataInsertValue(
  input: CreateAdminAiGenerationTaskPersistenceInput,
  aiGenerationTaskId: number,
): AdminAiGenerationTaskMetadataInsertValue {
  return {
    public_id: createAdminAiGenerationTaskMetadataPublicId(input.taskPublicId),
    ai_generation_task_id: aiGenerationTaskId,
    task_public_id: input.taskPublicId,
    request_public_id: input.requestPublicId,
    workspace: input.workspace,
    generation_kind: input.generationKind,
    authorization_source: input.authorizationSource,
    result_kind: input.resultKind,
    content_visibility: input.contentVisibility,
    runtime_status: input.runtimeStatus,
    runtime_bridge_status: input.runtimeBridgeStatus,
    provider_call_executed: input.providerCallExecuted,
    env_secret_accessed: input.envSecretAccessed,
    provider_configuration_read: input.providerConfigurationRead,
    cost_calibration_executed: input.costCalibrationExecuted,
    question_write_status: input.questionWriteStatus,
    paper_write_status: input.paperWriteStatus,
    source_question_public_id: input.sourceQuestionPublicId,
    source_paper_public_id: input.sourcePaperPublicId,
    redaction_status: input.redactionStatus,
    created_at: input.requestedAt,
    updated_at: input.requestedAt,
  };
}

export function createAdminAiGenerationTaskPersistenceIdempotencyCondition(
  query: FindAdminAiGenerationTaskByIdempotencyKeyQuery,
): SQL {
  return and(
    eq(aiGenerationTask.owner_type, query.ownerType),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    eq(aiGenerationTask.idempotency_key_hash, query.idempotencyKeyHash),
    inArray(aiGenerationTask.task_type, query.taskTypes),
  ) as SQL;
}

export function createPostgresAdminAiGenerationTaskPersistenceGateway(
  options: RuntimeDatabaseOptions = {},
): AdminAiGenerationTaskPersistenceGateway {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for admin AI generation task persistence.",
  );

  return {
    async findTaskByIdempotencyKey(query) {
      const [row] = await selectAdminAiGenerationTaskPersistenceRows(
        getDatabase(),
        createAdminAiGenerationTaskPersistenceIdempotencyCondition(query),
      );

      return row === undefined
        ? null
        : mapAdminAiGenerationTaskPersistenceDbRowToRow(row);
    },
    async insertPendingTask(input) {
      const [row] = await getDatabase().transaction(async (transaction) => {
        const [insertedTaskRow] = await transaction
          .insert(aiGenerationTask)
          .values(createAdminAiGenerationTaskInsertValue(input))
          .onConflictDoNothing({
            target: [
              aiGenerationTask.owner_public_id,
              aiGenerationTask.idempotency_key_hash,
            ],
          })
          .returning({ id: aiGenerationTask.id });

        if (insertedTaskRow === undefined) {
          return [];
        }

        await transaction
          .insert(adminAiGenerationTaskMetadata)
          .values(
            createAdminAiGenerationTaskMetadataInsertValue(
              input,
              insertedTaskRow.id,
            ),
          );

        return selectAdminAiGenerationTaskPersistenceRows(
          transaction as RuntimeDatabase,
          eq(aiGenerationTask.id, insertedTaskRow.id),
        );
      });

      return row === undefined
        ? null
        : mapAdminAiGenerationTaskPersistenceDbRowToRow(row);
    },
    async listTaskHistory(query) {
      const rows = await selectAdminAiGenerationTaskHistoryRows(
        getDatabase(),
        query,
      );

      return rows.map((row) =>
        mapAdminAiGenerationTaskPersistenceDbRowToRow(row),
      );
    },
    async countTaskHistory(query) {
      const [totalRow] = await getDatabase()
        .select({ value: count() })
        .from(aiGenerationTask)
        .innerJoin(
          adminAiGenerationTaskMetadata,
          eq(
            adminAiGenerationTaskMetadata.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(createAdminAiGenerationTaskHistoryCondition(query));

      return totalRow?.value ?? 0;
    },
  };
}

export function createPostgresAdminAiGenerationTaskPersistenceRepository(
  options: RuntimeDatabaseOptions = {},
): AdminAiGenerationTaskPersistenceRepository {
  return createAdminAiGenerationTaskPersistenceRepository(
    createPostgresAdminAiGenerationTaskPersistenceGateway(options),
  );
}

async function selectAdminAiGenerationTaskPersistenceRows(
  database: Pick<RuntimeDatabase, "select">,
  condition: SQL,
): Promise<AdminAiGenerationTaskPersistenceDbRow[]> {
  const rows = await database
    .select(adminAiGenerationTaskPersistenceDbSelection)
    .from(aiGenerationTask)
    .innerJoin(
      adminAiGenerationTaskMetadata,
      eq(
        adminAiGenerationTaskMetadata.ai_generation_task_id,
        aiGenerationTask.id,
      ),
    )
    .where(condition)
    .limit(1);

  return rows.map((row) => normalizeAdminAiGenerationTaskPersistenceDbRow(row));
}

async function selectAdminAiGenerationTaskHistoryRows(
  database: Pick<RuntimeDatabase, "select">,
  query: AdminAiGenerationTaskHistoryQuery,
): Promise<AdminAiGenerationTaskPersistenceDbRow[]> {
  const rows = await database
    .select(adminAiGenerationTaskPersistenceDbSelection)
    .from(aiGenerationTask)
    .innerJoin(
      adminAiGenerationTaskMetadata,
      eq(
        adminAiGenerationTaskMetadata.ai_generation_task_id,
        aiGenerationTask.id,
      ),
    )
    .where(createAdminAiGenerationTaskHistoryCondition(query))
    .orderBy(desc(aiGenerationTask.requested_at))
    .offset(query.offset)
    .limit(query.limit);

  return rows.map((row) => normalizeAdminAiGenerationTaskPersistenceDbRow(row));
}

function createAdminAiGenerationTaskHistoryCondition(
  query: AdminAiGenerationTaskHistoryQuery,
): SQL {
  return and(
    eq(adminAiGenerationTaskMetadata.workspace, query.workspace),
    eq(adminAiGenerationTaskMetadata.generation_kind, query.generationKind),
    eq(aiGenerationTask.owner_type, query.ownerType),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    inArray(
      aiGenerationTask.task_type,
      ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
    ),
  ) as SQL;
}

function normalizeAdminAiGenerationTaskPersistenceDbRow(
  row: unknown,
): AdminAiGenerationTaskPersistenceDbRow {
  return row as AdminAiGenerationTaskPersistenceDbRow;
}

export function mapAdminAiGenerationTaskPersistenceDbRowToRow(
  row: AdminAiGenerationTaskPersistenceDbRow,
): AdminAiGenerationTaskPersistenceRow {
  return {
    public_id: row.public_id,
    request_public_id: row.request_public_id,
    task_type: toAdminAiGenerationPersistenceTaskType(row.task_type),
    workspace: toAdminAiGenerationWorkspace(row.workspace),
    generation_kind: toAdminAiGenerationKind(row.generation_kind),
    task_status: toAiGenerationTaskStatus(row.task_status),
    requested_at: row.requested_at,
    authorization_source: toAuthorizationSource(row.authorization_source),
    authorization_public_id: row.authorization_public_id,
    actor_public_id: row.actor_public_id,
    owner_type: toOwnerType(row.owner_type),
    owner_public_id: row.owner_public_id,
    organization_public_id: row.organization_public_id,
    quota_owner_type: toOwnerType(row.quota_owner_type),
    quota_owner_public_id: row.quota_owner_public_id,
    idempotency_key_hash: row.idempotency_key_hash,
    result_public_id: row.result_public_id,
    content_visibility: toContentVisibility(row.content_visibility),
    evidence_status: toEvidenceStatus(row.evidence_status),
    citation_count: row.citation_count,
    ai_call_log_public_id: row.ai_call_log_public_id,
    runtime_status: toRuntimeStatus(row.runtime_status),
    runtime_bridge_status: toRuntimeBridgeStatus(row.runtime_bridge_status),
    provider_call_executed: toProviderBoundaryBoolean(
      row.provider_call_executed,
    ),
    env_secret_accessed: toProviderBoundaryBoolean(row.env_secret_accessed),
    provider_configuration_read: toProviderBoundaryBoolean(
      row.provider_configuration_read,
    ),
    cost_calibration_executed: toFalseBoundary(row.cost_calibration_executed),
    question_write_status: toFormalWriteStatus(row.question_write_status),
    paper_write_status: toFormalWriteStatus(row.paper_write_status),
    source_question_public_id: row.source_question_public_id,
    source_paper_public_id: row.source_paper_public_id,
    redaction_status: toRedactionStatus(row.redaction_status),
    generation_snapshot_version: row.generation_snapshot_version,
    generation_input_snapshot: row.generation_input_snapshot,
    generation_constraint_snapshot: row.generation_constraint_snapshot,
    generation_snapshot_digest: row.generation_snapshot_digest,
  };
}

function toAdminAiGenerationPersistenceTaskType(
  value: string,
): AdminAiGenerationPersistenceTaskType {
  if (
    ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES.includes(
      value as AdminAiGenerationPersistenceTaskType,
    )
  ) {
    return value as AdminAiGenerationPersistenceTaskType;
  }

  throw new Error("invalid admin AI generation task type.");
}

function toAdminAiGenerationWorkspace(
  value: string,
): AdminAiGenerationWorkspace {
  if (value === "content" || value === "organization") {
    return value;
  }

  throw new Error("invalid admin AI generation workspace.");
}

function toAdminAiGenerationKind(value: string): AdminAiGenerationKind {
  if (value === "question" || value === "paper") {
    return value;
  }

  throw new Error("invalid admin AI generation kind.");
}

function toAiGenerationTaskStatus(value: string): AiGenerationTaskStatus {
  if (
    value === "pending" ||
    value === "running" ||
    value === "succeeded" ||
    value === "failed" ||
    value === "cancelled"
  ) {
    return value;
  }

  throw new Error("invalid AI generation task status.");
}

function toAuthorizationSource(
  value: string,
): AiGenerationTaskRequestAuthorizationSource {
  if (
    value === "personal_auth" ||
    value === "org_auth" ||
    value === "admin_role"
  ) {
    return value;
  }

  throw new Error("invalid AI generation authorization source.");
}

function toOwnerType(value: string): AiGenerationTaskRequestOwnerType {
  if (
    value === "personal" ||
    value === "organization" ||
    value === "platform"
  ) {
    return value;
  }

  throw new Error("invalid AI generation owner type.");
}

function toContentVisibility(
  value: string,
): AiGenerationTaskResultContentVisibility {
  if (value === "summary_only") {
    return value;
  }

  throw new Error("invalid AI generation content visibility.");
}

function toEvidenceStatus(value: string): EvidenceStatus {
  if (value === "sufficient" || value === "weak" || value === "none") {
    return value;
  }

  throw new Error("invalid evidence status.");
}

function toRuntimeStatus(
  value: string,
): AdminAiGenerationLocalContractRuntimeStatus {
  if (value === "local_contract_only") {
    return value;
  }

  throw new Error("invalid admin AI generation runtime status.");
}

function toRuntimeBridgeStatus(
  value: string,
): AdminAiGenerationTaskPersistenceRuntimeBridgeStatus {
  if (
    value === "provider_call_blocked" ||
    value === "provider_call_succeeded" ||
    value === "provider_call_failed"
  ) {
    return value;
  }

  throw new Error("invalid admin AI generation runtime bridge status.");
}

function toProviderBoundaryBoolean(value: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  throw new Error("unsafe admin AI generation provider boundary.");
}

function toFalseBoundary(value: boolean): false {
  if (value === false) {
    return value;
  }

  throw new Error("unsafe admin AI generation provider boundary.");
}

function toFormalWriteStatus(
  value: string,
): AdminAiGenerationLocalContractFormalContentBoundaryDto["questionWriteStatus"] {
  if (value === "blocked_without_follow_up_task") {
    return value;
  }

  throw new Error("invalid admin AI generation formal content boundary.");
}

function toRedactionStatus(
  value: string,
): AdminAiGenerationTaskPersistenceRedactionStatus {
  if (value === "redacted") {
    return value;
  }

  throw new Error("invalid admin AI generation redaction status.");
}
