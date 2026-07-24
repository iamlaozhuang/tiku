import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const CURRENT_TASK_ID =
  "p1-remediation-rc-09-organization-training-answer-cas-read-only-revalidation-2026-07-24";
const PREVIOUS_TASK_ID =
  "p1-remediation-rc-09-f0012-closeout-f0028-jit-materialization-2026-07-24";
const NEXT_TASK_ID =
  "p1-remediation-rc-09-post-f0028-residual-jit-review-2026-07-24";
const APPROVAL_ID =
  "guardian-rc09-f0028-read-only-revalidation-state-2026-07-24";
const COVERING_COMMIT = "e136ca28acde82282a17c65ccfb828a01e872c0b";
const BASE_SHA = "6a4b4daacf87e90764ebcac190a20c8b8535dd5a";

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
  stateContractTestFiles: number;
  stateContractTests: number;
};

type RevalidationEvidence = {
  coveringCommit: string;
  verifiedAtHead: string;
  focusedTestFiles: number;
  focusedTests: number;
  transactionGateways: string;
  legacyUpsertStatus: string;
  proofBoundary: string;
};

type NextTask = {
  taskId: string;
  branch: string;
  candidateRootCauseCluster: string;
  status: string;
  active: boolean;
  materialized: boolean;
};

type TaskProjection = {
  id: string;
  status: string;
  executionStage: string;
  findingIds: string[];
  findingStatus: string;
  previousTaskCloseout: PreviousTaskCloseout;
  revalidationEvidence: RevalidationEvidence;
  nextTask: NextTask;
  jitRevalidation: {
    "F-0028": string;
    "F-0125": string;
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
  previousTaskCloseout: PreviousTaskCloseout;
  revalidationEvidence: RevalidationEvidence;
  nextTask: NextTask;
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
    executionStage:
      "approved_state_only_revalidation_pending_final_tree_binding",
    findingIds: ["F-0028"],
    findingStatus: "closed_static_product_existing_fix",
    previousTaskCloseout: {
      taskId: PREVIOUS_TASK_ID,
      commit: BASE_SHA,
      parent: "5aa62c7e9573d1d065efe37d97e4e7b10294ad8e",
      tree: "08e531d2dae275bcdeb825ec2efcf0a1d9b6c9e2",
      changedFileCount: 4,
      stateContractTestFiles: 1,
      stateContractTests: 2,
    },
    revalidationEvidence: {
      coveringCommit: COVERING_COMMIT,
      verifiedAtHead: BASE_SHA,
      focusedTestFiles: 3,
      focusedTests: 146,
      transactionGateways:
        "saveEmployeeAnswerDraftTransaction_and_submitEmployeeAnswerTransaction",
      legacyUpsertStatus:
        "private_unreachable_compatibility_definitions_without_production_callers",
      proofBoundary:
        "closed_static_product_existing_fix_without_real_database_browser_or_runtime_proof",
    },
    nextTask: {
      taskId: NEXT_TASK_ID,
      branch: "fix/rc-09-post-f0028-residual-jit-review",
      candidateRootCauseCluster: "P1-RC-09",
      status: "selected_pending_fresh_state_only_approval",
      active: false,
      materialized: false,
    },
    jitRevalidation: {
      "F-0028":
        "closed_static_product_existing_fix_at_e136ca28_verified_at_6a4b4daa_without_real_database_browser_or_runtime_proof",
      "F-0125": "independent_pending_read_only_revalidation",
      "F-0013":
        "runtime_hold_RV0007_requires_separate_runtime_and_deployment_authorization",
      otherRc09Findings: "unchanged_pending_independent_revalidation",
    },
    riskBoundary: {
      category: "low_risk_state_only_read_only_revalidation",
      approvalStatus: "approved",
      approvalId: APPROVAL_ID,
      requestedBaseSha: BASE_SHA,
      allowedFiles: 4,
      coreFiles: 4,
      contingencyFiles: 0,
    },
  });
}

describe("RC-09 F-0028 read-only revalidation state transition", () => {
  it("closes the existing-fix static partition with one state-only WIP", () => {
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
      findingIds: ["F-0028"],
      status: "approved_state_only_revalidation_pending_final_tree_binding",
      branch: "fix/rc-09-organization-training-answer-cas-revalidation",
      baseSha: BASE_SHA,
      riskCategory: "low_risk_state_only_read_only_revalidation",
      approvalStatus: "approved",
      approvalId: APPROVAL_ID,
      previousTaskCloseout: project.currentTask.previousTaskCloseout,
      revalidationEvidence: project.currentTask.revalidationEvidence,
      nextTask: project.currentTask.nextTask,
      jitRevalidation: project.currentTask.jitRevalidation,
    });
  });

  it("binds the exact Kernel-safe four-file contract and preserves residuals", () => {
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
    expect(safety.allowedFiles).toEqual([
      "docs/04-agent-system/state/project-state.yaml",
      "docs/04-agent-system/state/task-queue.yaml",
      "docs/04-agent-system/state/task-safety.json",
      "tests/unit/p1-rc-09-f0028-read-only-revalidation-state-transition.test.ts",
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
        "tests/unit/p1-rc-09-f0028-read-only-revalidation-state-transition.test.ts",
        "--maxWorkers=1",
      ],
    });
    expect(safety.push).toEqual({ target: "origin/master" });
    expect(safety.conditionalCloseout).toEqual({
      approved: true,
      approvalId: APPROVAL_ID,
    });
    expect(safety.jitRevalidation["F-0125"]).toBe(
      "independent_pending_read_only_revalidation",
    );
    expect(safety.jitRevalidation["F-0013"]).toContain("runtime_hold_RV0007");
  });

  it("proves the production facade uses only transactional answer gateways", () => {
    const repositorySource = readFileSync(
      "src/server/repositories/organization-training-repository.ts",
      "utf8",
    );
    const draftFacadeStart = repositorySource.indexOf(
      "async saveEmployeeAnswerDraft(input)",
    );
    const submitFacadeStart = repositorySource.indexOf(
      "async submitEmployeeAnswer(input)",
      draftFacadeStart,
    );
    const facadeEnd = repositorySource.indexOf(
      "async takeDownVersion(input)",
      submitFacadeStart,
    );
    const draftFacade = repositorySource.slice(
      draftFacadeStart,
      submitFacadeStart,
    );
    const submitFacade = repositorySource.slice(submitFacadeStart, facadeEnd);

    expect(draftFacadeStart).toBeGreaterThan(0);
    expect(submitFacadeStart).toBeGreaterThan(draftFacadeStart);
    expect(facadeEnd).toBeGreaterThan(submitFacadeStart);
    expect(draftFacade).toContain("saveEmployeeAnswerDraftTransaction");
    expect(submitFacade).toContain("submitEmployeeAnswerTransaction");
    expect(draftFacade).not.toContain("upsertEmployeeAnswerDraft(");
    expect(submitFacade).not.toContain("upsertEmployeeAnswerSubmission(");
    expect(draftFacade).toContain("answer draft transaction unavailable");
    expect(submitFacade).toContain("answer submit transaction unavailable");
    expect(
      repositorySource.match(/\bupsertEmployeeAnswerDraft\(/g),
    ).toHaveLength(2);
    expect(
      repositorySource.match(/\bupsertEmployeeAnswerSubmission\(/g),
    ).toHaveLength(2);
    expect(
      repositorySource.match(/pg_advisory_xact_lock/g)?.length,
    ).toBeGreaterThanOrEqual(2);
    expect(repositorySource).toContain('.for("update")');
    expect(repositorySource).toContain(
      'organization_training_answer_status !== "in_progress"',
    );
  });
});
