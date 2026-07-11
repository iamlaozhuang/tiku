# 0704 Ops User Filter Contract Repair

## Task Metadata

- taskId: `0704-ops-user-filter-contract-repair-2026-07-11`
- branch: `codex/0704-ops-user-filter-contract-repair`
- base: latest `origin/master`
- goal: make the existing user-management filters, keyword search, and registration-time ordering reach the user repository without changing permissions or lifecycle behavior.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- latest user-management UI plans, redacted evidence, audits, approved screenshot, and target source/tests.

## Scope

1. Add failing runtime tests proving `status`, `userType`, `sortBy`, `sortOrder`, and normalized `keyword` reach `listUsers`.
2. Add a failing UI test proving the user keyword control is labelled, sends `keyword`, and resets pagination to page one.
3. Reuse the validated list-query readers already used by adjacent admin runtimes.
4. Honor the selected existing user sort field in the repository; do not alter filters, enums, response envelopes, or authorization.
5. Keep organization loading limited to the existing backend-account creation context.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit
- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/server/services/admin-flow-runtime.test.ts`
- `tests/unit/admin-ops-summary-first-ui.test.ts`

## Explicit Exclusions

- no permission, session, account lifecycle, authorization, edition, card, or organization business-rule change
- no database schema, migration, seed, direct database access, or raw row capture
- no dependency, package, lockfile, Provider, Cost Calibration, env/secret, staging, production, deploy, PR, or force-push work
- no new screenshot, raw DOM, browser trace, or credential use

## TDD And Verification

1. RED: targeted runtime and UI tests fail only because query fields/keyword UI are absent.
2. GREEN: apply the smallest parser, repository ordering, and UI query changes.
3. Adversarial review: role boundary, data boundary, sensitive values, edition boundary, employee/admin separation, and UI states.
4. Run targeted tests, lint, typecheck, `git diff --check`, Module Run v2 pre-commit and pre-push readiness.
5. Record redacted evidence, create one reviewable commit, fast-forward merge to `master`, rerun master gates, push `origin/master`, delete the short branch, and confirm clean alignment.

## Acceptance

- `disabled`, `personal`, and `employee` filters reach the repository and cannot expand role access.
- blank keyword becomes `null`; a nonblank keyword searches name or phone through the existing repository condition.
- registration-time ascending/descending selection controls database ordering and preserves pagination totals.
- filter, keyword, sort, and page-size changes return to page one.
- empty, error, unauthorized, pagination, reset-password, and enable/disable behavior remain intact.
- no sensitive value is written to evidence or committed output.
