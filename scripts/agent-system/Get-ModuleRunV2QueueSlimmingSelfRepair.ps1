param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateRange(0, 50)]
    [int]$TerminalRecoveryWindow = 8,

    [Parameter(Mandatory = $false)]
    [ValidateRange(0, 500)]
    [int]$TerminalBatchArchiveThreshold = 30
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

function Join-FirstItems {
    param(
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Values,
        [Parameter(Mandatory = $false)][int]$Count = 5
    )

    $items = @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First $Count)
    if ($items.Count -eq 0) {
        return "none"
    }

    return ($items -join ",")
}

function Get-ProjectCurrentTaskId {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if (-not $insideCurrentTask -and $line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            break
        }

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+?)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }

    return ""
}

function Test-HighRiskPath {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Path)

    $normalized = $Path.Replace("\", "/").Trim()
    return $normalized -match "^\.env" `
        -or $normalized -match "^(package\.json|package-lock\.json|package-lock\.yaml|pnpm-lock\.yaml)$" `
        -or $normalized -match "^(src|tests|e2e|drizzle|playwright-report|test-results)(/|\*\*|$)" `
        -or $normalized -match "^src/db/schema(/|\*\*|$)"
}

function Get-MissingPacketFields {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

    $missing = New-Object System.Collections.Generic.List[string]
    foreach ($field in @("taskKind", "moduleRunVersion", "executionProfile", "validationPolicy", "status", "evidencePath", "auditReviewPath", "planPath")) {
        if ([string]::IsNullOrWhiteSpace((Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key $field))) {
            $missing.Add($field)
        }
    }

    foreach ($listField in @("allowedFiles", "blockedFiles", "validationCommands")) {
        if (@(Get-ModuleRunV2ListValues -Block $TaskBlock -Key $listField).Count -eq 0) {
            $missing.Add($listField)
        }
    }

    $taskText = $TaskBlock -join "`n"
    if ($taskText -notmatch "(?im)^\s+closeoutPolicy:\s*$") {
        $missing.Add("closeoutPolicy")
    }

    return $missing.ToArray()
}

function Test-SafeMetadataSelfRepairCandidate {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

    $taskKind = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "taskKind"
    $executionProfile = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "executionProfile"
    $allowedFiles = @(Get-ModuleRunV2ListValues -Block $TaskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ModuleRunV2ListValues -Block $TaskBlock -Key "blockedFiles")
    $riskTypes = @(Get-ModuleRunV2ListValues -Block $TaskBlock -Key "riskTypes")
    $text = $TaskBlock -join "`n"

    $safeKind = $taskKind -in @("mechanism_tuning", "mechanism_maintenance", "docs_only", "local_experience_audit", "readiness_audit") `
        -or $executionProfile -in @("docs_state_lite", "local_experience_audit")
    if (-not $safeKind) {
        return $false
    }

    $allScopeValues = @($allowedFiles + $blockedFiles)
    foreach ($path in $allScopeValues) {
        if (Test-HighRiskPath -Path $path) {
            return $false
        }
    }

    foreach ($riskType in $riskTypes) {
        if ($riskType.ToLowerInvariant() -in @("env_secret", "provider_call", "dependency_change", "schema_migration", "database_migration", "destructive_database_operation", "e2e", "deploy", "payment", "external_service", "external-service", "pr", "force_push", "cost_calibration_gate")) {
            return $false
        }
    }

    return $text -notmatch "(?i)(provider/model|staging|prod|cloud|deploy|payment|external-service|Cost Calibration Gate execution)"
}

function Write-QueueSlimmingResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $false)][int]$ActiveQueueTaskCount = 0,
        [Parameter(Mandatory = $false)][int]$ActiveQueueNonTerminalCount = 0,
        [Parameter(Mandatory = $false)][int]$ActiveQueueTerminalCount = 0,
        [Parameter(Mandatory = $false)][int]$TerminalRecoveryWindowCount = 0,
        [Parameter(Mandatory = $false)][int]$DeferredArchiveCandidateCount = 0,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$ArchiveDeferralReason = "none",
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ArchiveCandidates = @(),
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$SelfRepairCandidates = @(),
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][AllowEmptyString()][string[]]$BlockedRepairCandidates = @(),
        [Parameter(Mandatory = $false)][int]$ExitCode = 0
    )

    Write-Section -Title "Result"
    Write-Output "queueSlimmingDecision: $Decision"
    Write-Output "activeQueueTaskCount: $ActiveQueueTaskCount"
    Write-Output "activeQueueNonTerminalCount: $ActiveQueueNonTerminalCount"
    Write-Output "activeQueueTerminalCount: $ActiveQueueTerminalCount"
    Write-Output "terminalRecoveryWindow: $TerminalRecoveryWindow"
    Write-Output "terminalRecoveryWindowCount: $TerminalRecoveryWindowCount"
    Write-Output "terminalBatchArchiveThreshold: $TerminalBatchArchiveThreshold"
    Write-Output "terminalBatchArchiveThresholdExceeded: $(($ActiveQueueTerminalCount -gt $TerminalBatchArchiveThreshold).ToString().ToLowerInvariant())"
    Write-Output "archiveCandidateCount: $($ArchiveCandidates.Count)"
    Write-Output "deferredArchiveCandidateCount: $DeferredArchiveCandidateCount"
    Write-Output "archiveDeferralReason: $ArchiveDeferralReason"
    Write-Output "selfRepairCandidateCount: $($SelfRepairCandidates.Count)"
    Write-Output "highRiskRepairBlockedCount: $($BlockedRepairCandidates.Count)"
    Write-Output "firstArchiveCandidates: $(Join-FirstItems -Values $ArchiveCandidates)"
    Write-Output "firstSelfRepairCandidates: $(Join-FirstItems -Values $SelfRepairCandidates)"
    Write-Output "firstBlockedRepairCandidates: $(Join-FirstItems -Values $BlockedRepairCandidates)"
    Write-Output "selfRepairScope: mechanism_docs_state_task_packet_metadata_only"
    Write-Output "applyMode: diagnostic_only_v1"
    Write-Output "reason: $Reason"
    Write-Output "diagnosticOnly: true"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

try {
    Write-Section -Title "Module Run v2 Queue Slimming And Self-Repair"
    Write-Output "queueSlimmingMode: read_only"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Write-QueueSlimmingResult -Decision "stop_for_hard_block" -Reason "missing required file: $requiredPath" -ExitCode 1
        }
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $taskBlocks = @(Get-ModuleRunV2TaskBlocks -Lines $queueLines)
    $currentTaskId = Get-ProjectCurrentTaskId -Lines $projectStateLines

    $terminalIds = New-Object System.Collections.Generic.List[string]
    $nonTerminalIds = New-Object System.Collections.Generic.List[string]
    $selfRepairCandidates = New-Object System.Collections.Generic.List[string]
    $blockedRepairCandidates = New-Object System.Collections.Generic.List[string]

    foreach ($block in $taskBlocks) {
        $status = Get-ModuleRunV2ScalarValue -Block $block.Lines -Key "status"
        if ($status -in @("closed", "done", "merged", "pushed")) {
            $terminalIds.Add($block.Id)
            continue
        } else {
            $nonTerminalIds.Add($block.Id)
        }

        $missingFields = @(Get-MissingPacketFields -TaskBlock $block.Lines)
        if ($missingFields.Count -eq 0) {
            continue
        }

        $candidateLabel = "$($block.Id):$($missingFields -join '+')"
        if (Test-SafeMetadataSelfRepairCandidate -TaskBlock $block.Lines) {
            $selfRepairCandidates.Add($candidateLabel)
        } else {
            $blockedRepairCandidates.Add($candidateLabel)
        }
    }

    $terminalRecoveryCount = [Math]::Min($TerminalRecoveryWindow, $terminalIds.Count)
    $recoveryArchiveCandidates = @()
    if ($terminalIds.Count -gt $terminalRecoveryCount) {
        $recoveryArchiveCandidates = @($terminalIds.ToArray() | Select-Object -First ($terminalIds.Count - $terminalRecoveryCount))
    }
    if (-not [string]::IsNullOrWhiteSpace($currentTaskId)) {
        $recoveryArchiveCandidates = @($recoveryArchiveCandidates | Where-Object { $_ -ne $currentTaskId })
    }

    $archiveCandidates = @()
    $deferredArchiveCandidateCount = 0
    $archiveDeferralReason = "none"
    if ($terminalIds.Count -gt $TerminalBatchArchiveThreshold) {
        $archiveCandidates = @($recoveryArchiveCandidates)
    } elseif ($recoveryArchiveCandidates.Count -gt 0) {
        $deferredArchiveCandidateCount = $recoveryArchiveCandidates.Count
        $archiveDeferralReason = "below_terminal_batch_archive_threshold"
    }

    $decision = "clean"
    $reason = "active queue has no slimming or safe self-repair candidates"
    if ($selfRepairCandidates.Count -gt 0) {
        $decision = "self_repair_candidates"
        $reason = "safe mechanism docs/state task-packet metadata repair candidates exist"
    } elseif ($archiveCandidates.Count -gt 0) {
        $decision = "slimming_candidates"
        $reason = "terminal active-queue tasks exceed batch archive threshold"
    } elseif ($deferredArchiveCandidateCount -gt 0) {
        $reason = "terminal active-queue tasks are within batch archive threshold; recovery-window candidates deferred"
    }

    Write-QueueSlimmingResult -Decision $decision `
        -Reason $reason `
        -ActiveQueueTaskCount $taskBlocks.Count `
        -ActiveQueueNonTerminalCount $nonTerminalIds.Count `
        -ActiveQueueTerminalCount $terminalIds.Count `
        -TerminalRecoveryWindowCount $terminalRecoveryCount `
        -DeferredArchiveCandidateCount $deferredArchiveCandidateCount `
        -ArchiveDeferralReason $archiveDeferralReason `
        -ArchiveCandidates $archiveCandidates `
        -SelfRepairCandidates $selfRepairCandidates.ToArray() `
        -BlockedRepairCandidates $blockedRepairCandidates.ToArray()
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-QueueSlimmingResult -Decision "stop_for_hard_block" -Reason "queue slimming/self-repair diagnostic encountered an error" -ExitCode 1
}
