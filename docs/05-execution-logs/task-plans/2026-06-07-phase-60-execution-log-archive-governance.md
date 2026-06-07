# Phase 60 Execution Log Archive Governance Task Plan

**Task id:** `phase-60-execution-log-archive-governance`

**Date:** 2026-06-07

## Scope

Docs-only governance task for execution-log archive and index rules. This task defines the mechanism only; it does not move, delete, or archive execution-log files.

## Read Gates

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-59-evidence-gap-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-59-evidence-gap-reconciliation.md`

## Observed Pressure

- `docs/05-execution-logs/evidence`: 477 Markdown files.
- `docs/05-execution-logs/task-plans`: 459 Markdown files.
- `docs/05-execution-logs/audits-reviews`: 156 Markdown files.
- Existing task queue archive SOP does not define how execution-log files themselves should be archived or indexed.

## Allowed Files

- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-60-execution-log-archive-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-60-execution-log-archive-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-60-execution-log-archive-governance.md`

## Blocked Scope

- Moving, deleting, or archiving execution-log files.
- Creating an execution-log index file in this task.
- Product code, tests, scripts, dependencies, package files, lockfiles, schema, migrations, env/secret files.
- Provider cost measurement, real provider calls, staging/prod/cloud/deploy, payment, external-service actions.
- Cost Calibration Gate execution or automation mode transition.

## Governance Approach

1. Define execution-log file roles and archive layout.
2. Define active-retention, archive eligibility, index shape, and sync rules.
3. Define recovery rules so agents read current logs first and indexed archive entries only on demand.
4. Define stop conditions and forbidden claims.
5. Sync `project-state.yaml` with the new SOP path.
6. Register Phase 60 in `task-queue.yaml`.

## Validation Plan

- `git diff --check`.
- Scoped Prettier check for touched docs/state files.
- `Select-String` checks for required anchors:
  - `execution-log-index`
  - `evidence`
  - `task-plans`
  - `audits-reviews`
  - `handoffs`
  - `Cost Calibration Gate remains blocked`
  - `authorization`
  - `paper`
  - `mock_exam`
  - `redeem_code`
  - `audit_log`
  - `ai_call_log`
- Agent-system readiness.
- Git completion readiness inventory.

## Expected Outcome

Phase 60 should leave a clear SOP that allows Phase 61 to perform the first execution-log archive/index batch without inventing archive rules during execution.
