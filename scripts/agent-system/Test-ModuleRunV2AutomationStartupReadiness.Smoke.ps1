$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`nActual output:`n$($Output -join "`n")"
    }
}

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedPattern
    )

    $output = @()
    $failed = $false
    try {
        $output = @(& $Command 2>&1)
    } catch {
        $failed = $true
        $output += $_.Exception.Message
    }

    if (-not $failed -and $LASTEXITCODE -eq 0) {
        throw "Expected command to fail with pattern: $ExpectedPattern"
    }

    Assert-Contains -Output $output -Pattern $ExpectedPattern
}

function Write-FixtureState {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$CurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$RemoteAutomationApproval,
        [Parameter(Mandatory = $false)][switch]$IncludePendingTask,
        [Parameter(Mandatory = $false)][switch]$IncludeStaleStateWarnings
    )

    $actualMasterSha = ((& git rev-parse master) -join "").Trim()
    $actualOriginMasterSha = ((& git rev-parse origin/master) -join "").Trim()
    $stateMasterSha = $actualMasterSha
    $stateOriginMasterSha = $actualOriginMasterSha
    $currentTaskCommitSha = $actualMasterSha
    if ($IncludeStaleStateWarnings) {
        $stateMasterSha = ((& git rev-parse "$actualMasterSha~1") -join "").Trim()
        $stateOriginMasterSha = ((& git rev-parse "$actualOriginMasterSha~1") -join "").Trim()
        $currentTaskCommitSha = "pending-local-commit"
    }

    @"
schemaVersion: 1
automation:
  unattendedControl:
    remoteAutomationApproval: $RemoteAutomationApproval
repository:
  shaSemantics: accepted_ancestor_checkpoint
  lastKnownMasterSha: $stateMasterSha
  lastKnownOriginMasterSha: $stateOriginMasterSha
currentTask:
  id: module-run-v2-autopilot-maturity-hardening
  commitSha: $currentTaskCommitSha
"@ | Set-Content -LiteralPath $ProjectStatePath -Encoding UTF8

    $pendingBlock = ""
    if ($IncludePendingTask) {
        $pendingBlock = @"
  - id: module-run-v2-ai-task-and-provider-planning
    status: pending
    taskKind: implementation_planning
    allowedFiles:
      - docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
    blockedFiles:
      - src/**
    riskTypes:
      - queue_planning
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
"@
    }

    @"
schemaVersion: 1
tasks:
  - id: module-run-v2-autopilot-maturity-hardening
    status: $CurrentTaskStatus
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.ps1
    blockedFiles:
      - src/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-autopilot-maturity-hardening.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-autopilot-maturity-hardening.md
$pendingBlock
"@ | Set-Content -LiteralPath $QueuePath -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2AutomationStartupReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing automation startup readiness script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-automation-startup-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $fixtureRoot -ChildPath "matrix.yaml"
    @"
schemaVersion: 2
moduleRunVersion: 2
automationHandoffPolicy:
  startupReadiness: required
threadRolloverGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "in_progress" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning"
    $continueOutput = @(
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -AllowProtectedBranch `
            -SkipLeaseCheck `
            -SkipWorktreeHygieneCheck
    )
    Assert-Contains -Output $continueOutput -Pattern "startupDecision: continue_current_task"
    Assert-Contains -Output $continueOutput -Pattern "localToolingReadiness:"

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning" -IncludePendingTask -IncludeStaleStateWarnings
    $pendingOutput = @(
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -AllowProtectedBranch `
            -SkipLeaseCheck `
            -SkipWorktreeHygieneCheck
    )
    Assert-Contains -Output $pendingOutput -Pattern "startupDecision: prepare_next_task"
    Assert-Contains -Output $pendingOutput -Pattern "startupStateWarning: lastKnownMasterSha is an accepted ancestor of master"
    Assert-Contains -Output $pendingOutput -Pattern "startupStateWarning: currentTask.commitSha is a placeholder"
    Assert-Contains -Output $pendingOutput -Pattern "startupStateCheckpoint: accepted_ancestor_checkpoint"

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning"
    $closeoutOutput = @(
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -AllowProtectedBranch `
            -SkipLeaseCheck `
            -SkipWorktreeHygieneCheck
    )
    Assert-Contains -Output $closeoutOutput -Pattern "startupDecision: no_executable_task"

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "not_granted"
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_AUTOMATION_APPROVAL_NOT_GRANTED" -Command {
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -AllowProtectedBranch `
            -SkipLeaseCheck `
            -SkipWorktreeHygieneCheck
    }

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "in_progress" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning"
    $activeLeasePath = Join-Path -Path $fixtureRoot -ChildPath "active-lease.json"
    $fixtureWorktree = Join-Path -Path $fixtureRoot -ChildPath "lease-worktree"
    New-Item -ItemType Directory -Path $fixtureWorktree | Out-Null
    @"
{
  "runId": "run-active",
  "taskId": "module-run-v2-autopilot-maturity-hardening",
  "owner": "codex-automation",
  "worktreePath": "$($fixtureWorktree.Replace("\", "\\"))",
  "expiresAtUtc": "2999-06-08T20:30:00Z"
}
"@ | Set-Content -LiteralPath $activeLeasePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "startupDecision: stop_existing_run_active" -Command {
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -LeasePath $activeLeasePath `
            -AllowProtectedBranch `
            -SkipWorktreeHygieneCheck
    }

    $parkingRepo = Join-Path -Path $fixtureRoot -ChildPath "startup-repo"
    $startupWorktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "startup-worktrees"
    New-Item -ItemType Directory -Path $parkingRepo, $startupWorktreeRoot | Out-Null
    & git -C $parkingRepo init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize startup fixture repository."
    }
    Set-Content -LiteralPath (Join-Path -Path $parkingRepo -ChildPath "README.md") -Value "startup baseline" -Encoding UTF8
    & git -C $parkingRepo add README.md | Out-Null
    & git -C $parkingRepo -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "startup baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit startup fixture baseline."
    }
    $staleWorktreePath = Join-Path -Path $startupWorktreeRoot -ChildPath "stale-clean"
    & git -C $parkingRepo worktree add -b codex/stale-clean-smoke $staleWorktreePath HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create startup fixture stale worktree."
    }
    Set-Content -LiteralPath (Join-Path -Path $parkingRepo -ChildPath "README.md") -Value "startup advanced" -Encoding UTF8
    & git -C $parkingRepo add README.md | Out-Null
    & git -C $parkingRepo -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "startup advanced" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to advance startup fixture master."
    }
    $startupOriginMasterSha = ((& git -C $parkingRepo rev-parse HEAD) -join "").Trim()
    & git -C $parkingRepo update-ref refs/remotes/origin/master $startupOriginMasterSha
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create startup fixture origin/master ref."
    }
    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning" -IncludePendingTask
    Push-Location $parkingRepo
    try {
        $recoverableWorktreeOutput = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath `
                -AutomationWorktreeRoot $startupWorktreeRoot `
                -AllowProtectedBranch `
                -SkipLeaseCheck
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $recoverableWorktreeOutput -Pattern "RECOVERABLE_AUTOMATION_WORKTREE_STALE_CLEAN"
    Assert-Contains -Output $recoverableWorktreeOutput -Pattern "recoverableAutomationWorktreeCount: 1"
    Assert-Contains -Output $recoverableWorktreeOutput -Pattern "startupDecision: cleanup_stale_artifacts"

    $seedRepo = Join-Path -Path $fixtureRoot -ChildPath "seed-recovery-repo"
    $seedWorktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "seed-recovery-worktrees"
    New-Item -ItemType Directory -Path $seedRepo, $seedWorktreeRoot | Out-Null
    & git -C $seedRepo init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize seed recovery startup fixture repository."
    }
    New-Item -ItemType Directory -Path (Join-Path -Path $seedRepo -ChildPath "docs\04-agent-system\state") | Out-Null
    @"
schemaVersion: 1
currentTask:
  id: closed-current
"@ | Set-Content -LiteralPath (Join-Path -Path $seedRepo -ChildPath "docs\04-agent-system\state\project-state.yaml") -Encoding UTF8
    @"
schemaVersion: 1
tasks:
  - id: closed-current
    status: closed
    taskKind: automation_activation
"@ | Set-Content -LiteralPath (Join-Path -Path $seedRepo -ChildPath "docs\04-agent-system\state\task-queue.yaml") -Encoding UTF8
    @"
schemaVersion: 2
moduleRunVersion: 2
mode:
  firstEligibleImplementationBatchNumber: 101
sourcePlanningModules:
  - module: authorization-context
    sourcePlanningTask: closed-current
    v2ExecutionModule: authorization-and-access
executionModules:
  - module: authorization-and-access
    sourceModules:
      - authorization-context
    localFullLoopMinimum: L4
    targetLocalClosure:
      - authorization read-model and display contracts
      - personal_auth and org_auth local summaries
implementationAutoSeedGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath (Join-Path -Path $seedRepo -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml") -Encoding UTF8
    & git -C $seedRepo add docs | Out-Null
    & git -C $seedRepo -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "seed recovery startup baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit seed recovery startup baseline."
    }
    $seedOriginMasterSha = ((& git -C $seedRepo rev-parse HEAD) -join "").Trim()
    & git -C $seedRepo update-ref refs/remotes/origin/master $seedOriginMasterSha
    $seedDirtyPath = Join-Path -Path $seedWorktreeRoot -ChildPath "seed-dirty"
    & git -C $seedRepo worktree add --detach $seedDirtyPath HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create seed recovery dirty worktree."
    }
    $seedTransactionScript = Join-Path -Path $PSScriptRoot -ChildPath "New-ModuleRunV2ImplementationSeed.ps1"
    & $seedTransactionScript `
        -Apply `
        -ProjectStatePath (Join-Path -Path $seedDirtyPath -ChildPath "docs\04-agent-system\state\project-state.yaml") `
        -QueuePath (Join-Path -Path $seedDirtyPath -ChildPath "docs\04-agent-system\state\task-queue.yaml") `
        -MatrixPath (Join-Path -Path $seedDirtyPath -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml") `
        -ApprovalStatement "autoDriveLocalImplementationApproval: startup smoke approval" `
        -SeedEvidencePath (Join-Path -Path $seedDirtyPath -ChildPath "docs\05-execution-logs\evidence\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md") `
        -SeedAuditReviewPath (Join-Path -Path $seedDirtyPath -ChildPath "docs\05-execution-logs\audits-reviews\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md") | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create seed recovery startup transaction."
    }
    & git -C $seedDirtyPath add docs | Out-Null
    Push-Location $seedRepo
    try {
        Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning" -IncludePendingTask
        $seedRecoveryStartupOutput = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath (Join-Path -Path $seedDirtyPath -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml") `
                -AutomationWorktreeRoot $seedWorktreeRoot `
                -AllowProtectedBranch `
                -SkipLeaseCheck
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $seedRecoveryStartupOutput -Pattern "seedRecoveryDecision: recoverable_seed_transaction"
    Assert-Contains -Output $seedRecoveryStartupOutput -Pattern "RECOVERABLE_SEED_TRANSACTION_WORKTREE"
    Assert-Contains -Output $seedRecoveryStartupOutput -Pattern "startupDecision: adopt_recoverable_run"

    $handoffRoot = Join-Path -Path $fixtureRoot -ChildPath "handoffs"
    $runRegistryRoot = Join-Path -Path $fixtureRoot -ChildPath "runs"
    New-Item -ItemType Directory -Path $handoffRoot, $runRegistryRoot | Out-Null

    $dirtyRepo = Join-Path -Path $fixtureRoot -ChildPath "dirty-owner-repo"
    $dirtyWorktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "dirty-owner-worktrees"
    New-Item -ItemType Directory -Path $dirtyRepo, $dirtyWorktreeRoot | Out-Null
    & git -C $dirtyRepo init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize dirty owner fixture repository."
    }
    Set-Content -LiteralPath (Join-Path -Path $dirtyRepo -ChildPath "README.md") -Value "dirty baseline" -Encoding UTF8
    & git -C $dirtyRepo add README.md | Out-Null
    & git -C $dirtyRepo -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "dirty baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit dirty owner fixture baseline."
    }
    $dirtyOriginSha = ((& git -C $dirtyRepo rev-parse HEAD) -join "").Trim()
    & git -C $dirtyRepo update-ref refs/remotes/origin/master $dirtyOriginSha
    $dirtyOwnerPath = Join-Path -Path $dirtyWorktreeRoot -ChildPath "dirty-owner"
    & git -C $dirtyRepo worktree add -b codex/dirty-owner-smoke $dirtyOwnerPath HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create dirty owner fixture worktree."
    }
    Set-Content -LiteralPath (Join-Path -Path $dirtyOwnerPath -ChildPath "handoff.txt") -Value "dirty handoff" -Encoding UTF8
    Push-Location $dirtyRepo
    try {
        Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning" -IncludePendingTask

        $activeRunPath = Join-Path -Path $runRegistryRoot -ChildPath "active-run.json"
        @"
{
  "runId": "active-run",
  "automationId": "tiku-module-run-v2-autopilot",
  "threadRole": "interactive",
  "taskId": "module-run-v2-automation-handoff-contract-hardening",
  "branch": "codex/dirty-owner-smoke",
  "worktreePath": "$($dirtyOwnerPath.Replace("\", "\\"))",
  "status": "active",
  "heartbeatAtUtc": "2999-06-09T00:00:00Z",
  "phase": "editing",
  "changedFiles": ["handoff.txt"],
  "lastSafeCheckpoint": "before validation",
  "nextRecommendedAction": "wait for active owner",
  "safeToAdopt": false,
  "cleanupPolicy": "none",
  "redactedHandoffPath": null
}
"@ | Set-Content -LiteralPath $activeRunPath -Encoding UTF8

        Invoke-ExpectFailure -ExpectedPattern "startupDecision: exit_active_owner_present" -Command {
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath `
                -AutomationWorktreeRoot $dirtyWorktreeRoot `
                -RunRegistryRoot $runRegistryRoot `
                -AllowProtectedBranch `
                -SkipLeaseCheck
        }

        $adoptHandoffPath = Join-Path -Path $handoffRoot -ChildPath "adoptable.md"
        Set-Content -LiteralPath $adoptHandoffPath -Value "task:`nstatus: stopped`nadoption allowed: yes" -Encoding UTF8
        @"
{
  "runId": "adoptable-run",
  "automationId": "tiku-module-run-v2-autopilot",
  "threadRole": "recovery",
  "taskId": "module-run-v2-automation-handoff-contract-hardening",
  "branch": "codex/dirty-owner-smoke",
  "worktreePath": "$($dirtyOwnerPath.Replace("\", "\\"))",
  "status": "recoverable",
  "heartbeatAtUtc": "2026-06-09T00:00:00Z",
  "phase": "handoff",
  "changedFiles": ["handoff.txt"],
  "lastSafeCheckpoint": "redacted handoff written",
  "nextRecommendedAction": "adopt recoverable run",
  "safeToAdopt": true,
  "cleanupPolicy": "none",
  "redactedHandoffPath": "$($adoptHandoffPath.Replace("\", "\\"))"
}
"@ | Set-Content -LiteralPath $activeRunPath -Encoding UTF8

        $adoptOutput = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath `
                -AutomationWorktreeRoot $dirtyWorktreeRoot `
                -RunRegistryRoot $runRegistryRoot `
                -AllowProtectedBranch `
                -SkipLeaseCheck
        )
        Assert-Contains -Output $adoptOutput -Pattern "startupDecision: adopt_recoverable_run"
        Assert-Contains -Output $adoptOutput -Pattern "redactedHandoffPath:"

        Remove-Item -LiteralPath $activeRunPath -Force
        Invoke-ExpectFailure -ExpectedPattern "startupDecision: stop_for_manual_decision" -Command {
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath `
                -AutomationWorktreeRoot $dirtyWorktreeRoot `
                -RunRegistryRoot $runRegistryRoot `
                -AllowProtectedBranch `
                -SkipLeaseCheck
        }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 automation startup readiness smoke passed"
