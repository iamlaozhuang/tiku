# Controlled Auto-Seed Policy Evidence

## Scope

Task: `controlled-auto-seed-policy`

Branch: `codex/controlled-auto-seed-policy`

Goal: allow low-risk implementation seed transactions to proceed under `approved_by_controlled_auto_seed_policy`, while preserving the `pending_human_decision` hard stop.

No local Codex automation registration or schedule was changed. Cost Calibration Gate remains blocked.

## RED Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
```

Exit code: `1` before runner implementation.

Key output:

```text
Expected output pattern not found: seedTransactionDecision: seeded
runnerDecision: seed_proposal_available
runnerNextAction: request_auto_seed_approval
noWriteReason: PlanOnly or missing AllowAutoSeed prevents queue mutation
```

Interpretation: a fixture with `status: approved_by_controlled_auto_seed_policy` still stopped for explicit approval instead of auto-seeding.

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

The smoke now covers:

- `pending_human_decision` still returns `runnerDecision: stop_for_manual_decision`.
- `approved_by_controlled_auto_seed_policy` auto-applies a matching low-risk seed without explicit `-AllowAutoSeed`.
- The controlled policy fixture records `controlledAutoSeedPolicyApproval: recorded`.
- Seed transaction and self-review still run before `runnerDecision: seed_transaction_applied`.

## Real Project Diagnostics

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
```

Exit code: `0`

Key output:

```text
nextActionDecision: planned_pause_for_tuning
automationRegistrationDecision: planned_pause_for_tuning
stoppedAutomationHygieneDecision: clean
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
currentTask: controlled-auto-seed-policy(in_progress)
nextActionDecision: planned_pause_for_tuning
automationRegistrationDecision: planned_pause_for_tuning
startupDecision: planned_pause_for_tuning
runnerDecision: planned_pause_for_tuning
runnerNextAction: keep_automation_paused_for_tuning
Cost Calibration Gate remains blocked
```

## Quality Gates

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1 docs\04-agent-system\operating-manual.md docs\04-agent-system\state\autodrive-control-schema.yaml docs\04-agent-system\state\ai-task-and-provider-auto-seed-approval-decision.yaml docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-controlled-auto-seed-policy.md
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

Final result: controlled auto-seed policy behavior passed targeted and repository quality gates.

## Post-Merge Master Verification

Fast-forward merge to `master` succeeded:

```text
Updating 8522f0dc..2c6c0936
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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
```

Exit code: `0`

Key output:

```text
repository: branch=master; head=2c6c0936; dirty=false
nextActionDecision: planned_pause_for_tuning
automationRegistrationDecision: planned_pause_for_tuning
stoppedAutomationHygieneDecision: clean
seedProposalDecision: proposal_available
seedModule: ai-task-and-provider
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
currentTask: controlled-auto-seed-policy(closed)
nextActionDecision: planned_pause_for_tuning
seedProposalDecision: proposal_available
seedModule: ai-task-and-provider
automationRegistrationDecision: planned_pause_for_tuning
startupDecision: planned_pause_for_tuning
runnerDecision: planned_pause_for_tuning
runnerNextAction: keep_automation_paused_for_tuning
Cost Calibration Gate remains blocked
```

Post-merge `git diff --check` exit code: `0`, no whitespace errors.
