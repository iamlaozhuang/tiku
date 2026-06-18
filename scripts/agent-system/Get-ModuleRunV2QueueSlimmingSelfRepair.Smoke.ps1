$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`n$($Output -join "`n")"
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2QueueSlimmingSelfRepair.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing queue slimming/self-repair script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-queue-slimming-self-repair-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot -Force | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"

    @"
schemaVersion: 1
currentTask:
  id: terminal-current
  status: closed
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: terminal-a
    status: closed
    taskKind: docs_only
    moduleRunVersion: 2
    executionProfile: docs_state_lite
    validationPolicy: docs_state
    allowedFiles:
      - docs/04-agent-system/state/task-queue.yaml
    blockedFiles:
      - docs/04-agent-system/state/archive/**
    validationCommands:
      - git diff --check
    closeoutPolicy:
      localCommit:
        approved: true
    evidencePath: docs/05-execution-logs/evidence/terminal-a.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/terminal-a.md
    planPath: docs/05-execution-logs/task-plans/terminal-a.md
  - id: terminal-b
    status: closed
    taskKind: docs_only
    moduleRunVersion: 2
    executionProfile: docs_state_lite
    validationPolicy: docs_state
    allowedFiles:
      - docs/04-agent-system/state/task-queue.yaml
    blockedFiles:
      - docs/04-agent-system/state/archive/**
    validationCommands:
      - git diff --check
    closeoutPolicy:
      localCommit:
        approved: true
    evidencePath: docs/05-execution-logs/evidence/terminal-b.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/terminal-b.md
    planPath: docs/05-execution-logs/task-plans/terminal-b.md
  - id: terminal-current
    status: closed
    taskKind: docs_only
    moduleRunVersion: 2
    executionProfile: docs_state_lite
    validationPolicy: docs_state
    allowedFiles:
      - docs/04-agent-system/state/task-queue.yaml
    blockedFiles:
      - docs/04-agent-system/state/archive/**
    validationCommands:
      - git diff --check
    closeoutPolicy:
      localCommit:
        approved: true
    evidencePath: docs/05-execution-logs/evidence/terminal-current.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/terminal-current.md
    planPath: docs/05-execution-logs/task-plans/terminal-current.md
  - id: safe-metadata-repair
    status: pending
    taskKind: docs_only
    executionProfile: docs_state_lite
    validationPolicy: docs_state
    allowedFiles:
      - docs/04-agent-system/state/task-queue.yaml
    blockedFiles:
      - docs/04-agent-system/state/archive/**
    validationCommands:
      - git diff --check
    closeoutPolicy:
      localCommit:
        approved: true
    evidencePath: docs/05-execution-logs/evidence/safe-metadata-repair.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/safe-metadata-repair.md
  - id: blocked-product-repair
    status: pending
    taskKind: implementation
    executionProfile: local_unit_tdd
    validationPolicy: local_unit
    allowedFiles:
      - src/server/services/example.ts
    blockedFiles:
      - .env.*
    validationCommands:
      - npm.cmd run test:unit -- src/server/services/example.test.ts
    evidencePath: docs/05-execution-logs/evidence/blocked-product-repair.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $output = @(& $scriptPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -TerminalRecoveryWindow 1)
    if ($LASTEXITCODE -ne 0) {
        throw "Expected queue slimming/self-repair diagnostic to pass.`n$($output -join "`n")"
    }

    Assert-Contains -Output $output -Pattern "queueSlimmingDecision: self_repair_candidates"
    Assert-Contains -Output $output -Pattern "activeQueueTaskCount: 5"
    Assert-Contains -Output $output -Pattern "activeQueueNonTerminalCount: 2"
    Assert-Contains -Output $output -Pattern "activeQueueTerminalCount: 3"
    Assert-Contains -Output $output -Pattern "archiveCandidateCount: 2"
    Assert-Contains -Output $output -Pattern "selfRepairCandidateCount: 1"
    Assert-Contains -Output $output -Pattern "highRiskRepairBlockedCount: 1"
    Assert-Contains -Output $output -Pattern "firstSelfRepairCandidates: safe-metadata-repair:moduleRunVersion\+planPath"
    Assert-Contains -Output $output -Pattern "firstBlockedRepairCandidates: blocked-product-repair:"
    Assert-Contains -Output $output -Pattern "applyMode: diagnostic_only_v1"
} finally {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output "Module Run v2 queue slimming/self-repair smoke passed"
