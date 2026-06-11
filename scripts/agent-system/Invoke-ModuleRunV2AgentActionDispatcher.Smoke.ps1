$ErrorActionPreference = "Stop"

$scriptRoot = $PSScriptRoot
$dispatcherScriptPath = Join-Path -Path $scriptRoot -ChildPath "Invoke-ModuleRunV2AgentActionDispatcher.ps1"
if (-not (Test-Path -LiteralPath $dispatcherScriptPath)) {
    throw "Missing agent action dispatcher script"
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
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-agent-action-dispatcher-smoke-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root | Out-Null
    return $root
}

function Write-SmokeFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $false)][switch]$MissingAutodrivePolicy
    )

    $statePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"
    $schemaPath = Join-Path -Path $Root -ChildPath "autodrive-control-schema.yaml"

    @"
schemaVersion: 1
currentTask:
  id: current-task
"@ | Set-Content -LiteralPath $statePath -Encoding UTF8

    $autodrivePolicy = if ($MissingAutodrivePolicy) {
        ""
    } else {
        @"
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
"@
    }

    @"
schemaVersion: 1
tasks:
  - id: current-task
    title: Current Task
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
$autodrivePolicy
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
    blockedFiles:
      - .env.local
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/current-evidence.md
    auditReviewPath: docs/current-audit.md
    status: in_progress
    retryCount: 0
  - id: next-task
    title: Next Task
    dependencies:
      - current-task
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
    blockedFiles:
      - .env.local
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/next-evidence.md
    auditReviewPath: docs/next-audit.md
    status: pending
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

function Write-RunnerOutput {
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

    $continueRunner = Write-RunnerOutput -Root $smokeRoot -Name "continue" -Content @"
runnerDecision: continue_current_task
runnerNextAction: agent_continue_current_task
"@
    $continueOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -TaskId current-task -RunnerOutputPath $continueRunner -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Continue dispatcher fixture failed.`n$($continueOutput -join "`n")"
    }
    Assert-Contains -Output $continueOutput -Pattern "agentAction: continue_task"

    $nextRunner = Write-RunnerOutput -Root $smokeRoot -Name "next" -Content @"
runnerDecision: prepare_next_task
runnerNextAction: agent_claim_next_task
runnerNextTask: next-task
"@
    $nextOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -RunnerOutputPath $nextRunner -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Next dispatcher fixture failed.`n$($nextOutput -join "`n")"
    }
    Assert-Contains -Output $nextOutput -Pattern "agentAction: claim_task"
    Assert-Contains -Output $nextOutput -Pattern "agentActionTask: next-task"

    $proposalFiles = Write-SmokeFiles -Root $smokeRoot -MissingAutodrivePolicy
    $proposalOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -TaskId current-task -RunnerOutputPath $continueRunner -ProjectStatePath $proposalFiles.StatePath -QueuePath $proposalFiles.QueuePath -SchemaPath $proposalFiles.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Proposal dispatcher fixture failed.`n$($proposalOutput -join "`n")"
    }
    Assert-Contains -Output $proposalOutput -Pattern "agentAction: propose_schema_repair"

    $closeoutRecoveryRunner = Write-RunnerOutput -Root $smokeRoot -Name "closeout-recovery" -Content @"
runnerDecision: closeout_recovery
runnerNextAction: run_closeout_recovery_autopilot
"@
    $closeoutRecoveryOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -TaskId current-task -RunnerOutputPath $closeoutRecoveryRunner -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Closeout-recovery dispatcher fixture failed.`n$($closeoutRecoveryOutput -join "`n")"
    }
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "agentAction: run_approved_closeout"
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "agentActionTask: current-task"

    $activeOwnerRunner = Write-RunnerOutput -Root $smokeRoot -Name "active-owner" -Content @"
runnerDecision: exit_active_owner_present
runnerNextAction: leave_active_owner_alone
"@
    $activeOwnerOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -RunnerOutputPath $activeOwnerRunner -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Active-owner dispatcher fixture failed.`n$($activeOwnerOutput -join "`n")"
    }
    Assert-Contains -Output $activeOwnerOutput -Pattern "agentAction: idle_active_owner_present"

    $ownerRecoveryRunner = Write-RunnerOutput -Root $smokeRoot -Name "owner-recovery" -Content @"
runnerDecision: manual_required_owner_recovery
runnerNextAction: request_owner_recovery
"@
    $ownerRecoveryOutput = Invoke-ExpectFailure -ExpectedPattern "agentAction: request_manual_decision" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -RunnerOutputPath $ownerRecoveryRunner -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath
    }
    Assert-Contains -Output $ownerRecoveryOutput -Pattern "stopCardDecision: manual_required"
    Assert-Contains -Output $ownerRecoveryOutput -Pattern "canAutoRecover: false"
    Assert-Contains -Output $ownerRecoveryOutput -Pattern "blockerClass: active_owner"
    Assert-Contains -Output $ownerRecoveryOutput -Pattern "statePolicy: dispatcher_stdout_only"

    $recoverableSeedRunner = Write-RunnerOutput -Root $smokeRoot -Name "recoverable-seed" -Content @"
runnerDecision: adopt_recoverable_run
runnerNextAction: agent_adopt_recoverable_run
seedTransactionRecovery: ready
seedTransactionWorktreePath: C:\Users\jzzhu\.codex\worktrees\ec30\tiku
"@
    $recoverableSeedOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -RunnerOutputPath $recoverableSeedRunner -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Recoverable seed dispatcher fixture failed.`n$($recoverableSeedOutput -join "`n")"
    }
    Assert-Contains -Output $recoverableSeedOutput -Pattern "agentAction: closeout_recoverable_auto_seed_transaction"
    Assert-Contains -Output $recoverableSeedOutput -Pattern "agentActionSeedWorktreePath:"

    $hardBlockRunner = Write-RunnerOutput -Root $smokeRoot -Name "hard-block" -Content @"
runnerDecision: stop_for_hard_block
runnerNextAction: report_startup_hard_block
"@
    $hardBlockOutput = Invoke-ExpectFailure -ExpectedPattern "agentAction: stop_for_hard_block" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dispatcherScriptPath -RunnerOutputPath $hardBlockRunner -ProjectStatePath $files.StatePath -QueuePath $files.QueuePath -SchemaPath $files.SchemaPath
    }
    Assert-Contains -Output $hardBlockOutput -Pattern "stopCardDecision: hard_block"
    Assert-Contains -Output $hardBlockOutput -Pattern "canAutoRecover: false"
    Assert-Contains -Output $hardBlockOutput -Pattern "blockerClass: hard_block"
    Assert-Contains -Output $hardBlockOutput -Pattern "statePolicy: dispatcher_stdout_only"

    Write-Output "Module Run v2 agent action dispatcher smoke passed"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
