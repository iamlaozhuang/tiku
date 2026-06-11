# Mechanism Seed Proposal Next-Action Bridge Evidence

## Task

- id: `mechanism-seed-proposal-next-action-bridge`
- branch: `codex/mechanism-seed-proposal-bridge`
- task kind: `mechanism_repair`
- productClosureContribution: `none; mechanism budget item`

## Approval Boundary

User approved serial mechanism tuning while keeping local automation paused. This task may add proposal-only seed
visibility to read-only diagnostics and update scoped docs/state/evidence, then commit, fast-forward merge to `master`,
push `origin/master`, and clean the merged branch.

Blocked surfaces remain untouched: queue mutation, seed transaction application, product code, dependencies, lockfiles,
schema, migrations, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, PR, force push, and Cost
Calibration Gate.

## Changed Files

- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- task plan, evidence, and audit review for this task

## Validation Output

### Next Action Smoke

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1
```

Output:

```text
Tiku next-action diagnostic smoke passed
```

### Next Action Diagnostic

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1
```

Observed result:

```text
nextActionDecision: planned_pause_for_tuning
nextExecutableTask: none
seedProposalDecision: proposal_available
seedModule: ai-task-and-provider
seedRequiredApproval: autoDriveLocalImplementationApproval for module ai-task-and-provider
recommendedHumanDecision: approve_auto_seed_or_keep_paused_or_create_manual_task
recommendedAction: keep_automation_paused_for_tuning
Cost Calibration Gate remains blocked
```

### Project Status Diagnostic

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
```

Observed result:

```text
nextActionDecision: planned_pause_for_tuning
seedProposalDecision: proposal_available
seedModule: ai-task-and-provider
projectStatusDecision: planned_pause_for_tuning
projectStatusAction: keep_automation_paused_for_tuning
Cost Calibration Gate remains blocked
```

### Formatting

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown scripts\agent-system\Get-TikuNextAction.ps1 scripts\agent-system\Get-TikuNextAction.Smoke.ps1 docs\04-agent-system\operating-manual.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\04-agent-system\state\mechanism-source-of-truth-index.yaml docs\05-execution-logs\task-plans\2026-06-11-mechanism-seed-proposal-next-action-bridge.md docs\05-execution-logs\evidence\2026-06-11-mechanism-seed-proposal-next-action-bridge.md docs\05-execution-logs\audits-reviews\2026-06-11-mechanism-seed-proposal-next-action-bridge.md
```

Output: pass; matched docs/state files were unchanged after formatting.

### Diff Check

Command:

```powershell
git diff --check
```

Output: pass, no whitespace errors.

## Required Anchors

- `seedProposalDecision`
- `seedModule`
- `seedRequiredApproval`
- `recommendedHumanDecision`
- `planned_pause_for_tuning`
- `authorization`
- `paper`
- `mock_exam`
- `redeem_code`
- `audit_log`
- `ai_call_log`
- `Cost Calibration Gate remains blocked`

## Residual Risk

The seed proposal is visible but remains proposal-only. No queue mutation or implementation approval was performed.

## Taste Compliance Checklist

- No UI changes.
- No database, schema, migration, API, dependency, lockfile, env/secret, provider, deployment, payment, PR, force-push,
  queue mutation, or seed transaction changes.
- Cost Calibration Gate remains blocked.
