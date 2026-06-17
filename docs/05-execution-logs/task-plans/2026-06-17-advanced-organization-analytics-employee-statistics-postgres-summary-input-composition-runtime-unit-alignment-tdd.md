# Advanced organization analytics employee statistics Postgres summary input composition runtime unit alignment TDD plan

## Task

- Task id: `advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-tdd`
- Branch: `codex/organization-analytics-employee-runtime-unit-alignment`
- Fresh approval: user approved local execution, validation, local commit, fast-forward merge to `master`, push to `origin/master`, merged branch cleanup, and next-work recommendation in the current thread on 2026-06-17.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Prior runtime wiring and summary input composition evidence/audits named by this task.

## Scope

Allowed implementation surface is limited to the focused organization analytics route/repository runtime unit boundary declared by the task queue. The intended outcome is to align the local route unit test boundary with the Postgres source reader contract that now provides summary-only employee source rows.

## TDD Plan

1. Reproduce the current focused route unit RED with `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`.
2. Inspect the existing route runtime unit, repository source reader, and focused repository unit around visible organization scope and training answer source rows.
3. Make the smallest allowed test or runtime-boundary change so the injected runtime database rows match the typed source reader contract without exposing row/private data or answer detail fields.
4. Confirm the focused route unit and repository unit pass.
5. Write redacted evidence and audit notes, then run the task queue validation commands.

## Boundary Controls

- No real database connection or database command execution.
- No App Router entrypoint, UI, schema, migration, drizzle, dependency, package, lockfile, provider, browser, e2e, deploy, payment, external-service, quota, or cost work.
- No output of secrets, credentials, raw provider data, raw prompts/answers, public identifier inventories, row/private data, answer detail, question text, standard answer, analysis, item-level correctness, or mistake detail.
- If the RED requires broader runtime wiring or schema behavior changes, stop and report rather than expanding scope.

## Risk Defense

- Prefer test-boundary alignment if production repository behavior is already covered by focused units.
- Preserve aggregate-only and summary-only redaction assertions.
- Keep validation evidence at command/result granularity only.
