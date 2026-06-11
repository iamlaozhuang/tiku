# Runner Pending Seed Decision Gate Evidence

## Scope

Task: `runner-pending-seed-decision-gate`

Branch: `codex/runner-pending-seed-decision-gate`

Goal: block runner auto-seed transaction execution when `automation.autoSeedApprovalDecisionPath` points to a decision file whose `status` is `pending_human_decision` for the proposed seed module.

No local Codex automation registration, schedule, or state was modified. Cost Calibration Gate remains blocked.

## RED Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
```

Exit code: `1` before the runner gate implementation.

Key output:

```text
Unexpected runner exit code: 0
seedProposalDecision: proposal_available
seedTransactionDecision: seeded
runnerDecision: seed_transaction_applied
```

Interpretation: the new smoke fixture proved the existing runner could still apply a seed transaction even when a durable decision file said `pending_human_decision`.

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

The new fixture asserts:

- `runnerDecision: stop_for_manual_decision`
- `runnerNextAction: request_auto_seed_approval`
- `runnerNextTask: authorization-and-access`
- `noWriteReason: pending_human_decision blocks seed transaction execution`
- no `seedTransactionDecision: seeded`
- task queue content unchanged

## Real Project Diagnostics

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 1 -AllowProtectedBranch
```

Exit code: `0`

Key output:

```text
nextActionDecision: planned_pause_for_tuning
automationRegistrationDecision: planned_pause_for_tuning
startupDecision: planned_pause_for_tuning
runnerDecision: planned_pause_for_tuning
runnerNextAction: keep_automation_paused_for_tuning
Cost Calibration Gate remains blocked
```

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

## Formatting And Diff Checks

Command:

```powershell
git diff --check
```

Exit code: `0`

Output: no whitespace errors.

Initial formatting command before this evidence/audit file existed:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1 docs\04-agent-system\operating-manual.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\04-agent-system\state\mechanism-source-of-truth-index.yaml docs\05-execution-logs\task-plans\2026-06-11-runner-pending-seed-decision-gate.md docs\05-execution-logs\evidence\2026-06-11-runner-pending-seed-decision-gate.md docs\05-execution-logs\audits-reviews\2026-06-11-runner-pending-seed-decision-gate.md
```

Exit code: `1`

Key output:

```text
All matched files use Prettier code style!
No files matching the pattern were found: "docs\05-execution-logs\evidence\2026-06-11-runner-pending-seed-decision-gate.md".
No files matching the pattern were found: "docs\05-execution-logs\audits-reviews\2026-06-11-runner-pending-seed-decision-gate.md".
```

Interpretation: formatting matched for existing files; the command failed because the evidence and audit files were not created yet.

## Final Validation Results

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1 docs\04-agent-system\operating-manual.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\04-agent-system\state\mechanism-source-of-truth-index.yaml docs\05-execution-logs\task-plans\2026-06-11-runner-pending-seed-decision-gate.md docs\05-execution-logs\evidence\2026-06-11-runner-pending-seed-decision-gate.md docs\05-execution-logs\audits-reviews\2026-06-11-runner-pending-seed-decision-gate.md
```

Exit code: `0`

Output:

```text
Checking formatting...
All matched files use Prettier code style!
```

Command:

```powershell
npm run lint
```

Exit code: `0`

Output:

```text
> tiku-scaffold@0.1.0 lint
> eslint
```

Command:

```powershell
npm run typecheck
```

Exit code: `0`

Output:

```text
> tiku-scaffold@0.1.0 typecheck
> tsc --noEmit
```

Final `git diff --check` exit code: `0`, no whitespace errors.

Final result: validation passed for the scoped mechanism hardening task.
