import type {
  AdminAccountCreationRole,
  AdminAccountCreationInputDto,
  OrganizationAdminAccountCreationRole,
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

function isAdminAccountCreationRole(
  value: unknown,
): value is AdminAccountCreationRole {
  return (
    value === "ops_admin" ||
    value === "content_admin" ||
    value === "org_standard_admin" ||
    value === "org_advanced_admin"
  );
}

function isOrganizationAdminAccountCreationRole(
  value: AdminAccountCreationRole,
): value is OrganizationAdminAccountCreationRole {
  return value === "org_standard_admin" || value === "org_advanced_admin";
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
  const organizationPublicId =
    typeof input.organizationPublicId === "string"
      ? input.organizationPublicId.trim()
      : null;

  if (
    !PHONE_PATTERN.test(phone) ||
    !PASSWORD_PATTERN.test(password) ||
    name.length === 0 ||
    !isAdminAccountCreationRole(input.adminRole)
  ) {
    return {
      success: false,
      message: INVALID_ADMIN_ACCOUNT_CREATION_INPUT_MESSAGE,
    };
  }

  const requiresOrganizationBinding = isOrganizationAdminAccountCreationRole(
    input.adminRole,
  );

  if (
    (requiresOrganizationBinding &&
      (organizationPublicId === null || organizationPublicId.length === 0)) ||
    (!requiresOrganizationBinding &&
      organizationPublicId !== null &&
      organizationPublicId.length > 0)
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
      organizationPublicId: requiresOrganizationBinding
        ? organizationPublicId
        : null,
      password,
      phone,
    },
  };
}
