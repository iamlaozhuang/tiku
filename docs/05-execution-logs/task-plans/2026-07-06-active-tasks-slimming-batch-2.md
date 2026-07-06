# 2026-07-06 Active Tasks Slimming Batch 2

## Scope

Archive batch 2: 25 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Selection Rule

Retain the first 8 closed `tasks:` entries as near-term recovery context, then select the next 25 closed entries with existing evidence and audit paths. Do not move blocked or ready_for_closeout entries.

## Batch IDs

- stage-c-5-provider-cost-staging-residual-risk-closeout-2026-07-05
- stage-c-4-ai-cost-quota-decision-package-2026-07-05
- stage-c-3-cost-calibration-execution-2026-07-05
- stage-c-3-cost-calibration-execution-boundary-2026-07-05
- stage-c-1-provider-freshness-env-local-single-key-rerun-2026-07-05
- stage-c-1-provider-freshness-bounded-smoke-rerun-2026-07-05
- full-chain-provider-cost-staging-approval-package-2026-07-05
- full-chain-post-acceptance-queue-cleanup-2026-07-05
- full-chain-local-acceptance-rollup-and-residual-risk-ledger-2026-07-05
- full-chain-scenario-11-paper-source-question-count-boundary-repair-2026-07-05
- full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair-2026-07-05
- full-chain-scenario-11-enterprise-training-question-snapshot-source-repair-2026-07-05
- full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight-2026-07-05
- full-chain-scenario-11-training-baseline-provisioning-preflight-reconciliation-2026-07-05
- full-chain-scenario-11-advanced-employee-affected-node-rerun-after-learning-surface-route-selection-classification-2026-07-04
- full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning-2026-07-04
- full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-reconciliation-2026-07-04
- full-chain-scenario-11-training-baseline-gap-provisioning-2026-07-04
- full-chain-scenario-11-advanced-employee-affected-node-rerun-after-db-target-alignment-2026-07-04
- full-chain-scenario-11-db-target-alignment-provisioning-2026-07-04
- full-chain-scenario-11-advanced-employee-affected-node-rerun-2026-07-04
- full-chain-scenario-11-enterprise-training-baseline-provisioning-2026-07-04
- full-chain-scenario-11-advanced-employee-pre-provider-learning-2026-07-04
- full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning-2026-07-04
- full-chain-scenario-10-practice-start-idempotency-repair-2026-07-04

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
