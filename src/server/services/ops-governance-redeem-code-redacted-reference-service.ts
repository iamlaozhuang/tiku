import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { OpsGovernanceRedeemCodeRedactedReferenceDto } from "../contracts/ops-governance-redeem-code-redacted-reference-contract";
import type {
  OpsGovernanceRedeemCodeRedactedReferenceInput,
  OpsGovernanceRedactedReferenceStatus,
} from "../models/ops-governance-redeem-code-redacted-reference";
import {
  INVALID_OPS_GOVERNANCE_REDEEM_CODE_REDACTED_REFERENCE_INPUT_MESSAGE,
  normalizeOpsGovernanceRedeemCodeRedactedReferenceInput,
} from "../validators/ops-governance-redeem-code-redacted-reference";

const INVALID_OPS_GOVERNANCE_REDEEM_CODE_REDACTED_REFERENCE_INPUT_CODE = 400062;

function resolveOptionalReferenceStatus(
  referencePublicId: string | null,
): OpsGovernanceRedactedReferenceStatus {
  return referencePublicId === null ? "none" : "redacted_reference";
}

function mapOpsGovernanceRedeemCodeRedactedReferenceToDto(
  input: OpsGovernanceRedeemCodeRedactedReferenceInput,
): OpsGovernanceRedeemCodeRedactedReferenceDto {
  return {
    generatedAt: input.generatedAt,
    runtimeStatus: "local_read_model_only",
    redeemCodeReference: {
      referenceStatus: "redacted_reference",
      redactionStatus: "redacted",
      publicIdDisplayStatus: "hidden",
      plaintextCodeStatus: "not_included",
      codeHashStatus: "not_included",
    },
    authorizationReference: {
      referenceStatus: "redacted_reference",
      publicIdDisplayStatus: "hidden",
    },
    contextReference: {
      paperReferenceStatus: resolveOptionalReferenceStatus(input.paperPublicId),
      mockExamReferenceStatus: resolveOptionalReferenceStatus(
        input.mockExamPublicId,
      ),
      publicIdDisplayStatus: "hidden",
    },
    evidencePolicy: {
      auditLogReferenceStatus: resolveOptionalReferenceStatus(
        input.auditLogPublicId,
      ),
      aiCallLogReferenceStatus: resolveOptionalReferenceStatus(
        input.aiCallLogPublicId,
      ),
      publicIdInventoryStatus: "not_included",
      providerPayloadStatus: "not_included",
      rawPromptStatus: "not_included",
      rawAnswerStatus: "not_included",
      rowDataStatus: "not_included",
    },
    operationsReview: {
      redeemCodeReviewStatus: "redacted_reference_ready",
      authorizationReviewStatus: "redacted_reference_ready",
      evidenceReviewStatus: "redacted_evidence_only",
    },
  };
}

export function buildOpsGovernanceRedeemCodeRedactedReferenceReadModel(
  input: unknown,
): ApiResponse<OpsGovernanceRedeemCodeRedactedReferenceDto | null> {
  const redactedReferenceInput =
    normalizeOpsGovernanceRedeemCodeRedactedReferenceInput(input);

  if (!redactedReferenceInput.success) {
    return createErrorResponse(
      INVALID_OPS_GOVERNANCE_REDEEM_CODE_REDACTED_REFERENCE_INPUT_CODE,
      INVALID_OPS_GOVERNANCE_REDEEM_CODE_REDACTED_REFERENCE_INPUT_MESSAGE,
    );
  }

  return createSuccessResponse(
    mapOpsGovernanceRedeemCodeRedactedReferenceToDto(
      redactedReferenceInput.value,
    ),
  );
}
