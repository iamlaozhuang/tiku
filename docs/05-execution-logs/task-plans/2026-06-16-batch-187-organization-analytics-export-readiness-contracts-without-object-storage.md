# Batch 187 Organization Analytics Export Readiness Contracts Plan

## Task

- Task id: `batch-187-organization-analytics-export-readiness-contracts-without-object-st`
- Branch: `codex/organization-analytics-batch-187-export-readiness`
- Task kind: implementation
- Scope: implement export readiness contracts for organization analytics without object storage, generated files, download URLs, external delivery, or export execution.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `superpowers:test-driven-development`
- `superpowers:executing-plans`

## Implementation Boundary

- Allowed runtime files: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Planned runtime files:
  - `src/server/contracts/organization-analytics-contract.ts`
  - `src/server/models/organization-analytics.ts`
  - `src/server/models/organization-analytics.test.ts`
  - `src/server/services/organization-analytics-service.ts`
  - `src/server/services/organization-analytics-service.test.ts`
- Planned docs/state files:
  - this task plan
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/evidence/batch-187-organization-analytics-export-readiness-contracts-without-object-st.md`
  - `docs/05-execution-logs/audits-reviews/batch-187-organization-analytics-export-readiness-contracts-without-object-st.md`
- This task covers readiness contracts only.
- Repository, mapper, route, UI, generated export file, object storage, download URL, external delivery, schema, DB, provider, quota/cost, and `audit_log` runtime work remain out of scope.

## TDD Plan

1. RED: add model tests for export readiness blocked by missing object storage and missing external delivery while preserving summary-only row counts and null export artifacts.
2. GREEN: implement pure export readiness assessment helper and camelCase DTO types.
3. RED: add service tests that compose an access-checked export readiness summary and prove guarded fixture fields, numeric ids, row public id lists, generated file, and download URL do not leak.
4. GREEN: implement a pure service entry point that reuses the organization analytics access gate and returns readiness metadata only.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-187-organization-analytics-export-readiness-contracts-without-object-st -EvidencePath docs\05-execution-logs\evidence\2026-06-16-module-run-v2-auto-seed-organization-analytics.md`
- `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-187-organization-analytics-export-readiness-contracts-without-object-st`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-187-organization-analytics-export-readiness-contracts-without-object-st`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-187-organization-analytics-export-readiness-contracts-without-object-st`

## Risk Defenses

- No `.env*` reads, summaries, outputs, or edits.
- No DB access, row/private data, provider/model calls, quota/cost measurement, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, dependency, package/lockfile, schema, drizzle, PR, or force push.
- Export remains readiness-only: no generated file, no object storage write/read, no download route, no download URL, no external delivery, no export command, no public id list output.
- Stop if readiness requires repository/schema changes, real data access, route/UI work, object storage, external service, or formal learning writes.
