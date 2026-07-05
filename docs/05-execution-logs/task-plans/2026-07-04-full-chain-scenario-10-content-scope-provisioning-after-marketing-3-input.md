# 2026-07-04 Full-Chain Scenario 10 Content-Scope Provisioning After Marketing 3 Input Plan

Status: closed

## Task

- Task id: `full-chain-scenario-10-content-scope-provisioning-after-marketing-3-input-2026-07-04`
- Branch: `codex/full-chain-scenario-10-content-scope-provisioning-after-marketing-3-input-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_standard_employee`
- Imported employee batch selector label: `fc_org_standard_employee_batch`
- Selected scope label: `marketing:3`
- Provisioning selector label: `fc_scenario_10_standard_employee_content_scope`
- Scenario input selector label: `fc_scenario_10_standard_employee_marketing_3_question_paper_input`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-content-scope-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-content-scope-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-content-pack-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-content-pack-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-marketing-3-question-paper-input-provisioning.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-10-marketing-3-question-paper-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `src/db/schema/auth.ts`
- `src/db/schema/paper.ts`
- `src/db/schema/student-experience.ts`
- `src/db/owner-preview-resource-import.ts`
- `tests/unit/owner-preview-resource-import.test.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/repositories/student-paper-repository.ts`
- Private full-chain content-pack metadata and S10 `marketing:3` question/paper input files under the local-private package root, read in memory without repo evidence of raw private content.

## Boundary

- Allowed: selector-scoped local DB preflight and non-destructive idempotent provisioning of the smallest `marketing:3` published content scope needed for Scenario 10 standard employee learning.
- Allowed DB target: isolated local DB label `tiku_full_chain_acceptance_20260704_001` only.
- Allowed private input use: local-private material selection, question coverage, and paper plan counts/content in memory only.
- Blocked: browser/runtime, employee import repetition, product source/test/dependency changes, schema/migration/seed changes, Provider, staging/prod, Cost Calibration, destructive DB operations, release readiness, final Pass, production usability, and evidence containing private values or raw content.
- Evidence may record only task ids, branch, selector labels, role labels, profession/level/subject labels, aggregate counts, command names, pass/fail/block, and redacted summaries.

## Execution Plan

1. Verify selector, DB target, standard employee, standard org authorization, and the new `marketing:3` private question/paper input by redacted aggregates only.
2. If the target DB or private inputs are missing, stop and split a narrower provisioning task.
3. Idempotently upsert only `marketing:3` material, questions, question options/scoring points as needed, one published paper, one section, and paper-question bindings under deterministic selector labels.
4. Verify overlap counts: selected employee active standard scope, published `marketing:3` paper, paper-question count, available question count, available material count, and no employee import repetition.
5. Run focused unit validation, scoped formatting, diff checks, Module Run v2 gates, commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, then resume Scenario 10 from browser login and learning node.

## Stop Rules

Stop immediately if any step needs employee import repetition, product source repair, permission weakening, fake content, retargeting existing `monopoly:3` content, redaction relaxation, schema/migration/seed, dependency change, Provider, staging/prod, Cost Calibration, destructive DB operation, ambiguous DB target, missing standard employee selector, missing standard org auth, or release readiness/final Pass/production usability claim.

## Result

The affected-node content-scope provisioning passed. The isolated DB now contains a selector-scoped published `marketing:3` paper with seven paper-question bindings, seven available question types, two available material rows, and no standard employee learning rows created by this provisioning task.

Next required task: resume Scenario 10 from browser login and standard employee learning node without repeating employee import.
