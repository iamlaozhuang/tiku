# Batch 186 Organization Analytics Privacy-Preserving Employee Statistics Plan

## Task

- Task id: `batch-186-organization-analytics-privacy-preserving-employee-statistics`
- Branch: `codex/organization-analytics-batch-186-employee-statistics`
- Task kind: implementation
- Scope: implement privacy-preserving employee-level organization training statistics as summary-only model and service contracts.

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
  - `docs/05-execution-logs/evidence/batch-186-organization-analytics-privacy-preserving-employee-statistics.md`
  - `docs/05-execution-logs/audits-reviews/batch-186-organization-analytics-privacy-preserving-employee-statistics.md`
- This task covers employee training summary formulas and summary-only service composition.
- Repository, mapper, route, UI, export, schema, DB, provider, quota/cost, and `audit_log` runtime work remain out of scope.

## TDD Plan

1. RED: add model tests for visible training count, submitted count, unfinished count, completion rate, average score, latest submission time, answer-organization snapshot, zero-visible-training handling, and privacy redaction shape.
2. GREEN: implement pure employee summary helpers and DTO types with immutable calculations.
3. RED: add service tests that compose employee statistics from already-redacted in-memory inputs and reject non-advanced/non-`org_auth`/missing capability contexts.
4. GREEN: implement a pure service entry point that reuses organization analytics access checks and returns summary-only employee statistics without row data, numeric ids, answer bodies, question text, `analysis`, prompt, provider payload, secret, token, or plaintext `redeem_code`.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-186-organization-analytics-privacy-preserving-employee-statistics -EvidencePath docs\05-execution-logs\evidence\2026-06-16-module-run-v2-auto-seed-organization-analytics.md`
- `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-186-organization-analytics-privacy-preserving-employee-statistics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-186-organization-analytics-privacy-preserving-employee-statistics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-186-organization-analytics-privacy-preserving-employee-statistics`

## Risk Defenses

- No `.env*` reads, summaries, outputs, or edits.
- No DB access, row/private data, provider/model calls, quota/cost measurement, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, dependency, package/lockfile, schema, drizzle, PR, or force push.
- Employee statistics stay summary-only: no employee answer detail, question text, standard answer, `analysis`, item correctness, subjective answer, mistake detail, prompt, provider payload, raw model output, plaintext `redeem_code`, secret, token, DB URL, Authorization header, public id lists from real data, or numeric ids.
- Stop if employee statistics require repository/schema changes, real data access, export flow, route/UI work, or formal learning writes.
