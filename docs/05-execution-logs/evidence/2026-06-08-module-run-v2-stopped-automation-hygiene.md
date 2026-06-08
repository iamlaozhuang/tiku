# Module Run v2 Stopped Automation Hygiene Evidence

## Scope

- taskId: `module-run-v2-stopped-automation-hygiene`
- branch: `codex/module-run-v2-stopped-automation-hygiene`
- purpose: add a read-only-by-default stopped automation residual artifact inventory and safe cleanup gate

## Baseline

- `master`, `origin/master`, and `HEAD` were aligned at `13f2e90537fe709d2baf8056110c988d305fa13c` before branch
  creation.
- Working tree was clean before branch creation.
- Cost Calibration Gate remains blocked.

## Residual Artifact Model

If scheduled Codex automation wakes while another run owns the lane, it may stop after creating or observing automation
state outside the repository. The expected residual categories are:

- automation lease file at the configured Codex automation lease path;
- automation worktrees under the configured Codex automation worktree root;
- dry-run handoff temp directories under the system temp root.

The new hygiene gate is expected to classify those artifacts without touching repository source files.

## Batch Evidence

### Batch 1: Stopped Automation Hygiene Gate

- RED: the automation startup and lease gates can stop on active or unsafe automation state, but there is no dedicated
  cleanup-safe stopped automation hygiene gate for expired clean leases, stale clean automation worktrees, and dry-run
  handoff temp directories.
- GREEN: added `Test-ModuleRunV2StoppedAutomationHygiene.ps1` and smoke coverage for clean inventory, active lease stop,
  invalid lease stop, expired clean lease cleanup, dirty worktree stop, and dry-run handoff temp cleanup.
- Commit: `13f2e905` is the pre-task baseline; the final task commit is recorded by Git after this evidence is committed.
- localFullLoopGate: L2.

### Batch 2: Governance Alignment

- RED: SOP and matrix did not name stopped automation residual handling as a first-class recovery path.
- GREEN: added stopped automation hygiene decision labels, automation permissions, automation prohibitions, hook inventory,
  and SOP cleanup boundaries.
- Commit: `13f2e905` is the pre-task baseline; the final task commit is recorded by Git after this evidence is committed.
- localFullLoopGate: L1.

## Validation Log

### Readiness Gates

- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-stopped-automation-hygiene`
  - result: pass
  - decision: work readiness passed
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-stopped-automation-hygiene -PlannedFiles ...`
  - result: pass
  - decision: all planned files match allowed files

### Focused Smoke

- command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- result: pass
- covered:
  - missing artifacts return `stoppedAutomationHygieneDecision: clean`;
  - active lease returns `stop_existing_run_active`;
  - invalid lease returns `stop_invalid_lease`;
  - expired clean lease returns `cleanup_available` in read-only mode;
  - expired clean lease returns `cleanup_completed` with explicit `-Cleanup`;
  - expired dirty worktree returns `stop_dirty_worktree`;
  - dry-run handoff temp directory returns `cleanup_completed` with explicit `-Cleanup`.

### Live Hygiene Inventory

- command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- result: pass
- decision: `stoppedAutomationHygieneDecision: clean`
- observed:
  - automation lease file: missing
  - automation worktree residual: none reported
  - dry-run handoff temp residual: none reported
  - hard block count: 0
  - cleanup candidate count: 0

### Startup Gate

- command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- result: pass
- decision: `startupDecision: continue_current_task`

### Global Gates

- result: pass for `npm.cmd run lint`
- result: pass for `npm.cmd run typecheck`
- result: pass for `git diff --check`
- result: pass for scoped prettier write
- result: pass for scoped prettier check
- result: pass for required anchor check covering `stoppedAutomationHygiene`, `stop_existing_run_active`,
  `stop_dirty_worktree`, `cleanup_completed`, and `Cost Calibration Gate remains blocked`
- result: pass for `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- result: pass for `Test-GitCompletionReadiness.ps1`

## Implementation Summary

- Added `Test-ModuleRunV2StoppedAutomationHygiene.ps1`.
- Added `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`.
- Updated automation SOP with a stopped automation hygiene gate and explicit cleanup boundary.
- Updated Module Run v2 matrix with decision labels, hook inventory, automation permissions, and automation prohibitions.
- Updated state and queue to make this task the active mechanism hardening item.

## Safety Conclusion

The expected stopped-automation residual artifacts are outside repository source files. The new gate makes their handling
explicit:

- active or non-expired lease: stop and do not interfere;
- invalid lease: stop for manual inspection;
- dirty worktree: stop for manual inspection;
- expired clean lease: cleanup candidate;
- stale clean automation worktree: cleanup candidate;
- dry-run handoff temp directory: cleanup candidate.

Cost Calibration Gate remains blocked.

## threadRolloverGate

- This task contains 2 mechanism Batches, so it may close in the current thread.
- No new business Module Run is started by this task.

## nextModuleRunCandidate

- nextModuleRunCandidate remains `ai-task-and-provider` for the next business Module Run planning candidate.
- This task does not approve cross-module implementation.
- Automation startup may prepare the next pending task only if startup readiness, lease readiness, stopped automation
  hygiene, and implementationAutoSeedGate conditions pass.

## L8 Blocked Remainder

- Provider/env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, product e2e
  implementation, and Cost Calibration Gate execution remain blocked.
