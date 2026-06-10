# Module Run v2 Registry Path Normalization Evidence

**Task id:** `module-run-v2-registry-path-normalization`

**Branch:** `codex/module-run-v2-registry-path-normalization`

**Task kind:** `mechanism_repair`

**result:** pass

result: pass

## Summary

Repaired a run registry lifecycle defect where the same Windows worktree could have two registry ids: one from readiness using a forward-slash path and another from finalizer using a resolved backslash path.

- `Set-ModuleRunV2RunRegistryFinalizer.ps1` now hashes the same normalized worktree path that it persists.
- `Test-ModuleRunV2UnattendedReadiness.ps1` also normalizes the heartbeat worktree path before hashing and writing.
- `Test-ModuleRunV2StoppedAutomationHygiene.ps1` now classifies an old active registry as `superseded_active_run_registry` when a newer terminal registry exists for the same normalized worktree and task.
- Current live registry root contains only the batch-103 stopped terminal registry; the prior duplicate active registry is absent.

No business implementation files, package files, lockfiles, env/secret files, schema/migrations, DB operations, provider calls, e2e, deploy, payment, PR, force push, or Cost Calibration Gate action was performed.

Cost Calibration Gate remains blocked.

## RED

RED: finalizer smoke failed because the terminal registry path used a backslash-hash id instead of the existing readiness forward-slash-hash id.

RED: stopped automation hygiene smoke failed because a fresh active registry was not classified as superseded even when a newer stopped registry existed for the same worktree/task.

## GREEN

GREEN: focused mechanism smokes passed after the repair.

## Validation Results

| Command                                                                                                                                   | Result | Notes                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Set-ModuleRunV2RunRegistryFinalizer.Smoke.ps1`            | pass   | Covers normalized registry path reuse.                                                                                                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`       | pass   | Covers superseded active registry cleanup candidate and cleanup.                                                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`            | pass   | Heartbeat readiness smoke passed.                                                                                                                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`     | pass   | Startup smoke passed.                                                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`              | pass   | Runner smoke passed.                                                                                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`        | pass   | Dispatcher smoke passed.                                                                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`           | pass   | Recovery self-repair smoke passed.                                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`     | pass   | Validation-surface smoke passed.                                                                                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`      | pass   | Serial executor smoke passed.                                                                                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`       | pass   | Schema smoke passed.                                                                                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1` | pass   | Control-loop smoke passed.                                                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1`                   | pass   | Scope scan passed for mechanism files.                                                                                                                                    |
| `git diff --check`                                                                                                                        | pass   | No whitespace errors.                                                                                                                                                     |
| `npm.cmd run lint`                                                                                                                        | pass   | Initial run failed because this worktree had no local `node_modules`; passed after a temporary junction to existing `D:\tiku\node_modules`. No install. Junction removed. |
| `npm.cmd run typecheck`                                                                                                                   | pass   | Passed with the same temporary junction to existing dependencies. Junction removed.                                                                                       |

## Next Autopilot Handoff

Live startup proof from the mechanic branch returned:

- `startupDecision: open_recovery_plan`
- `runnerDecision: open_recovery_plan`
- `runnerNextAction: agent_open_recovery_plan`
- `agentAction: open_recovery_plan`
- `runRegistryCount: 1`
- live registry: batch-103 stopped terminal registry only
- lease: missing

Next expected autopilot action is to open the governed recovery plan for the dirty batch-103 `c424` owner worktree. The mechanic did not adopt, commit, clean, or continue that business work.

## Redaction Check

This evidence contains no secrets, tokens, database URLs, Authorization headers, provider payloads, raw prompts, raw model responses, plaintext `redeem_code`, full `paper` content, DB rows, or customer/customer-like private data.
