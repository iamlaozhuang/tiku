# Preview Release Validation Plan

taskId: preview-release-validation-plan
date: 2026-06-22
branch: codex/preview-release-validation-plan
scope: docs/state-only release validation planning

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

1. Register and close a docs/state-only task for preview release validation planning.
2. Preserve active terminal recovery window at 8 by archiving the displaced terminal task.
3. Define the pre-release validation matrix for local lint, typecheck, unit, build, redaction, git inventory, rollback, and stop conditions.
4. Explicitly keep browser/e2e/dev-server/staging validation as future fresh-approved work unless a later task grants that approval.
5. Keep previewReleaseReady false and AP-01 through AP-11 as release gates.

## Risk Controls

- No browser, Playwright, dev server, e2e runtime, staging validation, or deployment.
- No cloud resource, database, schema, migration, seed, env, secret, provider, payment, PR, or force-push work.
- Evidence is limited to command/result summaries and planning metadata.
- Redaction checks are defined as release gates; sensitive material is not inspected or reproduced in this task.

## Validation Plan

- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory
- npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-22-preview-release-validation-plan.md docs/05-execution-logs/evidence/2026-06-22-preview-release-validation-plan.md docs/05-execution-logs/audits-reviews/2026-06-22-preview-release-validation-plan.md
- npm.cmd run lint
- npm.cmd run typecheck
- git diff --check
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId preview-release-validation-plan
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId preview-release-validation-plan
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PostCommitReadiness.ps1 -TaskId preview-release-validation-plan
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId preview-release-validation-plan
