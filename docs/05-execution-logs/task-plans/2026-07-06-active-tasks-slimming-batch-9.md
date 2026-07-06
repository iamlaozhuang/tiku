# 2026-07-06 Active Tasks Slimming Batch 9

## Scope

Archive batch 9: 14 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Selection Rule

Retain the first 8 closed `tasks:` entries as near-term recovery context, then select the next 14 closed entries with existing evidence and audit paths. Do not move blocked or ready_for_closeout entries.

## Batch IDs

- full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair-2026-07-04
- full-chain-scenario-3-organization-tree-input-provisioning-2026-07-04
- full-chain-scenario-3-organization-tree-2026-07-04
- full-chain-scenario-3-organization-empty-state-create-flow-repair-2026-07-04
- full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair-2026-07-04
- full-chain-scenario-3-rerun-closeout-evidence-repair-2026-07-04
- full-chain-scenario-4-standard-employee-input-provisioning-2026-07-04
- full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04
- full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04
- full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair-2026-07-04
- full-chain-scenario-4-org-admin-input-provisioning-2026-07-04
- full-chain-scenario-4-standard-org-package-2026-07-04
- full-chain-scenario-2-paper-auth-block-closeout-sha-repair-2026-07-04
- full-chain-scenario-9-advanced-personal-pre-provider-2026-07-04

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
