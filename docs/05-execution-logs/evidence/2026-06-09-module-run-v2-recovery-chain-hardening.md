# Module Run v2 Recovery Chain Hardening Evidence

## Task

- Task id: `module-run-v2-recovery-chain-hardening`
- Branch: `codex/module-run-v2-recovery-chain-hardening`
- Status: ready for closeout.

## Approval Boundary

User approved organizing and executing a serial mechanism task to fix all identified Module Run v2 autodrive recovery
chain gaps. The approval covers local mechanism scripts, smoke tests, SOP/state/schema/index updates, evidence, audit
review, paused Codex automation prompt alignment, local commit, fast-forward merge to `master`, push `origin/master`,
and short-branch cleanup after validation.

The approval does not cover business implementation, dependency/package/lockfile changes, env/secret writes, real
provider calls, real local Docker DB operations, project material/paper/paper_asset resource reads for tests,
schema/migration, e2e, staging/prod/cloud/deploy, payment, external-service, PR/force push, destructive DB operation, or
Cost Calibration Gate execution.

## RED Target

RED: The mechanism self-check found a recovery-chain gap.

The mechanism self-check found that startup/recovery/acceptance are safe, but the full unattended recovery chain can
still stop unnecessarily after cleanup because `closeout_recovery`, post-closeout state reconciliation, registry
lifecycle cleanup, and no-write diagnostics are not fully closed.

GREEN: The recovery-chain hardening scripts, smoke coverage, SOP/schema/index/state, and paused Codex app automation
prompt now encode the bounded recovery behavior.

result: pass.

## Batch Evidence

- Batch range: single serial mechanism hardening batch, `module-run-v2-recovery-chain-hardening`.
- Commit: `4830f768` is the pre-closeout base commit; the task commit is created during approved closeout.
- localFullLoopGate: local smoke, acceptance, unattended no-write readiness, lint, typecheck, diff, and scoped format
  gates completed before closeout.
- threadRolloverGate: no new thread was launched; the paused automation prompt now requires the thread bridge before any
  Codex thread action.
- nextModuleRunCandidate: keep the automation paused until this mechanism commit is merged; the next executable module
  remains subject to fresh task schema and approval.

## Validation Log

- `Invoke-ModuleRunV2PostCloseoutStateReconcile.Smoke.ps1`: passed.
- `powershell.exe` validation commands were used for the PowerShell mechanism gates.
- `Test-ModuleRunV2WorkReadiness`: passed before edits; a later rerun after `ready_for_closeout` correctly returned
  `HARD_BLOCK_UNSUPPORTED_TASK_STATUS` because it is a pre-edit gate, not a closeout gate.
- `Invoke-ModuleRunV2PostCloseoutStateReconcile.Smoke`: passed.
- `Test-ModuleRunV2BranchHygiene.Smoke.ps1`: passed.
- `Invoke-ModuleRunV2AgentActionDispatcher.Smoke`: passed.
- `Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`: passed.
- `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke`: passed.
- `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`: passed.
- `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`: passed, including `-NoWrite`.
- `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`: passed, including `expired_active_missing_worktree`.
- `Invoke-ModuleRunV2RecoverySelfRepair.Smoke`: passed.
- `Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`: passed, including `reconcile_post_closeout_state_sha`.
- `Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`: passed.
- `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`: passed with `accepted_with_guardrails`.
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`: returned `startupDecision: cleanup_stale_artifacts`; this is now a
  repairable startup state, not a hard block.
- `Invoke-ModuleRunV2RecoverySelfRepair.ps1 -TaskId module-run-v2-recovery-chain-hardening`: returned
  `recoverySelfRepairDecision: self_repair_ready` and `repairAction: run_stopped_automation_hygiene_cleanup`.
- `Test-ModuleRunV2StoppedAutomationHygiene.ps1`: dry-run only; returned
  `stoppedAutomationHygieneHardBlockCount: 0`, `stoppedAutomationHygieneCleanupCandidateCount: 89`, and
  `stoppedAutomationHygieneDecision: cleanup_available`. No live cleanup was executed.
- `Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId module-run-v2-recovery-chain-hardening -NoWrite -CloseoutRecovery
-SkipRemoteAheadCheck`: passed with `runRegistryHeartbeat: skipped_no_write` and `unattendedStopDecision: continue`.
- `Test-ModuleRunV2BranchHygiene.ps1`: dry-run only; returned `cleanup_available`, four merged cleanup candidates, and
  one unmerged branch requiring manual review. No live branch cleanup was executed.
- Paused Codex app automation `tiku-module-run-v2-autopilot`: updated and verified as `status = "PAUSED"` with prompt
  anchors for `reconcile_post_closeout_state_sha`, `-NoWrite`, `Test-ModuleRunV2BranchHygiene`, and `-Intent`.
- `npm.cmd exec -- prettier --write ...`: completed; changed files were already formatted.
- `git diff --check`: passed.
- `npm.cmd exec -- prettier --check ...`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- Required boundary search for `closeout_recovery`, `reconcile_post_closeout_state_sha`, `NoWrite`,
  `expired_active_missing_worktree`, `branchHygieneDecision`, `-Intent`, and `Cost Calibration Gate remains blocked`:
  passed with `Select-String`.
- `Test-ModuleRunV2ModuleCloseoutReadiness`: passed after strict evidence anchors were added.
- `Test-GitCompletionReadiness`: inventory completed and showed current branch changes are local task changes, with no
  upstream configured.

## Implemented Mechanism Changes

- Added bounded post-closeout state reconciliation for accepted ancestor SHA drift.
- Wired `closeout_recovery` through dispatcher and serial executor as a recovery handoff, not free-form execution.
- Added `-NoWrite` unattended readiness diagnostics so audits do not claim run ownership.
- Extended stopped automation hygiene for expired active registry files whose worktree path is missing.
- Added local `codex/*` branch hygiene classification with merged-only cleanup support.
- Updated acceptance coverage, schema/index/SOP, state/queue records, and paused Codex automation prompt alignment.

## Residual Boundaries

- Live stopped-automation cleanup and live branch cleanup were not executed in this validation pass; the upgraded
  mechanism classifies them for bounded cleanup.
- One unmerged local branch, `codex/closeout-state-sha-sync`, still requires manual review before deletion.
- Cost Calibration Gate remains blocked.

Cost Calibration Gate remains blocked.
