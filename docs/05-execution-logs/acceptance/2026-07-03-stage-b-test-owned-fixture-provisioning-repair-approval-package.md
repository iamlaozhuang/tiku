# 2026-07-03 Stage B Test-Owned Fixture Provisioning Repair Approval Package

## Decision Status

Fresh approval was received in-thread for the exact refreshed boundary recorded below. Local-only non-destructive
provisioning was executed after that approval, and post-repair Stage B-0.3 redacted fixture preflight rerun passed for all
8 roles.

## Scope Refresh Notice

This package has been refreshed by `stage-b-test-owned-fixture-provisioning-scope-refresh-2026-07-03`.

The DB target is the app runtime DB label recorded by the read-only alignment task, and the selector follows
`stage-b-8-role-fixture-label-ssot-decision-2026-07-03`.

## Why This Is Needed

Stage B-0.3 redacted fixture preflight queried the stale database label `tiku`. The later read-only alignment proved the
running app uses `tiku_fresh_phase25_20260601_001`, and the private selectors exist there but do not match the required
8-role shapes.

## Approval Boundary

Approve only this:

- Local-only DB target: Docker Compose service `tiku-postgres`, app runtime DB label
  `tiku_fresh_phase25_20260601_001`.
- Private input: the 8 role rows in
  `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`.
- Private input use: read login identifiers and credential values in process memory only.
- Write mode: non-destructive, idempotent create/upsert.
- Evidence mode: role labels, expected-shape labels, aggregate counts, and status categories only.

## Exact Selector

| Role                        | Expected shape                                                   |
| --------------------------- | ---------------------------------------------------------------- |
| `personal_standard_student` | Personal learner with active `personal_auth` edition `standard`. |
| `personal_advanced_student` | Personal learner with active `personal_auth` edition `advanced`. |
| `org_standard_employee`     | Employee bound to target organization with standard org context. |
| `org_advanced_employee`     | Employee bound to target organization with advanced org context. |
| `org_standard_admin`        | Organization-bound admin with `admin_role=org_standard_admin`.   |
| `org_advanced_admin`        | Organization-bound admin with `admin_role=org_advanced_admin`.   |
| `content_admin`             | Backend admin with `admin_role=content_admin`.                   |
| `ops_admin`                 | Backend admin with `admin_role=ops_admin`.                       |

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

- DB target is not local Docker Compose `tiku-postgres` / app runtime DB label
  `tiku_fresh_phase25_20260601_001`.
- Any role selector is missing, duplicated, or ambiguous.
- A selected login identifier already maps to an unexpected non-test-owned account/admin principal.
- Password credential creation cannot use the current project-compatible auth credential format safely.
- A proposed write would require destructive cleanup/reset or schema migration.

## After Approval Execution Result

1. Narrow provisioning repair executed against local Docker Compose `tiku-postgres` / app runtime DB label
   `tiku_fresh_phase25_20260601_001`.
2. Redacted aggregate write counts and status categories recorded in
   `docs/05-execution-logs/evidence/2026-07-03-stage-b-test-owned-fixture-provisioning-repair.md`.
3. Stage B-0.3 redacted fixture preflight rerun from scratch: 8 pass, 0 fail, 0 block.
4. DB-backed Stage B acceptance was not started in this task.
5. A separate task is still required before DB-backed Stage B acceptance execution.
