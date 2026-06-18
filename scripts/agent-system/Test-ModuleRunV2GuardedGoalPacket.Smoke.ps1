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

function Write-ProjectState {
    param([Parameter(Mandatory = $true)][string]$Path)

    @(
        "schemaVersion: 1",
        "currentTask:",
        "  id: closed-task",
        "  status: closed"
    ) | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-ExecutionProfiles {
    param([Parameter(Mandatory = $true)][string]$Path)

    @(
        "schemaVersion: 1",
        "workPacket:",
        "  maxTasksPerPacket:",
        "    docs_state_lite: 3",
        "    local_full_flow: 1",
        "    local_unit_tdd: 1"
    ) | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Get-DocsTaskBlock {
    param([Parameter(Mandatory = $true)][string]$TaskId)

    return @(
        "  - id: $TaskId",
        "    title: $TaskId",
        "    status: pending",
        "    taskKind: docs_only",
        "    executionProfile: docs_state_lite",
        "    validationPolicy: docs_state",
        "    allowedFiles:",
        "      - docs/04-agent-system/state/task-queue.yaml",
        "      - docs/05-execution-logs/evidence/$TaskId.md",
        "      - docs/05-execution-logs/audits-reviews/$TaskId.md",
        "    blockedFiles:",
        "      - .env.*",
        "      - package.json",
        "      - src/**",
        "      - e2e/**",
        "    riskTypes:",
        "      - automation_policy",
        "    validationCommands:",
        "      - git diff --check",
        "    closeoutPolicy:",
        "      localCommit:",
        "        approved: true",
        "        message: `"chore(agent): docs packet smoke`"",
        "      fastForwardMerge:",
        "        approved: false",
        "        targetBranch: master",
        "      push:",
        "        approved: false",
        "        target: origin/master",
        "      cleanup:",
        "        deleteShortBranch: false",
        "    evidencePath: docs/05-execution-logs/evidence/$TaskId.md",
        "    auditReviewPath: docs/05-execution-logs/audits-reviews/$TaskId.md"
    )
}

function Write-Queue {
    param([Parameter(Mandatory = $true)][string]$Path)

    @(
        "schemaVersion: 1",
        "tasks:",
        "  - id: closed-task",
        "    title: closed task",
        "    status: closed",
        "    taskKind: docs_only",
        "    executionProfile: docs_state_lite",
        "    validationPolicy: docs_state",
        "    allowedFiles:",
        "      - docs/04-agent-system/state/task-queue.yaml",
        "    blockedFiles:",
        "      - .env.*",
        "    evidencePath: docs/05-execution-logs/evidence/closed-task.md",
        "    auditReviewPath: docs/05-execution-logs/audits-reviews/closed-task.md",
        (Get-DocsTaskBlock -TaskId "docs-task-a"),
        (Get-DocsTaskBlock -TaskId "docs-task-b"),
        "  - id: product-task",
        "    title: product task",
        "    status: pending",
        "    taskKind: implementation",
        "    executionProfile: local_unit_tdd",
        "    validationPolicy: local_unit",
        "    allowedFiles:",
        "      - src/server/services/example.ts",
        "      - docs/05-execution-logs/evidence/product-task.md",
        "    blockedFiles:",
        "      - .env.*",
        "      - package.json",
        "    riskTypes:",
        "      - local_implementation",
        "    validationCommands:",
        "      - npm.cmd run test:unit -- src/server/services/example.test.ts",
        "    closeoutPolicy:",
        "      localCommit:",
        "        approved: true",
        "    evidencePath: docs/05-execution-logs/evidence/product-task.md",
        "    auditReviewPath: docs/05-execution-logs/audits-reviews/product-task.md",
        "  - id: full-flow-task",
        "    title: full flow task",
        "    status: pending",
        "    taskKind: local_full_flow_validation",
        "    executionProfile: local_full_flow",
        "    validationPolicy: local_full_flow",
        "    allowedFiles:",
        "      - docs/05-execution-logs/evidence/full-flow-task.md",
        "    blockedFiles:",
        "      - .env.*",
        "      - src/**",
        "    riskTypes:",
        "      - local_validation",
        "    validationCommands:",
        "      - npm.cmd run test:e2e -- e2e/example.spec.ts",
        "    closeoutPolicy:",
        "      localCommit:",
        "        approved: true",
        "    evidencePath: docs/05-execution-logs/evidence/full-flow-task.md",
        "    auditReviewPath: docs/05-execution-logs/audits-reviews/full-flow-task.md"
    ) | ForEach-Object {
        if ($_ -is [array]) {
            $_
        } else {
            $_
        }
    } | Set-Content -LiteralPath $Path -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2GuardedGoalPacket.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing guarded goal packet script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-guarded-goal-packet-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot -Force | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $profilePath = Join-Path -Path $fixtureRoot -ChildPath "execution-profiles.yaml"
    $historyPath = Join-Path -Path $fixtureRoot -ChildPath "task-history-index.yaml"

    Write-ProjectState -Path $projectStatePath
    Write-ExecutionProfiles -Path $profilePath
    Write-Queue -Path $queuePath
    "schemaVersion: 1`nentries: []" | Set-Content -LiteralPath $historyPath -Encoding UTF8

    $packetOutput = @(& $scriptPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -ExecutionProfileCatalogPath $profilePath -TaskHistoryIndexPath $historyPath -MaxTasks 2)
    if ($LASTEXITCODE -ne 0) {
        throw "Expected docs/state/audit tasks to be packet-eligible.`n$($packetOutput -join "`n")"
    }
    Assert-Contains -Output $packetOutput -Pattern "guardedGoalPacketDecision: eligible_packet"
    Assert-Contains -Output $packetOutput -Pattern "goalPacketEligibleCount: 2"
    Assert-Contains -Output $packetOutput -Pattern "goalPacketSelectedCount: 2"
    Assert-Contains -Output $packetOutput -Pattern "goalPacketCloseoutMode: docs_state_audit_packet_closeout"

    $productOutput = @(& $scriptPath -TaskId "product-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath -ExecutionProfileCatalogPath $profilePath -TaskHistoryIndexPath $historyPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Product/runtime scope should produce a safe single-task decision.`n$($productOutput -join "`n")"
    }
    Assert-Contains -Output $productOutput -Pattern "guardedGoalPacketDecision: single_task_closeout_required"
    Assert-Contains -Output $productOutput -Pattern "productSourceSingleTaskCloseout: true"

    $fullFlowOutput = @(& $scriptPath -TaskId "full-flow-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath -ExecutionProfileCatalogPath $profilePath -TaskHistoryIndexPath $historyPath)
    if ($LASTEXITCODE -ne 0) {
        throw "local_full_flow should produce a safe single-task decision.`n$($fullFlowOutput -join "`n")"
    }
    Assert-Contains -Output $fullFlowOutput -Pattern "guardedGoalPacketDecision: single_task_only"
    Assert-Contains -Output $fullFlowOutput -Pattern "localFullFlowSingleTaskOnly: true"
} finally {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output "Module Run v2 guarded goal packet smoke passed"
