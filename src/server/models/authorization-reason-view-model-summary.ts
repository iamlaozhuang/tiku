import type { AuthorizationReasonContextViewModelInput } from "./authorization-reason-context-view-model";
import type { AuthorizationReasonEvidenceViewModelInput } from "./authorization-reason-evidence-view-model";
import type {
  AuthorizationReasonStatusViewModelInput,
  AuthorizationReasonViewModelStatus,
} from "./authorization-reason-status-view-model";
import type { AuthorizationReasonViewSectionSummaryStatus } from "./authorization-reason-view-section-summary";

export type AuthorizationReasonViewModelSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  summaryStatus: AuthorizationReasonViewSectionSummaryStatus;
  statusSection: AuthorizationReasonStatusViewModelInput;
  contextSection: AuthorizationReasonContextViewModelInput;
  evidenceSection: AuthorizationReasonEvidenceViewModelInput;
};

export type AuthorizationReasonViewModelSummaryStatus =
  AuthorizationReasonViewModelStatus;
