# Task Plan: phase-84-module-run-v2-validation-command-normalization-required-path

## Task

- id: `phase-84-module-run-v2-validation-command-normalization-required-path`
- branch: `codex/phase-84-validation-normalization-required`
- task kind: `mechanism_hardening`
- scope: Module Run v2 normalization-required decision path

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AgentActionDispatcher.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2SerialAutodriveExecutor.ps1`

## Goal

Complete the Phase83 follow-up by adding a non-hard-stop repair decision when a task already declares a legal scoped unit
replacement but still contains the legacy focused placeholder in `validationCommands`.

## Implementation Plan

1. Add failing smoke coverage for `validation_command_normalization_required`.
2. Update autodrive schema readiness to emit the new decision with `normalizationAction` and `normalizedValidationCommand`
   when replacement metadata is valid and the legacy placeholder is still present.
3. Keep hard blocks for missing replacement, unsafe replacement, and inconsistent replacement metadata.
4. Update dispatcher and serial executor to route the new decision to a repair proposal without executing task validation
   or editing the queue.
5. Update the durable schema and SOP decision lists so the public control surface matches script behavior.
6. Verify batch111 still returns `can_autodrive` after its already-applied scoped unit command.

## Risk Defense

- Do not run e2e.
- Do not run batch111/batch112 future scoped tests.
- Do not edit `src/**`, `tests/**`, `e2e/**`, package files, lockfiles, schema, migration, env/secret files, provider
  configuration, deployment configuration, payment, or external-service surfaces.
- Do not run `tiku-module-run-v2-autopilot` or any unattended runner.
- Evidence remains command-summary-only and redacted.
- Cost Calibration Gate remains blocked.

## Validation Commands

1. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
2. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
3. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`
8. `npm.cmd run lint`
9. `npm.cmd run typecheck`
10. `git diff --check`
11. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-84-module-run-v2-validation-command-normalization-required-path`
12. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-84-module-run-v2-validation-command-normalization-required-path`
13. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-84-module-run-v2-validation-command-normalization-required-path`

## Stop Conditions

- Any high-risk surface is required.
- The new decision would execute validation or modify task queue automatically.
- Dispatcher or serial executor can only support the new path by treating it as `can_autodrive`.
- Automation would need to be resumed.
