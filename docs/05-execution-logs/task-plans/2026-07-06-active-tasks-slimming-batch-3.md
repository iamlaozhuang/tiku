# 2026-07-06 Active Tasks Slimming Batch 3

## Scope

Archive batch 3: 25 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

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

- full-chain-scenario-10-standard-employee-learning-rerun-after-practice-start-idempotency-repair-2026-07-04
- full-chain-scenario-10-duplicate-active-practice-state-provisioning-2026-07-04
- full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning-2026-07-04
- full-chain-scenario-10-standard-employee-learning-2026-07-04
- full-chain-scenario-10-standard-employee-content-scope-provisioning-2026-07-04
- full-chain-scenario-10-standard-employee-content-pack-input-provisioning-2026-07-04
- full-chain-scenario-10-marketing-3-question-paper-input-provisioning-2026-07-04
- full-chain-scenario-10-content-scope-provisioning-after-marketing-3-input-2026-07-04
- full-chain-scenario-9-advanced-personal-rerun-after-browser-harness-repair-2026-07-04
- full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair-2026-07-04
- full-chain-scenario-9-browser-tab-mapping-harness-repair-2026-07-04
- full-chain-goal-control-ledger-2026-07-04
- full-chain-isolated-db-bootstrap-seed-execution-2026-07-04
- full-chain-isolated-db-account-plan-prep-2026-07-04
- full-chain-isolated-db-bootstrap-seed-approval-prep-2026-07-04
- full-chain-acceptance-planning-and-materials-prep-2026-07-04
- stage-c-1-provider-smoke-rerun-2026-07-04
- stage-c-1-secret-availability-decision-2026-07-04
- stage-c-1-provider-smoke-2026-07-04
- stage-c-1-read-only-provider-target-inventory-2026-07-04
- stage-b-local-acceptance-closeout-and-stage-c-approval-prep-2026-07-04
- stage-b-db-backed-8-role-local-acceptance-2026-07-03
- stage-b-test-owned-fixture-provisioning-scope-refresh-2026-07-03
- stage-b-8-role-fixture-label-ssot-decision-2026-07-03
- stage-b-test-owned-account-db-target-alignment-2026-07-03

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
