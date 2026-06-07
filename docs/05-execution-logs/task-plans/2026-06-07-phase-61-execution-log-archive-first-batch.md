# Phase 61 Execution Log Archive First Batch Task Plan

**Task id:** `phase-61-execution-log-archive-first-batch`

**Date:** 2026-06-07

## Scope

Docs-only execution-log archive/index first batch. This task moves old task plan Markdown files only and creates the first `execution-log-index.yaml`.

## Read Gates

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-60-execution-log-archive-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-60-execution-log-archive-governance.md`

## Archive Batch Definition

Move task plan files under `docs/05-execution-logs/task-plans/` when all are true:

- filename date is between `2026-05-14` and `2026-05-24`;
- file is not directly referenced by an active `task-queue.yaml` row as an exact single-file path;
- file remains within repository docs execution-log scope;
- target path is `docs/05-execution-logs/archive/2026-05/task-plans/<same-file-name>`.

Expected first batch size from readonly inventory: 151 task plan files.

## Allowed Files

- `docs/05-execution-logs/task-plans/*.md` for the selected old task plans only.
- `docs/05-execution-logs/archive/2026-05/task-plans/*.md` for moved task plan targets only.
- `docs/05-execution-logs/execution-log-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-61-execution-log-archive-first-batch.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-61-execution-log-archive-first-batch.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-61-execution-log-archive-first-batch.md`

## Blocked Scope

- Moving evidence, audit review, handoff, acceptance, source, test, script, schema, migration, package, lockfile, dependency, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service files.
- Editing moved task plan Markdown content.
- Changing task evidencePath values.
- Cost Calibration Gate execution or automation mode transition.

## Validation Plan

- Verify source paths no longer exist and archive target paths exist.
- Verify every moved file has one `execution-log-index.yaml` entry.
- Verify active queue exact task-plan references that existed at task start still exist; pre-existing missing legacy references must be reported rather than attributed to this archive batch.
- Verify `execution-log-index.yaml` parses and uses the approved shape.
- Run `git diff --check`.
- Run scoped Prettier check for touched state/index/evidence/audit files.
- Run `Test-AgentSystemReadiness.ps1`.
- Run `Test-GitCompletionReadiness.ps1 -BaseBranch master`.

## Expected Outcome

Phase 61 should reduce the active task plan directory by 151 old files while keeping evidence and audit review paths stable. Future recovery should use `execution-log-index.yaml` only when an archived task plan is needed.
