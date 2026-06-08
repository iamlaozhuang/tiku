export type AuthorizationWindowDisplayStatus = "display_only";

export type AuthorizationWindowStatus =
  | "not_started"
  | "within_window"
  | "open_ended"
  | "expired";

export type AuthorizationWindowSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  startsAt: string;
  expiresAt: string | null;
  currentAt: string;
};
