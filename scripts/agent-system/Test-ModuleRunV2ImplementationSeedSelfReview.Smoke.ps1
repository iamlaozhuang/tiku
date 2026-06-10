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
        [Parameter(Mandatory = $false)][switch]$UnsafeAllowedFile,
        [Parameter(Mandatory = $false)][switch]$ApprovedCloseout,
        [Parameter(Mandatory = $false)][switch]$StandingApproval
    )

    $allowedFile = "src/server/services/**"
    if ($UnsafeAllowedFile) {
        $allowedFile = "package.json"
    }
    $approvalText = "autoDriveLocalImplementationApproval smoke approval"
    $autoDriveApprovalText = "smoke approval"
    if ($StandingApproval) {
        $approvalText = "standingUnattendedLocalCloseoutApproval: User approves Module Run v2 unattended local autodrive for low-risk local implementation tasks only, including local commit, fast-forward merge to master, push origin/master, merged short-branch cleanup, and worktree parking. High-risk capability gates remain blocked unless separately approved. autoDriveLocalImplementationApproval smoke approval"
        $autoDriveApprovalText = $approvalText
    }
    $localCommitApproval = if ($ApprovedCloseout) { "approved" } else { "not_approved" }
    $closeoutApprovalValue = if ($ApprovedCloseout) { "true" } else { "not_approved" }

    @"
schemaVersion: 1
tasks:
  - id: batch-101-authorization-and-access-authorization-read-model
    status: pending
    taskKind: implementation
    humanApproval: $approvalText
    autoDriveLocalImplementationApproval: $autoDriveApprovalText
    seededImplementationTask: true
    seededExecutionModule: authorization-and-access
    targetClosureItem: authorization read-model and display contracts
    localExperienceClosureGate: planned
    localFullLoopGate: L4
    blockedRemainder: high-risk work remains separately gated
    closeoutPolicy:
      localCommit: $localCommitApproval
      fastForwardMerge:
        approved: $closeoutApprovalValue
        targetBranch: master
      push:
        approved: $closeoutApprovalValue
        target: origin/master
      cleanup:
        deleteShortBranch: $closeoutApprovalValue
        parkWorktree: $closeoutApprovalValue
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

function Write-SeededTaskTemplates {
    param([Parameter(Mandatory = $true)][string]$Root)

    $evidencePath = Join-Path -Path $Root -ChildPath "docs\05-execution-logs\evidence\batch-101-authorization-and-access-authorization-read-model.md"
    $auditPath = Join-Path -Path $Root -ChildPath "docs\05-execution-logs\audits-reviews\batch-101-authorization-and-access-authorization-read-model.md"
    New-Item -ItemType Directory -Force -Path (Split-Path -Path $evidencePath -Parent) | Out-Null
    New-Item -ItemType Directory -Force -Path (Split-Path -Path $auditPath -Parent) | Out-Null
    @"
result: pending
Batch range: pending
RED: pending
GREEN: pending
Commit: pending
localFullLoopGate: L4 pending
threadRolloverGate: pending
nextModuleRunCandidate: pending
blocked remainder: high-risk work remains separately gated
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $evidencePath -Encoding UTF8
    "Cost Calibration Gate remains blocked" | Set-Content -LiteralPath $auditPath -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ImplementationSeedSelfReview.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing seed self-review script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-seed-self-review-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
try {
    Push-Location -LiteralPath $fixtureRoot
    $matrixPath = Join-Path -Path $fixtureRoot -ChildPath "matrix.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    Write-Matrix -Path $matrixPath
    Write-Queue -Path $queuePath
    Write-SeededTaskTemplates -Root $fixtureRoot

    $passOutput = @(
        & $scriptPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    )
    Assert-Contains -Output $passOutput -Pattern "seedSelfReviewDecision: passed"

    Write-Queue -Path $queuePath -UnsafeAllowedFile
    Write-SeededTaskTemplates -Root $fixtureRoot
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SEEDED_TASK_ALLOWED_HIGH_RISK_FILE" -Command {
        & $scriptPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    }

    Write-Queue -Path $queuePath -ApprovedCloseout
    Write-SeededTaskTemplates -Root $fixtureRoot
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SEEDED_TASK_CLOSEOUT_WITHOUT_STANDING_APPROVAL" -Command {
        & $scriptPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    }

    Write-Queue -Path $queuePath -ApprovedCloseout -StandingApproval
    Write-SeededTaskTemplates -Root $fixtureRoot
    $standingPassOutput = @(
        & $scriptPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    )
    Assert-Contains -Output $standingPassOutput -Pattern "seedSelfReviewDecision: passed"
} finally {
    Pop-Location
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 implementation seed self-review smoke passed"
