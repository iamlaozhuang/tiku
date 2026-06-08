import type { AuthorizationReasonSelectorSummaryDto } from "../contracts/authorization-reason-selector-summary-contract";

export type AuthorizationReasonSelectorApiContractStatus =
  "local_api_contract_only";

export type AuthorizationReasonSelectorApiContractMethod = "POST";

export type AuthorizationReasonSelectorApiContractInput = {
  userPublicId: string;
  authorizationPublicId: string;
  method: AuthorizationReasonSelectorApiContractMethod;
  selectorSummary: AuthorizationReasonSelectorSummaryDto;
};

export const authorizationReasonSelectorApiPathTemplate =
  "/api/v1/authorizations/{authorizationPublicId}/preview-reason-selector";

export function buildAuthorizationReasonSelectorApiPath(
  authorizationPublicId: string,
): string {
  return `/api/v1/authorizations/${authorizationPublicId}/preview-reason-selector`;
}
