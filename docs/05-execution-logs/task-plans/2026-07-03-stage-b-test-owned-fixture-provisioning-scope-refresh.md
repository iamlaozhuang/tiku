# 2026-07-03 Stage B Test-Owned Fixture Provisioning Scope Refresh Plan

## Task

- Task ID: `stage-b-test-owned-fixture-provisioning-scope-refresh-2026-07-03`
- Branch: `codex/stage-b-test-owned-account-db-target-alignment-2026-07-03`
- Mode: docs-only scope refresh

## Scope

Refresh the pending provisioning repair so it targets the app runtime DB label and the Stage B 8-role SSOT selector
shape. This task does not approve or execute DB writes.

## Inputs

- `stage-b-test-owned-account-db-target-alignment-2026-07-03`
- `stage-b-8-role-fixture-label-ssot-decision-2026-07-03`
- Existing provisioning repair package:
  `docs/05-execution-logs/acceptance/2026-07-03-stage-b-test-owned-fixture-provisioning-repair-approval-package.md`

## Refresh Decisions

- Target DB label changes from local Docker Compose database `tiku` to the app runtime DB label
  `localhost:5432/tiku_fresh_phase25_20260601_001`.
- The target service remains local Docker Compose `tiku-postgres` via the local host/port mapping.
- The private fixture file remains a selector input only; role labels and expected shapes define the target.
- `org_standard_admin` and `org_advanced_admin` must use their own admin roles, not `ops_admin`.
- Fresh approval remains required before any non-destructive provisioning.

## Refreshed Selector

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

## Validation Plan

- Scoped Prettier check over refreshed docs/state files.
- `git diff --check`.
- Module Run v2 pre-commit hardening for this task ID.

## Non-Goals

- No DB write, cleanup, reset, seed, migration, DDL, or provisioning.
- No private credential disclosure.
- No browser/e2e acceptance, Provider, staging/prod, Cost Calibration, release readiness, final Pass, or production
  usability claim.
