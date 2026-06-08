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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ThreadLaunchPolicy.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing thread launch policy script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-thread-launch-policy-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $handoffPath = Join-Path -Path $fixtureRoot -ChildPath "handoff.md"
    "thread rollover handoff:" | Set-Content -LiteralPath $handoffPath -Encoding UTF8

    $continueOutput = @(& $scriptPath -ThreadRolloverDecision "continue_current_thread")
    Assert-Contains -Output $continueOutput -Pattern "threadLaunchDecision: continue_current_thread"

    $prepareOutput = @(& $scriptPath -ThreadRolloverDecision "suggest_new_thread")
    Assert-Contains -Output $prepareOutput -Pattern "threadLaunchDecision: prepare_handoff"

    $launchOutput = @(& $scriptPath -ThreadRolloverDecision "require_new_thread" -ThreadLaunchApproved -ThreadToolAvailable -HandoffPath $handoffPath)
    Assert-Contains -Output $launchOutput -Pattern "threadLaunchDecision: launch_new_thread"
    Assert-Contains -Output $launchOutput -Pattern "create_thread"

    Invoke-ExpectFailure -ExpectedPattern "threadLaunchDecision: stop_for_human_handoff" -Command {
        & $scriptPath -ThreadRolloverDecision "require_new_thread" -HandoffPath $handoffPath
    }

    Invoke-ExpectFailure -ExpectedPattern "threadLaunchDecision: stop_for_human_handoff" -Command {
        & $scriptPath -ThreadRolloverDecision "stop_for_human_handoff"
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 thread launch policy smoke passed"

