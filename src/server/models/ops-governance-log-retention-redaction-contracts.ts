export type OpsGovernanceLogReferenceStatus = "redacted_reference" | "none";

export type OpsGovernanceLogRetentionRedactionContractsInput = {
  generatedAt: string;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  auditLogRetentionDay: number;
  aiCallLogRetentionDay: number;
};
