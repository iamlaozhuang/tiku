# Advanced Organization Analytics Dashboard Formal Quota Summary TDD

## Task

- Task id: `advanced-organization-analytics-dashboard-formal-quota-summary-tdd`
- Task kind: `local_service_contract_implementation`
- Branch: `codex/organization-analytics-dashboard-formal-quota-summary`
- Fresh approval: user approved execute, local commit, fast-forward merge, push, and cleanup on 2026-06-17.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-17-advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck.md`

## Scope

Extend organization analytics dashboard summary contract and service composition with:

- `formalLearningSummary` from existing repository method `readFormalLearningSummary`.
- `quotaSummary` from existing repository method `readQuotaSummary`.

The implementation must preserve route DTO redaction and existing aggregate-only/summary-only behavior.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-advanced-organization-analytics-dashboard-formal-quota-summary-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-17-advanced-organization-analytics-dashboard-formal-quota-summary-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-advanced-organization-analytics-dashboard-formal-quota-summary-tdd.md`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/services/organization-analytics-service.test.ts`
- `src/server/services/organization-analytics-route.test.ts`

## Blocked Gates

- App Router entrypoint changes.
- UI/page/component changes.
- Repository/source-reader changes.
- Mapper/validator changes.
- Real database access or database connection execution.
- Row/private data exposure or public identifier inventories.
- Employee answer detail, question text, standard answer, `analysis`, item-level correctness, mistake detail, prompt text, provider payload, or raw model output exposure.
- Sensitive configuration or credential file access, output, summary, or edit.
- Schema/migration/drizzle changes.
- Dependency/package/lockfile changes.
- Provider/model calls or provider configuration.
- Export file generation, download route, object storage, or external delivery.
- e2e/browser/dev-server.
- staging/prod/cloud/deploy/payment/external-service.
- Quota/cost measurement or Cost Calibration Gate.
- PR and force push.

## TDD Plan

1. Read existing contract, service, service tests, and route tests.
2. RED: add focused service test proving dashboard summary composes formal learning and quota summaries from repository outputs.
3. RED: add focused route test proving public dashboard route DTO includes formal/quota summaries while still omitting internal scope.
4. Verify RED with the task's focused unit commands.
5. GREEN: minimally extend contract DTO, contract route response mapping, and service dashboard builders.
6. Verify GREEN with focused unit commands.
7. Run full declared validation commands and write evidence/audit.
8. Commit, fast-forward merge, push, and clean up after validation.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-service.test.ts"`
- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-dashboard-formal-quota-summary-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-formal-quota-summary-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-formal-quota-summary-tdd`

## Risk Controls

- No repository or database source reader edits; use existing repository interface only.
- No export, provider, cost, schema, dependency, UI, App Router, or e2e expansion.
- Route DTO must stay standard `{ code, message, data }` and must not expose `scopeOrganizationPublicIds`.
- Preserve `null` for missing optional summaries; do not substitute empty strings.
