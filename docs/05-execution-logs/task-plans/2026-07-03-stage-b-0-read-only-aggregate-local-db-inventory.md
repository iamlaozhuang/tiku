# 2026-07-03 Stage B-0.1 Read-Only Aggregate Local DB Inventory Plan

## Task

- Task ID: `stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03`
- Branch: `codex/stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03`
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

## Target And Selector

- Target label: local Docker Compose PostgreSQL service `tiku-postgres`, container `tiku-postgres-dev`.
- Connection method: `docker compose exec -T tiku-postgres psql -U tiku -d tiku`.
- Selector 1: public schema base-table aggregate row counts only.
- Selector 2: task namespace aggregate match counts only for `stage-b`, `local-full-loop`, `credential-backed`,
  `test-owned`, and `source-landing` over text-like public schema columns.

These selectors are explicit enough for read-only inventory. They are not cleanup selectors and do not authorize
mutation.

## Scope

Execute local read-only aggregate DB inventory only. Record table names, aggregate counts, command status, and blocked
or risk categories. Do not output or commit raw rows.

## Forbidden Actions

- No DB write, migration, seed, reset, cleanup, transaction mutation, delete, update, insert, truncate, or DDL.
- No `.env*` content read, print, copy, or commit.
- No credentials, tokens, cookies, sessions, Authorization headers, connection strings, internal ids, PII, plaintext
  `redeem_code`, Provider payloads, Prompt text, raw AI I/O, full content, screenshots, traces, raw DOM, or exports in
  evidence.
- No Provider, staging/prod, deploy, dev server, browser acceptance, Cost Calibration, release readiness, final Pass, or
  production usability claim.

## Planned Commands

- `docker compose ps --format json`
- Read-only public table aggregate count query through `psql`.
- Read-only namespace aggregate count query through `psql`.
- Scoped Prettier check for this task's docs/state files.
- `git diff --check`
- Module Run v2 PreCommit Hardening.
- Module Run v2 PrePush Readiness.

## Stop Conditions

- Docker Compose target is absent, unhealthy, or not the documented local target.
- SQL output would include raw row values instead of aggregate counts.
- Selector cannot be kept to table/category/pattern counts.
- Query requires `.env*`, Provider, staging/prod, browser, dev server, seed, migration, or mutation.

## Execution Outcome

- Target and selector were explicit enough to proceed with read-only aggregate inventory.
- Public schema base-table aggregate counts were captured.
- Namespace aggregate count scan returned no matches for the approved task namespace patterns over the selected safe
  text-like columns.
- Stage B DB-backed acceptance was not started.
