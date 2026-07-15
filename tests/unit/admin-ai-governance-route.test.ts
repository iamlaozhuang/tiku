import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(repositoryRoot, relativePath), "utf8");
}

describe("admin AI governance route", () => {
  it("mounts the governed runtime page at a discoverable operations route", () => {
    const routeSource = readSource(
      "src/app/(admin)/ops/ai-governance/page.tsx",
    );
    const pageSource = readSource(
      "src/app/(admin)/ops/ai-governance/AdminAiGovernancePage.tsx",
    );
    const layoutSource = readSource(
      "src/components/AdminDashboardLayout/AdminDashboardLayout.tsx",
    );
    const overviewSource = readSource(
      "src/features/admin/admin-role-overview/AdminRoleOverviewPage.tsx",
    );

    expect(routeSource).toContain("<AdminAiGovernancePage");
    expect(pageSource).toContain("useAdminDashboardRoles");
    expect(pageSource).toContain("runtimeEnabled");
    expect(pageSource).toContain('roles.includes("super_admin")');
    expect(layoutSource).toContain('href: "/ops/ai-governance"');
    expect(overviewSource).toContain('href: "/ops/ai-governance"');
  });

  it("fails closed to the ops read-only view when role context is absent", () => {
    const pageSource = readSource(
      "src/app/(admin)/ops/ai-governance/AdminAiGovernancePage.tsx",
    );
    const baselineSource = readSource(
      "src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx",
    );

    expect(pageSource).toContain(': "ops_admin"');
    expect(baselineSource).toContain('currentRole = "ops_admin"');
  });
});
