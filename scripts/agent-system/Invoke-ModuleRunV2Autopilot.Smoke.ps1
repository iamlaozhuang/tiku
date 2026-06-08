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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2Autopilot.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing autopilot orchestrator script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autopilot-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $handoffPath = Join-Path -Path $fixtureRoot -ChildPath "handoff.md"

    $continueOutput = @(& $scriptPath -CompletedBatchCount 2 -SkipUnattendedReadiness -HandoffPath $handoffPath)
    Assert-Contains -Output $continueOutput -Pattern "autopilotDecision: continue_current_thread"

    $suggestOutput = @(& $scriptPath -CompletedBatchCount 4 -SkipUnattendedReadiness -HandoffPath $handoffPath)
    Assert-Contains -Output $suggestOutput -Pattern "autopilotDecision: prepare_handoff_then_continue"
    Assert-Contains -Output $suggestOutput -Pattern "nextModuleRunCandidate: ai-task-and-provider"

    Invoke-ExpectFailure -ExpectedPattern "autopilotDecision: stop_for_human_handoff" -Command {
        & $scriptPath -CompletedBatchCount 6 -SkipUnattendedReadiness -HandoffPath $handoffPath
    }

    $launchOutput = @(& $scriptPath -CompletedBatchCount 6 -SkipUnattendedReadiness -HandoffPath $handoffPath -ThreadLaunchApproved -ThreadToolAvailable)
    Assert-Contains -Output $launchOutput -Pattern "autopilotDecision: launch_new_thread"
    Assert-Contains -Output $launchOutput -Pattern "handoffPath:"
    Assert-Contains -Output $launchOutput -Pattern "Cost Calibration Gate remains blocked"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 autopilot smoke passed"

