# 2026-07-06 Active Tasks Slimming Batch 10

## Scope

Archive batch 10: 9 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Selection Rule

Retain the first 8 closed `tasks:` entries as near-term recovery context after the current batch task is materialized, then select the next 9 closed entries with existing evidence and audit paths. Do not move blocked or ready_for_closeout entries.

## Batch IDs

- learner-ai-training-db-persistence-loop-2026-07-05
- learner-ai-training-attempt-stats-2026-07-05
- full-chain-ai-paper-visible-draft-review-experience-repair-2026-07-05
- full-chain-ai-question-visible-draft-review-experience-repair-2026-07-05
- source-landing-8-role-local-acceptance-2026-07-03
- repair-student-practice-restart-acceptance-harness-2026-07-03
- full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning-2026-07-04
- full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair-2026-07-04
- full-chain-scenario-6-personal-contact-input-provisioning-2026-07-04

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
