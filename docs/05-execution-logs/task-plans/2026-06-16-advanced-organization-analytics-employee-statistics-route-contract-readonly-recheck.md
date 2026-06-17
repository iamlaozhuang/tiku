# Advanced organization analytics employee statistics route contract readonly recheck plan

## Task

- Task id: `advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck`
- Branch: `codex/organization-analytics-employee-route-readonly-recheck`
- Task kind: `readonly_recheck`
- Fresh approval: user approved execution, validation, local commit, fast-forward merge to `master`, push to `origin/master`, cleanup, and next-work recommendation in the current thread.

## Read Before Review

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-tdd.md`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `src/app/api/v1/organization-analytics/employee-statistics/route.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/mappers/organization-analytics-mapper.ts`
- `src/server/validators/organization-analytics.ts`

## Review Plan

1. Claim the queued readonly task and materialize the fresh closeout approval in task state.
2. Read the route handler, focused tests, App Router entrypoint, contract, mapper, validator, requirements, and prior evidence/audit.
3. Check import safety: importing the employee statistics App Router `GET` must not require runtime Postgres wiring or a real database connection.
4. Check summary-only response posture: internal visible-scope lists and sensitive detail fields must stay out of route DTO output.
5. Check admin fail-closed behavior: invalid input and unavailable admin context must short-circuit before the reader is invoked.
6. Check blocked gates: no product source/test modifications, runtime wiring, real database, export, UI, schema/drizzle/dependency/provider/e2e/cloud/payment work.
7. Write redacted evidence and audit review.
8. Run every validation command declared by `task-queue.yaml`.

## Boundaries

- Docs/state/evidence/audit updates only.
- Product source/test files are readonly.
- No runtime Postgres wiring, real database execution, row/private data exposure, public identifier inventories, export behavior, UI, schema/migration/drizzle, dependency, provider/model, browser/e2e/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate work.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck`
