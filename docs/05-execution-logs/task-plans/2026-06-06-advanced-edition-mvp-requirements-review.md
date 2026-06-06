# Advanced Edition MVP Requirements Review Task Plan

## Task

- Queue task: `phase-30-advanced-edition-mvp-requirements-review`.
- Branch: `codex/advanced-edition-mvp-requirements-review`.
- Scope: docs-only review of the MVP requirements spec and operations configuration contract.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`

## Review Focus

- Confirm MVP main loop, integration matrix, role/data boundary matrix, acceptance scenarios, configuration contract reference, and follow-up queues are consistent.
- Confirm unconfirmed default values remain explicitly queued and are not written as fixed implementation requirements.
- Confirm terminology follows `AGENTS.md`, especially `authorization`, `personal_auth`, `org_auth`, `organization`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, and `ai_call_log`.
- Confirm no code, schema, API, dependency, provider, payment, environment, deployment, or real-data scope is introduced.

## Planned Update

- Add a clarification to the MVP requirements `Follow-Up Decision Queue` section: the MVP spec queue is closed, while concrete default values remain queued in the operations configuration contract.
- Update task queue and project state for this review task.
- Record validation evidence.

## Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-mvp-requirements-review.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-mvp-requirements-review.md`
- `Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md,docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md -Pattern 'Follow-Up Decision Queue','Traceability To Existing Decisions','Default Value Decision Queue','MVP 主规格中的 follow-up decision queue 已关闭'`
- `rg -n "license|exam_paper|exam paper|licence" docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md`
