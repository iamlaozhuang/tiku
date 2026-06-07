# Advanced Edition Requirements Folder Consolidation Plan Task Plan

## Goal

Create a docs-only consolidation plan for advanced edition requirements without moving files.

## Scope

Allowed changes:

- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-folder-consolidation-plan.md`
- this task plan
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-requirements-folder-consolidation-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked changes:

- `docs/01-requirements/**` content changes;
- moving, deleting, or renaming existing requirement documents;
- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Steps

1. Record the standard edition requirement structure.
2. Record the advanced edition source documents and Phase 31 plan split.
3. Define the future `docs/01-requirements/advanced-edition/**` reading surface without creating it.
4. Define source-of-truth and blocked work rules.
5. Update automation state and validation evidence.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\plans\2026-06-06-advanced-edition-requirements-folder-consolidation-plan.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-requirements-folder-consolidation-plan.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-requirements-folder-consolidation-plan.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml`
- `Select-String -Path docs\superpowers\plans\2026-06-06-advanced-edition-requirements-folder-consolidation-plan.md -Pattern 'docs/01-requirements/advanced-edition','Do not move existing files','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log','Cost Calibration Gate remains blocked'`
