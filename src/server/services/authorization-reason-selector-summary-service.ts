import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonSelectorSummaryDto } from "../contracts/authorization-reason-selector-summary-contract";
import type { AuthorizationReasonSelectorSummaryInput } from "../models/authorization-reason-selector-summary";
import { normalizeAuthorizationReasonSelectorSummaryInput } from "../validators/authorization-reason-selector-summary";
import { buildAuthorizationReasonContextSelectorReadModel } from "./authorization-reason-context-selector-service";
import { buildAuthorizationReasonEvidenceSelectorReadModel } from "./authorization-reason-evidence-selector-service";
import { buildAuthorizationReasonStatusSelectorReadModel } from "./authorization-reason-status-selector-service";

const INVALID_AUTHORIZATION_REASON_SELECTOR_SUMMARY_INPUT_CODE = 400039;

function mapSelectorSummary(
  input: AuthorizationReasonSelectorSummaryInput,
): AuthorizationReasonSelectorSummaryDto {
  const statusSelector = buildAuthorizationReasonStatusSelectorReadModel(
    input.statusModel,
  );
  const contextSelector = buildAuthorizationReasonContextSelectorReadModel(
    input.contextModel,
  );
  const evidenceSelector = buildAuthorizationReasonEvidenceSelectorReadModel(
    input.evidenceModel,
  );

  if (
    statusSelector.data === null ||
    contextSelector.data === null ||
    evidenceSelector.data === null
  ) {
    throw new Error("selector summary input must be validated before mapping.");
  }

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    selectorStatus: "local_selector_only",
    sourceSummaryStatus: input.summaryStatus,
    selectorKey: "authorization.reason.selector.summary",
    statusSelector: statusSelector.data,
    contextSelector: contextSelector.data,
    evidenceSelector: evidenceSelector.data,
  };
}

export function buildAuthorizationReasonSelectorSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonSelectorSummaryDto | null> {
  const authorizationReasonSelectorSummaryInput =
    normalizeAuthorizationReasonSelectorSummaryInput(input);

  if (!authorizationReasonSelectorSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_SELECTOR_SUMMARY_INPUT_CODE,
      authorizationReasonSelectorSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapSelectorSummary(authorizationReasonSelectorSummaryInput.value),
  );
}
