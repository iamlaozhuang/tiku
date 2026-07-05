# 2026-07-04 Full-Chain Scenario 9 Advanced Personal Rerun After Browser Harness Repair Plan

Status: closed

## Task

- Task id: `full-chain-scenario-9-advanced-personal-rerun-after-browser-harness-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-9-advanced-personal-rerun-after-browser-harness-repair-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Learner selector label: `fc_personal_contact_user_registered`
- Upgrade card selector label: `fc_redeem_code_edition_upgrade`
- Scenario selector label: `fc_scenario_9_advanced_personal_rerun_after_browser_harness_repair`
- Role label: `personal_advanced_student`

## Read Gate

Already read for this task before runtime:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-8-standard-personal-learning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-8-standard-personal-learning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-browser-tab-mapping-harness-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-browser-tab-mapping-harness-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(student)/redeem-code/page.tsx`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/app/(student)/home/page.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/app/api/v1/redeem-codes/redeem/route.ts`
- `src/server/services/redeem-code-route.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/server/services/effective-authorization-service.ts`
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `src/server/services/redeem-code-authorization-service.test.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/ui-input-contract.test.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Execution Plan

1. Confirm private selector material is present and read values only in process memory: completed.
2. Confirm runtime DB target label and pre-run selector aggregates only: completed.
3. Start local app on loopback with the isolated DB target; write runtime logs only outside the repository: completed.
4. Run minimal browser login smoke before any product DB write: completed with hydrated/interactable readiness.
5. Continue from Scenario 9 affected node only: completed through product UI upgrade redemption.
6. Verify advanced personal surface discoverability without submitting AI generation, Provider work, prompts, or AI I/O: completed.
7. Verify selector-scoped post-run aggregate counts only: completed.
8. Stop runtime, update evidence/audit/state/queue, run scoped closeout gates, commit, fast-forward merge, push, and delete the short branch: closeout in progress.

## Stop Rules

Stop and split repair/provisioning if any of these occur: login failure, DB target mismatch, missing private selector input, account/card domain conflict, permission bypass, redaction risk, product source/test repair need, schema/migration/seed need, Provider/staging/prod/Cost boundary, destructive DB operation, or any release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, route/surface label, selector label, role label, aggregate counts, command name, pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete material/question/paper/resource/chunk content, private fixture contents, and plaintext card values.

## Runtime Result

Pass. Scenario 9 affected-node rerun completed from browser login through product UI upgrade redemption and advanced personal surface discovery. No Scenario 8 standard redemption or learning data was repeated. No AI generation submit, Provider, staging/prod, Cost Calibration, source/test/dependency/schema/seed change, destructive DB operation, release readiness, final Pass, or production usability claim occurred.
