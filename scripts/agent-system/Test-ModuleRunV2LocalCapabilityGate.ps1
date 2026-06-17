param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $true)]
    [ValidateSet("localDockerDatabase", "destructiveLocalDockerDatabase", "projectResourceRead", "providerKey", "providerCall", "schemaMigration", "localFullFlowGate", "costCalibrationGate")]
    [string]$Capability,

    [Parameter(Mandatory = $false)]
    [ValidateSet("declare_adapter", "use_capability")]
    [string]$Intent = "declare_adapter",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "no-executable-task-seed-or-approve-next-task"
)

$ErrorActionPreference = "Stop"

function Get-CurrentTaskId {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines
    )

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            break
        }

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Id
    )

    $startIndex = -1
    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+$([regex]::Escape($Id))\s*$") {
            $startIndex = $lineIndex
            break
        }
    }

    if ($startIndex -lt 0) {
        return @()
    }

    $endIndex = $Lines.Count
    for ($lineIndex = $startIndex + 1; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+\S+") {
            $endIndex = $lineIndex
            break
        }
    }

    return $Lines[$startIndex..($endIndex - 1)]
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $values = New-Object System.Collections.ArrayList
    $inList = $false
    $baseIndent = 0

    foreach ($line in $Block) {
        if (-not $inList -and $line -match "^(\s+)$([regex]::Escape($Key)):\s*$") {
            $inList = $true
            $baseIndent = $Matches[1].Length
            continue
        }

        if ($inList) {
            if ($line -match "^(\s*)\S") {
                $indent = $Matches[1].Length
                if ($indent -le $baseIndent) {
                    break
                }
            }

            if ($line -match "^\s*-\s+(.+?)\s*$") {
                [void]$values.Add($Matches[1].Trim())
            }
        }
    }

    return @($values)
}

function Test-LocalFullFlowCommandTargets {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Commands
    )

    foreach ($command in $Commands) {
        if ($command -match "(?i)\b(staging|prod|cloud|external-service)\b") {
            return [pscustomobject]@{
                Passed = $false
                Reason = "local full-flow command mentions blocked non-local target"
            }
        }

        $urlMatches = [regex]::Matches($command, "https?://([^/\s'`"]+)")
        foreach ($urlMatch in $urlMatches) {
            $targetHost = ""
            try {
                $targetHost = ([System.Uri]$urlMatch.Value).Host.ToLowerInvariant()
            } catch {
                $targetHost = $urlMatch.Groups[1].Value.Trim("[]").ToLowerInvariant()
            }
            if ($targetHost -notin @("localhost", "127.0.0.1", "::1")) {
                return [pscustomobject]@{
                    Passed = $false
                    Reason = "local full-flow command targets non-localhost host: $targetHost"
                }
            }
        }
    }

    return [pscustomobject]@{
        Passed = $true
        Reason = "local full-flow commands are localhost-only"
    }
}

function Test-LocalFullFlowProfileGate {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$TaskBlock
    )

    $executionProfile = Get-ScalarValue -Block $TaskBlock -Key "executionProfile"
    $validationPolicy = Get-ScalarValue -Block $TaskBlock -Key "validationPolicy"
    $localFullFlowGate = Get-ScalarValue -Block $TaskBlock -Key "localFullFlowGate"
    $validationCommands = @(Get-ListValues -Block $TaskBlock -Key "validationCommands")

    if ($executionProfile -ne "local_full_flow") {
        return [pscustomobject]@{
            Passed = $false
            Reason = "localFullFlowGate use requires executionProfile local_full_flow"
        }
    }

    if ($validationPolicy -ne "local_full_flow") {
        return [pscustomobject]@{
            Passed = $false
            Reason = "localFullFlowGate use requires validationPolicy local_full_flow"
        }
    }

    if ($localFullFlowGate -ne "approved_localhost_only") {
        return [pscustomobject]@{
            Passed = $false
            Reason = "localFullFlowGate use requires approved_localhost_only"
        }
    }

    if ($validationCommands.Count -eq 0) {
        return [pscustomobject]@{
            Passed = $false
            Reason = "localFullFlowGate use requires explicit validationCommands"
        }
    }

    return Test-LocalFullFlowCommandTargets -Commands $validationCommands
}

function Get-CapabilityPolicy {
    param([Parameter(Mandatory = $true)][string]$Name)

    $policies = @{
        localDockerDatabase = @{
            DefaultState = "task_approval_required"
            ApprovedState = "approved_local_dev_only"
            ReadyAction = "local_dev_db_adapter_ready_no_execution"
            ApprovalAction = "local_db_task_approval_required"
            BlockedActions = @("schema_migration", "destructive_data_operation", "staging_prod_connection")
            EvidenceRule = "local dev only; no schema, migration, destructive data, staging, or prod connection"
        }
        destructiveLocalDockerDatabase = @{
            DefaultState = "blocked_without_task_approval"
            ApprovedState = "approved_destructive_local_dev_only"
            ReadyAction = "destructive_local_dev_db_adapter_ready_no_execution"
            ApprovalAction = "destructive_local_db_task_approval_required"
            BlockedActions = @("staging_prod_connection", "database_url_evidence", "unscoped_destructive_operation")
            EvidenceRule = "task-specific destructive local Docker dev DB approval, operation kind, target alias, backup/disposable rationale, rollback/recovery, and redacted evidence are required"
        }
        projectResourceRead = @{
            DefaultState = "task_approval_required"
            ApprovedState = "approved_read_only_redacted"
            ReadyAction = "read_only_redacted_resource_adapter_ready_no_execution"
            ApprovalAction = "resource_read_task_approval_required"
            BlockedActions = @("full_paper_content", "raw_answer_text", "cleartext_redeem_code")
            EvidenceRule = "read-only metadata or redacted snippets only; no full paper or raw answer content in evidence"
        }
        providerKey = @{
            DefaultState = "env_destination_confirmation_required"
            ApprovedState = "approved_confirmed_local_destination"
            ReadyAction = "provider_key_destination_confirmed_no_env_write"
            ApprovalAction = "env_destination_confirmation_required"
            BlockedActions = @("env_write", "secret_read", "secret_output")
            EvidenceRule = "destination confirmation only; no env file write or secret output"
        }
        providerCall = @{
            DefaultState = "blocked_without_task_approval"
            ApprovedState = "approved_redacted_local_validation"
            ReadyAction = "provider_call_redacted_local_validation_ready_no_execution"
            ApprovalAction = "provider_call_task_approval_required"
            BlockedActions = @("unapproved_provider_call", "unbounded_quota", "raw_payload_evidence")
            EvidenceRule = "task approval, quota statement, and redacted evidence are required before any real provider call"
        }
        schemaMigration = @{
            DefaultState = "blocked_without_task_approval"
            ApprovedState = "approved_migration_plan"
            ReadyAction = "schema_migration_plan_ready_no_execution"
            ApprovalAction = "schema_migration_gate_required"
            BlockedActions = @("drizzle_push", "destructive_data_operation", "staging_prod_connection")
            EvidenceRule = "migration plan, rollback/recovery boundary, scoped schema/drizzle files, local DB operation approval when needed, and redacted evidence are required"
        }
        localFullFlowGate = @{
            DefaultState = "blocked_without_task_profile"
            ApprovedState = "approved_localhost_only"
            ReadyAction = "local_full_flow_localhost_adapter_ready_no_execution"
            ApprovalAction = "local_full_flow_task_profile_required"
            BlockedActions = @("staging_prod_connection", "cloud_external_service", "provider_call", "non_localhost_target", "private_data_fixture")
            EvidenceRule = "local full-flow is localhost or 127.0.0.1 only, uses local disposable fixtures, and does not imply staging or production readiness"
        }
        costCalibrationGate = @{
            DefaultState = "blocked"
            ApprovedState = "not_supported_by_default"
            ReadyAction = "cost_calibration_gate_blocked"
            ApprovalAction = "cost_calibration_gate_blocked"
            BlockedActions = @("cost_calibration_gate", "provider_cost_measurement", "real_provider_measurement")
            EvidenceRule = "Cost Calibration Gate remains blocked pending fresh explicit approval"
        }
    }

    return $policies[$Name]
}

function Write-CapabilityResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$AdapterAction,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $true)][string]$CapabilityState,
        [Parameter(Mandatory = $true)][hashtable]$Policy,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ExtraOutput = @()
    )

    Write-Output ""
    Write-Output "== Module Run v2 Local Capability Gate =="
    Write-Output "taskId: $TaskId"
    Write-Output "capability: $Capability"
    Write-Output "intent: $Intent"
    Write-Output "capabilityState: $CapabilityState"
    Write-Output "localCapabilityDecision: $Decision"
    Write-Output "adapterAction: $AdapterAction"
    Write-Output "reason: $Reason"
    foreach ($blockedAction in @($Policy.BlockedActions)) {
        Write-Output "blockedAdapterAction: $blockedAction"
    }
    foreach ($extraLine in @($ExtraOutput)) {
        if (-not [string]::IsNullOrWhiteSpace($extraLine)) {
            Write-Output $extraLine
        }
    }
    Write-Output "evidenceRule: $($Policy.EvidenceRule)"
    Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

try {
    foreach ($requiredPath in @($ProjectStatePath, $QueuePath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            throw "Missing required file: $requiredPath"
        }
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        throw "TaskId is required when currentTask.id is unavailable."
    }

    $taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        throw "Task not found in queue: $TaskId"
    }

    $policy = Get-CapabilityPolicy -Name $Capability
    $capabilityState = Get-ScalarValue -Block $taskBlock -Key $Capability
    if ([string]::IsNullOrWhiteSpace($capabilityState)) {
        Write-CapabilityResult -Decision "stop_for_hard_block" -AdapterAction "none" -Reason "capability state is missing from task queue" -ExitCode 1 -CapabilityState "missing" -Policy $policy
    }

    $knownStates = @($policy.DefaultState, $policy.ApprovedState)
    if ($capabilityState -notin $knownStates) {
        Write-CapabilityResult -Decision "stop_for_hard_block" -AdapterAction "none" -Reason "capability state is not in the approved schema" -ExitCode 1 -CapabilityState $capabilityState -Policy $policy
    }

    if ($Capability -eq "costCalibrationGate") {
        Write-CapabilityResult -Decision "stop_for_hard_block" -AdapterAction "none" -Reason "Cost Calibration Gate remains blocked by default" -ExitCode 1 -CapabilityState $capabilityState -Policy $policy
    }

    if ($Intent -eq "declare_adapter") {
        $adapterAction = "no_execution"
        if ($capabilityState -eq $policy.DefaultState) {
            $adapterAction = "no_execution_$($policy.ApprovalAction)"
        }

        Write-CapabilityResult -Decision "adapter_contract_ready" -AdapterAction $adapterAction -Reason "adapter contract can be declared without executing the capability" -ExitCode 0 -CapabilityState $capabilityState -Policy $policy
    }

    if ($Capability -eq "localFullFlowGate" -and $Intent -eq "use_capability" -and $capabilityState -eq $policy.ApprovedState) {
        $localFullFlowProfileGate = Test-LocalFullFlowProfileGate -TaskBlock $taskBlock
        if (-not $localFullFlowProfileGate.Passed) {
            Write-CapabilityResult -Decision "stop_for_hard_block" -AdapterAction "none" -Reason $localFullFlowProfileGate.Reason -ExitCode 1 -CapabilityState $capabilityState -Policy $policy
        }

        Write-CapabilityResult `
            -Decision "capability_ready" `
            -AdapterAction $policy.ReadyAction `
            -Reason "task-specific local full-flow profile approval is present; this script still performs no real local action" `
            -ExitCode 0 `
            -CapabilityState $capabilityState `
            -Policy $policy `
            -ExtraOutput @(
                "allowedLocalFullFlowHost: localhost",
                "allowedLocalFullFlowHost: 127.0.0.1",
                "allowedLocalFullFlowHost: ::1"
            )
    }

    if ($capabilityState -eq $policy.ApprovedState) {
        Write-CapabilityResult -Decision "capability_ready" -AdapterAction $policy.ReadyAction -Reason "task-specific capability approval is present; this script still performs no real local action" -ExitCode 0 -CapabilityState $capabilityState -Policy $policy
    }

    Write-CapabilityResult -Decision "manual_required" -AdapterAction $policy.ApprovalAction -Reason "task-specific capability approval is required before use" -ExitCode 1 -CapabilityState $capabilityState -Policy $policy
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    $fallbackPolicy = Get-CapabilityPolicy -Name $Capability
    Write-CapabilityResult -Decision "stop_for_hard_block" -AdapterAction "none" -Reason "local capability gate encountered an error" -ExitCode 1 -CapabilityState "unknown" -Policy $fallbackPolicy
}
