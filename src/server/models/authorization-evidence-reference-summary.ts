export type AuthorizationEvidenceReferenceDisplayStatus = "display_only";

export type AuthorizationEvidenceReferenceRedactionStatus = "redacted";

export type AuthorizationEvidenceReferenceStatus = "redacted_reference";

export type AuthorizationEvidenceReferenceSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
