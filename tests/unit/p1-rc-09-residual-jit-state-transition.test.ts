import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const CURRENT_TASK_ID =
  "p1-remediation-rc-09-employee-disable-active-flow-equivalence-2026-07-24";
const PREVIOUS_TASK_ID = "p1-remediation-rc-09-residual-jit-review-2026-07-24";
const APPROVAL_ID =
  "guardian-f0012-employee-disable-active-flow-equivalence-2026-07-24";

type ProgramState = {
  currentTaskId: string;
  materializedTaskIds: string[];
  completedTaskIds: string[];
  taskStatusById: Record<string, string | undefined>;
};

type TaskProjection = {
  id: string;
  status: string;
  executionStage: string;
  findingIds: string[];
  previousTaskCloseout: {
    taskId: string;
    commit: string;
    parent: string;
    tree: string;
    changedFileCount: number;
  };
  jitRevalidation: {
    "F-0012": string;
    "F-0013": string;
    otherRc09Findings: string;
  };
  riskBoundary: {
    category: string;
    approvalStatus: string;
    approvalId: string;
    requestedBaseSha: string;
    allowedFiles: number;
    coreFiles: number;
    contingencyFiles: number;
    permissionPathClassifiedWithoutScopeExpansion: boolean;
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
  status: string;
  branch: string;
  baseSha: string;
  riskCategory: string;
  approvalStatus: string;
  approvalId: string;
  allowedFiles: string[];
  coreFiles: string[];
  contingencyFiles: string[];
  approvalSources: {
    database: string | null;
    permission: string | null;
  };
  previousTaskCloseout: TaskProjection["previousTaskCloseout"];
  jitRevalidation: TaskProjection["jitRevalidation"];
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
  expect(program.materializedTaskIds).toContain(CURRENT_TASK_ID);
  expect(program.completedTaskIds).toContain(PREVIOUS_TASK_ID);
}

function assertCurrentTask(task: TaskProjection): void {
  expect(task).toMatchObject({
    id: CURRENT_TASK_ID,
    status: "in_progress",
    executionStage: "implemented_verified_static_pending_final_tree_binding",
    findingIds: ["F-0012"],
    previousTaskCloseout: {
      taskId: PREVIOUS_TASK_ID,
      commit: "a61da4c2e46968b117ab984874c888ea81ebc5e7",
      parent: "3df9475e95621f1c3946be6693afd7ab9667cdae",
      tree: "a9453d1a769b5b248febbd3ec1e8eca9d2f856a2",
      changedFileCount: 4,
    },
    jitRevalidation: {
      "F-0012": "active_product_task_root_cause_revalidated_reachable",
      "F-0013":
        "runtime_hold_RV0007_requires_separate_runtime_and_deployment_authorization",
      otherRc09Findings: "unchanged_pending_independent_revalidation",
    },
    riskBoundary: {
      category:
        "database_application_logic_and_permission_path_classified_without_scope_expansion",
      approvalStatus: "approved",
      approvalId: APPROVAL_ID,
      requestedBaseSha: "a61da4c2e46968b117ab984874c888ea81ebc5e7",
      allowedFiles: 18,
      coreFiles: 13,
      contingencyFiles: 5,
      permissionPathClassifiedWithoutScopeExpansion: true,
    },
  });
}

describe("RC-09 F-0012 product task materialization", () => {
  it("closes the prior state task and keeps exactly one current F-0012 WIP", () => {
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
      findingIds: ["F-0012"],
      status: "implemented_verified_static_pending_final_tree_binding",
      branch: "fix/employee-disable-active-flow-equivalence",
      baseSha: "a61da4c2e46968b117ab984874c888ea81ebc5e7",
      riskCategory:
        "database_application_logic_and_permission_path_classified_without_scope_expansion",
      approvalStatus: "approved",
      approvalId: APPROVAL_ID,
      previousTaskCloseout: {
        taskId: PREVIOUS_TASK_ID,
        commit: "a61da4c2e46968b117ab984874c888ea81ebc5e7",
        parent: "3df9475e95621f1c3946be6693afd7ab9667cdae",
        tree: "a9453d1a769b5b248febbd3ec1e8eca9d2f856a2",
        changedFileCount: 4,
      },
      jitRevalidation: project.currentTask.jitRevalidation,
    });
  });

  it("binds the exact 18-file envelope and both classified risk sources", () => {
    const safety = JSON.parse(
      readFileSync("docs/04-agent-system/state/task-safety.json", "utf8"),
    ) as TaskSafety;
    const focusedValidation = safety.validationCommands.find(
      (command) => command.name === "employee-disable-focused",
    );
    const stateValidation = safety.validationCommands.find(
      (command) => command.name === "state-contract",
    );

    expect(safety.allowedFiles).toHaveLength(18);
    expect(new Set(safety.allowedFiles).size).toBe(18);
    expect(safety.coreFiles).toHaveLength(13);
    expect(safety.contingencyFiles).toHaveLength(5);
    expect(
      safety.coreFiles.filter((path) => safety.contingencyFiles.includes(path)),
    ).toEqual([]);
    expect(safety.approvalSources).toMatchObject({
      database: APPROVAL_ID,
      permission: APPROVAL_ID,
    });
    expect(focusedValidation).toMatchObject({
      kind: "test",
      executable: "corepack.cmd",
    });
    expect(stateValidation).toEqual({
      name: "state-contract",
      kind: "test",
      executable: "corepack.cmd",
      arguments: [
        "pnpm@11.9.0",
        "exec",
        "vitest",
        "run",
        "tests/unit/p1-rc-09-residual-jit-state-transition.test.ts",
        "--maxWorkers=1",
      ],
    });
    expect(JSON.stringify(safety.validationCommands)).not.toContain("tsx");
    expect(safety.push).toEqual({ target: "origin/master" });
    expect(safety.conditionalCloseout).toMatchObject({
      approved: true,
      approvalId: APPROVAL_ID,
    });
  });
});
