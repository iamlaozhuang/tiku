# Active queue slimming diagnostic window 2

## Scope

- Task id: `active-queue-slimming-2026-06-21-diagnostic-window-2`
- Branch: `codex/active-queue-slimming-2026-06-21-diagnostic-window-2`
- Goal: materialize and execute the current diagnostic's next five terminal active queue archive candidates.
- Allowed files: `project-state.yaml`, `task-queue.yaml`, June task archive, task history index, and this task's plan/evidence/audit files.
- Blocked files: `.env*`, package/lockfiles, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`, generated Playwright/test output.

## Read context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*`
- Local startup/status commands:
  - `git status --short --branch`
  - `git log --oneline --decorate -n 12`
  - `.\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - `.\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
  - `.\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Current diagnostic next five candidates

1. `active-queue-slimming-2026-06-21-edition-packets-window`
2. `organization-training-entry-route-path-contract-repair`
3. `organization-training-draft-source-context-local-migration-execution-approval`
4. `organization-training-admin-visible-scope-local-fixture-contract-repair`
5. `local-full-flow-human-acceptance-packet`

## Implementation plan

1. Materialize this docs/state/archive-only task in `task-queue.yaml` and `project-state.yaml`.
2. Run `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit` for the planned file set.
3. Parse the active queue structurally, verify all five candidate tasks are terminal, move their complete blocks to the June archive, and append task-history-index entries.
4. Run local diagnostics and quality gates; record redacted command/result evidence only.
5. Mark the task closed, commit, run closeout/pre-push readiness, FF merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk controls

- No task semantics are changed; only terminal task blocks are moved from active queue to archive.
- No product source, tests, e2e, schema, migrations, scripts, env, dependencies, provider, payment, deploy, PR, force-push, destructive DB, staging/prod/cloud DB, or Cost Calibration Gate work.
- Evidence excludes secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext redeem codes, raw prompts, raw generated AI content, provider payloads, raw employee answer text, and full paper content.
