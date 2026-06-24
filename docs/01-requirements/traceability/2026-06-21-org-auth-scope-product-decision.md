# Org Auth Scope Product Decision

**Date:** 2026-06-21
**Decision status:** decision package recorded; contract/security preflight and schema approval packages added; implementation blocked pending fresh schema implementation approval, authorization-model implementation approval, and runtime security review.
**Related use cases:** `UC-STD-ORG-AUTH-MANAGED`, `UC-ADV-AUTH-CONTEXT-UPGRADE`

## Decision

This task closes the discovered `org_auth` scope question as a product decision only. It does not change schema, API contracts, services, UI, data, migrations, or runtime authorization behavior.

The product decision package is:

1. `subject` is a real authorization dimension. Existing `org_auth` records and current runtime behavior are treated as covering both registered `subject` values, `theory` and `skill`, until a future schema/contract task explicitly introduces subject-scoped authorization.
2. Product workflows may sell or display multi-`profession` and multi-`level` bundles, but authorization evaluation must use atomic scopes. One atomic scope is `organization` coverage plus one `profession`, one `level`, one `subject`, one `edition`, one time window, and one quota rule.
3. A bundle that covers multiple `profession`, `level`, or `subject` values must decompose into multiple atomic authorization scopes. Do not store unreviewed arrays or comma-joined values in an `org_auth` row.
4. `auth_scope_type` continues to describe organization coverage only: `current_and_descendants` or `specified_nodes`. It must not be overloaded to mean `profession`, `level`, or `subject` coverage.
5. Enterprise backend access is shared by `organization` and `employee` context. Multiple `org_auth` records compose the same enterprise backend capability set; they do not create separate backend portals.
6. Active overlapping scopes for the same effective `organization`, `profession`, `level`, `subject`, `edition`, and time window are prohibited unless a separately approved upgrade or extension rule defines conflict resolution.
7. Account quota is evaluated per atomic authorization scope. Product pages may aggregate quota for display, but services must keep audit and consumption attributable to the atomic scope that grants access.
8. Follow-up approval on 2026-06-21 selected option A for the schema path: keep `org_auth` as the authorization bundle or purchase record and introduce a reviewed atomic scope child table for future scoped authorization rows. This is a planning decision only and does not approve schema, migration, seed, database, API, service, UI, or runtime implementation.
9. Follow-up approval on 2026-06-21 selected option B for implementation sequencing: contract design and security review preflight should be merged into one first package, while schema approval, migration, seed, database, service, UI, and runtime work remain separately gated.

## Current Runtime Baseline

| area              | current fact                                                                                    | decision impact                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| schema            | `org_auth` stores one `profession` and one `level`; it does not store `subject`.                | Current data remains backward-compatible and should be interpreted as covering `theory` and `skill`. |
| organization      | `org_auth_organization` stores covered organizations for `specified_nodes`.                     | Organization coverage remains separate from profession/level/subject coverage.                       |
| API contract      | `OrgAuthDto` exposes `profession`, `level`, `authScopeType`, and `organizationPublicIds`.       | Future subject and bundle fields need a contract design before implementation.                       |
| standard use case | Standard organization authorization is platform-managed; enterprise self-service is not in MVP. | Product decisions can be documented now, but runtime changes remain gated.                           |

## Product Rules

### Subject

- Existing `org_auth` means access to both `subject` values: `theory` and `skill`.
- Future subject-scoped authorization must use registered `subject` values only.
- If a product flow needs "all subjects", implementation should create or evaluate multiple atomic subject scopes rather than adding an unregistered enum value.
- Subject-scoped enablement requires contract, schema, service, UI, seed/migration, and security review tasks.

### Multiple Profession And Level

- Sales/admin UX may present a single package covering multiple `profession` or `level` values.
- Backend authorization must remain atomic for eligibility, quota, expiry, cancellation, audit, and reporting.
- Future implementation should use the approved direction of `org_auth` bundle or purchase records plus reviewed atomic scope child rows. Multiple `org_auth` rows remain a compatibility interpretation for existing data, not the target design for new multi-scope bundles.
- UI aggregation must not hide conflicts, expiry differences, quota differences, or cancellation state.

### Shared Enterprise Backend

- An `employee` enters one enterprise backend through their `organization` context.
- Effective capabilities are computed from all active `org_auth` scopes covering that employee's organization and time window.
- Enterprise backend navigation, analytics, and training views should display the effective scope set, not switch the user into separate portals per `org_auth`.
- Admin operations must use public identifiers in URLs and logs; self-increment IDs remain internal.

### Overlap And Conflict

- The default rule is deny-overlap for active effective scopes with the same atomic authorization dimensions.
- Upgrade, renewal, extension, cancellation, and downgrade behavior need separate product rules before code changes.
- Any overlap exception must define precedence, quota transfer, audit wording, and rollback behavior.

## Implementation Boundary

This decision creates follow-up work; it does not approve runtime implementation.

Required future task packages:

1. Contract/security preflight decision: DTO fields, create/update inputs, list/detail aggregation, bundle metadata, atomic scope rows, backward compatibility, URL public IDs, audit_log wording, employee boundary checks, cross-organization leakage tests, and redacted evidence rules. Recorded in `docs/02-architecture/interfaces/2026-06-21-org-auth-scope-contract-security-preflight.md`.
2. Schema approval package: design the reviewed atomic scope child table path and request fresh schema/migration approval before any implementation. Recorded in `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-approval-package.md`.
3. Service decision: effective authorization calculation, overlap detection, quota attribution, and cancellation semantics.
4. UI decision: bundle creation/editing, detail page aggregation, enterprise backend scope display, and conflict warnings.
5. Migration/seed plan: existing records interpreted as both `theory` and `skill` until an approved migration path exists.

## Blocked Without Fresh Approval

- Schema, migration, seed, or database changes.
- Authorization runtime behavior changes.
- Contract/service/UI implementation.
- Browser/e2e/dev-server runtime verification.
- `.env`, Provider, dependency, package, lockfile, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work.

## 2026-06-24 Role-Separated MVP Alignment Addendum

The 2026-06-24 role-separated MVP requirement alignment confirmed that this decision remains the correct direction for enterprise standard/advanced repair:

- One commercial enterprise authorization package may cover multiple `profession + level` combinations.
- `org_auth` remains the authorization bundle or purchase record.
- Multi-scope authorization must decompose into atomic authorization scopes. Do not store arrays or comma-joined professional/level values in one `org_auth` row.
- One atomic scope is organization coverage plus one `profession`, one `level`, one `subject`, one `edition`, one time window, and one quota rule.
- Future implementation target remains `org_auth` plus a reviewed atomic child-scope direction such as `org_auth_scope` and organization coverage child rows.
- `auth_scope_type` continues to describe organization coverage only and must not be overloaded for `profession`, `level`, `subject`, or `edition`.
- Active overlapping atomic scopes for the same effective `organization`, `profession`, `level`, `subject`, `edition`, and time window remain denied unless a later approved upgrade, renewal, or extension rule defines resolution.
- Quota is attributed per atomic scope. UI may aggregate quota for display, but service, audit, and consumption must retain the atomic scope that granted access.
- Employee import binds employees to `organization` only. Templates must not include `profession`, `level`, `edition`, or `orgAuthScopePublicId`; effective scopes are derived from organization membership plus active authorization scopes.

This addendum is a requirement clarification only. It still does not approve schema, migration, seed, database, API, service, UI, runtime, e2e, Provider, payment, deployment, PR, merge, push, or final MVP Pass.
