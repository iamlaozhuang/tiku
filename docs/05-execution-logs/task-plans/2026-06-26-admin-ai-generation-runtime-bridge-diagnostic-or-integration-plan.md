# Admin AI Generation Runtime Bridge Diagnostic Or Integration Plan

Task ID: `admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan-2026-06-26`

## Scope

This is a docs/state-only decision task. It decides whether the content admin and organization admin AI generation routes should connect directly to the existing personal Provider bridge or should introduce a shared admin runtime bridge path.

Allowed work:

- Read governance, requirements, ADRs, committed evidence, and relevant source contracts/services statically.
- Create this task plan, acceptance decision package, evidence, audit-review, and state/queue updates.
- Record a narrow architecture decision and the next implementation boundary.

Blocked work:

- Source, test, package, lockfile, DB schema, migration, seed, env, credential, account, staging/prod, payment, external service, deployment, release readiness, formal question write, and formal paper write changes.
- Provider calls, Provider credential reads, runtime DB connections, route smoke, browser smoke, raw prompt/raw output capture, and generated content body evidence.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`

## Source Surfaces For Static Diagnosis

- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `src/server/contracts/admin-ai-generation-task-persistence-contract.ts`
- `src/server/contracts/admin-ai-generation-result-persistence-contract.ts`

## Decision Questions

1. Can content/org admin routes directly reuse the current personal Provider bridge?
2. If not, what shared pieces can be reused safely?
3. What is the smallest future implementation boundary that preserves provider-disabled defaults and keeps formal question/paper adoption separate?

## Planned Decision Criteria

- Admin route ownership and authorization semantics must remain separate from personal AI generation.
- Provider execution evidence must remain redacted and capped by future approval packages.
- Generated result draft storage must remain separate from formal `question`/`paper` writes.
- The default admin route runtime must remain `provider_call_blocked` until a later approved source task enables controlled Provider execution.
- The selected design must avoid duplicating Provider redaction/cost-summary behavior where a shared core is sufficient.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan-2026-06-26 -SkipRemoteAheadCheck`

## Closeout Boundary

This task may close only as a docs/state decision package. It must not claim Provider/Cost final Pass, staging/prod readiness, payment readiness, release readiness, or formal generated content adoption.
