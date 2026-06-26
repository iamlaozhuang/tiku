import type {
  AdminAiGenerationKind,
  AdminAiGenerationLocalContractFormalContentBoundaryDto,
  AdminAiGenerationLocalContractRuntimeStatus,
  AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract";
import type {
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type {
  AiGenerationTaskRequestAuthorizationSource,
  AiGenerationTaskRequestOwnerType,
  AiGenerationTaskResultContentVisibility,
  AiGenerationTaskResultKind,
} from "../models/ai-generation-task-request";
import type { EvidenceStatus } from "../models/ai-rag";

export type AdminAiGenerationPersistenceTaskType = Extract<
  AiGenerationTaskType,
  "ai_question_generation" | "ai_paper_generation"
>;

export type AdminAiGenerationTaskPersistenceRuntimeBridgeStatus =
  "provider_call_blocked";

export type AdminAiGenerationTaskPersistenceRedactionStatus = "redacted";

export type CreateAdminAiGenerationTaskPersistenceInput = {
  requestPublicId: string;
  taskPublicId: string;
  taskType: AdminAiGenerationPersistenceTaskType;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  taskStatus: "pending";
  requestedAt: Date;
  authorizationSource: AiGenerationTaskRequestAuthorizationSource;
  authorizationPublicId: string;
  actorPublicId: string;
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: AiGenerationTaskRequestOwnerType;
  quotaOwnerPublicId: string;
  effectiveEdition: "advanced";
  idempotencyKeyHash: string;
  resultKind: AiGenerationTaskResultKind;
  resultPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  runtimeStatus: AdminAiGenerationLocalContractRuntimeStatus;
  runtimeBridgeStatus: AdminAiGenerationTaskPersistenceRuntimeBridgeStatus;
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
  costCalibrationExecuted: false;
  questionWriteStatus: AdminAiGenerationLocalContractFormalContentBoundaryDto["questionWriteStatus"];
  paperWriteStatus: AdminAiGenerationLocalContractFormalContentBoundaryDto["paperWriteStatus"];
  sourceQuestionPublicId: string | null;
  sourcePaperPublicId: string | null;
  redactionStatus: AdminAiGenerationTaskPersistenceRedactionStatus;
};

export type AdminAiGenerationTaskPersistenceRow = {
  public_id: string;
  request_public_id: string;
  task_type: AdminAiGenerationPersistenceTaskType;
  workspace: AdminAiGenerationWorkspace;
  generation_kind: AdminAiGenerationKind;
  task_status: AiGenerationTaskStatus;
  requested_at: Date;
  authorization_source: AiGenerationTaskRequestAuthorizationSource;
  authorization_public_id: string;
  actor_public_id: string;
  owner_type: AiGenerationTaskRequestOwnerType;
  owner_public_id: string;
  organization_public_id: string | null;
  quota_owner_type: AiGenerationTaskRequestOwnerType;
  quota_owner_public_id: string;
  idempotency_key_hash: string;
  result_public_id: string | null;
  content_visibility: AiGenerationTaskResultContentVisibility;
  evidence_status: EvidenceStatus;
  citation_count: number;
  ai_call_log_public_id: string | null;
  runtime_status: AdminAiGenerationLocalContractRuntimeStatus;
  runtime_bridge_status: AdminAiGenerationTaskPersistenceRuntimeBridgeStatus;
  provider_call_executed: false;
  env_secret_accessed: false;
  provider_configuration_read: false;
  cost_calibration_executed: false;
  question_write_status: AdminAiGenerationLocalContractFormalContentBoundaryDto["questionWriteStatus"];
  paper_write_status: AdminAiGenerationLocalContractFormalContentBoundaryDto["paperWriteStatus"];
  source_question_public_id: string | null;
  source_paper_public_id: string | null;
  redaction_status: AdminAiGenerationTaskPersistenceRedactionStatus;
};

export type FindAdminAiGenerationTaskByIdempotencyKeyQuery = {
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  idempotencyKeyHash: string;
  taskTypes: readonly AdminAiGenerationPersistenceTaskType[];
};

export type AdminAiGenerationTaskPersistenceGateway = {
  findTaskByIdempotencyKey(
    query: FindAdminAiGenerationTaskByIdempotencyKeyQuery,
  ): Promise<AdminAiGenerationTaskPersistenceRow | null>;
  insertPendingTask(
    input: CreateAdminAiGenerationTaskPersistenceInput,
  ): Promise<AdminAiGenerationTaskPersistenceRow | null>;
};

export type AdminAiGenerationTaskPersistenceDto = {
  requestPublicId: string;
  taskPublicId: string;
  taskType: AdminAiGenerationPersistenceTaskType;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  status: AiGenerationTaskStatus;
  requestedAt: string;
  authorizationSource: AiGenerationTaskRequestAuthorizationSource;
  authorizationPublicId: string;
  actorPublicId: string;
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: AiGenerationTaskRequestOwnerType;
  quotaOwnerPublicId: string;
  resultPublicId: string | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  runtimeStatus: AdminAiGenerationLocalContractRuntimeStatus;
  runtimeBridgeStatus: AdminAiGenerationTaskPersistenceRuntimeBridgeStatus;
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
  costCalibrationExecuted: false;
  formalContentBoundary: AdminAiGenerationLocalContractFormalContentBoundaryDto;
  sourceQuestionPublicId: string | null;
  sourcePaperPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  redactionStatus: AdminAiGenerationTaskPersistenceRedactionStatus;
};

export type AdminAiGenerationTaskPersistenceResult = {
  persistenceStatus: "created" | "reused";
  task: AdminAiGenerationTaskPersistenceDto;
};

export type CreateOrReuseAdminAiGenerationTaskInput = {
  localContract: import("./admin-ai-generation-local-contract").AdminAiGenerationLocalContractDto;
  requestPublicId: string;
  requestedAt: Date;
};

export type AdminAiGenerationTaskPersistenceRepository = {
  createOrReuseTask(
    input: CreateOrReuseAdminAiGenerationTaskInput,
  ): Promise<AdminAiGenerationTaskPersistenceResult>;
};
