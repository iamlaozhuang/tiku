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
    [string]$MatrixPath = "docs\04-agent-system\state\local-experience-coverage-matrix.yaml"
)

$ErrorActionPreference = "Stop"

function Write-L123AccelerationResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$ResolvedTaskId,
        [Parameter(Mandatory = $true)][string]$RiskTier,
        [Parameter(Mandatory = $true)][string]$ExecutionMode,
        [Parameter(Mandatory = $false)][string[]]$MissingApprovalFields = @(),
        [Parameter(Mandatory = $false)][string]$BlockedGate = "none",
        [Parameter(Mandatory = $false)][string[]]$AffectedUseCaseIds = @(),
        [Parameter(Mandatory = $false)][string]$NextRecommendedAction = "none"
    )

    $missing = if ($MissingApprovalFields.Count -eq 0) { "none" } else { $MissingApprovalFields -join "," }
    $useCases = if ($AffectedUseCaseIds.Count -eq 0) { "none" } else { $AffectedUseCaseIds -join "," }

    Write-Output "l123AccelerationDecision: $Decision"
    Write-Output "taskId: $ResolvedTaskId"
    Write-Output "riskTier: $RiskTier"
    Write-Output "executionMode: $ExecutionMode"
    Write-Output "missingApprovalField: $missing"
    Write-Output "blockedGate: $BlockedGate"
    Write-Output "affectedUseCaseIds: $useCases"
    Write-Output "nextRecommendedAction: $NextRecommendedAction"
    Write-Output "diagnosticOnly: true"
    Write-Output "Cost Calibration Gate remains blocked"
}

function Get-TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $currentId = ""
    $currentLines = New-Object System.Collections.Generic.List[string]

    foreach ($line in $Lines) {
        if ($line -match "^\s+- id:\s*(.+?)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentId)) {
                $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
            }
            $currentId = $Matches[1].Trim().Trim('"').Trim("'")
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
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Blocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($block in $Blocks) {
        if ($block.Id -eq $Id) {
            return @($block.Lines)
        }
    }

    return @()
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false
    $listIndent = -1

    foreach ($line in $Block) {
        if ($line -match "^(\s*)$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            $listIndent = $Matches[1].Length
            continue
        }

        if ($insideList) {
            if ($line -match "^\s*-\s*(.+?)\s*$") {
                $values.Add($Matches[1].Trim().Trim('"').Trim("'"))
                continue
            }

            if ($line -match "^(\s*)\S" -and $Matches[1].Length -le $listIndent) {
                break
            }
        }
    }

    return $values.ToArray()
}

function Get-RowScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if ($Key -eq "useCaseId" -and $Block -match "(?m)^\s*-\s+useCaseId:\s*(.+?)\s*$") {
        return $Matches[1].Trim().Trim('"').Trim("'")
    }

    if ($Block -match "(?m)^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
        return $Matches[1].Trim().Trim('"').Trim("'")
    }

    return ""
}

function Get-AffectedUseCaseIds {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$MatrixContent,
        [Parameter(Mandatory = $true)][string]$CandidateTaskId
    )

    $useCaseIds = New-Object System.Collections.Generic.List[string]
    $rowMatches = [regex]::Matches($MatrixContent, "(?ms)^\s+- useCaseId:\s+.*?(?=^\s+- useCaseId:\s+|\z)")
    foreach ($rowMatch in $rowMatches) {
        $row = $rowMatch.Value
        $nextTask = Get-RowScalar -Block $row -Key "nextTask"
        if ($nextTask -eq $CandidateTaskId) {
            $useCaseId = Get-RowScalar -Block $row -Key "useCaseId"
            if (-not [string]::IsNullOrWhiteSpace($useCaseId)) {
                $useCaseIds.Add($useCaseId)
            }
        }
    }

    return $useCaseIds.ToArray()
}

function Get-FirstMatrixCandidate {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$MatrixContent)

    $rowMatches = [regex]::Matches($MatrixContent, "(?ms)^\s+- useCaseId:\s+.*?(?=^\s+- useCaseId:\s+|\z)")
    foreach ($rowMatch in $rowMatches) {
        $nextTask = Get-RowScalar -Block $rowMatch.Value -Key "nextTask"
        if (-not [string]::IsNullOrWhiteSpace($nextTask) -and $nextTask -notmatch "^none_") {
            return $nextTask
        }
    }

    return ""
}

function Test-HasL3Keyword {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    return $Text -match "(?i)provider|model.call|model_call|database|db.read|db.write|schema|migration|dependency|package|lockfile|deploy|staging|prod|cloud|payment|ocr|parser|export|file.generation|external.service|cost.calibration|env|secret"
}

function Test-HasApprovalPackageShape {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    return $Text -match "(?i)fresh-approval-required|approval-required|user-choice-required|exact-scope-required|approval package|required package"
}

function Test-HasExactScopeShape {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    return $Text -match "(?i)\bl1\b|l1-|_l1_|\bl2\b|l2-|_l2_|exact-scope|exact scope|source.*repair|test.*repair|e2e.*repair|local-full-flow|local_full_flow"
}

function Get-BroadHighRiskAllowedFiles {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$AllowedFiles)

    $blocked = New-Object System.Collections.Generic.List[string]
    foreach ($allowedFile in $AllowedFiles) {
        $normalized = $allowedFile.Replace("\", "/").Trim()
        if ($normalized -match "(?i)^\.env|package(-lock)?\.json$|package-lock\.yaml$|pnpm-lock\.yaml$|yarn\.lock$|^drizzle/\*\*$|^src/db/schema/\*\*$|^src/\*\*$|^tests/\*\*$|^e2e/\*\*$") {
            $blocked.Add($normalized)
        }
    }

    return $blocked.ToArray()
}

try {
    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Write-L123AccelerationResult `
                -Decision "unavailable" `
                -ResolvedTaskId $(if ([string]::IsNullOrWhiteSpace($TaskId)) { "none" } else { $TaskId }) `
                -RiskTier "unknown" `
                -ExecutionMode "none" `
                -BlockedGate "missing_required_file:$requiredPath" `
                -NextRecommendedAction "restore_required_file"
            exit 0
        }
    }

    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $matrixContent = Get-Content -LiteralPath $MatrixPath -Raw
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
    $resolvedTaskId = $TaskId
    if ([string]::IsNullOrWhiteSpace($resolvedTaskId)) {
        $resolvedTaskId = Get-FirstMatrixCandidate -MatrixContent $matrixContent
    }

    if ([string]::IsNullOrWhiteSpace($resolvedTaskId)) {
        Write-L123AccelerationResult `
            -Decision "no_l123_candidate" `
            -ResolvedTaskId "none" `
            -RiskTier "none" `
            -ExecutionMode "none" `
            -NextRecommendedAction "none"
        exit 0
    }

    $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $resolvedTaskId)
    $taskBlockText = $taskBlock -join "`n"
    $classificationText = "$resolvedTaskId`n$taskBlockText"
    $affectedUseCaseIds = @(Get-AffectedUseCaseIds -MatrixContent $matrixContent -CandidateTaskId $resolvedTaskId)
    $hasL3Keyword = Test-HasL3Keyword -Text $classificationText
    $hasApprovalPackageShape = Test-HasApprovalPackageShape -Text $classificationText
    $hasExactScopeShape = Test-HasExactScopeShape -Text $classificationText

    if ($hasApprovalPackageShape) {
        if ($hasL3Keyword) {
            Write-L123AccelerationResult `
                -Decision "l3_approval_only" `
                -ResolvedTaskId $resolvedTaskId `
                -RiskTier "L3" `
                -ExecutionMode "l123_l3_approval_only" `
                -BlockedGate "l3_high_risk_execution_blocked" `
                -AffectedUseCaseIds $affectedUseCaseIds `
                -NextRecommendedAction "generate_l3_minimal_fresh_approval_package:$resolvedTaskId"
            exit 0
        }

        Write-L123AccelerationResult `
            -Decision "approval_package_ready" `
            -ResolvedTaskId $resolvedTaskId `
            -RiskTier "L0" `
            -ExecutionMode "l123_approval_package" `
            -AffectedUseCaseIds $affectedUseCaseIds `
            -NextRecommendedAction "generate_l123_approval_package:$resolvedTaskId"
        exit 0
    }

    if ($hasExactScopeShape) {
        $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
        $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
        $commands = @(Get-ListValues -Block $taskBlock -Key "commands")
        $validationCommands = @(Get-ListValues -Block $taskBlock -Key "validationCommands")
        $broadHighRiskAllowedFiles = @(Get-BroadHighRiskAllowedFiles -AllowedFiles $allowedFiles)

        if ($broadHighRiskAllowedFiles.Count -gt 0) {
            Write-L123AccelerationResult `
                -Decision "hard_block" `
                -ResolvedTaskId $resolvedTaskId `
                -RiskTier "L1L2" `
                -ExecutionMode "none" `
                -BlockedGate "broad_or_high_risk_allowed_file:$($broadHighRiskAllowedFiles -join ',')" `
                -AffectedUseCaseIds $affectedUseCaseIds `
                -NextRecommendedAction "replace_with_exact_scope_approval_package:$resolvedTaskId"
            exit 0
        }

        $missingApprovalFields = New-Object System.Collections.Generic.List[string]
        if ($allowedFiles.Count -eq 0) { $missingApprovalFields.Add("allowedFiles") }
        if ($blockedFiles.Count -eq 0) { $missingApprovalFields.Add("blockedFiles") }
        if (($commands.Count + $validationCommands.Count) -eq 0) { $missingApprovalFields.Add("commands") }
        if ($taskBlockText -notmatch "(?im)^\s+redaction\s*:|redaction policy|redaction:") { $missingApprovalFields.Add("redaction") }
        if ($taskBlockText -notmatch "(?im)^\s+rollback\s*:|rollback plan|revert plan") { $missingApprovalFields.Add("rollback") }
        if ($taskBlockText -notmatch "(?im)^\s+stopConditions\s*:|stop conditions|stopConditions:") { $missingApprovalFields.Add("stopConditions") }

        if ($missingApprovalFields.Count -gt 0) {
            Write-L123AccelerationResult `
                -Decision "approval_package_required" `
                -ResolvedTaskId $resolvedTaskId `
                -RiskTier "L1L2" `
                -ExecutionMode "l123_approval_package" `
                -MissingApprovalFields $missingApprovalFields.ToArray() `
                -BlockedGate "l1_l2_exact_scope_incomplete" `
                -AffectedUseCaseIds $affectedUseCaseIds `
                -NextRecommendedAction "generate_exact_scope_fresh_approval_package:$resolvedTaskId"
            exit 0
        }

        Write-L123AccelerationResult `
            -Decision "exact_scope_ready" `
            -ResolvedTaskId $resolvedTaskId `
            -RiskTier "L1L2" `
            -ExecutionMode "l123_exact_scope_local" `
            -AffectedUseCaseIds $affectedUseCaseIds `
            -NextRecommendedAction "allow_serial_executor_gate:$resolvedTaskId"
        exit 0
    }

    if ($hasL3Keyword) {
        Write-L123AccelerationResult `
            -Decision "l3_approval_only" `
            -ResolvedTaskId $resolvedTaskId `
            -RiskTier "L3" `
            -ExecutionMode "l123_l3_approval_only" `
            -BlockedGate "l3_high_risk_execution_blocked" `
            -AffectedUseCaseIds $affectedUseCaseIds `
            -NextRecommendedAction "generate_l3_minimal_fresh_approval_package:$resolvedTaskId"
        exit 0
    }

    Write-L123AccelerationResult `
        -Decision "no_l123_classification" `
        -ResolvedTaskId $resolvedTaskId `
        -RiskTier "none" `
        -ExecutionMode "none" `
        -AffectedUseCaseIds $affectedUseCaseIds `
        -NextRecommendedAction "continue_existing_mechanism:$resolvedTaskId"
} catch {
    Write-Output "HARD_BLOCK_L123_ACCELERATION_READINESS_ERROR $($_.Exception.Message)"
    Write-L123AccelerationResult `
        -Decision "hard_block" `
        -ResolvedTaskId $(if ([string]::IsNullOrWhiteSpace($TaskId)) { "unknown" } else { $TaskId }) `
        -RiskTier "unknown" `
        -ExecutionMode "none" `
        -BlockedGate "script_exception" `
        -NextRecommendedAction "manual_required_owner_recovery"
    exit 1
}
