import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(...segments: string[]) {
  return readFileSync(join(process.cwd(), ...segments), "utf8");
}

describe("admin readable identifier source contract", () => {
  it("does not expose manual business identifier inputs or identifier placeholders", () => {
    const sources = [
      readSource(
        "src",
        "features",
        "admin",
        "organization-analytics",
        "AdminOrganizationAnalyticsPage.tsx",
      ),
      readSource(
        "src",
        "features",
        "admin",
        "knowledge-node-management",
        "AdminKnowledgeNodeManagement.tsx",
      ),
      readSource(
        "src",
        "features",
        "admin",
        "model-config-management",
        "AdminModelConfigManagement.tsx",
      ),
      readSource(
        "src",
        "features",
        "admin",
        "question-material-management",
        "AdminQuestionMaterialManagementClient.tsx",
      ),
    ];

    for (const source of sources) {
      expect(source).not.toContain('label="组织业务标识"');
      expect(source).not.toContain("标识符已隐藏");
      expect(source).not.toContain("本页只展示业务标识");
    }
  });

  it("uses readable audit terminology without exposing internal operations language", () => {
    const source = readSource(
      "src",
      "app",
      "(admin)",
      "ops",
      "ai-audit-logs",
      "AdminAiAuditLogOpsBaseline.tsx",
    );

    expect(source).not.toContain("Prompt 摘要");
    expect(source).not.toContain("Cost Calibration");
    expect(source).not.toContain("标识符已隐藏");
    expect(source).toContain('label="用量"');
    expect(source).toContain('label="输入摘要"');
  });

  it("gives repeated admin actions a readable object context", () => {
    const contentPreviewSource = readSource(
      "src",
      "app",
      "(admin)",
      "content",
      "ContentKnowledgeOpsBaseline.tsx",
    );
    const resourceSource = readSource(
      "src",
      "features",
      "admin",
      "resource-knowledge-management",
      "AdminResourceKnowledgeManagement.tsx",
    );
    const orgAuthSource = readSource(
      "src",
      "features",
      "admin",
      "org-auth-redeem",
      "AdminOrgAuthRedeemPage.tsx",
    );

    expect(contentPreviewSource).toContain("aria-label={`查看${label}`}");
    expect(resourceSource).toContain(
      "aria-label={`查看资料 ${resource.title}`}",
    );
    expect(resourceSource).toContain(
      "aria-label={`校对内容 ${resource.title}`}",
    );
    expect(orgAuthSource).toContain("aria-label={`转移员工 ${employee.name}`}");
    expect(orgAuthSource).toContain("aria-label={`解绑员工 ${employee.name}`}");
  });
});
