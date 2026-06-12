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

function Invoke-CloseoutScript {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptPath,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(
            powershell.exe `
                -NoProfile `
                -ExecutionPolicy Bypass `
                -File $ScriptPath `
                @Arguments 2>&1
        )
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    return [pscustomobject]@{
        Output = $output
        ExitCode = $LASTEXITCODE
    }
}

function Write-FakeNodeTooling {
    param([Parameter(Mandatory = $true)][string]$Root)

    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\.bin") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\typescript") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\prettier\bin") -Force | Out-Null
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\eslint.cmd") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\tsc.cmd") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\prettier.cmd") -Encoding ASCII
    "{}" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\typescript\package.json") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\prettier\bin\prettier.cjs") -Encoding ASCII

    $fakeBin = Join-Path -Path $Root -ChildPath "fake-bin"
    New-Item -ItemType Directory -Path $fakeBin | Out-Null
    @"
@echo off
if "%1"=="run" if "%2"=="lint" (
  echo lint ok
  exit /b 0
)
if "%1"=="run" if "%2"=="typecheck" (
  echo typecheck ok
  exit /b 0
)
exit /b 9
"@ | Set-Content -LiteralPath (Join-Path -Path $fakeBin -ChildPath "npm.cmd") -Encoding ASCII

    return $fakeBin
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
  - id: historical-ai-task-seed
    status: closed
    taskKind: implementation
    seededImplementationTask: true
    seededExecutionModule: ai-task-and-provider
    targetClosureItem: historical closed task outside current seed transaction
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
    '{"scripts":{"lint":"eslint","typecheck":"tsc --noEmit"}}' | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "package.json") -Encoding UTF8
    @"
node_modules/
fake-bin/
"@ | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath ".gitignore") -Encoding UTF8
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

$originalPath = $env:Path
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
    & git -C $repoPath add docs package.json .gitignore | Out-Null
    & git -C $repoPath commit -m "seed closeout baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit recoverable seed closeout baseline."
    }
    & git -C $repoPath push -u origin master | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push recoverable seed closeout baseline."
    }

    $agentWorktreePath = Join-Path -Path $worktreeRoot -ChildPath "agent"
    $blockedWorktreePath = Join-Path -Path $worktreeRoot -ChildPath "blocked"
    $seedWorktreePath = Join-Path -Path $worktreeRoot -ChildPath "seed"
    & git -C $repoPath worktree add --detach $agentWorktreePath HEAD | Out-Null
    & git -C $repoPath worktree add --detach $blockedWorktreePath HEAD | Out-Null
    & git -C $repoPath worktree add --detach $seedWorktreePath HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create recoverable seed closeout worktrees."
    }
    & git -C $agentWorktreePath switch -c codex/smoke-recoverable-seed-success | Out-Null
    & git -C $blockedWorktreePath switch -c codex/smoke-recoverable-seed-blocked | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create recoverable seed closeout smoke branches."
    }

    Push-Location $seedWorktreePath
    try {
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
    } finally {
        Pop-Location
    }

    New-Item -ItemType Directory -Path (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\task-plans") -Force | Out-Null
    @"
# Module Run v2 Auto-Seed Plan: authorization-and-access

- autoDriveLocalImplementationApproval is recorded.
- Cost Calibration Gate remains blocked.
"@ | Set-Content -LiteralPath (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\task-plans\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md") -Encoding UTF8
    @"
result: pending
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\evidence\batch-119-authorization-and-access-personal-auth.md") -Encoding UTF8
    @"
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\audits-reviews\batch-119-authorization-and-access-personal-auth.md") -Encoding UTF8
    foreach ($seedTaskId in @(
            "batch-101-authorization-and-access-authorization-read-model-and-display-contrac",
            "batch-102-authorization-and-access-personal-auth-and-org-auth-local-summaries"
        )) {
        @"
result: pending
Batch range: pending
RED: pending
GREEN: pending
Commit: pending
localFullLoopGate: L4 pending
threadRolloverGate: pending
nextModuleRunCandidate: pending
blocked remainder: high-risk work remains separately gated
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\evidence\$seedTaskId.md") -Encoding UTF8
        @"
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath (Join-Path -Path $seedWorktreePath -ChildPath "docs\05-execution-logs\audits-reviews\$seedTaskId.md") -Encoding UTF8
    }
    & git -C $seedWorktreePath add docs | Out-Null

    Push-Location $blockedWorktreePath
    try {
        $blockedExecuteResult = Invoke-CloseoutScript `
            -ScriptPath $scriptPath `
            -Arguments @(
                "-SeedWorktreePath", $seedWorktreePath,
                "-Execute",
                "-CloseoutAuthorizationStatement", "autoDriveLocalImplementationApproval commit fast-forward merge push cleanup"
            )
    } finally {
        Pop-Location
    }
    if ($blockedExecuteResult.ExitCode -eq 0) {
        throw "Expected recoverable seed closeout to fail when local tooling preflight fails."
    }
    Assert-Contains -Output $blockedExecuteResult.Output -Pattern "closeoutLocalToolingMissing: node_modules"
    $queueBeforeSuccessfulCloseout = Get-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "docs\04-agent-system\state\task-queue.yaml") -Raw
    if ($queueBeforeSuccessfulCloseout -match "batch-101-authorization-and-access" -or $queueBeforeSuccessfulCloseout -match "batch-102-authorization-and-access") {
        throw "Recoverable seed closeout mutated the base queue before local tooling preflight passed."
    }

    $agentFakeBin = Write-FakeNodeTooling -Root $agentWorktreePath
    $env:Path = "$agentFakeBin;$originalPath"
    Push-Location $agentWorktreePath
    try {
        $planResult = Invoke-CloseoutScript -ScriptPath $scriptPath -Arguments @("-SeedWorktreePath", $seedWorktreePath)
        if ($planResult.ExitCode -ne 0) {
            throw "Expected recoverable seed closeout plan mode to pass. Output:`n$($planResult.Output -join "`n")"
        }
        Assert-Contains -Output $planResult.Output -Pattern "recoverableSeedCloseoutDecision: ready_to_execute"
        Assert-Contains -Output $planResult.Output -Pattern "seedModule: authorization-and-access"

        $executeResult = Invoke-CloseoutScript `
            -ScriptPath $scriptPath `
            -Arguments @(
                "-SeedWorktreePath", $seedWorktreePath,
                "-Execute",
                "-CloseoutAuthorizationStatement", "autoDriveLocalImplementationApproval commit fast-forward merge push cleanup"
            )
    } finally {
        Pop-Location
    }

    if ($executeResult.ExitCode -ne 0) {
        throw "Expected recoverable seed closeout execute mode to pass. Output:`n$($executeResult.Output -join "`n")"
    }
    Assert-Contains -Output $executeResult.Output -Pattern "recoverableSeedCloseoutDecision: closeout_executed"
    Assert-Contains -Output $executeResult.Output -Pattern "closeoutLocalToolingDecision: ready"
    Assert-Contains -Output $executeResult.Output -Pattern "seedTaskBlockCount: 2"
    Assert-Contains -Output $executeResult.Output -Pattern "seedTaskBlocksAppended: 2"
    Assert-Contains -Output $executeResult.Output -Pattern "seedTransactionFileCopied: docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-auto-seed-authorization-and-access.md"
    Assert-Contains -Output $executeResult.Output -Pattern "seedTransactionFileCopied: docs/05-execution-logs/evidence/batch-119-authorization-and-access-personal-auth.md"
    $masterQueue = Get-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "docs\04-agent-system\state\task-queue.yaml") -Raw
    if ($masterQueue -notmatch "seededImplementationTask:\s*true" -or $masterQueue -notmatch "authorization-and-access") {
        throw "Recoverable seed closeout did not merge seed tasks into master worktree."
    }
    foreach ($expectedReplayFile in @(
            "docs\05-execution-logs\task-plans\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md",
            "docs\05-execution-logs\evidence\batch-119-authorization-and-access-personal-auth.md",
            "docs\05-execution-logs\audits-reviews\batch-119-authorization-and-access-personal-auth.md"
        )) {
        if (-not (Test-Path -LiteralPath (Join-Path -Path $repoPath -ChildPath $expectedReplayFile))) {
            throw "Recoverable seed closeout did not replay expected seed file: $expectedReplayFile"
        }
    }
    $remoteMaster = ((& git -C $repoPath rev-parse origin/master) -join "").Trim()
    $localMaster = ((& git -C $repoPath rev-parse master) -join "").Trim()
    if ($remoteMaster -ne $localMaster) {
        throw "Recoverable seed closeout did not push origin/master."
    }
} finally {
    $env:Path = $originalPath
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 recoverable seed transaction closeout smoke passed"
