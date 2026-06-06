# Advanced Edition Ops Config Contract Task Plan

## Task

- Queue task: `phase-30-advanced-edition-ops-config-contract`.
- Branch: `codex/advanced-edition-ops-config-contract`.
- Scope: docs-only update to record the confirmed decision that operations configuration belongs in a standalone configuration contract.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`

## Confirmed Decision

Use `方案 B`: keep the operations configuration list in a standalone configuration contract. The MVP requirements spec only references the contract.

## Implementation Notes

- Add `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`.
- Update the MVP requirements spec to reference the configuration contract and close the current follow-up decision queue.
- Add a docs-only queue task so the configuration contract is not mixed into the MVP requirements review task.
- Keep concrete numeric defaults as a separate decision queue inside the configuration contract.
- Do not add source code, schema, migration, API, dependency, provider, payment, environment, or deployment changes.

## Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-ops-config-contract.md`
- `Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md -Pattern 'Configuration Matrix','quota_unit','authorization','organization','audit_log','ai_call_log','Default Value Decision Queue'`
- `Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md -Pattern 'Operations Configuration Contract','2026-06-06-advanced-edition-ops-config-contract.md','已全部定稿'`
