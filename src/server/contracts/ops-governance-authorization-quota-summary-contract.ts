export type OpsGovernanceQuotaRiskStatus =
  | "healthy"
  | "attention_required"
  | "exhausted"
  | "not_applicable";

export type OpsGovernanceReviewStatus =
  | "no_action_needed"
  | "review_inactive_authorization"
  | "review_quota_pressure"
  | "quota_exhausted"
  | "redacted_evidence_only";

export type OpsGovernanceEvidenceReferenceStatus =
  | "redacted_reference"
  | "none";

export type OpsGovernanceAuthorizationQuotaSummaryDto = {
  generatedAt: string;
  runtimeStatus: "local_read_model_only";
  authorizationSummary: {
    totalCount: number;
    activeCount: number;
    expiredCount: number;
    cancelledCount: number;
    inactiveCount: number;
  };
  quotaSummary: {
    authorizationWithQuotaCount: number;
    allocatedQuota: number;
    usedQuota: number;
    remainingQuota: number;
    usageRatio: number | null;
    quotaRiskStatus: OpsGovernanceQuotaRiskStatus;
  };
  expirySummary: {
    expiredCount: number;
    expiringSoonCount: number;
    earliestExpiresAt: string | null;
  };
  operationsReview: {
    authorizationReviewStatus: Extract<
      OpsGovernanceReviewStatus,
      "no_action_needed" | "review_inactive_authorization"
    >;
    quotaReviewStatus: Extract<
      OpsGovernanceReviewStatus,
      "no_action_needed" | "review_quota_pressure" | "quota_exhausted"
    >;
    evidenceReviewStatus: Extract<
      OpsGovernanceReviewStatus,
      "redacted_evidence_only"
    >;
  };
  evidencePolicy: {
    auditLogReferenceStatus: OpsGovernanceEvidenceReferenceStatus;
    aiCallLogReferenceStatus: OpsGovernanceEvidenceReferenceStatus;
    publicIdInventoryStatus: "not_included";
    rowDataStatus: "not_included";
  };
};
