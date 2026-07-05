# 2026-07-04 Full-Chain Scenario 10 Marketing 3 Question/Paper Input Provisioning Plan

Status: closed

## Task

- Task id: `full-chain-scenario-10-marketing-3-question-paper-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-10-marketing-3-question-paper-input-provisioning-2026-07-04`
- Source blocker: `full-chain-scenario-10-standard-employee-content-pack-input-provisioning-2026-07-04`
- Selected scope label: `marketing:3`
- Scenario selector label: `fc_scenario_10_standard_employee_marketing_3_question_paper_input`
- Approval source: `current_user_approved_s10_marketing_3_question_paper_input_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-content-scope-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-content-scope-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-content-pack-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-content-pack-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `src/db/owner-preview-resource-import.ts`
- `tests/unit/owner-preview-resource-import.test.ts`
- Private full-chain content-pack metadata under the local-private package root, read and written without repo evidence of private contents.

## Boundary

- Allowed: local-private question coverage and paper plan input provisioning for `marketing:3`, plus repo docs/state/queue/evidence/audit closeout.
- Blocked: DB connection/read/write, browser/runtime, employee import repetition, product source/test/dependency changes, schema/migration/seed, Provider, staging/prod, Cost Calibration, destructive DB operations, release readiness, final Pass, production usability, and any evidence containing private content or raw values.
- Evidence may record only task ids, branch, file category labels, selector/scope labels, counts, command names, pass/fail/block, and redacted summaries.

## Execution Plan

1. Verify the previous blocker and selected `marketing:3` material selection without printing private content.
2. Use the fresh content-owner approval to create the smallest local-private question coverage and paper plan inputs for `marketing:3`.
3. Verify the new inputs by counts, scope labels, subject labels, question-type count, and paper-plan count only.
4. Update state, queue, evidence, and audit with redacted results.
5. Run scoped formatting and Module Run v2 closeout gates, then commit, fast-forward merge, push, and delete the short branch.

## Result

The local-private content pack now has `marketing:3` question coverage and a matching paper plan. No DB, browser/runtime,
Provider, staging/prod, Cost, source/test/dependency/schema/seed, or employee import action was executed.

Next required task: rerun the Scenario 10 content-scope provisioning preflight from the affected node and only then resume
Scenario 10 browser login and standard employee learning.
