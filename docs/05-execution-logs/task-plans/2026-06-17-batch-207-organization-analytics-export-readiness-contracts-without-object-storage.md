# Batch 207 Organization Analytics Export Readiness Contracts Plan

## Task

- Task id: `batch-207-organization-analytics-export-readiness-contracts-without-object-st`
- Branch: `codex/organization-analytics-batch-207-export-readiness`
- Task kind: implementation
- Scope: tighten export readiness so internal row identifiers fail closed even when dependency flags are locally configured.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-auto-seed-organization-analytics.md`
- `docs/05-execution-logs/evidence/batch-187-organization-analytics-export-readiness-contracts-without-object-st.md`
- `docs/05-execution-logs/task-plans/2026-06-16-batch-187-organization-analytics-export-readiness-contracts-without-object-storage.md`
- `superpowers:test-driven-development`

## Implementation Boundary

- Allowed runtime files:
  - `src/server/models/**`
  - `src/server/contracts/**`
  - `src/server/validators/**`
  - `src/server/services/**`
- Planned runtime files:
  - `src/server/models/organization-analytics.test.ts`
  - `src/server/models/organization-analytics.ts`
- Planned docs/state files:
  - this task plan
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/evidence/batch-207-organization-analytics-export-readiness-contracts-without-object-st.md`
  - `docs/05-execution-logs/audits-reviews/batch-207-organization-analytics-export-readiness-contracts-without-object-st.md`
- No repository, mapper, route, UI, schema, migration, dependency, provider, dev-server, Browser, or e2e work.

## TDD Plan

1. RED: add a focused model test proving readiness is blocked when a summary row still carries an internal `sourceRowId`, even if object storage and external delivery flags are true.
2. GREEN: treat source row identifiers as non-summary detail for readiness purposes.
3. REFACTOR: keep readiness assessment pure, metadata-only, and artifact-null.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-207-organization-analytics-export-readiness-contracts-without-object-st -EvidencePath docs\05-execution-logs\evidence\2026-06-17-module-run-v2-auto-seed-organization-analytics.md`
- RED/GREEN focused unit: `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-207-organization-analytics-export-readiness-contracts-without-object-st`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-207-organization-analytics-export-readiness-contracts-without-object-st`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-207-organization-analytics-export-readiness-contracts-without-object-st`

## Risk Defenses

- Do not read, output, summarize, or modify credential/environment files.
- Do not expose secrets, tokens, authorization headers, DB URLs, provider payloads, raw prompts, raw answers, public identifier inventories, row data, or private data.
- Do not call providers/models or run quota/cost work.
- Do not modify schema, drizzle, migrations, package files, lockfiles, route/UI, repository, mapper, dev server, Browser, Playwright, e2e, cloud, deploy, payment, or external-service surfaces.
- Stop if export readiness requires object storage, external delivery, route/UI, schema, repository, or real data access.
