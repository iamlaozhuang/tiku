# 2026-07-06 Active Tasks Slimming Batch 8

## Scope

Archive batch 8: 25 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

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

- ai-generation-data-backed-walkthrough-2026-07-01
- ai-generation-resource-import-contract-2026-07-01
- ai-generation-eight-role-matrix-rerun-2026-07-01
- ai-generation-real-provider-sample-2026-07-01
- ai-generation-provider-structure-feedback-repair-2026-07-01
- ai-generation-provider-matrix-rerun-after-repair-2026-07-01
- ai-generation-core-walkthrough-2026-07-01
- owner-preview-qwen-visible-ai-2026-07-01
- owner-preview-empty-baseline-2026-07-01
- owner-preview-local-walkthrough-preparation-package-2026-06-30
- remaining-terminal-active-queue-archive-index-cleanup-2026-06-30
- learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25
- full-chain-scenario-9-edition-upgrade-redeem-runtime-repair-2026-07-04
- full-chain-scenario-7-redeem-code-contact-config-2026-07-04
- full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair-2026-07-04
- full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning-2026-07-04
- full-chain-scenario-5-advanced-employee-input-provisioning-2026-07-04
- full-chain-scenario-5-advanced-org-package-2026-07-04
- full-chain-scenario-5-employee-import-harness-repair-2026-07-04
- full-chain-scenario-5-employee-import-test-contract-repair-2026-07-04
- full-chain-scenario-5-employee-import-harness-repair-rerun-2026-07-04
- full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair-2026-07-04
- full-chain-login-input-state-binding-repair-2026-07-04
- full-chain-scenario-5-advanced-org-package-rerun-after-login-input-state-binding-repair-2026-07-04
- full-chain-scenario-2-admin-flow-cookie-session-auth-repair-2026-07-04

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
