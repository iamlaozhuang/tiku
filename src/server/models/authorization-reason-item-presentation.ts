import type { AuthorizationAccessReasonCode } from "./authorization-access-reason-summary";

export type AuthorizationReasonPresentationStatus = "local_presentation_only";

export type AuthorizationReasonItemPresentationSeverity = "info" | "attention";

export type AuthorizationReasonItemPresentationInput = {
  reasonStatus: "reason_summary_only";
  reasonCodes: AuthorizationAccessReasonCode[];
};
