import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
} from "./authorization-reason-evidence-presentation";
import type { AuthorizationReasonEvidenceViewSectionStatus } from "./authorization-reason-evidence-view-section";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";
import type { AuthorizationReasonViewModelStatus } from "./authorization-reason-status-view-model";

export type AuthorizationReasonEvidenceViewModelEvidenceItemInput = {
  evidenceType: AuthorizationReasonEvidenceType;
  publicId: string | null;
  redactionStatus: AuthorizationReasonEvidenceRedactionStatus;
  referenceStatus: AuthorizationReasonEvidenceReferenceStatus;
  presentationKey: string;
  sortOrder: number;
};

export type AuthorizationReasonEvidenceViewModelInput = {
  sectionStatus: AuthorizationReasonEvidenceViewSectionStatus;
  sectionKey: "authorization.reason.view_section.evidence";
  sectionSeverity: AuthorizationReasonItemPresentationSeverity;
  evidenceItems: AuthorizationReasonEvidenceViewModelEvidenceItemInput[];
};

export type AuthorizationReasonEvidenceViewModelStatus =
  AuthorizationReasonViewModelStatus;
