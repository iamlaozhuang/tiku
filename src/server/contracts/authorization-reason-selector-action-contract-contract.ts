import type { AuthorizationReasonSelectorSummaryDto } from "./authorization-reason-selector-summary-contract";
import type { AuthorizationReasonSelectorActionContractStatus } from "../models/authorization-reason-selector-action-contract";

export type AuthorizationReasonSelectorActionContractDto = {
  userPublicId: string;
  authorizationPublicId: string;
  actionContractStatus: AuthorizationReasonSelectorActionContractStatus;
  sourceSelectorStatus: AuthorizationReasonSelectorSummaryDto["selectorStatus"];
  actionKey: "authorization.reason.selector.server_action_contract";
  evidenceReferenceStatus: "redacted_reference";
  selectorSummary: AuthorizationReasonSelectorSummaryDto;
};
