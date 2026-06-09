param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ScriptRootOverride = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "phase-3-8-mechanism-closeout"
)

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

function Write-AcceptanceResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Output ""
    Write-Output "== Module Run v2 Autodrive Control Loop Acceptance =="
    Write-Output "autodriveAcceptanceDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "guardianFirst: active_owner_guarded_and_recovery_before_progress"
    Write-Output "selfRepair: cleanup_stale_artifacts_routed_to_repairAction"
    Write-Output "capabilityBoundary: provider_call_blocked_without_task_approval"
    Write-Output "threadBridgeBoundary: bridge_only_no_thread_tool"
    Write-Output "parallelBoundary: manifest_only_serial_integration"
    Write-Output "serialBoundary: validation_filter_before_execution"
    Write-Output "closeoutBoundary: structured_closeout_policy_only"
    Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Invoke-Script {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Arguments
    )

    $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $Path @Arguments 2>&1)
    return [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = $output }
}

try {
    $scriptRoot = $PSScriptRoot
    if (-not [string]::IsNullOrWhiteSpace($ScriptRootOverride)) {
        $scriptRoot = $ScriptRootOverride
    }

    $requiredScripts = @(
        @{ Id = "startup_readiness"; Path = "Test-ModuleRunV2AutomationStartupReadiness.ps1" },
        @{ Id = "recovery_self_repair"; Path = "Invoke-ModuleRunV2RecoverySelfRepair.ps1" },
        @{ Id = "agent_action_dispatcher"; Path = "Invoke-ModuleRunV2AgentActionDispatcher.ps1" },
        @{ Id = "serial_executor"; Path = "Invoke-ModuleRunV2SerialAutodriveExecutor.ps1" },
        @{ Id = "parallel_coordinator"; Path = "Invoke-ModuleRunV2ParallelCoordinatorExecutor.ps1" },
        @{ Id = "local_capability_gate"; Path = "Test-ModuleRunV2LocalCapabilityGate.ps1" },
        @{ Id = "codex_thread_bridge"; Path = "Test-ModuleRunV2CodexThreadBridgeReadiness.ps1" },
        @{ Id = "approved_closeout"; Path = "Invoke-ModuleRunV2ApprovedCloseout.ps1" }
    )

    foreach ($requiredScript in $requiredScripts) {
        $fullPath = Join-Path -Path $scriptRoot -ChildPath $requiredScript.Path
        if (-not (Test-Path -LiteralPath $fullPath)) {
            throw "Missing control-loop script: $($requiredScript.Id) at $fullPath"
        }

        Write-Output "controlLoopLayer: $($requiredScript.Id)"
    }

    $fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autodrive-acceptance-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

    try {
        $startupCleanupPath = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup.txt"
        @"
startupDecision: cleanup_stale_artifacts
reason: clean stale automation worktree cleanup is available
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $startupCleanupPath -Encoding UTF8
        $recoveryScriptPath = Join-Path -Path $scriptRoot -ChildPath "Invoke-ModuleRunV2RecoverySelfRepair.ps1"
        $recoveryResult = Invoke-Script -Path $recoveryScriptPath -Arguments @("-StartupOutputPath", $startupCleanupPath)
        if ($recoveryResult.ExitCode -ne 0) {
            throw "Recovery self-repair probe failed"
        }
        Assert-Contains -Output $recoveryResult.Output -Pattern "recoverySelfRepairDecision: self_repair_ready"
        Assert-Contains -Output $recoveryResult.Output -Pattern "repairAction: run_stopped_automation_hygiene_cleanup"

        $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
        @"
currentTask:
  id: default-task
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

        $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
        @"
tasks:
  - id: default-task
    capabilities:
      localDockerDatabase: task_approval_required
      projectResourceRead: task_approval_required
      providerKey: env_destination_confirmation_required
      providerCall: blocked_without_task_approval
      schemaMigration: blocked_without_task_approval
      costCalibrationGate: blocked
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8
        $capabilityScriptPath = Join-Path -Path $scriptRoot -ChildPath "Test-ModuleRunV2LocalCapabilityGate.ps1"
        $capabilityResult = Invoke-Script -Path $capabilityScriptPath -Arguments @(
            "-TaskId", "default-task",
            "-QueuePath", $queuePath,
            "-ProjectStatePath", $projectStatePath,
            "-Capability", "providerCall",
            "-Intent", "use_capability"
        )
        if ($capabilityResult.ExitCode -eq 0) {
            throw "Provider call capability probe should require manual approval"
        }
        Assert-Contains -Output $capabilityResult.Output -Pattern "localCapabilityDecision: manual_required"

        $handoffPath = Join-Path -Path $fixtureRoot -ChildPath "handoff.md"
        @"
thread rollover handoff:
latest task plan: docs/05-execution-logs/task-plans/acceptance.md
latest evidence: docs/05-execution-logs/evidence/acceptance.md
latest audit review: docs/05-execution-logs/audits-reviews/acceptance.md
blocked gates:
- Cost Calibration Gate remains blocked
read order:
1. AGENTS.md
2. docs/04-agent-system/state/project-state.yaml
"@ | Set-Content -LiteralPath $handoffPath -Encoding UTF8
        $threadBridgeScriptPath = Join-Path -Path $scriptRoot -ChildPath "Test-ModuleRunV2CodexThreadBridgeReadiness.ps1"
        $threadBridgeResult = Invoke-Script -Path $threadBridgeScriptPath -Arguments @(
            "-ThreadRolloverDecision", "require_new_thread",
            "-ThreadLaunchApproved",
            "-ThreadToolAvailable",
            "-HandoffPath", $handoffPath
        )
        if ($threadBridgeResult.ExitCode -ne 0) {
            throw "Thread bridge probe failed"
        }
        Assert-Contains -Output $threadBridgeResult.Output -Pattern "threadBridgeDecision: ready_for_agent_thread_launch"
        Assert-Contains -Output $threadBridgeResult.Output -Pattern "codexThreadAction: create_thread"
    } finally {
        if (Test-Path -LiteralPath $fixtureRoot) {
            Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
        }
    }

    Write-AcceptanceResult -Decision "accepted_with_guardrails" -Reason "control-loop layers and local guardrail probes passed" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-AcceptanceResult -Decision "stop_for_hard_block" -Reason "control-loop acceptance failed" -ExitCode 1
}
