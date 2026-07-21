import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const adminResourceKnowledgeSourcePath =
  "src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx";
const adminKnowledgeNodeSourcePath =
  "src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx";
const contentResourcePagePath = "src/app/(admin)/content/resources/page.tsx";
const opsResourcePagePath = "src/app/(admin)/ops/resources/page.tsx";
const adminResourceModalShellClass =
  "fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg";

function readSourceFile(sourcePath: string) {
  return readFileSync(join(process.cwd(), sourcePath), "utf8");
}

function countOccurrences(source: string, text: string) {
  return source.split(text).length - 1;
}

describe("admin resource knowledge UI layout", () => {
  it("keeps the resource confirmation dialogs on one shared modal shell", () => {
    const source = readSourceFile(adminResourceKnowledgeSourcePath);

    expect(source).toContain("function AdminResourceModalShell");
    expect(countOccurrences(source, adminResourceModalShellClass)).toBe(1);
  });

  it("keeps the primary resource page under content and redirects the legacy ops route", () => {
    const contentPageSource = readSourceFile(contentResourcePagePath);
    const opsPageSource = readSourceFile(opsResourcePagePath);

    expect(contentPageSource).toContain("AdminResourceKnowledgeManagement");
    expect(opsPageSource).toContain('redirect("/content/resources")');
    expect(opsPageSource).not.toContain("<AdminResourceKnowledgeManagement");
  });

  it("keeps resource and knowledge node lifecycle context visible in source", () => {
    const resourceSource = readSourceFile(adminResourceKnowledgeSourcePath);
    const knowledgeNodeSource = readSourceFile(adminKnowledgeNodeSourcePath);

    expect(resourceSource).toContain(
      'data-testid="resource-state-machine-context-band"',
    );
    expect(resourceSource).toContain("当前页资料状态");
    expect(resourceSource).toContain("上传待解析");
    expect(resourceSource).toContain("解析草稿");
    expect(resourceSource).toContain("已发布待索引");
    expect(resourceSource).toContain("检索可用");
    expect(resourceSource).toContain("索引失败");
    expect(resourceSource).toContain("检索新鲜度");

    expect(knowledgeNodeSource).toContain(
      'data-testid="knowledge-node-lifecycle-context-band"',
    );
    expect(knowledgeNodeSource).toContain("知识点生命周期");
    expect(knowledgeNodeSource).toContain("检索新鲜度");
    expect(knowledgeNodeSource).toContain("推荐绑定");
    expect(knowledgeNodeSource).toContain("路径变更需复核");
  });

  it("fails closed for non-indexable resource states and reports rebuild as pending", () => {
    const source = readSourceFile(adminResourceKnowledgeSourcePath);

    expect(source).toContain("canRequestResourceIndexRebuild");
    expect(source).toContain('"idempotency-key": requestPublicId');
    expect(source).toContain("检索索引重建请求已受理");
    expect(source).not.toContain("检索索引重建完成，已生成");
  });

  it("requires explicit general coverage or one or more selected levels", () => {
    const source = readSourceFile(adminResourceKnowledgeSourcePath);

    expect(source).toContain("type ResourceCoverageMode");
    expect(source).toContain('"profession_general"');
    expect(source).toContain('"specified_levels"');
    expect(source).toContain('name="levelList"');
    expect(source).toContain("等级待确认");
    expect(source).toContain("专业通用资料");
    expect(source).not.toContain('<option value="">专业通用资料</option>');
  });
});
