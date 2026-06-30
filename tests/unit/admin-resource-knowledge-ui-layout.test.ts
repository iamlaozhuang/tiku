import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const adminResourceKnowledgeSourcePath =
  "src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx";
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
});
