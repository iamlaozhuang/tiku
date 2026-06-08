import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonEvidencePresentationDto,
  AuthorizationReasonEvidencePresentationSummaryDto,
} from "../contracts/authorization-reason-evidence-presentation-contract";
import type {
  AuthorizationReasonEvidencePresentationInput,
  AuthorizationReasonEvidenceType,
} from "../models/authorization-reason-evidence-presentation";
import { normalizeAuthorizationReasonEvidencePresentationInput } from "../validators/authorization-reason-evidence-presentation";

const INVALID_AUTHORIZATION_REASON_EVIDENCE_PRESENTATION_INPUT_CODE = 400026;

function mapEvidenceReferenceToPresentation(
  evidenceType: AuthorizationReasonEvidenceType,
  publicId: string | null,
): AuthorizationReasonEvidencePresentationDto {
  return {
    evidenceType,
    publicId,
    redactionStatus: "redacted",
    referenceStatus: "redacted_reference",
    presentationKey: `authorization.reason.evidence.${evidenceType}.redacted_reference`,
  };
}

function mapEvidencePresentations(
  input: AuthorizationReasonEvidencePresentationInput,
): AuthorizationReasonEvidencePresentationDto[] {
  return [
    mapEvidenceReferenceToPresentation("redeem_code", input.redeemCodePublicId),
    mapEvidenceReferenceToPresentation("audit_log", input.auditLogPublicId),
    mapEvidenceReferenceToPresentation("ai_call_log", input.aiCallLogPublicId),
  ];
}

export function buildAuthorizationReasonEvidencePresentationReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonEvidencePresentationSummaryDto | null> {
  const authorizationReasonEvidencePresentationInput =
    normalizeAuthorizationReasonEvidencePresentationInput(input);

  if (!authorizationReasonEvidencePresentationInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_EVIDENCE_PRESENTATION_INPUT_CODE,
      authorizationReasonEvidencePresentationInput.message,
    );
  }

  return createSuccessResponse({
    presentationStatus: "local_presentation_only",
    evidencePresentations: mapEvidencePresentations(
      authorizationReasonEvidencePresentationInput.value,
    ),
  });
}
