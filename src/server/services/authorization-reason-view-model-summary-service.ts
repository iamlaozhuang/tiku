import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonViewModelSummaryDto } from "../contracts/authorization-reason-view-model-summary-contract";
import type { AuthorizationReasonViewModelSummaryInput } from "../models/authorization-reason-view-model-summary";
import { normalizeAuthorizationReasonViewModelSummaryInput } from "../validators/authorization-reason-view-model-summary";
import { buildAuthorizationReasonContextViewModelReadModel } from "./authorization-reason-context-view-model-service";
import { buildAuthorizationReasonEvidenceViewModelReadModel } from "./authorization-reason-evidence-view-model-service";
import { buildAuthorizationReasonStatusViewModelReadModel } from "./authorization-reason-status-view-model-service";

const INVALID_AUTHORIZATION_REASON_VIEW_MODEL_SUMMARY_INPUT_CODE = 400035;

function mapViewModelSummary(
  input: AuthorizationReasonViewModelSummaryInput,
): AuthorizationReasonViewModelSummaryDto {
  const statusModel = buildAuthorizationReasonStatusViewModelReadModel(
    input.statusSection,
  );
  const contextModel = buildAuthorizationReasonContextViewModelReadModel(
    input.contextSection,
  );
  const evidenceModel = buildAuthorizationReasonEvidenceViewModelReadModel(
    input.evidenceSection,
  );

  if (
    statusModel.data === null ||
    contextModel.data === null ||
    evidenceModel.data === null
  ) {
    throw new Error(
      "view model summary input must be validated before mapping.",
    );
  }

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    summaryStatus: "local_view_model_only",
    sourceSummaryStatus: input.summaryStatus,
    statusModel: statusModel.data,
    contextModel: contextModel.data,
    evidenceModel: evidenceModel.data,
  };
}

export function buildAuthorizationReasonViewModelSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonViewModelSummaryDto | null> {
  const authorizationReasonViewModelSummaryInput =
    normalizeAuthorizationReasonViewModelSummaryInput(input);

  if (!authorizationReasonViewModelSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_VIEW_MODEL_SUMMARY_INPUT_CODE,
      authorizationReasonViewModelSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapViewModelSummary(authorizationReasonViewModelSummaryInput.value),
  );
}
