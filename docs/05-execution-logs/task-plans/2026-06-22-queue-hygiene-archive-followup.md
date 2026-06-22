# Task Plan: queue-hygiene-archive-followup-2026-06-22

## Scope

Execute the user-requested queue hygiene / archive follow-up after the L5 bridge approval closeout.

The current diagnostics report no executable task and queue slimming initially reported terminal active queue archive
candidates. This task is docs/state/archive-only and exists to keep archived terminal tasks from repeatedly displacing
bridge proposal markers.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Implementation Plan

1. Materialize this docs/state/archive-only task on a short branch.
2. Move terminal active queue blocks to the June archive while retaining required active bridge recovery markers.
3. Append matching `task-history-index.yaml` entries for those archived task blocks.
4. Update project-state currentTask and queue hygiene checkpoint metadata.
5. Validate that queue slimming reports `archiveCandidateCount: 0`, bridge proposal stays `no_bridge_candidate`, and no
   product/runtime files changed.
6. If a bridge marker is found to be required by the current proposal script's active-queue-only status lookup, restore
   that terminal bridge marker to active queue and archive an unrelated terminal replacement to keep the recovery window
   at 8.

## Risk Controls

- Preserve archived task semantics; only move terminal task blocks from active queue to archive.
- Do not mutate non-terminal task statuses.
- Do not archive execution logs or delete evidence/audit documents.
- Do not touch source, tests, e2e, scripts, package/lockfiles, schema, migrations, env/secret, provider/model, browser,
  dev-server, deploy, PR, force-push, payment, external service, org_auth runtime, or Cost Calibration Gate surfaces.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- scoped Prettier check for changed state/archive/index/plan/evidence/audit files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId queue-hygiene-archive-followup-2026-06-22`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId queue-hygiene-archive-followup-2026-06-22`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId queue-hygiene-archive-followup-2026-06-22 -SkipRemoteAheadCheck`
