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
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    @(
        "schemaVersion: 1",
        "currentTask:",
        "  id: $TaskId",
        "  status: closed"
    ) | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-Queue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $false)][switch]$IncludeDrainPolicy,
        [Parameter(Mandatory = $false)][string]$RiskProfile = "mechanism_low_risk",
        [Parameter(Mandatory = $false)][string]$TaskKind = "mechanism_hardening",
        [Parameter(Mandatory = $false)][string[]]$RiskTypes = @("automation_policy"),
        [Parameter(Mandatory = $false)][string]$RequiredFreshApproval = "false",
        [Parameter(Mandatory = $false)][switch]$IncludeNestedTaskLocalId
    )

    $drainPolicy = @()
    if ($IncludeDrainPolicy) {
        $drainPolicy = @(
            "    drainPolicy:",
            "      drainEligible: true",
            "      riskProfile: $RiskProfile",
            "      validationCostClass: standard",
            "      requiredFreshApproval: $RequiredFreshApproval",
            "      maxTasksPerWake: 2",
            "      maxChangedFiles: 20",
            "      maxChangedLines: 800",
            "      autoRepairAllowance: format_lint_evidence_once"
        )
    }

    $nestedTaskLocalId = @()
    if ($IncludeNestedTaskLocalId) {
        $nestedTaskLocalId = @(
            "    reviewOutputs:",
            "      - id: nested-review-output",
            "        status: complete"
        )
    }

    $riskTypeLines = @($RiskTypes | ForEach-Object { "      - $_" })
    $allowedFileLines = if ($TaskKind -eq "implementation") {
        @(
            "      - src/server/models/**",
            "      - src/server/contracts/**",
            "      - src/server/validators/**",
            "      - src/server/services/**",
            "      - docs/04-agent-system/state/project-state.yaml",
            "      - docs/04-agent-system/state/task-queue.yaml",
            "      - docs/05-execution-logs/task-plans/**",
            "      - docs/05-execution-logs/evidence/**",
            "      - docs/05-execution-logs/audits-reviews/**"
        )
    } else {
        @(
            "      - docs/04-agent-system/state/autodrive-control-schema.yaml",
            "      - docs/04-agent-system/sop/automated-advancement-governance.md"
        )
    }

    @(
        "schemaVersion: 1",
        "tasks:",
        "  - id: $TaskId",
        "    title: Queue Drain Smoke",
        "    status: pending",
        "    taskKind: $TaskKind",
        "    humanApproval: autoDriveLocalImplementationApproval: user-approved low-risk local implementation drain smoke. standingUnattendedLocalCloseoutApproval: user-approved local closeout smoke.",
        $drainPolicy,
        $nestedTaskLocalId,
        "    allowedFiles:",
        $allowedFileLines,
        "    blockedFiles:",
        "      - .env.local",
        "      - .env.example",
        "      - package.json",
        "      - pnpm-lock.yaml",
        "      - package-lock.json",
        "      - src/db/schema/**",
        "      - drizzle/**",
        "    riskTypes:",
        $riskTypeLines,
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
        "    evidencePath: docs/05-execution-logs/evidence/queue-drain-smoke.md",
        "    auditReviewPath: docs/05-execution-logs/audits-reviews/queue-drain-smoke.md"
    ) | Set-Content -LiteralPath $Path -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2QueueDrainEligibility.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing queue drain eligibility script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-queue-drain-eligibility-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot -Force | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"

    Write-ProjectState -Path $projectStatePath -TaskId "eligible-task"
    Write-Queue -Path $queuePath -TaskId "eligible-task" -IncludeDrainPolicy
    $eligibleOutput = @(& $scriptPath -TaskId "eligible-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath -MaxTasksPerWake 2)
    if ($LASTEXITCODE -ne 0) {
        throw "Expected eligible task to pass.`n$($eligibleOutput -join "`n")"
    }
    Assert-Contains -Output $eligibleOutput -Pattern "queueDrainEligibilityDecision: eligible"
    Assert-Contains -Output $eligibleOutput -Pattern "drainRiskProfile: mechanism_low_risk"
    Assert-Contains -Output $eligibleOutput -Pattern "maxTasksThisWake: 2"

    Write-Queue -Path $queuePath -TaskId "nested-id-task" -IncludeDrainPolicy -IncludeNestedTaskLocalId
    $nestedOutput = @(& $scriptPath -TaskId "nested-id-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath -MaxTasksPerWake 2)
    if ($LASTEXITCODE -ne 0) {
        throw "Nested task-local - id entries must not truncate the task block.`n$($nestedOutput -join "`n")"
    }
    Assert-Contains -Output $nestedOutput -Pattern "queueDrainEligibilityDecision: eligible"

    Write-Queue -Path $queuePath -TaskId "missing-policy-task" -TaskKind "mechanism_hardening"
    $missingPolicyOutput = @(& $scriptPath -TaskId "missing-policy-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath)
    if ($LASTEXITCODE -ne 0) {
        throw "Missing drainPolicy should be a safe non-error no-drain decision.`n$($missingPolicyOutput -join "`n")"
    }
    Assert-Contains -Output $missingPolicyOutput -Pattern "queueDrainEligibilityDecision: not_eligible"

    Write-Queue -Path $queuePath -TaskId "code-task" -IncludeDrainPolicy -RiskProfile "low_risk_local_code" -TaskKind "implementation" -RiskTypes @("local_implementation", "local_validation", "evidence_redaction", "automation_policy")
    $codeOutput = @(& $scriptPath -TaskId "code-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath)
    if ($LASTEXITCODE -ne 0) {
        throw "Low-risk local code should be eligible for bounded queue drain.`n$($codeOutput -join "`n")"
    }
    Assert-Contains -Output $codeOutput -Pattern "queueDrainEligibilityDecision: eligible"
    Assert-Contains -Output $codeOutput -Pattern "drainRiskProfile: low_risk_local_code"

    Write-Queue -Path $queuePath -TaskId "implicit-code-task" -TaskKind "implementation" -RiskTypes @("local_implementation", "local_validation", "evidence_redaction", "automation_policy")
    $implicitCodeOutput = @(& $scriptPath -TaskId "implicit-code-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath)
    if ($LASTEXITCODE -ne 0) {
        throw "Low-risk implementation tasks without explicit drainPolicy should synthesize default eligibility.`n$($implicitCodeOutput -join "`n")"
    }
    Assert-Contains -Output $implicitCodeOutput -Pattern "queueDrainEligibilityDecision: eligible"
    Assert-Contains -Output $implicitCodeOutput -Pattern "drainRiskProfile: low_risk_local_code"

    Write-Queue -Path $queuePath -TaskId "high-risk-task" -IncludeDrainPolicy -RiskTypes @("automation_policy", "env_secret")
    Invoke-ExpectFailure -ExpectedPattern "queueDrainEligibilityDecision: stop_for_hard_block" -Command {
        & $scriptPath -TaskId "high-risk-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath
    } | Out-Null

    Write-Queue -Path $queuePath -TaskId "quoted-high-risk-task" -IncludeDrainPolicy -RiskTypes @("automation_policy", '"env_secret"')
    Invoke-ExpectFailure -ExpectedPattern "queueDrainEligibilityDecision: stop_for_hard_block" -Command {
        & $scriptPath -TaskId "quoted-high-risk-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath
    } | Out-Null

    Write-Queue -Path $queuePath -TaskId "commented-high-risk-task" -IncludeDrainPolicy -RiskTypes @("automation_policy", "env_secret # local secret risk")
    Invoke-ExpectFailure -ExpectedPattern "queueDrainEligibilityDecision: stop_for_hard_block" -Command {
        & $scriptPath -TaskId "commented-high-risk-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath
    } | Out-Null

    Write-Queue -Path $queuePath -TaskId "fresh-approval-task" -IncludeDrainPolicy -RequiredFreshApproval "true"
    Invoke-ExpectFailure -ExpectedPattern "queueDrainEligibilityDecision: stop_for_hard_block" -Command {
        & $scriptPath -TaskId "fresh-approval-task" -ProjectStatePath $projectStatePath -QueuePath $queuePath
    } | Out-Null

    Write-Output "Module Run v2 queue drain eligibility smoke passed"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}
