# 2026-07-04 Full-chain Scenario 4 Standard Org Package Rerun After Org Admin Create Bind Flow Repair Plan

## Task

- Task id: `full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04`
- Repair dependency: `full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04`
- Kind: `local_acceptance_pre_runtime_private_input_gate`
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
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-org-admin-create-bind-flow-repair.md`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import-selector.json`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import.csv`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/app/api/v1/admin-accounts/route.ts`
- `src/app/api/v1/org-auths/route.ts`
- `src/app/api/v1/employees/import/route.ts`
- `src/server/auth/session-route.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/validators/admin-account-creation.ts`
- `src/server/validators/org-auth.ts`
- `src/server/validators/employee-account.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/contracts/organization-auth-contract.ts`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts`
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Scope

This task reruns Scenario 4 from the affected node after the organization-admin create/bind source repair. Before
starting the app, browser/e2e, or isolated DB mutation, it must verify that required private account inputs for
`org_standard_admin` and `org_advanced_admin` exist outside the repository.

The task may inspect private-file structure only through boolean field-presence checks. It must not print or record
account values, phone, email, password, connection string, token, session, cookie, raw DB row, internal id, screenshot,
raw DOM, trace, Provider payload, Prompt, raw AI I/O, full private fixture contents, plaintext card values, release
readiness, final Pass, or production usability.

## Execution Plan

1. Verify short branch and read all listed SSOT, traceability, previous Scenario 4 evidence/audit, repair evidence/audit,
   private selector metadata, source, tests, and Playwright usage instructions.
2. Confirm standard employee input remains present with more than 5 rows and no forbidden authorization columns.
3. Confirm organization-admin private input sections exist for `fc_org_standard_admin_created_by_ops` and
   `fc_org_advanced_admin_created_by_ops`.
4. Stop before local app startup and DB writes if either organization-admin private input is missing.
5. If the input gate passes in a future rerun, start local app, use browser/e2e and product flows to create standard
   `org_auth`, organization admin binding, and standard employees, then run selector-scoped aggregate DB verification.

## Stop Rules

Stop if private org-admin input is missing, target DB is ambiguous, standard employee import is undersized, employee
import contains authorization fields, login or session setup fails, product flow would need direct DB insertion, source
repair is required, permissions would be weakened, evidence redaction risk appears, or Provider, staging/prod, Cost
Calibration, destructive DB, dependency, release readiness, final Pass, or production usability work is needed.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted private org-admin input presence check>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted standard employee metadata check>`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair-2026-07-04`
