# 2026-07-04 Full-chain Scenario 5 Advanced Employee Input Provisioning Plan

## Task

- Task id: `full-chain-scenario-5-advanced-employee-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-5-advanced-employee-input-provisioning-2026-07-04`
- Source blocked task: `full-chain-scenario-5-advanced-org-package-2026-07-04`
- Kind: `local_private_fixture_provisioning`
- Scenario selector label: `fc_scenario_5_advanced_org_package`
- Provisioned selector label: `fc_org_advanced_employee_batch`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

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
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/employee-import/template-fields.yaml`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/`
- `src/app/api/v1/employees/import/route.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/validators/employee-account.ts`

## Scope

Create the missing advanced employee import input outside the repository with more than 5 rows, product-compatible
columns, and no authorization fields. This task is local-private input provisioning only. It must not start the app, run
browser/e2e, connect to the DB, write DB data, edit source/tests, change schema/migrations/seeds, change dependencies,
call Provider, touch staging/prod, run Cost Calibration, or claim release readiness, final Pass, or production usability.

Private values may exist only in the local-private CSV. Repo evidence may record only selector label, file category, row
count, column count, forbidden-column count, command names, pass/fail/block status, and redacted summaries.

## Execution Plan

1. Verify the full-chain employee-import private directory exists and the advanced selector files are absent.
2. Generate a product-compatible private CSV with `phone`, `name`, and `initialPassword` columns and 6 data rows.
3. Write a selector JSON that names only the advanced employee selector label and local-private CSV file category.
4. Verify metadata only: row count, column count, forbidden authorization column count, duplicate count, and selector
   label.
5. Write redacted evidence/audit, validate docs/state/queue, commit, fast-forward merge, push, delete branch, then
   recreate Scenario 5 runtime branch from `master`.

## Stop Rules

Stop if the private directory is absent, target advanced files already exist with conflicting shape, provisioning would
require repo-stored private values, DB mutation, source/test/schema changes, dependency changes, Provider/staging/prod,
Cost execution, destructive DB action, or any private value would need to be printed into repo evidence or chat output.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted private advanced employee input provisioning>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted private advanced employee input metadata verification>`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-5-advanced-employee-input-provisioning-2026-07-04`
