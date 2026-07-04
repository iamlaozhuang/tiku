# 2026-07-03 Stage B Test-Owned Fixture Provisioning Repair Evidence

## Task

- Task ID: `stage-b-test-owned-fixture-provisioning-repair-2026-07-03`
- Branch: `codex/stage-b-test-owned-fixture-provisioning-repair-2026-07-03`
- Status: completed local-only non-destructive provisioning; post-repair redacted preflight passed; governance validation
  passed

## Redaction Statement

This evidence may record only task ids, file paths, role labels, expected-shape labels, target labels, aggregate counts,
status categories, and validation command status. It must not record credentials, passwords, tokens, cookies, sessions,
Authorization headers, env values, connection strings, raw DB rows, internal ids, PII, email, phone, plaintext
`redeem_code`, Provider payloads, Prompt text, AI input/output, full question/paper/material/resource/chunk content,
screenshots, traces, raw DOM, or exports.

## Read-Only Scope Materialization Evidence

| Check                                        | Result                                                            |
| -------------------------------------------- | ----------------------------------------------------------------- |
| Branch created                               | `codex/stage-b-test-owned-fixture-provisioning-repair-2026-07-03` |
| Private fixture file exists                  | true                                                              |
| Expected role count                          | 8                                                                 |
| Role marker total                            | 8                                                                 |
| Local DB service label running               | `tiku-postgres`                                                   |
| Schema review completed for candidate tables | yes                                                               |

## Redacted Selector Marker Check

| Role                        | Role row marker count |
| --------------------------- | --------------------- |
| `personal_standard_student` | 1                     |
| `personal_advanced_student` | 1                     |
| `org_standard_employee`     | 1                     |
| `org_advanced_employee`     | 1                     |
| `org_standard_admin`        | 1                     |
| `org_advanced_admin`        | 1                     |
| `content_admin`             | 1                     |
| `ops_admin`                 | 1                     |

## Expected Shape Check

This shape was refreshed by `stage-b-test-owned-fixture-provisioning-scope-refresh-2026-07-03`.

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

## Refreshed DB Target

| Target aspect        | Refreshed value                   |
| -------------------- | --------------------------------- |
| Local service label  | `tiku-postgres`                   |
| App runtime DB label | `tiku_fresh_phase25_20260601_001` |
| Previous stale label | `tiku`                            |
| Raw connection value | not recorded                      |

## Boundary Confirmation Before Fresh Approval

| Action                                                             | Executed |
| ------------------------------------------------------------------ | -------- |
| Private fixture marker/shape read with redacted output             | yes      |
| Private login identifier value printed or recorded                 | no       |
| Private credential value printed or recorded                       | no       |
| DB write/provisioning                                              | no       |
| DB cleanup/reset/destructive delete/truncate/drop                  | no       |
| Schema migration/DDL/seed framework work                           | no       |
| Product source/test/schema/dependency/package/lockfile/config edit | no       |
| Browser/dev server/e2e/DB-backed Stage B acceptance                | no       |
| Provider/staging/prod/deploy/Cost Calibration                      | no       |
| Release readiness/final Pass/production usability claim            | no       |

## Fresh Approval Evidence

Fresh approval was received in-thread for the exact refreshed boundary:

- local-only Docker Compose service `tiku-postgres`;
- app runtime DB label `tiku_fresh_phase25_20260601_001`;
- private input restricted to the 8 role rows in
  `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`;
- in-memory private input use only;
- idempotent create/upsert to approved auth/user/admin/organization/authorization tables only;
- no cleanup/reset/destructive delete/truncate/drop/schema migration/source/test/dependency/browser/e2e/Provider;
- redacted evidence only.

No login identifiers, credential values, password hashes, env values, connection strings, raw DB rows, internal ids, PII,
or plaintext `redeem_code` values were recorded.

## Redacted Dry-Run Selector Classification

Command class: redacted SQL CTE selector classification through Docker Compose `psql`. Private selector values were passed
only through process memory/stdin and were not printed.

| Role                        | Expected principal | Existing user principal count | Existing admin principal count | Existing credential count | Dry-run status | Reason category                 |
| --------------------------- | ------------------ | ----------------------------- | ------------------------------ | ------------------------- | -------------- | ------------------------------- |
| `personal_standard_student` | `user`             | 1                             | 0                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |
| `personal_advanced_student` | `user`             | 1                             | 0                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |
| `org_standard_employee`     | `user`             | 1                             | 0                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |
| `org_advanced_employee`     | `user`             | 1                             | 0                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |
| `org_standard_admin`        | `admin`            | 0                             | 1                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |
| `org_advanced_admin`        | `admin`            | 0                             | 1                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |
| `content_admin`             | `admin`            | 0                             | 1                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |
| `ops_admin`                 | `admin`            | 0                             | 1                              | 1                         | `write_ready`  | `selected_local_upsert_allowed` |

Summary: 8 roles checked, 8 write-ready, 0 block.

## Provisioning Execution Evidence

Command class: one local-only transaction through Docker Compose `psql`, generated from private fixture data in process
memory. The SQL output was restricted to aggregate counts and role/status labels.

| Metric                  | Value     |
| ----------------------- | --------- |
| Provisioning status     | committed |
| Roles provisioned       | 8         |
| User principal rows     | 4         |
| Admin principal rows    | 4         |
| Credential rows         | 8         |
| Student profile rows    | 2         |
| Employee binding rows   | 2         |
| Admin org binding rows  | 4         |
| Expected auth row count | 10        |

Approved tables touched by create/upsert/update only:

- `auth_user`
- `auth_account`
- `user`
- `student`
- `admin`
- `organization`
- `employee`
- `admin_organization`
- `redeem_code`
- `personal_auth`
- `org_auth`
- `org_auth_organization`

Actions not executed:

- cleanup/reset/destructive delete/truncate/drop;
- schema migration/DDL/seed framework work;
- source/test/dependency/package/lockfile/config edit;
- browser/e2e/dev server/DB-backed Stage B acceptance;
- Provider/staging/prod/deploy/Cost Calibration/release readiness/final Pass.

## Post-Repair Stage B-0.3 Redacted Preflight Rerun

Command class: redacted fixture preflight rerun against app runtime DB label `tiku_fresh_phase25_20260601_001`. Credential
verification used private credential values and DB password hashes in process memory only; evidence records only boolean
verification status.

| Role                        | Expected principal | Expected edition | Expected principal count | Credential verified | Student profile count | Target employee binding count | Target admin org binding count | Expected auth count | Preflight status | Reason category |
| --------------------------- | ------------------ | ---------------- | ------------------------ | ------------------- | --------------------- | ----------------------------- | ------------------------------ | ------------------- | ---------------- | --------------- |
| `personal_standard_student` | `user`             | `standard`       | 1                        | true                | 1                     | 0                             | 0                              | 2                   | pass             | `ready`         |
| `personal_advanced_student` | `user`             | `advanced`       | 1                        | true                | 1                     | 0                             | 0                              | 2                   | pass             | `ready`         |
| `org_standard_employee`     | `user`             | `standard`       | 1                        | true                | 0                     | 1                             | 0                              | 1                   | pass             | `ready`         |
| `org_advanced_employee`     | `user`             | `advanced`       | 1                        | true                | 0                     | 1                             | 0                              | 1                   | pass             | `ready`         |
| `org_standard_admin`        | `admin`            | `standard`       | 1                        | true                | 0                     | 0                             | 1                              | 1                   | pass             | `ready`         |
| `org_advanced_admin`        | `admin`            | `advanced`       | 1                        | true                | 0                     | 0                             | 1                              | 1                   | pass             | `ready`         |
| `content_admin`             | `admin`            | none             | 1                        | true                | 0                     | 0                             | 0                              | 0                   | pass             | `ready`         |
| `ops_admin`                 | `admin`            | none             | 1                        | true                | 0                     | 0                             | 0                              | 0                   | pass             | `ready`         |

Summary:

| Category          | Count |
| ----------------- | ----- |
| Roles preflighted | 8     |
| Pass              | 8     |
| Fail              | 0     |
| Block             | 0     |

Notes:

- `org_standard_admin` and `org_advanced_admin` each retain an additional local admin-organization binding outside the
  target binding. The runtime target binding was made deterministic and passed preflight; no cleanup/delete was performed
  because cleanup/reset/destructive delete was outside approval.
- This is a fixture preflight pass only. It is not DB-backed Stage B acceptance and does not claim release readiness,
  final Pass, or production usability.

## Validation Log

| Command                                                                                                                                                                                   | Result |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku_fresh_phase25_20260601_001 -X -qAt <redacted dry-run selector classification query>`                                           | passed |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku_fresh_phase25_20260601_001 -X -qAt <redacted non-destructive fixture provisioning transaction>`                                | passed |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku_fresh_phase25_20260601_001 -X -qAt <redacted post-repair Stage B-0.3 preflight rerun>`                                         | passed |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                                                                          | passed |
| `git diff --check`                                                                                                                                                                        | passed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-test-owned-fixture-provisioning-repair-2026-07-03` | passed |
