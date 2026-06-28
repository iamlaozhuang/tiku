import type { AuthSessionSnapshot } from "../auth/auth-boundary";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import type {
  AuthContextDto,
  AuthenticatedUserDto,
  UserRegistrationDto,
} from "../contracts/auth-contract";
import type { AdminRole, AuthorizationEdition } from "../models/auth";
import type { AuthUserAccessRow } from "../repositories/auth-repository";

export type ResolvedAuthContext = {
  session: AuthSessionSnapshot;
  user: AuthUserAccessRow;
};

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

function hasAdminRole(adminRoles: readonly AdminRole[], role: AdminRole) {
  return adminRoles.includes(role);
}

function resolveOrganizationWorkspaceEffectiveEdition(
  adminRoles: readonly AdminRole[],
): AuthorizationEdition | null {
  if (hasAdminRole(adminRoles, "org_advanced_admin")) {
    return "advanced";
  }

  if (hasAdminRole(adminRoles, "org_standard_admin")) {
    return "standard";
  }

  return null;
}

function mapAdminWorkspaceCapabilityToApi(
  authUser: AuthUserAccessRow,
): AdminWorkspaceCapabilitySummary | undefined {
  const adminRoles = authUser.admin_roles ?? [];
  const organizationEffectiveEdition =
    resolveOrganizationWorkspaceEffectiveEdition(adminRoles);

  if (organizationEffectiveEdition === null) {
    return undefined;
  }

  const organizationPublicId = authUser.organization_public_id;

  return {
    adminRoles,
    organizationPublicId,
    organizationEffectiveEdition,
    canUseOrganizationAdvancedWorkspace:
      organizationEffectiveEdition === "advanced" &&
      organizationPublicId !== null,
  };
}

export function mapAuthContextToApi(
  authContext: ResolvedAuthContext,
): AuthContextDto {
  return {
    user: mapAuthenticatedUserToApi(authContext.user),
    session: {
      expiresAt: authContext.session.expires_at.toISOString(),
    },
  };
}

export function mapAuthenticatedUserToApi(
  authUser: AuthUserAccessRow,
): AuthenticatedUserDto {
  const authenticatedUser: AuthenticatedUserDto = {
    publicId: authUser.public_id,
    phone: authUser.phone,
    name: authUser.name,
    userType: authUser.user_type,
    status: authUser.status,
    lockedUntilAt: formatNullableTimestamp(authUser.locked_until_at),
    employeePublicId: authUser.employee_public_id,
    organizationPublicId: authUser.organization_public_id,
    adminPublicId: authUser.admin_public_id ?? null,
    adminRoles: authUser.admin_roles ?? [],
  };
  const adminWorkspaceCapability = mapAdminWorkspaceCapabilityToApi(authUser);

  if (adminWorkspaceCapability !== undefined) {
    authenticatedUser.adminWorkspaceCapability = adminWorkspaceCapability;
  }

  return authenticatedUser;
}

export function mapUserRegistrationToApi(
  authUser: AuthUserAccessRow,
): UserRegistrationDto {
  return {
    user: mapAuthenticatedUserToApi(authUser),
    nextAction: "redeem_code",
  };
}
