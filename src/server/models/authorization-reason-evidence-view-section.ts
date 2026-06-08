import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
} from "./authorization-reason-evidence-presentation";
import type { AuthorizationReasonViewSectionStatus } from "./authorization-reason-status-view-section";

export type AuthorizationReasonEvidenceViewSectionPresentationInput = {
  evidenceType: AuthorizationReasonEvidenceType;
  publicId: string | null;
  redactionStatus: AuthorizationReasonEvidenceRedactionStatus;
  referenceStatus: AuthorizationReasonEvidenceReferenceStatus;
  presentationKey: string;
};

export type AuthorizationReasonEvidenceViewSectionInput = {
  presentationStatus: "local_presentation_only";
  evidencePresentations: AuthorizationReasonEvidenceViewSectionPresentationInput[];
};

export type AuthorizationReasonEvidenceViewSectionStatus =
  AuthorizationReasonViewSectionStatus;
