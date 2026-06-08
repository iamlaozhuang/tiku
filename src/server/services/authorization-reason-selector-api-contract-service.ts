import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonSelectorApiContractDto } from "../contracts/authorization-reason-selector-api-contract-contract";
import type { AuthorizationReasonSelectorApiContractInput } from "../models/authorization-reason-selector-api-contract";
import {
  authorizationReasonSelectorApiPathTemplate,
  buildAuthorizationReasonSelectorApiPath,
} from "../models/authorization-reason-selector-api-contract";
import { normalizeAuthorizationReasonSelectorApiContractInput } from "../validators/authorization-reason-selector-api-contract";

const INVALID_AUTHORIZATION_REASON_SELECTOR_API_CONTRACT_INPUT_CODE = 400040;

function mapApiContract(
  input: AuthorizationReasonSelectorApiContractInput,
): AuthorizationReasonSelectorApiContractDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    apiContractStatus: "local_api_contract_only",
    sourceSelectorStatus: input.selectorSummary.selectorStatus,
    contractKey: "authorization.reason.selector.api_contract",
    method: input.method,
    apiPathTemplate: authorizationReasonSelectorApiPathTemplate,
    apiPath: buildAuthorizationReasonSelectorApiPath(
      input.authorizationPublicId,
    ),
    evidenceReferenceStatus: "redacted_reference",
    selectorSummary: input.selectorSummary,
  };
}

export function buildAuthorizationReasonSelectorApiContract(
  input: unknown,
): ApiResponse<AuthorizationReasonSelectorApiContractDto | null> {
  const authorizationReasonSelectorApiContractInput =
    normalizeAuthorizationReasonSelectorApiContractInput(input);

  if (!authorizationReasonSelectorApiContractInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_SELECTOR_API_CONTRACT_INPUT_CODE,
      authorizationReasonSelectorApiContractInput.message,
    );
  }

  return createSuccessResponse(
    mapApiContract(authorizationReasonSelectorApiContractInput.value),
  );
}
