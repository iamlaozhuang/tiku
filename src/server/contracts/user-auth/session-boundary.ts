import type { AuthContextDto } from "../auth-contract";

export type PostLoginAdminRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin"
  | "org_standard_admin"
  | "org_advanced_admin";

export type PostLoginSessionUser = {
  userType: string | null;
  adminPublicId?: string | null;
  adminRoles?: PostLoginAdminRole[];
};

export type PostLoginSessionBoundary = {
  exposeBearerTokenToClient: false;
  redirectPath:
    | "/home"
    | "/admin/overview"
    | "/ops/overview"
    | "/content/overview"
    | "/organization/portal";
  sessionPersistenceMode: "server_session";
};

export type SessionRouteRole = "admin" | "student";

export type SessionRouteAccessDecision =
  | {
      authContext: AuthContextDto;
      status: "authorized" | "forbidden";
    }
  | {
      authContext: null;
      status: "unauthorized" | "error";
    };

type SessionRouteResponse = {
  code: number;
  data: AuthContextDto | null;
};

const ADMIN_ROLES = [
  "super_admin",
  "ops_admin",
  "content_admin",
  "org_standard_admin",
  "org_advanced_admin",
] as const;

function hasAdminRole(loginUser: PostLoginSessionUser) {
  return (loginUser.adminRoles ?? []).some((adminRole) =>
    ADMIN_ROLES.includes(adminRole),
  );
}

function isAdminLoginUser(loginUser: PostLoginSessionUser) {
  return (
    (loginUser.adminPublicId !== null &&
      loginUser.adminPublicId !== undefined) ||
    hasAdminRole(loginUser)
  );
}

function isAuthorizedForSessionRouteRole(
  authContext: AuthContextDto,
  requiredRole: SessionRouteRole,
): boolean {
  if (requiredRole === "admin") {
    return (
      authContext.user.adminPublicId !== null &&
      authContext.user.adminPublicId !== undefined &&
      (authContext.user.adminRoles?.length ?? 0) > 0
    );
  }

  return authContext.user.userType !== null;
}

export function resolveSessionRouteAccess(
  response: SessionRouteResponse,
  requiredRole: SessionRouteRole,
): SessionRouteAccessDecision {
  if (response.code === 0 && response.data !== null) {
    return {
      authContext: response.data,
      status: isAuthorizedForSessionRouteRole(response.data, requiredRole)
        ? "authorized"
        : "forbidden",
    };
  }

  if (
    response.data === null &&
    (response.code === 0 || response.code === 401001)
  ) {
    return { authContext: null, status: "unauthorized" };
  }

  return { authContext: null, status: "error" };
}

function hasOrganizationAdminRole(adminRoles: readonly PostLoginAdminRole[]) {
  return (
    adminRoles.includes("org_standard_admin") ||
    adminRoles.includes("org_advanced_admin")
  );
}

export function resolveAdminWorkspaceLandingPath(
  loginUser: PostLoginSessionUser,
):
  | "/admin/overview"
  | "/ops/overview"
  | "/content/overview"
  | "/organization/portal" {
  const adminRoles = loginUser.adminRoles ?? [];

  if (adminRoles.includes("super_admin")) {
    return "/admin/overview";
  }

  if (hasOrganizationAdminRole(adminRoles)) {
    return "/organization/portal";
  }

  if (
    adminRoles.includes("content_admin") &&
    !adminRoles.includes("ops_admin")
  ) {
    return "/content/overview";
  }

  return "/ops/overview";
}

export function createPostLoginSessionBoundary(
  loginUser: PostLoginSessionUser,
): PostLoginSessionBoundary {
  return {
    exposeBearerTokenToClient: false,
    redirectPath: isAdminLoginUser(loginUser)
      ? resolveAdminWorkspaceLandingPath(loginUser)
      : "/home",
    sessionPersistenceMode: "server_session",
  };
}
