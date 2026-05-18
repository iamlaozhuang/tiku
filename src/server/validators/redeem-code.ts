export type NormalizedRedeemCodeInput = {
  code: string;
};

export type RedeemCodeValidationResult =
  | {
      success: true;
      value: NormalizedRedeemCodeInput;
    }
  | {
      success: false;
      message: string;
    };

const REDEEM_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;
const INVALID_REDEEM_CODE_INPUT_MESSAGE = "Invalid redeem code input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeRedeemCodeInput(
  input: unknown,
): RedeemCodeValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_REDEEM_CODE_INPUT_MESSAGE,
    };
  }

  const code =
    typeof input.code === "string" ? input.code.trim().toUpperCase() : "";

  if (!REDEEM_CODE_PATTERN.test(code)) {
    return {
      success: false,
      message: INVALID_REDEEM_CODE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      code,
    },
  };
}
