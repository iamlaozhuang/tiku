param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\local-experience-coverage-matrix.yaml"
)

$ErrorActionPreference = "Stop"

$commonScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "ModuleRunV2.Common.ps1"
if (Test-Path -LiteralPath $commonScriptPath) {
    . $commonScriptPath
}

function Write-LocalExperienceProposal {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $false)][string]$CandidateTaskId = "none",
        [Parameter(Mandatory = $false)][string]$CandidateTaskKind = "none",
        [Parameter(Mandatory = $false)][string]$AffectedUseCaseCount = "0",
        [Parameter(Mandatory = $false)][string[]]$AffectedUseCaseIds = @(),
        [Parameter(Mandatory = $false)][string]$SeedRequired = "false",
        [Parameter(Mandatory = $false)][string]$Reason = "none"
    )

    $useCases = if ($AffectedUseCaseIds.Count -eq 0) { "none" } else { $AffectedUseCaseIds -join "," }
    Write-Output "localExperienceNextTaskDecision: $Decision"
    Write-Output "candidateTaskId: $CandidateTaskId"
    Write-Output "candidateTaskKind: $CandidateTaskKind"
    Write-Output "affectedUseCaseCount: $AffectedUseCaseCount"
    Write-Output "affectedUseCaseIds: $useCases"
    Write-Output "seedRequired: $SeedRequired"
    Write-Output "reason: $Reason"
    Write-Output "diagnosticOnly: true"
    Write-Output "Cost Calibration Gate remains blocked"
}

function Get-RowScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if ($Key -eq "useCaseId" -and $Block -match "(?m)^\s*-\s+useCaseId:\s*(.+?)\s*$") {
        return $Matches[1].Trim().Trim('"').Trim("'")
    }

    if ($Block -match "(?m)^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
        return $Matches[1].Trim().Trim('"').Trim("'")
    }

    return ""
}

function Get-CandidateKind {
    param([Parameter(Mandatory = $true)][string]$TaskId)

    if ($TaskId -match "contract-repair|fixture-contract-repair") {
        return "local_full_flow_contract_repair"
    }

    if ($TaskId -match "local-full-flow-validation") {
        return "local_full_flow_validation"
    }

    if ($TaskId -match "closure-readiness-audit|experience-closure") {
        return "experience_closure_readiness_audit"
    }

    if ($TaskId -match "readiness-audit") {
        return "local_experience_readiness_audit"
    }

    return "local_experience_followup"
}

if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
    Write-LocalExperienceProposal -Decision "unavailable" -Reason "missing project-state"
    exit 0
}

if (-not (Test-Path -LiteralPath $QueuePath)) {
    Write-LocalExperienceProposal -Decision "unavailable" -Reason "missing task queue"
    exit 0
}

if (-not (Test-Path -LiteralPath $MatrixPath)) {
    Write-LocalExperienceProposal -Decision "no_candidate" -Reason "missing local experience coverage matrix"
    exit 0
}

$projectStateContent = Get-Content -LiteralPath $ProjectStatePath -Raw
$queueLines = @(Get-Content -LiteralPath $QueuePath)
$matrixContent = Get-Content -LiteralPath $MatrixPath -Raw
$taskBlocks = if (Get-Command -Name Get-ModuleRunV2TaskBlocks -ErrorAction SilentlyContinue) {
    @(Get-ModuleRunV2TaskBlocks -Lines $queueLines)
} else {
    @()
}

$taskStatusById = @{}
foreach ($taskBlock in $taskBlocks) {
    $status = if (Get-Command -Name Get-ModuleRunV2ScalarValue -ErrorAction SilentlyContinue) {
        Get-ModuleRunV2ScalarValue -Block $taskBlock.Lines -Key "status"
    } else {
        ""
    }
    $taskStatusById[$taskBlock.Id] = $status
}

$candidateGroups = @{}
$rowMatches = [regex]::Matches($matrixContent, "(?ms)^\s+- useCaseId:\s+.*?(?=^\s+- useCaseId:\s+|\z)")
foreach ($rowMatch in $rowMatches) {
    $row = $rowMatch.Value
    $useCaseId = Get-RowScalar -Block $row -Key "useCaseId"
    $status = Get-RowScalar -Block $row -Key "status"
    $nextTask = Get-RowScalar -Block $row -Key "nextTask"

    if ([string]::IsNullOrWhiteSpace($nextTask)) {
        continue
    }

    if ($nextTask -match "^none_" -or $nextTask -match "approval_package_required|release_gate|provider_gate") {
        continue
    }

    if (-not $candidateGroups.ContainsKey($nextTask)) {
        $candidateGroups[$nextTask] = [pscustomobject]@{
            TaskId = $nextTask
            UseCaseIds = New-Object System.Collections.Generic.List[string]
            Statuses = New-Object System.Collections.Generic.List[string]
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($useCaseId)) {
        $candidateGroups[$nextTask].UseCaseIds.Add($useCaseId)
    }
    if (-not [string]::IsNullOrWhiteSpace($status)) {
        $candidateGroups[$nextTask].Statuses.Add($status)
    }
}

if ($candidateGroups.Count -eq 0) {
    Write-LocalExperienceProposal -Decision "no_candidate" -Reason "coverage matrix has no actionable local experience nextTask"
    exit 0
}

$rankedCandidates = foreach ($candidate in $candidateGroups.Values) {
    $taskId = $candidate.TaskId
    $statuses = @($candidate.Statuses)
    $score = $candidate.UseCaseIds.Count * 10
    $reasonParts = New-Object System.Collections.Generic.List[string]
    $reasonParts.Add("coverage_rows=$($candidate.UseCaseIds.Count)")

    if ($projectStateContent -match [regex]::Escape($taskId)) {
        $score += 1000
        $reasonParts.Add("handoff_mentions_candidate")
    }

    if ((Get-CandidateKind -TaskId $taskId) -eq "local_full_flow_contract_repair") {
        $score += 300
        $reasonParts.Add("repair_candidate_priority")
    }

    if ($statuses -contains "local_experience_ready") {
        $score += 100
        $reasonParts.Add("has_local_experience_ready_rows")
    }

    if ($statuses -contains "partial") {
        $score += 10
        $reasonParts.Add("has_partial_rows")
    }

    if ($taskStatusById.ContainsKey($taskId)) {
        $queueStatus = $taskStatusById[$taskId]
        if ($queueStatus -eq "pending") {
            $score += 50
            $reasonParts.Add("task_already_pending")
        } elseif ($queueStatus -in @("closed", "done", "merged", "pushed")) {
            $score -= 100
            $reasonParts.Add("task_already_terminal")
        } else {
            $score += 20
            $reasonParts.Add("task_exists_status_$queueStatus")
        }
    } else {
        $reasonParts.Add("task_not_seeded")
    }

    [pscustomobject]@{
        TaskId = $taskId
        Kind = Get-CandidateKind -TaskId $taskId
        UseCaseIds = @($candidate.UseCaseIds)
        Score = $score
        Reason = ($reasonParts -join ";")
        QueueStatus = if ($taskStatusById.ContainsKey($taskId)) { $taskStatusById[$taskId] } else { "" }
    }
}

$selected = @($rankedCandidates | Sort-Object -Property @{ Expression = "Score"; Descending = $true }, @{ Expression = "TaskId"; Descending = $false } | Select-Object -First 1)
if ($selected.Count -eq 0) {
    Write-LocalExperienceProposal -Decision "no_candidate" -Reason "no ranked candidate"
    exit 0
}

$selectedCandidate = $selected[0]
if ($selectedCandidate.QueueStatus -eq "pending") {
    Write-LocalExperienceProposal `
        -Decision "existing_task_available" `
        -CandidateTaskId $selectedCandidate.TaskId `
        -CandidateTaskKind $selectedCandidate.Kind `
        -AffectedUseCaseCount "$($selectedCandidate.UseCaseIds.Count)" `
        -AffectedUseCaseIds $selectedCandidate.UseCaseIds `
        -SeedRequired "false" `
        -Reason $selectedCandidate.Reason
    exit 0
}

if ([string]::IsNullOrWhiteSpace($selectedCandidate.QueueStatus)) {
    Write-LocalExperienceProposal `
        -Decision "seed_required" `
        -CandidateTaskId $selectedCandidate.TaskId `
        -CandidateTaskKind $selectedCandidate.Kind `
        -AffectedUseCaseCount "$($selectedCandidate.UseCaseIds.Count)" `
        -AffectedUseCaseIds $selectedCandidate.UseCaseIds `
        -SeedRequired "true" `
        -Reason $selectedCandidate.Reason
    exit 0
}

Write-LocalExperienceProposal `
    -Decision "existing_task_blocked_or_nonterminal" `
    -CandidateTaskId $selectedCandidate.TaskId `
    -CandidateTaskKind $selectedCandidate.Kind `
    -AffectedUseCaseCount "$($selectedCandidate.UseCaseIds.Count)" `
    -AffectedUseCaseIds $selectedCandidate.UseCaseIds `
    -SeedRequired "false" `
    -Reason $selectedCandidate.Reason
