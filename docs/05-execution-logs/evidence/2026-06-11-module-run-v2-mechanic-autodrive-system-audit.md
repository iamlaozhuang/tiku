# 2026-06-11 Mechanism Autodrive System Audit Evidence

## Scope

- Task: mechanism autodrive system audit.
- User approval: user said `批准执行`.
- Scope type: docs-only mechanism audit.
- No product code, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, or Cost Calibration Gate execution was performed.

## Dirty Worktree Baseline

`git status --short --branch` before this audit showed existing uncommitted changes from the previous Codex automation UI visibility / registration repair task:

```text
## codex/mechanism-serial-governance
 M docs/04-agent-system/sop/automated-advancement-governance.md
 M docs/04-agent-system/state/autodrive-control-schema.yaml
 M docs/04-agent-system/state/project-state.yaml
 M scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
 M scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.Smoke.ps1
 M scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.ps1
 M scripts/agent-system/Test-ModuleRunV2AutomationRegistrationReadiness.Smoke.ps1
 M scripts/agent-system/Test-ModuleRunV2AutomationRegistrationReadiness.ps1
 M scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1
 M scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1
 M scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1
 M scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
 M scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
?? docs/05-execution-logs/audits-reviews/2026-06-11-codex-automation-ui-visibility-registration-repair.md
?? docs/05-execution-logs/evidence/2026-06-11-codex-automation-ui-visibility-registration-repair.md
?? docs/05-execution-logs/task-plans/2026-06-11-codex-automation-ui-visibility-registration-repair.md
```

This audit added:

- `docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`
- `docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Commands And Findings

### Next Action Diagnostic

Command:

```powershell
.\scripts\agent-system\Get-TikuNextAction.ps1 | ConvertTo-Json -Depth 20
```

Key output:

```text
repository: branch=codex/mechanism-serial-governance; head=540bce36; dirty=true
currentTask: mechanism-runner-consumes-next-action(closed)
queueDecision: no_pending_task
nextActionDecision: no_pending_task
nextExecutableTask: none
validationNeeded: none
evidenceFindings: evidenceMissing=6
driftFindings: queueMatrixDrift=matrixBatchMissingInQueue:0,sourcePlanningTaskMissingInQueue:0
recommendedAction: idle_no_pending_task
stopReason: none
diagnosticOnly: true
Cost Calibration Gate remains blocked
```

Interpretation:

- The read-only diagnostic treats the current state as idle, not failed.
- Historical evidence gaps remain visible as noise, but they did not block this diagnostic.
- There is no pending executable task.

### Autopilot Runner Plan-Only Diagnostic

Command:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck | ConvertTo-Json -Depth 20
```

Key output:

```text
startupDecision: no_executable_task
stopTaxonomy: no_task
reason: current task is already closed and no pending task is available

seedProposalDecision: proposal_available
seedModule: ai-task-and-provider
seedSourcePlanningTask: phase-70-advanced-ai-task-domain-implementation-planning
seedLocalFullLoopMinimum: L2
seedCandidateTaskCount: 4
seedRequiredApproval: autoDriveLocalImplementationApproval for module ai-task-and-provider
seedCandidateTask: batch-105-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract
seedCandidateTask: batch-106-ai-task-and-provider-local-task-request-policy-and-result-referen
seedCandidateTask: batch-107-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence
seedCandidateTask: batch-108-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence
seedBlockedRemainder: none

runnerDecision: seed_proposal_available
runnerNextAction: request_auto_seed_approval
runnerNextTask: ai-task-and-provider
runnerStepCount: 1
stopTaxonomy: hard_block
reason: no executable task exists and a guarded seed proposal is available
```

Interpretation:

- The mechanism can find the next module and split it into four candidate implementation tasks.
- The runner reports an actionable seed proposal but classifies the terminal taxonomy as `hard_block`.
- This is a classification and default-policy problem: the state is not unsafe; it is approval-gated or auto-seed-ready depending on whether standing approval should be consumed.

### Automation Registration Readiness

Command:

```powershell
.\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1 | ConvertTo-Json -Depth 20
```

Key output:

```text
projectCodexAutomationId: tiku-module-run-v2-autopilot
projectCodexAutomationStatus: ACTIVE
expectedAutomationId: tiku-module-run-v2-autopilot
automationRegistration: tiku-module-run-v2-autopilot; status=ACTIVE
automationRegistration: tiku-module-run-v2-autopilot-2; status=PAUSED
activeAutomationRegistrationCount: 1
activeAutomationRegistration: tiku-module-run-v2-autopilot
automationRegistrationDecision: ready
stopTaxonomy: no_task
reason: automation registration is consistent
```

Interpretation:

- The Codex automation registration repair is effective at the mechanism-readiness level.
- One scheduled automation is active and the stale `-2` entry is paused.

### Task Queue Status Count

Command:

```powershell
$lines = Get-Content -Path docs/04-agent-system/state/task-queue.yaml -Encoding UTF8
$statuses = @{}
foreach ($line in $lines) {
  if ($line -match '^\s+status:\s*(\S+)') {
    $status=$Matches[1].Trim('"',"'")
    if (-not $statuses.ContainsKey($status)) { $statuses[$status]=0 }
    $statuses[$status]++
  }
}
$statuses.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name): $($_.Value)" }
```

Output:

```text
closed: 30
done: 121
```

Interpretation:

- The active queue has no `pending`, `claimed`, `planned`, `implemented`, `validated`, `reviewed`, or `ready_for_closeout` task.
- The next useful mechanism action is task seeding or explicit idle.

### Source Evidence

Relevant source anchors reviewed:

- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `tiku-module-run-v2-mechanic-2` remains the on-demand mechanic identity anchor for mechanism repair scope checks.
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`

Important observed facts:

- `Invoke-ModuleRunV2AutopilotRunner.ps1` supports `-AllowAutoSeed`, `-AutoSeedApprovalStatement`, and `-ContinueAfterAutoSeed`.
- `Get-RunnerStopTaxonomy` defaults unknown runner decisions to `hard_block`.
- `seed_proposal_available` is not explicitly mapped in `Get-RunnerStopTaxonomy`.
- `New-ModuleRunV2ImplementationSeed.ps1` creates small pending implementation tasks with `allowedFiles`, `blockedFiles`, validation commands, evidence path, audit review path, and closeout policy.
- `Test-ModuleRunV2ImplementationSeedSelfReview.ps1` hard-blocks unsafe seeded task metadata, file scope, validation command, redaction, and target closure gaps.
- `project-state.yaml` records `standingUnattendedLocalCloseoutApproval.status: approved` for low-risk Module Run v2 local implementation tasks with `autoDriveLocalImplementationApproval`.
- `advanced-edition-domain-module-run-matrix.yaml` records the next module candidate `ai-task-and-provider` with four `targetLocalClosure` items and dependency on `authorization-and-access`.

## Evidence Conclusion

The current mechanism is not missing a seed/decomposition capability. It is stopping because the runner defaults to proposal-only unless `-AllowAutoSeed` and an approval statement are supplied, and because `seed_proposal_available` is displayed with `stopTaxonomy: hard_block`.

The concrete repair target is the control loop policy and taxonomy layer, not product code.

## Validation

### `git diff --check`

Command:

```powershell
git diff --check
```

Result: passed with no output.

### Targeted Prettier Check

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\05-execution-logs\task-plans\2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md docs\05-execution-logs\evidence\2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md docs\05-execution-logs\audits-reviews\2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md
```

Result after targeted `--write` on the audit report:

```text
Checking formatting...
All matched files use Prettier code style!
```

### Anchor Search

Command:

```powershell
Select-String -Path docs\05-execution-logs\audits-reviews\2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md,docs\05-execution-logs\evidence\2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md -Pattern 'seed_proposal_available','hard_block','standingUnattendedLocalCloseoutApproval','MECE','stop envelope','finalizer','ai-task-and-provider','approval_required','auto_recoverable'
```

Result: passed. Required audit anchors were found.

### Final Git Inventory

`git status --short --branch` after this audit still includes the prior uncommitted automation UI visibility repair changes plus the three new audit files:

```text
?? docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md
?? docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md
?? docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md
```

## Closeout

Closeout decision: `closed_docs_only_uncommitted`.

Why stopped: the requested mechanism audit has produced its task plan, evidence, and audit review, and validation checks pass.

Risk if auto-continued: continuing directly into mechanism repair would modify runner/SOP/schema behavior and should be a separate scoped task, because the current worktree also contains the previous automation UI visibility repair changes.

Next action: create a separate repair task for `mechanism-stop-envelope-normalization` or commit the current completed documentation batches separately after explicit commit approval.

State written by this closeout:

- Updated `docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md` with this closeout section.

Commit suitability assessment:

- The audit documentation is suitable to commit as a docs-only task after final validation.
- It should not be mixed into the previous automation UI visibility repair commit unless the reviewer explicitly wants one combined mechanism-governance commit.
- No stage, commit, merge, push, PR, deploy, provider call, env/secret write, dependency change, schema migration, or Cost Calibration Gate action was performed during closeout.

Recovery pointer:

- Primary audit report: `docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`
- Evidence and closeout record: `docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`
- Task plan: `docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`
