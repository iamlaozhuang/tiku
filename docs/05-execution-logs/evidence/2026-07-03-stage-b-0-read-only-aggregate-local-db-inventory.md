# 2026-07-03 Stage B-0.1 Read-Only Aggregate Local DB Inventory Evidence

## Task

- Task ID: `stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03`
- Branch: `codex/stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03`
- Status: completed

## Redaction Statement

This evidence records only task ids, target labels, command labels, table names, aggregate counts, pattern labels, status
categories, and validation status. It must not record credentials, passwords, tokens, cookies, sessions, Authorization
headers, env values, connection strings, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, Provider
payloads, Prompt text, AI input/output, full question/paper/material/resource/chunk content, screenshots, traces, raw
DOM, or exports.

## Target Check

| Check                             | Status                                                            |
| --------------------------------- | ----------------------------------------------------------------- |
| `docker compose ps --format json` | pass; local `tiku-postgres` service observed running and healthy. |

## Aggregate Table Counts

Command label: `docker compose exec -T tiku-postgres psql ... <redacted read-only public table aggregate count query>`.

Result: pass. Output was limited to table names and aggregate row counts.

| Table                                  | Row count |
| -------------------------------------- | --------: |
| `admin`                                |         5 |
| `admin_organization`                   |         5 |
| `ai_call_log`                          |       293 |
| `answer_record`                        |      1121 |
| `audit_log`                            |      4793 |
| `auth_account`                         |       371 |
| `auth_session`                         |      2449 |
| `auth_upgrade`                         |         0 |
| `auth_user`                            |       371 |
| `auth_verification`                    |         0 |
| `employee`                             |         1 |
| `exam_report`                          |       473 |
| `knowledge_base`                       |         2 |
| `knowledge_node`                       |         0 |
| `knowledge_node_resource`              |         0 |
| `material`                             |       221 |
| `mistake_book`                         |         2 |
| `mock_exam`                            |       598 |
| `model_config`                         |         1 |
| `model_provider`                       |         1 |
| `org_auth`                             |         4 |
| `org_auth_organization`                |         4 |
| `organization`                         |         1 |
| `organization_training_answer`         |         1 |
| `organization_training_draft`          |         0 |
| `organization_training_source_context` |         0 |
| `organization_training_version`        |         1 |
| `paper`                                |       225 |
| `paper_asset`                          |         1 |
| `paper_question`                       |       220 |
| `paper_scoring_point`                  |         0 |
| `paper_section`                        |       220 |
| `personal_auth`                        |       211 |
| `practice`                             |       915 |
| `prompt_template`                      |         1 |
| `question`                             |       222 |
| `question_group`                       |         0 |
| `question_knowledge_node`              |         0 |
| `question_option`                      |       445 |
| `question_tag`                         |         0 |
| `redeem_code`                          |       225 |
| `resource`                             |         0 |
| `scoring_point`                        |         0 |
| `student`                              |       365 |
| `tag`                                  |         0 |
| `user`                                 |       366 |

## Namespace Aggregate Counts

Command labels:

- `docker compose exec -T tiku-postgres psql ... <redacted read-only safe namespace column metadata query>`
- `docker compose exec -T tiku-postgres psql ... <redacted read-only namespace aggregate count query>`

Patterns:

- `stage-b`
- `local-full-loop`
- `credential-backed`
- `test-owned`
- `source-landing`

Result: pass. The aggregate namespace query returned 0 matches across selected safe text-like columns. No raw DB rows or
raw column values were emitted into evidence.

## Boundary Confirmation

| Action                                                  | Executed |
| ------------------------------------------------------- | -------- |
| DB read-only aggregate connection                       | yes      |
| DB mutation/cleanup/reset/seed/migration/DDL            | no       |
| `.env*` content read or printed                         | no       |
| Browser/dev server/e2e acceptance                       | no       |
| Provider call/configuration/secret access               | no       |
| Staging/prod/deploy                                     | no       |
| Cost Calibration                                        | no       |
| Release readiness/final Pass/production usability claim | no       |

## Validation Log

| Command                                                                                                                          | Result                                                            |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `docker compose ps --format json`                                                                                                | pass; local `tiku-postgres` service observed running and healthy. |
| `docker compose exec -T tiku-postgres psql ... <redacted read-only public table aggregate count query>`                          | pass; 46 public base-table aggregate counts captured.             |
| `docker compose exec -T tiku-postgres psql ... <redacted read-only safe namespace column metadata query>`                        | pass; safe candidate columns identified without raw row output.   |
| `docker compose exec -T tiku-postgres psql ... <redacted read-only namespace aggregate count query>`                             | pass; 0 namespace matches.                                        |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                 | pass.                                                             |
| `git diff --check`                                                                                                               | pass.                                                             |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03`                     | pass.                                                             |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03 -SkipRemoteAheadCheck` | pass.                                                             |
