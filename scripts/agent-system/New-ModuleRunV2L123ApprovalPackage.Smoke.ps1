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
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-l123-package-smoke-" + [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    return $root
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "New-ModuleRunV2L123ApprovalPackage.ps1"
$fixtureRoot = New-FixtureRoot
try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $fixtureRoot -ChildPath "local-experience-coverage-matrix.yaml"
    $executionLogRoot = Join-Path -Path $fixtureRoot -ChildPath "logs"
    $taskId = "sample-source-governance-fresh-approval-required"

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
  - useCaseId: UC-SAMPLE-GOVERNANCE
    freshEvidence: not_required
    status: release_blocked
    nextTask: $taskId
"@

    $queueBefore = Get-Content -LiteralPath $queuePath -Raw
    $matrixBefore = Get-Content -LiteralPath $matrixPath -Raw
    $projectBefore = Get-Content -LiteralPath $projectStatePath -Raw
    $dryRunOutput = @(
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
            -TaskId $taskId `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -ExecutionLogRoot $executionLogRoot
    )
    Assert-Contains -Output $dryRunOutput -Pattern "l123ApprovalPackageDecision: plan_only" -Message "Dry-run should remain plan-only"
    if ((Get-Content -LiteralPath $queuePath -Raw) -ne $queueBefore) {
        throw "Dry-run mutated queue fixture"
    }
    if ((Get-Content -LiteralPath $matrixPath -Raw) -ne $matrixBefore) {
        throw "Dry-run mutated matrix fixture"
    }
    if ((Get-Content -LiteralPath $projectStatePath -Raw) -ne $projectBefore) {
        throw "Dry-run mutated project-state fixture"
    }

    $applyOutput = @(
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
            -TaskId $taskId `
            -Apply `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -MatrixPath $matrixPath `
            -ExecutionLogRoot $executionLogRoot
    )
    Assert-Contains -Output $applyOutput -Pattern "l123ApprovalPackageDecision: applied" -Message "Apply should materialize package"
    Assert-Contains -Output @(Get-Content -LiteralPath $queuePath) -Pattern "id: $taskId" -Message "Apply should add queue seed"
    Assert-Contains -Output @(Get-Content -LiteralPath $matrixPath) -Pattern "nextTask: none_until_sample_source_governance_fresh_approval_required_fresh_approval" -Message "Apply should close matrix nextTask"

    $generatedEvidence = Get-ChildItem -LiteralPath (Join-Path -Path $executionLogRoot -ChildPath "evidence") -Filter "*$taskId.md" -ErrorAction Stop
    if ($generatedEvidence.Count -eq 0) {
        throw "Apply did not generate evidence file"
    }
} finally {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
}

Write-Output "Module Run v2 L123 approval package smoke passed"
