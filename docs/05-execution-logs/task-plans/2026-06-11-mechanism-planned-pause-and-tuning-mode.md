# Mechanism Planned Pause And Tuning Mode Plan

## Task

- id: `mechanism-planned-pause-and-tuning-mode`
- branch: `codex/mechanism-planned-pause`
- task kind: `mechanism_repair`
- productClosureContribution: `none; mechanism budget item`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutomationRegistrationReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`

## Scope

Add an explicit planned pause state for user-requested mechanism tuning while keeping the local Codex automation
registration paused.

Allowed changes:

- read-only diagnostic scripts for planned pause classification;
- governance docs and durable state that define the planned pause;
- task queue, evidence, and audit review for this task.

Blocked changes:

- product code, tests, e2e, dependencies, lockfiles, schema, migrations, env/secret, provider calls, deployment, PR,
  force push, and Cost Calibration Gate execution.

## Implementation

1. Record `plannedPauseStatus: active` and `plannedPauseKeepsAutomationPaused: true` in `project-state.yaml`.
2. Teach registration readiness to classify project ACTIVE plus local PAUSED as `planned_pause_for_tuning` only when the
   durable planned pause fields are present.
3. Teach startup and runner control to stop cleanly on planned pause without proceeding to task claim or seed proposal.
4. Teach `Get-TikuNextAction.ps1` to report `planned_pause_for_tuning` as the top-level decision.
5. Document the boundary in the operating manual and automated advancement SOP.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck`
- scoped Prettier check
- `git diff --check`

## Risk Defense

- Planned pause is diagnostic and stop-only.
- Missing or incomplete planned pause metadata remains a hard registration mismatch.
- The runner must not continue to seed proposal or task claiming while planned pause is active.
- Cost Calibration Gate remains blocked.
