import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";
import type {
  AuthorizationReasonViewModelStatus,
  AuthorizationReasonStatusViewModelInput,
} from "../models/authorization-reason-status-view-model";

export type AuthorizationReasonStatusViewModelRowDto = {
  rowKey:
    | "authorization.reason.view_model.status.source"
    | "authorization.reason.view_model.status.window";
  reasonCode: AuthorizationAccessReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonStatusViewModelDto = {
  viewModelStatus: AuthorizationReasonViewModelStatus;
  sourceSectionStatus: AuthorizationReasonStatusViewModelInput["sectionStatus"];
  modelKey: "authorization.reason.view_model.status";
  severity: AuthorizationReasonItemPresentationSeverity;
  selectedAuthorizationPublicId: string;
  statusRows: AuthorizationReasonStatusViewModelRowDto[];
};
