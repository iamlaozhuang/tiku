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
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$LocalExperienceMatrixPath = "docs\04-agent-system\state\local-experience-coverage-matrix.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskHistoryIndexPath = "docs\04-agent-system\state\task-history-index.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ExecutionLogIndexPath = "docs\05-execution-logs\execution-log-index.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$HistoricalEvidenceDebtPath = "docs\04-agent-system\state\historical-evidence-debt.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ExecutionProfileCatalogPath = "docs\04-agent-system\state\execution-profiles.yaml",

    [Parameter(Mandatory = $false)]
    [switch]$VerboseHistory
)

$ErrorActionPreference = "Stop"

function Get-Indent {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Line)

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
        if ($line -match "^(tasks|entries):\s*$") {
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
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Blocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($block in $Blocks) {
        if ($block.Id -eq $Id) {
            return $block.Lines
        }
    }

    return @()
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim().Trim('"')
        }
    }

    return ""
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
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
            if ($line -match '^(\s*)\S') {
                $indent = $Matches[1].Length
                if ($indent -le $baseIndent) {
                    break
                }
            }

            if ($line -match '^\s*-\s+(.+?)\s*$') {
                [void]$values.Add($Matches[1].Trim())
            }
        }
    }

    return $values
}

function Get-ProjectSection {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $section = New-Object System.Collections.Generic.List[string]
    $inSection = $false

    foreach ($line in $Lines) {
        if (-not $inSection -and $line -match "^$([regex]::Escape($Key)):\s*$") {
            $inSection = $true
            continue
        }

        if ($inSection) {
            if ($line -match '^\S.+:\s*' -and $line -notmatch "^\s") {
                break
            }

            $section.Add($line)
        }
    }

    return $section.ToArray()
}

function Get-ProjectScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Section,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $sectionLines = @(Get-ProjectSection -Lines $Lines -Key $Section)
    return Get-ScalarValue -Block $sectionLines -Key $Key
}

function Get-GitValue {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    $output = @(& git @Arguments 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return ""
    }

    return (($output -join "`n").Trim())
}

function Get-OutputValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Invoke-SeedProposalDiagnostic {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$MatrixPath
    )

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2ImplementationSeedProposal.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("seedProposalDecision: unavailable", "seedProposalReason: seed proposal script is missing")
            ExitCode = 1
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(
            & powershell.exe `
                -NoProfile `
                -ExecutionPolicy Bypass `
                -File $scriptPath `
                -ProjectStatePath $ProjectStatePath `
                -QueuePath $QueuePath `
                -MatrixPath $MatrixPath 2>&1
        )
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-LocalExperienceBridgeDiagnostic {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$MatrixPath
    )

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2LocalExperienceBridgeProposal.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("bridgeProposalDecision: unavailable", "bridgeProposalReason: local experience bridge proposal script is missing")
            ExitCode = 1
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(
            & powershell.exe `
                -NoProfile `
                -ExecutionPolicy Bypass `
                -File $scriptPath `
                -ProjectStatePath $ProjectStatePath `
                -QueuePath $QueuePath `
                -MatrixPath $MatrixPath 2>&1
        )
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-LocalExperienceNextTaskDiagnostic {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$MatrixPath
    )

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2LocalExperienceNextTaskProposal.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("localExperienceNextTaskDecision: unavailable", "reason: local experience next-task proposal script is missing")
            ExitCode = 1
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(
            & powershell.exe `
                -NoProfile `
                -ExecutionPolicy Bypass `
                -File $scriptPath `
                -ProjectStatePath $ProjectStatePath `
                -QueuePath $QueuePath `
                -MatrixPath $MatrixPath 2>&1
        )
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-L123AccelerationDiagnostic {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$MatrixPath,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$TaskId = ""
    )

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2L123AccelerationReadiness.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("l123AccelerationDecision: unavailable", "reason: L123 acceleration readiness script is missing")
            ExitCode = 1
        }
    }

    $l123Args = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $scriptPath,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId) -and $TaskId -ne "none") {
        $l123Args += @("-TaskId", $TaskId)
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& powershell.exe @l123Args 2>&1)
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-GuardedGoalPacketDiagnostic {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$TaskHistoryIndexPath,
        [Parameter(Mandatory = $true)][string]$ExecutionProfileCatalogPath
    )

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2GuardedGoalPacket.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("guardedGoalPacketDecision: unavailable", "reason: guarded goal packet diagnostic script is missing")
            ExitCode = 1
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(
            & powershell.exe `
                -NoProfile `
                -ExecutionPolicy Bypass `
                -File $scriptPath `
                -ProjectStatePath $ProjectStatePath `
                -QueuePath $QueuePath `
                -TaskHistoryIndexPath $TaskHistoryIndexPath `
                -ExecutionProfileCatalogPath $ExecutionProfileCatalogPath 2>&1
        )
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Test-DependencyTerminal {
    param(
        [Parameter(Mandatory = $false)][AllowNull()][object]$Blocks = @(),
        [Parameter(Mandatory = $false)][AllowNull()][object]$HistoryBlocks = @(),
        [Parameter(Mandatory = $true)][string]$DependencyId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][System.Collections.ArrayList]$BlockedReasons
    )

    $Blocks = @($Blocks)
    $HistoryBlocks = @($HistoryBlocks)

    $dependencyBlock = @(Get-TaskBlock -Blocks $Blocks -Id $DependencyId)
    if ($dependencyBlock.Count -eq 0) {
        $historyBlock = @(Get-TaskBlock -Blocks $HistoryBlocks -Id $DependencyId)
        if ($historyBlock.Count -eq 0) {
            [void]$BlockedReasons.Add("dependency_missing:$DependencyId")
            return $false
        }

        $historyStatus = Get-ScalarValue -Block $historyBlock -Key "status"
        if ($historyStatus -notin @("done", "closed", "pushed", "merged", "local_verified", "metadata_only")) {
            if ([string]::IsNullOrWhiteSpace($historyStatus)) {
                $historyStatus = "missing_status"
            }
            [void]$BlockedReasons.Add("dependency_history_not_terminal:${DependencyId}:$historyStatus")
            return $false
        }

        $historyEvidencePath = Get-ScalarValue -Block $historyBlock -Key "evidencePath"
        if ([string]::IsNullOrWhiteSpace($historyEvidencePath) -or -not (Test-Path -LiteralPath $historyEvidencePath)) {
            [void]$BlockedReasons.Add("dependency_history_evidence_missing:$DependencyId")
            return $false
        }

        return $true
    }

    $status = Get-ScalarValue -Block $dependencyBlock -Key "status"
    if ($status -in @("done", "closed", "pushed", "merged", "local_verified", "metadata_only")) {
        $evidencePath = Get-ScalarValue -Block $dependencyBlock -Key "evidencePath"
        if ([string]::IsNullOrWhiteSpace($evidencePath) -or -not (Test-Path -LiteralPath $evidencePath)) {
            [void]$BlockedReasons.Add("dependency_evidence_missing:$DependencyId")
            return $false
        }

        return $true
    }

    if ([string]::IsNullOrWhiteSpace($status)) {
        $status = "missing_status"
    }
    [void]$BlockedReasons.Add("dependency_not_terminal:${DependencyId}:$status")
    return $false
}

function Get-NextExecutableTask {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Blocks,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][object[]]$HistoryBlocks = @()
    )

    $firstBlockedPending = ""
    $firstBlockedReasons = @()

    foreach ($block in $Blocks) {
        $status = Get-ScalarValue -Block $block.Lines -Key "status"
        if ($status -ne "pending") {
            continue
        }

        $blockedReasons = New-Object System.Collections.ArrayList
        $dependencies = @(Get-ListValues -Block $block.Lines -Key "dependencies")
        foreach ($dependency in $dependencies) {
            $activeBlocksForDependency = @($Blocks)
            if ($activeBlocksForDependency.Count -eq 0) {
                [void]$blockedReasons.Add("dependency_active_queue_empty:$dependency")
                continue
            }
            [void](Test-DependencyTerminal -Blocks $activeBlocksForDependency -HistoryBlocks @($HistoryBlocks) -DependencyId $dependency -BlockedReasons $blockedReasons)
        }

        if ($blockedReasons.Count -eq 0) {
            return [pscustomobject]@{
                Id = $block.Id
                Block = $block.Lines
                BlockedReasons = @()
            }
        }

        if ([string]::IsNullOrWhiteSpace($firstBlockedPending)) {
            $firstBlockedPending = $block.Id
            $firstBlockedReasons = @($blockedReasons)
        }
    }

    return [pscustomobject]@{
        Id = ""
        Block = @()
        BlockedPendingTask = $firstBlockedPending
        BlockedReasons = $firstBlockedReasons
    }
}

function Get-ReadyExecutableTasks {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Blocks,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][object[]]$HistoryBlocks = @()
    )

    $readyTasks = New-Object System.Collections.ArrayList
    foreach ($block in $Blocks) {
        $status = Get-ScalarValue -Block $block.Lines -Key "status"
        if ($status -ne "pending") {
            continue
        }

        $blockedReasons = New-Object System.Collections.ArrayList
        $dependencies = @(Get-ListValues -Block $block.Lines -Key "dependencies")
        foreach ($dependency in $dependencies) {
            $activeBlocksForDependency = @($Blocks)
            if ($activeBlocksForDependency.Count -eq 0) {
                [void]$blockedReasons.Add("dependency_active_queue_empty:$dependency")
                continue
            }
            [void](Test-DependencyTerminal -Blocks $activeBlocksForDependency -HistoryBlocks @($HistoryBlocks) -DependencyId $dependency -BlockedReasons $blockedReasons)
        }

        if ($blockedReasons.Count -eq 0) {
            [void]$readyTasks.Add($block.Id)
        }
    }

    return @($readyTasks)
}

function Join-OrNone {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Values)

    $nonEmpty = @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($nonEmpty.Count -eq 0) {
        return "none"
    }

    return ($nonEmpty -join "; ")
}

function Join-FirstItems {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Values)

    $nonEmpty = @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($nonEmpty.Count -eq 0) {
        return "none"
    }

    return (($nonEmpty | Select-Object -First 5) -join ",")
}

function Get-CatalogNestedScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory = $true)][string]$Section,
        [Parameter(Mandatory = $true)][string]$Entry,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $insideSection = $false
    $insideEntry = $false
    foreach ($line in ($Content -split "\r?\n")) {
        if (-not $insideSection -and $line -match "^$([regex]::Escape($Section)):\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\S") {
            break
        }

        if ($insideSection -and -not $insideEntry -and $line -match "^\s{2}$([regex]::Escape($Entry)):\s*$") {
            $insideEntry = $true
            continue
        }

        if ($insideEntry -and $line -match "^\s{2}[A-Za-z0-9_]+:\s*$") {
            break
        }

        if ($insideEntry -and $line -match "^\s{4}$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim().Trim('"')
        }
    }

    return ""
}

function Get-TaskNestedScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Section,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $insideSection = $false
    $baseIndent = 0
    foreach ($line in $Block) {
        if (-not $insideSection -and $line -match "^(\s+)$([regex]::Escape($Section)):\s*$") {
            $insideSection = $true
            $baseIndent = $Matches[1].Length
            continue
        }

        if (-not $insideSection) {
            continue
        }

        if ($line -match "^(\s*)\S") {
            $indent = $Matches[1].Length
            if ($indent -le $baseIndent) {
                break
            }
        }

        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim().Trim('"')
        }
    }

    return ""
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
            return $Matches[1]
        }
    }

    return "none"
}

function Get-QueueDiagnostics {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Blocks,
        [Parameter(Mandatory = $false)][hashtable]$ExecutionLogArchiveMap = @{},
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][string[]]$HistoricalEvidenceDebtIds = @()
    )

    $allowedStatuses = @("pending", "claimed", "planned", "implemented", "validated", "reviewed", "ready_for_closeout", "closed", "blocked")
    $legacyTerminalStatuses = @("done", "merged", "pushed")
    $knownBlockedStatuses = @("blocked_validation_failure")
    $missingStatusIds = New-Object System.Collections.ArrayList
    $legacyDoneIds = New-Object System.Collections.ArrayList
    $knownBlockedStatusIds = New-Object System.Collections.ArrayList
    $unsupportedStatusIds = New-Object System.Collections.ArrayList
    $evidenceMissingIds = New-Object System.Collections.ArrayList
    $closureEvidenceRecoveredIds = New-Object System.Collections.ArrayList
    $archivedEvidenceRecoveredIds = New-Object System.Collections.ArrayList
    $registeredLegacyUnavailableEvidenceIds = New-Object System.Collections.ArrayList
    $unregisteredLegacyUnavailableEvidenceIds = New-Object System.Collections.ArrayList

    foreach ($block in $Blocks) {
        $status = Get-ScalarValue -Block $block.Lines -Key "status"
        $evidencePath = Get-ScalarValue -Block $block.Lines -Key "evidencePath"
        $closureEvidencePath = Get-ScalarValue -Block $block.Lines -Key "closureEvidencePath"

        if ([string]::IsNullOrWhiteSpace($status)) {
            [void]$missingStatusIds.Add($block.Id)
            continue
        }

        if ($status -in $legacyTerminalStatuses) {
            [void]$legacyDoneIds.Add($block.Id)
        } elseif ($status -in $knownBlockedStatuses) {
            [void]$knownBlockedStatusIds.Add("$($block.Id):$status")
        } elseif ($status -notin $allowedStatuses -and $status -ne "in_progress") {
            [void]$unsupportedStatusIds.Add("$($block.Id):$status")
        }

        if ($status -in @("done", "closed", "merged", "pushed")) {
            $primaryEvidence = Test-EvidenceProvenance -Path $evidencePath -ArchiveMap $ExecutionLogArchiveMap
            if ($primaryEvidence.Exists) {
                if ($primaryEvidence.Source -eq "archive") {
                    [void]$archivedEvidenceRecoveredIds.Add($block.Id)
                }
                continue
            }

            $closureEvidence = Test-EvidenceProvenance -Path $closureEvidencePath -ArchiveMap $ExecutionLogArchiveMap
            if ($closureEvidence.Exists) {
                [void]$closureEvidenceRecoveredIds.Add($block.Id)
                continue
            }

            if ($block.Id -in $HistoricalEvidenceDebtIds) {
                [void]$registeredLegacyUnavailableEvidenceIds.Add($block.Id)
                continue
            }

            [void]$evidenceMissingIds.Add($block.Id)
            [void]$unregisteredLegacyUnavailableEvidenceIds.Add($block.Id)
        }
    }

    return [pscustomobject]@{
        MissingStatusIds = @($missingStatusIds)
        LegacyDoneIds = @($legacyDoneIds)
        KnownBlockedStatusIds = @($knownBlockedStatusIds)
        UnsupportedStatusIds = @($unsupportedStatusIds)
        EvidenceMissingIds = @($evidenceMissingIds)
        ClosureEvidenceRecoveredIds = @($closureEvidenceRecoveredIds)
        ArchivedEvidenceRecoveredIds = @($archivedEvidenceRecoveredIds)
        RegisteredLegacyUnavailableEvidenceIds = @($registeredLegacyUnavailableEvidenceIds)
        UnregisteredLegacyUnavailableEvidenceIds = @($unregisteredLegacyUnavailableEvidenceIds)
    }
}

function Normalize-IndexPath {
    param([Parameter(Mandatory = $false)][AllowEmptyString()][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    return $Path.Trim().Trim('"').Replace("\", "/")
}

function Get-ExecutionLogArchiveMap {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $archiveMap = @{}
    $currentPath = ""
    foreach ($line in $Lines) {
        if ($line -match '^\s*-\s+path:\s*(.+?)\s*$') {
            $currentPath = Normalize-IndexPath -Path $Matches[1]
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentPath) -and $line -match '^\s+archivePath:\s*(.+?)\s*$') {
            $archiveMap[$currentPath] = Normalize-IndexPath -Path $Matches[1]
            $currentPath = ""
        }
    }

    return $archiveMap
}

function Get-HistoricalEvidenceDebtIds {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $ids = New-Object System.Collections.ArrayList
    foreach ($line in $Lines) {
        if ($line -match '^\s*-\s+id:\s*(.+?)\s*$') {
            [void]$ids.Add($Matches[1].Trim().Trim('"'))
        }
    }

    return @($ids | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
}

function Test-EvidenceProvenance {
    param(
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$Path,
        [Parameter(Mandatory = $false)][hashtable]$ArchiveMap = @{}
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return [pscustomobject]@{
            Exists = $false
            Source = "missing"
        }
    }

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        return [pscustomobject]@{
            Exists = $true
            Source = "direct"
        }
    }

    $normalizedPath = Normalize-IndexPath -Path $Path
    if ($ArchiveMap.ContainsKey($normalizedPath)) {
        $archivePath = $ArchiveMap[$normalizedPath]
        if (-not [string]::IsNullOrWhiteSpace($archivePath) -and (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
            return [pscustomobject]@{
                Exists = $true
                Source = "archive"
            }
        }
    }

    return [pscustomobject]@{
        Exists = $false
        Source = "missing"
    }
}

function Get-MatrixDiagnostics {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Blocks,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$HistoryBlocks,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$MatrixLines
    )

    $coveredTaskIds = @($Blocks + $HistoryBlocks | ForEach-Object { $_.Id } | Select-Object -Unique)
    $matrixBatchIds = New-Object System.Collections.ArrayList
    $sourcePlanningTaskIds = New-Object System.Collections.ArrayList

    foreach ($line in $MatrixLines) {
        if ($line -match '^\s*-\s+(batch-\d+[a-z0-9-]*)\s*$') {
            [void]$matrixBatchIds.Add($Matches[1])
        }

        if ($line -match '^\s+sourcePlanningTask:\s*([a-z0-9-]+)\s*$') {
            [void]$sourcePlanningTaskIds.Add($Matches[1])
        }
    }

    $missingBatches = @($matrixBatchIds | Where-Object { $_ -notin $coveredTaskIds } | Select-Object -Unique)
    $missingPlanningTasks = @($sourcePlanningTaskIds | Where-Object { $_ -notin $coveredTaskIds } | Select-Object -Unique)

    return [pscustomobject]@{
        MissingBatches = $missingBatches
        MissingPlanningTasks = $missingPlanningTasks
    }
}

$findings = New-Object System.Collections.ArrayList

if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
    [void]$findings.Add("missing_project_state")
}
if (-not (Test-Path -LiteralPath $QueuePath)) {
    [void]$findings.Add("missing_task_queue")
}
if (-not (Test-Path -LiteralPath $MatrixPath)) {
    [void]$findings.Add("missing_matrix")
}

$projectStateLines = @()
$queueLines = @()
$matrixLines = @()
if ($findings.Count -eq 0) {
    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $matrixLines = @(Get-Content -LiteralPath $MatrixPath)
}

$taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
$taskHistoryBlocks = @()
if (Test-Path -LiteralPath $TaskHistoryIndexPath) {
    $taskHistoryBlocks = @(Get-TaskBlocks -Lines @(Get-Content -LiteralPath $TaskHistoryIndexPath))
}
$executionLogArchiveMap = @{}
if (Test-Path -LiteralPath $ExecutionLogIndexPath) {
    $executionLogArchiveMap = Get-ExecutionLogArchiveMap -Lines @(Get-Content -LiteralPath $ExecutionLogIndexPath)
}
$historicalEvidenceDebtIds = @()
if (Test-Path -LiteralPath $HistoricalEvidenceDebtPath) {
    $historicalEvidenceDebtIds = @(Get-HistoricalEvidenceDebtIds -Lines @(Get-Content -LiteralPath $HistoricalEvidenceDebtPath))
}
$profileCatalogPresent = Test-Path -LiteralPath $ExecutionProfileCatalogPath -PathType Leaf
$profileCatalogContent = ""
if ($profileCatalogPresent) {
    $profileCatalogContent = Get-Content -LiteralPath $ExecutionProfileCatalogPath -Raw
}
$queueDiagnostics = Get-QueueDiagnostics -Blocks $taskBlocks -ExecutionLogArchiveMap $executionLogArchiveMap -HistoricalEvidenceDebtIds $historicalEvidenceDebtIds
$matrixDiagnostics = Get-MatrixDiagnostics -Blocks $taskBlocks -HistoryBlocks $taskHistoryBlocks -MatrixLines $matrixLines
$currentTaskId = Get-ProjectScalar -Lines $projectStateLines -Section "currentTask" -Key "id"
if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
    $currentTaskId = $TaskId
}
$plannedPauseStatus = Get-ProjectScalar -Lines $projectStateLines -Section "automation" -Key "plannedPauseStatus"
$plannedPauseReason = Get-ProjectScalar -Lines $projectStateLines -Section "automation" -Key "plannedPauseReason"
$plannedPauseKeepsAutomationPaused = Get-ProjectScalar -Lines $projectStateLines -Section "automation" -Key "plannedPauseKeepsAutomationPaused"
$plannedPauseActive = $plannedPauseStatus -eq "active" -and $plannedPauseKeepsAutomationPaused -eq "true"

$currentTaskBlock = @()
if (-not [string]::IsNullOrWhiteSpace($currentTaskId)) {
    $currentTaskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $currentTaskId)
}

$currentTaskStatus = ""
if ($currentTaskBlock.Count -gt 0) {
    $currentTaskStatus = Get-ScalarValue -Block $currentTaskBlock -Key "status"
}
if ([string]::IsNullOrWhiteSpace($currentTaskStatus)) {
    $currentTaskStatus = Get-ProjectScalar -Lines $projectStateLines -Section "currentTask" -Key "status"
}

$currentExecutionProfile = ""
$currentEvidenceMode = ""
$currentValidationPolicy = ""
$queueSelectionMode = ""
if ($currentTaskBlock.Count -gt 0) {
    $currentExecutionProfile = Get-ScalarValue -Block $currentTaskBlock -Key "executionProfile"
    $currentEvidenceMode = Get-ScalarValue -Block $currentTaskBlock -Key "evidenceMode"
    $currentValidationPolicy = Get-ScalarValue -Block $currentTaskBlock -Key "validationPolicy"
    $queueSelectionMode = Get-ScalarValue -Block $currentTaskBlock -Key "queueSelectionMode"
}
if ([string]::IsNullOrWhiteSpace($currentExecutionProfile)) {
    $currentExecutionProfile = "legacy_explicit"
}
if ([string]::IsNullOrWhiteSpace($currentEvidenceMode)) {
    $currentEvidenceMode = "full"
}
if ([string]::IsNullOrWhiteSpace($currentValidationPolicy)) {
    $currentValidationPolicy = "legacy_explicit"
}
if ([string]::IsNullOrWhiteSpace($queueSelectionMode)) {
    $queueSelectionMode = "legacy_explicit"
}

$catalogEvidenceMode = ""
$catalogValidationPolicy = ""
$catalogQueueSelectionMode = ""
$catalogMaxTasksPerPacket = "none"
if ($profileCatalogPresent) {
    $catalogEvidenceMode = Get-CatalogNestedScalar -Content $profileCatalogContent -Section "profiles" -Entry $currentExecutionProfile -Key "evidenceMode"
    $catalogValidationPolicy = Get-CatalogNestedScalar -Content $profileCatalogContent -Section "profiles" -Entry $currentExecutionProfile -Key "validationPolicy"
    $catalogQueueSelectionMode = Get-CatalogNestedScalar -Content $profileCatalogContent -Section "profiles" -Entry $currentExecutionProfile -Key "queueSelectionMode"
    $catalogMaxTasksPerPacket = Get-CatalogWorkPacketMaxTasks -Content $profileCatalogContent -Profile $currentExecutionProfile
}
if ([string]::IsNullOrWhiteSpace($catalogEvidenceMode)) {
    $catalogEvidenceMode = "none"
}
if ([string]::IsNullOrWhiteSpace($catalogValidationPolicy)) {
    $catalogValidationPolicy = "none"
}
if ([string]::IsNullOrWhiteSpace($catalogQueueSelectionMode)) {
    $catalogQueueSelectionMode = "none"
}
if ([string]::IsNullOrWhiteSpace($catalogMaxTasksPerPacket)) {
    $catalogMaxTasksPerPacket = "none"
}

$workPacketId = "none"
$workPacketScope = "none"
if ($currentTaskBlock.Count -gt 0) {
    $taskWorkPacketId = Get-TaskNestedScalar -Block $currentTaskBlock -Section "workPacket" -Key "id"
    $taskWorkPacketScope = Get-TaskNestedScalar -Block $currentTaskBlock -Section "workPacket" -Key "scope"
    if (-not [string]::IsNullOrWhiteSpace($taskWorkPacketId)) {
        $workPacketId = $taskWorkPacketId
    }
    if (-not [string]::IsNullOrWhiteSpace($taskWorkPacketScope)) {
        $workPacketScope = $taskWorkPacketScope
    }
}

$nextTask = Get-NextExecutableTask -Blocks $taskBlocks -HistoryBlocks $taskHistoryBlocks
$nextTaskId = $nextTask.Id
$blockedReasons = @($nextTask.BlockedReasons)
$readySetTaskIds = @()
if ($queueSelectionMode -eq "ready_set") {
    $readySetTaskIds = @(Get-ReadyExecutableTasks -Blocks $taskBlocks -HistoryBlocks $taskHistoryBlocks)
}
$activeQueueNonTerminalCount = @(
    $taskBlocks | Where-Object {
        $status = Get-ScalarValue -Block $_.Lines -Key "status"
        $status -notin @("closed", "done", "merged", "pushed")
    }
).Count
$validationCommands = @()
if (-not [string]::IsNullOrWhiteSpace($nextTaskId)) {
    $validationCommands = @(Get-ListValues -Block $nextTask.Block -Key "validationCommands")
}

$seedProposalDecision = "not_checked"
$seedModule = "none"
$seedRequiredApproval = "none"
$localExperienceNextTaskDecision = "not_checked"
$localExperienceCandidateTask = "none"
$localExperienceCandidateKind = "none"
$localExperienceAffectedUseCaseCount = "0"
$localExperienceAffectedUseCaseIds = "none"
$localExperienceSeedRequired = "false"
$localExperienceReason = "none"
$localExperienceCandidateReady = "false"
$localExperienceCandidateBlockedReasons = "none"
$l123AccelerationDecision = "not_checked"
$l123RiskTier = "none"
$l123ExecutionMode = "none"
$l123MissingApprovalField = "none"
$l123BlockedGate = "none"
$l123NextRecommendedAction = "none"
$bridgeProposalDecision = "not_checked"
$bridgeExperienceChain = "none"
$bridgeCandidateTask = "none"
$bridgeRequiredApproval = "none"
$guardedGoalPacketDecision = "not_checked"
$goalPacketEligibleCount = "0"
$goalPacketSelectedCount = "0"
$goalPacketTaskIds = "none"
$goalPacketCloseoutMode = "none"
$localFullFlowSingleTaskOnly = "false"
$productSourceSingleTaskCloseout = "false"
$recommendedHumanDecision = "none"
$currentTaskTerminal = $currentTaskStatus -in @("done", "closed", "pushed", "merged")

if ($findings.Count -eq 0 -and $profileCatalogPresent) {
    $guardedGoalPacketResult = Invoke-GuardedGoalPacketDiagnostic -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -TaskHistoryIndexPath $TaskHistoryIndexPath -ExecutionProfileCatalogPath $ExecutionProfileCatalogPath
    $guardedGoalPacketDecision = Get-OutputValue -Output $guardedGoalPacketResult.Output -Key "guardedGoalPacketDecision"
    if ([string]::IsNullOrWhiteSpace($guardedGoalPacketDecision)) {
        $guardedGoalPacketDecision = if ($guardedGoalPacketResult.ExitCode -eq 0) { "unknown" } else { "unavailable" }
    }
    $goalPacketEligibleCount = Get-OutputValue -Output $guardedGoalPacketResult.Output -Key "goalPacketEligibleCount"
    if ([string]::IsNullOrWhiteSpace($goalPacketEligibleCount)) {
        $goalPacketEligibleCount = "0"
    }
    $goalPacketSelectedCount = Get-OutputValue -Output $guardedGoalPacketResult.Output -Key "goalPacketSelectedCount"
    if ([string]::IsNullOrWhiteSpace($goalPacketSelectedCount)) {
        $goalPacketSelectedCount = "0"
    }
    $goalPacketTaskIds = Get-OutputValue -Output $guardedGoalPacketResult.Output -Key "goalPacketTaskIds"
    if ([string]::IsNullOrWhiteSpace($goalPacketTaskIds)) {
        $goalPacketTaskIds = "none"
    }
    $goalPacketCloseoutMode = Get-OutputValue -Output $guardedGoalPacketResult.Output -Key "goalPacketCloseoutMode"
    if ([string]::IsNullOrWhiteSpace($goalPacketCloseoutMode)) {
        $goalPacketCloseoutMode = "none"
    }
    $localFullFlowSingleTaskOnly = Get-OutputValue -Output $guardedGoalPacketResult.Output -Key "localFullFlowSingleTaskOnly"
    if ([string]::IsNullOrWhiteSpace($localFullFlowSingleTaskOnly)) {
        $localFullFlowSingleTaskOnly = "false"
    }
    $productSourceSingleTaskCloseout = Get-OutputValue -Output $guardedGoalPacketResult.Output -Key "productSourceSingleTaskCloseout"
    if ([string]::IsNullOrWhiteSpace($productSourceSingleTaskCloseout)) {
        $productSourceSingleTaskCloseout = "false"
    }
}

if ($findings.Count -eq 0 -and $currentTaskTerminal) {
    $localExperienceProposalResult = Invoke-LocalExperienceNextTaskDiagnostic -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -MatrixPath $LocalExperienceMatrixPath
    $localExperienceNextTaskDecision = Get-OutputValue -Output $localExperienceProposalResult.Output -Key "localExperienceNextTaskDecision"
    if ([string]::IsNullOrWhiteSpace($localExperienceNextTaskDecision)) {
        $localExperienceNextTaskDecision = if ($localExperienceProposalResult.ExitCode -eq 0) { "unknown" } else { "unavailable" }
    }
    $localExperienceCandidateTask = Get-OutputValue -Output $localExperienceProposalResult.Output -Key "candidateTaskId"
    if ([string]::IsNullOrWhiteSpace($localExperienceCandidateTask)) {
        $localExperienceCandidateTask = "none"
    }
    $localExperienceCandidateKind = Get-OutputValue -Output $localExperienceProposalResult.Output -Key "candidateTaskKind"
    if ([string]::IsNullOrWhiteSpace($localExperienceCandidateKind)) {
        $localExperienceCandidateKind = "none"
    }
    $localExperienceAffectedUseCaseCount = Get-OutputValue -Output $localExperienceProposalResult.Output -Key "affectedUseCaseCount"
    if ([string]::IsNullOrWhiteSpace($localExperienceAffectedUseCaseCount)) {
        $localExperienceAffectedUseCaseCount = "0"
    }
    $localExperienceAffectedUseCaseIds = Get-OutputValue -Output $localExperienceProposalResult.Output -Key "affectedUseCaseIds"
    if ([string]::IsNullOrWhiteSpace($localExperienceAffectedUseCaseIds)) {
        $localExperienceAffectedUseCaseIds = "none"
    }
    $localExperienceSeedRequired = Get-OutputValue -Output $localExperienceProposalResult.Output -Key "seedRequired"
    if ([string]::IsNullOrWhiteSpace($localExperienceSeedRequired)) {
        $localExperienceSeedRequired = "false"
    }
    $localExperienceReason = Get-OutputValue -Output $localExperienceProposalResult.Output -Key "reason"
    if ([string]::IsNullOrWhiteSpace($localExperienceReason)) {
        $localExperienceReason = "none"
    }
    if ($localExperienceNextTaskDecision -eq "seed_required") {
        $recommendedHumanDecision = "seed_local_experience_repair_or_choose_bypass"
    } elseif ($localExperienceNextTaskDecision -eq "existing_task_available") {
        $localExperienceCandidateBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $localExperienceCandidateTask)
        $candidateDependencyBlockedReasons = New-Object System.Collections.ArrayList
        if ($localExperienceCandidateBlock.Count -eq 0) {
            [void]$candidateDependencyBlockedReasons.Add("candidate_task_missing:$localExperienceCandidateTask")
        } else {
            $candidateStatus = Get-ScalarValue -Block $localExperienceCandidateBlock -Key "status"
            if ($candidateStatus -ne "pending") {
                if ([string]::IsNullOrWhiteSpace($candidateStatus)) {
                    $candidateStatus = "missing_status"
                }
                [void]$candidateDependencyBlockedReasons.Add("candidate_status_not_pending:${localExperienceCandidateTask}:$candidateStatus")
            } else {
                $candidateDependencies = @(Get-ListValues -Block $localExperienceCandidateBlock -Key "dependencies")
                foreach ($dependency in $candidateDependencies) {
                    [void](Test-DependencyTerminal -Blocks $taskBlocks -HistoryBlocks $taskHistoryBlocks -DependencyId $dependency -BlockedReasons $candidateDependencyBlockedReasons)
                }
            }
        }

        if ($candidateDependencyBlockedReasons.Count -eq 0) {
            $localExperienceCandidateReady = "true"
            $recommendedHumanDecision = "claim_local_experience_candidate_or_choose_bypass"
        } else {
            $localExperienceCandidateBlockedReasons = Join-OrNone -Values @($candidateDependencyBlockedReasons)
            $recommendedHumanDecision = "resolve_local_experience_candidate_dependency_or_choose_bypass"
        }
    }
}

if ($findings.Count -eq 0 -and $currentTaskTerminal -and $localExperienceCandidateTask -ne "none") {
    $l123AccelerationResult = Invoke-L123AccelerationDiagnostic -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -MatrixPath $LocalExperienceMatrixPath -TaskId $localExperienceCandidateTask
    $l123AccelerationDecision = Get-OutputValue -Output $l123AccelerationResult.Output -Key "l123AccelerationDecision"
    if ([string]::IsNullOrWhiteSpace($l123AccelerationDecision)) {
        $l123AccelerationDecision = if ($l123AccelerationResult.ExitCode -eq 0) { "unknown" } else { "unavailable" }
    }
    $l123RiskTier = Get-OutputValue -Output $l123AccelerationResult.Output -Key "riskTier"
    if ([string]::IsNullOrWhiteSpace($l123RiskTier)) {
        $l123RiskTier = "none"
    }
    $l123ExecutionMode = Get-OutputValue -Output $l123AccelerationResult.Output -Key "executionMode"
    if ([string]::IsNullOrWhiteSpace($l123ExecutionMode)) {
        $l123ExecutionMode = "none"
    }
    $l123MissingApprovalField = Get-OutputValue -Output $l123AccelerationResult.Output -Key "missingApprovalField"
    if ([string]::IsNullOrWhiteSpace($l123MissingApprovalField)) {
        $l123MissingApprovalField = "none"
    }
    $l123BlockedGate = Get-OutputValue -Output $l123AccelerationResult.Output -Key "blockedGate"
    if ([string]::IsNullOrWhiteSpace($l123BlockedGate)) {
        $l123BlockedGate = "none"
    }
    $l123NextRecommendedAction = Get-OutputValue -Output $l123AccelerationResult.Output -Key "nextRecommendedAction"
    if ([string]::IsNullOrWhiteSpace($l123NextRecommendedAction)) {
        $l123NextRecommendedAction = "none"
    }
}

if ($findings.Count -eq 0 -and [string]::IsNullOrWhiteSpace($nextTaskId) -and $currentTaskTerminal) {
    $seedProposalResult = Invoke-SeedProposalDiagnostic -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -MatrixPath $MatrixPath
    $seedProposalDecision = Get-OutputValue -Output $seedProposalResult.Output -Key "seedProposalDecision"
    if ([string]::IsNullOrWhiteSpace($seedProposalDecision)) {
        $seedProposalDecision = if ($seedProposalResult.ExitCode -eq 0) { "unknown" } else { "unavailable" }
    }
    $seedModule = Get-OutputValue -Output $seedProposalResult.Output -Key "seedModule"
    if ([string]::IsNullOrWhiteSpace($seedModule)) {
        $seedModule = "none"
    }
    $seedRequiredApproval = Get-OutputValue -Output $seedProposalResult.Output -Key "seedRequiredApproval"
    if ([string]::IsNullOrWhiteSpace($seedRequiredApproval)) {
        $seedRequiredApproval = "none"
    }
    if ($seedProposalDecision -eq "proposal_available") {
        $recommendedHumanDecision = "approve_auto_seed_or_keep_paused_or_create_manual_task"
    } elseif ($seedProposalDecision -eq "no_seed_candidate") {
        $bridgeProposalResult = Invoke-LocalExperienceBridgeDiagnostic -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -MatrixPath $MatrixPath
        $bridgeProposalDecision = Get-OutputValue -Output $bridgeProposalResult.Output -Key "bridgeProposalDecision"
        if ([string]::IsNullOrWhiteSpace($bridgeProposalDecision)) {
            $bridgeProposalDecision = if ($bridgeProposalResult.ExitCode -eq 0) { "unknown" } else { "unavailable" }
        }
        $bridgeExperienceChain = Get-OutputValue -Output $bridgeProposalResult.Output -Key "bridgeExperienceChain"
        if ([string]::IsNullOrWhiteSpace($bridgeExperienceChain)) {
            $bridgeExperienceChain = "none"
        }
        $bridgeCandidateTask = Get-OutputValue -Output $bridgeProposalResult.Output -Key "bridgeCandidateTask"
        if ([string]::IsNullOrWhiteSpace($bridgeCandidateTask)) {
            $bridgeCandidateTask = "none"
        }
        $bridgeRequiredApproval = Get-OutputValue -Output $bridgeProposalResult.Output -Key "bridgeRequiredApproval"
        if ([string]::IsNullOrWhiteSpace($bridgeRequiredApproval)) {
            $bridgeRequiredApproval = "none"
        }
        if ($bridgeProposalDecision -eq "proposal_available") {
            $recommendedHumanDecision = "approve_local_experience_bridge_or_keep_paused_or_create_manual_task"
        }
    }
}

$branchName = Get-GitValue -Arguments @("rev-parse", "--abbrev-ref", "HEAD")
$headSha = Get-GitValue -Arguments @("rev-parse", "--short", "HEAD")
$statusOutput = @(git status --porcelain=v1 -uall 2>$null)
$isDirty = $LASTEXITCODE -eq 0 -and $statusOutput.Count -gt 0

$decision = "no_pending_task"
$recommendedAction = "idle_no_pending_task"
$stopReason = "none"

$activeCurrentStatuses = @("claimed", "planned", "implemented", "validated", "reviewed", "ready_for_closeout", "in_progress")

if ($plannedPauseActive) {
    $decision = "planned_pause_for_tuning"
    $recommendedAction = "keep_automation_paused_for_tuning"
    $stopReason = "planned_pause_for_tuning"
    $nextTaskId = ""
    $validationCommands = @()
} elseif ($findings.Count -gt 0) {
    $decision = "hard_block_missing_inputs"
    $recommendedAction = "repair_missing_mechanism_inputs"
    $stopReason = Join-OrNone -Values @($findings)
} elseif ($currentTaskStatus -in $activeCurrentStatuses) {
    $decision = "current_task_active"
    $recommendedAction = "finish_current_task_closeout:$currentTaskId"
    $stopReason = "current_task_not_closed:${currentTaskId}:$currentTaskStatus"
} elseif ($localExperienceNextTaskDecision -eq "seed_required" -and $localExperienceSeedRequired -eq "true" -and $localExperienceCandidateTask -ne "none") {
    $decision = "local_experience_task_seed_required"
    $recommendedAction = "request_local_experience_task_seed:$localExperienceCandidateTask"
    $stopReason = "local_experience_seed_required"
    $nextTaskId = ""
    $validationCommands = @()
} elseif ($localExperienceNextTaskDecision -eq "existing_task_available" -and $localExperienceCandidateTask -ne "none" -and $localExperienceCandidateReady -eq "true") {
    $decision = if ($isDirty) { "local_experience_task_found_with_dirty_worktree" } else { "local_experience_task_found" }
    $recommendedAction = if ($isDirty) { "close_current_changes_before_next_task:$localExperienceCandidateTask" } else { "claim_or_plan_next_task:$localExperienceCandidateTask" }
    $nextTaskId = $localExperienceCandidateTask
    $localExperienceCandidateBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $localExperienceCandidateTask)
    if ($localExperienceCandidateBlock.Count -gt 0) {
        $validationCommands = @(Get-ListValues -Block $localExperienceCandidateBlock -Key "validationCommands")
    }
    $stopReason = if ($isDirty) { "dirty_worktree_advisory" } else { "none" }
} elseif ($localExperienceNextTaskDecision -eq "existing_task_available" -and $localExperienceCandidateTask -ne "none") {
    $decision = "local_experience_task_blocked"
    $recommendedAction = "resolve_dependency_or_status_block:$localExperienceCandidateTask"
    $nextTaskId = ""
    $validationCommands = @()
    $stopReason = "local_experience_candidate_blocked:$localExperienceCandidateBlockedReasons"
} elseif (-not [string]::IsNullOrWhiteSpace($nextTaskId)) {
    $decision = if ($isDirty) { "executable_task_found_with_dirty_worktree" } else { "executable_task_found" }
    $recommendedAction = if ($isDirty) { "close_current_changes_before_next_task:$nextTaskId" } else { "claim_or_plan_next_task:$nextTaskId" }
    $stopReason = if ($isDirty) { "dirty_worktree_advisory" } else { "none" }
} elseif ($seedProposalDecision -eq "proposal_available") {
    $decision = "seed_proposal_available"
    $recommendedAction = "request_auto_seed_approval:$seedModule"
    $stopReason = "auto_seed_approval_required"
} elseif ($bridgeProposalDecision -eq "proposal_available") {
    $decision = "local_experience_bridge_proposal_available"
    $recommendedAction = "request_local_experience_bridge_approval:$bridgeCandidateTask"
    $stopReason = "local_experience_bridge_approval_required"
} elseif ($blockedReasons.Count -gt 0) {
    $decision = "pending_task_blocked"
    $recommendedAction = "resolve_dependency_or_status_block"
    $stopReason = Join-OrNone -Values $blockedReasons
}

$blockedGates = @(
    $blockedReasons
    "dependency_change:blocked_without_approval"
    "env_secret:blocked_without_approval"
    "provider_call:blocked_without_task_approval"
    "schema_migration:blocked_without_task_approval"
    "deploy:blocked_without_approval"
    "push_pr_force_push:blocked_without_fresh_approval"
    "Cost Calibration Gate remains blocked"
) | ForEach-Object { $_ }
$historyNotBlockingCurrentRun = $decision -notin @("hard_block_missing_inputs", "pending_task_blocked")

Write-Output "repository: branch=$branchName; head=$headSha; dirty=$($isDirty.ToString().ToLowerInvariant())"
Write-Output "currentTask: $currentTaskId($currentTaskStatus)"
Write-Output "executionProfile: $currentExecutionProfile"
Write-Output "evidenceMode: $currentEvidenceMode"
Write-Output "validationPolicy: $currentValidationPolicy"
Write-Output "queueSelectionMode: $queueSelectionMode"
Write-Output "executionProfileCatalogPath: $ExecutionProfileCatalogPath"
Write-Output "executionProfileCatalog: $(if ($profileCatalogPresent) { "present" } else { "missing_legacy_defaults" })"
Write-Output "catalogEvidenceMode: $catalogEvidenceMode"
Write-Output "catalogValidationPolicy: $catalogValidationPolicy"
Write-Output "catalogQueueSelectionMode: $catalogQueueSelectionMode"
Write-Output "catalogMaxTasksPerPacket: $catalogMaxTasksPerPacket"
Write-Output "workPacketId: $workPacketId"
Write-Output "workPacketScope: $workPacketScope"
Write-Output "readySetCount: $($readySetTaskIds.Count)"
Write-Output "readySetSelectionRule: $(if ($queueSelectionMode -eq "ready_set") { "first_ready_task_unless_work_packet_scope" } else { "legacy_explicit_first_pending" })"
Write-Output "plannedPauseStatus: $(if ([string]::IsNullOrWhiteSpace($plannedPauseStatus)) { 'none' } else { $plannedPauseStatus })"
if (-not [string]::IsNullOrWhiteSpace($plannedPauseReason)) {
    Write-Output "plannedPauseReason: $plannedPauseReason"
}
Write-Output "queueDecision: $decision"
Write-Output "nextActionDecision: $decision"
Write-Output "nextExecutableTask: $(if ([string]::IsNullOrWhiteSpace($nextTaskId)) { 'none' } else { $nextTaskId })"
Write-Output "seedProposalDecision: $seedProposalDecision"
Write-Output "seedModule: $seedModule"
Write-Output "seedRequiredApproval: $seedRequiredApproval"
Write-Output "localExperienceNextTaskDecision: $localExperienceNextTaskDecision"
Write-Output "localExperienceCandidateTask: $localExperienceCandidateTask"
Write-Output "localExperienceCandidateKind: $localExperienceCandidateKind"
Write-Output "localExperienceAffectedUseCaseCount: $localExperienceAffectedUseCaseCount"
Write-Output "localExperienceAffectedUseCaseIds: $localExperienceAffectedUseCaseIds"
Write-Output "localExperienceSeedRequired: $localExperienceSeedRequired"
Write-Output "localExperienceReason: $localExperienceReason"
Write-Output "localExperienceCandidateReady: $localExperienceCandidateReady"
Write-Output "localExperienceCandidateBlockedReasons: $localExperienceCandidateBlockedReasons"
Write-Output "l123AccelerationDecision: $l123AccelerationDecision"
Write-Output "l123RiskTier: $l123RiskTier"
Write-Output "l123ExecutionMode: $l123ExecutionMode"
Write-Output "l123MissingApprovalField: $l123MissingApprovalField"
Write-Output "l123BlockedGate: $l123BlockedGate"
Write-Output "l123NextRecommendedAction: $l123NextRecommendedAction"
Write-Output "activeQueueNonTerminalCount: $activeQueueNonTerminalCount"
Write-Output "blockedWithRepairCandidate: $((($localExperienceCandidateKind -eq 'local_full_flow_contract_repair') -and ($localExperienceNextTaskDecision -in @('seed_required', 'existing_task_available', 'existing_task_blocked_or_nonterminal'))).ToString().ToLowerInvariant())"
Write-Output "coverageRowsWaitingRepair: $(if ($localExperienceCandidateKind -eq 'local_full_flow_contract_repair') { $localExperienceAffectedUseCaseCount } else { '0' })"
Write-Output "coverageRowsWaitingClosure: $(if ($localExperienceCandidateKind -eq 'experience_closure_readiness_audit') { $localExperienceAffectedUseCaseCount } else { '0' })"
Write-Output "guardedGoalPacketDecision: $guardedGoalPacketDecision"
Write-Output "goalPacketEligibleCount: $goalPacketEligibleCount"
Write-Output "goalPacketSelectedCount: $goalPacketSelectedCount"
Write-Output "goalPacketTaskIds: $goalPacketTaskIds"
Write-Output "goalPacketCloseoutMode: $goalPacketCloseoutMode"
Write-Output "localFullFlowSingleTaskOnly: $localFullFlowSingleTaskOnly"
Write-Output "productSourceSingleTaskCloseout: $productSourceSingleTaskCloseout"
Write-Output "bridgeProposalDecision: $bridgeProposalDecision"
Write-Output "bridgeExperienceChain: $bridgeExperienceChain"
Write-Output "bridgeCandidateTask: $bridgeCandidateTask"
Write-Output "bridgeRequiredApproval: $bridgeRequiredApproval"
Write-Output "recommendedHumanDecision: $recommendedHumanDecision"
Write-Output "blockedGates: $(Join-OrNone -Values @($blockedGates))"
Write-Output "validationNeeded: $(if ($validationCommands.Count -eq 0) { 'none' } else { "$($validationCommands.Count) command(s) for $nextTaskId" })"
Write-Output "historicalQueueFindings: legacy_status_missing=$($queueDiagnostics.MissingStatusIds.Count); legacy_terminal=$($queueDiagnostics.LegacyDoneIds.Count); knownBlockedValidation=$($queueDiagnostics.KnownBlockedStatusIds.Count); unsupportedStatus=$($queueDiagnostics.UnsupportedStatusIds.Count); notBlockingCurrentRun=$($historyNotBlockingCurrentRun.ToString().ToLowerInvariant())"
Write-Output "historicalEvidenceFindings: missingHistoricalEvidence=$($queueDiagnostics.EvidenceMissingIds.Count); closureEvidenceRecovered=$($queueDiagnostics.ClosureEvidenceRecoveredIds.Count); archivedEvidenceRecovered=$($queueDiagnostics.ArchivedEvidenceRecoveredIds.Count); registeredLegacyUnavailableEvidence=$($queueDiagnostics.RegisteredLegacyUnavailableEvidenceIds.Count); unregisteredLegacyUnavailableEvidence=$($queueDiagnostics.UnregisteredLegacyUnavailableEvidenceIds.Count); notBlockingCurrentRun=$($historyNotBlockingCurrentRun.ToString().ToLowerInvariant())"
Write-Output "driftFindings: queueMatrixDrift=matrixBatchMissingInQueue:$($matrixDiagnostics.MissingBatches.Count),sourcePlanningTaskMissingInQueue:$($matrixDiagnostics.MissingPlanningTasks.Count); notBlockingCurrentRun=$($historyNotBlockingCurrentRun.ToString().ToLowerInvariant())"
if ($VerboseHistory) {
    Write-Output "historicalQueueFindingsVerbose: legacy_status_missing_first=$(Join-FirstItems -Values $queueDiagnostics.MissingStatusIds); legacy_terminal_first=$(Join-FirstItems -Values $queueDiagnostics.LegacyDoneIds); knownBlockedValidationFirst=$(Join-FirstItems -Values $queueDiagnostics.KnownBlockedStatusIds); unsupportedStatusFirst=$(Join-FirstItems -Values $queueDiagnostics.UnsupportedStatusIds)"
    Write-Output "historicalEvidenceFindingsVerbose: missingHistoricalEvidenceFirst=$(Join-FirstItems -Values $queueDiagnostics.EvidenceMissingIds); closureEvidenceRecoveredFirst=$(Join-FirstItems -Values $queueDiagnostics.ClosureEvidenceRecoveredIds); archivedEvidenceRecoveredFirst=$(Join-FirstItems -Values $queueDiagnostics.ArchivedEvidenceRecoveredIds); registeredLegacyUnavailableEvidenceFirst=$(Join-FirstItems -Values $queueDiagnostics.RegisteredLegacyUnavailableEvidenceIds); unregisteredLegacyUnavailableEvidenceFirst=$(Join-FirstItems -Values $queueDiagnostics.UnregisteredLegacyUnavailableEvidenceIds)"
    Write-Output "driftFindingsVerbose: queueMatrixDriftFirst=$(Join-FirstItems -Values @($matrixDiagnostics.MissingBatches + $matrixDiagnostics.MissingPlanningTasks))"
}
Write-Output "recommendedAction: $recommendedAction"
Write-Output "stopReason: $stopReason"
Write-Output "diagnosticOnly: true"
Write-Output "Cost Calibration Gate remains blocked"

if ($decision -eq "hard_block_missing_inputs") {
    exit 1
}

exit 0
