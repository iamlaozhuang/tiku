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

function Invoke-Acceptance {
    param(
        [Parameter(Mandatory = $false)]
        [AllowEmptyCollection()]
        [string[]]$ScriptArguments = @()
    )

    $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath @ScriptArguments 2>&1)
    return [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = $output }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing autodrive acceptance script: $scriptPath"
}

$acceptanceResult = Invoke-Acceptance
if ($acceptanceResult.ExitCode -ne 0) {
    throw "Expected autodrive control-loop acceptance to pass"
}
Assert-Contains -Output $acceptanceResult.Output -Pattern "autodriveAcceptanceDecision: accepted_with_guardrails"
Assert-Contains -Output $acceptanceResult.Output -Pattern "controlLoopLayer: startup_readiness"
Assert-Contains -Output $acceptanceResult.Output -Pattern "selfRepair: cleanup_stale_artifacts_routed_to_repairAction"
Assert-Contains -Output $acceptanceResult.Output -Pattern "capabilityBoundary: provider_call_blocked_without_task_approval"
Assert-Contains -Output $acceptanceResult.Output -Pattern "threadBridgeBoundary: bridge_only_no_thread_tool"
Assert-Contains -Output $acceptanceResult.Output -Pattern "Cost Calibration Gate remains blocked"

$missingRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autodrive-missing-root-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $missingRoot | Out-Null
try {
    $missingResult = Invoke-Acceptance -ScriptArguments @("-ScriptRootOverride", $missingRoot)
    if ($missingResult.ExitCode -eq 0) {
        throw "Expected missing control-loop layer to fail"
    }
    Assert-Contains -Output $missingResult.Output -Pattern "autodriveAcceptanceDecision: stop_for_hard_block"
} finally {
    if (Test-Path -LiteralPath $missingRoot) {
        Remove-Item -LiteralPath $missingRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 autodrive control-loop acceptance smoke passed"
