param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("continue_current_thread", "suggest_new_thread", "require_new_thread", "stop_for_human_handoff")]
    [string]$ThreadRolloverDecision = "continue_current_thread",

    [Parameter(Mandatory = $false)]
    [string]$HandoffPath = "",

    [Parameter(Mandatory = $false)]
    [switch]$ThreadLaunchApproved,

    [Parameter(Mandatory = $false)]
    [switch]$ThreadToolAvailable,

    [Parameter(Mandatory = $false)]
    [switch]$ContinueAllowedOnSuggest,

    [Parameter(Mandatory = $false)]
    [string]$ThreadLaunchPolicyOutputPath = "",

    [Parameter(Mandatory = $false)]
    [string]$StartupOutputPath = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "ai-task-and-provider"
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

function Write-BridgeResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Action,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$StartupDecision = "",
        [Parameter(Mandatory = $false)][string]$ThreadLaunchDecision = "",
        [Parameter(Mandatory = $false)][string]$RedactedHandoff = "not_checked"
    )

    Write-Output ""
    Write-Output "== Module Run v2 Codex Thread Bridge Readiness =="
    Write-Output "threadBridgeDecision: $Decision"
    Write-Output "codexThreadAction: $Action"
    Write-Output "reason: $Reason"
    Write-Output "threadRolloverDecision: $ThreadRolloverDecision"
    if (-not [string]::IsNullOrWhiteSpace($StartupDecision)) {
        Write-Output "startupDecision: $StartupDecision"
    }
    if (-not [string]::IsNullOrWhiteSpace($ThreadLaunchDecision)) {
        Write-Output "threadLaunchDecision: $ThreadLaunchDecision"
    }
    Write-Output "redactedHandoff: $RedactedHandoff"
    if (-not [string]::IsNullOrWhiteSpace($HandoffPath)) {
        Write-Output "handoffPath: $HandoffPath"
    }
    Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
    Write-Output "threadToolRequired: create_thread"
    Write-Output "threadToolOptional: send_message_to_thread"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Test-HandoffRedaction {
    param([Parameter(Mandatory = $true)][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path -LiteralPath $Path)) {
        return [pscustomobject]@{ IsReady = $false; Reason = "handoff file is missing" }
    }

    $handoffContent = Get-Content -LiteralPath $Path -Raw
    $requiredAnchors = @(
        "thread rollover handoff:",
        "read order:",
        "latest evidence:",
        "latest audit review:",
        "blocked gates:",
        "Cost Calibration Gate remains blocked"
    )

    foreach ($anchor in $requiredAnchors) {
        if ($handoffContent -notmatch [regex]::Escape($anchor)) {
            return [pscustomobject]@{ IsReady = $false; Reason = "handoff is missing required anchor: $anchor" }
        }
    }

    $sensitivePatterns = @(
        "(?i)Authorization\s*:",
        "(?i)\bBearer\s+[A-Za-z0-9._~+/=-]+",
        "(?i)\bDATABASE_URL\s*=",
        "(?i)\b(password|secret|token)\s*[:=]",
        "(?i)\b(api[_-]?key|apiKey)\s*[:=]",
        "(?i)\.env\.local",
        "(?i)\bredeem_code\s*[:=]",
        "(?i)provider payload",
        "(?i)raw prompt",
        "(?i)raw generated"
    )

    foreach ($pattern in $sensitivePatterns) {
        if ($handoffContent -match $pattern) {
            return [pscustomobject]@{ IsReady = $false; Reason = "handoff contains a blocked sensitive pattern" }
        }
    }

    return [pscustomobject]@{ IsReady = $true; Reason = "handoff shape and redaction checks passed" }
}

function Invoke-ThreadLaunchPolicy {
    $policyScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ThreadLaunchPolicy.ps1"
    if (-not (Test-Path -LiteralPath $policyScriptPath)) {
        return [pscustomobject]@{
            ExitCode = 1
            Output = @("threadLaunchDecision: stop_for_human_handoff", "reason: missing thread launch policy script")
        }
    }

    $policyArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $policyScriptPath,
        "-ThreadRolloverDecision",
        $ThreadRolloverDecision,
        "-NextModuleRunCandidate",
        $NextModuleRunCandidate
    )

    if (-not [string]::IsNullOrWhiteSpace($HandoffPath)) {
        $policyArgs += @("-HandoffPath", $HandoffPath)
    }
    if ($ThreadLaunchApproved) {
        $policyArgs += "-ThreadLaunchApproved"
    }
    if ($ThreadToolAvailable) {
        $policyArgs += "-ThreadToolAvailable"
    }
    if ($ContinueAllowedOnSuggest) {
        $policyArgs += "-ContinueAllowedOnSuggest"
    }

    $policyOutput = @(& powershell.exe @policyArgs 2>&1)
    return [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = $policyOutput }
}

try {
    $startupDecision = ""
    if (-not [string]::IsNullOrWhiteSpace($StartupOutputPath)) {
        if (-not (Test-Path -LiteralPath $StartupOutputPath)) {
            Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason "startup output file is missing" -ExitCode 1 -RedactedHandoff "not_checked"
        }

        $startupOutput = @(Get-Content -LiteralPath $StartupOutputPath)
        $startupDecision = Get-KeyValue -Lines $startupOutput -Key "startupDecision"
        if ([string]::IsNullOrWhiteSpace($startupDecision)) {
            Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason "startup output lacks startupDecision" -ExitCode 1 -RedactedHandoff "not_checked"
        }

        if ($startupDecision -in @("exit_active_owner_present", "stop_existing_run_active")) {
            Write-BridgeResult -Decision "exit_active_owner_present" -Action "none" -Reason "active owner or active lease already owns the automation lane" -ExitCode 0 -StartupDecision $startupDecision -RedactedHandoff "not_checked"
        }

        if ($startupDecision -in @("stop_for_hard_block", "stop_for_manual_decision", "no_executable_task")) {
            Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason "startup readiness does not allow thread bridge continuation" -ExitCode 1 -StartupDecision $startupDecision -RedactedHandoff "not_checked"
        }

        if ($startupDecision -eq "cleanup_stale_artifacts") {
            Write-BridgeResult -Decision "manual_required" -Action "none" -Reason "stopped automation hygiene cleanup must run before thread launch readiness" -ExitCode 1 -StartupDecision $startupDecision -RedactedHandoff "not_checked"
        }
    }

    $policyOutput = @()
    $policyExitCode = 0
    if (-not [string]::IsNullOrWhiteSpace($ThreadLaunchPolicyOutputPath)) {
        if (-not (Test-Path -LiteralPath $ThreadLaunchPolicyOutputPath)) {
            Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason "thread launch policy output file is missing" -ExitCode 1 -StartupDecision $startupDecision -RedactedHandoff "not_checked"
        }
        $policyOutput = @(Get-Content -LiteralPath $ThreadLaunchPolicyOutputPath)
    } else {
        $policyResult = Invoke-ThreadLaunchPolicy
        $policyExitCode = [int]$policyResult.ExitCode
        $policyOutput = @($policyResult.Output)
    }

    $threadLaunchDecision = Get-KeyValue -Lines $policyOutput -Key "threadLaunchDecision"
    if ([string]::IsNullOrWhiteSpace($threadLaunchDecision)) {
        Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason "thread launch policy did not emit threadLaunchDecision" -ExitCode 1 -StartupDecision $startupDecision -RedactedHandoff "not_checked"
    }

    if ($policyExitCode -ne 0 -or $threadLaunchDecision -eq "stop_for_human_handoff") {
        Write-BridgeResult -Decision "manual_required" -Action "none" -Reason "thread launch policy requires human handoff" -ExitCode 1 -StartupDecision $startupDecision -ThreadLaunchDecision $threadLaunchDecision -RedactedHandoff "not_checked"
    }

    if ($threadLaunchDecision -eq "continue_current_thread") {
        Write-BridgeResult -Decision "continue_current_thread" -Action "none" -Reason "same-thread continuation is allowed by policy" -ExitCode 0 -StartupDecision $startupDecision -ThreadLaunchDecision $threadLaunchDecision -RedactedHandoff "not_required"
    }

    if ($threadLaunchDecision -in @("prepare_handoff", "prepare_handoff_then_continue")) {
        Write-BridgeResult -Decision "prepare_handoff" -Action "none" -Reason "handoff should be prepared before a thread launch decision is executable" -ExitCode 0 -StartupDecision $startupDecision -ThreadLaunchDecision $threadLaunchDecision -RedactedHandoff "not_verified"
    }

    if ($threadLaunchDecision -eq "launch_new_thread") {
        $handoffCheck = Test-HandoffRedaction -Path $HandoffPath
        if (-not $handoffCheck.IsReady) {
            Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason $handoffCheck.Reason -ExitCode 1 -StartupDecision $startupDecision -ThreadLaunchDecision $threadLaunchDecision -RedactedHandoff "unsafe"
        }

        Write-BridgeResult -Decision "ready_for_agent_thread_launch" -Action "create_thread" -Reason "launch policy, tool availability, approval, and redacted handoff are ready" -ExitCode 0 -StartupDecision $startupDecision -ThreadLaunchDecision $threadLaunchDecision -RedactedHandoff "verified"
    }

    Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason "unknown thread launch policy decision" -ExitCode 1 -StartupDecision $startupDecision -ThreadLaunchDecision $threadLaunchDecision -RedactedHandoff "not_checked"
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-BridgeResult -Decision "stop_for_hard_block" -Action "none" -Reason "thread bridge readiness encountered an error" -ExitCode 1 -RedactedHandoff "not_checked"
}
