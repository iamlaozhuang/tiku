import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const CURRENT_TASK_ID = "p1-remediation-rc-09-residual-jit-review-2026-07-24";
const PREVIOUS_TASK_ID =
  "p1-remediation-rc-08-f0164-closeout-static-residual-disposition-2026-07-24";
const PRODUCT_TASK_ID =
  "p1-remediation-rc-09-employee-disable-active-flow-equivalence-2026-07-24";
const AMENDMENT_ID =
  "guardian-rc09-residual-jit-state-transition-test-amendment-2026-07-24";
const INVALIDATED_BINDING_ID =
  "guardian-rc09-residual-jit-f0012-final-tree-b54b1089-2026-07-24";
const TEST_PATH = "tests/unit/p1-rc-09-residual-jit-state-transition.test.ts";

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
  };
  rc09ResidualReview: {
    selectedFindingId: string;
    selectedFindingStatus: string;
    otherFindingDisposition: string;
  };
  nextTask: {
    proposedProductTaskId: string;
    findingId: string;
    status: string;
    active: boolean;
    materialized: boolean;
  };
  runtimeHold: {
    findingId: string;
    status: string;
  };
  riskBoundary: {
    allowedFiles: number;
    coreFiles: number;
    contingencyFiles: number;
    scopeAmendmentId: string;
    invalidatedFinalTreeBindingApprovalId: string;
    validationCorrection: string;
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

type TaskSafety = TaskProjection & {
  taskId: string;
  approvalId: string;
  allowedFiles: string[];
  coreFiles: string[];
  contingencyFiles: string[];
  push: { target: string };
  conditionalCloseout: { approved: boolean; approvalId: string };
  scopeAmendments: Array<{
    approvalId: string;
    decision: string;
    invalidatedFinalTreeBindingApprovalId: string;
    correction: string;
  }>;
  validationCommands: Array<{
    name: string;
    executable: string;
    arguments: string[];
  }>;
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
  expect(program.materializedTaskIds).not.toContain(PRODUCT_TASK_ID);
  expect(program.taskStatusById[PRODUCT_TASK_ID]).toBeUndefined();
}

function assertTaskProjection(task: TaskProjection): void {
  expect(task).toMatchObject({
    id: CURRENT_TASK_ID,
    status: "in_progress",
    executionStage: "approved_state_only_transition_pending_final_tree_binding",
    findingIds: [],
    previousTaskCloseout: {
      taskId: PREVIOUS_TASK_ID,
      commit: "3df9475e95621f1c3946be6693afd7ab9667cdae",
      parent: "e3d812bac133db24721d11d9eb7852ab2e9d17b9",
      tree: "5d9bbc0b47a577c2db18392cbe56c8414b51fe8c",
    },
    rc09ResidualReview: {
      selectedFindingId: "F-0012",
      selectedFindingStatus: "revalidated_reachable_next_only",
      otherFindingDisposition: "unchanged_pending_independent_revalidation",
    },
    nextTask: {
      proposedProductTaskId: PRODUCT_TASK_ID,
      findingId: "F-0012",
      status: "selected_pending_fresh_database_approval",
      active: false,
      materialized: false,
    },
    runtimeHold: {
      findingId: "F-0013",
      status: "runtime_evidence_required_runtime_hold_RV0007",
    },
    riskBoundary: {
      allowedFiles: 4,
      coreFiles: 4,
      contingencyFiles: 0,
      scopeAmendmentId: AMENDMENT_ID,
      invalidatedFinalTreeBindingApprovalId: INVALIDATED_BINDING_ID,
      validationCorrection:
        "replace_unsafe_inline_tsx_state_contract_with_kernel_allowed_exact_vitest_test",
    },
  });
}

describe("RC-09 residual JIT state transition", () => {
  it("keeps one current task, the prior closeout, F-0012 next-only and F-0013 on runtime hold", () => {
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
    assertTaskProjection(project.currentTask);
    assertTaskProjection(inProgressTasks[0]!);
    assertTaskProjection({
      ...safety,
      id: safety.taskId,
      status: "in_progress",
      executionStage: safety.status,
      riskBoundary: {
        allowedFiles: safety.allowedFiles.length,
        coreFiles: safety.coreFiles.length,
        contingencyFiles: safety.contingencyFiles.length,
        scopeAmendmentId: safety.scopeAmendments[0]!.approvalId,
        invalidatedFinalTreeBindingApprovalId:
          safety.scopeAmendments[0]!.invalidatedFinalTreeBindingApprovalId,
        validationCorrection: safety.scopeAmendments[0]!.correction,
      },
    });
  });

  it("uses the only Kernel-safe Vitest state-contract command and the exact four-file envelope", () => {
    const safety = JSON.parse(
      readFileSync("docs/04-agent-system/state/task-safety.json", "utf8"),
    ) as TaskSafety;
    const stateContract = safety.validationCommands.find(
      (command) => command.name === "state-contract",
    );
    const serializedCommand = JSON.stringify(stateContract);

    expect(safety.allowedFiles).toEqual(safety.coreFiles);
    expect(safety.allowedFiles).toEqual([
      "docs/04-agent-system/state/project-state.yaml",
      "docs/04-agent-system/state/task-queue.yaml",
      "docs/04-agent-system/state/task-safety.json",
      TEST_PATH,
    ]);
    expect(safety.contingencyFiles).toEqual([]);
    expect(stateContract).toEqual({
      name: "state-contract",
      kind: "test",
      executable: "corepack.cmd",
      arguments: [
        "pnpm@11.9.0",
        "exec",
        "vitest",
        "run",
        TEST_PATH,
        "--maxWorkers=1",
      ],
    });
    expect(serializedCommand).not.toContain("tsx");
    expect(serializedCommand).not.toContain('"-e"');
    expect(serializedCommand).not.toContain("inline");
    expect(serializedCommand).not.toMatch(/(?:guard|smoke)/iu);
    expect(safety.approvalId).toBe(
      "guardian-rc09-residual-jit-f0012-selection-state-transition-2026-07-24",
    );
    expect(safety.push).toEqual({ target: "origin/master" });
    expect(safety.conditionalCloseout).toEqual(
      expect.objectContaining({
        approved: true,
        approvalId:
          "guardian-rc09-residual-jit-f0012-selection-state-transition-2026-07-24",
      }),
    );
    expect(safety.scopeAmendments).toContainEqual({
      approvalId: AMENDMENT_ID,
      decision: "approved_exact_test_only_scope_amendment",
      invalidatedFinalTreeBindingApprovalId: INVALIDATED_BINDING_ID,
      correction:
        "replace_unsafe_inline_tsx_state_contract_with_kernel_allowed_exact_vitest_test",
    });
  });
});
