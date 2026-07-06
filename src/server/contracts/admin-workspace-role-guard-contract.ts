import type { AdminRole, AuthorizationEdition } from "../models/auth";

export type AdminWorkspace = "ops" | "content" | "organization";

export type AdminWorkspaceCapabilitySource =
  | "service_computed"
  | "session_fallback";

export type AdminWorkspaceAuthorizationSource = "org_auth";

export type AdminWorkspaceRequiredCapability =
  | "organization_workspace_context"
  | "organization_advanced_workspace";

export type AdminWorkspaceRouteAccessStatus =
  | "allowed"
  | "denied"
  | "standard_unavailable";

export type AdminWorkspaceRouteAccessReason =
  | "not_admin"
  | "unknown_workspace"
  | "workspace_role_mismatch"
  | "organization_workspace_role_conflict"
  | "organization_context_required"
  | "organization_capability_summary_required"
  | "organization_advanced_capability_required";

export type AdminWorkspaceCapabilitySummary = {
  adminRoles: readonly AdminRole[];
  organizationAuthorizationPublicId?: string | null;
  organizationPublicId: string | null;
  organizationEffectiveEdition: AuthorizationEdition | null;
  organizationAuthorizationSource: AdminWorkspaceAuthorizationSource | null;
  capabilitySource: AdminWorkspaceCapabilitySource;
  canUseOrganizationAdvancedWorkspace: boolean;
};

export type AdminWorkspaceRouteAccessInput = {
  pathname: string;
  capabilitySummary: AdminWorkspaceCapabilitySummary;
};

export type AdminWorkspaceRouteAccessDecision = {
  status: AdminWorkspaceRouteAccessStatus;
  workspace: AdminWorkspace | null;
  reason: AdminWorkspaceRouteAccessReason | null;
  returnPath: string;
  requiredWorkspace: AdminWorkspace | null;
  requiredEffectiveEdition: AuthorizationEdition | null;
  requiredCapability: AdminWorkspaceRequiredCapability | null;
  requiredAuthorizationSource: AdminWorkspaceAuthorizationSource | null;
  requiredOrganizationContext: boolean;
};
