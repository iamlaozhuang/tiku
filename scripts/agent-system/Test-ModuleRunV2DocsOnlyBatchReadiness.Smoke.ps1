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

function Convert-ToFixturePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return $Path.Replace("\", "/")
}

function Get-EvidenceFixtureContent {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$NeedsRecheck,

        [Parameter(Mandatory = $false)]
        [string]$NextTaskPolicy = "seeded",

        [Parameter(Mandatory = $false)]
        [string]$NextTaskId = "docs-next-task",

        [Parameter(Mandatory = $false)]
        [switch]$OmitNextTaskPolicy,

        [Parameter(Mandatory = $false)]
        [switch]$OmitNextTaskPolicyReason,

        [Parameter(Mandatory = $false)]
        [switch]$MissingAnchors
    )

    if ($MissingAnchors) {
        return @"
result: pass
Cost Calibration Gate remains blocked
"@
    }

    $needsRecheckLine = ""
    $nextTaskPolicyLine = "nextTaskPolicy: $NextTaskPolicy"
    $reasonLine = ""
    if ($NeedsRecheck) {
        $needsRecheckLine = "needs_recheck: true"
    }

    if ($OmitNextTaskPolicy) {
        $nextTaskPolicyLine = ""
    }

    if ($NextTaskPolicy -eq "intentionally_not_seeded" -and -not $OmitNextTaskPolicyReason) {
        $reasonLine = "nextTaskPolicyReason: smoke intentionally has no follow-up task"
    }

    return @"
result: pass
Batch range: smoke docs-only batch
RED: smoke red fixture recorded
GREEN: smoke green fixture recorded
Commit: 1234567890abcdef
localFullLoopGate: L1 docs-only batch
threadRolloverGate: not required in smoke
automationHandoffPolicy: smoke manual handoff only
nextModuleRunCandidate: $NextTaskId
$needsRecheckLine
$nextTaskPolicyLine
$reasonLine
Cost Calibration Gate remains blocked
"@
}

function New-BatchFixture {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$MissingChildEvidence,

        [Parameter(Mandatory = $false)]
        [switch]$MissingAnchors,

        [Parameter(Mandatory = $false)]
        [switch]$NeedsRecheck,

        [Parameter(Mandatory = $false)]
        [string]$NextTaskPolicy = "seeded",

        [Parameter(Mandatory = $false)]
        [switch]$OmitNextTaskPolicy,

        [Parameter(Mandatory = $false)]
        [switch]$OmitNextTask,

        [Parameter(Mandatory = $false)]
        [switch]$OmitNextTaskPolicyReason
    )

    $fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-docs-only-batch-" + [guid]::NewGuid().ToString("N"))
    $stateRoot = Join-Path -Path $fixtureRoot -ChildPath "docs\04-agent-system\state"
    $planRoot = Join-Path -Path $fixtureRoot -ChildPath "docs\05-execution-logs\task-plans"
    $evidenceRoot = Join-Path -Path $fixtureRoot -ChildPath "docs\05-execution-logs\evidence"
    $auditRoot = Join-Path -Path $fixtureRoot -ChildPath "docs\05-execution-logs\audits-reviews"
    New-Item -ItemType Directory -Force -Path $stateRoot, $planRoot, $evidenceRoot, $auditRoot | Out-Null

    $projectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $stateRoot -ChildPath "task-queue.yaml"
    $parentPlanPath = Join-Path -Path $planRoot -ChildPath "2026-06-15-docs-parent.md"
    $parentEvidencePath = Join-Path -Path $evidenceRoot -ChildPath "2026-06-15-docs-parent.md"
    $parentAuditPath = Join-Path -Path $auditRoot -ChildPath "2026-06-15-docs-parent.md"
    $childAPlanPath = Join-Path -Path $planRoot -ChildPath "2026-06-15-docs-child-a.md"
    $childAEvidencePath = Join-Path -Path $evidenceRoot -ChildPath "2026-06-15-docs-child-a.md"
    $childAAuditPath = Join-Path -Path $auditRoot -ChildPath "2026-06-15-docs-child-a.md"
    $childBPlanPath = Join-Path -Path $planRoot -ChildPath "2026-06-15-docs-child-b.md"
    $childBEvidencePath = Join-Path -Path $evidenceRoot -ChildPath "2026-06-15-docs-child-b.md"
    $childBAuditPath = Join-Path -Path $auditRoot -ChildPath "2026-06-15-docs-child-b.md"

    "plan" | Set-Content -LiteralPath $parentPlanPath -Encoding UTF8
    "plan" | Set-Content -LiteralPath $childAPlanPath -Encoding UTF8
    "plan" | Set-Content -LiteralPath $childBPlanPath -Encoding UTF8
    Get-EvidenceFixtureContent -NeedsRecheck:$NeedsRecheck -NextTaskPolicy $NextTaskPolicy -OmitNextTaskPolicy:$OmitNextTaskPolicy -OmitNextTaskPolicyReason:$OmitNextTaskPolicyReason | Set-Content -LiteralPath $parentEvidencePath -Encoding UTF8
    Get-EvidenceFixtureContent -NeedsRecheck:$NeedsRecheck -NextTaskPolicy $NextTaskPolicy -OmitNextTaskPolicy:$OmitNextTaskPolicy -OmitNextTaskPolicyReason:$OmitNextTaskPolicyReason -MissingAnchors:$MissingAnchors | Set-Content -LiteralPath $childAEvidencePath -Encoding UTF8
    if (-not $MissingChildEvidence) {
        Get-EvidenceFixtureContent -NeedsRecheck:$NeedsRecheck -NextTaskPolicy $NextTaskPolicy -OmitNextTaskPolicy:$OmitNextTaskPolicy -OmitNextTaskPolicyReason:$OmitNextTaskPolicyReason | Set-Content -LiteralPath $childBEvidencePath -Encoding UTF8
    }
    "Verdict: APPROVE" | Set-Content -LiteralPath $parentAuditPath -Encoding UTF8
    "Verdict: APPROVE" | Set-Content -LiteralPath $childAAuditPath -Encoding UTF8
    "Verdict: APPROVE" | Set-Content -LiteralPath $childBAuditPath -Encoding UTF8

    @"
schemaVersion: 1
currentTask:
  id: docs-batch-parent
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    $nextTaskBlock = ""
    if (-not $OmitNextTask) {
        $nextTaskBlock = @"
  - id: docs-next-task
    status: pending
    taskKind: readonly_audit
"@
    }

    @"
schemaVersion: 1
tasks:
  - id: docs-batch-parent
    status: ready_for_closeout
    taskKind: docs_only_batch_closeout
    fastLaneEligible: true
    fastLaneLane: docs_only
    fastLaneBatchId: docs-batch-smoke
    fastLaneBatchRole: parent
    fastLaneBatchChildren:
      - docs-child-a
      - docs-child-b
    planPath: $(Convert-ToFixturePath -Path $parentPlanPath)
    evidencePath: $(Convert-ToFixturePath -Path $parentEvidencePath)
    auditReviewPath: $(Convert-ToFixturePath -Path $parentAuditPath)
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/05-execution-logs/task-plans/2026-06-15-docs-parent.md
      - docs/05-execution-logs/evidence/2026-06-15-docs-parent.md
      - docs/05-execution-logs/audits-reviews/2026-06-15-docs-parent.md
    blockedFiles:
      - src/**
      - tests/**
      - scripts/**
      - package.json
      - pnpm-lock.yaml
      - package-lock.json
      - package-lock.yaml
      - src/db/schema/**
      - drizzle/**
  - id: docs-child-a
    status: reviewed
    taskKind: readonly_audit
    fastLaneEligible: true
    fastLaneLane: docs_only
    fastLaneBatchId: docs-batch-smoke
    fastLaneBatchRole: child
    planPath: $(Convert-ToFixturePath -Path $childAPlanPath)
    evidencePath: $(Convert-ToFixturePath -Path $childAEvidencePath)
    auditReviewPath: $(Convert-ToFixturePath -Path $childAAuditPath)
    allowedFiles:
      - docs/05-execution-logs/task-plans/2026-06-15-docs-child-a.md
      - docs/05-execution-logs/evidence/2026-06-15-docs-child-a.md
      - docs/05-execution-logs/audits-reviews/2026-06-15-docs-child-a.md
    blockedFiles:
      - src/**
      - tests/**
      - scripts/**
      - package.json
      - pnpm-lock.yaml
      - package-lock.json
      - package-lock.yaml
      - src/db/schema/**
      - drizzle/**
  - id: docs-child-b
    status: reviewed
    taskKind: boundary_decision
    fastLaneEligible: true
    fastLaneLane: docs_only
    fastLaneBatchId: docs-batch-smoke
    fastLaneBatchRole: child
    planPath: $(Convert-ToFixturePath -Path $childBPlanPath)
    evidencePath: $(Convert-ToFixturePath -Path $childBEvidencePath)
    auditReviewPath: $(Convert-ToFixturePath -Path $childBAuditPath)
    allowedFiles:
      - docs/05-execution-logs/task-plans/2026-06-15-docs-child-b.md
      - docs/05-execution-logs/evidence/2026-06-15-docs-child-b.md
      - docs/05-execution-logs/audits-reviews/2026-06-15-docs-child-b.md
    blockedFiles:
      - src/**
      - tests/**
      - scripts/**
      - package.json
      - pnpm-lock.yaml
      - package-lock.json
      - package-lock.yaml
      - src/db/schema/**
      - drizzle/**
$nextTaskBlock
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    return @{
        Root = $fixtureRoot
        ProjectStatePath = $projectStatePath
        QueuePath = $queuePath
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2DocsOnlyBatchReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing docs-only batch readiness script: $scriptPath"
}

$changedDocsFile = "docs/05-execution-logs/evidence/2026-06-15-docs-child-a.md"
$fixture = New-BatchFixture
try {
    $shadowOutput = @(
        & $scriptPath -BatchId "docs-batch-smoke" -Mode shadow -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    )
    Assert-Contains -Output $shadowOutput -Pattern "docsOnlyBatchShadowDecision: would_pass"

    $hardBlockOutput = @(
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    )
    Assert-Contains -Output $hardBlockOutput -Pattern "docsOnlyBatchDecision: pass"
} finally {
    if (Test-Path -LiteralPath $fixture.Root) {
        Remove-Item -LiteralPath $fixture.Root -Recurse -Force
    }
}

$fixture = New-BatchFixture -MissingChildEvidence
try {
    $shadowOutput = @(
        & $scriptPath -BatchId "docs-batch-smoke" -Mode shadow -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    )
    Assert-Contains -Output $shadowOutput -Pattern "docsOnlyBatchShadowDecision: would_block"
    Assert-Contains -Output $shadowOutput -Pattern "HARD_BLOCK_MISSING_EVIDENCE"

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_EVIDENCE" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    }
} finally {
    if (Test-Path -LiteralPath $fixture.Root) {
        Remove-Item -LiteralPath $fixture.Root -Recurse -Force
    }
}

$fixture = New-BatchFixture -MissingAnchors
try {
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_BATCH_EVIDENCE" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    }
} finally {
    if (Test-Path -LiteralPath $fixture.Root) {
        Remove-Item -LiteralPath $fixture.Root -Recurse -Force
    }
}

$fixture = New-BatchFixture
try {
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_FORBIDDEN_CHANGED_FILE" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles "src/server/services/example.ts"
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_FORBIDDEN_CHANGED_FILE" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles "scripts/agent-system/example.ps1"
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_FORBIDDEN_CHANGED_FILE" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles "package.json"
    }
} finally {
    if (Test-Path -LiteralPath $fixture.Root) {
        Remove-Item -LiteralPath $fixture.Root -Recurse -Force
    }
}

$fixture = New-BatchFixture -NeedsRecheck -OmitNextTaskPolicy
try {
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_NEEDS_RECHECK_MISSING_NEXT_TASK_POLICY" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    }
} finally {
    if (Test-Path -LiteralPath $fixture.Root) {
        Remove-Item -LiteralPath $fixture.Root -Recurse -Force
    }
}

$fixture = New-BatchFixture -NeedsRecheck -OmitNextTask
try {
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_NEXT_TASK_POLICY_SEEDED_MISSING_TASK" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    }
} finally {
    if (Test-Path -LiteralPath $fixture.Root) {
        Remove-Item -LiteralPath $fixture.Root -Recurse -Force
    }
}

$fixture = New-BatchFixture -NeedsRecheck -NextTaskPolicy "intentionally_not_seeded" -OmitNextTaskPolicyReason
try {
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_NEXT_TASK_POLICY_REASON_MISSING" -Command {
        & $scriptPath -BatchId "docs-batch-smoke" -Mode hard_block -ProjectStatePath $fixture.ProjectStatePath -QueuePath $fixture.QueuePath -ChangedFiles $changedDocsFile
    }
} finally {
    if (Test-Path -LiteralPath $fixture.Root) {
        Remove-Item -LiteralPath $fixture.Root -Recurse -Force
    }
}

Write-Output "Module Run v2 docs-only batch readiness smoke passed"
