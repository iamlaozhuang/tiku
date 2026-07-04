# 2026-07-03 Stage B-0.3 Redacted Fixture Preflight Evidence

## Task

- Task ID: `stage-b-0-3-redacted-fixture-preflight-2026-07-03`
- Branch: `codex/stage-b-0-3-redacted-fixture-preflight-2026-07-03`
- Status: completed with preflight failure

## Redaction Statement

This evidence records only task ids, file paths, role labels, expected-shape labels, target labels, aggregate counts,
status categories, and validation command status. It must not record credentials, passwords, tokens, cookies, sessions,
Authorization headers, env values, connection strings, raw DB rows, internal ids, PII, email, phone, plaintext
`redeem_code`, Provider payloads, Prompt text, AI input/output, full question/paper/material/resource/chunk content,
screenshots, traces, raw DOM, or exports.

## Private Fixture Marker Check

Command class: PowerShell read of private fixture file in process memory, output restricted to role labels and booleans.

Result:

| Metric                          | Value |
| ------------------------------- | ----- |
| Expected role count             | 8     |
| Parsed role count               | 8     |
| Missing role count              | 0     |
| Duplicate role count            | 0     |
| All roles have login identifier | true  |
| All roles have expected shape   | true  |

Role-level redacted result:

| Role                        | Has login identifier | Has expected shape |
| --------------------------- | -------------------- | ------------------ |
| `personal_standard_student` | true                 | true               |
| `personal_advanced_student` | true                 | true               |
| `org_standard_employee`     | true                 | true               |
| `org_advanced_employee`     | true                 | true               |
| `org_standard_admin`        | true                 | true               |
| `org_advanced_admin`        | true                 | true               |
| `content_admin`             | true                 | true               |
| `ops_admin`                 | true                 | true               |

## Local DB Target Check

Command class: `docker compose ps --services --filter status=running`.

Observed running local service label:

- `tiku-postgres`

Command class: read-only `psql` target identity check through Docker Compose.

Observed target labels:

| Label               | Value           |
| ------------------- | --------------- |
| Service             | `tiku-postgres` |
| Database            | `tiku`          |
| Database user label | `tiku`          |

## Redacted DB Preflight

Command class: redacted read-only aggregate/status query. The SQL selected no login values, no internal ids, and no raw
rows.

| Role                        | Principal type     | Expected edition | Principal count | Profile/role count | Binding count | Auth count | Preflight status | Reason category          |
| --------------------------- | ------------------ | ---------------- | --------------- | ------------------ | ------------- | ---------- | ---------------- | ------------------------ |
| `personal_standard_student` | `personal_student` | `standard`       | 0               | 0                  | 0             | 0          | fail             | `account_presence`       |
| `personal_advanced_student` | `personal_student` | `advanced`       | 0               | 0                  | 0             | 0          | fail             | `account_presence`       |
| `org_standard_employee`     | `org_employee`     | `standard`       | 0               | 0                  | 0             | 0          | fail             | `account_presence`       |
| `org_advanced_employee`     | `org_employee`     | `advanced`       | 0               | 0                  | 0             | 0          | fail             | `account_presence`       |
| `org_standard_admin`        | `org_admin`        | `standard`       | 0               | 0                  | 0             | 0          | fail             | `admin_account_presence` |
| `org_advanced_admin`        | `org_admin`        | `advanced`       | 0               | 0                  | 0             | 0          | fail             | `admin_account_presence` |
| `content_admin`             | `content_admin`    | none             | 0               | 0                  | 0             | 0          | fail             | `admin_account_presence` |
| `ops_admin`                 | `ops_admin`        | none             | 0               | 0                  | 0             | 0          | fail             | `admin_account_presence` |

Summary:

| Category                           | Count |
| ---------------------------------- | ----- |
| Roles preflighted                  | 8     |
| Pass                               | 0     |
| Fail                               | 8     |
| Block                              | 0     |
| Failures at account presence       | 4     |
| Failures at admin account presence | 4     |

Stop action: split `stage-b-test-owned-fixture-provisioning-repair-2026-07-03`; do not enter DB-backed Stage B
acceptance.

## Boundary Confirmation

| Action                                                             | Executed |
| ------------------------------------------------------------------ | -------- |
| Private fixture file read in process memory                        | yes      |
| DB read-only aggregate/status preflight                            | yes      |
| DB mutation/cleanup/reset/seed/migration/provisioning/DDL          | no       |
| `.env*` content read or printed                                    | no       |
| Credential/private value recorded in evidence                      | no       |
| Browser/dev server/e2e acceptance started by this task             | no       |
| Provider call/configuration/secret access                          | no       |
| Staging/prod/deploy                                                | no       |
| Cost Calibration                                                   | no       |
| Product source/test/schema/dependency/package/lockfile/config edit | no       |
| Release readiness/final Pass/production usability claim            | no       |

## Validation Log

| Command                                                                                                                                                                                               | Result |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                                                                                      | passed |
| `git diff --check`                                                                                                                                                                                    | passed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-0-3-redacted-fixture-preflight-2026-07-03`                     | passed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId stage-b-0-3-redacted-fixture-preflight-2026-07-03 -SkipRemoteAheadCheck` | passed |
