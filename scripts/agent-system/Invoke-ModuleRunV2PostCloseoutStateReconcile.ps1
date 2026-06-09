param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [switch]$Execute
)

$ErrorActionPreference = "Stop"

function Write-ReconcileResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Action,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Output ""
    Write-Output "== Module Run v2 Post-Closeout State Reconcile =="
    Write-Output "postCloseoutStateReconcileDecision: $Decision"
    Write-Output "postCloseoutStateReconcileAction: $Action"
    Write-Output "executeRequested: $($Execute.ToString().ToLowerInvariant())"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-SectionScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Section,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $insideSection = $false
    foreach ($line in $Lines) {
        if ($line -match "^$([regex]::Escape($Section)):\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\S") {
            break
        }

        if ($insideSection -and $line -match "^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Set-SectionScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Section,
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $updatedLines = New-Object System.Collections.Generic.List[string]
    $insideSection = $false
    $hasUpdated = $false

    foreach ($line in $Lines) {
        if ($line -match "^$([regex]::Escape($Section)):\s*$") {
            $insideSection = $true
            $updatedLines.Add($line)
            continue
        }

        if ($insideSection -and $line -match "^\S") {
            $insideSection = $false
        }

        if ($insideSection -and $line -match "^(\s+)$([regex]::Escape($Key)):\s*.*$") {
            $updatedLines.Add("$($Matches[1])$($Key): $Value")
            $hasUpdated = $true
            continue
        }

        $updatedLines.Add($line)
    }

    if (-not $hasUpdated) {
        throw "Missing scalar $Section.$Key"
    }

    return $updatedLines.ToArray()
}

function Test-AcceptedCheckpointSemantics {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    return [string]::IsNullOrWhiteSpace($Value) -or $Value -eq "accepted_ancestor_checkpoint"
}

function Test-PlaceholderCommitSha {
    param([Parameter(Mandatory = $false)][AllowEmptyString()][string]$Value)

    return [string]::IsNullOrWhiteSpace($Value) -or $Value -match "^(pending|unknown|todo|initial|placeholder|pending-local-commit)$"
}

function Test-GitAncestorOrEqual {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Ancestor,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Descendant
    )

    if ([string]::IsNullOrWhiteSpace($Ancestor) -or [string]::IsNullOrWhiteSpace($Descendant)) {
        return $false
    }
    if ($Ancestor -eq $Descendant) {
        return $true
    }

    & git merge-base --is-ancestor $Ancestor $Descendant 2>$null
    return $LASTEXITCODE -eq 0
}

function Assert-CleanGitWorktree {
    $status = @(& git status --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) {
        Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "git status failed" -ExitCode 1
    }
    if ($status.Count -gt 0) {
        Write-ReconcileResult -Decision "manual_required" -Action "none" -Reason "project-state reconcile requires a clean Git worktree" -ExitCode 1
    }
}

try {
    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "project-state file is missing" -ExitCode 1
    }

    Assert-CleanGitWorktree

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $currentTaskId = Get-SectionScalar -Lines $projectStateLines -Section "currentTask" -Key "id"
    $currentTaskStatus = Get-SectionScalar -Lines $projectStateLines -Section "currentTask" -Key "status"
    $currentEvidencePath = Get-SectionScalar -Lines $projectStateLines -Section "currentTask" -Key "evidencePath"
    $currentAuditReviewPath = Get-SectionScalar -Lines $projectStateLines -Section "currentTask" -Key "auditReviewPath"
    $currentCommitSha = Get-SectionScalar -Lines $projectStateLines -Section "currentTask" -Key "commitSha"
    $repositoryShaSemantics = Get-SectionScalar -Lines $projectStateLines -Section "repository" -Key "shaSemantics"

    if (-not [string]::IsNullOrWhiteSpace($TaskId) -and $currentTaskId -ne $TaskId) {
        Write-ReconcileResult -Decision "manual_required" -Action "none" -Reason "requested task does not match project-state currentTask" -ExitCode 1
    }

    if ($currentTaskStatus -notin @("done", "closed")) {
        Write-ReconcileResult -Decision "manual_required" -Action "none" -Reason "post-closeout reconcile requires currentTask status done or closed" -ExitCode 1
    }

    if ([string]::IsNullOrWhiteSpace($currentEvidencePath) -or -not (Test-Path -LiteralPath $currentEvidencePath)) {
        Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "current task evidence path is missing" -ExitCode 1
    }
    if ([string]::IsNullOrWhiteSpace($currentAuditReviewPath) -or -not (Test-Path -LiteralPath $currentAuditReviewPath)) {
        Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "current task audit review path is missing" -ExitCode 1
    }

    $actualMasterSha = ((& git rev-parse master 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($actualMasterSha)) {
        Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "master is not resolvable" -ExitCode 1
    }
    $actualOriginMasterSha = ((& git rev-parse origin/master 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($actualOriginMasterSha)) {
        Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "origin/master is not resolvable" -ExitCode 1
    }
    if ($actualMasterSha -ne $actualOriginMasterSha) {
        Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "master and origin/master are not aligned" -ExitCode 1
    }

    $stateMasterSha = Get-SectionScalar -Lines $projectStateLines -Section "repository" -Key "lastKnownMasterSha"
    $stateOriginMasterSha = Get-SectionScalar -Lines $projectStateLines -Section "repository" -Key "lastKnownOriginMasterSha"

    Write-Output "stateMasterSha: $stateMasterSha"
    Write-Output "stateOriginMasterSha: $stateOriginMasterSha"
    Write-Output "actualMasterSha: $actualMasterSha"
    Write-Output "actualOriginMasterSha: $actualOriginMasterSha"
    Write-Output "repositoryShaSemantics: $(if ([string]::IsNullOrWhiteSpace($repositoryShaSemantics)) { "accepted_ancestor_checkpoint" } else { $repositoryShaSemantics })"
    Write-Output "currentTaskCommitSha: $currentCommitSha"

    if (-not (Test-AcceptedCheckpointSemantics -Value $repositoryShaSemantics)) {
        Write-ReconcileResult -Decision "manual_required" -Action "none" -Reason "repository SHA semantics are not accepted_ancestor_checkpoint" -ExitCode 1
    }

    $needsUpdate = $false
    if ($stateMasterSha -ne $actualMasterSha) {
        if (-not (Test-GitAncestorOrEqual -Ancestor $stateMasterSha -Descendant $actualMasterSha)) {
            Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "lastKnownMasterSha is not an accepted ancestor of master" -ExitCode 1
        }
        $needsUpdate = $true
    }
    if ($stateOriginMasterSha -ne $actualOriginMasterSha) {
        if (-not (Test-GitAncestorOrEqual -Ancestor $stateOriginMasterSha -Descendant $actualOriginMasterSha)) {
            Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "lastKnownOriginMasterSha is not an accepted ancestor of origin/master" -ExitCode 1
        }
        $needsUpdate = $true
    }
    if ((Test-PlaceholderCommitSha -Value $currentCommitSha) -or $currentCommitSha -ne $actualMasterSha) {
        if (-not (Test-PlaceholderCommitSha -Value $currentCommitSha) -and -not (Test-GitAncestorOrEqual -Ancestor $currentCommitSha -Descendant $actualMasterSha)) {
            Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "currentTask.commitSha is not an accepted ancestor of master" -ExitCode 1
        }
        $needsUpdate = $true
    }

    if (-not $needsUpdate) {
        Write-ReconcileResult -Decision "already_current" -Action "none" -Reason "project-state repository SHAs already match Git reality" -ExitCode 0
    }

    if (-not $Execute) {
        Write-ReconcileResult -Decision "checkpoint_accepted" -Action "confirm_accepted_ancestor_checkpoint" -Reason "post-closeout state checkpoint is accepted as an ancestor and does not require a self-referential state write" -ExitCode 0
    }

    Write-ReconcileResult -Decision "checkpoint_confirmed" -Action "confirm_accepted_ancestor_checkpoint" -Reason "accepted ancestor checkpoint was confirmed without writing self-referential project-state SHAs" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-ReconcileResult -Decision "stop_for_hard_block" -Action "none" -Reason "post-closeout state reconcile encountered an error" -ExitCode 1
}
