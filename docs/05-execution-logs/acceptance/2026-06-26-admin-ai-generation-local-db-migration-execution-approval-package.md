# Admin AI Generation Local DB Migration Execution Approval Package

Task id: `admin-ai-generation-local-db-migration-execution-approval-package-2026-06-26`

Decision type: `docs_only_local_db_migration_execution_approval_package`

## Decision Summary

Approval package decision:
`CONDITIONALLY_APPROVE_NEXT_LOCAL_DEV_MIGRATION_AND_MINIMAL_ROUTE_SMOKE_AFTER_FRESH_EXECUTION_INSTRUCTION`.

This package does not execute the migration and does not connect to a database. It defines the allowed boundary for a
future execution task if the owner gives a fresh instruction to execute it.

## Current Task Boundary

- Docs/state approval package only.
- No source, test, schema, migration, seed, package, lockfile, or env file changes.
- No local DB connection.
- No migration execution.
- No route smoke.
- No browser, dev server, or e2e.
- No Provider call, Provider configuration, or Cost Calibration.
- No formal `question` or `paper` write.
- No staging/prod, cloud, deployment, payment, or external service work.
- No release readiness or final Pass claim.

## Approved Future Local Execution Boundary

If a later task receives a fresh execution instruction, it may apply the reviewed migration locally under these limits:

| boundary               | decision                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| target environment     | local `dev` only                                                                                                                                   |
| migration file         | `drizzle/20260626134500_add_admin_ai_generation_task_metadata.sql` only                                                                            |
| migration method       | reviewed migration workflow, preferably `npx.cmd drizzle-kit migrate`; `drizzle-kit push` remains forbidden                                        |
| local capability gate  | must pass `Test-ModuleRunV2LocalCapabilityGate.ps1 -Capability schemaMigration -Intent use_capability` before applying                             |
| env/secret handling    | existing local process env consumption may be used by the migration command, but Codex must not open/read `.env*` files or record any env values   |
| database target        | developer-owned local database only; staging/prod/cloud databases forbidden                                                                        |
| destructive operations | forbidden; no drop, truncate, reset, delete cleanup, or manual rollback without separate approval                                                  |
| source changes         | forbidden in the execution task unless separately approved                                                                                         |
| evidence               | command status, migration filename, schema presence summary, route/workflow labels, inserted-or-reused counts, and redacted public-reference class |

If `DATABASE_URL` or equivalent local DB configuration is missing, the execution task must stop with a minimal
diagnostic. It must not open `.env*` files to discover values.

## Approved Future Route Smoke Boundary

The future route smoke may verify the route-to-DB-adapter path only after the local migration is applied.

Allowed shape:

1. Invoke the existing admin AI generation local-contract route handler locally.
2. Inject a minimal local session object instead of using browser login, cookies, or real account credentials.
3. Use the default Postgres admin AI generation task persistence adapter.
4. Keep Provider disabled and formal writes blocked.
5. Limit successful route POSTs to two by default:
   - one `content` workflow;
   - one `organization` workflow;
   - the two requests should cover both `question` and `paper` generation kinds across the pair.
6. Record only redacted persistence summaries and pass/fail status.

If the future execution needs all four combinations (`content/question`, `content/paper`, `organization/question`,
`organization/paper`), account login, real cookies, browser/dev-server/e2e, seed/account mutation, or source/test/script
edits, it must stop for a separate approval.

## Allowed Local DB Writes In Future Task

The future route smoke may create or reuse only the rows needed to prove local route persistence:

- `ai_generation_task`
- `admin_ai_generation_task_metadata`

It must not write:

- `question`
- `paper`
- `paper_section`
- `question_group`
- `question_option`
- `standard_answer`
- `analysis`
- `scoring_point`
- `practice`
- `mock_exam`
- `exam_report`
- `mistake_book`
- `audit_log`
- `ai_call_log`
- account, session, employee, `organization`, `personal_auth`, `org_auth`, `redeem_code`, or seed data

The future smoke must not perform cleanup deletes unless a separate destructive local DB approval is recorded.

## Evidence Redaction Rules

Allowed evidence fields:

- migration filename and high-level command status;
- local target label as `local_dev` only;
- schema/table/index presence summary;
- route/workflow labels;
- request count and inserted-or-reused count;
- response status code and safe API code/message summary;
- redacted public-reference class such as `taskPublicId present`, not full raw row dumps;
- Provider/formal-write boundary flags;
- error category.

Forbidden evidence fields:

- database URL;
- `.env*` contents;
- secret, token, cookie, Authorization header, password, API key;
- raw DB rows or full SQL result dumps;
- raw prompt, raw output, raw provider payload;
- raw generated AI content;
- private employee answer text;
- full `paper` content;
- plaintext `redeem_code`;
- internal numeric ids.

## Failure Branches

The future execution task must stop with redacted evidence if any of these occur:

- local DB configuration is missing or cannot be consumed without printing secrets;
- migration fails;
- migration drift indicates the reviewed migration is not the next safe operation;
- `admin_ai_generation_task_metadata` table or indexes are not present after migration;
- route smoke returns unexpected error;
- route smoke requires Provider, browser/dev-server/e2e, real account login, seed/account mutation, or formal content write;
- any evidence would expose protected material.

Recommended follow-up after failure:

- focused local DB migration diagnostic, if migration fails;
- route DB adapter diagnostic, if schema exists but route persistence fails;
- provider-disabled product closure plan, if the route works but downstream Provider/result materialization remains blocked.

## Non-Decision Statement

This package does not approve Provider/Cost, generated-result storage, formal adoption, staging/prod, payment, external
services, deployment, release readiness, production readiness, or final Pass.

Cost Calibration Gate remains blocked.
