import type { AuthStatus, Profession } from "./auth";
import type { AuthorizationContextSourceType } from "./authorization-context";

export type AuthorizationSourceReasonSummaryStatus = "reason_summary_only";

export type AuthorizationSourceReasonCode =
  | "selected_authorization_active"
  | "selected_authorization_inactive";

export type AuthorizationSourceReasonSummarySource = {
  publicId: string;
  authorizationType: AuthorizationContextSourceType;
  profession: Profession;
  level: number;
  startsAt: Date;
  expiresAt: Date;
  status: AuthStatus;
  organizationPublicId: string | null;
  redeemCodePublicId: string | null;
};

export type AuthorizationSourceReasonSummaryInput = {
  userPublicId: string;
  selectedAuthorizationPublicId: string;
  authorizationSources: AuthorizationSourceReasonSummarySource[];
};
