export type OpsGovernanceRedactedReferenceStatus =
  | "redacted_reference"
  | "none";

export type OpsGovernanceRedeemCodeRedactedReferenceInput = {
  generatedAt: string;
  userPublicId: string;
  authorizationPublicId: string;
  redeemCodePublicId: string;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
