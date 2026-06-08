import type { AuthorizationReasonEvidenceSelectorStatus } from "../models/authorization-reason-evidence-selector";
import type { AuthorizationReasonEvidenceViewModelStatus } from "../models/authorization-reason-evidence-view-model";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonEvidenceSelectorDto = {
  selectorStatus: AuthorizationReasonEvidenceSelectorStatus;
  sourceViewModelStatus: AuthorizationReasonEvidenceViewModelStatus;
  selectorKey: "authorization.reason.selector.evidence";
  severity: AuthorizationReasonItemPresentationSeverity;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  evidenceChipCount: number;
};
