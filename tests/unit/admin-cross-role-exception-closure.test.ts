import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import DevelopmentOnlyLayout, {
  isDevelopmentRouteEnabled,
} from "@/app/(dev)/layout";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import { createPostLoginSessionBoundary } from "@/server/contracts/user-auth/session-boundary";
import { resolveAdminWorkspaceRouteAccess } from "@/server/services/admin-workspace-role-guard-service";

function readSource(sourcePath: string) {
  return readFileSync(join(process.cwd(), sourcePath), "utf8");
}

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

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("admin cross-role exception closure", () => {
  it("fails closed for developer-only routes outside local development", () => {
    const devLayoutSource = readSource("src/app/(dev)/layout.tsx");

    expect(isDevelopmentRouteEnabled("development")).toBe(true);
    expect(isDevelopmentRouteEnabled("production")).toBe(false);
    expect(isDevelopmentRouteEnabled("test")).toBe(false);
    expect(isDevelopmentRouteEnabled(undefined)).toBe(false);
    expect(devLayoutSource).toContain("notFound()");
    expect(devLayoutSource).toContain("isDevelopmentRouteEnabled()");

    vi.stubEnv("NODE_ENV", "production");
    expect(() =>
      DevelopmentOnlyLayout({ children: "production-blocked" }),
    ).toThrowError("NEXT_HTTP_ERROR_FALLBACK;404");

    vi.stubEnv("NODE_ENV", "development");
    expect(DevelopmentOnlyLayout({ children: "development-visible" })).toBe(
      "development-visible",
    );
  });

  it("routes compatibility entries to their guarded canonical workspaces", () => {
    const organizationPortalAlias = readSource(
      "src/app/(admin)/content/organization-portal/page.tsx",
    );
    const opsResourcesAlias = readSource(
      "src/app/(admin)/ops/resources/page.tsx",
    );
    const opsAuditLogsAlias = readSource(
      "src/app/(admin)/ops/ai-audit-logs/page.tsx",
    );

    expect(organizationPortalAlias).toContain(
      'redirect("/organization/portal")',
    );
    expect(organizationPortalAlias).not.toContain(
      "AdminOrganizationPortalPage",
    );
    expect(opsResourcesAlias).toContain('redirect("/content/resources")');
    expect(opsAuditLogsAlias).toContain('redirect("/ops/audit-logs")');
  });

  it("keeps public discovery separate from role-specific session landing", () => {
    const rootPageSource = readSource("src/app/page.tsx");

    expect(rootPageSource).toContain('href="/home"');
    expect(rootPageSource).toContain('href="/content/overview"');
    expect(rootPageSource).toContain('href="/ops/overview"');

    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-super-public-closure",
        adminRoles: ["super_admin"],
      }),
    ).toMatchObject({
      exposeBearerTokenToClient: false,
      redirectPath: "/admin/overview",
      sessionPersistenceMode: "server_session",
    });
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-content-public-closure",
        adminRoles: ["content_admin"],
      }).redirectPath,
    ).toBe("/content/overview");
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-ops-public-closure",
        adminRoles: ["ops_admin"],
      }).redirectPath,
    ).toBe("/ops/overview");
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-org-public-closure",
        adminRoles: ["org_standard_admin"],
      }).redirectPath,
    ).toBe("/organization/portal");

    for (const pathname of [
      "/content/overview",
      "/ops/overview",
      "/organization/portal",
    ]) {
      expect(
        resolveAdminWorkspaceRouteAccess({
          pathname,
          capabilitySummary: capabilitySummary({ adminRoles: [] }),
        }),
      ).toMatchObject({
        status: "denied",
        reason: "not_admin",
        returnPath: "/login",
      });
    }
  });

  it("denies alias destinations when the session role does not own the workspace", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/portal",
        capabilitySummary: capabilitySummary({
          adminRoles: ["content_admin"],
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "organization",
      reason: "workspace_role_mismatch",
      returnPath: "/content/overview",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/resources",
        capabilitySummary: capabilitySummary({ adminRoles: ["ops_admin"] }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "content",
      reason: "workspace_role_mismatch",
      returnPath: "/ops/overview",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/ops/audit-logs",
        capabilitySummary: capabilitySummary({
          adminRoles: ["content_admin"],
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "ops",
      reason: "workspace_role_mismatch",
      returnPath: "/content/overview",
    });

    for (const pathname of [
      "/organization/portal",
      "/content/resources",
      "/ops/audit-logs",
    ]) {
      expect(
        resolveAdminWorkspaceRouteAccess({
          pathname,
          capabilitySummary: capabilitySummary({
            adminRoles: ["super_admin"],
            organizationPublicId: "organization-public-super-closure",
          }),
        }).status,
      ).toBe("allowed");
    }
  });

  it("fails organization aliases closed without server-derived context", () => {
    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/organization/portal",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_standard_admin"],
          organizationEffectiveEdition: "standard",
          organizationPublicId: null,
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "organization",
      reason: "organization_context_required",
      requiredAuthorizationSource: "org_auth",
      requiredOrganizationContext: true,
      returnPath: "/organization/portal",
    });

    expect(
      resolveAdminWorkspaceRouteAccess({
        pathname: "/content/organization-portal",
        capabilitySummary: capabilitySummary({
          adminRoles: ["org_standard_admin", "ops_admin"],
          organizationEffectiveEdition: "standard",
          organizationPublicId: "organization-public-contaminated",
        }),
      }),
    ).toMatchObject({
      status: "denied",
      workspace: "content",
      reason: "organization_workspace_role_conflict",
      returnPath: "/organization/portal",
    });
  });
});
