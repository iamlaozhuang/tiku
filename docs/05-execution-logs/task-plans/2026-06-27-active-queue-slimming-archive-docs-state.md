# Task Plan: active-queue-slimming-archive-docs-state-2026-06-27

## Scope

Create and execute a docs/state-only active queue slimming/archive task package under the current user approval.

Approved write surface:

- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- this task's task plan, evidence, audit review, and acceptance files

Explicitly blocked: source, tests, browser/dev-server/e2e runtime, database connection or mutation, schema/migration,
Provider calls or credential reads, dependency/package or lockfile changes, PR, force push, release readiness, final
Pass, and Cost Calibration Gate.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Implementation Plan

1. Create the short branch and task packet.
2. Run the queue slimming diagnostic in read-only mode to capture the terminal candidate baseline.
3. Record the scope conflict: the approved files exclude the archive file and task history index required by the active
   queue slimming SOP for actual archival movement.
4. Update `project-state.yaml` and `task-queue.yaml` with a closed, scope-constrained archive readiness result.
5. Do not move, delete, or rewrite terminal task blocks in this task.
6. Validate changed docs/state files with scoped Prettier, `git diff --check`, Module Run v2 hardening, and diagnostics.

## Risk Controls

- Preserve task history by refusing to delete terminal task blocks without an authorized archive/index write target.
- Record only diagnostic summaries and task ids; do not capture secrets, credentials, raw prompts, raw generated output,
  Provider payloads, database rows, or browser/session values.
- Keep the task docs/state-only and local-only.

## Expected Outcome

This task can close as a scope-constrained archive readiness package. Actual active queue slimming remains blocked until
a follow-up approval explicitly includes `docs/04-agent-system/state/archive/**` and
`docs/04-agent-system/state/task-history-index.yaml`, or approves another traceability-preserving archive target.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-active-queue-slimming-archive-docs-state.md docs/05-execution-logs/evidence/2026-06-27-active-queue-slimming-archive-docs-state.md docs/05-execution-logs/audits-reviews/2026-06-27-active-queue-slimming-archive-docs-state.md docs/05-execution-logs/acceptance/2026-06-27-active-queue-slimming-archive-docs-state.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-active-queue-slimming-archive-docs-state.md docs/05-execution-logs/evidence/2026-06-27-active-queue-slimming-archive-docs-state.md docs/05-execution-logs/audits-reviews/2026-06-27-active-queue-slimming-archive-docs-state.md docs/05-execution-logs/acceptance/2026-06-27-active-queue-slimming-archive-docs-state.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-slimming-archive-docs-state-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
