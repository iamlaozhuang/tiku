$ErrorActionPreference = "Stop"

$scriptRoot = $PSScriptRoot
$executorScriptPath = Join-Path -Path $scriptRoot -ChildPath "Invoke-ModuleRunV2ParallelCoordinatorExecutor.ps1"
if (-not (Test-Path -LiteralPath $executorScriptPath)) {
    throw "Missing parallel coordinator executor script"
}

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $text = $Output -join "`n"
    if ($text -notmatch $Pattern) {
        throw "Expected pattern not found: $Pattern`n$text"
    }
}

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& $Command 2>&1)
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($exitCode -eq 0) {
        throw "Expected command failure but it passed.`n$($output -join "`n")"
    }
    Assert-Contains -Output $output -Pattern $ExpectedPattern
    return $output
}

function New-SmokeRoot {
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-parallel-coordinator-executor-smoke-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root | Out-Null
    return $root
}

function Write-SmokeFiles {
    param([Parameter(Mandatory = $true)][string]$Root)

    $statePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"

    @"
schemaVersion: 1
currentTask:
  id: coordinator-task
"@ | Set-Content -LiteralPath $statePath -Encoding UTF8

    @"
schemaVersion: 1
tasks: []
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    return [pscustomobject]@{
        StatePath = $statePath
        QueuePath = $queuePath
    }
}

function Write-ReadinessOutput {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $path = Join-Path -Path $Root -ChildPath "$Name.txt"
    $Content | Set-Content -LiteralPath $path -Encoding UTF8
    return $path
}

$smokeRoot = New-SmokeRoot
try {
    $files = Write-SmokeFiles -Root $smokeRoot

    $canAssignPath = Write-ReadinessOutput -Root $smokeRoot -Name "can-assign" -Content @"
parallelDecision: can_assign_workers
reason: candidate tasks are isolated and file locks do not overlap
taskReadiness: docs-worker-a docs_isolated
taskReadiness: docs-worker-b docs_isolated
fileLock: docs-worker-a docs/04-agent-system/sop/worker-a.md
fileLock: docs-worker-b docs/04-agent-system/sop/worker-b.md
Cost Calibration Gate remains blocked
"@
    $canAssignOutput = @(
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $executorScriptPath `
            -ProjectStatePath $files.StatePath `
            -QueuePath $files.QueuePath `
            -ParallelReadinessOutputPath $canAssignPath `
            -CoordinatorTaskId "coordinator-task"
    )
    if ($LASTEXITCODE -ne 0) {
        throw "Can-assign fixture failed.`n$($canAssignOutput -join "`n")"
    }
    Assert-Contains -Output $canAssignOutput -Pattern "parallelCoordinatorDecision: assignment_manifest_ready"
    Assert-Contains -Output $canAssignOutput -Pattern "workerAssignmentManifest: begin"
    Assert-Contains -Output $canAssignOutput -Pattern "workerAssignmentManifest: task=docs-worker-a"
    Assert-Contains -Output $canAssignOutput -Pattern "fileLock: task=docs-worker-b; path=docs/04-agent-system/sop/worker-b.md"
    Assert-Contains -Output $canAssignOutput -Pattern "serialIntegration: coordinator_serial_merge_required"

    $serialPath = Write-ReadinessOutput -Root $smokeRoot -Name "serial" -Content @"
parallelDecision: use_serial_execution
reason: durable parallel approval schema is missing
Cost Calibration Gate remains blocked
"@
    $serialOutput = @(
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $executorScriptPath `
            -ProjectStatePath $files.StatePath `
            -QueuePath $files.QueuePath `
            -ParallelReadinessOutputPath $serialPath
    )
    if ($LASTEXITCODE -ne 0) {
        throw "Serial fallback fixture failed.`n$($serialOutput -join "`n")"
    }
    Assert-Contains -Output $serialOutput -Pattern "parallelCoordinatorDecision: use_serial_execution"
    Assert-Contains -Output $serialOutput -Pattern "workerAssignmentManifest: not_created"

    $conflictPath = Write-ReadinessOutput -Root $smokeRoot -Name "conflict" -Content @"
parallelDecision: stop_for_file_lock_conflict
reason: candidate file locks overlap
FILE_LOCK_CONFLICT docs-worker-a docs/shared.md docs-worker-b docs/shared.md
Cost Calibration Gate remains blocked
"@
    Invoke-ExpectFailure -ExpectedPattern "parallelCoordinatorDecision: stop_for_file_lock_conflict" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $executorScriptPath `
            -ProjectStatePath $files.StatePath `
            -QueuePath $files.QueuePath `
            -ParallelReadinessOutputPath $conflictPath
    } | Out-Null

    $blockedPath = Write-ReadinessOutput -Root $smokeRoot -Name "blocked" -Content @"
parallelDecision: stop_for_blocked_gate
reason: candidate task requires a blocked gate
BLOCKED_GATE_TASK provider-worker blocked risk gate: provider
Cost Calibration Gate remains blocked
"@
    Invoke-ExpectFailure -ExpectedPattern "parallelCoordinatorDecision: stop_for_blocked_gate" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $executorScriptPath `
            -ProjectStatePath $files.StatePath `
            -QueuePath $files.QueuePath `
            -ParallelReadinessOutputPath $blockedPath
    } | Out-Null

    Write-Output "Module Run v2 parallel coordinator executor smoke passed"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        $resolvedSmokeRoot = (Resolve-Path -LiteralPath $smokeRoot).Path
        $resolvedTempRoot = (Resolve-Path -LiteralPath ([System.IO.Path]::GetTempPath())).Path
        if (-not $resolvedSmokeRoot.StartsWith($resolvedTempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to remove smoke root outside temp: $resolvedSmokeRoot"
        }
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
