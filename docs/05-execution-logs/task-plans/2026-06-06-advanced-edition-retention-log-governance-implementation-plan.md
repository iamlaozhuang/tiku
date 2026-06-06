# Task Plan: Advanced Edition Retention And Log Governance Implementation Plan

## Task

- Queue id: `phase-31-advanced-edition-retention-log-governance-implementation-plan`
- Task kind: `docs_only`
- Branch: `codex/advanced-edition-retention-log-plan`
- Scope: create a detailed future implementation plan for advanced edition retention, `expired_hidden`, `audit_log`, `ai_call_log`, hard-delete approval, controlled snapshot exception, and evidence redaction governance.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`

## Constraints

- Do not execute Cost Calibration Gate.
- Do not measure provider cost or call a real `model_provider`.
- Do not create or edit env/secret files.
- Do not touch staging/prod/cloud/deploy/payment/external-service configuration.
- Do not modify product code, tests, schema, migrations, scripts, dependencies, package files, or lock files.
- Do not introduce physical hard-delete executor work.
- Do not introduce raw sensitive content viewer work.
- Use project terms: `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `audit_log`, `ai_call_log`, `paper`, `mock_exam`.

## Plan

1. Re-read the pending queue item and upstream implementation plans.
2. Define retention content domains and confirmed policy values.
3. Define `expired_hidden`, 30-day recovery, hard-delete approval, controlled snapshot exception, `audit_log`, `ai_call_log`, and evidence redaction contracts.
4. Create `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`.
5. Include future file boundaries, implementation tasks, acceptance tests, blocked work, and downstream handoff.
6. Run a detailed self-review against confirmed requirements, upstream plans, and naming constraints.
7. Update `project-state.yaml` and `task-queue.yaml`.
8. Run docs-only validation and record evidence.

## Risk Controls

- Treat this as implementation planning only, not implementation approval.
- Keep hard-delete execution blocked.
- Keep raw sensitive content viewing blocked.
- Keep logs and evidence redacted.
- Keep provider, cost, production defaults, env/secret, staging/prod/cloud/deploy, payment, external-service, schema, migration, dependency, script, package, and lockfile work out of scope.

## Expected Output

- `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`
- Updated `docs/04-agent-system/state/project-state.yaml`
- Updated `docs/04-agent-system/state/task-queue.yaml`
