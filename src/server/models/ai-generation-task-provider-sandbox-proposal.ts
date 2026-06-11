import type { AiGenerationTaskType } from "./ai-generation-task";
import type { EvidenceStatus } from "./ai-rag";

export type AiGenerationTaskProviderSandboxRuntimeStatus = "proposal_only";

export const aiGenerationTaskProviderSandboxTargetRuntimeValues = [
  "local_dev",
  "staging",
  "production",
] as const;

export type AiGenerationTaskProviderSandboxTargetRuntime =
  (typeof aiGenerationTaskProviderSandboxTargetRuntimeValues)[number];

export const aiGenerationTaskProviderSandboxApprovalStatusValues = [
  "not_requested",
  "approved",
  "rejected",
] as const;

export type AiGenerationTaskProviderSandboxApprovalStatus =
  (typeof aiGenerationTaskProviderSandboxApprovalStatusValues)[number];

export type AiGenerationTaskProviderSandboxDecision =
  | "ready_for_human_approval"
  | "approved_for_local_sandbox"
  | "proposal_blocked";

export type AiGenerationTaskProviderSandboxBlockedReason =
  | "approval_rejected"
  | "approval_reference_required"
  | "non_local_target"
  | "env_secret_access_blocked"
  | "provider_configuration_change_blocked"
  | "dependency_change_blocked"
  | "schema_migration_blocked"
  | "cost_calibration_gate_blocked"
  | "evidence_redaction_required";

export type AiGenerationTaskProviderSandboxGateStatus =
  | "requires_fresh_approval"
  | "approved_for_local_sandbox"
  | "blocked_by_proposal";

export type AiGenerationTaskProviderSandboxCostCalibrationGateStatus =
  "blocked";

export const aiGenerationTaskProviderSandboxAllowedMetadataValues = [
  "local_validation_result",
  "failure_category",
  "duration_ms",
  "redacted_log_public_ids",
] as const;

export type AiGenerationTaskProviderSandboxAllowedMetadata =
  (typeof aiGenerationTaskProviderSandboxAllowedMetadataValues)[number];

export const aiGenerationTaskProviderSandboxForbiddenEvidenceValues = [
  "api_key",
  "authorization_header",
  "database_url",
  "plain_redeem_code",
  "provider_payload",
  "raw_ai_output",
  "raw_prompt",
  "full_paper_content",
] as const;

export type AiGenerationTaskProviderSandboxForbiddenEvidence =
  (typeof aiGenerationTaskProviderSandboxForbiddenEvidenceValues)[number];

export type AiGenerationTaskProviderSandboxProposalInput = {
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  actorPublicId: string;
  targetRuntime: AiGenerationTaskProviderSandboxTargetRuntime;
  approvalStatus: AiGenerationTaskProviderSandboxApprovalStatus;
  approvalPublicId: string | null;
  requiresEnvSecretAccess: boolean;
  requiresProviderConfigurationChange: boolean;
  requiresDependencyChange: boolean;
  requiresSchemaMigration: boolean;
  requestsCostCalibration: boolean;
  evidenceRedactionConfirmed: boolean;
  evidenceStatus: EvidenceStatus;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

export type AiGenerationTaskProviderSandboxProposal = {
  decision: AiGenerationTaskProviderSandboxDecision;
  localOnly: boolean;
  blockedReasons: AiGenerationTaskProviderSandboxBlockedReason[];
  providerCallGate: {
    gateStatus: AiGenerationTaskProviderSandboxGateStatus;
    providerCallExecuted: false;
  };
  costCalibrationGateStatus: AiGenerationTaskProviderSandboxCostCalibrationGateStatus;
};

export function resolveAiGenerationTaskProviderSandboxProposal(
  input: AiGenerationTaskProviderSandboxProposalInput,
): AiGenerationTaskProviderSandboxProposal {
  const localOnly = input.targetRuntime === "local_dev";
  const blockedReasons =
    resolveAiGenerationTaskProviderSandboxBlockedReasons(input);

  if (blockedReasons.length > 0) {
    return {
      decision: "proposal_blocked",
      localOnly,
      blockedReasons,
      providerCallGate: {
        gateStatus: "blocked_by_proposal",
        providerCallExecuted: false,
      },
      costCalibrationGateStatus: "blocked",
    };
  }

  if (input.approvalStatus === "approved") {
    return {
      decision: "approved_for_local_sandbox",
      localOnly,
      blockedReasons,
      providerCallGate: {
        gateStatus: "approved_for_local_sandbox",
        providerCallExecuted: false,
      },
      costCalibrationGateStatus: "blocked",
    };
  }

  return {
    decision: "ready_for_human_approval",
    localOnly,
    blockedReasons,
    providerCallGate: {
      gateStatus: "requires_fresh_approval",
      providerCallExecuted: false,
    },
    costCalibrationGateStatus: "blocked",
  };
}

function resolveAiGenerationTaskProviderSandboxBlockedReasons(
  input: AiGenerationTaskProviderSandboxProposalInput,
): AiGenerationTaskProviderSandboxBlockedReason[] {
  const blockedReasons: AiGenerationTaskProviderSandboxBlockedReason[] = [];

  if (input.approvalStatus === "rejected") {
    blockedReasons.push("approval_rejected");
  }

  if (input.approvalStatus === "approved" && input.approvalPublicId === null) {
    blockedReasons.push("approval_reference_required");
  }

  if (input.targetRuntime !== "local_dev") {
    blockedReasons.push("non_local_target");
  }

  if (input.requiresEnvSecretAccess) {
    blockedReasons.push("env_secret_access_blocked");
  }

  if (input.requiresProviderConfigurationChange) {
    blockedReasons.push("provider_configuration_change_blocked");
  }

  if (input.requiresDependencyChange) {
    blockedReasons.push("dependency_change_blocked");
  }

  if (input.requiresSchemaMigration) {
    blockedReasons.push("schema_migration_blocked");
  }

  if (input.requestsCostCalibration) {
    blockedReasons.push("cost_calibration_gate_blocked");
  }

  if (!input.evidenceRedactionConfirmed) {
    blockedReasons.push("evidence_redaction_required");
  }

  return blockedReasons;
}
