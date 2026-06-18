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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "New-ModuleRunV2LocalExperienceTaskSeed.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing local experience task seed script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-local-experience-seed-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot -Force | Out-Null

try {
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    @"
schemaVersion: 1
tasks:
  - id: closed-prerequisite
    status: closed
    evidencePath: docs/05-execution-logs/evidence/closed.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $approvalRequiredOutput = @(
        & $scriptPath `
            -TemplateKind local_full_flow_contract_repair `
            -TaskId standard-core-student-local-full-flow-contract-repair `
            -QueuePath $queuePath `
            -TargetExperienceChain standard-core-student `
            -UseCaseIds UC-STD-ACCOUNT-SESSION, UC-STD-PRACTICE
    )
    Assert-Contains -Output $approvalRequiredOutput -Pattern '^localExperienceSeedDecision: approval_required$'
    Assert-Contains -Output $approvalRequiredOutput -Pattern 'repair seed requires explicit product allowedFiles'

    $beforeHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    $proposalOutput = @(
        & $scriptPath `
            -TemplateKind local_full_flow_contract_repair `
            -TaskId standard-core-student-local-full-flow-contract-repair `
            -QueuePath $queuePath `
            -TargetExperienceChain standard-core-student `
            -UseCaseIds UC-STD-ACCOUNT-SESSION, UC-STD-PRACTICE `
            -AllowedFiles 'src/features/student/**','tests/unit/student-practice-ui.test.ts','docs/04-agent-system/state/local-experience-coverage-matrix.yaml'
    )
    $afterHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    if ($beforeHash -ne $afterHash) {
        throw "Proposal-only seed must not mutate the queue."
    }
    Assert-Contains -Output $proposalOutput -Pattern '^localExperienceSeedDecision: proposal_available$'
    Assert-Contains -Output $proposalOutput -Pattern '^templateKind: local_full_flow_contract_repair$'
    Assert-Contains -Output $proposalOutput -Pattern 'executionProfile: local_unit_tdd_plus_scoped_local_full_flow'
    Assert-Contains -Output $proposalOutput -Pattern 'dependencies: \[\]'
    Assert-Contains -Output $proposalOutput -Pattern 'Cost Calibration Gate remains blocked'

    $applyOutput = @(
        & $scriptPath `
            -TemplateKind experience_closure_readiness_audit `
            -TaskId standard-core-student-experience-closure-readiness-audit `
            -QueuePath $queuePath `
            -TargetExperienceChain standard-core-student `
            -UseCaseIds UC-STD-ACCOUNT-SESSION, UC-STD-PRACTICE `
            -Apply
    )
    Assert-Contains -Output $applyOutput -Pattern '^localExperienceSeedDecision: applied$'
    $queueContent = Get-Content -LiteralPath $queuePath -Raw
    if ($queueContent -notmatch 'standard-core-student-experience-closure-readiness-audit') {
        throw "Apply mode did not append the seeded task."
    }
    if ($queueContent -match '(?m)^\s+dependencies:\s*\r?\n\s+- none\s*$') {
        throw "Seeded tasks must not write '- none' as a dependency."
    }

    $existingOutput = @(
        & $scriptPath `
            -TemplateKind experience_closure_readiness_audit `
            -TaskId standard-core-student-experience-closure-readiness-audit `
            -QueuePath $queuePath
    )
    Assert-Contains -Output $existingOutput -Pattern '^localExperienceSeedDecision: already_exists$'
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 local experience task seed smoke passed"
