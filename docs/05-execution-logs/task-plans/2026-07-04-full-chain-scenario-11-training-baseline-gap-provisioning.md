# 2026-07-04 Full-Chain Scenario 11 Training Baseline Gap Provisioning Plan

Status: closed

## Task

- Task id: `full-chain-scenario-11-training-baseline-gap-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-11-training-baseline-gap-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scope label: `marketing:3`
- Selector label: `fc_scenario_11_training_baseline_gap_provisioning`
- Stop point being repaired: `missing_assigned_published_enterprise_training_baseline`

## Read Gate

Read before task materialization:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-db-target-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-db-target-alignment.md`
- Relevant organization training schema/service/repository files.

## Reconciliation Rule

The prior provisioning evidence records `assignedPublishedTrainingAfter = 1`, while the latest S11 closeout status records
a pre-browser stop on `missing_assigned_published_enterprise_training_baseline`. This task must resolve that status
boundary without repeating employee import, S10 learning data, old authorization flow, or S11 runtime.

1. First run a read-only, selector-scoped aggregate reconciliation against the isolated DB target.
2. If the assigned published enterprise training baseline already exists, close as reconciled with no product write.
3. If the baseline is still missing, provision it through the governed product path only, then verify aggregate counts.
4. If provisioning would require source/test/schema/dependency changes, direct DB writes, destructive DB action, Provider,
   staging/prod, Cost Calibration, or unclear product decisions, stop and split again.

## Closeout Decision

- Result: existing assigned published enterprise training baseline reconciled.
- Product provisioning write: not needed.
- Browser/runtime: not started.
- Next task: rerun S11 only from the affected browser login / advanced employee learning / enterprise training boundary.

## Evidence Rules

Allowed: task id, branch, selector label, scope label, aggregate counts, command label, pass/fail/block, and redacted
summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization
header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, full
material/question/paper/training/private fixture content, employee answers, and plaintext card values.

## Stop Rules

Stop on DB target mismatch, missing selector inputs, redaction risk, baseline still missing but product provisioning input
unavailable, permission bypass, source/test/schema/dependency repair need, direct DB write need, destructive DB action,
employee import repeat requirement, S10 learning repeat requirement, old authorization flow requirement, Provider,
staging/prod, Cost Calibration, release readiness/final Pass/production usability claim, or any raw evidence leak.
