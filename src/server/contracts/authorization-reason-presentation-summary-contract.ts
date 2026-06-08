import type { AuthorizationSourceReasonCode } from "../models/authorization-source-reason-summary";
import type {
  AuthorizationReasonItemPresentationSeverity,
  AuthorizationReasonPresentationStatus,
} from "../models/authorization-reason-item-presentation";
import type { AuthorizationReasonContextPresentationSummaryDto } from "./authorization-reason-context-presentation-contract";
import type { AuthorizationReasonEvidencePresentationSummaryDto } from "./authorization-reason-evidence-presentation-contract";
import type { AuthorizationReasonItemPresentationDto } from "./authorization-reason-item-presentation-contract";

export type AuthorizationReasonSourcePresentationDto = {
  selectedAuthorizationPublicId: string;
  sourceReasonCode: AuthorizationSourceReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonItemPresentationSeverity;
};

export type AuthorizationReasonPresentationSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  reasonStatus: "reason_summary_only";
  presentationStatus: AuthorizationReasonPresentationStatus;
  sourcePresentation: AuthorizationReasonSourcePresentationDto;
  reasonItems: AuthorizationReasonItemPresentationDto[];
  contextPresentation: AuthorizationReasonContextPresentationSummaryDto;
  evidencePresentation: AuthorizationReasonEvidencePresentationSummaryDto;
};
