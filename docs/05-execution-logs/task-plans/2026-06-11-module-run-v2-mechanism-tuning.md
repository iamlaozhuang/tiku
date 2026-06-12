# Module Run v2 Mechanism Tuning Implementation Plan

## Goal

Reduce avoidable unattended automation stops while preserving hard quality and approval gates.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Modify only Module Run v2 mechanism scripts, smoke tests, and mechanism governance docs. Do not modify product runtime code, dependencies, package lockfiles, database schema, env files, automation TOML, or cloud/provider configuration.

## Implementation Steps

1. Add failing Smoke coverage for closeout local tooling readiness and recovery packet generation.
2. Implement `Test-ModuleRunV2CloseoutLocalToolingReadiness.ps1` and `New-ModuleRunV2RecoveryPacket.ps1`.
3. Harden `Invoke-ModuleRunV2ApprovedCloseout.ps1` so local tooling preflight runs before tracked state changes and failed commit restores queue/project-state snapshots.
4. Adjust startup decisions so safe cleanup candidates become advisory when runnable work is available; add `runnable` stop taxonomy for runnable startup decisions.
5. Adjust recovery self-repair to reuse an existing recovery packet for the same blocker fingerprint.
6. Update autodrive schema and automated advancement SOP to document the new decision surface.
7. Run targeted Smoke tests, global quality gates, and write evidence.

## Risk Controls

- Keep task `status` vocabulary unchanged.
- Keep high-risk gates as hard stops.
- Write recovery packets outside the repository under `%USERPROFILE%\.codex\tiku\handoffs`.
- Do not run `lint-staged` in local tooling preflight because it can rewrite files.
- Preserve `currentTask.commitSha` as the task implementation checkpoint, not a self-referential closeout commit.

## Verification

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2CloseoutLocalToolingReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2RecoveryPacket.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
