import type { AuthSessionSnapshot } from "../auth/auth-boundary";
import type { AuthContextDto } from "../contracts/auth-contract";
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
    user: {
      publicId: authContext.user.public_id,
      phone: authContext.user.phone,
      name: authContext.user.name,
      userType: authContext.user.user_type,
      status: authContext.user.status,
      lockedUntilAt: formatNullableTimestamp(authContext.user.locked_until_at),
      employeePublicId: authContext.user.employee_public_id,
      organizationPublicId: authContext.user.organization_public_id,
    },
    session: {
      expiresAt: authContext.session.expires_at.toISOString(),
    },
  };
}
