# Mechanism Project Status Unified Diagnostic Evidence

## Task

- id: `mechanism-project-status-unified-diagnostic`
- branch: `codex/mechanism-project-status-diagnostic`
- task kind: `mechanism_repair`
- productClosureContribution: `none; mechanism budget item`

## Approval Boundary

User approved serial mechanism tuning while keeping local automation paused. This task may add a read-only project
status diagnostic and update scoped docs/state/evidence, then commit, fast-forward merge to `master`, push
`origin/master`, and clean the merged branch.

Blocked surfaces remain untouched: product code, dependencies, lockfiles, schema, migrations, env/secret, provider,
staging/prod/cloud/deploy, payment, external-service, PR, force push, and Cost Calibration Gate.

## Changed Files

- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.Smoke.ps1`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- task plan, evidence, and audit review for this task

## Validation Output

### Project Status Smoke

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.Smoke.ps1
```

Output:

```text
Tiku project status diagnostic smoke passed
```

### Project Status Diagnostic

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
```

Observed result:

```text
nextActionDecision: planned_pause_for_tuning
automationRegistrationDecision: planned_pause_for_tuning
stoppedAutomationHygieneDecision: clean
seedProposalDecision: proposal_available
seedModule: ai-task-and-provider
projectStatusDecision: planned_pause_for_tuning
projectStatusAction: keep_automation_paused_for_tuning
diagnosticOnly: true
Cost Calibration Gate remains blocked
```

### Formatting

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown scripts\agent-system\Get-TikuProjectStatus.ps1 scripts\agent-system\Get-TikuProjectStatus.Smoke.ps1 docs\04-agent-system\operating-manual.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\04-agent-system\state\mechanism-source-of-truth-index.yaml docs\05-execution-logs\task-plans\2026-06-11-mechanism-project-status-unified-diagnostic.md docs\05-execution-logs\evidence\2026-06-11-mechanism-project-status-unified-diagnostic.md docs\05-execution-logs\audits-reviews\2026-06-11-mechanism-project-status-unified-diagnostic.md
```

Output: pass; matched docs/state files were unchanged after formatting.

### Diff Check

Command:

```powershell
git diff --check
```

Output: pass, no whitespace errors.

## Required Anchors

- `projectStatusDecision`
- `planned_pause_for_tuning`
- `authorization`
- `paper`
- `mock_exam`
- `redeem_code`
- `audit_log`
- `ai_call_log`
- `Cost Calibration Gate remains blocked`

## Residual Risk

`Get-TikuProjectStatus.ps1` reports seed proposal availability, but planned pause remains the final decision and no queue
mutation is performed.

## Taste Compliance Checklist

- No UI changes.
- No database, schema, migration, API, dependency, lockfile, env/secret, provider, deployment, payment, PR, or force-push
  changes.
- The new command is read-only.
- Cost Calibration Gate remains blocked.
