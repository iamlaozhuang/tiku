# 2026-06-11 Module Run V2 机制二次深入审计 Evidence

## Scope

本次 evidence 支撑二次机制审计，仅记录只读诊断、PlanOnly runner 输出和文档审计结论。

本轮未执行以下动作：

- 未修改 runner、SOP、schema、state、业务代码、数据库、接口或运行时类型。
- 未运行 `New-ModuleRunV2ImplementationSeed.ps1 -Apply`。
- 未修改 `docs/04-agent-system/state/task-queue.yaml`。
- 未执行 push、deploy、provider、env/secret、schema migration、dependency/package/lockfile、Cost Calibration Gate。

Registration anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

Cost Calibration Gate remains blocked.

## Baseline

### `git status --short --branch`

```text
## codex/mechanism-serial-governance
```

### `git log -1 --oneline`

```text
07913e7c docs(mechanism): audit autodrive advancement governance
```

### Codex automation registration

Read-only inspection of `$HOME\.codex\automations`.

Current primary automation:

```text
id = "tiku-module-run-v2-autopilot"
kind = "cron"
name = "Tiku Module Run v2 Autopilot"
status = "ACTIVE"
rrule = "FREQ=HOURLY;INTERVAL=1"
execution_environment = "worktree"
cwds = ["D:\\tiku"]
```

Historical automation:

```text
id = "tiku-module-run-v2-autopilot-2"
status = "PAUSED"
```

The active prompt already includes `-AllowAutoSeed` and an `AutoSeedApprovalStatement` containing `standingUnattendedLocalCloseoutApproval`, low-risk local implementation task scope, local commit / fast-forward merge / push origin/master anchors, and `High-risk capability gates remain blocked`.

## Required Runtime Diagnostics

### `.\scripts\agent-system\Get-TikuNextAction.ps1`

Command:

```powershell
.\scripts\agent-system\Get-TikuNextAction.ps1 |
  Select-String -Pattern 'branch:|head:|dirty:|currentTask:|queueDecision:|nextExecutableTask:|blockedGates:|statusFindings:|evidenceFindings:|driftFindings:|recommendedAction:|stopReason:'
```

Observed output:

```text
currentTask: mechanism-runner-consumes-next-action(closed)
queueDecision: no_pending_task
nextExecutableTask: none
blockedGates: dependency_change:blocked_without_approval; env_secret:blocked_without_approval; provider_call:blocked_without_task_approval; schema_migration:blocked_without_task_approval; deploy:blocked_without_approval; push_pr_force_push:blocked_without_fresh_approval; Cost Calibration Gate remains blocked
statusFindings: legacy_status_missing=0; legacy_done=94; unsupportedStatus=0; legacy_status_missing_first=none; legacy_done_first=phase-1-api-contract-baseline,phase-1-design-token-baseline,phase-1-env-logging-baseline,phase-2-user-auth-planning,phase-2-auth-schema-and-permission-model-approval
evidenceFindings: evidenceMissing=6; evidenceMissingFirst=phase-1-api-contract-baseline,phase-1-design-token-baseline,phase-1-env-logging-baseline,phase-2-user-auth-planning,phase-2-auth-schema-and-permission-model-approval
driftFindings: queueMatrixDrift=matrixBatchMissingInQueue:0,sourcePlanningTaskMissingInQueue:0; queueMatrixDriftFirst=none
recommendedAction: idle_no_pending_task
stopReason: none
```

Conclusion: queue is idle with no pending task. Historical `legacy_done` and `evidenceMissing` diagnostics are useful but not blocking the current run.

### `.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck`

Command:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck |
  Select-String -Pattern 'startupDecision:|seedModule:|seedCandidateTask:|seedProposalDecision:|runnerDecision:|runnerNextAction:|runnerNextTask:|runnerStepCount:|stopTaxonomy:|reason:|Cost Calibration Gate remains blocked'
```

Observed output:

```text
startupDecision: no_executable_task
seedModule: ai-task-and-provider
seedCandidateTask: batch-105-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract
seedCandidateTask: batch-106-ai-task-and-provider-local-task-request-policy-and-result-referen
seedCandidateTask: batch-107-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence
seedCandidateTask: batch-108-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence
seedProposalDecision: proposal_available
runnerDecision: seed_proposal_available
runnerNextAction: request_auto_seed_approval
runnerNextTask: ai-task-and-provider
runnerStepCount: 1
stopTaxonomy: hard_block
reason: no executable task exists and a guarded seed proposal is available
Cost Calibration Gate remains blocked
```

Conclusion: the current sample is exactly the false-stop class. A guarded seed proposal exists, but `seed_proposal_available` falls through `Get-RunnerStopTaxonomy` to `hard_block`.

### `.\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly`

Command:

```powershell
.\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly |
  Select-String -Pattern 'cleanupMode:|stoppedAutomationHygieneCleanupCandidateCount:|cleanupActionCount:|deferredCleanupCount:|stoppedAutomationHygieneDecision:'
```

Observed output:

```text
cleanupMode: read_only
stoppedAutomationHygieneCleanupCandidateCount: 0
stoppedAutomationHygieneCleanupActionCount: 0
stoppedAutomationHygieneDeferredCleanupCount: 0
stoppedAutomationHygieneDecision: clean
```

Conclusion: stopped automation hygiene is clean. The current stop is not caused by stale cleanup debris.

## Source Review Findings

### Runner taxonomy

`scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1` has `Get-RunnerStopTaxonomy` mappings for `no_executable_task`, `exit_active_owner_present`, `cleanup_available`, `stop_for_manual_decision`, `manual_required_owner_recovery`, and `closeout_recovery`.

It does not map `seed_proposal_available`, so that decision falls through to:

```text
default { return "hard_block" }
```

This is the immediate cause of the observed `seed_proposal_available -> request_auto_seed_approval -> hard_block` output.

### Next action diagnostic noise

`scripts/agent-system/Get-TikuNextAction.ps1` always emits:

- `blockedGates`
- `statusFindings: legacy_done=94`
- `evidenceFindings: evidenceMissing=6`
- `diagnosticOnly: true`

These facts are useful for audit context, but when `currentTask` is closed, queue has no pending task, and `stopReason: none`, they should default to summary-level context rather than appearing as current blockers.

### Finalizer coverage

`scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.ps1` writes durable terminal facts such as `phase`, `blockerKind`, `stopTaxonomy`, `evidencePath`, `auditReviewPath`, `safeToAdopt`, `cleanupPolicy`, and `nextRecommendedAction`.

The current finalizer interface does not yet provide a standard terminal envelope with explicit `nextCommand`, `requiresHuman`, `riskIfContinued`, `stateWritten` / `noWriteReason`, and `resumePointer`.

### Standing approval and auto-seed

`docs/04-agent-system/state/project-state.yaml` records:

```text
standingUnattendedLocalCloseoutApproval:
  status: approved
  appliesTo:
    - auto-seeded implementation tasks with autoDriveLocalImplementationApproval
```

The runner supports explicit `-AllowAutoSeed` and `-AutoSeedApprovalStatement`, and the ACTIVE Codex automation prompt already includes those arguments. However, the runner script itself does not default-read `project-state.yaml` to inject the standing approval when those parameters are absent, and the PlanOnly sample still classifies the proposal path as `hard_block`.

### MECE decomposition gap

`docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md` defines the intended traceability chain:

```text
requirement source -> module -> task -> acceptance scenario -> validation evidence -> residual gap decision
```

`docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml` defines four `ai-task-and-provider` target closure items. They are directionally non-overlapping by target closure, but current seed self-review mostly checks metadata, scope, template, allowed/blocked files, approval anchors, and validation lifecycle. It does not prove full MECE traceability from requirement/source planning task to user role/use case, acceptance scenario, and validation evidence.

## Validation

Validation was run after report and evidence updates.

### `git diff --check`

Command:

```powershell
git diff --check
```

Result: passed with no output.

### Targeted Prettier check

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\05-execution-logs\task-plans\2026-06-11-module-run-v2-mechanic-deep-autodrive-audit.md docs\05-execution-logs\evidence\2026-06-11-module-run-v2-mechanic-deep-autodrive-audit.md docs\05-execution-logs\audits-reviews\2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md
```

Observed output:

```text
Checking formatting...
All matched files use Prettier code style!
```

### Targeted anchor check

Command:

```powershell
Select-String -Path docs\05-execution-logs\audits-reviews\2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md,docs\05-execution-logs\evidence\2026-06-11-module-run-v2-mechanic-deep-autodrive-audit.md -Pattern '二次深入审计发现','seed_proposal_available','hard_block','approval_required','auto_recoverable','standingUnattendedLocalCloseoutApproval','MECE','finalizer','nextCommand','Cost Calibration Gate remains blocked'
```

Result: passed. All required anchors were found.

### Final git inventory

```text
## codex/mechanism-serial-governance
 M docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md
?? docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-deep-autodrive-audit.md
?? docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-deep-autodrive-audit.md
```

## Closeout

Why stopped: the requested second-pass mechanism audit has been appended to the existing audit report, with separate task plan and evidence.

Risk if auto-continued: continuing into runner/SOP/schema repair would exceed this audit-only scope.

Next action: wait for a separate instruction to plan or implement mechanism repairs from the backlog.

State written by this closeout:

- Updated `docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`.
- Added `docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-deep-autodrive-audit.md`.
- Added `docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-deep-autodrive-audit.md`.

No stage, commit, merge, push, PR, deploy, provider call, env/secret write, dependency change, schema migration, seed apply, or Cost Calibration Gate action was performed.

Cost Calibration Gate remains blocked.
