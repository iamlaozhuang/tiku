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
    $historyIndexPath = Join-Path -Path $Root -ChildPath "task-history-index.yaml"
    $matrixPath = Join-Path -Path $Root -ChildPath "matrix.yaml"

    @"
schemaVersion: 1
currentTask:
  id: closed-current
  status: closed
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: closed-current
    status: closed
  - id: module-run-v2-personal-ai-local-transport-contract-planning
    status: closed
  - id: module-run-v2-personal-ai-local-ui-browser-planning
    status: closed
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 1
entries: []
"@ | Set-Content -LiteralPath $historyIndexPath -Encoding UTF8

    @"
schemaVersion: 2
implementationAutoSeedGate:
  enabled: true
localExperienceClosureGate:
  purpose: local bridge fixture
  acceptanceBridgePlan:
    status: proposal_only
    currentPriorityChain: personal-learning-ai-experience
    bridgeSequence:
      - step: local_api_or_server_action_contract
        targetLocalFullLoopGate: L4
        candidateTask: module-run-v2-personal-ai-local-transport-contract-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - src/app/api/v1/**
          - server action surfaces
      - step: local_ui_browser_entry
        targetLocalFullLoopGate: L5
        candidateTask: module-run-v2-personal-ai-local-ui-browser-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - src/app/(student)/**
          - browser verification
      - step: local_role_flow_and_e2e_readiness
        targetLocalFullLoopGate: L6
        candidateTask: module-run-v2-cross-role-local-flow-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - role-flow verification
          - e2e/**
          - cross-role denial and redaction checks
    hardBlocks:
      - provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work
      - dependency, package, lockfile, schema, or migration work
      - Cost Calibration Gate execution
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    return [pscustomobject]@{
        ProjectStatePath = $projectStatePath
        QueuePath        = $queuePath
        HistoryIndexPath = $historyIndexPath
        MatrixPath       = $matrixPath
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2LocalExperienceBridgeProposal.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing local experience bridge proposal script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-local-bridge-proposal-" + [guid]::NewGuid().ToString("N"))
try {
    $fixture = Write-FixtureFiles -Root $fixtureRoot
    $beforeQueueHash = (Get-FileHash -LiteralPath $fixture.QueuePath -Algorithm SHA256).Hash
    $beforeMatrixHash = (Get-FileHash -LiteralPath $fixture.MatrixPath -Algorithm SHA256).Hash

    $proposalOutput = @(
        & $scriptPath `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -HistoryIndexPath $fixture.HistoryIndexPath `
            -MatrixPath $fixture.MatrixPath
    )

    Assert-Contains -Output $proposalOutput -Pattern "^bridgeProposalDecision: proposal_available$"
    Assert-Contains -Output $proposalOutput -Pattern "^bridgeExperienceChain: personal-learning-ai-experience$"
    Assert-Contains -Output $proposalOutput -Pattern "^bridgeStep: local_role_flow_and_e2e_readiness$"
    Assert-Contains -Output $proposalOutput -Pattern "^bridgeCandidateTask: module-run-v2-cross-role-local-flow-planning$"
    Assert-Contains -Output $proposalOutput -Pattern "^bridgeTargetLocalFullLoopGate: L6$"
    Assert-Contains -Output $proposalOutput -Pattern "^bridgeRequiredApproval: localExperienceAcceptanceBridgeApproved$"
    Assert-Contains -Output $proposalOutput -Pattern "^bridgeBlockedUntilApproved: role-flow verification; e2e/\*\*; cross-role denial and redaction checks$"
    Assert-Contains -Output $proposalOutput -Pattern "Cost Calibration Gate remains blocked"

    Add-Content -LiteralPath $fixture.QueuePath -Value @"
  - id: module-run-v2-cross-role-local-flow-planning
    status: closed
"@ -Encoding UTF8

    $closedOutput = @(
        & $scriptPath `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -HistoryIndexPath $fixture.HistoryIndexPath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $closedOutput -Pattern "^bridgeProposalDecision: no_bridge_candidate$"

    @"
schemaVersion: 1
tasks:
  - id: closed-current
    status: closed
  - id: module-run-v2-personal-ai-local-transport-contract-planning
    status: closed
  - id: module-run-v2-personal-ai-local-ui-browser-planning
    status: closed
"@ | Set-Content -LiteralPath $fixture.QueuePath -Encoding UTF8

    @"
schemaVersion: 1
entries:
  - id: module-run-v2-cross-role-local-flow-planning
    status: closed
"@ | Set-Content -LiteralPath $fixture.HistoryIndexPath -Encoding UTF8

    $historyOnlyOutput = @(
        & $scriptPath `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -HistoryIndexPath $fixture.HistoryIndexPath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $historyOnlyOutput -Pattern "^bridgeProposalDecision: no_bridge_candidate$"

    $afterMatrixHash = (Get-FileHash -LiteralPath $fixture.MatrixPath -Algorithm SHA256).Hash
    if ($beforeMatrixHash -ne $afterMatrixHash) {
        throw "Local experience bridge proposal smoke expected matrix read-only behavior."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 local experience bridge proposal smoke passed"
