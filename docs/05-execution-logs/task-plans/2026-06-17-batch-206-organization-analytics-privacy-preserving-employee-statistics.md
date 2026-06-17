# Batch 206 Organization Analytics Privacy-Preserving Employee Statistics Plan

## Task

- Task id: `batch-206-organization-analytics-privacy-preserving-employee-statistics`
- Branch: `codex/organization-analytics-batch-206-employee-statistics`
- Task kind: implementation
- Scope: tighten employee statistics summaries so duplicate source submissions for the same visible training version do not inflate summary-only averages.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-auto-seed-organization-analytics.md`
- `docs/05-execution-logs/evidence/batch-186-organization-analytics-privacy-preserving-employee-statistics.md`
- `docs/05-execution-logs/task-plans/2026-06-16-batch-186-organization-analytics-privacy-preserving-employee-statistics.md`
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
  - `docs/05-execution-logs/evidence/batch-206-organization-analytics-privacy-preserving-employee-statistics.md`
  - `docs/05-execution-logs/audits-reviews/batch-206-organization-analytics-privacy-preserving-employee-statistics.md`
- No repository, mapper, route, UI, schema, migration, dependency, provider, dev-server, Browser, or e2e work.

## TDD Plan

1. RED: add a focused model test proving duplicate official submissions for the same visible training version are collapsed to the latest submission before score average and snapshot selection.
2. GREEN: normalize in-range employee submissions to one latest submission per visible training version.
3. REFACTOR: keep the helper pure and immutable, without broad service or contract changes.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-206-organization-analytics-privacy-preserving-employee-statistics -EvidencePath docs\05-execution-logs\evidence\2026-06-17-module-run-v2-auto-seed-organization-analytics.md`
- RED/GREEN focused unit: `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-206-organization-analytics-privacy-preserving-employee-statistics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-206-organization-analytics-privacy-preserving-employee-statistics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-206-organization-analytics-privacy-preserving-employee-statistics`

## Risk Defenses

- Do not read, output, summarize, or modify credential/environment files.
- Do not expose secrets, tokens, authorization headers, DB URLs, provider payloads, raw prompts, raw answers, public identifier inventories, row data, or private data.
- Do not call providers/models or run quota/cost work.
- Do not modify schema, drizzle, migrations, package files, lockfiles, route/UI, repository, mapper, dev server, Browser, Playwright, e2e, cloud, deploy, payment, or external-service surfaces.
- Stop if the employee statistics behavior requires repository/schema changes or real data access.
