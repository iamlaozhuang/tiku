$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`n$($Output -join "`n")"
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2LocalExperienceNextTaskProposal.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing local experience next-task proposal script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-local-experience-proposal-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot -Force | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $fixtureRoot -ChildPath "local-experience-coverage-matrix.yaml"

    @"
schemaVersion: 1
currentTask:
  id: student-full-flow
  status: closed
handoff:
  nextRecommendedAction: >-
    Next recommended work is standard-core-student-local-full-flow-contract-repair before admin ops validation.
    standard-admin-ops-logs-local-full-flow-validation remains pending behind the student blocker unless bypassed.
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: student-full-flow
    status: closed
    evidencePath: docs/05-execution-logs/evidence/student-full-flow.md
  - id: standard-admin-ops-logs-local-full-flow-validation
    status: pending
    evidencePath: docs/05-execution-logs/evidence/admin.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 1
matrix:
  - useCaseId: UC-STD-ACCOUNT-SESSION
    status: local_experience_ready
    nextTask: standard-core-student-local-full-flow-contract-repair
  - useCaseId: UC-STD-PRACTICE
    status: local_experience_ready
    nextTask: standard-core-student-local-full-flow-contract-repair
  - useCaseId: UC-STD-ADMIN-OPS-LOGS
    status: local_experience_ready
    nextTask: standard-admin-ops-logs-local-full-flow-validation
  - useCaseId: UC-FUTURE-ONLINE-PAYMENT
    status: release_blocked
    nextTask: none_future_non_goal
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    $seedOutput = @(& $scriptPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -MatrixPath $matrixPath)
    Assert-Contains -Output $seedOutput -Pattern '^localExperienceNextTaskDecision: seed_required$'
    Assert-Contains -Output $seedOutput -Pattern '^candidateTaskId: standard-core-student-local-full-flow-contract-repair$'
    Assert-Contains -Output $seedOutput -Pattern '^candidateTaskKind: local_full_flow_contract_repair$'
    Assert-Contains -Output $seedOutput -Pattern '^affectedUseCaseCount: 2$'
    Assert-Contains -Output $seedOutput -Pattern '^seedRequired: true$'
    Assert-Contains -Output $seedOutput -Pattern 'handoff_mentions_candidate'
    Assert-Contains -Output $seedOutput -Pattern 'repair_candidate_priority'
    Assert-Contains -Output $seedOutput -Pattern 'Cost Calibration Gate remains blocked'

    Add-Content -LiteralPath $queuePath -Encoding UTF8 -Value @"
  - id: standard-core-student-local-full-flow-contract-repair
    status: pending
    evidencePath: docs/05-execution-logs/evidence/student-repair.md
"@

    $existingOutput = @(& $scriptPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -MatrixPath $matrixPath)
    Assert-Contains -Output $existingOutput -Pattern '^localExperienceNextTaskDecision: existing_task_available$'
    Assert-Contains -Output $existingOutput -Pattern '^candidateTaskId: standard-core-student-local-full-flow-contract-repair$'
    Assert-Contains -Output $existingOutput -Pattern '^seedRequired: false$'

    $missingOutput = @(& $scriptPath -ProjectStatePath $projectStatePath -QueuePath $queuePath -MatrixPath (Join-Path -Path $fixtureRoot -ChildPath "missing.yaml"))
    Assert-Contains -Output $missingOutput -Pattern '^localExperienceNextTaskDecision: no_candidate$'
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 local experience next-task proposal smoke passed"
