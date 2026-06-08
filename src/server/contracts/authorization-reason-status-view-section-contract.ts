import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type { AuthorizationReasonViewSectionStatus } from "../models/authorization-reason-status-view-section";

export type AuthorizationReasonStatusViewSectionItemDto = {
  itemKey: string;
  reasonCode: AuthorizationAccessReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonStatusViewSectionDto = {
  sectionStatus: AuthorizationReasonViewSectionStatus;
  sectionKey: "authorization.reason.view_section.status";
  sectionSeverity: AuthorizationReasonItemPresentationSeverity;
  selectedAuthorizationPublicId: string;
  statusItems: AuthorizationReasonStatusViewSectionItemDto[];
};
