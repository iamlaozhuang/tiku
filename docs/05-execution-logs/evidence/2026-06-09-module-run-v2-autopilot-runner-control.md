# Module Run v2 Autopilot Runner Control Evidence

## Task

- Task id: `module-run-v2-autopilot-runner-control`
- Branch: `codex/module-run-v2-autopilot-runner-control`
- Status: in progress.

## Approval Boundary

User approved continuing toward an unattended autodrive development system. The user also stated that local Docker DB
operation, project resource reads for `material`, `paper`, and `paper_asset`, and DeepSeek API key provisioning may be
authorized in future tasks when needed.

This task only implements the local runner control layer and documents the capability model. It does not approve product
code, local DB operation, schema/migration, env/secret writes, provider calls, dependency/package/lockfile changes,
thread creation, worktree creation, cleanup, merge, push, PR creation, deploy, external-service action, or Cost
Calibration Gate execution.

## RED Target

The current mechanism has a one-shot autopilot orchestrator but no bounded runner loop that can consume startup,
cleanup, closeout, parallel, handoff, and stop decisions as a single local control state machine.

## Batch 1

- Scope: add runner control layer, smoke, SOP/state/queue/evidence/audit.
- Commit: `a30125ad` is the branch base; the final local commit will contain this runner control layer.
- threadRolloverGate: runner may surface `launch_new_thread`, but does not call Codex thread tools.
- nextModuleRunCandidate: proposal-only unless a future task seeds executable work with approval.
- localFullLoopGate: local script and smoke validation only.

## Validation Log

Result: pass for local runner-control implementation validation.

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-autopilot-runner-control -PlannedFiles ...`
  - Exit: 0.
  - Key output: `work readiness passed`.

RED:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
  - Exit: 1.
  - Key output: `Missing autopilot runner script`.

GREEN:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
  - Exit: 0.
  - Key output: `Module Run v2 autopilot runner smoke passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`
  - Exit: 0.
  - Key output: `Module Run v2 autopilot smoke passed`.
- `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown ...`
  - Exit: 0.
  - Key output: scoped Prettier write completed.
- `git diff --check`
  - Exit: 0.
- `npm.cmd run lint`
  - Exit: 0.
  - Key output: ESLint completed.
- `npm.cmd run typecheck`
  - Exit: 0.
  - Key output: `tsc --noEmit` completed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
  - Exit: 0.
  - Key output: `startupDecision: continue_current_task`.
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown ...`
  - Exit: 0.
  - Key output: `All matched files use Prettier code style!`
- `Select-String -Path scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1,scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1,docs\04-agent-system\sop\automated-advancement-governance.md,docs\05-execution-logs\evidence\2026-06-09-module-run-v2-autopilot-runner-control.md -Pattern 'runnerDecision','runnerNextAction','cleanup_stale_artifacts','prepare_parallel_workers','local Docker database','DeepSeek','Cost Calibration Gate remains blocked'`
  - Exit: 0.
  - Key output: required anchors found.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Exit: 0.
  - Key output: `git completion readiness inventory completed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-autopilot-runner-control`
  - Initial exit: 1.
  - Key output: closeout readiness identified missing pass status and audit approval; this evidence update records the
    final pass status before rerun.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-autopilot-runner-control`
  - Exit: 0.
  - Key output: `module-closeout readiness passed`.

## Final Validation Rerun

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
  - Exit: 0.
  - Key output: `Module Run v2 autopilot runner smoke passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`
  - Exit: 0.
  - Key output: `Module Run v2 autopilot smoke passed`.
- `npm.cmd run lint`
  - Exit: 0.
- `npm.cmd run typecheck`
  - Exit: 0.
- `git diff --check`
  - Exit: 0.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-autopilot-runner-control`
  - Exit: 0.
  - Key output: `module-closeout readiness passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Exit: 0.
  - Key output: `git completion readiness inventory completed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
  - Exit: 0.
  - Key output: `startupDecision: closeout_recovery` because this task is now done and no pending task is available.

## Blocked Remainder

Automatic business implementation, local Docker DB operations, schema/migration, env/secret writes, DeepSeek or other
provider calls, dependency/package/lockfile changes, project resource ingestion into formal data, thread/worktree
creation, worker lifecycle, serial branch integration, merge, push, PR creation, cleanup, deploy, external-service
actions, and Cost Calibration Gate execution remain blocked.

Cost Calibration Gate remains blocked.
