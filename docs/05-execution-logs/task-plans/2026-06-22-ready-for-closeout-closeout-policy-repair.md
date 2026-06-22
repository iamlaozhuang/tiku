# Ready For Closeout Closeout Policy Repair

taskId: ready-for-closeout-closeout-policy-repair
date: 2026-06-22
branch: codex/ready-for-closeout-closeout-policy-repair
scope: docs/state-only queue metadata repair

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

1. Identify active queue tasks with status ready_for_closeout and missing closeoutPolicy.
2. Add structured closeoutPolicy metadata to exactly those tasks without changing status, result, evidence, audit, or business content.
3. Register and close this docs/state-only metadata repair task.
4. Preserve active terminal recovery window at 8 by archiving the displaced terminal task.
5. Run the docs/state validation gates, lint, typecheck, diff check, and Module Run v2 precommit/closeout/postcommit/prepush checks.

## Repair Target Count

The target count is 24 ready_for_closeout tasks missing closeoutPolicy.

## Risk Controls

- No source, test, package, lockfile, schema, migration, env, secret, provider, database, browser/e2e, dev-server, deployment, PR, or force-push changes.
- Do not change any repaired task status.
- Do not close, merge, or push any repaired ready_for_closeout task as part of this metadata repair.
- Evidence remains command/result summary only and redacted.

## Validation Plan

- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory
- npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-22-ready-for-closeout-closeout-policy-repair.md docs/05-execution-logs/evidence/2026-06-22-ready-for-closeout-closeout-policy-repair.md docs/05-execution-logs/audits-reviews/2026-06-22-ready-for-closeout-closeout-policy-repair.md
- npm.cmd run lint
- npm.cmd run typecheck
- git diff --check
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ready-for-closeout-closeout-policy-repair
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ready-for-closeout-closeout-policy-repair
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PostCommitReadiness.ps1 -TaskId ready-for-closeout-closeout-policy-repair
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ready-for-closeout-closeout-policy-repair
