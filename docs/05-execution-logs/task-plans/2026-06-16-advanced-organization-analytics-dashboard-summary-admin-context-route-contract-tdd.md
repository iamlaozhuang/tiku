# Task Plan: Advanced Organization Analytics Dashboard Summary Admin Context Route Contract TDD

## Task

- Task id: `advanced-organization-analytics-dashboard-summary-admin-context-route-contract-tdd`
- Branch: `codex/advanced-organization-analytics-dashboard-summary-admin-context-route-contract-tdd`
- Date: 2026-06-16
- Scope: TDD implementation limited to the organization analytics dashboard summary route adapter admin context contract and corresponding unit test.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-dashboard-summary-real-runtime-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-dashboard-summary-real-runtime-boundary-readonly-audit.md`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `src/app/api/v1/organization-analytics/dashboard-summary/route.ts`
- `src/server/contracts/api-response.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/mappers/organization-analytics-mapper.ts`
- `src/server/validators/organization-analytics.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/services/organization-training-route.ts`

## Local State

- Starting branch baseline: `master == origin/master == 25430def6f2ca23de9da4dc513ce0b512ca083ba`.
- Queue check found one pending task: `advanced-organization-analytics-dashboard-summary-admin-context-route-contract-tdd`.
- The App Router dashboard summary route must remain fail-closed.
- Real auth/session integration, repository factory wiring, DB access, service business logic changes, and App Router real runtime wiring remain blocked.

## TDD Plan

1. RED: add a unit test showing a valid dashboard summary request resolves an injected admin context before calling an injected dashboard summary reader.
2. RED: add a unit test showing unavailable admin context returns a standard error envelope and does not call the dashboard summary reader.
3. GREEN: evolve `createOrganizationAnalyticsDashboardSummaryRouteHandlers` to accept an injected admin context resolver and pass admin context plus route query to the injected reader.
4. GREEN: preserve current default fail-closed App Router behavior by keeping default admin context and reader unavailable.
5. Refactor only if tests are green; do not touch App Router route, service business logic, repositories, contracts, validators, mappers, schema, dependencies, UI, provider, or e2e surfaces.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-dashboard-summary-admin-context-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-admin-context-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-admin-context-route-contract-tdd`

## Risk Controls

- No `.env*` access, output, summary, or modification.
- No real auth/session integration, repository factory wiring, direct DB access, service business logic changes, App Router real runtime wiring, UI, schema/migration, package/lockfile/dependency, provider/model, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate work.
- Evidence must remain redacted and record command outcomes and structural behavior only.
