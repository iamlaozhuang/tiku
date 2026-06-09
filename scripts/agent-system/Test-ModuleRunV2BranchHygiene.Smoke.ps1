$ErrorActionPreference = "Stop"

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2BranchHygiene.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing branch hygiene script"
}

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $text = $Output -join "`n"
    if ($text -notmatch $Pattern) {
        throw "Expected pattern not found: $Pattern`n$text"
    }
}

function Invoke-BranchHygiene {
    param(
        [Parameter(Mandatory = $false)][switch]$Cleanup,
        [Parameter(Mandatory = $false)][switch]$SummaryOnly
    )

    $arguments = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $scriptPath, "-BaseBranch", "master")
    if ($Cleanup) {
        $arguments += "-Cleanup"
    }
    if ($SummaryOnly) {
        $arguments += "-SummaryOnly"
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& powershell.exe @arguments 2>&1)
        return [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = $output }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-branch-hygiene-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $repoPath = Join-Path -Path $fixtureRoot -ChildPath "repo"
    New-Item -ItemType Directory -Path $repoPath | Out-Null
    & git -C $repoPath init | Out-Null
    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "README.md") -Value "base" -Encoding UTF8
    & git -C $repoPath add README.md | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "base" | Out-Null
    & git -C $repoPath branch -M master | Out-Null

    & git -C $repoPath switch -c codex/merged-smoke | Out-Null
    & git -C $repoPath switch master | Out-Null

    & git -C $repoPath switch -c codex/unmerged-smoke | Out-Null
    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "unmerged.txt") -Value "unmerged" -Encoding UTF8
    & git -C $repoPath add unmerged.txt | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "unmerged" | Out-Null
    & git -C $repoPath switch master | Out-Null

    Push-Location $repoPath
    try {
        $dryRunResult = Invoke-BranchHygiene
        if ($dryRunResult.ExitCode -ne 0) {
            throw "Expected dry-run branch hygiene with cleanup candidate to pass.`n$($dryRunResult.Output -join "`n")"
        }
        Assert-Contains -Output $dryRunResult.Output -Pattern "branchHygieneDecision: cleanup_available"
        Assert-Contains -Output $dryRunResult.Output -Pattern "branchCleanupCandidate: codex/merged-smoke"
        Assert-Contains -Output $dryRunResult.Output -Pattern "branchManualReviewRequired: codex/unmerged-smoke"

        $summaryResult = Invoke-BranchHygiene -SummaryOnly
        if ($summaryResult.ExitCode -ne 0) {
            throw "Expected summary branch hygiene with cleanup candidate to pass.`n$($summaryResult.Output -join "`n")"
        }
        Assert-Contains -Output $summaryResult.Output -Pattern "branchHygieneDecision: cleanup_available"
        Assert-Contains -Output $summaryResult.Output -Pattern "summaryOnly: true"
        Assert-Contains -Output $summaryResult.Output -Pattern "branchHygieneMergedCandidateSample: codex/merged-smoke"
        if (($summaryResult.Output -join "`n") -match "branchCleanupCandidate: codex/merged-smoke") {
            throw "Expected SummaryOnly branch hygiene output to suppress detailed branch cleanup candidate lines."
        }

        & git switch codex/merged-smoke | Out-Null
        $currentBranchSummary = Invoke-BranchHygiene -SummaryOnly
        if ($currentBranchSummary.ExitCode -eq 0) {
            throw "Expected current-branch summary to require manual review because only the unmerged branch remains actionable.`n$($currentBranchSummary.Output -join "`n")"
        }
        Assert-Contains -Output $currentBranchSummary.Output -Pattern "branchHygieneDecision: manual_required"
        if (($currentBranchSummary.Output -join "`n") -match "branchHygieneMergedCandidateSample: codex/merged-smoke") {
            throw "Expected branch hygiene to skip the current branch as a cleanup candidate."
        }
        & git switch master | Out-Null

        $cleanupResult = Invoke-BranchHygiene -Cleanup
        if ($cleanupResult.ExitCode -ne 0) {
            throw "Expected branch hygiene cleanup to pass.`n$($cleanupResult.Output -join "`n")"
        }
        Assert-Contains -Output $cleanupResult.Output -Pattern "branchHygieneDecision: cleanup_completed"
        Assert-Contains -Output $cleanupResult.Output -Pattern "branchCleanupAction: deleted codex/merged-smoke"

        $branchesAfterCleanup = @(& git branch --list "codex/*")
        Assert-Contains -Output $branchesAfterCleanup -Pattern "codex/unmerged-smoke"
        if (($branchesAfterCleanup -join "`n") -match "codex/merged-smoke") {
            throw "Expected merged branch to be deleted"
        }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 branch hygiene smoke passed"
