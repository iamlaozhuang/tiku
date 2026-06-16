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

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing pre-commit hardening script: $scriptPath"
}

$taskId = "module-run-v2-docs-only-fast-lane-mechanism"

$allowedOutput = @(& $scriptPath -TaskId $taskId -ChangedFiles "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1")
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

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE package.json" -Command {
    & $scriptPath -TaskId $taskId -ChangedFiles "package.json"
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

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-pre-commit-hardening-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $sensitiveFixture = Join-Path -Path $fixtureRoot -ChildPath "sensitive-evidence.md"
    $headerName = "Authori" + "zation"
    Set-Content -LiteralPath $sensitiveFixture -Value "$headerName`: Bearer example-token" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SENSITIVE_EVIDENCE" -Command {
        & $scriptPath -TaskId $taskId -ChangedFiles $sensitiveFixture -SkipScopeScan
    }

    $termFixture = Join-Path -Path $fixtureRoot -ChildPath "banned-term.md"
    $nonGlossaryAuthTerm = "lic" + "ense"
    Set-Content -LiteralPath $termFixture -Value "Do not use $nonGlossaryAuthTerm in Tiku authorization surfaces." -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BANNED_TERM" -Command {
        & $scriptPath -TaskId $taskId -ChangedFiles $termFixture -SkipScopeScan
    }

    $aiTextFixture = Join-Path -Path $fixtureRoot -ChildPath "ai-protected-evidence.md"
    $protectedAiField = ("ra" + "w" + "Prom" + "pt")
    Set-Content -LiteralPath $aiTextFixture -Value "$protectedAiField`: This protected AI request text is long enough to require redaction." -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "ai_protected_text" -Command {
        & $scriptPath -TaskId $taskId -ChangedFiles $aiTextFixture -SkipScopeScan
    }

    $payloadFixture = Join-Path -Path $fixtureRoot -ChildPath "provider-payload-evidence.md"
    $payloadField = ("provider" + "Payload")
    Set-Content -LiteralPath $payloadFixture -Value "$payloadField`: { ""request"": ""protected provider payload that must not be recorded"" }" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "ai_protected_text" -Command {
        & $scriptPath -TaskId $taskId -ChangedFiles $payloadFixture -SkipScopeScan
    }

    $redeemCodeFixture = Join-Path -Path $fixtureRoot -ChildPath "redeem-code-evidence.md"
    $redeemCodeField = "redeem" + "_code"
    Set-Content -LiteralPath $redeemCodeFixture -Value "$redeemCodeField`: ABCD-1234-EFGH" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "plaintext_redeem_code" -Command {
        & $scriptPath -TaskId $taskId -ChangedFiles $redeemCodeFixture -SkipScopeScan
    }

    $databaseUrlFixture = Join-Path -Path $fixtureRoot -ChildPath "database-url-evidence.md"
    $databaseScheme = "post" + "gresql"
    Set-Content -LiteralPath $databaseUrlFixture -Value "connection: ${databaseScheme}://user:pass@localhost:5432/tiku" -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "database_connection_url" -Command {
        & $scriptPath -TaskId $taskId -ChangedFiles $databaseUrlFixture -SkipScopeScan
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 pre-commit hardening smoke passed"
