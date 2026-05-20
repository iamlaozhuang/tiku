param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title
    )

    Write-Output ""
    Write-Output "== $Title =="
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Id
    )

    $startIndex = -1
    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+$([regex]::Escape($Id))\s*$") {
            $startIndex = $lineIndex
            break
        }
    }

    if ($startIndex -lt 0) {
        return @()
    }

    $endIndex = $Lines.Count
    for ($lineIndex = $startIndex + 1; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+\S+") {
            $endIndex = $lineIndex
            break
        }
    }

    return $Lines[$startIndex..($endIndex - 1)]
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s+-\s+(.+)\s*$") {
            $values.Add($Matches[1].Trim())
            continue
        }

        if ($insideList -and $line -match "^\s+\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
}

if (-not (Test-Path $QueuePath)) {
    throw "Missing task queue file: $QueuePath"
}

if (-not (Test-Path $ProjectStatePath)) {
    throw "Missing project state file: $ProjectStatePath"
}

$insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
    throw "Task claim readiness must be run inside a Git worktree."
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    $currentBranch = "(detached HEAD)"
}

if ($currentBranch -eq "master" -or $currentBranch -eq "main") {
    throw "Task claim readiness cannot run on protected branch: $currentBranch"
}

$taskQueueLines = @(Get-Content -Path $QueuePath)
$targetTaskBlock = @(Get-TaskBlock -Lines $taskQueueLines -Id $TaskId)
if ($targetTaskBlock.Count -eq 0) {
    throw "Task id not found: $TaskId"
}

$status = Get-ScalarValue -Block $targetTaskBlock -Key "status"
$claimableStatuses = @("pending", "claimed", "implemented", "validated")
if ($claimableStatuses -notcontains $status) {
    throw "Task is not claimable: $TaskId has status $status"
}

$dependencies = @(Get-ListValues -Block $targetTaskBlock -Key "dependencies")
$completedDependencyStatuses = @("done", "closed", "pushed", "merged")
$incompleteDependencies = New-Object System.Collections.Generic.List[string]
foreach ($dependency in $dependencies) {
    $dependencyBlock = @(Get-TaskBlock -Lines $taskQueueLines -Id $dependency)
    if ($dependencyBlock.Count -eq 0) {
        $incompleteDependencies.Add("$dependency (missing)")
        continue
    }

    $dependencyStatus = Get-ScalarValue -Block $dependencyBlock -Key "status"
    if ($completedDependencyStatuses -notcontains $dependencyStatus) {
        $incompleteDependencies.Add("$dependency ($dependencyStatus)")
    }
}

if ($incompleteDependencies.Count -gt 0) {
    throw "Task dependencies are not complete: $($incompleteDependencies -join ', ')"
}

$allowedFiles = @(Get-ListValues -Block $targetTaskBlock -Key "allowedFiles")
$blockedFiles = @(Get-ListValues -Block $targetTaskBlock -Key "blockedFiles")
$riskTypes = @(Get-ListValues -Block $targetTaskBlock -Key "riskTypes")
$validationCommands = @(Get-ListValues -Block $targetTaskBlock -Key "validationCommands")
$taskPlanPolicy = Get-ScalarValue -Block $targetTaskBlock -Key "taskPlanPolicy"
$securityReviewRequired = Get-ScalarValue -Block $targetTaskBlock -Key "securityReviewRequired"

Write-Section -Title "Task"
Write-Output "id: $TaskId"
Write-Output "branch: $currentBranch"
Write-Output "status: $status"
if ([string]::IsNullOrWhiteSpace($taskPlanPolicy)) {
    Write-Output "taskPlanPolicy: missing"
} else {
    Write-Output "taskPlanPolicy: $taskPlanPolicy"
}

Write-Section -Title "Dependencies"
if ($dependencies.Count -eq 0) {
    Write-Output "none"
} else {
    $dependencies | ForEach-Object { Write-Output $_ }
}

Write-Section -Title "Allowed Files"
if ($allowedFiles.Count -eq 0) {
    Write-Output "none"
} else {
    $allowedFiles | ForEach-Object { Write-Output $_ }
}

Write-Section -Title "Blocked Files"
if ($blockedFiles.Count -eq 0) {
    Write-Output "none"
} else {
    $blockedFiles | ForEach-Object { Write-Output $_ }
}

Write-Section -Title "Risk Gates"
if ($riskTypes.Count -eq 0) {
    Write-Output "riskTypes: none"
} else {
    $riskTypes | ForEach-Object { Write-Output "riskType: $_" }
}

if ($securityReviewRequired -eq "true" -or $riskTypes -contains "authorization" -or $riskTypes -contains "api_contract" -or $riskTypes -contains "schema" -or $riskTypes -contains "secret") {
    Write-Output "security review: required or should be evaluated"
} else {
    Write-Output "security review: not triggered by metadata"
}

if ($riskTypes -contains "add_dependency" -or $allowedFiles -contains "package.json" -or $allowedFiles -contains "pnpm-lock.yaml" -or $allowedFiles -contains "package-lock.json") {
    Write-Output "dependency approval: required before package or lockfile changes"
} else {
    Write-Output "dependency approval: not triggered by metadata"
}

Write-Section -Title "Validation Commands"
if ($validationCommands.Count -eq 0) {
    Write-Output "none"
} else {
    $validationCommands | ForEach-Object { Write-Output $_ }
}

Write-Section -Title "Result"
Write-Output "task claim readiness passed"
