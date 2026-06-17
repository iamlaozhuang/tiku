export type OpsGovernanceAuthorizationType = "personal_auth" | "org_auth";

export type OpsGovernanceAuthorizationStatus =
  | "active"
  | "expired"
  | "cancelled";

export type OpsGovernanceAuthorizationQuotaSource = {
  authorizationPublicId: string;
  authorizationType: OpsGovernanceAuthorizationType;
  status: OpsGovernanceAuthorizationStatus;
  accountQuota: number | null;
  usedQuota: number | null;
  startsAt: string;
  expiresAt: string;
};

export type OpsGovernanceAuthorizationQuotaSummaryInput = {
  generatedAt: string;
  authorizationSummaries: OpsGovernanceAuthorizationQuotaSource[];
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
