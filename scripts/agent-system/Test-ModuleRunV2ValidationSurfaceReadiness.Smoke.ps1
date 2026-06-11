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

    $text = $Output -join "`n"
    if ($text -notmatch $Pattern) {
        throw "Expected output pattern not found: $Pattern`n$text"
    }
}

function New-SmokeRoot {
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-validation-surface-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root | Out-Null
    return $root
}

function Write-SmokeQueue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    @"
schemaVersion: 1
tasks:
  - id: $TaskId
    status: in_progress
    taskKind: implementation
    moduleRunVersion: 2
    validationCommands:
      - npm.cmd run lint
      - npm.cmd run typecheck
      - npm.cmd run test -- --run focused # focused test anchor
      - git diff --check
    evidencePath: evidence.md
    auditReviewPath: audit.md
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-StructuredSmokeQueue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    @"
schemaVersion: 1
tasks:
  - id: $TaskId
    status: ready_for_closeout
    taskKind: implementation
    moduleRunVersion: 2
    validationCommandLifecycle:
      - phase: post_edit
        command: npm.cmd run lint
      - phase: post_edit
        command: npm.cmd run typecheck
      - phase: post_edit
        command: npm.cmd run test:unit -- src/server/services/example.test.ts
      - phase: closeout
        command: git diff --check
      - phase: advisory_baseline
        command: npm.cmd run test -- --run focused
    evidencePath: evidence.md
    auditReviewPath: audit.md
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-E2ESmokeQueue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    @"
schemaVersion: 1
tasks:
  - id: $TaskId
    status: ready_for_closeout
    taskKind: local_verification
    moduleRunVersion: 2
    validationCommandLifecycle:
      - phase: post_edit
        command: npm.cmd run test:e2e -- e2e/home.spec.ts
      - phase: closeout
        command: git diff --check
    validationCommands:
      - npm.cmd run test:e2e -- e2e/home.spec.ts
      - git diff --check
    evidencePath: evidence.md
    auditReviewPath: audit.md
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ValidationSurfaceReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing validation surface readiness script: $scriptPath"
}

$smokeRoot = New-SmokeRoot
try {
    $mismatchQueuePath = Join-Path -Path $smokeRoot -ChildPath "mismatch-queue.yaml"
    $mismatchEvidencePath = Join-Path -Path $smokeRoot -ChildPath "mismatch-evidence.md"
    $mismatchAuditPath = Join-Path -Path $smokeRoot -ChildPath "mismatch-audit.md"
    Write-SmokeQueue -Path $mismatchQueuePath -TaskId "batch-101"
    @"
result: pass
Batch 101:
RED: focused validator module was missing before implementation.
GREEN: focused unit tests passed, 2 files / 5 tests.
npm.cmd run lint: pass
npm.cmd run typecheck: pass
git diff --check: pass
npm.cmd run test -- --run focused: failed
Broad validation failed because unrelated existing failures were fresh-validation-runner timeouts and phase-8 mistake_book DATABASE_URL requirement.
localFullLoopGate: L4
blocked remainder: high-risk work remains separately gated.
threadRolloverGate: continue current thread.
nextModuleRunCandidate: batch-102.
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $mismatchEvidencePath -Encoding UTF8
    @"
Review status: PENDING
"@ | Set-Content -LiteralPath $mismatchAuditPath -Encoding UTF8

    $mismatchOutput = @(
        & powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $scriptPath `
            -TaskId "batch-101" `
            -QueuePath $mismatchQueuePath `
            -EvidencePath $mismatchEvidencePath `
            -AuditReviewPath $mismatchAuditPath
    )
    Assert-Contains -Output $mismatchOutput -Pattern "validationSurfaceDecision: validation_surface_mismatch"
    Assert-Contains -Output $mismatchOutput -Pattern "validationSurfaceBroadGate: unrelated_baseline_failure"
    Assert-Contains -Output $mismatchOutput -Pattern "closeoutTransactionState: closeout_pending_commit_evidence"
    Assert-Contains -Output $mismatchOutput -Pattern "ownerRecoveryDecision: manual_required_owner_recovery"

    $structuredQueuePath = Join-Path -Path $smokeRoot -ChildPath "structured-queue.yaml"
    $structuredEvidencePath = Join-Path -Path $smokeRoot -ChildPath "structured-evidence.md"
    $structuredAuditPath = Join-Path -Path $smokeRoot -ChildPath "structured-audit.md"
    Write-StructuredSmokeQueue -Path $structuredQueuePath -TaskId "batch-101"
    @"
result: pass
Batch 101:
RED: validation surface fixture failed before classifier support.
GREEN: focused unit tests passed, 2 files / 5 tests.
npm.cmd run lint: pass
npm.cmd run typecheck: pass
npm.cmd run test:unit -- src/server/services/example.test.ts: pass
git diff --check: pass
npm.cmd run test -- --run focused: advisory baseline failed with unrelated existing failures.
Commit: `1234567890abcdef1234567890abcdef12345678`
localFullLoopGate: L4
blocked remainder: high-risk work remains separately gated.
threadRolloverGate: continue current thread.
nextModuleRunCandidate: batch-102.
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $structuredEvidencePath -Encoding UTF8
    @"
APPROVE: No blocking findings.
"@ | Set-Content -LiteralPath $structuredAuditPath -Encoding UTF8

    $structuredOutput = @(
        & powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $scriptPath `
            -TaskId "batch-101" `
            -QueuePath $structuredQueuePath `
            -EvidencePath $structuredEvidencePath `
            -AuditReviewPath $structuredAuditPath
    )
    Assert-Contains -Output $structuredOutput -Pattern "validationSurfaceDecision: focused_validation_satisfied"
    Assert-Contains -Output $structuredOutput -Pattern "validationSurfaceBroadGate: advisory_unrelated_baseline_failure"
    Assert-Contains -Output $structuredOutput -Pattern "closeoutTransactionState: closeout_ready"
    Assert-Contains -Output $structuredOutput -Pattern "ownerRecoveryDecision: no_owner_recovery_needed"

    $e2eQueuePath = Join-Path -Path $smokeRoot -ChildPath "e2e-queue.yaml"
    $e2eEvidencePath = Join-Path -Path $smokeRoot -ChildPath "e2e-evidence.md"
    $e2eAuditPath = Join-Path -Path $smokeRoot -ChildPath "e2e-audit.md"
    Write-E2ESmokeQueue -Path $e2eQueuePath -TaskId "phase-81"
    @"
result: pass
Batch 81:
RED: local e2e evidence was not recognized by validation surface readiness.
GREEN: local e2e passed, spec e2e/home.spec.ts, tests 3.
npm.cmd run test:e2e -- e2e/home.spec.ts: pass
git diff --check: pass
Commit: `1234567890abcdef1234567890abcdef12345678`
localFullLoopGate: L5
blocked remainder: full e2e suite remains blocked.
threadRolloverGate: continue current thread.
nextModuleRunCandidate: none.
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $e2eEvidencePath -Encoding UTF8
    @"
APPROVE: No blocking findings.
"@ | Set-Content -LiteralPath $e2eAuditPath -Encoding UTF8

    $e2eOutput = @(
        & powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $scriptPath `
            -TaskId "phase-81" `
            -QueuePath $e2eQueuePath `
            -EvidencePath $e2eEvidencePath `
            -AuditReviewPath $e2eAuditPath
    )
    Assert-Contains -Output $e2eOutput -Pattern "validationSurfaceDecision: focused_validation_satisfied"
    Assert-Contains -Output $e2eOutput -Pattern "closeoutTransactionState: closeout_ready"

    $failedE2EEvidencePath = Join-Path -Path $smokeRoot -ChildPath "e2e-failed-evidence.md"
    @"
result: fail
Batch 81:
RED: local e2e failed.
GREEN: not reached.
npm.cmd run test:e2e -- e2e/home.spec.ts: failed
git diff --check: pass
Commit: `1234567890abcdef1234567890abcdef12345678`
localFullLoopGate: L5
blocked remainder: local e2e smoke failed.
threadRolloverGate: continue current thread.
nextModuleRunCandidate: none.
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $failedE2EEvidencePath -Encoding UTF8

    $failedE2EOutput = @(
        & powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $scriptPath `
            -TaskId "phase-81" `
            -QueuePath $e2eQueuePath `
            -EvidencePath $failedE2EEvidencePath `
            -AuditReviewPath $e2eAuditPath
    )
    Assert-Contains -Output $failedE2EOutput -Pattern "validationSurfaceDecision: validation_surface_incomplete"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 validation surface readiness smoke passed"
