# 2026-07-03 Stage B Test-Owned Account DB Target Alignment

## Result

`completed_read_only_alignment`.

## Findings

| Question                                                       | Answer                                    |
| -------------------------------------------------------------- | ----------------------------------------- |
| Is the app DB target the same as Stage B-0.3 preflight target? | no                                        |
| Does the private fixture selector exist in the app DB target?  | yes, 8/8 role selectors match a principal |
| Does the precise Stage B role shape pass in app DB target?     | no, 1/8 pass                              |
| Should provisioning run immediately?                           | no                                        |

## DB Target Matrix

| Target                   | Redacted label                                       |
| ------------------------ | ---------------------------------------------------- |
| App runtime DB           | `localhost:5432/tiku_fresh_phase25_20260601_001`     |
| Stage B-0.3 preflight DB | local Docker Compose `tiku-postgres` database `tiku` |
| Same Postgres service?   | yes                                                  |
| Same database name?      | no                                                   |

## Selector Presence Matrix

| Role                        | Selector status in app DB target |
| --------------------------- | -------------------------------- |
| `personal_standard_student` | match                            |
| `personal_advanced_student` | match                            |
| `org_standard_employee`     | match                            |
| `org_advanced_employee`     | match                            |
| `org_standard_admin`        | match                            |
| `org_advanced_admin`        | match                            |
| `content_admin`             | match                            |
| `ops_admin`                 | match                            |

## Precise Role Shape Matrix

| Role                        | Stage B expected shape                | App DB observed shape summary                           | Alignment status |
| --------------------------- | ------------------------------------- | ------------------------------------------------------- | ---------------- |
| `personal_standard_student` | standard personal learner             | personal learner with advanced personal authorization   | fail             |
| `personal_advanced_student` | advanced personal learner             | employee with standard organization authorization       | fail             |
| `org_standard_employee`     | standard organization employee        | employee with advanced organization authorization       | fail             |
| `org_advanced_employee`     | advanced organization employee        | organization-bound admin with `org_standard_admin` role | fail             |
| `org_standard_admin`        | standard organization-bound ops admin | organization-bound admin with `org_advanced_admin` role | fail             |
| `org_advanced_admin`        | advanced organization-bound ops admin | admin with `content_admin` role                         | fail             |
| `content_admin`             | content admin                         | admin with `ops_admin` role                             | fail             |
| `ops_admin`                 | ops admin                             | admin with `ops_admin` role                             | pass             |

## Decision

The immediate blocker is not that the accounts cannot log in. The blocker is target and role-shape alignment:

- Stage B-0.3 queried database `tiku`, while the running app uses database `tiku_fresh_phase25_20260601_001`.
- Against the app DB target, all 8 selectors exist, but 7 role shapes are not aligned with the Stage B fixture labels.

Do not run DB provisioning until the fixture mapping versus intended role ownership is decided.

## Non-Claims

- No DB-backed Stage B acceptance started.
- No DB mutation, cleanup, reset, provisioning, seed, migration, or DDL executed.
- No login/session/browser/e2e/Provider/staging/prod/deploy/Cost Calibration executed.
- No release readiness, final Pass, production usability, staging readiness, or Provider readiness claimed.
