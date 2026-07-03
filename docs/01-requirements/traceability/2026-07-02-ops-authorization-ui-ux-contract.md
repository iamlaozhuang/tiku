# Ops Authorization UI/UX Contract

## Scope

This contract covers package 1 of the UI/UX requirement design work:

- operations `org_auth` creation, detail, overlap blocking, and closure actions;
- personal `redeem_code` generation, distribution, list, detail, and plaintext controls;
- employee create/import, password reset, transfer/unbind/disable semantics;
- organization tree operations and inherited authorization visibility;
- pagination, filter persistence, confirmation, and state contracts for operations lists.

It is a docs-only contract. It does not declare source completion, release readiness, production usability, or a final pass.

## Source Baseline

Required governance and architecture inputs read before this package:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` through `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Requirement SSOT inputs used for this package:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

Current source surfaces inspected as implementation evidence:

- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/validators/org-auth.ts`
- `src/server/services/employee-account-service.ts`
- `src/server/validators/employee-account.ts`
- `src/server/repositories/employee-account-repository.ts`
- `src/app/api/v1/redeem-codes/**`
- `src/app/api/v1/org-auths/**`
- `src/app/api/v1/employees/**`

## Existing Decisions

The current thread decision ledger already records the package-1 decision range:

- `CT-REQ-004`: same atomic active `org_auth` overlap is blocked by default; no automatic merge.
- `CT-REQ-005`: personal `redeem_code` is split into `personal_standard_activation`, `personal_advanced_activation`, and `edition_upgrade`.
- `CT-REQ-006`: eligible `ops_admin` and `super_admin` can view/copy plaintext cards in distribution, list, and detail surfaces; evidence/log/export/screenshot boundaries remain redacted.
- `CT-REQ-007`: ambiguous `edition_upgrade` target requires explicit user/operator selection.
- `CT-REQ-008`: commercial enterprise packages may be bundled in UI but decompose into atomic `profession + level + edition + organization scope`.
- `CT-REQ-009`: admin accounts and learner/employee accounts are separate phone domains.
- `CT-REQ-010`: employee import/mutation remains platform-owned in first release.
- `CT-REQ-011`: employee create/import requires target `organization`, phone/name, optional `initialPassword`, generated one-time distribution if omitted, and no employee-level auth fields.
- `CT-REQ-012`: different employee access is handled through organization tree segmentation and node-level `org_auth`, not employee-level authorization whitelist.
- `CT-REQ-013`: employee forgotten password is handled by platform reset, session revocation, and one-time distribution.
- `CT-REQ-014`: employee transfer blocks on target quota shortage and revokes active sessions.
- `CT-REQ-015`: organization tree mutation remains platform-owned; node move is `super_admin` only.
- `CT-REQ-022`: operations flows require guided creation, pagination, URL query preservation where practical, and role-aware account ownership.
- `CT-REQ-050`, `CT-REQ-054`: organization admins get scoped workspaces but no first-release employee, tree, or `org_auth` write authority.
- `CT-REQ-051`, `CT-REQ-052`: employee field and card plaintext/backfill decisions must be cited by later source work.

No new product decision is introduced by this contract. The open items below are implementation gaps or technical design tasks created by existing decisions.

## Current Code Alignment

| Area                            | Current implementation evidence                                                                                                                                                                                                                     | Alignment                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `org_auth` base creation        | `OrgAuthActionPanel` and `normalizeCreateOrgAuthInput` support one `profession`, one `level`, explicit `edition`, `authScopeType`, quota, start/end dates, and selected organizations. Runtime rejects overlap and writes redacted audit summaries. | Partially aligned.                                                                                           |
| `org_auth` pagination           | runtime list query accepts `page`, `pageSize` 20/50/100, sort, status, and keyword.                                                                                                                                                                 | Aligned for list contract baseline.                                                                          |
| `org_auth` overlap blocking     | repository expands organization scope, locks quota scope, checks active overlapping same profession/level/date/organization, and returns conflict.                                                                                                  | Aligned for default blocking.                                                                                |
| `org_auth` closure loop         | source has cancel and create, but not guided renewal, manual upgrade, transactional replacement, or increase-only quota expansion UI.                                                                                                               | Gap.                                                                                                         |
| enterprise multi-scope package  | current validator and schema-facing DTO accept one profession and one level per `org_auth`.                                                                                                                                                         | Gap; must be solved by package + atomic scope design, not comma fields.                                      |
| `redeem_code` generation        | UI and backend support single/batch, profession, level, duration, deadline, count, and generated plaintext in creation response.                                                                                                                    | Partially aligned.                                                                                           |
| `redeem_code_type`              | current UI/backend generation DTO and validator do not carry `redeem_code_type`.                                                                                                                                                                    | Gap.                                                                                                         |
| plaintext card list/detail      | repository masks list/detail and sets `canViewPlainText: false`; detail UI states plaintext/hash are hidden.                                                                                                                                        | Gap against current eligible-role decision.                                                                  |
| distribution window             | generation response contains plaintext, but current UI only keeps a summary and masks inserted generated codes.                                                                                                                                     | Gap.                                                                                                         |
| employee import                 | runtime supports CSV/TSV content with phone/name/initialPassword/organizationPublicId or existing-user binding; rejects profession/level/edition/orgAuthScopePublicId headers.                                                                      | Partially aligned.                                                                                           |
| employee create/import password | validator requires `initialPassword`; no generated one-time distribution is evidenced.                                                                                                                                                              | Gap.                                                                                                         |
| import target organization      | current text import uses per-row `organizationPublicId`; requirement says operations must select target node before upload/import.                                                                                                                  | Gap.                                                                                                         |
| employee mutation               | current UI/runtime shows create/import, disable, unbind, and transfer approval-required placeholder.                                                                                                                                                | Partially aligned; transfer, profile edit, reset password, and one-time distribution need later source work. |
| organization tree               | UI/runtime include create, update, disable, enable, and depth/cycle-oriented validation surfaces.                                                                                                                                                   | Partially aligned; move restriction and non-technical tree workflow need later UX/source work.               |
| organization admin boundary     | source mutation guards are platform `super_admin`/`ops_admin` oriented; organization admin self-service mutation is not evidenced.                                                                                                                  | Aligned with first-release ownership boundary.                                                               |

## Role Contract

- `super_admin`: can manage operations surfaces, backend role/admin accounts, organization admin accounts, node move, and all platform-owned employee/tree/auth/card flows.
- `ops_admin`: can manage users, organizations, employees, `org_auth`, `redeem_code`, contact config, and redacted logs; can maintain organization admin accounts only when explicitly scoped by product policy.
- `content_admin`: must not enter global operations authorization, employee mutation, or card plaintext workflows.
- `org_standard_admin`: scoped read-only organization workspace for organization info, employee roster/status, and authorization status.
- `org_advanced_admin`: `org_standard_admin` capabilities plus enterprise training, organization analytics, and organization AI surfaces; still no employee import/mutation, organization tree mutation, or `org_auth` configuration in first release.
- `employee` / `student`: learner-facing authorization is computed from the union of valid personal and organization authorization sources; employees inherit organization authorization from their bound organization node.

Admin account phone domain and learner/employee account phone domain must not reuse the same phone. A learner account may be bound as an employee inside the learner/employee domain without losing personal password, personal authorization, or personal history.

## Organization Admin Account Contract

Organization admin account creation is a backend-admin account operation, not an employee import operation.

Required fields:

- admin phone;
- admin name;
- role: `org_standard_admin` or `org_advanced_admin`;
- bound `organization` node;
- initial password or generated password;
- optional note or external ticket/reference.

If password is generated, it is displayed only once in a distribution window. The phone must not exist in the learner/employee account domain and must not already belong to another backend-admin account unless the flow is an explicit role/binding update for the same backend-admin identity.

Ownership:

- `super_admin` owns `ops_admin`, `content_admin`, and organization admin account/role management.
- `ops_admin` may create or maintain organization admin accounts only when explicitly scoped by product policy or an operations ticket.
- organization admins cannot create other organization admins in first release.

## Operations Workspace Contract

The operations authorization workspace should be task-oriented, not model-table oriented. The first viewport should let operations staff answer:

- which organization node is selected;
- what employee roster/status and inherited authorization state are visible;
- what `org_auth` records apply to that node or selected scope;
- what card generation or distribution action is currently in progress;
- whether any blocking conflict has an explicit next action.

Required common states:

- loading skeleton for lists, details, tree nodes, and preview panels;
- empty state that says what can be done next without exposing implementation terms;
- validation state beside the field and summarized before submit;
- conflict state with impacted scope, dates, quota, and allowed closure actions;
- permission-denied state that names the missing role/workspace rather than showing a blank page;
- success state with next operational action;
- destructive or scope-changing operations behind confirmation dialog.

All backend lists in this workspace use `page`, `pageSize`, `sortBy`, and `sortOrder`. Default page size is 20; 50 and 100 are allowed. Filter, sort, page, and pageSize should persist in URL query where practical.

## `org_auth` UX Contract

### Create Flow

Enterprise authorization creation uses a four-step guided flow:

1. Package metadata: name, purchaser organization, edition, start/end date, quota owner, notes.
2. Atomic scope selection: one or more `profession + level` rows, plus organization coverage through `auth_scope_type`.
3. Conflict and quota review: expanded affected organization nodes, used/available quota, overlap warnings, and previewed employee impact.
4. Final confirmation: immutable summary, explicit acceptance of warnings, audit note or external reference where applicable.

`auth_scope_type` describes organization coverage only. It must not be overloaded for profession, level, subject, edition, or employee whitelist semantics.

### Multi-Scope Package

The UI may present a commercial package as one bundle, but service semantics remain atomic. Every later implementation must decompose the bundle to atomic rows for:

- access eligibility;
- quota occupation;
- expiration and cancellation;
- conflict detection;
- audit event timeline.

Do not encode multiple professions or levels as arrays or comma strings inside one existing `org_auth.profession` or `org_auth.level` field without a reviewed schema/API design.

### Overlap Closure

Same atomic active overlap blocks by default. The blocking state must show:

- conflicting authorization public reference, purchaser, edition, profession, level, date range, quota/used quota, and covered organization summary;
- why automatic merge is not allowed;
- the four explicit closure actions.

Allowed closure actions:

- renewal successor: create a successor whose start/end dates do not overlap;
- manual standard-to-advanced upgrade: write `auth_upgrade.source_type = ops_manual`; do not overwrite original `org_auth.edition`;
- transactional replacement: cancel/replace old auth and create new auth in one governed flow;
- increase-only quota expansion: only expand quota on the same active atomic range.

Every closure action writes an auditable timeline entry. The flow must close the loop so operations can complete the authorization and the enterprise can continue using the granted scope after the explicit action succeeds.

### Detail

Authorization detail must show:

- base metadata and status;
- original `edition`, computed `effectiveEdition`, and upgrade status;
- purchaser, coverage type, and covered organization list;
- atomic scope rows;
- quota/used/available counts;
- employee occupation summary;
- timeline for create, renewal, upgrade, replacement, quota expansion, cancellation, and audit events.

## `redeem_code` UX Contract

### Generate

Card generation requires explicit selection before submit:

- `redeem_code_type`: `personal_standard_activation`, `personal_advanced_activation`, or `edition_upgrade`;
- `profession`;
- `level`;
- duration;
- optional redeem deadline;
- single or specified quantity.

There is no implicit default to standard activation.

### Distribution

Generation success opens a distribution window. It displays only the current generated batch and supports copy. It should expose enough metadata for safe distribution: generation group, count, type, profession, level, deadline, and created time.

After leaving the distribution window, `ops_admin` and `super_admin` can still view/copy plaintext card values from ordinary list and detail pages. Other roles are masked or denied.

Plaintext view/copy records audit metadata only: actor, action, time, target `publicId`, and purpose/reason when collected. Audit logs, runtime logs, error logs, committed docs, evidence, screenshots, exports, and non-distribution audit summaries must not contain plaintext card values or card hashes.

### List And Detail

Card list must support search, status filter, pagination, and page size 20/50/100. Detail must show generation metadata, redeem metadata, type, profession, level, duration, deadline, status, and eligible-role plaintext controls.

The UI must avoid making masked text look copyable when the actor cannot view plaintext.

### Redemption Upgrade Target

`edition_upgrade` redemption requires matching active standard `personal_auth` for the same user, profession, and level. If multiple targets exist, the user or operator must explicitly choose the target. If effective advanced access already exists for the same scope, the upgrade card must not be consumed.

## Employee And Organization Contract

### Employee Create

Single create fields:

- target `organization` node;
- phone;
- name;
- optional initial password.

If password is omitted, the system generates one and shows it only once in a distribution window. Cross-domain phone reuse with backend admin accounts is blocked.

### Employee Import

Import flow:

1. Select target organization node before upload/input.
2. Upload `.xlsx` or use an equivalent template-guided tabular input.
3. Preview rows: new, bind existing learner, skip, block, quota impact, inherited authorization summary, and redacted reason.
4. Confirm import.
5. Show result and one-time password distribution for generated passwords.

Template fields:

- required: phone, name;
- optional: initialPassword.

Forbidden template fields:

- `profession`;
- `level`;
- `edition`;
- `orgAuthScopePublicId`;
- any employee-level authorization whitelist.

### Employee Mutation

First release platform-owned employee actions:

- create/import;
- profile/status correction where approved by platform operations policy;
- disable/enable where supported;
- transfer to another organization with quota check;
- unbind from organization;
- password reset with session revocation and one-time distribution.

No first-release physical user deletion is introduced. If operations needs a "delete-like" action, the UX must use disable or unbind semantics and preserve authorization, answer records, training records, reports, and audit trail.

Organization admins see scoped roster/status and authorization summaries only. They cannot create, import, edit, transfer, unbind, disable, reset passwords, mutate organization tree, or configure `org_auth` in first release.

### Employee Access

Employees inherit active `org_auth` through their organization node. Different access groups are modeled by placing employees into different organization nodes and granting node-level `org_auth`.

No first-release employee-level authorization whitelist is allowed.

Personal authorization and organization authorization coexist. Learner-visible content is available if any valid authorization source grants the same profession/level. Surfaces that need an audit/report organization context use the organization snapshot when the action was performed through enterprise authorization.

### Organization Tree

The tree must be understandable for non-technical operations staff:

- show hierarchy with clear node names, status, tier, employee count, and authorization summary;
- create/edit/disable/enable are platform-owned operations;
- node move is `super_admin` only;
- prevent circular parent selection;
- enforce max depth 4;
- show current node and child coverage before applying scope actions;
- hide parent/sibling/global details from organization-admin scoped views.

## Follow-Up Source Work Register

| ID                 | Source work needed later                                                                                                                        | Reason                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| OPS-AUTH-UX-GAP-01 | Add `redeem_code_type` through UI, API, service, repository, schema/DTO, redemption, and audit flows.                                           | Current code only carries profession/level/duration/deadline.                        |
| OPS-AUTH-UX-GAP-02 | Implement eligible-role plaintext card list/detail controls and redacted view/copy audit metadata.                                              | Current list/detail are always masked.                                               |
| OPS-AUTH-UX-GAP-03 | Implement distribution window that shows current batch plaintext and copy controls.                                                             | Current UI keeps only generation summary and masks inserted items.                   |
| OPS-AUTH-UX-GAP-04 | Implement `edition_upgrade` target picker and non-consumption rule when advanced access already exists.                                         | Current target disambiguation is not evidenced.                                      |
| OPS-AUTH-UX-GAP-05 | Design and implement enterprise package + atomic scope representation for multi-profession/multi-level packages.                                | Current `org_auth` accepts one profession and one level.                             |
| OPS-AUTH-UX-GAP-06 | Add guided overlap closure flows for renewal, manual upgrade, transactional replacement, and increase-only quota expansion.                     | Current source blocks overlap but does not complete the closure loop.                |
| OPS-AUTH-UX-GAP-07 | Change employee import/create to target-node-first, optional password, generated password distribution, and `.xlsx`/template-friendly import.   | Current validator requires per-row password and per-row organization public id.      |
| OPS-AUTH-UX-GAP-08 | Add employee transfer and password reset flows with session revocation and quota impact preview.                                                | Current transfer is approval-required placeholder; reset not evidenced.              |
| OPS-AUTH-UX-GAP-09 | Add non-technical organization-tree workflow improvements and `super_admin` node-move contract.                                                 | Current source covers basic CRUD/status but not full move UX.                        |
| OPS-AUTH-UX-GAP-10 | Ensure operations lists preserve filter/sort/page/pageSize in URL query.                                                                        | Server supports pagination; front-end query persistence is partial.                  |
| OPS-AUTH-UX-GAP-11 | Add organization admin account create/update/reset UX with role, organization binding, generated-password distribution, and phone-domain guard. | Current package source inspection did not evidence this complete admin-account flow. |

## Non-Claims

- No product source code was changed by this contract.
- No database, schema, migration, seed, runtime, Provider, browser, deployment, dependency, or environment action is authorized here.
- No release readiness, final Pass, or production usability claim is made.
