$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern"
    }
}

function Invoke-Gate {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [string[]]$ScriptArguments
    )

    $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath @ScriptArguments 2>&1)
    return [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = $output }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2LocalCapabilityGate.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing local capability gate script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-local-capability-gate-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    @"
currentTask:
  id: default-task
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    @"
tasks:
  - id: default-task
    capabilities:
      localDockerDatabase: task_approval_required
      destructiveLocalDockerDatabase: blocked_without_task_approval
      projectResourceRead: task_approval_required
      providerKey: env_destination_confirmation_required
      providerCall: blocked_without_task_approval
      schemaMigration: blocked_without_task_approval
      localFullFlowGate: blocked_without_task_profile
      costCalibrationGate: blocked
  - id: approved-task
    capabilities:
      localDockerDatabase: approved_local_dev_only
      destructiveLocalDockerDatabase: approved_destructive_local_dev_only
      projectResourceRead: approved_read_only_redacted
      providerKey: approved_confirmed_local_destination
      providerCall: approved_redacted_local_validation
      schemaMigration: approved_migration_plan
      localFullFlowGate: blocked_without_task_profile
      costCalibrationGate: blocked
  - id: local-full-flow-profile-missing
    executionProfile: local_unit_tdd
    validationPolicy: local_full_flow
    localFullFlowGate: approved_localhost_only
    capabilities:
      localFullFlowGate: approved_localhost_only
      costCalibrationGate: blocked
    validationCommands:
      - powershell.exe -NoProfile -Command "Invoke-WebRequest http://localhost:3000"
  - id: local-full-flow-external-target
    executionProfile: local_full_flow
    validationPolicy: local_full_flow
    localFullFlowGate: approved_localhost_only
    capabilities:
      localFullFlowGate: approved_localhost_only
      costCalibrationGate: blocked
    validationCommands:
      - powershell.exe -NoProfile -Command "Invoke-WebRequest https://staging.example.invalid"
  - id: local-full-flow-approved
    executionProfile: local_full_flow
    validationPolicy: local_full_flow
    localFullFlowGate: approved_localhost_only
    capabilities:
      localFullFlowGate: approved_localhost_only
      costCalibrationGate: blocked
    validationCommands:
      - powershell.exe -NoProfile -Command "Invoke-WebRequest http://localhost:3000"
  - id: unsafe-task
    capabilities:
      localDockerDatabase: unsafe
      destructiveLocalDockerDatabase: blocked_without_task_approval
      projectResourceRead: task_approval_required
      providerKey: env_destination_confirmation_required
      providerCall: blocked_without_task_approval
      schemaMigration: blocked_without_task_approval
      localFullFlowGate: blocked_without_task_profile
      costCalibrationGate: blocked
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $declareResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "default-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "localDockerDatabase",
        "-Intent", "declare_adapter"
    )
    if ($declareResult.ExitCode -ne 0) {
        throw "Expected adapter declaration to pass"
    }
    Assert-Contains -Output $declareResult.Output -Pattern "localCapabilityDecision: adapter_contract_ready"
    Assert-Contains -Output $declareResult.Output -Pattern "adapterAction: no_execution_local_db_task_approval_required"

    $manualResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "default-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "projectResourceRead",
        "-Intent", "use_capability"
    )
    if ($manualResult.ExitCode -eq 0) {
        throw "Expected missing project resource approval to fail"
    }
    Assert-Contains -Output $manualResult.Output -Pattern "localCapabilityDecision: manual_required"

    $dbReadyResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "approved-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "localDockerDatabase",
        "-Intent", "use_capability"
    )
    if ($dbReadyResult.ExitCode -ne 0) {
        throw "Expected approved local Docker DB capability to pass readiness"
    }
    Assert-Contains -Output $dbReadyResult.Output -Pattern "localCapabilityDecision: capability_ready"
    Assert-Contains -Output $dbReadyResult.Output -Pattern "adapterAction: local_dev_db_adapter_ready_no_execution"
    Assert-Contains -Output $dbReadyResult.Output -Pattern "blockedAdapterAction: schema_migration"

    $resourceReadyResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "approved-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "projectResourceRead",
        "-Intent", "use_capability"
    )
    if ($resourceReadyResult.ExitCode -ne 0) {
        throw "Expected approved project resource read capability to pass readiness"
    }
    Assert-Contains -Output $resourceReadyResult.Output -Pattern "capabilityState: approved_read_only_redacted"
    Assert-Contains -Output $resourceReadyResult.Output -Pattern "blockedAdapterAction: full_paper_content"

    $providerKeyReadyResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "approved-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "providerKey",
        "-Intent", "use_capability"
    )
    if ($providerKeyReadyResult.ExitCode -ne 0) {
        throw "Expected approved provider key destination capability to pass readiness"
    }
    Assert-Contains -Output $providerKeyReadyResult.Output -Pattern "provider_key_destination_confirmed_no_env_write"

    $providerCallReadyResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "approved-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "providerCall",
        "-Intent", "use_capability"
    )
    if ($providerCallReadyResult.ExitCode -ne 0) {
        throw "Expected approved provider call capability to pass readiness"
    }
    Assert-Contains -Output $providerCallReadyResult.Output -Pattern "provider_call_redacted_local_validation_ready_no_execution"

    $schemaMigrationReadyResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "approved-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "schemaMigration",
        "-Intent", "use_capability"
    )
    if ($schemaMigrationReadyResult.ExitCode -ne 0) {
        throw "Expected approved schema migration capability to pass readiness"
    }
    Assert-Contains -Output $schemaMigrationReadyResult.Output -Pattern "localCapabilityDecision: capability_ready"
    Assert-Contains -Output $schemaMigrationReadyResult.Output -Pattern "adapterAction: schema_migration_plan_ready_no_execution"
    Assert-Contains -Output $schemaMigrationReadyResult.Output -Pattern "blockedAdapterAction: destructive_data_operation"

    $localFullFlowProfileMissingResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "local-full-flow-profile-missing",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "localFullFlowGate",
        "-Intent", "use_capability"
    )
    if ($localFullFlowProfileMissingResult.ExitCode -eq 0) {
        throw "Expected local full-flow use without local_full_flow profile to fail"
    }
    Assert-Contains -Output $localFullFlowProfileMissingResult.Output -Pattern "localCapabilityDecision: stop_for_hard_block"
    Assert-Contains -Output $localFullFlowProfileMissingResult.Output -Pattern "requires executionProfile local_full_flow"

    $localFullFlowExternalTargetResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "local-full-flow-external-target",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "localFullFlowGate",
        "-Intent", "use_capability"
    )
    if ($localFullFlowExternalTargetResult.ExitCode -eq 0) {
        throw "Expected local full-flow use with non-localhost target to fail"
    }
    Assert-Contains -Output $localFullFlowExternalTargetResult.Output -Pattern "localCapabilityDecision: stop_for_hard_block"
    Assert-Contains -Output $localFullFlowExternalTargetResult.Output -Pattern "blocked non-local target"

    $localFullFlowReadyResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "local-full-flow-approved",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "localFullFlowGate",
        "-Intent", "use_capability"
    )
    if ($localFullFlowReadyResult.ExitCode -ne 0) {
        throw "Expected approved local full-flow capability to pass readiness`n$($localFullFlowReadyResult.Output -join "`n")"
    }
    Assert-Contains -Output $localFullFlowReadyResult.Output -Pattern "localCapabilityDecision: capability_ready"
    Assert-Contains -Output $localFullFlowReadyResult.Output -Pattern "adapterAction: local_full_flow_localhost_adapter_ready_no_execution"
    Assert-Contains -Output $localFullFlowReadyResult.Output -Pattern "allowedLocalFullFlowHost: localhost"

    $destructiveDbManualResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "default-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "destructiveLocalDockerDatabase",
        "-Intent", "use_capability"
    )
    if ($destructiveDbManualResult.ExitCode -eq 0) {
        throw "Expected missing destructive DB approval to fail"
    }
    Assert-Contains -Output $destructiveDbManualResult.Output -Pattern "localCapabilityDecision: manual_required"
    Assert-Contains -Output $destructiveDbManualResult.Output -Pattern "destructive_local_db_task_approval_required"

    $destructiveDbReadyResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "approved-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "destructiveLocalDockerDatabase",
        "-Intent", "use_capability"
    )
    if ($destructiveDbReadyResult.ExitCode -ne 0) {
        throw "Expected approved destructive local Docker DB capability to pass readiness"
    }
    Assert-Contains -Output $destructiveDbReadyResult.Output -Pattern "localCapabilityDecision: capability_ready"
    Assert-Contains -Output $destructiveDbReadyResult.Output -Pattern "adapterAction: destructive_local_dev_db_adapter_ready_no_execution"
    Assert-Contains -Output $destructiveDbReadyResult.Output -Pattern "blockedAdapterAction: staging_prod_connection"

    $costResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "approved-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "costCalibrationGate",
        "-Intent", "use_capability"
    )
    if ($costResult.ExitCode -eq 0) {
        throw "Expected Cost Calibration Gate to fail"
    }
    Assert-Contains -Output $costResult.Output -Pattern "localCapabilityDecision: stop_for_hard_block"
    Assert-Contains -Output $costResult.Output -Pattern "Cost Calibration Gate remains blocked"

    $unsafeResult = Invoke-Gate -ScriptArguments @(
        "-TaskId", "unsafe-task",
        "-QueuePath", $queuePath,
        "-ProjectStatePath", $projectStatePath,
        "-Capability", "localDockerDatabase",
        "-Intent", "use_capability"
    )
    if ($unsafeResult.ExitCode -eq 0) {
        throw "Expected unsafe capability state to fail"
    }
    Assert-Contains -Output $unsafeResult.Output -Pattern "localCapabilityDecision: stop_for_hard_block"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 local capability gate smoke passed"
