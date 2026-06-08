import type {
  AuthorizationReasonEvidenceRedactionStatus,
  AuthorizationReasonEvidenceReferenceStatus,
  AuthorizationReasonEvidenceType,
} from "../models/authorization-reason-evidence-presentation";
import type {
  AuthorizationReasonEvidenceViewModelInput,
  AuthorizationReasonEvidenceViewModelStatus,
} from "../models/authorization-reason-evidence-view-model";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonEvidenceViewModelChipDto = {
  chipKey:
    | "authorization.reason.view_model.evidence.redeem_code"
    | "authorization.reason.view_model.evidence.audit_log"
    | "authorization.reason.view_model.evidence.ai_call_log";
  evidenceType: AuthorizationReasonEvidenceType;
  publicId: string | null;
  redactionStatus: AuthorizationReasonEvidenceRedactionStatus;
  referenceStatus: AuthorizationReasonEvidenceReferenceStatus;
  presentationKey: string;
  sortOrder: number;
};

export type AuthorizationReasonEvidenceViewModelDto = {
  viewModelStatus: AuthorizationReasonEvidenceViewModelStatus;
  sourceSectionStatus: AuthorizationReasonEvidenceViewModelInput["sectionStatus"];
  modelKey: "authorization.reason.view_model.evidence";
  severity: AuthorizationReasonItemPresentationSeverity;
  evidenceChips: AuthorizationReasonEvidenceViewModelChipDto[];
};
