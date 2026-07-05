# 2026-07-04 Full-Chain Scenario 10 Standard Employee Content-Scope Provisioning Plan

Status: closed

## Task

- Task id: `full-chain-scenario-10-standard-employee-content-scope-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-10-standard-employee-content-scope-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_standard_employee`
- Imported employee batch selector label: `fc_org_standard_employee_batch`
- Provisioning selector label: `fc_scenario_10_standard_employee_content_scope`
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
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-knowledge-baseline-db-provisioning.md`
- `src/db/schema/auth.ts`
- `src/db/schema/paper.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/repositories/student-paper-repository.ts`
- `src/server/services/student-paper-service.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/services/student-paper-service.test.ts`

## Boundary

- Do not repeat employee import.
- Do not start browser/runtime until this provisioning task closes and Scenario 10 rerun begins.
- Do not change product source, tests, dependencies, schema, migrations, seed, or scripts in this task.
- Do not call Provider, staging/prod, Cost Calibration, or AI generation submit.
- Do not use destructive DB operations.
- Evidence may record only task ids, branch, route/surface labels, selector labels, role labels, profession/level/subject labels, aggregate counts, command names, pass/fail/block, and redacted summary.

## Execution Plan

1. Materialize this task in state, queue, plan, evidence, and audit.
2. Run selector, DB target, standard employee, standard org auth, and content-scope preflight using redacted aggregate output only.
3. If the preflight proves an approved non-destructive provisioning path, provision the smallest matching published content scope and verify overlap counts.
4. If the preflight shows missing selector, missing standard org auth, missing approved content/material baseline, or ambiguous scope decision, stop and split a narrower task or ask for product decision.
5. Run focused unit validation, scoped formatting, diff checks, Module Run v2 gates, commit, ff merge to `master`, push `origin/master`, delete the short branch, then rerun Scenario 10 from browser login and learning node.

## Stop Rules

Stop immediately if any step requires employee import repetition, product source repair, permission weakening, fake data, fixture expansion for convenience, redaction relaxation, schema/migration/seed, dependency change, Provider, staging/prod, Cost Calibration, destructive DB operation, or release readiness/final Pass/production usability claim.

## Preflight Result

This task stopped before DB write. The standard employee selector and standard organization authorization exist, but approved question/paper input and current DB content do not cover any selected standard employee scope. One selected scope has private material selection only; it still lacks approved question coverage and paper plan, so this task cannot safely create published content without a smaller content-pack input provisioning task.

Next required task: `full-chain-scenario-10-standard-employee-content-pack-input-provisioning-2026-07-04`.
