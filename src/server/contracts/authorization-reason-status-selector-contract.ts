import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type {
  AuthorizationReasonSelectorStatus,
  AuthorizationReasonStatusSelectorInput,
} from "../models/authorization-reason-status-selector";

export type AuthorizationReasonStatusSelectorDto = {
  selectorStatus: AuthorizationReasonSelectorStatus;
  sourceViewModelStatus: AuthorizationReasonStatusSelectorInput["viewModelStatus"];
  selectorKey: "authorization.reason.selector.status";
  selectedAuthorizationPublicId: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  primaryReasonCode: AuthorizationAccessReasonCode;
  statusRowCount: number;
};
