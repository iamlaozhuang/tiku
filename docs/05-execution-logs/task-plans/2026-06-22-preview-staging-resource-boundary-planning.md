# Preview Staging Resource Boundary Planning

taskId: preview-staging-resource-boundary-planning
date: 2026-06-22
branch: codex/preview-staging-resource-boundary-planning
scope: docs/state-only release planning

## Read Inputs

- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/adr-001-tech-stack-selection.md
- docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md
- docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md
- docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md
- docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md
- docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md
- docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/04-agent-system/state/local-experience-coverage-matrix.yaml
- scripts/agent-system/Get-TikuProjectStatus.ps1
- scripts/agent-system/Get-TikuNextAction.ps1
- scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1

## Implementation Plan

1. Register and close a docs/state-only task for staging resource boundary planning.
2. Preserve active terminal recovery window at 8 by archiving the displaced terminal task.
3. Record a planning-only boundary for database, object storage, auth callback and secret, AI provider default-off policy, audit_log and ai_call_log retention, domain/TLS, owner acceptance accounts, seed/reset, monitoring owner, and rollback owner.
4. Keep preview scope fixed as Web-only owner acceptance preview with synthetic or reviewed non-sensitive sample data.
5. Keep previewReleaseReady false and AP-01 through AP-11 as release gates.

## Risk Controls

- No cloud resource creation.
- No staging/prod connection.
- No database, schema, migration, seed, or reset execution.
- No env or secret read/write.
- No provider/model call and no provider configuration change.
- No browser/e2e/dev-server/deploy/PR/force-push work.
- Evidence is command/result summary only and excludes secrets, database URLs, tokens, raw prompts, provider payloads, raw generated content, raw employee answers, and full paper content.

## Validation Plan

- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory
- npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-22-preview-staging-resource-boundary-planning.md docs/05-execution-logs/evidence/2026-06-22-preview-staging-resource-boundary-planning.md docs/05-execution-logs/audits-reviews/2026-06-22-preview-staging-resource-boundary-planning.md
- npm.cmd run lint
- npm.cmd run typecheck
- git diff --check
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId preview-staging-resource-boundary-planning
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId preview-staging-resource-boundary-planning
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PostCommitReadiness.ps1 -TaskId preview-staging-resource-boundary-planning
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId preview-staging-resource-boundary-planning
