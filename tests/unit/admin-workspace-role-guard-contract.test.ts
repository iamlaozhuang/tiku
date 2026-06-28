import { describe, expect, it } from "vitest";

import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import { resolveAdminWorkspaceRouteAccess } from "@/server/services/admin-workspace-role-guard-service";

function capabilitySummary(
  input: Partial<AdminWorkspaceCapabilitySummary> & {
    adminRoles: AdminWorkspaceCapabilitySummary["adminRoles"];
  },
): AdminWorkspaceCapabilitySummary {
  return {
    adminRoles: input.adminRoles,
    organizationEffectiveEdition: input.organizationEffectiveEdition ?? null,
    organizationPublicId: input.organizationPublicId ?? null,
    organizationAuthorizationSource:
      input.organizationAuthorizationSource ?? null,
    capabilitySource: input.capabilitySource ?? "service_computed",
    canUseOrganizationAdvancedWorkspace:
      input.canUseOrganizationAdvancedWorkspace ?? false,
  };
}

describe("backend workspace role guard contract", () => {
  it("denies unrelated backend workspace direct routes before menu visibility can matter", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/questions",
        capabilitySummary: capabilitySummary({ adminRoles: ["ops_admin"] }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "content",
      reason: "workspace_role_mismatch",
      returnPath: "/ops/users",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/ops/redeem-codes",
        capabilitySummary: capabilitySummary({
          adminRoles: ["content_admin"],
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "ops",
      reason: "workspace_role_mismatch",
      returnPath: "/content/papers",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/ops/users",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_standard_admin", "ops_admin"],
          organizationEffectiveEdition: "standard",
          organizationPublicId: "organization-public-001",
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "ops",
      reason: "organization_workspace_role_conflict",
      returnPath: "/organization/portal",
    });
  });

  it("requires service-computed advanced organization capability for advanced organization routes", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/organization-training",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_advanced_admin"],
          organizationEffectiveEdition: "standard",
          organizationPublicId: "organization-public-advanced-stale",
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: false,
        }),
      }),
    ).toMatchObject({
      status: "standard_unavailable",
      workspace: "organization",
      reason: "organization_advanced_capability_required",
      returnPath: "/organization/portal",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/ai-question-generation",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_advanced_admin"],
          organizationEffectiveEdition: "advanced",
          organizationPublicId: "organization-public-advanced-001",
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "allowed",
      workspace: "organization",
      reason: null,
    });
  });

  it("returns structured capability requirements for standard-unavailable organization advanced routes", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/admin/organization/ai-paper-generation?draft=1",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_standard_admin"],
          organizationEffectiveEdition: "standard",
          organizationPublicId: "organization-public-standard-002",
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: false,
        }),
      }),
    ).toMatchObject({
      status: "standard_unavailable",
      workspace: "organization",
      reason: "organization_advanced_capability_required",
      requiredWorkspace: "organization",
      requiredEffectiveEdition: "advanced",
      requiredCapability: "organization_advanced_workspace",
      requiredAuthorizationSource: "org_auth",
      requiredOrganizationContext: false,
      returnPath: "/organization/portal",
    });
  });

  it("denies advanced organization routes when capability summary is not service computed", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/organization-analytics",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_advanced_admin"],
          organizationEffectiveEdition: "advanced",
          organizationPublicId: "organization-public-session-fallback",
          organizationAuthorizationSource: "org_auth",
          capabilitySource: "session_fallback",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "organization",
      reason: "organization_capability_summary_required",
      requiredWorkspace: "organization",
      requiredEffectiveEdition: "advanced",
      requiredCapability: "organization_advanced_workspace",
      requiredAuthorizationSource: "org_auth",
      requiredOrganizationContext: false,
      returnPath: "/organization/portal",
    });
  });

  it("denies advanced organization routes when org_auth source is missing", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/ai-paper-generation",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_advanced_admin"],
          organizationEffectiveEdition: "advanced",
          organizationPublicId: "organization-public-source-missing",
          organizationAuthorizationSource: null,
          capabilitySource: "service_computed",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "organization",
      reason: "organization_capability_summary_required",
      requiredWorkspace: "organization",
      requiredEffectiveEdition: "advanced",
      requiredCapability: "organization_advanced_workspace",
      requiredAuthorizationSource: "org_auth",
      requiredOrganizationContext: false,
      returnPath: "/organization/portal",
    });
  });

  it("denies missing organization context before any advanced capability fallback", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/organization-training",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_advanced_admin"],
          organizationEffectiveEdition: "advanced",
          organizationPublicId: null,
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "organization",
      reason: "organization_context_required",
      requiredWorkspace: "organization",
      requiredEffectiveEdition: null,
      requiredCapability: "organization_workspace_context",
      requiredAuthorizationSource: "org_auth",
      requiredOrganizationContext: true,
      returnPath: "/organization/portal",
    });
  });

  it("keeps content authoring, operations governance, and organization standard surfaces separated", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/ai-paper-generation",
        capabilitySummary: capabilitySummary({
          adminRoles: ["content_admin"],
        }),
      }),
    ).toMatchObject({
      status: "allowed",
      workspace: "content",
      reason: null,
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/ops/ai-audit-logs",
        capabilitySummary: capabilitySummary({ adminRoles: ["ops_admin"] }),
      }),
    ).toMatchObject({
      status: "allowed",
      workspace: "ops",
      reason: null,
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/portal",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_standard_admin"],
          organizationEffectiveEdition: "standard",
          organizationPublicId: "organization-public-standard-001",
        }),
      }),
    ).toMatchObject({
      status: "allowed",
      workspace: "organization",
      reason: null,
    });
  });
});
