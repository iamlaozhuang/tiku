# Org Auth Scope Contract And Security Preflight

**Date:** 2026-06-21
**Status:** docs-only contract/security preflight recorded; implementation remains blocked.
**Depends on:** `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`; `docs/02-architecture/interfaces/2026-06-21-org-auth-implementation-split.md`

## Approval Boundary

The user selected option A on 2026-06-21 for this follow-up package: create a docs-only `org-auth-scope-contract-and-security-preflight` package.

This package may define DTO/API behavior, compatibility rules, overlap semantics, public identifier rules, redaction, audit_log wording, and cross-organization leakage checks. It does not approve source implementation, schema, migration, seed, database connection, service/UI implementation, dependency changes, env/secret access, Provider calls, browser/dev-server/e2e runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate work.

## Current Contract Baseline

Static source readback for this package found these current facts:

- `OrgAuthDto` exposes `publicId`, `name`, `purchaserOrganizationPublicId`, `authScopeType`, `profession`, `level`, optional `edition`, optional `effectiveEdition`, optional `upgradeStatus`, quota fields, time-window fields, `status`, `cancelledAt`, and `organizationPublicIds`.
- `normalizeCreateOrgAuthInput` accepts one `profession`, one `level`, one `edition`, one `authScopeType`, one quota, one time window, and optional covered `organizationPublicIds`.
- Current `/api/v1/org-auths`, `/api/v1/org-auths/{publicId}`, and `/api/v1/org-auths/{publicId}/cancel` surfaces are single-scope compatibility surfaces.
- `auth_scope_type` currently describes organization coverage only and must not be reused for `profession`, `level`, `subject`, or `edition` coverage.

## Contract Decision

Future multi-scope `org_auth` work must keep the current single-scope fields backward-compatible until a later implementation task receives approval. New contract fields must be additive and must not silently change existing field semantics.

The future detail contract should expose an atomic scope list instead of replacing existing `profession`, `level`, or `subject` values with arrays or comma-joined strings. A future atomic scope DTO should use camelCase JSON fields:

| field                   | rule                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `scopePublicId`         | Public identifier for the atomic scope after schema approval; compatibility projections may return `null`. |
| `profession`            | One registered `profession` value only.                                                                    |
| `level`                 | One positive integer level only.                                                                           |
| `subject`               | One registered `subject` value only: `theory` or `skill`.                                                  |
| `edition`               | One source authorization edition value.                                                                    |
| `authScopeType`         | Organization coverage only: `current_and_descendants` or `specified_nodes`.                                |
| `organizationPublicIds` | Public identifiers for covered organizations when needed by the coverage rule; no internal ids.            |
| `accountQuota`          | Quota owned by this atomic scope.                                                                          |
| `usedQuota`             | Usage attributed to this exact atomic scope.                                                               |
| `startsAt`              | ISO 8601 start timestamp.                                                                                  |
| `expiresAt`             | ISO 8601 expiry timestamp.                                                                                 |
| `status`                | Current authorization status.                                                                              |

The future bundle/detail DTO may add:

- `atomicScopes`: `OrgAuthAtomicScopeDto[]`;
- `scopeCount`: number of atomic scopes;
- aggregated quota display fields that are explicitly presentation-only;
- conflict or warning summaries that do not expose internal ids or hidden database rows.

Existing `OrgAuthDto` fields remain compatibility fields for current records and current UI. They must not become arrays and must not be omitted. Optional values must return `null`, not empty strings.

## Input Contract Rules

Future create/update work must use an explicit atomic-scope input contract after schema approval. If product UX offers "all registered subjects", the client or service must expand that choice into individual atomic scope rows for `theory` and `skill`; it must not introduce an unregistered `subject` enum value.

Future input validation must reject:

- arrays or comma-joined strings in existing single-value fields;
- unregistered `profession`, `subject`, `edition`, `auth_scope_type`, or status values;
- missing covered organizations for `specified_nodes`;
- internal numeric ids in URLs, request bodies, logs, audit evidence, or generated documents;
- active overlap with an existing effective atomic scope unless a later approved upgrade or extension rule applies.

## API Surface Rules

Existing routes may remain the compatibility surface:

- `GET /api/v1/org-auths`
- `POST /api/v1/org-auths`
- `GET /api/v1/org-auths/{publicId}`
- `POST /api/v1/org-auths/{publicId}/cancel`

Future multi-scope detail behavior may be added to the detail response as an additive field. A separate sub-resource for atomic scopes must not be introduced until the schema approval package chooses the storage and URL model.

All responses must keep the standard envelope:

```json
{ "code": 0, "message": "ok", "data": {}, "pagination": null }
```

When `pagination` is not relevant, the response may omit `pagination` only if the current route contract already omits it; new paginated responses must include it consistently. Lists with no rows return `[]`.

## Compatibility Rules

Existing `org_auth` rows without atomic child rows are compatibility records. Until an approved migration exists, they are interpreted as covering both registered `subject` values: `theory` and `skill`.

Compatibility projection must not silently narrow active access. If a future detail surface needs to show atomic scopes for an existing row, it may project two read-only effective scope items, one for `theory` and one for `skill`, with `scopePublicId: null` until schema approval creates durable public identifiers.

New code must not write legacy compatibility projections back into formal storage without a separately approved schema/migration task.

## Overlap And Conflict Semantics

The default rule is deny-overlap for active effective atomic scopes with the same:

- effective `organization` coverage, including descendant coverage where `authScopeType` grants it;
- `profession`;
- `level`;
- `subject`;
- `edition`;
- intersecting time window.

Overlap checks must consider direct covered organizations and descendants consistently. A scope from one unrelated organization branch must never grant access to another branch.

Upgrade, renewal, extension, cancellation, and downgrade exceptions remain blocked. Any exception must define precedence, quota transfer, audit_log wording, rollback behavior, and evidence requirements before implementation.

## Security Review Requirements

Before any implementation package starts, reviewers must confirm:

- `auth_scope_type` still means organization coverage only.
- `subject`, `profession`, `level`, and `edition` remain atomic authorization dimensions.
- Employee access is evaluated from the employee's `organization` context and cannot cross organization branches.
- Quota usage is attributed to one atomic scope and protected against concurrent over-consumption.
- Cancellation, expiry, upgrade, renewal, and extension cannot over-grant authorization.
- Existing compatibility records covering both `theory` and `skill` cannot silently lose access during migration.
- API JSON fields are camelCase and API paths are kebab-case.
- Optional response values use `null`, never empty strings.
- External URLs and audit references use public identifiers only.
- Error messages do not expose internal numeric ids, database rows, tokens, or secret material.

## audit_log And Evidence Rules

Future audit_log entries for this area should record:

- operator public identifier and role;
- target `org_auth` public identifier;
- affected organization public identifiers;
- action category such as create, update, cancel, overlap_denied, or migration_projection;
- redacted before/after summary for scope dimensions and quota;
- timestamp and result status.

Audit and evidence must not contain session tokens, database URLs, internal numeric ids, plaintext redeem_code values, raw prompt text, Provider payloads, raw employee answer text, or full private content.

## Follow-Up Gates

This preflight package unlocked the next discussion item. The user selected option A on 2026-06-21 to create the docs-only `org-auth-schema-approval-package`, recorded in `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-approval-package.md`. That package still does not approve schema source edits, migration generation or execution, seed, database connection, or data backfill work.

Remaining gates:

1. `org-auth-schema-approval-package`
2. `org-auth-effective-scope-service`
3. `org-auth-admin-scope-builder-ui`
4. `org-auth-compatibility-and-migration-guard`
5. `org-auth-runtime-verification`

Each gate needs its own task plan, evidence, audit review, validation, and approval boundary.
