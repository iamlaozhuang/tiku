import type { AuthSessionSnapshot } from "../auth/auth-boundary";
import type {
  AuthContextDto,
  AuthenticatedUserDto,
  UserRegistrationDto,
} from "../contracts/auth-contract";
import type { AuthUserAccessRow } from "../repositories/auth-repository";

export type ResolvedAuthContext = {
  session: AuthSessionSnapshot;
  user: AuthUserAccessRow;
};

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
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
  return {
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
}

export function mapUserRegistrationToApi(
  authUser: AuthUserAccessRow,
): UserRegistrationDto {
  return {
    user: mapAuthenticatedUserToApi(authUser),
    nextAction: "redeem_code",
  };
}
