import type { AuditAiCallLogReferenceInput } from "../models/audit-ai-call-log-reference";

export type AuditAiCallLogReferenceValidationResult =
  | {
      success: true;
      value: AuditAiCallLogReferenceInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUDIT_AI_CALL_LOG_REFERENCE_INPUT_MESSAGE =
  "Invalid audit_log ai_call_log reference input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

export function normalizeAuditAiCallLogReferenceInput(
  input: unknown,
): AuditAiCallLogReferenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUDIT_AI_CALL_LOG_REFERENCE_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const auditLogPublicId = normalizeOptionalText(input.auditLogPublicId);
  const aiCallLogPublicId = normalizeOptionalText(input.aiCallLogPublicId);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    (auditLogPublicId === null && aiCallLogPublicId === null)
  ) {
    return {
      success: false,
      message: INVALID_AUDIT_AI_CALL_LOG_REFERENCE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      auditLogPublicId,
      aiCallLogPublicId,
      paperPublicId: normalizeOptionalText(input.paperPublicId),
      mockExamPublicId: normalizeOptionalText(input.mockExamPublicId),
    },
  };
}
