import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { questionTypeValues } from "@/server/models/paper";

import { describe, expect, it } from "vitest";

type LegacyAliasHit = {
  filePath: string;
  alias: "multiple_choice" | "subjective";
};

const projectRoot = process.cwd();

const allowedCompatibilityFiles = new Set([
  "src/features/student/mock-exam/StudentMockExamReportPage.tsx",
  "src/features/student/practice/StudentPracticePage.tsx",
  "src/server/services/mock-exam-service.ts",
  "src/server/services/practice-service.ts",
]);

const sourceRoots = ["src"];

function toProjectPath(filePath: string): string {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

function listSourceFiles(rootPath: string): string[] {
  return readdirSync(rootPath).flatMap((entry): string[] => {
    const entryPath = path.join(rootPath, entry);
    const entryStats = statSync(entryPath);

    if (entryStats.isDirectory()) {
      return listSourceFiles(entryPath);
    }

    return /\.(ts|tsx)$/.test(entryPath) ? [entryPath] : [];
  });
}

function collectLegacyAliasHits(): LegacyAliasHit[] {
  return sourceRoots
    .flatMap((sourceRoot) =>
      listSourceFiles(path.join(projectRoot, sourceRoot)),
    )
    .flatMap((filePath): LegacyAliasHit[] => {
      const sourceText = readFileSync(filePath, "utf8");
      const projectPath = toProjectPath(filePath);
      const hits: LegacyAliasHit[] = [];

      if (sourceText.includes('"multiple_choice"')) {
        hits.push({ filePath: projectPath, alias: "multiple_choice" });
      }

      if (
        /\bcase\s+"subjective"/.test(sourceText) ||
        /\bquestionType\s*(?::|===)\s*"subjective"/.test(sourceText)
      ) {
        hits.push({ filePath: projectPath, alias: "subjective" });
      }

      return hits;
    });
}

describe("paper legacy question_type alias inventory", () => {
  it("keeps legacy aliases out of canonical questionTypeValues", () => {
    expect(questionTypeValues).toContain("multi_choice");
    expect(questionTypeValues).toContain("short_answer");
    expect(questionTypeValues).not.toContain("multiple_choice");
    expect(questionTypeValues).not.toContain("subjective");
  });

  it("keeps legacy alias compatibility limited to student snapshot and runtime surfaces", () => {
    const hits = collectLegacyAliasHits();
    const unexpectedHits = hits.filter(
      (hit) => !allowedCompatibilityFiles.has(hit.filePath),
    );
    const compatibilityFiles = [...new Set(hits.map((hit) => hit.filePath))];

    expect(unexpectedHits).toEqual([]);
    expect(compatibilityFiles.sort()).toEqual(
      [...allowedCompatibilityFiles].sort(),
    );
  });
});
