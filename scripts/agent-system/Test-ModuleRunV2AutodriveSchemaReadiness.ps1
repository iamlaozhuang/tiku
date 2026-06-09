param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$SchemaPath = "docs\04-agent-system\state\autodrive-control-schema.yaml"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Add-Finding {
    param([Parameter(Mandatory = $true)][string]$Message)

    $script:findings.Add($Message)
    Write-Output $Message
}

function Write-AutodriveSchemaResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "autodriveSchemaDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Remove-ValueQuotes {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    $trimmedValue = $Value.Trim()
    if ($trimmedValue.Length -ge 2) {
        $firstChar = $trimmedValue.Substring(0, 1)
        $lastChar = $trimmedValue.Substring($trimmedValue.Length - 1, 1)
        if (($firstChar -eq '"' -and $lastChar -eq '"') -or ($firstChar -eq "'" -and $lastChar -eq "'")) {
            return $trimmedValue.Substring(1, $trimmedValue.Length - 2)
        }
    }

    return $trimmedValue
}

function Get-TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $currentId = ""
    $currentLines = New-Object System.Collections.Generic.List[string]

    foreach ($line in $Lines) {
        if ($line -match "^\s+- id:\s+(.+?)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentId)) {
                $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
            }
            $currentId = Remove-ValueQuotes -Value $Matches[1]
            $currentLines = New-Object System.Collections.Generic.List[string]
            $currentLines.Add($line)
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId)) {
            $currentLines.Add($line)
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentId)) {
        $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
    }

    return $blocks.ToArray()
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)][object[]]$Blocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($block in $Blocks) {
        if ($block.Id -eq $Id) {
            return $block.Lines
        }
    }

    return @()
}

function Get-CurrentTaskId {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            break
        }

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+)\s*$") {
            return Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return ""
}

function Get-TaskScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return ""
}

function Get-TaskListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s{6}-\s+(.+?)\s*$") {
            $values.Add((Remove-ValueQuotes -Value $Matches[1]))
            continue
        }

        if ($insideList -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
}

function Get-TaskValidationLifecycleCommands {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    $commands = New-Object System.Collections.Generic.List[object]
    $insideSection = $false
    $currentPhase = ""

    foreach ($line in $Block) {
        if ($line -match "^\s{4}validationCommandLifecycle:\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if (-not $insideSection) {
            continue
        }

        if ($line -match "^\s{6}-\s+phase:\s*(.+?)\s*$") {
            $currentPhase = Remove-ValueQuotes -Value $Matches[1]
            continue
        }

        if ($line -match "^\s{8}command:\s*(.+?)\s*$") {
            $commands.Add([pscustomobject]@{
                Phase = $currentPhase
                Command = Remove-ValueQuotes -Value $Matches[1]
            })
        }
    }

    return $commands.ToArray()
}

function Test-TaskSectionPresent {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*$") {
            return $true
        }
    }

    return $false
}

function Test-TaskBlockContains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    return (($Block -join "`n") -match $Pattern)
}

function Test-RequiredListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Section,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$RequiredValues
    )

    $blockText = $Block -join "`n"
    foreach ($requiredValue in $RequiredValues) {
        if ($blockText -notmatch "(?m)^\s+-\s*$([regex]::Escape($requiredValue))\s*$") {
            Add-Finding "HARD_BLOCK_AUTODRIVE_SCHEMA_MISSING_VALUE $Section $requiredValue"
        }
    }
}

$findings = New-Object System.Collections.Generic.List[string]

try {
    Write-Section -Title "Module Run v2 Autodrive Schema Readiness"
    Write-Output "autodriveSchemaMode: read_only"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $SchemaPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Add-Finding "HARD_BLOCK_MISSING_FILE $requiredPath"
        }
    }

    if ($findings.Count -gt 0) {
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "required durable files are missing" -ExitCode 1
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $schemaContent = Get-Content -LiteralPath $SchemaPath -Raw
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    Write-Output "taskId: $TaskId"
    Write-Output "schemaPath: $SchemaPath"

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_ID"
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "task id is missing" -ExitCode 1
    }

    if ($schemaContent -notmatch "taskAutodrivePolicy:" -or $schemaContent -notmatch "capabilities:" -or $schemaContent -notmatch "registryLifecycle:") {
        Add-Finding "HARD_BLOCK_SCHEMA_CONTRACT_INCOMPLETE $SchemaPath"
    }

    $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        Add-Finding "HARD_BLOCK_TASK_NOT_FOUND $TaskId"
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "task is not present in queue" -ExitCode 1
    }

    $status = Get-TaskScalarValue -Block $taskBlock -Key "status"
    $taskKind = Get-TaskScalarValue -Block $taskBlock -Key "taskKind"
    $evidencePath = Get-TaskScalarValue -Block $taskBlock -Key "evidencePath"
    $auditReviewPath = Get-TaskScalarValue -Block $taskBlock -Key "auditReviewPath"
    $allowedFiles = @(Get-TaskListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-TaskListValues -Block $taskBlock -Key "blockedFiles")
    $riskTypes = @(Get-TaskListValues -Block $taskBlock -Key "riskTypes")
    $validationCommands = @(Get-TaskListValues -Block $taskBlock -Key "validationCommands")
    $validationLifecycleCommands = @(Get-TaskValidationLifecycleCommands -Block $taskBlock)

    Write-Section -Title "Task"
    Write-Output "status: $status"
    Write-Output "taskKind: $taskKind"
    Write-Output "allowedFileCount: $($allowedFiles.Count)"
    Write-Output "blockedFileCount: $($blockedFiles.Count)"
    Write-Output "riskTypeCount: $($riskTypes.Count)"
    Write-Output "validationCommandCount: $($validationCommands.Count)"
    Write-Output "validationLifecycleCommandCount: $($validationLifecycleCommands.Count)"

    if ($status -in @("done", "closed", "pushed", "merged")) {
        Write-Output "not_executable_closed_task: $TaskId status=$status"
        Write-AutodriveSchemaResult -Decision "not_executable_closed_task" -Reason "task is terminal and should be treated as idle, not executable autodrive work" -ExitCode 0
    }

    if ($status -notin @("pending", "in_progress")) {
        Add-Finding "HARD_BLOCK_UNSUPPORTED_TASK_STATUS $TaskId status=$status"
    }
    if ([string]::IsNullOrWhiteSpace($taskKind)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_KIND $TaskId"
    }
    if ([string]::IsNullOrWhiteSpace($evidencePath)) {
        Add-Finding "HARD_BLOCK_MISSING_EVIDENCE_PATH $TaskId"
    }
    if ([string]::IsNullOrWhiteSpace($auditReviewPath)) {
        Add-Finding "HARD_BLOCK_MISSING_AUDIT_PATH $TaskId"
    }
    if ($allowedFiles.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_ALLOWED_FILES $TaskId"
    }
    if ($blockedFiles.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_BLOCKED_FILES $TaskId"
    }
    if ($riskTypes.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_RISK_TYPES $TaskId"
    }
    if ($validationCommands.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_VALIDATION_COMMANDS $TaskId"
    }
    if ($validationLifecycleCommands.Count -gt 0) {
        $validLifecyclePhases = @("pre_edit", "post_edit", "closeout")
        $hasRunnableCompletionPhase = $false
        foreach ($validationLifecycleCommand in $validationLifecycleCommands) {
            if ($validationLifecycleCommand.Phase -notin $validLifecyclePhases) {
                Add-Finding "HARD_BLOCK_INVALID_VALIDATION_LIFECYCLE_PHASE $($validationLifecycleCommand.Phase)"
            }
            if ($validationLifecycleCommand.Phase -in @("post_edit", "closeout")) {
                $hasRunnableCompletionPhase = $true
            }
        }
        if (-not $hasRunnableCompletionPhase) {
            Add-Finding "HARD_BLOCK_VALIDATION_LIFECYCLE_MISSING_COMPLETION_PHASE $TaskId"
        }
    }

    $blockedRiskTypes = @(
        "add_dependency",
        "dependency",
        "schema",
        "migration",
        "secret_or_env_change",
        "env_secret",
        "provider",
        "deploy",
        "payment",
        "external_service",
        "external-service",
        "cost_calibration",
        "cost-calibration"
    )
    foreach ($riskType in $riskTypes) {
        if ($blockedRiskTypes -contains $riskType.ToLowerInvariant()) {
            Add-Finding "HARD_BLOCK_RISK_GATE $riskType"
        }
    }

    if ($findings.Count -gt 0) {
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "base task metadata is unsafe for autodrive" -ExitCode 1
    }

    $hasAutodrivePolicy = Test-TaskSectionPresent -Block $taskBlock -Key "autodrivePolicy"
    $hasCapabilities = Test-TaskSectionPresent -Block $taskBlock -Key "capabilities"
    $hasCloseoutPolicy = Test-TaskSectionPresent -Block $taskBlock -Key "closeoutPolicy"
    $hasRegistryLifecycle = Test-TaskSectionPresent -Block $taskBlock -Key "registryLifecycle"

    Write-Section -Title "Autodrive Fields"
    Write-Output "autodrivePolicy: $($hasAutodrivePolicy.ToString().ToLowerInvariant())"
    Write-Output "capabilities: $($hasCapabilities.ToString().ToLowerInvariant())"
    Write-Output "closeoutPolicy: $($hasCloseoutPolicy.ToString().ToLowerInvariant())"
    Write-Output "registryLifecycle: $($hasRegistryLifecycle.ToString().ToLowerInvariant())"

    if (-not $hasAutodrivePolicy -or -not $hasCapabilities -or -not $hasCloseoutPolicy -or -not $hasRegistryLifecycle) {
        Write-AutodriveSchemaResult -Decision "proposal_only" -Reason "durable autodrive schema fields are incomplete" -ExitCode 0
    }

    $mode = ""
    foreach ($line in $taskBlock) {
        if ($line -match "^\s{6}mode:\s*(.+?)\s*$") {
            $mode = Remove-ValueQuotes -Value $Matches[1]
            break
        }
    }
    Write-Output "autodriveMode: $mode"

    if ($mode -notin @("guarded_serial", "guarded_parallel", "closeout_only")) {
        Write-AutodriveSchemaResult -Decision "proposal_only" -Reason "autodrive mode is proposal-only or unknown" -ExitCode 0
    }

    Test-RequiredListValues -Block $taskBlock -Section "blockedAgentActions" -RequiredValues @(
        "merge",
        "push",
        "pr",
        "deploy",
        "dependency_change",
        "schema_migration",
        "env_secret",
        "provider_call",
        "cost_calibration_gate"
    )

    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+localDockerDatabase:\s*(task_approval_required|approved_local_dev_only)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_LOCAL_DOCKER_DATABASE"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+projectResourceRead:\s*(task_approval_required|approved_read_only_redacted)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_PROJECT_RESOURCE_READ"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+providerKey:\s*(env_destination_confirmation_required|approved_confirmed_local_destination)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_PROVIDER_KEY"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+providerCall:\s*(blocked_without_task_approval|approved_redacted_local_validation)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_PROVIDER_CALL"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+schemaMigration:\s*(blocked_without_task_approval|approved_migration_plan)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_SCHEMA_MIGRATION"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+costCalibrationGate:\s*blocked\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_COST_CALIBRATION_GATE"
    }

    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+runStatus:\s*(active|recoverable|stopped|abandoned|cleanup_ready|closed)\s*$")) {
        Add-Finding "HARD_BLOCK_REGISTRY_LIFECYCLE_STATUS"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+redactionRequired:\s*true\s*$")) {
        Add-Finding "HARD_BLOCK_REGISTRY_REDACTION_REQUIRED"
    }

    if ($findings.Count -gt 0) {
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "durable autodrive schema has unsafe values" -ExitCode 1
    }

    Write-AutodriveSchemaResult -Decision "can_autodrive" -Reason "durable autodrive schema is safe for guarded local action" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_AUTODRIVE_SCHEMA_EXCEPTION $($_.Exception.Message)"
    Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "autodrive schema readiness script exception" -ExitCode 1
}
