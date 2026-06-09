$ErrorActionPreference = "Stop"

$scriptRoot = $PSScriptRoot
$executorScriptPath = Join-Path -Path $scriptRoot -ChildPath "Invoke-ModuleRunV2SerialAutodriveExecutor.ps1"
if (-not (Test-Path -LiteralPath $executorScriptPath)) {
    throw "Missing serial autodrive executor script"
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

function Invoke-SerialExecutor {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$SchemaPath,
        [Parameter(Mandatory = $false)][string]$TaskId = "",
        [Parameter(Mandatory = $false)][string]$Action = "",
        [Parameter(Mandatory = $false)][string]$ActionTask = "",
        [Parameter(Mandatory = $false)][string]$DispatcherOutputPath = "",
        [Parameter(Mandatory = $false)][switch]$Execute,
        [Parameter(Mandatory = $false)][switch]$RunValidation
    )

    $arguments = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $executorScriptPath,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-SchemaPath",
        $SchemaPath,
        "-AllowProtectedBranch"
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $arguments += @("-TaskId", $TaskId)
    }
    if (-not [string]::IsNullOrWhiteSpace($Action)) {
        $arguments += @("-AgentActionOverride", $Action)
    }
    if (-not [string]::IsNullOrWhiteSpace($ActionTask)) {
        $arguments += @("-AgentActionTaskOverride", $ActionTask)
    }
    if (-not [string]::IsNullOrWhiteSpace($DispatcherOutputPath)) {
        $arguments += @("-DispatcherOutputPath", $DispatcherOutputPath)
    }
    if ($Execute) {
        $arguments += "-Execute"
    }
    if ($RunValidation) {
        $arguments += "-RunValidation"
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& powershell.exe @arguments 2>&1)
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    return [pscustomobject]@{
        Output = $output
        ExitCode = $exitCode
    }
}

function New-SmokeRoot {
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-serial-autodrive-executor-smoke-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root | Out-Null
    return $root
}

function Write-SmokeFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $false)][string]$CurrentStatus = "in_progress",
        [Parameter(Mandatory = $false)][string]$NextStatus = "pending",
        [Parameter(Mandatory = $false)][string]$NextDependencies = "",
        [Parameter(Mandatory = $false)][string]$ValidationCommand = "powershell.exe -NoProfile -Command `"Write-Output safe-validation`"",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$ValidationLifecycleBlock = ""
    )

    $caseRoot = Join-Path -Path $Root -ChildPath ("case-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $caseRoot | Out-Null
    $statePath = Join-Path -Path $caseRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $caseRoot -ChildPath "task-queue.yaml"
    $schemaPath = Join-Path -Path $caseRoot -ChildPath "autodrive-control-schema.yaml"

    @"
schemaVersion: 1
project:
  currentPhase: current-task
updatedAt: "2026-06-09T00:00:00-07:00"
currentTask:
  id: current-task
  status: $CurrentStatus
"@ | Set-Content -LiteralPath $statePath -Encoding UTF8

    $nextDependencyBlock = if ([string]::IsNullOrWhiteSpace($NextDependencies)) {
        "    dependencies: []"
    } else {
        @"
    dependencies:
      - $NextDependencies
"@
    }

    @"
schemaVersion: 1
tasks:
  - id: current-task
    title: Current Task
    phase: current-task
    sourceStory: smoke
    dependencies: []
    taskPlanPolicy: required
    humanApproval: smoke approval
    closeoutPolicy:
      localCommit: approved
      fastForwardMerge:
        approved: false
        targetBranch: master
      push:
        approved: false
        target: origin/master
      cleanup:
        deleteShortBranch: false
        parkWorktree: false
    autodrivePolicy:
      mode: guarded_serial
      allowedAgentActions:
        - continue_task
        - claim_task
        - run_validation
        - write_evidence
        - local_commit
        - run_closeout_recovery
      blockedAgentActions:
        - merge
        - push
        - pr
        - deploy
        - dependency_change
        - schema_migration
        - env_secret
        - provider_call
        - cost_calibration_gate
      maxAutonomousSteps: 3
      stopOn:
        - hard_block
        - blocked_gate
        - validation_failure
        - out_of_scope_change
        - dirty_unknown_worktree
        - active_owner_present
    capabilities:
      localDockerDatabase: task_approval_required
      projectResourceRead: task_approval_required
      providerKey: env_destination_confirmation_required
      providerCall: blocked_without_task_approval
      schemaMigration: blocked_without_task_approval
      costCalibrationGate: blocked
    registryLifecycle:
      runStatus: active
      cleanupPolicy: none
      redactionRequired: true
    taskKind: implementation
    allowedFiles:
      - docs/current.md
      - docs/05-execution-logs/task-plans/current-plan.md
    blockedFiles:
      - .env.local
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - $ValidationCommand
$ValidationLifecycleBlock
    evidencePath: docs/current-evidence.md
    auditReviewPath: docs/current-audit.md
    status: $CurrentStatus
    retryCount: 0
  - id: next-task
    title: Next Task
    phase: next-task
    sourceStory: smoke
$nextDependencyBlock
    taskPlanPolicy: required
    humanApproval: smoke approval
    closeoutPolicy:
      localCommit: approved
      fastForwardMerge:
        approved: false
        targetBranch: master
      push:
        approved: false
        target: origin/master
      cleanup:
        deleteShortBranch: false
        parkWorktree: false
    autodrivePolicy:
      mode: guarded_serial
      allowedAgentActions:
        - continue_task
        - claim_task
        - run_validation
        - write_evidence
        - local_commit
        - run_closeout_recovery
      blockedAgentActions:
        - merge
        - push
        - pr
        - deploy
        - dependency_change
        - schema_migration
        - env_secret
        - provider_call
        - cost_calibration_gate
      maxAutonomousSteps: 3
      stopOn:
        - hard_block
        - blocked_gate
        - validation_failure
        - out_of_scope_change
        - dirty_unknown_worktree
        - active_owner_present
    capabilities:
      localDockerDatabase: task_approval_required
      projectResourceRead: task_approval_required
      providerKey: env_destination_confirmation_required
      providerCall: blocked_without_task_approval
      schemaMigration: blocked_without_task_approval
      costCalibrationGate: blocked
    registryLifecycle:
      runStatus: active
      cleanupPolicy: none
      redactionRequired: true
    taskKind: implementation
    allowedFiles:
      - docs/next.md
      - docs/05-execution-logs/task-plans/next-plan.md
    blockedFiles:
      - .env.local
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - $ValidationCommand
$ValidationLifecycleBlock
    evidencePath: docs/next-evidence.md
    auditReviewPath: docs/next-audit.md
    status: $NextStatus
    retryCount: 0
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 1
taskAutodrivePolicy: {}
capabilities: {}
registryLifecycle: {}
closeoutPolicy: {}
"@ | Set-Content -LiteralPath $schemaPath -Encoding UTF8

    return [pscustomobject]@{
        StatePath = $statePath
        QueuePath = $queuePath
        SchemaPath = $schemaPath
    }
}

function Write-DispatcherOutput {
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

    $dispatcherOutputPath = Write-DispatcherOutput -Root $smokeRoot -Name "continue" -Content @"
agentAction: continue_task
agentActionTask: current-task
"@
    $continueResult = Invoke-SerialExecutor -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath -DispatcherOutputPath $dispatcherOutputPath
    if ($continueResult.ExitCode -ne 0) {
        throw "Continue fixture failed.`n$($continueResult.Output -join "`n")"
    }
    Assert-Contains -Output $continueResult.Output -Pattern "serialExecutorDecision: ready_to_continue"
    Assert-Contains -Output $continueResult.Output -Pattern "serialExecutorAction: continue_task"

    $closeoutRecoveryResult = Invoke-SerialExecutor -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath -Action "run_closeout_recovery" -ActionTask "current-task"
    if ($closeoutRecoveryResult.ExitCode -ne 0) {
        throw "Closeout-recovery fixture failed.`n$($closeoutRecoveryResult.Output -join "`n")"
    }
    Assert-Contains -Output $closeoutRecoveryResult.Output -Pattern "serialExecutorDecision: handoff_to_closeout_recovery"
    Assert-Contains -Output $closeoutRecoveryResult.Output -Pattern "serialExecutorAction: run_closeout_recovery"

    $claimReadyFiles = Write-SmokeFiles -Root $smokeRoot -CurrentStatus "closed" -NextDependencies "current-task"
    $claimReadyResult = Invoke-SerialExecutor -ProjectStatePath $claimReadyFiles.StatePath -QueuePath $claimReadyFiles.QueuePath -SchemaPath $claimReadyFiles.SchemaPath -Action "claim_task" -ActionTask "next-task"
    if ($claimReadyResult.ExitCode -ne 0) {
        throw "Claim-ready fixture failed.`n$($claimReadyResult.Output -join "`n")"
    }
    Assert-Contains -Output $claimReadyResult.Output -Pattern "serialExecutorDecision: ready_to_claim"

    $claimExecuteFiles = Write-SmokeFiles -Root $smokeRoot -CurrentStatus "closed" -NextDependencies "current-task"
    $claimExecuteResult = Invoke-SerialExecutor -ProjectStatePath $claimExecuteFiles.StatePath -QueuePath $claimExecuteFiles.QueuePath -SchemaPath $claimExecuteFiles.SchemaPath -Action "claim_task" -ActionTask "next-task" -Execute
    if ($claimExecuteResult.ExitCode -ne 0) {
        throw "Claim-execute fixture failed.`n$($claimExecuteResult.Output -join "`n")"
    }
    Assert-Contains -Output $claimExecuteResult.Output -Pattern "serialExecutorDecision: task_claimed"
    Assert-Contains -Output @(Get-Content -LiteralPath $claimExecuteFiles.QueuePath) -Pattern "status: in_progress"
    Assert-Contains -Output @(Get-Content -LiteralPath $claimExecuteFiles.StatePath) -Pattern "id: next-task"

    $validationReadyResult = Invoke-SerialExecutor -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath -Action "run_validation" -ActionTask "current-task"
    if ($validationReadyResult.ExitCode -ne 0) {
        throw "Validation-ready fixture failed.`n$($validationReadyResult.Output -join "`n")"
    }
    Assert-Contains -Output $validationReadyResult.Output -Pattern "serialExecutorDecision: validation_ready"
    Assert-Contains -Output $validationReadyResult.Output -Pattern "safe command:"

    $validationRunResult = Invoke-SerialExecutor -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath -Action "run_validation" -ActionTask "current-task" -RunValidation
    if ($validationRunResult.ExitCode -ne 0) {
        throw "Validation-run fixture failed.`n$($validationRunResult.Output -join "`n")"
    }
    Assert-Contains -Output $validationRunResult.Output -Pattern "serialExecutorDecision: validation_passed"
    Assert-Contains -Output $validationRunResult.Output -Pattern "validationOutput: safe-validation"

    $validationLifecycleBlock = @"
    validationCommandLifecycle:
      - phase: pre_edit
        command: powershell.exe -NoProfile -Command `"Write-Output pre-edit-validation`"
      - phase: closeout
        command: powershell.exe -NoProfile -Command `"Write-Output closeout-validation`"
"@
    $lifecycleFiles = Write-SmokeFiles -Root $smokeRoot -ValidationCommand "powershell.exe -NoProfile -Command `"Write-Output legacy-validation`"" -ValidationLifecycleBlock $validationLifecycleBlock
    $lifecycleRunResult = Invoke-SerialExecutor -ProjectStatePath $lifecycleFiles.StatePath -QueuePath $lifecycleFiles.QueuePath -SchemaPath $lifecycleFiles.SchemaPath -Action "run_validation" -ActionTask "current-task" -RunValidation
    if ($lifecycleRunResult.ExitCode -ne 0) {
        throw "Validation lifecycle fixture failed.`n$($lifecycleRunResult.Output -join "`n")"
    }
    Assert-Contains -Output $lifecycleRunResult.Output -Pattern "validationLifecycleMode: phase_filtered"
    Assert-Contains -Output $lifecycleRunResult.Output -Pattern "validationOutput: closeout-validation"
    if (($lifecycleRunResult.Output -join "`n") -match "pre-edit-validation|legacy-validation") {
        throw "Expected validation lifecycle mode to skip pre_edit and legacy validation commands."
    }

    $blockedFiles = Write-SmokeFiles -Root $smokeRoot -ValidationCommand "drizzle-kit push"
    $blockedResult = Invoke-SerialExecutor -ProjectStatePath $blockedFiles.StatePath -QueuePath $blockedFiles.QueuePath -SchemaPath $blockedFiles.SchemaPath -Action "run_validation" -ActionTask "current-task"
    if ($blockedResult.ExitCode -eq 0) {
        throw "Blocked-command fixture unexpectedly passed.`n$($blockedResult.Output -join "`n")"
    }
    Assert-Contains -Output $blockedResult.Output -Pattern "serialExecutorDecision: blocked_command"
    Assert-Contains -Output $blockedResult.Output -Pattern "blocked command:"

    $idleResult = Invoke-SerialExecutor -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath -Action "idle_active_owner_present"
    if ($idleResult.ExitCode -ne 0) {
        throw "Idle fixture failed.`n$($idleResult.Output -join "`n")"
    }
    Assert-Contains -Output $idleResult.Output -Pattern "serialExecutorDecision: idle"

    Write-Output "Module Run v2 serial autodrive executor smoke passed"
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
