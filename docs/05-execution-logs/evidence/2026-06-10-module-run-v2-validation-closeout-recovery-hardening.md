# Module Run v2 Validation Closeout Recovery Hardening Evidence

Task: `module-run-v2-validation-closeout-recovery-hardening`

Branch: `codex/module-run-v2-validation-closeout-recovery`

Commit: `3fc91623d98c0ba25b2fadd2607374959677c48a`

## Scope

Mechanism-only repair. No business implementation, source runtime code, dependency/package/lockfile, env/secret, DB,
provider, e2e, deploy, PR, force-push, payment, external-service, material/paper content exposure, or Cost Calibration
Gate action was performed.

## RED

- Existing startup handling had no explicit validation-surface classifier for stale dirty active owners protected by
  `safeToAdopt: false`.
- A stopped/expired owner with focused validation evidence, unrelated broad baseline failure, and pending closeout
  transaction could collapse into a generic dirty-worktree hard block instead of a deterministic owner-recovery boundary.

## GREEN

- Added `Test-ModuleRunV2ValidationSurfaceReadiness.ps1` and smoke coverage for legacy validationCommands, structured
  `validationCommandLifecycle`, unrelated baseline failures, pending closeout evidence, and owner-recovery decisions.
- Startup readiness now invokes the read-only classifier for expired dirty active run registries with `safeToAdopt:
false`, producing `startupDecision: manual_required_owner_recovery` only when the classifier reports
  `ownerRecoveryDecision: manual_required_owner_recovery`.
- Runner, dispatcher, recovery self-repair, serial executor smoke coverage, autodrive schema, source-of-truth index, and
  automated advancement SOP now preserve the explicit owner-recovery boundary.
- The current durable state remains guardian-first: the default startup path sees an active owner and leaves it alone.

## Validation

| Command                                                                                                                                               | Result | Summary                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`                 | pass   | Validation surface classifier smoke passed.                                                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`                 | pass   | Startup readiness smoke passed, including stale dirty owner fixture.                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`                          | pass   | Runner routes `manual_required_owner_recovery` to `request_owner_recovery`.                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`                    | pass   | Dispatcher maps owner recovery to manual decision.                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`                  | pass   | Serial executor keeps manual decision as a stop, not work execution.                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`                       | pass   | Recovery self-repair maps owner recovery to `open_owner_recovery_plan`.                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`             | pass   | Acceptance gate includes validation surface readiness and owner recovery boundary.                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`                   | pass   | Autodrive schema readiness smoke passed.                                                                            |
| `git diff --check`                                                                                                                                    | pass   | No whitespace diff errors.                                                                                          |
| `npm.cmd run lint`                                                                                                                                    | pass   | Ran with a temporary `node_modules` junction to existing `D:\tiku\node_modules`; junction removed after validation. |
| `npm.cmd run typecheck`                                                                                                                               | pass   | Ran with the same temporary junction; `tsc --noEmit` passed and junction was removed.                               |
| `.\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-validation-closeout-recovery-hardening -ChangedFiles <21 files>` | pass   | All files matched task `allowedFiles`; sensitive evidence and terminology scans found no blockers.                  |

## Next Autopilot Takeover Proof

Earlier current durable state while the active heartbeat was still fresh:

- `startupDecision: exit_active_owner_present`
- `runnerDecision: exit_active_owner_present`
- `runnerNextAction: leave_active_owner_alone`
- `agentActionDecision: idle`
- `agentAction: idle_active_owner_present`
- `recoverySelfRepairDecision: exit_active_owner_present`
- `repairAction: none`
- Next expected action: active-owner no-op; the next autopilot must not interfere with
  `C:\Users\jzzhu\.codex\worktrees\9716\tiku`.

Forced stale-heartbeat pressure check against the same durable state with `-ActiveRunHeartbeatMinutes 30`:

- `validationSurfaceDecision: validation_surface_incomplete`
- `validationSurfaceBroadGate: unrelated_baseline_failure`
- `closeoutTransactionState: closeout_pending_commit_evidence`
- `ownerRecoveryDecision: manual_required_owner_recovery`
- `startupDecision: manual_required_owner_recovery`
- Next expected action after heartbeat expiry: manual-required owner recovery, not auto-adoption, cleanup, task claim, or
  hard-block ambiguity.

Final post-commit proof against current durable state after the heartbeat aged past the default threshold:

- `startupDecision: manual_required_owner_recovery`
- `runnerDecision: manual_required_owner_recovery`
- `runnerNextAction: request_owner_recovery`
- `agentActionDecision: manual_required`
- `agentAction: request_manual_decision`
- `recoverySelfRepairDecision: manual_required`
- `repairAction: open_owner_recovery_plan`
- Next expected action: manual-required owner recovery. The next autopilot can start steadily, but it must stop at the
  owner-recovery boundary instead of adopting or cleaning the dirty batch-101 worktree.

## Automation Registration

- Primary visible autopilot `tiku-module-run-v2-autopilot-2`: `status = "ACTIVE"`.
- Primary visible mechanic `tiku-module-run-v2-mechanic-2`: `status = "ACTIVE"`.
- Historical autopilot `tiku-module-run-v2-autopilot`: `status = "PAUSED"` and treated as archival.
- Historical mechanic `tiku-module-run-v2-mechanic`: `status = "PAUSED"` and treated as archival.

## Residual Boundaries

- Current batch-101 owner worktrees remain untouched.
- Cost Calibration Gate remains blocked.
- The next autopilot is currently expected to ask for owner recovery because the protected dirty active owner heartbeat
  has aged past the default threshold.
