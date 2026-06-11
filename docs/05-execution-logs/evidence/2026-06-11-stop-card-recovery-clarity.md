# Stop Card And Recovery Clarity Evidence

## Scope

Task: `stop-card-recovery-clarity`

Branch: `codex/stop-card-recovery-clarity`

Goal: add a concise, machine-readable stop card to runner/dispatcher terminal output and stop-economics summaries without removing legacy compatibility fields.

No local Codex automation registration or schedule was changed. Product code, dependencies, lockfiles, schema, migrations, env/secret, provider, deployment, external service, and Cost Calibration Gate remained untouched.

## RED Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
```

Exit code: `1` before implementation.

Key output:

```text
Expected output pattern not found: stopCardDecision: manual_required
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1
```

Exit code: `1` before implementation.

Key output:

```text
Expected pattern not found: stopCardDecision: manual_required
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2StopEconomics.Smoke.ps1
```

Exit code: `1` before implementation.

Key output:

```text
Expected output pattern not found: ^stopCardCompletenessCount: 5$
```

Interpretation: runner/dispatcher stop output and stop-economics summaries did not yet expose the requested stop card fields.

## GREEN Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 autopilot runner smoke passed
```

The runner smoke now covers `stopCardDecision`, `canAutoRecover`, `blockerClass`, and `statePolicy` for guarded seed proposal and pending human decision stops.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 agent action dispatcher smoke passed
```

The dispatcher smoke now covers manual owner recovery and hard-block stop cards.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2StopEconomics.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 stop economics smoke passed
```

The stop-economics smoke now confirms `stopCardCompletenessCount` and `autoRecoverStopCardCount`.

## Real Project Diagnostics

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
```

Exit code: `0`

Key output:

```text
projectStatusDecision: planned_pause_for_tuning
projectStatusAction: keep_automation_paused_for_tuning
Cost Calibration Gate remains blocked
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 1 -AllowProtectedBranch
```

Exit code: `0`

Key output:

```text
runnerDecision: planned_pause_for_tuning
runnerNextAction: keep_automation_paused_for_tuning
stopCardDecision: idle
canAutoRecover: false
blockerClass: planned_pause
nextCommand: keep_automation_paused_for_tuning
statePolicy: no_write_accounted
stateWritten: none
Cost Calibration Gate remains blocked
```

## Quality Gates

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1 scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.ps1 scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1 scripts\agent-system\Get-ModuleRunV2StopEconomics.ps1 scripts\agent-system\Get-ModuleRunV2StopEconomics.Smoke.ps1 docs\04-agent-system\operating-manual.md docs\04-agent-system\sop\automated-advancement-governance.md docs\04-agent-system\state\autodrive-control-schema.yaml docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-stop-card-recovery-clarity.md
```

Exit code: `0`

Output:

```text
Checking formatting...
All matched files use Prettier code style!
```

Command:

```powershell
git diff --check
```

Exit code: `0`

Command:

```powershell
npm run lint
```

Exit code: `0`

Command:

```powershell
npm run typecheck
```

Exit code: `0`

Final result: stop card and recovery clarity passed targeted smoke and repository quality gates.

## Post-Merge Master Verification

Fast-forward merge to `master` succeeded:

```text
Updating ab6a9a56..03158285
Fast-forward
```

Post-merge command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 autopilot runner smoke passed
```

Post-merge command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 agent action dispatcher smoke passed
```

Post-merge command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2StopEconomics.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 stop economics smoke passed
```

Post-merge command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
```

Exit code: `0`

Key output:

```text
repository: branch=master; head=03158285; dirty=false
projectStatusDecision: planned_pause_for_tuning
projectStatusAction: keep_automation_paused_for_tuning
Cost Calibration Gate remains blocked
```

Post-merge command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 1 -AllowProtectedBranch
```

Exit code: `0`

Key output:

```text
repository: branch=master; head=03158285; dirty=false
currentTask: stop-card-recovery-clarity(closed)
runnerDecision: planned_pause_for_tuning
runnerNextAction: keep_automation_paused_for_tuning
stopCardDecision: idle
canAutoRecover: false
blockerClass: planned_pause
statePolicy: no_write_accounted
Cost Calibration Gate remains blocked
```

Post-merge `git diff --check`, `npm run lint`, and `npm run typecheck` exit code: `0`.
