param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 8)]
    [int]$MaxBatchCount = 8,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Write-SeedProposalResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "seedProposalDecision: $Decision"
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

function Get-TaskScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return ""
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

function Get-ExecutionModules {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $modules = New-Object System.Collections.Generic.List[object]
    $insideExecutionModules = $false
    $currentModule = $null
    $currentList = ""

    foreach ($line in $Lines) {
        if ($line -match "^executionModules:\s*$") {
            $insideExecutionModules = $true
            continue
        }

        if (-not $insideExecutionModules) {
            continue
        }

        if ($line -match "^\S" -and $line -notmatch "^executionModules:\s*$") {
            break
        }

        if ($line -match "^\s{2}- module:\s*(.+?)\s*$") {
            if ($null -ne $currentModule) {
                $modules.Add($currentModule)
            }
            $currentModule = [pscustomobject]@{
                Module = Remove-ValueQuotes -Value $Matches[1]
                SourceModules = New-Object System.Collections.Generic.List[string]
                DependsOn = New-Object System.Collections.Generic.List[string]
                TargetClosure = New-Object System.Collections.Generic.List[string]
                LocalFullLoopMinimum = ""
            }
            $currentList = ""
            continue
        }

        if ($null -eq $currentModule) {
            continue
        }

        if ($line -match "^\s{4}localFullLoopMinimum:\s*(.+?)\s*$") {
            $currentModule.LocalFullLoopMinimum = Remove-ValueQuotes -Value $Matches[1]
            $currentList = ""
            continue
        }

        if ($line -match "^\s{4}(sourceModules|dependsOnExecutionModules|targetLocalClosure):\s*$") {
            $currentList = $Matches[1]
            continue
        }

        if ($line -match "^\s{4}\S[^:]*:\s*") {
            $currentList = ""
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentList) -and $line -match "^\s{6}-\s+(.+?)\s*$") {
            $value = Remove-ValueQuotes -Value $Matches[1]
            if ($currentList -eq "sourceModules") {
                $currentModule.SourceModules.Add($value)
            } elseif ($currentList -eq "dependsOnExecutionModules") {
                $currentModule.DependsOn.Add($value)
            } elseif ($currentList -eq "targetLocalClosure") {
                $currentModule.TargetClosure.Add($value)
            }
        }
    }

    if ($null -ne $currentModule) {
        $modules.Add($currentModule)
    }

    return $modules.ToArray()
}

function Get-SourcePlanningTaskMap {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $map = @{}
    $insideSourceModules = $false
    $currentSourceTask = ""
    $currentExecutionModule = ""

    foreach ($line in $Lines) {
        if ($line -match "^sourcePlanningModules:\s*$") {
            $insideSourceModules = $true
            continue
        }

        if (-not $insideSourceModules) {
            continue
        }

        if ($line -match "^\S" -and $line -notmatch "^sourcePlanningModules:\s*$") {
            break
        }

        if ($line -match "^\s{2}- module:\s*(.+?)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentExecutionModule) -and -not [string]::IsNullOrWhiteSpace($currentSourceTask)) {
                $map[$currentExecutionModule] = $currentSourceTask
            }
            $currentSourceTask = ""
            $currentExecutionModule = ""
            continue
        }

        if ($line -match "^\s{4}sourcePlanningTask:\s*(.+?)\s*$") {
            $currentSourceTask = Remove-ValueQuotes -Value $Matches[1]
            continue
        }

        if ($line -match "^\s{4}v2ExecutionModule:\s*(.+?)\s*$") {
            $currentExecutionModule = Remove-ValueQuotes -Value $Matches[1]
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentExecutionModule) -and -not [string]::IsNullOrWhiteSpace($currentSourceTask)) {
        $map[$currentExecutionModule] = $currentSourceTask
    }

    return $map
}

function Test-ModuleClosureMarker {
    param(
        [Parameter(Mandatory = $true)][object[]]$TaskBlocks,
        [Parameter(Mandatory = $true)][string]$ModuleId
    )

    foreach ($block in $TaskBlocks) {
        $status = Get-TaskScalarValue -Block $block.Lines -Key "status"
        $blockText = $block.Lines -join "`n"
        if ($status -in @("done", "closed", "pushed") -and (
                $blockText -match "(?m)^\s+moduleRunClosed:\s*$([regex]::Escape($ModuleId))\s*$" -or
                $block.Id -eq "module-run-v2-$ModuleId-closeout" -or
                $block.Id -eq "module-run-v2-$ModuleId-local-closure"
            )) {
            return $true
        }
    }

    return $false
}

function Test-TerminalTaskStatus {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Status)

    return $Status -in @("done", "closed", "pushed", "merged")
}

function Test-TargetClosureCompleted {
    param(
        [Parameter(Mandatory = $true)][object[]]$TaskBlocks,
        [Parameter(Mandatory = $true)][string]$ModuleId,
        [Parameter(Mandatory = $true)][string]$TargetClosure
    )

    foreach ($block in $TaskBlocks) {
        $status = Get-TaskScalarValue -Block $block.Lines -Key "status"
        if (-not (Test-TerminalTaskStatus -Status $status)) {
            continue
        }

        $blockText = $block.Lines -join "`n"
        $hasSeededModule = $blockText -match "(?m)^\s+seededExecutionModule:\s*$([regex]::Escape($ModuleId))\s*$"
        $hasTargetClosure = $blockText -match "(?m)^\s+targetClosureItem:\s*$([regex]::Escape($TargetClosure))\s*$"
        if ($hasSeededModule -and $hasTargetClosure) {
            return $true
        }
    }

    return $false
}

function Test-ModuleTargetClosureCompleted {
    param(
        [Parameter(Mandatory = $true)][object[]]$TaskBlocks,
        [Parameter(Mandatory = $true)]$ExecutionModule
    )

    $targetClosureItems = @($ExecutionModule.TargetClosure)
    if ($targetClosureItems.Count -eq 0) {
        return $false
    }

    foreach ($targetClosure in $targetClosureItems) {
        if (-not (Test-TargetClosureCompleted -TaskBlocks $TaskBlocks -ModuleId $ExecutionModule.Module -TargetClosure $targetClosure)) {
            return $false
        }
    }

    return $true
}

function Test-ModuleCompleted {
    param(
        [Parameter(Mandatory = $true)][object[]]$TaskBlocks,
        [Parameter(Mandatory = $true)]$ExecutionModule
    )

    return (Test-ModuleClosureMarker -TaskBlocks $TaskBlocks -ModuleId $ExecutionModule.Module) -or
        (Test-ModuleTargetClosureCompleted -TaskBlocks $TaskBlocks -ExecutionModule $ExecutionModule)
}

function Get-FirstEligibleBatchNumber {
    param([Parameter(Mandatory = $true)][string]$MatrixContent)

    if ($MatrixContent -match "firstEligibleImplementationBatchNumber:\s*(\d+)") {
        return [int]$Matches[1]
    }

    return 101
}

function Get-NextCandidateBatchNumber {
    param(
        [Parameter(Mandatory = $true)][object[]]$TaskBlocks,
        [Parameter(Mandatory = $true)][int]$MinimumBatchNumber
    )

    $highestBatchNumber = $MinimumBatchNumber - 1
    foreach ($block in $TaskBlocks) {
        if ($block.Id -match "^batch-(\d+)-") {
            $batchNumber = [int]$Matches[1]
            if ($batchNumber -gt $highestBatchNumber) {
                $highestBatchNumber = $batchNumber
            }
        }
    }

    return [Math]::Max($MinimumBatchNumber, $highestBatchNumber + 1)
}

function ConvertTo-TaskSlug {
    param([Parameter(Mandatory = $true)][string]$Text)

    $slug = $Text.ToLowerInvariant() -replace "[^a-z0-9]+", "-"
    $slug = $slug.Trim("-")
    if ([string]::IsNullOrWhiteSpace($slug)) {
        $slug = "local-closure"
    }
    if ($slug.Length -gt 44) {
        $slug = $slug.Substring(0, 44).Trim("-")
    }

    return $slug
}

try {
    Write-Section -Title "Module Run v2 Implementation Seed Proposal"
    Write-Output "seedProposalMode: read_only"
    Write-Output "maxBatchCount: $MaxBatchCount"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Write-Output "HARD_BLOCK_MISSING_FILE $requiredPath"
            Write-SeedProposalResult -Decision "stop_for_hard_block" -Reason "required durable file is missing" -ExitCode 1
        }
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $matrixLines = @(Get-Content -LiteralPath $MatrixPath)
    $matrixContent = $matrixLines -join "`n"

    if ($matrixContent -notmatch "implementationAutoSeedGate\s*:" -or $matrixContent -notmatch "Cost Calibration Gate remains blocked") {
        Write-Output "HARD_BLOCK_MATRIX_AUTO_SEED_ANCHOR_MISSING"
        Write-SeedProposalResult -Decision "stop_for_hard_block" -Reason "matrix is missing auto-seed or cost gate anchors" -ExitCode 1
    }

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
    $currentTaskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
    $currentTaskStatus = Get-TaskScalarValue -Block $currentTaskBlock -Key "status"
    $pendingTaskIds = @()
    $inProgressTaskIds = @()
    foreach ($block in $taskBlocks) {
        $status = Get-TaskScalarValue -Block $block.Lines -Key "status"
        if ($status -eq "pending") {
            $pendingTaskIds += $block.Id
        } elseif ($status -eq "in_progress") {
            $inProgressTaskIds += $block.Id
        }
    }

    Write-Section -Title "Queue"
    Write-Output "taskId: $TaskId"
    Write-Output "currentTaskStatus: $currentTaskStatus"
    Write-Output "pendingTaskCount: $($pendingTaskIds.Count)"
    Write-Output "inProgressTaskCount: $($inProgressTaskIds.Count)"

    if ($pendingTaskIds.Count -gt 0 -or ($inProgressTaskIds.Count -gt 0 -and $currentTaskStatus -ne "closed" -and $currentTaskStatus -ne "done")) {
        Write-SeedProposalResult -Decision "executable_task_exists" -Reason "queue already has executable task state" -ExitCode 0
    }

    $executionModules = @(Get-ExecutionModules -Lines $matrixLines)
    $sourcePlanningTaskMap = Get-SourcePlanningTaskMap -Lines $matrixLines
    if ($executionModules.Count -eq 0) {
        Write-Output "HARD_BLOCK_NO_EXECUTION_MODULES"
        Write-SeedProposalResult -Decision "stop_for_hard_block" -Reason "matrix has no execution modules" -ExitCode 1
    }

    $selectedModule = $null
    foreach ($executionModule in $executionModules) {
        if (Test-ModuleCompleted -TaskBlocks $taskBlocks -ExecutionModule $executionModule) {
            Write-Output "seedModuleAlreadyComplete: $($executionModule.Module)"
            continue
        }

        $dependencyBlocked = $false
        foreach ($dependency in $executionModule.DependsOn) {
            $dependencyModule = @($executionModules | Where-Object { $_.Module -eq $dependency } | Select-Object -First 1)
            $dependencyComplete = $false
            if ($dependencyModule.Count -gt 0) {
                $dependencyComplete = Test-ModuleCompleted -TaskBlocks $taskBlocks -ExecutionModule $dependencyModule[0]
            } else {
                $dependencyComplete = Test-ModuleClosureMarker -TaskBlocks $taskBlocks -ModuleId $dependency
            }

            if (-not $dependencyComplete) {
                $dependencyBlocked = $true
                Write-Output "seedDependencyBlocked: $($executionModule.Module) waitsFor=$dependency"
                break
            }
        }

        if (-not $dependencyBlocked) {
            $selectedModule = $executionModule
            break
        }
    }

    if ($null -eq $selectedModule) {
        Write-SeedProposalResult -Decision "no_seed_candidate" -Reason "no execution module has satisfied dependencies" -ExitCode 0
    }

    $targetClosureItems = @($selectedModule.TargetClosure | Where-Object {
            -not (Test-TargetClosureCompleted -TaskBlocks $taskBlocks -ModuleId $selectedModule.Module -TargetClosure $_)
        })
    if ($targetClosureItems.Count -eq 0) {
        Write-Output "HARD_BLOCK_SELECTED_MODULE_HAS_NO_TARGET_CLOSURE $($selectedModule.Module)"
        Write-SeedProposalResult -Decision "stop_for_hard_block" -Reason "selected module has no remaining target closure items" -ExitCode 1
    }

    $sourcePlanningTask = ""
    if ($sourcePlanningTaskMap.ContainsKey($selectedModule.Module)) {
        $sourcePlanningTask = $sourcePlanningTaskMap[$selectedModule.Module]
    }
    if ([string]::IsNullOrWhiteSpace($sourcePlanningTask)) {
        $sourcePlanningTask = $TaskId
    }

    $batchNumber = Get-NextCandidateBatchNumber -TaskBlocks $taskBlocks -MinimumBatchNumber (Get-FirstEligibleBatchNumber -MatrixContent $matrixContent)
    $candidateCount = [Math]::Min($MaxBatchCount, $targetClosureItems.Count)

    Write-Section -Title "Seed Candidate"
    Write-Output "seedModule: $($selectedModule.Module)"
    Write-Output "seedSourcePlanningTask: $sourcePlanningTask"
    Write-Output "seedLocalFullLoopMinimum: $($selectedModule.LocalFullLoopMinimum)"
    Write-Output "seedCandidateTaskCount: $candidateCount"
    Write-Output "seedRequiredApproval: autoDriveLocalImplementationApproval for module $($selectedModule.Module)"

    for ($index = 0; $index -lt $candidateCount; $index++) {
        $targetClosure = $targetClosureItems[$index]
        $slug = ConvertTo-TaskSlug -Text $targetClosure
        $candidateTaskId = "batch-$($batchNumber + $index)-$($selectedModule.Module)-$slug"
        $validationProfile = if ([string]::IsNullOrWhiteSpace($selectedModule.LocalFullLoopMinimum)) { "L2-local-implementation" } else { "$($selectedModule.LocalFullLoopMinimum)-local-implementation" }
        Write-Output "seedCandidateTask: $candidateTaskId"
        Write-Output "seedCandidateTargetClosure: $targetClosure"
        Write-Output "seedCandidateRequirementRef: $sourcePlanningTask"
        Write-Output "seedCandidateUseCase: $($selectedModule.Module) local implementation validates $targetClosure"
        Write-Output "seedCandidateAcceptanceScenario: $targetClosure passes $validationProfile without provider/env/schema/deploy/dependency changes"
        Write-Output "seedCandidateBehaviorBoundary: $($selectedModule.Module)::$targetClosure"
        Write-Output "seedCandidateNonGoal: provider/env/schema/deploy/dependency changes and Cost Calibration Gate execution"
        Write-Output "seedCandidateValidationProfile: $validationProfile"
    }

    if ($candidateCount -lt $targetClosureItems.Count) {
        for ($index = $candidateCount; $index -lt $targetClosureItems.Count; $index++) {
            Write-Output "seedBlockedRemainder: $($targetClosureItems[$index])"
        }
    } else {
        Write-Output "seedBlockedRemainder: none"
    }

    Write-SeedProposalResult -Decision "proposal_available" -Reason "seed proposal is available for the next execution module" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-SeedProposalResult -Decision "stop_for_hard_block" -Reason "seed proposal script encountered an error" -ExitCode 1
}
