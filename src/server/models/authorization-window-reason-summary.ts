export type AuthorizationWindowReasonSummaryStatus = "reason_summary_only";

export type AuthorizationWindowReasonCode =
  | "authorization_window_within_window"
  | "authorization_window_not_started"
  | "authorization_window_expired"
  | "authorization_window_open_ended";

export type AuthorizationWindowReasonSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  startsAt: string;
  expiresAt: string | null;
  currentAt: string;
};
