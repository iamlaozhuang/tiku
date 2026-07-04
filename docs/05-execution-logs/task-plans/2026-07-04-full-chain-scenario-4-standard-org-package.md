# 2026-07-04 Full-chain Scenario 4 Standard Org Package Plan

## Task

- Task id: `full-chain-scenario-4-standard-org-package-2026-07-04`
- Branch: `codex/full-chain-scenario-4-standard-org-package-2026-07-04`
- Kind: `local_acceptance_pre_mutation_private_input_gate`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Scenario selector label: `fc_scenario_4_standard_org_package`
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
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/authorization-matrix.yaml`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/employee-import/template-fields.yaml`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `src/server/validators/org-auth.ts`
- `src/server/contracts/organization-auth-contract.ts`

## Scope

This task gates Scenario 4 before any product mutation. It may inspect redacted metadata for required private standard
organization authorization and employee import inputs. It must stop before browser, DB writes, source edits, schema,
migration, seed, Provider, staging/prod, Cost Calibration, release readiness, final Pass, or production usability.

Scenario 4 requires:

- a standard enterprise authorization package selector;
- standard organization admin account input;
- standard employee import input with more than 5 data rows;
- employee import columns that omit authorization fields;
- organization tree already created by Scenario 3.

## Execution Plan

1. Verify repository branch and read required SSOT, traceability, prior evidence/audit, source contracts, and private
   metadata selectors.
2. Check private standard package and employee input metadata without printing private row values.
3. If required employee import data is missing or undersized, stop before runtime mutation and split a provisioning task.
4. Write blocked evidence/audit, validate docs/state/queue, commit, fast-forward merge, push, delete branch, then run the
   provisioning task under the centralized local continuity approval.

## Stop Rules

Stop if standard employee import input is missing, has 5 or fewer rows, contains authorization columns, account selector
input is missing, organization tree prerequisite is absent, runtime/source/schema repair becomes necessary, or any
redaction, Provider, staging/prod, Cost, destructive DB, release readiness, final Pass, or production usability boundary
is crossed.

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-standard-org-package-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-chain-scenario-4-standard-org-package-2026-07-04`
