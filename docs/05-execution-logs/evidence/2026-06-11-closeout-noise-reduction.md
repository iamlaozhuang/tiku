# Closeout Noise Reduction Evidence

## Scope

Task: `closeout-noise-reduction`

Branch: `codex/closeout-noise-reduction`

Goal: make post-merge evidence-only commits not required by default, while preserving durable evidence requirements for missing validation, recovery, state repair, explicit task policy, or downstream gate needs.

No local Codex automation registration or schedule was changed. Product code, dependencies, lockfiles, schema, migrations, env/secret, provider, deployment, external service, and Cost Calibration Gate remained untouched.

## RED Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.Smoke.ps1
```

Exit code: `1` before implementation.

Key output:

```text
Expected output pattern not found: postMergeEvidenceOnlyCommitPolicy: not_required_by_default
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1
```

Exit code: `1` before implementation.

Key output:

```text
Expected output pattern not found: postMergeEvidenceOnlyCommitPolicy: not_required_by_default
```

Interpretation: closeout/pre-push readiness did not yet expose the non-default post-merge evidence-only commit policy.

## GREEN Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 pre-push readiness smoke passed
```

The smoke now confirms `postMergeEvidenceOnlyCommitPolicy: not_required_by_default` and `finalHandoffShaPolicy: final_handoff_or_project_state`.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1
```

Exit code: `0`

Output:

```text
Module Run v2 approved closeout smoke passed
```

The approved closeout smoke now confirms the same policy for dirty closeout and clean-ahead branch closeout.

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
currentTask: closeout-noise-reduction(in_progress)
runnerDecision: planned_pause_for_tuning
runnerNextAction: keep_automation_paused_for_tuning
stopCardDecision: idle
blockerClass: planned_pause
statePolicy: no_write_accounted
Cost Calibration Gate remains blocked
```

## Quality Gates

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 scripts\agent-system\Test-ModuleRunV2PrePushReadiness.Smoke.ps1 scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.ps1 scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1 docs\04-agent-system\operating-manual.md docs\04-agent-system\sop\automation-loop.md docs\04-agent-system\sop\automated-advancement-governance.md docs\04-agent-system\state\autodrive-control-schema.yaml docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-closeout-noise-reduction.md
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

Final result: closeout noise reduction passed targeted smoke and repository quality gates.
