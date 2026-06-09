# Module Run v2 Stale Clean Worktree Autocleanup Routing Evidence

## Scope

- taskId: `module-run-v2-stale-clean-worktree-autocleanup-routing`
- branch: `codex/module-run-v2-stale-clean-worktree-autocleanup-routing`
- taskKind: `implementation`
- approval: user explicitly requested implementing the stale clean worktree cleanup routing proposal, then executing
  closeout and continuing.

## Initial Recovery And Hygiene

- Startup gate initially returned `startupDecision: prepare_next_task` while reporting stale clean automation worktrees.
- Read-only stopped-automation hygiene returned `stoppedAutomationHygieneDecision: cleanup_available`, `hardBlockCount:
0`, and three `stale_clean_worktree` candidates.
- Cleanup command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup -ParkCurrentWorktree -ParkingTargetRef origin/master`
  - Partially completed: parked current worktree to `origin/master` and removed one stale worktree.
  - Reported `stop_manual_cleanup_required` for two stale worktrees due Windows file/directory access.
- Follow-up `git worktree list --porcelain` showed only current worktree plus the parked `aac4` automation worktree.
- Follow-up read-only hygiene returned `stoppedAutomationHygieneDecision: clean`.

## RED Evidence

- RED:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
  reproduced the missing stale clean routing behavior.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
  failed after adding the stale clean routing expectation because startup still returned `startupDecision:
prepare_next_task`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`
  failed after adding the startup cleanup orchestration path because `Invoke-ModuleRunV2Autopilot.ps1` did not accept
  `-RunStartupReadiness`.
- After adding the new parameter, autopilot smoke exposed a related path issue: startup readiness used a relative lease
  script path when invoked from a temporary repository.

## Implementation Summary

- Batch range: single local mechanism hardening batch for task
  `module-run-v2-stale-clean-worktree-autocleanup-routing`.
- Commit: `df78b24e3d7e59884d3b00aaf3e0b98701bc7c9a` was the recovered master/origin baseline before this task branch.
- implementationCommit: `bdb066f6 docs(agent): harden stale worktree cleanup routing`.
- Startup readiness now routes any clean stale automation worktree finding to `startupDecision: cleanup_stale_artifacts`
  before next-task selection.
- Autopilot now supports explicit `-RunStartupReadiness`. When startup returns `cleanup_stale_artifacts`, it runs
  `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup`, reruns startup, and continues only when startup advances to an
  allowed decision.
- Startup readiness now resolves the lease readiness script from `$PSScriptRoot`, so temporary-repository smoke tests do
  not accidentally depend on the caller's working directory.
- SOPs now state that stale clean cleanup must complete before next-task selection and that cleanup failures remain hard
  stops.

## Validation Log

Passed: local validation completed for the scoped Module Run v2 mechanism hardening task.

| Command                                                                                                                                                                                                            | Result  | Notes                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-stale-clean-worktree-autocleanup-routing -PlannedFiles ...` | pass    | Planned files matched allowed files.                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 ... -SkipRemoteAheadCheck`                                                                 | pass    | Scoped changed files were allowed for unattended work.                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`                                                                              | pass    | Covers stale clean startup routing to `cleanup_stale_artifacts`.                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`                                                                                             | pass    | Covers startup cleanup orchestration and post-cleanup continuation.                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`                                                                                | pass    | Existing cleanup safety and parking coverage remains green.                                               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                                                    | pass    | Real startup returned `continue_current_task`; no stale clean worktree blocker remained.                  |
| `npm.cmd run lint`                                                                                                                                                                                                 | pass    | ESLint passed after offline install restored local `node_modules`.                                        |
| `npm.cmd run typecheck`                                                                                                                                                                                            | pass    | TypeScript `tsc --noEmit` passed.                                                                         |
| `npx.cmd prettier --write ...`                                                                                                                                                                                     | pass    | Scoped prettier write applied only to Markdown/YAML; PowerShell files are ignored.                        |
| `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown ...`                                                                                                                                       | pass    | Scoped prettier check passed for declared closeout files.                                                 |
| `git diff --check`                                                                                                                                                                                                 | pass    | No whitespace errors.                                                                                     |
| `Select-String -Path ... -Pattern 'cleanup_stale_artifacts',...`                                                                                                                                                   | pass    | Required cleanup routing anchors are present.                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-stale-clean-worktree-autocleanup-routing`                        | blocked | First run correctly blocked on missing evidence anchors for prettier check, closeout, and git completion. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-stale-clean-worktree-autocleanup-routing`                        | pass    | Rerun passed after evidence recorded all declared validation anchors.                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                | pass    | GitCompletionReadiness inventory completed before local commit; no upstream and no ahead commit yet.      |

GREEN:
`Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`, `Invoke-ModuleRunV2Autopilot.Smoke.ps1`,
`Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`, `npm.cmd run lint`, `npm.cmd run typecheck`, scoped prettier, and
`git diff --check` passed.

localFullLoopGate: skipped by design for this mechanism-only task; product runtime, providers, DB, e2e, and external
services remain blocked.

threadRolloverGate: no rollover required; this thread retained the current in-progress mechanism task after startup
returned `continue_current_task`.

nextModuleRunCandidate: after local closeout, run startup readiness plus closeout recovery/dry-run handoff to select the
next approved pending task from the durable queue.

## Blocked Remainder

Product code, provider/env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration,
product e2e work, dirty worktree deletion, and manual cleanup outside the Codex automation worktree root are not approved
for this task.

Cost Calibration Gate remains blocked.
