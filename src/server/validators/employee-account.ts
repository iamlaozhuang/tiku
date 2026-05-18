export type NormalizedCreateEmployeeAccountInput = {
  phone: string;
  name: string;
  initialPassword: string;
  organizationPublicId: string;
};

export type EmployeeAccountValidationResult =
  | {
      success: true;
      value: NormalizedCreateEmployeeAccountInput;
    }
  | {
      success: false;
      message: string;
    };

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const INVALID_EMPLOYEE_ACCOUNT_INPUT_MESSAGE =
  "Invalid employee account input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCreateEmployeeAccountInput(
  input: unknown,
): EmployeeAccountValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_EMPLOYEE_ACCOUNT_INPUT_MESSAGE,
    };
  }

  const phone = normalizeRequiredText(input.phone);
  const name = normalizeRequiredText(input.name);
  const initialPassword = normalizeRequiredText(input.initialPassword);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );

  if (
    !PHONE_PATTERN.test(phone) ||
    name.length === 0 ||
    !PASSWORD_PATTERN.test(initialPassword) ||
    organizationPublicId.length === 0
  ) {
    return {
      success: false,
      message: INVALID_EMPLOYEE_ACCOUNT_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      phone,
      name,
      initialPassword,
      organizationPublicId,
    },
  };
}
