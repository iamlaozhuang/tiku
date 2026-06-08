import type { AuthorizationAccessReasonCode } from "./authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";
import type { AuthorizationSourceReasonCode } from "./authorization-source-reason-summary";

export type AuthorizationReasonViewSectionStatus = "local_view_section_only";

export type AuthorizationReasonStatusViewSectionSourceInput = {
  selectedAuthorizationPublicId: string;
  sourceReasonCode: AuthorizationSourceReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
};

export type AuthorizationReasonStatusViewSectionReasonItemInput = {
  reasonCode: AuthorizationAccessReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonStatusViewSectionInput = {
  presentationStatus: "local_presentation_only";
  authorizationPublicId: string;
  sourcePresentation: AuthorizationReasonStatusViewSectionSourceInput;
  reasonItems: AuthorizationReasonStatusViewSectionReasonItemInput[];
};
