# Task Plan: mechanism queue matrix drift history coverage

## Task

- Task id: `mechanism-queue-matrix-drift-history-coverage`
- Task kind: `mechanism_maintenance`
- Execution profile: `docs_state_lite`
- Evidence mode: redacted local evidence only
- Branch: `codex/mechanism-queue-matrix-drift-history-coverage`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Fix `Get-TikuNextAction.ps1` queue/matrix drift diagnostics so matrix `completedBatches` and `sourcePlanningTask` values archived into `task-history-index.yaml` count as covered. The diagnostic should continue to report genuinely missing matrix entries, but it must not treat archived completed tasks as active queue drift.

Allowed files are limited to the next-action script, its smoke test, project-state/task-queue records, and task plan/evidence/audit records.

## TDD Plan

1. Update `Get-TikuNextAction.Smoke.ps1` fixture to include task-history-index coverage for one matrix batch and one source planning task.
2. Run the smoke and confirm RED failure because current diagnostics ignore history coverage.
3. Update `Get-TikuNextAction.ps1` to pass history blocks into matrix diagnostics and count active queue plus history ids.
4. Re-run smoke for GREEN.
5. Run local next-action diagnostic, formatting, lint, typecheck, diff check, and pre-commit hardening.

## Risk Controls

- Do not read or modify `.env*`.
- Do not touch product code, schema, Drizzle, migrations, package files, lockfiles, dependencies, providers, cloud/deploy/payment/external services, PR, force-push, or Cost Calibration Gate.
- Evidence must stay redacted and must not include secrets, provider/model payloads, row/private data, publicId inventories, raw prompts, or raw answers.
