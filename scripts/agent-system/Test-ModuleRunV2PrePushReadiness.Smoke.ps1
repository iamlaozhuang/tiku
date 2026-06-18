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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PrePushReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing pre-push readiness script: $scriptPath"
}

$taskId = "module-run-v2-pre-push-readiness-smoke"

$existingEvidencePath = "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-pre-commit-scan-hardening.md"
$existingAuditPath = "docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-pre-commit-scan-hardening.md"
$baselineFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-pre-push-baseline-" + [guid]::NewGuid().ToString("N"))
$baselineProjectStatePath = Join-Path -Path $baselineFixtureRoot -ChildPath "project-state.yaml"
$baselineQueuePath = Join-Path -Path $baselineFixtureRoot -ChildPath "task-queue.yaml"
$currentMasterSha = ((& git rev-parse master) -join "").Trim()
$currentOriginMasterSha = ((& git rev-parse origin/master) -join "").Trim()
New-Item -ItemType Directory -Force -Path $baselineFixtureRoot | Out-Null

@"
schemaVersion: 1
project:
  name: tiku
repository:
  lastKnownMasterSha: $currentMasterSha
  lastKnownOriginMasterSha: $currentOriginMasterSha
currentTask:
  id: $taskId
  status: done
"@ | Set-Content -LiteralPath $baselineProjectStatePath -Encoding UTF8

@"
schemaVersion: 1
tasks:
  - id: $taskId
    evidencePath: $existingEvidencePath
    auditReviewPath: $existingAuditPath
    status: done
"@ | Set-Content -LiteralPath $baselineQueuePath -Encoding UTF8

$passOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath `
        -SkipRemoteAheadCheck
)
Assert-Contains -Output $passOutput -Pattern "Module Run v2 Pre-Push Readiness"
Assert-Contains -Output $passOutput -Pattern "prePushMode: hard_block"
Assert-Contains -Output $passOutput -Pattern "OK_EVIDENCE_PATH"
Assert-Contains -Output $passOutput -Pattern "OK_AUDIT_PATH"
Assert-Contains -Output $passOutput -Pattern "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"
Assert-Contains -Output $passOutput -Pattern "finalHandoffShaPolicy: final_handoff_or_project_state"
Assert-Contains -Output $passOutput -Pattern "Cost Calibration Gate remains blocked"

$batchShadowOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath `
        -SkipRemoteAheadCheck `
        -DocsOnlyBatchId "missing-docs-only-batch-smoke" `
        -DocsOnlyBatchMode shadow
)
Assert-Contains -Output $batchShadowOutput -Pattern "Docs-Only Batch Readiness"
Assert-Contains -Output $batchShadowOutput -Pattern "docsOnlyBatchShadowDecision: would_block"
Assert-Contains -Output $batchShadowOutput -Pattern "pre-push readiness passed"

$lowRiskBatchShadowOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath `
        -SkipRemoteAheadCheck `
        -LowRiskExperienceBatchId "missing-low-risk-experience-batch-smoke" `
        -LowRiskExperienceBatchMode shadow
)
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "Low-Risk Experience Batch Readiness"
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "lowRiskExperienceBatchShadowDecision: would_block"
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "pre-push readiness passed"

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_EVIDENCE" -Command {
    & $scriptPath -TaskId $taskId -ProjectStatePath $baselineProjectStatePath -QueuePath $baselineQueuePath -EvidencePath "docs/05-execution-logs/evidence/missing-pre-push-fixture.md" -SkipRemoteAheadCheck
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_AUDIT" -Command {
    & $scriptPath -TaskId $taskId -ProjectStatePath $baselineProjectStatePath -QueuePath $baselineQueuePath -AuditReviewPath "docs/05-execution-logs/audits-reviews/missing-pre-push-fixture.md" -SkipRemoteAheadCheck
}

if (Test-Path -LiteralPath $baselineFixtureRoot) {
    Remove-Item -LiteralPath $baselineFixtureRoot -Recurse -Force
}

$fixtureTaskId = "module-run-v2-pre-push-post-push-ancestor-smoke"
$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "tiku-module-run-v2-pre-push-smoke"
$fixtureProjectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
$fixtureQueuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
$ancestorSha = ((& git rev-parse origin/master~1) -join "").Trim()

if ([string]::IsNullOrWhiteSpace($ancestorSha)) {
    throw "Missing master ancestor fixture SHA"
}

New-Item -ItemType Directory -Force -Path $fixtureRoot | Out-Null

@"
schemaVersion: 1
project:
  name: tiku
  currentPhase: smoke
repository:
  lastKnownMasterSha: $ancestorSha
  lastKnownOriginMasterSha: $ancestorSha
currentTask:
  id: $fixtureTaskId
  status: done
"@ | Set-Content -Path $fixtureProjectStatePath -Encoding UTF8

@"
tasks:
  - id: $fixtureTaskId
    evidencePath: $existingEvidencePath
    auditReviewPath: $existingAuditPath
    status: done
"@ | Set-Content -Path $fixtureQueuePath -Encoding UTF8

$ancestorOutput = @(& $scriptPath -TaskId $fixtureTaskId -ProjectStatePath $fixtureProjectStatePath -QueuePath $fixtureQueuePath -SkipRemoteAheadCheck)
Assert-Contains -Output $ancestorOutput -Pattern "OK_PRE_PUSH_STATE_SHA_ANCESTOR master"
Assert-Contains -Output $ancestorOutput -Pattern "OK_PRE_PUSH_STATE_SHA_ANCESTOR origin/master"
Assert-Contains -Output $ancestorOutput -Pattern "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"
Assert-Contains -Output $ancestorOutput -Pattern "pre-push readiness passed"

@"
schemaVersion: 1
project:
  name: tiku
  currentPhase: smoke
repository:
  lastKnownMasterSha: not-a-valid-ancestor
  lastKnownOriginMasterSha: not-a-valid-ancestor
currentTask:
  id: $fixtureTaskId
  status: done
"@ | Set-Content -Path $fixtureProjectStatePath -Encoding UTF8

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT" -Command {
    & $scriptPath -TaskId $fixtureTaskId -ProjectStatePath $fixtureProjectStatePath -QueuePath $fixtureQueuePath -SkipRemoteAheadCheck
}

Write-Output "Module Run v2 pre-push readiness smoke passed"
