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
        [Parameter(Mandatory = $false)][switch]$IncludePendingTask
    )

    @"
schemaVersion: 1
automation:
  unattendedControl:
    remoteAutomationApproval: $RemoteAutomationApproval
currentTask:
  id: module-run-v2-autopilot-maturity-hardening
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
            -SkipLeaseCheck `
            -SkipWorktreeHygieneCheck
    )
    Assert-Contains -Output $continueOutput -Pattern "startupDecision: continue_current_task"

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning" -IncludePendingTask
    $pendingOutput = @(
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -SkipLeaseCheck `
            -SkipWorktreeHygieneCheck
    )
    Assert-Contains -Output $pendingOutput -Pattern "startupDecision: prepare_next_task"

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "lease_guarded_local_readiness_and_planning"
    $closeoutOutput = @(
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -SkipLeaseCheck `
            -SkipWorktreeHygieneCheck
    )
    Assert-Contains -Output $closeoutOutput -Pattern "startupDecision: closeout_recovery"

    Write-FixtureState -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentTaskStatus "done" -RemoteAutomationApproval "not_granted"
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_AUTOMATION_APPROVAL_NOT_GRANTED" -Command {
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
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
            -SkipWorktreeHygieneCheck
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 automation startup readiness smoke passed"
