import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type {
  AuthorizationReasonContextPresentationSeverity,
  AuthorizationReasonContextPresentationStatus,
  AuthorizationReasonContextType,
} from "../models/authorization-reason-context-presentation";

export type AuthorizationReasonContextPresentationDto = {
  contextType: AuthorizationReasonContextType;
  publicId: string;
  reasonCode: AuthorizationContextReasonCode;
  presentationKey: string;
  severity: AuthorizationReasonContextPresentationSeverity;
};

export type AuthorizationReasonContextPresentationSummaryDto = {
  presentationStatus: AuthorizationReasonContextPresentationStatus;
  paperContextPresentation: AuthorizationReasonContextPresentationDto | null;
  mockExamContextPresentation: AuthorizationReasonContextPresentationDto | null;
};
