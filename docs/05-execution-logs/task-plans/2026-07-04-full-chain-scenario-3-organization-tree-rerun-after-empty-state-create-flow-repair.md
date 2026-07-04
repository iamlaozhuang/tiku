# 2026-07-04 Full-chain Scenario 3 Organization Tree Rerun After Empty-state Create-flow Repair Plan

## Task

- Task id: `full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-3-organization-tree-2026-07-04`
- Repair dependency: `full-chain-scenario-3-organization-empty-state-create-flow-repair-2026-07-04`
- Kind: `local_acceptance_runtime_browser_db_aggregate_rerun`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Negative actor selector label: `fc_content_admin_created_by_super_admin`
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
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-after-panel-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-empty-state-create-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-empty-state-create-flow-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(admin)/ops/organizations/page.tsx`
- `src/app/api/v1/organizations/route.ts`
- `src/app/api/v1/organizations/[publicId]/route.ts`
- `src/server/services/organization/route-handlers.ts`
- `src/server/services/organization/organization-lifecycle-service.ts`
- `src/server/repositories/organization/organization-repository.ts`
- `src/server/contracts/organization/organization-lifecycle-contract.ts`
- `src/server/mappers/organization/organization-lifecycle-mapper.ts`
- `src/server/validators/organization.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
- `compose.yaml`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-bundled/browser/26.623.101652/skills/control-in-app-browser/SKILL.md`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Scope

This rerun proves the Scenario 3 organization-tree product flow after the empty-state first-create repair. It may start
the local app, use browser/e2e, use approved private credentials and organization-tree input in memory only, create the
organization tree through protected product surfaces, and run selector-scoped aggregate DB verification.

Allowed runtime actions:

- start a localhost-only app process with child-process-only DB target override if required;
- verify runtime DB target before any browser mutation;
- log in as `ops_admin` through the product login flow;
- create the Scenario 3 organization tree in product order;
- verify `content_admin` cannot mutate organizations;
- run selector-scoped read-only aggregate DB checks;
- stop the app and record redacted evidence only.

Forbidden actions:

- source/test/package/lockfile edits;
- `.env*` edits or environment value output;
- direct DB writes outside product/runtime flow;
- `org_auth`, `admin_organization`, employee, card, learner, AI, Provider, staging/prod, deployment, Cost Calibration,
  schema, migration, seed, destructive DB, dependency, screenshot, raw DOM, trace, cookie, token, session, `localStorage`,
  Authorization header, credential value, connection string, raw DB row, internal id, private fixture content, Prompt,
  Provider payload, raw AI I/O, release readiness, final Pass, or production usability claim.

## Execution Plan

1. Preflight branch cleanliness, target DB label, private account selector presence, and private organization-tree
   metadata counts without outputting private values.
2. Start a localhost-only app process with isolated DB target override.
3. Establish an `ops_admin` browser session using private credentials in memory only.
4. Visit `/ops/organizations`, verify the organization first-create surface is visible, and create 8 organization nodes
   from the private selector plan in parent-first order.
5. Establish a `content_admin` browser session and attempt a protected organization mutation probe; require permission
   denial and no aggregate count increase.
6. Run selector-scoped aggregate DB verification:
   - organization count `8`;
   - active organization count `8`;
   - tier counts `2/2/2/2`;
   - parent link count `6`;
   - downstream `org_auth`, `admin_organization`, employee, and `redeem_code` counts unchanged for this scenario;
   - organization success audit count at least `8`;
   - organization permission-denial audit count at least `1`.
7. Stop the local app, write redacted evidence/audit, validate, commit, fast-forward merge, push, delete branch, then
   continue Scenario 4 on pass.

## Stop Rules

Stop and split repair/provisioning if target DB mismatches, app startup fails outside local configuration, private input
or credentials are missing, login fails, product organization creation fails, parent/tier/depth validation fails,
`content_admin` can mutate organizations, downstream families are created early, source/schema/dependency repair becomes
necessary, redaction risk appears, or Provider/staging/Cost/destructive DB/release/final/production claims are needed.

## Validation Commands

- `node - <redacted Scenario 3 runtime browser and DB aggregate verification>`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair-2026-07-04`
