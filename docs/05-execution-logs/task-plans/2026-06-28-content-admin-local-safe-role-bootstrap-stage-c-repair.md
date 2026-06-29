# Content Admin Local Safe Role Bootstrap Stage C Repair Plan

## Task

- Task id: `content-admin-local-safe-role-bootstrap-stage-c-repair-2026-06-28`
- Branch: `codex/content-admin-safe-role-bootstrap-20260628`
- Goal alignment: remove the local `content_admin` session prerequisite blocker so later acceptance can rerun the two
  content AI rows from the owner-facing checklist.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-unit-baseline-current-recheck-and-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-content-admin-test-owned-account-stage-b-repair.md`

## Durable User Notes Materialized

- All test-owned role account materials are unified in
  `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`; this task records the path only and
  does not read or output account contents.
- Multiple roles have `AI出题` and `AI组卷`; future AI generation repair tasks must reuse existing AI generation code,
  contracts, services, and UI patterns wherever feasible instead of duplicating role-specific implementations.
- This task does not implement AI generation behavior; it only addresses the local safe role bootstrap prerequisite.

## Materialized Boundary

Allowed source/test files:

- `src/server/auth/local-session-runtime.ts`
- `src/server/contracts/local-acceptance-session-contract.ts`
- `src/server/services/local-acceptance-session-service.ts`
- `src/app/api/v1/local-acceptance-sessions/route.ts`
- `tests/unit/local-acceptance-session-bootstrap.test.ts`

Allowed governance/evidence files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`

Blocked actions:

- Browser/dev-server/e2e runtime in this task.
- DB connection, direct DB write, schema, migration, seed, destructive operation, raw row evidence.
- Provider execution/configuration/credentials, prompts, raw AI input/output.
- Package or lockfile changes.
- Env/secret/account-material reads.
- Screenshots, traces, raw DOM evidence, credentials, cookies, sessions, localStorage, tokens, Authorization headers.
- Staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Execution Steps

1. Inspect the existing local session/auth runtime and related route patterns.
2. Write a focused failing unit test for a safe local/dev/test `content_admin` bootstrap contract.
3. Implement the smallest route/service/runtime contract that is disabled outside local/dev/test and does not persist
   accounts or touch DB.
4. Run focused unit, full unit, lint, typecheck, formatting, diff, and Module Run v2 gates.
5. Record redacted evidence and acceptance result.
6. Commit, fast-forward merge to `master`, push `origin/master`, and clean up the short branch if gates pass.

## Completion Rule

This task is complete only if it either provides unit-proven local safe `content_admin` bootstrap support or records a
smaller verified blocker. It does not complete the two content AI owner-facing checklist rows.
