# 2026-07-04 Full-chain Scenario 4 Org Admin Input Provisioning Plan

## Task

- Task id: `full-chain-scenario-4-org-admin-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-4-org-admin-input-provisioning-2026-07-04`
- Source blocked task: `full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair-2026-07-04`
- Kind: `local_private_account_input_provisioning`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scenario selector label: `fc_scenario_4_standard_org_package`
- Provisioned selector labels: `fc_org_standard_admin_created_by_ops`, `fc_org_advanced_admin_created_by_ops`
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
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-employee-input-provisioning.md`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/standard-employee-import.csv`
- `src/server/validators/admin-account-creation.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`

## Scope

Provision the two missing organization-admin private account input sections outside the repository. The inputs must be
admin-domain only, role-specific, product-validator compatible, and non-colliding with existing admin and
learner/employee private inputs.

This task may write only the local-private account plan file outside the repository and repo governance docs/state/queue.
It must not start the app, run browser/e2e, connect to DB, write DB data, edit source/tests, change
schema/migrations/seeds, change dependencies, call Provider, touch staging/prod, run Cost Calibration, or claim release
readiness, final Pass, or production usability.

Repo evidence may record only selector labels, role labels, section counts, field-presence booleans summarized as counts,
collision counts, command names, and pass/fail/block status. It must not record credential values, phone, email,
password, connection string, token, session, cookie, raw DB row, internal id, private fixture contents, screenshot, DOM,
trace, Provider payload, raw Prompt, raw AI I/O, plaintext card value, full material, full question, or full paper.

## Execution Plan

1. Verify current private account plan exists and target org-admin sections are absent.
2. Generate two validator-compatible private org-admin account input sections in memory.
3. Append the sections to `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` without
   printing values.
4. Verify metadata only: both target selectors present, required fields present, roles match, and collision count is 0.
5. Write redacted evidence/audit, validate docs/state/queue, commit, fast-forward merge, push, delete the branch, and
   rerun Scenario 4 from the affected pre-runtime input gate.

## Stop Rules

Stop if the private account plan is absent, target sections already exist with conflicting structure, generated inputs
would collide across admin or learner/employee domains, validator-compatible fields cannot be produced, provisioning
would require DB/browser/source/schema/dependency/Provider/staging/prod/Cost work, or any private value would need to be
printed into repo evidence or chat output.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted org-admin private input provisioning>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command <redacted org-admin private input metadata verification>`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-org-admin-input-provisioning-2026-07-04`
