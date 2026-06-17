# Advanced organization analytics employee statistics Postgres runtime wiring TDD

## Scope

- Task: `advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd`.
- Branch: `codex/organization-analytics-employee-runtime-wiring-tdd`.
- Fresh approval in current thread: task execution, local commit, fast-forward merge to `master`, push to `origin/master`, merged branch cleanup, and fetch prune after successful validation.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Current organization analytics route service, focused route tests, repository factory/runtime boundary, and employee App Router route files named by the task queue.

## Boundaries

- Allowed source edits only:
  - `src/server/services/organization-analytics-route.ts`
  - `src/server/services/organization-analytics-route.test.ts`
  - `src/app/api/v1/organization-analytics/employee-statistics/route.ts`
- Allowed governance edits only:
  - task state and queue fields for this task;
  - this task plan, evidence, and audit review.
- No real database connection, row/private data exposure, provider/model call, dependency change, schema/migration/drizzle change, route/UI expansion, development server, browser/e2e execution, deployment, payment, external-service, PR, force push, or cost/quota calibration work.

## TDD Plan

1. Read the existing repository/runtime route pattern and focused route tests.
2. Add a failing focused unit test proving employee statistics runtime handlers use the existing typed Postgres organization analytics source readers through an injected fake runtime database and fake session context.
3. Add a failing import-safety assertion for the employee App Router route so it exports the runtime-wired handler without executing real runtime dependencies at import time.
4. Implement the smallest route-service wiring:
   - repository-backed employee statistics reader;
   - lazy/injected runtime database boundary;
   - existing Postgres organization analytics repository factory;
   - session-backed admin context resolver;
   - deterministic timestamp injection for tests with runtime default.
5. Keep invalid query handling and fail-closed admin context behavior unchanged.
6. Preserve summary-only DTO output; source rows and internal visible-scope lists stay inside repository/service internals.
7. Write redacted evidence and audit notes, then run every validation command declared by the task queue.

## Risk Controls

- Tests use synthetic in-memory fakes only.
- Evidence records commands and high-level outcomes only.
- Stop if implementation requires files outside the allowed list or any blocked capability.
