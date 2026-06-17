# Batch 205 Organization Analytics Aggregate-Only Organization Metrics Plan

## Task

- Task id: `batch-205-organization-analytics-aggregate-only-organization-metrics`
- Branch: `codex/organization-analytics-batch-205-aggregate-metrics`
- Task kind: implementation
- Scope: tighten the local aggregate-only organization training metrics boundary so organization summaries only count eligible employees.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-auto-seed-organization-analytics.md`
- `docs/05-execution-logs/evidence/batch-185-organization-analytics-aggregate-only-organization-metrics.md`
- `docs/05-execution-logs/task-plans/2026-06-16-batch-185-organization-analytics-aggregate-only-organization-metrics.md`
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
  - `docs/05-execution-logs/evidence/batch-205-organization-analytics-aggregate-only-organization-metrics.md`
  - `docs/05-execution-logs/audits-reviews/batch-205-organization-analytics-aggregate-only-organization-metrics.md`
- No repository, mapper, route, UI, schema, migration, dependency, provider, dev-server, Browser, or e2e work.

## TDD Plan

1. RED: add a focused model test proving an official submission from an employee outside `eligibleEmployeePublicIds` is ignored for submitted count, completion rate, score summary, and submitted trend.
2. GREEN: filter in-range official submissions through a de-duplicated eligible employee set before aggregate calculations.
3. REFACTOR: keep the helper pure and immutable, with no new comments or broader abstractions unless needed.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-205-organization-analytics-aggregate-only-organization-metrics -EvidencePath docs\05-execution-logs\evidence\2026-06-17-module-run-v2-auto-seed-organization-analytics.md`
- RED/GREEN focused unit: `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-205-organization-analytics-aggregate-only-organization-metrics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-205-organization-analytics-aggregate-only-organization-metrics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-205-organization-analytics-aggregate-only-organization-metrics`

## Risk Defenses

- Do not read, output, summarize, or modify credential/environment files.
- Do not expose secrets, tokens, authorization headers, DB URLs, provider payloads, raw prompts, raw answers, public identifier inventories, row data, or private data.
- Do not call providers/models or run quota/cost work.
- Do not modify schema, drizzle, migrations, package files, lockfiles, route/UI, repository, mapper, dev server, Browser, Playwright, e2e, cloud, deploy, payment, or external-service surfaces.
- Stop if the aggregate behavior requires repository/schema changes or real data access.
