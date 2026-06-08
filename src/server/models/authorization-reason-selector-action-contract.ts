import type { AuthorizationReasonSelectorSummaryDto } from "../contracts/authorization-reason-selector-summary-contract";

export type AuthorizationReasonSelectorActionContractStatus =
  "local_server_action_contract_only";

export type AuthorizationReasonSelectorActionUserContext = {
  userPublicId: string;
};

export type AuthorizationReasonSelectorActionContractInput = {
  userContext: AuthorizationReasonSelectorActionUserContext;
  authorizationPublicId: string;
  selectorSummary: AuthorizationReasonSelectorSummaryDto;
};
