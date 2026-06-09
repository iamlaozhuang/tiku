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

function Invoke-Recovery {
    param(
        [Parameter(Mandatory = $true)]
        [string]$StartupOutputPath
    )

    $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath -StartupOutputPath $StartupOutputPath 2>&1)
    return [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = $output }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2RecoverySelfRepair.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing recovery self-repair script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-recovery-self-repair-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $cleanupStartupPath = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup.txt"
    @"
startupDecision: cleanup_stale_artifacts
reason: clean stale automation worktree cleanup is available
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $cleanupStartupPath -Encoding UTF8
    $cleanupResult = Invoke-Recovery -StartupOutputPath $cleanupStartupPath
    if ($cleanupResult.ExitCode -ne 0) {
        throw "Expected cleanup recovery decision to pass"
    }
    Assert-Contains -Output $cleanupResult.Output -Pattern "recoverySelfRepairDecision: self_repair_ready"
    Assert-Contains -Output $cleanupResult.Output -Pattern "repairAction: run_stopped_automation_hygiene_cleanup"

    $activeOwnerStartupPath = Join-Path -Path $fixtureRoot -ChildPath "startup-active-owner.txt"
    @"
startupDecision: exit_active_owner_present
reason: active owner has a fresh heartbeat
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $activeOwnerStartupPath -Encoding UTF8
    $activeOwnerResult = Invoke-Recovery -StartupOutputPath $activeOwnerStartupPath
    if ($activeOwnerResult.ExitCode -ne 0) {
        throw "Expected active owner recovery decision to exit quietly"
    }
    Assert-Contains -Output $activeOwnerResult.Output -Pattern "recoverySelfRepairDecision: exit_active_owner_present"
    Assert-Contains -Output $activeOwnerResult.Output -Pattern "repairAction: none"

    $continueStartupPath = Join-Path -Path $fixtureRoot -ChildPath "startup-continue.txt"
    @"
startupDecision: continue_current_task
reason: current task is in progress
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $continueStartupPath -Encoding UTF8
    $continueResult = Invoke-Recovery -StartupOutputPath $continueStartupPath
    if ($continueResult.ExitCode -ne 0) {
        throw "Expected continue recovery decision to pass"
    }
    Assert-Contains -Output $continueResult.Output -Pattern "recoverySelfRepairDecision: continue_without_repair"

    $postCloseoutStartupPath = Join-Path -Path $fixtureRoot -ChildPath "startup-post-closeout.txt"
    @"
startupDecision: closeout_recovery
startupStateWarning: lastKnownMasterSha is an accepted ancestor of master
postCloseoutStateReconciliation: recommended master
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $postCloseoutStartupPath -Encoding UTF8
    $postCloseoutResult = Invoke-Recovery -StartupOutputPath $postCloseoutStartupPath
    if ($postCloseoutResult.ExitCode -ne 0) {
        throw "Expected post-closeout recovery decision to pass"
    }
    Assert-Contains -Output $postCloseoutResult.Output -Pattern "recoverySelfRepairDecision: self_repair_ready"
    Assert-Contains -Output $postCloseoutResult.Output -Pattern "repairAction: confirm_post_closeout_checkpoint"

    $manualStartupPath = Join-Path -Path $fixtureRoot -ChildPath "startup-manual.txt"
    @"
startupDecision: no_executable_task
reason: no in-progress or pending task is available
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $manualStartupPath -Encoding UTF8
    $manualResult = Invoke-Recovery -StartupOutputPath $manualStartupPath
    if ($manualResult.ExitCode -ne 0) {
        throw "Expected no executable task recovery decision to pass"
    }
    Assert-Contains -Output $manualResult.Output -Pattern "recoverySelfRepairDecision: continue_without_repair"

    $hardBlockStartupPath = Join-Path -Path $fixtureRoot -ChildPath "startup-hard-block.txt"
    @"
startupDecision: stop_for_hard_block
reason: startup readiness failed
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $hardBlockStartupPath -Encoding UTF8
    $hardBlockResult = Invoke-Recovery -StartupOutputPath $hardBlockStartupPath
    if ($hardBlockResult.ExitCode -eq 0) {
        throw "Expected hard block recovery decision to fail"
    }
    Assert-Contains -Output $hardBlockResult.Output -Pattern "recoverySelfRepairDecision: stop_for_hard_block"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 recovery self-repair smoke passed"
