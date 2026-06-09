# Module Run v2 Idle And Hygiene Hardening Evidence

Status: validated

result: pass

Batch range: Module Run v2 idle and hygiene hardening.

Commit: `ef1a3ab7075b1e4100fe83af19bd4611dd2bb723` is the pre-task base checkpoint; final closeout commit is produced
after this evidence is finalized.

## Summary

Task id: `module-run-v2-idle-and-hygiene-hardening`

Branch: `codex/module-run-v2-idle-and-hygiene-hardening`

Task kind: `implementation`

Scope: local Module Run v2 mechanism hardening only. No product implementation, dependency change, package or lockfile
change, env or secret write, provider call, real local Docker DB operation, project material or `paper_asset` read,
schema or migration, e2e, deploy, payment, external-service action, PR, force push, unrelated branch cleanup, unrelated
registry cleanup, or worktree cleanup was performed.

## Approval Boundary

The user approved organizing and executing a serial mechanism task to fix the full-control-loop self-check issues. The
durable queue records local mechanism scripts, smoke tests, SOP/state/schema/index updates, task plan, evidence, and
audit review as approved scope.

Closeout approval was added after validation on 2026-06-09 when the user asked whether commit/merge/push and short-branch
cleanup were appropriate and approved execution if suitable. Suitability checks passed. The durable closeout policy now
approves:

- `closeoutPolicy.localCommit: approved`
- `fastForwardMerge.approved: true`
- `push.approved: true`
- `cleanup.deleteShortBranch: true`
- `cleanup.parkWorktree: false`

This approval is limited to local commit, fast-forward merge to `master`, push `origin/master`, and deletion of this
short-lived local branch after validation. It does not approve cleanup of unrelated historical registry files or other
local `codex/*` branch residue.

Cost Calibration Gate remains blocked.

## RED

- RED: Closed task diagnostics previously looked like executable readiness failures instead of quiet idle audit states.
- RED: Real stopped-automation hygiene encountered a native Git error when a registry worktree path existed but was not a
  Git
  repository.
- RED: Expired active run-registry files for terminal or missing active-queue tasks were not classifiable as bounded
  cleanup candidates.
- RED: Startup did not distinguish `node_modules` presence from actual local JS tooling readiness.
- RED: Startup did not surface merged local `codex/*` branch cleanup availability as an advisory.
- RED: Default `nextModuleRunCandidate` wording was inconsistent with the desired idle guardian behavior.

## GREEN

- GREEN: `Test-ModuleRunV2AutodriveSchemaReadiness.ps1` now emits `autodriveSchemaDecision:
not_executable_closed_task` with exit 0 for terminal task statuses.
- GREEN: `Test-ModuleRunV2WorkReadiness.ps1` now emits `workReadinessDecision: not_executable_closed_task` and
  `workReadinessAction: idle_no_executable_task` for terminal tasks, without emitting normal execution readiness.
- GREEN: `Test-ModuleRunV2StoppedAutomationHygiene.ps1` now classifies stale active registry files for terminal or missing
  active-queue tasks as `expired_active_terminal_registry`; cleanup of that class removes only the registry file.
- GREEN: `Test-GitWorktreeDirty` is resilient to existing non-Git paths and no longer crashes the hygiene inventory.
- GREEN: `Test-ModuleRunV2AutomationStartupReadiness.ps1` reports
  `localToolingReadiness: ready|degraded|missing_node_modules` and branch hygiene advisory counts without deleting
  branches.
- GREEN: Default `nextModuleRunCandidate` now uses `no-executable-task-seed-or-approve-next-task` across the mechanism
  outputs touched by this task.
- GREEN: SOP, durable schema, source-of-truth index, task queue, task plan, evidence, and audit review were synchronized.

## Validation Results

### Focused Smoke

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
  - Exit: 0
  - Result: `Module Run v2 stopped automation hygiene smoke passed`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
  - Exit: 0
  - Result: `Module Run v2 automation startup readiness smoke passed`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
  - Exit: 0
  - Result: `Module Run v2 autodrive schema readiness smoke passed`

### Readiness And Diagnostics

- Current task work readiness:
  - Exit: 0
  - Result: `work readiness passed`
- Closed-task schema diagnostic:
  - Command: `Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId module-run-v2-orphan-worktree-cleanup-hardening`
  - Exit: 0
  - Result: `autodriveSchemaDecision: not_executable_closed_task`
- Closed-task work diagnostic:
  - Command: `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-orphan-worktree-cleanup-hardening`
  - Exit: 0
  - Result: `workReadinessDecision: not_executable_closed_task`
- Startup readiness:
  - Exit: 0
  - Result: `startupDecision: continue_current_task`
  - Observed: `localToolingReadiness: ready`
  - Observed: `startupBranchHygieneDecision: cleanup_available`
- Stopped automation hygiene:
  - Exit: 0
  - Result: `stoppedAutomationHygieneDecision: cleanup_available`
  - Observed: `expired_active_terminal_registry=2`, `run_registry=2`
  - Cleanup execution: not run.
- Branch hygiene:
  - Exit: 0
  - Script: `Test-ModuleRunV2BranchHygiene.ps1`
  - Result: `branchHygieneDecision: cleanup_available`
  - Observed: 3 merged cleanup candidates and 1 unmerged manual-review candidate.
- Current task schema readiness:
  - Exit: 0
  - Result: `autodriveSchemaDecision: can_autodrive`
- Control-loop acceptance:
  - Exit: 0
  - Script: `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`
  - Result: `autodriveAcceptanceDecision: accepted_with_guardrails`
  - Observed: `nextModuleRunCandidate: no-executable-task-seed-or-approve-next-task`
- Recovery self-repair:
  - Exit: 0
  - Result: `recoverySelfRepairDecision: continue_without_repair`
- Local Docker DB capability adapter declaration:
  - Exit: 0
  - Result: `localCapabilityDecision: adapter_contract_ready`
  - Observed: `adapterAction: no_execution_local_db_task_approval_required`
- Thread launch policy:
  - Exit: 0
  - Result: `threadLaunchDecision: continue_current_thread`
- Codex thread bridge:
  - Exit: 0
  - Result: `threadBridgeDecision: continue_current_thread`, `codexThreadAction: none`
- Agent action dispatcher:
  - Exit: 0
  - Result: `agentAction: continue_task`

### Runner Diagnostic Note

`Invoke-ModuleRunV2AutopilotRunner.ps1 -TaskId module-run-v2-idle-and-hygiene-hardening -MaxSteps 1` was run before this
evidence and audit review existed. It correctly stopped with `HARD_BLOCK_MISSING_EVIDENCE` and `HARD_BLOCK_MISSING_AUDIT`.
That run wrote a redacted local run-registry heartbeat for the current interactive worktree. Follow-up startup readiness
still returned `startupDecision: continue_current_task`, and stopped-automation hygiene did not classify it as an
external cleanup candidate.

## Final Verification

- `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown <touched docs/state/evidence/audit files>`
  - Exit: 0
  - Result: scoped docs/state/evidence/audit files formatted.
- `npm.cmd run lint`
  - Exit: 0
  - Result: `eslint`
- `npm.cmd run typecheck`
  - Exit: 0
  - Result: `tsc --noEmit`
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown <touched docs/state/evidence/audit files>`
  - Exit: 0
  - Result: `All matched files use Prettier code style!`
- `git diff --check`
  - Exit: 0
  - Result: no whitespace errors.
- Anchor search for `not_executable_closed_task`, `expired_active_terminal_registry`, `startupBranchHygieneDecision`,
  `localToolingReadiness`, `no-executable-task-seed-or-approve-next-task`, and `Cost Calibration Gate remains blocked`
  - Command anchor: `Select-String`
  - Exit: 0
  - Result: anchors present in scripts, SOP/schema, and evidence.
- Anchor search for `no-executable-task-seed-or-approve-next-task` in the touched autopilot and approved-closeout smoke
  fixtures:
  - Command anchor: `Select-String`
  - Exit: 0
  - Result: five fixture/assertion occurrences found.
- Negative search for legacy `nextModuleRunCandidate: ai-task-and-provider` in the touched autopilot and approved-closeout
  smoke fixtures:
  - Exit: 1
  - Result: no matches; this is the expected result for the negative check.

## localFullLoopGate

localFullLoopGate: passed through focused smoke tests, startup readiness, stopped-automation hygiene summary, branch
hygiene summary, schema readiness, control-loop acceptance, work readiness, lint, typecheck, diff, formatting, and anchor
checks.

## threadRolloverGate

threadRolloverGate: no new Codex thread was created. Thread launch policy and Codex thread bridge returned
same-thread/no-action decisions during validation.

## nextModuleRunCandidate

nextModuleRunCandidate: `no-executable-task-seed-or-approve-next-task`. After this approved closeout, the safe state is
idle guardian startup with automation still paused unless separately unpaused.

## Residual Gaps

- Two historical run-registry files are now safely classified as cleanup candidates, but unrelated registry cleanup was
  not executed because this closeout approval is limited to current task Git closeout.
- Three merged local `codex/*` branches are cleanup candidates and one local `codex/*` branch requires manual review, but
  unrelated branch cleanup was not executed because this closeout approval is limited to the current short-lived branch.
- This task does not unpause scheduled Codex automation, seed product tasks, create worker threads, or perform worktree
  cleanup.
