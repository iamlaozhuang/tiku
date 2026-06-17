# Advanced Organization Analytics Dashboard Summary Runtime Composition Contract TDD Plan

## Task

- Task id: `advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd`
- Task kind: `local_route_contract_implementation`
- Branch: `codex/advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding.md`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`

## Scope

Implement a route runtime composition contract through TDD. The production route adapter may expose an injectable runtime composition path that calls the existing repository-backed dashboard summary service with injected repository-like dependencies and an injected timestamp source.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd.md`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-route.test.ts`

## Blocked Scope

- Do not modify `src/app/api/v1/organization-analytics/dashboard-summary/route.ts`.
- Do not modify repositories, service business logic, models, mappers, validators, contracts, UI, schema, drizzle, package, lockfiles, scripts, or e2e files.
- Do not access DB, implement Postgres repository factories, start dev server, run Browser/Playwright/e2e, call providers/models, touch staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.
- Do not read, output, summarize, or modify `.env*`.

## TDD Steps

1. RED: Add a unit test proving an explicitly injected runtime composition path passes parsed route query, resolved admin context, injected repository, and injected timestamp into the existing repository-backed dashboard summary service path.
2. Verify RED with `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`.
3. GREEN: Add the smallest route-level runtime composition helper/types needed to pass the test while keeping default `createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers()` fail-closed.
4. Verify GREEN with the scoped unit test command.
5. Refactor only if needed, preserving allowed file boundaries.

## Validation

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd`

## Risk Controls

- Keep App Router dashboard summary route fail-closed by default.
- Preserve standard API response envelope.
- Keep runtime composition dependency-injected and unit-testable.
- Evidence must stay redacted and must not include row/private data, real public identifier lists, secrets, DB URLs, Authorization headers, cookies, provider payloads, raw prompts, or raw answers.
