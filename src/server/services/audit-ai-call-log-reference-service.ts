import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuditAiCallLogReferenceDto } from "../contracts/audit-ai-call-log-reference-contract";
import type { AuditAiCallLogReferenceInput } from "../models/audit-ai-call-log-reference";
import { normalizeAuditAiCallLogReferenceInput } from "../validators/audit-ai-call-log-reference";

const INVALID_AUDIT_AI_CALL_LOG_REFERENCE_INPUT_CODE = 400009;

function mapAuditAiCallLogReferenceToDto(
  input: AuditAiCallLogReferenceInput,
): AuditAiCallLogReferenceDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    referenceScope: {
      paperPublicId: input.paperPublicId,
      mockExamPublicId: input.mockExamPublicId,
    },
    auditLogReference: {
      publicId: input.auditLogPublicId,
      redactionStatus: "redacted",
    },
    aiCallLogReference: {
      publicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
    referenceStatus: "redacted_reference",
  };
}

export function buildAuditAiCallLogReferenceReadModel(
  input: unknown,
): ApiResponse<AuditAiCallLogReferenceDto | null> {
  const auditAiCallLogReferenceInput =
    normalizeAuditAiCallLogReferenceInput(input);

  if (!auditAiCallLogReferenceInput.success) {
    return createErrorResponse(
      INVALID_AUDIT_AI_CALL_LOG_REFERENCE_INPUT_CODE,
      auditAiCallLogReferenceInput.message,
    );
  }

  return createSuccessResponse(
    mapAuditAiCallLogReferenceToDto(auditAiCallLogReferenceInput.value),
  );
}
