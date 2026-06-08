import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonEvidenceViewSectionDto,
  AuthorizationReasonEvidenceViewSectionItemDto,
} from "../contracts/authorization-reason-evidence-view-section-contract";
import type { AuthorizationReasonEvidenceViewSectionPresentationInput } from "../models/authorization-reason-evidence-view-section";
import { normalizeAuthorizationReasonEvidenceViewSectionInput } from "../validators/authorization-reason-evidence-view-section";

const INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_SECTION_INPUT_CODE = 400030;

function mapEvidenceItem(
  evidencePresentation: AuthorizationReasonEvidenceViewSectionPresentationInput,
  index: number,
): AuthorizationReasonEvidenceViewSectionItemDto {
  return {
    evidenceType: evidencePresentation.evidenceType,
    publicId: evidencePresentation.publicId,
    redactionStatus: evidencePresentation.redactionStatus,
    referenceStatus: evidencePresentation.referenceStatus,
    presentationKey: evidencePresentation.presentationKey,
    sortOrder: index + 1,
  };
}

export function buildAuthorizationReasonEvidenceViewSectionReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonEvidenceViewSectionDto | null> {
  const authorizationReasonEvidenceViewSectionInput =
    normalizeAuthorizationReasonEvidenceViewSectionInput(input);

  if (!authorizationReasonEvidenceViewSectionInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_SECTION_INPUT_CODE,
      authorizationReasonEvidenceViewSectionInput.message,
    );
  }

  return createSuccessResponse({
    sectionStatus: "local_view_section_only",
    sectionKey: "authorization.reason.view_section.evidence",
    sectionSeverity: "info",
    evidenceItems:
      authorizationReasonEvidenceViewSectionInput.value.evidencePresentations.map(
        mapEvidenceItem,
      ),
  });
}
