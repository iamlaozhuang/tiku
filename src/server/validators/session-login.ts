export type NormalizedSessionLoginInput = {
  phone: string;
  password: string;
};

export type SessionLoginValidationResult =
  | {
      success: true;
      value: NormalizedSessionLoginInput;
    }
  | {
      success: false;
      message: string;
    };

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const MIN_PASSWORD_LENGTH = 8;
const INVALID_LOGIN_INPUT_MESSAGE = "Invalid login input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeSessionLoginInput(
  input: unknown,
): SessionLoginValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_LOGIN_INPUT_MESSAGE,
    };
  }

  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const password =
    typeof input.password === "string" ? input.password.trim() : "";

  if (!PHONE_PATTERN.test(phone) || password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: INVALID_LOGIN_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      phone,
      password,
    },
  };
}
