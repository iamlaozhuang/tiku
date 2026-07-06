# 2026-07-06 Active Tasks Slimming Batch 7

## Scope

Archive batch 7: 25 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

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

- ai-generation-post-adoption-closure-rerun-2026-07-02
- ai-generation-grounded-result-adoption-closure-repair-2026-07-02
- ai-generation-post-query-wording-provider-rerun-2026-07-02
- ai-generation-grounding-query-and-contract-wording-repair-2026-07-02
- ai-generation-post-runtime-resource-provider-rerun-2026-07-02
- ai-generation-resource-runtime-coverage-2026-07-02
- ai-generation-cross-surface-closure-2026-07-02
- ai-generation-post-repair-localhost-rerun-2026-07-01
- ai-generation-admin-debug-summary-ui-repair-2026-07-01
- ai-generation-post-admin-debug-summary-localhost-rerun-2026-07-01
- ai-generation-admin-parameters-runtime-repair-2026-07-01
- ai-generation-post-admin-parameters-localhost-rerun-2026-07-01
- ai-generation-ordinary-ui-internal-wording-repair-2026-07-01
- ai-generation-resource-grounding-enforcement-repair-2026-07-01
- ai-generation-eight-role-credential-backed-rerun-2026-07-01
- ai-generation-cross-role-grounding-ui-rerun-2026-07-01
- ai-generation-admin-idempotency-visible-result-repair-2026-07-01
- ai-generation-resource-grounded-provider-sample-2026-07-01
- ai-generation-post-grounding-provider-matrix-rerun-2026-07-01
- ai-generation-grounding-product-ui-repair-2026-07-01
- ai-generation-central-repair-approval-2026-07-01
- ai-generation-repair-roadmap-2026-07-01
- ai-generation-p0-entry-unblock-2026-07-01
- ai-generation-p1-core-semantics-2026-07-01
- ai-generation-p2-history-ux-2026-07-01

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
