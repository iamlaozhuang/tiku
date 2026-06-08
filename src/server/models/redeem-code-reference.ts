export type RedeemCodeReferenceRedactionStatus = "redacted";

export type RedeemCodeReferenceStatus = "redacted_reference";

export type RedeemCodeReferenceInput = {
  userPublicId: string;
  authorizationPublicId: string;
  redeemCodePublicId: string;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
