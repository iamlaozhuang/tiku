export type PostLoginAdminRole = "super_admin" | "ops_admin" | "content_admin";

export type PostLoginSessionUser = {
  userType: string | null;
  adminPublicId?: string | null;
  adminRoles?: PostLoginAdminRole[];
};

export type PostLoginSessionBoundary = {
  exposeBearerTokenToClient: false;
  redirectPath: "/home" | "/ops/users" | "/content/papers";
  sessionPersistenceMode: "server_session";
};

const ADMIN_ROLES = ["super_admin", "ops_admin", "content_admin"] as const;

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

export function resolveAdminWorkspaceLandingPath(
  loginUser: PostLoginSessionUser,
): "/ops/users" | "/content/papers" {
  const adminRoles = loginUser.adminRoles ?? [];

  if (
    adminRoles.includes("content_admin") &&
    !adminRoles.includes("ops_admin") &&
    !adminRoles.includes("super_admin")
  ) {
    return "/content/papers";
  }

  return "/ops/users";
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
