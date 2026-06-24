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

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedPattern
    )

    $output = @()
    $failed = $false
    try {
        $output = @(& $Command 2>&1)
    } catch {
        $failed = $true
        $output += $_.Exception.Message
    }

    if (-not $failed -and $LASTEXITCODE -eq 0) {
        throw "Expected command to fail with pattern: $ExpectedPattern"
    }

    Assert-Contains -Output $output -Pattern $ExpectedPattern
}

function New-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    $directory = Split-Path -Path $Path -Parent
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    Set-Content -LiteralPath $Path -Value $Value -Encoding UTF8
}

function Set-SmokeFixture {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Root,

        [Parameter(Mandatory = $true)]
        [string]$TaskId,

        [Parameter(Mandatory = $true)]
        [string]$TaskKind,

        [Parameter(Mandatory = $true)]
        [string]$PlanBody,

        [Parameter(Mandatory = $false)]
        [string]$EvidenceBody = "## Requirement Mapping Result`n`n- mapped.",

        [Parameter(Mandatory = $false)]
        [string]$AuditBody = "## Requirement Mapping Result`n`n- reviewed.",

        [Parameter(Mandatory = $false)]
        [string]$AdditionalTaskFields = ""
    )

    $statePath = Join-Path -Path $Root -ChildPath "docs\04-agent-system\state\project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "docs\04-agent-system\state\task-queue.yaml"
    $matrixPath = Join-Path -Path $Root -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
    $planPath = "docs/05-execution-logs/task-plans/2026-06-24-$TaskId.md"
    $evidencePath = "docs/05-execution-logs/evidence/2026-06-24-$TaskId.md"
    $auditPath = "docs/05-execution-logs/audits-reviews/2026-06-24-$TaskId.md"
    $changedPath = "docs/04-agent-system/sop/smoke-target.md"

    New-TextFile -Path $statePath -Value @"
schemaVersion: 1
currentTask:
  id: $TaskId
"@
    New-TextFile -Path $matrixPath -Value @"
moduleRunVersion: 2
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@
    New-TextFile -Path (Join-Path -Path $Root -ChildPath $planPath) -Value $PlanBody
    New-TextFile -Path (Join-Path -Path $Root -ChildPath $evidencePath) -Value $EvidenceBody
    New-TextFile -Path (Join-Path -Path $Root -ChildPath $auditPath) -Value $AuditBody
    New-TextFile -Path (Join-Path -Path $Root -ChildPath $changedPath) -Value "# smoke target"

    New-TextFile -Path $queuePath -Value @"
schemaVersion: 1
tasks:
  - id: $TaskId
    taskKind: $TaskKind
    allowedFiles:
      - $changedPath
    blockedFiles:
      - .env*
      - package.json
      - src/**
      - e2e/**
    planPath: $planPath
    evidencePath: $evidencePath
    auditReviewPath: $auditPath
$AdditionalTaskFields
"@

    return @{
        StatePath = $statePath
        QueuePath = $queuePath
        MatrixPath = $matrixPath
        ChangedPath = $changedPath
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PreCommitHardening.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing pre-commit hardening script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-ssot-smoke-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    & git -C $fixtureRoot init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize requirement SSOT smoke repository."
    }

    $validPlan = @"
# Task Plan: valid-implementation

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/modules/06-admin-ops.md

## Requirement Decision Map

- Standard requirement root is active.

## Requirement Mapping

- Requirement source: docs/01-requirements/modules/06-admin-ops.md

## Evidence-Only Sources

- docs/05-execution-logs/evidence/example.md

## Conflict Check

- No conflict.
"@
    $fixture = Set-SmokeFixture -Root $fixtureRoot -TaskId "valid-implementation" -TaskKind "implementation" -PlanBody $validPlan
    Push-Location $fixtureRoot
    try {
        $validOutput = @(
            & $scriptPath `
                -ProjectStatePath $fixture.StatePath `
                -QueuePath $fixture.QueuePath `
                -MatrixPath $fixture.MatrixPath `
                -TaskId "valid-implementation" `
                -ChangedFiles $fixture.ChangedPath
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $validOutput -Pattern "OK_SSOT_READ_LIST"
    Assert-Contains -Output $validOutput -Pattern "OK_REQUIREMENT_MAPPING_RESULT"

    $missingSsotPlan = @"
# Task Plan: missing-ssot

## Requirement Mapping

- Requirement source: docs/01-requirements/00-index.md
"@
    $fixture = Set-SmokeFixture -Root $fixtureRoot -TaskId "missing-ssot" -TaskKind "implementation" -PlanBody $missingSsotPlan
    Push-Location $fixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "FAIL_SSOT_READ_LIST_MISSING" -Command {
            & $scriptPath `
                -ProjectStatePath $fixture.StatePath `
                -QueuePath $fixture.QueuePath `
                -MatrixPath $fixture.MatrixPath `
                -TaskId "missing-ssot" `
                -ChangedFiles $fixture.ChangedPath
        }
    } finally {
        Pop-Location
    }

    $executionLogOnlyPlan = @"
# Task Plan: execution-log-only

## SSOT Read List

- docs/05-execution-logs/evidence/example.md

## Requirement Mapping

- Requirement source: docs/05-execution-logs/evidence/example.md
"@
    $fixture = Set-SmokeFixture -Root $fixtureRoot -TaskId "execution-log-only" -TaskKind "implementation" -PlanBody $executionLogOnlyPlan
    Push-Location $fixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "FAIL_EXECUTION_LOG_ONLY_REQUIREMENT_SOURCE" -Command {
            & $scriptPath `
                -ProjectStatePath $fixture.StatePath `
                -QueuePath $fixture.QueuePath `
                -MatrixPath $fixture.MatrixPath `
                -TaskId "execution-log-only" `
                -ChangedFiles $fixture.ChangedPath
        }
    } finally {
        Pop-Location
    }

    $advancedMissingPlan = @"
# Task Plan: advanced-missing-index

## SSOT Read List

- docs/01-requirements/00-index.md

## Requirement Decision Map

- advanced-edition work is in scope.

## Requirement Mapping

- Requirement source: docs/01-requirements/00-index.md
"@
    $fixture = Set-SmokeFixture -Root $fixtureRoot -TaskId "advanced-missing-index" -TaskKind "implementation" -PlanBody $advancedMissingPlan
    Push-Location $fixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "FAIL_ADVANCED_INDEX_MISSING" -Command {
            & $scriptPath `
                -ProjectStatePath $fixture.StatePath `
                -QueuePath $fixture.QueuePath `
                -MatrixPath $fixture.MatrixPath `
                -TaskId "advanced-missing-index" `
                -ChangedFiles $fixture.ChangedPath
        }
    } finally {
        Pop-Location
    }

    $authMissingPlan = @"
# Task Plan: auth-missing-ssot

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/advanced-edition/00-index.md

## Requirement Decision Map

- redeem_code generation is in scope.

## Requirement Mapping

- Requirement source: docs/01-requirements/advanced-edition/00-index.md
"@
    $fixture = Set-SmokeFixture -Root $fixtureRoot -TaskId "auth-missing-ssot" -TaskKind "implementation" -PlanBody $authMissingPlan
    Push-Location $fixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "FAIL_AUTHORIZATION_SSOT_MISSING" -Command {
            & $scriptPath `
                -ProjectStatePath $fixture.StatePath `
                -QueuePath $fixture.QueuePath `
                -MatrixPath $fixture.MatrixPath `
                -TaskId "auth-missing-ssot" `
                -ChangedFiles $fixture.ChangedPath
        }
    } finally {
        Pop-Location
    }

    $roleMissingPlan = @"
# Task Plan: role-separated-missing-source

## SSOT Read List

- docs/01-requirements/00-index.md

## Requirement Decision Map

- role-separated acceptance is in scope.

## Requirement Mapping

- Requirement source: docs/01-requirements/00-index.md
"@
    $fixture = Set-SmokeFixture -Root $fixtureRoot -TaskId "role-separated-missing-source" -TaskKind "implementation" -PlanBody $roleMissingPlan
    Push-Location $fixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "FAIL_ROLE_ALIGNMENT_SOURCE_MISSING" -Command {
            & $scriptPath `
                -ProjectStatePath $fixture.StatePath `
                -QueuePath $fixture.QueuePath `
                -MatrixPath $fixture.MatrixPath `
                -TaskId "role-separated-missing-source" `
                -ChangedFiles $fixture.ChangedPath
        }
    } finally {
        Pop-Location
    }

    $acceptancePlan = @"
# Task Plan: acceptance-role-mapping

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md

## Requirement Decision Map

- role-separated acceptance is in scope.

## Requirement Mapping

- Acceptance rows map to role experience matrix.
"@
    $fixture = Set-SmokeFixture `
        -Root $fixtureRoot `
        -TaskId "acceptance-role-mapping" `
        -TaskKind "acceptance_runtime_walkthrough" `
        -PlanBody $acceptancePlan `
        -EvidenceBody "## Role Mapping Result`n`n- role rows mapped." `
        -AuditBody "## Acceptance Mapping Result`n`n- acceptance rows reviewed."
    Push-Location $fixtureRoot
    try {
        $acceptanceOutput = @(
            & $scriptPath `
                -ProjectStatePath $fixture.StatePath `
                -QueuePath $fixture.QueuePath `
                -MatrixPath $fixture.MatrixPath `
                -TaskId "acceptance-role-mapping" `
                -ChangedFiles $fixture.ChangedPath
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $acceptanceOutput -Pattern "OK_SSOT_READ_LIST"
    Assert-Contains -Output $acceptanceOutput -Pattern "OK_REQUIREMENT_MAPPING_RESULT"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 requirement SSOT readiness smoke passed"
