# Task Plan: Advanced Organization Analytics Repository Service Wiring TDD

## Task

- Task id: `advanced-organization-analytics-repository-service-wiring-tdd`
- Branch: `codex/organization-analytics-service-wiring-tdd`
- Baseline: `HEAD == master == origin/master == a79ff2943d2ee014b9c481a731fe2b18ba9d5c22`
- Scope: service-only TDD wiring. Introduce repository-injected orchestration in `organization-analytics-service` while preserving existing pure builder behavior.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-repository-service-wiring-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-repository-service-wiring-boundary-readonly-audit.md`
- TDD skill instructions

## Implementation Plan

1. Read existing service tests, service, repository contract, model, and contract types.
2. RED: add service tests for repository-injected dashboard, employee statistics, and export-readiness orchestration.
3. Verify RED with `npm.cmd run test:unit -- "src/server/services/organization-analytics-service.test.ts"`.
4. GREEN: add minimal service-layer functions/types to consume `OrganizationAnalyticsRepository` without touching repository implementation, mapper, validator, route, UI, schema, DB, or runtime adapter.
5. Verify GREEN and run declared validation commands.
6. Record redacted evidence/audit and close out through the approved local commit/merge/push policy.

## Blocked Gates

- No `.env*` read/output/summary/modification.
- No direct DB access, row/private data exposure, schema/migration, `runtime-database`, Postgres adapter, mapper/validator/route/UI/runtime wiring, formal export generation, object storage, download URL, external delivery, provider/model call, dependency change, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, or force push.
- No repository implementation changes.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-service.test.ts"`
- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-tdd`
