import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const TASK_ID =
  "p1-remediation-rc-08-mock-exam-submit-scoring-atomic-command-2026-07-23";
const BASE_SHA = "3bba78a8eddbba33bd438e1633510c69688aa13f";
const BRANCH = "fix/mock-exam-submit-scoring-atomic-command";
const APPROVAL_ID =
  "guardian-f0027-mock-submit-scoring-atomic-command-2026-07-23";

type ValidationCommand = {
  executable: string;
  arguments: string[];
};

type TaskSafetyContract = {
  taskId: string;
  baseSha: string;
  branch: string;
  status: string;
  allowedFiles: string[];
  coreFiles: string[];
  contingencyFiles: string[];
  validationCommands: ValidationCommand[];
  approvalSources: {
    database: string | null;
    provider: string | null;
  };
  conditionalCloseout: boolean;
};

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function parseRepositoryJson<T>(path: string): T {
  return JSON.parse(readRepositoryFile(path)) as T;
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

describe("F-0027 mock exam submit and scoring atomic command", () => {
  it("strictly parses the F-0027 mock partition contract and WIP state", () => {
    const contract = parseRepositoryJson<TaskSafetyContract>(
      "docs/04-agent-system/state/task-safety.json",
    );
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
      approvalSources: {
        database: APPROVAL_ID,
        provider: APPROVAL_ID,
      },
      conditionalCloseout: true,
    });
    expect(contract.allowedFiles).toHaveLength(15);
    expect(contract.coreFiles).toHaveLength(8);
    expect(contract.contingencyFiles).toHaveLength(7);
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

  it("requires one exact submit transaction over answers deadline and durable tasks", () => {
    const repositorySource = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const submitSource = repositorySource.slice(
      repositorySource.indexOf("async submitMockExam"),
      repositorySource.indexOf("async retryFailedAiScoringTasks"),
    );

    expect(submitSource).toContain("database.transaction");
    expect(submitSource).toContain('eq(mockExam.exam_status, "in_progress")');
    expect(submitSource).toContain('.for("update")');
    expect(submitSource).toContain("answerRecordPublicId");
    expect(submitSource).toContain("expectedRevision");
    expect(submitSource).toContain("currentAnswerRows");
    expect(submitSource).toContain("updatedAnswerRows");
    expect(submitSource).toContain("deadlineRows");
    expect(submitSource).toContain("insertedTaskRows");
    expect(submitSource).toContain(
      "currentAnswerRows.length !== input.answerRecordResults.length",
    );
    expect(submitSource).toContain(
      "current.answer_revision !== result.expectedRevision",
    );
    expect(submitSource).toContain(
      "current.answer_record_status !==\n              result.expectedAnswerRecordStatus",
    );
    expect(submitSource).toContain("updatedAnswerRows.length !== 1");
    expect(submitSource).toContain(
      "JSON.stringify(sortedSubmittedAnswerPublicIds)",
    );
    expect(submitSource).toContain(
      "insertedTaskRows.length !== input.aiScoringTasks.length",
    );
    expect(submitSource).toContain('deadlineTask.task_status === "pending"');
    expect(submitSource).toContain('deadlineTask.task_status === "running"');
    expect(submitSource).toContain(
      "deadlineTask.lease_expires_at <= input.submittedAt",
    );
    expect(submitSource).toContain(
      'input.aiScoringTasks.length > 0 ? "scoring" : "completed"',
    );
    expect(submitSource.indexOf("transitionedRows")).toBeGreaterThan(
      submitSource.indexOf("insertedTaskRows"),
    );
    expect(submitSource).not.toContain(".onConflictDoNothing");
    expect(submitSource).not.toContain(".limit(");
    expect(submitSource).not.toContain("applyMockExamScoringResults");
  });

  it("keeps durable scoring as the only production finalization path", () => {
    const contractSource = readRepositoryFile(
      "src/server/repositories/mock-exam-repository.ts",
    );
    const repositorySource = readRepositoryFile(
      "src/server/repositories/student-flow-runtime-repository.ts",
    );
    const serviceSource = readRepositoryFile(
      "src/server/services/mock-exam-service.ts",
    );
    const runtimeSource = readRepositoryFile(
      "src/server/services/student-flow-runtime.ts",
    );
    const mockExamServiceWiring = runtimeSource.slice(
      runtimeSource.indexOf("mockExams: createMockExamRouteHandlers"),
      runtimeSource.indexOf("examReports: createExamReportRouteHandlers"),
    );

    expect(contractSource).not.toContain("applyMockExamScoringResults");
    expect(repositorySource).not.toContain("applyMockExamScoringResults");
    expect(serviceSource).not.toContain("applyMockExamScoringResults");
    expect(serviceSource).not.toContain("aiScoringRuntime");
    expect(serviceSource).not.toContain("aiScoringQueue");
    expect(serviceSource).not.toContain("scoreSubjectiveQuestions");
    expect(serviceSource).toContain("aiScoringTaskPreparer");
    expect(serviceSource).toContain("retryFailedAiScoringTasks");
    expect(serviceSource).toContain("Durable AI scoring is unavailable.");
    expect(serviceSource).toContain("Durable AI scoring retry is unavailable.");
    expect(mockExamServiceWiring).toContain("aiScoringTaskPreparer");
    expect(mockExamServiceWiring).not.toContain("aiScoringRuntime");
    expect(mockExamServiceWiring).not.toContain("aiScoringQueue");
  });
});
