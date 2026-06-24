# Role-Separated MVP Requirement Alignment

## Status

- Date: 2026-06-24
- Scope: standard/advanced MVP role-separated repair requirement alignment.
- Approval source: current user approval for `2026-06-24-role-separated-mvp-requirement-alignment`.
- Runtime baseline: strict role-separated runtime pass remains `0/8`; the runtime gate stays blocked.
- SSOT rule: this document and the linked `docs/01-requirements` module/story updates are the durable requirement source for the next repair packages. Execution-log documents remain evidence and decision provenance only.

This document records requirement alignment only. It does not approve source code, tests, schema, migration, seed, database writes, dependencies, `.env*`, Provider, Cost Calibration, staging/prod, payment, external services, deployment, PR, merge, push, or final MVP Pass.

## Source Inputs

| source                                                                                                              | role in this alignment                                                                             |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `docs/05-execution-logs/acceptance/2026-06-23-role-separated-mvp-repair-issue-list-and-requirement-decisions.md`    | Owner-confirmed R1-R15 repair issues and decisions.                                                |
| `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`       | Redacted runtime observation baseline for all 8 roles.                                             |
| `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md` | Runtime audit conclusion that the gate remains blocked.                                            |
| `docs/05-execution-logs/acceptance/2026-06-23-advanced-ai-entry-ui-ux-contract.md`                                  | UI/UX entry contract coverage; not runtime Pass.                                                   |
| `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`                                   | Existing product decision for multi-`profession`, multi-`level` `org_auth` atomic scope direction. |
| `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`                        | Existing AI question and AI `paper` generation scope clarification.                                |
| `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`                                   | Architecture rule for source `edition`, `auth_upgrade`, and computed `effectiveEdition`.           |

## Role Acceptance Baseline

| role                        | current runtime result | aligned requirement target                                                                                          |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | blocked/fail           | No advanced `AI训练`; clear upgrade guidance or denial for advanced-only routes.                                    |
| `personal_advanced_student` | fail                   | Discoverable `AI训练` entry with `AI出题` and `AI组卷` actions for personal advanced context.                       |
| `org_standard_employee`     | fail                   | No `AI训练` and no `企业训练`; direct access to advanced-only flows is denied or standard-unavailable.              |
| `org_advanced_employee`     | fail                   | Discoverable `AI训练` and `企业训练` entries under valid advanced `org_auth`.                                       |
| `org_standard_admin`        | fail                   | Dedicated organization admin workspace; employee/auth status management only; no training or AI generation.         |
| `org_advanced_admin`        | fail                   | Dedicated organization admin workspace; employee/auth status, enterprise training, and organization AI generation.  |
| `content_admin`             | fail                   | Content backend landing/logout plus discoverable `AI出题` and `AI组卷` draft/review entries.                        |
| `ops_admin`                 | fail                   | Operations workspace only; content authoring routes denied; complete `redeem_code` and `org_auth` governance flows. |

## Repair Requirement Routing

| repairId | canonical requirement placement                                                                    | requirement summary                                                                                                               | acceptance implication                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| R1       | `modules/06-admin-ops.md`, `stories/epic-06-admin-ops.md`                                          | Backend workspaces must be separated by role, with role-aware landing and visible logout.                                         | `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin` cannot prove Pass unless unrelated backend surfaces are denied.   |
| R2       | `modules/06-admin-ops.md`, advanced organization modules                                           | Enterprise admin is a first-class organization-scoped admin domain that reuses backend primitives without duplicating operations. | Enterprise admins must not be represented as ordinary `ops_admin` in acceptance.                                                               |
| R3       | `modules/04-organization-training.md`, `stories/epic-02-organization-training.md`                  | `org_standard_admin` can manage employees and view organization authorization/status only.                                        | No enterprise training management and no AI generation for standard organization admin.                                                        |
| R4       | `modules/04-organization-training.md`, `modules/08-organization-ai-generation.md`, related stories | `org_advanced_admin` can manage employees, training, and organization-owned AI question/paper generation.                         | Organization advanced backend entry must be discoverable, not URL-only.                                                                        |
| R5       | `modules/03-personal-ai-generation.md`, `stories/epic-01-personal-ai-generation.md`                | Personal advanced learner sees `AI训练`; personal standard learner does not.                                                      | Standard learner denial/upgrade guidance is acceptable; URL-only advanced entry fails.                                                         |
| R6       | `modules/03-personal-ai-generation.md`, `modules/04-organization-training.md`                      | Standard organization employee sees neither `AI训练` nor `企业训练`; advanced employee sees both.                                 | Employee navigation must reflect `effectiveEdition` and organization context.                                                                  |
| R7       | `modules/06-admin-ops.md`, `stories/epic-06-admin-ops.md`, AI scope clarification                  | Content backend exposes `AI出题` and `AI组卷` entries into draft/review workflow.                                                 | Generated content cannot directly become formal `question` or `paper`.                                                                         |
| R8       | `modules/06-admin-ops.md`, `stories/epic-06-admin-ops.md`                                          | `ops_admin` is denied from content authoring surfaces and content draft creation.                                                 | Direct content route access by `ops_admin` must produce denial, not accidental access.                                                         |
| R9       | `modules/01-user-auth.md`, `modules/06-admin-ops.md`, advanced ops auth/quota docs                 | Operations can generate one `redeem_code` or a specified quantity.                                                                | Generation feedback and evidence must avoid plaintext card values.                                                                             |
| R10      | `modules/01-user-auth.md`, `modules/06-admin-ops.md`                                               | `redeem_code` generation requires explicit `profession` and `level`.                                                              | Generation without scope is invalid.                                                                                                           |
| R11      | advanced edition-aware authorization docs and ops auth/quota docs                                  | `org_auth` creation includes explicit `standard                                                                                   | advanced` `edition` selection.                                                                                                                 | Organization authorization must not infer edition from hidden defaults. |
| R12      | advanced edition-aware authorization docs and ops auth/quota docs                                  | Standard-to-advanced organization upgrade uses governed `auth_upgrade.source_type = ops_manual`.                                  | Source `org_auth` is not overwritten; upgrade is audited and revocable.                                                                        |
| R13      | `2026-06-21-org-auth-scope-product-decision.md`, edition-aware authorization docs                  | One commercial enterprise package can cover multiple `profession + level` combinations through atomic scopes.                     | `org_auth` remains bundle/purchase record; future atomic `org_auth_scope` rows preserve scope, quota, conflict, expiry, and audit attribution. |
| R14      | `modules/01-user-auth.md`, `modules/06-admin-ops.md`, `stories/epic-06-admin-ops.md`               | Employee import provides a reusable template/download or clearly equivalent template guidance.                                    | Import preview must show row outcomes and redacted skip/block reasons.                                                                         |
| R15      | `modules/01-user-auth.md`, edition-aware authorization docs                                        | Employee import binds employees to `organization` only; professional/level visibility is derived from active `org_auth_scope`.    | Import template must not include `profession`, `level`, `edition`, or `orgAuthScopePublicId` input fields.                                     |

## Domain Decisions

### Enterprise Admin Domain

- Enterprise admin is a first-class organization-scoped admin domain.
- The implementation should reuse existing backend shell, list/detail components, service/repository capabilities, validation, and audit primitives where appropriate.
- Reuse must not duplicate global operations logic into a second backend. Role separation must come from workspace routing, permission guards, scoped menus, organization filters, and service-layer checks.
- Enterprise admin authority is limited to the relevant `organization` scope and does not include global user management, global `redeem_code`, global `org_auth`, global audit, Provider, cost, staging/prod, payment, or content authoring access.

### Employee Import Semantics

- Employee import imports or binds employee accounts to an `organization`.
- Import templates must not include `profession`, `level`, `edition`, or `orgAuthScopePublicId`.
- Employee effective authorization is computed from active `org_auth_scope` rows covering the employee's `organization` context.
- If different employee groups need different visible professional or level scopes, the preferred model is organization-node segmentation plus authorization scopes on those nodes.
- Import preview may display expected inherited scopes and quota impact, but those are computed outputs, not import inputs.
- If quota is insufficient, the system blocks the affected row/action with a redacted reason instead of silently creating unclear partial authorization.

### `redeem_code` And `org_auth` Operations

- `redeem_code` generation must support single-card generation and specified-quantity generation.
- `redeem_code` generation requires explicit `profession` and `level`.
- Ordinary evidence, audit summaries, and committed documents must not contain plaintext `redeem_code` values.
- `org_auth` creation must expose explicit `edition = standard | advanced`.
- `org_auth` standard-to-advanced upgrade must use governed `auth_upgrade` semantics, not source record overwrite.
- Multi-`profession` and multi-`level` enterprise packages must decompose into atomic scopes and preserve conflict warnings before submit.

### Backend UI/UX Design-First Gate

Backend UI/UX optimization for enterprise standard backend, enterprise advanced backend, content operations backend, and system operations backend must run a design-first pass before UI implementation.

The design artifact must cover information architecture, navigation, workspace separation, dashboard density, list/detail layout, form flow, empty/error/loading states, permission-denied states, upgrade states, conflict warnings, confirmation dialogs, component reuse, target routes, acceptance states, and allowed implementation file scope.

The design pass must explicitly preserve registered domain terms: `organization`, `employee`, `org_auth`, `authorization`, `redeem_code`, `question`, `paper`, and the later reviewed `org_auth_scope` direction. The previous UI/UX contract status `Covered` is not runtime Pass and does not close role-separated acceptance by itself.

## SSOT Update Map

| document                                                                            | update purpose                                                                                                       |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                  | Clarify original standard MVP non-goals versus standard/advanced MVP repair addendum.                                |
| `docs/01-requirements/modules/01-user-auth.md`                                      | Add `redeem_code`, multi-scope `org_auth`, and employee import semantics.                                            |
| `docs/01-requirements/modules/06-admin-ops.md`                                      | Add workspace separation, ops/content/org backend role boundaries, operations flows, and design-first gate.          |
| `docs/01-requirements/stories/epic-06-admin-ops.md`                                 | Add acceptance criteria for admin workspaces, `redeem_code`, `org_auth`, import template, and content AI entries.    |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` | Add multi-scope `org_auth`, edition selector, manual upgrade, and employee import inheritance.                       |
| `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`        | Add role-specific learner entry requirements.                                                                        |
| `docs/01-requirements/advanced-edition/modules/04-organization-training.md`         | Add standard/advanced organization employee/admin boundaries.                                                        |
| `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`       | Add ops-facing issuance, upgrade, and quota-safe requirements.                                                       |
| `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`    | Add advanced organization admin AI entry and standard denial boundary.                                               |
| Traceability matrices                                                               | Carry the R1-R15 requirement routing into source, capability, role, requirement, and authorization acceptance views. |

## Next Repair Package Guidance

Use this alignment to split implementation into reviewable packages:

1. Backend workspace landing, logout, role separation, and permission-denied repair.
2. Backend UI/UX design-first package for enterprise, content, and system operations workspaces.
3. Learner home `AI训练` and `企业训练` entry repair.
4. Content backend `AI出题` and `AI组卷` draft/review entry repair.
5. Enterprise admin standard/advanced workspace and training boundary repair.
6. Operations `redeem_code`, `org_auth` edition selector, upgrade, multi-scope, and employee import template repair.

After implementation, rerun strict role-separated runtime observation for all 8 roles and keep the gate blocked until all required allow/deny behaviors pass with redacted evidence.
