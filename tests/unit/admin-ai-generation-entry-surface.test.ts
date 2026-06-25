import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readExpectedSource(sourcePath: string) {
  const absoluteSourcePath = join(workspaceRoot, sourcePath);

  expect(existsSync(absoluteSourcePath)).toBe(true);

  return existsSync(absoluteSourcePath)
    ? readFileSync(absoluteSourcePath, "utf8")
    : "";
}

describe("admin AI generation entry surfaces", () => {
  it("wires content AI question and paper generation routes to the shared draft review surface", () => {
    const questionRouteSource = readExpectedSource(
      "src/app/(admin)/content/ai-question-generation/page.tsx",
    );
    const paperRouteSource = readExpectedSource(
      "src/app/(admin)/content/ai-paper-generation/page.tsx",
    );
    const sharedSurfaceSource = readExpectedSource(
      "src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx",
    );

    expect(questionRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(questionRouteSource).toContain('workspace="content"');
    expect(questionRouteSource).toContain('generationKind="question"');
    expect(paperRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(paperRouteSource).toContain('workspace="content"');
    expect(paperRouteSource).toContain('generationKind="paper"');
    expect(sharedSurfaceSource).toContain("内容 AI 草稿/评审");
    expect(sharedSurfaceSource).toContain("正式题目或试卷写入仍需评审");
    expect(sharedSurfaceSource).not.toContain("modelProvider");
    expect(sharedSurfaceSource).not.toContain("providerPayload");
  });

  it("wires organization AI routes to organization-owned advanced-only surfaces", () => {
    const questionRouteSource = readExpectedSource(
      "src/app/(admin)/organization/ai-question-generation/page.tsx",
    );
    const paperRouteSource = readExpectedSource(
      "src/app/(admin)/organization/ai-paper-generation/page.tsx",
    );
    const portalRouteSource = readExpectedSource(
      "src/app/(admin)/organization/portal/page.tsx",
    );
    const trainingRouteSource = readExpectedSource(
      "src/app/(admin)/organization/organization-training/page.tsx",
    );
    const analyticsRouteSource = readExpectedSource(
      "src/app/(admin)/organization/organization-analytics/page.tsx",
    );
    const sharedSurfaceSource = readExpectedSource(
      "src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx",
    );

    expect(questionRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(questionRouteSource).toContain('workspace="organization"');
    expect(questionRouteSource).toContain('generationKind="question"');
    expect(paperRouteSource).toContain("AdminAiGenerationEntryPage");
    expect(paperRouteSource).toContain('workspace="organization"');
    expect(paperRouteSource).toContain('generationKind="paper"');
    expect(portalRouteSource).toContain("AdminOrganizationPortalPage");
    expect(trainingRouteSource).toContain("AdminOrganizationTrainingPage");
    expect(analyticsRouteSource).toContain("AdminOrganizationAnalyticsPage");
    expect(sharedSurfaceSource).toContain("org_advanced_admin");
    expect(sharedSurfaceSource).toContain("org_standard_admin");
    expect(sharedSurfaceSource).toContain("标准版暂不可用");
    expect(sharedSurfaceSource).not.toContain(
      "/content/ai-question-generation",
    );
    expect(sharedSurfaceSource).not.toContain("/content/ai-paper-generation");
  });
});
