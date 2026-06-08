$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2WorkReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing advisory script: $scriptPath"
}

$taskId = "module-run-v2-start-gate-hardening"

$preWorkOutput = @(& $scriptPath -Mode pre-work -TaskId $taskId)
Assert-Contains -Output $preWorkOutput -Pattern "Module Run v2 Work Readiness"
Assert-Contains -Output $preWorkOutput -Pattern "workReadinessMode: hard_block"
Assert-Contains -Output $preWorkOutput -Pattern "checkMode: pre-work"
Assert-Contains -Output $preWorkOutput -Pattern "taskId: $taskId"
Assert-Contains -Output $preWorkOutput -Pattern "hookIntegrationMatrix: present"
Assert-Contains -Output $preWorkOutput -Pattern "Cost Calibration Gate remains blocked"
Assert-Contains -Output $preWorkOutput -Pattern "work readiness passed"

$plannedFiles = @(
    "scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1",
    "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-start-gate-hardening.md"
)

$preEditOutput = @(& $scriptPath -Mode pre-edit -TaskId $taskId -PlannedFiles $plannedFiles)
Assert-Contains -Output $preEditOutput -Pattern "checkMode: pre-edit"
Assert-Contains -Output $preEditOutput -Pattern "OK_PLANNED_ALLOWED_FILE scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1"
Assert-Contains -Output $preEditOutput -Pattern "OK_PLANNED_ALLOWED_FILE scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1"
Assert-Contains -Output $preEditOutput -Pattern "work readiness passed"

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_TASK_ID" -Command {
    & $scriptPath -Mode pre-work
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_INACTIVE_TASK" -Command {
    & $scriptPath -Mode pre-work -TaskId "module-run-v2-mechanism-state-source-sync"
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PLANNED_OUT_OF_SCOPE" -Command {
    & $scriptPath -Mode pre-edit -TaskId $taskId -PlannedFiles "README.md"
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PLANNED_BLOCKED_FILE" -Command {
    & $scriptPath -Mode pre-edit -TaskId $taskId -PlannedFiles ".env.local"
}

Write-Output "Module Run v2 work readiness smoke passed"
