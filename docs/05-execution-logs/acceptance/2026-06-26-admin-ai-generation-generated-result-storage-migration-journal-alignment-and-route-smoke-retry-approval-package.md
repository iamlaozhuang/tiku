# Acceptance: Admin AI Generation Generated Result Storage Migration Journal Alignment And Route Smoke Retry Approval Package

Task id: `admin-ai-generation-generated-result-storage-migration-journal-alignment-and-route-smoke-retry-approval-package-2026-06-26`

Decision: `APPROVE_NEXT_LOCAL_MIGRATION_METADATA_ALIGNMENT_ROUTE_INTEGRATION_TDD_SMOKE_RETRY_WITH_STRICT_BOUNDARIES`

## Decision Summary

Approve a future local-only execution task to repair the migration execution chain for the already reviewed
`admin_ai_generation_result` migration, then retry the admin generated-result route integration smoke.

This package does not edit Drizzle metadata, does not execute migration, does not connect to a database, does not run
route smoke, and does not modify source code.

## Approved Future Task

Recommended next task id:

`admin-ai-generation-generated-result-storage-migration-journal-alignment-route-integration-tdd-smoke-retry-2026-06-26`

Approved future scope:

- add the missing Drizzle migration metadata for the existing reviewed SQL migration
  `drizzle/20260626203000_add_admin_ai_generation_result.sql`;
- allowed Drizzle metadata write targets are limited to:
  - `drizzle/meta/_journal.json`;
  - one matching new snapshot file for `20260626203000_add_admin_ai_generation_result` under `drizzle/meta/`;
- do not change the reviewed SQL migration file unless a later approval explicitly allows it;
- do not generate a new SQL migration and do not run `drizzle-kit push`;
- reapply the route/service TDD integration needed for content and organization admin local contract POST flows to call
  `AdminAiGenerationResultPersistenceRepository`;
- run focused unit tests before any route smoke;
- rerun local `npx.cmd drizzle-kit migrate` only after metadata alignment and capability gates pass;
- run a capped direct local route smoke only after focused tests and local migration command pass;
- keep Provider disabled and keep formal `question`/`paper` writes blocked.

## Metadata Alignment Boundary

The future task may edit Drizzle metadata only under all of these conditions:

- the target migration tag is exactly `20260626203000_add_admin_ai_generation_result`;
- the SQL source is exactly the existing reviewed file `drizzle/20260626203000_add_admin_ai_generation_result.sql`;
- metadata must align the existing SQL migration with Drizzle's migration journal/snapshot chain;
- the future task must record a file-based check that `_journal.json` contains the tag and the matching snapshot file
  exists;
- evidence may identify file names and tag presence only; it must not include raw DB rows or connection details.

If the metadata cannot be aligned without creating a different SQL migration, changing existing migration semantics,
running `drizzle-kit push`, using direct SQL, or inspecting raw DB rows, stop and request a separate migration recovery
approval package.

## Local Migration Boundary

The future task may rerun local migration only under all of these conditions:

- target is local dev only;
- command uses the reviewed Drizzle migrate path, for example `npx.cmd drizzle-kit migrate`;
- the task queue explicitly allows `schemaMigration` and `localDockerDatabase` capability use;
- Codex must not open `.env*` files and must not record database URLs or credential contents;
- no destructive database operation is approved;
- no staging/prod/cloud database connection is approved;
- rollback execution is not approved in the same task.

If local migration fails, stop and record only a redacted failure category. Do not retry with direct SQL.

## Route Integration Retry Boundary

The future task may modify only the route/service/test surfaces needed to persist redacted generated result drafts for:

- `/api/v1/content-ai-generation-requests`;
- `/api/v1/organization-ai-generation-requests`.

Expected behavior remains:

- POST local contract flow returns `runtimeStatus: local_contract_only`;
- `runtimeBridgeStatus` remains `provider_call_blocked`;
- Provider execution flags remain false;
- generated result storage uses a redacted normalized local-contract summary only;
- `ai_generation_task.result_public_id`, evidence status, citation count, and call-log public id may be updated only as
  summary fields through the existing adapter contract;
- formal `question` and `paper` write status remains `blocked_without_follow_up_task`;
- route response and evidence must not expose raw prompt, raw generated output, raw provider payload, raw DB rows,
  credentials, database URL, internal numeric ids, cookie, token, or Authorization header.

## Minimal Local Route Smoke Retry Boundary

The future task may run at most one minimal local smoke workflow per admin workspace after migration and focused tests
pass:

- content admin workflow: at most one POST and one optional GET read-back;
- organization admin workflow: at most one POST and one optional GET read-back;
- maximum total route requests: 4;
- local target only: localhost, 127.0.0.1, or direct route handler invocation;
- no browser automation, no Playwright e2e, no headed UI interaction, no screenshots, and no trace artifact evidence;
- no PATCH, DELETE, formal adoption, publish, seed, account mutation, direct SQL, or raw DB row dump.

Allowed smoke evidence:

- route/workflow label;
- HTTP status and API code;
- result/task status;
- whether generated result persistence summary is present;
- redacted result public id presence as boolean only;
- evidence status and citation count;
- formal write blocked status;
- request count.

Forbidden smoke evidence:

- raw request body beyond route/workflow/generation kind;
- raw response payload;
- raw generated content;
- prompt;
- provider payload;
- raw DB rows;
- public id lists;
- internal numeric ids;
- API key, token, cookie, Authorization header, database URL, password, or private credential text.

## Failure Branches

- Metadata alignment cannot be proven from files: stop and request migration metadata recovery review.
- Metadata alignment requires SQL semantic change or new generated migration: stop and request a separate approval.
- Capability gate fails: stop with redacted capability diagnostic.
- Migration execution fails: stop and recommend focused local DB diagnostic/recovery package.
- Route integration tests fail: stop at source diagnostic, no route smoke.
- Local session unavailable: stop at redacted credential/session diagnostic.
- Content smoke fails: stop after content workflow; do not proceed to organization workflow or retry beyond the cap.
- Organization smoke fails: stop after organization workflow; do not retry beyond the cap.
- Any need for Provider, formal adoption, staging/prod, payment, external service, dependency, env/secret, direct SQL,
  destructive DB, or release readiness: stop and request a separate approval package.

## Explicit Non-Approval

This package does not approve:

- editing Drizzle metadata in the current task;
- executing migration in the current task;
- generating a new SQL migration;
- changing `drizzle/20260626203000_add_admin_ai_generation_result.sql`;
- running `drizzle-kit push`;
- staging/prod/cloud DB connection;
- destructive DB operation, direct SQL, seed, account mutation, or raw DB row inspection;
- Provider/model call, Provider configuration, env/secret file read, or Cost Calibration;
- formal `question` or `paper` write/adoption/publish;
- browser/e2e execution;
- dependency/package/lockfile change;
- staging/prod, payment, external service, deployment, release readiness, or final Pass.

Cost Calibration Gate remains blocked.
