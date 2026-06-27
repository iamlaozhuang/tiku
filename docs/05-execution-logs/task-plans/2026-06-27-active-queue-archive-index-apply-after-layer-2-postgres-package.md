# Active Queue Archive Index Apply After Layer 2 Postgres Package

## Task

- taskId: `active-queue-archive-index-apply-after-layer-2-postgres-package-2026-06-27`
- branch: `codex/active-queue-archive-index-apply-20260627`
- task kind: docs/state archive-index apply
- approval: `current_user_fresh_unattended_serial_high_risk_package_2026_06_27`

## Scope

This task may move only the registered candidate task blocks from
`docs/04-agent-system/state/task-queue.yaml` into
`docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`, and may update
`docs/04-agent-system/state/task-history-index.yaml`.

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- this task plan
- this task evidence
- this task audit/review
- this task acceptance

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`

## Implementation Plan

1. Extract the registered `archiveIndexApply.candidateTaskIds` from the current task.
2. Verify all candidate IDs exist in the active queue and the candidate count is within `maxRegisteredTaskBlockMoves`.
3. Move only those candidate blocks to the June archive file, converting queue indentation to archive indentation.
4. Update the archive header count and timestamp.
5. Append one history index entry per moved task.
6. Update the current task block as closed and register the next final evidence review task.
7. Update project state, evidence, audit/review, and acceptance.
8. Run scoped Prettier, `git diff --check`, queue slimming diagnostic, project status, pre-commit hardening, module
   closeout readiness, and pre-push readiness.

## Hard Stops

Stop and write blocked evidence if any step requires:

- moving an unregistered task block
- moving more than the registered cap
- deleting evidence or source
- `.env*` read/write or credential access
- source/test/e2e/schema/migration/seed/package/lockfile changes
- DB, browser, Provider, Cost Calibration, runtime mutation, staging/prod/deploy/payment/OCR/export execution
- release readiness or final Pass claim

## Expected Outcome

The active queue retains only live follow-up tasks and explicitly blocked tasks, the moved records are present in the
June archive, the task history index points to the archive path, and the next task is the final evidence review.
