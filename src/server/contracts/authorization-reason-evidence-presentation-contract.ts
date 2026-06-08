import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
  AuthorizationReasonEvidencePresentationStatus,
} from "../models/authorization-reason-evidence-presentation";

export type AuthorizationReasonEvidencePresentationDto = {
  evidenceType: AuthorizationReasonEvidenceType;
  publicId: string | null;
  redactionStatus: AuthorizationReasonEvidenceRedactionStatus;
  referenceStatus: AuthorizationReasonEvidenceReferenceStatus;
  presentationKey: string;
};

export type AuthorizationReasonEvidencePresentationSummaryDto = {
  presentationStatus: AuthorizationReasonEvidencePresentationStatus;
  evidencePresentations: AuthorizationReasonEvidencePresentationDto[];
};
