# Stage 1 Queue Health Archive Followup Plan

## Scope

- Task: `stage-1-queue-health-archive-followup-2026-06-20`
- Branch: `codex/stage-1-queue-health-archive-followup`
- Archive source: `docs/04-agent-system/state/task-queue.yaml`
- Archive target: `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- Index target: `docs/04-agent-system/state/task-history-index.yaml`

## Exact Archive Candidates

- `stage-3-decision-packages-2026-06-20`
- `provider-rag-quota-governance-packet`
- `future-scope-non-goal-governance-packet`
- `final-audit-gate-governance-packet`

## Boundary

This task is docs/state-only queue health maintenance. It may move the exact terminal task blocks above into the June
archive, update the task history index, update project/task state for this archive task, and write plan/evidence/audit.

It must not alter task semantics, change blocked task decisions, claim new implementation tasks, approve new module
auto-seed, or touch source, tests, e2e, scripts, dependencies, lockfiles, schema, migrations, env/secrets, provider/model
configuration or calls, staging/prod/cloud deploy, payment, OCR, export, external services, PR, force-push, destructive
DB, or Cost Calibration Gate.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-1-queue-health-archive-followup-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId stage-1-queue-health-archive-followup-2026-06-20`

## Completion Criteria

- Exact four candidate ids are absent from active `task-queue.yaml`.
- Exact four candidate ids are present in `task-queue-archive-2026-06.yaml`.
- Exact four candidate ids are present in `task-history-index.yaml`.
- Queue status still produces deterministic next action diagnostics.
- Cost Calibration Gate remains blocked.
