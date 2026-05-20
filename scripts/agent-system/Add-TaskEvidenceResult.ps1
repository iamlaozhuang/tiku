param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$EvidencePath,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Command,

    [Parameter(Mandatory = $true)]
    [ValidateSet("pass", "fail", "skipped")]
    [string]$Result,

    [Parameter(Mandatory = $false)]
    [string]$Summary = "",

    [Parameter(Mandatory = $false)]
    [int]$ExitCode = 0,

    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "",

    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if (-not $DryRun -and -not (Test-Path $EvidencePath)) {
    throw "Missing evidence file: $EvidencePath"
}

$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"
$sectionLines = New-Object System.Collections.Generic.List[string]
$sectionLines.Add("")
$sectionLines.Add("### Evidence Result: $Command")
$sectionLines.Add("")
$sectionLines.Add('- Timestamp: `' + $timestamp + '`')
$sectionLines.Add("- Result: $Result")
$sectionLines.Add("- Exit code: $ExitCode")

if (-not [string]::IsNullOrWhiteSpace($Summary)) {
    $sectionLines.Add("- Summary: $Summary")
}

if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
    $sectionLines.Add('- Output path: `' + $OutputPath + '`')
}

$sectionLines.Add("")
$sectionLines.Add('```powershell')
$sectionLines.Add($Command)
$sectionLines.Add('```')

if ($DryRun) {
    $sectionLines | ForEach-Object { Write-Output $_ }
    return
}

Add-Content -Path $EvidencePath -Value $sectionLines -Encoding UTF8
Write-Output "Appended evidence result: $EvidencePath"
