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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ParallelReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing parallel readiness script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-parallel-readiness-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: fixture-master-sha
currentTask:
  id: coordinator-task
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: closed-foundation
    status: closed
    taskKind: docs_only
    allowedFiles:
      - docs/05-execution-logs/evidence/closed-foundation.md
    blockedFiles:
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
  - id: docs-worker-a
    status: pending
    taskKind: docs_only
    dependencies:
      - closed-foundation
    allowedFiles:
      - docs/04-agent-system/sop/worker-a.md
      - docs/05-execution-logs/evidence/worker-a.md
    blockedFiles:
      - package.json
      - package-lock.json
      - pnpm-lock.yaml
      - yarn.lock
      - .env*
      - src/**
      - drizzle/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
  - id: docs-worker-b
    status: pending
    taskKind: docs_only
    dependencies:
      - closed-foundation
    allowedFiles:
      - docs/04-agent-system/sop/worker-b.md
      - docs/05-execution-logs/evidence/worker-b.md
    blockedFiles:
      - package.json
      - package-lock.json
      - pnpm-lock.yaml
      - yarn.lock
      - .env*
      - src/**
      - drizzle/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
  - id: overlap-worker
    status: pending
    taskKind: docs_only
    allowedFiles:
      - docs/04-agent-system/sop/worker-a.md
    blockedFiles:
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
  - id: state-worker
    status: pending
    taskKind: docs_only
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/05-execution-logs/evidence/state-worker.md
    blockedFiles:
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
  - id: provider-worker
    status: pending
    taskKind: implementation
    allowedFiles:
      - src/provider-adapter.ts
    blockedFiles:
      - .env*
    riskTypes:
      - provider
    validationCommands:
      - git diff --check
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $passOutput = @(
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -CandidateTaskIds "docs-worker-a,docs-worker-b" `
            -CoordinatorTaskId "coordinator-task"
    )
    Assert-Contains -Output $passOutput -Pattern "Module Run v2 Parallel Readiness"
    Assert-Contains -Output $passOutput -Pattern "parallelDecision: can_assign_workers"
    Assert-Contains -Output $passOutput -Pattern "coordinator: required"
    Assert-Contains -Output $passOutput -Pattern "workerIsolation: required"
    Assert-Contains -Output $passOutput -Pattern "serialIntegration: required"
    Assert-Contains -Output $passOutput -Pattern "taskReadiness: docs-worker-a docs_isolated"
    Assert-Contains -Output $passOutput -Pattern "taskReadiness: docs-worker-b docs_isolated"
    Assert-Contains -Output $passOutput -Pattern "fileLock: docs-worker-a docs/04-agent-system/sop/worker-a.md"
    Assert-Contains -Output $passOutput -Pattern "fileLock: docs-worker-b docs/04-agent-system/sop/worker-b.md"
    Assert-Contains -Output $passOutput -Pattern "Cost Calibration Gate remains blocked"

    Invoke-ExpectFailure -ExpectedPattern "parallelDecision: stop_for_file_lock_conflict" -Command {
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -CandidateTaskIds "docs-worker-a,overlap-worker" `
            -CoordinatorTaskId "coordinator-task"
    }

    $serialOutput = @(
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -CandidateTaskIds "state-worker" `
            -CoordinatorTaskId "coordinator-task"
    )
    Assert-Contains -Output $serialOutput -Pattern "parallelDecision: use_serial_execution"
    Assert-Contains -Output $serialOutput -Pattern "taskReadiness: state-worker serial_only"

    Invoke-ExpectFailure -ExpectedPattern "parallelDecision: stop_for_blocked_gate" -Command {
        & $scriptPath `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -CandidateTaskIds "provider-worker" `
            -CoordinatorTaskId "coordinator-task"
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 parallel readiness smoke passed."
