$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    if ($Content -notmatch $Pattern) {
        throw "Expected content pattern not found: $Pattern"
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "New-TaskEvidence.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing task evidence generator: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-new-task-evidence-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $fixtureRoot | Out-Null

try {
    $taskId = "module-run-v2-evidence-template-smoke"
    $output = @(& $scriptPath -TaskId $taskId -OutputDirectory $fixtureRoot)
    Assert-Contains -Content ($output -join "`n") -Pattern "Created task evidence"

    $evidenceFile = Get-ChildItem -LiteralPath $fixtureRoot -Filter "*-$taskId.md" | Select-Object -First 1
    if ($null -eq $evidenceFile) {
        throw "Expected generated evidence file for $taskId"
    }

    $content = Get-Content -LiteralPath $evidenceFile.FullName -Raw
    Assert-Contains -Content $content -Pattern ([regex]::Escape($taskId))
    Assert-Contains -Content $content -Pattern "(?mi)\bBatch range\b"
    Assert-Contains -Content $content -Pattern "(?mi)\bRED\b\s*:"
    Assert-Contains -Content $content -Pattern "(?mi)\bGREEN\b\s*:"
    Assert-Contains -Content $content -Pattern "(?mi)\bCommit:\s*"
    Assert-Contains -Content $content -Pattern "localFullLoopGate"
    Assert-Contains -Content $content -Pattern "threadRolloverGate"
    Assert-Contains -Content $content -Pattern "automationHandoffPolicy"
    Assert-Contains -Content $content -Pattern "nextModuleRunCandidate"
    Assert-Contains -Content $content -Pattern "nextTaskPolicy:"
    Assert-Contains -Content $content -Pattern "Cost Calibration Gate remains blocked"
    Assert-Contains -Content $content -Pattern "needs_recheck"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "New-TaskEvidence smoke passed"
