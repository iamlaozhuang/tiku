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

$taskId = "module-run-v2-pre-commit-scan-hardening"

$allowedOutput = @(& $scriptPath -TaskId $taskId -ChangedFiles ".husky/pre-commit")
Assert-Contains -Output $allowedOutput -Pattern "Module Run v2 Pre-Commit Hardening"
Assert-Contains -Output $allowedOutput -Pattern "preCommitMode: hard_block"
Assert-Contains -Output $allowedOutput -Pattern "OK_SCOPE .husky/pre-commit"
Assert-Contains -Output $allowedOutput -Pattern "Cost Calibration Gate remains blocked"

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE package.json" -Command {
    & $scriptPath -TaskId $taskId -ChangedFiles "package.json"
}

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
