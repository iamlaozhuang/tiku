# Advanced organization analytics dashboard summary Postgres runtime wiring TDD

## Scope

- Task: `advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-tdd`.
- Branch: `codex/organization-analytics-postgres-runtime-wiring-tdd`.
- Approved closeout in current thread: local commit, fast-forward merge to `master`, push `origin/master`, merged branch cleanup, fetch prune.

## Required context read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Existing route/runtime/repository-focused files named by the task queue.

## Boundaries

- Allowed source edits only:
  - `src/app/api/v1/organization-analytics/dashboard-summary/route.ts`
  - `src/server/services/organization-analytics-route.ts`
  - `src/server/services/organization-analytics-route.test.ts`
- No `.env*` read/output/edit.
- No real database connection or row/private data output.
- No schema/migration/drizzle/package/lockfile/dependency/provider/e2e/browser/dev-server/staging/prod/cloud/deploy/payment/external-service/PR/force-push work.

## TDD plan

1. Add a focused failing route-runtime test that proves the dashboard summary runtime can be composed from injected fake `RuntimeDatabase`, fake session service, typed Postgres organization analytics source readers, and a deterministic timestamp source.
2. Keep the App Router entrypoint import-safe and assert it exports a runtime GET handler without executing real runtime dependencies.
3. Implement the smallest service-route runtime wiring:
   - lazy/injected runtime database boundary;
   - typed Postgres gateway source readers;
   - repository factory;
   - session-backed admin context resolver;
   - deterministic timestamp injection with runtime default.
4. Preserve aggregate-only response behavior by keeping all raw source rows inside repository/service internals and mapping only aggregate DTOs.
5. Write redacted evidence and audit notes, then run the task-declared validation commands.

## Risk controls

- Tests must use synthetic in-memory fakes only and avoid real DB/env/session runtime execution.
- Evidence must record command status and high-level outcomes only.
- If runtime wiring requires broader authorization, schema, repository, or business-layer changes outside allowed files, stop and report.
