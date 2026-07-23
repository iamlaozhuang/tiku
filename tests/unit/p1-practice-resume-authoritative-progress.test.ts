import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const TASK_ID =
  "p1-remediation-rc-08-practice-resume-authoritative-progress-2026-07-23";
const BASE_SHA = "f3d165b06282dca6e049cdfe2ff8a63bf208f99a";
const BRANCH = "fix/practice-resume-authoritative-progress";
const APPROVAL_ID =
  "current-user-low-risk-p1-goal-closeout-standing-approval-2026-07-20";

type TaskSafetyContract = {
  taskId: string;
  baseSha: string;
  branch: string;
  status: string;
  allowedFiles: string[];
  coreFiles: string[];
  contingencyFiles: string[];
  validationCommands: Array<{
    executable: string;
    arguments: string[];
  }>;
  approvalSources: { lowRiskCloseout: string | null };
  conditionalCloseout: boolean;
};

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function parseRepositoryYaml(path: string): unknown {
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
  const document = parseDocument(readRepositoryFile(path), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS();
}

describe("F-0135 authoritative practice resume progress", () => {
  it("strictly parses the F-0135 task contract and WIP state", () => {
    const contract = JSON.parse(
      readRepositoryFile("docs/04-agent-system/state/task-safety.json"),
    ) as TaskSafetyContract;
    const projectState = parseRepositoryYaml(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: { id: string; status: string; executionStage: string };
      p1RemediationSerialProgram: { currentTaskId: string };
    };
    const queue = parseRepositoryYaml(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as { activeTasks: Array<{ id: string; status: string }> };

    expect(contract).toMatchObject({
      taskId: TASK_ID,
      baseSha: BASE_SHA,
      branch: BRANCH,
      status: "validated_reviewed_conditional_closeout_ready",
      approvalSources: { lowRiskCloseout: APPROVAL_ID },
      conditionalCloseout: true,
    });
    expect(contract.allowedFiles).toHaveLength(15);
    expect(contract.coreFiles).toHaveLength(13);
    expect(contract.contingencyFiles).toHaveLength(2);
    expect(projectState.currentTask).toMatchObject({
      id: TASK_ID,
      status: "in_progress",
      executionStage: "validated_reviewed_conditional_closeout_ready",
    });
    expect(projectState.p1RemediationSerialProgram.currentTaskId).toBe(TASK_ID);
    expect(
      queue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([expect.objectContaining({ id: TASK_ID })]);

    for (const command of contract.validationCommands) {
      expect(command.executable).not.toMatch(/[<>]/u);
      expect(command.arguments.join(" ")).not.toMatch(/<[^>]+>/u);
    }
  });

  it("requires one server-owned question progress projection through service and UI", () => {
    const contractSource = readRepositoryFile(
      "src/server/contracts/practice-contract.ts",
    );
    const mapperSource = readRepositoryFile(
      "src/server/mappers/practice-mapper.ts",
    );
    const serviceSource = readRepositoryFile(
      "src/server/services/practice-service.ts",
    );
    const pageSource = readRepositoryFile(
      "src/features/student/practice/StudentPracticePage.tsx",
    );

    expect(contractSource).toContain("PracticeQuestionProgressDto");
    expect(contractSource).toContain("questionProgress:");
    expect(mapperSource).toContain("buildPracticeResumeProjection");
    expect(serviceSource).toContain("buildPracticeResumeProjection");
    expect(pageSource).toContain("practicePayload.data.questionProgress");
    expect(pageSource).not.toContain(
      "practicePayload.data.answerRecords.length",
    );
  });

  it("uses one batched owner-scoped repository read without per-answer queries", () => {
    const repositorySource = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const listStart = repositorySource.indexOf(
      "async listAnswerRecordsByPractice",
    );
    const listEnd = repositorySource.indexOf(
      "async submitPracticeAnswer",
      listStart,
    );
    const listSource = repositorySource.slice(listStart, listEnd);

    expect(listSource).toMatch(/\.leftJoin\(\s*mistakeBook/u);
    expect(listSource).toContain("mistake_book_public_id");
    expect(listSource).not.toMatch(/for\s*\([^)]*\)[\s\S]*?\.select\(/u);
  });
});
