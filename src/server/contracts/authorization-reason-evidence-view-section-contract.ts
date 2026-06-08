import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
} from "../models/authorization-reason-evidence-presentation";
import type { AuthorizationReasonEvidenceViewSectionStatus } from "../models/authorization-reason-evidence-view-section";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonEvidenceViewSectionItemDto = {
  evidenceType: AuthorizationReasonEvidenceType;
  publicId: string | null;
  redactionStatus: AuthorizationReasonEvidenceRedactionStatus;
  referenceStatus: AuthorizationReasonEvidenceReferenceStatus;
  presentationKey: string;
  sortOrder: number;
};

export type AuthorizationReasonEvidenceViewSectionDto = {
  sectionStatus: AuthorizationReasonEvidenceViewSectionStatus;
  sectionKey: "authorization.reason.view_section.evidence";
  sectionSeverity: AuthorizationReasonItemPresentationSeverity;
  evidenceItems: AuthorizationReasonEvidenceViewSectionItemDto[];
};
