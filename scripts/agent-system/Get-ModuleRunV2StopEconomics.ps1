param(
    [Parameter(Mandatory = $false)]
    [string]$RunRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [string[]]$TerminalEnvelopePath = @()
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Get-FieldValue {
    param(
        [Parameter(Mandatory = $true)][AllowNull()]$Record,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $Record) {
        return $null
    }

    $property = $Record.PSObject.Properties[$Name]
    if ($null -eq $property) {
        return $null
    }

    return $property.Value
}

function ConvertTo-BooleanValue {
    param(
        [Parameter(Mandatory = $false)][AllowNull()]$Value,
        [Parameter(Mandatory = $false)][bool]$DefaultValue = $false
    )

    if ($null -eq $Value) {
        return $DefaultValue
    }
    if ($Value -is [bool]) {
        return [bool]$Value
    }

    $text = ([string]$Value).Trim().ToLowerInvariant()
    if ($text -in @("true", "1", "yes")) {
        return $true
    }
    if ($text -in @("false", "0", "no")) {
        return $false
    }

    return $DefaultValue
}

function ConvertTo-NullableInt {
    param([Parameter(Mandatory = $false)][AllowNull()]$Value)

    if ($null -eq $Value) {
        return $null
    }

    $number = 0
    if ([int]::TryParse(([string]$Value).Trim(), [ref]$number)) {
        return $number
    }

    return $null
}

function New-StopRecord {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][AllowNull()]$Record
    )

    $severity = [string](Get-FieldValue -Record $Record -Name "severity")
    if ([string]::IsNullOrWhiteSpace($severity)) {
        $severity = [string](Get-FieldValue -Record $Record -Name "runnerSeverity")
    }

    $runnerStepCount = Get-FieldValue -Record $Record -Name "runnerStepCount"
    if ($null -eq $runnerStepCount) {
        $runnerStepCount = Get-FieldValue -Record $Record -Name "runnerSteps"
    }
    if ($null -eq $runnerStepCount) {
        $runnerStepCount = Get-FieldValue -Record $Record -Name "unattendedSteps"
    }

    return [pscustomobject]@{
        Source = $Source
        Severity = $severity
        StopTaxonomy = [string](Get-FieldValue -Record $Record -Name "stopTaxonomy")
        RequiresHuman = ConvertTo-BooleanValue -Value (Get-FieldValue -Record $Record -Name "requiresHuman") -DefaultValue $true
        SafeToProceed = ConvertTo-BooleanValue -Value (Get-FieldValue -Record $Record -Name "safeToProceed") -DefaultValue $false
        NextCommand = [string](Get-FieldValue -Record $Record -Name "nextCommand")
        StateWritten = [string](Get-FieldValue -Record $Record -Name "stateWritten")
        NoWriteReason = [string](Get-FieldValue -Record $Record -Name "noWriteReason")
        ResumePointer = [string](Get-FieldValue -Record $Record -Name "resumePointer")
        RunnerStepCount = ConvertTo-NullableInt -Value $runnerStepCount
    }
}

function Read-TerminalEnvelope {
    param([Parameter(Mandatory = $true)][string]$Path)

    $fields = [ordered]@{}
    foreach ($line in @(Get-Content -LiteralPath $Path)) {
        if ($line -match "^([A-Za-z][A-Za-z0-9]*):\s*(.*)\s*$") {
            $fields[$Matches[1]] = $Matches[2].Trim()
        }
    }

    return [pscustomobject]$fields
}

if ([string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
    $RunRegistryRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\automation-runs"
}

$records = New-Object System.Collections.Generic.List[object]
$runRegistryFilesRead = 0
$terminalEnvelopeFilesRead = 0

if (Test-Path -LiteralPath $RunRegistryRoot) {
    foreach ($registryFile in @(Get-ChildItem -LiteralPath $RunRegistryRoot -Filter "*.json" -File)) {
        $registry = Get-Content -LiteralPath $registryFile.FullName -Raw | ConvertFrom-Json
        $records.Add((New-StopRecord -Source "run_registry" -Record $registry))
        $runRegistryFilesRead++
    }
}

foreach ($envelopePath in $TerminalEnvelopePath) {
    if (-not (Test-Path -LiteralPath $envelopePath)) {
        throw "Terminal envelope path not found: $envelopePath"
    }

    $records.Add((New-StopRecord -Source "terminal_envelope" -Record (Read-TerminalEnvelope -Path $envelopePath)))
    $terminalEnvelopeFilesRead++
}

$falseStopCandidates = @($records | Where-Object {
        $_.Severity -in @("auto_recoverable", "idle", "advisory") -or ($_.SafeToProceed -and -not $_.RequiresHuman)
    })
$hardBlocks = @($records | Where-Object {
        $_.Severity -eq "hard_block" -or $_.StopTaxonomy -eq "hard_block"
    })
$approvalReuseCandidates = @($records | Where-Object {
        $_.Severity -eq "approval_required" -or
        $_.StopTaxonomy -in @("approval_missing", "approval_required") -or
        $_.NextCommand -match "standingUnattendedLocalCloseoutApproval|AllowAutoSeed|AutoSeedApprovalStatement"
    })
$handoffCompleteRecords = @($records | Where-Object {
        $hasRequiredPointer = -not [string]::IsNullOrWhiteSpace($_.NextCommand) -and -not [string]::IsNullOrWhiteSpace($_.ResumePointer)
        $hasWriteAccounting = -not [string]::IsNullOrWhiteSpace($_.StateWritten) -and (
            $_.StateWritten -ne "none" -or -not [string]::IsNullOrWhiteSpace($_.NoWriteReason)
        )
        $hasRequiredPointer -and $hasWriteAccounting
    })
$runnerStepCounts = @($records | ForEach-Object { $_.RunnerStepCount } | Where-Object { $null -ne $_ })
$meanRunnerSteps = "n/a"
if ($runnerStepCounts.Count -gt 0) {
    $meanRunnerSteps = [Math]::Round((($runnerStepCounts | Measure-Object -Average).Average), 2).ToString("0.##")
}

Write-Section -Title "Module Run v2 Stop Economics"
Write-Output "stopEconomicsMode: read_only"
Write-Output "runRegistryRoot: $RunRegistryRoot"
Write-Output "runRegistryFilesRead: $runRegistryFilesRead"
Write-Output "terminalEnvelopeFilesRead: $terminalEnvelopeFilesRead"
Write-Output "recordCount: $($records.Count)"
Write-Output "falseStopCandidateCount: $($falseStopCandidates.Count)"
Write-Output "hardBlockCount: $($hardBlocks.Count)"
Write-Output "approvalReuseCandidateCount: $($approvalReuseCandidates.Count)"
Write-Output "handoffCompletenessCount: $($handoffCompleteRecords.Count)"
Write-Output "meanRunnerSteps: $meanRunnerSteps"
Write-Output "stopEconomicsDecision: summarized"
Write-Output "Cost Calibration Gate remains blocked"
