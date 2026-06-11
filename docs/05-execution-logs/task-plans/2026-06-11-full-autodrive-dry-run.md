# Full Autodrive Dry Run Plan

## Task

`full-autodrive-dry-run`

## Read Before Edit

- `AGENTS.md` instructions supplied in conversation
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Objective

Validate the tuned mechanism with a fixture-simulated ACTIVE path while keeping the real local automation registration paused.

## Implementation Plan

1. Extend runner smoke with a full dry-run fixture:
   - no executable task;
   - controlled auto-seed policy approved;
   - seed proposal available;
   - MECE self-review passes;
   - seed transaction writes low-risk implementation tasks;
   - runner continues and claims the next seeded task.
2. Add runner-level stop-card assertions for closeout recovery output.
3. Run the broader smoke set from the user test plan.
4. Record evidence and final recommendation: whether the user can manually switch local automation to ACTIVE.

## Risk Controls

- Do not change local Codex automation registration or activate automation.
- Do not mutate real task queue outside the Task 5 mechanism state/evidence files.
- Do not touch product code, dependencies, lockfiles, schema, migrations, env/secret, provider, deployment, external service, or Cost Calibration Gate.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2StopEconomics.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 1 -AllowProtectedBranch`
- `git diff --check`
- Prettier check for touched files
- `npm run lint`
- `npm run typecheck`
