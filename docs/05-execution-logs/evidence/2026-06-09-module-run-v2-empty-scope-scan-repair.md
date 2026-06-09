# Module Run v2 Empty Scope Scan Repair Evidence

## Scope

- taskId: `module-run-v2-empty-scope-scan-repair`
- branch: `codex/module-run-v2-empty-scope-scan-repair`
- taskKind: `implementation`
- approval: user requested a narrow mechanism repair task and plan before fixing the closeout recovery dry-run blocker.

## Initial Finding

`Invoke-ModuleRunV2Autopilot.ps1 -CloseoutRecovery -DryRunHandoff` stopped because unattended readiness attempted to
bind an empty `FilesToScan` array into a mandatory parameter after reporting `filesToScan: 0`.

## RED Evidence

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
  failed after adding the clean closeout recovery smoke path because `runRegistryHeartbeat: wrote` was missing.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`
  failed after adding the clean dry-run closeout smoke path because `autopilotDecision: launch_new_thread` was missing.

## Implementation Summary

- Added `[AllowEmptyCollection()]` to the unattended readiness `Write-RunRegistryHeartbeat` `FilesToScan` parameter so a
  clean closeout recovery can write `changedFiles: []`.
- Added smoke coverage for `filesToScan: 0` closeout recovery with a clean temporary Git worktree.
- Added smoke coverage for autopilot `-CloseoutRecovery -DryRunHandoff` without `-ReadinessChangedFiles` from a clean
  temporary Git worktree.
- Updated `Invoke-ModuleRunV2Autopilot.ps1` to resolve child scripts from `$PSScriptRoot`, so a caller can run the
  orchestrator from a clean worktree while still executing the intended script version.

## Validation Log

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Result | Notes                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                         | pass   | Startup allowed `prepare_next_task` before repair branch work.                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-empty-scope-scan-repair -PlannedFiles ...`                                                                                                                                                                                                                                                                                                                                                       | pass   | Planned files matched allowed files after setting task status to `in_progress`.            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                          | pass   | Covers clean closeout recovery with `filesToScan: 0`.                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                  | pass   | Covers clean autopilot `-CloseoutRecovery -DryRunHandoff` without readiness changed files. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                         | pass   | Current repair task returned `startupDecision: continue_current_task`.                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId module-run-v2-empty-scope-scan-repair -ChangedFiles scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1,scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1,docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/task-queue.yaml,... -SkipRemoteAheadCheck` | pass   | Scope scan matched all repair files after state SHA sync.                                  |
| `node D:\tiku\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown <repair files>`                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass   | Current worktree lacks `node_modules`; used existing main-worktree local toolchain.        |
| `node D:\tiku\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown <repair files>`                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass   | All matched files use Prettier style.                                                      |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | pass   | No whitespace errors.                                                                      |
| `Select-String ... -Pattern 'AllowEmptyCollection','filesToScan: 0','closeoutRecovery','DryRunHandoff','Cost Calibration Gate remains blocked'`                                                                                                                                                                                                                                                                                                                                                                                                         | pass   | Required repair and blocked-gate anchors are present.                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                                                                                                                                                                                                                                                                                     | pass   | Inventory showed only task-scoped changed/untracked files.                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                         | pass   | After marking repair task done, startup returned `startupDecision: prepare_next_task`.     |

## Cleanup Notes

- Temporary smoke worktree registration for `C:\Users\jzzhu\.codex\worktrees\1c25\tiku` was removed from
  `git worktree list`.
- The residual directory `C:\Users\jzzhu\.codex\worktrees\1c25\tiku` could not be deleted because Windows reported it
  was in use by another process. It is no longer registered as a Git worktree and does not block startup readiness.

## Blocked Remainder

Product code, provider/env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration,
and product e2e work are not approved for this task.

Cost Calibration Gate remains blocked.
