$ErrorActionPreference = "Stop"

$scriptRoot = $PSScriptRoot
$schemaScriptPath = Join-Path -Path $scriptRoot -ChildPath "Test-ModuleRunV2AutodriveSchemaReadiness.ps1"
if (-not (Test-Path -LiteralPath $schemaScriptPath)) {
    throw "Missing autodrive schema readiness script"
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
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autodrive-schema-smoke-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root | Out-Null
    return $root
}

function Write-SmokeFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$TaskBlock
    )

    $statePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"
    $schemaPath = Join-Path -Path $Root -ChildPath "autodrive-control-schema.yaml"

    @"
schemaVersion: 1
currentTask:
  id: smoke-task
"@ | Set-Content -LiteralPath $statePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
$TaskBlock
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

$smokeRoot = New-SmokeRoot
try {
    $fullTaskBlock = @"
  - id: smoke-task
    title: Smoke Task
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
        - run_validation
        - write_evidence
        - local_commit
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
      - docs/example.md
    blockedFiles:
      - .env.local
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/evidence.md
    auditReviewPath: docs/audit.md
    status: in_progress
    retryCount: 0
"@
    $fullFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $fullTaskBlock
    $fullOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $fullFiles.StatePath -QueuePath $fullFiles.QueuePath -SchemaPath $fullFiles.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Full schema fixture failed unexpectedly.`n$($fullOutput -join "`n")"
    }
    Assert-Contains -Output $fullOutput -Pattern "autodriveSchemaDecision: can_autodrive"

    $proposalTaskBlock = $fullTaskBlock -replace "(?ms)\s{4}autodrivePolicy:.*?\s{4}capabilities:", "    capabilities:"
    $proposalFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $proposalTaskBlock
    $proposalOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $proposalFiles.StatePath -QueuePath $proposalFiles.QueuePath -SchemaPath $proposalFiles.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Proposal-only fixture failed unexpectedly.`n$($proposalOutput -join "`n")"
    }
    Assert-Contains -Output $proposalOutput -Pattern "autodriveSchemaDecision: proposal_only"

    $invalidTaskBlock = $fullTaskBlock -replace "(?ms)\s{4}validationCommands:\r?\n\s{6}- git diff --check\r?\n", ""
    $invalidFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $invalidTaskBlock
    Invoke-ExpectFailure -ExpectedPattern "autodriveSchemaDecision: stop_for_hard_block" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $invalidFiles.StatePath -QueuePath $invalidFiles.QueuePath -SchemaPath $invalidFiles.SchemaPath
    } | Out-Null

    Write-Output "Module Run v2 autodrive schema readiness smoke passed"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
