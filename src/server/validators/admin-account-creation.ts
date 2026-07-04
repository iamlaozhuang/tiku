import type {
  AdminAccountCreationInputDto,
  PlatformAdminAccountCreationRole,
} from "../contracts/admin-user-org-auth-ops-contract";

export type AdminAccountCreationValidationResult =
  | {
      success: true;
      value: AdminAccountCreationInputDto;
    }
  | {
      success: false;
      message: string;
    };

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const INVALID_ADMIN_ACCOUNT_CREATION_INPUT_MESSAGE =
  "Invalid admin account creation input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlatformAdminAccountCreationRole(
  value: unknown,
): value is PlatformAdminAccountCreationRole {
  return value === "ops_admin" || value === "content_admin";
}

export function normalizeAdminAccountCreationInput(
  input: unknown,
): AdminAccountCreationValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ADMIN_ACCOUNT_CREATION_INPUT_MESSAGE,
    };
  }

  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const password =
    typeof input.password === "string" ? input.password.trim() : "";

  if (
    !PHONE_PATTERN.test(phone) ||
    !PASSWORD_PATTERN.test(password) ||
    name.length === 0 ||
    !isPlatformAdminAccountCreationRole(input.adminRole)
  ) {
    return {
      success: false,
      message: INVALID_ADMIN_ACCOUNT_CREATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      adminRole: input.adminRole,
      name,
      password,
      phone,
    },
  };
}
