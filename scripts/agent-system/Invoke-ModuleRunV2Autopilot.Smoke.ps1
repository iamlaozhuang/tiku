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
        throw "Expected output pattern not found: $Pattern"
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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2Autopilot.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing autopilot orchestrator script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autopilot-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $handoffPath = Join-Path -Path $fixtureRoot -ChildPath "handoff.md"

    $continueOutput = @(& $scriptPath -CompletedBatchCount 2 -SkipUnattendedReadiness -HandoffPath $handoffPath)
    Assert-Contains -Output $continueOutput -Pattern "autopilotDecision: continue_current_thread"

    $suggestOutput = @(& $scriptPath -CompletedBatchCount 4 -SkipUnattendedReadiness -HandoffPath $handoffPath)
    Assert-Contains -Output $suggestOutput -Pattern "autopilotDecision: prepare_handoff_then_continue"
    Assert-Contains -Output $suggestOutput -Pattern "nextModuleRunCandidate: ai-task-and-provider"

    Invoke-ExpectFailure -ExpectedPattern "autopilotDecision: stop_for_human_handoff" -Command {
        & $scriptPath -CompletedBatchCount 6 -SkipUnattendedReadiness -HandoffPath $handoffPath
    }

    $launchOutput = @(& $scriptPath -CompletedBatchCount 6 -SkipUnattendedReadiness -HandoffPath $handoffPath -ThreadLaunchApproved -ThreadToolAvailable)
    Assert-Contains -Output $launchOutput -Pattern "autopilotDecision: launch_new_thread"
    Assert-Contains -Output $launchOutput -Pattern "handoffPath:"
    Assert-Contains -Output $launchOutput -Pattern "Cost Calibration Gate remains blocked"

    $taskId = "module-run-v2-autopilot-closeout-recovery-smoke"
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $ancestorSha = ((& git rev-parse origin/master~1) -join "").Trim()

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $ancestorSha
  lastKnownOriginMasterSha: $ancestorSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: $taskId
    status: done
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-autopilot-orchestration-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-autopilot-orchestration-control.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $closeoutRecoveryOutput = @(
        & $scriptPath `
            -TaskId $taskId `
            -CompletedBatchCount 6 `
            -CloseoutRecovery `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -ReadinessChangedFiles "scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1" `
            -AllowProtectedBranch `
            -HandoffPath $handoffPath `
            -ThreadLaunchApproved `
            -ThreadToolAvailable
    )
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "autopilotDecision: launch_new_thread"
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "nextModuleRunCandidate: ai-task-and-provider"

    $cleanWorktreePath = Join-Path -Path $fixtureRoot -ChildPath "clean-autopilot-worktree"
    try {
        & git worktree add --detach $cleanWorktreePath HEAD | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create clean autopilot smoke worktree."
        }

        Push-Location -LiteralPath $cleanWorktreePath
        try {
            $cleanDryRunCloseoutOutput = @(
                & $scriptPath `
                    -TaskId $taskId `
                    -CompletedBatchCount 6 `
                    -CloseoutRecovery `
                    -ProjectStatePath $projectStatePath `
                    -QueuePath $queuePath `
                    -HandoffPath $handoffPath `
                    -DryRunHandoff `
                    -ThreadLaunchApproved `
                    -ThreadToolAvailable
            )
        } finally {
            Pop-Location
        }
    } finally {
        if (Test-Path -LiteralPath $cleanWorktreePath) {
            & git worktree remove -f $cleanWorktreePath | Out-Null
        }
    }
    Assert-Contains -Output $cleanDryRunCloseoutOutput -Pattern "dryRunHandoff: enabled"
    Assert-Contains -Output $cleanDryRunCloseoutOutput -Pattern "autopilotDecision: launch_new_thread"

    $repoHandoffPath = Join-Path -Path $fixtureRoot -ChildPath "repo-handoff.md"
    $dryRunLaunchOutput = @(
        & $scriptPath `
            -CompletedBatchCount 6 `
            -SkipUnattendedReadiness `
            -HandoffPath $repoHandoffPath `
            -DryRunHandoff `
            -ThreadLaunchApproved `
            -ThreadToolAvailable
    )
    Assert-Contains -Output $dryRunLaunchOutput -Pattern "autopilotDecision: launch_new_thread"
    Assert-Contains -Output $dryRunLaunchOutput -Pattern "dryRunHandoff: enabled"
    if (Test-Path -LiteralPath $repoHandoffPath) {
        throw "Dry-run autopilot handoff must not write the requested repository handoff path."
    }

} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 autopilot smoke passed"
