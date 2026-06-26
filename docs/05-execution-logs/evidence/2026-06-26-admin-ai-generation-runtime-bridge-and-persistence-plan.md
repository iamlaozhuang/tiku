# admin-ai-generation-runtime-bridge-and-persistence-plan-2026-06-26

## Scope

Docs-only decision plan for content admin and organization advanced admin AI generation runtime bridge and persistence.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`

## Approval Boundary

Approved by the owner request on 2026-06-26 to execute the proposed serial batch if suitable.

This task uses that approval for docs/state decision planning only. It does not approve source edits, Provider calls, DB
writes, or release readiness.

## Requirement Mapping Result

Mapped to:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

Mapping conclusion:

- Admin AI generation needs platform/organization owner semantics and cannot inherit personal route semantics directly.
- The next safe source task is a Provider-disabled bridge contract task, not DB persistence or real Provider execution.
- Durable admin persistence and formal adoption require later tasks.

## Static Source Evidence Summary

- Personal route has optional `runtimeBridgeControl` but production route does not pass it.
- Personal persistence helper accepts only personal authorization and owner semantics.
- Personal repository hardcodes `owner_type: personal` and personal history filters.
- Admin local contract route already accepts content and organization workspaces but returns `local_contract_only` and
  `provider_call_blocked`.
- Admin provider adapter service can create server-side model handles only in read-model conditions and still blocks
  provider calls/env access by design.

## Decision Result

Decision: `shared_provider_executor_not_direct_personal_route_reuse`.

Immediate source task allowed after task 3 closes:

`admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd-2026-06-26`

Deferred tasks:

- admin DB persistence contract/repository;
- isolated generated result/review storage;
- formal content adoption;
- real Provider product-route smoke;
- Cost Calibration.

## Validation Results

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
   - Result: pass; scoped files formatted.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
   - Result: pass; all matched files use Prettier code style.
3. `git diff --check`
   - Result: pass; no whitespace errors.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-runtime-bridge-and-persistence-plan-2026-06-26`
   - Result: pass; six files matched declared scope; Cost Calibration Gate remains blocked.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-runtime-bridge-and-persistence-plan-2026-06-26 -SkipRemoteAheadCheck`
   - Result: pass; branch, `master`, `origin/master`, and state checkpoints matched
     `7e998ee17738082405afa4e1a4420486cd6df8f2`.

## Blocked Work Statement

Blocked in this task:

- source, tests, package, lockfile, env, scripts;
- DB connection, DB write, schema, migration, seed, account mutation;
- Provider calls, Provider configuration, Cost Calibration, credential reads;
- formal `question` or `paper` writes;
- browser/dev-server/e2e runtime;
- staging/prod, payment, external service, deployment, PR, force push, final Pass, release readiness.

## Next Step

Proceed to `organization-analytics-dashboard-ux-completion-plan-2026-06-26`.
