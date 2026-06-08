import type { AuthorizationContextReasonCode } from "./authorization-context-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";
import type {
  AuthorizationReasonContextViewSectionStatus,
  AuthorizationReasonContextViewSectionType,
} from "./authorization-reason-context-view-section";
import type { AuthorizationReasonViewModelStatus } from "./authorization-reason-status-view-model";

export type AuthorizationReasonContextViewModelContextItemInput = {
  contextType: AuthorizationReasonContextViewSectionType;
  publicId: string;
  reasonCode: AuthorizationContextReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonContextViewModelInput = {
  sectionStatus: AuthorizationReasonContextViewSectionStatus;
  sectionKey: "authorization.reason.view_section.context";
  sectionSeverity: AuthorizationReasonItemPresentationSeverity;
  contextItems: AuthorizationReasonContextViewModelContextItemInput[];
};

export type AuthorizationReasonContextViewModelStatus =
  AuthorizationReasonViewModelStatus;
