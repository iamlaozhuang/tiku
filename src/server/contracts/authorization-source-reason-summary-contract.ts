import type { AuthStatus } from "../models/auth";
import type {
  AuthorizationSourceReasonCode,
  AuthorizationSourceReasonSummaryStatus,
} from "../models/authorization-source-reason-summary";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationSourceReasonRedactionStatus = "redacted";

export type AuthorizationSourceReasonRedeemCodeReferenceDto = {
  publicId: string | null;
  redactionStatus: AuthorizationSourceReasonRedactionStatus;
};

export type AuthorizationSourceReasonSelectedAuthorizationDto = {
  publicId: string;
  authorizationType: AuthorizationContextSourceType;
  status: AuthStatus;
  organizationPublicId: string | null;
  sourceReasonCode: AuthorizationSourceReasonCode;
  redeemCodeReference: AuthorizationSourceReasonRedeemCodeReferenceDto;
};

export type AuthorizationSourceReasonSummaryDto = {
  userPublicId: string;
  selectedAuthorizationPublicId: string;
  reasonStatus: AuthorizationSourceReasonSummaryStatus;
  selectedAuthorization: AuthorizationSourceReasonSelectedAuthorizationDto | null;
};
