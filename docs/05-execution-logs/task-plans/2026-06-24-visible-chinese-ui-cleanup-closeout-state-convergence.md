# Task Plan: visible-chinese-ui-cleanup-closeout-state-convergence-2026-06-24

## Metadata

- Task id: `visible-chinese-ui-cleanup-closeout-state-convergence-2026-06-24`.
- Branch: `codex/visible-ui-closeout-state-convergence-20260624`.
- Task kind: `docs_state_convergence`.
- Execution profile: `docs_state_queue_closeout_reality_convergence_no_runtime`.
- Approval consumed: current user approved serial execution, closeout, cleanup, and next-task advancement on 2026-06-24.
- Runtime validation: not approved for this task.
- Final Pass claim: none.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- The source task `visible-chinese-ui-technical-label-cleanup-2026-06-24` addressed `GAP-UI-01` from the post-repair
  gap refresh.
- The role-separated MVP alignment still requires later learner AI and enterprise training entry repair for learner and
  employee roles.
- This task records closeout reality only. It does not introduce, remove, or reinterpret product requirements.

## Requirement Mapping

- The task maps to governance/state accuracy: the durable queue and state files must match the completed Git closeout
  facts for the visible Chinese UI cleanup task.
- The task preserves the existing no-final-Pass boundary because the UI cleanup task had no browser/runtime acceptance
  rerun.

## Role Mapping Result

- All eight role-separated rows remain tracked through the role matrix.
- No role row is converted to runtime Pass by this state-only task.
- The next serial task remains focused on learner and employee entry gaps for `personal_standard_student`,
  `personal_advanced_student`, `org_standard_employee`, and `org_advanced_employee`.

## Acceptance Mapping Result

- Expected acceptance for this task is state convergence, not product behavior.
- The source closeout facts to record are:
  - final `master`: `e7d90d575aa9dcecdba8ce89b114c6a68040fce3`;
  - final `origin/master`: `e7d90d575aa9dcecdba8ce89b114c6a68040fce3`;
  - local short branch removed;
  - remote short branch absent;
  - `master...origin/master` aligned.
- Standard/advanced MVP final Pass remains blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- `docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- Git facts observed locally after the completed closeout.

## Conflict Check

- No requirement conflict found. The only drift is between Git closeout reality and durable state/queue closeout fields.
- Per the task lifecycle SOP, this is a valid state convergence task because it records completed merge, push, cleanup,
  final SHA, and next recommended task without changing product behavior.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md`.
- `docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md`.

## Blocked Files And Actions

- Blocked files: `.env*`, package and lock files, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`,
  `scripts/**`, browser artifacts, build artifacts, and local private credential paths.
- Blocked actions: product source or test changes, browser/runtime observation, dev server start, credential or account
  actions, database read/write/migration, dependency changes, Provider/model/cost work, staging/prod/cloud/deploy,
  payment/external service, PR/force-push, Cost Calibration Gate, and final Pass claim.

## Implementation Approach

1. Update `project-state.yaml` with the current task, repository closeout checkpoint, and source UI cleanup task
   closeout facts.
2. Update `task-queue.yaml` to close the source UI cleanup task and add this state convergence task.
3. Create evidence and audit review with closeout facts, mapping result, changed-file inventory, validation results,
   blocked remainder, and next task.
4. Run scoped formatting, diff, and Module Run v2 hardening.
5. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch under the user's serial
   completion approval.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-cleanup-closeout-state-convergence.md`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId visible-chinese-ui-cleanup-closeout-state-convergence-2026-06-24`.
