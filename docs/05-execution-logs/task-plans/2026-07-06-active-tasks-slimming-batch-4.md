# 2026-07-06 Active Tasks Slimming Batch 4

## Scope

Archive batch 4: 25 closed Module Run v2 `tasks:` entries from `docs/04-agent-system/state/task-queue.yaml` into `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`, and add lookup entries in `docs/04-agent-system/state/task-history-index.yaml`.

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

- stage-b-test-owned-fixture-provisioning-repair-2026-07-03
- stage-b-0-3-redacted-fixture-preflight-2026-07-03
- stage-b-0-2-local-db-baseline-decision-2026-07-03
- stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03
- stage-b-0-local-data-baseline-cleanup-decision-package-2026-07-03
- stage-b-db-provider-staging-cost-approval-package-2026-07-03
- source-landing-8-role-credential-backed-local-acceptance-rerun-after-content-harness-repair-2026-07-03
- repair-content-admin-cookie-backed-acceptance-harness-2026-07-03
- source-landing-8-role-credential-backed-local-acceptance-rerun-2026-07-03
- source-landing-8-role-credential-backed-local-acceptance-rerun-preflight-2026-07-03
- repair-8-role-credential-backed-acceptance-harness-2026-07-03
- source-landing-8-role-local-account-data-fixture-hardening-2026-07-03
- source-landing-8-role-credential-backed-fixture-hardening-plan-2026-07-03
- source-landing-8-role-acceptance-coverage-review-2026-07-03
- source-landing-8-role-local-acceptance-rerun-2026-07-03
- source-landing-16-package-acceptance-prep-2026-07-03
- source-landing-evidence-closeout-correction-2026-07-03
- content-ai-draft-adoption-source-landing-2026-07-03
- employee-training-answer-result-source-landing-2026-07-03
- learner-ai-context-source-landing-2026-07-03
- learner-core-experience-source-landing-2026-07-03
- employee-transfer-session-source-landing-2026-07-03
- employee-import-password-source-landing-2026-07-03
- org-auth-overlap-closure-source-landing-2026-07-03
- organization-tree-ops-workbench-source-landing-2026-07-03

## Guardrails

- No product source, tests, dependencies, schema, migrations, seed, env, DB, Provider, staging/prod, release readiness, production usability, or Cost Calibration work.
- No evidence or audit deletion.
- Preserve archived task blocks without semantic edits.
- Validate exact archive/index lookup and active queue counts before closeout.
