# 2026-07-04 Full-chain Scenario 5 Advanced Org Package Plan

## Task

- Task id: `full-chain-scenario-5-advanced-org-package-2026-07-04`
- Branch: `codex/full-chain-scenario-5-advanced-org-package-2026-07-04`
- Kind: `local_acceptance_runtime_browser_db_aggregate`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Scenario selector label: `fc_scenario_5_advanced_org_package`
- Advanced org admin selector label: `fc_org_advanced_admin_created_by_ops`
- Advanced employee selector label: `fc_org_advanced_employee_batch`
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
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-employee-input-provisioning.md`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/organization-tree/organization-tree-plan.json`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import.csv`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import-selector.json`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/app/api/v1/organizations/route.ts`
- `src/app/api/v1/org-auths/route.ts`
- `src/app/api/v1/admin-accounts/route.ts`
- `src/app/api/v1/employees/import/route.ts`
- `src/app/api/v1/organization-analytics/dashboard-summary/route.ts`
- `src/app/api/v1/organization-ai-generation-requests/route.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/validators/org-auth.ts`
- `src/server/validators/admin-account-creation.ts`
- `src/server/validators/employee-account.ts`

## Scope

Run Scenario 5 locally through the product runtime: `ops_admin` creates the advanced organization authorization package,
creates/binds `org_advanced_admin`, imports more than 5 advanced employees, then verifies that advanced organization
admin has advanced organization workspace access without triggering Provider execution.

Allowed product writes are limited to advanced `org_auth`, advanced organization-admin account/binding, and advanced
employee import rows created through product routes against the isolated DB. Direct DB work is limited to selector-scoped
aggregate verification. Evidence may record only selector labels, role labels, route/surface labels, counts, command
names, pass/fail/block status, and redacted summaries.

## Execution Plan

1. Preflight private input metadata for the advanced organization branch, advanced org admin selector, and advanced
   employee import.
2. Start the local app against `tiku_full_chain_acceptance_20260704_001` without printing env or connection strings.
3. Use browser/runtime automation to log in as `ops_admin`.
4. Create advanced package `org_auth` rows through `/api/v1/org-auths` for the approved expanded scopes.
5. Create `org_advanced_admin` through `/api/v1/admin-accounts` with organization binding.
6. Import the advanced employee CSV through `/api/v1/employees/import`.
7. Log in as `org_advanced_admin`; verify organization portal and advanced organization surfaces by allowed GET/navigation
   only. Do not POST organization AI/training or call Provider.
8. Verify negative boundaries: `org_advanced_admin` cannot use global operations surfaces, and standard organization
   admin remains unavailable/denied for advanced organization surfaces.
9. Run selector-scoped aggregate DB verification and redacted evidence/audit.
10. Validate docs/state/queue, commit, fast-forward merge, push, delete branch, and continue to Scenario 6.

## Stop Rules

Stop on login failure, DB target mismatch, private input mismatch, advanced org package overlap, quota failure,
organization binding failure, employee import rejection, standard role gaining advanced capability, `org_advanced_admin`
gaining global ops/content capability, redaction risk, dev-server/browser failure that cannot be diagnosed inside scope,
need for source/schema/migration/seed/dependency repair, Provider execution, staging/prod, Cost Calibration, destructive
DB operation, release readiness, final Pass, or production usability claim.

## Validation Commands

- `powershell.exe -NoProfile -Command <redacted Scenario 5 private metadata and DB target preflight>`
- `powershell.exe -NoProfile -Command <local app startup with redacted runtime env>`
- `node - <redacted Scenario 5 browser and product API flow>`
- `docker compose exec -T tiku-postgres psql <redacted selector-scoped aggregate verification>`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-5-advanced-org-package-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-5-advanced-org-package-2026-07-04 -SkipRemoteAheadCheck`
