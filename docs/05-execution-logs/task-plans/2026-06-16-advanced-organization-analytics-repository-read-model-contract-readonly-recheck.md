# Task Plan: Advanced Organization Analytics Repository Read Model Contract Readonly Recheck

## Task

- Task id: `advanced-organization-analytics-repository-read-model-contract-readonly-recheck`
- Branch: `codex/organization-analytics-repository-contract-recheck`
- Baseline: `master == origin/master == 75e25a2c586d5d308b4074f0fc9b3254159258cf`
- User approval: current 2026-06-16 Codex thread says `批准执行`.

## Read Scope

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-repository-read-model-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-repository-read-model-contract-tdd.md`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/repositories/organization-analytics-repository.test.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`
- `src/server/services/organization-analytics-service.ts`

## Execution Plan

1. Reconfirm the repository contract uses an injected gateway and does not import schema, runtime DB, Drizzle, or a Postgres adapter.
2. Reconfirm repository outputs stay summary-only and copy arrays or nested snapshots before return.
3. Reconfirm tests cover invalid scope short-circuiting, summary-only formal/quota/export rows, and gateway-only detail stripping.
4. Write evidence and audit review only; do not modify product source, tests, scripts, schema, dependencies, env files, or runtime wiring.
5. Seed one conservative next readonly audit for service wiring boundary before any implementation resumes.

## Blocked Gates

- No `.env*` read, output, summary, or edit.
- No DB access, row/private data access, schema/migration, runtime adapter, Drizzle query, provider/model call, dependency change, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate work.
- No `src/**`, `tests/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package, or lockfile changes.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-repository-read-model-contract-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-repository-read-model-contract-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-repository-read-model-contract-readonly-recheck`
