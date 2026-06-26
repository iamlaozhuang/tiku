$ErrorActionPreference = "Stop"

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2RedactedSmokeRunner.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing runner script: $scriptPath"
}

$tempRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-redacted-smoke-runner-{0}" -f ([guid]::NewGuid().ToString("N")))
[void](New-Item -ItemType Directory -Force -Path $tempRoot)

function Read-EvidenceJson {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Expected evidence JSON not found: $Path"
    }

    return (Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json)
}

try {
    $dryRunEvidencePath = Join-Path -Path $tempRoot -ChildPath "dry-run.json"
    $dryRunArgumentsJson = @("-NoProfile", "-Command", "Write-Output 'DUMMY_SECRET_FIXTURE=should_not_run'") | ConvertTo-Json -Compress
    $dryRunArgumentsJsonBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($dryRunArgumentsJson))
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
        -TaskId "redacted-runner-smoke-dry-run" `
        -SmokeName "dry-run" `
        -Executable "powershell.exe" `
        -ArgumentsJsonBase64 $dryRunArgumentsJsonBase64 `
        -EvidenceJsonPath $dryRunEvidencePath | Out-Null

    $dryRunEvidence = Read-EvidenceJson -Path $dryRunEvidencePath
    if ($dryRunEvidence.decision -ne "dry_run" -or $dryRunEvidence.executed -ne $false) {
        throw "Dry-run evidence did not record a dry run."
    }

    $dryRunRaw = Get-Content -LiteralPath $dryRunEvidencePath -Raw
    if ($dryRunRaw -match "should_not_run") {
        throw "Dry-run evidence leaked raw argument content."
    }

    $passEvidencePath = Join-Path -Path $tempRoot -ChildPath "pass.json"
    $passArgumentsJson = @("-NoProfile", "-Command", "Write-Output 'DUMMY_SECRET_FIXTURE=FIXTURE_VALUE_SHOULD_NOT_APPEAR'; Write-Output 'RAW_OUTPUT_FIXTURE_TOKEN'") | ConvertTo-Json -Compress
    $passArgumentsJsonBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($passArgumentsJson))
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
        -TaskId "redacted-runner-smoke-pass" `
        -SmokeName "pass" `
        -Executable "powershell.exe" `
        -ArgumentsJsonBase64 $passArgumentsJsonBase64 `
        -EvidenceJsonPath $passEvidencePath `
        -Execute | Out-Null

    $passEvidence = Read-EvidenceJson -Path $passEvidencePath
    if ($passEvidence.decision -ne "pass" -or $passEvidence.executed -ne $true) {
        throw "Execute evidence did not record pass."
    }

    if ($passEvidence.runSummary.StdoutLineCount -lt 2) {
        throw "Execute evidence did not record stdout line count."
    }

    $passRaw = Get-Content -LiteralPath $passEvidencePath -Raw
    if ($passRaw -match "FIXTURE_VALUE_SHOULD_NOT_APPEAR|RAW_OUTPUT_FIXTURE_TOKEN|DUMMY_SECRET_FIXTURE") {
        throw "Execute evidence leaked raw command output."
    }

    $blockedEvidencePath = Join-Path -Path $tempRoot -ChildPath "blocked.json"
    $blockedFailed = $false
    $blockedArgumentsJson = @("/c", "echo should_not_run") | ConvertTo-Json -Compress
    $blockedArgumentsJsonBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($blockedArgumentsJson))
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
            -TaskId "redacted-runner-smoke-blocked" `
            -SmokeName "blocked" `
            -Executable "cmd.exe" `
            -ArgumentsJsonBase64 $blockedArgumentsJsonBase64 `
            -EvidenceJsonPath $blockedEvidencePath `
            -Execute 2>$null | Out-Null
        $blockedFailed = $LASTEXITCODE -ne 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if (-not $blockedFailed) {
        throw "Blocked executable did not fail."
    }

    $blockedEvidence = Read-EvidenceJson -Path $blockedEvidencePath
    if ($blockedEvidence.decision -ne "blocked" -or $blockedEvidence.blockReason -ne "executable_not_in_allowlist") {
        throw "Blocked evidence did not record executable allowlist failure."
    }

    $timeoutEvidencePath = Join-Path -Path $tempRoot -ChildPath "timeout.json"
    $timeoutArgumentsJson = @("-NoProfile", "-Command", "Start-Sleep -Seconds 2; Write-Output 'TIMEOUT_FIXTURE_SHOULD_NOT_PASS'") | ConvertTo-Json -Compress
    $timeoutArgumentsJsonBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($timeoutArgumentsJson))
    $timeoutFailed = $false
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
            -TaskId "redacted-runner-smoke-timeout" `
            -SmokeName "timeout" `
            -Executable "powershell.exe" `
            -ArgumentsJsonBase64 $timeoutArgumentsJsonBase64 `
            -TimeoutSeconds 1 `
            -EvidenceJsonPath $timeoutEvidencePath `
            -Execute 2>$null | Out-Null
        $timeoutFailed = $LASTEXITCODE -ne 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if (-not $timeoutFailed) {
        throw "Timeout command did not fail."
    }

    $timeoutEvidence = Read-EvidenceJson -Path $timeoutEvidencePath
    if ($timeoutEvidence.decision -ne "failed_timeout" -or $timeoutEvidence.runSummary.TimedOut -ne $true) {
        throw "Timeout evidence did not record failed_timeout."
    }

    $timeoutRaw = Get-Content -LiteralPath $timeoutEvidencePath -Raw
    if ($timeoutRaw -match "TIMEOUT_FIXTURE_SHOULD_NOT_PASS") {
        throw "Timeout evidence leaked raw command output."
    }

    Write-Output "redactedSmokeRunnerSmokeDecision: pass"
} finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
