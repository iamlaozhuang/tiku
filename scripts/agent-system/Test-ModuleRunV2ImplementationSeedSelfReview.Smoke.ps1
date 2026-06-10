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

function Write-Matrix {
    param([Parameter(Mandatory = $true)][string]$Path)

    @"
schemaVersion: 2
executionModules:
  - module: authorization-and-access
    sourceModules:
      - authorization-context
    localFullLoopMinimum: L4
    targetLocalClosure:
      - authorization read-model and display contracts
implementationAutoSeedGate:
  enabled: true
localExperienceClosureGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-Queue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $false)][switch]$UnsafeAllowedFile
    )

    $allowedFile = "src/server/services/**"
    if ($UnsafeAllowedFile) {
        $allowedFile = "package.json"
    }

    @"
schemaVersion: 1
tasks:
  - id: batch-101-authorization-and-access-authorization-read-model
    status: pending
    taskKind: implementation
    humanApproval: autoDriveLocalImplementationApproval smoke approval
    autoDriveLocalImplementationApproval: smoke approval
    seededImplementationTask: true
    seededExecutionModule: authorization-and-access
    targetClosureItem: authorization read-model and display contracts
    localExperienceClosureGate: planned
    localFullLoopGate: L4
    blockedRemainder: high-risk work remains separately gated
    allowedFiles:
      - $allowedFile
      - docs/05-execution-logs/evidence/**
    blockedFiles:
      - .env.local
      - .env.example
      - package.json
      - pnpm-lock.yaml
      - package-lock.yaml
      - package-lock.json
      - src/db/schema/**
      - drizzle/**
    riskTypes:
      - local_implementation
      - evidence_redaction
    validationCommandLifecycle:
      - phase: pre_edit
        command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-101-authorization-and-access-authorization-read-model
      - phase: post_edit
        command: npm.cmd run lint
      - phase: post_edit
        command: npm.cmd run typecheck
      - phase: post_edit
        command: git diff --check
      - phase: advisory_baseline
        command: npm.cmd run test -- --run focused # focused test anchor
      - phase: closeout
        command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-101-authorization-and-access-authorization-read-model
    validationCommands:
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-101-authorization-and-access-authorization-read-model
      - npm.cmd run lint
      - npm.cmd run typecheck
      - npm.cmd run test -- --run focused # focused test anchor
      - git diff --check
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-101-authorization-and-access-authorization-read-model
    registryLifecycle:
      redactionRequired: true
    evidencePath: docs/05-execution-logs/evidence/batch-101-authorization-and-access-authorization-read-model.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/batch-101-authorization-and-access-authorization-read-model.md
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ImplementationSeedSelfReview.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing seed self-review script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-seed-self-review-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
try {
    $matrixPath = Join-Path -Path $fixtureRoot -ChildPath "matrix.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    Write-Matrix -Path $matrixPath
    Write-Queue -Path $queuePath

    $passOutput = @(
        & $scriptPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    )
    Assert-Contains -Output $passOutput -Pattern "seedSelfReviewDecision: passed"

    Write-Queue -Path $queuePath -UnsafeAllowedFile
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SEEDED_TASK_ALLOWED_HIGH_RISK_FILE" -Command {
        & $scriptPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 implementation seed self-review smoke passed"
