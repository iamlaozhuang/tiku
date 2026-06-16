# Task Plan: Advanced Organization Analytics Repository Service Wiring Readonly Recheck

## Task

- Task id: `advanced-organization-analytics-repository-service-wiring-readonly-recheck`
- Branch: `codex/organization-analytics-service-wiring-readonly-recheck`
- Baseline: `master == origin/master == 6bd24043ede1134bee2b0d532f0f8d30c5ebf203`
- User approval: current 2026-06-16 Codex thread says `批准执行`.

## Read Scope

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/services/organization-analytics-service.ts`
- `src/server/services/organization-analytics-service.test.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-repository-service-wiring-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-repository-service-wiring-tdd.md`

## Execution Plan

1. Confirm repository-backed service functions preserve ADR-002 layering: route/runtime/UI stay out of scope, repository injection stays service-only, and pure builders remain reusable.
2. Confirm access checks run before repository summary reads and visible organization scope is resolved before downstream aggregate or summary composition.
3. Confirm dashboard analytics remain aggregate-only, employee statistics remain summary-only, export readiness remains metadata-only, and audit references remain redacted.
4. Write evidence and audit review only; do not modify product source, tests, scripts, schema, migrations, dependencies, package files, lockfiles, env files, provider configuration, route/runtime wiring, UI, mapper, validator, or DB/data-source code.
5. If no blocking issue is found, close the readonly recheck without seeding implementation beyond the queue's next governed boundary.

## Blocked Gates

- No `.env*` read, output, summary, or edit.
- No implementation, repository implementation change, mapper, validator, route, UI, runtime wiring, direct DB access, row/private data exposure, schema/migration, provider/model call, dependency change, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate work.
- No `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package, lockfile, or env changes.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-service.test.ts"`
- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-readonly-recheck`
