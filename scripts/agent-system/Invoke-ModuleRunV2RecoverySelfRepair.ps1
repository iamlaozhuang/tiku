param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$StartupOutputPath = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$StartupReadinessScriptPath = "",

    [Parameter(Mandatory = $false)]
    [switch]$Execute,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "full-autodrive-control-loop-acceptance"
)

$ErrorActionPreference = "Stop"

function Get-KeyValue {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Lines) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Test-ContainsPattern {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Lines | Where-Object { $_ -match $Pattern }
    return $matched.Count -gt 0
}

function Write-RecoveryResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$RepairAction,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $true)][string]$StartupDecision
    )

    Write-Output ""
    Write-Output "== Module Run v2 Recovery Self-Repair =="
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        Write-Output "taskId: $TaskId"
    }
    Write-Output "startupDecision: $StartupDecision"
    Write-Output "recoverySelfRepairDecision: $Decision"
    Write-Output "repairAction: $RepairAction"
    Write-Output "executeRequested: $($Execute.ToString().ToLowerInvariant())"
    Write-Output "reason: $Reason"
    Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-StartupOutput {
    if (-not [string]::IsNullOrWhiteSpace($StartupOutputPath)) {
        if (-not (Test-Path -LiteralPath $StartupOutputPath)) {
            throw "Startup output file is missing: $StartupOutputPath"
        }

        return @(Get-Content -LiteralPath $StartupOutputPath)
    }

    if ([string]::IsNullOrWhiteSpace($StartupReadinessScriptPath)) {
        $StartupReadinessScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2AutomationStartupReadiness.ps1"
    }

    if (-not (Test-Path -LiteralPath $StartupReadinessScriptPath)) {
        throw "Startup readiness script is missing: $StartupReadinessScriptPath"
    }

    $startupArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $StartupReadinessScriptPath
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $startupArgs += @("-TaskId", $TaskId)
    }

    return @(& powershell.exe @startupArgs 2>&1)
}

try {
    if ($Execute) {
        Write-RecoveryResult -Decision "manual_required" -RepairAction "execution_requires_task_specific_approval" -Reason "Phase 7 implements recovery decisions only; execution is intentionally disabled" -ExitCode 1 -StartupDecision "not_evaluated"
    }

    $startupOutput = @(Get-StartupOutput)
    $startupDecision = Get-KeyValue -Lines $startupOutput -Key "startupDecision"
    if ([string]::IsNullOrWhiteSpace($startupDecision)) {
        Write-RecoveryResult -Decision "stop_for_hard_block" -RepairAction "none" -Reason "startup output did not include startupDecision" -ExitCode 1 -StartupDecision "missing"
    }

    $hasPostCloseoutStateReconciliation = Test-ContainsPattern -Lines $startupOutput -Pattern "postCloseoutStateReconciliation:\s*recommended"
    if ($startupDecision -eq "cleanup_stale_artifacts") {
        Write-RecoveryResult -Decision "self_repair_ready" -RepairAction "run_stopped_automation_hygiene_cleanup" -Reason "startup found clean stale automation artifacts that are routed to the stopped automation hygiene gate" -ExitCode 0 -StartupDecision $startupDecision
    }

    if ($startupDecision -eq "adopt_recoverable_run") {
        Write-RecoveryResult -Decision "self_repair_ready" -RepairAction "adopt_recoverable_run_after_redacted_handoff_audit" -Reason "startup found an adoptable run with a redacted handoff" -ExitCode 0 -StartupDecision $startupDecision
    }

    if ($startupDecision -eq "open_recovery_plan") {
        Write-RecoveryResult -Decision "self_repair_ready" -RepairAction "open_recovery_plan" -Reason "startup found a recoverable run that needs a recovery plan before edits" -ExitCode 0 -StartupDecision $startupDecision
    }

    if ($startupDecision -in @("exit_active_owner_present", "stop_existing_run_active")) {
        Write-RecoveryResult -Decision "exit_active_owner_present" -RepairAction "none" -Reason "another active owner or lease owns the automation lane" -ExitCode 0 -StartupDecision $startupDecision
    }

    if ($hasPostCloseoutStateReconciliation -and $startupDecision -eq "closeout_recovery") {
        Write-RecoveryResult -Decision "self_repair_ready" -RepairAction "reconcile_post_closeout_state_sha" -Reason "post-closeout state SHA drift is repairable when Git reality is an accepted ancestor path" -ExitCode 0 -StartupDecision $startupDecision
    }

    if ($startupDecision -in @("continue_current_task", "prepare_next_task", "closeout_recovery")) {
        Write-RecoveryResult -Decision "continue_without_repair" -RepairAction "none" -Reason "startup is executable and no recovery repair must run first" -ExitCode 0 -StartupDecision $startupDecision
    }

    if ($startupDecision -in @("stop_for_manual_decision", "no_executable_task")) {
        Write-RecoveryResult -Decision "manual_required" -RepairAction "none" -Reason "startup requires a human decision or has no executable task" -ExitCode 1 -StartupDecision $startupDecision
    }

    Write-RecoveryResult -Decision "stop_for_hard_block" -RepairAction "none" -Reason "startup returned a hard block or unknown state" -ExitCode 1 -StartupDecision $startupDecision
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-RecoveryResult -Decision "stop_for_hard_block" -RepairAction "none" -Reason "recovery self-repair encountered an error" -ExitCode 1 -StartupDecision "unknown"
}
