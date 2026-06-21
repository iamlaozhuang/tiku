# Org Auth Implementation Split

**Date:** 2026-06-21
**Status:** split plan and security checklist recorded; implementation remains blocked without fresh approval.
**Depends on:** `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`

## Current Baseline

- `org_auth` currently stores one `profession`, one `level`, organization coverage, quota, time window, edition, and status.
- `org_auth` does not store `subject`.
- `org_auth_organization` stores organization coverage for `specified_nodes`.
- `OrgAuthDto` exposes `profession`, `level`, `authScopeType`, and `organizationPublicIds`.
- Admin UI currently creates one `profession` and one `level`, while allowing multiple covered organizations.
- Product decision now says `subject`, `profession`, and `level` must be evaluated as atomic authorization dimensions and that multiple commercial scopes must decompose into atomic scopes.

## Split Strategy

Implementation must be split into reviewable packages in this order.

| order | package id                                   | type                         | purpose                                                                                                                | blocked work                                                     |
| ----- | -------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1     | `org-auth-scope-contract-design`             | contract/design              | Define create/update/list/detail DTOs for atomic scopes, bundle display, compatibility, null behavior, and public IDs. | No runtime behavior or schema change.                            |
| 2     | `org-auth-security-review-preflight`         | security review              | Review cross-organization leakage, overlap, quota, cancellation, audit_log, and employee boundary risks.               | No implementation until checklist is accepted.                   |
| 3     | `org-auth-schema-approval-package`           | schema decision              | Compare schema choices and request fresh approval before any migration or seed work.                                   | No schema, migration, seed, or database connection in this task. |
| 4     | `org-auth-effective-scope-service`           | service implementation       | Implement atomic effective-scope calculation, overlap detection, quota attribution, and cancellation semantics.        | Requires approved contract and schema path.                      |
| 5     | `org-auth-admin-scope-builder-ui`            | UI implementation            | Implement admin bundle builder, subject/profession/level selection, conflict warnings, and detail aggregation.         | Requires approved contract/service behavior.                     |
| 6     | `org-auth-compatibility-and-migration-guard` | migration/read compatibility | Preserve existing records as covering `theory` and `skill`, and prove backward-compatible read behavior.               | Requires schema approval and redacted migration evidence.        |
| 7     | `org-auth-runtime-verification`              | runtime verification         | Validate ops_admin create/detail/cancel paths and employee effective authorization paths.                              | Requires browser/dev-server/e2e and data setup approval.         |

## Contract Design Boundary

The contract package should define:

1. Atomic scope DTO fields using camelCase JSON:
   - `profession`
   - `level`
   - `subject`
   - `edition`
   - `accountQuota`
   - `usedQuota`
   - `startsAt`
   - `expiresAt`
   - `status`
2. Bundle display fields for admin UI:
   - bundle public identifier or grouping metadata only after the schema path is approved.
   - atomic scope list for detail pages.
   - aggregated quota display plus per-scope quota attribution.
3. Compatibility fields:
   - existing list/detail endpoints may continue to expose current single-scope fields during transition.
   - new multi-scope responses must not expose arrays as ad hoc replacements for existing single-value fields.
4. URL and reference rules:
   - external URLs use public identifiers only.
   - internal numeric IDs must not enter DTOs, URLs, audit evidence, or logs.

## Schema Approval Boundary

Schema work is explicitly blocked in this task. The future schema package must compare at least these approaches:

| approach                        | description                                                                                                    | main risk                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| add `subject` to `org_auth`     | Keep one atomic scope per `org_auth` row and create multiple rows for multi-subject/profession/level bundles.  | Bundle grouping and aggregate display need a reviewed grouping mechanism.       |
| add child scope table           | Keep `org_auth` as purchase/bundle header and add reviewed atomic scope child rows.                            | Quota, cancellation, overlap, and migration semantics become more complex.      |
| keep current schema temporarily | Do not support subject-scoped or multi-scope runtime changes yet; document current all-subject interpretation. | Does not close product capability, but avoids unsafe migration before approval. |

Fresh approval is required before choosing or implementing any schema path.

## Service Split

The service package must cover:

1. Effective scope calculation by `organization`, `profession`, `level`, `subject`, `edition`, and time window.
2. Deny-overlap rule for active matching atomic scopes.
3. Quota attribution to the exact atomic scope granting access.
4. Compatibility interpretation of existing records as covering both `theory` and `skill`.
5. Cancellation and expiry behavior across grouped scopes.
6. Audit event generation with public identifiers and redacted metadata.
7. Concurrency protection for quota and cancellation updates.

## UI Split

The UI package must cover:

1. Admin scope builder for `profession`, `level`, and `subject` without hiding atomic scope expansion.
2. Conflict and overlap warnings before submit.
3. Detail page that shows both bundle-level summary and atomic scope rows.
4. Shared enterprise backend messaging: multiple `org_auth` records compose one `organization` capability set.
5. Empty states, validation errors, and cancellation state without layout shifts.
6. No browser/dev-server/e2e proof until fresh runtime approval is granted.

## Security Review Checklist

Before implementation, reviewers must confirm:

- `auth_scope_type` is used only for organization coverage.
- `subject`, `profession`, and `level` are not collapsed into strings, arrays, or unregistered enum values without contract review.
- Cross-organization employee access cannot be granted by a scope from an unrelated organization branch.
- Overlap denial handles direct organization and descendant coverage consistently.
- Quota updates are attributable to one atomic authorization scope and protected from race conditions.
- Cancellation, expiry, upgrade, renewal, and extension do not over-grant access.
- Existing records interpreted as both `theory` and `skill` cannot silently narrow active access during migration.
- API responses use `{ code, message, data, pagination? }` and camelCase JSON fields.
- Optional values return `null`, not empty strings.
- URL paths use public identifiers only.
- `audit_log` records operator, target public identifier, action, and redacted metadata.
- Evidence contains no session token, database URL, internal numeric ID, plaintext redeem_code, raw prompt, Provider payload, or private student/employee answer text.

## Blocked Without Fresh Approval

- Runtime authorization changes.
- Contract/service/UI implementation.
- Schema, migration, seed, or database connection.
- Browser, dev server, Playwright/e2e, deployment, PR, force push, package or lockfile changes, Provider calls, `.env` work, payment, external-service, or Cost Calibration Gate work.
