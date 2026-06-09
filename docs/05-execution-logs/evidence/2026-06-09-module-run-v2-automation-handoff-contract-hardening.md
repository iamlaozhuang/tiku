# Module Run v2 Automation Handoff Contract Hardening Evidence

## Scope

- taskId: `module-run-v2-automation-handoff-contract-hardening`
- branch: `codex/module-run-v2-automation-handoff-contract-hardening`
- taskKind: `implementation`
- approval: user requested implementing the full automation handoff optimization plan: run registry, heartbeat, redacted
  handoff adoption, startup routing, recovery planning decisions, and cleanup-ready janitor behavior.

## Startup Recovery

- Git worktree registry cleanup: the stale clean automation worktree `C:\Users\jzzhu\.codex\worktrees\0db4\tiku` was removed from `git worktree list` by the existing stopped automation hygiene cleanup path.
- Residual directory: `C:\Users\jzzhu\.codex\worktrees\0db4\tiku` remained as a non-Git directory because Windows reported it was in use by another process. It no longer appears in `git worktree list` and no longer blocks startup readiness.
- Branch residue: `codex/closeout-state-sha-sync` was not deleted because `git branch -d` reported it is not fully merged. It was left intact to avoid destructive branch deletion.
- Startup after registry cleanup: `Test-ModuleRunV2AutomationStartupReadiness.ps1` returned `startupDecision: prepare_next_task`.

## RED Evidence

- `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` failed before implementation because `OK_POST_CLOSEOUT_HANDOFF_SHA_ANCESTOR master` was missing.
- `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1` failed before implementation because `-ParkCurrentWorktree` was not a recognized parameter.
- After the expanded user request, `Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1` failed because `-RunRegistryRoot`
  was not recognized and the startup gate could not route active-owner, adoptable, or manual-decision dirty worktrees.
- `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` failed because unattended readiness did not write
  `runRegistryHeartbeat`.
- `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1` failed because stopped automation hygiene did not inventory
  `cleanup_ready` run registry files or redacted handoff envelopes.

## Implementation Summary

- Added `recoverableAutomationWorktree` behavior so clean stale automation worktrees no longer hard-block startup readiness.
- Added `postCloseoutHandoffSha` behavior so a pending next task can accept ancestor `project-state.yaml` SHAs when the durable current task is `done` or `closed`, Git is clean/aligned, and current task evidence/audit paths exist.
- Added `automationWorktreeParking` behavior so a clean non-protected current worktree can explicitly detach to `origin/master` as a parking state for later Codex automation startup.
- Added `runRegistryHeartbeat` behavior so unattended readiness writes a redacted external run registry entry under
  `%USERPROFILE%\.codex\tiku\automation-runs` for the current worktree.
- Added startup decision routing for `exit_active_owner_present`, `adopt_recoverable_run`, `open_recovery_plan`,
  `cleanup_stale_artifacts`, and `stop_for_manual_decision`.
- Added janitor cleanup support for run registry entries explicitly marked `status: cleanup_ready` and
  `cleanupPolicy: cleanup_ready`, including their redacted handoff envelopes under the configured handoff root.
- Handoff envelope adoption remains local and redacted; no chat history, provider payload, prompt, secret, DB URL,
  Authorization header, plaintext `redeem_code`, or full `paper` content is consumed or recorded.

## Validation Log

| Command                                                                                                                                                                                                                                                                                                        | Result                   | Notes                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`                                                                                                                                                                          | pass                     | Covers clean stale worktree, `exit_active_owner_present`, `adopt_recoverable_run`, and `stop_for_manual_decision`. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`                                                                                                                                                                                 | pass                     | Covers `postCloseoutHandoffSha` and `runRegistryHeartbeat` writing.                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`                                                                                                                                                                            | pass                     | Covers `automationWorktreeParking` and cleanup-ready registry/handoff janitor cleanup.                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                                                                                                                                                | pass                     | Current task returned `startupDecision: continue_current_task`; startup saw one run registry entry.                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId module-run-v2-automation-handoff-contract-hardening`                                                                                                                           | pass                     | Scope scan matched all changed files and wrote `runRegistryHeartbeat`.                                             |
| `git diff --check`                                                                                                                                                                                                                                                                                             | pass                     | No whitespace errors.                                                                                              |
| `node D:\tiku\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown <changed files>`                                                                                                                                                                                                                 | pass                     | Used existing main-worktree toolchain; current automation worktree has no `node_modules`.                          |
| `node D:\tiku\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown <changed files>`                                                                                                                                                                                                                 | pass                     | All matched files use Prettier style.                                                                              |
| `Select-String ... -Pattern 'runRegistryHeartbeat','exit_active_owner_present','adopt_recoverable_run','open_recovery_plan','cleanup_stale_artifacts','stop_for_manual_decision','recoverableAutomationWorktree','automationWorktreeParking','postCloseoutHandoffSha','Cost Calibration Gate remains blocked'` | pass                     | Required mechanism and blocked-gate anchors are present.                                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                                            | pass                     | Inventory showed only task-scoped changed/untracked files.                                                         |
| `npm.cmd run lint` in `C:\Users\jzzhu\.codex\worktrees\16b5\tiku`                                                                                                                                                                                                                                              | blocked_by_local_tooling | Failed because `eslint` is unavailable; this worktree has no `node_modules`. No dependency install was performed.  |
| `npm.cmd run typecheck` in `C:\Users\jzzhu\.codex\worktrees\16b5\tiku`                                                                                                                                                                                                                                         | blocked_by_local_tooling | Failed because `tsc` is unavailable; this worktree has no `node_modules`. No dependency install was performed.     |
| `$env:PATH='D:\tiku\node_modules\.bin;...' ; npm.cmd run lint` in `C:\Users\jzzhu\.codex\worktrees\16b5\tiku`                                                                                                                                                                                                  | blocked_by_local_tooling | Failed because ESLint config resolves packages from the current worktree, which has no `node_modules`.             |
| `$env:PATH='D:\tiku\node_modules\.bin;...' ; npm.cmd run typecheck` in `C:\Users\jzzhu\.codex\worktrees\16b5\tiku`                                                                                                                                                                                             | blocked_by_local_tooling | Failed because TypeScript module resolution still requires dependencies under the current worktree.                |
| `npm.cmd run lint` in `D:\tiku`                                                                                                                                                                                                                                                                                | pass                     | Main worktree with existing installed dependencies passed.                                                         |
| `npm.cmd run typecheck` in `D:\tiku`                                                                                                                                                                                                                                                                           | pass                     | Main worktree with existing installed dependencies passed.                                                         |
| `New-Item -ItemType Junction ...\16b5\tiku\node_modules -Target D:\tiku\node_modules`                                                                                                                                                                                                                          | pass                     | Local tooling junction only; no package or lockfile changes.                                                       |
| `npm.cmd run lint` in `C:\Users\jzzhu\.codex\worktrees\16b5\tiku` after tooling junction                                                                                                                                                                                                                       | pass                     | Current task worktree lint passed without dependency install.                                                      |
| `npm.cmd run typecheck` in `C:\Users\jzzhu\.codex\worktrees\16b5\tiku` after tooling junction                                                                                                                                                                                                                  | pass                     | Current task worktree typecheck passed without dependency install.                                                 |

## Current Git And Closeout Status

- Current branch: `codex/module-run-v2-automation-handoff-contract-hardening`.
- Local commit: pending; final commit SHA will be reported in the assistant handoff after commit creation.
- Merge/push/cleanup: pending explicit closeout commands after commit.
- Parking rule implementation is present, but this active worktree was not parked because uncommitted task changes remain.

## Blocked Remainder

- Product code, provider/env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and product e2e work were not touched.
- Cost Calibration Gate remains blocked.
