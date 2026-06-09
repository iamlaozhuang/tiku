# Module Run v2 Automation Handoff Contract Hardening Plan

## Task

- taskId: `module-run-v2-automation-handoff-contract-hardening`
- branch: `codex/module-run-v2-automation-handoff-contract-hardening`
- taskKind: `implementation`
- scope: local mechanism scripts, smoke tests, SOP/state/queue alignment, evidence, and audit review.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- Existing Module Run v2 startup, unattended, hygiene, and autopilot scripts.

## Problem Statement

Repeated Codex automation wakeups stopped because closeout residue was treated as a hard block even when it was clean and recoverable. The current mechanism has three handoff gaps:

- clean stale automation worktrees are hard-blocked by startup readiness instead of being treated as recoverable residue;
- post-closeout `project-state.yaml` SHA values that are ancestors of current `master` / `origin/master` are accepted only for the completed task, not for the next pending task;
- completed automation worktrees do not have an explicit parking rule that leaves them clean, detached, and aligned with `origin/master` for future Codex automation startup checks.
- active or stopped work threads cannot communicate durable ownership, heartbeat, adoption, or cleanup intent to a newly
  started Codex automation thread.
- dirty worktrees are classified only as hard blocks, instead of being split into active owner, adoptable stopped run,
  recovery-plan-needed, cleanup-ready, and manual-decision cases.

## Implementation Approach

1. Clean the current stale worktree from Git worktree registration using the existing stopped automation hygiene mechanism.
2. Add an external run registry at `%USERPROFILE%\.codex\tiku\automation-runs` so readiness scripts can record and read
   `runId`, `taskId`, `branch`, `worktreePath`, `status`, `heartbeatAtUtc`, `phase`, `changedFiles`,
   `nextRecommendedAction`, `safeToAdopt`, `cleanupPolicy`, and `redactedHandoffPath`.
3. Treat `%USERPROFILE%\.codex\tiku\handoffs` as the redacted handoff envelope root for adoption and cleanup decisions.
4. Extend startup readiness so worktree hygiene becomes a decision router:
   - `exit_active_owner_present` for dirty worktrees with a fresh active heartbeat;
   - `adopt_recoverable_run` for dirty worktrees with `safeToAdopt: true` and a redacted handoff;
   - `open_recovery_plan` for stopped/recoverable dirty worktrees that lack an adoptable handoff;
   - `cleanup_stale_artifacts` for clean worktrees whose run registry is `cleanup_ready`;
   - `stop_for_manual_decision` for dirty worktrees without registry ownership.
5. Extend unattended readiness so active threads write a run registry heartbeat and so a pending next task may continue
   when the durable current task is `done` / `closed`, Git is clean and aligned, and recorded state SHAs are ancestors of
   current `master` / `origin/master`.
6. Add an explicit automation worktree parking option to the hygiene script. It must only park a clean current worktree
   and detach it to `origin/master` or the configured target ref.
7. Extend stopped automation hygiene so janitor cleanup removes only `cleanup_ready` run registry files and redacted
   handoff envelopes under the configured roots, plus the existing safe cleanup candidates.
8. Update smoke tests first for the changed handoff contract, then implement minimal script changes to pass them.
9. Update SOP/state/queue/evidence/audit wording so the durable mechanism documents the new接手 contract.

## Allowed Files

- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-automation-handoff-contract-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-automation-handoff-contract-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-automation-handoff-contract-hardening.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`
- `package.json`, lockfiles
- `src/**`, `tests/**`, `e2e/**`
- `src/db/schema/**`, `drizzle/**`
- provider/env/secret, staging/prod/cloud/deploy, payment, external-service
- dependency, schema, migration, product implementation, Cost Calibration Gate execution

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId module-run-v2-ai-task-and-provider-planning -AllowProtectedBranch`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier write/check for changed docs and scripts
- required anchor search for `runRegistryHeartbeat`, `exit_active_owner_present`, `adopt_recoverable_run`,
  `open_recovery_plan`, `cleanup_stale_artifacts`, `stop_for_manual_decision`, `recoverableAutomationWorktree`,
  `automationWorktreeParking`, `postCloseoutHandoffSha`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if the fix requires dependency/package/lockfile changes, product code, schema/migration, provider/env/secret, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, or deleting dirty/manual worktrees.
