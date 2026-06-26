param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$SmokeName,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Executable,

    [Parameter(Mandatory = $false)]
    [AllowEmptyCollection()]
    [string[]]$Arguments = @(),

    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [string]$ArgumentsJson = "",

    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [string]$ArgumentsJsonBase64 = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 1)]
    [int]$MaxAttempts = 1,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 600)]
    [int]$TimeoutSeconds = 60,

    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [string]$EvidenceJsonPath = "",

    [Parameter(Mandatory = $false)]
    [AllowEmptyCollection()]
    [string[]]$AllowedExecutable = @(
        "powershell.exe",
        "pwsh.exe",
        "node.exe",
        "npm.cmd",
        "npx.cmd",
        "node_modules\.bin\tsx.cmd",
        ".\node_modules\.bin\tsx.cmd"
    ),

    [Parameter(Mandatory = $false)]
    [switch]$Execute
)

$ErrorActionPreference = "Stop"

if (-not [string]::IsNullOrWhiteSpace($ArgumentsJsonBase64)) {
    $jsonBytes = [System.Convert]::FromBase64String($ArgumentsJsonBase64)
    $ArgumentsJson = [System.Text.Encoding]::UTF8.GetString($jsonBytes)
}

if (-not [string]::IsNullOrWhiteSpace($ArgumentsJson)) {
    $parsedArguments = ConvertFrom-Json -InputObject $ArgumentsJson
    $Arguments = @($parsedArguments | ForEach-Object { [string]$_ })
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Path)

    return $Path.Replace("/", "\").Trim()
}

function Test-AllowedExecutable {
    param(
        [Parameter(Mandatory = $true)][string]$Candidate,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$AllowList
    )

    $normalizedCandidate = ConvertTo-NormalizedPath -Path $Candidate
    $candidateLeaf = Split-Path -Path $normalizedCandidate -Leaf

    foreach ($allowedItem in $AllowList) {
        $normalizedAllowed = ConvertTo-NormalizedPath -Path $allowedItem
        if ($normalizedCandidate -ieq $normalizedAllowed) {
            return $true
        }

        if ($candidateLeaf -ieq $normalizedAllowed) {
            return $true
        }
    }

    return $false
}

function Join-ProcessArguments {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Items)

    $quoted = New-Object System.Collections.Generic.List[string]
    foreach ($item in $Items) {
        if ($null -eq $item) {
            continue
        }

        if ($item -match '[\s"]') {
            $escaped = $item.Replace('\', '\\').Replace('"', '\"')
            $quoted.Add("`"$escaped`"")
        } else {
            $quoted.Add($item)
        }
    }

    return ($quoted.ToArray() -join " ")
}

function Get-Sha256Text {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([System.BitConverter]::ToString($sha.ComputeHash($bytes))).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha.Dispose()
    }
}

function Get-LineCount {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    if ([string]::IsNullOrEmpty($Text)) {
        return 0
    }

    return (($Text -split "`r?`n") | Where-Object { -not [string]::IsNullOrEmpty($_) }).Count
}

function New-EvidenceObject {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][bool]$Executed,
        [Parameter(Mandatory = $false)][AllowNull()][object]$RunSummary = $null,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$BlockReason = ""
    )

    $argumentFingerprint = Get-Sha256Text -Text ($Arguments -join "`n")
    $executableFingerprint = Get-Sha256Text -Text $Executable

    return [ordered]@{
        schemaVersion = 1
        runner = "module_run_v2_redacted_smoke_runner"
        taskId = $TaskId
        smokeName = $SmokeName
        decision = $Decision
        executed = $Executed
        executeSwitchPresent = [bool]$Execute
        maxAttempts = $MaxAttempts
        attemptCount = if ($null -ne $RunSummary) { $RunSummary.AttemptCount } else { 0 }
        timeoutSeconds = $TimeoutSeconds
        executableLeaf = Split-Path -Path $Executable -Leaf
        executableFingerprint = $executableFingerprint
        argumentCount = $Arguments.Count
        argumentFingerprint = $argumentFingerprint
        blockReason = $BlockReason
        runSummary = $RunSummary
        rawStdoutPersisted = $false
        rawStderrPersisted = $false
        rawArgumentsPersisted = $false
        redactionMode = "summary_counts_hashes_only"
        blockedCapabilitiesNotApprovedByRunner = @(
            "database_connection_or_mutation",
            "provider_call_or_provider_credential_read",
            "env_secret_value_access_or_output",
            "browser_e2e_or_dev_server",
            "schema_migration_or_dependency_change",
            "staging_prod_deploy_payment_external_service",
            "formal_publish_or_student_visible_content",
            "cost_calibration_gate",
            "final_acceptance_pass"
        )
        generatedAt = (Get-Date).ToString("o")
    }
}

function Write-Evidence {
    param([Parameter(Mandatory = $true)][object]$Evidence)

    $json = $Evidence | ConvertTo-Json -Depth 8
    if (-not [string]::IsNullOrWhiteSpace($EvidenceJsonPath)) {
        $evidenceParent = Split-Path -Path $EvidenceJsonPath -Parent
        if (-not [string]::IsNullOrWhiteSpace($evidenceParent) -and -not (Test-Path -LiteralPath $evidenceParent)) {
            [void](New-Item -ItemType Directory -Force -Path $evidenceParent)
        }

        Set-Content -LiteralPath $EvidenceJsonPath -Value $json -Encoding UTF8
    }

    Write-Output "redactedSmokeRunnerDecision: $($Evidence.decision)"
    Write-Output "redactedSmokeRunnerExecuted: $($Evidence.executed)"
    Write-Output "redactedSmokeRunnerEvidenceJsonPath: $EvidenceJsonPath"
}

if (-not (Test-AllowedExecutable -Candidate $Executable -AllowList $AllowedExecutable)) {
    $blockedEvidence = New-EvidenceObject -Decision "blocked" -Executed $false -BlockReason "executable_not_in_allowlist"
    Write-Evidence -Evidence $blockedEvidence
    throw "Executable is not allowed by this runner: $Executable"
}

if (-not $Execute) {
    $dryRunEvidence = New-EvidenceObject -Decision "dry_run" -Executed $false -BlockReason "execute_switch_not_present"
    Write-Evidence -Evidence $dryRunEvidence
    exit 0
}

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$timedOut = $false
$exitCode = $null
$stdoutText = ""
$stderrText = ""

try {
    $processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processStartInfo.FileName = $Executable
    $processStartInfo.Arguments = Join-ProcessArguments -Items $Arguments
    $processStartInfo.UseShellExecute = $false
    $processStartInfo.CreateNoWindow = $true
    $processStartInfo.RedirectStandardOutput = $true
    $processStartInfo.RedirectStandardError = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processStartInfo

    [void]$process.Start()
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()

    $finished = $process.WaitForExit($TimeoutSeconds * 1000)
    if (-not $finished) {
        $timedOut = $true
        try {
            $process.Kill()
        } catch {
            Write-Output "redactedSmokeRunnerKillWarning: unable_to_kill_timed_out_process"
        }
    } else {
        $process.WaitForExit()
        $exitCode = $process.ExitCode
    }

    $stdoutText = $stdoutTask.Result
    $stderrText = $stderrTask.Result
} finally {
    $stopwatch.Stop()
    if ($null -ne $process) {
        $process.Dispose()
    }
}

$runSummary = [ordered]@{
    AttemptCount = 1
    ExitCode = $exitCode
    TimedOut = $timedOut
    DurationMs = [int]$stopwatch.Elapsed.TotalMilliseconds
    StdoutLineCount = Get-LineCount -Text $stdoutText
    StderrLineCount = Get-LineCount -Text $stderrText
    StdoutSha256 = Get-Sha256Text -Text $stdoutText
    StderrSha256 = Get-Sha256Text -Text $stderrText
    OutputTempFilesRemoved = $true
}

$decision = if ($timedOut) { "failed_timeout" } elseif ($exitCode -eq 0) { "pass" } else { "failed_exit_code" }
$evidence = New-EvidenceObject -Decision $decision -Executed $true -RunSummary $runSummary
Write-Evidence -Evidence $evidence

if ($decision -ne "pass") {
    throw "Redacted smoke command failed with decision: $decision"
}
