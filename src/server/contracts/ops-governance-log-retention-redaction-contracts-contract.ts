import type { OpsGovernanceLogReferenceStatus } from "../models/ops-governance-log-retention-redaction-contracts";

export type OpsGovernanceLogBlockedCapability =
  | "raw_sensitive_viewer"
  | "raw_prompt_provider_response_viewer"
  | "provider_model_request"
  | "hard_delete_executor"
  | "export_file_generation_download"
  | "schema_migration"
  | "cost_calibration";

export type OpsGovernanceLogRetentionRedactionContractsDto = {
  generatedAt: string;
  runtimeStatus: "local_read_model_only";
  retentionPolicy: {
    auditLogRetentionDay: number;
    aiCallLogRetentionDay: number;
    retentionSource: "advanced_ops_config_contract";
    hardDeleteStatus: "blocked";
  };
  referencePolicy: {
    auditLogReferenceStatus: OpsGovernanceLogReferenceStatus;
    aiCallLogReferenceStatus: OpsGovernanceLogReferenceStatus;
    publicIdDisplayStatus: "hidden";
    publicIdInventoryStatus: "not_included";
  };
  redactionPolicy: {
    auditLogRedactionStatus: "redacted";
    aiCallLogRedactionStatus: "redacted";
    rawSensitiveViewerStatus: "blocked";
    rawPromptStatus: "not_included";
    rawAnswerStatus: "not_included";
    providerPayloadStatus: "not_included";
    rowDataStatus: "not_included";
  };
  blockedCapabilities: OpsGovernanceLogBlockedCapability[];
  operationsReview: {
    retentionReviewStatus: "configured";
    redactionReviewStatus: "redacted_evidence_only";
    evidenceReviewStatus: "policy_only";
  };
};
