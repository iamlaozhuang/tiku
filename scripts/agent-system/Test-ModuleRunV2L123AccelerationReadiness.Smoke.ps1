$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not (($Output -join "`n") -match $Pattern)) {
        throw "$Message`nExpected pattern: $Pattern`nOutput:`n$($Output -join "`n")"
    }
}

function New-FixtureRoot {
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-l123-readiness-smoke-" + [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    return $root
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2L123AccelerationReadiness.ps1"

$ap11Output = @(
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath -TaskId "ap-11-source-governance-change-control-fresh-approval-required"
)
Assert-Contains -Output $ap11Output -Pattern "l123AccelerationDecision: approval_package_ready" -Message "AP-11 should classify as approval-package-ready"
Assert-Contains -Output $ap11Output -Pattern "riskTier: L0" -Message "AP-11 should stay L0 approval-only"

$fixtureRoot = New-FixtureRoot
try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $fixtureRoot -ChildPath "local-experience-coverage-matrix.yaml"

    Set-Content -LiteralPath $projectStatePath -Encoding UTF8 -Value @"
schemaVersion: 1
currentTask:
  id: closed-task
  status: closed
"@
    Set-Content -LiteralPath $queuePath -Encoding UTF8 -Value @"
schemaVersion: 1
tasks: []
"@
    Set-Content -LiteralPath $matrixPath -Encoding UTF8 -Value @"
schemaVersion: 1
coverage:
  - useCaseId: UC-FUTURE-ONLINE-PAYMENT
    freshEvidence: not_required
    status: release_blocked
    nextTask: ap-06-online-payment-execution-fresh-approval-required
"@

    $l3Output = @(
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
            -TaskId "ap-06-online-payment-execution-fresh-approval-required" `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    )
    Assert-Contains -Output $l3Output -Pattern "l123AccelerationDecision: l3_approval_only" -Message "L3 payment task should be approval-only"
    Assert-Contains -Output $l3Output -Pattern "blockedGate: l3_high_risk_execution_blocked" -Message "L3 payment task should name blocked gate"

    Set-Content -LiteralPath $queuePath -Encoding UTF8 -Value @"
schemaVersion: 1
tasks:
  - id: sample-l1-source-repair
    title: Sample L1 source repair
    status: pending
    taskKind: implementation
"@
    Set-Content -LiteralPath $matrixPath -Encoding UTF8 -Value @"
schemaVersion: 1
coverage:
  - useCaseId: UC-SAMPLE-L1
    status: release_blocked
    nextTask: sample-l1-source-repair
"@
    $missingScopeOutput = @(
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
            -TaskId "sample-l1-source-repair" `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    )
    Assert-Contains -Output $missingScopeOutput -Pattern "l123AccelerationDecision: approval_package_required" -Message "L1 missing exact scope should require approval package"
    Assert-Contains -Output $missingScopeOutput -Pattern "missingApprovalField: .*allowedFiles.*blockedFiles.*commands.*redaction.*rollback.*stopConditions" -Message "L1 missing fields should be reported"

    Set-Content -LiteralPath $queuePath -Encoding UTF8 -Value @"
schemaVersion: 1
tasks:
  - id: sample-l1-source-repair
    title: Sample L1 source repair
    status: pending
    taskKind: implementation
    allowedFiles:
      - src/**
    blockedFiles:
      - .env*
    validationCommands:
      - git diff --check
    redaction: sanitized
    rollback: git revert
    stopConditions:
      - scope expansion
"@
    $broadAllowedFileOutput = @(
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
            -TaskId "sample-l1-source-repair" `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath
    )
    Assert-Contains -Output $broadAllowedFileOutput -Pattern "l123AccelerationDecision: hard_block" -Message "Broad source wildcard should hard block"
    Assert-Contains -Output $broadAllowedFileOutput -Pattern "broad_or_high_risk_allowed_file:src/\*\*" -Message "Broad source wildcard should be named"
} finally {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
}

Write-Output "Module Run v2 L123 acceleration readiness smoke passed"
