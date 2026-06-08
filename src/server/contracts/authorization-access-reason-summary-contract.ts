import type {
  AuthorizationAccessReasonCode,
  AuthorizationAccessReasonSummaryStatus,
} from "../models/authorization-access-reason-summary";
import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type { AuthorizationSourceReasonCode } from "../models/authorization-source-reason-summary";
import type { AuthorizationWindowReasonCode } from "../models/authorization-window-reason-summary";

export type AuthorizationAccessReasonRedactionStatus = "redacted";
export type AuthorizationAccessReasonReferenceStatus = "redacted_reference";

export type AuthorizationAccessSourceReasonDto = {
  selectedAuthorizationPublicId: string;
  sourceReasonCode: AuthorizationSourceReasonCode;
};

export type AuthorizationAccessWindowReasonDto = {
  windowReasonCode: AuthorizationWindowReasonCode;
};

export type AuthorizationAccessContextReasonDto = {
  paperReasonCode: AuthorizationContextReasonCode | null;
  mockExamReasonCode: AuthorizationContextReasonCode | null;
};

export type AuthorizationAccessRedeemCodeReferenceDto = {
  publicId: string | null;
  redactionStatus: AuthorizationAccessReasonRedactionStatus;
  referenceStatus: AuthorizationAccessReasonReferenceStatus;
};

export type AuthorizationAccessEvidenceReferencesDto = {
  redeemCodeReference: AuthorizationAccessRedeemCodeReferenceDto;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  redactionStatus: AuthorizationAccessReasonRedactionStatus;
  referenceStatus: AuthorizationAccessReasonReferenceStatus;
};

export type AuthorizationAccessReasonSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  reasonStatus: AuthorizationAccessReasonSummaryStatus;
  reasonCodes: AuthorizationAccessReasonCode[];
  sourceReason: AuthorizationAccessSourceReasonDto;
  windowReason: AuthorizationAccessWindowReasonDto;
  contextReason: AuthorizationAccessContextReasonDto;
  evidenceReferences: AuthorizationAccessEvidenceReferencesDto;
};
