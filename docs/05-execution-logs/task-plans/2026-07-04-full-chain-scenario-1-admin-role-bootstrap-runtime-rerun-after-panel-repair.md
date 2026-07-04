# 2026-07-04 Full-chain Scenario 1 Admin Role Bootstrap Runtime Rerun After Panel Repair

## Task

- Task id: `full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-after-panel-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-after-panel-repair-2026-07-04`
- Goal: rerun Scenario 1 from the repaired `/ops/users` node and prove bootstrap `super_admin` creates `ops_admin` and `content_admin` through the product runtime flow in the isolated local DB.
- Restart point: Scenario 1 `/ops/users` after `full-chain-scenario-1-admin-ops-empty-state-role-panel-repair-2026-07-04`.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered: local app startup, browser automation, private credentials in memory only, product login, product admin account creation flow, selector-scoped aggregate DB verification, redacted evidence/audit, commit, fast-forward merge to `master`, push `origin/master`, branch cleanup, and Scenario 2 continuation on pass.
- Not covered: source/test change, schema/migration/seed, dependency change, Provider, staging/prod/cloud/deploy/payment/external service, Cost Calibration, release readiness, final Pass, production usability claim, screenshots, raw DOM, trace, secrets, or raw DB rows.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-runtime-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-runtime-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-ops-empty-state-role-panel-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-ops-empty-state-role-panel-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(admin)/ops/users/page.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`

## Execution Plan

1. Confirm no stale same-repository dev server blocks the run.
2. Confirm runtime DB target resolves to `tiku_full_chain_acceptance_20260704_001` without printing the connection string.
3. Run browser automation with credentials read into memory only.
4. Log in as `fc_bootstrap_super_admin`, reach `/ops/users`, and verify `后台账号创建` is visible.
5. Create `ops_admin` and `content_admin` through `/api/v1/admin-accounts`.
6. Perform selector-scoped aggregate DB verification for target role counts, audit delta, and forbidden scenario family counts.
7. Write redacted evidence and audit only.

## Validation

- `powershell.exe -NoProfile -Command "<browser product flow and aggregate DB verification with private credentials in memory>"`
- `npm.cmd exec -- prettier --write --ignore-unknown <changed governance files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed governance files>`
- `git diff --check`
- `git diff --name-only -- <blocked repo paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-after-panel-repair-2026-07-04`

## Stop Rules

Stop and split repair/provisioning if login fails, runtime DB target mismatches, private inputs are missing, account-domain collision occurs, authorization bypass is detected, redaction risk appears, dev-server/browser failure cannot be diagnosed inside scope, audit is missing, or execution requires source/test repair, schema/migration/seed, Provider/staging/prod/Cost, dependency change, destructive DB operation, release readiness, final Pass, or production usability claim.
