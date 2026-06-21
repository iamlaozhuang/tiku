# Active queue slimming drain to recovery window

## Scope

- Task id: `active-queue-slimming-2026-06-21-drain-to-recovery-window`
- Branch: `codex/active-queue-slimming-2026-06-21-drain-to-recovery-window`
- Goal: drain terminal active queue tasks down to `terminalRecoveryWindow=8` in one docs/state/archive-only batch.
- Approved target: migrate 26 terminal archive blocks, then FF merge to `master`, push `origin/master`, and clean the merged short branch.
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

## Candidate policy

- Select the first `terminalCount - terminalRecoveryWindow` terminal active queue blocks after this task becomes current.
- Verify every selected block is terminal before moving it.
- Preserve the final 8 terminal active queue blocks as the recovery window.

## Implementation plan

1. Materialize this docs/state/archive-only task in `task-queue.yaml` and `project-state.yaml`.
2. Run `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit` for the planned file set.
3. Parse the active queue structurally, verify 26 selected candidate tasks are terminal, move their complete blocks to the June archive, and append task-history-index entries.
4. Run local diagnostics and quality gates; record redacted command/result evidence only.
5. Mark the task closed, commit, run closeout/pre-push readiness, FF merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk controls

- No task semantics are changed; only terminal task blocks are moved from active queue to archive.
- No product source, tests, e2e, schema, migrations, scripts, env, dependencies, provider, payment, deploy, PR, force-push, destructive DB, staging/prod/cloud DB, or Cost Calibration Gate work.
- Evidence excludes secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext redeem codes, raw prompts, raw generated AI content, provider payloads, raw employee answer text, and full paper content.
