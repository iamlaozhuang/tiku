# 2026-06-21 Edition-Aware Authorization Schema Migration Approval Package Materialization Plan

## Goal

Create a task-level approval package for `edition-aware-authorization-schema-migration-approval-packet` without
modifying schema, migration files, source code, tests, scripts, package files, env files, provider configuration, or
database contents.

## User Approval

The user approved creating the task-level approval package for
`edition-aware-authorization-schema-migration-approval-packet`, limited to plan and gate materialization only. This
approval does not authorize schema or migration execution.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `src/db/schema/auth.ts` as read-only current schema context
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- this task evidence and audit review
- approval package plan/evidence/audit for `edition-aware-authorization-schema-migration-approval-packet`

Blocked changes:

- `.env*`
- `package.json`, lockfiles, dependencies
- `src/**`, including `src/db/schema/**`
- `drizzle/**`
- `tests/**`
- `e2e/**`
- `scripts/**`
- provider, payment, deploy, external-service, database, or Cost Calibration Gate execution

## Materialization Steps

1. Record this docs-only materialization task in the queue and project state.
2. Keep `edition-aware-authorization-schema-migration-approval-packet` blocked.
3. Point the schema packet to this materialization task as its approval-package prerequisite.
4. Create the schema packet approval package plan, evidence, and audit review with:
   - future schema candidate list;
   - exact gate requirements before execution;
   - rollback expectations;
   - redacted evidence requirements;
   - explicit fresh approval text required before schema or migration changes.
5. Run docs/state validation and stop after local commit unless a later fresh approval authorizes merge/push.

## Stop Conditions

Stop immediately before any action that would require:

- editing `src/db/schema/**` or `drizzle/**`;
- running `drizzle-kit generate`, migration, or database commands;
- reading or writing `.env*` or secret values;
- executing provider/model calls;
- changing dependencies;
- running e2e/browser validation;
- deployment, PR, force-push, payment, external-service, destructive DB, or Cost Calibration Gate.
