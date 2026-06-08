import type { AuthorizationReasonPresentationStatus } from "./authorization-reason-item-presentation";

export type AuthorizationReasonEvidenceType =
  | "redeem_code"
  | "audit_log"
  | "ai_call_log";

export type AuthorizationReasonEvidenceRedactionStatus = "redacted";
export type AuthorizationReasonEvidenceReferenceStatus = "redacted_reference";

export type AuthorizationReasonEvidencePresentationInput = {
  reasonStatus: "reason_summary_only";
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

export type AuthorizationReasonEvidencePresentationStatus =
  AuthorizationReasonPresentationStatus;
