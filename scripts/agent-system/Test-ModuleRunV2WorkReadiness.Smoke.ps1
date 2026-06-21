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

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedPattern
    )

    $output = @()
    $failed = $false
    try {
        $output = @(& $Command 2>&1)
    } catch {
        $failed = $true
        $output += $_.Exception.Message
    }

    if (-not $failed -and $LASTEXITCODE -eq 0) {
        throw "Expected command to fail with pattern: $ExpectedPattern"
    }

    Assert-Contains -Output $output -Pattern $ExpectedPattern
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2WorkReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing advisory script: $scriptPath"
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
$isProtectedBranch = $currentBranch -eq "master" -or $currentBranch -eq "main"

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-work-readiness-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $taskId = "module-run-v2-work-readiness-smoke"
    $doneTaskId = "module-run-v2-work-readiness-done"
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"

@"
schemaVersion: 1

currentTask:
  id: $taskId
  planPath: docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-mechanism-completion.md
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:

  - id: $taskId
    status: in_progress
    taskKind: implementation

    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1
      - scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-mechanism-completion.md

    blockedFiles:
      - .env.local
      - package.json
      - src/**
      - e2e/**

    riskTypes:
      - hook_governance

    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-mechanism-completion.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-mechanism-completion.md

  - id: $doneTaskId
    status: done
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - hook_governance
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-mechanism-completion.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-mechanism-completion.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $plannedFiles = @(
        "scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1",
        "scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1",
        "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-mechanism-completion.md"
    )

    if ($isProtectedBranch) {
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PROTECTED_BRANCH $currentBranch" -Command {
            & $scriptPath -Mode pre-work -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath
        }

        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PROTECTED_BRANCH $currentBranch" -Command {
            & $scriptPath -Mode pre-edit -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -PlannedFiles $plannedFiles
        }
    } else {
        $preWorkOutput = @(& $scriptPath -Mode pre-work -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath)
        Assert-Contains -Output $preWorkOutput -Pattern "Module Run v2 Work Readiness"
        Assert-Contains -Output $preWorkOutput -Pattern "workReadinessMode: hard_block"
        Assert-Contains -Output $preWorkOutput -Pattern "checkMode: pre-work"
        Assert-Contains -Output $preWorkOutput -Pattern "taskId: $taskId"
        Assert-Contains -Output $preWorkOutput -Pattern "hookIntegrationMatrix: present"
        Assert-Contains -Output $preWorkOutput -Pattern "Cost Calibration Gate remains blocked"
        Assert-Contains -Output $preWorkOutput -Pattern "work readiness passed"

        $preEditOutput = @(& $scriptPath -Mode pre-edit -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -PlannedFiles $plannedFiles)
        Assert-Contains -Output $preEditOutput -Pattern "checkMode: pre-edit"
        Assert-Contains -Output $preEditOutput -Pattern "OK_PLANNED_ALLOWED_FILE scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1"
        Assert-Contains -Output $preEditOutput -Pattern "OK_PLANNED_ALLOWED_FILE scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1"
        Assert-Contains -Output $preEditOutput -Pattern "work readiness passed"
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_TASK_ID" -Command {
        & $scriptPath -Mode pre-work -ProjectStatePath $projectStatePath -QueuePath $queuePath
    }

    $doneTaskOutput = @(& $scriptPath -Mode pre-work -TaskId $doneTaskId -ProjectStatePath $projectStatePath -QueuePath $queuePath)
    Assert-Contains -Output $doneTaskOutput -Pattern "workReadinessDecision: not_executable_closed_task"
    Assert-Contains -Output $doneTaskOutput -Pattern "workReadinessAction: idle_no_executable_task"

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PLANNED_OUT_OF_SCOPE" -Command {
        & $scriptPath -Mode pre-edit -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -PlannedFiles "README.md"
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PLANNED_BLOCKED_FILE" -Command {
        & $scriptPath -Mode pre-edit -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -PlannedFiles ".env.local"
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 work readiness smoke passed"
