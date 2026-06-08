import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationEvidenceReferenceDto,
  AuthorizationEvidenceReferenceSummaryDto,
} from "../contracts/authorization-evidence-reference-summary-contract";
import type { AuthorizationEvidenceReferenceSummaryInput } from "../models/authorization-evidence-reference-summary";
import { normalizeAuthorizationEvidenceReferenceSummaryInput } from "../validators/authorization-evidence-reference-summary";

const INVALID_AUTHORIZATION_EVIDENCE_REFERENCE_SUMMARY_INPUT_CODE = 400018;

function mapEvidenceReferenceToDto(
  publicId: string | null,
): AuthorizationEvidenceReferenceDto {
  return {
    publicId,
    redactionStatus: "redacted",
    referenceStatus: "redacted_reference",
  };
}

function countPresentEvidenceReferences(
  input: AuthorizationEvidenceReferenceSummaryInput,
): number {
  return [
    input.redeemCodePublicId,
    input.auditLogPublicId,
    input.aiCallLogPublicId,
  ].filter((publicId) => publicId !== null).length;
}

function mapAuthorizationEvidenceReferenceSummaryToDto(
  input: AuthorizationEvidenceReferenceSummaryInput,
): AuthorizationEvidenceReferenceSummaryDto {
  const totalReferenceCount = countPresentEvidenceReferences(input);

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    displayStatus: "display_only",
    referenceSummary: {
      totalReferenceCount,
      missingReferenceCount: 3 - totalReferenceCount,
    },
    references: {
      redeemCode: mapEvidenceReferenceToDto(input.redeemCodePublicId),
      auditLog: mapEvidenceReferenceToDto(input.auditLogPublicId),
      aiCallLog: mapEvidenceReferenceToDto(input.aiCallLogPublicId),
    },
  };
}

export function buildAuthorizationEvidenceReferenceSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationEvidenceReferenceSummaryDto | null> {
  const authorizationEvidenceReferenceSummaryInput =
    normalizeAuthorizationEvidenceReferenceSummaryInput(input);

  if (!authorizationEvidenceReferenceSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_EVIDENCE_REFERENCE_SUMMARY_INPUT_CODE,
      authorizationEvidenceReferenceSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationEvidenceReferenceSummaryToDto(
      authorizationEvidenceReferenceSummaryInput.value,
    ),
  );
}
