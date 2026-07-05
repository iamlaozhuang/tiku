# 2026-07-05 Full-Chain Scenario 11 Training Baseline Provisioning Preflight Reconciliation Plan

Status: closed

## Task

- Task id: `full-chain-scenario-11-training-baseline-provisioning-preflight-reconciliation-2026-07-05`
- Branch: `codex/full-chain-scenario-11-training-baseline-provisioning-preflight-reconciliation-2026-07-05`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Selector label: `fc_org_advanced_employee`
- Scope label: `marketing:3`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-training-baseline-gap-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-training-baseline-gap-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-learning-surface-route-selection-classification.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-learning-surface-route-selection-classification.md`
- `src/db/schema/auth.ts`
- `src/db/schema/organization-training.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/services/organization-training-service.ts`

## Boundary

This task only reconciles the S11 training-baseline status conflict with selector-scoped read-only aggregate DB evidence.
It does not start runtime, does not start a browser, does not write DB state, does not repeat employee import, does not
repeat S10 learning data, and does not run S11 affected-node runtime.

## Execution Steps

1. Confirm the branch and current task materialization.
2. Run a redacted read-only aggregate query against `tiku_full_chain_acceptance_20260704_001`.
3. Record only aggregate counts and pass/block status.
4. If the assigned published training baseline is present, close without provisioning and route the next task to S11
   affected-node rerun.
5. If the baseline is missing, close as blocked and split a separate provisioning task.

## Evidence Rules

Allowed: task id, branch, selector label, scope label, aggregate counts, command label, pass/fail/block, and redacted
summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization
header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, full
material/question/paper/training/private fixture content, employee answers, and plaintext card values.

## Stop Rules

Stop on DB target mismatch, redaction risk, read-only query failure, evidence conflict that cannot be resolved by
aggregate counts, baseline missing, permission bypass, product source/test repair need, schema/migration/seed/dependency
need, direct DB write need, destructive DB action, employee import repeat requirement, S10 learning repeat requirement,
old authorization flow requirement, Provider, staging/prod, Cost Calibration, release readiness/final Pass/production
usability claim, or any raw evidence leak.

## Closeout Gates

- scoped Prettier write/check for this task's state, queue, plan, evidence, and audit files
- `git diff --check`
- blocked path diff
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness

## Reconciliation Decision

- Result before closeout gates: assigned published `marketing:3` enterprise training baseline is present.
- Duplicate provisioning required: false.
- Browser/runtime required in this task: false.
- Next recommended task after closeout: S11 affected-node rerun from browser login / advanced employee learning /
  enterprise-training boundary.
