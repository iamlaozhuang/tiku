# 2026-07-04 Full-Chain Scenario 11 Advanced Employee Pre-Provider Learning Plan

Status: active

## Task

- Task id: `full-chain-scenario-11-advanced-employee-pre-provider-learning-2026-07-04`
- Branch: `codex/full-chain-scenario-11-advanced-employee-pre-provider-learning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_advanced_employee`
- Imported employee batch selector label: `fc_org_advanced_employee_batch`
- Content scope label: `marketing:3`
- Scenario selector label: `fc_scenario_11_advanced_employee_pre_provider_learning`
- Role label: `org_advanced_employee`

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
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
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
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-login-input-state-binding-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-login-input-state-binding-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-employee-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-browser-harness-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-browser-harness-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-login-input-state-binding-repair.md`
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
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` (private, in-memory credential input only)
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import-selector.json` (private, shape/count only)
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import.csv` (private, in-memory login input only)

## Execution Plan

1. Confirm branch, state, queue, plan, evidence, and audit are aligned before runtime.
2. Run selector/DB target/private input/content/training/pre-state preflight. Stop if target DB, advanced employee selector, advanced `org_auth`, content baseline, or required published enterprise training baseline is missing.
3. Start or reuse local app on loopback against the isolated DB target without editing `.env*` or exposing env values.
4. Before any product DB write, run minimal browser login smoke with hydrated/interactable readiness and submit-enabled proof.
5. Exercise advanced employee learning with existing `marketing:3` content. Prefer objective practice answer to avoid raw employee answer evidence.
6. Check `企业训练` surface. If no preexisting published assigned training exists, stop and split provisioning/repair instead of inventing training data. If it exists, use product UI and record only aggregate counts.
7. Check `AI训练` surface is visible for advanced employee, but do not click AI出题/AI组卷 submit and do not call Provider.
8. Verify selector-scoped aggregate DB counts for learning/training, no formal-content contamination, and no Provider/AI call execution.
9. Stop runtime, update evidence/audit/state/queue, run closeout gates, commit, fast-forward merge, push, delete short branch, then continue to the next approved node.

## Stop Rules

Stop and split repair/provisioning on login failure, DB target mismatch, missing private selector input, missing advanced employee selector, missing active advanced `org_auth`, missing matching `marketing:3` published content, missing required assigned enterprise training baseline, permission bypass, redaction risk, product source/test repair need, schema/migration/seed need, Provider/staging/prod/Cost need, destructive DB operation, employee import repeat requirement, or release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, route/surface label, selector label, role label, scope label, aggregate counts, command name, pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete material/question/paper/resource/chunk content, private fixture contents, employee answers, and plaintext card values.

## Current Status

Task is materialized and stopped at selector/DB preflight. The target DB, private advanced employee selector, imported
advanced employees, active advanced `marketing:3` org auth, and published `marketing:3` paper/content aggregate were
present, but the assigned published enterprise training baseline count was 0. Browser/runtime was not started.

Closeout as blocked, then split a provisioning task for an assigned advanced organization `marketing:3` enterprise
training baseline. After provisioning closes, rerun S11 from the affected browser login / advanced employee learning
node without repeating employee import.
