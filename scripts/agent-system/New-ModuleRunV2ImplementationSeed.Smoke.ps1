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
    Push-Location -LiteralPath $fixtureRoot
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
            -ApprovalStatement "autoDriveLocalImplementationApproval: smoke-approved low-risk local implementation seed" `
            -SeedEvidencePath (Join-Path -Path $fixtureRoot -ChildPath "seed-evidence.md") `
            -SeedAuditReviewPath (Join-Path -Path $fixtureRoot -ChildPath "seed-audit.md")
    )
    Assert-Contains -Output $applyOutput -Pattern "seedTransactionDecision: seeded"
    Assert-Contains -Output $applyOutput -Pattern "seededTaskCount: 2"
    Assert-Contains -Output $applyOutput -Pattern "seedEvidencePath:"
    Assert-Contains -Output $applyOutput -Pattern "seedAuditReviewPath:"
    Assert-Contains -Output $applyOutput -Pattern "seededTaskEvidenceTemplate: docs\\05-execution-logs\\evidence\\batch-101-authorization-and-access-authorization-read-model-and-display-contrac.md"
    Assert-Contains -Output $applyOutput -Pattern "standingUnattendedLocalCloseoutApproval: not_recorded"

    $queueAfterApply = Get-Content -LiteralPath $fixture.QueuePath -Raw
    if ($queueAfterApply -notmatch "seededImplementationTask:\s*true" -or $queueAfterApply -notmatch "status:\s*pending") {
        throw "Applied seed transaction did not write pending seeded tasks."
    }
    if ($queueAfterApply -notmatch "localCommit:\s*not_approved" -or $queueAfterApply -match "parkWorktree:\s*true") {
        throw "Seed transaction without standing closeout approval unexpectedly approved closeout."
    }
    if ($queueAfterApply -notmatch "validationCommandLifecycle:" -or $queueAfterApply -notmatch "phase:\s*advisory_baseline") {
        throw "Applied seed transaction did not write lifecycle-aware advisory baseline validation."
    }
    if ($queueAfterApply -match "(?m)^\s{4}validationCommands:\r?\n(?:\s{6}- .*\r?\n)*\s{6}- npm\.cmd run test -- --run focused") {
        throw "Applied seed transaction wrote broad baseline into legacy validationCommands."
    }
    foreach ($requiredQueueAnchor in @("requirementRefs:", "useCases:", "acceptanceScenarios:", "nonGoals:", "validationProfile:", "behaviorBoundary:", "blockedRemainder:")) {
        if ($queueAfterApply -notmatch [regex]::Escape($requiredQueueAnchor)) {
            throw "Applied seed transaction did not write MECE anchor: $requiredQueueAnchor"
        }
    }
    if ($queueAfterApply -match "phase:\s*post_edit\s+command:\s*npm\.cmd run test -- --run focused") {
        throw "Applied seed transaction wrote broad baseline as a post_edit hard gate."
    }

    $seedEvidenceContent = Get-Content -LiteralPath (Join-Path -Path $fixtureRoot -ChildPath "seed-evidence.md") -Raw
    if ($seedEvidenceContent -notmatch "authorization-and-access" -or $seedEvidenceContent -notmatch "batch-101-authorization-and-access") {
        throw "Seed evidence did not record concrete seeded task values."
    }
    $seededTaskEvidenceTemplate = Join-Path -Path $fixtureRoot -ChildPath "docs\05-execution-logs\evidence\batch-101-authorization-and-access-authorization-read-model-and-display-contrac.md"
    if (-not (Test-Path -LiteralPath $seededTaskEvidenceTemplate)) {
        throw "Seeded task evidence template was not written: $seededTaskEvidenceTemplate"
    }
    $seededTaskEvidenceTemplateContent = Get-Content -LiteralPath $seededTaskEvidenceTemplate -Raw
    foreach ($requiredAnchor in @("RED: pending", "GREEN: pending", "Commit: pending", "localFullLoopGate", "threadRolloverGate", "nextModuleRunCandidate", "Cost Calibration Gate remains blocked")) {
        if ($seededTaskEvidenceTemplateContent -notmatch [regex]::Escape($requiredAnchor)) {
            throw "Seeded task evidence template missing anchor: $requiredAnchor"
        }
    }

    $seedAuditContent = Get-Content -LiteralPath (Join-Path -Path $fixtureRoot -ChildPath "seed-audit.md") -Raw
    if ($seedAuditContent -match [char]7 -or $seedAuditContent -notmatch "autoDriveLocalImplementationApproval") {
        throw "Seed audit did not preserve a clean autoDriveLocalImplementationApproval anchor."
    }

    $selfReviewOutput = @(
        & $selfReviewPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $selfReviewOutput -Pattern "seedSelfReviewDecision: passed"

    $standingRoot = Join-Path -Path $fixtureRoot -ChildPath "standing-closeout"
    $standingFixture = Write-FixtureFiles -Root $standingRoot
    $standingApproval = "standingUnattendedLocalCloseoutApproval: User approves Module Run v2 unattended local autodrive for low-risk local implementation tasks only, including task claim, task plan/evidence/audit creation, scoped local implementation, local validation, local commit, fast-forward merge to master, push origin/master, merged short-branch cleanup, and worktree parking, when repository readiness, validation surface, module closeout readiness, pre-push readiness, allowedFiles/blockedFiles, active-owner, lease, registry, hygiene, and remote-divergence gates all pass. High-risk capability gates remain blocked unless separately approved. autoDriveLocalImplementationApproval: smoke-approved low-risk local implementation seed"
    $standingApplyOutput = @(
        & $scriptPath `
            -Apply `
            -ProjectStatePath $standingFixture.ProjectStatePath `
            -QueuePath $standingFixture.QueuePath `
            -MatrixPath $standingFixture.MatrixPath `
            -ApprovalStatement $standingApproval `
            -SeedEvidencePath (Join-Path -Path $standingRoot -ChildPath "seed-evidence.md") `
            -SeedAuditReviewPath (Join-Path -Path $standingRoot -ChildPath "seed-audit.md")
    )
    Assert-Contains -Output $standingApplyOutput -Pattern "seedTransactionDecision: seeded"
    Assert-Contains -Output $standingApplyOutput -Pattern "standingUnattendedLocalCloseoutApproval: recorded"
    $standingQueueAfterApply = Get-Content -LiteralPath $standingFixture.QueuePath -Raw
    if ($standingQueueAfterApply -notmatch "localCommit:\s*approved" -or $standingQueueAfterApply -notmatch "parkWorktree:\s*true") {
        throw "Standing closeout approval did not generate approved closeoutPolicy."
    }

    $standingSelfReviewOutput = @(
        & $selfReviewPath `
            -ExpectedModule "authorization-and-access" `
            -QueuePath $standingFixture.QueuePath `
            -MatrixPath $standingFixture.MatrixPath
    )
    Assert-Contains -Output $standingSelfReviewOutput -Pattern "seedSelfReviewDecision: passed"
} finally {
    Pop-Location
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 implementation seed transaction smoke passed"
