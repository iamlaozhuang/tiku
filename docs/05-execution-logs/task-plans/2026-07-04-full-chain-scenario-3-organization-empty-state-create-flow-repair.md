# 2026-07-04 Full-chain Scenario 3 Organization Empty-state Create-flow Repair Plan

## Task

- Task id: `full-chain-scenario-3-organization-empty-state-create-flow-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-3-organization-empty-state-create-flow-repair-2026-07-04`
- Source block task: `full-chain-scenario-3-organization-tree-2026-07-04`
- Kind: `local_source_test_doc_repair`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`
- Expected rerun task: `full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair-2026-07-04`

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
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree.md`
- `src/app/(admin)/ops/organizations/page.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
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
- `src/server/validators/organization/list-query.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `tests/unit/phase-11-system-ops-organization-management-loop.test.ts`
- `tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`
- `tests/unit/organization/organization-auth-layering-lifecycle.test.ts`
- `tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts`
- `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-curated-remote/superpowers/5.1.4/skills/systematic-debugging/SKILL.md`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-curated-remote/superpowers/5.1.4/skills/test-driven-development/SKILL.md`

## Root Cause Hypothesis

The organization backend reaches the authorized operations surface, and the backend organization creation route accepts
a root `province` organization with no parent. The blocker is in the shared operations UI: when organizations,
`org_auth`, and employees are all empty, `loadState` becomes `empty` and the page returns a terminal `AdminEmptyState`
before rendering `OrganizationTreeActionPanel`. Even after reaching ready state, the organization tree form is disabled
when `data.organizations.length === 0`, which prevents first organization creation.

## Implementation Plan

1. RED: add a focused UI test proving an empty operations dataset still renders the organization first-create surface and
   can submit a root organization through `/api/v1/organizations`.
2. GREEN: keep backend authorization unchanged and make the minimal UI repair so empty organization data renders the
   operations shell plus organization first-create form; keep `org_auth` and employee-dependent actions blocked until
   organizations exist.
3. Verify the focused test, lint, typecheck, scoped formatting, diff checks, and Module Run v2 hardening.
4. Write redacted evidence/audit, commit, fast-forward merge to `master`, push, delete the short branch, then rerun
   Scenario 3 from the affected node.

## Boundaries

Allowed:

- one frontend source file for the organization operations surface;
- one focused unit/UI test file;
- docs/state/queue/evidence/audit for this repair.

Forbidden:

- DB connection or mutation;
- browser runtime or dev server;
- Provider, staging, production, Cost Calibration, schema, migration, seed, dependency, lockfile, e2e, screenshots,
  raw DOM, trace, private credential/session capture, permission weakening, fake data, fixture expansion, release
  readiness, final Pass, or production usability claim.

## Validation Commands

- `npm.cmd exec -- vitest run tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-3-organization-empty-state-create-flow-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-empty-state-create-flow-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-empty-state-create-flow-repair.md src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped repair files>`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-3-organization-empty-state-create-flow-repair-2026-07-04`
