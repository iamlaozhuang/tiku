param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $false)]
    [string]$WorktreePath = ".",

    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [string]$Branch = "",

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$FailureClass,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$FailedCommand,

    [Parameter(Mandatory = $false)]
    [string]$LastPassedGate = "none",

    [Parameter(Mandatory = $false)]
    [string]$CloseoutTransactionState = "unknown",

    [Parameter(Mandatory = $false)]
    [string[]]$ChangedFiles = @(),

    [Parameter(Mandatory = $false)]
    [bool]$SafeToAdopt = $false,

    [Parameter(Mandatory = $false)]
    [string]$NextCommand = "inspect recovery packet and rerun the guarded gate",

    [Parameter(Mandatory = $false)]
    [string]$HandoffRoot = ""
)

$ErrorActionPreference = "Stop"

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    return $Path.Replace("\", "/")
}

function ConvertTo-SafeFileSegment {
    param([Parameter(Mandatory = $true)][string]$Value)

    $safeValue = $Value -replace "[^A-Za-z0-9._-]", "-"
    $safeValue = $safeValue.Trim("-")
    if ([string]::IsNullOrWhiteSpace($safeValue)) {
        return "recovery"
    }

    return $safeValue
}

function Get-StableHash {
    param([Parameter(Mandatory = $true)][string]$Value)

    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
        $hashBytes = $sha256.ComputeHash($bytes)
        return -join ($hashBytes | ForEach-Object { $_.ToString("x2") })
    } finally {
        $sha256.Dispose()
    }
}

function ConvertTo-RedactedText {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    $redactedValue = $Value
    $authHeaderName = "Author" + "ization"
    $dbUrlName = "DATABASE" + "_URL"
    $postgresScheme = "post" + "gres"
    $redactedValue = $redactedValue -replace "(?i)$authHeaderName`:\s*Bearer\s+[^\s]+", "$authHeaderName`: Bearer <redacted>"
    $redactedValue = $redactedValue -replace "(?i)\b$dbUrlName\s*=\s*[^\s]+", "$dbUrlName=<redacted>"
    $redactedValue = $redactedValue -replace "(?i)\b[A-Z0-9_]*(API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+", '$1=<redacted>'
    $redactedValue = $redactedValue -replace "(?i)$postgresScheme(ql)?://[^\s]+", "${postgresScheme}://<redacted>"
    return $redactedValue
}

function Get-GitChangedFiles {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return @()
    }

    $insideWorktree = ((& git -C $Path rev-parse --is-inside-work-tree 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") {
        return @()
    }

    $statusLines = @(& git -C $Path status --porcelain=v1 -uall 2>$null)
    $files = New-Object System.Collections.Generic.List[string]
    foreach ($statusLine in $statusLines) {
        if ($statusLine.Length -lt 4) {
            continue
        }

        $filePath = $statusLine.Substring(3)
        if ($filePath -match "\s+->\s+") {
            $filePath = ($filePath -split "\s+->\s+")[-1]
        }
        $files.Add((ConvertTo-NormalizedPath -Path $filePath))
    }

    return $files.ToArray()
}

function Write-List {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Values
    )

    if ($Values.Count -eq 0) {
        return "- ${Title}: none"
    }

    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("- ${Title}:")
    foreach ($value in $Values) {
        $lines.Add("  - $value")
    }

    return $lines.ToArray()
}

try {
    if ([string]::IsNullOrWhiteSpace($HandoffRoot)) {
        $HandoffRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\handoffs"
    }

    $resolvedWorktreePath = if (Test-Path -LiteralPath $WorktreePath) { (Resolve-Path -LiteralPath $WorktreePath).Path } else { $WorktreePath }
    if ([string]::IsNullOrWhiteSpace($Branch) -and (Test-Path -LiteralPath $resolvedWorktreePath)) {
        $Branch = ((& git -C $resolvedWorktreePath branch --show-current 2>$null) -join "").Trim()
        if ([string]::IsNullOrWhiteSpace($Branch)) {
            $Branch = "detached-or-unknown"
        }
    }

    $effectiveChangedFiles = @($ChangedFiles | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if ($effectiveChangedFiles.Count -eq 0) {
        $effectiveChangedFiles = @(Get-GitChangedFiles -Path $resolvedWorktreePath)
    }

    $redactedFailedCommand = ConvertTo-RedactedText -Value $FailedCommand
    $fingerprintSource = @(
        $TaskId,
        $FailureClass,
        $redactedFailedCommand,
        $CloseoutTransactionState,
        ($effectiveChangedFiles -join "|")
    ) -join "`n"
    $blockerFingerprint = (Get-StableHash -Value $fingerprintSource).Substring(0, 16)
    $safeTaskId = ConvertTo-SafeFileSegment -Value $TaskId
    $packetPath = Join-Path -Path $HandoffRoot -ChildPath "$safeTaskId-$blockerFingerprint-recovery-packet.md"

    if (-not (Test-Path -LiteralPath $HandoffRoot)) {
        New-Item -ItemType Directory -Path $HandoffRoot -Force | Out-Null
    }

    $packetDecision = "written"
    if (-not (Test-Path -LiteralPath $packetPath)) {
        $changedFileLines = @(Write-List -Title "changedFiles" -Values $effectiveChangedFiles)
        $forbiddenActions = @(
            "dependency or lockfile mutation without approval",
            "env or secret access",
            "provider calls or provider configuration",
            "schema or migration work",
            "deploy, PR, force push, or Cost Calibration Gate execution"
        )
        $forbiddenActionLines = @(Write-List -Title "forbiddenActions" -Values $forbiddenActions)
        $safeToAdoptText = $SafeToAdopt.ToString().ToLowerInvariant()
        $normalizedWorktreePath = ConvertTo-NormalizedPath -Path $resolvedWorktreePath
        $normalizedNextCommand = ConvertTo-RedactedText -Value $NextCommand

        $packetContent = @(
            "# Module Run v2 Recovery Packet",
            "",
            "taskId: $TaskId",
            "branch: $Branch",
            "worktreePath: $normalizedWorktreePath",
            "failureClass: $FailureClass",
            "lastPassedGate: $LastPassedGate",
            "failedCommand: $redactedFailedCommand",
            "closeoutTransactionState: $CloseoutTransactionState",
            "safeToAdopt: $safeToAdoptText",
            "blockerFingerprint: $blockerFingerprint",
            "nextCommand: $normalizedNextCommand",
            "",
            "## Changed Files",
            $changedFileLines,
            "",
            "## Forbidden Actions",
            $forbiddenActionLines,
            "",
            "Cost Calibration Gate remains blocked."
        )

        Set-Content -LiteralPath $packetPath -Value $packetContent -Encoding UTF8
    } else {
        $packetDecision = "reused"
    }

    Write-Output "recoveryPacketDecision: $packetDecision"
    Write-Output "recoveryPacketPath: $packetPath"
    Write-Output "blockerFingerprint: $blockerFingerprint"
    Write-Output "safeToAdopt: $($SafeToAdopt.ToString().ToLowerInvariant())"
    Write-Output "changedFileCount: $($effectiveChangedFiles.Count)"
    Write-Output "Cost Calibration Gate remains blocked"
} catch {
    Write-Output "HARD_BLOCK_RECOVERY_PACKET_EXCEPTION $($_.Exception.Message)"
    Write-Output "recoveryPacketDecision: stop_for_hard_block"
    Write-Output "blockerFingerprint: unknown"
    Write-Output "safeToAdopt: false"
    Write-Output "Cost Calibration Gate remains blocked"
    exit 1
}
