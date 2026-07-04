# 2026-07-04 Full-chain Scenario 4 Standard Employee Input Provisioning Plan

## Task

- Task id: `full-chain-scenario-4-standard-employee-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-4-standard-employee-input-provisioning-2026-07-04`
- Source blocked task: `full-chain-scenario-4-standard-org-package-2026-07-04`
- Kind: `local_private_fixture_provisioning`
- Scenario selector label: `fc_scenario_4_standard_org_package`
- Provisioned selector label: `fc_org_standard_employee_batch`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/employee-import/template-fields.yaml`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/server/validators/employee-account.ts`

## Scope

Create the missing standard employee import input outside the repository with more than 5 rows, product-compatible
columns, and no authorization fields. This task does not start the app, run browser/e2e, write DB data, edit source/tests,
change schema/migrations/seeds, call Provider, deploy, run Cost Calibration, or claim release readiness/final
Pass/production usability.

Private values may exist only in the local-private CSV. Repo evidence may record only selector label, file category,
row count, column count, forbidden-column count, command names, and pass/fail/block status.

## Execution Plan

1. Create the full-chain standard employee import directory under the local-private fixture pack.
2. Write a product-compatible CSV with `phone`, `name`, and `initialPassword` columns and 6 data rows.
3. Verify metadata only: row count, column count, forbidden authorization columns, and selector label.
4. Write redacted evidence/audit, validate docs/state/queue, commit, fast-forward merge, push, delete branch, and rerun
   Scenario 4 from the pre-mutation gate.

## Stop Rules

Stop if provisioning would require repo-stored private values, DB mutation, source/test/schema changes, dependency
changes, Provider/staging/prod/Cost execution, destructive DB action, or any release readiness/final Pass/production
usability claim.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted private standard employee input provisioning>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted private standard employee input metadata verification>`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-standard-employee-input-provisioning-2026-07-04`
