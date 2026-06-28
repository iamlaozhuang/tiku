import type {
  AdminWorkspace,
  AdminWorkspaceAuthorizationSource,
  AdminWorkspaceCapabilitySummary,
  AdminWorkspaceRequiredCapability,
  AdminWorkspaceRouteAccessDecision,
  AdminWorkspaceRouteAccessInput,
  AdminWorkspaceRouteAccessReason,
} from "../contracts/admin-workspace-role-guard-contract";

const organizationAdvancedPathPrefixes = [
  "/organization/organization-training",
  "/organization/organization-analytics",
  "/organization/ai-question-generation",
  "/organization/ai-paper-generation",
  "/organization/training",
  "/organization/analytics",
  "/organization/ai-questions",
  "/organization/ai-papers",
] as const;

function normalizePathname(pathname: string): string {
  const trimmedPathname = pathname.trim();
  const pathWithoutSearch = trimmedPathname.split(/[?#]/u)[0] ?? "/";
  const pathWithLeadingSlash = pathWithoutSearch.startsWith("/")
    ? pathWithoutSearch
    : `/${pathWithoutSearch}`;
  const normalizedPath =
    pathWithLeadingSlash.length > 1
      ? pathWithLeadingSlash.replace(/\/+$/u, "")
      : pathWithLeadingSlash;

  if (normalizedPath === "/admin") {
    return "/ops";
  }

  if (normalizedPath.startsWith("/admin/")) {
    return normalizedPath.slice("/admin".length);
  }

  return normalizedPath;
}

export function resolveAdminWorkspaceFromPath(
  pathname: string,
): AdminWorkspace | null {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/ops" || normalizedPath.startsWith("/ops/")) {
    return "ops";
  }

  if (normalizedPath === "/content" || normalizedPath.startsWith("/content/")) {
    return "content";
  }

  if (
    normalizedPath === "/organization" ||
    normalizedPath.startsWith("/organization/")
  ) {
    return "organization";
  }

  return null;
}

export function isAdvancedOrganizationWorkspacePath(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  return organizationAdvancedPathPrefixes.some(
    (pathPrefix) =>
      normalizedPath === pathPrefix ||
      normalizedPath.startsWith(`${pathPrefix}/`),
  );
}

function hasRole(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
  role: string,
): boolean {
  return capabilitySummary.adminRoles.includes(
    role as AdminWorkspaceCapabilitySummary["adminRoles"][number],
  );
}

function hasAnyRole(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
  roles: readonly string[],
): boolean {
  return roles.some((role) => hasRole(capabilitySummary, role));
}

function hasOrganizationAdminRole(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): boolean {
  return hasAnyRole(capabilitySummary, [
    "org_standard_admin",
    "org_advanced_admin",
  ]);
}

function hasAdvancedOrganizationRole(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): boolean {
  return hasAnyRole(capabilitySummary, ["super_admin", "org_advanced_admin"]);
}

function resolveOrganizationAuthorizationSource(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): AdminWorkspaceAuthorizationSource | null {
  if (
    !hasOrganizationAdminRole(capabilitySummary) &&
    !hasRole(capabilitySummary, "super_admin")
  ) {
    return null;
  }

  return capabilitySummary.organizationAuthorizationSource ?? "org_auth";
}

function resolveReturnPath(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): string {
  if (hasOrganizationAdminRole(capabilitySummary)) {
    return "/organization/portal";
  }

  if (hasRole(capabilitySummary, "content_admin")) {
    return "/content/papers";
  }

  if (
    hasRole(capabilitySummary, "ops_admin") ||
    hasRole(capabilitySummary, "super_admin")
  ) {
    return "/ops/users";
  }

  return "/login";
}

function createDecision(input: {
  status: AdminWorkspaceRouteAccessDecision["status"];
  workspace: AdminWorkspace | null;
  reason: AdminWorkspaceRouteAccessReason | null;
  returnPath: string;
  requiredWorkspace?: AdminWorkspace | null;
  requiredEffectiveEdition?: AdminWorkspaceRouteAccessDecision["requiredEffectiveEdition"];
  requiredCapability?: AdminWorkspaceRequiredCapability | null;
  requiredAuthorizationSource?: AdminWorkspaceAuthorizationSource | null;
  requiredOrganizationContext?: boolean;
}): AdminWorkspaceRouteAccessDecision {
  return {
    status: input.status,
    workspace: input.workspace,
    reason: input.reason,
    returnPath: input.returnPath,
    requiredWorkspace: input.requiredWorkspace ?? input.workspace,
    requiredEffectiveEdition: input.requiredEffectiveEdition ?? null,
    requiredCapability: input.requiredCapability ?? null,
    requiredAuthorizationSource: input.requiredAuthorizationSource ?? null,
    requiredOrganizationContext: input.requiredOrganizationContext ?? false,
  };
}

function canUseAdvancedOrganizationWorkspace(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): boolean {
  return (
    hasVerifiedOrganizationCapabilitySummary(capabilitySummary) &&
    capabilitySummary.organizationEffectiveEdition === "advanced" &&
    capabilitySummary.canUseOrganizationAdvancedWorkspace &&
    hasAdvancedOrganizationRole(capabilitySummary)
  );
}

function hasVerifiedOrganizationCapabilitySummary(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): boolean {
  return (
    capabilitySummary.capabilitySource === "service_computed" &&
    capabilitySummary.organizationAuthorizationSource === "org_auth"
  );
}

function resolveOrganizationWorkspaceAccess(input: {
  pathname: string;
  capabilitySummary: AdminWorkspaceCapabilitySummary;
  workspace: AdminWorkspace;
  returnPath: string;
}): AdminWorkspaceRouteAccessDecision {
  const { capabilitySummary, pathname, returnPath, workspace } = input;

  if (
    !hasOrganizationAdminRole(capabilitySummary) &&
    !hasRole(capabilitySummary, "super_admin")
  ) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "workspace_role_mismatch",
      returnPath,
    });
  }

  if (capabilitySummary.organizationPublicId === null) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "organization_context_required",
      returnPath,
      requiredWorkspace: "organization",
      requiredCapability: "organization_workspace_context",
      requiredAuthorizationSource:
        resolveOrganizationAuthorizationSource(capabilitySummary),
      requiredOrganizationContext: true,
    });
  }

  if (
    isAdvancedOrganizationWorkspacePath(pathname) &&
    !hasVerifiedOrganizationCapabilitySummary(capabilitySummary)
  ) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "organization_capability_summary_required",
      returnPath: "/organization/portal",
      requiredWorkspace: "organization",
      requiredEffectiveEdition: "advanced",
      requiredCapability: "organization_advanced_workspace",
      requiredAuthorizationSource: "org_auth",
    });
  }

  if (
    isAdvancedOrganizationWorkspacePath(pathname) &&
    !canUseAdvancedOrganizationWorkspace(capabilitySummary)
  ) {
    return createDecision({
      status: "standard_unavailable",
      workspace,
      reason: "organization_advanced_capability_required",
      returnPath: "/organization/portal",
      requiredWorkspace: "organization",
      requiredEffectiveEdition: "advanced",
      requiredCapability: "organization_advanced_workspace",
      requiredAuthorizationSource:
        resolveOrganizationAuthorizationSource(capabilitySummary),
    });
  }

  return createDecision({
    status: "allowed",
    workspace,
    reason: null,
    returnPath,
  });
}

export function resolveAdminWorkspaceRouteAccess({
  capabilitySummary,
  pathname,
}: AdminWorkspaceRouteAccessInput): AdminWorkspaceRouteAccessDecision {
  const workspace = resolveAdminWorkspaceFromPath(pathname);
  const returnPath = resolveReturnPath(capabilitySummary);

  if (capabilitySummary.adminRoles.length === 0) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "not_admin",
      returnPath,
      requiredWorkspace: workspace,
    });
  }

  if (workspace === null) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "unknown_workspace",
      returnPath,
      requiredWorkspace: null,
    });
  }

  if (
    workspace !== "organization" &&
    hasOrganizationAdminRole(capabilitySummary) &&
    !hasRole(capabilitySummary, "super_admin")
  ) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "organization_workspace_role_conflict",
      returnPath: "/organization/portal",
      requiredWorkspace: "organization",
    });
  }

  if (workspace === "organization") {
    return resolveOrganizationWorkspaceAccess({
      pathname,
      capabilitySummary,
      workspace,
      returnPath,
    });
  }

  if (
    workspace === "ops" &&
    !hasAnyRole(capabilitySummary, ["super_admin", "ops_admin"])
  ) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "workspace_role_mismatch",
      returnPath,
    });
  }

  if (
    workspace === "content" &&
    !hasAnyRole(capabilitySummary, ["super_admin", "content_admin"])
  ) {
    return createDecision({
      status: "denied",
      workspace,
      reason: "workspace_role_mismatch",
      returnPath,
    });
  }

  return createDecision({
    status: "allowed",
    workspace,
    reason: null,
    returnPath,
  });
}
