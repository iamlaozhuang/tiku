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
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "allowed",
      workspace: "organization",
      reason: null,
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
