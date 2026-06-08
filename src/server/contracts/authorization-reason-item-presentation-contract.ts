import type { AuthorizationAccessReasonCode } from "../models/authorization-access-reason-summary";
import type {
  AuthorizationReasonItemPresentationSeverity,
  AuthorizationReasonPresentationStatus,
} from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonItemPresentationDto = {
  reasonCode: AuthorizationAccessReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
  sortOrder: number;
};

export type AuthorizationReasonItemPresentationSummaryDto = {
  presentationStatus: AuthorizationReasonPresentationStatus;
  reasonItems: AuthorizationReasonItemPresentationDto[];
};
