import { adminRoleValues, type AdminRole } from "../models/auth";

export type AdminAccountUpdateInput = {
  name: string;
  adminRoles: AdminRole[];
  organizationPublicId: string | null;
  expectedUpdatedAt: Date;
};

export type AdminAccountUpdateValidationResult =
  | { success: true; value: AdminAccountUpdateInput }
  | { success: false; message: "Invalid admin account update input." };

const invalidResult = {
  success: false,
  message: "Invalid admin account update input.",
} as const;
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" && adminRoleValues.includes(value as AdminRole)
  );
}

function hasOrganizationAdminRole(adminRoles: readonly AdminRole[]): boolean {
  return (
    adminRoles.includes("org_standard_admin") ||
    adminRoles.includes("org_advanced_admin")
  );
}

export function normalizeAdminAccountUpdateInput(
  input: unknown,
): AdminAccountUpdateValidationResult {
  if (!isRecord(input)) {
    return invalidResult;
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const adminRoles = input.adminRoles;
  const organizationPublicId = input.organizationPublicId;
  const expectedUpdatedAtValue = input.expectedUpdatedAt;

  if (
    name.length === 0 ||
    name.length > 100 ||
    !Array.isArray(adminRoles) ||
    adminRoles.length === 0 ||
    adminRoles.length > adminRoleValues.length ||
    !adminRoles.every(isAdminRole) ||
    new Set(adminRoles).size !== adminRoles.length ||
    (organizationPublicId !== null &&
      (typeof organizationPublicId !== "string" ||
        !PUBLIC_ID_PATTERN.test(organizationPublicId))) ||
    typeof expectedUpdatedAtValue !== "string"
  ) {
    return invalidResult;
  }

  const expectedUpdatedAt = new Date(expectedUpdatedAtValue);

  if (
    Number.isNaN(expectedUpdatedAt.getTime()) ||
    expectedUpdatedAt.toISOString() !== expectedUpdatedAtValue ||
    hasOrganizationAdminRole(adminRoles) !==
      (typeof organizationPublicId === "string")
  ) {
    return invalidResult;
  }

  return {
    success: true,
    value: {
      name,
      adminRoles: [...adminRoles],
      organizationPublicId,
      expectedUpdatedAt,
    },
  };
}
