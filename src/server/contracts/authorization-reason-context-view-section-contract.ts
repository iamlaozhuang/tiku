import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type {
  AuthorizationReasonContextViewSectionStatus,
  AuthorizationReasonContextViewSectionType,
} from "../models/authorization-reason-context-view-section";

export type AuthorizationReasonContextViewSectionItemDto = {
  contextType: AuthorizationReasonContextViewSectionType;
  publicId: string;
  reasonCode: AuthorizationContextReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonContextViewSectionDto = {
  sectionStatus: AuthorizationReasonContextViewSectionStatus;
  sectionKey: "authorization.reason.view_section.context";
  sectionSeverity: AuthorizationReasonItemPresentationSeverity;
  contextItems: AuthorizationReasonContextViewSectionItemDto[];
};
