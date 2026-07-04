# 2026-07-04 Full-chain Scenario 1 Admin Account Creation Flow Repair

## Task

- Task id: `full-chain-scenario-1-admin-account-creation-flow-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-1-admin-account-creation-flow-repair-2026-07-04`
- Goal: repair the Scenario 1 blocker by adding a governed product flow for `super_admin` to create platform `ops_admin` and `content_admin` accounts.
- Acceptance restart: after repair closeout, rerun Scenario 1 from the blocked admin-account creation node.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered in this repair: local source/test/doc repair, focused unit verification, redacted evidence/audit, commit, fast-forward merge to `master`, push `origin/master`, delete merged short branch, and affected-node rerun.
- Not covered: Provider execution/configuration, staging/prod/cloud/deploy/payment/external service, Cost Calibration, destructive DB operation, unscoped DB mutation, dependency or lockfile change, PR creation, force push, release readiness, final Pass, or production usability claim.
- Current repair will not start a dev server, browser, e2e, DB connection, schema migration, seed, Provider call, or private credential read.

## Read Gate

Governance and architecture:

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

Full-chain and Scenario 1 SSOT:

- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-repair-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`

Requirement and traceability:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`

Source and tests:

- `package.json`
- `src/db/schema/auth.ts`
- `src/server/models/auth.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/services/admin-user-org-auth-ops-service.ts`
- `src/server/services/admin-user-org-auth-ops-route.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/repositories/runtime-database.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/validators/user-registration.ts`
- `src/server/validators/user-password-reset.ts`
- `src/app/api/v1/users/route.ts`
- `src/app/api/v1/users/[publicId]/reset-password/route.ts`
- `src/app/(admin)/ops/users/page.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `tests/unit/phase-20-ra-01-05-password-reset-ops-flow.test.ts`
- `tests/unit/phase-11-system-ops-user-management-loop.test.ts`
- `tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`

## Root Cause

Scenario 1 intentionally stopped before runtime because the repository had no governed, product-backed `super_admin` flow to create platform backend `ops_admin` and `content_admin` accounts. Existing user management supports listing, detail, reset, enable, and disable, while `/api/v1/local-acceptance-sessions` is synthetic and cannot prove real account creation.

## Implementation Plan

1. Add a focused failing unit test for `super_admin` platform admin creation.
2. Add a narrow admin-account creation DTO and validator for `phone`, `name`, `password`, and target role limited to `ops_admin` or `content_admin`.
3. Extend the admin-flow repository interface with `createPlatformAdminAccount`.
4. Implement the Postgres repository method using existing `auth_user`, `auth_account`, and `admin` tables; hash passwords with the existing `better-auth/crypto` password hashing path.
5. Enforce admin-domain and learner/employee-domain phone collision checks before insert; return reason-coded non-secret results only.
6. Extend `createAdminFlowRuntimeRouteHandlers` with an `adminAccounts.collection.POST` handler; require an active admin session and `super_admin`, deny `ops_admin` and `content_admin`.
7. Add `/api/v1/admin-accounts` route wired to the admin-flow handler.
8. Add a small `super_admin`-only product UI form on `/ops/users` that posts to `/api/v1/admin-accounts` and refreshes the local list with returned non-secret summary.
9. Write redacted evidence and audit after source/test validation.

## Tests First

Initial failing test target:

```powershell
npm.cmd run test:unit -- tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts
```

Expected red phase: missing route/service contract for `adminAccounts.collection.POST` and repository method.

## Validation

- `npm.cmd run test:unit -- tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts`
- `npm.cmd run test:unit -- tests/unit/phase-20-ra-01-05-password-reset-ops-flow.test.ts tests/unit/phase-11-system-ops-user-management-loop.test.ts tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --write --ignore-unknown <changed files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-1-admin-account-creation-flow-repair-2026-07-04`

## Evidence Redaction

Evidence may record only task id, branch, route/surface label, selector label, role label, aggregate counts, command names, pass/fail/block, and redacted summary.

Evidence must not record account values, passwords, phone numbers, email addresses, connection strings, tokens, sessions, cookies, `localStorage`, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI I/O, full material/question/paper content, plaintext card values, or private fixture contents.

## Stop Rules

Stop and split a new repair/provisioning task if the implementation requires schema/migration/seed, destructive DB operation, unscoped DB mutation, dependency or lockfile change, Provider/staging/prod/Cost, permission weakening, fixture expansion, synthetic session proof, redaction risk, or product decision outside `super_admin` creating platform `ops_admin` and `content_admin`.
