# Module Run v2 Stale Clean Worktree Autocleanup Routing Plan

## Task

- taskId: `module-run-v2-stale-clean-worktree-autocleanup-routing`
- branch: `codex/module-run-v2-stale-clean-worktree-autocleanup-routing`
- taskKind: `implementation`
- scope: local automation startup/autopilot routing, stopped-automation hygiene smoke coverage, SOP/state/queue, evidence,
  and audit review.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`

## Problem Statement

Startup currently reports clean stale automation worktrees as `RECOVERABLE_AUTOMATION_WORKTREE_STALE_CLEAN` while still
returning `startupDecision: prepare_next_task`. The user automation policy treats stale automation worktrees as a stop
condition, so the loop repeatedly stops even though `Test-ModuleRunV2StoppedAutomationHygiene.ps1` can safely classify
the same paths as `cleanupCandidate: stale_clean_worktree`.

## Implementation Approach

1. Add RED smoke coverage showing startup routes clean stale worktrees to `startupDecision: cleanup_stale_artifacts`.
2. Add RED smoke coverage showing autopilot consumes `cleanup_stale_artifacts`, runs hygiene cleanup, reruns startup, and
   then resumes the next allowed decision.
3. Keep cleanup delegated to `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup`; startup must not delete files.
4. Preserve hard stops for dirty worktrees, active leases, invalid paths, manual cleanup failures, and blocked gates.

## Allowed Files

- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-stale-clean-worktree-autocleanup-routing.md`
- `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-stale-clean-worktree-autocleanup-routing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-stale-clean-worktree-autocleanup-routing.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`
- `package.json`, lockfiles
- `src/**`, `tests/**`, `e2e/**`
- `src/db/schema/**`, `drizzle/**`
- provider/env/secret, staging/prod/cloud/deploy, payment, external-service
- dependency, schema, migration, product implementation, Cost Calibration Gate execution

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-stale-clean-worktree-autocleanup-routing -PlannedFiles scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.ps1,scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1,scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1,scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1,docs/04-agent-system/sop/automated-advancement-governance.md,docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md,docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/task-queue.yaml,docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-stale-clean-worktree-autocleanup-routing.md,docs/05-execution-logs/evidence/2026-06-09-module-run-v2-stale-clean-worktree-autocleanup-routing.md,docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-stale-clean-worktree-autocleanup-routing.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier write/check for changed files
- anchor check for `cleanup_stale_artifacts`, `stale_clean_worktree`, `stoppedAutomationHygieneDecision`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-stale-clean-worktree-autocleanup-routing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if the repair requires product code, dependency/package/lockfile changes, schema/migration, provider/env/secret,
staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, dirty worktree deletion, or
manual cleanup outside the Codex automation worktree root.
