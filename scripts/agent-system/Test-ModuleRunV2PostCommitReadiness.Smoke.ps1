$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern"
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PostCommitReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing post-commit readiness script: $scriptPath"
}

$taskId = "module-run-v2-post-commit-advisory"
$output = @(& $scriptPath -TaskId $taskId)

Assert-Contains -Output $output -Pattern "Module Run v2 Post-Commit Readiness"
Assert-Contains -Output $output -Pattern "postCommitMode: advisory"
Assert-Contains -Output $output -Pattern "taskId: $taskId"
Assert-Contains -Output $output -Pattern "Last Commit"
Assert-Contains -Output $output -Pattern "Changed Files In Last Commit"
Assert-Contains -Output $output -Pattern "Task Inventory"
Assert-Contains -Output $output -Pattern "Scope Inventory"
Assert-Contains -Output $output -Pattern "post-commit advisory completed"

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-post-commit-readiness-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
try {
    $fixtureProjectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $fixtureQueuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    @"
schemaVersion: 1

currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $fixtureProjectStatePath -Encoding UTF8

    @"
schemaVersion: 1

tasks:

  - id: $taskId
    status: pending
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/**
    blockedFiles:
      - .env.local
    evidencePath: docs/05-execution-logs/evidence/module-run-v2-post-commit-advisory.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/module-run-v2-post-commit-advisory.md
"@ | Set-Content -LiteralPath $fixtureQueuePath -Encoding UTF8

    $blankLineOutput = @(
        & $scriptPath `
            -TaskId $taskId `
            -ProjectStatePath $fixtureProjectStatePath `
            -QueuePath $fixtureQueuePath
    )
    Assert-Contains -Output $blankLineOutput -Pattern "taskId: $taskId"
    Assert-Contains -Output $blankLineOutput -Pattern "status: pending"
    Assert-Contains -Output $blankLineOutput -Pattern "post-commit advisory completed"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 post-commit readiness smoke passed"
