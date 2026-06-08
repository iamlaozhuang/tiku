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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PostCommitReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing post-commit readiness script: $scriptPath"
}

$taskId = "module-run-v2-post-commit-advisory"
$output = @(& $scriptPath -TaskId $taskId)

Assert-Contains -Output $output -Pattern "Module Run v2 Post-Commit Readiness"
Assert-Contains -Output $output -Pattern "postCommitMode: advisory"
Assert-Contains -Output $output -Pattern "taskId: $taskId"
Assert-Contains -Output $output -Pattern "Last Commit"
Assert-Contains -Output $output -Pattern "Changed Files In Last Commit"
Assert-Contains -Output $output -Pattern "Task Inventory"
Assert-Contains -Output $output -Pattern "Scope Inventory"
Assert-Contains -Output $output -Pattern "post-commit advisory completed"

Write-Output "Module Run v2 post-commit readiness smoke passed"
