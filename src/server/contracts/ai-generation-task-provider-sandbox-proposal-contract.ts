import type { AiGenerationTaskType } from "../models/ai-generation-task";
import type {
  AiGenerationTaskProviderSandboxAllowedMetadata,
  AiGenerationTaskProviderSandboxApprovalStatus,
  AiGenerationTaskProviderSandboxBlockedReason,
  AiGenerationTaskProviderSandboxCostCalibrationGateStatus,
  AiGenerationTaskProviderSandboxDecision,
  AiGenerationTaskProviderSandboxForbiddenEvidence,
  AiGenerationTaskProviderSandboxGateStatus,
  AiGenerationTaskProviderSandboxRuntimeStatus,
  AiGenerationTaskProviderSandboxTargetRuntime,
} from "../models/ai-generation-task-provider-sandbox-proposal";
import type { EvidenceStatus } from "../models/ai-rag";

export type AiGenerationTaskProviderSandboxGateDto = {
  approvalStatus: AiGenerationTaskProviderSandboxApprovalStatus;
  approvalPublicId: string | null;
  gateStatus: AiGenerationTaskProviderSandboxGateStatus;
  providerCallExecuted: false;
};

export type AiGenerationTaskProviderSandboxEvidenceRulesDto = {
  visibility: "summary_only";
  redactionStatus: "redacted";
  evidenceStatus: EvidenceStatus;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  allowedMetadata: AiGenerationTaskProviderSandboxAllowedMetadata[];
  forbiddenEvidence: AiGenerationTaskProviderSandboxForbiddenEvidence[];
};

export type AiGenerationTaskProviderSandboxProposalDto = {
  runtimeStatus: AiGenerationTaskProviderSandboxRuntimeStatus;
  decision: AiGenerationTaskProviderSandboxDecision;
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  actorPublicId: string;
  targetRuntime: AiGenerationTaskProviderSandboxTargetRuntime;
  localOnly: boolean;
  blockedReasons: AiGenerationTaskProviderSandboxBlockedReason[];
  providerCallGate: AiGenerationTaskProviderSandboxGateDto;
  evidenceRules: AiGenerationTaskProviderSandboxEvidenceRulesDto;
  costCalibrationGateStatus: AiGenerationTaskProviderSandboxCostCalibrationGateStatus;
};
