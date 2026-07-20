export type NormalizedRedeemCodeInput = {
  code: string;
};

export type NormalizedRedeemCodeConfirmationInput =
  NormalizedRedeemCodeInput & {
    previewVersion: string;
    targetPersonalAuthPublicId: string | null;
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
const PREVIEW_VERSION_PATTERN = /^sha256:[a-f0-9]{64}$/;
const PERSONAL_AUTH_PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const INVALID_REDEEM_CODE_INPUT_MESSAGE = "Invalid redeem code input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeRedeemCodeConfirmationInput(
  input: unknown,
):
  | { success: true; value: NormalizedRedeemCodeConfirmationInput }
  | { success: false; message: string } {
  const codeResult = normalizeRedeemCodeInput(input);

  if (!codeResult.success) {
    return codeResult;
  }

  if (!isRecord(input)) {
    return { success: false, message: INVALID_REDEEM_CODE_INPUT_MESSAGE };
  }

  const previewVersion =
    typeof input.previewVersion === "string" ? input.previewVersion.trim() : "";
  const targetPersonalAuthPublicId =
    input.targetPersonalAuthPublicId === undefined
      ? null
      : input.targetPersonalAuthPublicId;

  if (
    !PREVIEW_VERSION_PATTERN.test(previewVersion) ||
    !(
      targetPersonalAuthPublicId === null ||
      (typeof targetPersonalAuthPublicId === "string" &&
        PERSONAL_AUTH_PUBLIC_ID_PATTERN.test(targetPersonalAuthPublicId))
    )
  ) {
    return { success: false, message: INVALID_REDEEM_CODE_INPUT_MESSAGE };
  }

  return {
    success: true,
    value: {
      code: codeResult.value.code,
      previewVersion,
      targetPersonalAuthPublicId,
    },
  };
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
