# 2026-07-04 Full-Chain Scenario 11 Advanced Employee Affected-Node Rerun Plan

Status: blocked with closeout pass

## Task

- Task id: `full-chain-scenario-11-advanced-employee-affected-node-rerun-2026-07-04`
- Branch: `codex/full-chain-scenario-11-advanced-employee-affected-node-rerun-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_advanced_employee`
- Imported employee batch selector label: `fc_org_advanced_employee_batch`
- Content scope label: `marketing:3`
- Scenario selector label: `fc_scenario_11_advanced_employee_affected_node_rerun`
- Role label: `org_advanced_employee`
- Restart node: `s11_browser_login_advanced_employee_learning_and_enterprise_training_boundary`

## Read Gate

Read before task materialization:

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
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-session-cookie-contract-login-and-e2e-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-pre-provider-learning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-pre-provider-learning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(student)/home/page.tsx`
- `src/app/(student)/practice/page.tsx`
- `src/app/(student)/organization-training/page.tsx`
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/server/services/practice-service.ts`
- `src/server/repositories/practice-repository.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/student-experience.ts`
- `src/db/schema/organization-training.ts`
- `src/db/schema/ai-rag.ts`
- `tests/unit/ui-input-contract.test.ts`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/organization-training-employee-entry-surface.test.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/personal-ai-generation-result-route.test.ts`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` (private, in-memory credential input only)
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import-selector.json` (private, selector shape only)
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import.csv` (private, in-memory login input only)

## Requirement Mapping Result

- S11 previously stopped correctly because the assigned published enterprise training baseline count was `0`.
- The separate provisioning task then created one assigned published advanced organization `marketing:3` training baseline and closed out.
- This rerun starts only from the affected node: browser login, advanced employee learning, `企业训练` boundary, and `AI训练` no-submit boundary.
- S1-S10, employee import, S10 standard employee learning data, and old authorization flow are not repeated.
- `org_advanced_employee` must discover `AI训练` and assigned `企业训练` when effective advanced organization authorization covers the employee organization context.
- `AI训练` buttons submit generation requests and remain no-submit in this task; Provider, Prompt, raw AI I/O, Cost Calibration, staging, and prod are out of scope.

## Minimal Pre-Browser Checklist

Before local browser/runtime:

| Item                   | Required result                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| selector               | S11 advanced employee selector and imported employee batch selector exist by label/count only   |
| account                | advanced employee login input is available in memory only                                       |
| authorization          | active advanced `marketing:3` organization authorization exists                                 |
| content baseline       | published `marketing:3` paper/question aggregate exists                                         |
| training baseline      | assigned published `marketing:3` enterprise training aggregate exists                           |
| DB target              | target label is `tiku_full_chain_acceptance_20260704_001`                                       |
| forbidden repeat items | employee import, S10 learning data, S1-S10 runtime, and old authorization flow are not repeated |

If any item is missing, stop and split a smaller provisioning/repair task. Do not enter runtime.

## Execution Plan

1. Align branch, state, queue, plan, evidence, and audit before runtime.
2. Run selector, DB target, private input, authorization, content, training, and forbidden-repeat preflight.
3. Start local app on loopback only after preflight passes; do not expose env values.
4. Run browser login readiness smoke and wait for hydrated/interactable login inputs before filling private credentials.
5. Log in as the advanced employee using private values only in memory.
6. Observe learner home entries for `AI训练` and `企业训练`.
7. Exercise advanced employee practice learning only if the product route can do so without Provider, schema, source/test changes, or fake data.
8. Exercise assigned `企业训练` through the product UI, recording only surface labels and aggregate counts.
9. Observe `AI训练` surface without clicking `AI出题` or `AI组卷` submit actions.
10. Run selector-scoped aggregate DB verification for learning/training and no Provider/AI-call delta.
11. Stop runtime, update evidence/audit/state/queue, run closeout gates, commit, fast-forward merge, push, delete branch, then continue to the next approved node.

## Stop Rules

Stop and split repair/provisioning on login failure, DB target mismatch, missing private selector input, missing advanced
employee selector, missing active advanced `org_auth`, missing matching `marketing:3` published content, missing assigned
published enterprise training baseline, permission bypass, redaction risk, product source/test repair need,
schema/migration/seed need, Provider/staging/prod/Cost need, destructive DB operation, employee import repeat
requirement, S10 learning repeat requirement, or release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, route/surface label, selector label, role label, scope label, aggregate counts, command name,
pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization
header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete
material/question/paper/resource/chunk content, private fixture contents, employee answers, and plaintext card values.

## Current Status

Task is materialized and stopped at the DB target gate. Runtime was not started. The redacted preflight found the local
runtime DB target is loopback/local but not `tiku_full_chain_acceptance_20260704_001`.

Close out as blocked, then split a DB target alignment provisioning task. After provisioning closes, rerun S11 from the
same affected browser login / advanced employee learning node without repeating employee import, S10 learning data,
S1-S10 runtime, or old authorization flow.
