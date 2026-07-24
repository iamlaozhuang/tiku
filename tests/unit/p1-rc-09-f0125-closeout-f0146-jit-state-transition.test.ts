import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const CURRENT_TASK_ID =
  "p1-remediation-rc-09-f0125-closeout-f0146-jit-materialization-2026-07-24";
const PREVIOUS_TASK_ID =
  "p1-remediation-rc-09-organization-training-takedown-answer-history-2026-07-24";
const NEXT_TASK_ID =
  "p1-remediation-rc-09-organization-training-submitted-history-retention-2026-07-24";
const APPROVAL_ID =
  "guardian-rc09-f0125-closeout-f0146-jit-state-transition-2026-07-24";
const BASE_SHA = "13df5565f0076bc6088c553e87972892bb8b7d3b";

type ProgramState = {
  currentTaskId: string;
  materializedTaskIds: string[];
  completedTaskIds: string[];
  taskStatusById: Record<string, string | undefined>;
};

type PreviousTaskCloseout = {
  taskId: string;
  commit: string;
  parent: string;
  tree: string;
  changedFileCount: number;
  focusedTestFiles: number;
  focusedTests: number;
  databaseToken: string;
  permissionToken: string;
  proofBoundary: string;
};

type NextTask = {
  taskId: string;
  branch: string;
  findingId: string;
  status: string;
  active: boolean;
  materialized: boolean;
};

type JitRevalidation = {
  "F-0012": string;
  "F-0028": string;
  "F-0033": string;
  "F-0099": string;
  "F-0122": string;
  "F-0124": string;
  "F-0125": string;
  "F-0127": string;
  "F-0146": string;
  "F-0147": string;
  "F-0013": string;
};

type TaskProjection = {
  id: string;
  status: string;
  executionStage: string;
  findingIds: string[];
  previousTaskCloseout: PreviousTaskCloseout;
  nextTask: NextTask;
  jitRevalidation: JitRevalidation;
  riskBoundary: {
    category: string;
    approvalStatus: string;
    approvalId: string;
    requestedBaseSha: string;
    allowedFiles: number;
    coreFiles: number;
    contingencyFiles: number;
  };
};

type StateProjection = {
  p1RemediationSerialProgram: ProgramState;
  currentTask: TaskProjection;
};

type QueueProjection = {
  p1RemediationSerialProgram: ProgramState;
  activeTasks: TaskProjection[];
};

type TaskSafety = {
  taskId: string;
  findingIds: string[];
  objective: string;
  status: string;
  branch: string;
  baseSha: string;
  riskCategory: string;
  approvalStatus: string;
  approvalId: string;
  allowedFiles: string[];
  coreFiles: string[];
  contingencyFiles: string[];
  previousTaskCloseout: PreviousTaskCloseout;
  nextTask: NextTask;
  jitRevalidation: JitRevalidation;
  validationCommands: Array<{
    name: string;
    kind: string;
    executable: string;
    arguments: string[];
  }>;
  push: { target: string };
  conditionalCloseout: { approved: boolean; approvalId: string };
};

function parseYamlStrictly(path: string): unknown {
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
  const document = parseDocument(readFileSync(path, "utf8"), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS();
}

function assertProgramState(program: ProgramState): void {
  expect(program.currentTaskId).toBe(CURRENT_TASK_ID);
  expect(program.taskStatusById[CURRENT_TASK_ID]).toBe("in_progress");
  expect(program.taskStatusById[PREVIOUS_TASK_ID]).toBe("closed");
  expect(program.taskStatusById[NEXT_TASK_ID]).toBeUndefined();
  expect(program.materializedTaskIds).toContain(CURRENT_TASK_ID);
  expect(program.materializedTaskIds).not.toContain(NEXT_TASK_ID);
  expect(program.completedTaskIds).toContain(PREVIOUS_TASK_ID);
  expect(program.completedTaskIds).not.toContain(NEXT_TASK_ID);
}

function assertCurrentTask(task: TaskProjection): void {
  expect(task).toMatchObject({
    id: CURRENT_TASK_ID,
    status: "in_progress",
    executionStage: "approved_state_only_transition_pending_final_tree_binding",
    findingIds: [],
    previousTaskCloseout: {
      taskId: PREVIOUS_TASK_ID,
      commit: BASE_SHA,
      parent: "c1f7f2839c9bbd3f5b7cdf4ca3857b0a0fa27f9e",
      tree: "6fa6d70ec0bea2a87c4e4af6384be4e5332e2f20",
      changedFileCount: 11,
      focusedTestFiles: 7,
      focusedTests: 236,
      databaseToken: "consumed_once",
      permissionToken: "consumed_once",
      proofBoundary:
        "F0125_closed_static_product_without_real_database_data_browser_runtime_or_permission_expansion_proof",
    },
    nextTask: {
      taskId: NEXT_TASK_ID,
      branch: "fix/organization-training-submitted-history-retention",
      findingId: "F-0146",
      status: "selected_pending_fresh_database_and_permission_approval",
      active: false,
      materialized: false,
    },
    jitRevalidation: {
      "F-0012": "closed_static_product",
      "F-0028": "closed_static_product_existing_fix",
      "F-0033": "unchanged_pending_independent_revalidation",
      "F-0099": "unchanged_pending_independent_revalidation",
      "F-0122": "unchanged_pending_independent_revalidation",
      "F-0124": "unchanged_pending_independent_revalidation",
      "F-0125": "closed_static_product_at_13df5565",
      "F-0127": "unchanged_pending_independent_revalidation",
      "F-0146":
        "selected_next_only_pending_fresh_database_and_permission_approval",
      "F-0147": "unchanged_pending_independent_revalidation",
      "F-0013":
        "runtime_hold_RV0007_requires_separate_runtime_and_deployment_authorization",
    },
    riskBoundary: {
      category: "low_risk_state_only_plus_exact_test",
      approvalStatus: "approved",
      approvalId: APPROVAL_ID,
      requestedBaseSha: BASE_SHA,
      allowedFiles: 4,
      coreFiles: 4,
      contingencyFiles: 0,
    },
  });
}

describe("RC-09 F-0125 closeout and F-0146 next-only materialization", () => {
  it("closes F-0125 and keeps exactly one state-only WIP", () => {
    const project = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    ) as StateProjection;
    const queue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as QueueProjection;
    const safety = JSON.parse(
      readFileSync("docs/04-agent-system/state/task-safety.json", "utf8"),
    ) as TaskSafety;
    const inProgressTasks = queue.activeTasks.filter(
      (task) => task.status === "in_progress",
    );

    assertProgramState(project.p1RemediationSerialProgram);
    assertProgramState(queue.p1RemediationSerialProgram);
    expect(inProgressTasks).toHaveLength(1);
    assertCurrentTask(project.currentTask);
    assertCurrentTask(inProgressTasks[0]!);
    expect(safety).toMatchObject({
      taskId: CURRENT_TASK_ID,
      findingIds: [],
      status: "approved_state_only_transition_pending_final_tree_binding",
      branch: "fix/rc-09-f0125-closeout-f0146-jit-materialization",
      baseSha: BASE_SHA,
      riskCategory: "low_risk_state_only_plus_exact_test",
      approvalStatus: "approved",
      approvalId: APPROVAL_ID,
      previousTaskCloseout: project.currentTask.previousTaskCloseout,
      nextTask: project.currentTask.nextTask,
      jitRevalidation: project.currentTask.jitRevalidation,
    });
    expect(safety.objective.trim()).not.toBe("");
  });

  it("keeps F-0146 next-only and binds the exact Kernel-safe four-file contract", () => {
    const project = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    ) as StateProjection;
    const queue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as QueueProjection;
    const safety = JSON.parse(
      readFileSync("docs/04-agent-system/state/task-safety.json", "utf8"),
    ) as TaskSafety;
    const stateValidation = safety.validationCommands.find(
      (command) => command.name === "state-contract",
    );
    const serializedPrograms = JSON.stringify([
      project.p1RemediationSerialProgram,
      queue.p1RemediationSerialProgram,
      queue.activeTasks.map((task) => task.id),
    ]);

    expect(serializedPrograms).not.toContain(NEXT_TASK_ID);
    expect(project.currentTask.nextTask).toEqual(safety.nextTask);
    expect(safety.allowedFiles).toEqual([
      "docs/04-agent-system/state/project-state.yaml",
      "docs/04-agent-system/state/task-queue.yaml",
      "docs/04-agent-system/state/task-safety.json",
      "tests/unit/p1-rc-09-f0125-closeout-f0146-jit-state-transition.test.ts",
    ]);
    expect(safety.coreFiles).toEqual(safety.allowedFiles);
    expect(safety.contingencyFiles).toEqual([]);
    expect(stateValidation).toEqual({
      name: "state-contract",
      kind: "test",
      executable: "corepack.cmd",
      arguments: [
        "pnpm@11.9.0",
        "exec",
        "vitest",
        "run",
        "tests/unit/p1-rc-09-f0125-closeout-f0146-jit-state-transition.test.ts",
        "--maxWorkers=1",
      ],
    });
    expect(JSON.stringify(safety.validationCommands)).not.toContain("tsx");
    expect(safety.push).toEqual({ target: "origin/master" });
    expect(safety.conditionalCloseout).toEqual({
      approved: true,
      approvalId: APPROVAL_ID,
    });
  });
});
