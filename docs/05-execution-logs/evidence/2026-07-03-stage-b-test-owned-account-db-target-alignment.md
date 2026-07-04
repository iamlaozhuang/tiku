# 2026-07-03 Stage B Test-Owned Account DB Target Alignment Evidence

## Task

- Task ID: `stage-b-test-owned-account-db-target-alignment-2026-07-03`
- Branch: `codex/stage-b-test-owned-account-db-target-alignment-2026-07-03`
- Status: completed read-only alignment

## Redaction Statement

This evidence records only task ids, file paths, target labels, role labels, expected-shape labels, enum/category
labels, aggregate counts, and validation command status. It does not record credentials, passwords, tokens, cookies,
sessions, Authorization headers, env values, connection strings, raw DB rows, internal ids, PII, email, phone, plaintext
`redeem_code`, Provider payloads, Prompt text, AI input/output, full question/paper/material/resource/chunk content,
screenshots, traces, raw DOM, or exports.

## Runtime DB Target Check

| Check                                       | Result                             |
| ------------------------------------------- | ---------------------------------- |
| Local app port                              | `3000`                             |
| Listener process label                      | local `node.exe`                   |
| Runtime DB config source                    | `.env.local` `DATABASE_URL` loader |
| Raw `DATABASE_URL` printed                  | no                                 |
| App DB host/port label                      | `localhost:5432`                   |
| App DB name label                           | `tiku_fresh_phase25_20260601_001`  |
| Docker Compose `tiku-postgres` exposed port | `127.0.0.1:5432`                   |
| Stage B-0.3 preflight DB name label         | `tiku`                             |
| DB target database name aligned             | false                              |

## Private Fixture Structure Check

| Metric                          | Value |
| ------------------------------- | ----- |
| Private fixture file exists     | true  |
| Expected role count             | 8     |
| Role row marker total           | 8     |
| Role rows duplicate             | false |
| Login identifier values printed | false |
| Credential values printed       | false |

## Selector Presence In App DB Target

| Role                        | Selector alignment status |
| --------------------------- | ------------------------- |
| `personal_standard_student` | `selector_matches_app_db` |
| `personal_advanced_student` | `selector_matches_app_db` |
| `org_standard_employee`     | `selector_matches_app_db` |
| `org_advanced_employee`     | `selector_matches_app_db` |
| `org_standard_admin`        | `selector_matches_app_db` |
| `org_advanced_admin`        | `selector_matches_app_db` |
| `content_admin`             | `selector_matches_app_db` |
| `ops_admin`                 | `selector_matches_app_db` |

## Precise Role Shape Preflight Against App DB Target

| Role                        | Preflight status | Reason category         |
| --------------------------- | ---------------- | ----------------------- |
| `personal_standard_student` | fail             | `personal_auth_context` |
| `personal_advanced_student` | fail             | `account_type`          |
| `org_standard_employee`     | fail             | `org_auth_context`      |
| `org_advanced_employee`     | fail             | `account_presence`      |
| `org_standard_admin`        | fail             | `admin_role`            |
| `org_advanced_admin`        | fail             | `admin_role`            |
| `content_admin`             | fail             | `admin_role`            |
| `ops_admin`                 | pass             | `ready`                 |

## Observed Shape Summary

| Role                        | Redacted observed enum/category summary                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `personal_standard_student` | personal user, student profile, active personal authorization edition `advanced`      |
| `personal_advanced_student` | employee user, employee binding, active organization authorization edition `standard` |
| `org_standard_employee`     | employee user, employee binding, active organization authorization edition `advanced` |
| `org_advanced_employee`     | admin principal, `org_standard_admin`, organization binding                           |
| `org_standard_admin`        | admin principal, `org_advanced_admin`, organization binding                           |
| `org_advanced_admin`        | admin principal, `content_admin`                                                      |
| `content_admin`             | admin principal, `ops_admin`                                                          |
| `ops_admin`                 | admin principal, `ops_admin`                                                          |

## Boundary Confirmation

| Action                                                                | Executed |
| --------------------------------------------------------------------- | -------- |
| `.env.local` parsed for DB target labels only                         | yes      |
| Raw env value or connection string printed                            | no       |
| Private fixture role selector read in process memory                  | yes      |
| Login identifier or credential value printed                          | no       |
| DB read-only aggregate/status queries                                 | yes      |
| DB write/provisioning/cleanup/reset/seed/migration/DDL                | no       |
| Login request or new `auth_session` creation                          | no       |
| Browser/session/cookie/token/localStorage/Authorization header access | no       |
| Provider/staging/prod/deploy/Cost Calibration                         | no       |
| Product source/test/schema/dependency/package/lockfile/config edit    | no       |
| Release readiness/final Pass/production usability claim               | no       |

## Validation Log

| Command                                                                                                                                                                                   | Result |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                                                                          | passed |
| `git diff --check`                                                                                                                                                                        | passed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-test-owned-account-db-target-alignment-2026-07-03` | passed |
