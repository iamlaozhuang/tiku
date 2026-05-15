param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $true)]
    [ValidateSet("pending", "in_progress", "blocked", "done")]
    [string]$Status
)

$ErrorActionPreference = "Stop"

$taskQueuePath = "docs\04-agent-system\state\task-queue.yaml"

if (-not (Test-Path $taskQueuePath)) {
    throw "Missing task queue file: $taskQueuePath"
}

$taskQueueLines = Get-Content -Path $taskQueuePath
$updatedTaskQueueLines = New-Object System.Collections.Generic.List[string]
$isInsideTargetTask = $false
$hasFoundTask = $false
$hasUpdatedStatus = $false

foreach ($taskQueueLine in $taskQueueLines) {
    if ($taskQueueLine -match "^\s+- id:\s+(.+)$") {
        $currentTaskId = $Matches[1].Trim()
        $isInsideTargetTask = ($currentTaskId -eq $TaskId)
        if ($isInsideTargetTask) {
            $hasFoundTask = $true
        }
    }

    if ($isInsideTargetTask -and $taskQueueLine -match "^\s+status:\s+\S+\s*$") {
        $updatedTaskQueueLines.Add("    status: $Status")
        $hasUpdatedStatus = $true
        continue
    }

    $updatedTaskQueueLines.Add($taskQueueLine)
}

if (-not $hasFoundTask) {
    throw "Task id not found: $TaskId"
}

if (-not $hasUpdatedStatus) {
    throw "Status line not found for task id: $TaskId"
}

Set-Content -Path $taskQueuePath -Value $updatedTaskQueueLines -Encoding UTF8
Write-Output "Updated task status: $TaskId -> $Status"
