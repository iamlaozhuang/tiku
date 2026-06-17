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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ModuleCloseoutReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing module-closeout readiness script: $scriptPath"
}

$taskId = "module-run-v2-closeout-readiness-smoke"
$existingEvidencePath = "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-authorization-and-access-pilot.md"
$existingAuditPath = "docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-authorization-and-access-pilot.md"
$baselineFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-closeout-baseline-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $baselineFixtureRoot | Out-Null
$baselineProjectStatePath = Join-Path -Path $baselineFixtureRoot -ChildPath "project-state.yaml"
$baselineQueuePath = Join-Path -Path $baselineFixtureRoot -ChildPath "task-queue.yaml"

@"
schemaVersion: 1
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $baselineProjectStatePath -Encoding UTF8

@"
schemaVersion: 1
tasks:
  - id: $taskId
    moduleRunVersion: 2
    evidencePath: $existingEvidencePath
    auditReviewPath: $existingAuditPath
    validationCommands:
    status: ready_for_closeout
"@ | Set-Content -LiteralPath $baselineQueuePath -Encoding UTF8

$passOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath
)
Assert-Contains -Output $passOutput -Pattern "Module Run v2 Module Closeout Readiness"
Assert-Contains -Output $passOutput -Pattern "moduleCloseoutMode: hard_block"
Assert-Contains -Output $passOutput -Pattern "OK_EVIDENCE_PATH"
Assert-Contains -Output $passOutput -Pattern "OK_AUDIT_PATH"
Assert-Contains -Output $passOutput -Pattern "OK_BATCH_EVIDENCE_RECORDED"
Assert-Contains -Output $passOutput -Pattern "OK_RED_EVIDENCE_RECORDED"
Assert-Contains -Output $passOutput -Pattern "OK_GREEN_EVIDENCE_RECORDED"
Assert-Contains -Output $passOutput -Pattern "OK_BATCH_COMMIT_EVIDENCE_RECORDED"
Assert-Contains -Output $passOutput -Pattern "OK_LOCAL_FULL_LOOP_GATE_RECORDED"
Assert-Contains -Output $passOutput -Pattern "Cost Calibration Gate remains blocked"

$batchShadowOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath `
        -DocsOnlyBatchId "missing-docs-only-batch-smoke" `
        -DocsOnlyBatchMode shadow
)
Assert-Contains -Output $batchShadowOutput -Pattern "Docs-Only Batch Readiness"
Assert-Contains -Output $batchShadowOutput -Pattern "docsOnlyBatchShadowDecision: would_block"
Assert-Contains -Output $batchShadowOutput -Pattern "module-closeout readiness passed"

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_EVIDENCE" -Command {
    & $scriptPath -TaskId $taskId -ProjectStatePath $baselineProjectStatePath -QueuePath $baselineQueuePath -EvidencePath "docs/05-execution-logs/evidence/missing-closeout-fixture.md" -AuditReviewPath $existingAuditPath
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_BATCH_EVIDENCE" -Command {
    & $scriptPath -TaskId $taskId -ProjectStatePath $baselineProjectStatePath -QueuePath $baselineQueuePath -EvidencePath "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-pre-commit-scan-hardening.md" -AuditReviewPath "docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-pre-commit-scan-hardening.md" -AllowMissingThreadRolloverDecision -AllowMissingNextModuleRunCandidate
}

if (Test-Path -LiteralPath $baselineFixtureRoot) {
    Remove-Item -LiteralPath $baselineFixtureRoot -Recurse -Force
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-closeout-lifecycle-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
try {
    $statePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $fixtureRoot -ChildPath "matrix.yaml"
    $evidencePath = Join-Path -Path $fixtureRoot -ChildPath "evidence.md"
    $auditPath = Join-Path -Path $fixtureRoot -ChildPath "audit.md"

    @"
schemaVersion: 1
currentTask:
  id: lifecycle-task
"@ | Set-Content -LiteralPath $statePath -Encoding UTF8

    @"
schemaVersion: 1
moduleRunVersion: 2
threadRolloverGate:
  enabled: true
automationHandoffPolicy:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    @"
result: pass
Cost Calibration Gate remains blocked
closeout-validation
"@ | Set-Content -LiteralPath $evidencePath -Encoding UTF8
    Set-Content -LiteralPath $auditPath -Value "APPROVE" -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: lifecycle-task
    title: Lifecycle Task
    moduleRunVersion: 1
    validationCommands:
      - pre-edit-validation
    validationCommandLifecycle:
      - phase: pre_edit
        command: pre-edit-validation
      - phase: closeout
        command: closeout-validation
    evidencePath: $($evidencePath.Replace("\", "\\"))
    auditReviewPath: $($auditPath.Replace("\", "\\"))
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $lifecycleOutput = @(
        & $scriptPath `
            -TaskId "lifecycle-task" `
            -ProjectStatePath $statePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -AllowMissingThreadRolloverDecision `
            -AllowMissingNextModuleRunCandidate
    )
    Assert-Contains -Output $lifecycleOutput -Pattern "validationLifecycleMode: phase_filtered"
    Assert-Contains -Output $lifecycleOutput -Pattern "OK_VALIDATION_RECORDED closeout-validation"
    if (($lifecycleOutput -join "`n") -match "HARD_BLOCK_VALIDATION_NOT_RECORDED pre-edit-validation") {
        throw "Expected closeout readiness to ignore pre_edit validation lifecycle commands."
    }

    @"
result: pass
Batch range: unsupported phase fixture
RED: recorded
GREEN: recorded
Commit: abcdef1
localFullLoopGate: approved_localhost_only
threadRolloverGate: not requested
nextModuleRunCandidate: none
blocked remainder: high-risk gates remain blocked
Cost Calibration Gate remains blocked
unsupported-validation-command
closeout-validation
"@ | Set-Content -LiteralPath $evidencePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: lifecycle-task
    title: Lifecycle Task
    moduleRunVersion: 2
    validationCommandLifecycle:
      - phase: validation
        command: unsupported-validation-command
      - phase: closeout
        command: closeout-validation
    evidencePath: $($evidencePath.Replace("\", "\\"))
    auditReviewPath: $($auditPath.Replace("\", "\\"))
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_INVALID_VALIDATION_LIFECYCLE_PHASE validation.*post_edit" -Command {
        & $scriptPath `
            -TaskId "lifecycle-task" `
            -ProjectStatePath $statePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    }

    @"
result: pass
Batch range: pending fixture
RED: recorded
GREEN: pending
Commit: pending
localFullLoopGate: L2 pending
threadRolloverGate: pending
nextModuleRunCandidate: pending
blocked remainder: high-risk gates remain blocked
Cost Calibration Gate remains blocked
closeout-validation
"@ | Set-Content -LiteralPath $evidencePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: lifecycle-task
    title: Lifecycle Task
    moduleRunVersion: 2
    validationCommandLifecycle:
      - phase: closeout
        command: closeout-validation
    evidencePath: $($evidencePath.Replace("\", "\\"))
    auditReviewPath: $($auditPath.Replace("\", "\\"))
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PENDING_GREEN_EVIDENCE" -Command {
        & $scriptPath `
            -TaskId "lifecycle-task" `
            -ProjectStatePath $statePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 module-closeout readiness smoke passed"
