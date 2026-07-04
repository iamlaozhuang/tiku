# 2026-07-03 Stage B Test-Owned Fixture Provisioning Repair Approval Package

## Decision Needed

Fresh approval is required before any local DB write or provisioning.

## Why This Is Needed

Stage B-0.3 redacted fixture preflight proved that the private fixture file has all 8 required role rows, but the current
local DB does not contain matching test-owned account/admin principals for those login identifiers.

## Approval Boundary

Approve only this:

- Local-only DB target: Docker Compose service `tiku-postgres`, database label `tiku`.
- Private input: the 8 role rows in
  `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`.
- Private input use: read login identifiers and credential values in process memory only.
- Write mode: non-destructive, idempotent create/upsert.
- Evidence mode: role labels, expected-shape labels, aggregate counts, and status categories only.

## Exact Selector

| Role                        | Expected shape                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `personal_standard_student` | `personal_auth edition=standard`                                                    |
| `personal_advanced_student` | `personal_auth edition=advanced`                                                    |
| `org_standard_employee`     | `employee in organization with org_auth edition=standard`                           |
| `org_advanced_employee`     | `employee in organization with org_auth edition=advanced`                           |
| `org_standard_admin`        | `organization-bound admin using existing ops_admin role; org_auth edition=standard` |
| `org_advanced_admin`        | `organization-bound admin using existing ops_admin role; org_auth edition=advanced` |
| `content_admin`             | `admin_role=content_admin only`                                                     |
| `ops_admin`                 | `admin_role=ops_admin only`                                                         |

## Tables In Scope

| Table                   | Action after approval                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `auth_user`             | create/upsert selected auth principals.                            |
| `auth_account`          | create/upsert selected password credential rows.                   |
| `user`                  | create/upsert selected learner/employee principals.                |
| `student`               | create/upsert selected learner profiles.                           |
| `admin`                 | create/upsert selected backend admin principals.                   |
| `organization`          | create/upsert selected active local test organizations.            |
| `employee`              | create/upsert selected employee-to-organization binding rows.      |
| `admin_organization`    | create/upsert selected admin-to-organization binding rows.         |
| `redeem_code`           | create/upsert selected local-only used authorization backing rows. |
| `personal_auth`         | create/upsert selected active personal authorization rows.         |
| `org_auth`              | create/upsert selected active organization authorization rows.     |
| `org_auth_organization` | create/upsert selected organization authorization binding rows.    |

## Explicitly Out Of Scope

- Cleanup, reset, broad delete, truncate, drop, destructive replacement.
- Schema migration, DDL, `drizzle-kit push`, seed framework work, package/lockfile/dependency change.
- Product source, test source, e2e source, config, env file, or script changes.
- Session creation, cookie/token/localStorage/Authorization header capture.
- Browser/e2e acceptance and DB-backed Stage B acceptance.
- Provider, staging/prod, deploy, Cost Calibration, release readiness, final Pass, production usability.
- Plaintext credential, phone/email, token, raw DB row, internal id, plaintext `redeem_code`, prompt, AI I/O, screenshot,
  trace, DOM, or full content in evidence.

## Stop Conditions

- DB target is not local Docker Compose `tiku-postgres` / database label `tiku`.
- Any role selector is missing, duplicated, or ambiguous.
- A selected login identifier already maps to an unexpected non-test-owned account/admin principal.
- Password credential creation cannot use the current project-compatible auth credential format safely.
- A proposed write would require destructive cleanup/reset or schema migration.

## After Approval

1. Execute the narrow provisioning repair.
2. Record redacted aggregate write counts and status categories.
3. Rerun Stage B-0.3 redacted fixture preflight from scratch.
4. Stop if the rerun fails or blocks.
5. Only after preflight passes may a separate task enter DB-backed Stage B acceptance.
