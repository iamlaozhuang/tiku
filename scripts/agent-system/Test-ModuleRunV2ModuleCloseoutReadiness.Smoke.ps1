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

$taskId = "module-run-v2-authorization-and-access-pilot"
$existingEvidencePath = "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-authorization-and-access-pilot.md"
$existingAuditPath = "docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-authorization-and-access-pilot.md"

$passOutput = @(& $scriptPath -TaskId $taskId -EvidencePath $existingEvidencePath -AuditReviewPath $existingAuditPath)
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

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_EVIDENCE" -Command {
    & $scriptPath -TaskId $taskId -EvidencePath "docs/05-execution-logs/evidence/missing-closeout-fixture.md" -AuditReviewPath $existingAuditPath
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_BATCH_EVIDENCE" -Command {
    & $scriptPath -TaskId $taskId -EvidencePath "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-pre-commit-scan-hardening.md" -AuditReviewPath "docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-pre-commit-scan-hardening.md" -AllowMissingThreadRolloverDecision -AllowMissingNextModuleRunCandidate
}

Write-Output "Module Run v2 module-closeout readiness smoke passed"
