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

function Initialize-SmokeRepo {
    param([Parameter(Mandatory = $true)][string]$Path)

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    & git -C $Path init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize project-status smoke repository."
    }

    & git -C $Path config user.name "Tiku Smoke"
    & git -C $Path config user.email "tiku-smoke@example.invalid"
    & git -C $Path config core.autocrlf false
    Set-Content -LiteralPath (Join-Path -Path $Path -ChildPath "README.md") -Value "project status smoke baseline" -Encoding UTF8
    & git -C $Path add README.md | Out-Null
    & git -C $Path commit -m "chore(smoke): seed project-status fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit project-status smoke baseline."
    }

    & git -C $Path branch -M master
    return ((& git -C $Path rev-parse HEAD) -join "").Trim()
}

function Write-AutomationToml {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$AutomationId,
        [Parameter(Mandatory = $true)][string]$Status
    )

    $prompt = "Current automation identity map tiku-module-run-v2-autopilot tiku-module-run-v2-autopilot-2 mechanic-2 on-demand Embedded mechanic policy standingUnattendedLocalCloseoutApproval low-risk local implementation tasks only local commit fast-forward merge to master push origin/master merged short-branch cleanup worktree parking High-risk capability gates remain blocked"
    @"
version = 1
id = "$AutomationId"
prompt = "$prompt"
status = "$Status"
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-TikuProjectStatus.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing project status diagnostic script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-project-status-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $repoPath = Join-Path -Path $fixtureRoot -ChildPath "repo"
    $sha = Initialize-SmokeRepo -Path $repoPath
    $stateRoot = Join-Path -Path $repoPath -ChildPath "docs/04-agent-system/state"
    New-Item -ItemType Directory -Path $stateRoot -Force | Out-Null
    $projectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $stateRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $stateRoot -ChildPath "advanced-edition-domain-module-run-matrix.yaml"
    $automationRoot = Join-Path -Path $fixtureRoot -ChildPath "automations"
    $onDemandRoot = Join-Path -Path $fixtureRoot -ChildPath "automation-on-demand"
    $primaryRoot = Join-Path -Path $automationRoot -ChildPath "tiku-module-run-v2-autopilot"
    $historicalRoot = Join-Path -Path $automationRoot -ChildPath "tiku-module-run-v2-autopilot-2"
    New-Item -ItemType Directory -Path $primaryRoot, $historicalRoot, $onDemandRoot -Force | Out-Null
    Write-AutomationToml -Path (Join-Path -Path $primaryRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot" -Status "PAUSED"
    Write-AutomationToml -Path (Join-Path -Path $historicalRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot-2" -Status "PAUSED"

    @"
schemaVersion: 1
automation:
  unattendedControl:
    codexAutomationId: tiku-module-run-v2-autopilot
    codexAutomationStatus: ACTIVE
    plannedPauseStatus: active
    plannedPauseReason: user_requested_mechanism_tuning
    plannedPauseKeepsAutomationPaused: true
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
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 2
moduleRunVersion: 2
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    Push-Location -LiteralPath $repoPath
    try {
        $output = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath `
                -AutomationRoot $automationRoot `
                -OnDemandAutomationRoot $onDemandRoot `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "handoffs")
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $output -Pattern '^projectStatusDecision: planned_pause_for_tuning$'
    Assert-Contains -Output $output -Pattern '^projectStatusAction: keep_automation_paused_for_tuning$'
    Assert-Contains -Output $output -Pattern '^automationRegistrationDecision: planned_pause_for_tuning$'
    Assert-Contains -Output $output -Pattern '^nextActionDecision: planned_pause_for_tuning$'
    Assert-Contains -Output $output -Pattern '^queueSlimmingDecision: clean$'
    Assert-Contains -Output $output -Pattern '^diagnosticOnly: true$'
    Assert-Contains -Output $output -Pattern 'Cost Calibration Gate remains blocked'

    Write-AutomationToml -Path (Join-Path -Path $primaryRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE"
    $bridgeProjectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state-bridge.yaml"
    $bridgeQueuePath = Join-Path -Path $stateRoot -ChildPath "task-queue-bridge.yaml"
    $bridgeMatrixPath = Join-Path -Path $stateRoot -ChildPath "advanced-edition-domain-module-run-matrix-bridge.yaml"
    @"
schemaVersion: 1
automation:
  unattendedControl:
    codexAutomationId: tiku-module-run-v2-autopilot
    codexAutomationStatus: ACTIVE
repository:
  lastKnownMasterSha: $sha
  lastKnownOriginMasterSha: $sha
currentTask:
  id: bridge-closed
  status: closed
  commitSha: $sha
"@ | Set-Content -LiteralPath $bridgeProjectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: bridge-closed
    status: closed
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: batch-101-smoke-execution-target
    status: closed
    seededExecutionModule: smoke-execution
    targetClosureItem: smoke target
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: module-run-v2-personal-ai-local-transport-contract-planning
    status: closed
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: module-run-v2-personal-ai-local-ui-browser-planning
    status: closed
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
"@ | Set-Content -LiteralPath $bridgeQueuePath -Encoding UTF8

    @"
schemaVersion: 2
moduleRunVersion: 2
sourcePlanningModules:
  - module: smoke-source
    sourcePlanningTask: phase-smoke-planning
    v2ExecutionModule: smoke-execution
executionModules:
  - module: smoke-execution
    sourceModules:
      - smoke-source
    localFullLoopMinimum: L2
    targetLocalClosure:
      - smoke target
implementationAutoSeedGate:
  enabled: true
localExperienceClosureGate:
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
      - step: local_ui_browser_entry
        targetLocalFullLoopGate: L5
        candidateTask: module-run-v2-personal-ai-local-ui-browser-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - src/app/(student)/**
      - step: local_role_flow_and_e2e_readiness
        targetLocalFullLoopGate: L6
        candidateTask: module-run-v2-cross-role-local-flow-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - role-flow verification
          - e2e/**
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $bridgeMatrixPath -Encoding UTF8

    New-Item -ItemType Directory -Path (Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence/completed-a.md") -Value "completed smoke evidence" -Encoding UTF8

    Push-Location -LiteralPath $repoPath
    try {
        $bridgeOutput = @(
            & $scriptPath `
                -ProjectStatePath $bridgeProjectStatePath `
                -QueuePath $bridgeQueuePath `
                -MatrixPath $bridgeMatrixPath `
                -AutomationRoot $automationRoot `
                -OnDemandAutomationRoot $onDemandRoot `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "handoffs")
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $bridgeOutput -Pattern '^nextActionDecision: local_experience_bridge_proposal_available$'
    Assert-Contains -Output $bridgeOutput -Pattern '^recommendedAction: request_local_experience_bridge_approval:module-run-v2-cross-role-local-flow-planning$'
    Assert-Contains -Output $bridgeOutput -Pattern '^projectStatusDecision: local_experience_bridge_proposal_available$'
    Assert-Contains -Output $bridgeOutput -Pattern '^projectStatusAction: request_local_experience_bridge_approval:module-run-v2-cross-role-local-flow-planning$'
    Assert-Contains -Output $bridgeOutput -Pattern '^projectStatusRequiresHuman: true$'
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Tiku project status diagnostic smoke passed"
