# 2026-07-12 Phone Visibility And Prelaunch AI Paper History Decision

## Status

Accepted product decision. It supersedes only the ambiguous “display phone” wording in the user-management requirement. It does not change phone login identity, phone immutability, authorization, or the protected plaintext `redeem_code` requirement.

## Authority And Scope

- User approval: serial completion of the decision, enforcement, and validation tasks on 2026-07-12.
- Stable requirements: `01-user-auth.md`, `06-admin-ops.md`, `epic-06-admin-ops.md`, advanced-edition authorization requirements, and ADR-007.
- Architectural boundaries: ADR-002 requires service-owned API policy; ADR-007 keeps authorization server-owned and does not permit UI-only access control.
- AI history baseline: the 2026-07-02 AI requirements alignment and the 2026-07-12 AI training history-resume evidence/audit remain current. This decision does not reopen prior AI issue classes.

## Phone Visibility Decision

Phone is an immutable login identifier in the learner/employee account domain. Visibility is a separate personal-information policy and is enforced by the server before a DTO reaches a client.

| Actor and surface                                                      | Default phone value              | Full-phone action                       | Search                                                     | Audit/export/error boundary                                                                   |
| ---------------------------------------------------------------------- | -------------------------------- | --------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Learner or employee profile and learning pages                         | Masked                           | No reveal or copy                       | Not applicable                                             | No full phone in UI, audit view, or feedback                                                  |
| `org_standard_admin`, `org_advanced_admin`, and `content_admin`        | Masked                           | No reveal or copy                       | No full-phone result                                       | No full phone in UI, audit view, or feedback                                                  |
| `ops_admin` and `super_admin` user/employee lists and ordinary details | Masked                           | Explicit single-record reveal/copy only | Exact phone and name search allowed; results remain masked | Audit the reveal/copy action without storing the full phone; exports and errors remain masked |
| Employee import                                                        | Submitted phone is an input only | Not applicable                          | Input validation only                                      | Preview results, completion feedback, ordinary lists, and audit summaries remain masked       |

### Runtime Contract Required By The Next Task

1. List and ordinary detail APIs return masked phone values for every role.
2. Full-phone access is a dedicated, non-cacheable action for exactly one user/employee record. The route handler delegates authorization and audit metadata construction to services; it does not return database rows.
3. The action fails closed for an unauthenticated actor, an ineligible role, a missing record, an actor without visibility to that record under the existing scope rules, or a malformed identifier. It does not redefine the existing organization visibility model for qualified operations roles.
4. The browser must not receive full-phone values before a successful authorized reveal. Copy requires a separate explicit user gesture and an auditable action; the audit records the requested copy operation, not an unverifiable claim about the browser clipboard. No client-side unmasking is accepted as enforcement.
5. Full phone values are excluded from list cache keys, responses, exports, ordinary audit DTOs, error messages, screenshots, and committed evidence. Tests may use only synthetic values needed to verify masking behavior.

## Protected Boundaries

- A15 is unchanged: the eligible `ops_admin` / `super_admin` plaintext `redeem_code` distribution capability and its existing audit rules remain protected. Phone access must not reuse, broaden, or weaken that exception.
- Login, registration, employee creation, employee import input, uniqueness, and the first-release “phone cannot be changed” rule are unchanged.
- No schema migration, data backfill, dependency, Provider, environment, database action, staging, production, or deployment is implied by this decision.

## Prelaunch AI Paper History Disposition

The current database contains only prelaunch test and acceptance data. AI paper history without an assembled persisted snapshot is not a supported restoration format.

- A result with a complete assembled snapshot may start or continue an immutable learning session under its authorized owner scope.
- A result without that snapshot remains readable only. It is not reconstructed from live question sources, client data, or a Provider request.
- Existing temporary records are retained while the current acceptance baseline needs them. They may be removed or replaced only by a separately approved test-data refresh task with an exact target, dependency inventory, rollback/rebuild plan, and post-operation verification.
- New test data created after a future refresh must use only complete assembled snapshots for resumable AI paper flows.

## Follow-Up Sequence

1. `user-led-phone-visibility-enforcement-2026-07-12`: inventory phone-bearing DTOs and implement the server-owned masking, single-record reveal/copy, and audit boundary.
2. `user-led-phone-visibility-validation-2026-07-12`: execute focused and full regression coverage for direct routes, role/organization boundaries, caching, exports, audit summaries, and responsive UI.
3. `user-led-prelaunch-test-data-refresh-2026-07-12`: remains pending a separate decision after the first two tasks close. It is not authorized by this document.

## Conflict Resolution

- Earlier wording that a user list “displays phone” now means a masked display by default. The explicit reveal/copy policy above resolves the prior ambiguity.
- Organization portal masking and the new operations policy are consistent: lower-privilege roles never receive a full phone; qualified operations roles receive it only through the dedicated action.
- The A14 identifier belongs to the 2026-07-11 acceptance remediation ledger. It is distinct from an unrelated account-provisioning document that also uses an A14 row number.

## Non-Claims

This decision does not claim that runtime enforcement, data refresh, staging, production, deployment, Provider-enabled behavior, Cost Calibration, or release readiness is complete.
