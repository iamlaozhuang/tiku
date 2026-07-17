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
$p1GuardPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-P1RemediationSerialProgram.ps1"
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

$scopeCorrectionBaseSha = "5a5d9ac9c66f00991c17c3af7410958199d02a79"
$scopeCorrectionBranch = "codex/p1-f0132-scope-correction-hotfix"
$scopeCorrectionParentTaskId = "p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16"
$scopeCorrectionTaskId = "p1-f0132-scope-correction-hotfix-2026-07-16"
$scopeCorrectionAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-16-p1-f0132-scope-correction-hotfix-authorization.md"
$scopeCorrectionEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-f0132-scope-correction-hotfix.md"
$scopeCorrectionAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0132-scope-correction-hotfix.md"
$scopeCorrectionQueuePath = "docs/04-agent-system/state/task-queue.yaml"
$scopeCorrectionAllowedFile = "tests/unit/phase-11-redeem-code-batch-management-loop.test.ts"
$scopeCorrectionFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-p1-f0132-scope-correction-" + [guid]::NewGuid().ToString("N"))
$scopeCorrectionRemoteUrl = "file:///nonexistent/tiku-p1-f0132-scope-correction-origin.git"
$scopeCorrectionFiles = @(
    $scopeCorrectionQueuePath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $scopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix.md",
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
            "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-redeem-entitlement-preview.md",
            "docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-redeem-entitlement-preview.md",
            "docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-redeem-entitlement-preview.md",
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
    $scopeCorrectionQueueAnchor = "      - tests/unit/phase-8-student-authorization-redeem-runtime.test.ts"
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
        "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix-design.md",
        "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix.md"
    )) {
        [System.IO.File]::WriteAllText((Join-Path $scopeCorrectionFixtureRoot $scopeCorrectionDocPath), "# F-0132 scope-correction smoke artifact`n", $utf8NoBom)
    }

    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionFiles
    $stagedScopeCorrectionFiles = @(& git -C $scopeCorrectionFixtureRoot diff --cached --name-only --diff-filter=ACMR | Sort-Object -Unique)
    if (($stagedScopeCorrectionFiles -join "|") -cne (@($scopeCorrectionFiles | Sort-Object -Unique) -join "|")) {
        throw "F-0132 scope-correction fixture did not stage the exact file set.`nActual: $($stagedScopeCorrectionFiles -join ', ')"
    }

    $scopeCorrectionP1Output = @(& $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    Assert-Contains -Output $scopeCorrectionP1Output -Pattern "p1F0132ScopeCorrectionAuthorization: approved_one_time"
    Assert-Contains -Output $scopeCorrectionP1Output -Pattern "p1ProgramGuardResult: pass"

    Push-Location $scopeCorrectionFixtureRoot
    try {
        $scopeCorrectionOutput = @(& $scriptPath)
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $scopeCorrectionOutput -Pattern "preCommitScopeMode: p1_f0132_scope_correction"
    Assert-Contains -Output $scopeCorrectionOutput -Pattern "p1F0132ScopeCorrectionAuthorization: approved_one_time"
    Assert-Contains -Output $scopeCorrectionOutput -Pattern "OK_SCOPE $([regex]::Escape($scopeCorrectionQueuePath))"

    & git -C $scopeCorrectionFixtureRoot branch -m codex/wrong-f0132-scope-correction
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_CONTEXT_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $scopeCorrectionFixtureRoot branch -m $scopeCorrectionBranch

    $scopeCorrectionQueueStatusPattern = "(?m)(^  - id:\s*$([regex]::Escape($scopeCorrectionParentTaskId))\s*`$\r?\n(?:^    [^\r\n]*\r?\n)*?^    status:)\s+in_progress\s*`$"
    $scopeCorrectionWrongStatusText = [regex]::new($scopeCorrectionQueueStatusPattern).Replace($scopeCorrectionExactQueueText, '${1} ready_for_closeout', 1)
    if ($scopeCorrectionWrongStatusText -ceq $scopeCorrectionExactQueueText) { throw "F-0132 scope-correction queue status negative fixture did not mutate." }
    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, $scopeCorrectionWrongStatusText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0132_SCOPE_CORRECTION_CONTEXT_INVALID" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_CONTEXT_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, $scopeCorrectionExactQueueText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath

    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, "Status: pending`n", $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionAuthorizationPath
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0132_SCOPE_CORRECTION_AUTHORIZATION_INVALID" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_AUTHORIZATION_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, $scopeCorrectionAuthorizationText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionAuthorizationPath

    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, "Status: pending in working tree only`n", $utf8NoBom)
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0132_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionAuthorizationFullPath, $scopeCorrectionAuthorizationText, $utf8NoBom)

    $scopeCorrectionBaseTreeSha = ((& git -C $scopeCorrectionFixtureRoot rev-parse "$scopeCorrectionBaseSha`^{tree}") -join "").Trim()
    $scopeCorrectionWrongBaseSha = (("wrong base" | & git -C $scopeCorrectionFixtureRoot commit-tree $scopeCorrectionBaseTreeSha -p $scopeCorrectionBaseSha) -join "").Trim()
    & git -C $scopeCorrectionFixtureRoot update-ref "refs/heads/$scopeCorrectionBranch" $scopeCorrectionWrongBaseSha $scopeCorrectionBaseSha
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0132_SCOPE_CORRECTION_CONTEXT_INVALID" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_CONTEXT_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $scopeCorrectionFixtureRoot update-ref "refs/heads/$scopeCorrectionBranch" $scopeCorrectionBaseSha $scopeCorrectionWrongBaseSha

    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, ($scopeCorrectionExactQueueText + "      - tests/unit/unapproved-scope-expansion.test.ts`n"), $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0132_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    [System.IO.File]::WriteAllText($scopeCorrectionQueueFullPath, $scopeCorrectionExactQueueText, $utf8NoBom)
    & git -C $scopeCorrectionFixtureRoot add -- $scopeCorrectionQueuePath

    $scopeCorrectionMissingPath = "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix-design.md"
    & git -C $scopeCorrectionFixtureRoot reset --quiet HEAD -- $scopeCorrectionMissingPath
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION|P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
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
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_BLOCKED_FILES_VIOLATION src/out-of-scope.ts|P1_PROGRAM_ALLOWED_FILES_VIOLATION src/out-of-scope.ts" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_commit -SkipExternalIntegrityChecks
    }
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE src/out-of-scope.ts|HARD_BLOCK_OUT_OF_SCOPE src/out-of-scope.ts" -Command {
        Push-Location $scopeCorrectionFixtureRoot
        try { & $scriptPath } finally { Pop-Location }
    }
    & git -C $scopeCorrectionFixtureRoot reset --quiet HEAD -- "src/out-of-scope.ts"
    Remove-Item -LiteralPath $scopeCorrectionEscapePath -Force

    $scopeCorrectionTreeSha = ((& git -C $scopeCorrectionFixtureRoot write-tree) -join "").Trim()
    $scopeCorrectionHeadSha = (("F-0132 scope-correction fixture" | & git -C $scopeCorrectionFixtureRoot commit-tree $scopeCorrectionTreeSha -p $scopeCorrectionBaseSha) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $scopeCorrectionHeadSha -notmatch '^[0-9a-f]{40}$') { throw "Failed to synthesize F-0132 scope-correction fixture commit." }
    & git -C $scopeCorrectionFixtureRoot update-ref "refs/heads/$scopeCorrectionBranch" $scopeCorrectionHeadSha $scopeCorrectionBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to advance F-0132 scope-correction fixture branch." }
    & git -C $scopeCorrectionFixtureRoot switch --quiet -C master $scopeCorrectionHeadSha
    $scopeCorrectionOriginUrl = ((& git -C $scopeCorrectionFixtureRoot remote get-url origin) -join "").Trim()
    $scopeCorrectionUpdateLine = "refs/heads/master $scopeCorrectionHeadSha refs/heads/master $scopeCorrectionBaseSha"
    $scopeCorrectionPrePushOutput = @(& $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $scopeCorrectionOriginUrl -PushUpdateLines $scopeCorrectionUpdateLine -SkipExternalIntegrityChecks)
    Assert-Contains -Output $scopeCorrectionPrePushOutput -Pattern "p1F0132ScopeCorrectionAuthorization: approved_one_time"
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
    Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0132_SCOPE_CORRECTION_ALREADY_MATERIALIZED" -Command {
        & $p1GuardPath -RepositoryRoot $scopeCorrectionFixtureRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $scopeCorrectionOriginUrl -PushUpdateLines $scopeCorrectionReplayUpdateLine -SkipExternalIntegrityChecks
    }
} finally {
    if (Test-Path -LiteralPath $scopeCorrectionFixtureRoot) { Remove-Item -LiteralPath $scopeCorrectionFixtureRoot -Recurse -Force }
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

Write-Output "Module Run v2 pre-commit hardening smoke passed"
