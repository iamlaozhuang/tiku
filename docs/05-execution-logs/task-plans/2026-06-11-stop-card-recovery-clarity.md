# Stop Card And Recovery Clarity Plan

## Task

`stop-card-recovery-clarity`

## Read Before Edit

- `AGENTS.md` instructions supplied in conversation
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Objective

Add a concise, machine-readable stop card to runner and dispatcher terminal output while preserving the existing compatibility fields: `runnerDecision`, `runnerNextAction`, `noWriteReason`, and `resumePointer`.

## Implementation Plan

1. Extend runner terminal output with `stopCardDecision`, `canAutoRecover`, `blockerClass`, `nextCommand`, and `statePolicy`.
2. Derive stop card values from existing severity, taxonomy, write accounting, and next command decisions.
3. Keep existing natural-language stop lines for compatibility and readability.
4. Extend dispatcher result output with the same stop card shape so dispatcher-only failures have a clear next action.
5. Update stop-economics summary to read stop card fields and report completeness counts.
6. Add smoke assertions for seed proposal, pending manual decision, hard block, dispatcher manual decision, and stop-economics fixtures.
7. Update schema/manual wording to make the stop card part of the terminal envelope contract.

## Risk Controls

- Do not change task selection, seed transaction, closeout, local automation registration, or protected branch behavior.
- Do not modify product code, dependencies, lockfiles, schema, migrations, env/secret, provider, deployment, external service, or Cost Calibration Gate.
- Keep new fields additive so existing scripts that read old fields continue to work.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2StopEconomics.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 1 -AllowProtectedBranch`
- `git diff --check`
- Prettier check for touched files
- `npm run lint`
- `npm run typecheck`
