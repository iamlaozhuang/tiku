import type { AuthorizationContextReasonCode } from "./authorization-context-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";
import type { AuthorizationReasonViewSectionStatus } from "./authorization-reason-status-view-section";

export type AuthorizationReasonContextViewSectionType = "paper" | "mock_exam";

export type AuthorizationReasonContextViewSectionPresentationInput = {
  contextType: AuthorizationReasonContextViewSectionType;
  publicId: string;
  reasonCode: AuthorizationContextReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
};

export type AuthorizationReasonContextViewSectionInput = {
  presentationStatus: "local_presentation_only";
  paperContextPresentation: AuthorizationReasonContextViewSectionPresentationInput | null;
  mockExamContextPresentation: AuthorizationReasonContextViewSectionPresentationInput | null;
};

export type AuthorizationReasonContextViewSectionStatus =
  AuthorizationReasonViewSectionStatus;
