# Unified Future Non-Goal And Audit-Only Guard Task Plan

## Task

- Task id: `unified-future-non-goal-and-audit-only-guard`
- Branch: `codex/unified-future-non-goal-and-audit-only-guard`
- Date: 2026-06-14
- Start checkpoint: `38a1588d1c837343c11af866fa28cbcfa71979c2`
- Task kind: `non_goal_guard`

## Required Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`
- `docs/01-requirements/traceability/unified-standard-advanced-audit-campaign-plan.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-consistency-and-risk-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-consistency-and-risk-audit.md`

## Approved Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-future-non-goal-and-audit-only-guard.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-future-non-goal-and-audit-only-guard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-future-non-goal-and-audit-only-guard.md`

Read-only inputs:

- `docs/**`
- `scripts/**`

Blocked files:

- `.env.local`
- `.env.example`
- `.env.*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Traceability Baseline

- `landingIds`: `LAND-PAYMENT-NON-GOAL`, `LAND-OCR-AUTO-IMPORT-NON-GOAL`,
  `LAND-DATA-EXPORT-NON-GOAL`, `LAND-RUNTIME-CAPABILITY-LIST-AUDIT-ONLY`
- `sourceIds`: `STD-REQ-00`, `STD-REQ-02`, `STD-STORY-02`, `ADV-SPEC-01`, `ADV-SPEC-02`,
  `ADV-SPEC-03`, `ADV-MOD-05`, `ADV-MOD-06`, `ADV-STORY-03`, `ADV-STORY-04`, `ADV-PLAN-01`,
  `ADV-PLAN-02`, `PLAN-UNIFIED-01`, `PLAN-UNIFIED-02`, `EXC-CODE-001`, `EXC-SCHEMA-001`
- `capabilityIds`: `CAP-FUTURE-ONLINE-PAYMENT`, `CAP-FUTURE-OCR-AND-AUTO-IMPORT`,
  `CAP-FUTURE-DATA-EXPORT`, `CAP-FUTURE-RUNTIME-CAPABILITY-LIST`, `CAP-AUDIT-SOURCE-GOVERNANCE`
- `useCaseIds`: `UC-FUTURE-ONLINE-PAYMENT`, `UC-FUTURE-OCR-AUTO-IMPORT`,
  `UC-FUTURE-ORG-DATA-EXPORT`, `UC-FUTURE-RUNTIME-CAPABILITY-LIST`,
  `UC-AUDIT-SOURCE-GOVERNANCE`
- `deltaIds`: `DELTA-PAYMENT`, `DELTA-OCR-AUTO-IMPORT`, `DELTA-DATA-EXPORT`,
  `DELTA-RUNTIME-CAPABILITY-LIST`

## Guard Method

1. Keep this as non-goal and audit-only guard work only.
2. Convert each future/non-goal landing row into a negative boundary that blocks implementation inference.
3. Preserve the runtime capability-list distinction: traceability catalogs are audit artifacts, not runtime feature
   delivery.
4. Preserve excluded source rules for `src/**`, schema/migration, packages/lockfiles, env/secret/provider configuration,
   tests/e2e, and script edits.
5. Record redaction and evidence limits: no raw secret, provider payload, prompt, model response, database URL, row data,
   cleartext `redeem_code`, raw question/paper content, employee raw answer text, generated file, export payload, or
   private customer/customer-like data.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-future-non-goal-and-audit-only-guard`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-future-non-goal-and-audit-only-guard`

After local commit and passing gates, the user's fresh approval permits fast-forward merge to `master`,
closeout/pre-push validation on `master`, `push origin master`, deletion of the merged short branch, rereading state and
queue, then stopping without claiming `unified-blocked-gate-provider-checkpoint-guard`.

## Risk Controls

- No code audit, code fixes, source reads, or source writes.
- No implementation, schema/migration, database, dependency, or package/lockfile work.
- No env/secret/provider configuration reads or writes.
- No provider/model request, quota use, payment, external-service operation, deploy, PR, force-push, or e2e.
- No generated exports, OCR/parser work, file-generation/download work, or runtime capability-list implementation.
- No follow-up task claiming.
- Cost Calibration Gate remains blocked.
