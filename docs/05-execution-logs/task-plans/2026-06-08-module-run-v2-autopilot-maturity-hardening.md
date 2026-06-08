# Module Run v2 Autopilot Maturity Hardening Task Plan

## Task

- Task id: `module-run-v2-autopilot-maturity-hardening`
- Branch: `codex/module-run-v2-autopilot-maturity-hardening`
- Current mode: `local_auto_candidate`
- Goal: harden the unattended automation handoff loop so Codex automation, existing threads, durable task state, worktrees, and next-module planning share one controlled startup surface.

## Scope

Allowed:

- Add local automation lease readiness and startup readiness scripts with smoke tests.
- Update Module Run v2 automation SOPs, state files, matrix, task queue, and execution logs.
- Seed a proposal-only next Module Run planning task for `ai-task-and-provider`.
- Refresh Codex automation configuration to call the startup readiness gate.

Blocked:

- Cost Calibration Gate execution.
- Provider calls or provider configuration.
- Env/secret reading or changes.
- Staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, product code, and `e2e/**`.
- Starting `ai-task-and-provider` implementation.

## Batch Plan

### Batch 1: Automation Lease Gate

- RED: no durable local lease blocks a scheduler wakeup from racing an active human or automation thread.
- GREEN: a local lease readiness smoke covers missing lease, active lease, expired clean lease, and expired dirty lease decisions.
- localFullLoopGate: L1.

### Batch 2: Startup Readiness Gate

- RED: autopilot startup has no single machine-readable gate for active lease, no executable task, completed-task recovery, stale worktree, and launch eligibility.
- GREEN: startup readiness smoke emits explicit `startupDecision` labels for those states.
- localFullLoopGate: L1.

### Batch 3: State Source And Codex Automation Sync

- RED: Codex cron automation is ACTIVE but project state still records `remoteAutomationApproval: not_granted`.
- GREEN: project state records lease-guarded local readiness/planning automation and automation prompt references the startup readiness gate.
- localFullLoopGate: L1.

### Batch 4: Next Module Planning Queue Seed

- RED: task queue has no `pending` task, so automation has no legal next action beyond closeout recovery.
- GREEN: seed `module-run-v2-ai-task-and-provider-planning` as proposal-only planning with blocked provider/env/deploy/schema boundaries.
- localFullLoopGate: L1.

### Batch 5: Worktree Hygiene And Full Recheck

- RED: an old Codex automation worktree may be detached and behind `origin/master`.
- GREEN: startup readiness reports stale clean worktree as a hard stop requiring sync/recreate before unattended work.
- localFullLoopGate: L1.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationLeaseReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-autopilot-maturity-hardening`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-autopilot-maturity-hardening -PlannedFiles ...`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped `prettier --write --ignore-unknown`
- scoped `prettier --check --ignore-unknown`
- required anchor check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-autopilot-maturity-hardening`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## L8 Blocked Remainder

Provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, product implementation, and Cost Calibration Gate work remain blocked.
