param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("local_full_flow_contract_repair", "local_full_flow_validation", "experience_closure_readiness_audit")]
    [string]$TemplateKind,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$TargetExperienceChain = "local-experience",

    [Parameter(Mandatory = $false)]
    [AllowEmptyCollection()]
    [string[]]$UseCaseIds = @(),

    [Parameter(Mandatory = $false)]
    [AllowEmptyCollection()]
    [string[]]$AllowedFiles = @(),

    [Parameter(Mandatory = $false)]
    [AllowEmptyCollection()]
    [string[]]$ReadOnlyAllowedFiles = @(),

    [Parameter(Mandatory = $false)]
    [AllowEmptyCollection()]
    [string[]]$Dependencies = @(),

    [Parameter(Mandatory = $false)]
    [switch]$Apply
)

$ErrorActionPreference = "Stop"

$commonScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "ModuleRunV2.Common.ps1"
if (Test-Path -LiteralPath $commonScriptPath) {
    . $commonScriptPath
}

function Convert-ToYamlList {
    param(
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][string[]]$Values = @(),
        [Parameter(Mandatory = $false)][string]$Indent = "    "
    )

    $lines = New-Object System.Collections.Generic.List[string]
    if ($Values.Count -eq 0) {
        $lines.Add("$Indent${Key}: []")
    } else {
        $lines.Add("$Indent${Key}:")
        foreach ($value in $Values) {
            $lines.Add("$Indent  - $value")
        }
    }

    return $lines.ToArray()
}

function Get-DefaultAllowedFiles {
    param([Parameter(Mandatory = $true)][string]$Kind)

    if ($Kind -eq "local_full_flow_contract_repair") {
        return @()
    }

    return @(
        "docs/04-agent-system/state/local-experience-coverage-matrix.yaml",
        "docs/04-agent-system/state/project-state.yaml",
        "docs/04-agent-system/state/task-queue.yaml",
        "docs/05-execution-logs/task-plans/**",
        "docs/05-execution-logs/evidence/**",
        "docs/05-execution-logs/audits-reviews/**"
    )
}

function Get-TemplateProfile {
    param([Parameter(Mandatory = $true)][string]$Kind)

    switch ($Kind) {
        "local_full_flow_contract_repair" {
            return [pscustomobject]@{
                ExecutionProfile = "local_unit_tdd_plus_scoped_local_full_flow"
                EvidenceMode = "full"
                ValidationPolicy = "local_unit_plus_scoped_local_full_flow"
                TaskKind = "implementation"
                HumanBoundary = "Scoped contract repair task. Product source allowedFiles must be explicit. Provider/model, env/secret, dependency, schema/migration, staging/prod/cloud/deploy/payment/external-service, destructive DB, PR, force-push, and Cost Calibration Gate remain blocked."
            }
        }
        "local_full_flow_validation" {
            return [pscustomobject]@{
                ExecutionProfile = "local_full_flow"
                EvidenceMode = "full"
                ValidationPolicy = "local_full_flow"
                TaskKind = "local_full_flow_validation"
                HumanBoundary = "Localhost-only full-flow validation against existing approved local specs. Product source fixes and high-risk gates remain blocked."
            }
        }
        default {
            return [pscustomobject]@{
                ExecutionProfile = "local_experience_audit"
                EvidenceMode = "full"
                ValidationPolicy = "docs_state"
                TaskKind = "experience_closure_readiness_audit"
                HumanBoundary = "Docs/state closure readiness audit only. It may mark local experience closure only from fresh passing local full-flow evidence and must not claim release readiness."
            }
        }
    }
}

function Add-TaskSeedLines {
    param(
        [Parameter(Mandatory = $true)][System.Collections.Generic.List[string]]$Target,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Lines
    )

    foreach ($line in $Lines) {
        $Target.Add($line)
    }
}

if (-not (Test-Path -LiteralPath $QueuePath)) {
    throw "Missing task queue: $QueuePath"
}

$profile = Get-TemplateProfile -Kind $TemplateKind
$effectiveAllowedFiles = @($AllowedFiles)
if ($effectiveAllowedFiles.Count -eq 0) {
    $effectiveAllowedFiles = @(Get-DefaultAllowedFiles -Kind $TemplateKind)
}

if ($TemplateKind -eq "local_full_flow_contract_repair" -and $effectiveAllowedFiles.Count -eq 0) {
    Write-Output "localExperienceSeedDecision: approval_required"
    Write-Output "taskId: $TaskId"
    Write-Output "templateKind: $TemplateKind"
    Write-Output "reason: repair seed requires explicit product allowedFiles before queue mutation"
    Write-Output "diagnosticOnly: true"
    Write-Output "Cost Calibration Gate remains blocked"
    exit 0
}

$effectiveReadOnlyAllowedFiles = @($ReadOnlyAllowedFiles)
if ($effectiveReadOnlyAllowedFiles.Count -eq 0) {
    $effectiveReadOnlyAllowedFiles = @(
        "AGENTS.md",
        "docs/03-standards/code-taste-ten-commandments.md",
        "docs/02-architecture/adr/**",
        "docs/04-agent-system/operating-manual.md",
        "docs/04-agent-system/state/execution-profiles.yaml"
    )
}

$planPath = "docs/05-execution-logs/task-plans/2026-06-18-$TaskId.md"
$evidencePath = "docs/05-execution-logs/evidence/2026-06-18-$TaskId.md"
$auditPath = "docs/05-execution-logs/audits-reviews/2026-06-18-$TaskId.md"
$taskLines = New-Object System.Collections.Generic.List[string]
$taskLines.Add("  - id: $TaskId")
$taskLines.Add("    title: $($TaskId -replace '-', ' ')")
$taskLines.Add("    phase: $TaskId")
$taskLines.Add("    sourceStory: localExperienceMechanismSeed.$TemplateKind")
Add-TaskSeedLines -Target $taskLines -Lines (Convert-ToYamlList -Key "dependencies" -Values $Dependencies)
$taskLines.Add("    taskPlanPolicy: required_before_edit")
$taskLines.Add("    humanApprovalBoundary: >-")
$taskLines.Add("      $($profile.HumanBoundary)")
$taskLines.Add("    targetExperienceChain: $TargetExperienceChain")
Add-TaskSeedLines -Target $taskLines -Lines (Convert-ToYamlList -Key "useCaseIds" -Values $UseCaseIds)
$taskLines.Add("    executionProfile: $($profile.ExecutionProfile)")
$taskLines.Add("    evidenceMode: $($profile.EvidenceMode)")
$taskLines.Add("    validationPolicy: $($profile.ValidationPolicy)")
$taskLines.Add("    queueSelectionMode: ready_set")
$taskLines.Add("    taskKind: $($profile.TaskKind)")
$taskLines.Add("    moduleRunVersion: 2")
$taskLines.Add("    status: pending")
$taskLines.Add("    capabilities:")
if ($TemplateKind -eq "local_full_flow_validation") {
    $taskLines.Add("      localFullFlowGate: requires_task_scoped_approval")
    $taskLines.Add("      localE2EValidation: requires_existing_specs_approval")
} else {
    $taskLines.Add("      localFullFlowGate: blocked_until_validation_task")
    $taskLines.Add("      localE2EValidation: blocked_until_validation_task")
}
$taskLines.Add("      providerCall: blocked")
$taskLines.Add("      schemaMigration: blocked")
$taskLines.Add("      dependencyIntroduction: blocked")
$taskLines.Add("      costCalibrationGate: blocked")
Add-TaskSeedLines -Target $taskLines -Lines (Convert-ToYamlList -Key "allowedFiles" -Values $effectiveAllowedFiles)
Add-TaskSeedLines -Target $taskLines -Lines (Convert-ToYamlList -Key "readOnlyAllowedFiles" -Values $effectiveReadOnlyAllowedFiles)
$taskLines.Add("    blockedFiles:")
$taskLines.Add("      - .env.local")
$taskLines.Add("      - .env.example")
$taskLines.Add("      - .env.*")
$taskLines.Add("      - package.json")
$taskLines.Add("      - pnpm-lock.yaml")
$taskLines.Add("      - package-lock.yaml")
$taskLines.Add("      - package-lock.json")
$taskLines.Add("      - src/db/schema/**")
$taskLines.Add("      - drizzle/**")
$taskLines.Add("      - playwright-report/**")
$taskLines.Add("      - test-results/**")
$taskLines.Add("    closeoutPolicy:")
$taskLines.Add("      localCommit:")
$taskLines.Add("        approved: false")
$taskLines.Add("      fastForwardMerge:")
$taskLines.Add("        approved: false")
$taskLines.Add("        targetBranch: master")
$taskLines.Add("      push:")
$taskLines.Add("        approved: false")
$taskLines.Add("        target: origin/master")
$taskLines.Add("      cleanup:")
$taskLines.Add("        deleteShortBranch: false")
$taskLines.Add("        parkWorktree: true")
$taskLines.Add("    validationCommands:")
$taskLines.Add("      - git diff --check")
$taskLines.Add("    evidencePath: $evidencePath")
$taskLines.Add("    auditReviewPath: $auditPath")
$taskLines.Add("    planPath: $planPath")
$taskLines.Add("    retryCount: 0")

$queueContent = Get-Content -LiteralPath $QueuePath -Raw
if ($queueContent -match "(?m)^\s+- id:\s+$([regex]::Escape($TaskId))\s*$") {
    Write-Output "localExperienceSeedDecision: already_exists"
    Write-Output "taskId: $TaskId"
    Write-Output "templateKind: $TemplateKind"
    Write-Output "diagnosticOnly: true"
    Write-Output "Cost Calibration Gate remains blocked"
    exit 0
}

Write-Output "localExperienceSeedDecision: $(if ($Apply) { 'applied' } else { 'proposal_available' })"
Write-Output "taskId: $TaskId"
Write-Output "templateKind: $TemplateKind"
Write-Output "targetExperienceChain: $TargetExperienceChain"
Write-Output "useCaseCount: $($UseCaseIds.Count)"
Write-Output "apply: $($Apply.ToString().ToLowerInvariant())"
Write-Output "taskBlock:"
$taskLines | ForEach-Object { Write-Output $_ }
Write-Output "Cost Calibration Gate remains blocked"

if ($Apply) {
    $append = "`r`n" + (($taskLines.ToArray()) -join "`r`n") + "`r`n"
    Add-Content -LiteralPath $QueuePath -Value $append -Encoding UTF8
}
