# Advanced organization analytics dashboard summary Postgres runtime wiring readonly recheck plan

## Task

- Task id: `advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-readonly-recheck`
- Branch: `codex/organization-analytics-runtime-readonly-recheck`
- Task kind: readonly recheck.
- Fresh approval: user approved execution, validation, local commit, fast-forward merge to `master`, push to `origin/master`, cleanup, and next-work recommendation in the current thread.

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Prior runtime wiring evidence and audit for the dependency chain.
- Queue-declared readonly source and test files for the dashboard summary runtime boundary.

## Scope

- Review App Router import safety and layering for the dashboard summary route.
- Review aggregate-only response mapping and redaction posture.
- Review that blocked gates remain blocked after the runtime wiring task closed.
- Write plan, evidence, audit, and required durable state/queue status only.

## Boundaries

- No product source or test edits.
- No real database access or database connection execution.
- No row/private data, public identifier inventories, provider payloads, raw prompts, raw answers, secrets, tokens, cookies, Authorization headers, or database URLs in evidence.
- No `.env*`, schema/migration/drizzle, package/lockfile/dependency, provider/model, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate work.

## Validation

Run the task-declared commands:

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-readonly-recheck`

## Expected Closeout

- Record readonly findings and residual risks in evidence.
- Keep exactly one focused task commit.
- Fast-forward merge to `master`, push `origin/master`, delete merged short branch, and fetch prune after all gates pass.
