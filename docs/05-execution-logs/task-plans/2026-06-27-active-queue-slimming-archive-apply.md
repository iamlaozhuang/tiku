# Task Plan: active-queue-slimming-archive-apply-2026-06-27

## Scope

Execute the separately approved active queue archive movement after the scope-constrained readiness task.

Approved write surface:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
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
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Implementation Plan

1. Register this archive-apply task as the current docs/state maintenance task.
2. Move the terminal task blocks selected by the Module Run v2 queue slimming rule into the June archive file.
3. Preserve archived task bodies without semantic edits; only normalize indentation required by the archive `tasks:` list.
4. Add matching `task-history-index.yaml` entries for every moved task id.
5. Keep the active queue with the non-terminal tasks plus the retained 8 terminal recovery blocks including this task.
6. Update archive/index metadata and project state to record the archive movement.
7. Validate that queue slimming reports zero archive candidates and that project status remains deterministic.

## Candidate Batch

Preflight calculated the batch after adding this task:

- active queue before movement: 267 tasks
- terminal before adding this task: 223
- terminal after adding this task: 224
- planned moved terminal task blocks: 216
- retained terminal recovery blocks: 8
- missing evidence path count: 0
- missing audit review path count: 0

The exact moved task id list is generated into evidence by the archive movement command before closeout.

## Risk Controls

- Do not change task semantics, statuses, evidence files, or audit files.
- Do not archive non-terminal tasks.
- Do not remove the current task or active recovery window.
- Do not touch source, tests, scripts, dependencies, schema/migrations, env/secrets, Provider, DB, browser, deploy, PR,
  force push, release readiness, final Pass, or Cost Calibration Gate.
- Stop if post-move queue slimming does not report `archiveCandidateCount: 0`.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- scoped Prettier write/check for changed docs/state and execution log files
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-slimming-archive-apply-2026-06-27`
