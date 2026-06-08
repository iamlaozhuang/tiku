# Module Run v2 Autopilot Orchestration Control Evidence

result: pass

## Scope

This task completes local mechanism control for handoff generation, thread launch policy, and autopilot orchestration.
It does not execute provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema,
migration, business implementation, next-module implementation, or Cost Calibration Gate work.

Cost Calibration Gate remains blocked.

## Batch 1: Handoff Generator

- Goal: generate a concise, redacted thread rollover handoff from durable state.
- RED: `New-ModuleRunV2ThreadHandoff.Smoke.ps1` did not exist and PowerShell failed with missing script path.
- GREEN: `New-ModuleRunV2ThreadHandoff.Smoke.ps1` passed.
- Commit: pending.
- localFullLoopGate: L1.

## Batch 2: Thread Launch Policy

- Goal: map thread rollover decisions and launch approval into a machine-readable thread launch decision.
- RED: `Test-ModuleRunV2ThreadLaunchPolicy.Smoke.ps1` did not exist and PowerShell failed with missing script path.
- GREEN: `Test-ModuleRunV2ThreadLaunchPolicy.Smoke.ps1` passed.
- Commit: pending.
- localFullLoopGate: L1.

## Batch 3: Autopilot Orchestrator

- Goal: combine stop-decision, thread decision, handoff generation, and launch policy into a single autopilot decision.
- RED: `Invoke-ModuleRunV2Autopilot.Smoke.ps1` did not exist and PowerShell failed with missing script path.
- GREEN: `Invoke-ModuleRunV2Autopilot.Smoke.ps1` passed.
- Commit: pending.
- localFullLoopGate: L1.

## handoffGenerator

Observed:

```text
handoffGenerator: wrote
threadToolHint: create_thread
threadToolHint: send_message_to_thread
Cost Calibration Gate remains blocked
```

Generated handoff:

- `docs/05-execution-logs/handoffs/2026-06-08-module-run-v2-autopilot-orchestration-control.md`

## threadLaunchDecision

Smoke coverage:

- `continue_current_thread` -> `threadLaunchDecision: continue_current_thread`
- `suggest_new_thread` -> `threadLaunchDecision: prepare_handoff`
- `require_new_thread` with launch approval, thread tool availability, and handoff -> `threadLaunchDecision:
launch_new_thread`
- `require_new_thread` without launch readiness -> `threadLaunchDecision: stop_for_human_handoff`
- `stop_for_human_handoff` -> `threadLaunchDecision: stop_for_human_handoff`

## autopilotDecision

Observed command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1 -CompletedBatchCount 6 -SkipUnattendedReadiness -HandoffPath docs\05-execution-logs\handoffs\2026-06-08-module-run-v2-autopilot-orchestration-control.md -ThreadLaunchApproved -ThreadToolAvailable
```

Observed result:

```text
autopilotDecision: launch_new_thread
reason: thread launch policy approved create_thread handoff
nextModuleRunCandidate: ai-task-and-provider
Cost Calibration Gate remains blocked
```

This proves the mechanism can produce a machine-readable launch decision for the Codex agent layer to consume. It does
not directly create the thread inside PowerShell.

## Validation

Passed:

- `New-ModuleRunV2ThreadHandoff.Smoke.ps1`
- `Test-ModuleRunV2ThreadLaunchPolicy.Smoke.ps1`
- `Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `Invoke-ModuleRunV2Autopilot.ps1 ... -ThreadLaunchApproved -ThreadToolAvailable`
- `Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId module-run-v2-autopilot-orchestration-control`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-autopilot-orchestration-control`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-autopilot-orchestration-control`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`

Pending final rerun after evidence closeout:

- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check
- module-closeout hard block
- Git completion readiness

## nextModuleRunCandidate

Default nextModuleRunCandidate remains `ai-task-and-provider` proposal only. This task does not start that module.

## L8 Blocked Remainder

Provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost
Calibration Gate work remain blocked.

## Target Fit Review

The mechanism now supports the intended autopilot chain:

- task stop control: `unattendedStopDecision`
- module/thread control: `threadRolloverDecision`
- handoff package: `handoffGenerator`
- thread launch gate: `threadLaunchDecision`
- orchestration output: `autopilotDecision`

When `autopilotDecision: launch_new_thread` is present, Codex may call `create_thread` with the generated handoff and use
`send_message_to_thread` only for that handoff content. The receiving thread still must perform recovery audit before
business implementation.
