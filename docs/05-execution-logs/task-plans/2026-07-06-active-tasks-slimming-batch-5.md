# 2026-07-06 Active Tasks Slimming Batch 5

## Scope

Archive batch 5: 25 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

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

- organization-workspace-role-boundary-source-landing-2026-07-03
- system-admin-user-management-source-landing-2026-07-03
- source-landing-16-package-recovery-2026-07-03
- admin-model-prompt-log-governance-source-landing-2026-07-03
- organization-ai-post-actions-source-landing-2026-07-03
- organization-analytics-source-landing-2026-07-03
- organization-training-source-landing-2026-07-03
- ops-authorization-source-landing-2026-07-03
- content-resource-management-source-landing-2026-07-03
- ui-ux-contract-packages-detailed-audit-2026-07-03
- ui-ux-contract-evidence-post-closeout-normalization-2026-07-03
- ops-authorization-ui-ux-contract-2026-07-02
- organization-training-ui-ux-contract-2026-07-02
- organization-analytics-ui-ux-contract-2026-07-02
- organization-ai-post-actions-ui-ux-contract-2026-07-02
- admin-model-prompt-log-governance-ui-ux-contract-2026-07-02
- content-resource-management-ui-ux-contract-2026-07-02
- current-thread-decision-package-closeout-2026-07-02
- redeem-code-edition-plaintext-decision-doc-update-2026-07-02
- ui-ux-requirement-design-baseline-gap-analysis-2026-07-02
- post-archive-recovery-smoke-2026-07-02
- queue-and-execution-log-archive-first-batch-2026-07-02
- queue-and-execution-log-archive-dry-run-inventory-2026-07-02
- recent-thread-governance-and-doc-slimming-2026-07-02
- phase4-requirements-agent-baseline-alignment-2026-07-02

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
