import type { RedeemCodeReferenceInput } from "../models/redeem-code-reference";

export type RedeemCodeReferenceValidationResult =
  | {
      success: true;
      value: RedeemCodeReferenceInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_REDEEM_CODE_REFERENCE_INPUT_MESSAGE =
  "Invalid redeem_code reference input.";

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

export function normalizeRedeemCodeReferenceInput(
  input: unknown,
): RedeemCodeReferenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_REDEEM_CODE_REFERENCE_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const redeemCodePublicId = normalizeRequiredText(input.redeemCodePublicId);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    redeemCodePublicId === null
  ) {
    return {
      success: false,
      message: INVALID_REDEEM_CODE_REFERENCE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      redeemCodePublicId,
      paperPublicId: normalizeOptionalText(input.paperPublicId),
      mockExamPublicId: normalizeOptionalText(input.mockExamPublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}
