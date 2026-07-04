# 2026-07-04 Full-chain Scenario 4 Org Admin Create Bind Flow Repair Plan

## Task

- Task id: `full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04`
- Kind: `minimal_source_test_repair`
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
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning.md`
- `src/db/schema/auth.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/validators/admin-account-creation.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts`
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`

## Scope

Repair only the missing governed product flow needed for Scenario 4:

- allow `super_admin` to create platform admins and organization admins;
- allow `ops_admin` to create organization admins only;
- require one selected active organization for `org_standard_admin` / `org_advanced_admin`;
- insert `admin_organization` binding in the same repository transaction as organization-admin account creation;
- preserve cross-domain account uniqueness, redacted responses, and audit logging;
- expose organization-admin creation in the operations UI without exposing private values.

Out of scope: DB schema changes, migrations, seeds, direct acceptance DB writes, Provider, staging/prod, Cost Calibration,
dependency changes, release readiness, final Pass, or production usability.

## Repair Plan

1. Add focused failing tests for org-admin create/bind behavior and permission boundaries.
2. Extend the admin-account creation contract and validator with organization-admin roles and required
   `organizationPublicId`.
3. Update the admin flow service permission check so `super_admin` can create all supported admin roles while `ops_admin`
   can create organization admins only.
4. Update the repository to verify the target organization and create `admin_organization` in the same transaction.
5. Update the operations UI account creation panel to select organization-admin roles and target organization when the
   actor is eligible.
6. Run focused tests, typecheck, format, Module Run gates, then close out and rerun Scenario 4 from the affected node.

## Stop Rules

Stop if the repair would weaken admin authorization, permit organization admins to create accounts, allow organization
admin creation without an organization binding, bypass cross-domain account uniqueness, require schema/migration/seed,
introduce dependency changes, expose private values, or need Provider/staging/prod/Cost/destructive DB/release/final
approval.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts`
- `npm.cmd run test:unit -- tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04`
