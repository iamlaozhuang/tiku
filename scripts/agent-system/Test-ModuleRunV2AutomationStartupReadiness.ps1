param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml",

    [Parameter(Mandatory = $false)]
    [string]$LeasePath = "",

    [Parameter(Mandatory = $false)]
    [string]$AutomationWorktreeRoot = "",

    [Parameter(Mandatory = $false)]
    [switch]$SkipLeaseCheck,

    [Parameter(Mandatory = $false)]
    [switch]$SkipWorktreeHygieneCheck,

    [Parameter(Mandatory = $false)]
    [switch]$AllowProtectedBranch
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Add-Finding {
    param([Parameter(Mandatory = $true)][string]$Message)

    $script:findings.Add($Message)
    Write-Output $Message
}

function Write-StartupResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "startupDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $currentId = ""
    $currentLines = New-Object System.Collections.Generic.List[string]

    foreach ($line in $Lines) {
        if ($line -match "^\s+- id:\s+(.+?)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentId)) {
                $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
            }
            $currentId = $Matches[1].Trim()
            $currentLines = New-Object System.Collections.Generic.List[string]
            $currentLines.Add($line)
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId)) {
            $currentLines.Add($line)
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentId)) {
        $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
    }

    return $blocks.ToArray()
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)][object[]]$Blocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($block in $Blocks) {
        if ($block.Id -eq $Id) {
            return $block.Lines
        }
    }

    return @()
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-CurrentTaskId {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            break
        }

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ProjectScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Lines) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-PendingTaskIds {
    param([Parameter(Mandatory = $true)][object[]]$Blocks)

    $pending = New-Object System.Collections.Generic.List[string]
    foreach ($block in $Blocks) {
        $status = Get-ScalarValue -Block $block.Lines -Key "status"
        if ($status -eq "pending") {
            $pending.Add($block.Id)
        }
    }

    return $pending.ToArray()
}

function ConvertTo-FullPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    return [System.IO.Path]::GetFullPath($Path)
}

function Test-GitDirty {
    param([Parameter(Mandatory = $true)][string]$Path)

    $status = @(& git -C $Path status --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return $true
    }

    return $status.Count -gt 0
}

function Test-AutomationWorktreeHygiene {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentWorktree
    )

    if (-not (Test-Path -LiteralPath $Root)) {
        Write-Output "worktreeHygiene: no_automation_worktree_root"
        return
    }

    $rootFullPath = ConvertTo-FullPath -Path $Root
    $currentFullPath = ConvertTo-FullPath -Path $CurrentWorktree
    $originMasterSha = ((& git rev-parse origin/master) -join "").Trim()
    $worktreeOutput = @(& git worktree list --porcelain)
    $worktrees = New-Object System.Collections.Generic.List[object]
    $currentPath = ""
    $currentHead = ""

    foreach ($line in $worktreeOutput) {
        if ($line -match "^worktree\s+(.+)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentPath)) {
                $worktrees.Add([pscustomobject]@{ Path = $currentPath; Head = $currentHead })
            }
            $currentPath = $Matches[1].Trim()
            $currentHead = ""
            continue
        }

        if ($line -match "^HEAD\s+([0-9a-f]+)\s*$") {
            $currentHead = $Matches[1].Trim()
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentPath)) {
        $worktrees.Add([pscustomobject]@{ Path = $currentPath; Head = $currentHead })
    }

    foreach ($worktree in $worktrees) {
        $worktreeFullPath = ConvertTo-FullPath -Path $worktree.Path
        if (-not $worktreeFullPath.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            continue
        }

        if ($worktreeFullPath -eq $currentFullPath) {
            continue
        }

        Write-Output "automationWorktree: $worktreeFullPath"
        Write-Output "automationWorktreeHead: $($worktree.Head)"

        if (Test-GitDirty -Path $worktreeFullPath) {
            Add-Finding "HARD_BLOCK_AUTOMATION_WORKTREE_DIRTY $worktreeFullPath"
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($originMasterSha) -and $worktree.Head -ne $originMasterSha) {
            Add-Finding "HARD_BLOCK_AUTOMATION_WORKTREE_STALE $worktreeFullPath"
        }
    }
}

$findings = New-Object System.Collections.Generic.List[string]

try {
    Write-Section -Title "Module Run v2 Automation Startup Readiness"
    Write-Output "automationStartupMode: hard_block"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            throw "Missing required file: $requiredPath"
        }
    }

    if ([string]::IsNullOrWhiteSpace($AutomationWorktreeRoot)) {
        $AutomationWorktreeRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\worktrees"
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $matrixContent = Get-Content -LiteralPath $MatrixPath -Raw
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    Write-Output "taskId: $TaskId"
    Write-Output "automationWorktreeRoot: $AutomationWorktreeRoot"

    $currentBranch = ((& git branch --show-current) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = "(detached HEAD)"
    }

    Write-Section -Title "Repository"
    Write-Output "branch: $currentBranch"
    if (-not $AllowProtectedBranch -and $currentBranch -in @("master", "main")) {
        Add-Finding "HARD_BLOCK_PROTECTED_BRANCH $currentBranch"
    }

    if (-not $SkipLeaseCheck) {
        $leaseArgs = @(
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            ".\scripts\agent-system\Test-ModuleRunV2AutomationLeaseReadiness.ps1"
        )
        if (-not [string]::IsNullOrWhiteSpace($LeasePath)) {
            $leaseArgs += @("-LeasePath", $LeasePath)
        }
        if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
            $leaseArgs += @("-CurrentTaskId", $TaskId)
        }

        $leaseOutput = @(& powershell.exe @leaseArgs 2>&1)
        $leaseOutput | ForEach-Object { Write-Output $_ }
        if ($LASTEXITCODE -ne 0) {
            if (($leaseOutput -join "`n") -match "automationLeaseDecision:\s*stop_existing_run_active") {
                Write-StartupResult -Decision "stop_existing_run_active" -Reason "automation lease is active" -ExitCode 1
            }
            Write-StartupResult -Decision "stop_for_hard_block" -Reason "automation lease readiness failed" -ExitCode 1
        }
    }

    if (-not $SkipWorktreeHygieneCheck) {
        Write-Section -Title "Worktree Hygiene"
        $currentWorktree = ((& git rev-parse --show-toplevel) -join "").Trim()
        Test-AutomationWorktreeHygiene -Root $AutomationWorktreeRoot -CurrentWorktree $currentWorktree
    }

    $remoteAutomationApproval = Get-ProjectScalar -Lines $projectStateLines -Key "remoteAutomationApproval"
    Write-Section -Title "Project State"
    Write-Output "remoteAutomationApproval: $remoteAutomationApproval"
    if ($remoteAutomationApproval -eq "not_granted" -or [string]::IsNullOrWhiteSpace($remoteAutomationApproval)) {
        Add-Finding "HARD_BLOCK_AUTOMATION_APPROVAL_NOT_GRANTED"
    }

    if ($matrixContent -notmatch "Cost Calibration Gate remains blocked") {
        Add-Finding "HARD_BLOCK_MISSING_COST_CALIBRATION_ANCHOR"
    }

    if ($findings.Count -gt 0) {
        Write-StartupResult -Decision "stop_for_hard_block" -Reason "startup readiness failed with $($findings.Count) finding(s)" -ExitCode 1
    }

    $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
    $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
    $pendingTaskIds = @(Get-PendingTaskIds -Blocks $taskBlocks)

    Write-Section -Title "Queue"
    Write-Output "currentTaskStatus: $taskStatus"
    Write-Output "pendingTaskCount: $($pendingTaskIds.Count)"
    foreach ($pendingTaskId in $pendingTaskIds) {
        Write-Output "pendingTask: $pendingTaskId"
    }

    if ($taskStatus -eq "in_progress") {
        Write-StartupResult -Decision "continue_current_task" -Reason "current task is in progress and startup gates passed" -ExitCode 0
    }

    if ($pendingTaskIds.Count -gt 0) {
        Write-StartupResult -Decision "prepare_next_task" -Reason "pending task is available after startup gates passed" -ExitCode 0
    }

    if ($taskStatus -in @("done", "closed")) {
        Write-StartupResult -Decision "closeout_recovery" -Reason "current task is closed out and no pending task is available" -ExitCode 0
    }

    Write-StartupResult -Decision "no_executable_task" -Reason "no in-progress or pending task is available" -ExitCode 1
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-StartupResult -Decision "stop_for_hard_block" -Reason "startup readiness encountered an error" -ExitCode 1
}
