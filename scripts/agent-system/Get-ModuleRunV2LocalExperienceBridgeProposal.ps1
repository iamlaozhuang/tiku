param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Write-BridgeProposalResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "bridgeProposalDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Remove-ValueQuotes {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    $trimmedValue = $Value.Trim()
    if ($trimmedValue.Length -ge 2) {
        $firstChar = $trimmedValue.Substring(0, 1)
        $lastChar = $trimmedValue.Substring($trimmedValue.Length - 1, 1)
        if (($firstChar -eq '"' -and $lastChar -eq '"') -or ($firstChar -eq "'" -and $lastChar -eq "'")) {
            return $trimmedValue.Substring(1, $trimmedValue.Length - 2)
        }
    }

    return $trimmedValue
}

function Get-TaskStatusMap {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $map = @{}
    $currentId = ""
    foreach ($line in $Lines) {
        if ($line -match "^\s+- id:\s+(.+?)\s*$") {
            $currentId = Remove-ValueQuotes -Value $Matches[1]
            if (-not $map.ContainsKey($currentId)) {
                $map[$currentId] = ""
            }
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId) -and $line -match "^\s+status:\s*(.+?)\s*$") {
            $map[$currentId] = Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return $map
}

function Test-TerminalTaskStatus {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Status)

    return $Status -in @("done", "closed", "pushed", "merged", "local_verified", "metadata_only")
}

function Get-BridgePlan {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $insidePlan = $false
    $insideBridgeSequence = $false
    $insideBlockedList = $false
    $currentChain = ""
    $candidates = New-Object System.Collections.Generic.List[object]
    $currentCandidate = $null

    foreach ($line in $Lines) {
        if (-not $insidePlan -and $line -match "^\s+acceptanceBridgePlan:\s*$") {
            $insidePlan = $true
            continue
        }

        if (-not $insidePlan) {
            continue
        }

        if ($line -match "^\S") {
            break
        }

        if ($line -match "^\s{4}currentPriorityChain:\s*(.+?)\s*$") {
            $currentChain = Remove-ValueQuotes -Value $Matches[1]
            continue
        }

        if ($line -match "^\s{4}bridgeSequence:\s*$") {
            $insideBridgeSequence = $true
            continue
        }

        if ($insideBridgeSequence -and $line -match "^\s{4}hardBlocks:\s*$") {
            $insideBridgeSequence = $false
            $insideBlockedList = $false
            continue
        }

        if (-not $insideBridgeSequence) {
            continue
        }

        if ($line -match "^\s{6}- step:\s*(.+?)\s*$") {
            if ($null -ne $currentCandidate) {
                $candidates.Add($currentCandidate)
            }
            $currentCandidate = [pscustomobject]@{
                Step = Remove-ValueQuotes -Value $Matches[1]
                TargetLocalFullLoopGate = ""
                CandidateTask = ""
                ApprovalRequired = ""
                BlockedUntilApproved = New-Object System.Collections.Generic.List[string]
            }
            $insideBlockedList = $false
            continue
        }

        if ($null -eq $currentCandidate) {
            continue
        }

        if ($line -match "^\s{8}targetLocalFullLoopGate:\s*(.+?)\s*$") {
            $currentCandidate.TargetLocalFullLoopGate = Remove-ValueQuotes -Value $Matches[1]
            $insideBlockedList = $false
            continue
        }

        if ($line -match "^\s{8}candidateTask:\s*(.+?)\s*$") {
            $currentCandidate.CandidateTask = Remove-ValueQuotes -Value $Matches[1]
            $insideBlockedList = $false
            continue
        }

        if ($line -match "^\s{8}approvalRequired:\s*(.+?)\s*$") {
            $currentCandidate.ApprovalRequired = Remove-ValueQuotes -Value $Matches[1]
            $insideBlockedList = $false
            continue
        }

        if ($line -match "^\s{8}blockedUntilApproved:\s*$") {
            $insideBlockedList = $true
            continue
        }

        if ($insideBlockedList -and $line -match "^\s{10}-\s+(.+?)\s*$") {
            $currentCandidate.BlockedUntilApproved.Add((Remove-ValueQuotes -Value $Matches[1]))
            continue
        }

        if ($insideBlockedList -and $line -match "^\s{8}\S") {
            $insideBlockedList = $false
        }
    }

    if ($null -ne $currentCandidate) {
        $candidates.Add($currentCandidate)
    }

    return [pscustomobject]@{
        CurrentPriorityChain = $currentChain
        Candidates = $candidates.ToArray()
    }
}

try {
    Write-Section -Title "Module Run v2 Local Experience Bridge Proposal"
    Write-Output "bridgeProposalMode: read_only"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Write-Output "HARD_BLOCK_MISSING_FILE $requiredPath"
            Write-BridgeProposalResult -Decision "stop_for_hard_block" -Reason "required durable file is missing" -ExitCode 1
        }
    }

    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $matrixLines = @(Get-Content -LiteralPath $MatrixPath)
    $matrixContent = $matrixLines -join "`n"

    if ($matrixContent -notmatch "localExperienceClosureGate\s*:" -or
        $matrixContent -notmatch "acceptanceBridgePlan\s*:" -or
        $matrixContent -notmatch "Cost Calibration Gate remains blocked") {
        Write-Output "HARD_BLOCK_MATRIX_BRIDGE_ANCHOR_MISSING"
        Write-BridgeProposalResult -Decision "stop_for_hard_block" -Reason "matrix is missing local experience bridge anchors" -ExitCode 1
    }

    $taskStatusMap = Get-TaskStatusMap -Lines $queueLines
    $bridgePlan = Get-BridgePlan -Lines $matrixLines
    $candidateCount = @($bridgePlan.Candidates).Count

    Write-Section -Title "Bridge Plan"
    Write-Output "bridgeExperienceChain: $(if ([string]::IsNullOrWhiteSpace($bridgePlan.CurrentPriorityChain)) { "none" } else { $bridgePlan.CurrentPriorityChain })"
    Write-Output "bridgeCandidateCount: $candidateCount"

    if ($candidateCount -eq 0) {
        Write-BridgeProposalResult -Decision "no_bridge_candidate" -Reason "acceptance bridge plan has no candidate tasks" -ExitCode 0
    }

    foreach ($candidate in $bridgePlan.Candidates) {
        if ([string]::IsNullOrWhiteSpace($candidate.CandidateTask)) {
            continue
        }

        $candidateStatus = if ($taskStatusMap.ContainsKey($candidate.CandidateTask)) { $taskStatusMap[$candidate.CandidateTask] } else { "" }
        if (Test-TerminalTaskStatus -Status $candidateStatus) {
            Write-Output "bridgeCandidateAlreadyComplete: $($candidate.CandidateTask)"
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($candidateStatus)) {
            Write-Section -Title "Bridge Candidate"
            Write-Output "bridgeExperienceChain: $($bridgePlan.CurrentPriorityChain)"
            Write-Output "bridgeStep: $($candidate.Step)"
            Write-Output "bridgeCandidateTask: $($candidate.CandidateTask)"
            Write-Output "bridgeCandidateStatus: $candidateStatus"
            Write-Output "bridgeTargetLocalFullLoopGate: $($candidate.TargetLocalFullLoopGate)"
            Write-Output "bridgeRequiredApproval: $($candidate.ApprovalRequired)"
            Write-Output "bridgeBlockedUntilApproved: $($candidate.BlockedUntilApproved.ToArray() -join "; ")"
            Write-BridgeProposalResult -Decision "executable_task_exists" -Reason "bridge candidate already exists in queue state" -ExitCode 0
        }

        Write-Section -Title "Bridge Candidate"
        Write-Output "bridgeExperienceChain: $($bridgePlan.CurrentPriorityChain)"
        Write-Output "bridgeStep: $($candidate.Step)"
        Write-Output "bridgeCandidateTask: $($candidate.CandidateTask)"
        Write-Output "bridgeTargetLocalFullLoopGate: $($candidate.TargetLocalFullLoopGate)"
        Write-Output "bridgeRequiredApproval: $($candidate.ApprovalRequired)"
        Write-Output "bridgeBlockedUntilApproved: $($candidate.BlockedUntilApproved.ToArray() -join "; ")"
        Write-BridgeProposalResult -Decision "proposal_available" -Reason "local experience bridge proposal is available" -ExitCode 0
    }

    Write-BridgeProposalResult -Decision "no_bridge_candidate" -Reason "all bridge candidates are terminal" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-BridgeProposalResult -Decision "stop_for_hard_block" -Reason "local experience bridge proposal script encountered an error" -ExitCode 1
}
