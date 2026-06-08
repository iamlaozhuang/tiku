import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { RedeemCodeReferenceDto } from "../contracts/redeem-code-reference-contract";
import type { RedeemCodeReferenceInput } from "../models/redeem-code-reference";
import { normalizeRedeemCodeReferenceInput } from "../validators/redeem-code-reference";

const INVALID_REDEEM_CODE_REFERENCE_INPUT_CODE = 400010;

function mapRedeemCodeReferenceToDto(
  input: RedeemCodeReferenceInput,
): RedeemCodeReferenceDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    redeemCodeReference: {
      publicId: input.redeemCodePublicId,
      redactionStatus: "redacted",
    },
    contextScope: {
      paperPublicId: input.paperPublicId,
      mockExamPublicId: input.mockExamPublicId,
    },
    evidenceReferences: {
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
    referenceStatus: "redacted_reference",
  };
}

export function buildRedeemCodeReferenceReadModel(
  input: unknown,
): ApiResponse<RedeemCodeReferenceDto | null> {
  const redeemCodeReferenceInput = normalizeRedeemCodeReferenceInput(input);

  if (!redeemCodeReferenceInput.success) {
    return createErrorResponse(
      INVALID_REDEEM_CODE_REFERENCE_INPUT_CODE,
      redeemCodeReferenceInput.message,
    );
  }

  return createSuccessResponse(
    mapRedeemCodeReferenceToDto(redeemCodeReferenceInput.value),
  );
}
