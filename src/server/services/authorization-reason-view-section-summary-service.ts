import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonViewSectionSummaryDto } from "../contracts/authorization-reason-view-section-summary-contract";
import type { AuthorizationReasonViewSectionSummaryInput } from "../models/authorization-reason-view-section-summary";
import { normalizeAuthorizationReasonViewSectionSummaryInput } from "../validators/authorization-reason-view-section-summary";
import { buildAuthorizationReasonContextViewSectionReadModel } from "./authorization-reason-context-view-section-service";
import { buildAuthorizationReasonEvidenceViewSectionReadModel } from "./authorization-reason-evidence-view-section-service";
import { buildAuthorizationReasonStatusViewSectionReadModel } from "./authorization-reason-status-view-section-service";

const INVALID_AUTHORIZATION_REASON_VIEW_SECTION_SUMMARY_INPUT_CODE = 400031;

function mapViewSectionSummary(
  input: AuthorizationReasonViewSectionSummaryInput,
): AuthorizationReasonViewSectionSummaryDto {
  const statusSection = buildAuthorizationReasonStatusViewSectionReadModel({
    presentationStatus: input.presentationStatus,
    authorizationPublicId: input.authorizationPublicId,
    sourcePresentation: input.sourcePresentation,
    reasonItems: input.reasonItems,
  });
  const contextSection = buildAuthorizationReasonContextViewSectionReadModel(
    input.contextPresentation,
  );
  const evidenceSection = buildAuthorizationReasonEvidenceViewSectionReadModel(
    input.evidencePresentation,
  );

  if (
    statusSection.data === null ||
    contextSection.data === null ||
    evidenceSection.data === null
  ) {
    throw new Error(
      "view section summary input must be validated before mapping.",
    );
  }

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    summaryStatus: "local_view_section_only",
    statusSection: statusSection.data,
    contextSection: contextSection.data,
    evidenceSection: evidenceSection.data,
  };
}

export function buildAuthorizationReasonViewSectionSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonViewSectionSummaryDto | null> {
  const authorizationReasonViewSectionSummaryInput =
    normalizeAuthorizationReasonViewSectionSummaryInput(input);

  if (!authorizationReasonViewSectionSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_VIEW_SECTION_SUMMARY_INPUT_CODE,
      authorizationReasonViewSectionSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapViewSectionSummary(authorizationReasonViewSectionSummaryInput.value),
  );
}
