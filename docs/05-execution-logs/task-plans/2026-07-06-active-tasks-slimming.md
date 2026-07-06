# 2026-07-06 Active Tasks Slimming

## Scope

Archive an exact first batch of 10 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Batch

- ai-generation-closed-loop-target-alignment-2026-07-05
- org-auth-ui-empty-state-contract-cleanup-2026-07-05
- paper-legacy-alias-inventory-cleanup-2026-07-05
- admin-permission-session-contract-cleanup-2026-07-05
- personal-ai-generation-generation-parameters-null-contract-2026-07-05
- organization-ai-training-auth-lineage-2026-07-05
- content-ai-formal-draft-adoption-ui-loop-2026-07-05
- ai-paper-learning-session-ui-loop-2026-07-05
- ai-question-learning-session-ui-loop-2026-07-05
- ai-generation-learning-session-loop-2026-07-05

## Guardrails

- Do not change product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, or Cost Calibration state.
- Do not delete evidence or audit files.
- Preserve moved task blocks without semantic edits.
- Keep `activeTasks:` as recovery window and move only exact closed `tasks:` blocks.
- Keep blocked and ready_for_closeout tasks in the active queue.
- Validate archive/index lookup and active dependency resolution before commit.

## Closeout

Fresh user approval in this turn allows local commit, fast-forward merge to `master`, push to `origin/master`, and short branch cleanup for each batch.
