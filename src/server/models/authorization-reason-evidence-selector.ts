import type { AuthorizationReasonEvidenceViewModelDto } from "../contracts/authorization-reason-evidence-view-model-contract";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";

export type AuthorizationReasonEvidenceSelectorStatus = "local_selector_only";

export type AuthorizationReasonEvidenceSelectorInput =
  AuthorizationReasonEvidenceViewModelDto;

export type AuthorizationReasonEvidenceSelectorSummary = {
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  severity: AuthorizationReasonItemPresentationSeverity;
  evidenceChipCount: number;
};
