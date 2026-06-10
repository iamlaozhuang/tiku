$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`nActual output:`n$($Output -join "`n")"
    }
}

function Write-FixtureFiles {
    param([Parameter(Mandatory = $true)][string]$Root)

    New-Item -ItemType Directory -Path $Root -Force | Out-Null
    $projectStatePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $Root -ChildPath "matrix.yaml"

    @"
schemaVersion: 1
currentTask:
  id: closed-current
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: closed-current
    status: closed
    taskKind: implementation
    evidencePath: docs/05-execution-logs/evidence/closed-current.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/closed-current.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 2
mode:
  firstEligibleImplementationBatchNumber: 101
sourcePlanningModules:
  - module: authorization-context
    sourcePlanningTask: phase-69-advanced-authorization-context-implementation-planning
    v2ExecutionModule: authorization-and-access
  - module: ai-task-domain
    sourcePlanningTask: phase-70-advanced-ai-task-domain-implementation-planning
    v2ExecutionModule: ai-task-and-provider
executionModules:
  - module: authorization-and-access
    sourceModules:
      - authorization-context
    localFullLoopMinimum: L4
    targetLocalClosure:
      - authorization read-model and display contracts
      - personal_auth and org_auth local summaries
    stopConditions:
      - Cost Calibration Gate execution
  - module: ai-task-and-provider
    sourceModules:
      - ai-task-domain
    dependsOnExecutionModules:
      - authorization-and-access
    localFullLoopMinimum: L2
    targetLocalClosure:
      - provider-agnostic AI task lifecycle contracts
implementationAutoSeedGate:
  enabled: true
localExperienceClosureGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    return [pscustomobject]@{
        ProjectStatePath = $projectStatePath
        QueuePath        = $queuePath
        MatrixPath       = $matrixPath
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2ImplementationSeedProposal.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing seed proposal script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-seed-proposal-" + [guid]::NewGuid().ToString("N"))
try {
    $fixture = Write-FixtureFiles -Root $fixtureRoot
    $proposalOutput = @(
        & $scriptPath `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $proposalOutput -Pattern "seedProposalDecision: proposal_available"
    Assert-Contains -Output $proposalOutput -Pattern "seedModule: authorization-and-access"
    Assert-Contains -Output $proposalOutput -Pattern "seedCandidateTaskCount: 2"
    Assert-Contains -Output $proposalOutput -Pattern "seedRequiredApproval: autoDriveLocalImplementationApproval"
    Assert-Contains -Output $proposalOutput -Pattern "Cost Calibration Gate remains blocked"

    Add-Content -LiteralPath $fixture.QueuePath -Value @"
  - id: batch-101-authorization-and-access-authorization-read-model-and-display-contrac
    seededExecutionModule: authorization-and-access
    targetClosureItem: authorization read-model and display contracts
    status: done
  - id: batch-102-authorization-and-access-personal-auth-and-org-auth-local-summaries
    seededExecutionModule: authorization-and-access
    targetClosureItem: personal_auth and org_auth local summaries
    status: closed
"@ -Encoding UTF8

    $terminalAuthorizationOutput = @(
        & $scriptPath `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $terminalAuthorizationOutput -Pattern "seedModuleAlreadyComplete: authorization-and-access"
    Assert-Contains -Output $terminalAuthorizationOutput -Pattern "seedModule: ai-task-and-provider"
    Assert-Contains -Output $terminalAuthorizationOutput -Pattern "seedCandidateTask: batch-103-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract"

    Add-Content -LiteralPath $fixture.QueuePath -Value @"
  - id: pending-task
    status: pending
    taskKind: implementation
"@ -Encoding UTF8

    $executableOutput = @(
        & $scriptPath `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $executableOutput -Pattern "seedProposalDecision: executable_task_exists"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 implementation seed proposal smoke passed"
