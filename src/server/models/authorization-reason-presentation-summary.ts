import type { AuthorizationAccessReasonCode } from "./authorization-access-reason-summary";
import type { AuthorizationContextReasonCode } from "./authorization-context-reason-summary";
import type { AuthorizationReasonPresentationStatus } from "./authorization-reason-item-presentation";
import type { AuthorizationSourceReasonCode } from "./authorization-source-reason-summary";

export type AuthorizationReasonPresentationSummarySourceInput = {
  selectedAuthorizationPublicId: string;
  sourceReasonCode: AuthorizationSourceReasonCode;
};

export type AuthorizationReasonPresentationSummaryContextInput = {
  paperReasonCode: AuthorizationContextReasonCode | null;
  mockExamReasonCode: AuthorizationContextReasonCode | null;
};

export type AuthorizationReasonPresentationSummaryRedeemCodeReferenceInput = {
  publicId: string | null;
  redactionStatus: "redacted";
  referenceStatus: "redacted_reference";
};

export type AuthorizationReasonPresentationSummaryEvidenceInput = {
  redeemCodeReference: AuthorizationReasonPresentationSummaryRedeemCodeReferenceInput;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  redactionStatus: "redacted";
  referenceStatus: "redacted_reference";
};

export type AuthorizationReasonPresentationSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  reasonStatus: "reason_summary_only";
  reasonCodes: AuthorizationAccessReasonCode[];
  sourceReason: AuthorizationReasonPresentationSummarySourceInput;
  contextReason: AuthorizationReasonPresentationSummaryContextInput;
  paperContextPublicId: string | null;
  mockExamContextPublicId: string | null;
  evidenceReferences: AuthorizationReasonPresentationSummaryEvidenceInput;
};

export type AuthorizationReasonPresentationSummaryStatus =
  AuthorizationReasonPresentationStatus;
