import type { AuthorizationReasonContextViewSectionDto } from "./authorization-reason-context-view-section-contract";
import type { AuthorizationReasonEvidenceViewSectionDto } from "./authorization-reason-evidence-view-section-contract";
import type { AuthorizationReasonStatusViewSectionDto } from "./authorization-reason-status-view-section-contract";
import type { AuthorizationReasonViewSectionSummaryStatus } from "../models/authorization-reason-view-section-summary";

export type AuthorizationReasonViewSectionSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  summaryStatus: AuthorizationReasonViewSectionSummaryStatus;
  statusSection: AuthorizationReasonStatusViewSectionDto;
  contextSection: AuthorizationReasonContextViewSectionDto;
  evidenceSection: AuthorizationReasonEvidenceViewSectionDto;
};
