$ErrorActionPreference = "Stop"

$projectStatePath = "docs\04-agent-system\state\project-state.yaml"

if (-not (Test-Path $projectStatePath)) {
    throw "Missing project state file: $projectStatePath"
}

$projectStateLines = Get-Content -Path $projectStatePath

function Get-TopLevelScalar {
    param(
        [string[]]$Lines,
        [string]$ParentKey,
        [string]$ChildKey
    )

    $isInsideParent = $false
    foreach ($projectStateLine in $Lines) {
        if ($projectStateLine -match "^$ParentKey`:") {
            $isInsideParent = $true
            continue
        }

        if ($isInsideParent -and $projectStateLine -match "^\S") {
            return $null
        }

        if ($isInsideParent -and $projectStateLine -match "^\s+$ChildKey`:\s*(.+)$") {
            return $Matches[1].Trim()
        }
    }

    return $null
}

$currentPhase = Get-TopLevelScalar -Lines $projectStateLines -ParentKey "project" -ChildKey "currentPhase"
$currentTaskId = Get-TopLevelScalar -Lines $projectStateLines -ParentKey "currentTask" -ChildKey "id"
$nextRecommendedAction = Get-TopLevelScalar -Lines $projectStateLines -ParentKey "handoff" -ChildKey "nextRecommendedAction"

Write-Output "State path: $projectStatePath"
Write-Output "Current phase: $currentPhase"
Write-Output "Current task id: $currentTaskId"
Write-Output "Next recommended action: $nextRecommendedAction"
