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
    [string]$NowUtc = "",

    [Parameter(Mandatory = $false)]
    [switch]$Cleanup
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

function Add-CleanupCandidate {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $script:cleanupCandidates.Add([pscustomobject]@{ Kind = $Kind; Path = $Path })
    Write-Output "cleanupCandidate: $Kind $Path"
}

function Add-CleanupAction {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $script:cleanupActions.Add([pscustomobject]@{ Kind = $Kind; Path = $Path })
    Write-Output "cleanupAction: $Kind $Path"
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
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"

    if ($script:hardBlocks.Count -gt 0) {
        $decision = $script:hardBlocks[0].Decision
        Write-Output "stoppedAutomationHygieneDecision: $decision"
        exit 1
    }

    if ($Cleanup -and $script:cleanupActions.Count -gt 0) {
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

$effectiveNow = [DateTimeOffset]::UtcNow
if (-not [string]::IsNullOrWhiteSpace($NowUtc)) {
    $effectiveNow = [DateTimeOffset]::Parse($NowUtc).ToUniversalTime()
}

$hardBlocks = New-Object System.Collections.Generic.List[object]
$cleanupCandidates = New-Object System.Collections.Generic.List[object]
$cleanupActions = New-Object System.Collections.Generic.List[object]

Write-Section -Title "Module Run v2 Stopped Automation Hygiene"
Write-Output "stoppedAutomationHygieneMode: hard_block"
Write-Output "cleanupMode: $(if ($Cleanup) { "cleanup" } else { "read_only" })"
Write-Output "leasePath: $LeasePath"
Write-Output "leaseCleanupRoot: $LeaseCleanupRoot"
Write-Output "automationWorktreeRoot: $AutomationWorktreeRoot"
Write-Output "tempRoot: $TempRoot"
Write-Output "nowUtc: $($effectiveNow.ToString("o"))"

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

        Write-Output "automationWorktree: $worktreeFullPath"
        Write-Output "automationWorktreeHead: $($worktree.Head)"

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

Write-Section -Title "Dry-Run Handoff Temp Inventory"
if (-not (Test-Path -LiteralPath $TempRoot)) {
    Write-Output "tempRootStatus: missing"
} else {
    $handoffDirs = @(Get-ChildItem -LiteralPath $TempRoot -Directory -Filter "tiku-autopilot-handoff-*" -ErrorAction SilentlyContinue)
    foreach ($handoffDir in $handoffDirs) {
        $handoffFullPath = ConvertTo-FullPath -Path $handoffDir.FullName
        Write-Output "dryRunHandoffTempDir: $handoffFullPath"
        Add-CleanupCandidate -Kind "dry_run_handoff_temp" -Path $handoffFullPath
        if ($Cleanup) {
            Remove-SafeDirectory -Path $handoffFullPath -AllowedRoot $TempRoot -Kind "dry_run_handoff_temp"
        }
    }
}

Write-HygieneResult -Reason "stopped automation hygiene inventory completed"

