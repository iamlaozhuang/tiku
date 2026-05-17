export type NormalizedUserRegistrationInput = {
  phone: string;
  password: string;
  name: string;
};

export type UserRegistrationValidationResult =
  | {
      success: true;
      value: NormalizedUserRegistrationInput;
    }
  | {
      success: false;
      message: string;
    };

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const INVALID_REGISTRATION_INPUT_MESSAGE = "Invalid registration input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeUserRegistrationInput(
  input: unknown,
): UserRegistrationValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_REGISTRATION_INPUT_MESSAGE,
    };
  }

  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const password =
    typeof input.password === "string" ? input.password.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";

  if (
    !PHONE_PATTERN.test(phone) ||
    !PASSWORD_PATTERN.test(password) ||
    name.length === 0
  ) {
    return {
      success: false,
      message: INVALID_REGISTRATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      phone,
      password,
      name,
    },
  };
}
