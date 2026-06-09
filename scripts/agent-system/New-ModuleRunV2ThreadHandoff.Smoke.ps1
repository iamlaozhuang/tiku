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

function Assert-NotContains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -gt 0) {
        throw "Unexpected output pattern found: $Pattern"
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "New-ModuleRunV2ThreadHandoff.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing handoff generator script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-thread-handoff-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $outputPath = Join-Path -Path $fixtureRoot -ChildPath "handoff.md"
    $output = @(& $scriptPath -OutputPath $outputPath -Decision "require_new_thread" -Reason "smoke test" -NextModuleRunCandidate "ai-task-and-provider")

    Assert-Contains -Output $output -Pattern "handoffGenerator: wrote"
    Assert-Contains -Output $output -Pattern "threadToolHint: create_thread"
    Assert-Contains -Output $output -Pattern "threadToolHint: send_message_to_thread"
    Assert-Contains -Output $output -Pattern "fallbackCommitSha: git_head"
    Assert-Contains -Output $output -Pattern "Cost Calibration Gate remains blocked"

    if (-not (Test-Path -LiteralPath $outputPath)) {
        throw "Expected handoff output file was not created."
    }

    $content = @(Get-Content -LiteralPath $outputPath)
    Assert-Contains -Output $content -Pattern "thread rollover handoff:"
    Assert-Contains -Output $content -Pattern "decision: require_new_thread"
    Assert-Contains -Output $content -Pattern "nextModuleRunCandidate:"
    Assert-Contains -Output $content -Pattern "ai-task-and-provider"
    Assert-Contains -Output $content -Pattern "create_thread"
    Assert-Contains -Output $content -Pattern "send_message_to_thread"
    Assert-Contains -Output $content -Pattern "Cost Calibration Gate remains blocked"
    Assert-NotContains -Output $content -Pattern "commit: pending-local-commit"

    $dryRunPath = Join-Path -Path $fixtureRoot -ChildPath "dry-run-handoff.md"
    $dryRunOutput = @(& $scriptPath -OutputPath $dryRunPath -Decision "require_new_thread" -Reason "smoke test" -NextModuleRunCandidate "ai-task-and-provider" -DryRun)
    Assert-Contains -Output $dryRunOutput -Pattern "handoffGenerator: dry_run"
    Assert-Contains -Output $dryRunOutput -Pattern "handoffPath:"
    if (Test-Path -LiteralPath $dryRunPath) {
        throw "Dry-run handoff must not create an output file."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 thread handoff smoke passed"
