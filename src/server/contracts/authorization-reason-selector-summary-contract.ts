import type { AuthorizationReasonContextSelectorDto } from "./authorization-reason-context-selector-contract";
import type { AuthorizationReasonEvidenceSelectorDto } from "./authorization-reason-evidence-selector-contract";
import type { AuthorizationReasonStatusSelectorDto } from "./authorization-reason-status-selector-contract";
import type { AuthorizationReasonSelectorSummaryStatus } from "../models/authorization-reason-selector-summary";
import type { AuthorizationReasonViewModelSummaryStatus } from "../models/authorization-reason-view-model-summary";

export type AuthorizationReasonSelectorSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  selectorStatus: AuthorizationReasonSelectorSummaryStatus;
  sourceSummaryStatus: AuthorizationReasonViewModelSummaryStatus;
  selectorKey: "authorization.reason.selector.summary";
  statusSelector: AuthorizationReasonStatusSelectorDto;
  contextSelector: AuthorizationReasonContextSelectorDto;
  evidenceSelector: AuthorizationReasonEvidenceSelectorDto;
};
