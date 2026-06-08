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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2UnattendedReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing unattended readiness script: $scriptPath"
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
$isProtectedBranch = $currentBranch -eq "master" -or $currentBranch -eq "main"

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-unattended-readiness-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $taskId = "module-run-v2-unattended-readiness-smoke"
    $blockedTaskId = "module-run-v2-unattended-readiness-blocked-risk"
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $masterSha = ((& git rev-parse master) -join "").Trim()
    $originMasterSha = ((& git rev-parse origin/master) -join "").Trim()

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $masterSha
  lastKnownOriginMasterSha: $originMasterSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: $taskId
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    blockedFiles:
      - .env.local
      - package.json
      - src/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
  - id: $blockedTaskId
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - provider
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    if ($isProtectedBranch) {
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PROTECTED_BRANCH $currentBranch" -Command {
            & $scriptPath `
                -TaskId $taskId `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" `
                -SkipRemoteAheadCheck
        }
    } else {
        $passOutput = @(
            & $scriptPath `
                -TaskId $taskId `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" `
                -SkipRemoteAheadCheck
        )
        Assert-Contains -Output $passOutput -Pattern "Module Run v2 Unattended Readiness"
        Assert-Contains -Output $passOutput -Pattern "unattendedReadinessMode: hard_block"
        Assert-Contains -Output $passOutput -Pattern "unattendedStopDecision: continue"
        Assert-Contains -Output $passOutput -Pattern "Cost Calibration Gate remains blocked"
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PROTECTED_BRANCH master" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentBranchOverride "master" -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -SkipRemoteAheadCheck
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_REMOTE_AHEAD" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -RemoteAheadCountOverride 1
    }

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: stale-master-sha
  lastKnownOriginMasterSha: stale-origin-sha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_REPOSITORY_SHA_DRIFT" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -SkipRemoteAheadCheck
    }

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $masterSha
  lastKnownOriginMasterSha: $originMasterSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_OUT_OF_SCOPE" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "README.md" -SkipRemoteAheadCheck
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles ".env.local" -SkipRemoteAheadCheck
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_RISK_GATE provider" -Command {
        & $scriptPath -TaskId $blockedTaskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -SkipRemoteAheadCheck
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 unattended readiness smoke passed"
