# Batch 185 Organization Analytics Aggregate-Only Organization Metrics Plan

## Task

- Task id: `batch-185-organization-analytics-aggregate-only-organization-metrics`
- Branch: `codex/organization-analytics-batch-185-aggregate-metrics`
- Task kind: implementation
- Scope: implement the first aggregate-only organization analytics model and service contract for organization training metrics.

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
- `docs/05-execution-logs/task-plans/2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `superpowers:test-driven-development`
- `superpowers:executing-plans`

## Implementation Boundary

- Allowed runtime files: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Planned runtime files:
  - `src/server/models/organization-analytics.ts`
  - `src/server/models/organization-analytics.test.ts`
  - `src/server/contracts/organization-analytics-contract.ts`
  - `src/server/services/organization-analytics-service.ts`
  - `src/server/services/organization-analytics-service.test.ts`
- Planned docs/state files:
  - this task plan
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/evidence/batch-185-organization-analytics-aggregate-only-organization-metrics.md`
  - `docs/05-execution-logs/audits-reviews/batch-185-organization-analytics-aggregate-only-organization-metrics.md`
- This task covers aggregate formulas and summary read-model composition only.
- Repository, mapper, route, UI, export, privacy employee statistics, and `audit_log` runtime work remain for later queued tasks.

## TDD Plan

1. RED: add model tests for eligible count, submitted count, unfinished count, completion rate, average/min/max score, zero eligible, zero submission, submitted trend, takedown historical inclusion, and ranking tie breakers.
2. GREEN: implement pure formula helpers and DTO types with immutable calculations.
3. RED: add service tests that compose an aggregate dashboard summary from already-redacted in-memory rows and reject non-advanced/non-`org_auth`/missing capability contexts.
4. GREEN: implement a pure organization analytics service that requires advanced organization admin capability and returns summary-only DTOs without row data, numeric ids, answer bodies, question text, `analysis`, prompt, provider payload, secret, token, or plaintext `redeem_code`.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-185-organization-analytics-aggregate-only-organization-metrics -EvidencePath docs\05-execution-logs\evidence\2026-06-16-module-run-v2-auto-seed-organization-analytics.md`
- `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-185-organization-analytics-aggregate-only-organization-metrics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-185-organization-analytics-aggregate-only-organization-metrics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-185-organization-analytics-aggregate-only-organization-metrics`

## Risk Defenses

- No `.env*` reads, summaries, outputs, or edits.
- No DB access, row/private data, provider/model calls, quota/cost measurement, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, dependency, package/lockfile, schema, drizzle, PR, or force push.
- Do not expose employee answer detail, question text, standard answer, `analysis`, item correctness, subjective answer, prompt, provider payload, raw model output, plaintext `redeem_code`, secret, token, DB URL, Authorization header, public id lists from real data, or numeric ids.
- Stop if formulas require repository/schema changes or real data access.
