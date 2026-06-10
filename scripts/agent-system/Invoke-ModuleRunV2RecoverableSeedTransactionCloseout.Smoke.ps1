$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`nActual output:`n$($Output -join "`n")"
    }
}

function Write-SeedFixtureFiles {
    param([Parameter(Mandatory = $true)][string]$Root)

    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "docs\04-agent-system\state") -Force | Out-Null
    @"
schemaVersion: 1
currentTask:
  id: closed-current
"@ | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "docs\04-agent-system\state\project-state.yaml") -Encoding UTF8
    @"
schemaVersion: 1
tasks:
  - id: closed-current
    status: closed
    taskKind: automation_activation
"@ | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "docs\04-agent-system\state\task-queue.yaml") -Encoding UTF8
    @"
schemaVersion: 2
moduleRunVersion: 2
mode:
  firstEligibleImplementationBatchNumber: 101
sourcePlanningModules:
  - module: authorization-context
    sourcePlanningTask: closed-current
    v2ExecutionModule: authorization-and-access
executionModules:
  - module: authorization-and-access
    sourceModules:
      - authorization-context
    localFullLoopMinimum: L4
    targetLocalClosure:
      - authorization read-model and display contracts
      - personal_auth and org_auth local summaries
implementationAutoSeedGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml") -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.ps1"
$seedScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "New-ModuleRunV2ImplementationSeed.ps1"
foreach ($requiredPath in @($scriptPath, $seedScriptPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing recoverable seed closeout smoke dependency: $requiredPath"
    }
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-seed-closeout-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $remotePath = Join-Path -Path $fixtureRoot -ChildPath "remote.git"
    $repoPath = Join-Path -Path $fixtureRoot -ChildPath "repo"
    $worktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "worktrees"
    New-Item -ItemType Directory -Path $repoPath, $worktreeRoot | Out-Null
    & git init --bare $remotePath | Out-Null
    & git -C $repoPath init | Out-Null
    & git -C $repoPath config user.name "Tiku Smoke" | Out-Null
    & git -C $repoPath config user.email "tiku-smoke@example.invalid" | Out-Null
    & git -C $repoPath remote add origin $remotePath | Out-Null
    Write-SeedFixtureFiles -Root $repoPath
    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath commit -m "seed closeout baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit recoverable seed closeout baseline."
    }
    & git -C $repoPath push -u origin master | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push recoverable seed closeout baseline."
    }

    $agentWorktreePath = Join-Path -Path $worktreeRoot -ChildPath "agent"
    $seedWorktreePath = Join-Path -Path $worktreeRoot -ChildPath "seed"
    & git -C $repoPath worktree add --detach $agentWorktreePath HEAD | Out-Null
    & git -C $repoPath worktree add --detach $seedWorktreePath HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create recoverable seed closeout worktrees."
    }

    & $seedScriptPath `
        -Apply `
        -ProjectStatePath (Join-Path -Path $seedWorktreePath -ChildPath "docs\04-agent-system\state\project-state.yaml") `
        -QueuePath (Join-Path -Path $seedWorktreePath -ChildPath "docs\04-agent-system\state\task-queue.yaml") `
        -MatrixPath (Join-Path -Path $seedWorktreePath -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml") `
        -ApprovalStatement "autoDriveLocalImplementationApproval: closeout smoke approval" `
        -SeedEvidencePath (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\evidence\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md") `
        -SeedAuditReviewPath (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\audits-reviews\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md") | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create recoverable seed closeout transaction."
    }
    & git -C $seedWorktreePath add docs | Out-Null

    Push-Location $agentWorktreePath
    try {
        $planOutput = @(& $scriptPath -SeedWorktreePath $seedWorktreePath)
        Assert-Contains -Output $planOutput -Pattern "recoverableSeedCloseoutDecision: ready_to_execute"
        Assert-Contains -Output $planOutput -Pattern "seedModule: authorization-and-access"

        $executeOutput = @(
            & $scriptPath `
                -SeedWorktreePath $seedWorktreePath `
                -Execute `
                -CloseoutAuthorizationStatement "autoDriveLocalImplementationApproval commit fast-forward merge push cleanup"
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $executeOutput -Pattern "recoverableSeedCloseoutDecision: closeout_executed"
    Assert-Contains -Output $executeOutput -Pattern "seedTaskBlocksAppended: 2"
    $masterQueue = Get-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "docs\04-agent-system\state\task-queue.yaml") -Raw
    if ($masterQueue -notmatch "seededImplementationTask:\s*true" -or $masterQueue -notmatch "authorization-and-access") {
        throw "Recoverable seed closeout did not merge seed tasks into master worktree."
    }
    $remoteMaster = ((& git -C $repoPath rev-parse origin/master) -join "").Trim()
    $localMaster = ((& git -C $repoPath rev-parse master) -join "").Trim()
    if ($remoteMaster -ne $localMaster) {
        throw "Recoverable seed closeout did not push origin/master."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 recoverable seed transaction closeout smoke passed"
