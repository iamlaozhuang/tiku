# Advanced organization analytics employee statistics Postgres summary input composition seeding plan

## Task

- Task id: `advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding`
- Branch: `codex/organization-analytics-employee-summary-input-seeding`
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
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-employee-statistics-postgres-runtime-wiring-tdd.md`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/repositories/organization-analytics-repository.test.ts`

## Plan

1. Confirm the task queue has zero pending tasks after the employee statistics runtime wiring task closed.
2. Seed exactly one pending task: `advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-tdd`.
3. Keep this branch docs/state-only: update project state, task queue, this task plan, evidence, and audit only.
4. Scope the pending task to repository-level TDD for employee statistics Postgres summary input composition.
5. Preserve blocked gates: no product implementation in this seeding task, no real database execution, no row/private data exposure, no public identifier inventories, no schema/migration/drizzle, no dependency/package/lockfile changes, no provider/model, no browser/e2e/dev-server, no staging/prod/cloud/deploy/payment/external-service, no PR, no force push, and no Cost Calibration Gate.
6. Run the validation commands declared for this seeding task and record redacted evidence.

## Validation Commands

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding","status: closed","advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-tdd","status: pending","src/server/repositories/organization-analytics-repository.ts","src/server/repositories/organization-analytics-repository.test.ts"`
- `powershell.exe -NoProfile -Command "if ((Select-String -Path 'docs/04-agent-system/state/task-queue.yaml' -Pattern '^    status: pending$' | Measure-Object).Count -ne 1) { throw 'Expected exactly one pending task' }"`
- `node_modules/.bin/prettier.cmd --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding.md docs/05-execution-logs/evidence/2026-06-17-advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding.md docs/05-execution-logs/audits-reviews/2026-06-17-advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding.md`
- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-seeding`

## Stop Conditions

- Any pending task exists before seeding.
- Any product source/test edit is needed in this seeding task.
- Any validation command requires blocked gates or sensitive evidence.
