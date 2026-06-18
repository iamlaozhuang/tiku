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
    [string]$TaskHistoryIndexPath = "docs\04-agent-system\state\task-history-index.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ExecutionProfileCatalogPath = "docs\04-agent-system\state\execution-profiles.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateRange(0, 10)]
    [int]$MaxTasks = 0
)

$ErrorActionPreference = "Stop"

$commonScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "ModuleRunV2.Common.ps1"
if (Test-Path -LiteralPath $commonScriptPath) {
    . $commonScriptPath
}

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Join-OrNone {
    param([Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Values)

    $items = @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($items.Count -eq 0) {
        return "none"
    }

    return ($items -join ",")
}

function Get-CatalogWorkPacketMaxTasks {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Profile
    )

    $insideWorkPacket = $false
    $insideMaxTasks = $false
    foreach ($line in ($Content -split "\r?\n")) {
        if (-not $insideWorkPacket -and $line -match "^workPacket:\s*$") {
            $insideWorkPacket = $true
            continue
        }

        if ($insideWorkPacket -and $line -match "^\S") {
            break
        }

        if ($insideWorkPacket -and -not $insideMaxTasks -and $line -match "^\s{2}maxTasksPerPacket:\s*$") {
            $insideMaxTasks = $true
            continue
        }

        if ($insideMaxTasks -and $line -match "^\s{2}\S") {
            break
        }

        if ($insideMaxTasks -and $line -match "^\s{4}$([regex]::Escape($Profile)):\s*(\d+)\s*$") {
            return [int]$Matches[1]
        }
    }

    return 1
}

function Get-HistoryTerminalIds {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $terminalIds = New-Object System.Collections.Generic.List[string]
    $currentId = ""
    foreach ($line in $Lines) {
        if ($line -match "^\s*-\s+id:\s+(.+?)\s*$") {
            $currentId = $Matches[1].Trim().Trim('"').Trim("'")
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId) -and $line -match "^\s+status:\s*(.+?)\s*$") {
            $status = $Matches[1].Trim().Trim('"').Trim("'")
            if ($status -in @("closed", "done", "merged", "pushed")) {
                $terminalIds.Add($currentId)
            }
            $currentId = ""
        }
    }

    return $terminalIds.ToArray()
}

function Get-TerminalTaskIds {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$TaskBlocks,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$HistoryLines = @()
    )

    $terminalIds = New-Object System.Collections.Generic.List[string]
    foreach ($block in $TaskBlocks) {
        $status = Get-ModuleRunV2ScalarValue -Block $block.Lines -Key "status"
        if ($status -in @("closed", "done", "merged", "pushed")) {
            $terminalIds.Add($block.Id)
        }
    }

    if ($HistoryLines.Count -gt 0) {
        foreach ($id in @(Get-HistoryTerminalIds -Lines $HistoryLines)) {
            $terminalIds.Add($id)
        }
    }

    return @($terminalIds.ToArray() | Select-Object -Unique)
}

function Test-DependenciesTerminal {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TerminalIds
    )

    $dependencies = @(Get-ModuleRunV2ListValues -Block $TaskBlock -Key "dependencies")
    foreach ($dependency in $dependencies) {
        if ([string]::IsNullOrWhiteSpace($dependency)) {
            continue
        }

        if ($dependency -notin $TerminalIds) {
            return $false
        }
    }

    return $true
}

function Test-LocalFullFlowSingleTask {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

    $profile = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "executionProfile"
    $validationPolicy = Get-ModuleRunV2ValidationSurface -TaskBlock $TaskBlock
    $taskKind = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "taskKind"

    return $profile -eq "local_full_flow" -or $validationPolicy -eq "local_full_flow" -or $taskKind -match "local_full_flow"
}

function Test-ProductOrRuntimeScope {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

    $allowedFiles = @(Get-ModuleRunV2ListValues -Block $TaskBlock -Key "allowedFiles")
    foreach ($path in $allowedFiles) {
        $normalized = $path.Replace("\", "/")
        if ($normalized -match "^(src|tests|e2e)(/|\*\*|$)" -or $normalized -match "^(package\.json|package-lock\.json|pnpm-lock\.yaml|src/db/schema|drizzle)(/|\*\*|$)") {
            return $true
        }
    }

    return $false
}

function Test-DocsStateAuditOnlyScope {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock,
        [Parameter(Mandatory = $true)][ref]$Reason
    )

    $allowedFiles = @(Get-ModuleRunV2ListValues -Block $TaskBlock -Key "allowedFiles")
    if ($allowedFiles.Count -eq 0) {
        $Reason.Value = "missing_allowed_files"
        return $false
    }

    foreach ($path in $allowedFiles) {
        $normalized = $path.Replace("\", "/").Trim()
        $isDocsStateAudit = $normalized -match "^docs/04-agent-system/state(/|\*\*|$)" `
            -or $normalized -match "^docs/04-agent-system/sop(/|\*\*|$)" `
            -or $normalized -eq "docs/04-agent-system/operating-manual.md" `
            -or $normalized -match "^docs/05-execution-logs/(task-plans|evidence|audits-reviews)(/|\*\*|$)"

        if (-not $isDocsStateAudit) {
            $Reason.Value = "non_docs_state_audit_allowed_file:$normalized"
            return $false
        }
    }

    $riskTypes = @(Get-ModuleRunV2ListValues -Block $TaskBlock -Key "riskTypes")
    $blockedRiskTypes = @(
        "env_secret",
        "provider_call",
        "provider_configuration",
        "dependency_change",
        "dependency_package_lockfile_change",
        "schema_migration",
        "database_migration",
        "destructive_database_operation",
        "e2e",
        "local_e2e",
        "deploy",
        "payment",
        "external_service",
        "external-service",
        "pr",
        "force_push",
        "cost_calibration_gate"
    )
    $conflictingRiskTypes = @($riskTypes | Where-Object { $_.ToLowerInvariant() -in $blockedRiskTypes })
    if ($conflictingRiskTypes.Count -gt 0) {
        $Reason.Value = "blocked_risk_types:$($conflictingRiskTypes -join ',')"
        return $false
    }

    $validationSurface = Get-ModuleRunV2ValidationSurface -TaskBlock $TaskBlock
    if ($validationSurface -notin @("docs_state", "mechanism_tuning", "legacy_explicit")) {
        $Reason.Value = "unsupported_validation_surface:$validationSurface"
        return $false
    }

    $evidencePath = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "evidencePath"
    $auditReviewPath = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "auditReviewPath"
    if ([string]::IsNullOrWhiteSpace($evidencePath) -or [string]::IsNullOrWhiteSpace($auditReviewPath)) {
        $Reason.Value = "missing_evidence_or_audit_path"
        return $false
    }

    $taskText = $TaskBlock -join "`n"
    $hasCloseoutPolicy = $taskText -match "(?im)^\s+closeoutPolicy:\s*$" `
        -and ($taskText -match "(?im)^\s+localCommit:\s*approved(?:\b|_by)" -or $taskText -match "(?ims)^\s+localCommit:\s*\r?\n\s+approved:\s*true\s*$")
    if (-not $hasCloseoutPolicy) {
        $Reason.Value = "missing_local_commit_closeout_policy"
        return $false
    }

    $Reason.Value = "docs_state_audit_only"
    return $true
}

function Write-GuardedGoalResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$TaskId = "",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$ExecutionProfile = "none",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$ValidationPolicy = "none",
        [Parameter(Mandatory = $false)][int]$CatalogMaxTasksPerPacket = 0,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$EligibleTaskIds = @(),
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$SelectedTaskIds = @(),
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$CloseoutMode = "none",
        [Parameter(Mandatory = $false)][bool]$LocalFullFlowSingleTaskOnly = $false,
        [Parameter(Mandatory = $false)][bool]$ProductSourceSingleTaskCloseout = $false,
        [Parameter(Mandatory = $false)][int]$ExitCode = 0
    )

    Write-Section -Title "Result"
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        Write-Output "taskId: $TaskId"
    }
    Write-Output "guardedGoalPacketDecision: $Decision"
    Write-Output "goalPacketCloseoutMode: $CloseoutMode"
    Write-Output "executionProfile: $ExecutionProfile"
    Write-Output "validationPolicy: $ValidationPolicy"
    Write-Output "catalogMaxTasksPerPacket: $CatalogMaxTasksPerPacket"
    Write-Output "goalPacketEligibleCount: $($EligibleTaskIds.Count)"
    Write-Output "goalPacketSelectedCount: $($SelectedTaskIds.Count)"
    Write-Output "goalPacketTaskIds: $(Join-OrNone -Values $SelectedTaskIds)"
    Write-Output "localFullFlowSingleTaskOnly: $($LocalFullFlowSingleTaskOnly.ToString().ToLowerInvariant())"
    Write-Output "productSourceSingleTaskCloseout: $($ProductSourceSingleTaskCloseout.ToString().ToLowerInvariant())"
    Write-Output "reason: $Reason"
    Write-Output "diagnosticOnly: true"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

try {
    Write-Section -Title "Module Run v2 Guarded Goal Packet"
    Write-Output "guardedGoalPacketMode: read_only"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $ExecutionProfileCatalogPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Write-GuardedGoalResult -Decision "stop_for_hard_block" -Reason "missing required file: $requiredPath" -ExitCode 1
        }
    }

    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $taskBlocks = @(Get-ModuleRunV2TaskBlocks -Lines $queueLines)
    $historyLines = @()
    if (Test-Path -LiteralPath $TaskHistoryIndexPath) {
        $historyLines = @(Get-Content -LiteralPath $TaskHistoryIndexPath)
    }
    $terminalTaskIds = @(Get-TerminalTaskIds -TaskBlocks $taskBlocks -HistoryLines $historyLines)
    $catalogContent = Get-Content -LiteralPath $ExecutionProfileCatalogPath -Raw

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $taskBlock = @(Get-ModuleRunV2TaskBlock -Blocks $taskBlocks -Id $TaskId)
        if ($taskBlock.Count -eq 0) {
            Write-GuardedGoalResult -Decision "stop_for_hard_block" -Reason "task block not found" -TaskId $TaskId -ExitCode 1
        }

        $profile = Get-ModuleRunV2ScalarValue -Block $taskBlock -Key "executionProfile"
        if ([string]::IsNullOrWhiteSpace($profile)) {
            $profile = "legacy_explicit"
        }
        $validationPolicy = Get-ModuleRunV2ValidationSurface -TaskBlock $taskBlock
        if ([string]::IsNullOrWhiteSpace($validationPolicy)) {
            $validationPolicy = "legacy_explicit"
        }
        $catalogMaxTasks = Get-CatalogWorkPacketMaxTasks -Content $catalogContent -Profile $profile

        if (Test-LocalFullFlowSingleTask -TaskBlock $taskBlock) {
            Write-GuardedGoalResult -Decision "single_task_only" -Reason "local_full_flow must not enter a goal packet" -TaskId $TaskId -ExecutionProfile $profile -ValidationPolicy $validationPolicy -CatalogMaxTasksPerPacket 1 -CloseoutMode "single_task_only" -LocalFullFlowSingleTaskOnly $true
        }

        $docsReason = ""
        if (Test-DocsStateAuditOnlyScope -TaskBlock $taskBlock -Reason ([ref]$docsReason)) {
            $selectedTaskIds = @($TaskId)
            Write-GuardedGoalResult -Decision "eligible_packet" -Reason "task is docs/state/audit-only and may participate in guarded serial packet closeout" -TaskId $TaskId -ExecutionProfile $profile -ValidationPolicy $validationPolicy -CatalogMaxTasksPerPacket $catalogMaxTasks -EligibleTaskIds $selectedTaskIds -SelectedTaskIds $selectedTaskIds -CloseoutMode "docs_state_audit_packet_closeout"
        }

        if (Test-ProductOrRuntimeScope -TaskBlock $taskBlock) {
            Write-GuardedGoalResult -Decision "single_task_closeout_required" -Reason "product/runtime scope must keep one task and one closeout" -TaskId $TaskId -ExecutionProfile $profile -ValidationPolicy $validationPolicy -CatalogMaxTasksPerPacket $catalogMaxTasks -CloseoutMode "product_or_runtime_single_task_closeout" -ProductSourceSingleTaskCloseout $true
        }

        Write-GuardedGoalResult -Decision "not_eligible" -Reason $docsReason -TaskId $TaskId -ExecutionProfile $profile -ValidationPolicy $validationPolicy -CatalogMaxTasksPerPacket $catalogMaxTasks -CloseoutMode "single_task_closeout_required"
    }

    $eligibleTasks = New-Object System.Collections.Generic.List[object]
    $singleTaskReasons = New-Object System.Collections.Generic.List[string]

    foreach ($block in $taskBlocks) {
        $status = Get-ModuleRunV2ScalarValue -Block $block.Lines -Key "status"
        if ($status -ne "pending") {
            continue
        }
        if (-not (Test-DependenciesTerminal -TaskBlock $block.Lines -TerminalIds $terminalTaskIds)) {
            continue
        }

        if (Test-LocalFullFlowSingleTask -TaskBlock $block.Lines) {
            $singleTaskReasons.Add("$($block.Id):local_full_flow")
            continue
        }

        $profile = Get-ModuleRunV2ScalarValue -Block $block.Lines -Key "executionProfile"
        if ([string]::IsNullOrWhiteSpace($profile)) {
            $profile = "legacy_explicit"
        }
        $validationPolicy = Get-ModuleRunV2ValidationSurface -TaskBlock $block.Lines
        if ([string]::IsNullOrWhiteSpace($validationPolicy)) {
            $validationPolicy = "legacy_explicit"
        }

        $docsReason = ""
        if (Test-DocsStateAuditOnlyScope -TaskBlock $block.Lines -Reason ([ref]$docsReason)) {
            $eligibleTasks.Add([pscustomobject]@{
                    Id               = $block.Id
                    ExecutionProfile = $profile
                    ValidationPolicy = $validationPolicy
                })
        } elseif (Test-ProductOrRuntimeScope -TaskBlock $block.Lines) {
            $singleTaskReasons.Add("$($block.Id):product_or_runtime")
        }
    }

    if ($eligibleTasks.Count -eq 0) {
        $reason = if ($singleTaskReasons.Count -gt 0) { "ready_tasks_require_single_task_closeout:$($singleTaskReasons -join ',')" } else { "no_ready_docs_state_audit_goal_packet_candidates" }
        Write-GuardedGoalResult -Decision "not_eligible" -Reason $reason -CatalogMaxTasksPerPacket 0 -CloseoutMode "none"
    }

    $firstProfile = $eligibleTasks[0].ExecutionProfile
    $profileTasks = @($eligibleTasks | Where-Object { $_.ExecutionProfile -eq $firstProfile })
    $catalogMaxTasks = Get-CatalogWorkPacketMaxTasks -Content $catalogContent -Profile $firstProfile
    $effectiveMaxTasks = if ($MaxTasks -gt 0) { [Math]::Min($MaxTasks, $catalogMaxTasks) } else { $catalogMaxTasks }
    if ($effectiveMaxTasks -lt 1) {
        $effectiveMaxTasks = 1
    }

    $selectedTasks = @($profileTasks | Select-Object -First $effectiveMaxTasks)
    Write-GuardedGoalResult -Decision "eligible_packet" `
        -Reason "ready docs/state/audit-only tasks share a guarded serial packet envelope" `
        -ExecutionProfile $firstProfile `
        -ValidationPolicy $selectedTasks[0].ValidationPolicy `
        -CatalogMaxTasksPerPacket $catalogMaxTasks `
        -EligibleTaskIds @($profileTasks | ForEach-Object { $_.Id }) `
        -SelectedTaskIds @($selectedTasks | ForEach-Object { $_.Id }) `
        -CloseoutMode "docs_state_audit_packet_closeout"
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-GuardedGoalResult -Decision "stop_for_hard_block" -Reason "guarded goal packet diagnostic encountered an error" -ExitCode 1
}
