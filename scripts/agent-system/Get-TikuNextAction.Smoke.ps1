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

function Initialize-SmokeRepo {
    param([Parameter(Mandatory = $true)][string]$Path)

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    & git -C $Path init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize next-action smoke repository."
    }

    & git -C $Path config user.name "Tiku Smoke"
    & git -C $Path config user.email "tiku-smoke@example.invalid"
    & git -C $Path config core.autocrlf false
    Set-Content -LiteralPath (Join-Path -Path $Path -ChildPath "README.md") -Value "next-action smoke baseline" -Encoding UTF8
    & git -C $Path add README.md | Out-Null
    & git -C $Path commit -m "chore(smoke): seed next-action fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit next-action smoke repository baseline."
    }

    & git -C $Path branch -M master
    return ((& git -C $Path rev-parse HEAD) -join "").Trim()
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-TikuNextAction.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing next-action diagnostic script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-next-action-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $repoPath = Join-Path -Path $fixtureRoot -ChildPath "repo"
    $sha = Initialize-SmokeRepo -Path $repoPath
    $stateRoot = Join-Path -Path $repoPath -ChildPath "docs/04-agent-system/state"
    New-Item -ItemType Directory -Path $stateRoot -Force | Out-Null
    $projectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $stateRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $stateRoot -ChildPath "advanced-edition-domain-module-run-matrix.yaml"

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $sha
  lastKnownOriginMasterSha: $sha
currentTask:
  id: completed-a
  status: closed
  commitSha: $sha
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: completed-a
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: task-a
    status: pending
    dependencies:
      - completed-a
    validationCommands:
      - git diff --check
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1
    evidencePath: docs/05-execution-logs/evidence/task-a.md
  - id: task-b
    status: pending
    dependencies:
      - missing-task
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-b.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 2
moduleRunVersion: 2
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath commit -m "chore(smoke): add next-action state fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit next-action smoke state fixture."
    }

    $beforeProjectHash = (Get-FileHash -LiteralPath $projectStatePath -Algorithm SHA256).Hash
    $beforeQueueHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    $beforeMatrixHash = (Get-FileHash -LiteralPath $matrixPath -Algorithm SHA256).Hash

    Push-Location -LiteralPath $repoPath
    try {
        $output = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $output -Pattern '^repository:'
    Assert-Contains -Output $output -Pattern '^currentTask: completed-a\(closed\)'
    Assert-Contains -Output $output -Pattern '^queueDecision: executable_task_found$'
    Assert-Contains -Output $output -Pattern '^nextActionDecision: executable_task_found$'
    Assert-Contains -Output $output -Pattern '^nextExecutableTask: task-a$'
    Assert-Contains -Output $output -Pattern '^blockedGates:'
    Assert-Contains -Output $output -Pattern '^validationNeeded: 2 command\(s\) for task-a$'
    Assert-Contains -Output $output -Pattern '^recommendedAction: claim_or_plan_next_task:task-a$'
    Assert-Contains -Output $output -Pattern '^stopReason: none$'
    Assert-Contains -Output $output -Pattern '^diagnosticOnly: true$'
    Assert-Contains -Output $output -Pattern 'Cost Calibration Gate remains blocked'

    $afterProjectHash = (Get-FileHash -LiteralPath $projectStatePath -Algorithm SHA256).Hash
    $afterQueueHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    $afterMatrixHash = (Get-FileHash -LiteralPath $matrixPath -Algorithm SHA256).Hash
    if ($beforeProjectHash -ne $afterProjectHash -or $beforeQueueHash -ne $afterQueueHash -or $beforeMatrixHash -ne $afterMatrixHash) {
        throw "Get-TikuNextAction smoke expected read-only behavior, but one or more fixture files changed."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Tiku next-action diagnostic smoke passed"
