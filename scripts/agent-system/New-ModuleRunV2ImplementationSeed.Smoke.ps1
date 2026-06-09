$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`nActual output:`n$($Output -join "`n")"
    }
}

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern
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

function Write-FixtureFiles {
    param([Parameter(Mandatory = $true)][string]$Root)

    New-Item -ItemType Directory -Path $Root -Force | Out-Null
    $projectStatePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $Root -ChildPath "matrix.yaml"

    @"
schemaVersion: 1
currentTask:
  id: closed-current
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: closed-current
    status: closed
    taskKind: implementation
    evidencePath: docs/05-execution-logs/evidence/closed-current.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/closed-current.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 2
mode:
  firstEligibleImplementationBatchNumber: 101
sourcePlanningModules:
  - module: authorization-context
    sourcePlanningTask: phase-69-advanced-authorization-context-implementation-planning
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
localExperienceClosureGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    return [pscustomobject]@{
        ProjectStatePath = $projectStatePath
        QueuePath        = $queuePath
        MatrixPath       = $matrixPath
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "New-ModuleRunV2ImplementationSeed.ps1"
$selfReviewPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ImplementationSeedSelfReview.ps1"
foreach ($requiredScript in @($scriptPath, $selfReviewPath)) {
    if (-not (Test-Path -LiteralPath $requiredScript)) {
        throw "Missing seed transaction smoke dependency: $requiredScript"
    }
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-seed-transaction-" + [guid]::NewGuid().ToString("N"))
try {
    $fixture = Write-FixtureFiles -Root $fixtureRoot
    $planOnlyOutput = @(
        & $scriptPath `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $planOnlyOutput -Pattern "seedTransactionDecision: plan_only"
    $queueBeforeApply = Get-Content -LiteralPath $fixture.QueuePath -Raw
    if ($queueBeforeApply -match "seededImplementationTask") {
        throw "Plan-only seed transaction unexpectedly wrote queue entries."
    }

    Invoke-ExpectFailure -ExpectedPattern "seedTransactionDecision: manual_required" -Command {
        & $scriptPath `
            -Apply `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath `
            -ApprovalStatement "generic approval without required anchor"
    }

    $applyOutput = @(
        & $scriptPath `
            -Apply `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath `
            -ApprovalStatement "autoDriveLocalImplementationApproval: smoke-approved low-risk local implementation seed"
    )
    Assert-Contains -Output $applyOutput -Pattern "seedTransactionDecision: seeded"
    Assert-Contains -Output $applyOutput -Pattern "seededTaskCount: 2"

    $queueAfterApply = Get-Content -LiteralPath $fixture.QueuePath -Raw
    if ($queueAfterApply -notmatch "seededImplementationTask:\s*true" -or $queueAfterApply -notmatch "status:\s*pending") {
        throw "Applied seed transaction did not write pending seeded tasks."
    }

    $selfReviewOutput = @(
        & $selfReviewPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $selfReviewOutput -Pattern "seedSelfReviewDecision: passed"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 implementation seed transaction smoke passed"
