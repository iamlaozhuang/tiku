import type {
  AuthorizationContextReasonCode,
  AuthorizationContextReasonSummaryInput,
} from "./authorization-context-reason-summary";
import type { AuthorizationSourceReasonSummaryInput } from "./authorization-source-reason-summary";
import type {
  AuthorizationWindowReasonCode,
  AuthorizationWindowReasonSummaryInput,
} from "./authorization-window-reason-summary";

export type AuthorizationAccessReasonSummaryStatus = "reason_summary_only";

export type AuthorizationEvidenceReferenceReasonCode =
  | "redacted_references_present"
  | "redacted_references_missing";

export type AuthorizationAccessReasonCode =
  | "selected_authorization_active"
  | "selected_authorization_inactive"
  | AuthorizationWindowReasonCode
  | AuthorizationContextReasonCode
  | AuthorizationEvidenceReferenceReasonCode;

export type AuthorizationAccessReasonSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  windowReason: AuthorizationWindowReasonSummaryInput;
  contextReason: AuthorizationContextReasonSummaryInput;
  sourceReason: AuthorizationSourceReasonSummaryInput;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
