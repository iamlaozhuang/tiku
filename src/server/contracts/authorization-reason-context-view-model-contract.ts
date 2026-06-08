import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type {
  AuthorizationReasonContextViewModelInput,
  AuthorizationReasonContextViewModelStatus,
} from "../models/authorization-reason-context-view-model";
import type { AuthorizationReasonContextViewSectionType } from "../models/authorization-reason-context-view-section";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonContextViewModelCardDto = {
  cardKey:
    | "authorization.reason.view_model.context.paper"
    | "authorization.reason.view_model.context.mock_exam";
  contextType: AuthorizationReasonContextViewSectionType;
  publicId: string;
  reasonCode: AuthorizationContextReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonContextViewModelDto = {
  viewModelStatus: AuthorizationReasonContextViewModelStatus;
  sourceSectionStatus: AuthorizationReasonContextViewModelInput["sectionStatus"];
  modelKey: "authorization.reason.view_model.context";
  severity: AuthorizationReasonItemPresentationSeverity;
  contextCards: AuthorizationReasonContextViewModelCardDto[];
};
