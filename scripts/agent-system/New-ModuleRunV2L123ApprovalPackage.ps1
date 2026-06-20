param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [switch]$Apply,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\local-experience-coverage-matrix.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ExecutionLogRoot = "docs\05-execution-logs"
)

$ErrorActionPreference = "Stop"

function Get-DecisionValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function ConvertTo-TitleText {
    param([Parameter(Mandatory = $true)][string]$Value)

    $words = $Value -split "[-_]" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    if ($words.Count -eq 0) {
        return $Value
    }

    return ($words | ForEach-Object { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }) -join " "
}

function ConvertTo-RecordKey {
    param([Parameter(Mandatory = $true)][string]$Value)

    $parts = $Value -split "[-_]" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    if ($parts.Count -eq 0) {
        return "lastL123ApprovalPackage"
    }

    $pascal = ($parts | ForEach-Object { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }) -join ""
    return "last$pascal"
}

function New-L123TaskBlock {
    param(
        [Parameter(Mandatory = $true)][string]$ResolvedTaskId,
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$RiskTier,
        [Parameter(Mandatory = $true)][string]$ExecutionMode,
        [Parameter(Mandatory = $true)][string]$PlanPath,
        [Parameter(Mandatory = $true)][string]$EvidencePath,
        [Parameter(Mandatory = $true)][string]$AuditPath,
        [Parameter(Mandatory = $true)][string]$Timestamp
    )

    $title = ConvertTo-TitleText -Value $ResolvedTaskId
    $result = if ($Decision -eq "l3_approval_only") {
        "pass_l0_l123_l3_minimal_fresh_approval_package_no_high_risk_execution"
    } else {
        "pass_l0_l123_approval_package_no_high_risk_execution"
    }

    return @"
  - id: $ResolvedTaskId
    title: $title
    phase: $ResolvedTaskId
    sourceStory: l123AccelerationApprovalPackage
    dependencies: []
    taskPlanPolicy: required_before_edit
    humanApprovalBoundary: >-
      L123 acceleration generated this docs/state approval-only package. It does not authorize source/test/e2e/script,
      DB, env/secret, provider/model, schema/migration, dependency/package/lockfile, staging/prod/cloud/deploy,
      payment/OCR/export/external-service, Cost Calibration Gate, PR, force push, destructive DB, or sensitive evidence
      execution.
    taskKind: l123_acceleration_approval_package
    moduleRunVersion: 2
    executionProfile: docs_state_lite
    evidenceMode: full
    validationPolicy: docs_state
    queueSelectionMode: explicit_user_requested_followup
    l123AccelerationDecision: $Decision
    riskTier: $RiskTier
    l123ExecutionMode: $ExecutionMode
    status: closed
    result: $result
    claimedAt: "$Timestamp"
    validatedAt: "$Timestamp"
    closedAt: "$Timestamp"
    evidencePath: $EvidencePath
    auditReviewPath: $AuditPath
    planPath: $PlanPath
    nextRecommendedTask: none_until_l123_fresh_approval
    capabilities:
      docsStateOnlyQueueMaintenance: approved
      freshApprovalTextMaterialization: approved
      sourceTestE2eScriptChange: blocked
      databaseRead: blocked
      databaseWrite: blocked
      envLocalRead: blocked
      envSecretOutput: blocked
      providerModelCall: blocked
      schemaMigration: blocked
      dependencyIntroduction: blocked
      stagingProdDeploy: blocked
      paymentOcrExportExternalService: blocked
      costCalibrationGate: blocked
      pr: blocked
      forcePush: blocked
      destructiveDatabase: blocked
      rawSensitiveEvidence: blocked
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/04-agent-system/state/local-experience-coverage-matrix.yaml
      - $PlanPath
      - $EvidencePath
      - $AuditPath
    blockedFiles:
      - .env*
      - package.json
      - package-lock.yaml
      - package-lock.json
      - pnpm-lock.yaml
      - src/**
      - tests/**
      - e2e/**
      - src/db/schema/**
      - drizzle/**
      - scripts/**
      - any file not explicitly listed in allowedFiles
    validationCommands:
      - git diff --check
      - npm.cmd run lint
      - npm.cmd run typecheck
"@
}

function Insert-TaskAtTop {
    param(
        [Parameter(Mandatory = $true)][string]$QueueContent,
        [Parameter(Mandatory = $true)][string]$TaskBlock
    )

    if ($QueueContent -match "(?m)^tasks:\s*$") {
        return [regex]::Replace($QueueContent, "(?m)^tasks:\s*$", "tasks:`r`n$TaskBlock", 1)
    }

    return "$QueueContent`r`n$TaskBlock"
}

function Write-L123ExecutionLogs {
    param(
        [Parameter(Mandatory = $true)][string]$ResolvedTaskId,
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$RiskTier,
        [Parameter(Mandatory = $true)][string]$ExecutionMode,
        [Parameter(Mandatory = $true)][string]$PlanPath,
        [Parameter(Mandatory = $true)][string]$EvidencePath,
        [Parameter(Mandatory = $true)][string]$AuditPath,
        [Parameter(Mandatory = $true)][string]$Timestamp
    )

    $planDirectory = Split-Path -Parent $PlanPath
    $evidenceDirectory = Split-Path -Parent $EvidencePath
    $auditDirectory = Split-Path -Parent $AuditPath
    foreach ($directory in @($planDirectory, $evidenceDirectory, $auditDirectory)) {
        if (-not [string]::IsNullOrWhiteSpace($directory) -and -not (Test-Path -LiteralPath $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }
    }

    $commonBody = @"
- Task id: ``$ResolvedTaskId``
- L123 decision: ``$Decision``
- Risk tier: ``$RiskTier``
- Execution mode: ``$ExecutionMode``
- Generated at: ``$Timestamp``
- High-risk execution performed: ``false``
- Cost Calibration Gate: ``blocked_not_run``

Cost Calibration Gate remains blocked.
"@

    Set-Content -LiteralPath $PlanPath -Encoding UTF8 -Value @"
# $ResolvedTaskId L123 Approval Package Plan

## Scope

$commonBody

This generated package is docs/state approval-only. It must not execute source/test/e2e/script, DB, env, provider,
schema/migration, dependency/package/lockfile, staging/prod/cloud/deploy, payment/OCR/export/external-service, PR, force
push, destructive DB, or sensitive evidence collection.
"@

    Set-Content -LiteralPath $EvidencePath -Encoding UTF8 -Value @"
# $ResolvedTaskId L123 Approval Package Evidence

result: pass
executionDecision: pass_l0_l123_approval_package_no_high_risk_execution

## Result

$commonBody

## RED / GREEN

- RED: The L123 candidate required a seed or approval package before automation could continue.
- GREEN: The candidate now has a docs/state approval package and remains blocked for any high-risk execution.

## Validation

- Generator applied without executing high-risk capabilities.
- Follow-up repository gates must still run before commit/merge/push.

## Redaction

This evidence contains only task ids, decision labels, file paths, pass/fail status, and blocked gate summaries. It
contains no secrets, `.env*` values, database URLs, raw DB rows, private identifiers, provider payloads, raw prompts, raw
responses, OCR files, export payloads, payment data, or sensitive evidence.
"@

    Set-Content -LiteralPath $AuditPath -Encoding UTF8 -Value @"
# $ResolvedTaskId L123 Approval Package Audit Review

## Audit Result

- Decision: approve docs/state L123 approval package.
- Evidence: ``$EvidencePath``
- Plan: ``$PlanPath``

## Gate Review

High-risk execution remains blocked: source/test/e2e/script, DB, env/secret, provider/model, schema/migration,
dependency/package/lockfile, staging/prod/cloud/deploy, payment/OCR/export/external-service, Cost Calibration Gate, PR,
force push, destructive DB, and sensitive evidence.
"@
}

try {
    $readinessScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2L123AccelerationReadiness.ps1"
    $readinessArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $readinessScriptPath,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $readinessArgs += @("-TaskId", $TaskId)
    }

    $readinessOutput = @(& powershell.exe @readinessArgs)
    $readinessOutput | ForEach-Object { Write-Output $_ }

    $decision = Get-DecisionValue -Output $readinessOutput -Key "l123AccelerationDecision"
    $resolvedTaskId = Get-DecisionValue -Output $readinessOutput -Key "taskId"
    $riskTier = Get-DecisionValue -Output $readinessOutput -Key "riskTier"
    $executionMode = Get-DecisionValue -Output $readinessOutput -Key "executionMode"

    if ($decision -notin @("approval_package_ready", "l3_approval_only")) {
        Write-Output "l123ApprovalPackageDecision: not_applicable"
        Write-Output "reason: readiness decision does not permit approval package apply"
        Write-Output "apply: $($Apply.ToString().ToLowerInvariant())"
        Write-Output "Cost Calibration Gate remains blocked"
        exit 0
    }

    $datePrefix = Get-Date -Format "yyyy-MM-dd"
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $safeTaskId = $resolvedTaskId -replace "[^a-zA-Z0-9\-]", "-"
    $planPath = Join-Path -Path $ExecutionLogRoot -ChildPath "task-plans\$datePrefix-$safeTaskId.md"
    $evidencePath = Join-Path -Path $ExecutionLogRoot -ChildPath "evidence\$datePrefix-$safeTaskId.md"
    $auditPath = Join-Path -Path $ExecutionLogRoot -ChildPath "audits-reviews\$datePrefix-$safeTaskId.md"
    $taskBlock = New-L123TaskBlock `
        -ResolvedTaskId $resolvedTaskId `
        -Decision $decision `
        -RiskTier $riskTier `
        -ExecutionMode $executionMode `
        -PlanPath $planPath.Replace("\", "/") `
        -EvidencePath $evidencePath.Replace("\", "/") `
        -AuditPath $auditPath.Replace("\", "/") `
        -Timestamp $timestamp

    Write-Output "l123ApprovalPackageDecision: $(if ($Apply) { 'apply_requested' } else { 'proposal_available' })"
    Write-Output "taskId: $resolvedTaskId"
    Write-Output "riskTier: $riskTier"
    Write-Output "executionMode: $executionMode"
    Write-Output "planPath: $($planPath.Replace('\', '/'))"
    Write-Output "evidencePath: $($evidencePath.Replace('\', '/'))"
    Write-Output "auditReviewPath: $($auditPath.Replace('\', '/'))"
    Write-Output "apply: $($Apply.ToString().ToLowerInvariant())"
    Write-Output "taskBlock:"
    $taskBlock -split "`r?`n" | ForEach-Object { Write-Output $_ }

    if (-not $Apply) {
        Write-Output "l123ApprovalPackageDecision: plan_only"
        Write-Output "Cost Calibration Gate remains blocked"
        exit 0
    }

    $queueContent = Get-Content -LiteralPath $QueuePath -Raw
    if ($queueContent -match "(?m)^\s+- id:\s*$([regex]::Escape($resolvedTaskId))\s*$") {
        Write-Output "l123ApprovalPackageDecision: already_exists"
        Write-Output "Cost Calibration Gate remains blocked"
        exit 0
    }

    $updatedQueueContent = Insert-TaskAtTop -QueueContent $queueContent -TaskBlock $taskBlock
    Set-Content -LiteralPath $QueuePath -Encoding UTF8 -Value $updatedQueueContent

    $projectStateContent = Get-Content -LiteralPath $ProjectStatePath -Raw
    $projectStateAppend = @"

l123AccelerationLastPackage:
  taskId: $resolvedTaskId
  appliedAt: "$timestamp"
  decision: $decision
  riskTier: $riskTier
  executionMode: $executionMode
  evidence: $($evidencePath.Replace("\", "/"))
  auditReview: $($auditPath.Replace("\", "/"))
  highRiskExecution: false
  costCalibrationGate: blocked
"@
    Set-Content -LiteralPath $ProjectStatePath -Encoding UTF8 -Value ($projectStateContent.TrimEnd() + $projectStateAppend + "`r`n")

    $matrixContent = Get-Content -LiteralPath $MatrixPath -Raw
    $nextTaskReplacement = "nextTask: none_until_$($resolvedTaskId -replace '-', '_')_fresh_approval"
    $updatedMatrixContent = [regex]::Replace($matrixContent, "(?m)^(\s+nextTask:\s*)$([regex]::Escape($resolvedTaskId))\s*$", "`${1}$nextTaskReplacement")
    $recordKey = ConvertTo-RecordKey -Value $resolvedTaskId
    $matrixAppend = @"

${recordKey}:
  taskId: $resolvedTaskId
  evaluatedAt: "$timestamp"
  decision: $decision
  riskTier: $riskTier
  executionMode: $executionMode
  evidence: $($evidencePath.Replace("\", "/"))
  auditReview: $($auditPath.Replace("\", "/"))
  matrixStatus: release_blocked
  highRiskExecution: false
  nextRecommendedTask: none_until_l123_fresh_approval
  blockedGates:
    - source_test_e2e_script_change
    - database_read_write
    - env_secret
    - provider_model_call
    - schema_migration
    - dependency_package_lockfile_change
    - staging_prod_cloud_deploy
    - payment_ocr_export_external_service
    - cost_calibration_gate
    - raw_sensitive_evidence
"@
    Set-Content -LiteralPath $MatrixPath -Encoding UTF8 -Value ($updatedMatrixContent.TrimEnd() + $matrixAppend + "`r`n")

    Write-L123ExecutionLogs `
        -ResolvedTaskId $resolvedTaskId `
        -Decision $decision `
        -RiskTier $riskTier `
        -ExecutionMode $executionMode `
        -PlanPath $planPath `
        -EvidencePath $evidencePath `
        -AuditPath $auditPath `
        -Timestamp $timestamp

    Write-Output "l123ApprovalPackageDecision: applied"
    Write-Output "Cost Calibration Gate remains blocked"
} catch {
    Write-Output "HARD_BLOCK_L123_APPROVAL_PACKAGE_ERROR $($_.Exception.Message)"
    Write-Output "l123ApprovalPackageDecision: stop_for_hard_block"
    Write-Output "Cost Calibration Gate remains blocked"
    exit 1
}
