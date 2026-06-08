import type { AuthorizationReasonContextViewModelDto } from "../contracts/authorization-reason-context-view-model-contract";
import type { AuthorizationReasonItemPresentationSeverity } from "./authorization-reason-item-presentation";

export type AuthorizationReasonContextSelectorStatus = "local_selector_only";

export type AuthorizationReasonContextSelectorInput =
  AuthorizationReasonContextViewModelDto;

export type AuthorizationReasonContextSelectorSummary = {
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  severity: AuthorizationReasonItemPresentationSeverity;
  contextCardCount: number;
};
