# 2026-07-04 Full-chain Scenario 4 Standard Org Package Rerun After Employee Input Provisioning Plan

## Task

- Task id: `full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04`
- Source blocked task: `full-chain-scenario-4-standard-org-package-2026-07-04`
- Provisioning dependency: `full-chain-scenario-4-standard-employee-input-provisioning-2026-07-04`
- Kind: `local_acceptance_runtime_pre_mutation_source_gate`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Scenario selector label: `fc_scenario_4_standard_org_package`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## SSOT Read List

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
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/authorization-matrix.yaml`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import-selector.json`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import.csv`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/app/api/v1/admin-accounts/route.ts`
- `src/app/api/v1/org-auths/route.ts`
- `src/app/api/v1/employees/import/route.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/validators/admin-account-creation.ts`
- `src/server/validators/org-auth.ts`
- `src/server/validators/employee-account.ts`
- `src/server/contracts/organization-auth-contract.ts`
- `tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts`

## Scope

This task reruns Scenario 4 from the pre-mutation gate after the standard employee input provisioning task. It must
confirm that all required product runtime surfaces exist before starting the app, using browser/e2e, or mutating the
isolated DB.

Scenario 4 requires:

- standard enterprise `org_auth` creation through the operations product flow;
- standard organization admin creation and explicit organization binding through a governed product flow;
- standard employee import with more than 5 data rows and no authorization-scope columns;
- aggregate verification after product flow execution;
- standard organization role denial for advanced-only capabilities.

## Execution Plan

1. Verify repository branch cleanliness and read all listed SSOT, traceability, prior evidence/audit, source, tests, and
   private metadata selectors without outputting private values.
2. Recheck standard employee input metadata: selector present, more than 5 data rows, no forbidden authorization-scope
   columns.
3. Inspect product runtime routes before mutation:
   - `/api/v1/org-auths` supports operations-managed standard authorization creation.
   - `/api/v1/employees/import` supports target-organization employee import.
   - a governed product route must support `org_standard_admin` creation and explicit `admin_organization` binding.
4. Stop before local app startup and DB writes if the organization-admin create/bind route is missing, incomplete, or
   only represented as a static preview.
5. If the source gate passes, start the local app and continue product flow execution; if it fails, write blocked
   evidence/audit, validate, commit, fast-forward merge, push, delete branch, and split the smallest repair task.

## Stop Rules

Stop if the target DB boundary is ambiguous, private input is missing or undersized, employee import contains
authorization fields, source review shows a required product route gap, creating organization admins would require a
manual DB write, permissions would be weakened, evidence redaction risk appears, or Provider, staging/prod, Cost
Calibration, destructive DB, dependency, release readiness, final Pass, or production usability work is needed.

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04`
