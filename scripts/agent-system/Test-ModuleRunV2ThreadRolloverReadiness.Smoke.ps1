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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ThreadRolloverReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing thread rollover readiness script: $scriptPath"
}

$continueOutput = @(& $scriptPath -CompletedBatchCount 3)
Assert-Contains -Output $continueOutput -Pattern "threadRolloverDecision: continue_current_thread"

$suggestOutput = @(& $scriptPath -CompletedBatchCount 4)
Assert-Contains -Output $suggestOutput -Pattern "threadRolloverDecision: suggest_new_thread"

Invoke-ExpectFailure -ExpectedPattern "threadRolloverDecision: require_new_thread" -Command {
    & $scriptPath -CompletedBatchCount 6
}

Invoke-ExpectFailure -ExpectedPattern "threadRolloverDecision: require_new_thread" -Command {
    & $scriptPath -CompletedBatchCount 2 -ModuleRunCloseout
}

Invoke-ExpectFailure -ExpectedPattern "threadRolloverDecision: require_new_thread" -Command {
    & $scriptPath -CompletedBatchCount 2 -ExecutionModuleChanged
}

Invoke-ExpectFailure -ExpectedPattern "threadRolloverDecision: require_new_thread" -Command {
    & $scriptPath -CompletedBatchCount 2 -ContextCompaction
}

$recoveredOutput = @(& $scriptPath -CompletedBatchCount 2 -ContextCompaction -RecoveryAuditPassed)
Assert-Contains -Output $recoveredOutput -Pattern "threadRolloverDecision: continue_current_thread"

$allowedBatch6Output = @(& $scriptPath -CompletedBatchCount 6 -RecoveryAuditPassed -AllowContinuationAfterBatch6)
Assert-Contains -Output $allowedBatch6Output -Pattern "threadRolloverDecision: continue_current_thread"

Invoke-ExpectFailure -ExpectedPattern "threadRolloverDecision: stop_for_human_handoff" -Command {
    & $scriptPath -CompletedBatchCount 1 -CurrentTaskUnclear
}

Invoke-ExpectFailure -ExpectedPattern "threadRolloverDecision: stop_for_human_handoff" -Command {
    & $scriptPath -CompletedBatchCount 1 -BlockedGateNeeded
}

Write-Output "Module Run v2 thread rollover readiness smoke passed"

