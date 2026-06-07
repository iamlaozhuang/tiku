# Advanced Edition Requirements Folder Consolidation Task Plan

## Goal

Create the advanced edition derived requirement reading surface under `docs/01-requirements/advanced-edition/**`.

## Scope

Allowed changes:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/*.md`
- `docs/01-requirements/advanced-edition/stories/*.md`
- this task plan
- execution evidence
- review task plan
- review audit
- review evidence
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked changes:

- moving, deleting, or renaming existing requirement documents;
- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Steps

1. Create `docs/01-requirements/advanced-edition/00-index.md`.
2. Create seven derived module requirement summaries.
3. Create six derived story summaries.
4. Add a root index link from `docs/01-requirements/00-index.md`.
5. Record evidence and run validation.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\01-requirements\00-index.md docs\01-requirements\advanced-edition\00-index.md docs\01-requirements\advanced-edition\modules\*.md docs\01-requirements\advanced-edition\stories\*.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-requirements-folder-consolidation.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-requirements-folder-consolidation.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-requirements-folder-consolidation-review.md docs\05-execution-logs\audits-reviews\2026-06-06-advanced-edition-requirements-folder-consolidation-review.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-requirements-folder-consolidation-review.md`
- `Select-String -Path docs\01-requirements\advanced-edition\**\*.md -Pattern 'authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log','Cost Calibration Gate remains blocked'`
- `git diff --name-status master..HEAD`
