# 2026-07-04 Full-Chain Scenario 6 Personal Contact Input Provisioning Plan

Task id: `full-chain-scenario-6-personal-contact-input-provisioning-2026-07-04`

Status: closed.

## Goal

Provision only the missing private registration input for Scenario 6 selector
`fc_personal_contact_user_registered`, so the later Scenario 6 browser task can register a no-auth personal user and
verify the contact/redeem surface without consuming any `redeem_code`.

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
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-01-09-contact-config-runtime.md`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/users/route.ts`
- `src/server/auth/user-registration-route.ts`
- `src/server/services/user-registration-service.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/services/session-service.ts`
- `src/server/auth/session-cookie.ts`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/app/(student)/redeem-code/page.tsx`
- `src/app/api/v1/redeem-codes/redeem/route.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/lib/local-purchase-guidance-contact-config.ts`
- `src/server/services/contact-config-service.ts`
- `src/server/contracts/contact-config-contract.ts`
- `src/app/api/v1/contact-configs/route.ts`
- `src/features/admin/contact-config/AdminContactConfigPage.tsx`
- `tests/unit/student-register-ui.test.ts`
- `src/server/auth/user-registration-route.test.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`
- `src/server/services/user-registration-service.test.ts`
- `src/server/auth/local-session-runtime.test.ts`
- `tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`
- `tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` path and selector-shape checks only.

## Boundary

Allowed repository writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- the paired evidence file
- the paired audit file

Allowed private write:

- Add a private section for `fc_personal_contact_user_registered` to
  `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`.

Blocked:

- Product source, tests, schema, migration, seed, dependency, lockfile, dev server, browser/e2e, Provider, staging/prod,
  Cost Calibration, destructive DB, card consumption, release readiness, final Pass, and production usability claims.

## Procedure

1. Verify the selector label exists in the private account plan but has no concrete private section.
2. Generate a valid personal registration input in memory and write it only to the private account plan.
3. Verify by redacted shape only: selector section exists and has `phone`, `password`, and `name` fields.
4. Optionally run selector-scoped collision/readiness checks that output counts only.
5. Update evidence/audit/state/queue without recording private values.
6. Run closeout gates and merge before restarting Scenario 6.

## Stop Rules

Stop if the private file is missing, the selector already has conflicting concrete fields, DB target is ambiguous, a
phone-domain collision cannot be resolved without exposing private values, or any repo evidence would need private
values.
