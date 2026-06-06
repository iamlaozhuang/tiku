# Advanced Edition Default Value Governance Task Plan

## Task

- Queue task: `phase-30-advanced-edition-default-value-governance`.
- Branch: `codex/advanced-edition-default-value-governance`.
- Scope: docs-only update to define default-value governance before concrete quota points, cost values, timeouts, thresholds, and retention periods are decided.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`

## Confirmed Decision

Use `方案 B`: do not set production default values now. Instead, define configuration-required governance, dev/test placeholders, and a pre-launch cost calibration gate.

## Implementation Notes

- Update the operations configuration contract to distinguish production defaults from dev/test placeholders.
- Keep concrete quota points, consumption points, concurrency limits, timeout values, peak thresholds, and retention periods unconfirmed.
- Require provider cost measurement, sample task measurement, failure/retry cost assessment, and pricing assumptions before production default values can be approved.
- Update task queue and project state.
- Do not add code, schema, API, dependency, provider, payment, environment, deployment, or real-data changes.

## Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-default-value-governance.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-default-value-governance.md`
- `Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md -Pattern 'Default Value Governance','configuration_required','dev_test_placeholder','Cost Calibration Gate','production_enablement_blocked'`
- `rg -n "license|exam_paper|exam paper|licence" docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md`
