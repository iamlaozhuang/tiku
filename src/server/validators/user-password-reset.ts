export type NormalizedUserPasswordResetInput = {
  newPassword: string;
};

export type UserPasswordResetValidationResult =
  | {
      success: true;
      value: NormalizedUserPasswordResetInput;
    }
  | {
      success: false;
      message: string;
    };

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const INVALID_PASSWORD_RESET_INPUT_MESSAGE = "Invalid password reset input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeUserPasswordResetInput(
  input: unknown,
): UserPasswordResetValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PASSWORD_RESET_INPUT_MESSAGE,
    };
  }

  const newPassword =
    typeof input.newPassword === "string" ? input.newPassword.trim() : "";

  if (!PASSWORD_PATTERN.test(newPassword)) {
    return {
      success: false,
      message: INVALID_PASSWORD_RESET_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      newPassword,
    },
  };
}
