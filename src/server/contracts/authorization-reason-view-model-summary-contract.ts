import type { AuthorizationReasonContextViewModelDto } from "./authorization-reason-context-view-model-contract";
import type { AuthorizationReasonEvidenceViewModelDto } from "./authorization-reason-evidence-view-model-contract";
import type { AuthorizationReasonStatusViewModelDto } from "./authorization-reason-status-view-model-contract";
import type {
  AuthorizationReasonViewModelSummaryInput,
  AuthorizationReasonViewModelSummaryStatus,
} from "../models/authorization-reason-view-model-summary";

export type AuthorizationReasonViewModelSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  summaryStatus: AuthorizationReasonViewModelSummaryStatus;
  sourceSummaryStatus: AuthorizationReasonViewModelSummaryInput["summaryStatus"];
  statusModel: AuthorizationReasonStatusViewModelDto;
  contextModel: AuthorizationReasonContextViewModelDto;
  evidenceModel: AuthorizationReasonEvidenceViewModelDto;
};
