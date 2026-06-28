# Organization Auth DB-Backed Proof Local

## Status

- Date: 2026-06-28
- Scope: local DB-backed proof for `org_standard_admin` and `org_advanced_admin` organization authorization context.
- Local DB target label: Docker Compose PostgreSQL service `tiku-postgres` / container `tiku-postgres-dev`.
- Execution status: executed as read-only local DB proof.
- Result: `partial_blocked_by_local_schema_gap`.
- Cost Calibration Gate remains blocked.
- Release readiness and final Pass are not claimed.

## Requirement Mapping

This task maps to:

- ADR-007 source-of-truth rule: source `org_auth`, source `edition`, `auth_upgrade`, and service-computed `effectiveEdition` are the authorization boundary.
- Edition-aware authorization requirements: `org_auth` supports `standard | advanced`; standard `org_auth` can become advanced through `auth_upgrade`.
- Role-separated MVP alignment: `org_standard_admin` and `org_advanced_admin` require organization-scoped role and edition-aware workspace behavior.

## Local DB Proof Summary

| Proof point                                                | Result  |
| ---------------------------------------------------------- | ------- |
| Local DB target is named and healthy                       | pass    |
| `org_auth` table exists                                    | pass    |
| active `org_standard_admin` role exists                    | pass    |
| active `org_advanced_admin` role exists                    | pass    |
| both target roles have organization links                  | pass    |
| both target roles have linked `org_auth` status summaries  | pass    |
| `org_auth.edition` exists in current local DB              | fail    |
| `auth_upgrade` table exists in current local DB            | fail    |
| DB-backed standard/advanced `effectiveEdition` distinction | blocked |
| employee organization link coverage                        | gap     |

## Interpretation

The local DB target proves organization-admin role rows and `org_auth` linkage exist in the local dev database. It does not prove edition-aware standard versus advanced organization authorization, because the current local database schema lacks the `org_auth.edition` column and `auth_upgrade` table that ADR-007 and source schema require for source-of-truth evaluation.

The service/unit layer separately proves that source `edition`, `auth_upgrade`, and computed `effectiveEdition` behavior exist in source-level contracts. That is not the same as DB-backed local proof on this target.

## Role And Route Implication

| Role                 | DB-backed local fact                                                           | Route/service implication                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | active role exists; organization link exists; `org_auth` status linkage exists | standard organization workspace can be supported by role/context rows, but edition source is not DB-proven                            |
| `org_advanced_admin` | active role exists; organization link exists; `org_auth` status linkage exists | advanced organization workspace can be role-labeled, but advanced source `org_auth.edition` or active `auth_upgrade` is not DB-proven |

## Residual Blocker

The next proof requires a separate approved schema/local dev DB alignment task or a separate approved test-owned DB target that already contains:

- `org_auth.edition`;
- `auth_upgrade`;
- standard and advanced organization authorization rows or upgrades;
- safe employee/admin organization context data.

This task does not approve schema migration, seed, destructive DB work, staging/prod, Provider, Cost Calibration, payment, OCR, export, external-service work, release readiness, or final Pass.

## Non-Execution Statement

This task did not modify source, tests, e2e, scripts, schema, migration, seed, package files, lockfiles, or `.env*`. It did not run browser, dev server, e2e, Provider, Cost Calibration, staging/prod/deploy, payment, OCR, export, external service, PR, force push, release readiness, or final Pass.
