# 2026-07-03 Stage B Test-Owned Fixture Provisioning Repair Evidence

## Task

- Task ID: `stage-b-test-owned-fixture-provisioning-repair-2026-07-03`
- Branch: `codex/stage-b-test-owned-fixture-provisioning-repair-2026-07-03`
- Status: awaiting fresh approval before DB write/provisioning

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

## Validation Log

| Command                                                                                                                                                                                   | Result |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                                                                          | passed |
| `git diff --check`                                                                                                                                                                        | passed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-test-owned-fixture-provisioning-repair-2026-07-03` | passed |
