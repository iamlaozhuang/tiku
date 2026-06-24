# Role-Separated MVP Post-Repair Gap Analysis

## Status

- Date: 2026-06-24.
- Task id: `role-separated-mvp-post-repair-gap-planning-2026-06-24`.
- Scope: no-final-Pass gap analysis after the 2026-06-24 role-separated repair package.
- Runtime executed by this task: none.
- Final Pass claim: none.

## SSOT Read List

- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: R1-R15 are represented in the gap groups below.
- Role Mapping Result: all 8 mandatory role rows remain in scope for future runtime acceptance.
- Acceptance Mapping Result: no final Pass. The only conclusion is a post-repair gap and approval plan.

## Baseline

- Latest strict role-separated runtime baseline before the repair package: `0/8` role rows passed.
- Current repair package state: closed and pushed through `ops-repair-package-state-convergence-2026-06-24`.
- Current diagnostic state after that closeout: no pending executable task and `archiveCandidateCount: 57`.
- No browser/e2e/runtime walkthrough was executed after the repair package.

## Repaired But Still Waiting For Acceptance Evidence

| gapId    | area                                                             | mapped requirements          | current evidence                                                                                                                      | remaining acceptance need                                                                                                                                                                       |
| -------- | ---------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GAP-01` | Backend landing, logout, and workspace separation                | R1/R2/R8, US-06-13, US-06-14 | Local source/unit repair closed for modeled backend roles.                                                                            | Fresh role-separated runtime rerun must verify login landing, visible logout, and denied unrelated routes for `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin`.     |
| `GAP-02` | Learner `AI训练` and `企业训练` entries                          | R5/R6, Epic 01, Epic 02      | Learner-home unit repair closed.                                                                                                      | Fresh runtime must verify `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, and `org_advanced_employee` visibility and direct-route denial/unavailable states. |
| `GAP-03` | Content and organization backend AI entries                      | R4/R7/R8, US-06-15, Epic 07  | Content and organization backend entry unit repair closed.                                                                            | Fresh runtime must verify `content_admin`, `org_standard_admin`, `org_advanced_admin`, and `ops_admin` role-specific navigation and denial. Provider execution remains blocked.                 |
| `GAP-04` | Operations `redeem_code`, `org_auth`, employee import validation | R9/R10/R11/R14/R15, Epic 04  | Selected unit validation closed; `redeem_code` scope, `org_auth` edition selector, and employee import boundary were covered locally. | Fresh operations runtime or approved local e2e/manual evidence is still needed before acceptance. Evidence must remain redacted and exclude plaintext `redeem_code`.                            |

## Still Required Implementation Or Design Before Final Acceptance

| gapId    | area                                                      | mapped requirements                      | why still open                                                                                                                                                                                                            | likely next task type                                                                            |
| -------- | --------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GAP-05` | Organization admin account/role runtime proof             | R2/R3/R4, US-06-14, Epic 02, Epic 07     | Unit/source work recognizes organization workspace roles, but post-repair runtime with dedicated organization admin accounts has not been observed. Account availability or owner-entered credential scope may be needed. | Runtime scope approval package, then local role-separated runtime rerun.                         |
| `GAP-06` | `org_auth` manual standard-to-advanced upgrade runtime    | R12, EAA-ORG-MANUAL-UPGRADE, Epic 04     | Current task package produced preflight/planning; source/schema/service/UI runtime implementation is not proven. `auth_upgrade` semantics may require schema/API/service work.                                            | Separate implementation planning and approval, likely schema/service/UI split.                   |
| `GAP-07` | Multi-`profession`/multi-`level` enterprise authorization | R13, EAA-ORG-MULTI-SCOPE-BUNDLE, Epic 04 | Current task package produced design/planning. Atomic `org_auth_scope` implementation, migration, conflict rules, and audit attribution are not completed.                                                                | Schema/migration approval package followed by implementation packets.                            |
| `GAP-08` | Backend UI/UX design-first optimization                   | R1/R2/R4/R7/R8 and US-06-01 AC-8         | Requirement alignment requires a design artifact before broad workspace UI optimization. The repair package fixed entries and guards but did not run a design-first pass.                                                 | Product design/context package before UI implementation.                                         |
| `GAP-09` | Provider-backed AI generation execution and quota cost    | R5/R7, Epic 01, Epic 07                  | Entry discoverability can be checked locally, but real model calls, prompts, AI task persistence, quota consumption, and costs are blocked.                                                                               | Fresh Provider/env/Cost Calibration approvals are required; otherwise keep as blocked remainder. |
| `GAP-10` | Staging/prod owner preview and release evidence           | All acceptance rows                      | Local evidence does not prove staging, production, deployment, cloud resources, or owner final decision.                                                                                                                  | Separate staging/owner-preview/release plan with fresh approval.                                 |

## Fresh Approval Needed Before Execution

| approvalId                                                  | needed for                                                                                                      | blocked gates                                                              |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `ROLE_SEPARATED_POST_REPAIR_RUNTIME_RERUN_SCOPE_2026_06_24` | Fresh local role-separated runtime rerun after repairs; owner-entered credentials only.                         | Browser/runtime, owner credential entry, no secret capture, no final Pass. |
| `ROLE_ACCOUNT_PROVISIONING_OR_SEED_SCOPE_2026_06_24`        | Any account creation, password reset, seed rerun, or dedicated role account expansion needed for runtime proof. | Account action, database seed/write, credentials.                          |
| `ORG_AUTH_UPGRADE_IMPLEMENTATION_SCOPE_2026_06_24`          | Implement `auth_upgrade.source_type = ops_manual` beyond planning.                                              | Source/test implementation, possibly schema/API/service/audit.             |
| `ORG_AUTH_MULTI_SCOPE_SCHEMA_SCOPE_2026_06_24`              | Implement atomic `org_auth_scope` or equivalent multi-scope model.                                              | Schema/migration/database, service, API, UI, audit, conflict logic.        |
| `BACKEND_UI_UX_DESIGN_FIRST_SCOPE_2026_06_24`               | Produce design-first artifact and later UI implementation scope.                                                | Product design/UI implementation; no broad UI rewrite before design.       |
| `PROVIDER_COST_STAGING_RELEASE_SCOPES`                      | Provider calls, Cost Calibration, staging/prod, payment/external service, or release readiness.                 | Provider/env/cost/staging/prod/payment/external-service/final Pass.        |

## Recommended Serial Next Tasks

1. `role-separated-post-repair-runtime-rerun-scope-approval-2026-06-24`
   - Prepare the local-only runtime approval package for all 8 role rows.
   - No credentials read or typed by Codex.
   - No source/test/schema/env/Provider changes.
2. `role-separated-post-repair-runtime-rerun-2026-06-24`
   - Execute only if the approval package is accepted.
   - Records redacted role/route/status evidence.
3. `backend-ui-ux-design-first-scope-2026-06-24`
   - Produce design-first artifact before broad backend UI optimization.
4. `ops-org-auth-upgrade-runtime-implementation-planning-2026-06-24`
   - Split manual upgrade runtime work into schema/service/UI/security packets.
5. `ops-org-auth-multi-scope-schema-approval-package-2026-06-24`
   - Prepare high-risk schema/migration approval for atomic multi-scope implementation.
6. `active-queue-slimming-post-ops-window-2026-06-24`
   - Optional governance cleanup for archive candidates; separate from acceptance.

## Current Decision

- The repair package is closed.
- The post-repair acceptance gap list is known.
- Standard/advanced MVP final Pass is not declared.
- The lowest-risk next acceptance step is a runtime rerun scope approval package, not direct runtime execution.
