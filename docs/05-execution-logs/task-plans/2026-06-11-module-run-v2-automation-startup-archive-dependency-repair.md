# Module Run v2 Automation Startup Archive Dependency Repair Plan

## Task

- taskId: `module-run-v2-automation-startup-archive-dependency-repair`
- branch: `codex/automation-archive-dependency-repair`
- goal: keep primary automation paused while allowing the next manual run to reach `batch-115` by resolving archived terminal dependencies.

## Required Reads

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`

## Implementation Plan

1. Add smoke coverage for archived terminal dependencies:
   - `Get-TikuNextAction.Smoke.ps1` should select a pending task whose dependency is terminal only in `task-history-index.yaml`.
   - `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1` should return `ready_to_claim` for the same dependency shape.
   - `Test-ModuleRunV2ImplementationAutoSeedReadiness.Smoke.ps1` should pass when the source planning task is archived and evidence exists.
2. Implement a narrow history-index dependency resolver in each script that needs it:
   - terminal statuses: `done`, `closed`, `pushed`, `merged`
   - required evidence: non-empty `evidencePath` that exists relative to the repository root or current working directory
   - no fallback for missing evidence or non-terminal history records
3. Keep implementation auto-seed readiness compatible with newly seeded lifecycle validation:
   - archived source planning tasks must be terminal before their evidence can satisfy readiness
   - candidate validation checks should read `validationCommandLifecycle` as well as legacy `validationCommands`
   - focused test anchors may live in the `advisory_baseline` lifecycle phase
4. Align durable automation status with the app TOML state:
   - set `codexAutomationStatus: PAUSED`
   - keep `plannedPauseStatus: closed`
   - preserve primary/historical automation pause boundaries
5. Add a closed mechanism repair task to `task-queue.yaml` with scoped allowed files, blocked high-risk surfaces, validation lifecycle, evidence, and audit paths.
6. Write evidence/audit records before closeout.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-115-authorization-and-access-authorization-read-model-and-display-contrac`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 3 -AllowAutoSeed -PlanOnly -AllowProtectedBranch`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.ps1 -AgentActionOverride claim_task -AgentActionTaskOverride batch-115-authorization-and-access-authorization-read-model-and-display-contrac -AllowProtectedBranch`
- scoped Prettier check
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-automation-startup-archive-dependency-repair`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-automation-startup-archive-dependency-repair`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-automation-startup-archive-dependency-repair`

## Risk Controls

- Do not activate automation.
- Do not modify package or lock files.
- Do not touch e2e, schema, migration, env/secret, provider, deploy, payment, external-service, PR, force-push, or Cost Calibration Gate surfaces.
- Keep the repair limited to mechanism scripts, smoke fixtures, durable state, queue, evidence, and audit.
