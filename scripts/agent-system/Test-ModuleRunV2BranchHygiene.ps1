param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$BaseBranch = "master",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$BranchPattern = "codex/*",

    [Parameter(Mandatory = $false)]
    [switch]$Cleanup,

    [Parameter(Mandatory = $false)]
    [switch]$SummaryOnly,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 50)]
    [int]$SummarySampleLimit = 5
)

$ErrorActionPreference = "Stop"

function Write-BranchHygieneResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Output ""
    Write-Output "== Module Run v2 Branch Hygiene =="
    Write-Output "branchHygieneDecision: $Decision"
    Write-Output "cleanupRequested: $($Cleanup.ToString().ToLowerInvariant())"
    Write-Output "summaryOnly: $($SummaryOnly.ToString().ToLowerInvariant())"
    Write-Output "branchHygieneMergedCandidateCount: $($script:mergedCandidates.Count)"
    Write-Output "branchHygieneUnmergedReviewCount: $($script:unmergedReview.Count)"
    Write-Output "branchHygieneCleanupActionCount: $($script:cleanupActions.Count)"
    if ($SummaryOnly) {
        foreach ($branch in @($script:mergedCandidates | Select-Object -First $SummarySampleLimit)) {
            Write-Output "branchHygieneMergedCandidateSample: $branch"
        }
        foreach ($branch in @($script:unmergedReview | Select-Object -First $SummarySampleLimit)) {
            Write-Output "branchHygieneUnmergedReviewSample: $branch"
        }
        foreach ($branch in @($script:cleanupActions | Select-Object -First $SummarySampleLimit)) {
            Write-Output "branchHygieneCleanupActionSample: $branch"
        }
    }
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-LocalBranches {
    param([Parameter(Mandatory = $true)][string]$Pattern)

    $branches = @(& git for-each-ref "--format=%(refname:short)" refs/heads 2>$null)
    if ($LASTEXITCODE -ne 0) {
        throw "git for-each-ref failed"
    }

    return @($branches | Where-Object { $_ -like $Pattern })
}

$mergedCandidates = New-Object System.Collections.Generic.List[string]
$unmergedReview = New-Object System.Collections.Generic.List[string]
$cleanupActions = New-Object System.Collections.Generic.List[string]

try {
    Write-Output ""
    Write-Output "== Branch Inventory =="
    Write-Output "baseBranch: $BaseBranch"
    Write-Output "branchPattern: $BranchPattern"
    Write-Output "summaryOnly: $($SummaryOnly.ToString().ToLowerInvariant())"

    $baseSha = ((& git rev-parse $BaseBranch 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($baseSha)) {
        Write-BranchHygieneResult -Decision "stop_for_hard_block" -Reason "base branch is not resolvable" -ExitCode 1
    }
    Write-Output "baseSha: $baseSha"

    $currentBranch = ((& git branch --show-current 2>$null) -join "").Trim()
    Write-Output "currentBranch: $(if ([string]::IsNullOrWhiteSpace($currentBranch)) { "(detached HEAD)" } else { $currentBranch })"

    $branches = @(Get-LocalBranches -Pattern $BranchPattern)
    foreach ($branch in $branches) {
        if ($branch -eq $currentBranch) {
            if (-not $SummaryOnly) {
                Write-Output "branchHygieneSkippedCurrent: $branch"
            }
            continue
        }

        $branchSha = ((& git rev-parse $branch 2>$null) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branchSha)) {
            Write-Output "branchHygieneHardBlock: unresolved $branch"
            Write-BranchHygieneResult -Decision "stop_for_hard_block" -Reason "local branch is not resolvable" -ExitCode 1
        }

        & git merge-base --is-ancestor $branch $BaseBranch 2>$null
        $isMerged = $LASTEXITCODE -eq 0
        if ($isMerged) {
            if (-not $SummaryOnly) {
                Write-Output "branchCleanupCandidate: $branch $branchSha"
            }
            $script:mergedCandidates.Add($branch)
            if ($Cleanup) {
                if ($branch -eq $currentBranch) {
                    Write-Output "branchCleanupSkippedCurrent: $branch"
                    continue
                }
                & git branch -d $branch | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    Write-BranchHygieneResult -Decision "stop_for_hard_block" -Reason "git branch -d failed for $branch" -ExitCode 1
                }
                if (-not $SummaryOnly) {
                    Write-Output "branchCleanupAction: deleted $branch"
                }
                $script:cleanupActions.Add($branch)
            }
        } else {
            if (-not $SummaryOnly) {
                Write-Output "branchManualReviewRequired: $branch $branchSha"
            }
            $script:unmergedReview.Add($branch)
        }
    }

    if ($Cleanup -and $cleanupActions.Count -gt 0) {
        Write-BranchHygieneResult -Decision "cleanup_completed" -Reason "merged local codex branches were deleted; unmerged branches, if any, were left for manual review" -ExitCode 0
    }
    if ($mergedCandidates.Count -gt 0) {
        Write-BranchHygieneResult -Decision "cleanup_available" -Reason "merged local codex branch cleanup is available" -ExitCode 0
    }
    if ($unmergedReview.Count -gt 0) {
        Write-BranchHygieneResult -Decision "manual_required" -Reason "unmerged local codex branches require manual review" -ExitCode 1
    }

    Write-BranchHygieneResult -Decision "clean" -Reason "no local codex branch residue was found" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-BranchHygieneResult -Decision "stop_for_hard_block" -Reason "branch hygiene encountered an error" -ExitCode 1
}
