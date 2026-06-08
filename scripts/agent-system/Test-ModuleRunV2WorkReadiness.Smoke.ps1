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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2WorkReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing advisory script: $scriptPath"
}

$taskId = "module-run-v2-pre-work-pre-edit-advisory"

$preWorkOutput = @(& $scriptPath -Mode pre-work -TaskId $taskId)
Assert-Contains -Output $preWorkOutput -Pattern "Module Run v2 Work Readiness"
Assert-Contains -Output $preWorkOutput -Pattern "advisoryMode: pre-work"
Assert-Contains -Output $preWorkOutput -Pattern "taskId: $taskId"
Assert-Contains -Output $preWorkOutput -Pattern "hookIntegrationMatrix: present"
Assert-Contains -Output $preWorkOutput -Pattern "Cost Calibration Gate remains blocked"

$plannedFiles = @(
    "scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1",
    "README.md",
    ".husky/pre-commit"
)

$preEditOutput = @(& $scriptPath -Mode pre-edit -TaskId $taskId -PlannedFiles $plannedFiles)
Assert-Contains -Output $preEditOutput -Pattern "advisoryMode: pre-edit"
Assert-Contains -Output $preEditOutput -Pattern "ADVISORY_ALLOWED_FILE scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1"
Assert-Contains -Output $preEditOutput -Pattern "ADVISORY_OUT_OF_SCOPE README.md"
Assert-Contains -Output $preEditOutput -Pattern "ADVISORY_BLOCKED_FILE .husky/pre-commit"

Write-Output "Module Run v2 work readiness smoke passed"
