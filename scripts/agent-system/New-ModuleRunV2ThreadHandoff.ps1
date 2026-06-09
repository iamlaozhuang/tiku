param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputPath = "docs\05-execution-logs\handoffs\2026-06-08-module-run-v2-autopilot-orchestration-control.md",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$Decision = "require_new_thread",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$Reason = "Module Run closeout completed before the next execution module",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "no-executable-task-seed-or-approve-next-task",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$UserDecisionNeeded = "create_thread may be called only by Codex thread tooling after launch policy approval"
    ,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-IndentedScalar {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Section,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $insideSection = $false
    foreach ($line in $Lines) {
        if ($line -match "^$([regex]::Escape($Section)):\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\S") {
            break
        }

        if ($insideSection -and $line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ProjectPhase {
    param([Parameter(Mandatory = $true)][string[]]$Lines)

    return Get-IndentedScalar -Lines $Lines -Section "project" -Key "currentPhase"
}

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Test-PlaceholderCommitSha {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    return [string]::IsNullOrWhiteSpace($Value) -or
        $Value -eq "null" -or
        $Value -eq "pending-local-commit" -or
        $Value -eq "pending-closeout-commit" -or
        $Value -match "^pending-"
}

if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
    throw "Missing project state file: $ProjectStatePath"
}

$projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
$mode = Get-IndentedScalar -Lines $projectStateLines -Section "automation" -Key "mode"
$phase = Get-ProjectPhase -Lines $projectStateLines
$taskId = Get-IndentedScalar -Lines $projectStateLines -Section "currentTask" -Key "id"
$taskStatus = Get-IndentedScalar -Lines $projectStateLines -Section "currentTask" -Key "status"
$planPath = Get-IndentedScalar -Lines $projectStateLines -Section "currentTask" -Key "planPath"
$evidencePath = Get-IndentedScalar -Lines $projectStateLines -Section "currentTask" -Key "evidencePath"
$branch = Get-IndentedScalar -Lines $projectStateLines -Section "currentTask" -Key "branch"
$commitSha = Get-IndentedScalar -Lines $projectStateLines -Section "currentTask" -Key "commitSha"
$fallbackCommitSha = "not_used"

if ([string]::IsNullOrWhiteSpace($branch)) {
    $branch = ((& git branch --show-current) -join "").Trim()
}

if (Test-PlaceholderCommitSha -Value $commitSha) {
    $commitSha = ((& git rev-parse HEAD) -join "").Trim()
    $fallbackCommitSha = "git_head"
}

$gitStatus = ((& git status --short --branch) -join " | ").Trim()
$auditReviewPath = $evidencePath -replace "/evidence/", "/audits-reviews/"
$auditReviewPath = $auditReviewPath -replace "\\evidence\\", "\audits-reviews\"

$handoffContent = @"
# Module Run v2 Autopilot Thread Handoff

thread rollover handoff:
decision: $Decision
reason: $Reason
mode: $mode
phase: $phase
task: $taskId
task status: $taskStatus
branch: $branch
commit: $commitSha
latest task plan: $planPath
latest evidence: $evidencePath
latest audit review: $auditReviewPath
blocked gates: Cost Calibration Gate remains blocked; provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, and migration remain blocked.
allowed next task: proposal-only recovery audit and Module Run v2 plan for $NextModuleRunCandidate
forbidden scope: business implementation, provider/env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost Calibration Gate execution
validation: receiving thread must rerun recovery audit, unattended readiness, thread launch policy, and relevant closeout gates before implementation
git state: $gitStatus
read order: AGENTS.md -> docs/03-standards/code-taste-ten-commandments.md -> docs/02-architecture/adr/ -> docs/04-agent-system/state/project-state.yaml -> docs/04-agent-system/state/task-queue.yaml -> latest task plan -> latest evidence -> latest audit review -> relevant SOPs
nextModuleRunCandidate: $NextModuleRunCandidate
thread tools: use create_thread for a new Codex thread, then send_message_to_thread only with this handoff content and no secrets
user decision needed: $UserDecisionNeeded

Cost Calibration Gate remains blocked.
"@

$handoffGeneratorMode = "wrote"
if ($DryRun) {
    $handoffGeneratorMode = "dry_run"
} else {
    $outputDirectory = Split-Path -Path $OutputPath -Parent
    if (-not [string]::IsNullOrWhiteSpace($outputDirectory) -and -not (Test-Path -LiteralPath $outputDirectory)) {
        New-Item -ItemType Directory -Path $outputDirectory | Out-Null
    }

    Set-Content -LiteralPath $OutputPath -Value $handoffContent -Encoding UTF8
}

Write-Section -Title "Module Run v2 Thread Handoff"
Write-Output "handoffGenerator: $handoffGeneratorMode"
Write-Output "handoffPath: $OutputPath"
Write-Output "threadRolloverDecision: $Decision"
Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
Write-Output "fallbackCommitSha: $fallbackCommitSha"
Write-Output "threadToolHint: create_thread"
Write-Output "threadToolHint: send_message_to_thread"
Write-Output "Cost Calibration Gate remains blocked"
