# Phase 76 Advanced Code Stage Schema Dependency Blocker Review

**Task id:** `phase-76-advanced-code-stage-schema-dependency-blocker-review`

**Branch:** `codex/phase-76-schema-dependency-blocker-review`

**Task kind:** `blocked_gate`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`

## Scope

This task records approval boundaries for future advanced edition schema/migration, dependency, package, lockfile, script, job, and product-code needs. It does not modify any of those files.

## Blocked Work Register

The following future needs must be isolated into separately approved tasks before implementation:

1. Schema/migration discovery and approval:
   - Any durable storage for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, AI task lifecycle, generated learning `paper`, organization training, quota ledger, `audit_log`, `ai_call_log`, retention, or `expired_hidden` must first identify exact schema and migration files.
   - No schema, migration, drizzle, or database file is changed by this blocker review.
2. Dependency and package approval:
   - Any new AI SDK, provider SDK, queue library, scheduler, export library, logging package, testing tool, or CLI requires separate dependency introduction evidence.
   - No package or lockfile is changed by this blocker review.
3. Script, job, and cleanup executor approval:
   - Retention cleanup, hard-delete executor, migration helper, import helper, or batch job work requires separate allowed files and rollback/backup evidence.
   - No script file is changed by this blocker review.
4. Product-code implementation approval:
   - Future services, repositories, validators, mappers, routes, Web surfaces, unit tests, and e2e tests must be queued as small code-stage tasks.
   - This review does not approve implementation of `authorization`, `redeem_code`, quota ledger, AI task execution, organization analytics, retention, `audit_log`, or `ai_call_log`.
5. Provider, env, and external gate:
   - Provider cost measurement, real provider calls, env/secret, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution remain separately blocked.

## Review Notes

- The handoff estimates roughly 43 future code-stage subtasks.
- The first code-stage tasks should begin with `authorization` context planning output before AI task execution.
- Any schema/migration decision should be handled as discovery and approval before feature implementation.
- `redeem_code`, `audit_log`, and `ai_call_log` evidence must stay redacted in every approval package.

## Validation Plan

- `git diff --check`
- Scoped Prettier check for task files and state files.
- Required anchor check for blocked work, schema/migration, dependency, package, lockfile, approval, `authorization`, `redeem_code`, `audit_log`, `ai_call_log`, and Cost Calibration Gate.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
