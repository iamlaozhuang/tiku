# Advanced organization analytics employee statistics Postgres runtime wiring TDD seeding plan

## Task

- Task id: `advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding`
- Branch: `codex/organization-analytics-employee-runtime-seeding`
- Task kind: `implementation_queue_seeding`
- Fresh approval: user approved execution, local validation, local commit, fast-forward merge to `master`, push to `origin/master`, cleanup, and next-work recommendation in the current thread.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-tdd.md`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `src/app/api/v1/organization-analytics/employee-statistics/route.ts`

## Plan

1. Confirm no executable pending or in-progress task exists after the previous readonly recheck.
2. Seed exactly one pending task: `advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd`.
3. Keep this branch docs/state-only: update project state, task queue, task plan, evidence, and audit only.
4. Materialize blocked gates for the pending task: no real database execution, row/private data exposure, public identifier inventories, schema/migration/drizzle, dependencies, provider/model, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate.
5. Run the validation commands declared for this seeding task and record redacted evidence.

## Validation Commands

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding","status: closed","advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd","status: pending","src/app/api/v1/organization-analytics/employee-statistics/route.ts","src/server/services/organization-analytics-route.ts"`
- `powershell.exe -NoProfile -Command "if ((Select-String -Path 'docs/04-agent-system/state/task-queue.yaml' -Pattern '^    status: pending$' | Measure-Object).Count -ne 1) { throw 'Expected exactly one pending task' }"`
- `node_modules/.bin/prettier.cmd --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding.md`
- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd-seeding`

## Stop Conditions

- Any pending/in-progress task exists before seeding.
- Any product source/test edit is needed in this seeding task.
- Any validation command requires blocked gates or sensitive evidence.
