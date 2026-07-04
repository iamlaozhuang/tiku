# 2026-07-03 Stage B Test-Owned Account DB Target Alignment Plan

## Task

- Task ID: `stage-b-test-owned-account-db-target-alignment-2026-07-03`
- Branch: `codex/stage-b-test-owned-account-db-target-alignment-2026-07-03`
- Status: completed read-only alignment

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
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-0-3-redacted-fixture-preflight.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-0-3-redacted-fixture-preflight.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-0-3-redacted-fixture-preflight.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-test-owned-fixture-provisioning-repair-approval-package.md`

## Scope

Read-only alignment to answer two questions before any provisioning:

1. Is the app currently using the same local DB target as Stage B-0.3 preflight?
2. Do the 8 private fixture role selectors correspond to login-capable principals in the app DB target?

## Boundaries

- No DB write, cleanup, reset, seed, migration, DDL, provisioning, or repair.
- No login execution and no new `auth_session`.
- No browser automation, screenshot, trace, raw DOM, cookie, localStorage, or Authorization header access.
- No Provider, staging/prod, deploy, Cost Calibration, source/test/dependency/schema/package/lockfile change.
- No credential, login identifier, env value, connection string, raw DB row, internal id, phone/email, token, plaintext
  `redeem_code`, prompt, AI I/O, or full content in evidence.

## Execution Summary

### DB Target Alignment

| Item                                | Redacted observed label                |
| ----------------------------------- | -------------------------------------- |
| App runtime process                 | local `node.exe` serving port `3000`   |
| Runtime DB config source            | `.env.local` via `DATABASE_URL` loader |
| App DB host/port label              | `localhost:5432`                       |
| App DB name label                   | `tiku_fresh_phase25_20260601_001`      |
| Docker Compose DB service port      | `127.0.0.1:5432`                       |
| Stage B-0.3 preflight DB name label | `tiku`                                 |
| Target aligned?                     | no, database name differs              |

### Selector Alignment

The 8 private fixture role selectors all match a principal in the app DB target, so the fixture is not missing from the
currently running app's local database. The earlier Stage B-0.3 `0` match result was caused by querying the wrong
database name.

### Role Shape Alignment

Only `ops_admin` currently satisfies the precise Stage B expected role shape in the app DB target. The other 7 selectors
match principals, but their observed role/authorization shape differs from the Stage B fixture expectation.

## Decision

Do not run provisioning yet.

Next task should choose between:

- correcting Stage B-0.3 to use the app DB target and then addressing the 7 role shape mismatches; or
- replacing/repairing the private fixture selector mapping; or
- approving a non-destructive local provisioning repair only for the mismatched shapes.
