# 2026-07-03 Stage B 8 Role Fixture Label SSOT Decision

## Result

`completed_read_only_decision`.

Stage B 8-role labels are the target SSOT for the DB-backed acceptance fixture. The private fixture file is not accepted
as a complete SSOT by itself; it is only a candidate selector source and must match the target role shape before any
DB-backed Stage B preflight or provisioning can proceed.

## Target Role Shape Matrix

| Role                        | Target account/admin shape                                    | Target authorization shape                   |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `personal_standard_student` | Personal learner account with `student` profile               | Active `personal_auth` edition `standard`    |
| `personal_advanced_student` | Personal learner account with `student` profile               | Active `personal_auth` edition `advanced`    |
| `org_standard_employee`     | Employee account bound to the target organization             | Active organization context edition standard |
| `org_advanced_employee`     | Employee account bound to the target organization             | Active organization context edition advanced |
| `org_standard_admin`        | Organization-bound admin with `admin_role=org_standard_admin` | Standard organization authorization context  |
| `org_advanced_admin`        | Organization-bound admin with `admin_role=org_advanced_admin` | Advanced organization authorization context  |
| `content_admin`             | Backend admin with `admin_role=content_admin`                 | Not edition-scoped                           |
| `ops_admin`                 | Backend admin with `admin_role=ops_admin`                     | Not edition-scoped                           |

## Evidence Basis

| Source                                                                                                          | Finding used for decision                                                                                                 |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `docs/05-execution-logs/acceptance/2026-07-03-source-landing-8-role-credential-backed-fixture-target-matrix.md` | Defines all 8 primary labels and target account/auth expectations.                                                        |
| `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`                | Separates standard/advanced learner, employee, organization admin, content admin, ops admin, and `super_admin` overlay.   |
| `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`                       | Confirms `org_standard_admin` read-only/status boundary and `org_advanced_admin` advanced training/analytics/AI boundary. |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007                 | Confirms authorization edition and computed effective-edition source-of-truth rules.                                      |
| `src/db/schema/auth.ts`                                                                                         | Defines distinct admin roles including `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin`.      |
| `e2e/credential-backed-8-role-local-acceptance.spec.ts`                                                         | Expects admin session role claims to contain the named primary role for backend admin roles.                              |
| `e2e/role-separated-account-fixture-supplement.spec.ts`                                                         | Models organization admins as `organization_admin` actors with standard/advanced editions and own-organization boundary.  |
| `docs/05-execution-logs/acceptance/2026-07-03-stage-b-test-owned-account-db-target-alignment.md`                | Shows private selectors exist in the app DB but only 1/8 precise role shapes pass.                                        |

## Supersession

The earlier provisioning approval package recorded organization admin selector text as "organization-bound admin using
existing `ops_admin` role." That text is not accepted for DB-backed Stage B execution. For Stage B, organization admin
fixture rows must target `org_standard_admin` and `org_advanced_admin` admin roles respectively.

The previous package remains historical approval material only. Any future provisioning repair must refresh its selector
and DB target before writing data.

## Next Gate

Do not enter DB-backed Stage B yet.

The next task should refresh the provisioning repair scope so it targets the app runtime DB label and the role shapes in
this decision. Only after fresh approval may it perform non-destructive local-only fixture provisioning, then rerun
Stage B-0.3 redacted preflight from scratch.

## Non-Claims

- No DB-backed Stage B acceptance started.
- No DB mutation, cleanup, reset, provisioning, seed, migration, DDL, or `drizzle-kit push` executed.
- No login/session/browser/e2e/Provider/staging/prod/deploy/Cost Calibration executed.
- No release readiness, final Pass, production usability, staging readiness, or Provider readiness claimed.
