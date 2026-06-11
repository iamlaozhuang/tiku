param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$RunRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$WorktreePath = "",

    [Parameter(Mandatory = $false)]
    [string]$Branch = "",

    [Parameter(Mandatory = $false)]
    [string]$Status = "stopped",

    [Parameter(Mandatory = $false)]
    [string]$Phase = "stopped",

    [Parameter(Mandatory = $false)]
    [string]$BlockerKind = "none",

    [Parameter(Mandatory = $false)]
    [string]$StopTaxonomy = "hard_block",

    [Parameter(Mandatory = $false)]
    [string]$Severity = "hard_block",

    [Parameter(Mandatory = $false)]
    [string]$RequiresHuman = "true",

    [Parameter(Mandatory = $false)]
    [string]$EvidencePath = "",

    [Parameter(Mandatory = $false)]
    [string]$AuditReviewPath = "",

    [Parameter(Mandatory = $false)]
    [string]$CloseoutTransactionState = "unknown",

    [Parameter(Mandatory = $false)]
    [bool]$SafeToAdopt = $false,

    [Parameter(Mandatory = $false)]
    [string]$CleanupPolicy = "none",

    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [string]$RedactedHandoffPath = "",

    [Parameter(Mandatory = $false)]
    [string]$LastSafeCheckpoint = "run registry finalized",

    [Parameter(Mandatory = $false)]
    [string]$NextRecommendedAction = "manual_required_owner_recovery",

    [Parameter(Mandatory = $false)]
    [string]$NextCommand = "manual_required_owner_recovery",

    [Parameter(Mandatory = $false)]
    [string]$RiskIfAutoContinued = "unsafe or impossible to continue until resolved",

    [Parameter(Mandatory = $false)]
    [string]$StateWritten = "run_registry",

    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [string]$NoWriteReason = "",

    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [string]$ResumePointer = "",

    [Parameter(Mandatory = $false)]
    [string]$AutomationId = "tiku-module-run-v2-autopilot",

    [Parameter(Mandatory = $false)]
    [switch]$NoWrite
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    return $Path.Replace("\", "/")
}

function Get-StablePathHash {
    param([Parameter(Mandatory = $true)][string]$Value)

    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value.ToLowerInvariant())
        $hashBytes = $sha256.ComputeHash($bytes)
        return ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha256.Dispose()
    }
}

function Get-GitBranchName {
    param([Parameter(Mandatory = $true)][string]$Path)

    $branchName = ((& git -C $Path branch --show-current 2>$null) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($branchName)) {
        return "(detached HEAD)"
    }

    return $branchName
}

function Get-GitChangedFiles {
    param([Parameter(Mandatory = $true)][string]$Path)

    $files = New-Object System.Collections.Generic.List[string]
    $statusLines = @(& git -C $Path status --porcelain=v1 -uall 2>$null)
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read git status for run registry finalizer: $Path"
    }

    foreach ($line in $statusLines) {
        if ([string]::IsNullOrWhiteSpace($line) -or $line.Length -lt 4) {
            continue
        }

        $filePath = $line.Substring(3).Trim()
        if ($filePath -match "\s+->\s+") {
            $filePath = ($filePath -split "\s+->\s+")[-1]
        }

        $filePath = $filePath.Trim('"')
        if (-not [string]::IsNullOrWhiteSpace($filePath)) {
            $files.Add((ConvertTo-NormalizedPath -Path $filePath))
        }
    }

    return @($files | Select-Object -Unique)
}

function ConvertTo-BooleanValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value,
        [Parameter(Mandatory = $true)][bool]$DefaultValue
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $DefaultValue
    }

    $normalizedValue = $Value.Trim().ToLowerInvariant()
    if ($normalizedValue -in @("true", "1", "yes")) {
        return $true
    }

    if ($normalizedValue -in @("false", "0", "no")) {
        return $false
    }

    throw "Invalid RequiresHuman value: $Value"
}

Write-Section -Title "Module Run v2 Run Registry Finalizer"
Write-Output "runRegistryFinalizerMode: write_terminal_state"

if ([string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
    $RunRegistryRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\automation-runs"
}

if ([string]::IsNullOrWhiteSpace($WorktreePath)) {
    $WorktreePath = ((& git rev-parse --show-toplevel) -join "").Trim()
}

if ([string]::IsNullOrWhiteSpace($WorktreePath) -or -not (Test-Path -LiteralPath $WorktreePath)) {
    throw "Run registry finalizer requires an existing worktree path."
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
    $Branch = Get-GitBranchName -Path $WorktreePath
}

if ([string]::IsNullOrWhiteSpace($TaskId)) {
    throw "Run registry finalizer requires TaskId."
}

$fullWorktreePath = (Resolve-Path -LiteralPath $WorktreePath).Path
$changedFiles = @(Get-GitChangedFiles -Path $fullWorktreePath)
$normalizedWorktreePath = ConvertTo-NormalizedPath -Path $fullWorktreePath
$runId = Get-StablePathHash -Value $normalizedWorktreePath
$registryPath = Join-Path -Path $RunRegistryRoot -ChildPath "$runId.json"
$effectiveRequiresHuman = ConvertTo-BooleanValue -Value $RequiresHuman -DefaultValue $true
$effectiveStateWritten = if ($NoWrite) { "none" } elseif ([string]::IsNullOrWhiteSpace($StateWritten)) { "run_registry" } else { $StateWritten }
$effectiveNoWriteReason = $NoWriteReason
if ($NoWrite -and [string]::IsNullOrWhiteSpace($effectiveNoWriteReason)) {
    $effectiveNoWriteReason = "NoWrite requested; run registry was not written."
}
$normalizedResumePointer = ConvertTo-NormalizedPath -Path $ResumePointer

$registry = [ordered]@{
    runId = $runId
    automationId = $AutomationId
    threadRole = "interactive"
    taskId = $TaskId
    branch = $Branch
    worktreePath = $normalizedWorktreePath
    status = $Status
    heartbeatAtUtc = ([DateTimeOffset]::UtcNow.ToString("o"))
    phase = $Phase
    blockerKind = $BlockerKind
    stopTaxonomy = $StopTaxonomy
    severity = $Severity
    requiresHuman = $effectiveRequiresHuman
    changedFiles = @($changedFiles)
    evidencePath = (ConvertTo-NormalizedPath -Path $EvidencePath)
    auditReviewPath = (ConvertTo-NormalizedPath -Path $AuditReviewPath)
    closeoutTransactionState = $CloseoutTransactionState
    lastSafeCheckpoint = $LastSafeCheckpoint
    nextRecommendedAction = $NextRecommendedAction
    nextCommand = $NextCommand
    riskIfAutoContinued = $RiskIfAutoContinued
    stateWritten = $effectiveStateWritten
    noWriteReason = $effectiveNoWriteReason
    resumePointer = $normalizedResumePointer
    safeToAdopt = $SafeToAdopt
    cleanupPolicy = $CleanupPolicy
    redactedHandoffPath = if ([string]::IsNullOrWhiteSpace($RedactedHandoffPath)) { $null } else { (ConvertTo-NormalizedPath -Path $RedactedHandoffPath) }
    finalizedAtUtc = ([DateTimeOffset]::UtcNow.ToString("o"))
}

if (-not $NoWrite) {
    if (-not (Test-Path -LiteralPath $RunRegistryRoot)) {
        New-Item -ItemType Directory -Path $RunRegistryRoot -Force | Out-Null
    }

    $registry | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $registryPath -Encoding UTF8
}

Write-Output "runRegistryFinalizer: $($(if ($NoWrite) { "dry_run" } else { "wrote" }))"
Write-Output "runRegistryPath: $registryPath"
Write-Output "runRegistryStatus: $Status"
Write-Output "runRegistryPhase: $Phase"
Write-Output "blockerKind: $BlockerKind"
Write-Output "stopTaxonomy: $StopTaxonomy"
Write-Output "severity: $Severity"
Write-Output "requiresHuman: $($effectiveRequiresHuman.ToString().ToLowerInvariant())"
Write-Output "changedFilesCount: $($changedFiles.Count)"
foreach ($changedFile in $changedFiles) {
    Write-Output "changedFile: $changedFile"
}
Write-Output "evidencePath: $EvidencePath"
Write-Output "auditReviewPath: $AuditReviewPath"
Write-Output "closeoutTransactionState: $CloseoutTransactionState"
Write-Output "safeToAdopt: $($SafeToAdopt.ToString().ToLowerInvariant())"
Write-Output "cleanupPolicy: $CleanupPolicy"
Write-Output "nextRecommendedAction: $NextRecommendedAction"
Write-Output "nextCommand: $NextCommand"
Write-Output "riskIfAutoContinued: $RiskIfAutoContinued"
Write-Output "stateWritten: $effectiveStateWritten"
Write-Output "noWriteReason: $effectiveNoWriteReason"
Write-Output "resumePointer: $normalizedResumePointer"
Write-Output "Cost Calibration Gate remains blocked"
