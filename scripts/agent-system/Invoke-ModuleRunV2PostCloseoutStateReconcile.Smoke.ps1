$ErrorActionPreference = "Stop"

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2PostCloseoutStateReconcile.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing post-closeout state reconcile script"
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

function Invoke-Reconcile {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $false)][switch]$Execute
    )

    $arguments = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $scriptPath,
        "-ProjectStatePath",
        $ProjectStatePath
    )
    if ($Execute) {
        $arguments += "-Execute"
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

function New-ReconcileFixture {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $false)][ValidateNotNullOrEmpty()][string]$TaskStatus = "closed",
        [Parameter(Mandatory = $false)][ValidateNotNullOrEmpty()][string]$CommitSha = "pending-local-commit"
    )

    $repoPath = Join-Path -Path $Root -ChildPath ("repo-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $repoPath | Out-Null
    & git -C $repoPath init | Out-Null
    & git -C $repoPath branch -M master | Out-Null

    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "README.md") -Value "base" -Encoding UTF8
    & git -C $repoPath add README.md | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "base" | Out-Null
    $baseSha = ((& git -C $repoPath rev-parse HEAD) -join "").Trim()

    $evidencePath = Join-Path -Path $repoPath -ChildPath "evidence.md"
    $auditPath = Join-Path -Path $repoPath -ChildPath "audit.md"
    Set-Content -LiteralPath $evidencePath -Value "Cost Calibration Gate remains blocked" -Encoding UTF8
    Set-Content -LiteralPath $auditPath -Value "Cost Calibration Gate remains blocked" -Encoding UTF8

    $statePath = Join-Path -Path $repoPath -ChildPath "project-state.yaml"
    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $baseSha
  lastKnownOriginMasterSha: $baseSha
currentTask:
  id: closeout-task
  status: $TaskStatus
  evidencePath: evidence.md
  auditReviewPath: audit.md
  commitSha: $CommitSha
"@ | Set-Content -LiteralPath $statePath -Encoding UTF8

    & git -C $repoPath add evidence.md audit.md project-state.yaml | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "state before closeout" | Out-Null

    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "README.md") -Value "closeout" -Encoding UTF8
    & git -C $repoPath add README.md | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "closeout" | Out-Null
    $closeoutSha = ((& git -C $repoPath rev-parse HEAD) -join "").Trim()
    & git -C $repoPath update-ref refs/remotes/origin/master $closeoutSha

    return [pscustomobject]@{
        RepoPath = $repoPath
        StatePath = $statePath
        BaseSha = $baseSha
        CloseoutSha = $closeoutSha
    }
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-post-closeout-reconcile-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $readyFixture = New-ReconcileFixture -Root $fixtureRoot
    Push-Location $readyFixture.RepoPath
    try {
        $dryRunResult = Invoke-Reconcile -ProjectStatePath $readyFixture.StatePath
        if ($dryRunResult.ExitCode -ne 0) {
            throw "Expected dry-run reconcile to pass.`n$($dryRunResult.Output -join "`n")"
        }
        Assert-Contains -Output $dryRunResult.Output -Pattern "postCloseoutStateReconcileDecision: ready_to_reconcile"

        $executeResult = Invoke-Reconcile -ProjectStatePath $readyFixture.StatePath -Execute
        if ($executeResult.ExitCode -ne 0) {
            throw "Expected execute reconcile to pass.`n$($executeResult.Output -join "`n")"
        }
        Assert-Contains -Output $executeResult.Output -Pattern "postCloseoutStateReconcileDecision: reconciled"
        $updatedState = @(Get-Content -LiteralPath $readyFixture.StatePath)
        Assert-Contains -Output $updatedState -Pattern "lastKnownMasterSha: $($readyFixture.CloseoutSha)"
        Assert-Contains -Output $updatedState -Pattern "lastKnownOriginMasterSha: $($readyFixture.CloseoutSha)"
        Assert-Contains -Output $updatedState -Pattern "commitSha: $($readyFixture.CloseoutSha)"
    } finally {
        Pop-Location
    }

    $inProgressFixture = New-ReconcileFixture -Root $fixtureRoot -TaskStatus "in_progress"
    Push-Location $inProgressFixture.RepoPath
    try {
        $notClosedResult = Invoke-Reconcile -ProjectStatePath $inProgressFixture.StatePath
        if ($notClosedResult.ExitCode -eq 0) {
            throw "Expected in-progress task reconcile to require manual review."
        }
        Assert-Contains -Output $notClosedResult.Output -Pattern "postCloseoutStateReconcileDecision: manual_required"
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 post-closeout state reconcile smoke passed"
