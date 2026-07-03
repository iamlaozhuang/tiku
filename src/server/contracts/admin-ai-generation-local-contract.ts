import type { AiGenerationTaskRequestPolicyDto } from "./ai-generation-task-request-contract";
import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type { AiGenerationTaskResultContentVisibility } from "../models/ai-generation-task-request";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "./route-integrated-provider-execution-contract";
import type {
  AdminAiGenerationResultContentVisibility,
  AdminAiGenerationResultFormalAdoptionStatus,
  AdminAiGenerationResultStatus,
} from "../models/admin-ai-generation-result";
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
  | "insufficient_grounding_evidence"
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

export type AdminAiGenerationRuntimeBridgeStatusDto =
  | "provider_call_blocked"
  | "provider_call_succeeded"
  | "provider_call_failed";

export type AdminAiGenerationLocalContractRuntimeBridgeDto = {
  bridgeStatus: AdminAiGenerationRuntimeBridgeStatusDto;
  providerCallExecuted: boolean;
  envSecretAccessed: boolean;
  providerConfigurationRead: boolean;
  costCalibrationExecuted: false;
  executionSummary: AdminAiGenerationRuntimeBridgeExecutionSummaryDto;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
  redactionStatus: "redacted";
  blockedReasons: string[];
};

export type AdminAiGenerationLocalContractFormalContentBoundaryDto = {
  questionWriteStatus: "blocked_without_follow_up_task";
  paperWriteStatus: "blocked_without_follow_up_task";
};

export type AdminAiGenerationLocalContractOrganizationOwnedDraftBoundaryDto = {
  generatedResultScope: "organization_private" | "platform_review_pool";
  organizationDraftAdoptionStatus:
    | "allowed_as_organization_private_draft"
    | "not_applicable_to_content_workspace";
  organizationTrainingSourceStatus:
    | "allowed_as_organization_private_training_source"
    | "not_applicable_to_content_workspace";
  platformFormalDraftStatus: "blocked_requires_content_admin_review";
  publishStatus: "blocked_requires_fresh_publish_task";
  studentVisibleStatus: "blocked";
  ownerType: "platform" | "organization";
  ownerPublicId: string;
  organizationPublicId: string | null;
  redactionStatus: "redacted";
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
  organizationOwnedDraftBoundary: AdminAiGenerationLocalContractOrganizationOwnedDraftBoundaryDto;
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

export type AdminAiGenerationTaskHistoryGeneratedResultDto = {
  resultPublicId: string;
  persistedAt: string;
  status: AdminAiGenerationResultStatus;
  contentPreviewMasked: string;
  contentVisibility: AdminAiGenerationResultContentVisibility;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  formalAdoptionStatus: AdminAiGenerationResultFormalAdoptionStatus;
  redactionStatus: "redacted";
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
  authorizationPublicId: string;
  ownerPublicId: string;
  organizationPublicId: string | null;
  runtimeStatus: AdminAiGenerationLocalContractRuntimeStatus;
  runtimeBridgeStatus: AdminAiGenerationRuntimeBridgeStatusDto;
  providerCallExecuted: boolean;
  envSecretAccessed: boolean;
  providerConfigurationRead: boolean;
  costCalibrationExecuted: false;
  formalContentBoundary: AdminAiGenerationLocalContractFormalContentBoundaryDto;
  organizationOwnedDraftBoundary: AdminAiGenerationLocalContractOrganizationOwnedDraftBoundaryDto;
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto | null;
  redactionStatus: "redacted";
};

export type AdminAiGenerationTaskHistoryDto = {
  workspace: AdminAiGenerationWorkspace;
  latestTask: AdminAiGenerationTaskHistoryItemDto | null;
  items: AdminAiGenerationTaskHistoryItemDto[];
  redactionStatus: "redacted";
};

export type AdminAiGenerationFailedRetrySource = {
  taskPublicId: string;
  requestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  taskType: Extract<
    AiGenerationTaskType,
    "ai_question_generation" | "ai_paper_generation"
  >;
  status: AiGenerationTaskStatus;
  failureCategory: AiGenerationTaskFailureCategory | null;
  failedAt: string | null;
  retryCount: number;
  maxRetryCount: number;
  resultPublicId: string | null;
  contentVisibility: AiGenerationTaskResultContentVisibility;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  redactionStatus: "redacted";
};

export type AdminAiGenerationFailedRetryBlockedReason =
  | "blocked_non_failed_task"
  | "blocked_non_retryable_failure"
  | "blocked_retry_limit_reached";

export type AdminAiGenerationFailedRetryRequestStatus =
  | "retry_request_available"
  | AdminAiGenerationFailedRetryBlockedReason;

export type AdminAiGenerationFailedRetryStateDto = {
  retryRequestStatus: AdminAiGenerationFailedRetryRequestStatus;
  sourceTask: {
    taskPublicId: string;
    requestPublicId: string;
    workspace: AdminAiGenerationWorkspace;
    generationKind: AdminAiGenerationKind;
    taskType: Extract<
      AiGenerationTaskType,
      "ai_question_generation" | "ai_paper_generation"
    >;
    status: AiGenerationTaskStatus;
    failureCategory: AiGenerationTaskFailureCategory | null;
    failedAt: string | null;
    resultPublicId: string | null;
    contentVisibility: AiGenerationTaskResultContentVisibility;
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    aiCallLogPublicId: string | null;
    redactionStatus: "redacted";
  };
  retryState: {
    canRequestRetry: boolean;
    blockedReason: AdminAiGenerationFailedRetryBlockedReason | null;
    retryCount: number;
    maxRetryCount: number;
    nextRetryAttempt: number | null;
  };
  executionBoundary: {
    requestOnly: true;
    providerCallExecuted: false;
    providerCredentialRead: false;
    providerPayloadRequired: false;
    retryMutationStatus: "not_executed";
    retryExecutionStatus: "not_executed";
    redactionStatus: "redacted";
  };
  redactionStatus: "redacted";
};
