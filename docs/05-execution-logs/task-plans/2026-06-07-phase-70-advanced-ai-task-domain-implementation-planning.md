# Phase 70 Advanced AI Task Domain Implementation Planning

**Task id:** `phase-70-advanced-ai-task-domain-implementation-planning`

**Branch:** `codex/phase-70-ai-task-domain-planning`

**Task kind:** `implementation_planning`

## Approval Boundary

The user approved serial advancement of Phase 69-78 under `local_auto_candidate`.

This task is planning-only. It does not approve direct implementation, provider calls, provider_cost_measurement, dependency, schema, migration, env/secret, staging/prod/cloud/deploy, payment, external-service work, or Cost Calibration Gate execution.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`

## Scope

Allowed files are limited to state, queue, this task plan, evidence, and audit review.

Blocked files and surfaces include `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, package or lockfiles, scripts, env/secret files, provider runtime files, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution.

## Planning Output

This task will produce a future implementation proposal for a provider-agnostic AI generation task lifecycle.

Future implementation should be split into separately approved code-stage tasks:

1. Contract and status model: public DTOs for task type, lifecycle status, failure category, redacted timestamps, and pagination.
2. Internal model and transition rules: `pending`, `running`, `succeeded`, `failed`, `cancelled`, retry and timeout classification.
3. Repository boundary discovery: task creation, idempotency hash lookup, concurrency-safe claim, transition, retry metadata, cancellation, and recovery scans.
4. Service lifecycle orchestration: submit, cancel, claim, complete, fail, retry, recover, and blocked configuration handling.
5. Mapper and redaction: no numeric ids, raw prompt, raw answer, provider payload, secret, token, or full `paper` content.
6. `audit_log` and `ai_call_log` planning: append redacted summaries only and preserve provider-blocked evidence.
7. Optional REST route planning: `/api/v1/ai-generation-tasks` only if separately approved.

## Risk Defenses

- AI task domain must consume the advanced `authorization` context planned in Phase 69.
- Missing provider or production configuration must produce `production_enablement_blocked` or `configuration_missing`, not invented defaults.
- Provider calls and provider_cost_measurement remain blocked.
- `ai_call_log` may record only redacted summaries, never provider payload, raw prompt, raw model output, secret, token, or Authorization header.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md docs\05-execution-logs\evidence\2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md,docs\05-execution-logs\evidence\2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md -Pattern 'Implementation Task Proposal','ai_call_log','audit_log','provider-agnostic','authorization','paper','mock_exam','redeem_code','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if real provider execution, provider_cost_measurement, dependency, schema, migration, env/secret, staging/prod/cloud/deploy, payment, external-service work, direct implementation, or sensitive evidence becomes necessary.
