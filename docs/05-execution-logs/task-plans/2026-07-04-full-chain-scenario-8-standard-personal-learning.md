# 2026-07-04 Full-Chain Scenario 8 Standard Personal Learning Plan

## Task

- Task id: `full-chain-scenario-8-standard-personal-learning-2026-07-04`
- Branch: `codex/full-chain-scenario-8-standard-personal-learning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Learner selector label: `fc_personal_contact_user_registered`
- Standard card selector label: `fc_redeem_code_standard_activation`
- Scenario selector label: `fc_scenario_8_standard_personal_learning`
- Role label: `personal_standard_student`

## Read Gate

Read gate status: pass.

Read before runtime:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-6-personal-registration-contact.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-6-personal-registration-contact.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/services/student-flow-runtime.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/services/student-mistake-book-runtime.ts`
- `src/server/services/student-experience/route-handlers.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/mock-exam-service.ts`
- `src/server/services/mistake-book-service.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/student-experience.ts`
- `src/db/schema/ai-rag.ts`
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `tests/unit/phase-8-student-mistake-book-runtime.test.ts`
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- `tests/unit/student-practice-ui.test.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Boundaries

- Allowed repo writes: this plan, matching evidence/audit, `project-state.yaml`, and `task-queue.yaml`.
- Private values: account and card values may be read only in memory from the approved private files; none may be copied to repo evidence or chat output.
- Product writes allowed: redeem the one standard activation card, create one standard `personal_auth`, create personal learning records for practice, `answer_record`, `mistake_book`, `mock_exam`, and `exam_report`.
- Direct DB use: selector-scoped aggregate verification only; no raw rows and no DB writes outside product runtime.
- Browser rule: wait for hydrated/interactable login inputs before filling private credentials; browser login success does not substitute for permission-boundary proof.
- Provider boundary: no real Provider execution, Provider credential configuration, staging/prod, or Cost Calibration. Local deterministic `ai_explanation` paths may be observed without recording raw AI content.
- Source boundary: no product source, test, dependency, schema, migration, seed, script, or fixture expansion changes in this task.

## Execution Steps

1. Run redacted private preflight for the registered learner selector, standard card selector, target DB, and content baseline aggregate.
2. Start the local app with process-only redacted runtime configuration against `tiku_full_chain_acceptance_20260704_001`.
3. Run minimal browser login smoke before product DB mutations: hydrated/interactable login form, real input/change observation, enabled submit, and authenticated landing.
4. Redeem the standard activation card through `/redeem-code`; confirm standard `personal_auth` is created and the card is consumed exactly once.
5. Exercise the standard learner surfaces: `/home`, `/practice`, `/mistake-book`, `/mock-exam`, and `/exam-report`.
6. Assert the advanced-only boundaries: standard personal learner cannot use `AI训练` or `企业训练` through home navigation or direct route access.
7. Run selector-scoped aggregate DB verification.
8. Stop task-owned runtime and verify cleanup.
9. Run focused unit tests and closeout gates.

## Stop Rules

Stop current runtime and split a repair/provisioning task if any of these occur:

- Private learner selector or standard card selector is absent, ambiguous, already conflicting, or cannot be parsed without exposing private values.
- DB target is not `tiku_full_chain_acceptance_20260704_001`.
- Browser login fails after hydrated/interactable readiness, or the login smoke cannot prove form-state binding before product DB writes.
- The standard card redemption creates the wrong `edition`, consumes the wrong card, creates `auth_upgrade`, or requires schema/seed/provisioning outside this task.
- Standard learner can access advanced-only AI generation or enterprise training capabilities.
- Practice, mistake_book, mock_exam, or exam_report fails in a way that requires product source/test repair.
- Any Provider/staging/prod/Cost Calibration/destructive DB/dependency/schema/migration/seed work is needed.
- Evidence redaction risk appears.
- Any release readiness, final Pass, or production usability claim would be required.

## Validation Commands

- `powershell.exe -NoProfile -Command "<redacted Scenario 8 private selector, standard card, content, and DB target preflight>"`
- `powershell.exe -NoProfile -Command "<local app startup with redacted process-only runtime env>"`
- `node - <redacted browser login, standard redeem, learning, boundary, and aggregate verification>`
- `docker compose exec -T tiku-postgres psql <redacted selector-scoped aggregate verification>`
- `npm.cmd run test:unit -- --run tests/unit/phase-8-student-authorization-redeem-runtime.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-8-standard-personal-learning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-8-standard-personal-learning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-8-standard-personal-learning.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-8-standard-personal-learning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-8-standard-personal-learning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-8-standard-personal-learning.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-8-standard-personal-learning-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-8-standard-personal-learning-2026-07-04 -SkipRemoteAheadCheck`
