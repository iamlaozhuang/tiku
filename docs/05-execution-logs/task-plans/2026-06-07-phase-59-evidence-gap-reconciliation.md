# Phase 59 Evidence Gap Reconciliation Task Plan

**Task id:** `phase-59-evidence-gap-reconciliation`

**Date:** 2026-06-07

## Scope

Docs-only reconciliation for retained historical task queue rows whose `evidencePath` was missing after Phase 58 archive execution.

## Read Gates

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-05.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-58-task-queue-archive-execution.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-05.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-59-evidence-gap-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-59-evidence-gap-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-59-evidence-gap-reconciliation.md`

## Blocked Scope

- Product code, tests, scripts, dependencies, package files, lockfiles, schema, migrations, env/secret files.
- Provider cost measurement, real provider calls, staging/prod/cloud/deploy, payment, external-service actions.
- Fabricating evidence or treating a merely similar document as confirmed evidence.

## Reconciliation Rules

1. A missing `evidencePath` may be replaced only when an existing evidence file clearly represents the same task, a renamed implementation task, or a direct batch successor.
2. A `closureEvidencePath` may remain as closeout evidence, but it must not be used to replace original task evidence unless the queue row is explicitly a closeout/governance row.
3. Rows with safe replacements may be archived in the proper monthly archive and indexed in `task-history-index.yaml`.
4. Rows without a safe replacement stay active with the missing `evidencePath` unchanged and are listed as unresolved in the Phase 59 evidence and audit review.
5. Cost Calibration Gate may only be recorded as blocked-gate queue evidence; no provider_cost_measurement or external action is allowed.

## Validation Plan

- Verify every active `evidencePath` that claims to exist either exists or is intentionally listed as unresolved.
- Verify archive task counts match actual task counts.
- Verify every newly archived task has one matching `task-history-index.yaml` entry.
- Verify no duplicate task id exists across active queue and archives.
- Run `git diff --check`.
- Run Prettier check on touched YAML/Markdown files.

## Expected Outcome

Phase 59 should reduce active queue evidence noise by archiving safely reconciled terminal rows, while preserving unresolved historical gaps for explicit follow-up instead of hiding them behind weak matches.
