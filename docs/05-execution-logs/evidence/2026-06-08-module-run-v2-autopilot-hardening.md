# Module Run v2 Autopilot Hardening Evidence

result: pass

## Scope

This task hardens local Module Run v2 autopilot recovery, handoff dry-run behavior, and Codex automation configuration evidence.

Cost Calibration Gate remains blocked.

## Recovery Audit

- Branch: `codex/module-run-v2-autopilot-hardening`
- Baseline SHA: `c6dc4acc5af1987c258e3c1841a60df13960454e`
- Initial dirty file: `docs/05-execution-logs/handoffs/2026-06-08-module-run-v2-autopilot-orchestration-control.md`
- Initial dirty reason: prior self-check regenerated the durable handoff, proving the dry-run hardening need.

## Batches

### Batch 1: Post-Closeout State Recovery

- Goal: prevent stale self-referential closeout state from blocking safe recovery while preserving hard blocks for active work.
- RED: completed-task unattended readiness previously failed with `HARD_BLOCK_UNATTENDED_TASK_STATUS` unless unsafe readiness skipping was used.
- GREEN: `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` passes with `closeoutRecovery: enabled`, `OK_CLOSEOUT_RECOVERY_TASK_STATUS`, `unattendedStopDecision: closeout_recovery`, and dirty-worktree hard block coverage.
- Commit: `3e059db4`
- localFullLoopGate: L1 target.

### Batch 2: Autopilot Closeout Recovery

- Goal: let autopilot recover from a completed task without unsafe `-SkipUnattendedReadiness`.
- RED: completed-task autopilot recovery previously required `-SkipUnattendedReadiness`, bypassing the main stop-decision surface.
- GREEN: `Invoke-ModuleRunV2Autopilot.Smoke.ps1` passes a `-CloseoutRecovery` fixture with a `done` task and observes `autopilotDecision: launch_new_thread` without skipping readiness.
- Commit: `9f633c2c`
- localFullLoopGate: L1 target.

### Batch 3: Dry-Run Handoff Decisions

- Goal: make read-only autopilot/self-check decisions avoid tracked file edits.
- RED: prior self-check regenerated `docs/05-execution-logs/handoffs/2026-06-08-module-run-v2-autopilot-orchestration-control.md`, leaving the worktree dirty after a decision-only run.
- GREEN: `New-ModuleRunV2ThreadHandoff.Smoke.ps1` passes with `handoffGenerator: dry_run` and confirms no output file is created for `-DryRun`.
- GREEN: `Invoke-ModuleRunV2Autopilot.Smoke.ps1` passes with `-DryRunHandoff`, observes `dryRunHandoff: enabled`, and confirms the requested repository handoff path is not written.
- Commit: `460aed3e`
- localFullLoopGate: L1 target.

### Batch 4: Automation Configuration Evidence

- Goal: update Codex automation prompt and record ACTIVE configuration plus local dry-run loop evidence.
- RED: automation was ACTIVE, but routine wakeups did not explicitly prefer `-CloseoutRecovery` plus `-DryRunHandoff`; direct decision checks could write tracked handoff files.
- GREEN: Codex automation `tiku-module-run-v2-autopilot` remains ACTIVE and now instructs routine wakeups to use closeout recovery plus dry-run handoff before durable handoff writes.
- GREEN: local dry-run autopilot observed `autopilotDecision: launch_new_thread`, `dryRunHandoff: enabled`, `nextModuleRunCandidate: ai-task-and-provider`, and left `git status --short --branch` clean.
- Commit: `e4e4feed`
- localFullLoopGate: L1 target.

## Automation Configuration

- automationId: `tiku-module-run-v2-autopilot`
- status: `ACTIVE`
- schedule: hourly
- executionEnvironment: `worktree`
- cwd: `D:\tiku`
- model: `gpt-5.5`
- reasoningEffort: `high`
- prompt refresh: routine wakeups prefer `-CloseoutRecovery` and `-DryRunHandoff`; durable handoff writes require an approved closeout or handoff task.

## Dry-Run Autopilot Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1 -TaskId module-run-v2-autopilot-hardening -CompletedBatchCount 6 -CloseoutRecovery -ReadinessChangedFiles scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1 -DryRunHandoff -ThreadLaunchApproved -ThreadToolAvailable
```

Observed:

```text
autopilotDecision: launch_new_thread
dryRunHandoff: enabled
nextModuleRunCandidate: ai-task-and-provider
Cost Calibration Gate remains blocked
```

Clean check after dry-run:

```text
## codex/module-run-v2-autopilot-hardening
```

## L8 Blocked Remainder

Provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost Calibration Gate work remain blocked.

## Validation

Passed:

- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-autopilot-hardening`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-autopilot-hardening`
- `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `New-ModuleRunV2ThreadHandoff.Smoke.ps1`
- `Test-ModuleRunV2ThreadLaunchPolicy.Smoke.ps1`
- `Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped `prettier --write --ignore-unknown`
- scoped `prettier --check --ignore-unknown`
- required anchor check via `Select-String`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-autopilot-hardening`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`

## threadRolloverGate

- Completed batch count: 4.
- Decision posture: `suggest_new_thread` is acceptable; module-to-module change still requires guarded recovery and fresh Module Run v2 plan.

## nextModuleRunCandidate

- Default nextModuleRunCandidate remains `ai-task-and-provider` proposal only.
- This task does not start that module.
