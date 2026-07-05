# 2026-07-04 Full-Chain Scenario 10 Standard Employee Learning Rerun After Duplicate Active Practice State Provisioning Plan

Status: pass

## Task

- Task id: `full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_standard_employee`
- Imported employee batch selector label: `fc_org_standard_employee_batch`
- Content scope label: `marketing:3`
- Scenario selector label: `fc_scenario_10_standard_employee_learning_rerun_after_duplicate_active_practice_state_provisioning`
- Role label: `org_standard_employee`

## Read Gate

Read before runtime/preflight:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-content-scope-provisioning-after-marketing-3-input.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-content-scope-provisioning-after-marketing-3-input.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-duplicate-active-practice-state-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-duplicate-active-practice-state-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(student)/home/page.tsx`
- `src/app/(student)/practice/page.tsx`
- `src/app/(student)/mock-exam/page.tsx`
- `src/app/(student)/organization-training/page.tsx`
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/server/services/practice-service.ts`
- `src/server/repositories/practice-repository.ts`
- `src/server/services/student-paper-service.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/student-experience.ts`
- `src/db/schema/organization-training.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/ui-input-contract.test.ts`
- `tests/unit/student-home-ui.test.ts`
- `tests/unit/student-practice-ui.test.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` (private, in-memory credential input only)
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import-selector.json` (private, shape/count only)
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import.csv` (private, in-memory login input only)

## Execution Plan

1. Confirm branch, state, queue, plan, evidence, and audit are aligned before runtime.
2. Run selector/DB target/private input/content/prior duplicate-state preflight; stop if the selected standard employee input, standard org auth, matching `marketing:3` content, or duplicate-state cleanup is missing.
3. Start or reuse local app on loopback against the isolated DB target without editing `.env*` or exposing env values.
4. Before any product DB write, run browser login smoke with hydrated/interactable readiness and submit-enabled proof.
5. Continue only from standard employee login and learning node; do not repeat employee import.
6. Create minimal standard learning data through product UI using existing `marketing:3` published content; do not trigger Provider or AI generation submit.
7. Verify standard employee cannot access `企业训练` or advanced AI route/surface.
8. Verify selector-scoped aggregate DB counts for learning data, permission boundary rows, Provider/AI absence, and no duplicate active practice groups.
9. Stop runtime, update evidence/audit/state/queue, run closeout gates, commit, fast-forward merge, push, delete short branch, then continue to the next approved scenario.

## Runtime Result

Runtime Scenario 10 rerun passed through browser login, `marketing:3` scope selection, resume-choice continuation, one standard practice answer submission, permission/surface boundary checks, selector-scoped aggregate DB verification, runtime cleanup, and final closeout gates.

## Stop Rules

Stop and split repair/provisioning on login failure, DB target mismatch, missing private selector input, missing standard employee selector, missing standard org auth, missing matching `marketing:3` content, duplicate active practice still present, permission bypass, redaction risk, product source/test repair need, schema/migration/seed need, Provider/staging/prod/Cost need, destructive DB operation, employee import repeat requirement, or release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, route/surface label, selector label, role label, scope label, aggregate counts, command name, pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete material/question/paper/resource/chunk content, private fixture contents, employee answers, and plaintext card values.
