# Task Plan: Advanced Organization Analytics Mapper Validator Route Contract TDD

## Task

- Task id: `advanced-organization-analytics-mapper-validator-route-contract-tdd`
- Branch: `codex/advanced-organization-analytics-mapper-validator-route-contract-tdd`
- Date: 2026-06-16
- Scope: TDD implementation limited to organization analytics mapper, validator, route contract, and corresponding unit tests.

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
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-route-runtime-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-route-runtime-boundary-readonly-audit.md`
- `src/server/contracts/api-response.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`

## Local State

- Starting branch baseline: `master == origin/master == d9299bbbadb41fc743567653361741c15bad0bbf`.
- Queue check found one pending task: `advanced-organization-analytics-mapper-validator-route-contract-tdd`.
- Existing mapper, validator, and target unit test files do not exist.
- Existing internal service DTOs include `scopeOrganizationPublicIds`; this task must introduce API/UI-facing DTOs that do not expose that technical list.

## TDD Plan

1. RED contract test: assert route-facing API response DTOs preserve the standard envelope and omit scoped organization identifier arrays while keeping aggregate-only, summary-only, metadata-only export readiness, ISO 8601 timestamps, `null`, and `[]` behavior.
2. GREEN contract code: add route-facing contract types/helpers only in `src/server/contracts/organization-analytics-contract.ts`.
3. RED mapper test: map internal dashboard, employee statistics, and export readiness service responses to route-facing responses without leaking `scopeOrganizationPublicIds` or export artifacts.
4. GREEN mapper code: add `src/server/mappers/organization-analytics-mapper.ts` with immutable shallow DTO copies and no service/repository access.
5. RED validator test: parse future route inputs into typed commands, trimming text, validating ISO date range and export scope, returning a standard error response on invalid input.
6. GREEN validator code: add `src/server/validators/organization-analytics.ts` with dependency-free validation helpers.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/contracts/organization-analytics-contract.test.ts"`
- `npm.cmd run test:unit -- "src/server/mappers/organization-analytics-mapper.test.ts"`
- `npm.cmd run test:unit -- "src/server/validators/organization-analytics.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-mapper-validator-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-mapper-validator-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-mapper-validator-route-contract-tdd`

## Risk Controls

- No `.env*` access, output, summary, or modification.
- No App Router route files or route runtime wiring.
- No service, repository, model, DB, schema, migration, package, lockfile, dependency, UI, e2e, Browser, Playwright, dev server, provider/model, staging/prod/cloud/deploy/payment/external-service, PR, force-push, quota/cost, or Cost Calibration Gate work.
- Evidence must remain redacted and record command outcomes only; no row/private data, public identifier lists, provider payloads, raw prompts, raw answers, secrets, tokens, Authorization headers, DB URLs, generated export files, or download URLs.
