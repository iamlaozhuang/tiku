# Admin AI generation formal adoption local migration execution approval package

Task id: `admin-ai-generation-formal-adoption-local-migration-execution-approval-package-2026-06-26`

## Decision

Status: `APPROVE_NEXT_LOCAL_MIGRATION_EXECUTION_BOUNDARY_ONLY`.

This package approves a later execution task to apply the already reviewed local migration for `admin_ai_generation_formal_adoption`. It does not execute migration.

## Approved Next Execution Task

Task id: `admin-ai-generation-formal-adoption-local-migration-execution-2026-06-26`.

Approved actions for that task only:

- read the existing approved local private DB connection source required by the existing migration command;
- apply the reviewed migration file `drizzle/20260626235000_add_admin_ai_generation_formal_adoption.sql` once against local dev DB;
- run a minimal sanitized schema-read confirmation that `admin_ai_generation_formal_adoption` exists;
- record redacted evidence containing command name, pass/fail status, migration tag, table-exists summary, and error category if any.

## Evidence Redaction

The execution evidence must not contain:

- database URL;
- `.env` contents;
- credentials, tokens, cookies, or Authorization headers;
- raw DB rows or generated AI content;
- raw prompt, raw output, provider payload, API key, or Provider response;
- staging/prod hostnames or secrets.

## Execution Limits

- Migration execution count: maximum 1.
- Schema-read confirmation count: maximum 1.
- Route smoke calls: 0.
- Formal `question`/`paper` draft writes: 0.
- Provider calls: 0.
- Destructive DB operations: 0.

## Blocked Gates

- Route integration and route smoke.
- Formal draft adapter and formal `question`/`paper` draft writes.
- Organization-scoped adoption.
- Provider/model call, Provider enablement, credentials beyond local DB connection required by migration command.
- Staging/prod/cloud/deploy/payment/external-service work.
- Dependency/package/lockfile changes.
- Cost Calibration, release readiness, and final Pass.

## Closeout Decision

Result: `PASS_APPROVAL_PACKAGE_PREPARED`.

The next task may execute local migration only inside this boundary. Route integration remains a separate later task.
