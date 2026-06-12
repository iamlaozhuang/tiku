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

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern
    )

    $output = @(& $Command 2>&1)
    if ($LASTEXITCODE -eq 0) {
        throw "Expected command to fail, but it exited 0.`n$($output -join "`n")"
    }
    Assert-Contains -Output $output -Pattern $ExpectedPattern
    return $output
}

function Write-ProjectState {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $false)][string]$Status = "closed"
    )

    @(
        "schemaVersion: 1",
        "currentTask:",
        "  id: $TaskId",
        "  status: $Status"
    ) | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-EligibleQueue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    @(
        "schemaVersion: 1",
        "tasks:",
        "  - id: $TaskId",
        "    title: Queue Drain Supervisor Smoke",
        "    status: pending",
        "    taskKind: mechanism_hardening",
        "    humanApproval: User approved bounded queue drain supervisor smoke scope.",
        "    drainPolicy:",
        "      drainEligible: true",
        "      riskProfile: mechanism_low_risk",
        "      validationCostClass: standard",
        "      requiredFreshApproval: false",
        "      maxTasksPerWake: 2",
        "      maxChangedFiles: 20",
        "      maxChangedLines: 800",
        "      autoRepairAllowance: format_lint_evidence_once",
        "    allowedFiles:",
        "      - docs/04-agent-system/state/autodrive-control-schema.yaml",
        "      - docs/04-agent-system/sop/automated-advancement-governance.md",
        "    blockedFiles:",
        "      - .env.local",
        "      - package.json",
        "      - package-lock.json",
        "      - src/db/schema/**",
        "      - drizzle/**",
        "    riskTypes:",
        "      - automation_policy",
        "    validationProfile: mechanism-hardening",
        "    validationCommands:",
        "      - git diff --check",
        "    closeoutPolicy:",
        "      localCommit: approved",
        "      fastForwardMerge:",
        "        approved: true",
        "        targetBranch: master",
        "      push:",
        "        approved: true",
        "        target: origin/master",
        "      cleanup:",
        "        deleteShortBranch: true",
        "        parkWorktree: true",
        "    evidencePath: docs/05-execution-logs/evidence/queue-drain-supervisor-smoke.md",
        "    auditReviewPath: docs/05-execution-logs/audits-reviews/queue-drain-supervisor-smoke.md"
    ) | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-RunnerOutput {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Action,
        [Parameter(Mandatory = $false)][string]$TaskId = "",
        [Parameter(Mandatory = $false)][string]$Fingerprint = ""
    )

    $lines = @(
        "runnerDecision: $Decision",
        "runnerNextAction: $Action",
        "runnerStepCount: 1",
        "stopTaxonomy: runnable"
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $lines += "runnerNextTask: $TaskId"
    }
    if (-not [string]::IsNullOrWhiteSpace($Fingerprint)) {
        $lines += "blockerFingerprint: $Fingerprint"
    }

    $lines | Set-Content -LiteralPath $Path -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2QueueDrainSupervisor.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing queue drain supervisor script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-queue-drain-supervisor-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot -Force | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $manifestRoot = Join-Path -Path $fixtureRoot -ChildPath "drain-runs"
    $runnerOutputPath = Join-Path -Path $fixtureRoot -ChildPath "runner-output.txt"

    Write-ProjectState -Path $projectStatePath -TaskId "closed-task"
    Write-EligibleQueue -Path $queuePath -TaskId "eligible-task"
    Write-RunnerOutput -Path $runnerOutputPath -Decision "prepare_next_task" -Action "agent_claim_next_task" -TaskId "eligible-task"
    $planOutput = @(& $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -PlanOnly)
    if ($LASTEXITCODE -ne 0) {
        throw "PlanOnly supervisor should identify eligible task.`n$($planOutput -join "`n")"
    }
    Assert-Contains -Output $planOutput -Pattern "queueDrainDecision: ready_for_agent_task"
    Assert-Contains -Output $planOutput -Pattern "queueDrainNextTask: eligible-task"
    Assert-Contains -Output $planOutput -Pattern "queueDrainNextAction: agent_execute_task"
    Assert-Contains -Output $planOutput -Pattern "safeToContinueDrain: true"

    $manifestPath = ($planOutput | Where-Object { $_ -match "^queueDrainManifestPath:\s*(.+)\s*$" } | ForEach-Object { $Matches[1].Trim() } | Select-Object -First 1)
    if ([string]::IsNullOrWhiteSpace($manifestPath) -or -not (Test-Path -LiteralPath $manifestPath)) {
        throw "Supervisor did not write repo-external manifest."
    }
    if ($manifestPath -like "$((Get-Location).Path)*") {
        throw "Supervisor manifest was written inside the repository: $manifestPath"
    }

    Write-RunnerOutput -Path $runnerOutputPath -Decision "prepare_next_task" -Action "agent_claim_next_task" -TaskId "eligible-task"
    $budgetOutput = @(& $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -CompletedTaskCount 2 -MaxTasksPerWake 2 -PlanOnly)
    if ($LASTEXITCODE -ne 0) {
        throw "Budget exhaustion should be a controlled zero-exit stop.`n$($budgetOutput -join "`n")"
    }
    Assert-Contains -Output $budgetOutput -Pattern "queueDrainDecision: budget_exhausted"
    Assert-Contains -Output $budgetOutput -Pattern "safeToContinueDrain: false"

    Write-RunnerOutput -Path $runnerOutputPath -Decision "stop_for_hard_block" -Action "report_validation_failure" -Fingerprint "validation:lint"
    Invoke-ExpectFailure -ExpectedPattern "queueDrainDecision: hard_block" -Command {
        & $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -PlanOnly
    } | Out-Null

    Write-RunnerOutput -Path $runnerOutputPath -Decision "open_recovery_plan" -Action "agent_open_recovery_plan" -Fingerprint "same:blocker"
    $firstRecoveryOutput = @(& $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -PlanOnly)
    if ($LASTEXITCODE -ne 0) {
        throw "First recovery should be reported as approval_required/controlled recovery.`n$($firstRecoveryOutput -join "`n")"
    }
    Assert-Contains -Output $firstRecoveryOutput -Pattern "queueDrainDecision: approval_required"

    Invoke-ExpectFailure -ExpectedPattern "queueDrainDecision: hard_block" -Command {
        & $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -PlanOnly
    } | Out-Null

    Write-RunnerOutput -Path $runnerOutputPath -Decision "closeout_recovery" -Action "run_closeout_recovery_autopilot"
    Write-ProjectState -Path $projectStatePath -TaskId "closed-task" -Status "ready_for_closeout"
    $closeoutOutput = @(& $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -PlanOnly)
    if ($LASTEXITCODE -ne 0) {
        throw "Closeout PlanOnly should be a controlled next-action decision.`n$($closeoutOutput -join "`n")"
    }
    Assert-Contains -Output $closeoutOutput -Pattern "queueDrainDecision: ready_for_agent_task"
    Assert-Contains -Output $closeoutOutput -Pattern "queueDrainNextTask: closed-task"
    Assert-Contains -Output $closeoutOutput -Pattern "queueDrainNextAction: run_approved_closeout"

    $diffRepoRoot = Join-Path -Path $fixtureRoot -ChildPath "diff-budget-repo"
    New-Item -ItemType Directory -Path $diffRepoRoot -Force | Out-Null
    & git -C $diffRepoRoot init -q | Out-Null
    "base" | Set-Content -LiteralPath (Join-Path -Path $diffRepoRoot -ChildPath "budget.txt") -Encoding UTF8
    & git -C $diffRepoRoot add budget.txt | Out-Null
    & git -C $diffRepoRoot -c user.email=smoke@example.com -c user.name=smoke commit -m init -q | Out-Null

    Write-RunnerOutput -Path $runnerOutputPath -Decision "prepare_next_task" -Action "agent_claim_next_task" -TaskId "eligible-task"
    1..20 | ForEach-Object { "staged line $_" } | Set-Content -LiteralPath (Join-Path -Path $diffRepoRoot -ChildPath "budget.txt") -Encoding UTF8
    & git -C $diffRepoRoot add budget.txt | Out-Null
    Invoke-ExpectFailure -ExpectedPattern "changed line count exceeds queue drain budget" -Command {
        Push-Location $diffRepoRoot
        try {
            & $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -MaxChangedLines 5
        } finally {
            Pop-Location
        }
    } | Out-Null

    & git -C $diffRepoRoot reset --hard HEAD -q | Out-Null
    1..20 | ForEach-Object { "untracked line $_" } | Set-Content -LiteralPath (Join-Path -Path $diffRepoRoot -ChildPath "untracked-budget.txt") -Encoding UTF8
    Invoke-ExpectFailure -ExpectedPattern "changed line count exceeds queue drain budget" -Command {
        Push-Location $diffRepoRoot
        try {
            & $scriptPath -RunnerOutputPath $runnerOutputPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -RunManifestRoot $manifestRoot -MaxChangedLines 5
        } finally {
            Pop-Location
        }
    } | Out-Null

    $siblingRepoRoot = Join-Path -Path $fixtureRoot -ChildPath "path-prefix-repo"
    $siblingManifestRoot = "$siblingRepoRoot-sibling"
    New-Item -ItemType Directory -Path $siblingRepoRoot -Force | Out-Null
    & git -C $siblingRepoRoot init -q | Out-Null
    $siblingRunnerOutputPath = Join-Path -Path $siblingRepoRoot -ChildPath "runner-output.txt"
    $siblingProjectStatePath = Join-Path -Path $siblingRepoRoot -ChildPath "project-state.yaml"
    $siblingQueuePath = Join-Path -Path $siblingRepoRoot -ChildPath "task-queue.yaml"
    Write-RunnerOutput -Path $siblingRunnerOutputPath -Decision "no_executable_task" -Action "idle_no_pending_task"
    @(
        "schemaVersion: 1",
        "currentTask:",
        "  id: none",
        "  status: closed"
    ) | Set-Content -LiteralPath $siblingProjectStatePath -Encoding UTF8
    @(
        "schemaVersion: 1",
        "tasks:"
    ) | Set-Content -LiteralPath $siblingQueuePath -Encoding UTF8
    Push-Location $siblingRepoRoot
    try {
        $siblingOutput = @(& $scriptPath -RunnerOutputPath $siblingRunnerOutputPath -ProjectStatePath $siblingProjectStatePath -QueuePath $siblingQueuePath -RunManifestRoot $siblingManifestRoot -PlanOnly)
    } finally {
        Pop-Location
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Same-prefix sibling manifest root should be outside the repository.`n$($siblingOutput -join "`n")"
    }
    Assert-Contains -Output $siblingOutput -Pattern "queueDrainDecision: idle"
    $siblingManifestPath = ($siblingOutput | Where-Object { $_ -match "^queueDrainManifestPath:\s*(.+)\s*$" } | ForEach-Object { $Matches[1].Trim() } | Select-Object -First 1)
    if ([string]::IsNullOrWhiteSpace($siblingManifestPath) -or -not (Test-Path -LiteralPath $siblingManifestPath)) {
        throw "Supervisor did not write manifest to same-prefix sibling root."
    }

    Write-Output "Module Run v2 queue drain supervisor smoke passed"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}
