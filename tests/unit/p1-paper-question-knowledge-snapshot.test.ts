import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(process.cwd());

function readText(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

function parseYamlStrictly(path: string): Record<string, unknown> {
  const repositoryRequire = createRequire(import.meta.url);
  const viteRequire = createRequire(
    repositoryRequire.resolve("vite/package.json"),
  );
  const { parseDocument } = viteRequire("yaml") as {
    parseDocument: (
      source: string,
      options: { strict: boolean; uniqueKeys: boolean },
    ) => { errors: unknown[]; toJS: () => unknown };
  };
  const document = parseDocument(readText(path), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS() as Record<string, unknown>;
}

describe("F-0079 paper question knowledge snapshot contract", () => {
  it("strictly parses the F-0079 task contract and WIP state", () => {
    const taskSafety = JSON.parse(
      readText("docs/04-agent-system/state/task-safety.json"),
    ) as Record<string, unknown>;
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    );
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    );

    expect(taskSafety).toMatchObject({
      taskId:
        "p1-remediation-rc-08-paper-question-knowledge-snapshot-2026-07-23",
      branch: "fix/paper-question-knowledge-snapshot",
      baseSha: "1f4b953f015ad125db42add291cd41288424bd53",
      conditionalCloseout: true,
    });
    expect(JSON.stringify(projectState)).toContain(
      "p1-remediation-rc-08-paper-question-knowledge-snapshot-2026-07-23",
    );
    expect(JSON.stringify(taskQueue)).toContain(
      "p1-remediation-rc-08-paper-question-knowledge-snapshot-2026-07-23",
    );
  });

  it("keeps one structured snapshot builder and no report-time knowledge tree lookup", () => {
    const questionRepository = readText(
      "src/server/repositories/question-repository.ts",
    );
    const paperRepository = readText(
      "src/server/repositories/paper-draft-repository.ts",
    );
    const reportRepository = readText(
      "src/server/repositories/exam-report-repository.ts",
    );
    const reportUi = readText(
      "src/features/student/mock-exam/StudentMockExamReportPage.tsx",
    );

    expect(questionRepository).not.toContain("localeCompare");
    expect(paperRepository.match(/buildQuestionSnapshot\(/g)?.length).toBe(3);
    expect(reportRepository).not.toMatch(/from\([^)]*knowledgeNode/);
    expect(reportUi).not.toMatch(/from\s+["'][^"']*knowledge-node/);
  });
});
