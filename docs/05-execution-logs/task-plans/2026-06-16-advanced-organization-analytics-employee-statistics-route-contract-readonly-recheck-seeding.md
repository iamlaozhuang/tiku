# Advanced organization analytics employee statistics route contract readonly recheck seeding plan

## Task

- Task id: `advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding`
- Branch: `codex/organization-analytics-employee-route-recheck-seeding`
- Task kind: `queue_seeding`
- Fresh approval: user approved execution, validation, local commit, fast-forward merge to `master`, push to `origin/master`, cleanup, and next-work recommendation in the current thread.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-tdd.md`

## Seeding Decision

- Seed exactly one pending task: `advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck`.
- Rationale: the employee statistics route contract has landed, so the next low-risk step is a fresh-baseline readonly recheck of import safety, summary-only redaction, admin fail-closed behavior, and blocked gate preservation before runtime wiring is considered.

## Boundaries

- Docs/state-only changes for this seeding task.
- No product source/test implementation in this task.
- No runtime Postgres wiring, real database execution, row/private data exposure, public identifier inventories, export behavior, UI, schema/migration/drizzle, dependency, provider/model, browser/e2e/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate work.

## Validation Commands

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding","status: closed","advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck","status: pending"`
- `powershell.exe -NoProfile -Command "if ((Select-String -Path 'docs/04-agent-system/state/task-queue.yaml' -Pattern '^    status: pending$' | Measure-Object).Count -ne 1) { throw 'Expected exactly one pending task' }"`
- `node_modules/.bin/prettier.cmd --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding.md`
- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-route-contract-readonly-recheck-seeding`
