# 2026-07-06 Active Tasks Slimming Batch 6

## Scope

Archive batch 6: 25 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

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

- session-cookie-contract-login-and-e2e-alignment-2026-07-02
- role-workflow-experience-walkthrough-from-code-baseline-2026-07-02
- requirements-code-implementation-alignment-audit-2026-07-02
- requirements-ssot-cross-doc-alignment-audit-2026-07-02
- agents-advanced-requirement-reading-rule-2026-07-02
- ai-generation-requirements-ssot-alignment-2026-07-02
- ai-generation-acceptance-baseline-normalization-2026-07-02
- ai-generation-goal-completion-audit-2026-07-02
- ai-generation-ai-question-provider-structured-output-robustness-2026-07-02
- ai-generation-bounded-provider-rerun-after-question-structure-repair-2026-07-02
- monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02
- marketing-monopoly-logistics-provider-rerun-2026-07-02
- owner-preview-resource-pack-addendum-2026-07-02
- learner-employee-ai-visible-result-closure-repair-2026-07-02
- marketing-monopoly-provider-rerun-2026-07-02
- learner-employee-ai-history-closure-2026-07-02
- marketing-monopoly-provider-acceptance-2026-07-02
- ops-admin-local-login-residual-2026-07-02
- ai-generation-20-fix-quick-acceptance-2026-07-02
- ai-generation-owner-preview-closeout-audit-2026-07-02
- ai-generation-post-retry-repair-rerun-2026-07-02
- ai-generation-learner-retry-terminal-state-repair-2026-07-02
- ai-generation-bounded-provider-closure-rerun-2026-07-02
- ai-generation-post-application-closure-rerun-2026-07-02
- ai-generation-application-closure-and-mixed-state-repair-2026-07-02

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
