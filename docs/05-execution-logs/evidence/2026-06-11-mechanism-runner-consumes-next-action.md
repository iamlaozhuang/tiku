# Mechanism Runner Consumes Next Action Evidence

## Task

- id: `mechanism-runner-consumes-next-action`
- branch: `codex/mechanism-serial-governance`
- result: pass
- closeout: local commit pending at evidence write time

## Scope Confirmation

Changed surfaces are limited to runner diagnostic preflight wiring, runner smoke assertions, automated advancement SOP text, task queue closeout status, project-state current task metadata, task plan, evidence, and audit review.

Blocked surfaces remain untouched: product code, tests, e2e, dependencies, lockfiles, schema, migrations, env/secret, provider calls, deployment, PR, force push, and Cost Calibration Gate.

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

### Runner Smoke

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
```

Output:

```text
Module Run v2 autopilot runner smoke passed
```

Runner smoke now asserts that runner output includes:

- `nextActionDecision`
- `diagnosticOnly: true`

### Runner Plan-Only

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck
```

Output excerpt:

```text
== Runner Step 1 Next Action Diagnostic ==
repository: branch=codex/mechanism-serial-governance; head=36fc440d; dirty=true
currentTask: mechanism-runner-consumes-next-action(closed)
queueDecision: no_pending_task
nextActionDecision: no_pending_task
nextExecutableTask: none
blockedGates: dependency_change:blocked_without_approval; env_secret:blocked_without_approval; provider_call:blocked_without_task_approval; schema_migration:blocked_without_task_approval; deploy:blocked_without_approval; push_pr_force_push:blocked_without_fresh_approval; Cost Calibration Gate remains blocked
validationNeeded: none
statusFindings: legacy_status_missing=0; legacy_done=94; unsupportedStatus=0; legacy_status_missing_first=none; legacy_done_first=phase-1-api-contract-baseline,phase-1-design-token-baseline,phase-1-env-logging-baseline,phase-2-user-auth-planning,phase-2-auth-schema-and-permission-model-approval
evidenceFindings: evidenceMissing=6; evidenceMissingFirst=phase-1-api-contract-baseline,phase-1-design-token-baseline,phase-1-env-logging-baseline,phase-2-user-auth-planning,phase-2-auth-schema-and-permission-model-approval
driftFindings: queueMatrixDrift=matrixBatchMissingInQueue:0,sourcePlanningTaskMissingInQueue:0; queueMatrixDriftFirst=none
recommendedAction: idle_no_pending_task
stopReason: none
diagnosticOnly: true
Cost Calibration Gate remains blocked

== Runner Step 1 Startup ==
startupDecision: no_executable_task
seedProposalDecision: proposal_available
runnerDecision: seed_proposal_available
runnerNextAction: request_auto_seed_approval
runnerNextTask: ai-task-and-provider
Cost Calibration Gate remains blocked
```

Interpretation: the runner now emits the unified diagnostic before startup, then continues through existing startup and seed-proposal gates. The diagnostic does not bypass startup or approve auto-seeding.

### Diff Check

Command:

```powershell
git diff --check
```

Output: pass, no whitespace errors.

## Required Anchors

- Get-TikuNextAction
- nextActionDecision
- diagnosticOnly
- authorization
- paper
- mock_exam
- redeem_code
- audit_log
- ai_call_log
- Cost Calibration Gate remains blocked

## Closeout Notes

- The runner preflight is diagnostic-only.
- Startup readiness remains authoritative.
- `-SkipPrimaryRepositoryPostureCheck` is explicit and used only for dirty in-flight validation; default runner behavior keeps the posture check enabled.
- Remote push remains unapproved for this serial task group.
