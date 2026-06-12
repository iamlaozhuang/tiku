# Module Run v2 Automation Startup Archive Dependency Repair Evidence

result: pass

## Summary

The mechanism repair keeps primary automation paused while adding archived terminal dependency support for startup, next-action selection, serial claim readiness, and implementation auto-seed readiness. It also keeps implementation auto-seed readiness lifecycle-aware so newly seeded implementation tasks can keep focused test anchors in `validationCommandLifecycle.advisory_baseline`.

## Evidence Anchors

- Batch range: mechanism repair for the `batch-115` startup path, without changing `batch-115` through `batch-118` task semantics.
- RED: added archived dependency fixtures failed before implementation because `TaskHistoryIndexPath` and terminal archived dependency resolution were not supported by `Get-TikuNextAction.ps1`, `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1`, and `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`.
- GREEN: smoke fixtures and real repository read-only startup checks pass; registration is ready while primary automation remains `PAUSED`; runner selects `batch-115`; serial claim dry-run returns `ready_to_claim`; direct `phase-69 -> batch-115` auto-seed readiness passes.
- Commit: `048a6857e683df9fdd840d3aa71d5e6664869cc8` baseline for this repair; final repair commit is produced after closeout gates.
- localFullLoopGate: mechanism-only local repair; no e2e, provider call, schema migration, dependency change, deployment, PR, or force push.
- threadRolloverGate: continue_current_thread.
- nextModuleRunCandidate: `batch-115-authorization-and-access-authorization-read-model-and-display-contrac`.
- blocked remainder: primary automation remains PAUSED; `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-autopilot-2`, and `mechanic-2` are not activated; high-risk gates remain separately blocked.
- Cost Calibration Gate remains blocked.

## RED Results

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1` failed before implementation with missing `TaskHistoryIndexPath` support.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1` failed before implementation with missing `TaskHistoryIndexPath` support.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.Smoke.ps1` failed before implementation with missing `TaskHistoryIndexPath` support.
- Direct `phase-69 -> batch-115` readiness exposed `HARD_BLOCK_CANDIDATE_MISSING_FOCUSED_TEST` until `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` started reading `validationCommandLifecycle` alongside legacy `validationCommands`.

## GREEN Results

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.Smoke.ps1` passed with `registrationReadinessSmoke: passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1` passed with archived dependency fixture and `Tiku next-action diagnostic smoke passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1` passed with archived dependency claim fixture and `Module Run v2 serial autodrive executor smoke passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.Smoke.ps1` passed with archived source planning fixture, non-terminal archived source regression guard, lifecycle focused-test fixture, and `Module Run v2 implementation auto-seed readiness smoke passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-115-authorization-and-access-authorization-read-model-and-display-contrac` passed with `implementation auto-seed readiness passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1` passed with `automationRegistrationDecision: ready`, `projectCodexAutomationStatus: PAUSED`, `tomlAutomationStatus: PAUSED`, and `activeAutomationRegistrationCount: 0`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 3 -AllowAutoSeed -PlanOnly -AllowProtectedBranch` passed with `runnerDecision: prepare_next_task`, `runnerNextTask: batch-115-authorization-and-access-authorization-read-model-and-display-contrac`, and `safeToProceed: true`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.ps1 -AgentActionOverride claim_task -AgentActionTaskOverride batch-115-authorization-and-access-authorization-read-model-and-display-contrac -AllowProtectedBranch` passed with `serialExecutorDecision: ready_to_claim`.

## Validation Results

- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown ...` passed; scoped Prettier check reports all matched files use Prettier style.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-115-authorization-and-access-authorization-read-model-and-display-contrac` passed; lifecycle focused-test anchor is recognized.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `git diff --check` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` passed; inventory completed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-automation-startup-archive-dependency-repair` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-automation-startup-archive-dependency-repair` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-automation-startup-archive-dependency-repair` passed.
