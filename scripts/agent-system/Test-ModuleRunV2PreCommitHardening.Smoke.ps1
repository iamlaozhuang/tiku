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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PreCommitHardening.ps1"
$phase11ScopeCorrectionGuardText = Get-Content -LiteralPath $scriptPath -Raw -Encoding UTF8
# C4-ADAPTER-CONSISTENCY-BEGIN
$approvedSameTaskTransitionAdapterMarkers = @("P1ApprovedSameTaskTransition.Common.ps1", "Get-P1ApprovedSameTaskTransitionStageInputs", "p1ApprovedSameTaskTransitionAutomatic", "function Invoke-P1ApprovedSameTaskTransitionAdapter", "Read-P1ApprovedSameTaskTransitionContract", "Test-P1ApprovedSameTaskTransition", "p1ApprovedSameTaskTransitionCoreFinding")
$missingApprovedSameTaskTransitionAdapterMarkers = @($approvedSameTaskTransitionAdapterMarkers | Where-Object { -not $phase11ScopeCorrectionGuardText.Contains($_) })
if ($missingApprovedSameTaskTransitionAdapterMarkers.Count -gt 0) { throw "Module pre-commit adapter consistency RED: $($missingApprovedSameTaskTransitionAdapterMarkers -join ', ')" }
# C4-ADAPTER-CONSISTENCY-END
$p1GuardPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-P1RemediationSerialProgram.ps1"
$p1GuardText = Get-Content -LiteralPath $p1GuardPath -Raw -Encoding UTF8
$phase11ScopeCorrectionPatterns = @(
    "p1F0115Phase11ScopeCorrectionTaskId",
    "Test-P1F0115Phase11ScopeCorrectionFileSet",
    "Test-P1F0115Phase11ScopeCorrectionAnchors",
    "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time",
    "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_QUEUE_DELTA_INVALID",
    "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID",
    "582c156afb0cdde8a3daa99785fda8540b56fe27",
    "tests/unit/phase-11-system-ops-user-management-loop.test.ts"
)
$missingPhase11ScopeCorrectionPatterns = @($phase11ScopeCorrectionPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingPhase11ScopeCorrectionPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0115 phase-11 scope-correction contract: $($missingPhase11ScopeCorrectionPatterns -join ', ')"
}
$modulePrecommitHotfixPatterns = @(
    "p1F0115ModulePrecommitHotfixTaskId",
    "Test-P1F0115ModulePrecommitHotfixFileSet",
    "Test-P1F0115ModulePrecommitHotfixAnchors",
    "p1F0115ModulePrecommitHotfixAuthorization: approved_one_time",
    "Test-IsExplicitNonSecretFixture",
    "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
)
$missingModulePrecommitHotfixPatterns = @($modulePrecommitHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingModulePrecommitHotfixPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0115 Module hotfix contract: $($missingModulePrecommitHotfixPatterns -join ', ')"
}
$f0116DesignPathHotfixPatterns = @(
    "p1F0116DesignPathGuardHotfixTaskId",
    "Test-P1F0116DesignPathGuardHotfixFileSet",
    "Test-P1F0116DesignPathGuardHotfixAnchors",
    "p1F0116DesignPathGuardHotfixAuthorization: approved_one_time",
    "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
)
$missingF0116DesignPathHotfixPatterns = @($f0116DesignPathHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0116DesignPathHotfixPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0116 designPath hotfix contract: $($missingF0116DesignPathHotfixPatterns -join ', ')"
}
$f0116ScopeCorrectionHotfixPatterns = @(
    "p1F0116ScopeCorrectionGuardHotfixTaskId",
    "Test-P1F0116ScopeCorrectionGuardHotfixFileSet",
    "Test-P1F0116ScopeCorrectionGuardHotfixAnchors",
    "p1F0116ScopeCorrectionGuardHotfixAuthorization: approved_one_time",
    "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
)
$missingF0116ScopeCorrectionHotfixPatterns = @($f0116ScopeCorrectionHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0116ScopeCorrectionHotfixPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0116 scope-correction hotfix contract: $($missingF0116ScopeCorrectionHotfixPatterns -join ', ')"
}
$f0117SpecApprovalHotfixPatterns = @(
    "p1F0117SpecApprovalTransitionHotfixTaskId",
    "Test-P1F0117SpecApprovalTransitionHotfixFileSet",
    "Test-P1F0117SpecApprovalTransitionHotfixAnchors",
    "p1F0117SpecApprovalTransitionHotfixAuthorization: approved_one_time",
    "366f17446e9fc75a777ebfe5977ad72db1062eb7",
    "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID"
)
$missingF0117SpecApprovalHotfixPatterns = @($f0117SpecApprovalHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0117SpecApprovalHotfixPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0117 spec-approval transition contract: $($missingF0117SpecApprovalHotfixPatterns -join ', ')"
}
$f0143SpecApprovalHotfixPatterns = @(
    "p1F0143SpecApprovalTransitionHotfixTaskId",
    "Test-P1F0143SpecApprovalTransitionHotfixFileSet",
    "Test-P1F0143SpecApprovalTransitionHotfixAnchors",
    "p1F0143SpecApprovalTransitionHotfixAuthorization: approved_one_time",
    "0fe8edae7a7efc00154f5c54227623be55796983",
    "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID"
)
$missingF0143SpecApprovalHotfixPatterns = @($f0143SpecApprovalHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0143SpecApprovalHotfixPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0143 spec-approval transition contract: $($missingF0143SpecApprovalHotfixPatterns -join ', ')"
}
foreach ($sourceSpecificContract in @(
    @{ Label = "P1"; Text = $p1GuardText; Pattern = "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID" },
    @{ Label = "Module pre-commit"; Text = $phase11ScopeCorrectionGuardText; Pattern = "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID" }
)) {
    if ($sourceSpecificContract.Text -notmatch [regex]::Escape($sourceSpecificContract.Pattern)) {
        throw "$($sourceSpecificContract.Label) is RED for the F-0143 source-specific contract: $($sourceSpecificContract.Pattern)"
    }
}
$f0117SmokeScopeCorrectionPatterns = @(
    "p1F0117SmokeScopeCorrectionTaskId",
    "Test-P1F0117SmokeScopeCorrectionFileSet",
    "Test-P1F0117SmokeScopeCorrectionAnchors",
    "p1F0117SmokeScopeCorrectionAuthorization: approved_one_time",
    "3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a",
    "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
)
$missingF0117SmokeScopeCorrectionPatterns = @($f0117SmokeScopeCorrectionPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0117SmokeScopeCorrectionPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0117 smoke scope-correction contract: $($missingF0117SmokeScopeCorrectionPatterns -join ', ')"
}
$f0117SmokeScopeCloseoutLifecycleHotfixPatterns = @(
    "p1F0117SmokeScopeCloseoutLifecycleHotfixTaskId",
    "Test-P1F0117SmokeScopeCloseoutLifecycleHotfixFileSet",
    "Test-P1F0117SmokeScopeCloseoutLifecycleHotfixAnchors",
    "p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorization: approved_one_time",
    "71f150ceef0af54fca8d72db20a4254313630c7f",
    "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_ALLOWLIST_MISMATCH"
)
$missingF0117SmokeScopeCloseoutLifecycleHotfixPatterns = @($f0117SmokeScopeCloseoutLifecycleHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0117SmokeScopeCloseoutLifecycleHotfixPatterns.Count -gt 0) {
    throw "Module pre-commit is RED for the F-0117 smoke scope closeout lifecycle hotfix contract: $($missingF0117SmokeScopeCloseoutLifecycleHotfixPatterns -join ', ')"
}
foreach ($guardContract in @(
    @{ Label = "P1"; Text = $p1GuardText },
    @{ Label = "Module pre-commit"; Text = $phase11ScopeCorrectionGuardText }
)) {
    $fileSetFunction = [regex]::Match($guardContract.Text, '(?ms)^function Test-P1F0143SpecApprovalTransitionHotfixFileSet\s*\{.*?(?=^function\s+)').Value
    if ([string]::IsNullOrWhiteSpace($fileSetFunction) `
        -or $fileSetFunction -notmatch [regex]::Escape('Sort-Object -CaseSensitive -Unique') `
        -or $fileSetFunction -notmatch [regex]::Escape('$normalizedActualFiles.Count -ne $normalizedExpectedFiles.Count')) {
        throw "$($guardContract.Label) F-0143 file-set function is not case-duplicate safe."
    }
}
$modulePrePushPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PrePushReadiness.ps1"

foreach ($requiredScriptPath in @($scriptPath, $p1GuardPath, $modulePrePushPath)) {
    if (-not (Test-Path -LiteralPath $requiredScriptPath)) { throw "Missing governance smoke dependency: $requiredScriptPath" }
}

$taskId = "precommit-hardening-smoke-task"
$normalFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-pre-commit-normal-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $normalFixtureRoot | Out-Null
& git -C $normalFixtureRoot init | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to initialize normal pre-commit fixture repository."
}

New-Item -ItemType Directory -Force -Path `
    (Join-Path -Path $normalFixtureRoot -ChildPath "docs\04-agent-system\state"), `
    (Join-Path -Path $normalFixtureRoot -ChildPath "docs\05-execution-logs\task-plans"), `
    (Join-Path -Path $normalFixtureRoot -ChildPath "docs\05-execution-logs\evidence"), `
    (Join-Path -Path $normalFixtureRoot -ChildPath "docs\05-execution-logs\audits-reviews") | Out-Null

$normalProjectStatePath = Join-Path -Path $normalFixtureRoot -ChildPath "docs\04-agent-system\state\project-state.yaml"
$normalQueuePath = Join-Path -Path $normalFixtureRoot -ChildPath "docs\04-agent-system\state\task-queue.yaml"
$normalMatrixPath = Join-Path -Path $normalFixtureRoot -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
@"
schemaVersion: 1
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $normalProjectStatePath -Encoding UTF8
@"
schemaVersion: 1
tasks:
  - id: $taskId
    taskKind: read_only
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1
      - src/app/api/v1/employee-import-commands/[publicId]/route.ts
      - src/server/*.ts
      - docs/05-execution-logs/evidence/*.md
    blockedFiles:
      - package.json
      - package-lock.yaml
      - package-lock.json
      - pnpm-lock.yaml
      - src/**
      - e2e/**
"@ | Set-Content -LiteralPath $normalQueuePath -Encoding UTF8
@"
moduleRunVersion: 2
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $normalMatrixPath -Encoding UTF8

try {
Push-Location $normalFixtureRoot
try {
    $allowedOutput = @(
        & $scriptPath `
            -ProjectStatePath $normalProjectStatePath `
            -QueuePath $normalQueuePath `
            -MatrixPath $normalMatrixPath `
            -TaskId $taskId `
            -ChangedFiles "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1"
    )
} finally {
    Pop-Location
}
Assert-Contains -Output $allowedOutput -Pattern "Module Run v2 Pre-Commit Hardening"
Assert-Contains -Output $allowedOutput -Pattern "preCommitMode: hard_block"
Assert-Contains -Output $allowedOutput -Pattern "OK_SCOPE scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1"
Assert-Contains -Output $allowedOutput -Pattern "Cost Calibration Gate remains blocked"

$literalRoutePath = "src/app/api/v1/employee-import-commands/[publicId]/route.ts"
$safeSourcePath = "src/server/safe-fixture.ts"
$safeEvidencePath = "docs/05-execution-logs/evidence/safe-fixture.md"
foreach ($fixturePath in @($literalRoutePath, $safeSourcePath, $safeEvidencePath)) {
    $fixtureFullPath = Join-Path $normalFixtureRoot ($fixturePath -replace "/", "\")
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $fixtureFullPath) | Out-Null
}
Set-Content -LiteralPath (Join-Path $normalFixtureRoot ($literalRoutePath -replace "/", "\")) -Value "export const runtime = 'nodejs';" -Encoding UTF8
Set-Content -LiteralPath (Join-Path $normalFixtureRoot ($safeSourcePath -replace "/", "\")) -Value @'
const passwordHash = "fixture-hash";
const account = { password: passwordHash, };
const placeholder = { password: "placeholder-password-hash-1" };
const session = { token: "Bearer admin-session-token" };
const update = { password: sql`case ${passwordCases} else current_password end` };
'@ -Encoding UTF8
Set-Content -LiteralPath (Join-Path $normalFixtureRoot ($safeEvidencePath -replace "/", "\")) -Value '$env:DATABASE_URL = "postgresql://tiku_plan_only:tiku_plan_only@127.0.0.1:5432/tiku_plan_only"' -Encoding UTF8

$safeFixtureOutput = @(
    Push-Location $normalFixtureRoot
    try {
        & $scriptPath `
            -ProjectStatePath $normalProjectStatePath `
            -QueuePath $normalQueuePath `
            -MatrixPath $normalMatrixPath `
            -TaskId $taskId `
            -ChangedFiles @($literalRoutePath, $safeSourcePath, $safeEvidencePath)
    } finally {
        Pop-Location
    }
)
Assert-Contains -Output $safeFixtureOutput -Pattern "OK_SCOPE src/app/api/v1/employee-import-commands/\[publicId\]/route.ts"
Assert-Contains -Output $safeFixtureOutput -Pattern "OK_SCOPE src/server/safe-fixture.ts matches src/server/\*.ts"
Assert-Contains -Output $safeFixtureOutput -Pattern "pre-commit hardening passed"

$wrongLiteralRoutePath = "src/app/api/v1/employee-import-commands/[other]/route.ts"
$wrongLiteralRouteFullPath = Join-Path $normalFixtureRoot ($wrongLiteralRoutePath -replace "/", "\")
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $wrongLiteralRouteFullPath) | Out-Null
Set-Content -LiteralPath $wrongLiteralRouteFullPath -Value "export const runtime = 'nodejs';" -Encoding UTF8
Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE) src/app/api/v1/employee-import-commands/\[other\]/route.ts" -Command {
    Push-Location $normalFixtureRoot
    try {
        & $scriptPath `
            -ProjectStatePath $normalProjectStatePath `
            -QueuePath $normalQueuePath `
            -MatrixPath $normalMatrixPath `
            -TaskId $taskId `
            -ChangedFiles $wrongLiteralRoutePath
    } finally {
        Pop-Location
    }
}

$passwordField = "pass" + "word"
$tokenField = "to" + "ken"
$realSecretFixtures = @(
    @{ Name = "quoted-password"; Content = "const leaked = { ${passwordField}: `"ActualSecretValue123`" };" },
    @{ Name = "quoted-token"; Content = "const leaked = { ${tokenField}: 'ProductionToken123456' };" },
    @{ Name = "prefixed-secret"; Content = "const leaked = { ${passwordField}: `"test-ActualSecretValue123`" };" },
    @{ Name = "sql-literal-secret"; Content = "const leaked = { ${passwordField}: sql``select 'ActualSecretValue123'`` };" },
    @{ Name = "sql-immediate-literal-secret"; Content = "const leaked = { ${passwordField}: sql``'ActualSecretValue123'`` };" },
    @{ Name = "sql-spaced-literal-secret"; Content = "const leaked = { ${passwordField}: sql`` `"ActualSecretValue123`"`` };" },
    @{ Name = "second-sql-match-secret"; Content = "const leaked = { ${passwordField}: sql``safe_expr``, ${tokenField}: sql``'ActualSecretValue123'`` };" },
    @{ Name = "second-match-secret"; Content = "const leaked = { ${passwordField}: `"placeholder-password-hash-1`", ${tokenField}: `"ActualSecretToken123456`" };" }
)
foreach ($realSecretFixture in $realSecretFixtures) {
    $realSecretPath = "src/server/real-secret-$($realSecretFixture.Name).ts"
    Set-Content -LiteralPath (Join-Path $normalFixtureRoot ($realSecretPath -replace "/", "\")) -Value $realSecretFixture.Content -Encoding UTF8
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SENSITIVE_EVIDENCE src/server/real-secret-$($realSecretFixture.Name)\.ts.*secret_assignment" -Command {
        Push-Location $normalFixtureRoot
        try {
            & $scriptPath `
                -ProjectStatePath $normalProjectStatePath `
                -QueuePath $normalQueuePath `
                -MatrixPath $normalMatrixPath `
                -TaskId $taskId `
                -ChangedFiles $realSecretPath
        } finally {
            Pop-Location
        }
    }
}

$realDatabaseUrlPath = "docs/05-execution-logs/evidence/real-database-url.md"
$databaseUrlField = "DATABASE" + "_URL"
$postgresScheme = "post" + "gresql"
Set-Content -LiteralPath (Join-Path $normalFixtureRoot ($realDatabaseUrlPath -replace "/", "\")) -Value "${databaseUrlField}=`"${postgresScheme}://prod_user:ActualSecret123@db.internal:5432/tiku`"" -Encoding UTF8
Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SENSITIVE_EVIDENCE docs/05-execution-logs/evidence/real-database-url.md.*database_(?:url|connection_url)" -Command {
    Push-Location $normalFixtureRoot
    try {
        & $scriptPath `
            -ProjectStatePath $normalProjectStatePath `
            -QueuePath $normalQueuePath `
            -MatrixPath $normalMatrixPath `
            -TaskId $taskId `
            -ChangedFiles $realDatabaseUrlPath
    } finally {
        Pop-Location
    }
}

$localhostDatabaseUrlPath = "docs/05-execution-logs/evidence/localhost-database-url.md"
Set-Content -LiteralPath (Join-Path $normalFixtureRoot ($localhostDatabaseUrlPath -replace "/", "\")) -Value "${databaseUrlField}=`"${postgresScheme}://test_user:test-ActualSecret123@localhost:5432/test_prod`"" -Encoding UTF8
Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SENSITIVE_EVIDENCE docs/05-execution-logs/evidence/localhost-database-url.md.*database_(?:url|connection_url)" -Command {
    Push-Location $normalFixtureRoot
    try {
        & $scriptPath `
            -ProjectStatePath $normalProjectStatePath `
            -QueuePath $normalQueuePath `
            -MatrixPath $normalMatrixPath `
            -TaskId $taskId `
            -ChangedFiles $localhostDatabaseUrlPath
    } finally {
        Pop-Location
    }
}

$batchShadowOutput = @(
    & $scriptPath `
        -ChangedFiles "docs/05-execution-logs/evidence/missing-docs-only-batch-smoke.md" `
        -DocsOnlyBatchId "missing-docs-only-batch-smoke" `
        -DocsOnlyBatchMode shadow
)
Assert-Contains -Output $batchShadowOutput -Pattern "preCommitScopeMode: docs_only_batch"
Assert-Contains -Output $batchShadowOutput -Pattern "docsOnlyBatchShadowDecision: would_block"
Assert-Contains -Output $batchShadowOutput -Pattern "pre-commit hardening passed"

$lowRiskBatchShadowOutput = @(
    & $scriptPath `
        -ChangedFiles "docs/05-execution-logs/evidence/missing-low-risk-experience-batch-smoke.md" `
        -LowRiskExperienceBatchId "missing-low-risk-experience-batch-smoke" `
        -LowRiskExperienceBatchMode shadow
)
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "preCommitScopeMode: low_risk_experience_batch"
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "lowRiskExperienceBatchShadowDecision: would_block"
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "scopeScan: delegated_low_risk_experience_batch"
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "pre-commit hardening passed"

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE package.json" -Command {
    Push-Location $normalFixtureRoot
    try {
        & $scriptPath `
            -ProjectStatePath $normalProjectStatePath `
            -QueuePath $normalQueuePath `
            -MatrixPath $normalMatrixPath `
            -TaskId $taskId `
            -ChangedFiles "package.json"
    } finally {
        Pop-Location
    }
}

$seedFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-pre-commit-seed-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $seedFixtureRoot | Out-Null
try {
    & git -C $seedFixtureRoot init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize seed pre-commit fixture repository."
    }

    New-Item -ItemType Directory -Path `
        (Join-Path -Path $seedFixtureRoot -ChildPath "docs\04-agent-system\state"), `
        (Join-Path -Path $seedFixtureRoot -ChildPath "docs\05-execution-logs\evidence"), `
        (Join-Path -Path $seedFixtureRoot -ChildPath "docs\05-execution-logs\audits-reviews") | Out-Null

    $seedProjectStatePath = Join-Path -Path $seedFixtureRoot -ChildPath "docs\04-agent-system\state\project-state.yaml"
    $seedQueuePath = Join-Path -Path $seedFixtureRoot -ChildPath "docs\04-agent-system\state\task-queue.yaml"
    $seedMatrixPath = Join-Path -Path $seedFixtureRoot -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
    @"
schemaVersion: 1

currentTask:
  id: closed-activation
"@ | Set-Content -LiteralPath $seedProjectStatePath -Encoding UTF8
    @"
schemaVersion: 1
tasks:
  - id: closed-activation
    status: done
"@ | Set-Content -LiteralPath $seedQueuePath -Encoding UTF8
    @"
moduleRunVersion: 2
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $seedMatrixPath -Encoding UTF8
    & git -C $seedFixtureRoot add docs | Out-Null
    & git -C $seedFixtureRoot -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "seed pre-commit baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit seed pre-commit baseline."
    }

    Add-Content -LiteralPath $seedQueuePath -Value @"
  - id: authorization-and-access-smoke
    seededImplementationTask: true
    seededExecutionModule: authorization-and-access
    status: pending
"@ -Encoding UTF8
    $seedEvidencePath = Join-Path -Path $seedFixtureRoot -ChildPath "docs\05-execution-logs\evidence\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md"
    Set-Content -LiteralPath $seedEvidencePath -Value "autoDriveLocalImplementationApproval`nCost Calibration Gate remains blocked" -Encoding UTF8
    $seedAuditPath = Join-Path -Path $seedFixtureRoot -ChildPath "docs\05-execution-logs\audits-reviews\2026-06-09-module-run-v2-auto-seed-authorization-and-access.md"
    Set-Content -LiteralPath $seedAuditPath -Value "autoDriveLocalImplementationApproval`nCost Calibration Gate remains blocked" -Encoding UTF8
    & git -C $seedFixtureRoot add `
        "docs/04-agent-system/state/task-queue.yaml" `
        "docs/05-execution-logs/evidence/2026-06-09-module-run-v2-auto-seed-authorization-and-access.md" `
        "docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-auto-seed-authorization-and-access.md" | Out-Null

    Push-Location $seedFixtureRoot
    try {
        $seedScopeOutput = @(
            & $scriptPath `
                -ProjectStatePath $seedProjectStatePath `
                -QueuePath $seedQueuePath `
                -MatrixPath $seedMatrixPath
        )
    } finally {
        Pop-Location
    }
Assert-Contains -Output $seedScopeOutput -Pattern "preCommitScopeMode: seed_transaction"
Assert-Contains -Output $seedScopeOutput -Pattern "OK_SCOPE docs/04-agent-system/state/task-queue.yaml"
} finally {
    if (Test-Path -LiteralPath $seedFixtureRoot) {
        Remove-Item -LiteralPath $seedFixtureRoot -Recurse -Force
    }
}

$mechanicScopeOutput = @(
    & $scriptPath -ChangedFiles @(
        "docs/04-agent-system/state/project-state.yaml",
        "docs/05-execution-logs/audits-reviews/2026-06-10-module-run-v2-mechanic-unattended-readiness-lines.md",
        "docs/05-execution-logs/evidence/2026-06-10-module-run-v2-mechanic-unattended-readiness-lines.md",
        "docs/05-execution-logs/task-plans/2026-06-10-module-run-v2-mechanic-unattended-readiness-lines.md",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
        "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1"
    )
)
Assert-Contains -Output $mechanicScopeOutput -Pattern "preCommitScopeMode: mechanic_repair"
Assert-Contains -Output $mechanicScopeOutput -Pattern "OK_SCOPE scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1"
Assert-Contains -Output $mechanicScopeOutput -Pattern "OK_SCOPE docs/05-execution-logs/evidence/2026-06-10-module-run-v2-mechanic-unattended-readiness-lines.md"

$hotfixBaseSha = "4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3"
$hotfixFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-p1-transition-hotfix-" + [guid]::NewGuid().ToString("N"))
$sourceRepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$hotfixFiles = @(
    ".husky/pre-push",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "docs/05-execution-logs/acceptance/2026-07-16-p1-prepush-transition-hotfix-authorization.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-prepush-transition-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-prepush-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-16-p1-prepush-transition-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-16-p1-prepush-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-16-p1-remediation-program-bootstrap.md",
    "docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-program-bootstrap.md"
)

try {
    & git clone --quiet --no-checkout $sourceRepositoryRoot $hotfixFixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone P1 transition hotfix fixture repository." }
    & git -C $hotfixFixtureRoot config core.longpaths true
    & git -C $hotfixFixtureRoot sparse-checkout init --no-cone
    $hotfixSparseFiles = @(
        $hotfixFiles + @(
            "docs/04-agent-system/state/project-state.yaml",
            "docs/04-agent-system/state/task-queue.yaml",
            "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml",
            "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md",
            "docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md",
            "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md",
            "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-program-bootstrap.md",
            "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml",
            "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml",
            "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml"
        )
    )
    & git -C $hotfixFixtureRoot sparse-checkout set --no-cone -- $hotfixSparseFiles
    & git -C $hotfixFixtureRoot switch --quiet -C codex/p1-prepush-transition-hotfix $hotfixBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out the pinned P1 transition hotfix base." }
    & git -C $hotfixFixtureRoot config user.name "P1 Transition Hotfix Smoke"
    & git -C $hotfixFixtureRoot config user.email "p1-transition-hotfix-smoke@example.invalid"
    & git -C $hotfixFixtureRoot config core.autocrlf false

    foreach ($hotfixFile in $hotfixFiles) {
        $hotfixFullPath = Join-Path $hotfixFixtureRoot $hotfixFile
        $hotfixDirectory = Split-Path -Parent $hotfixFullPath
        if (-not (Test-Path -LiteralPath $hotfixDirectory)) { New-Item -ItemType Directory -Force -Path $hotfixDirectory | Out-Null }
        if (Test-Path -LiteralPath $hotfixFullPath) {
            Add-Content -LiteralPath $hotfixFullPath -Value "P1 transition hotfix smoke change." -Encoding UTF8
        } else {
            Set-Content -LiteralPath $hotfixFullPath -Value "P1 transition pre-push hotfix smoke artifact." -Encoding UTF8
        }
    }
    $hotfixAuthorizationPath = Join-Path $hotfixFixtureRoot "docs/05-execution-logs/acceptance/2026-07-16-p1-prepush-transition-hotfix-authorization.md"
    Set-Content -LiteralPath $hotfixAuthorizationPath -Encoding UTF8 -Value @"
# P1 Transition Pre-Push Hotfix Authorization

Status: approved
Human approval source: current user message in the Codex conversation on 2026-07-16.
Task ID: p1-prepush-transition-ancestor-gate-hotfix-2026-07-16
Base: $hotfixBaseSha
Approved scope: pre-push orchestration, P1 guard, Module Run guards, and corresponding smoke tests.
"@
    & git -C $hotfixFixtureRoot add -- $hotfixFiles
    $stagedHotfixFiles = @(& git -C $hotfixFixtureRoot diff --cached --name-only --diff-filter=ACMR | Sort-Object -Unique)
    if (($stagedHotfixFiles -join "|") -cne (@($hotfixFiles | Sort-Object -Unique) -join "|")) {
        throw "P1 transition hotfix fixture did not stage the exact file set.`nActual: $($stagedHotfixFiles -join ', ')"
    }

    Push-Location $hotfixFixtureRoot
    try {
        $hotfixOutput = @(& $scriptPath)
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $hotfixOutput -Pattern "preCommitScopeMode: p1_transition_hotfix"
    Assert-Contains -Output $hotfixOutput -Pattern "p1TransitionHotfixAuthorization: approved_one_time"
    Assert-Contains -Output $hotfixOutput -Pattern "OK_SCOPE .husky/pre-push"

    $p1HotfixOutput = @(
        & $p1GuardPath `
            -RepositoryRoot $hotfixFixtureRoot `
            -Phase pre_commit `
            -SkipExternalIntegrityChecks
    )
    Assert-Contains -Output $p1HotfixOutput -Pattern "p1HotfixAuthorization: approved_one_time"
    Assert-Contains -Output $p1HotfixOutput -Pattern "p1ProgramGuardResult: pass"

    & git -C $hotfixFixtureRoot reset --quiet HEAD -- .husky/pre-push
    $hotfixAliasPath = Join-Path $hotfixFixtureRoot "husky/pre-push"
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $hotfixAliasPath) | Out-Null
    Set-Content -LiteralPath $hotfixAliasPath -Encoding UTF8 -Value "dotfile alias must not enter the one-time bridge"
    & git -C $hotfixFixtureRoot add --sparse -- $hotfixAliasPath
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_OUT_OF_SCOPE husky/pre-push" -Command {
        Push-Location $hotfixFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $hotfixFixtureRoot reset --quiet HEAD -- $hotfixAliasPath
    & git -C $hotfixFixtureRoot add -- .husky/pre-push

    Set-Content -LiteralPath $hotfixAuthorizationPath -Encoding UTF8 -Value "Status: pending"
    & git -C $hotfixFixtureRoot add -- $hotfixAuthorizationPath
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_HOTFIX_AUTHORIZATION_INVALID" -Command {
        Push-Location $hotfixFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }

    Set-Content -LiteralPath $hotfixAuthorizationPath -Encoding UTF8 -Value @"
# P1 Transition Pre-Push Hotfix Authorization

Status: approved
Human approval source: current user message in the Codex conversation on 2026-07-16.
Task ID: p1-prepush-transition-ancestor-gate-hotfix-2026-07-16
Base: $hotfixBaseSha
Approved scope: pre-push orchestration, P1 guard, Module Run guards, and corresponding smoke tests.
"@
    $hotfixEscapePath = Join-Path $hotfixFixtureRoot "src/out-of-scope.ts"
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $hotfixEscapePath) | Out-Null
    Set-Content -LiteralPath $hotfixEscapePath -Encoding UTF8 -Value "export const outOfScope = true;"
    & git -C $hotfixFixtureRoot add --sparse -- $hotfixAuthorizationPath $hotfixEscapePath
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE src/out-of-scope.ts" -Command {
        Push-Location $hotfixFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
} finally {
    if (Test-Path -LiteralPath $hotfixFixtureRoot) {
        Remove-Item -LiteralPath $hotfixFixtureRoot -Recurse -Force
    }
}

$scopeCorrectionQueuePath = "docs/04-agent-system/state/task-queue.yaml"
$scopeCorrectionConfigurations = @(
    [pscustomobject]@{
        Label = "F-0132"
        BaseSha = "5a5d9ac9c66f00991c17c3af7410958199d02a79"
        Branch = "codex/p1-f0132-scope-correction-hotfix"
        ParentTaskId = "p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16"
        TaskId = "p1-f0132-scope-correction-hotfix-2026-07-16"
        AuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-16-p1-f0132-scope-correction-hotfix-authorization.md"
        EvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-f0132-scope-correction-hotfix.md"
        AuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0132-scope-correction-hotfix.md"
        DesignPath = "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix-design.md"
        PlanPath = "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix.md"
        ParentPlanPath = "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-redeem-entitlement-preview.md"
        ParentEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-redeem-entitlement-preview.md"
        ParentAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-redeem-entitlement-preview.md"
        AllowedFile = "tests/unit/phase-11-redeem-code-batch-management-loop.test.ts"
        QueueAnchor = "      - tests/unit/phase-8-student-authorization-redeem-runtime.test.ts"
        P1Marker = "p1F0132ScopeCorrectionAuthorization: approved_one_time"
        ModuleMode = "preCommitScopeMode: p1_f0132_scope_correction"
        P1ErrorPrefix = "P1_PROGRAM_F0132_SCOPE_CORRECTION"
        ModuleErrorPrefix = "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION"
        FreshApprovalDependency = $null
    },
    [pscustomobject]@{
        Label = "F-0115 phase-11"
        BaseSha = "582c156afb0cdde8a3daa99785fda8540b56fe27"
        Branch = "codex/p1-f0115-phase11-scope-correction-hotfix"
        ParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
        TaskId = "p1-f0115-phase11-scope-correction-hotfix-2026-07-17"
        AuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-authorization.md"
        EvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
        AuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
        DesignPath = "docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-design.md"
        PlanPath = "docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
        ParentPlanPath = "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md"
        ParentEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md"
        ParentAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md"
        AllowedFile = "tests/unit/phase-11-system-ops-user-management-loop.test.ts"
        QueueAnchor = "      - tests/unit/admin-user-org-auth-ops-baseline.test.ts"
        P1Marker = "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time"
        ModuleMode = "preCommitScopeMode: p1_f0115_phase11_scope_correction"
        P1ErrorPrefix = "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION"
        ModuleErrorPrefix = "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION"
        FreshApprovalDependency = "docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md"
    }
)

foreach ($scopeCorrectionConfiguration in $scopeCorrectionConfigurations) {
    $scopeCorrectionBaseSha = $scopeCorrectionConfiguration.BaseSha
    $scopeCorrectionBranch = $scopeCorrectionConfiguration.Branch
    $scopeCorrectionParentTaskId = $scopeCorrectionConfiguration.ParentTaskId
    $scopeCorrectionTaskId = $scopeCorrectionConfiguration.TaskId
    $scopeCorrectionAuthorizationPath = $scopeCorrectionConfiguration.AuthorizationPath
    $scopeCorrectionEvidencePath = $scopeCorrectionConfiguration.EvidencePath
    $scopeCorrectionAuditPath = $scopeCorrectionConfiguration.AuditPath
    $scopeCorrectionDesignPath = $scopeCorrectionConfiguration.DesignPath
    $scopeCorrectionPlanPath = $scopeCorrectionConfiguration.PlanPath
    $scopeCorrectionAllowedFile = $scopeCorrectionConfiguration.AllowedFile
    $scopeCorrectionFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-p1-scope-correction-" + [guid]::NewGuid().ToString("N"))
    $scopeCorrectionRemoteUrl = "file:///nonexistent/tiku-p1-scope-correction-origin.git"
    $scopeCorrectionFiles = @(
        $scopeCorrectionQueuePath,
        "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
        "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
        $scopeCorrectionAuthorizationPath,
        $scopeCorrectionDesignPath,
        $scopeCorrectionPlanPath,
        $scopeCorrectionEvidencePath,
        $scopeCorrectionAuditPath
    )

try {
    & git clone --quiet --shared --no-checkout $sourceRepositoryRoot $scopeCorrectionFixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0132 scope-correction fixture repository." }
    & git -C $scopeCorrectionFixtureRoot config core.longpaths true
    & git -C $scopeCorrectionFixtureRoot config core.autocrlf false
    & git -C $scopeCorrectionFixtureRoot sparse-checkout init --no-cone
    $scopeCorrectionSparseFiles = @(
        $scopeCorrectionFiles + @(
            "docs/04-agent-system/state/project-state.yaml",
            "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml",
            "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md",
            "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md",
            $scopeCorrectionConfiguration.ParentPlanPath,
            $scopeCorrectionConfiguration.ParentEvidencePath,
            $scopeCorrectionConfiguration.ParentAuditPath,
            "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml",
            "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml",
            "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml"
        )
    )
    & git -C $scopeCorrectionFixtureRoot sparse-checkout set --no-cone -- $scopeCorrectionSparseFiles
    & git -C $scopeCorrectionFixtureRoot switch --quiet -C $scopeCorrectionBranch $scopeCorrectionBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out the pinned F-0132 scope-correction base." }
    & git -C $scopeCorrectionFixtureRoot config user.name "P1 F-0132 Scope Correction Smoke"
    & git -C $scopeCorrectionFixtureRoot config user.email "p1-f0132-scope-correction-smoke@example.invalid"
    & git -C $scopeCorrectionFixtureRoot remote set-url origin $scopeCorrectionRemoteUrl
    & git -C $scopeCorrectionFixtureRoot update-ref refs/remotes/origin/master $scopeCorrectionBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to seed F-0132 scope-correction fixture origin tracking ref." }

    foreach ($scopeCorrectionFile in $scopeCorrectionFiles) {
        $scopeCorrectionFullPath = Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionFile
        $scopeCorrectionDirectory = Split-Path -Parent $scopeCorrectionFullPath
        if (-not (Test-Path -LiteralPath $scopeCorrectionDirectory)) { New-Item -ItemType Directory -Force -Path $scopeCorrectionDirectory | Out-Null }
        if ((Test-Path -LiteralPath $scopeCorrectionFullPath -PathType Leaf) -and $scopeCorrectionFile -ne $scopeCorrectionQueuePath) {
            Add-Content -LiteralPath $scopeCorrectionFullPath -Value "P1 F-0132 scope-correction smoke change." -Encoding UTF8
        }
    }

    $scopeCorrectionQueueFullPath = Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionQueuePath
    $scopeCorrectionQueueLines = [System.Collections.Generic.List[string]]::new()
    foreach ($scopeCorrectionQueueLine in @(Get-Content -LiteralPath $scopeCorrectionQueueFullPath)) { $scopeCorrectionQueueLines.Add($scopeCorrectionQueueLine) }
    $scopeCorrectionQueueAnchor = $scopeCorrectionConfiguration.QueueAnchor
    $scopeCorrectionQueueAnchorIndex = $scopeCorrectionQueueLines.IndexOf($scopeCorrectionQueueAnchor)
    if ($scopeCorrectionQueueAnchorIndex -lt 0 -or $scopeCorrectionQueueLines.Contains("      - $scopeCorrectionAllowedFile")) {
        throw "F-0132 scope-correction queue fixture anchor is missing or already materialized."
    }
    $scopeCorrectionQueueLines.Insert($scopeCorrectionQueueAnchorIndex + 1, "      - $scopeCorrectionAllowedFile")
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllLines($scopeCorrectionQueueFullPath, $scopeCorrectionQueueLines, $utf8NoBom)
    $scopeCorrectionExactQueueText = [System.IO.File]::ReadAllText($scopeCorrectionQueueFullPath, $utf8NoBom)

    $scopeCorrectionAuthorizationFullPath = Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionAuthorizationPath
    $scopeCorrectionAuthorizationText = @"
# P1 F-0132 Scope Correction Hotfix Authorization

Status: approved
Human approval source: current user message in the Codex conversation on 2026-07-16.
Task ID: $scopeCorrectionTaskId
Parent task: $scopeCorrectionParentTaskId
Base: $scopeCorrectionBaseSha
Branch: $scopeCorrectionBranch
Approved scope: exact single-line phase-11 allowlist correction for $scopeCorrectionAllowedFile, P1 guard, Module Run guard, and corresponding smoke tests. Every other in_progress SHA drift remains hard-blocked. Hook bypass is not approved.
"@
    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, $scopeCorrectionAuthorizationText, $utf8NoBom)

    $scopeCorrectionEvidenceFullPath = Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionEvidencePath
    [System.IO.File]::WriteAllText($scopeCorrectionEvidenceFullPath, @"
# P1 F-0132 Scope Correction Hotfix Evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## Requirement Mapping Result

Result: pass

## Root-Cause Reproduction

Result: pass

## TDD Evidence

Result: pass

## Validation Results

Result: pass

Cost Calibration Gate remains blocked.
"@, $utf8NoBom)

    $scopeCorrectionAuditFullPath = Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionAuditPath
    [System.IO.File]::WriteAllText($scopeCorrectionAuditFullPath, @"
# P1 F-0132 Scope Correction Hotfix Audit

## Round 1

Result: pass

## Round 2

Result: pass

## Decision

Decision: APPROVE
"@, $utf8NoBom)

    foreach ($scopeCorrectionDocPath in @(
        $scopeCorrectionDesignPath,
        $scopeCorrectionPlanPath
    )) {
        [System.IO.File]::WriteAllText((Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionDocPath), "# F-0132 scope-correction smoke artifact`n", $utf8NoBom)
    }

    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionFiles
    $stagedScopeCorrectionFiles = @(& git -C $scopeCorrectionFixtureRoot diff --cached --name-only --diff-filter=ACMR | Sort-Object -Unique)
    if (($stagedScopeCorrectionFiles -join "|") -cne (@($scopeCorrectionFiles | Sort-Object -Unique) -join "|")) {
        throw "F-0132 scope-correction fixture did not stage the exact file set.`nActual: $($stagedScopeCorrectionFiles -join ', ')"
    }

    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        $scopeCorrectionP1Output = @(& $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks)
        Assert-Contains -Output $scopeCorrectionP1Output -Pattern $scopeCorrectionConfiguration.P1Marker
        Assert-Contains -Output $scopeCorrectionP1Output -Pattern "p1ProgramGuardResult: pass"
    }

    Push-Location $scopeCorrectionFixtureRoot
    try {
        $scopeCorrectionOutput = @(& $scriptPath)
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $scopeCorrectionOutput -Pattern $scopeCorrectionConfiguration.ModuleMode
    Assert-Contains -Output $scopeCorrectionOutput -Pattern $scopeCorrectionConfiguration.P1Marker
    Assert-Contains -Output $scopeCorrectionOutput -Pattern "OK_SCOPE $([regex]::Escape($scopeCorrectionQueuePath))"

    & git -C $scopeCorrectionFixtureRoot branch -m codex/wrong-scope-correction
    Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.ModuleErrorPrefix)_CONTEXT_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $scopeCorrectionFixtureRoot branch -m $scopeCorrectionBranch

    $scopeCorrectionQueueStatusPattern = "(?m)(^  - id:\s*$([regex]::Escape($scopeCorrectionParentTaskId))\s*`$\r?\n(?:^    [^\r\n]*\r?\n)*?^    status:)\s+in_progress\s*`$"
    $scopeCorrectionWrongStatusText = [regex]::new($scopeCorrectionQueueStatusPattern).Replace($scopeCorrectionExactQueueText, '${1} ready_for_closeout', 1)
    if ($scopeCorrectionWrongStatusText -ceq $scopeCorrectionExactQueueText) { throw "F-0132 scope-correction queue status negative fixture did not mutate." }
    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, $scopeCorrectionWrongStatusText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath
    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.P1ErrorPrefix)_CONTEXT_INVALID" -Command {
            & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
        }
    }
    Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.ModuleErrorPrefix)_CONTEXT_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, $scopeCorrectionExactQueueText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath

    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, "Status: pending`n", $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionAuthorizationPath
    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.P1ErrorPrefix)_AUTHORIZATION_INVALID" -Command {
            & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
        }
    }
    Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.ModuleErrorPrefix)_AUTHORIZATION_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, $scopeCorrectionAuthorizationText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionAuthorizationPath

    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, "Status: pending in working tree only`n", $utf8NoBom)
    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.P1ErrorPrefix)_PARTIAL_STAGE_INVALID" -Command {
            & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
        }
    }
    Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.ModuleErrorPrefix)_PARTIAL_STAGE_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, $scopeCorrectionAuthorizationText, $utf8NoBom)

    $scopeCorrectionBaseTreeSha = ((& git -C $scopeCorrectionFixtureRoot rev-parse "$scopeCorrectionBaseSha`^{tree}") -join "").Trim()
    $scopeCorrectionWrongBaseSha = (("wrong base" | & git -C $scopeCorrectionFixtureRoot commit-tree $scopeCorrectionBaseTreeSha -p $scopeCorrectionBaseSha) -join "").Trim()
    & git -C $scopeCorrectionFixtureRoot update-ref "refs/heads/$scopeCorrectionBranch" $scopeCorrectionWrongBaseSha $scopeCorrectionBaseSha
    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.P1ErrorPrefix)_CONTEXT_INVALID" -Command {
            & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
        }
    }
    Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.ModuleErrorPrefix)_CONTEXT_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $scopeCorrectionFixtureRoot update-ref "refs/heads/$scopeCorrectionBranch" $scopeCorrectionBaseSha $scopeCorrectionWrongBaseSha

    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, ($scopeCorrectionExactQueueText + "      - tests/unit/unapproved-scope-expansion.test.ts`n"), $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath
    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.P1ErrorPrefix)_QUEUE_DELTA_INVALID" -Command {
            & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
        }
    }
    Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.ModuleErrorPrefix)_QUEUE_DELTA_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, $scopeCorrectionExactQueueText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath

    $scopeCorrectionMissingPath = $scopeCorrectionDesignPath
    & git -C $scopeCorrectionFixtureRoot reset --quiet HEAD -- $scopeCorrectionMissingPath
    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION|P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE" -Command {
            & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
        }
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_OUT_OF_SCOPE|HARD_BLOCK_BLOCKED_FILE" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionMissingPath

    $scopeCorrectionEscapePath = Join-Path $scopeCorrectionFixtureRoot "src/out-of-scope.ts"
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $scopeCorrectionEscapePath) | Out-Null
    [System.IO.File]::WriteAllText($scopeCorrectionEscapePath, "export const outOfScope = true;`n", $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add --sparse -- "src/out-of-scope.ts"
    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_BLOCKED_FILES_VIOLATION src/out-of-scope.ts|P1_PROGRAM_ALLOWED_FILES_VIOLATION src/out-of-scope.ts" -Command {
            & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
        }
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE src/out-of-scope.ts|HARD_BLOCK_OUT_OF_SCOPE src/out-of-scope.ts" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $scopeCorrectionFixtureRoot reset --quiet HEAD -- "src/out-of-scope.ts"
    Remove-Item -LiteralPath $scopeCorrectionEscapePath -Force

    if ($scopeCorrectionConfiguration.Label -eq "F-0115 phase-11") {
        & git -C $scopeCorrectionFixtureRoot commit --quiet -m "materialize F-0115 phase-11 approval once"
        if ($LASTEXITCODE -ne 0) { throw "Failed to materialize the F-0115 phase-11 replay parent." }
        foreach ($scopeCorrectionReplayFile in $scopeCorrectionFiles) {
            Add-Content -LiteralPath (Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionReplayFile) -Value "F-0115 phase-11 Module pre-commit replay must remain blocked." -Encoding UTF8
        }
        & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionFiles
        Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.ModuleErrorPrefix)_ALREADY_MATERIALIZED" -Command {
            Push-Location $scopeCorrectionFixtureRoot
            try { & $scriptPath } finally { Pop-Location }
        }
    }

    if ($scopeCorrectionConfiguration.Label -eq "F-0132") {
    $scopeCorrectionTreeSha = ((& git -C $scopeCorrectionFixtureRoot write-tree) -join "").Trim()
    $scopeCorrectionHeadSha = (("F-0132 scope-correction fixture" | & git -C $scopeCorrectionFixtureRoot commit-tree $scopeCorrectionTreeSha -p $scopeCorrectionBaseSha) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $scopeCorrectionHeadSha -notmatch '^[0-9a-f]{40}$') { throw "Failed to synthesize F-0132 scope-correction fixture commit." }
    & git -C $scopeCorrectionFixtureRoot update-ref "refs/heads/$scopeCorrectionBranch" $scopeCorrectionHeadSha $scopeCorrectionBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to advance F-0132 scope-correction fixture branch." }
    & git -C $scopeCorrectionFixtureRoot switch --quiet -C master $scopeCorrectionHeadSha
    $scopeCorrectionOriginUrl = ((& git -C $scopeCorrectionFixtureRoot remote get-url origin) -join "").Trim()
    $scopeCorrectionUpdateLine = "refs/heads/master $scopeCorrectionHeadSha refs/heads/master $scopeCorrectionBaseSha"
    $scopeCorrectionPrePushOutput = @(& $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $scopeCorrectionOriginUrl -PushUpdateLines $scopeCorrectionUpdateLine -SkipExternalIntegrityChecks)
    Assert-Contains -Output $scopeCorrectionPrePushOutput -Pattern $scopeCorrectionConfiguration.P1Marker
    Assert-Contains -Output $scopeCorrectionPrePushOutput -Pattern "p1TransitionScopeMode: transition_only"

    Push-Location $scopeCorrectionFixtureRoot
    try {
        $scopeCorrectionModulePrePushOutput = @(
            & $modulePrePushPath `
                -TaskId $scopeCorrectionParentTaskId `
                -ProjectStatePath (Join-Path $scopeCorrectionFixtureRoot "docs/04-agent-system/state/project-state.yaml") `
                -QueuePath $scopeCorrectionQueueFullPath `
                -MatrixPath (Join-Path $scopeCorrectionFixtureRoot "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml") `
                -EvidencePath $scopeCorrectionEvidenceFullPath `
                -AuditReviewPath $scopeCorrectionAuditFullPath `
                -SkipRemoteAheadCheck `
                -P1TransitionScopeMode transition_only
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $scopeCorrectionModulePrePushOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"
    Assert-Contains -Output $scopeCorrectionModulePrePushOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR origin/master"
    Assert-Contains -Output $scopeCorrectionModulePrePushOutput -Pattern "pre-push readiness passed"

    & git -C $scopeCorrectionFixtureRoot update-ref refs/remotes/origin/master $scopeCorrectionHeadSha $scopeCorrectionBaseSha
    foreach ($scopeCorrectionReplayFile in $scopeCorrectionFiles) {
        Add-Content -LiteralPath (Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionReplayFile) -Value "F-0132 replay must remain blocked." -Encoding UTF8
    }
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionFiles
    $scopeCorrectionReplayTreeSha = ((& git -C $scopeCorrectionFixtureRoot write-tree) -join "").Trim()
    $scopeCorrectionReplaySha = (("F-0132 scope-correction replay" | & git -C $scopeCorrectionFixtureRoot commit-tree $scopeCorrectionReplayTreeSha -p $scopeCorrectionHeadSha) -join "").Trim()
    & git -C $scopeCorrectionFixtureRoot update-ref refs/heads/master $scopeCorrectionReplaySha $scopeCorrectionHeadSha
    $scopeCorrectionReplayUpdateLine = "refs/heads/master $scopeCorrectionReplaySha refs/heads/master $scopeCorrectionHeadSha"
    Invoke-ExpectFailure -ExpectedPattern "$($scopeCorrectionConfiguration.P1ErrorPrefix)_ALREADY_MATERIALIZED" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $scopeCorrectionOriginUrl -PushUpdateLines $scopeCorrectionReplayUpdateLine -SkipExternalIntegrityChecks
    }
    }
} finally {
    if (Test-Path -LiteralPath $scopeCorrectionFixtureRoot) { Remove-Item -LiteralPath $scopeCorrectionFixtureRoot -Recurse -Force }
}
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-pre-commit-hardening-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $sensitiveFixture = Join-Path -Path $fixtureRoot -ChildPath "sensitive-evidence.md"
    $headerName = "Authori" + "zation"
    Set-Content -LiteralPath $sensitiveFixture -Value "$headerName`: Bearer example-token" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SENSITIVE_EVIDENCE" -Command {
        Push-Location $normalFixtureRoot
        try {
            & $scriptPath `
                -ProjectStatePath $normalProjectStatePath `
                -QueuePath $normalQueuePath `
                -MatrixPath $normalMatrixPath `
                -TaskId $taskId `
                -ChangedFiles $sensitiveFixture `
                -SkipScopeScan
        } finally {
            Pop-Location
        }
    }

    $termFixture = Join-Path -Path $fixtureRoot -ChildPath "banned-term.md"
    $nonGlossaryAuthTerm = "lic" + "ense"
    Set-Content -LiteralPath $termFixture -Value "Do not use $nonGlossaryAuthTerm in Tiku authorization surfaces." -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BANNED_TERM" -Command {
        Push-Location $normalFixtureRoot
        try {
            & $scriptPath `
                -ProjectStatePath $normalProjectStatePath `
                -QueuePath $normalQueuePath `
                -MatrixPath $normalMatrixPath `
                -TaskId $taskId `
                -ChangedFiles $termFixture `
                -SkipScopeScan
        } finally {
            Pop-Location
        }
    }

    $aiTextFixture = Join-Path -Path $fixtureRoot -ChildPath "ai-protected-evidence.md"
    $protectedAiField = ("ra" + "w" + "Prom" + "pt")
    Set-Content -LiteralPath $aiTextFixture -Value "$protectedAiField`: This protected AI request text is long enough to require redaction." -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "ai_protected_text" -Command {
        Push-Location $normalFixtureRoot
        try {
            & $scriptPath `
                -ProjectStatePath $normalProjectStatePath `
                -QueuePath $normalQueuePath `
                -MatrixPath $normalMatrixPath `
                -TaskId $taskId `
                -ChangedFiles $aiTextFixture `
                -SkipScopeScan
        } finally {
            Pop-Location
        }
    }

    $payloadFixture = Join-Path -Path $fixtureRoot -ChildPath "provider-payload-evidence.md"
    $payloadField = ("provider" + "Payload")
    Set-Content -LiteralPath $payloadFixture -Value "$payloadField`: { ""request"": ""protected provider payload that must not be recorded"" }" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "ai_protected_text" -Command {
        Push-Location $normalFixtureRoot
        try {
            & $scriptPath `
                -ProjectStatePath $normalProjectStatePath `
                -QueuePath $normalQueuePath `
                -MatrixPath $normalMatrixPath `
                -TaskId $taskId `
                -ChangedFiles $payloadFixture `
                -SkipScopeScan
        } finally {
            Pop-Location
        }
    }

    $redeemCodeFixture = Join-Path -Path $fixtureRoot -ChildPath "redeem-code-evidence.md"
    $redeemCodeField = "redeem" + "_code"
    Set-Content -LiteralPath $redeemCodeFixture -Value "$redeemCodeField`: ABCD-1234-EFGH" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "plaintext_redeem_code" -Command {
        Push-Location $normalFixtureRoot
        try {
            & $scriptPath `
                -ProjectStatePath $normalProjectStatePath `
                -QueuePath $normalQueuePath `
                -MatrixPath $normalMatrixPath `
                -TaskId $taskId `
                -ChangedFiles $redeemCodeFixture `
                -SkipScopeScan
        } finally {
            Pop-Location
        }
    }

    $databaseUrlFixture = Join-Path -Path $fixtureRoot -ChildPath "database-url-evidence.md"
    $databaseScheme = "post" + "gresql"
    Set-Content -LiteralPath $databaseUrlFixture -Value "connection: ${databaseScheme}://user:pass@localhost:5432/tiku" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "database_connection_url" -Command {
        Push-Location $normalFixtureRoot
        try {
            & $scriptPath `
                -ProjectStatePath $normalProjectStatePath `
                -QueuePath $normalQueuePath `
                -MatrixPath $normalMatrixPath `
                -TaskId $taskId `
                -ChangedFiles $databaseUrlFixture `
                -SkipScopeScan
        } finally {
            Pop-Location
        }
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

} finally {
    if (Test-Path -LiteralPath $normalFixtureRoot) {
        Remove-Item -LiteralPath $normalFixtureRoot -Recurse -Force
    }
}

$f0115ModuleBaseSha = "6bde2f2aec3d71fa0ce138b26f64243861cace6f"
$f0115ModuleBranch = "codex/p1-f0115-scope-correction-hotfix"
$f0115ModuleParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
$f0115ModuleTaskId = "p1-f0115-scope-correction-hotfix-2026-07-16"
$f0115ModuleQueuePath = "docs/04-agent-system/state/task-queue.yaml"
$f0115ModuleAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md"
$f0115ModuleEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md"
$f0115ModuleAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md"
$f0115ModuleFiles = @(
    $f0115ModuleQueuePath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $f0115ModuleAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix.md",
    $f0115ModuleEvidencePath,
    $f0115ModuleAuditPath
)
$f0115ModuleSourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$f0115ModuleUtf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

function Replace-F0115ModuleQueueAnchor {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Anchor,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Replacement,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $anchorCount = [regex]::Matches($Content, [regex]::Escape($Anchor)).Count
    if ($anchorCount -ne 1) {
        throw "F-0115 Module fixture anchor '$Label' expected once, found $anchorCount."
    }
    return $Content.Replace($Anchor, $Replacement)
}

function ConvertTo-F0115ModuleScopeCorrectionQueue {
    param([Parameter(Mandatory = $true)][string]$QueueText)

    $normalizedQueue = $QueueText -replace "`r`n?", "`n"
    $taskPattern = "(?ms)^  - id:\s*$([regex]::Escape($f0115ModuleParentTaskId))\s*`n.*?(?=^  - id:|^standingAuthorization:|\z)"
    $taskMatch = [regex]::Match($normalizedQueue, $taskPattern)
    if (-not $taskMatch.Success -or [regex]::Matches($normalizedQueue, $taskPattern).Count -ne 1) {
        throw "F-0115 Module fixture parent task block must exist exactly once."
    }
    $candidateTaskBlock = $taskMatch.Value

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "fresh approval source" -Anchor @"
    approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
    authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
    executionProfile: R3
"@ -Replacement @"
    approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
    authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
    freshApprovalSource: docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md
    executionProfile: R3
"@

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "rollback boundary" -Anchor @"
    rollbackOrStopCondition: stop_if_schema_migration_persistent_batch_command_database_runtime_external_distribution_service_or_other_finding_repair_is_required
"@ -Replacement @"
    rollbackOrStopCondition: stop_if_generated_migration_source_would_be_executed_or_if_dependency_database_provider_runtime_p2_pr_force_push_deploy_or_other_finding_repair_is_required
"@

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "focused gates" -Anchor @"
    focusedGates:
      - jit_post_p0_credential_membership_transaction_boundary
      - auth_user_auth_account_user_employee_quota_atomicity
      - employee_creation_failure_rolls_back_all_identity_side_effects
      - account_phone_conflict_and_concurrent_retry_fail_closed
      - batch_row_exception_returns_explainable_partial_result_without_losing_success_rows
      - one_time_initial_password_only_for_committed_rows
      - response_loss_and_retry_boundary_explicitly_classified
      - operations_or_super_admin_write_boundary_preserved
      - focused_service_repository_route_and_static_regression
      - full_static_regression
      - two_round_adversarial_review
"@ -Replacement @"
    focusedGates:
      - persistent_employee_import_command_idempotency_and_request_hmac
      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity
      - row_savepoint_rolls_back_all_identity_side_effects_before_rejection
      - unknown_result_remains_recoverable_and_is_never_reclassified_as_rejected
      - generated_credential_placeholder_rotate_revision_and_confirm_distribution
      - login_and_issue_share_advisory_lock_with_deterministic_multi_lock_order
      - canonical_and_legacy_routes_are_no_store_and_redacted
      - operations_or_super_admin_write_and_actor_visibility_boundaries
      - drizzle_generated_migration_source_only_without_execution
      - focused_service_repository_route_ui_and_static_regression
      - full_static_regression
      - two_round_adversarial_review
"@

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "product allowlist" -Anchor @"
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - src/server/services/employee-account-service.ts
      - src/server/services/employee-account-service.test.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts
      - src/server/services/admin-organization-org-auth-runtime.ts
      - src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
      - tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts
"@ -Replacement @"
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/superpowers/specs/2026-07-16-employee-import-command-recovery-design.md
      - docs/superpowers/plans/2026-07-16-employee-import-command-recovery.md
      - src/db/schema/employee-import.ts
      - src/db/schema/employee-import.test.ts
      - src/db/schema/index.ts
      - drizzle/*_p1_rc_02_employee_import_command_recovery.sql
      - drizzle/meta/*_snapshot.json
      - drizzle/meta/_journal.json
      - src/server/contracts/employee-import-command-contract.ts
      - src/server/validators/employee-import-command.ts
      - src/server/validators/employee-import-command.test.ts
      - src/server/services/employee-import-command-crypto.ts
      - src/server/services/employee-import-command-crypto.test.ts
      - src/server/repositories/employee-import-command-repository.ts
      - src/server/repositories/postgres-employee-import-command-repository.ts
      - src/server/repositories/postgres-employee-import-command-repository.test.ts
      - src/server/services/employee-import-command-service.ts
      - src/server/services/employee-import-command-service.test.ts
      - src/server/services/employee-import-command-route.ts
      - src/server/services/employee-import-command-route.test.ts
      - src/app/api/v1/employee-import-commands/route.ts
      - src/app/api/v1/employee-import-commands/[publicId]/route.ts
      - src/app/api/v1/employee-import-commands/[publicId]/issue-credentials/route.ts
      - src/app/api/v1/employee-import-commands/[publicId]/confirm-distribution/route.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts
      - src/server/services/admin-organization-org-auth-runtime.ts
      - src/server/contracts/admin-user-org-auth-ops-contract.ts
      - src/server/contracts/employee-account-contract.ts
      - src/server/services/employee-account-service.ts
      - src/server/services/employee-account-service.test.ts
      - src/server/auth/local-session-runtime.test.ts
      - src/features/admin/org-auth-redeem/employee-import-command-client.ts
      - src/features/admin/org-auth-redeem/employee-import-command-client.test.ts
      - src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts
      - src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx
      - src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.tsx
      - src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx
      - src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx
      - tests/unit/p1-employee-import-command-atomicity.test.ts
      - tests/unit/p1-employee-import-command-migration-source.test.ts
      - tests/unit/p0-rc-02-organization-scope-quota-employee.test.ts
      - tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts
      - tests/unit/phase-20-ra-01-04-employee-import.test.ts
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
      - tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts
      - tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts
      - tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts
"@

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "blocked schema and drizzle paths" -Anchor @"
      - src/db/schema/**
      - drizzle/**
"@ -Replacement ""

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "schema capability" -Anchor @"
      schemaMigration: blocked_without_fresh_approval
"@ -Replacement @"
      schemaMigration: approved_source_generation_only_no_execution
"@

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "acceptance standards" -Anchor @"
    acceptanceStandards:
      - JIT revalidation must first distinguish post-P0 covered atomic creation from any remaining batch exception, unknown-result or one-time-secret residual; superseded evidence cannot be reopened wholesale.
      - A committed employee account must contain auth_user, auth_account, user, employee and quota reservation in one transaction; any failure must leave no orphan credential or partial membership.
      - Batch import must preserve explainable committed-row results and must never expose an initial password for a row whose transaction did not commit.
      - Response-loss and retry safety must be proven within the current no-schema boundary; if durable batch idempotency or recoverable secret storage is required, stop and request separate approval rather than inventing persistence.
      - F-0115 can close only at static level after focused and full regression; RV-0018 remains pending and no schema, migration, dependency, database, Provider, browser/runtime, P2, PR, force push or deployment action occurs.
"@ -Replacement @"
    acceptanceStandards:
      - The command idempotency key and normalized request HMAC must make same-key/same-request resume safe and same-key/different-request fail with 409 without storing raw request, phone, name, or password.
      - Each row must atomically commit identity, credential, employee membership, current org_auth quota, outcome, and audit; deterministic rejection must roll back identity through a savepoint, and unknown outcome must remain recoverable rather than being marked rejected.
      - Generated credentials must start with an unknowable placeholder and only explicit revision-bound issue may rotate and return plaintext once; GET never returns plaintext, active sessions block issue, and confirm closes distribution.
      - F-0115 closes statically only after focused/full regression and two reviews; Drizzle generation may create migration source but no migration/database execution occurs, RV-0018 remains pending, and dependency/Provider/browser/P2/PR/force/deploy remain blocked.
"@

    $candidateTaskBlock = Replace-F0115ModuleQueueAnchor -Content $candidateTaskBlock -Label "focused validation command" -Anchor @"
      - corepack pnpm@10.15.1 exec vitest run src/server/services/employee-account-service.test.ts src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts --maxWorkers=1
"@ -Replacement @"
      - corepack pnpm@10.15.1 exec vitest run src/db/schema/employee-import.test.ts src/server/validators/employee-import-command.test.ts src/server/services/employee-import-command-crypto.test.ts src/server/repositories/postgres-employee-import-command-repository.test.ts src/server/services/employee-import-command-service.test.ts src/server/services/employee-import-command-route.test.ts src/server/auth/local-session-runtime.test.ts src/features/admin/org-auth-redeem/employee-import-command-client.test.ts src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx tests/unit/p1-employee-import-command-atomicity.test.ts tests/unit/p1-employee-import-command-migration-source.test.ts tests/unit/p0-rc-02-organization-scope-quota-employee.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts --maxWorkers=1
"@

    return $normalizedQueue.Substring(0, $taskMatch.Index) + $candidateTaskBlock + $normalizedQueue.Substring($taskMatch.Index + $taskMatch.Length)
}

function Set-F0115ModuleFixtureFile {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $fullPath = Join-Path $Root ($Path -replace "/", "\")
    $parentPath = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $parentPath)) {
        New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($fullPath, ($Content -replace "`r`n?", "`n"), $f0115ModuleUtf8WithoutBom)
}

function New-F0115ModuleFixture {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [string]$Branch = $f0115ModuleBranch,
        [switch]$AdvanceBase
    )

    $fixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-module-f0115-" + $Name + "-" + [guid]::NewGuid().ToString("N"))
    & git clone --quiet --shared --no-checkout $f0115ModuleSourceRoot $fixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0115 Module fixture '$Name'." }
    & git -C $fixtureRoot config user.name "Module F-0115 Scope Smoke"
    & git -C $fixtureRoot config user.email "module-f0115-scope-smoke@example.invalid"
    & git -C $fixtureRoot config core.autocrlf false
    & git -C $fixtureRoot config core.longpaths true
    & git -C $fixtureRoot sparse-checkout init --no-cone
    $sparseFiles = @(
        $f0115ModuleFiles + @(
            "docs/04-agent-system/state/project-state.yaml",
            "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml",
            "src/server/services/employee-account-service.ts"
        )
    )
    & git -C $fixtureRoot sparse-checkout set --no-cone -- $sparseFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to configure F-0115 Module sparse fixture '$Name'." }
    & git -C $fixtureRoot switch --quiet -C $Branch $f0115ModuleBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out F-0115 Module fixture '$Name'." }
    & git -C $fixtureRoot update-ref refs/remotes/origin/master $f0115ModuleBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to pin F-0115 Module fixture origin/master." }

    if ($AdvanceBase) {
        $baseTreeSha = ((& git -C $fixtureRoot rev-parse "$f0115ModuleBaseSha`^{tree}") -join "").Trim()
        $wrongBaseSha = (("advance F-0115 wrong base" | & git -C $fixtureRoot commit-tree $baseTreeSha -p $f0115ModuleBaseSha) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or $wrongBaseSha -notmatch '^[0-9a-f]{40}$') { throw "Failed to synthesize F-0115 wrong-base fixture." }
        & git -C $fixtureRoot update-ref "refs/heads/$Branch" $wrongBaseSha $f0115ModuleBaseSha
        & git -C $fixtureRoot reset --hard --quiet $wrongBaseSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to advance F-0115 wrong-base fixture." }
    }

    return $fixtureRoot
}

function Set-F0115ModuleCandidate {
    param([Parameter(Mandatory = $true)][string]$Root)

    $queueFullPath = Join-Path $Root ($f0115ModuleQueuePath -replace "/", "\")
    $candidateQueue = ConvertTo-F0115ModuleScopeCorrectionQueue -QueueText ([System.IO.File]::ReadAllText($queueFullPath))
    Set-F0115ModuleFixtureFile -Root $Root -Path $f0115ModuleQueuePath -Content $candidateQueue

    $authorizationFileList = @($f0115ModuleFiles | ForEach-Object { "- ``$_``" }) -join "`n"
    Set-F0115ModuleFixtureFile -Root $Root -Path $f0115ModuleAuthorizationPath -Content @"
# P1 F-0115 Scope-Correction Authorization

Status: approved
Human approval source: current user message
Task ID: ``$f0115ModuleTaskId``
Parent task: ``$f0115ModuleParentTaskId``
Base: ``$f0115ModuleBaseSha``
Branch: ``$f0115ModuleBranch``

## Exact Files

$authorizationFileList

## Capability Authorization

schemaMigration: approved_source_generation_only_no_execution
dependencyIntroduction: blocked_without_fresh_approval
databaseMutation: blocked_without_fresh_user_approval
providerCall: blocked_without_fresh_approval
runtimeAcceptance: blocked_out_of_program
browserRuntimeValidation: blocked_out_of_program
p2Implementation: blocked_out_of_program
stagingProdDeploy: blocked_requires_fresh_user_approval
forcePush: blocked
pr: blocked
costCalibrationGate: blocked

Every other in_progress SHA mismatch remains a hard-block.
Hook bypass is not approved.
No product implementation, migration/database execution, dependency, Provider, browser/runtime, P2, PR, force push, or deployment is authorized by this governance commit.
"@
    Set-F0115ModuleFixtureFile -Root $Root -Path $f0115ModuleEvidencePath -Content @"
# P1 F-0115 Scope-Correction Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## Requirement Mapping Result

Result: pass

## Root-Cause Reproduction

Result: pass

## TDD Evidence

Result: pass

## Validation Results

Result: pass

Cost Calibration Gate remains blocked.
"@
    Set-F0115ModuleFixtureFile -Root $Root -Path $f0115ModuleAuditPath -Content @"
# P1 F-0115 Scope-Correction Audit

## Round 1

Result: pass

## Round 2

Result: pass

## Decision

Decision: APPROVE
"@

    foreach ($fixturePath in @($f0115ModuleFiles | Where-Object {
        $_ -notin @($f0115ModuleQueuePath, $f0115ModuleAuthorizationPath, $f0115ModuleEvidencePath, $f0115ModuleAuditPath)
    })) {
        Set-F0115ModuleFixtureFile -Root $Root -Path $fixturePath -Content "# Independent F-0115 Module governance fixture: $fixturePath`n"
    }

    & git -C $Root add -- $f0115ModuleFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage F-0115 Module fixture." }
    $stagedFiles = @(& git -C $Root diff --cached --name-only --diff-filter=ACMR | Sort-Object -Unique)
    if (($stagedFiles -join "|") -cne (@($f0115ModuleFiles | Sort-Object -Unique) -join "|")) {
        throw "F-0115 Module fixture did not stage the exact file set.`nActual: $($stagedFiles -join ', ')"
    }
    $worktreeOnlyFiles = @(& git -C $Root diff --name-only)
    if ($worktreeOnlyFiles.Count -gt 0) {
        throw "F-0115 Module fixture unexpectedly contains an index/worktree split: $($worktreeOnlyFiles -join ', ')"
    }
}

function Invoke-F0115ModulePreCommit {
    param([Parameter(Mandatory = $true)][string]$Root)

    Push-Location $Root
    try {
        return @(& $scriptPath)
    } finally {
        Pop-Location
    }
}

function Invoke-F0115ModuleExpectFailure {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $failed = $false
    $failureOutput = @()
    try {
        $failureOutput = @(Invoke-F0115ModulePreCommit -Root $Root 2>&1)
    } catch {
        $failed = $true
        $failureOutput += $_.Exception.Message
    }
    if (-not $failed) {
        throw "F-0115 Module negative '$Label' unexpectedly passed.`n$($failureOutput -join "`n")"
    }
    Assert-Contains -Output $failureOutput -Pattern $ExpectedPattern
}

function Assert-F0115ModuleExactCandidateIndex {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $cachedStatusLines = @(& git -C $Root diff --cached --name-status --no-renames --diff-filter=ACMRTD)
    $cachedStatusExitCode = $LASTEXITCODE
    $cachedPaths = [System.Collections.Generic.List[string]]::new()
    $hasInvalidStatus = $false
    foreach ($cachedStatusLine in $cachedStatusLines) {
        if ($cachedStatusLine -notmatch '^(?:A|M)\t(.+)$') {
            $hasInvalidStatus = $true
            continue
        }
        $cachedPaths.Add($Matches[1])
    }
    $actualCachedPaths = @($cachedPaths.ToArray() | Sort-Object -Unique)
    $expectedCachedPaths = @($f0115ModuleFiles | Sort-Object -Unique)
    $unstagedPaths = @(& git -C $Root diff --name-only)
    $unstagedExitCode = $LASTEXITCODE
    $untrackedPaths = @(& git -C $Root ls-files --others --exclude-standard)
    $untrackedExitCode = $LASTEXITCODE
    if (
        $cachedStatusExitCode -ne 0 -or
        $cachedStatusLines.Count -ne 12 -or
        $hasInvalidStatus -or
        ($actualCachedPaths -join "|") -cne ($expectedCachedPaths -join "|") -or
        $unstagedExitCode -ne 0 -or
        $unstagedPaths.Count -ne 0 -or
        $untrackedExitCode -ne 0 -or
        $untrackedPaths.Count -ne 0
    ) {
        throw "F-0115 Module contradiction fixture '$Label' must contain exact twelve staged A/M paths with zero unstaged or untracked paths."
    }
}

function Test-F0115ModuleReviewFailure {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern,
        [Parameter(Mandatory = $true)][string]$Label,
        [string[]]$ForbiddenPatterns = @(),
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][System.Collections.Generic.List[string]]$RedFindings
    )

    $capturedOutput = [System.Collections.Generic.List[string]]::new()
    $failed = $false
    Push-Location $Root
    try {
        try {
            & $scriptPath 2>&1 | ForEach-Object { $capturedOutput.Add($_.ToString()) }
        } catch {
            $failed = $true
            $capturedOutput.Add($_.Exception.Message)
        }
    } finally {
        Pop-Location
    }

    if (-not $failed) {
        $RedFindings.Add("$Label unexpectedly passed; expected $ExpectedPattern")
        return
    }

    Assert-Contains -Output @($capturedOutput) -Pattern $ExpectedPattern
    foreach ($forbiddenPattern in $ForbiddenPatterns) {
        if ((@($capturedOutput) | Where-Object { $_ -match $forbiddenPattern }).Count -gt 0) {
            $RedFindings.Add("$Label leaked forbidden success output '$forbiddenPattern'")
        }
    }
}

$f0115ModuleGuardText = Get-Content -LiteralPath $scriptPath -Raw -Encoding UTF8
$f0115ModuleRequiredContracts = @(
    "preCommitScopeMode: p1_f0115_scope_correction",
    "p1F0115ScopeCorrectionAuthorization: approved_one_time",
    "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID",
    "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
)
$missingF0115ModuleContracts = @($f0115ModuleRequiredContracts | Where-Object {
    $f0115ModuleGuardText -notmatch [regex]::Escape($_)
})
$f0115ModuleFixtureRoots = [System.Collections.Generic.List[string]]::new()
$f0115ModuleReviewerRedFindings = [System.Collections.Generic.List[string]]::new()

try {
    $positiveRoot = New-F0115ModuleFixture -Name "exact-positive"
    $f0115ModuleFixtureRoots.Add($positiveRoot)
    Set-F0115ModuleCandidate -Root $positiveRoot

    if ($missingF0115ModuleContracts.Count -gt 0) {
        $redFailure = ""
        try {
            $unexpectedOutput = Invoke-F0115ModulePreCommit -Root $positiveRoot
        } catch {
            $redFailure = $_.Exception.Message
        }
        if ([string]::IsNullOrWhiteSpace($redFailure)) {
            throw "Exact F-0115 Module fixture unexpectedly passed without the required marker contract.`n$($unexpectedOutput -join "`n")"
        }
        if ($redFailure -notmatch "HARD_BLOCK_") {
            throw "Exact F-0115 Module fixture failed before reaching the guard contract: $redFailure"
        }
        throw "Existing Module pre-commit regression passed; exact F-0115 scope-correction is RED because the guard contract is missing: $($missingF0115ModuleContracts -join ', '). Guard failure: $redFailure"
    }

    $positiveOutput = Invoke-F0115ModulePreCommit -Root $positiveRoot
    Assert-Contains -Output $positiveOutput -Pattern "preCommitScopeMode: p1_f0115_scope_correction"
    Assert-Contains -Output $positiveOutput -Pattern "p1F0115ScopeCorrectionAuthorization: approved_one_time"
    Assert-Contains -Output $positiveOutput -Pattern "OK_SCOPE $([regex]::Escape($f0115ModuleQueuePath))"

    $wrongBaseRoot = New-F0115ModuleFixture -Name "wrong-base" -AdvanceBase
    $f0115ModuleFixtureRoots.Add($wrongBaseRoot)
    Set-F0115ModuleCandidate -Root $wrongBaseRoot
    Invoke-F0115ModuleExpectFailure -Root $wrongBaseRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_CONTEXT_INVALID" -Label "wrong base"

    $wrongBranchRoot = New-F0115ModuleFixture -Name "wrong-branch" -Branch "codex/p1-f0115-wrong-branch"
    $f0115ModuleFixtureRoots.Add($wrongBranchRoot)
    Set-F0115ModuleCandidate -Root $wrongBranchRoot
    Invoke-F0115ModuleExpectFailure -Root $wrongBranchRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_CONTEXT_INVALID" -Label "wrong branch"

    $wrongTaskRoot = New-F0115ModuleFixture -Name "wrong-task"
    $f0115ModuleFixtureRoots.Add($wrongTaskRoot)
    Set-F0115ModuleCandidate -Root $wrongTaskRoot
    $wrongTaskQueuePath = Join-Path $wrongTaskRoot ($f0115ModuleQueuePath -replace "/", "\")
    $wrongTaskQueue = [System.IO.File]::ReadAllText($wrongTaskQueuePath).Replace(
        "  - id: $f0115ModuleParentTaskId",
        "  - id: p1-remediation-rc-02-wrong-task-2026-07-16"
    )
    Set-F0115ModuleFixtureFile -Root $wrongTaskRoot -Path $f0115ModuleQueuePath -Content $wrongTaskQueue
    & git -C $wrongTaskRoot add -- $f0115ModuleQueuePath
    Invoke-F0115ModuleExpectFailure -Root $wrongTaskRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_(?:CONTEXT|QUEUE_DELTA)_INVALID" -Label "wrong task"

    $wrongStatusRoot = New-F0115ModuleFixture -Name "wrong-status"
    $f0115ModuleFixtureRoots.Add($wrongStatusRoot)
    Set-F0115ModuleCandidate -Root $wrongStatusRoot
    $wrongStatusQueuePath = Join-Path $wrongStatusRoot ($f0115ModuleQueuePath -replace "/", "\")
    $wrongStatusQueue = [System.IO.File]::ReadAllText($wrongStatusQueuePath)
    $wrongStatusQueue = [regex]::Replace(
        $wrongStatusQueue,
        "(?ms)(^  - id:\s*$([regex]::Escape($f0115ModuleParentTaskId))\s*\r?\n.*?^    status:)\s*in_progress",
        '${1} pending',
        1
    )
    Set-F0115ModuleFixtureFile -Root $wrongStatusRoot -Path $f0115ModuleQueuePath -Content $wrongStatusQueue
    & git -C $wrongStatusRoot add -- $f0115ModuleQueuePath
    Invoke-F0115ModuleExpectFailure -Root $wrongStatusRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_CONTEXT_INVALID" -Label "wrong status"

    $invalidApprovalRoot = New-F0115ModuleFixture -Name "invalid-approval"
    $f0115ModuleFixtureRoots.Add($invalidApprovalRoot)
    Set-F0115ModuleCandidate -Root $invalidApprovalRoot
    $invalidApprovalFullPath = Join-Path $invalidApprovalRoot ($f0115ModuleAuthorizationPath -replace "/", "\")
    $invalidApproval = [System.IO.File]::ReadAllText($invalidApprovalFullPath).Replace("Status: approved", "Status: pending")
    Set-F0115ModuleFixtureFile -Root $invalidApprovalRoot -Path $f0115ModuleAuthorizationPath -Content $invalidApproval
    & git -C $invalidApprovalRoot add -- $f0115ModuleAuthorizationPath
    Invoke-F0115ModuleExpectFailure -Root $invalidApprovalRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID" -Label "invalid approval"

    $scalarDeltaRoot = New-F0115ModuleFixture -Name "scalar-delta"
    $f0115ModuleFixtureRoots.Add($scalarDeltaRoot)
    Set-F0115ModuleCandidate -Root $scalarDeltaRoot
    $scalarQueuePath = Join-Path $scalarDeltaRoot ($f0115ModuleQueuePath -replace "/", "\")
    $scalarQueue = [System.IO.File]::ReadAllText($scalarQueuePath).Replace(
        "rollbackOrStopCondition: stop_if_generated_migration_source_would_be_executed_or_if_dependency_database_provider_runtime_p2_pr_force_push_deploy_or_other_finding_repair_is_required",
        "rollbackOrStopCondition: stop_if_generated_migration_source_would_be_executed"
    )
    Set-F0115ModuleFixtureFile -Root $scalarDeltaRoot -Path $f0115ModuleQueuePath -Content $scalarQueue
    & git -C $scalarDeltaRoot add -- $f0115ModuleQueuePath
    Invoke-F0115ModuleExpectFailure -Root $scalarDeltaRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "scalar queue semantics"

    $listDeltaRoot = New-F0115ModuleFixture -Name "list-delta"
    $f0115ModuleFixtureRoots.Add($listDeltaRoot)
    Set-F0115ModuleCandidate -Root $listDeltaRoot
    $listQueuePath = Join-Path $listDeltaRoot ($f0115ModuleQueuePath -replace "/", "\")
    $listQueue = [System.IO.File]::ReadAllText($listQueuePath).Replace(
        "      - unknown_result_remains_recoverable_and_is_never_reclassified_as_rejected",
        "      - unknown_result_is_rejected"
    )
    Set-F0115ModuleFixtureFile -Root $listDeltaRoot -Path $f0115ModuleQueuePath -Content $listQueue
    & git -C $listDeltaRoot add -- $f0115ModuleQueuePath
    Invoke-F0115ModuleExpectFailure -Root $listDeltaRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "list queue semantics"

    $orderDeltaRoot = New-F0115ModuleFixture -Name "order-delta"
    $f0115ModuleFixtureRoots.Add($orderDeltaRoot)
    Set-F0115ModuleCandidate -Root $orderDeltaRoot
    $orderQueuePath = Join-Path $orderDeltaRoot ($f0115ModuleQueuePath -replace "/", "\")
    $orderQueue = [System.IO.File]::ReadAllText($orderQueuePath).Replace(
        "      - persistent_employee_import_command_idempotency_and_request_hmac`n      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity",
        "      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity`n      - persistent_employee_import_command_idempotency_and_request_hmac"
    )
    Set-F0115ModuleFixtureFile -Root $orderDeltaRoot -Path $f0115ModuleQueuePath -Content $orderQueue
    & git -C $orderDeltaRoot add -- $f0115ModuleQueuePath
    Invoke-F0115ModuleExpectFailure -Root $orderDeltaRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "ordered queue semantics"

    $contentDeltaRoot = New-F0115ModuleFixture -Name "content-delta"
    $f0115ModuleFixtureRoots.Add($contentDeltaRoot)
    Set-F0115ModuleCandidate -Root $contentDeltaRoot
    $contentQueuePath = Join-Path $contentDeltaRoot ($f0115ModuleQueuePath -replace "/", "\")
    $contentQueue = [System.IO.File]::ReadAllText($contentQueuePath).Replace("schemaVersion: 1", "schemaVersion: 2")
    Set-F0115ModuleFixtureFile -Root $contentDeltaRoot -Path $f0115ModuleQueuePath -Content $contentQueue
    & git -C $contentDeltaRoot add -- $f0115ModuleQueuePath
    Invoke-F0115ModuleExpectFailure -Root $contentDeltaRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "queue content outside the target block"

    $missingPathRoot = New-F0115ModuleFixture -Name "missing-path"
    $f0115ModuleFixtureRoots.Add($missingPathRoot)
    Set-F0115ModuleCandidate -Root $missingPathRoot
    & git -C $missingPathRoot restore --source=HEAD --staged --worktree -- "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
    if ($LASTEXITCODE -ne 0) { throw "Failed to prepare F-0115 Module missing-path fixture." }
    Invoke-F0115ModuleExpectFailure -Root $missingPathRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_(?:FILE_SET|CONTEXT)_INVALID|HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE)" -Label "missing hotfix path"

    $productPathRoot = New-F0115ModuleFixture -Name "extra-product-path"
    $f0115ModuleFixtureRoots.Add($productPathRoot)
    Set-F0115ModuleCandidate -Root $productPathRoot
    $productPath = "src/server/services/employee-account-service.ts"
    $productFullPath = Join-Path $productPathRoot ($productPath -replace "/", "\")
    $productText = [System.IO.File]::ReadAllText($productFullPath)
    Set-F0115ModuleFixtureFile -Root $productPathRoot -Path $productPath -Content "$productText`n// Product code must not enter the governance hotfix.`n"
    & git -C $productPathRoot add -- $productPath
    Invoke-F0115ModuleExpectFailure -Root $productPathRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_(?:FILE_SET|PRODUCT_PATH|CONTEXT)_INVALID|HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE)" -Label "extra product path"

    $partialStageRoot = New-F0115ModuleFixture -Name "index-worktree-split"
    $f0115ModuleFixtureRoots.Add($partialStageRoot)
    Set-F0115ModuleCandidate -Root $partialStageRoot
    Add-Content -LiteralPath (Join-Path $partialStageRoot ($f0115ModuleAuthorizationPath -replace "/", "\")) -Value "unstaged divergence" -Encoding UTF8
    Invoke-F0115ModuleExpectFailure -Root $partialStageRoot -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID" -Label "index/worktree split"

    $missingSchemaApprovalRoot = New-F0115ModuleFixture -Name "missing-schema-capability-approval"
    $f0115ModuleFixtureRoots.Add($missingSchemaApprovalRoot)
    Set-F0115ModuleCandidate -Root $missingSchemaApprovalRoot
    $missingSchemaApprovalFullPath = Join-Path $missingSchemaApprovalRoot ($f0115ModuleAuthorizationPath -replace "/", "\")
    $missingSchemaApproval = [System.IO.File]::ReadAllText($missingSchemaApprovalFullPath).Replace(
        "schemaMigration: approved_source_generation_only_no_execution`n",
        ""
    )
    if ($missingSchemaApproval -ceq [System.IO.File]::ReadAllText($missingSchemaApprovalFullPath)) {
        throw "F-0115 missing-schema capability fixture did not mutate the authorization."
    }
    Set-F0115ModuleFixtureFile -Root $missingSchemaApprovalRoot -Path $f0115ModuleAuthorizationPath -Content $missingSchemaApproval
    & git -C $missingSchemaApprovalRoot add -- $f0115ModuleAuthorizationPath
    Test-F0115ModuleReviewFailure `
        -Root $missingSchemaApprovalRoot `
        -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID" `
        -Label "missing schema source-generation capability approval" `
        -RedFindings $f0115ModuleReviewerRedFindings

    $tamperedPreservedApprovalRoot = New-F0115ModuleFixture -Name "tampered-preserved-capability"
    $f0115ModuleFixtureRoots.Add($tamperedPreservedApprovalRoot)
    Set-F0115ModuleCandidate -Root $tamperedPreservedApprovalRoot
    $tamperedPreservedApprovalFullPath = Join-Path $tamperedPreservedApprovalRoot ($f0115ModuleAuthorizationPath -replace "/", "\")
    $tamperedPreservedApproval = [System.IO.File]::ReadAllText($tamperedPreservedApprovalFullPath).Replace(
        "dependencyIntroduction: blocked_without_fresh_approval",
        "dependencyIntroduction: approved"
    )
    if ($tamperedPreservedApproval -ceq [System.IO.File]::ReadAllText($tamperedPreservedApprovalFullPath)) {
        throw "F-0115 preserved-capability fixture did not mutate the authorization."
    }
    Set-F0115ModuleFixtureFile -Root $tamperedPreservedApprovalRoot -Path $f0115ModuleAuthorizationPath -Content $tamperedPreservedApproval
    & git -C $tamperedPreservedApprovalRoot add -- $f0115ModuleAuthorizationPath
    Test-F0115ModuleReviewFailure `
        -Root $tamperedPreservedApprovalRoot `
        -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID" `
        -Label "tampered preserved capability approval" `
        -RedFindings $f0115ModuleReviewerRedFindings

    $contradictoryAuthorizationRoot = New-F0115ModuleFixture -Name "contradictory-authorization"
    $f0115ModuleFixtureRoots.Add($contradictoryAuthorizationRoot)
    Set-F0115ModuleCandidate -Root $contradictoryAuthorizationRoot
    $contradictoryAuthorizationFullPath = Join-Path $contradictoryAuthorizationRoot ($f0115ModuleAuthorizationPath -replace "/", "\")
    $canonicalAuthorization = [System.IO.File]::ReadAllText($contradictoryAuthorizationFullPath)
    Set-F0115ModuleFixtureFile -Root $contradictoryAuthorizationRoot -Path $f0115ModuleAuthorizationPath -Content @"
$canonicalAuthorization

## Capability Authorization

schemaMigration: approved_execution
databaseMutation: approved
dependencyIntroduction: approved
"@
    & git -C $contradictoryAuthorizationRoot add -- $f0115ModuleAuthorizationPath
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage F-0115 Module contradictory authorization fixture." }
    Assert-F0115ModuleExactCandidateIndex -Root $contradictoryAuthorizationRoot -Label "contradictory authorization"
    Test-F0115ModuleReviewFailure `
        -Root $contradictoryAuthorizationRoot `
        -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION authorization" `
        -ForbiddenPatterns @(
            "(?m)^preCommitScopeMode:\s*",
            "p1F0115ScopeCorrectionAuthorization:\s*approved_one_time",
            "(?m)^pre-commit hardening passed\s*$"
        ) `
        -Label "contradictory authorization artifact" `
        -RedFindings $f0115ModuleReviewerRedFindings

    $contradictoryAuditRoot = New-F0115ModuleFixture -Name "contradictory-audit"
    $f0115ModuleFixtureRoots.Add($contradictoryAuditRoot)
    Set-F0115ModuleCandidate -Root $contradictoryAuditRoot
    $contradictoryAuditFullPath = Join-Path $contradictoryAuditRoot ($f0115ModuleAuditPath -replace "/", "\")
    $canonicalAudit = [System.IO.File]::ReadAllText($contradictoryAuditFullPath)
    Set-F0115ModuleFixtureFile -Root $contradictoryAuditRoot -Path $f0115ModuleAuditPath -Content @"
$canonicalAudit

## Round 2

Result: fail

## Decision

Decision: REJECT
"@
    & git -C $contradictoryAuditRoot add -- $f0115ModuleAuditPath
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage F-0115 Module contradictory audit fixture." }
    Assert-F0115ModuleExactCandidateIndex -Root $contradictoryAuditRoot -Label "contradictory audit"
    Test-F0115ModuleReviewFailure `
        -Root $contradictoryAuditRoot `
        -ExpectedPattern "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION audit" `
        -ForbiddenPatterns @(
            "(?m)^preCommitScopeMode:\s*",
            "p1F0115ScopeCorrectionAuthorization:\s*approved_one_time",
            "(?m)^pre-commit hardening passed\s*$"
        ) `
        -Label "contradictory audit artifact" `
        -RedFindings $f0115ModuleReviewerRedFindings

    $postAnchorFindingRoot = New-F0115ModuleFixture -Name "candidate-valid-post-anchor-finding"
    $f0115ModuleFixtureRoots.Add($postAnchorFindingRoot)
    Set-F0115ModuleCandidate -Root $postAnchorFindingRoot
    $postAnchorPlanPath = "docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md"
    $postAnchorPlanFullPath = Join-Path $postAnchorFindingRoot ($postAnchorPlanPath -replace "/", "\")
    $sensitiveHeaderName = "Authori" + "zation"
    $postAnchorPlan = [System.IO.File]::ReadAllText($postAnchorPlanFullPath) + "`n$sensitiveHeaderName`: Bearer synthetic-f0115-marker-leak-probe`n"
    Set-F0115ModuleFixtureFile -Root $postAnchorFindingRoot -Path $postAnchorPlanPath -Content $postAnchorPlan
    & git -C $postAnchorFindingRoot add -- $postAnchorPlanPath
    Test-F0115ModuleReviewFailure `
        -Root $postAnchorFindingRoot `
        -ExpectedPattern "HARD_BLOCK_SENSITIVE_EVIDENCE" `
        -ForbiddenPatterns @(
            "preCommitScopeMode:\s*p1_f0115_scope_correction",
            "p1F0115ScopeCorrectionAuthorization:\s*approved_one_time"
        ) `
        -Label "candidate-valid post-anchor generic finding" `
        -RedFindings $f0115ModuleReviewerRedFindings

    if ($f0115ModuleReviewerRedFindings.Count -gt 0) {
        throw "F-0115 Module reviewer coverage is RED: $($f0115ModuleReviewerRedFindings -join '; ')"
    }
} finally {
    foreach ($f0115FixtureRoot in $f0115ModuleFixtureRoots) {
        if (Test-Path -LiteralPath $f0115FixtureRoot) {
            Remove-Item -LiteralPath $f0115FixtureRoot -Recurse -Force
        }
    }
}

function Set-F0117PreCommitFixtureFile {
    param([string]$Root, [string]$Path, [string]$Content)
    $fullPath = Join-Path $Root ($Path -replace "/", "\")
    $parent = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
    [System.IO.File]::WriteAllText($fullPath, (($Content -replace "`r`n?", "`n").TrimEnd("`n") + "`n"), [System.Text.UTF8Encoding]::new($false))
}

$f0117BehaviorRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-f0117-precommit-behavior-" + [guid]::NewGuid().ToString("N"))
$f0117BehaviorBaseSha = "366f17446e9fc75a777ebfe5977ad72db1062eb7"
$f0117BehaviorTransitionSnapshotSha = "3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a"
$f0117BehaviorBranch = "codex/p1-f0117-spec-approval-transition-hotfix"
$f0117BehaviorAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-spec-approval-transition-hotfix-authorization.md"
$f0117BehaviorFiles = @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $f0117BehaviorAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$f0117BehaviorSourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

function Reset-F0117PreCommitBehaviorFixture {
    & git -C $f0117BehaviorRoot rm --quiet -f --cached --ignore-unmatch --sparse -- f0117-extra.md src/f0117-product.ts *> $null
    foreach ($probePath in @("f0117-extra.md", "src/f0117-product.ts")) {
        Remove-Item -LiteralPath (Join-Path $f0117BehaviorRoot ($probePath -replace "/", "\")) -Force -ErrorAction SilentlyContinue
    }
    & git -C $f0117BehaviorRoot reset --hard --quiet $f0117BehaviorBaseSha
    & git -C $f0117BehaviorRoot clean -fdx --quiet
    & git -C $f0117BehaviorRoot branch -M $f0117BehaviorBranch
    foreach ($candidatePath in $f0117BehaviorFiles) {
        if ($candidatePath -in @("docs/04-agent-system/state/project-state.yaml", "docs/04-agent-system/state/task-queue.yaml")) {
            $candidateContent = ((& git -C $f0117BehaviorSourceRoot show "${f0117BehaviorTransitionSnapshotSha}:$candidatePath") -join "`n")
            if ($LASTEXITCODE -ne 0) { throw "Missing historical F-0117 transition snapshot file: $candidatePath" }
        } else {
            $sourcePath = Join-Path $f0117BehaviorSourceRoot ($candidatePath -replace "/", "\")
            $candidateContent = [System.IO.File]::ReadAllText($sourcePath)
        }
        Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path $candidatePath -Content $candidateContent
    }
    & git -C $f0117BehaviorRoot add -- $f0117BehaviorFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage F-0117 behavior fixture." }
}

function Assert-F0117PreCommitBehaviorFailure {
    param(
        [string]$Label,
        [string]$P1Pattern = "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_",
        [string]$ModulePattern = "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_"
    )
    $p1Failed = $false
    $p1FailureOutput = @()
    try { $p1FailureOutput = @(& $p1GuardPath -RepositoryRoot $f0117BehaviorRoot -Phase pre_commit -SkipExternalIntegrityChecks 2>&1) } catch { $p1Failed = $true; $p1FailureOutput += $_.Exception.Message }
    $moduleFailed = $false
    $moduleFailureOutput = @()
    Push-Location $f0117BehaviorRoot
    try { try { $moduleFailureOutput = @(& $scriptPath 2>&1) } catch { $moduleFailed = $true; $moduleFailureOutput += $_.Exception.Message } } finally { Pop-Location }
    if (-not $p1Failed -or -not $moduleFailed) { throw "F-0117 $Label did not fail both P1 and Module pre-commit guards." }
    if (($p1FailureOutput -join "`n") -notmatch $P1Pattern) { throw "F-0117 $Label P1 failure did not contain '$P1Pattern': $($p1FailureOutput -join '; ')" }
    if (($moduleFailureOutput -join "`n") -notmatch $ModulePattern) { throw "F-0117 $Label Module failure did not contain '$ModulePattern': $($moduleFailureOutput -join '; ')" }
}

try {
    & git clone --quiet --shared --no-checkout $f0117BehaviorSourceRoot $f0117BehaviorRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0117 pre-commit behavior fixture." }
    & git -C $f0117BehaviorRoot config user.name "F0117 PreCommit Behavior Smoke"
    & git -C $f0117BehaviorRoot config user.email "f0117-precommit@example.invalid"
    & git -C $f0117BehaviorRoot config core.autocrlf false
    & git -C $f0117BehaviorRoot config core.longpaths true
    & git -C $f0117BehaviorRoot sparse-checkout init --no-cone
    & git -C $f0117BehaviorRoot sparse-checkout set --no-cone -- @(
        "/.gitattributes",
        "/docs/04-agent-system/",
        "/docs/05-execution-logs/acceptance/2026-07-16-p1-*",
        "/docs/05-execution-logs/acceptance/2026-07-17-p1-*",
        "/docs/05-execution-logs/acceptance/2026-07-18-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-16-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-17-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-18-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-16-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-17-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-18-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-16-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-15-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-17-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-18-p1-*",
        "/scripts/agent-system/"
    )
    & git -C $f0117BehaviorRoot switch --quiet -C $f0117BehaviorBranch $f0117BehaviorBaseSha
    & git -C $f0117BehaviorRoot update-ref refs/remotes/origin/master $f0117BehaviorBaseSha
    Reset-F0117PreCommitBehaviorFixture

    $p1Positive = @(& $p1GuardPath -RepositoryRoot $f0117BehaviorRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    Assert-Contains -Output $p1Positive -Pattern "p1F0117SpecApprovalTransitionHotfixAuthorization: approved_one_time"
    Push-Location $f0117BehaviorRoot
    try { $modulePositive = @(& $scriptPath) } finally { Pop-Location }
    Assert-Contains -Output $modulePositive -Pattern "preCommitScopeMode: p1_f0117_spec_approval_transition_hotfix"

    & git -C $f0117BehaviorRoot branch -M codex/wrong-f0117-branch
    Assert-F0117PreCommitBehaviorFailure -Label "wrong branch"
    Reset-F0117PreCommitBehaviorFixture

    & git -C $f0117BehaviorRoot reset --soft "${f0117BehaviorBaseSha}^"
    Assert-F0117PreCommitBehaviorFailure -Label "wrong base"
    Reset-F0117PreCommitBehaviorFixture

    $statePath = Join-Path $f0117BehaviorRoot "docs\04-agent-system\state\project-state.yaml"
    $stateText = [System.IO.File]::ReadAllText($statePath)
    Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path "docs/04-agent-system/state/project-state.yaml" -Content $stateText.Replace("currentTaskId: p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18", "currentTaskId: p1-remediation-rc-02-employee-import-preflight-2026-07-17")
    & git -C $f0117BehaviorRoot add -- "docs/04-agent-system/state/project-state.yaml"
    Assert-F0117PreCommitBehaviorFailure -Label "wrong task"
    Reset-F0117PreCommitBehaviorFixture

    $queuePath = Join-Path $f0117BehaviorRoot "docs\04-agent-system\state\task-queue.yaml"
    $queueText = [System.IO.File]::ReadAllText($queuePath)
    $f0117GateAnchor = "    currentExecutionGate:`n      status: satisfied`n      reason: current_user_approved_written_f0117_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n      resumeAction: execute_f0117_redeem_code_nullable_deadline_plan_red_to_green"
    if ([regex]::Matches(($queueText -replace "`r`n?", "`n"), [regex]::Escape($f0117GateAnchor)).Count -ne 1) { throw "F-0117 wrong-gate fixture anchor must occur exactly once." }
    Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content (($queueText -replace "`r`n?", "`n").Replace($f0117GateAnchor, $f0117GateAnchor.Replace("status: satisfied", "status: waiting_for_spec_review")))
    & git -C $f0117BehaviorRoot add -- "docs/04-agent-system/state/task-queue.yaml"
    Assert-F0117PreCommitBehaviorFailure -Label "wrong gate"
    Reset-F0117PreCommitBehaviorFixture

    $authorizationFullPath = Join-Path $f0117BehaviorRoot ($f0117BehaviorAuthorizationPath -replace "/", "\")
    $authorizationText = [System.IO.File]::ReadAllText($authorizationFullPath)
    foreach ($mutation in @(
        @{ Label = "human approval suffix"; From = 'execution on 2026-07-18'; To = 'execution on 2026-07-18 rejected' },
        @{ Label = "authorization branch"; From = 'Branch: `codex/p1-f0117-spec-approval-transition-hotfix`'; To = 'Branch: `codex/wrong-f0117`' },
        @{ Label = "standing source"; From = '2026-07-16-p1-remediation-program-authorization.md'; To = '2026-07-16-wrong-authorization.md' },
        @{ Label = "exact files"; From = '12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`'; To = '12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`' }
    )) {
        Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path $f0117BehaviorAuthorizationPath -Content $authorizationText.Replace($mutation.From, $mutation.To)
        & git -C $f0117BehaviorRoot add -- $f0117BehaviorAuthorizationPath
        Assert-F0117PreCommitBehaviorFailure -Label $mutation.Label
        Reset-F0117PreCommitBehaviorFixture
    }

    foreach ($appendMutation in @(
        @{ Label = "conflicting authorization field"; Content = "`nstandardMode: allow`n"; P1Pattern = "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"; ModulePattern = "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID" },
        @{ Label = "duplicate authorization field"; Content = "`nstandardMode: hard_block`n"; P1Pattern = "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"; ModulePattern = "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID" },
        @{ Label = "duplicate exact file"; Content = ("`n" + '13. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`' + "`n"); P1Pattern = "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID"; ModulePattern = "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID" }
    )) {
        Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path $f0117BehaviorAuthorizationPath -Content ($authorizationText.TrimEnd() + $appendMutation.Content)
        & git -C $f0117BehaviorRoot add -- $f0117BehaviorAuthorizationPath
        Assert-F0117PreCommitBehaviorFailure -Label $appendMutation.Label -P1Pattern $appendMutation.P1Pattern -ModulePattern $appendMutation.ModulePattern
        Reset-F0117PreCommitBehaviorFixture
    }

    & git -C $f0117BehaviorRoot rm --quiet -f -- $f0117BehaviorAuthorizationPath
    Assert-F0117PreCommitBehaviorFailure -Label "missing authorization"
    Reset-F0117PreCommitBehaviorFixture

    Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path "f0117-extra.md" -Content "extra"
    & git -C $f0117BehaviorRoot add --sparse -- f0117-extra.md
    Assert-F0117PreCommitBehaviorFailure -Label "extra file" -P1Pattern "P1_PROGRAM_ALLOWED_FILES_VIOLATION" -ModulePattern "HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE)"
    Reset-F0117PreCommitBehaviorFixture

    Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path "src/f0117-product.ts" -Content "export const forbidden = true;"
    & git -C $f0117BehaviorRoot add --sparse -- src/f0117-product.ts
    Assert-F0117PreCommitBehaviorFailure -Label "product file" -P1Pattern "P1_PROGRAM_(?:ALLOWED_FILES|BLOCKED_FILES)_VIOLATION" -ModulePattern "HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE)"
    Reset-F0117PreCommitBehaviorFixture

    Set-F0117PreCommitFixtureFile -Root $f0117BehaviorRoot -Path $f0117BehaviorAuthorizationPath -Content ($authorizationText.TrimEnd() + "`nunstaged divergence`n")
    Assert-F0117PreCommitBehaviorFailure -Label "partial stage"
    Reset-F0117PreCommitBehaviorFixture

    & git -C $f0117BehaviorRoot commit --quiet -m "materialize F-0117 candidate"
    foreach ($candidatePath in $f0117BehaviorFiles) {
        Add-Content -LiteralPath (Join-Path $f0117BehaviorRoot ($candidatePath -replace "/", "\")) -Value "# replay probe" -Encoding UTF8
    }
    & git -C $f0117BehaviorRoot add -- $f0117BehaviorFiles
    Assert-F0117PreCommitBehaviorFailure -Label "replay"
} finally {
    if (Test-Path -LiteralPath $f0117BehaviorRoot) { Remove-Item -LiteralPath $f0117BehaviorRoot -Recurse -Force }
}

function Set-F0143PreCommitFixtureFile {
    param([string]$Root, [string]$Path, [string]$Content)
    $fullPath = Join-Path $Root ($Path -replace "/", "\")
    $parent = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
    [System.IO.File]::WriteAllText($fullPath, (($Content -replace "`r`n?", "`n").TrimEnd("`n") + "`n"), [System.Text.UTF8Encoding]::new($false))
}

$f0143BehaviorRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-f0143-precommit-behavior-" + [guid]::NewGuid().ToString("N"))
$f0143BehaviorBaseSha = "0fe8edae7a7efc00154f5c54227623be55796983"
$f0143BehaviorBranch = "codex/p1-f0143-spec-approval-transition-hotfix"
$f0143BehaviorParentTaskId = "p1-remediation-rc-02-employee-personal-ai-context-2026-07-18"
$f0143BehaviorAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-spec-approval-transition-hotfix-authorization.md"
# C6-F0143-FIXTURE-PROJECTION-BEGIN
$f0143BehaviorStatePath = "docs/04-agent-system/state/project-state.yaml"
$f0143BehaviorQueuePath = "docs/04-agent-system/state/task-queue.yaml"
$f0143BehaviorCurrentCandidateFiles = @(
    $f0143BehaviorAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$f0143BehaviorFiles = @(
    $f0143BehaviorStatePath,
    $f0143BehaviorQueuePath,
    $f0143BehaviorAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$f0143BehaviorSourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

function Reset-F0143PreCommitBehaviorFixture {
    & git -C $f0143BehaviorRoot rm --quiet -f --cached --ignore-unmatch --sparse -- f0143-extra.md src/f0143-product.ts *> $null
    foreach ($probePath in @("f0143-extra.md", "src/f0143-product.ts")) {
        Remove-Item -LiteralPath (Join-Path $f0143BehaviorRoot ($probePath -replace "/", "\")) -Force -ErrorAction SilentlyContinue
    }
    & git -C $f0143BehaviorRoot reset --hard --quiet $f0143BehaviorBaseSha
    & git -C $f0143BehaviorRoot clean -fdx --quiet
    & git -C $f0143BehaviorRoot branch -M $f0143BehaviorBranch
    foreach ($candidatePath in $f0143BehaviorCurrentCandidateFiles) {
        $sourcePath = Join-Path $f0143BehaviorSourceRoot ($candidatePath -replace "/", "\")
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing F-0143 source file: $candidatePath" }
        Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path $candidatePath -Content ([System.IO.File]::ReadAllText($sourcePath))
    }

    $f0143BehaviorStateText = @(& git -C $f0143BehaviorRoot show "${f0143BehaviorBaseSha}:$f0143BehaviorStatePath") -join "`n"
    if ($LASTEXITCODE -ne 0) { throw "Unable to read F-0143 fixed-base state fixture." }
    $f0143BehaviorQueueText = @(& git -C $f0143BehaviorRoot show "${f0143BehaviorBaseSha}:$f0143BehaviorQueuePath") -join "`n"
    if ($LASTEXITCODE -ne 0) { throw "Unable to read F-0143 fixed-base queue fixture." }

    foreach ($projection in @(
            @{
                Label = "state"
                Path = $f0143BehaviorStatePath
                Text = $f0143BehaviorStateText
                Replacements = @(
                    @{
                        Anchor = "  currentExecutionGate:`n    status: waiting_for_spec_review`n    reason: current_user_approved_f0143_option_a_but_written_spec_review_is_required`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n    resumeAction: review_written_f0143_selected_context_spec_then_write_implementation_plan"
                        Replacement = "  currentExecutionGate:`n    status: satisfied`n    reason: current_user_approved_written_f0143_spec_2026_07_18`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n    resumeAction: execute_f0143_employee_personal_ai_selected_context_plan_red_to_green"
                    },
                    @{
                        Anchor = "  lastKnownMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b`n  lastKnownOriginMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b`n  lastKnownRemoteMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b"
                        Replacement = "  lastKnownMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983`n  lastKnownOriginMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983`n  lastKnownRemoteMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983"
                    }
                )
            },
            @{
                Label = "queue"
                Path = $f0143BehaviorQueuePath
                Text = $f0143BehaviorQueueText
                Replacements = @(
                    @{
                        Anchor = "    currentExecutionGate:`n      status: waiting_for_spec_review`n      reason: current_user_approved_f0143_option_a_but_written_spec_review_is_required`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n      resumeAction: review_written_f0143_selected_context_spec_then_write_implementation_plan"
                        Replacement = "    currentExecutionGate:`n      status: satisfied`n      reason: current_user_approved_written_f0143_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n      resumeAction: execute_f0143_employee_personal_ai_selected_context_plan_red_to_green"
                    }
                )
            }
        )) {
        $projectedText = ($projection.Text -replace "`r`n?", "`n")
        foreach ($replacement in $projection.Replacements) {
            if ([regex]::Matches($projectedText, [regex]::Escape($replacement.Anchor)).Count -ne 1) {
                throw "F-0143 fixed-base $($projection.Label) projection anchor is not exact."
            }
            $projectedText = $projectedText.Replace($replacement.Anchor, $replacement.Replacement)
        }
        Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path $projection.Path -Content $projectedText
    }
    Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path "docs/05-execution-logs/evidence/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md" -Content "# Fixture evidence`n`n## Root-Cause Reproduction`n`nResult: pass`n`n## TDD Evidence`n`nResult: pass`n`n## Reading Evidence`n`nstatus: complete`nconflictsFound: false`ntargetSourceReviewed: true`ntargetTestsReviewed: true`nanalogousImplementationReviewed: true`nCost Calibration Gate remains blocked.`n`n## Validation Results`n`nResult: pass"
    Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md" -Content "# Fixture audit`n`n## Round 1`n`nResult: pass`n`n## Round 2`n`nResult: pass`n`n## Decision`n`nDecision: APPROVE"
    & git -C $f0143BehaviorRoot add -- $f0143BehaviorFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage F-0143 behavior fixture." }
}
# C6-F0143-FIXTURE-PROJECTION-END

function Assert-F0143PreCommitBehaviorFailure {
    param(
        [string]$Label,
        [string]$P1Pattern = "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_",
        [string]$ModulePattern = "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_"
    )
    $p1Failed = $false
    $p1FailureOutput = @()
    try { $p1FailureOutput = @(& $p1GuardPath -RepositoryRoot $f0143BehaviorRoot -Phase pre_commit -SkipExternalIntegrityChecks 2>&1) } catch { $p1Failed = $true; $p1FailureOutput += $_.Exception.Message }
    $moduleFailed = $false
    $moduleFailureOutput = @()
    Push-Location $f0143BehaviorRoot
    try { try { $moduleFailureOutput = @(& $scriptPath 2>&1) } catch { $moduleFailed = $true; $moduleFailureOutput += $_.Exception.Message } } finally { Pop-Location }
    if (-not $p1Failed -or -not $moduleFailed) { throw "F-0143 $Label did not fail both P1 and Module pre-commit guards." }
    if (($p1FailureOutput -join "`n") -notmatch $P1Pattern) { throw "F-0143 $Label P1 failure did not contain '$P1Pattern': $($p1FailureOutput -join '; ')" }
    if (($moduleFailureOutput -join "`n") -notmatch $ModulePattern) { throw "F-0143 $Label Module failure did not contain '$ModulePattern': $($moduleFailureOutput -join '; ')" }
}

try {
    & git clone --quiet --shared --no-checkout $f0143BehaviorSourceRoot $f0143BehaviorRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0143 pre-commit behavior fixture." }
    & git -C $f0143BehaviorRoot config user.name "F0143 PreCommit Behavior Smoke"
    & git -C $f0143BehaviorRoot config user.email "f0143-precommit@example.invalid"
    & git -C $f0143BehaviorRoot config core.autocrlf false
    & git -C $f0143BehaviorRoot config core.longpaths true
    & git -C $f0143BehaviorRoot sparse-checkout init --no-cone
    & git -C $f0143BehaviorRoot sparse-checkout set --no-cone -- @(
        "/.gitattributes",
        "/docs/04-agent-system/",
        "/docs/05-execution-logs/acceptance/2026-07-16-p1-*",
        "/docs/05-execution-logs/acceptance/2026-07-17-p1-*",
        "/docs/05-execution-logs/acceptance/2026-07-18-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-16-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-17-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-18-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-16-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-17-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-18-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-15-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-16-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-17-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-18-p1-*",
        "/scripts/agent-system/"
    )
    & git -C $f0143BehaviorRoot switch --quiet -C $f0143BehaviorBranch $f0143BehaviorBaseSha
    & git -C $f0143BehaviorRoot update-ref refs/remotes/origin/master $f0143BehaviorBaseSha
    Reset-F0143PreCommitBehaviorFixture

    $p1Positive = @(& $p1GuardPath -RepositoryRoot $f0143BehaviorRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    Assert-Contains -Output $p1Positive -Pattern "p1F0143SpecApprovalTransitionHotfixAuthorization: approved_one_time"
    Push-Location $f0143BehaviorRoot
    try { $modulePositive = @(& $scriptPath) } finally { Pop-Location }
    Assert-Contains -Output $modulePositive -Pattern "preCommitScopeMode: p1_f0143_spec_approval_transition_hotfix"

    & git -C $f0143BehaviorRoot branch -M codex/wrong-f0143-branch
    Assert-F0143PreCommitBehaviorFailure -Label "wrong branch"
    Reset-F0143PreCommitBehaviorFixture

    & git -C $f0143BehaviorRoot branch -M Codex/p1-f0143-spec-approval-transition-hotfix
    Assert-F0143PreCommitBehaviorFailure -Label "branch case only"
    Reset-F0143PreCommitBehaviorFixture

    & git -C $f0143BehaviorRoot reset --soft "${f0143BehaviorBaseSha}^"
    Assert-F0143PreCommitBehaviorFailure -Label "wrong base"
    Reset-F0143PreCommitBehaviorFixture

    $statePath = Join-Path $f0143BehaviorRoot "docs\04-agent-system\state\project-state.yaml"
    $stateText = [System.IO.File]::ReadAllText($statePath)
    Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path "docs/04-agent-system/state/project-state.yaml" -Content $stateText.Replace("currentTaskId: $f0143BehaviorParentTaskId", "currentTaskId: p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18")
    & git -C $f0143BehaviorRoot add -- "docs/04-agent-system/state/project-state.yaml"
    Assert-F0143PreCommitBehaviorFailure -Label "wrong task"
    Reset-F0143PreCommitBehaviorFixture

    $queuePath = Join-Path $f0143BehaviorRoot "docs\04-agent-system\state\task-queue.yaml"
    $queueText = [System.IO.File]::ReadAllText($queuePath)
    $f0143GateAnchor = "    currentExecutionGate:`n      status: satisfied`n      reason: current_user_approved_written_f0143_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n      resumeAction: execute_f0143_employee_personal_ai_selected_context_plan_red_to_green"
    if ([regex]::Matches(($queueText -replace "`r`n?", "`n"), [regex]::Escape($f0143GateAnchor)).Count -ne 1) { throw "F-0143 wrong-gate fixture anchor must occur exactly once." }
    Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content (($queueText -replace "`r`n?", "`n").Replace($f0143GateAnchor, $f0143GateAnchor.Replace("status: satisfied", "status: waiting_for_spec_review")))
    & git -C $f0143BehaviorRoot add -- "docs/04-agent-system/state/task-queue.yaml"
    Assert-F0143PreCommitBehaviorFailure -Label "wrong gate"
    Reset-F0143PreCommitBehaviorFixture

    $authorizationFullPath = Join-Path $f0143BehaviorRoot ($f0143BehaviorAuthorizationPath -replace "/", "\")
    $authorizationText = [System.IO.File]::ReadAllText($authorizationFullPath)
    foreach ($mutation in @(
        @{ Label = "authorization key case only"; From = 'Status: approved'; To = 'status: approved' },
        @{ Label = "authorization value case only"; From = 'Status: approved'; To = 'Status: Approved' },
        @{ Label = "human approval suffix"; From = 'other in_progress SHA drift remains hard-blocked on 2026-07-18'; To = 'other in_progress SHA drift remains hard-blocked on 2026-07-18 rejected' },
        @{ Label = "authorization branch"; From = 'Branch: `codex/p1-f0143-spec-approval-transition-hotfix`'; To = 'Branch: `codex/wrong-f0143`' },
        @{ Label = "standing source"; From = '2026-07-16-p1-remediation-program-authorization.md'; To = '2026-07-16-wrong-authorization.md' },
        @{ Label = "exact files"; From = '12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`'; To = '12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`' },
        @{ Label = "reordered exact files"; From = "11. ``scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1```n12. ``scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1``"; To = "11. ``scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1```n12. ``scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1``" }
    )) {
        Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path $f0143BehaviorAuthorizationPath -Content $authorizationText.Replace($mutation.From, $mutation.To)
        & git -C $f0143BehaviorRoot add -- $f0143BehaviorAuthorizationPath
        Assert-F0143PreCommitBehaviorFailure -Label $mutation.Label
        Reset-F0143PreCommitBehaviorFixture
    }

    foreach ($appendMutation in @(
        @{ Label = "conflicting authorization field"; Content = "`nstandardMode: allow`n"; P1Pattern = "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"; ModulePattern = "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID" },
        @{ Label = "duplicate authorization field"; Content = "`nstandardMode: hard_block`n"; P1Pattern = "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"; ModulePattern = "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID" },
        @{ Label = "duplicate exact file"; Content = ("`n" + '13. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`' + "`n"); P1Pattern = "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID"; ModulePattern = "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID" }
    )) {
        Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path $f0143BehaviorAuthorizationPath -Content ($authorizationText.TrimEnd() + $appendMutation.Content)
        & git -C $f0143BehaviorRoot add -- $f0143BehaviorAuthorizationPath
        Assert-F0143PreCommitBehaviorFailure -Label $appendMutation.Label -P1Pattern $appendMutation.P1Pattern -ModulePattern $appendMutation.ModulePattern
        Reset-F0143PreCommitBehaviorFixture
    }

    & git -C $f0143BehaviorRoot rm --quiet -f -- $f0143BehaviorAuthorizationPath
    Assert-F0143PreCommitBehaviorFailure -Label "missing authorization" -P1Pattern "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID" -ModulePattern "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID"
    Reset-F0143PreCommitBehaviorFixture

    & git -C $f0143BehaviorRoot rm --quiet -f -- "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1"
    Assert-F0143PreCommitBehaviorFailure -Label "deleted exact guard" -P1Pattern "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID" -ModulePattern "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID"
    Reset-F0143PreCommitBehaviorFixture

    & git -C $f0143BehaviorRoot rm --quiet -f -- .gitattributes
    Assert-F0143PreCommitBehaviorFailure -Label "extra tracked deletion" -P1Pattern "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID" -ModulePattern "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID"
    Reset-F0143PreCommitBehaviorFixture

    & git -C $f0143BehaviorRoot mv -- "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1" "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.renamed.ps1"
    Assert-F0143PreCommitBehaviorFailure -Label "renamed exact guard" -P1Pattern "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID" -ModulePattern "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID"
    Reset-F0143PreCommitBehaviorFixture

    Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path "f0143-extra.md" -Content "extra"
    & git -C $f0143BehaviorRoot add --sparse -- f0143-extra.md
    Assert-F0143PreCommitBehaviorFailure -Label "extra file" -P1Pattern "P1_PROGRAM_ALLOWED_FILES_VIOLATION" -ModulePattern "HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE)"
    Reset-F0143PreCommitBehaviorFixture

    Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path "src/f0143-product.ts" -Content "export const forbidden = true;"
    & git -C $f0143BehaviorRoot add --sparse -- src/f0143-product.ts
    Assert-F0143PreCommitBehaviorFailure -Label "product file" -P1Pattern "P1_PROGRAM_(?:ALLOWED_FILES|BLOCKED_FILES)_VIOLATION" -ModulePattern "HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE)"
    Reset-F0143PreCommitBehaviorFixture

    Set-F0143PreCommitFixtureFile -Root $f0143BehaviorRoot -Path $f0143BehaviorAuthorizationPath -Content ($authorizationText.TrimEnd() + "`nunstaged divergence`n")
    Assert-F0143PreCommitBehaviorFailure -Label "partial stage"
    Reset-F0143PreCommitBehaviorFixture

    & git -C $f0143BehaviorRoot commit --quiet -m "materialize F-0143 candidate"
    foreach ($candidatePath in $f0143BehaviorFiles) {
        Add-Content -LiteralPath (Join-Path $f0143BehaviorRoot ($candidatePath -replace "/", "\")) -Value "# replay probe" -Encoding UTF8
    }
    & git -C $f0143BehaviorRoot add -- $f0143BehaviorFiles
    Assert-F0143PreCommitBehaviorFailure -Label "replay"
} finally {
    if (Test-Path -LiteralPath $f0143BehaviorRoot) { Remove-Item -LiteralPath $f0143BehaviorRoot -Recurse -Force }
}

$f0117SmokeScopeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tf117pc-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
$f0117SmokeScopeBaseSha = "3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a"
$f0117SmokeScopeBranch = "codex/f0117-smoke-scope-correction"
$f0117SmokeScopeParentTaskId = "p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18"
$f0117SmokeScopeAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix-authorization.md"
$f0117SmokeScopeEvidencePath = "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md"
$f0117SmokeScopeAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md"
$f0117ProductSmokePath = "tests/unit/p1-employee-import-command-migration-source.test.ts"
$f0117SmokeScopeFiles = @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $f0117SmokeScopeAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    $f0117SmokeScopeEvidencePath,
    $f0117SmokeScopeAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)

function Remove-F0117SmokeScopePreCommitFixtureRoot {
    $systemTempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\', '/')
    $fixtureRoot = [System.IO.Path]::GetFullPath($f0117SmokeScopeRoot)
    $fixtureParent = [System.IO.Path]::GetDirectoryName($fixtureRoot).TrimEnd('\', '/')
    $fixtureLeaf = [System.IO.Path]::GetFileName($fixtureRoot)
    if ($fixtureParent -cne $systemTempRoot -or $fixtureLeaf -cnotmatch '^tf117pc-[0-9a-f]{8}$') {
        throw "F0117_SMOKE_SCOPE_PRECOMMIT_CLEANUP_UNSAFE_PATH"
    }

    foreach ($attempt in 1..3) {
        if (-not (Test-Path -LiteralPath $fixtureRoot)) { return }
        try {
            Remove-Item -LiteralPath $fixtureRoot -Recurse -Force -ErrorAction Stop
        } catch {
            if ($attempt -lt 3) { Start-Sleep -Milliseconds (50 * $attempt) }
        }
    }
    if (Test-Path -LiteralPath $fixtureRoot) { throw "F0117_SMOKE_SCOPE_PRECOMMIT_CLEANUP_FAILED" }
}

function Reset-F0117SmokeScopePreCommitFixture {
    & git -C $f0117SmokeScopeRoot reset --hard --quiet $f0117SmokeScopeBaseSha
    & git -C $f0117SmokeScopeRoot clean -fdx --quiet
    & git -C $f0117SmokeScopeRoot branch -M $f0117SmokeScopeBranch
    foreach ($candidatePath in $f0117SmokeScopeFiles) {
        if ($candidatePath -in @("docs/04-agent-system/state/project-state.yaml", "docs/04-agent-system/state/task-queue.yaml")) {
            $baseContent = ((& git -C $f0117BehaviorSourceRoot show "${f0117SmokeScopeBaseSha}:$candidatePath") -join "`n")
            if ($LASTEXITCODE -ne 0) { throw "Failed to read F-0117 smoke scope base fixture file: $candidatePath" }
            Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path $candidatePath -Content $baseContent
        } else {
            $sourcePath = Join-Path $f0117BehaviorSourceRoot ($candidatePath -replace "/", "\")
            if (Test-Path -LiteralPath $sourcePath -PathType Leaf) {
                Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path $candidatePath -Content ([System.IO.File]::ReadAllText($sourcePath))
            }
        }
    }
    $statePath = Join-Path $f0117SmokeScopeRoot "docs\04-agent-system\state\project-state.yaml"
    $stateText = ([System.IO.File]::ReadAllText($statePath) -replace "`r`n?", "`n")
    $stateParentShaBlock = "  lastKnownMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownOriginMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownRemoteMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7"
    $stateProjectedShaBlock = "  lastKnownMasterSha: $f0117SmokeScopeBaseSha`n  lastKnownOriginMasterSha: $f0117SmokeScopeBaseSha`n  lastKnownRemoteMasterSha: $f0117SmokeScopeBaseSha"
    if ([regex]::Matches($stateText, [regex]::Escape($stateParentShaBlock)).Count -ne 1) { throw "F-0117 smoke scope state fixture anchor must occur exactly once." }
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path "docs/04-agent-system/state/project-state.yaml" -Content $stateText.Replace($stateParentShaBlock, $stateProjectedShaBlock)
    $queuePath = Join-Path $f0117SmokeScopeRoot "docs\04-agent-system\state\task-queue.yaml"
    $queueText = ([System.IO.File]::ReadAllText($queuePath) -replace "`r`n?", "`n")
    $queueAnchor = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts"
    $queueReplacement = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - $f0117ProductSmokePath`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts"
    if ([regex]::Matches($queueText, [regex]::Escape($queueAnchor)).Count -ne 1) { throw "F-0117 smoke scope queue fixture anchor must occur exactly once." }
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content $queueText.Replace($queueAnchor, $queueReplacement)
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path $f0117SmokeScopeEvidencePath -Content "# Evidence`n`n## Reading Evidence`nstatus: complete`nconflictsFound: false`ntargetSourceReviewed: true`ntargetTestsReviewed: true`nanalogousImplementationReviewed: true`nCost Calibration Gate remains blocked.`n`n## Root-Cause Reproduction`nResult: pass`n`n## TDD Evidence`nResult: pass`n`n## Validation Results`nResult: pass`n"
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path $f0117SmokeScopeAuditPath -Content "# Audit`n`n## Round 1`nResult: pass`n`n## Round 2`nResult: pass`n`n## Decision`nDecision: APPROVE`n"
    & git -C $f0117SmokeScopeRoot add -- $f0117SmokeScopeFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage exact F-0117 smoke scope-correction fixture." }
}

function Assert-F0117SmokeScopePreCommitFailure {
    param(
        [string]$Label,
        [string]$P1Pattern = "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_",
        [string]$ModulePattern = "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_"
    )
    $p1Output = @()
    $p1Failed = $false
    try { $p1Output = @(& $p1GuardPath -RepositoryRoot $f0117SmokeScopeRoot -Phase pre_commit -SkipExternalIntegrityChecks 2>&1) } catch { $p1Failed = $true; $p1Output += $_.Exception.Message }
    $moduleOutput = @()
    $moduleFailed = $false
    Push-Location $f0117SmokeScopeRoot
    try { try { $moduleOutput = @(& $scriptPath 2>&1) } catch { $moduleFailed = $true; $moduleOutput += $_.Exception.Message } } finally { Pop-Location }
    if (-not $p1Failed -or -not $moduleFailed) { throw "F-0117 smoke scope $Label did not fail both pre-commit guards." }
    if (($p1Output -join "`n") -notmatch $P1Pattern) { throw "F-0117 smoke scope $Label P1 output missed '$P1Pattern': $($p1Output -join '; ')" }
    if (($moduleOutput -join "`n") -notmatch $ModulePattern) { throw "F-0117 smoke scope $Label Module output missed '$ModulePattern': $($moduleOutput -join '; ')" }
}

try {
    & git clone --quiet --shared --no-checkout $f0117BehaviorSourceRoot $f0117SmokeScopeRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0117 smoke scope pre-commit fixture." }
    & git -C $f0117SmokeScopeRoot config user.name "F0117 Smoke Scope PreCommit"
    & git -C $f0117SmokeScopeRoot config user.email "f0117-smoke-scope-precommit@example.invalid"
    & git -C $f0117SmokeScopeRoot config core.autocrlf false
    & git -C $f0117SmokeScopeRoot config core.longpaths true
    & git -C $f0117SmokeScopeRoot switch --quiet -C $f0117SmokeScopeBranch $f0117SmokeScopeBaseSha
    & git -C $f0117SmokeScopeRoot update-ref refs/remotes/origin/master $f0117SmokeScopeBaseSha
    Reset-F0117SmokeScopePreCommitFixture

    $p1SmokeScopePositive = @(& $p1GuardPath -RepositoryRoot $f0117SmokeScopeRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    Assert-Contains -Output $p1SmokeScopePositive -Pattern "p1F0117SmokeScopeCorrectionAuthorization: approved_one_time"
    Push-Location $f0117SmokeScopeRoot
    try { $moduleSmokeScopePositive = @(& $scriptPath) } finally { Pop-Location }
    Assert-Contains -Output $moduleSmokeScopePositive -Pattern "preCommitScopeMode: p1_f0117_smoke_scope_correction"

    & git -C $f0117SmokeScopeRoot branch -M codex/wrong-f0117-smoke-scope
    Assert-F0117SmokeScopePreCommitFailure -Label "wrong branch"
    Reset-F0117SmokeScopePreCommitFixture

    & git -C $f0117SmokeScopeRoot reset --soft "${f0117SmokeScopeBaseSha}^"
    Assert-F0117SmokeScopePreCommitFailure -Label "wrong base"
    Reset-F0117SmokeScopePreCommitFixture

    $statePath = Join-Path $f0117SmokeScopeRoot "docs\04-agent-system\state\project-state.yaml"
    $stateText = [System.IO.File]::ReadAllText($statePath)
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path "docs/04-agent-system/state/project-state.yaml" -Content $stateText.Replace("currentTaskId: $f0117SmokeScopeParentTaskId", "currentTaskId: p1-remediation-rc-02-employee-import-preflight-2026-07-17")
    & git -C $f0117SmokeScopeRoot add -- "docs/04-agent-system/state/project-state.yaml"
    Assert-F0117SmokeScopePreCommitFailure -Label "wrong task"
    Reset-F0117SmokeScopePreCommitFixture

    $queuePath = Join-Path $f0117SmokeScopeRoot "docs\04-agent-system\state\task-queue.yaml"
    $queueText = [System.IO.File]::ReadAllText($queuePath)
    $statusAnchor = "  - id: $f0117SmokeScopeParentTaskId`n    title: P1 RC-02 redeem_code nullable deadline`n    phase: $f0117SmokeScopeParentTaskId`n    status: in_progress"
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content (($queueText -replace "`r`n?", "`n").Replace($statusAnchor, $statusAnchor.Replace("status: in_progress", "status: ready_for_closeout")))
    & git -C $f0117SmokeScopeRoot add -- "docs/04-agent-system/state/task-queue.yaml"
    Assert-F0117SmokeScopePreCommitFailure -Label "wrong status"
    Reset-F0117SmokeScopePreCommitFixture

    $authorizationPath = Join-Path $f0117SmokeScopeRoot ($f0117SmokeScopeAuthorizationPath -replace "/", "\")
    $authorizationText = [System.IO.File]::ReadAllText($authorizationPath)
    foreach ($mutation in @(
        @{ Label = "missing authorization field"; Content = $authorizationText.Replace("replay: hard_block`n", "") },
        @{ Label = "tampered authorization field"; Content = $authorizationText.Replace("standardMode: hard_block", "standardMode: allow") },
        @{ Label = "tampered exact file"; Content = $authorizationText.Replace('12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`', '12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`') },
        @{ Label = "duplicate authorization field"; Content = ($authorizationText.TrimEnd() + "`nstandardMode: hard_block`n") }
    )) {
        Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path $f0117SmokeScopeAuthorizationPath -Content $mutation.Content
        & git -C $f0117SmokeScopeRoot add -- $f0117SmokeScopeAuthorizationPath
        Assert-F0117SmokeScopePreCommitFailure -Label $mutation.Label
        Reset-F0117SmokeScopePreCommitFixture
    }

    & git -C $f0117SmokeScopeRoot rm --quiet -f -- $f0117SmokeScopeAuthorizationPath
    Assert-F0117SmokeScopePreCommitFailure -Label "missing file"
    Reset-F0117SmokeScopePreCommitFixture

    & git -C $f0117SmokeScopeRoot restore --source=HEAD --staged --worktree -- "docs/04-agent-system/state/project-state.yaml"
    Assert-F0117SmokeScopePreCommitFailure -Label "missing state" -P1Pattern "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_ALLOWLIST_MISMATCH" -ModulePattern "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_ALLOWLIST_MISMATCH"
    Reset-F0117SmokeScopePreCommitFixture

    & git -C $f0117SmokeScopeRoot restore --source=HEAD --staged --worktree -- "docs/04-agent-system/state/task-queue.yaml"
    Assert-F0117SmokeScopePreCommitFailure -Label "missing queue" -P1Pattern "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_ALLOWLIST_MISMATCH" -ModulePattern "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_ALLOWLIST_MISMATCH"
    Reset-F0117SmokeScopePreCommitFixture

    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path "f0117-smoke-scope-extra.md" -Content "extra"
    & git -C $f0117SmokeScopeRoot add --sparse -- "f0117-smoke-scope-extra.md"
    Assert-F0117SmokeScopePreCommitFailure -Label "extra file"
    Reset-F0117SmokeScopePreCommitFixture

    $queueText = [System.IO.File]::ReadAllText((Join-Path $f0117SmokeScopeRoot "docs\04-agent-system\state\task-queue.yaml"))
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content ($queueText.TrimEnd() + "`n# forbidden queue delta`n")
    & git -C $f0117SmokeScopeRoot add -- "docs/04-agent-system/state/task-queue.yaml"
    Assert-F0117SmokeScopePreCommitFailure -Label "queue extra delta" -P1Pattern "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -ModulePattern "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
    Reset-F0117SmokeScopePreCommitFixture

    $stateText = [System.IO.File]::ReadAllText((Join-Path $f0117SmokeScopeRoot "docs\04-agent-system\state\project-state.yaml"))
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path "docs/04-agent-system/state/project-state.yaml" -Content ($stateText.TrimEnd() + "`n# forbidden state delta`n")
    & git -C $f0117SmokeScopeRoot add -- "docs/04-agent-system/state/project-state.yaml"
    Assert-F0117SmokeScopePreCommitFailure -Label "state extra delta" -P1Pattern "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_STATE_DELTA_INVALID" -ModulePattern "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_STATE_DELTA_INVALID"
    Reset-F0117SmokeScopePreCommitFixture

    $productSmokeSource = Join-Path $f0117BehaviorSourceRoot ($f0117ProductSmokePath -replace "/", "\")
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path $f0117ProductSmokePath -Content ([System.IO.File]::ReadAllText($productSmokeSource) + "`n// forbidden governance-bundled product smoke change")
    & git -C $f0117SmokeScopeRoot add --sparse -- $f0117ProductSmokePath
    Assert-F0117SmokeScopePreCommitFailure -Label "product smoke content"
    Reset-F0117SmokeScopePreCommitFixture

    $smokeScopeAuthorizationText = [System.IO.File]::ReadAllText((Join-Path $f0117SmokeScopeRoot ($f0117SmokeScopeAuthorizationPath -replace "/", "\")))
    Set-F0117PreCommitFixtureFile -Root $f0117SmokeScopeRoot -Path $f0117SmokeScopeAuthorizationPath -Content ($smokeScopeAuthorizationText.TrimEnd() + "`nunstaged divergence`n")
    Assert-F0117SmokeScopePreCommitFailure -Label "partial stage"
    Reset-F0117SmokeScopePreCommitFixture

    & git -C $f0117SmokeScopeRoot commit --quiet -m "materialize F-0117 smoke scope candidate"
    foreach ($candidatePath in $f0117SmokeScopeFiles) {
        Add-Content -LiteralPath (Join-Path $f0117SmokeScopeRoot ($candidatePath -replace "/", "\")) -Value "# replay probe" -Encoding UTF8
    }
    & git -C $f0117SmokeScopeRoot add -- $f0117SmokeScopeFiles
    Assert-F0117SmokeScopePreCommitFailure -Label "replay"
} finally {
    Remove-F0117SmokeScopePreCommitFixtureRoot
}

Write-Output "F-0117 P1 and Module pre-commit behavior smoke passed"
Write-Output "F-0117 smoke scope-correction P1 and Module pre-commit behavior smoke passed"
Write-Output "Module Run v2 pre-commit hardening smoke passed"
