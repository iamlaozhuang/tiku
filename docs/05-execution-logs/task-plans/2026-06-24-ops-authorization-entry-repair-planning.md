# Task Plan: ops-authorization-entry-repair-planning-2026-06-24

## Task Metadata

- Task id: `ops-authorization-entry-repair-planning-2026-06-24`.
- Branch: `codex/ops-authorization-repair-planning-20260624`.
- Task kind: `docs_only`.
- Scope: planning package for operations `redeem_code`, `org_auth`, `auth_upgrade`, multi-scope authorization, and employee import template repair.
- Approval source: current user approved serial advancement through role-separated repair candidates 1, 2, 3, and 4, and then instructed to continue.
- Non-claim: this task does not declare standard/advanced MVP final Pass and does not claim runtime behavior changed.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- ADR-002 keeps runtime layering as `route handlers / server actions -> service -> repository -> model`; follow-up implementation packets must keep route handlers thin.
- ADR-007 defines source `edition`, `auth_upgrade`, and computed `effectiveEdition`; UI state is not an authorization boundary.
- `edition-aware-authorization-requirements.md` splits future implementation into schema, API/contract, service/repository, personal `redeem_code`, organization `org_auth`, multi-scope bundle, employee import, quota, and validation packets.
- `2026-06-21-org-auth-scope-product-decision.md` keeps `org_auth` as a bundle or purchase record and future atomic scopes as reviewed child rows; arrays or comma-joined scopes are not allowed.
- `2026-06-24-role-separated-mvp-requirement-alignment.md` routes R9-R15 into the operations repair package.

## Requirement Mapping

- R9 / `EAA-OPS-REDEEM-SINGLE`: operations must support one `redeem_code` generation request without evidence exposing plaintext card values.
- R10 / `EAA-OPS-REDEEM-SPECIFIED-QUANTITY`: operations must support specified-quantity `redeem_code` generation, with explicit `profession` and `level`.
- R11 / `EAA-ORG-CREATE-STANDARD-ADVANCED-SELECTOR`: `org_auth` creation must visibly choose `edition = standard | advanced`; hidden default is insufficient.
- R12 / `EAA-ORG-MANUAL-UPGRADE-ENTRY`: standard-to-advanced organization upgrade must use governed `auth_upgrade.source_type = ops_manual` semantics and must not overwrite source `org_auth`.
- R13 / `EAA-ORG-MULTI-SCOPE-BUNDLE`: a commercial enterprise authorization package can contain multiple `profession + level` combinations, but service and audit boundaries must use atomic scopes.
- R14 / `EAA-EMPLOYEE-IMPORT-BINDING-ONLY`: employee import must provide template guidance or download equivalent.
- R15 / `EAA-EMPLOYEE-INHERITED-SCOPE-PREVIEW`: employee import template must not include `profession`, `level`, `edition`, or `orgAuthScopePublicId`; inherited scopes and quota impacts are computed preview outputs only.

## Evidence-Only Sources

- Existing source read for planning only:
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
  - `src/server/contracts/admin-user-org-auth-ops-contract.ts`.
  - `src/server/contracts/organization-auth-contract.ts`.
  - `src/server/services/admin-user-org-auth-ops-service.ts`.
  - `src/server/services/admin-organization-org-auth-runtime.ts`.
  - `src/server/validators/org-auth.ts`.
  - `src/server/validators/redeem-code.ts`.
  - `src/app/api/v1/org-auths/route.ts`.
  - `src/app/api/v1/redeem-codes/route.ts`.
  - `src/app/api/v1/employees/import/route.ts`.
  - `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- These files are not requirement SSOT and are not changed by this task.

## Conflict Check

- No requirement conflict was found for planning.
- Current implementation already has partial local operations surfaces and backend validation for `org_auth.edition`, but follow-up work still needs explicit UI selection, manual upgrade entry, multi-scope bundle design, employee template hardening, and redacted evidence.
- Schema, migration, runtime authorization changes, database writes, browser/e2e execution, Provider, payment, staging/prod, and Cost Calibration remain blocked.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-authorization-entry-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-authorization-entry-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-authorization-entry-repair-planning.md`.

## Blocked Files And Work

- No source, tests, e2e, schema, migration, dependency, package, lockfile, `.env*`, script, Provider, payment, external-service, staging/prod, PR, force push, or Cost Calibration work.
- No plaintext `redeem_code`, token, password, Authorization header, database URL, raw DB row, provider payload, prompt, raw generated AI content, private answer text, or full `paper` content in evidence.

## Current Code Findings

- `AdminOrgAuthRedeemPage.tsx` has organization, `org_auth`, employee import, and `redeem_code` surfaces.
- `OrgAuthFormState` and `CreateOrgAuthInput` still model one `profession` and one `level`; UI planning must not treat this as multi-scope completion.
- `normalizeCreateOrgAuthInput` accepts optional `edition` and defaults missing edition to `standard`; a follow-up UI/contract task must make selection explicit.
- Employee import currently accepts account import content with `phone`, `name`, `initialPassword`, and `organizationPublicId`; planning must preserve organization-only scope and ensure no professional/level/edition fields become inputs.
- Existing tests prove partial local behavior but do not close R9-R15 role-separated runtime acceptance.

## Repair Package Split

1. `ops-redeem-code-generation-scope-entry`: UI/contract repair for single and specified-quantity generation with explicit `profession` and `level`, redacted ordinary views, and generation-only plaintext handling.
2. `ops-org-auth-edition-selector-entry`: UI/contract repair for visible `standard | advanced` selector and safe summaries for source `edition`, `effectiveEdition`, and upgrade state.
3. `ops-org-auth-manual-upgrade-planning`: docs/contract/security preflight for `auth_upgrade.source_type = ops_manual`, external reference, operations note, operator public id, and audit linkage.
4. `ops-org-auth-multi-scope-design`: schema/contract/security approval package before implementation of `org_auth_scope` or equivalent atomic child scopes.
5. `ops-employee-import-template-boundary`: template guidance/download and preview wording that binds employee accounts to `organization` only and treats inherited scopes as computed outputs.
6. `ops-auth-runtime-validation-redacted`: later strict role-separated runtime evidence for `ops_admin` only after implementation packets close and browser/e2e approval exists.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-ops-authorization-entry-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-ops-authorization-entry-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-authorization-entry-repair-planning.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-authorization-entry-repair-planning-2026-06-24`

## Stop Conditions

- Stop if implementation becomes necessary before a follow-up task exists.
- Stop if schema/migration, database, dependency, env/secret, Provider, payment, staging/prod, external-service, browser/e2e, PR, force push, or Cost Calibration work becomes necessary.
- Stop if evidence would need plaintext `redeem_code` or other sensitive material.
