import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonEvidenceSelectorDto } from "../contracts/authorization-reason-evidence-selector-contract";
import type { AuthorizationReasonEvidenceViewModelChipDto } from "../contracts/authorization-reason-evidence-view-model-contract";
import type { AuthorizationReasonEvidenceType } from "../models/authorization-reason-evidence-presentation";
import { normalizeAuthorizationReasonEvidenceSelectorInput } from "../validators/authorization-reason-evidence-selector";

const INVALID_AUTHORIZATION_REASON_EVIDENCE_SELECTOR_INPUT_CODE = 400038;

function resolveEvidencePublicId(
  evidenceChips: AuthorizationReasonEvidenceViewModelChipDto[],
  evidenceType: AuthorizationReasonEvidenceType,
): string | null {
  return (
    [...evidenceChips]
      .filter((evidenceChip) => evidenceChip.evidenceType === evidenceType)
      .sort((leftEvidenceChip, rightEvidenceChip) => {
        return leftEvidenceChip.sortOrder - rightEvidenceChip.sortOrder;
      })[0]?.publicId ?? null
  );
}

export function buildAuthorizationReasonEvidenceSelectorReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonEvidenceSelectorDto | null> {
  const authorizationReasonEvidenceSelectorInput =
    normalizeAuthorizationReasonEvidenceSelectorInput(input);

  if (!authorizationReasonEvidenceSelectorInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_EVIDENCE_SELECTOR_INPUT_CODE,
      authorizationReasonEvidenceSelectorInput.message,
    );
  }

  return createSuccessResponse({
    selectorStatus: "local_selector_only",
    sourceViewModelStatus:
      authorizationReasonEvidenceSelectorInput.value.viewModelStatus,
    selectorKey: "authorization.reason.selector.evidence",
    severity: authorizationReasonEvidenceSelectorInput.value.severity,
    redeemCodePublicId: resolveEvidencePublicId(
      authorizationReasonEvidenceSelectorInput.value.evidenceChips,
      "redeem_code",
    ),
    auditLogPublicId: resolveEvidencePublicId(
      authorizationReasonEvidenceSelectorInput.value.evidenceChips,
      "audit_log",
    ),
    aiCallLogPublicId: resolveEvidencePublicId(
      authorizationReasonEvidenceSelectorInput.value.evidenceChips,
      "ai_call_log",
    ),
    evidenceChipCount:
      authorizationReasonEvidenceSelectorInput.value.evidenceChips.length,
  });
}
