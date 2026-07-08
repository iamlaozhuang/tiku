import { describe, expect, it } from "vitest";

import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import { normalizeAiGenerationRouteIntegratedKnowledgeScope } from "@/server/contracts/route-integrated-provider-execution-contract";
import { resolveAdminWorkspaceRouteAccess } from "@/server/services/admin-workspace-role-guard-service";

function createCapabilitySummary(
  overrides: Partial<AdminWorkspaceCapabilitySummary>,
): AdminWorkspaceCapabilitySummary {
  return {
    adminRoles: [],
    organizationPublicId: null,
    organizationEffectiveEdition: null,
    organizationAuthorizationSource: null,
    capabilitySource: "service_computed",
    canUseOrganizationAdvancedWorkspace: false,
    ...overrides,
  };
}

describe("knowledge node AI cross-role regression", () => {
  it("keeps the same structured knowledge scope contract for all approved AI generation roles", () => {
    const approvedAiRoles = [
      "personal_advanced_student",
      "org_advanced_employee",
      "org_advanced_admin",
      "content_admin",
    ] as const;

    for (const role of approvedAiRoles) {
      const normalizedScope =
        normalizeAiGenerationRouteIntegratedKnowledgeScope({
          knowledgeNodePublicIds: [
            "knowledge_node_public_scope_a",
            "knowledge_node_public_scope_a",
            " knowledge_node_public_scope_b ",
          ],
          knowledgeNodeMode: "",
          knowledgeNodeSupplement: "synthetic role scope",
          sourcePreference:
            role === "org_advanced_employee" || role === "org_advanced_admin"
              ? "prefer_enterprise"
              : "balanced",
        });

      expect(normalizedScope).toEqual({
        knowledgeNode: null,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: [
          "knowledge_node_public_scope_a",
          "knowledge_node_public_scope_b",
        ],
        includeDescendants: true,
        knowledgeNodeSupplement: "synthetic role scope",
        sourcePreference:
          role === "org_advanced_employee" || role === "org_advanced_admin"
            ? "prefer_enterprise"
            : "balanced",
      });
    }
  });

  it("keeps balanced empty scope explicit and rejects malformed knowledge node public ids", () => {
    expect(
      normalizeAiGenerationRouteIntegratedKnowledgeScope({
        knowledgeNodePublicIds: [],
        knowledgeNodeMode: null,
        includeDescendants: undefined,
      }),
    ).toEqual({
      knowledgeNode: null,
      knowledgeNodeMode: "balanced",
      knowledgeNodePublicIds: [],
      includeDescendants: false,
      knowledgeNodeSupplement: null,
      sourcePreference: null,
    });

    expect(
      normalizeAiGenerationRouteIntegratedKnowledgeScope({
        knowledgeNodePublicIds: ["invalid public id with spaces"],
        knowledgeNodeMode: "selected",
      }),
    ).toBeNull();
    expect(
      normalizeAiGenerationRouteIntegratedKnowledgeScope({
        knowledgeNodePublicIds: ["knowledge_node_public_scope_a"],
        sourcePreference: "prefer_unbounded_source",
      }),
    ).toBeNull();
  });

  it("keeps organization AI routes advanced-only and requires organization context for super admins", () => {
    const organizationAiPath = "/organization/ai-question-generation";

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: organizationAiPath,
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["org_standard_admin"],
          organizationPublicId: "organization_public_standard",
          organizationEffectiveEdition: "standard",
          organizationAuthorizationSource: "org_auth",
        }),
      }),
    ).toMatchObject({
      status: "standard_unavailable",
      reason: "organization_advanced_capability_required",
      requiredEffectiveEdition: "advanced",
      requiredCapability: "organization_advanced_workspace",
      requiredAuthorizationSource: "org_auth",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: organizationAiPath,
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["org_advanced_admin"],
          organizationPublicId: "organization_public_advanced",
          organizationEffectiveEdition: "advanced",
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "allowed",
      reason: null,
      workspace: "organization",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: organizationAiPath,
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["super_admin"],
          organizationPublicId: null,
          organizationEffectiveEdition: "advanced",
          organizationAuthorizationSource: "org_auth",
          canUseOrganizationAdvancedWorkspace: true,
        }),
      }),
    ).toMatchObject({
      status: "denied",
      reason: "organization_context_required",
      requiredOrganizationContext: true,
      requiredCapability: "organization_workspace_context",
    });
  });

  it("keeps content and operations admin workspaces separated during AI closeout", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/ai-question-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["content_admin"],
        }),
      }),
    ).toMatchObject({
      status: "allowed",
      workspace: "content",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/ops/ai-audit-logs",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["ops_admin"],
        }),
      }),
    ).toMatchObject({
      status: "allowed",
      workspace: "ops",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/ai-paper-generation",
        capabilitySummary: createCapabilitySummary({
          adminRoles: ["ops_admin"],
        }),
      }),
    ).toMatchObject({
      status: "denied",
      reason: "workspace_role_mismatch",
      workspace: "content",
    });
  });
});
