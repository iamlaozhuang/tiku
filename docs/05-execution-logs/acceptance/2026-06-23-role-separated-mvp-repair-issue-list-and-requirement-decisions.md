# Role-Separated MVP Repair Issue List And Requirement Decisions

## Status

- Date: 2026-06-23
- Scope: standard/advanced MVP role-separated runtime acceptance repair planning.
- Runtime acceptance source: `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`
- Audit source: `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`
- Result baseline: strict role-separated runtime pass remains `0/8`.
- Gate result: blocked; do not claim standard/advanced MVP final Pass.

This document records owner-confirmed repair requirements gathered after the `ops_admin` owner-entered runtime observation.
It is a documentation and requirement decision artifact only. It does not approve code, schema, migration, seed, database,
Provider, Cost Calibration, staging/prod, payment, external-service, deployment, commit, merge, push, or PR work.

## Evidence Hygiene

- No passwords, tokens, cookies, localStorage values, `.env*` values, database URLs, raw database rows, Provider payloads,
  prompt text, raw AI output, plaintext `redeem_code`, or sensitive screenshots are recorded.
- Evidence uses role names, routes, visible behavior, allow/deny result, and redacted issue summaries only.
- Future implementation tasks must create or confirm a task plan and allowed file scope before code changes.

## Current Role Acceptance Summary

| Role                        | Latest result | Repair implication                                                                                                                           |
| --------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | blocked/fail  | Standard learner boundary is not clean enough; advanced-only entries must be hidden or denied with clear upgrade guidance.                   |
| `personal_advanced_student` | fail          | `AI训练` is not discoverable and direct `/ai-generation` is not a clear usable AI question/paper workflow.                                   |
| `org_standard_employee`     | fail          | Standard organization employee must not see `AI训练` or `企业训练`; direct access should show clear standard-unavailable or denied behavior. |
| `org_advanced_employee`     | fail          | Advanced organization employee must see both personal `AI训练` and enterprise `企业训练`.                                                    |
| `org_standard_admin`        | fail          | Login reaches system operations backend; cannot prove separated enterprise admin role or workspace.                                          |
| `org_advanced_admin`        | fail          | Same separation failure as standard enterprise admin, plus advanced enterprise training capability is not proven.                            |
| `content_admin`             | fail          | Content backend is reachable, but landing/logout and AI question/paper entries are incomplete for MVP expectation.                           |
| `ops_admin`                 | fail          | Positive operations access works, but direct content backend access is not denied; ops-specific capability gaps were also observed.          |

## Repair Issue List

| ID  | Area                                  | Issue                                                                                                    | Required outcome                                                                                                                                                        | Priority |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| R1  | Backend workspace separation          | `ops_admin`, `content_admin`, and enterprise admin sessions do not land in clearly separated workspaces. | Each backend role lands in its own workspace, has visible logout, and cannot reach unrelated backend surfaces without a clear denial.                                   | P0       |
| R2  | Enterprise admin role/domain          | Enterprise admin rows currently reuse system operations behavior and cannot prove role separation.       | Introduce a first-class enterprise admin domain/role surface while reusing existing backend capabilities where appropriate.                                             | P0       |
| R3  | Enterprise admin standard boundary    | Standard enterprise admin capability is not separated from advanced enterprise training controls.        | `org_standard_admin` can manage employees and view authorization/status only; no enterprise training management, no AI generation.                                      | P0       |
| R4  | Enterprise admin advanced boundary    | Advanced enterprise admin capability is not proven.                                                      | `org_advanced_admin` can manage employees, view authorization/status, manage enterprise training, and use enterprise training AI question/paper generation.             | P0       |
| R5  | Learner AI entry                      | Advanced personal AI entry is not discoverable.                                                          | `personal_advanced_student` sees `AI训练` for personal AI question/paper generation; `personal_standard_student` does not get advanced AI, only clear upgrade guidance. | P0       |
| R6  | Enterprise employee entry             | Standard/advanced employee navigation is ambiguous.                                                      | `org_standard_employee` has no `AI训练` or `企业训练`; `org_advanced_employee` has both `AI训练` and `企业训练`.                                                        | P0       |
| R7  | Content admin AI entry                | Content backend lacks MVP `AI出题` and `AI组卷` entry proof.                                             | `content_admin` sees content AI question/paper entries. Generated drafts require human review before adoption into `question` or `paper`.                               | P0       |
| R8  | Ops content access denial             | `ops_admin` can directly reach content backend pages.                                                    | `ops_admin` is denied from content authoring surfaces and cannot create content drafts.                                                                                 | P0       |
| R9  | Redeem code quantity generation       | Card generation does not expose single-card or specified-quantity generation.                            | Operations can generate one `redeem_code` or a specified quantity with confirmation and audit-safe feedback.                                                            | P0       |
| R10 | Redeem code scope fields              | Card generation does not expose `profession` and `level` controls.                                       | Card generation requires explicit `profession` and `level`; generated evidence must not expose plaintext card values.                                                   | P0       |
| R11 | Org authorization edition selector    | Org authorization creation lacks standard/advanced edition selection.                                    | Operations can create standard or advanced `org_auth` through an explicit `edition` selector.                                                                           | P0       |
| R12 | Standard-to-advanced org upgrade      | No visible entry upgrades a standard enterprise customer to advanced.                                    | Operations has an approved standard-to-advanced upgrade entry using `auth_upgrade.source_type = ops_manual` semantics.                                                  | P0       |
| R13 | Multi-profession/multi-level org auth | Org authorization creation only supports one `profession` and one `level`.                               | One commercial enterprise authorization package can cover multiple `profession + level` combinations through atomic scope expansion.                                    | P0       |
| R14 | Employee import template              | Employee import has only textarea CSV/TSV paste and no template/download path.                           | Provide a reusable import template/download or clearly equivalent template guidance.                                                                                    | P0       |
| R15 | Employee import semantics             | Multi-scope authorization could tempt employee-level profession/level assignment.                        | Employee import must bind account to `organization` only; employee effective scopes are derived from `org_auth_scope` plus organization membership.                     | P0       |

## Confirmed Requirement Decisions

### Enterprise Admin Domain

Owner decision: option A, with reuse and clear domain modeling.

- Enterprise admin must be a first-class role/domain and must not be represented as ordinary `ops_admin` with organization linkage in acceptance.
- The implementation should reuse existing backend capabilities, components, services, repositories, and admin shell patterns where appropriate.
- Reuse must not duplicate global operations logic into a parallel backend; separation should come from permission guards, organization scope filters, menu configuration, service-layer checks, and route landing behavior.
- Enterprise admin has organization-scoped authority only; no global user, global `redeem_code`, global `org_auth`, global audit, Provider, cost, staging/prod, or content authoring access unless separately approved.
- Model/domain wording should stay aligned with registered terms: `organization`, `employee`, `org_auth`, `authorization`, `admin`, and any future approved enterprise admin capability naming.

### Enterprise Admin Standard And Advanced Boundary

Owner decision: option B.

- `org_standard_admin`:
  - can manage employees inside the organization scope;
  - can view organization authorization/status;
  - cannot manage enterprise training;
  - cannot use AI question/paper generation.
- `org_advanced_admin`:
  - can manage employees inside the organization scope;
  - can view organization authorization/status;
  - can manage enterprise training;
  - can use enterprise training AI question/paper generation.

### Employee Standard And Advanced Boundary

Owner decision: option B.

- `org_standard_employee`:
  - no `企业训练`;
  - no `AI训练`;
  - keeps standard personal/learning behavior only where authorized.
- `org_advanced_employee`:
  - sees `AI训练` for personal advanced AI learning workflows where authorized;
  - sees `企业训练` for enterprise training tasks where authorized.
- Direct route access by a standard employee to advanced-only enterprise or AI flows should show a clear denied or standard-unavailable state.

### Personal And Enterprise AI Entry Boundary

Owner decision: option B.

- `personal_standard_student` does not receive advanced AI capabilities; upgrade guidance is acceptable.
- `personal_advanced_student` must have a discoverable `AI训练` entry for personal AI question/paper generation.
- `org_standard_employee` receives neither personal AI entry nor enterprise training entry from enterprise context.
- `org_advanced_employee` receives both personal `AI训练` and enterprise `企业训练` entries where authorized.

### Content Backend AI Entry

Owner decision: option A.

- `content_admin` must have MVP-visible `AI出题` and `AI组卷` entries.
- Real Provider execution remains gated. Local/mock/gated behavior is acceptable for MVP repair unless a later approved task changes that boundary.
- Generated content must enter a draft/review workflow first.
- Formal adoption into `question` or `paper` requires human review; one-click unreviewed adoption is not acceptable.
- Evidence must not record prompts, Provider payloads, raw AI output, or full generated content.

### Operations Redeem Code And Enterprise Authorization Opening

Owner check: confirmed recorded.

The `ops_admin` targeted observation and follow-up requirements are represented by R9 through R13 in the repair issue list.
The accepted repair requirements are:

- `redeem_code` generation must support one-card generation and specified-quantity generation.
- `redeem_code` generation must expose explicit `profession` and `level` inputs before generation.
- Generated evidence and audit summaries must not expose plaintext card values.
- Enterprise authorization creation must expose an explicit standard/advanced `edition` selector.
- Standard enterprise customers must have an operations-controlled standard-to-advanced upgrade entry.
- Enterprise authorization opening must support a commercial bundle covering multiple `profession + level` combinations through atomic scope expansion.
- The opening flow must not create a second authorization model or duplicate backend. It must reuse the approved `org_auth` bundle and future `org_auth_scope` atomic-scope direction.
- The UI must show the selected bundle, expanded atomic scope rows, quota/expiry/cancellation differences, and conflict warnings before submit.

### Multi-Profession And Multi-Level Enterprise Authorization

Owner decision: option A, confirmed consistent with prior 2026-06-21 product and architecture decisions.

Precise requirement:

- One enterprise authorization package may cover multiple `profession + level` combinations.
- `org_auth` remains the enterprise authorization bundle or purchase record.
- Multi-scope authorization must decompose into atomic authorization scopes, not arrays or comma-joined fields in one `org_auth` row.
- One atomic scope equals organization coverage plus one `profession`, one `level`, one `subject`, one `edition`, one time window, and one quota rule.
- Future implementation target is `org_auth` plus reviewed `org_auth_scope` and `org_auth_scope_organization` child tables.
- `auth_scope_type` continues to describe organization coverage only and must not be overloaded for `profession`, `level`, `subject`, or `edition`.
- Active overlapping atomic scopes for the same effective `organization`, `profession`, `level`, `subject`, `edition`, and time window are denied unless an approved upgrade/extension rule defines resolution.
- Quota is attributed per atomic scope. UI may aggregate quota for display, but service/audit/consumption must retain the atomic scope that granted access.
- Existing multiple `org_auth` rows are compatibility interpretation for current data, not the target design for new multi-scope bundles.

Reference decisions:

- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-scope-contract-security-preflight.md`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-approval-package.md`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-implementation-split.md`

### Employee Import Semantics Under Multi-Scope Authorization

Owner decision: adopt Codex recommendation.

- Employee import imports or binds employee accounts to an `organization` only.
- Import templates should not include `profession`, `level`, `edition`, or `orgAuthScopePublicId` fields.
- Employee effective authorization is derived from active `org_auth_scope` rows that cover the employee's organization context.
- If a customer needs different employees to see different professional or level scopes, the preferred model is organization-node segmentation, then applying authorization scopes to those organization nodes.
- Import preview may show expected inherited authorization scopes and quota impact, but those are computed outcomes, not import inputs.
- If quota is insufficient, MVP repair should reject or block the affected row/action with a redacted reason instead of silently creating unclear partial authorization.
- Existing implementation shape already aligns with this direction: current CSV/TSV paste accepts `phone,name,initialPassword,organizationPublicId`, and legacy binding accepts `userPublicId,organizationPublicId`.

### Backend UI/UX Design-First Repair Gate

Owner decision: backend UI/UX optimization must be design-first, not direct implementation-first.

Affected surfaces:

- enterprise standard backend;
- enterprise advanced backend;
- content operations backend;
- system operations backend.

Requirement:

- Before UI/UX optimization implementation, run a dedicated design pass using the relevant product-design workflow or equivalent design skill sequence.
- The design pass must cover information architecture, navigation, workspace separation, dashboard density, list/detail layout, form flow, empty/error/loading states, permission-denied states, upgrade states, conflict warnings, and confirmation dialogs.
- The design pass must explicitly account for role and edition boundaries, including `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin`.
- The design pass must preserve domain/model clarity. UI structure should reflect `organization`, `employee`, `org_auth`, `org_auth_scope`, `redeem_code`, `question`, `paper`, and related glossary terms instead of introducing ad hoc product names.
- The implementation must reuse existing backend capabilities and shared admin primitives where appropriate, but role separation must be enforced through workspace routing, permission guards, scoped menus, and service-layer checks.
- Do not start UI implementation until the design artifact identifies target routes, major screens, component reuse plan, acceptance states, and allowed implementation file scope.
- The design artifact should be reviewed before code work begins; `Covered` contract status is not runtime Pass and is not enough for final acceptance.

## How This Summary Should Be Applied

1. Keep the role-separated runtime gate blocked until all eight roles pass strict runtime observation.
2. Use this document as the requirement source for the next repair task plan and allowed file-scope approval.
3. Split implementation into reviewable packages. At minimum, separate role/workspace access repair, backend UI/UX design pass, learner entry repair, content AI entry repair, enterprise admin surface repair, org authorization model/UI repair, and employee import template repair.
4. Do not mix schema/migration work with UI-only repair unless a fresh task explicitly approves that combined scope.
5. Do not claim that the advanced AI UI/UX contract `Covered` status is runtime Pass.
6. After repairs, rerun role-separated runtime acceptance for all eight roles and update the evidence/audit documents with redacted allow/deny observations.

## Still Open For Owner Additions

| Topic                               | Current default                                                                                      | Owner can still add before implementation? |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Exact enterprise admin route naming | Reuse existing naming conventions and registered glossary terms.                                     | Yes, before task-plan approval.            |
| Employee import template format     | CSV/TSV or downloadable spreadsheet-compatible template without adding dependencies unless approved. | Yes, before task-plan approval.            |
| Org authorization scope builder UX  | Show selected bundle and expanded atomic rows with conflict warnings.                                | Yes, before task-plan approval.            |
| Backend UI/UX design direction      | Design-first pass before implementation for enterprise, content, and system operations backends.     | Yes, before task-plan approval.            |
| Upgrade workflow copy and states    | Use operations-driven standard-to-advanced upgrade entry and redacted audit metadata.                | Yes, before task-plan approval.            |
| Local/mock AI behavior wording      | Provider remains gated; local/mock/gated draft workflow only.                                        | Yes, before task-plan approval.            |
