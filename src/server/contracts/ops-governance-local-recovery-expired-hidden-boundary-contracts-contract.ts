import type {
  OpsGovernanceExpiredHiddenCoverageStatus,
  OpsGovernanceExpiredHiddenReviewStatus,
  OpsGovernanceLocalRecoveryMode,
  OpsGovernanceLocalRecoveryReferenceStatus,
  OpsGovernanceLocalRecoveryStatus,
  OpsGovernanceRecoveryReviewStatus,
} from "../models/ops-governance-local-recovery-expired-hidden-boundary-contracts";

export type OpsGovernanceLocalRecoveryBlockedCapability =
  | "destructive_recovery_executor"
  | "expired_public_id_inventory"
  | "raw_log_viewer"
  | "provider_model_request"
  | "schema_migration"
  | "cost_calibration";

export type OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsDto = {
  generatedAt: string;
  runtimeStatus: "local_read_model_only";
  recoveryPolicy: {
    recoveryMode: OpsGovernanceLocalRecoveryMode;
    localRecoveryStatus: OpsGovernanceLocalRecoveryStatus;
    recoverableLocalArtifactCount: number;
    destructiveRecoveryStatus: "blocked";
  };
  expiredHiddenBoundary: {
    expiredAuthorizationCount: number;
    hiddenExpiredAuthorizationCount: number;
    hiddenCoverageStatus: OpsGovernanceExpiredHiddenCoverageStatus;
    expiredVisibilityStatus: "hidden";
    publicIdDisplayStatus: "hidden";
    publicIdInventoryStatus: "not_included";
  };
  evidencePolicy: {
    auditLogReferenceStatus: OpsGovernanceLocalRecoveryReferenceStatus;
    aiCallLogReferenceStatus: OpsGovernanceLocalRecoveryReferenceStatus;
    rowDataStatus: "not_included";
    privateDataStatus: "not_included";
    providerPayloadStatus: "not_included";
  };
  blockedCapabilities: OpsGovernanceLocalRecoveryBlockedCapability[];
  operationsReview: {
    recoveryReviewStatus: OpsGovernanceRecoveryReviewStatus;
    expiredHiddenReviewStatus: OpsGovernanceExpiredHiddenReviewStatus;
    evidenceReviewStatus: "redacted_evidence_only";
  };
};
