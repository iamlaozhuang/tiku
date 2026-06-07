# Phase 56 Advanced Edition Docs-Only Coverage Audit Task Plan

## Task Boundary

Run a docs-only coverage audit for the advanced edition MVP handoff package and verify whether the current requirements and detailed implementation planning documents cover the approved first-release loops.

This task does not approve or perform product implementation, code-stage queue seeding, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-acceptance-scenarios.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-mvp-scope-and-source.md`

## Audit Method

1. Map the approved MVP loops to the implementation planning modules.
2. Check role coverage for personal user, organization admin, employee, platform operations admin, and platform content teacher boundaries.
3. Check flow coverage for success, permission block, quota block, failure, cancellation, retention, redaction, and formal-content separation.
4. Check data coverage for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, quota, generated `question`, generated `paper`, organization training, `answer_record`, `audit_log`, and `ai_call_log`.
5. Record residual gaps without turning them into code-stage tasks unless separately approved.
6. Keep Cost Calibration Gate and all provider/env/secret/staging/prod/cloud/deploy/payment/external-service work blocked.

## Expected Outputs

- Evidence: `docs/05-execution-logs/evidence/2026-06-07-phase-56-advanced-edition-coverage-audit.md`
- Audit review: `docs/05-execution-logs/audits-reviews/2026-06-07-phase-56-advanced-edition-coverage-audit.md`
- State sync: `docs/04-agent-system/state/project-state.yaml`
- Queue sync: `docs/04-agent-system/state/task-queue.yaml`

## Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-56-advanced-edition-coverage-audit.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-56-advanced-edition-coverage-audit.md docs\05-execution-logs\evidence\2026-06-07-phase-56-advanced-edition-coverage-audit.md`
- `Select-String` required coverage headings and project terms.
- Added-line scan for blocked non-project terms.
- Verify `automation.mode` remains `semi_auto`.

## Risk Controls

- Do not infer runtime readiness from document coverage.
- Do not seed code-stage queue tasks.
- Do not modify source code or dependency files.
- Do not touch provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work.
- Record any residual gap as an approval-required follow-up instead of an implementation task.
