# 2026-07-04 Full-chain Scenario 3 Organization Tree Input Provisioning Plan

## Task

- Task id: `full-chain-scenario-3-organization-tree-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-3-organization-tree-input-provisioning-2026-07-04`
- Kind: `local_private_input_provisioning`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scenario selector label: `fc_scenario_3_org_tree`
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
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-account-plan-prep.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-after-panel-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `src/app/api/v1/organizations/route.ts`
- `src/app/api/v1/organizations/[publicId]/route.ts`
- `src/app/api/v1/organizations/[publicId]/enable/route.ts`
- `src/app/api/v1/organizations/[publicId]/disable/route.ts`
- `src/server/services/organization/route-handlers.ts`
- `src/server/services/organization/organization-lifecycle-service.ts`
- `src/server/repositories/organization/organization-repository.ts`
- `src/server/contracts/organization/organization-lifecycle-contract.ts`
- `src/server/mappers/organization/organization-lifecycle-mapper.ts`
- `src/server/validators/organization.ts`
- `src/app/(admin)/ops/organizations/page.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `tests/unit/phase-11-system-ops-organization-management-loop.test.ts`
- `tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`
- `tests/unit/organization/organization-auth-layering-lifecycle.test.ts`
- `tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts`
- `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
- `src/db/schema/auth.ts`

## Scope

This provisioning task creates the missing Scenario 3 organization-tree input in the local-private acceptance package.
It does not start the app, run a browser, connect to the DB, mutate DB state, call Provider, modify source/tests, or
store private fixture contents in the repository.

The private input must support a later product-flow Scenario 3 organization tree with:

- 2 branches: `standard`, `advanced`;
- 4 tiers per branch: `province`, `city`, `district`, `station`;
- 8 total organization node selector labels;
- 6 parent links;
- no org authorization, employee, admin-organization, card, Provider, Prompt, AI, or cost data.

## Execution Plan

1. Confirm the short branch and current worktree status.
2. Create the local-private organization-tree input file under the existing full-chain acceptance private package.
3. Validate only redacted metadata: file presence, node count, tier counts, branch counts, parent-link count, and no repo
   private-content storage.
4. Write this task plan, evidence, audit, state, and queue entries with redacted counts only.
5. Run scoped formatting, diff checks, Module Run v2 pre-commit hardening, then commit, fast-forward merge to `master`,
   push `origin/master`, delete the merged branch, and continue with Scenario 3 runtime.

## Stop Rules

Stop and split a repair/provisioning task if the private package cannot be written, selector/tier/parent metadata is
inconsistent, repository evidence would need private fixture contents, source/test/schema/package changes become
necessary, DB/browser/Provider/staging/Cost/destructive DB operations become necessary, or a release readiness/final
Pass/production usability claim would be needed.

## Validation Commands

- `powershell.exe -NoProfile -Command "<redacted organization-tree private input metadata validation>"`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-3-organization-tree-input-provisioning-2026-07-04`
