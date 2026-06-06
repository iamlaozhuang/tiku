# Advanced Edition Doc Governance Batch Closeout Task Plan

## Goal

Run the final review for the Phase 32 advanced edition docs-only governance hardening batch.

## Scope

Allowed changes:

- this task plan
- docs/05-execution-logs/audits-reviews/2026-06-06-advanced-edition-doc-governance-batch-closeout-review.md
- docs/05-execution-logs/evidence/2026-06-06-advanced-edition-doc-governance-batch-closeout.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml

Blocked changes:

- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Review Checklist

1. Confirm all four productive docs-only tasks are `done`.
2. Confirm all four paired review tasks are `done`.
3. Confirm the source-of-truth index, Cost Calibration blocked gate SOP, evidence redaction template, and implementation boundary checklist exist.
4. Confirm `project-state.yaml` points to this closeout.
5. Confirm Cost Calibration Gate remains blocked and code-stage queue seeding remains paused.
6. Confirm local validation evidence is recorded.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-doc-governance-batch-closeout.md docs\05-execution-logs\audits-reviews\2026-06-06-advanced-edition-doc-governance-batch-closeout-review.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-doc-governance-batch-closeout.md`
- PowerShell task queue status check for the eight batched task ids.
- `Test-Path` check for the four governance outputs.
