param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [string]$EvidencePath = "",

    [Parameter(Mandatory = $false)]
    [string]$AuditReviewPath = ""
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
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
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$IncludedPhases
    )

    $commands = New-Object System.Collections.Generic.List[string]
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
            $command = Remove-ValueQuotes -Value $Matches[1]
            if ($IncludedPhases -contains $currentPhase) {
                $commands.Add($command)
            }
        }
    }

    return $commands.ToArray()
}

function Test-CommandEvidenceRecorded {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceContent,
        [Parameter(Mandatory = $true)][string]$Command
    )

    if ($Command -match "npm\.cmd run lint") {
        return $EvidenceContent -match "(?im)npm\.cmd run lint.*pass|lint.*pass"
    }

    if ($Command -match "npm\.cmd run typecheck") {
        return $EvidenceContent -match "(?im)npm\.cmd run typecheck.*pass|typecheck.*pass"
    }

    if ($Command -match "git diff --check") {
        return $EvidenceContent -match "(?im)git diff --check.*pass|diff check.*pass"
    }

    if ($Command -match "test:unit|--run focused") {
        return $EvidenceContent -match "(?im)$([regex]::Escape($Command)).*pass|focused.*tests?.*passed|unit tests?.*passed|GREEN:.*passed"
    }

    return $EvidenceContent -match [regex]::Escape($Command)
}

function Test-BroadFocusedCommand {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Command)

    return $Command -match "npm\.cmd\s+run\s+test\s+--\s+--run\s+focused"
}

function Test-UnrelatedBaselineFailure {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceContent)

    return $EvidenceContent -match "(?is)(broad validation|advisory baseline|npm\.cmd run test -- --run focused).*(failed|failure)" -and
        $EvidenceContent -match "(?i)unrelated|existing failures|baseline"
}

function Get-CloseoutTransactionState {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceContent,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditContent,
        [Parameter(Mandatory = $true)][bool]$EvidenceExists,
        [Parameter(Mandatory = $true)][bool]$AuditExists
    )

    if (-not $EvidenceExists) {
        return "closeout_pending_evidence"
    }

    if ($EvidenceContent -notmatch "(?im)\bCommit:\s*`?[0-9a-f]{7,40}`?") {
        return "closeout_pending_commit_evidence"
    }

    if (-not $AuditExists) {
        return "closeout_pending_audit"
    }

    if ($AuditContent -notmatch "(?i)APPROVE|No blocking findings") {
        return "closeout_pending_audit_approval"
    }

    return "closeout_ready"
}

function Write-ValidationSurfaceResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$FocusedGate,
        [Parameter(Mandatory = $true)][string]$BroadGate,
        [Parameter(Mandatory = $true)][string]$CloseoutState,
        [Parameter(Mandatory = $true)][string]$OwnerRecoveryDecision,
        [Parameter(Mandatory = $true)][string]$NextAction
    )

    Write-Section -Title "Result"
    Write-Output "validationSurfaceDecision: $Decision"
    Write-Output "validationSurfaceFocusedGate: $FocusedGate"
    Write-Output "validationSurfaceBroadGate: $BroadGate"
    Write-Output "closeoutTransactionState: $CloseoutState"
    Write-Output "ownerRecoveryDecision: $OwnerRecoveryDecision"
    Write-Output "nextAutopilotExpectedAction: $NextAction"
    Write-Output "Cost Calibration Gate remains blocked"
}

try {
    Write-Section -Title "Module Run v2 Validation Surface Readiness"
    Write-Output "validationSurfaceMode: read_only"

    if (-not (Test-Path -LiteralPath $QueuePath)) {
        throw "Task queue is missing: $QueuePath"
    }

    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        throw "TaskId is required for validation surface classification."
    }

    $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        throw "Task not found in queue: $TaskId"
    }

    $taskStatus = Get-TaskScalarValue -Block $taskBlock -Key "status"
    $taskEvidencePath = Get-TaskScalarValue -Block $taskBlock -Key "evidencePath"
    $taskAuditReviewPath = Get-TaskScalarValue -Block $taskBlock -Key "auditReviewPath"
    if ([string]::IsNullOrWhiteSpace($EvidencePath)) {
        $EvidencePath = $taskEvidencePath
    }
    if ([string]::IsNullOrWhiteSpace($AuditReviewPath)) {
        $AuditReviewPath = $taskAuditReviewPath
    }

    $postEditCommands = @(Get-TaskValidationLifecycleCommands -Block $taskBlock -IncludedPhases @("post_edit", "closeout"))
    $advisoryCommands = @(Get-TaskValidationLifecycleCommands -Block $taskBlock -IncludedPhases @("advisory_baseline"))
    $legacyCommands = @(Get-TaskListValues -Block $taskBlock -Key "validationCommands")
    $hasLifecycle = $postEditCommands.Count -gt 0 -or $advisoryCommands.Count -gt 0
    $focusedCommands = if ($hasLifecycle) { $postEditCommands } else { @($legacyCommands | Where-Object { -not (Test-BroadFocusedCommand -Command $_) }) }
    $broadCommands = if ($hasLifecycle) { $advisoryCommands } else { @($legacyCommands | Where-Object { Test-BroadFocusedCommand -Command $_ }) }

    $evidenceExists = -not [string]::IsNullOrWhiteSpace($EvidencePath) -and (Test-Path -LiteralPath $EvidencePath)
    $auditExists = -not [string]::IsNullOrWhiteSpace($AuditReviewPath) -and (Test-Path -LiteralPath $AuditReviewPath)
    $evidenceContent = ""
    $auditContent = ""
    if ($evidenceExists) {
        $evidenceContent = Get-Content -LiteralPath $EvidencePath -Raw
    }
    if ($auditExists) {
        $auditContent = Get-Content -LiteralPath $AuditReviewPath -Raw
    }

    Write-Output "taskId: $TaskId"
    Write-Output "taskStatus: $taskStatus"
    Write-Output "validationLifecycleMode: $(if ($hasLifecycle) { "phase_filtered" } else { "legacy_validationCommands" })"
    Write-Output "focusedCommandCount: $($focusedCommands.Count)"
    Write-Output "broadCommandCount: $($broadCommands.Count)"
    Write-Output "evidencePath: $EvidencePath"
    Write-Output "auditReviewPath: $AuditReviewPath"

    $focusedSatisfied = $evidenceExists -and $evidenceContent -match "(?im)\bRED\b\s*:" -and $evidenceContent -match "(?im)\bGREEN\b\s*:"
    foreach ($focusedCommand in $focusedCommands) {
        if ([string]::IsNullOrWhiteSpace($focusedCommand)) {
            continue
        }
        if (-not (Test-CommandEvidenceRecorded -EvidenceContent $evidenceContent -Command $focusedCommand)) {
            $focusedSatisfied = $false
            Write-Output "validationSurfaceMissingFocusedEvidence: $focusedCommand"
        }
    }

    $focusedGate = if ($focusedSatisfied) { "satisfied" } else { "incomplete" }
    $hasUnrelatedBaselineFailure = $evidenceExists -and (Test-UnrelatedBaselineFailure -EvidenceContent $evidenceContent)
    $broadGate = "not_applicable"
    if ($broadCommands.Count -gt 0 -and $hasUnrelatedBaselineFailure) {
        $broadGate = if ($hasLifecycle) { "advisory_unrelated_baseline_failure" } else { "unrelated_baseline_failure" }
    } elseif ($broadCommands.Count -gt 0 -and $evidenceContent -match "(?is)(npm\.cmd run test -- --run focused).*(failed|failure)") {
        $broadGate = "failed_hard_gate"
    } elseif ($broadCommands.Count -gt 0) {
        $broadGate = "unknown"
    }

    $closeoutState = Get-CloseoutTransactionState -EvidenceContent $evidenceContent -AuditContent $auditContent -EvidenceExists $evidenceExists -AuditExists $auditExists
    $decision = "validation_surface_incomplete"
    if (-not $evidenceExists) {
        $decision = "validation_evidence_missing"
    } elseif ($focusedSatisfied -and -not $hasLifecycle -and $broadGate -eq "unrelated_baseline_failure") {
        $decision = "validation_surface_mismatch"
    } elseif ($focusedSatisfied) {
        $decision = "focused_validation_satisfied"
    }

    $ownerRecoveryDecision = "no_owner_recovery_needed"
    $nextAction = if ($closeoutState -eq "closeout_ready") { "closeout_recovery" } else { "continue_current_task" }
    if ($decision -eq "validation_surface_mismatch" -or $closeoutState -ne "closeout_ready") {
        $ownerRecoveryDecision = "manual_required_owner_recovery"
        $nextAction = "manual_required_owner_recovery"
    }

    Write-ValidationSurfaceResult -Decision $decision -FocusedGate $focusedGate -BroadGate $broadGate -CloseoutState $closeoutState -OwnerRecoveryDecision $ownerRecoveryDecision -NextAction $nextAction
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-ValidationSurfaceResult -Decision "stop_for_hard_block" -FocusedGate "unknown" -BroadGate "unknown" -CloseoutState "unknown" -OwnerRecoveryDecision "manual_required_owner_recovery" -NextAction "manual_required_owner_recovery"
    exit 1
}
