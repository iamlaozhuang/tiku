import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonEvidenceViewModelChipDto,
  AuthorizationReasonEvidenceViewModelDto,
} from "../contracts/authorization-reason-evidence-view-model-contract";
import type { AuthorizationReasonEvidenceViewModelEvidenceItemInput } from "../models/authorization-reason-evidence-view-model";
import { normalizeAuthorizationReasonEvidenceViewModelInput } from "../validators/authorization-reason-evidence-view-model";

const INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_MODEL_INPUT_CODE = 400034;

function resolveEvidenceChipKey(
  evidenceItem: AuthorizationReasonEvidenceViewModelEvidenceItemInput,
): AuthorizationReasonEvidenceViewModelChipDto["chipKey"] {
  if (evidenceItem.evidenceType === "redeem_code") {
    return "authorization.reason.view_model.evidence.redeem_code";
  }

  if (evidenceItem.evidenceType === "audit_log") {
    return "authorization.reason.view_model.evidence.audit_log";
  }

  return "authorization.reason.view_model.evidence.ai_call_log";
}

function mapEvidenceChip(
  evidenceItem: AuthorizationReasonEvidenceViewModelEvidenceItemInput,
): AuthorizationReasonEvidenceViewModelChipDto {
  return {
    chipKey: resolveEvidenceChipKey(evidenceItem),
    evidenceType: evidenceItem.evidenceType,
    publicId: evidenceItem.publicId,
    redactionStatus: evidenceItem.redactionStatus,
    referenceStatus: evidenceItem.referenceStatus,
    presentationKey: evidenceItem.presentationKey,
    sortOrder: evidenceItem.sortOrder,
  };
}

export function buildAuthorizationReasonEvidenceViewModelReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonEvidenceViewModelDto | null> {
  const authorizationReasonEvidenceViewModelInput =
    normalizeAuthorizationReasonEvidenceViewModelInput(input);

  if (!authorizationReasonEvidenceViewModelInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_EVIDENCE_VIEW_MODEL_INPUT_CODE,
      authorizationReasonEvidenceViewModelInput.message,
    );
  }

  const evidenceChips = [
    ...authorizationReasonEvidenceViewModelInput.value.evidenceItems,
  ]
    .sort((leftEvidenceItem, rightEvidenceItem) => {
      return leftEvidenceItem.sortOrder - rightEvidenceItem.sortOrder;
    })
    .map(mapEvidenceChip);

  return createSuccessResponse({
    viewModelStatus: "local_view_model_only",
    sourceSectionStatus:
      authorizationReasonEvidenceViewModelInput.value.sectionStatus,
    modelKey: "authorization.reason.view_model.evidence",
    severity: authorizationReasonEvidenceViewModelInput.value.sectionSeverity,
    evidenceChips,
  });
}
