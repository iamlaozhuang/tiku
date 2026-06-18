$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $joinedOutput = $Output -join "`n"
    if ($joinedOutput -notmatch $Pattern) {
        throw "Expected output pattern not found: $Pattern`n$joinedOutput"
    }
}

function Assert-FailsWith {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $failed = $false
    $output = @()
    try {
        $output = @(& $Command 2>&1)
    } catch {
        $failed = $true
        $output += $_.Exception.Message
    }

    if (-not $failed) {
        throw "Expected command to fail, but it passed.`n$($output -join "`n")"
    }

    Assert-Contains -Output $output -Pattern $Pattern
}

function Write-SmokeFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $false)][switch]$MissingFixtureRedGreen
    )

    $projectStatePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"
    $planParentPath = Join-Path -Path $Root -ChildPath "parent-plan.md"
    $evidenceParentPath = Join-Path -Path $Root -ChildPath "parent-evidence.md"
    $auditParentPath = Join-Path -Path $Root -ChildPath "parent-audit.md"
    $planChildPath = Join-Path -Path $Root -ChildPath "child-plan.md"
    $evidenceChildPath = Join-Path -Path $Root -ChildPath "child-evidence.md"
    $auditChildPath = Join-Path -Path $Root -ChildPath "child-audit.md"

    @"
currentTask:
  id: low-risk-parent
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
tasks:
  - id: low-risk-parent
    executionProfile: local_low_risk_experience_batch
    taskKind: local_experience_batch
    validationProfile: low_risk_experience_batch
    humanApproval: standingLocalLowRiskExperienceAdvancementApproval approved for smoke
    lowRiskExperienceBatch:
      id: smoke-low-risk-batch
      role: parent
      children:
        - low-risk-child
      validationDedup:
        e2eListOnce: true
        lintTypecheckOnce: true
      fixtureRepairAllowance:
        mode: test_only_contract_fixture
        requiresRedGreen: true
    closeoutPolicy:
      localCommit:
        approved: true
      fastForwardMerge:
        approved: true
        targetBranch: master
      push:
        approved: true
        target: origin/master
      cleanup:
        deleteShortBranch: true
        parkWorktree: true
        fetchPruneAfterPush: true
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/05-execution-logs/evidence/**
      - src/server/contracts/example-contract.test.ts
    blockedFiles:
      - .env*
      - package.json
      - src/db/schema/**
      - drizzle/**
      - e2e/**
      - playwright-report/**
      - test-results/**
    validationCommands:
      - npm.cmd run test:e2e -- --list
    evidencePath: $evidenceParentPath
    auditReviewPath: $auditParentPath
    planPath: $planParentPath
  - id: low-risk-child
    taskKind: local_experience_audit
    lowRiskExperienceBatch:
      id: smoke-low-risk-batch
      role: child
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/05-execution-logs/evidence/**
      - src/server/contracts/example-contract.test.ts
    blockedFiles:
      - .env*
      - package.json
      - src/db/schema/**
      - drizzle/**
      - e2e/**
      - playwright-report/**
      - test-results/**
    validationCommands:
      - npm.cmd run test:unit -- src/server/contracts/example-contract.test.ts
    evidencePath: $evidenceChildPath
    auditReviewPath: $auditChildPath
    planPath: $planChildPath
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    "# Parent plan" | Set-Content -LiteralPath $planParentPath -Encoding UTF8
    "# Child plan" | Set-Content -LiteralPath $planChildPath -Encoding UTF8

    $redGreenText = if ($MissingFixtureRedGreen) {
        "Fixture repair evidence intentionally missing anchors."
    } else {
        @"
RED: stale fixture omitted nullable response fields.
GREEN: test-only fixture repair added explicit null fields.
"@
    }

    @"
# Parent Evidence

- result: pass
- Batch range: smoke low-risk batch
- Commit: abcdef1
- localFullLoopGate: blocked
- threadRolloverGate: no thread rollover required
- nextModuleRunCandidate: low-risk-child
- Cost Calibration Gate remains blocked.

$redGreenText

Command: npm.cmd run test:e2e -- --list
"@ | Set-Content -LiteralPath $evidenceParentPath -Encoding UTF8

    @"
# Child Evidence

- result: pass
- focused unit: npm.cmd run test:unit -- src/server/contracts/example-contract.test.ts
- Cost Calibration Gate remains blocked.

$redGreenText
"@ | Set-Content -LiteralPath $evidenceChildPath -Encoding UTF8

    "Verdict: No blocking findings" | Set-Content -LiteralPath $auditParentPath -Encoding UTF8
    "Verdict: No blocking findings" | Set-Content -LiteralPath $auditChildPath -Encoding UTF8

    return [pscustomobject]@{
        ProjectStatePath = $projectStatePath
        QueuePath        = $queuePath
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2LowRiskExperienceBatchReadiness.ps1"
$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-low-risk-experience-batch-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $fixtureRoot | Out-Null

try {
    $fixture = Write-SmokeFiles -Root $fixtureRoot
    $passOutput = @(
        & $scriptPath `
            -BatchId "smoke-low-risk-batch" `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -ChangedFiles @(
                "docs/04-agent-system/state/project-state.yaml",
                "src/server/contracts/example-contract.test.ts"
            )
    )
    Assert-Contains -Output $passOutput -Pattern "lowRiskExperienceBatchDecision: pass"
    Assert-Contains -Output $passOutput -Pattern "OK_FIXTURE_REPAIR_RED_RECORDED"
    Assert-Contains -Output $passOutput -Pattern "OK_VALIDATION_DEDUP_E2E_LIST_ONCE"
    Assert-Contains -Output $passOutput -Pattern "OK_STANDING_LOW_RISK_EXPERIENCE_APPROVAL_STRUCTURED_CLOSEOUT"

    Assert-FailsWith -Command {
        & $scriptPath `
            -BatchId "smoke-low-risk-batch" `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -ChangedFiles @(
                "src/server/contracts/example-contract.ts",
                ".env.local",
                "package.json",
                "src/db/schema/example.ts",
                "test-results/result.zip"
            )
    } -Pattern "HARD_BLOCK_LOW_RISK_BATCH"

    $missingFixture = Write-SmokeFiles -Root $fixtureRoot -MissingFixtureRedGreen
    Assert-FailsWith -Command {
        & $scriptPath `
            -BatchId "smoke-low-risk-batch" `
            -ProjectStatePath $missingFixture.ProjectStatePath `
            -QueuePath $missingFixture.QueuePath `
            -ChangedFiles @("src/server/contracts/example-contract.test.ts")
    } -Pattern "HARD_BLOCK_FIXTURE_REPAIR_RED_MISSING"

    Write-Output "low-risk experience batch readiness smoke passed"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}
