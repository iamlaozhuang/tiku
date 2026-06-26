# Acceptance: Admin AI Generation Generated Result Storage Local Migration And Route Integration Approval Package

Task id: `admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package-2026-06-26`

Decision: `APPROVE_NEXT_LOCAL_MIGRATION_AND_ROUTE_INTEGRATION_TDD_SMOKE_WITH_STRICT_LOCAL_REDACTION_BOUNDARY`

## Decision Summary

Approve a future follow-up task to apply the existing local migration for `admin_ai_generation_result`, wire the
content and organization admin AI generation local routes to the generated result storage adapter, and run a minimal
local route smoke.

This package does not execute the migration and does not modify source code.

## Approved Future Task

Recommended next task id:

`admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke-2026-06-26`

Approved future scope:

- apply only the already reviewed migration file `drizzle/20260626203000_add_admin_ai_generation_result.sql` to a local
  dev database;
- do not generate a new migration and do not run `drizzle-kit push`;
- add route/service integration so content and organization admin local contract routes can persist a redacted generated
  result draft through `AdminAiGenerationResultPersistenceRepository`;
- keep Provider disabled: no real model call, no provider configuration read, no env/credential output, and no Cost
  Calibration;
- keep formal content blocked: no formal `question` or `paper` write, adoption, publish, or draft conversion;
- run focused unit tests for the route/service integration and DB adapter interaction;
- run a minimal local route smoke after migration and source validation pass.

## Local Migration Boundary

The future task may execute local migration only under all of these conditions:

- target is local dev only;
- migration source is exactly `drizzle/20260626203000_add_admin_ai_generation_result.sql`;
- command uses the reviewed Drizzle migrate path, for example `npx.cmd drizzle-kit migrate`, after confirming the task
  queue explicitly allows it;
- the command may consume an already configured local database connection through the runtime environment, but Codex must
  not open `.env*` files or record database URLs;
- no destructive operation is approved;
- no staging/prod/cloud database connection is approved;
- if migration fails, stop and record only a redacted failure category.

Rollback policy:

- no rollback execution is approved in the same task;
- if rollback becomes necessary, stop and request a separate local DB recovery approval package;
- evidence may record migration status and table name only, not raw DB rows or connection details.

## Route Integration Boundary

The future task may modify only the route/service surfaces needed to persist redacted generated result drafts for:

- `/api/v1/content-ai-generation-requests`
- `/api/v1/organization-ai-generation-requests`

Expected integration behavior:

- POST local contract flow still returns `runtimeStatus: local_contract_only`;
- `runtimeBridgeStatus` remains `provider_call_blocked`;
- Provider execution flags remain false;
- generated result storage uses a redacted normalized local-contract summary only;
- `ai_generation_task.result_public_id`, evidence status, citation count, and call-log public id may be updated only as
  summary fields through the existing adapter contract;
- formal `question` and `paper` write status remains `blocked_without_follow_up_task`;
- evidence and route response must not include raw prompt, raw generated output, raw provider payload, raw DB rows,
  credentials, database URL, internal numeric ids, cookie, token, or Authorization header.

## Minimal Local Route Smoke Boundary

The future task may run at most one minimal local smoke workflow per admin workspace:

- content admin workflow: at most one POST and one optional GET read-back;
- organization admin workflow: at most one POST and one optional GET read-back;
- maximum total HTTP route requests: 4;
- local target only: localhost, 127.0.0.1, or direct route handler invocation;
- no browser automation, no Playwright e2e, no headed UI interaction, no screenshots, and no trace artifact evidence;
- no PATCH, DELETE, formal adoption, publish, seed, account mutation, or raw SQL;
- if local credentials/session are unavailable, stop at a redacted `local_session_unavailable` diagnostic and do not
  widen scope.

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

- Migration missing or already applied incompatibly: stop and recommend local migration diagnostic.
- Migration execution failure: stop and recommend focused local DB recovery/diagnostic package.
- Route integration tests fail: stop at source diagnostic, no route smoke.
- Local session unavailable: stop at redacted credential/session diagnostic.
- Content or organization smoke fails: stop after the failing workspace, no retries beyond the approved request cap.
- Any need for Provider, formal adoption, staging/prod, payment, external service, or dependency change: stop and request
  a separate approval package.

## Explicit Non-Approval

This package does not approve:

- executing migration in the current task;
- generating a new migration;
- `drizzle-kit push`;
- staging/prod/cloud DB connection;
- destructive DB operation, direct SQL, seed, or account mutation;
- Provider/model call, Provider configuration, env/secret file read, or Cost Calibration;
- formal `question` or `paper` write/adoption/publish;
- browser/e2e execution;
- dependency/package/lockfile change;
- staging/prod, payment, external service, deployment, release readiness, or final Pass.

Cost Calibration Gate remains blocked.
