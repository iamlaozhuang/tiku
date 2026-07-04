# 2026-07-03 Stage B Test-Owned Fixture Provisioning Scope Refresh

## Result

`completed_docs_only_scope_refresh`.

## Refreshed DB Target

| Target aspect               | Refreshed scope                      |
| --------------------------- | ------------------------------------ |
| Service boundary            | Local Docker Compose `tiku-postgres` |
| App runtime host/port label | `localhost:5432`                     |
| App runtime DB label        | `tiku_fresh_phase25_20260601_001`    |
| Previous stale DB label     | `tiku`                               |
| Raw connection string       | not recorded                         |

## Refreshed 8-Role Selector

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

## Fresh Approval Still Required

The next DB-writing task must obtain explicit fresh approval for exactly this boundary:

> Approve non-destructive local-only fixture provisioning for
> `stage-b-test-owned-fixture-provisioning-repair-2026-07-03` on local Docker Compose `tiku-postgres`, app runtime DB
> label `tiku_fresh_phase25_20260601_001`, using the 8 role rows from
> `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` as in-memory private input, allowing
> idempotent create/upsert to the listed auth/user/admin/organization/authorization tables only, with no cleanup/reset,
> no destructive delete/truncate/drop, no schema migration, no source/test/dependency changes, no browser/e2e/Provider,
> and redacted evidence only.

## Execution Rule

After approval, provisioning must stop and split a narrower repair if:

- target DB is not the app runtime DB label above;
- a selected login identifier maps to a conflicting non-test-owned principal;
- a role selector cannot be made to match the refreshed expected shape without destructive cleanup/reset;
- credential creation cannot use the project-compatible auth credential format safely;
- any step would require schema migration, source/test/dependency changes, browser/e2e execution, Provider, staging/prod,
  Cost Calibration, release readiness, final Pass, or production usability claims.

## Non-Claims

- No DB write or provisioning executed.
- No DB-backed Stage B acceptance started.
- No private credentials, raw env value, connection string, raw DB row, internal id, PII, token, cookie, session, or
  `redeem_code` plaintext recorded.
