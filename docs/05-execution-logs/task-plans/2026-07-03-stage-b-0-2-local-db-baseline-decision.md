# 2026-07-03 Stage B-0.2 Local DB Baseline Decision Plan

## Task

- Task ID: `stage-b-0-2-local-db-baseline-decision-2026-07-03`
- Branch: `codex/stage-b-0-2-local-db-baseline-decision-2026-07-03`
- Status: completed

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-0-local-data-baseline-cleanup-decision-package.md`
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-0-local-data-baseline-cleanup-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-0-local-data-baseline-cleanup-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-0-read-only-aggregate-local-db-inventory.md`
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-0-read-only-aggregate-local-db-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-0-read-only-aggregate-local-db-inventory.md`

## Inputs

| Input                          | Recorded fact                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Stage B-0 cleanup decision     | Wholesale cleanup was rejected; cleanup/reset requires exact target, selector, dry run, rollback, redaction, and fresh approval. |
| Stage B-0.1 inventory          | Local Docker Compose PostgreSQL target was explicit and healthy.                                                                 |
| Stage B-0.1 aggregate counts   | Public schema is non-empty across learner, authorization, audit, paper, and practice tables.                                     |
| Stage B-0.1 namespace selector | Approved namespace patterns returned 0 aggregate matches over selected safe text-like columns.                                   |

## Decision Question

Decide whether to:

1. accept the current local DB as the DB-backed Stage B acceptance baseline, with explicit constraints; or
2. request a separate cleanup/reset approval with a precise selector before any DB-backed Stage B acceptance.

## Boundary

- This task is docs/state/queue only.
- No DB connection, query, mutation, cleanup, reset, seed, migration, or DDL.
- No `.env*` read, credential read, Provider, staging/prod, deploy, browser acceptance, e2e execution, or Cost Calibration.
- No product source, test, schema, dependency, package, lockfile, or config edits.
- No release readiness, final Pass, or production usability claim.

## Planned Artifacts

- Decision package.
- Redacted evidence.
- Adversarial audit.
- `project-state.yaml` task record.
- `task-queue.yaml` task record.

## Planned Validation

- Scoped Prettier check for this task's docs/state files.
- `git diff --check`.
- Module Run v2 PreCommit Hardening.
- Module Run v2 PrePush Readiness.

## Execution Outcome

- Decision package prepared.
- Current local DB baseline accepted for later DB-backed Stage B work with fixture preflight constraints.
- Cleanup/reset approval is not requested now because no precise task-owned selector is available.
- DB-backed Stage B acceptance was not started.
