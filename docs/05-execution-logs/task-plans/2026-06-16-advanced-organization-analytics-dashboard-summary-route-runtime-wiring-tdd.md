# Task Plan: Advanced Organization Analytics Dashboard Summary Route Runtime Wiring TDD

## Task

- Task id: `advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd`
- Branch: `codex/advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd`
- Date: 2026-06-16
- Scope: TDD implementation limited to the organization analytics dashboard summary route adapter, one App Router route, and the corresponding unit test.

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
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-mapper-validator-route-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-mapper-validator-route-contract-tdd.md`
- `src/server/contracts/api-response.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/mappers/organization-analytics-mapper.ts`
- `src/server/validators/organization-analytics.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`

## Local State

- Starting branch baseline: `master == origin/master == a137d2a27736fce8a289dc79b030bc66d50337b1`.
- Queue check found one pending task: `advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd`.
- Allowed runtime scope is route adapter plus dashboard summary App Router route only.
- If real auth/session integration, repository factory wiring, direct DB access, or service business logic changes are required, stop and report.

## TDD Plan

1. RED route adapter test: assert a valid dashboard summary request is parsed through the existing validator, calls an injected dashboard summary reader, maps the service response through the existing mapper, and returns the standard `{ code, message, data }` envelope without `scopeOrganizationPublicIds`.
2. GREEN route adapter code: add `src/server/services/organization-analytics-route.ts` with dependency injection only; no repository factory, DB access, service business logic, or auth/session integration.
3. RED invalid input test: assert missing or invalid query input returns the existing standard validation error response and does not call the injected reader.
4. GREEN invalid input handling: keep the adapter thin and return JSON `Response` objects from validator and mapper outputs.
5. RED App Router route export test: assert the dashboard summary route file exposes a GET handler created from the route adapter without expanding into service/repository runtime wiring.
6. GREEN App Router route code: add `src/app/api/v1/organization-analytics/dashboard-summary/route.ts` as a thin adapter boundary. If a real runtime dependency is necessary, stop instead of widening scope.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd`

## Risk Controls

- No `.env*` access, output, summary, or modification.
- No service business logic changes, repository changes, repository factory wiring, direct DB access, schema/migration, UI, dependency, package, lockfile, provider/model, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate work.
- Evidence must stay redacted and record command outcomes only; no row/private data, public identifier lists, provider payloads, raw prompts, raw answers, secrets, tokens, Authorization headers, DB URLs, generated export files, or download URLs.
