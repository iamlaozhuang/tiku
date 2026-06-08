import type { AuthorizationReasonContextViewSectionInput } from "./authorization-reason-context-view-section";
import type { AuthorizationReasonEvidenceViewSectionInput } from "./authorization-reason-evidence-view-section";
import type {
  AuthorizationReasonStatusViewSectionInput,
  AuthorizationReasonViewSectionStatus,
} from "./authorization-reason-status-view-section";

export type AuthorizationReasonViewSectionSummaryInput =
  AuthorizationReasonStatusViewSectionInput & {
    userPublicId: string;
    contextPresentation: AuthorizationReasonContextViewSectionInput;
    evidencePresentation: AuthorizationReasonEvidenceViewSectionInput;
  };

export type AuthorizationReasonViewSectionSummaryStatus =
  AuthorizationReasonViewSectionStatus;
