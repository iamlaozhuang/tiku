import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonSelectorActionContractDto } from "../contracts/authorization-reason-selector-action-contract-contract";
import type { AuthorizationReasonSelectorActionContractInput } from "../models/authorization-reason-selector-action-contract";
import { normalizeAuthorizationReasonSelectorActionContractInput } from "../validators/authorization-reason-selector-action-contract";

const INVALID_AUTHORIZATION_REASON_SELECTOR_ACTION_CONTRACT_INPUT_CODE = 400041;

function mapActionContract(
  input: AuthorizationReasonSelectorActionContractInput,
): AuthorizationReasonSelectorActionContractDto {
  return {
    userPublicId: input.userContext.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    actionContractStatus: "local_server_action_contract_only",
    sourceSelectorStatus: input.selectorSummary.selectorStatus,
    actionKey: "authorization.reason.selector.server_action_contract",
    evidenceReferenceStatus: "redacted_reference",
    selectorSummary: input.selectorSummary,
  };
}

export function buildAuthorizationReasonSelectorActionContract(
  input: unknown,
): ApiResponse<AuthorizationReasonSelectorActionContractDto | null> {
  const authorizationReasonSelectorActionContractInput =
    normalizeAuthorizationReasonSelectorActionContractInput(input);

  if (!authorizationReasonSelectorActionContractInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_SELECTOR_ACTION_CONTRACT_INPUT_CODE,
      authorizationReasonSelectorActionContractInput.message,
    );
  }

  return createSuccessResponse(
    mapActionContract(authorizationReasonSelectorActionContractInput.value),
  );
}
