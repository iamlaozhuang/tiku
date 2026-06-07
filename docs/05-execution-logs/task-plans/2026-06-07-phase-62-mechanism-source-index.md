# Phase 62 Mechanism Source Index Task Plan

**Task id:** `phase-62-mechanism-source-index`

**Date:** 2026-06-07

## Scope

Docs-only consolidation of mechanism source-of-truth entry points. This task creates a lightweight index for recovery and updates project state and task queue.

## Read Gates

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/execution-log-index.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-61-execution-log-archive-first-batch.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-61-execution-log-archive-first-batch.md`

## Allowed Files

- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-62-mechanism-source-index.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-62-mechanism-source-index.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-62-mechanism-source-index.md`

## Blocked Scope

- Moving or deleting files.
- Changing SOP content.
- Product code, tests, scripts, dependencies, package files, lockfiles, schema, migrations, env/secret files.
- Provider cost measurement, real provider calls, staging/prod/cloud/deploy, payment, external-service actions.
- Cost Calibration Gate execution, code-stage queue seeding, or automation mode transition.

## Index Approach

The index should list:

- canonical state files;
- archive and history indexes;
- execution-log indexes;
- SOP entry points grouped by lifecycle area;
- blocked gate registry and gate ids;
- recovery read order;
- forbidden scope reminders;
- project terminology anchors: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`.

## Validation Plan

- YAML parse check for the new index, project state, and task queue.
- Path existence check for every path listed in the new index.
- Anchor checks for blocked gates and required terminology.
- `git diff --check`.
- Scoped Prettier check.
- Agent-system readiness.
- Git completion readiness inventory.

## Expected Outcome

Phase 62 should reduce recovery ambiguity by giving future threads one compact map of mechanism facts without replacing the underlying SOPs, state files, evidence, or audit reviews.
