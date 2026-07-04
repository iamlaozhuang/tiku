# 2026-07-04 Full-chain Scenario 4 Standard Org Package Rerun After Org-admin Input Provisioning Plan

## Task

- Task id: `full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Scenario selector label: `fc_scenario_4_standard_org_package`
- Standard org-admin selector label: `fc_org_standard_admin_created_by_ops`
- Standard employee selector label: `fc_org_standard_employee_batch`
- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Private Input Files Used

- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/organization-tree/organization-tree-plan.json`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import.csv`

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
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-org-admin-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-org-admin-input-provisioning.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(admin)/ops/organizations/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/app/api/v1/organizations/route.ts`
- `src/app/api/v1/org-auths/route.ts`
- `src/app/api/v1/admin-accounts/route.ts`
- `src/app/api/v1/employees/import/route.ts`
- `src/server/auth/session-route.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/contracts/organization-auth-contract.ts`
- `src/server/validators/org-auth.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/validators/admin-account-creation.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/validators/employee-account.ts`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `package.json`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Boundary

- Allowed runtime actions: local app startup, browser/e2e against localhost, product API/UI writes for Scenario 4 only, private account/employee input read into process memory only, selector-scoped aggregate DB verification.
- Allowed product mutations: standard `org_auth` creation, standard `org_standard_admin` creation and `admin_organization` binding, standard employee account import for more than 5 rows.
- Allowed direct DB use: aggregate read-only verification against the approved isolated DB target.
- Forbidden: source/test/dependency/schema/migration/seed edits, destructive DB operation, unscoped DB mutation, Provider execution/configuration/secret use, staging/prod/deploy/payment, Cost Calibration, release readiness, final Pass, production usability, screenshots, traces, raw DOM, raw DB rows, internal ids, credential/session/header/token/localStorage output, private fixture contents, plaintext card values, full material/question/paper content, raw Prompt, Provider payload, raw AI I/O.

## Execution Plan

1. Verify branch and repository cleanliness before runtime.
2. Verify private selector presence and safe metadata counts without printing private values.
3. Verify runtime DB label alignment before product mutation.
4. Start local app only if no compatible localhost runtime is already available; do not print env or connection values.
5. Use browser/e2e to reach the login and operations organization surfaces with the `ops_admin` selector.
6. Use product route/API flow to create standard organization authorization rows for the scenario package.
7. Use product route/API flow to create and bind the standard organization administrator account to the selected organization.
8. Use product route/API flow to import the standard employee batch into the selected organization.
9. Use organization-admin login or route probe only for role/surface boundary status; do not capture or print session material.
10. Run selector-scoped aggregate DB verification and write only counts/statuses to evidence.
11. Stop local app runtime started by this task.
12. Write redacted evidence/audit, run scoped formatting and Module Run v2 gates, then close out through commit, fast-forward merge, push, and branch deletion.

## Stop Rules

Stop and split repair/provisioning if any of these occurs:

- Runtime DB target does not match `tiku_full_chain_acceptance_20260704_001`.
- Required private selector or employee input is absent or validator-incompatible.
- Login fails, route access is denied unexpectedly, or product flow needs missing UI/API support.
- Product API indicates account-domain conflict, authorization overlap that cannot be explained by current scenario state, quota problem, validation failure, permission bypass, or organization binding failure.
- Standard organization admin gains advanced-only enterprise training, organization AI, global operations, content authoring, Provider/cost, or raw log capability.
- Evidence would require any forbidden sensitive field or raw runtime artifact.
- Any source repair, schema/migration/seed, dependency, destructive DB action, Provider/staging/prod/Cost, release readiness, final Pass, or production usability decision becomes necessary.

## Evidence Plan

Evidence may record only task id, branch, target DB label, selector labels, role labels, route/surface labels, command names, pass/fail/block, redacted summaries, and aggregate counts.

Required aggregate labels:

- `org_auth_standard_created_count`
- `org_auth_standard_active_count`
- `org_auth_standard_effective_edition_standard_count`
- `admin_organization_standard_binding_count`
- `org_standard_admin_created_count`
- `standard_employee_imported_count`
- `standard_employee_rejected_count`
- `standard_org_admin_advanced_surface_allowed_count`
- `standard_org_admin_global_ops_allowed_count`
- `private_value_output_count`

## Validation Commands

- `powershell.exe -NoProfile -Command "<redacted Scenario 4 private metadata and DB target preflight>"`
- `powershell.exe -NoProfile -Command "<local app startup with redacted runtime env>"`
- `node - <redacted Scenario 4 browser and product API flow>`
- `docker compose exec -T tiku-postgres psql <redacted selector-scoped aggregate verification>`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning-2026-07-04 -SkipRemoteAheadCheck`

## Requirement Mapping Result

- Scenario 4 maps to full-chain Track T3: organization tree, authorization, organization admin account delivery, and employee import.
- `US-06-03`, `US-06-04`, `US-06-13`, and `US-06-14` require platform-owned organization authorization, employee import, organization-admin account creation, and work-space separation.
- ADR-007 and edition-aware authorization requirements require source `edition` to remain `standard` for this standard package and forbid computed `effectiveEdition` from overwriting source authorization.
- `CT-REQ-050`, `CT-REQ-051`, `CT-REQ-054`, and `CT-REQ-055` constrain organization-admin and employee-import behavior: org-standard admins are scoped/read-only for roster/status and must not receive advanced-only enterprise training or organization AI capability.

## Non-Claims

This task does not claim release readiness, final Pass, production usability, Provider readiness, Cost Calibration, staging/prod readiness, or complete full-chain acceptance.
