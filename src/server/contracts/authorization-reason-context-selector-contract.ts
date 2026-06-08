import type { AuthorizationReasonContextSelectorStatus } from "../models/authorization-reason-context-selector";
import type { AuthorizationReasonContextViewModelStatus } from "../models/authorization-reason-context-view-model";
import type { AuthorizationReasonItemPresentationSeverity } from "../models/authorization-reason-item-presentation";

export type AuthorizationReasonContextSelectorDto = {
  selectorStatus: AuthorizationReasonContextSelectorStatus;
  sourceViewModelStatus: AuthorizationReasonContextViewModelStatus;
  selectorKey: "authorization.reason.selector.context";
  severity: AuthorizationReasonItemPresentationSeverity;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  contextCardCount: number;
};
