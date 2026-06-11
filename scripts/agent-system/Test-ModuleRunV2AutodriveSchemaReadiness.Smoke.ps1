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
        [Parameter(Mandatory = $true)][string]$TaskBlock,
        [Parameter(Mandatory = $false)][switch]$WithoutStandingLocalE2EApproval
    )

    $statePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"
    $schemaPath = Join-Path -Path $Root -ChildPath "autodrive-control-schema.yaml"

    $standingLocalE2EApprovalBlock = if ($WithoutStandingLocalE2EApproval) {
        ""
    } else {
        @"
automation:
  unattendedControl:
    standingLocalE2EValidationApproval:
      status: approved
"@
    }

    @"
schemaVersion: 1
currentTask:
  id: smoke-task
$standingLocalE2EApprovalBlock
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
      destructiveLocalDockerDatabase: blocked_without_task_approval
      projectResourceRead: task_approval_required
      providerKey: env_destination_confirmation_required
      providerCall: blocked_without_task_approval
      schemaMigration: blocked_without_task_approval
      localE2EValidation: blocked_without_task_approval
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
      - .env.example
      - package.json
      - pnpm-lock.yaml
      - package-lock.yaml
      - package-lock.json
      - src/db/schema/**
      - drizzle/**
      - playwright-report/**
      - test-results/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    validationCommandLifecycle:
      - phase: pre_edit
        command: powershell.exe -NoProfile -Command `"Write-Output pre-edit`"
      - phase: closeout
        command: git diff --check
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
    Assert-Contains -Output $fullOutput -Pattern "validationLifecycleCommandCount: 2"

    $approvedDbCapabilityTaskBlock = $fullTaskBlock `
        -replace "destructiveLocalDockerDatabase: blocked_without_task_approval", "destructiveLocalDockerDatabase: approved_destructive_local_dev_only" `
        -replace "schemaMigration: blocked_without_task_approval", "schemaMigration: approved_migration_plan"
    $approvedDbCapabilityFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $approvedDbCapabilityTaskBlock
    $approvedDbCapabilityOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $approvedDbCapabilityFiles.StatePath -QueuePath $approvedDbCapabilityFiles.QueuePath -SchemaPath $approvedDbCapabilityFiles.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Approved DB capability schema fixture failed unexpectedly.`n$($approvedDbCapabilityOutput -join "`n")"
    }
    Assert-Contains -Output $approvedDbCapabilityOutput -Pattern "autodriveSchemaDecision: can_autodrive"

    $e2eCommandTaskBlock = $fullTaskBlock `
        -replace "validationCommands:\r?\n\s{6}- git diff --check", "validationCommands:`n      - npm.cmd run test:e2e -- e2e/home.spec.ts`n      - git diff --check" `
        -replace "validationCommandLifecycle:\r?\n\s{6}- phase: pre_edit", "validationCommandLifecycle:`n      - phase: post_edit`n        command: npm.cmd run test:e2e -- e2e/home.spec.ts`n      - phase: pre_edit"
    $e2eWithoutCapabilityFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $e2eCommandTaskBlock
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_LOCAL_E2E_CAPABILITY" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $e2eWithoutCapabilityFiles.StatePath -QueuePath $e2eWithoutCapabilityFiles.QueuePath -SchemaPath $e2eWithoutCapabilityFiles.SchemaPath
    } | Out-Null

    $approvedE2ETaskBlock = $e2eCommandTaskBlock -replace "localE2EValidation: blocked_without_task_approval", "localE2EValidation: approved_local_only_existing_specs"
    $approvedE2EFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $approvedE2ETaskBlock
    $approvedE2EOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $approvedE2EFiles.StatePath -QueuePath $approvedE2EFiles.QueuePath -SchemaPath $approvedE2EFiles.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Approved local E2E schema fixture failed unexpectedly.`n$($approvedE2EOutput -join "`n")"
    }
    Assert-Contains -Output $approvedE2EOutput -Pattern "autodriveSchemaDecision: can_autodrive"

    $missingStandingE2EFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $approvedE2ETaskBlock -WithoutStandingLocalE2EApproval
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_LOCAL_E2E_STANDING_APPROVAL" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $missingStandingE2EFiles.StatePath -QueuePath $missingStandingE2EFiles.QueuePath -SchemaPath $missingStandingE2EFiles.SchemaPath
    } | Out-Null

    $implicitTestTaskBlock = $approvedE2ETaskBlock -replace "npm.cmd run test:e2e -- e2e/home.spec.ts", "npm.cmd run test"
    $implicitTestFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $implicitTestTaskBlock
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_LOCAL_E2E_COMMAND" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $implicitTestFiles.StatePath -QueuePath $implicitTestFiles.QueuePath -SchemaPath $implicitTestFiles.SchemaPath
    } | Out-Null

    $uiModeTaskBlock = $approvedE2ETaskBlock -replace "npm.cmd run test:e2e -- e2e/home.spec.ts", "npm.cmd run test:e2e:ui -- e2e/home.spec.ts"
    $uiModeFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $uiModeTaskBlock
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_LOCAL_E2E_COMMAND" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $uiModeFiles.StatePath -QueuePath $uiModeFiles.QueuePath -SchemaPath $uiModeFiles.SchemaPath
    } | Out-Null

    $headedModeTaskBlock = $approvedE2ETaskBlock -replace "npm.cmd run test:e2e -- e2e/home.spec.ts", "npm.cmd run test:e2e -- e2e/home.spec.ts --headed"
    $headedModeFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $headedModeTaskBlock
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_LOCAL_E2E_COMMAND" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $headedModeFiles.StatePath -QueuePath $headedModeFiles.QueuePath -SchemaPath $headedModeFiles.SchemaPath
    } | Out-Null

    $missingSpecTaskBlock = $approvedE2ETaskBlock -replace "e2e/home.spec.ts", "e2e/module-run-v2-missing-smoke.spec.ts"
    $missingSpecFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $missingSpecTaskBlock
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_LOCAL_E2E_SPEC" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $missingSpecFiles.StatePath -QueuePath $missingSpecFiles.QueuePath -SchemaPath $missingSpecFiles.SchemaPath
    } | Out-Null

    $unsafeDestructiveDbTaskBlock = $fullTaskBlock -replace "destructiveLocalDockerDatabase: blocked_without_task_approval", "destructiveLocalDockerDatabase: unsafe"
    $unsafeDestructiveDbFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $unsafeDestructiveDbTaskBlock
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_CAPABILITY_DESTRUCTIVE_LOCAL_DOCKER_DATABASE" -Command {
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $unsafeDestructiveDbFiles.StatePath -QueuePath $unsafeDestructiveDbFiles.QueuePath -SchemaPath $unsafeDestructiveDbFiles.SchemaPath
    } | Out-Null

    $closedTaskBlock = $fullTaskBlock -replace "status: in_progress", "status: closed"
    $closedFiles = Write-SmokeFiles -Root $smokeRoot -TaskBlock $closedTaskBlock
    $closedOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $schemaScriptPath -ProjectStatePath $closedFiles.StatePath -QueuePath $closedFiles.QueuePath -SchemaPath $closedFiles.SchemaPath)
    if ($LASTEXITCODE -ne 0) {
        throw "Closed-task schema fixture should be an idle diagnostic, not a hard block.`n$($closedOutput -join "`n")"
    }
    Assert-Contains -Output $closedOutput -Pattern "not_executable_closed_task"
    Assert-Contains -Output $closedOutput -Pattern "autodriveSchemaDecision: not_executable_closed_task"

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
