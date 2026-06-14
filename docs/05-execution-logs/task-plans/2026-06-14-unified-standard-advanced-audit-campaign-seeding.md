# Task Plan: unified-standard-advanced-audit-campaign-seeding

## Goal

Seed a serial, sustainable audit campaign for unified standard edition MVP and advanced edition review.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-use-case-audit-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-use-case-audit-planning.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/evidence/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-current-state-checkpoint-and-implementation-audit.md`

## Approved Files

- `docs/01-requirements/traceability/unified-standard-advanced-audit-campaign-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-audit-campaign-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-audit-campaign-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-audit-campaign-seeding.md`

## Blocked Files And Actions

- No `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `schema/migration`, `drizzle/**`, `package.json`, or lockfile changes.
- No `.env.local`, `.env.*`, real secret, provider configuration, raw provider payload, raw prompt, raw response,
  database URL, row data, or cleartext `redeem_code` reads or outputs.
- No real provider calls, model requests, quota use, staging/prod/cloud/deploy/payment/external-service operations.
- No e2e execution, PR creation, force-push, schema/migration, dependency, package, or lockfile work.
- No code audit or code fix in this task.

## Implementation Steps

1. Create `codex/unified-standard-advanced-audit-campaign-seeding` from the current planning commit.
2. Create the campaign plan with six serial follow-up tasks:
   - `unified-standard-advanced-planning-closeout-baseline`
   - `unified-standard-advanced-input-freeze-and-source-index`
   - `unified-standard-advanced-capability-catalog`
   - `unified-standard-advanced-use-case-catalog-and-edition-delta`
   - `unified-standard-advanced-technical-landing-matrix`
   - `unified-standard-advanced-consistency-and-risk-audit`
3. Register the seeding task as closed in `task-queue.yaml`.
4. Register the six follow-up tasks as pending and gated by dependency order.
5. Update `project-state.yaml` to record the current task and handoff.
6. Write evidence and audit review.
7. Run docs-only validation.
8. Commit only the approved files.

## Validation Plan

- `git diff --check`
- `npx.cmd prettier --check --ignore-unknown docs/01-requirements/traceability/unified-standard-advanced-audit-campaign-plan.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-audit-campaign-seeding.md docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-audit-campaign-seeding.md docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-audit-campaign-seeding.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-audit-campaign-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-audit-campaign-seeding`

## Risk Defense

- Treat this task as campaign seeding only; do not execute any follow-up task.
- Keep the first follow-up task as closeout baseline because the planning branch is not yet merged to `master`.
- Require fresh approval before any future fast-forward merge, push, or branch cleanup.
- Keep provider, env/secret, staging/prod/cloud/deploy, payment, external-service, schema/migration, e2e, dependency, and
  Cost Calibration gates blocked.
