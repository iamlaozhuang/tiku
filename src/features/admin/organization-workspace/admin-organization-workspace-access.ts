import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  AdminWorkspaceCapabilitySummary,
  AdminWorkspaceRouteAccessDecision,
} from "@/server/contracts/admin-workspace-role-guard-contract";
import { resolveAdminWorkspaceRouteAccess } from "@/server/services/admin-workspace-role-guard-service";

export type OrganizationWorkspacePageAccessState =
  | "ready"
  | "standard-unavailable"
  | "unauthorized";

export type OrganizationWorkspacePageAccess = {
  capabilitySummary: AdminWorkspaceCapabilitySummary;
  decision: AdminWorkspaceRouteAccessDecision;
  loadState: OrganizationWorkspacePageAccessState;
};

export type OrganizationTrainingCapabilityContext = {
  effectiveEdition: "advanced";
  authorizationSource: "org_auth";
  canCreateOrganizationTraining: true;
};

function hasAdvancedOrganizationWorkspaceRole(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): boolean {
  return (
    capabilitySummary.adminRoles.includes("org_advanced_admin") ||
    capabilitySummary.adminRoles.includes("super_admin")
  );
}

function createFallbackCapabilitySummary(
  authContext: AuthContextDto,
): AdminWorkspaceCapabilitySummary {
  return {
    adminRoles: authContext.user.adminRoles ?? [],
    organizationPublicId: authContext.user.organizationPublicId,
    organizationEffectiveEdition: null,
    organizationAuthorizationSource: null,
    capabilitySource: "session_fallback",
    canUseOrganizationAdvancedWorkspace: false,
  };
}

export function getAdminWorkspaceCapabilitySummary(
  authContext: AuthContextDto,
): AdminWorkspaceCapabilitySummary {
  return (
    authContext.user.adminWorkspaceCapability ??
    createFallbackCapabilitySummary(authContext)
  );
}

export function resolveOrganizationWorkspacePageAccess(
  authContext: AuthContextDto,
  pathname: string,
): OrganizationWorkspacePageAccess {
  const capabilitySummary = getAdminWorkspaceCapabilitySummary(authContext);
  const decision = resolveAdminWorkspaceRouteAccess({
    pathname,
    capabilitySummary,
  });

  if (decision.status === "allowed") {
    return {
      capabilitySummary,
      decision,
      loadState: "ready",
    };
  }

  if (decision.status === "standard_unavailable") {
    return {
      capabilitySummary,
      decision,
      loadState: "standard-unavailable",
    };
  }

  return {
    capabilitySummary,
    decision,
    loadState: "unauthorized",
  };
}

export function canUseOrganizationAdvancedWorkspaceCapability(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): boolean {
  return (
    hasAdvancedOrganizationWorkspaceRole(capabilitySummary) &&
    capabilitySummary.capabilitySource === "service_computed" &&
    capabilitySummary.organizationAuthorizationSource === "org_auth" &&
    capabilitySummary.organizationPublicId !== null &&
    capabilitySummary.organizationEffectiveEdition === "advanced" &&
    capabilitySummary.canUseOrganizationAdvancedWorkspace
  );
}

export function createOrganizationTrainingCapabilityContext(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): OrganizationTrainingCapabilityContext {
  const effectiveEdition = capabilitySummary.organizationEffectiveEdition;

  if (
    effectiveEdition !== "advanced" ||
    !hasAdvancedOrganizationWorkspaceRole(capabilitySummary) ||
    !capabilitySummary.canUseOrganizationAdvancedWorkspace
  ) {
    throw new Error("Advanced organization workspace capability is required.");
  }

  return {
    effectiveEdition,
    authorizationSource: "org_auth",
    canCreateOrganizationTraining: true,
  };
}
