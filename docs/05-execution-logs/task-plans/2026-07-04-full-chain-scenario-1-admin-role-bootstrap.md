# Full Chain Scenario 1 Admin Role Bootstrap Plan

Task id: `full-chain-scenario-1-admin-role-bootstrap-2026-07-04`

Branch: `codex/full-chain-scenario-1-admin-role-bootstrap-2026-07-04`

Status: blocked before runtime execution; centralized continuity approval package approved.

## Scope

Use the approved isolated local DB target label `tiku_full_chain_acceptance_20260704_001` and selector
`fc_bootstrap_super_admin` to prove, through product runtime flow, that `super_admin` creates `ops_admin` and
`content_admin`. Evidence is limited to task id, branch, route/surface labels, selector labels, role labels, aggregate
counts, command names, pass/fail/block status, and redacted summaries.

This task must stop before browser, DB write, or private credential use if source review shows that the product runtime
does not expose a governed admin-account creation path.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-goal-control-ledger.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-goal-control-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-repair-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`

## Source And Test Read List

- `package.json`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/users/route.ts`
- `src/app/(admin)/ops/users/page.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/services/admin-user-org-auth-ops-route.ts`
- `src/server/services/admin-user-org-auth-ops-service.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/services/local-acceptance-session-service.ts`
- `src/server/repositories/runtime-database.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/db/schema/auth.ts`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `e2e/credential-backed-8-role-local-acceptance.spec.ts`

## Pre-Runtime Finding

The current product runtime has login, user listing/detail, ordinary user lifecycle, organization, employee,
`org_auth`, and `redeem_code` operations. It does not expose a governed `super_admin` product flow to create platform
backend admins with `admin_role = ops_admin` or `admin_role = content_admin`.

The local acceptance session route only creates process-local synthetic sessions for `ops_admin` or `content_admin`.
Using it would bypass the required product account-creation proof and is outside this Scenario 1 approval.

## Stop Decision

Scenario 1 is blocked before dev-server/browser/DB execution. Continuing inside this task would require a source repair
that changes sensitive administrator-account permissions. That exceeds the approved runtime acceptance boundary and needs
a separate repair task with fresh approval.

## Continuity Rule Adjustment

The user requested a rule adjustment toward no-break serial progress by using centralized approval instead of repeated
approval stops. The exact bounded approval package is materialized at:

`docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`

Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

The current Scenario 1 blocked package can now be closed out, and the admin-account creation repair can run as a
separate task under the centralized local continuity boundary.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-repair-decision.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-role-bootstrap.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-repair-decision.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md
git diff --check
git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-1-admin-role-bootstrap-2026-07-04
```

## Non-Executed Items

- No dev server started.
- No browser/e2e executed.
- No private credential values read or printed.
- No DB connection, DB read, DB write, schema migration, seed, cleanup, reset, or destructive operation executed.
- No Provider, staging, production, deployment, payment, Cost Calibration, release readiness, final Pass, or production
  usability claim.
