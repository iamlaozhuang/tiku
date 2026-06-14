# Unified Blocked Gate Provider Checkpoint Guard Task Plan

## Task

- Task id: `unified-blocked-gate-provider-checkpoint-guard`
- Branch: `codex/unified-blocked-gate-provider-checkpoint-guard`
- Date: 2026-06-14
- Start checkpoint: `a08b2c30dea2e2d1a7e9ccf45f4ef3ac46485a45`
- Task kind: `blocked_gate_guard`

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
- `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`
- `docs/01-requirements/traceability/unified-standard-advanced-audit-campaign-plan.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/evidence/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-14-current-state-checkpoint-and-implementation-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-current-state-checkpoint-and-implementation-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-future-non-goal-and-audit-only-guard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-future-non-goal-and-audit-only-guard.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- Completed unified standard MVP code audit evidence and audit reviews for auth scope, organization auth,
  question/paper, student experience, AI/RAG governed, and admin ops/logs.

## Approved Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-blocked-gate-provider-checkpoint-guard.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-blocked-gate-provider-checkpoint-guard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-blocked-gate-provider-checkpoint-guard.md`

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

- `landingIds`: `LAND-PROVIDER-STAGING-GATE`, `LAND-CURRENT-CHECKPOINT-AUDIT`
- `sourceIds`: `GATE-B178-EV`, `GATE-B178-AUD`, `GATE-B180-EV`, `GATE-B180-AUD`, `GATE-CHECK-EV`,
  `GATE-CHECK-AUD`, `PLAN-UNIFIED-01`, `PLAN-UNIFIED-02`
- `capabilityIds`: `CAP-GATE-PROVIDER-STAGING-EXECUTION`, `CAP-GATE-CURRENT-CHECKPOINT`,
  `CAP-AUDIT-SOURCE-GOVERNANCE`
- `useCaseIds`: `UC-GATE-PROVIDER-STAGING-EXECUTION`, `UC-GATE-CURRENT-CHECKPOINT`,
  `UC-AUDIT-SOURCE-GOVERNANCE`
- `deltaIds`: `DELTA-PROVIDER-STAGING-GATE`, `DELTA-CURRENT-CHECKPOINT-AUDIT`
- `conflictRefs`: `CFX-PROVIDER-001`, `CFX-CHECKPOINT-001`, `CFX-CAP-001`

## Guard Method

1. Treat batch-178 and batch-180 only as blocked-gate and audit references.
2. Preserve the rule that batch-178 and batch-180 do not approve provider calls, model requests, quota use, env/secret
   access, staging/prod/cloud/deploy, payment, external-service, schema/migration, e2e, PR, force-push, code audit,
   code fix, implementation, or Cost Calibration execution.
3. Treat the current checkpoint findings only as audit context.
4. Preserve the rule that current checkpoint findings cannot rewrite requirements and cannot trigger source changes or
   repair work in this task.
5. Keep source index, planning contract, campaign plan, catalogs, matrices, and completed code-audit records as
   governance inputs only.
6. Record clear carry-forward gates for later tasks, including the human approval boundary required before any concrete
   execution.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-blocked-gate-provider-checkpoint-guard`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-blocked-gate-provider-checkpoint-guard`

After the local commit and passing gates, the user's fresh approval permits fast-forward merge to `master`,
closeout/pre-push validation on `master`, `push origin master`, deletion of the merged short branch, rereading state and
queue, then checking for one docs-only audit-findings rollup / repair-queue seeding task.

## Risk Controls

- No code audit execution beyond reading existing evidence/audit records.
- No code fixes, implementation, source/test/e2e/script/schema/drizzle/package/lockfile edits.
- No env/secret/provider configuration file reads or writes.
- No provider call, model request, quota use, vector/RAG execution, staging/prod/cloud/deploy, payment, or
  external-service work.
- No e2e execution, PR creation, force-push, or deployment.
- No Cost Calibration Gate execution.
