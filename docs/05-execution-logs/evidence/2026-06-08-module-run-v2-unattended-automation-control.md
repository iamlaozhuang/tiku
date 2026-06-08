# Module Run v2 Unattended Automation Control Evidence

result: pass

## Scope

This task implements local mechanism control only. It does not create a remote scheduler, does not execute provider,
env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, business
implementation, or Cost Calibration Gate work.

Cost Calibration Gate remains blocked.

## Batch 1: Unattended Stop Decision

- Goal: add a local hard-block readiness script that an unattended loop can run before claiming or continuing work.
- RED: `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` did not exist and PowerShell failed with missing script path.
- GREEN: `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` passed.
- Commit: `3749f449c627f2aafba523e19e4a34e83b40e23d`
- localFullLoopGate: L1.

## Batch 2: Thread Rollover Decision

- Goal: add a deterministic Module Run v2 thread decision script with `continue_current_thread`, `suggest_new_thread`,
  `require_new_thread`, and `stop_for_human_handoff` outputs.
- RED: `Test-ModuleRunV2ThreadRolloverReadiness.Smoke.ps1` did not exist and PowerShell failed with missing script path.
- GREEN: `Test-ModuleRunV2ThreadRolloverReadiness.Smoke.ps1` passed.
- Commit: `3749f449c627f2aafba523e19e4a34e83b40e23d`
- localFullLoopGate: L1.

## unattendedStopDecision

Observed command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId module-run-v2-unattended-automation-control
```

Observed result:

```text
unattendedStopDecision: continue
unattended readiness passed
```

Hard block smoke coverage:

- protected branch -> `HARD_BLOCK_PROTECTED_BRANCH`
- remote ahead -> `HARD_BLOCK_REMOTE_AHEAD`
- repository SHA drift -> `HARD_BLOCK_REPOSITORY_SHA_DRIFT`
- out-of-scope file -> `HARD_BLOCK_OUT_OF_SCOPE`
- blocked file -> `HARD_BLOCK_BLOCKED_FILE`
- blocked risk gate -> `HARD_BLOCK_RISK_GATE`

## threadRolloverDecision

Observed command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ThreadRolloverReadiness.ps1 -CompletedBatchCount 4
```

Observed result:

```text
threadRolloverDecision: suggest_new_thread
reason: Batch 4 threshold reached
```

Smoke coverage:

- Batches 0-3 -> `continue_current_thread`
- Batch 4 -> `suggest_new_thread`
- Batch 6 -> `require_new_thread`
- Module Run closeout -> `require_new_thread`
- execution module change -> `require_new_thread`
- context compaction without recovery audit -> `require_new_thread`
- context compaction with recovery audit -> `continue_current_thread`
- unclear task or blocked gate need -> `stop_for_human_handoff`

## Validation

Passed:

- `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `Test-ModuleRunV2ThreadRolloverReadiness.Smoke.ps1`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-unattended-automation-control`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-unattended-automation-control`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-unattended-automation-control`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
- pre-commit hard block
- post-commit advisory

## L8 Blocked Remainder

Provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost
Calibration Gate work remain blocked.

## nextModuleRunCandidate

The next business candidate remains `ai-task-and-provider` proposal only after this mechanism task closes. No
cross-module implementation is approved by this evidence.

## threadRolloverGate

Decision for this task: `suggest_new_thread` after closeout is reasonable because the next work changes from mechanism
control back to a business Module Run candidate. A new thread is recommended before entering the next execution module.

## Closeout

- moduleRunVersion: 2
- localFullLoopGate: L1 completed.
- threadRolloverGate: `suggest_new_thread` now, `require_new_thread` before changing execution modules.
- unattendedStopDecision: `continue` for this task after validation.
- L8 blocked remainder recorded above.
