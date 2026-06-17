# Advanced organization analytics employee statistics route contract TDD plan

## Task

- Task id: `advanced-organization-analytics-employee-statistics-route-contract-tdd`
- Branch: `codex/organization-analytics-employee-statistics-route`
- Fresh approval: user approved execution, validation, local commit, fast-forward merge to `master`, push to `origin/master`, cleanup, and next-work recommendation in the current thread.
- Scope: narrow TDD route-contract slice for organization analytics employee statistics summary.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `src/app/api/v1/organization-analytics/employee-statistics/route.ts`

## Implementation Plan

1. Confirm the task is the only pending task and claim it on a short-lived branch.
2. Read the current organization analytics route service, focused unit tests, contract, mapper, validator, and thin App Router patterns.
3. RED: add focused failing tests for employee statistics route-contract behavior without runtime Postgres wiring or database execution.
4. GREEN: implement minimal injectable route handler contract logic and a thin App Router entrypoint only if required by the tests.
5. Refactor only inside the allowed route/service surfaces.
6. Write redacted evidence and audit review.
7. Run every validation command declared by `task-queue.yaml`.
8. Commit, fast-forward merge, push, and clean up only after validation and Module Run v2 gates pass.

## Boundaries

- No runtime Postgres wiring.
- No real database connection or row/private data exposure.
- No repository/model/contract/mapper/validator business contract changes.
- No export behavior, UI, schema/migration/drizzle, dependency, provider/model, browser/e2e/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate work.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-tdd`
