# 2026-07-04 Full-chain Scenario 1 Admin Ops Empty State Role Panel Repair

## Task

- Task id: `full-chain-scenario-1-admin-ops-empty-state-role-panel-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-1-admin-ops-empty-state-role-panel-repair-2026-07-04`
- Goal: repair `/ops/users` so an authenticated `super_admin` role context can render the governed admin account creation panel on a bootstrap-only isolated DB where all operational lists are empty.
- Restart point: Scenario 1 `/ops/users` node after runtime rerun block.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-runtime-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-runtime-rerun.md`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/app/(admin)/ops/users/page.tsx`
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `tests/unit/phase-11-audit-log-coverage-hardening.test.ts`
- `tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`

## Root Cause

`/ops/users` maps loaded data to `loadState: "empty"` when all operational lists are empty. The current predicate ignores `currentAdminRoles`, so a bootstrap-only isolated DB with an authenticated `super_admin` hides the admin account creation surface even though the role context is valid and the service-level creation permission remains strict.

## Implementation Plan

1. Add a small role-aware workspace readiness predicate for admin ops data.
2. Keep the existing `super_admin` check around `AdminAccountCreationPanel`.
3. Add a focused unit regression for the bootstrap-only case: all operational arrays empty, `currentAdminRoles=["super_admin"]`, page renders `/ops/users` workspace and the `后台账号创建` region instead of empty state.
4. Do not change API contracts, permission checks, database schema, migrations, seeds, package files, fixtures, or evidence redaction.

## Validation

- `npm.cmd run test:unit -- tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --write --ignore-unknown <changed files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `git diff --name-only -- <blocked repo paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-1-admin-ops-empty-state-role-panel-repair-2026-07-04`

## Stop Rules

Stop and split a new task if the fix requires permission weakening, fixture expansion in repository, schema/migration/seed, dependency changes, Provider/staging/prod/Cost, destructive DB operation, redaction downgrade, or product decision beyond rendering the existing super-admin-only panel for an already-authenticated role context.
