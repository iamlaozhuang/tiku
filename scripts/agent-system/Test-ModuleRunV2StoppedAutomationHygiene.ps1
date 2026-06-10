param(
    [Parameter(Mandatory = $false)]
    [string]$LeasePath = "",

    [Parameter(Mandatory = $false)]
    [string]$LeaseCleanupRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$AutomationWorktreeRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$TempRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$RunRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$HandoffRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [string]$NowUtc = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10080)]
    [int]$ActiveRunHeartbeatMinutes = 30,

    [Parameter(Mandatory = $false)]
    [switch]$Cleanup,

    [Parameter(Mandatory = $false)]
    [switch]$ParkCurrentWorktree,

    [Parameter(Mandatory = $false)]
    [switch]$SummaryOnly,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 50)]
    [int]$SummarySampleLimit = 5,

    [Parameter(Mandatory = $false)]
    [string]$ParkingTargetRef = "origin/master"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function ConvertTo-FullPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    return [System.IO.Path]::GetFullPath($Path)
}

function ConvertTo-NormalizedRegistryPath {
    param([Parameter(Mandatory = $false)][AllowEmptyString()][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    return ([System.IO.Path]::GetFullPath($Path)).Replace("\", "/").TrimEnd("/")
}

function Test-PathInsideRoot {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Root
    )

    $fullPath = ConvertTo-FullPath -Path $Path
    $fullRoot = ConvertTo-FullPath -Path $Root
    if (-not $fullRoot.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $fullRoot = $fullRoot + [System.IO.Path]::DirectorySeparatorChar
    }

    return $fullPath.StartsWith($fullRoot, [System.StringComparison]::OrdinalIgnoreCase)
}

function Add-HardBlock {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Message
    )

    $script:hardBlocks.Add([pscustomobject]@{ Decision = $Decision; Message = $Message })
    Write-Output "HARD_BLOCK $Decision $Message"
}

function Write-Detail {
    param([Parameter(Mandatory = $true)][string]$Message)

    if (-not $SummaryOnly) {
        Write-Output $Message
    }
}

function Add-CleanupCandidate {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $script:cleanupCandidates.Add([pscustomobject]@{ Kind = $Kind; Path = $Path })
    Write-Detail -Message "cleanupCandidate: $Kind $Path"
}

function Add-RunRegistryCleanupCandidate {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$RunId
    )

    $script:cleanupCandidates.Add([pscustomobject]@{ Kind = "run_registry"; Path = $Path })
    Write-Detail -Message "runRegistryCleanupCandidate: $RunId $Path"
}

function Test-RunRegistryHeartbeatExpired {
    param(
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$HeartbeatAtUtc,
        [Parameter(Mandatory = $true)][DateTimeOffset]$Now,
        [Parameter(Mandatory = $true)][int]$HeartbeatMinutes
    )

    if ([string]::IsNullOrWhiteSpace($HeartbeatAtUtc)) {
        return $true
    }

    try {
        $heartbeatAt = [DateTimeOffset]::Parse($HeartbeatAtUtc).ToUniversalTime()
        return $heartbeatAt.AddMinutes($HeartbeatMinutes) -lt $Now
    } catch {
        return $false
    }
}

function Get-RunRegistryTimestamp {
    param(
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$FinalizedAtUtc,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$HeartbeatAtUtc
    )

    $timestampText = if (-not [string]::IsNullOrWhiteSpace($FinalizedAtUtc)) { $FinalizedAtUtc } else { $HeartbeatAtUtc }
    if ([string]::IsNullOrWhiteSpace($timestampText)) {
        return [DateTimeOffset]::MinValue
    }

    try {
        return [DateTimeOffset]::Parse($timestampText).ToUniversalTime()
    } catch {
        return [DateTimeOffset]::MinValue
    }
}

function Test-RunRegistrySupersededByTerminal {
    param(
        [Parameter(Mandatory = $true)][object]$ActiveRecord,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Records
    )

    if ($ActiveRecord.Status -ne "active") {
        return $false
    }

    $activeTaskId = [string]$ActiveRecord.TaskId
    $activeWorktreePath = ConvertTo-NormalizedRegistryPath -Path ([string]$ActiveRecord.WorktreePath)
    $activeTimestamp = Get-RunRegistryTimestamp -HeartbeatAtUtc ([string]$ActiveRecord.HeartbeatAtUtc)
    if ([string]::IsNullOrWhiteSpace($activeTaskId) -or [string]::IsNullOrWhiteSpace($activeWorktreePath)) {
        return $false
    }

    foreach ($record in $Records) {
        if ([string]$record.Path -eq [string]$ActiveRecord.Path) {
            continue
        }

        if ([string]$record.TaskId -ne $activeTaskId) {
            continue
        }

        $recordStatus = [string]$record.Status
        if ($recordStatus -notin @("stopped", "recoverable", "abandoned", "cleanup_ready")) {
            continue
        }

        $recordWorktreePath = ConvertTo-NormalizedRegistryPath -Path ([string]$record.WorktreePath)
        if ($recordWorktreePath -ne $activeWorktreePath) {
            continue
        }

        $recordTimestamp = Get-RunRegistryTimestamp -FinalizedAtUtc ([string]$record.FinalizedAtUtc) -HeartbeatAtUtc ([string]$record.HeartbeatAtUtc)
        if ($recordTimestamp -ge $activeTimestamp) {
            return $true
        }
    }

    return $false
}

function Add-CleanupAction {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $script:cleanupActions.Add([pscustomobject]@{ Kind = $Kind; Path = $Path })
    Write-Detail -Message "cleanupAction: $Kind $Path"
}

function Add-CleanupDeferred {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Reason
    )

    $script:cleanupDeferred.Add([pscustomobject]@{ Kind = $Kind; Path = $Path; Reason = $Reason })
    Write-Detail -Message "cleanupDeferred: $Kind $Path"
    Write-Detail -Message "cleanupDeferredReason: $Reason"
}

function Add-RunRegistryCleanupAction {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$RunId
    )

    $script:cleanupActions.Add([pscustomobject]@{ Kind = "run_registry"; Path = $Path })
    Write-Detail -Message "runRegistryCleanupAction: $RunId $Path"
}

function Write-ObjectSummary {
    param(
        [Parameter(Mandatory = $true)][string]$Prefix,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Items
    )

    if (-not $SummaryOnly -or $Items.Count -eq 0) {
        return
    }

    $groups = @($Items | Group-Object -Property Kind | Sort-Object Name)
    foreach ($group in $groups) {
        Write-Output "$($Prefix)KindCount: $($group.Name)=$($group.Count)"
    }

    $sampleItems = @($Items | Select-Object -First $SummarySampleLimit)
    foreach ($item in $sampleItems) {
        Write-Output "$($Prefix)Sample: $($item.Kind) $($item.Path)"
    }
}

function Add-ParkingAction {
    param(
        [Parameter(Mandatory = $true)][string]$TargetRef,
        [Parameter(Mandatory = $true)][string]$TargetSha
    )

    $script:parkingActions.Add([pscustomobject]@{ TargetRef = $TargetRef; TargetSha = $TargetSha })
    Write-Output "automationWorktreeParking: completed"
    Write-Output "parkingTargetRef: $TargetRef"
    Write-Output "parkingTargetSha: $TargetSha"
}

function Test-GitWorktreeDirty {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $false
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $insideWorktree = ((& git -C $Path rev-parse --is-inside-work-tree 2>$null) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") {
            return $false
        }

        $status = @(& git -C $Path status --porcelain 2>$null)
        if ($LASTEXITCODE -ne 0) {
            return $true
        }

        return $status.Count -gt 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Get-GitWorktrees {
    $worktreeOutput = @(& git worktree list --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return @()
    }

    $worktrees = New-Object System.Collections.Generic.List[object]
    $currentPath = ""
    $currentHead = ""

    foreach ($line in $worktreeOutput) {
        if ($line -match "^worktree\s+(.+)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentPath)) {
                $worktrees.Add([pscustomobject]@{ Path = $currentPath; Head = $currentHead })
            }
            $currentPath = $Matches[1].Trim()
            $currentHead = ""
            continue
        }

        if ($line -match "^HEAD\s+([0-9a-f]+)\s*$") {
            $currentHead = $Matches[1].Trim()
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentPath)) {
        $worktrees.Add([pscustomobject]@{ Path = $currentPath; Head = $currentHead })
    }

    return $worktrees.ToArray()
}

function Get-TaskStatusFromQueue {
    param([Parameter(Mandatory = $false)][AllowEmptyString()][string]$TaskId)

    if ([string]::IsNullOrWhiteSpace($TaskId) -or $script:taskQueueLinesForRegistry.Count -eq 0) {
        return ""
    }

    $insideTask = $false
    foreach ($line in $script:taskQueueLinesForRegistry) {
        if ($line -match "^\s+- id:\s+(.+?)\s*$") {
            $insideTask = $Matches[1].Trim() -eq $TaskId
            continue
        }

        if ($insideTask -and $line -match "^\s+status:\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return "missing_from_active_queue"
}

function Test-RunRegistryTaskTerminal {
    param([Parameter(Mandatory = $false)][AllowEmptyString()][string]$TaskId)

    $taskStatus = Get-TaskStatusFromQueue -TaskId $TaskId
    return $taskStatus -in @("done", "closed", "pushed", "merged", "missing_from_active_queue")
}

function Remove-SafeFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$AllowedRoot,
        [Parameter(Mandatory = $true)][string]$Kind
    )

    if (-not (Test-PathInsideRoot -Path $Path -Root $AllowedRoot)) {
        Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "$Kind path is outside allowed cleanup root"
        return
    }

    if (Test-Path -LiteralPath $Path) {
        try {
            Remove-Item -LiteralPath $Path -Force
            Add-CleanupAction -Kind $Kind -Path $Path
        } catch {
            Add-CleanupDeferred -Kind $Kind -Path $Path -Reason $_.Exception.Message
        }
    }
}

function Remove-SafeDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$AllowedRoot,
        [Parameter(Mandatory = $true)][string]$Kind
    )

    if (-not (Test-PathInsideRoot -Path $Path -Root $AllowedRoot)) {
        Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "$Kind path is outside allowed cleanup root"
        return
    }

    if (Test-Path -LiteralPath $Path) {
        try {
            Remove-SafeDirectoryTree -Path $Path
            Add-CleanupAction -Kind $Kind -Path $Path
        } catch {
            Add-CleanupDeferred -Kind $Kind -Path $Path -Reason $_.Exception.Message
        }
    }
}

function Remove-SafeDirectoryTree {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    $item = Get-Item -LiteralPath $Path -Force
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        Remove-ReparsePoint -Path $item.FullName -IsDirectory $item.PSIsContainer
        return
    }

    $children = @(Get-ChildItem -LiteralPath $Path -Force -ErrorAction SilentlyContinue)
    foreach ($child in $children) {
        if (($child.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            Remove-ReparsePoint -Path $child.FullName -IsDirectory $child.PSIsContainer
            continue
        }

        Remove-Item -LiteralPath $child.FullName -Recurse -Force
    }

    Remove-Item -LiteralPath $Path -Force
}

function Remove-ReparsePoint {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][bool]$IsDirectory
    )

    if ($IsDirectory) {
        [System.IO.Directory]::Delete($Path, $false)
        return
    }

    [System.IO.File]::Delete($Path)
}

function Test-DirectoryLooksLikeAutomationWorktreeResidue {
    param([Parameter(Mandatory = $true)][string]$Path)

    $workspaceAnchors = @(
        "AGENTS.md",
        "package.json",
        "pnpm-workspace.yaml",
        "tsconfig.json",
        "src",
        "scripts",
        "docs"
    )

    foreach ($anchor in $workspaceAnchors) {
        if (Test-Path -LiteralPath (Join-Path -Path $Path -ChildPath $anchor)) {
            return $true
        }
    }

    return $false
}

function Test-DirectoryHasGitMetadata {
    param([Parameter(Mandatory = $true)][string]$Path)

    return (Test-Path -LiteralPath (Join-Path -Path $Path -ChildPath ".git"))
}

function Get-OrphanAutomationWorktreeDirectories {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$RegisteredWorktreePaths,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$CurrentWorktreePath
    )

    if (-not (Test-Path -LiteralPath $Root)) {
        return @()
    }

    $registered = New-Object "System.Collections.Generic.HashSet[string]" ([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($registeredPath in $RegisteredWorktreePaths) {
        if (-not [string]::IsNullOrWhiteSpace($registeredPath)) {
            [void]$registered.Add((ConvertTo-FullPath -Path $registeredPath))
        }
    }

    $currentFullPath = ""
    if (-not [string]::IsNullOrWhiteSpace($CurrentWorktreePath)) {
        $currentFullPath = ConvertTo-FullPath -Path $CurrentWorktreePath
    }

    $candidates = New-Object System.Collections.Generic.List[object]
    $firstLevelDirs = @(Get-ChildItem -LiteralPath $Root -Directory -Force -ErrorAction SilentlyContinue)
    foreach ($firstLevelDir in $firstLevelDirs) {
        $pathsToCheck = New-Object System.Collections.Generic.List[string]
        $pathsToCheck.Add($firstLevelDir.FullName)

        $secondLevelDirs = @(Get-ChildItem -LiteralPath $firstLevelDir.FullName -Directory -Force -ErrorAction SilentlyContinue)
        foreach ($secondLevelDir in $secondLevelDirs) {
            $pathsToCheck.Add($secondLevelDir.FullName)
        }

        foreach ($pathToCheck in $pathsToCheck) {
            $fullPath = ConvertTo-FullPath -Path $pathToCheck
            if ($registered.Contains($fullPath)) {
                continue
            }

            if (-not [string]::IsNullOrWhiteSpace($currentFullPath) -and $fullPath -eq $currentFullPath) {
                continue
            }

            if (-not (Test-PathInsideRoot -Path $fullPath -Root $Root)) {
                continue
            }

            if (-not (Test-DirectoryLooksLikeAutomationWorktreeResidue -Path $fullPath)) {
                continue
            }

            $candidates.Add([pscustomobject]@{ Path = $fullPath; HasGitMetadata = (Test-DirectoryHasGitMetadata -Path $fullPath) })
        }
    }

    return $candidates.ToArray()
}

function Write-HygieneResult {
    param([Parameter(Mandatory = $true)][string]$Reason)

    Write-Section -Title "Result"
    Write-Output "stoppedAutomationHygieneHardBlockCount: $($script:hardBlocks.Count)"
    Write-Output "stoppedAutomationHygieneCleanupCandidateCount: $($script:cleanupCandidates.Count)"
    Write-Output "stoppedAutomationHygieneCleanupActionCount: $($script:cleanupActions.Count)"
    Write-Output "stoppedAutomationHygieneDeferredCleanupCount: $($script:cleanupDeferred.Count)"
    Write-Output "stoppedAutomationHygieneParkingActionCount: $($script:parkingActions.Count)"
    Write-Output "stoppedAutomationHygieneSummaryOnly: $($SummaryOnly.ToString().ToLowerInvariant())"
    Write-ObjectSummary -Prefix "stoppedAutomationHygieneCleanupCandidate" -Items $script:cleanupCandidates.ToArray()
    Write-ObjectSummary -Prefix "stoppedAutomationHygieneCleanupAction" -Items $script:cleanupActions.ToArray()
    Write-ObjectSummary -Prefix "stoppedAutomationHygieneDeferredCleanup" -Items $script:cleanupDeferred.ToArray()
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"

    if ($script:hardBlocks.Count -gt 0) {
        $decision = $script:hardBlocks[0].Decision
        Write-Output "stoppedAutomationHygieneDecision: $decision"
        exit 1
    }

    if (($Cleanup -and $script:cleanupActions.Count -gt 0) -or ($ParkCurrentWorktree -and $script:parkingActions.Count -gt 0)) {
        Write-Output "stoppedAutomationHygieneDecision: cleanup_completed"
        exit 0
    }

    if ($Cleanup -and $script:cleanupDeferred.Count -gt 0) {
        Write-Output "stoppedAutomationHygieneDecision: cleanup_deferred"
        exit 0
    }

    if ($script:cleanupCandidates.Count -gt 0) {
        Write-Output "stoppedAutomationHygieneDecision: cleanup_available"
        exit 0
    }

    Write-Output "stoppedAutomationHygieneDecision: clean"
    exit 0
}

if ([string]::IsNullOrWhiteSpace($LeasePath)) {
    $LeasePath = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\automation-run-lease.json"
}

if ([string]::IsNullOrWhiteSpace($LeaseCleanupRoot)) {
    $LeaseCleanupRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku"
}

if ([string]::IsNullOrWhiteSpace($AutomationWorktreeRoot)) {
    $AutomationWorktreeRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\worktrees"
}

if ([string]::IsNullOrWhiteSpace($TempRoot)) {
    $TempRoot = [System.IO.Path]::GetTempPath()
}

if ([string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
    $RunRegistryRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\automation-runs"
}

if ([string]::IsNullOrWhiteSpace($HandoffRoot)) {
    $HandoffRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\handoffs"
}

$effectiveNow = [DateTimeOffset]::UtcNow
if (-not [string]::IsNullOrWhiteSpace($NowUtc)) {
    $effectiveNow = [DateTimeOffset]::Parse($NowUtc).ToUniversalTime()
}

$hardBlocks = New-Object System.Collections.Generic.List[object]
$cleanupCandidates = New-Object System.Collections.Generic.List[object]
$cleanupActions = New-Object System.Collections.Generic.List[object]
$cleanupDeferred = New-Object System.Collections.Generic.List[object]
$parkingActions = New-Object System.Collections.Generic.List[object]
$runRegistryRecords = New-Object System.Collections.Generic.List[object]
$taskQueueLinesForRegistry = @()
if (-not [string]::IsNullOrWhiteSpace($QueuePath) -and (Test-Path -LiteralPath $QueuePath)) {
    $taskQueueLinesForRegistry = @(Get-Content -LiteralPath $QueuePath)
}

Write-Section -Title "Module Run v2 Stopped Automation Hygiene"
Write-Output "stoppedAutomationHygieneMode: hard_block"
Write-Output "cleanupMode: $(if ($Cleanup) { "cleanup" } else { "read_only" })"
Write-Output "summaryOnly: $($SummaryOnly.ToString().ToLowerInvariant())"
if ($ParkCurrentWorktree) {
    Write-Output "parkingMode: enabled"
    Write-Output "parkingTargetRef: $ParkingTargetRef"
}
Write-Output "leasePath: $LeasePath"
Write-Output "leaseCleanupRoot: $LeaseCleanupRoot"
Write-Output "automationWorktreeRoot: $AutomationWorktreeRoot"
Write-Output "tempRoot: $TempRoot"
Write-Output "runRegistryRoot: $RunRegistryRoot"
Write-Output "handoffRoot: $HandoffRoot"
Write-Output "queuePath: $QueuePath"
Write-Output "nowUtc: $($effectiveNow.ToString("o"))"
Write-Output "activeRunHeartbeatMinutes: $ActiveRunHeartbeatMinutes"

Write-Section -Title "Lease Inventory"
if (-not (Test-Path -LiteralPath $LeasePath)) {
    Write-Output "leaseStatus: missing"
} else {
    try {
        $leaseJson = Get-Content -LiteralPath $LeasePath -Raw | ConvertFrom-Json
    } catch {
        Add-HardBlock -Decision "stop_invalid_lease" -Message "lease file is not valid JSON"
        Write-HygieneResult -Reason "invalid lease file"
    }

    $leaseRunId = [string]$leaseJson.runId
    $leaseTaskId = [string]$leaseJson.taskId
    $leaseWorktreePath = [string]$leaseJson.worktreePath
    $leaseOwner = [string]$leaseJson.owner
    $expiresAtText = [string]$leaseJson.expiresAtUtc

    Write-Output "leaseStatus: present"
    Write-Output "leaseRunId: $leaseRunId"
    Write-Output "leaseTaskId: $leaseTaskId"
    Write-Output "leaseOwner: $leaseOwner"
    Write-Output "leaseWorktreePath: $leaseWorktreePath"
    Write-Output "leaseExpiresAtUtc: $expiresAtText"

    if ([string]::IsNullOrWhiteSpace($leaseRunId) -or [string]::IsNullOrWhiteSpace($leaseWorktreePath) -or [string]::IsNullOrWhiteSpace($expiresAtText)) {
        Add-HardBlock -Decision "stop_invalid_lease" -Message "lease is missing runId, worktreePath, or expiresAtUtc"
    } else {
        try {
            $expiresAt = [DateTimeOffset]::Parse($expiresAtText).ToUniversalTime()
            if ($expiresAt -gt $effectiveNow) {
                Add-HardBlock -Decision "stop_existing_run_active" -Message "non-expired lease is present"
            } elseif (Test-GitWorktreeDirty -Path $leaseWorktreePath) {
                Add-HardBlock -Decision "stop_dirty_worktree" -Message "expired lease worktree has uncommitted changes"
            } else {
                Add-CleanupCandidate -Kind "expired_clean_lease" -Path $LeasePath
                if ($Cleanup) {
                    Remove-SafeFile -Path $LeasePath -AllowedRoot $LeaseCleanupRoot -Kind "expired_clean_lease"
                }
            }
        } catch {
            Add-HardBlock -Decision "stop_invalid_lease" -Message "lease expiresAtUtc is not parseable"
        }
    }
}

Write-Section -Title "Run Registry Inventory"
if (-not (Test-Path -LiteralPath $RunRegistryRoot)) {
    Write-Output "runRegistryStatus: root_missing"
} else {
    $registryFiles = @(Get-ChildItem -LiteralPath $RunRegistryRoot -Filter "*.json" -File -ErrorAction SilentlyContinue)
    foreach ($registryFile in $registryFiles) {
        try {
            $registryJson = Get-Content -LiteralPath $registryFile.FullName -Raw | ConvertFrom-Json
        } catch {
            Add-HardBlock -Decision "stop_invalid_lease" -Message "run registry file is not valid JSON: $($registryFile.FullName)"
            continue
        }

        $runId = [string]$registryJson.runId
        $runStatus = [string]$registryJson.status
        $cleanupPolicy = [string]$registryJson.cleanupPolicy
        $redactedHandoffPath = [string]$registryJson.redactedHandoffPath
        $registryWorktreePath = [string]$registryJson.worktreePath
        $registryHeartbeatAtUtc = [string]$registryJson.heartbeatAtUtc
        $registryTaskId = [string]$registryJson.taskId
        $registryFinalizedAtUtc = [string]$registryJson.finalizedAtUtc
        Write-Detail -Message "runRegistry: $($registryFile.FullName)"
        Write-Detail -Message "runRegistryRunId: $runId"
        Write-Detail -Message "runRegistryStatus: $runStatus"
        Write-Detail -Message "runRegistryTaskId: $registryTaskId"
        Write-Detail -Message "runRegistryCleanupPolicy: $cleanupPolicy"
        Write-Detail -Message "runRegistryWorktreePath: $registryWorktreePath"
        Write-Detail -Message "runRegistryHeartbeatAtUtc: $registryHeartbeatAtUtc"
        $runRegistryRecords.Add([pscustomobject]@{
                Path                = $registryFile.FullName
                RunId               = $runId
                Status              = $runStatus
                CleanupPolicy       = $cleanupPolicy
                WorktreePath        = $registryWorktreePath
                RedactedHandoffPath = $redactedHandoffPath
                TaskId              = $registryTaskId
                HeartbeatAtUtc      = $registryHeartbeatAtUtc
                FinalizedAtUtc      = $registryFinalizedAtUtc
            })

        if ($runStatus -eq "cleanup_ready" -and $cleanupPolicy -eq "cleanup_ready") {
            Add-RunRegistryCleanupCandidate -RunId $runId -Path $registryFile.FullName

            if (-not [string]::IsNullOrWhiteSpace($redactedHandoffPath)) {
                if (-not (Test-PathInsideRoot -Path $redactedHandoffPath -Root $HandoffRoot)) {
                    Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "redacted handoff path is outside handoff root"
                } elseif (Test-Path -LiteralPath $redactedHandoffPath) {
                    Add-CleanupCandidate -Kind "redacted_handoff" -Path $redactedHandoffPath
                }
            }

            if ($Cleanup) {
                if (-not [string]::IsNullOrWhiteSpace($redactedHandoffPath) -and (Test-Path -LiteralPath $redactedHandoffPath)) {
                    Remove-SafeFile -Path $redactedHandoffPath -AllowedRoot $HandoffRoot -Kind "redacted_handoff"
                }
                Remove-SafeFile -Path $registryFile.FullName -AllowedRoot $RunRegistryRoot -Kind "run_registry"
                if (-not (Test-Path -LiteralPath $registryFile.FullName)) {
                    Add-RunRegistryCleanupAction -RunId $runId -Path $registryFile.FullName
                }
            }
        }

        if ($runStatus -eq "active" -and (Test-RunRegistryHeartbeatExpired -HeartbeatAtUtc $registryHeartbeatAtUtc -Now $effectiveNow -HeartbeatMinutes $ActiveRunHeartbeatMinutes)) {
            if ([string]::IsNullOrWhiteSpace($registryWorktreePath) -or -not (Test-Path -LiteralPath $registryWorktreePath)) {
                Add-CleanupCandidate -Kind "expired_active_missing_worktree" -Path $registryFile.FullName
                Add-RunRegistryCleanupCandidate -RunId $runId -Path $registryFile.FullName

                if ($Cleanup) {
                    Remove-SafeFile -Path $registryFile.FullName -AllowedRoot $RunRegistryRoot -Kind "expired_active_missing_worktree"
                    if (-not (Test-Path -LiteralPath $registryFile.FullName)) {
                        Add-RunRegistryCleanupAction -RunId $runId -Path $registryFile.FullName
                    }
                }
            } elseif ((Test-RunRegistryTaskTerminal -TaskId $registryTaskId) -and
                -not (Test-GitWorktreeDirty -Path $registryWorktreePath) -and
                [string]::IsNullOrWhiteSpace($redactedHandoffPath)) {
                Add-CleanupCandidate -Kind "expired_active_terminal_registry" -Path $registryFile.FullName
                Add-RunRegistryCleanupCandidate -RunId $runId -Path $registryFile.FullName

                if ($Cleanup) {
                    Remove-SafeFile -Path $registryFile.FullName -AllowedRoot $RunRegistryRoot -Kind "expired_active_terminal_registry"
                    if (-not (Test-Path -LiteralPath $registryFile.FullName)) {
                        Add-RunRegistryCleanupAction -RunId $runId -Path $registryFile.FullName
                    }
                }
            }
        }
    }

    foreach ($runRegistryRecord in @($runRegistryRecords.ToArray())) {
        if (-not (Test-RunRegistrySupersededByTerminal -ActiveRecord $runRegistryRecord -Records $runRegistryRecords.ToArray())) {
            continue
        }

        Add-CleanupCandidate -Kind "superseded_active_run_registry" -Path $runRegistryRecord.Path
        Add-RunRegistryCleanupCandidate -RunId $runRegistryRecord.RunId -Path $runRegistryRecord.Path

        if ($Cleanup) {
            Remove-SafeFile -Path $runRegistryRecord.Path -AllowedRoot $RunRegistryRoot -Kind "superseded_active_run_registry"
            if (-not (Test-Path -LiteralPath $runRegistryRecord.Path)) {
                Add-RunRegistryCleanupAction -RunId $runRegistryRecord.RunId -Path $runRegistryRecord.Path
            }
        }
    }
}

Write-Section -Title "Automation Worktree Inventory"
if (-not (Test-Path -LiteralPath $AutomationWorktreeRoot)) {
    Write-Output "automationWorktreeStatus: root_missing"
} else {
    $currentWorktree = ((& git rev-parse --show-toplevel 2>$null) -join "").Trim()
    $originMasterSha = ((& git rev-parse origin/master 2>$null) -join "").Trim()
    $worktrees = @(Get-GitWorktrees)
    foreach ($worktree in $worktrees) {
        $worktreeFullPath = ConvertTo-FullPath -Path $worktree.Path
        if (-not (Test-PathInsideRoot -Path $worktreeFullPath -Root $AutomationWorktreeRoot)) {
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentWorktree)) {
            $currentFullPath = ConvertTo-FullPath -Path $currentWorktree
            if ($worktreeFullPath -eq $currentFullPath) {
                continue
            }
        }

        Write-Detail -Message "automationWorktree: $worktreeFullPath"
        Write-Detail -Message "automationWorktreeHead: $($worktree.Head)"

        if (Test-GitWorktreeDirty -Path $worktreeFullPath) {
            Add-HardBlock -Decision "stop_dirty_worktree" -Message "automation worktree has uncommitted changes"
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($originMasterSha) -and $worktree.Head -ne $originMasterSha) {
            Add-CleanupCandidate -Kind "stale_clean_worktree" -Path $worktreeFullPath
            if ($Cleanup) {
                if (Test-PathInsideRoot -Path $worktreeFullPath -Root $AutomationWorktreeRoot) {
                    & git worktree remove --force $worktreeFullPath | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Add-CleanupAction -Kind "stale_clean_worktree" -Path $worktreeFullPath
                    } elseif ((Test-Path -LiteralPath $worktreeFullPath) -and -not (Test-DirectoryHasGitMetadata -Path $worktreeFullPath)) {
                        Remove-SafeDirectory -Path $worktreeFullPath -AllowedRoot $AutomationWorktreeRoot -Kind "orphan_worktree_directory"
                    } else {
                        Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "git worktree remove failed"
                    }
                } else {
                    Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "worktree path is outside automation root"
                }
            }
        }
    }

    $registeredWorktreePaths = @($worktrees | ForEach-Object { [string]$_.Path })
    $registeredWorktreeFullPaths = @($registeredWorktreePaths | ForEach-Object { ConvertTo-FullPath -Path $_ })
    $orphanWorktreeDirectories = @(Get-OrphanAutomationWorktreeDirectories -Root $AutomationWorktreeRoot -RegisteredWorktreePaths $registeredWorktreePaths -CurrentWorktreePath $currentWorktree)
    foreach ($orphanWorktreeDirectory in $orphanWorktreeDirectories) {
        if ($orphanWorktreeDirectory.HasGitMetadata) {
            Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "orphan automation directory has Git metadata and needs manual inspection"
            continue
        }

        Add-CleanupCandidate -Kind "orphan_worktree_directory" -Path $orphanWorktreeDirectory.Path
        if ($Cleanup) {
            Remove-SafeDirectory -Path $orphanWorktreeDirectory.Path -AllowedRoot $AutomationWorktreeRoot -Kind "orphan_worktree_directory"
        }
    }

    foreach ($runRegistryRecord in $runRegistryRecords) {
        if ($runRegistryRecord.Status -ne "active" -or $runRegistryRecord.CleanupPolicy -ne "none") {
            continue
        }

        $registryWorktreePath = [string]$runRegistryRecord.WorktreePath
        if ([string]::IsNullOrWhiteSpace($registryWorktreePath) -or -not (Test-PathInsideRoot -Path $registryWorktreePath -Root $AutomationWorktreeRoot)) {
            continue
        }

        $registryWorktreeFullPath = ConvertTo-FullPath -Path $registryWorktreePath
        if ($registeredWorktreeFullPaths -contains $registryWorktreeFullPath) {
            continue
        }

        if ((Test-Path -LiteralPath $registryWorktreeFullPath) -and (Test-DirectoryHasGitMetadata -Path $registryWorktreeFullPath)) {
            Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "active run registry points at unregistered Git worktree metadata"
            continue
        }

        Add-CleanupCandidate -Kind "orphan_active_run_registry" -Path $runRegistryRecord.Path
        Add-RunRegistryCleanupCandidate -RunId $runRegistryRecord.RunId -Path $runRegistryRecord.Path

        if ($Cleanup) {
            Remove-SafeFile -Path $runRegistryRecord.Path -AllowedRoot $RunRegistryRoot -Kind "orphan_active_run_registry"
            if (-not (Test-Path -LiteralPath $runRegistryRecord.Path)) {
                Add-RunRegistryCleanupAction -RunId $runRegistryRecord.RunId -Path $runRegistryRecord.Path
            }
        }

        if (Test-Path -LiteralPath $registryWorktreeFullPath) {
            Add-CleanupCandidate -Kind "orphan_worktree_directory" -Path $registryWorktreeFullPath
            if ($Cleanup) {
                Remove-SafeDirectory -Path $registryWorktreeFullPath -AllowedRoot $AutomationWorktreeRoot -Kind "orphan_worktree_directory"
            }
        }
    }
}

if ($ParkCurrentWorktree) {
    Write-Section -Title "Current Worktree Parking"
    $currentWorktree = ((& git rev-parse --show-toplevel 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($currentWorktree)) {
        Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "current path is not inside a Git worktree"
    } elseif (Test-GitWorktreeDirty -Path $currentWorktree) {
        Add-HardBlock -Decision "stop_dirty_worktree" -Message "current worktree has uncommitted changes and cannot be parked"
    } else {
        $currentBranch = ((& git branch --show-current 2>$null) -join "").Trim()
        if ($currentBranch -in @("master", "main")) {
            Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "refusing to park protected branch $currentBranch"
        } else {
            $parkingTargetSha = ((& git rev-parse $ParkingTargetRef 2>$null) -join "").Trim()
            if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($parkingTargetSha)) {
                Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "parking target ref is not resolvable"
            } else {
                & git switch --detach $ParkingTargetRef | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "git switch --detach parking target failed"
                } else {
                    Add-ParkingAction -TargetRef $ParkingTargetRef -TargetSha $parkingTargetSha
                }
            }
        }
    }
}

Write-Section -Title "Dry-Run Handoff Temp Inventory"
if (-not (Test-Path -LiteralPath $TempRoot)) {
    Write-Output "tempRootStatus: missing"
} else {
    $handoffDirs = @(Get-ChildItem -LiteralPath $TempRoot -Directory -Filter "tiku-autopilot-handoff-*" -ErrorAction SilentlyContinue)
    foreach ($handoffDir in $handoffDirs) {
        $handoffFullPath = ConvertTo-FullPath -Path $handoffDir.FullName
        Write-Detail -Message "dryRunHandoffTempDir: $handoffFullPath"
        Add-CleanupCandidate -Kind "dry_run_handoff_temp" -Path $handoffFullPath
        if ($Cleanup) {
            Remove-SafeDirectory -Path $handoffFullPath -AllowedRoot $TempRoot -Kind "dry_run_handoff_temp"
        }
    }
}

Write-HygieneResult -Reason "stopped automation hygiene inventory completed"
