export type OpsGovernanceLocalRecoveryMode = "local_read_model";

export type OpsGovernanceLocalRecoveryStatus = "ready" | "attention_required";

export type OpsGovernanceExpiredHiddenCoverageStatus =
  | "complete"
  | "partial"
  | "not_applicable";

export type OpsGovernanceLocalRecoveryReferenceStatus =
  | "redacted_reference"
  | "none";

export type OpsGovernanceRecoveryReviewStatus =
  | "local_recovery_ready"
  | "review_recovery_artifacts";

export type OpsGovernanceExpiredHiddenReviewStatus =
  | "expired_hidden_boundary_ready"
  | "review_expired_hidden_gap";

export type OpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsInput = {
  generatedAt: string;
  recoveryMode: OpsGovernanceLocalRecoveryMode;
  expiredAuthorizationCount: number;
  hiddenExpiredAuthorizationCount: number;
  staleLogReferenceCount: number;
  recoverableLocalArtifactCount: number;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
