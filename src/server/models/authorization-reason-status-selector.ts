import type { AuthorizationAccessReasonCode } from "./authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";
import type { AuthorizationReasonStatusViewModelDto } from "../contracts/authorization-reason-status-view-model-contract";

export type AuthorizationReasonSelectorStatus = "local_selector_only";

export type AuthorizationReasonStatusSelectorInput =
  AuthorizationReasonStatusViewModelDto;

export type AuthorizationReasonStatusSelectorSummary = {
  selectedAuthorizationPublicId: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  primaryReasonCode: AuthorizationAccessReasonCode;
  statusRowCount: number;
};
