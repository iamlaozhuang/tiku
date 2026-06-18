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
    [ValidateRange(1, 10)]
    [int]$MaxTasksPerWake = 2
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

function Get-Indent {
    param([Parameter(Mandatory = $true)][string]$Line)

    if ($Line -match "^(\s*)") {
        return $Matches[1].Length
    }

    return 0
}

function Get-TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $currentId = ""
    $currentLines = New-Object System.Collections.Generic.List[string]
    $insideTasks = $false
    $taskItemIndent = -1

    foreach ($line in $Lines) {
        if ($line -match "^tasks:\s*$") {
            $insideTasks = $true
            continue
        }

        if (-not $insideTasks) {
            continue
        }

        if ($line -match "^(\s*)-\s+id:\s+(.+?)\s*$") {
            $lineIndent = $Matches[1].Length
            if ($taskItemIndent -lt 0) {
                $taskItemIndent = $lineIndent
            }

            if ($lineIndent -eq $taskItemIndent) {
                if (-not [string]::IsNullOrWhiteSpace($currentId)) {
                    $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
                }
                $currentId = $Matches[2].Trim()
                $currentLines = New-Object System.Collections.Generic.List[string]
                $currentLines.Add($line)
                continue
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId)) {
            if (-not [string]::IsNullOrWhiteSpace($line) -and (Get-Indent -Line $line) -lt $taskItemIndent) {
                break
            }

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

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*?)\s*$") {
            $value = $Matches[1].Trim()
            if ($value -match "^(.*?)\s+#.*$") {
                $value = $Matches[1].Trim()
            }
            return $value.Trim('"').Trim("'")
        }
    }

    return ""
}

function Get-SectionBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $sectionLines = New-Object System.Collections.Generic.List[string]
    $insideSection = $false
    $sectionIndent = -1

    foreach ($line in $Block) {
        if (-not $insideSection -and $line -match "^\s+$([regex]::Escape($Key)):\s*$") {
            $insideSection = $true
            $sectionIndent = Get-Indent -Line $line
            continue
        }

        if ($insideSection) {
            if (-not [string]::IsNullOrWhiteSpace($line) -and (Get-Indent -Line $line) -le $sectionIndent) {
                break
            }
            $sectionLines.Add($line)
        }
    }

    return $sectionLines.ToArray()
}

function Get-SectionScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$SectionKey,
        [Parameter(Mandatory = $true)][string]$ScalarKey
    )

    $sectionBlock = @(Get-SectionBlock -Block $Block -Key $SectionKey)
    return Get-ScalarValue -Block $sectionBlock -Key $ScalarKey
}

function ConvertFrom-YamlListScalar {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    $normalizedValue = $Value.Trim()
    if ($normalizedValue -match '^"([^"]*)"\s*(?:#.*)?$') {
        return $Matches[1].Trim()
    }
    if ($normalizedValue -match "^'([^']*)'\s*(?:#.*)?$") {
        return $Matches[1].Trim()
    }
    if ($normalizedValue -match "^(.*?)\s+#.*$") {
        $normalizedValue = $Matches[1].Trim()
    }

    return $normalizedValue.Trim()
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $sectionBlock = @(Get-SectionBlock -Block $Block -Key $Key)
    $values = New-Object System.Collections.Generic.List[string]
    foreach ($line in $sectionBlock) {
        if ($line -match "^\s+-\s+(.+?)\s*$") {
            $values.Add((ConvertFrom-YamlListScalar -Value $Matches[1]))
        }
    }

    return $values.ToArray()
}

function Test-StructuredCloseoutPolicy {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

    $taskText = ($TaskBlock -join "`n")
    if ($taskText -notmatch "(?im)^\s+closeoutPolicy:\s*$") {
        return $false
    }

    $hasLocalCommit = $taskText -match "(?im)^\s+localCommit:\s*approved\s*$" `
        -or $taskText -match "(?ims)^\s+localCommit:\s*\r?\n\s+approved:\s*true\s*$"
    $hasMergeTarget = $taskText -match "(?im)^\s+fastForwardMerge:\s*$" -and $taskText -match "(?im)^\s+targetBranch:\s*master\s*$"
    $hasPushTarget = $taskText -match "(?im)^\s+push:\s*$" -and $taskText -match "(?im)^\s+target:\s*origin/master\s*$"
    $hasCleanup = $taskText -match "(?im)^\s+cleanup:\s*$" `
        -and $taskText -match "(?im)^\s+deleteShortBranch:\s*true\s*$" `
        -and $taskText -match "(?im)^\s+parkWorktree:\s*true\s*$"
    $approvedCount = ([regex]::Matches($taskText, "(?im)^\s+approved:\s*true\s*$")).Count

    return $hasLocalCommit -and $hasMergeTarget -and $hasPushTarget -and $hasCleanup -and $approvedCount -ge 2
}

function Write-EligibilityResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$ResolvedTaskId = "",
        [Parameter(Mandatory = $false)][string]$DrainEligible = "false",
        [Parameter(Mandatory = $false)][string]$RiskProfile = "none",
        [Parameter(Mandatory = $false)][string]$ValidationCostClass = "none",
        [Parameter(Mandatory = $false)][int]$MaxTasksThisWake = 0,
        [Parameter(Mandatory = $false)][int]$MaxChangedFiles = 0,
        [Parameter(Mandatory = $false)][int]$MaxChangedLines = 0,
        [Parameter(Mandatory = $false)][string]$AutoRepairAllowance = "none"
    )

    Write-Section -Title "Result"
    Write-Output "queueDrainEligibilityDecision: $Decision"
    if (-not [string]::IsNullOrWhiteSpace($ResolvedTaskId)) {
        Write-Output "queueDrainTask: $ResolvedTaskId"
    }
    Write-Output "drainEligible: $DrainEligible"
    Write-Output "drainRiskProfile: $RiskProfile"
    Write-Output "validationCostClass: $ValidationCostClass"
    Write-Output "maxTasksThisWake: $MaxTasksThisWake"
    Write-Output "maxChangedFiles: $MaxChangedFiles"
    Write-Output "maxChangedLines: $MaxChangedLines"
    Write-Output "autoRepairAllowance: $AutoRepairAllowance"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Convert-ToPositiveIntOrDefault {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value,
        [Parameter(Mandatory = $true)][int]$Default
    )

    $parsed = 0
    if ([int]::TryParse($Value, [ref]$parsed) -and $parsed -gt 0) {
        return $parsed
    }

    return $Default
}

try {
    Write-Section -Title "Module Run v2 Queue Drain Eligibility"
    Write-Output "queueDrainEligibilityMode: hard_block"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Write-EligibilityResult -Decision "stop_for_hard_block" -Reason "missing required file: $requiredPath" -ExitCode 1
        }
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }
    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        Write-EligibilityResult -Decision "not_eligible" -Reason "no task id was supplied or discoverable" -ExitCode 0
    }

    Write-Output "taskId: $TaskId"
    $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        Write-EligibilityResult -Decision "stop_for_hard_block" -ResolvedTaskId $TaskId -Reason "task block not found" -ExitCode 1
    }

    $taskText = ($taskBlock -join "`n")
    $taskKind = Get-ScalarValue -Block $taskBlock -Key "taskKind"
    $executionProfile = Get-ScalarValue -Block $taskBlock -Key "executionProfile"
    $hasDrainPolicy = $taskText -match "(?im)^\s+drainPolicy:\s*$"
    $usesDefaultLowRiskLocalCodeDrain = -not $hasDrainPolicy -and $taskKind -eq "implementation"
    $usesDefaultLowRiskExperienceBatchDrain = -not $hasDrainPolicy -and $taskKind -eq "local_experience_batch" -and $executionProfile -eq "local_low_risk_experience_batch"
    if (-not $hasDrainPolicy -and -not $usesDefaultLowRiskLocalCodeDrain -and -not $usesDefaultLowRiskExperienceBatchDrain) {
        Write-EligibilityResult -Decision "not_eligible" -ResolvedTaskId $TaskId -Reason "task has no drainPolicy; default is no drain" -ExitCode 0
    }

    $drainEligible = if ($usesDefaultLowRiskLocalCodeDrain -or $usesDefaultLowRiskExperienceBatchDrain) { "true" } else { (Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "drainEligible").ToLowerInvariant() }
    $riskProfile = if ($usesDefaultLowRiskLocalCodeDrain) { "low_risk_local_code" } elseif ($usesDefaultLowRiskExperienceBatchDrain) { "low_risk_experience_batch" } else { Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "riskProfile" }
    $validationCostClass = if ($usesDefaultLowRiskExperienceBatchDrain) { "batch" } elseif ($usesDefaultLowRiskLocalCodeDrain) { "standard" } else { Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "validationCostClass" }
    $requiredFreshApproval = if ($usesDefaultLowRiskLocalCodeDrain -or $usesDefaultLowRiskExperienceBatchDrain) { "false" } else { (Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "requiredFreshApproval").ToLowerInvariant() }
    $maxTasksPerPolicy = if ($usesDefaultLowRiskExperienceBatchDrain) { 5 } elseif ($usesDefaultLowRiskLocalCodeDrain) { 2 } else { Convert-ToPositiveIntOrDefault -Value (Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "maxTasksPerWake") -Default 1 }
    $maxChangedFiles = if ($usesDefaultLowRiskExperienceBatchDrain) { 40 } elseif ($usesDefaultLowRiskLocalCodeDrain) { 20 } else { Convert-ToPositiveIntOrDefault -Value (Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "maxChangedFiles") -Default 20 }
    $maxChangedLines = if ($usesDefaultLowRiskExperienceBatchDrain) { 1200 } elseif ($usesDefaultLowRiskLocalCodeDrain) { 800 } else { Convert-ToPositiveIntOrDefault -Value (Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "maxChangedLines") -Default 800 }
    $autoRepairAllowance = if ($usesDefaultLowRiskExperienceBatchDrain) { "test_only_contract_fixture_red_green" } elseif ($usesDefaultLowRiskLocalCodeDrain) { "format_lint_evidence_once" } else { Get-SectionScalarValue -Block $taskBlock -SectionKey "drainPolicy" -ScalarKey "autoRepairAllowance" }
    if ([string]::IsNullOrWhiteSpace($validationCostClass)) {
        $validationCostClass = "standard"
    }
    if ([string]::IsNullOrWhiteSpace($autoRepairAllowance)) {
        $autoRepairAllowance = "none"
    }
    $maxTasksThisWake = [Math]::Min($MaxTasksPerWake, $maxTasksPerPolicy)

    Write-Section -Title "Drain Policy"
    Write-Output "drainEligible: $drainEligible"
    Write-Output "drainRiskProfile: $riskProfile"
    Write-Output "validationCostClass: $validationCostClass"
    Write-Output "requiredFreshApproval: $requiredFreshApproval"

    if ($drainEligible -ne "true") {
        Write-EligibilityResult -Decision "not_eligible" -ResolvedTaskId $TaskId -DrainEligible "false" -RiskProfile $riskProfile -ValidationCostClass $validationCostClass -Reason "drainEligible is not true" -ExitCode 0
    }

    $resultBase = @{
        ResolvedTaskId = $TaskId
        DrainEligible = "true"
        RiskProfile = $riskProfile
        ValidationCostClass = $validationCostClass
        MaxTasksThisWake = $maxTasksThisWake
        MaxChangedFiles = $maxChangedFiles
        MaxChangedLines = $maxChangedLines
        AutoRepairAllowance = $autoRepairAllowance
    }

    if ([string]::IsNullOrWhiteSpace($riskProfile)) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task is missing riskProfile" -ExitCode 1
    }

    if ($requiredFreshApproval -eq "true") {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task requires fresh approval" -ExitCode 1
    }

    if ($riskProfile -eq "single_task_only") {
        Write-EligibilityResult @resultBase -Decision "single_task_only" -Reason "risk profile is not eligible for multi-task drain in this phase" -ExitCode 0
    }

    if ($riskProfile -notin @("docs_governance", "mechanism_low_risk", "low_risk_local_code", "low_risk_experience_batch")) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task uses blocked or unknown riskProfile: $riskProfile" -ExitCode 1
    }

    $riskTypes = @(Get-ListValues -Block $taskBlock -Key "riskTypes")
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
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task includes high-risk riskTypes: $($conflictingRiskTypes -join ',')" -ExitCode 1
    }

    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
    if ($allowedFiles.Count -eq 0) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task has no allowedFiles" -ExitCode 1
    }
    if ($blockedFiles.Count -eq 0) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task has no blockedFiles" -ExitCode 1
    }

    $hasApprovalAnchor = $taskText -match "(?im)^\s+humanApproval:\s*.+" `
        -or $taskText -match "autoDriveLocalImplementationApproval" `
        -or $taskText -match "standingUnattendedLocalCloseoutApproval" `
        -or $taskText -match "standingLocalLowRiskExperienceAdvancementApproval"
    if (-not $hasApprovalAnchor) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task lacks an approval anchor" -ExitCode 1
    }

    if (Get-Command -Name Get-ModuleRunV2ValidationSurface -ErrorAction SilentlyContinue) {
        $validationProfile = Get-ModuleRunV2ValidationSurface -TaskBlock $taskBlock
    } else {
        $validationProfile = Get-ScalarValue -Block $taskBlock -Key "validationProfile"
    }
    $validationCommands = @(Get-ListValues -Block $taskBlock -Key "validationCommands")
    $hasValidationLifecycle = $taskText -match "(?im)^\s+validationCommandLifecycle:\s*$"
    if ([string]::IsNullOrWhiteSpace($validationProfile)) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task has no validationPolicy or validationProfile" -ExitCode 1
    }
    if ($validationCommands.Count -eq 0 -and -not $hasValidationLifecycle) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task has no validation command surface" -ExitCode 1
    }

    $evidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
    $auditReviewPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
    if ([string]::IsNullOrWhiteSpace($evidencePath) -or [string]::IsNullOrWhiteSpace($auditReviewPath)) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task lacks evidencePath or auditReviewPath" -ExitCode 1
    }

    $hasStructuredCloseoutPolicy = if (Get-Command -Name Test-ModuleRunV2CloseoutPolicy -ErrorAction SilentlyContinue) {
        Test-ModuleRunV2CloseoutPolicy -TaskBlock $taskBlock
    } else {
        Test-StructuredCloseoutPolicy -TaskBlock $taskBlock
    }
    if (-not $hasStructuredCloseoutPolicy) {
        Write-EligibilityResult @resultBase -Decision "stop_for_hard_block" -Reason "drainEligible task lacks structured closeoutPolicy" -ExitCode 1
    }

    Write-EligibilityResult @resultBase -Decision "eligible" -Reason "task is eligible for bounded queue drain" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-EligibilityResult -Decision "stop_for_hard_block" -Reason "queue drain eligibility encountered an error" -ExitCode 1
}
