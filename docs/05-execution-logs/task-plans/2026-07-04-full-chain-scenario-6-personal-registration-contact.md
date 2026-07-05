# 2026-07-04 Full-Chain Scenario 6 Personal Registration Contact Plan

Task id: `full-chain-scenario-6-personal-registration-contact-2026-07-04`

Status: closed.

## Scope

- Branch: `codex/full-chain-scenario-6-personal-registration-contact-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scenario selector label: `fc_scenario_6_personal_registration_contact`
- Private input selector label: `fc_personal_contact_user_registered`
- User role label after registration: `personal_no_auth_student`
- Product mutation allowed: one personal user registration through product runtime only.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-6-personal-contact-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-6-personal-contact-input-provisioning.md`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-01-09-contact-config-runtime.md`
- `src/app/(auth)/register/page.tsx`
- `src/app/api/v1/users/route.ts`
- `src/server/auth/user-registration-route.ts`
- `src/server/services/user-registration-service.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/session-cookie.ts`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/app/(student)/redeem-code/page.tsx`
- `src/lib/local-purchase-guidance-contact-config.ts`
- `src/app/api/v1/redeem-codes/redeem/route.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `tests/unit/student-register-ui.test.ts`
- `src/server/auth/user-registration-route.test.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`
- `src/server/services/user-registration-service.test.ts`
- `tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` selector shape only.

## Procedure

1. Verify private selector presence and DB target by redacted shape/counts only.
2. Start the local app with a process-only redacted runtime environment targeting the isolated DB.
3. Before any product DB write, run browser form readiness on `/register`: page hydrated/interactable, real input/change events update React state, submit enables with valid private input.
4. Submit registration once through the product browser flow and verify redirect to `/redeem-code`.
5. Verify the redeem/contact surface label `student-purchase-guidance-contact-config` is visible without recording contact values or DOM.
6. Run selector-scoped aggregate DB verification: registered personal user/session counts are present, `personal_auth` count remains 0, and Scenario 7 card status counts are unchanged.
7. Stop task-owned runtime, update evidence/audit/state/queue, run closeout gates, commit, ff-merge, push, delete branch.

## Stop Rules

Stop and split repair/provisioning if private input is missing, DB target mismatches, registration duplicate/conflict appears, the browser form is not hydrated/interactable before submit, registration fails or does not establish session, contact surface is absent, any `personal_auth` is created, a card is consumed, redaction risk appears, source/test/schema/dependency changes are needed, Provider/staging/prod/Cost/destructive DB is needed, or any release readiness/final Pass/production usability claim would be required.
