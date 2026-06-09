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

function Add-CleanupAction {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $script:cleanupActions.Add([pscustomobject]@{ Kind = $Kind; Path = $Path })
    Write-Detail -Message "cleanupAction: $Kind $Path"
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

    $insideWorktree = ((& git -C $Path rev-parse --is-inside-work-tree 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") {
        return $false
    }

    $status = @(& git -C $Path status --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return $true
    }

    return $status.Count -gt 0
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
        Remove-Item -LiteralPath $Path -Force
        Add-CleanupAction -Kind $Kind -Path $Path
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
        Remove-Item -LiteralPath $Path -Recurse -Force
        Add-CleanupAction -Kind $Kind -Path $Path
    }
}

function Write-HygieneResult {
    param([Parameter(Mandatory = $true)][string]$Reason)

    Write-Section -Title "Result"
    Write-Output "stoppedAutomationHygieneHardBlockCount: $($script:hardBlocks.Count)"
    Write-Output "stoppedAutomationHygieneCleanupCandidateCount: $($script:cleanupCandidates.Count)"
    Write-Output "stoppedAutomationHygieneCleanupActionCount: $($script:cleanupActions.Count)"
    Write-Output "stoppedAutomationHygieneParkingActionCount: $($script:parkingActions.Count)"
    Write-Output "stoppedAutomationHygieneSummaryOnly: $($SummaryOnly.ToString().ToLowerInvariant())"
    Write-ObjectSummary -Prefix "stoppedAutomationHygieneCleanupCandidate" -Items $script:cleanupCandidates.ToArray()
    Write-ObjectSummary -Prefix "stoppedAutomationHygieneCleanupAction" -Items $script:cleanupActions.ToArray()
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
$parkingActions = New-Object System.Collections.Generic.List[object]

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
        Write-Detail -Message "runRegistry: $($registryFile.FullName)"
        Write-Detail -Message "runRegistryRunId: $runId"
        Write-Detail -Message "runRegistryStatus: $runStatus"
        Write-Detail -Message "runRegistryCleanupPolicy: $cleanupPolicy"
        Write-Detail -Message "runRegistryWorktreePath: $registryWorktreePath"
        Write-Detail -Message "runRegistryHeartbeatAtUtc: $registryHeartbeatAtUtc"

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
                    } else {
                        Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "git worktree remove failed"
                    }
                } else {
                    Add-HardBlock -Decision "stop_manual_cleanup_required" -Message "worktree path is outside automation root"
                }
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
