# Advanced Edition Document Source Of Truth Index Task Plan

## Goal

Create a docs-only source-of-truth index for advanced edition governance before code-stage queue seeding.

## Scope

Allowed changes:

- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked changes:

- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Steps

1. Create the source-of-truth index.
2. Confirm it covers source documents, read order, blocked work, terminology, and queue rules.
3. Update task state.
4. Run validation commands and record evidence.

## Validation

- `git diff --check`
- `Select-String -Path docs\superpowers\plans\2026-06-06-advanced-edition-doc-source-of-truth-index.md -Pattern 'Source Of Truth','Read Order','Blocked Work','Cost Calibration Gate remains blocked','code-stage queue seeding remains paused'`
