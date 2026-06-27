# Stopped automation hygiene cleanup task plan

## Task

- Task id: `stopped-automation-hygiene-cleanup-2026-06-27`
- Branch: `codex/stopped-automation-hygiene-cleanup-20260627`
- Requested action: execute the approved stopped automation hygiene cleanup only through
  `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup`.

## Read context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1` through its read-only and cleanup command surface

## Baseline

- `master` and `origin/master` are aligned at `3fd41a24c1988bb3b721e41a71680e9a546e68b2`.
- `Get-TikuProjectStatus.ps1` reports `stoppedAutomationHygieneDecision: cleanup_available`.
- Read-only hygiene reports one cleanup candidate: `stale_clean_worktree` at
  `C:\Users\jzzhu\.codex\worktrees\cb44\tiku`.
- Queue slimming is clean before task registration, with active queue terminal recovery window at 8.

## Implementation plan

1. Register this docs/state hygiene cleanup task in `project-state.yaml` and `task-queue.yaml`.
2. Temporarily stash the docs/state WIP if required by the cleanup script's clean-worktree safety rail.
3. Execute `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup` through the existing script safety rails.
4. Rerun stopped automation hygiene read-only and project status diagnostics.
5. If closing this task creates a terminal recovery-window overflow, archive only the displaced terminal task block and
   update `task-history-index.yaml`.
6. Record redacted evidence, audit review, and acceptance.
7. Run scoped formatting, lint, typecheck, `git diff --check`, and Module Run v2 readiness gates.

## Risk controls

- Cleanup is limited to script-approved local automation artifacts; no manual filesystem deletion is allowed.
- No product source, tests, schema, migrations, scripts, dependencies, env/secret files, Provider configuration, database
  state, browser/e2e/dev-server runtime, deployment, PR, force-push, release readiness, final Pass, payment, external
  services, or Cost Calibration Gate work.
- Evidence records command summaries and local cleanup paths only; no secrets, tokens, database URLs, Authorization
  headers, raw DB rows, plaintext `redeem_code`, prompt/provider payloads, private answer text, full paper content,
  internal numeric ids, or publicId inventories.
- If cleanup produces hard blocks or deferred cleanup, stop after evidence/audit and do not force-delete anything
  manually.

## Validation plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `npx.cmd prettier --check --ignore-unknown ...`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stopped-automation-hygiene-cleanup-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId stopped-automation-hygiene-cleanup-2026-06-27`
