# Mechanism Runner Consumes Next Action Diagnostic

## Task

- id: `mechanism-runner-consumes-next-action`
- branch: `codex/mechanism-serial-governance`
- task group: user-approved four-task serial mechanism governance chain

## Required Sources Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`

## Scope

Make the autopilot runner consume the unified read-only next-action diagnostic before normal guarded dispatch.

Allowed changes:

- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- task plan, evidence, and audit review for this task

Blocked:

- product code, tests, e2e, dependencies, lockfiles, schema, migrations, env/secret, provider calls, deployment, PR, force push
- changing existing startup, schema, closeout, blocked-gate, or high-risk authority semantics
- Cost Calibration Gate execution

## Implementation

1. Add runner helper `Invoke-NextActionDiagnostic`.
2. Call `Get-TikuNextAction.ps1` at the start of each runner step with the same project-state, queue, and matrix paths.
3. Echo diagnostic output before startup readiness.
4. Hard-stop only if the diagnostic script fails or omits `nextActionDecision`.
5. Keep startup readiness and existing runner decisions authoritative.
6. Extend runner smoke to assert `nextActionDecision` and `diagnosticOnly: true`.
7. Document the preflight relationship in automated advancement governance.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck`
- `Select-String -Path scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1,docs\05-execution-logs\evidence\2026-06-11-mechanism-runner-consumes-next-action.md -Pattern 'Get-TikuNextAction','nextActionDecision','diagnosticOnly','Cost Calibration Gate remains blocked'`
- `git diff --check`
- commit-time pre-commit hook

## Risk Defense

- The new diagnostic is preflight visibility only.
- The runner does not use the diagnostic to bypass startup readiness.
- `-SkipPrimaryRepositoryPostureCheck` is an explicit validation-only pass-through for dirty in-flight task worktrees; production default posture checking remains enabled.
- High-risk actions remain blocked.
- Remote push remains unapproved for this serial task group.
