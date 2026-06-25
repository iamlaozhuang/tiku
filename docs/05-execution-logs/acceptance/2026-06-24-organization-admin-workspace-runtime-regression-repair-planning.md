# Acceptance Plan: organization-admin-workspace-runtime-regression-repair-planning-2026-06-24

## Decision

- Planning result: `pass_regression_repair_plan_prepared_no_source_no_runtime_no_final_pass`.
- The latest organization-admin runtime rerun failed both rows, so layer-1 organization-admin entry, workspace, and
  permission acceptance remains blocked.
- The next implementation must start by reproducing the real session/account role mapping path. UI-only mocked role tests
  are insufficient.
- The most likely root cause is not a missing link label. It is a role model gap between the role-separated requirement
  (`org_standard_admin` and `org_advanced_admin`) and persisted local admin roles (`super_admin`, `ops_admin`,
  `content_admin`).

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Mapping Result

- R1/R2: backend workspace separation cannot pass until real organization admins are no longer represented as ordinary
  operations admins.
- R3: `org_standard_admin` must get organization portal and employee/auth status only; no training or AI.
- R4: `org_advanced_admin` must get organization portal, training, analytics, `AI出题`, and `AI组卷`.
- ADR-007: route/service authorization must enforce capability boundaries; menu visibility is not enough.

## Role Mapping Result

| Role row             | Later repair must prove                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Real login/session returns organization-standard role semantics, lands `/organization/portal`, denies ops. |
| `org_advanced_admin` | Real login/session returns organization-advanced role semantics, lands `/organization/portal`, denies ops. |
| `ops_admin`          | Remains global operations only and cannot be used as organization-admin acceptance evidence.               |
| `content_admin`      | Remains content backend only and stays a regression guard for workspace separation.                        |

## Acceptance Mapping Result

- Planning output exists and names root-cause hypotheses, allowed repair scopes, blocked scopes, and runtime acceptance
  standards.
- Later implementation acceptance requires focused unit/service tests plus a fresh runtime rerun.
- Chinese UI must be checked during the later rerun; visible technical labels like `Admin Ops` and `contact_config` fail
  acceptance if reachable by organization admins.
- No final MVP Pass is declared.

## Repair Package Recommendation

1. Start with a red test around real session/account mapping:
   - persisted or seeded organization admin account returns organization role semantics;
   - login redirect resolves to `/organization/portal`;
   - layout denies `/ops/*` and allows `/organization/*`.
2. If the failing test shows the current `admin_role` enum cannot store the needed roles, stop ordinary source repair and
   open a schema/migration/seed-approved role-model task.
3. If no schema change is needed, repair the session mapper and layout/service guards within the source-only allowlist.
4. After implementation, perform a separate owner-approved runtime rerun for both organization admin rows.

## Explicit Non-Pass

- This planning task does not change runtime behavior.
- This planning task does not approve schema, migration, seed, database mutation, browser runtime, Provider, Cost
  Calibration, staging/prod, payment, external service, PR, force push, or final Pass.
