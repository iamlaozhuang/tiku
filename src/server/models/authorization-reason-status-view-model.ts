import type { AuthorizationAccessReasonCode } from "./authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";
import type { AuthorizationReasonViewSectionStatus } from "./authorization-reason-status-view-section";

export type AuthorizationReasonViewModelStatus = "local_view_model_only";

export type AuthorizationReasonStatusViewModelStatusItemInput = {
  itemKey: string;
  reasonCode: AuthorizationAccessReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonStatusViewModelInput = {
  sectionStatus: AuthorizationReasonViewSectionStatus;
  sectionKey: "authorization.reason.view_section.status";
  sectionSeverity: AuthorizationReasonItemPresentationSeverity;
  selectedAuthorizationPublicId: string;
  statusItems: AuthorizationReasonStatusViewModelStatusItemInput[];
};
