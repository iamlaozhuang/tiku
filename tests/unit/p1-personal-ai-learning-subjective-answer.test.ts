import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const TASK_ID =
  "p1-remediation-rc-08-personal-ai-learning-subjective-answer-2026-07-23";

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

describe("F-0161 personal AI learning subjective answer", () => {
  it("strictly parses the F-0161 task contract and WIP state", () => {
    const currentContract = JSON.parse(
      readRepositoryFile("docs/04-agent-system/state/task-safety.json"),
    ) as {
      taskId: string;
      validationCommands: Array<{ executable: string; arguments: string[] }>;
    };
    const projectState = parseRepositoryYaml(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: { id: string; status: string };
      p1RemediationSerialProgram: {
        currentTaskId: string;
        taskStatusById: Record<string, string>;
      };
    };
    const queue = parseRepositoryYaml(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as {
      activeTasks: Array<{ id: string; status: string }>;
      p1RemediationSerialProgram: { taskStatusById: Record<string, string> };
    };

    expect(
      projectState.p1RemediationSerialProgram.taskStatusById[TASK_ID],
    ).toBe("closed");
    expect(queue.p1RemediationSerialProgram.taskStatusById[TASK_ID]).toBe(
      "closed",
    );
    expect(
      queue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([expect.objectContaining({ id: currentContract.taskId })]);
    expect(projectState.currentTask).toMatchObject({
      id: currentContract.taskId,
      status: "in_progress",
    });
    expect(projectState.p1RemediationSerialProgram.currentTaskId).toBe(
      currentContract.taskId,
    );

    for (const command of currentContract.validationCommands) {
      expect(command.executable).not.toMatch(/[<>]/u);
      expect(command.arguments.join(" ")).not.toMatch(/<[^>]+>/u);
    }
  });

  it("requires one bounded subjective text path before persistence and through resume", () => {
    const modelSource = readRepositoryFile(
      "src/server/models/personal-ai-generation-learning-session.ts",
    );
    const serviceSource = readRepositoryFile(
      "src/server/services/personal-ai-generation-learning-session-service.ts",
    );
    const pageSource = readRepositoryFile(
      "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
    );

    expect(modelSource).toContain('"answer_required"');
    expect(modelSource).toContain('"answer_too_long"');
    expect(serviceSource).toContain(
      "PERSONAL_AI_GENERATION_LEARNING_TEXT_ANSWER_MAX_LENGTH",
    );
    expect(
      serviceSource.indexOf('blockReason: "answer_required"'),
    ).toBeLessThan(serviceSource.indexOf("repository.saveAnswerFeedback({"));
    expect(pageSource).toContain("selectedAiLearningTextAnswersByQuestion");
    expect(pageSource).toContain("<textarea");
    expect(pageSource).not.toContain("textAnswer: null,");
  });
});
