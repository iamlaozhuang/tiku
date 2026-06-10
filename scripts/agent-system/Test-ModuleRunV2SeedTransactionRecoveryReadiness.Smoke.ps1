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

function New-SeedTaskBlock {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$TargetClosure
    )

    return @"
  - id: $TaskId
    title: Module Run v2 authorization-and-access implementation seed
    dependencies:
      - module-run-v2-autodrive-activation
    humanApproval: >-
      autoDriveLocalImplementationApproval: smoke approval
    autoDriveLocalImplementationApproval: >-
      autoDriveLocalImplementationApproval: smoke approval
    seededImplementationTask: true
    seededExecutionModule: authorization-and-access
    targetClosureItem: $TargetClosure
    localExperienceClosureGate: planned
    localFullLoopGate: L2
    blockedRemainder: high-risk work remains separately gated
    registryLifecycle:
      runStatus: active
      cleanupPolicy: none
      redactionRequired: true
    taskKind: implementation
    moduleRunVersion: 2
    allowedFiles:
      - src/server/models/**
      - src/server/contracts/**
      - src/server/validators/**
      - src/server/services/**
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/05-execution-logs/task-plans/**
      - docs/05-execution-logs/evidence/**
      - docs/05-execution-logs/audits-reviews/**
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
      - local_validation
      - evidence_redaction
      - automation_policy
    validationCommands:
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId module-run-v2-autodrive-activation -CandidateTaskId $TaskId
      - npm.cmd run lint
      - npm.cmd run typecheck
      - npm.cmd run test -- --run focused
      - git diff --check
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId $TaskId
    evidencePath: docs/05-execution-logs/evidence/$TaskId.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/$TaskId.md
    status: pending
    retryCount: 0
"@
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2SeedTransactionRecoveryReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing seed transaction recovery readiness script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-seed-recovery-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $repoPath = Join-Path -Path $fixtureRoot -ChildPath "repo"
    New-Item -ItemType Directory -Path $repoPath | Out-Null
    & git -C $repoPath init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize seed recovery fixture repo."
    }

    $stateDir = Join-Path -Path $repoPath -ChildPath "docs\04-agent-system\state"
    $evidenceDir = Join-Path -Path $repoPath -ChildPath "docs\05-execution-logs\evidence"
    $auditDir = Join-Path -Path $repoPath -ChildPath "docs\05-execution-logs\audits-reviews"
    New-Item -ItemType Directory -Path $stateDir, $evidenceDir, $auditDir | Out-Null

    $matrixPath = Join-Path -Path $stateDir -ChildPath "advanced-edition-domain-module-run-matrix.yaml"
    @"
schemaVersion: 2
moduleRunVersion: 2
implementationAutoSeedGate:
  enabled: true
executionModules:
  - module: authorization-and-access
    targetLocalClosure:
      - personal authorization lifecycle
      - organization authorization lifecycle
terminologyAnchors:
  - Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    $queuePath = Join-Path -Path $stateDir -ChildPath "task-queue.yaml"
    @"
schemaVersion: 1
tasks:
  - id: module-run-v2-autodrive-activation
    status: done
    taskKind: automation_activation
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "seed recovery baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit seed recovery baseline."
    }

    $seedTaskBlockA = New-SeedTaskBlock -TaskId "authorization-and-access-personal-auth" -TargetClosure "personal authorization lifecycle"
    $seedTaskBlockB = New-SeedTaskBlock -TaskId "authorization-and-access-org-auth" -TargetClosure "organization authorization lifecycle"
    Add-Content -LiteralPath $queuePath -Value $seedTaskBlockA -Encoding UTF8
    Add-Content -LiteralPath $queuePath -Value $seedTaskBlockB -Encoding UTF8

    $evidencePath = Join-Path -Path $evidenceDir -ChildPath "2026-06-09-module-run-v2-auto-seed-authorization-and-access.md"
    @"
# Module Run v2 Auto-Seed Evidence: authorization-and-access

- approvalAnchor: autoDriveLocalImplementationApproval
- Cost Calibration Gate remains blocked.
"@ | Set-Content -LiteralPath $evidencePath -Encoding UTF8

    $auditPath = Join-Path -Path $auditDir -ChildPath "2026-06-09-module-run-v2-auto-seed-authorization-and-access.md"
    @"
# Module Run v2 Auto-Seed Audit Review: authorization-and-access

- autoDriveLocalImplementationApproval is recorded.
- Cost Calibration Gate remains blocked.
"@ | Set-Content -LiteralPath $auditPath -Encoding UTF8

    & git -C $repoPath add `
        "docs/04-agent-system/state/task-queue.yaml" `
        "docs/05-execution-logs/evidence/2026-06-09-module-run-v2-auto-seed-authorization-and-access.md" `
        "docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-auto-seed-authorization-and-access.md" | Out-Null

    $readyOutput = @(& $scriptPath -SeedWorktreePath $repoPath -MatrixPath $matrixPath)
    Assert-Contains -Output $readyOutput -Pattern "seedRecoveryDecision: recoverable_seed_transaction"
    Assert-Contains -Output $readyOutput -Pattern "seedModule: authorization-and-access"
    Assert-Contains -Output $readyOutput -Pattern "seedTaskCount: 2"
    Assert-Contains -Output $readyOutput -Pattern "Cost Calibration Gate remains blocked"

    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "unstaged.txt") -Value "not allowed" -Encoding UTF8
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SEED_RECOVERY_UNTRACKED" -Command {
        & $scriptPath -SeedWorktreePath $repoPath -MatrixPath $matrixPath
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 seed transaction recovery readiness smoke passed"
