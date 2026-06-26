import type { AiGenerationTaskRequestPolicyDto } from "./ai-generation-task-request-contract";
import type {
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type { AiGenerationTaskResultContentVisibility } from "../models/ai-generation-task-request";
import type { EvidenceStatus } from "../models/ai-rag";

export type AdminAiGenerationWorkspace = "content" | "organization";

export type AdminAiGenerationKind = "question" | "paper";

export type AdminAiGenerationLocalContractRuntimeStatus = "local_contract_only";

export type AdminAiGenerationLocalContractFlowStatus = "accepted";

export type AdminAiGenerationLocalContractResultStateDto = {
  status: AiGenerationTaskStatus;
  taskPublicId: string;
  resultPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  redactionStatus: "redacted";
};

export type AdminAiGenerationRuntimeBridgeUsageSummaryDto = Record<
  string,
  number
> | null;

export type AdminAiGenerationRuntimeBridgeErrorSummaryDto = {
  httpStatus: number | null;
  providerErrorCode: string | null;
} | null;

export type AdminAiGenerationRuntimeBridgeFailureCategoryDto =
  | "provider_call_blocked"
  | "missing_provider_credential"
  | "provider_error"
  | "timeout"
  | "redaction_violation"
  | null;

export type AdminAiGenerationRuntimeBridgeResultStatusDto =
  | "pass"
  | "fail"
  | "blocked";

export type AdminAiGenerationRuntimeBridgeExecutionSummaryDto = {
  requestCount: 0 | 1;
  resultStatus: AdminAiGenerationRuntimeBridgeResultStatusDto;
  failureCategory: AdminAiGenerationRuntimeBridgeFailureCategoryDto;
  durationMs: number;
  usageSummary: AdminAiGenerationRuntimeBridgeUsageSummaryDto;
  providerErrorSummary: AdminAiGenerationRuntimeBridgeErrorSummaryDto;
  redactionStatus: "redacted";
};

export type AdminAiGenerationLocalContractRuntimeBridgeDto = {
  bridgeStatus: "provider_call_blocked";
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
  costCalibrationExecuted: false;
  executionSummary: AdminAiGenerationRuntimeBridgeExecutionSummaryDto;
  redactionStatus: "redacted";
  blockedReasons: string[];
};

export type AdminAiGenerationLocalContractFormalContentBoundaryDto = {
  questionWriteStatus: "blocked_without_follow_up_task";
  paperWriteStatus: "blocked_without_follow_up_task";
};

export type AdminAiGenerationLocalContractBaseDto = {
  runtimeStatus: AdminAiGenerationLocalContractRuntimeStatus;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  flowStatus: AdminAiGenerationLocalContractFlowStatus;
  redactionStatus: "redacted";
  taskRequest: AiGenerationTaskRequestPolicyDto;
  resultState: AdminAiGenerationLocalContractResultStateDto;
  runtimeBridge: AdminAiGenerationLocalContractRuntimeBridgeDto;
  formalContentBoundary: AdminAiGenerationLocalContractFormalContentBoundaryDto;
};

export type AdminAiGenerationLocalContractTaskPersistenceDto = {
  persistenceStatus: "created" | "reused";
  requestPublicId: string;
  taskPublicId: string;
  status: AiGenerationTaskStatus;
  resultPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  redactionStatus: "redacted";
};

export type AdminAiGenerationLocalContractGeneratedResultDto = {
  persistenceStatus: "created" | "reused";
  resultPublicId: string;
  contentVisibility: "redacted_snapshot";
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  formalAdoptionStatus: "blocked";
  redactionStatus: "redacted";
};

export type AdminAiGenerationLocalContractDto =
  AdminAiGenerationLocalContractBaseDto & {
    taskPersistence: AdminAiGenerationLocalContractTaskPersistenceDto;
    generatedResult: AdminAiGenerationLocalContractGeneratedResultDto;
  };

export type AdminAiGenerationTaskHistoryItemDto = {
  requestPublicId: string;
  taskPublicId: string;
  taskType: Extract<
    AiGenerationTaskType,
    "ai_question_generation" | "ai_paper_generation"
  >;
  generationKind: AdminAiGenerationKind;
  status: AiGenerationTaskStatus;
  requestedAt: string;
  resultPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  runtimeStatus: AdminAiGenerationLocalContractRuntimeStatus;
  runtimeBridgeStatus: "provider_call_blocked";
  providerCallExecuted: false;
  envSecretAccessed: false;
  providerConfigurationRead: false;
  costCalibrationExecuted: false;
  formalContentBoundary: AdminAiGenerationLocalContractFormalContentBoundaryDto;
  redactionStatus: "redacted";
};

export type AdminAiGenerationTaskHistoryDto = {
  workspace: AdminAiGenerationWorkspace;
  latestTask: AdminAiGenerationTaskHistoryItemDto | null;
  items: AdminAiGenerationTaskHistoryItemDto[];
  redactionStatus: "redacted";
};
