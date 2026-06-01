param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$DatabaseName = "tiku_fresh_phase24_$(Get-Date -Format 'yyyyMMddHHmmss')",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$EnvPath = ".env.local",

    [Parameter(Mandatory = $false)]
    [switch]$PlanOnly,

    [Parameter(Mandatory = $false)]
    [switch]$PreflightOnly
)

$ErrorActionPreference = "Stop"
$script:RunHostClass = "unknown"
$script:RunDatabaseName = $DatabaseName
$script:FailureCategory = "none"

function Stop-FreshValidationRun {
    param(
        [string]$Category,
        [string]$Message
    )

    $script:FailureCategory = $Category
    throw $Message
}

function Write-RunSummary {
    param(
        [string]$Mode,
        [string]$Result
    )

    if ($Result -eq "failed") {
        Write-Output "Fresh validation summary: mode=$Mode result=$Result hostClass=$script:RunHostClass databaseName=$script:RunDatabaseName failureCategory=$script:FailureCategory"
        return
    }

    Write-Output "Fresh validation summary: mode=$Mode result=$Result hostClass=$script:RunHostClass databaseName=$script:RunDatabaseName"
}

function Assert-FreshDatabaseName {
    param([string]$Name)

    if ($Name -notmatch "^tiku_fresh_phase\d+_[a-z0-9_]+$") {
        Stop-FreshValidationRun -Category "target_not_local_dev" -Message "Blocked: databaseName must use the tiku_fresh_phase* local/dev prefix."
    }
}

function Get-EnvDatabaseUrlLine {
    param([string[]]$Lines)

    for ($index = 0; $index -lt $Lines.Count; $index += 1) {
        if ($Lines[$index] -match "^\s*DATABASE_URL\s*=") {
            return [PSCustomObject]@{
                Index = $index
                Line = $Lines[$index]
            }
        }
    }

    Stop-FreshValidationRun -Category "env_missing" -Message "Blocked: DATABASE_URL is missing from the env file."
}

function Get-UnquotedEnvValue {
    param([string]$Line)

    $separatorIndex = $Line.IndexOf("=")
    if ($separatorIndex -lt 1) {
        Stop-FreshValidationRun -Category "env_missing" -Message "Blocked: DATABASE_URL line is malformed."
    }

    $rawValue = $Line.Substring($separatorIndex + 1).Trim()
    return $rawValue.Trim('"').Trim("'")
}

function Get-HostClass {
    param([string]$HostName)

    $normalizedHost = $HostName.ToLowerInvariant()
    $loopbackHosts = @("127.0.0.1", "localhost", "::1", "[::1]")

    if ($loopbackHosts -contains $normalizedHost) {
        return "loopback"
    }

    return "blocked"
}

function Get-DatabaseTargetFromEnvFile {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        Stop-FreshValidationRun -Category "env_missing" -Message "Blocked: env file is missing."
    }

    $lines = @(Get-Content -LiteralPath $Path -Encoding UTF8)
    $databaseUrlLine = Get-EnvDatabaseUrlLine -Lines $lines
    $databaseUrl = Get-UnquotedEnvValue -Line $databaseUrlLine.Line

    try {
        $databaseUri = [System.Uri]::new($databaseUrl)
    }
    catch {
        Stop-FreshValidationRun -Category "env_missing" -Message "Blocked: DATABASE_URL is malformed."
    }

    $hostClass = Get-HostClass -HostName $databaseUri.Host
    $script:RunHostClass = $hostClass
    if ($hostClass -ne "loopback") {
        Stop-FreshValidationRun -Category "target_not_local_dev" -Message "Blocked: DATABASE_URL host is not local/dev loopback."
    }

    return [PSCustomObject]@{
        Lines = $lines
        DatabaseUrlLine = $databaseUrlLine
        DatabaseUri = $databaseUri
        HostClass = $hostClass
    }
}

function Set-DatabaseNameInEnvFile {
    param(
        [string]$Path,
        [string]$Name,
        [object]$Target
    )

    $uriBuilder = [System.UriBuilder]::new($Target.DatabaseUri)
    $uriBuilder.Path = $Name
    $updatedDatabaseUrl = $uriBuilder.Uri.AbsoluteUri
    $Target.Lines[$Target.DatabaseUrlLine.Index] = "DATABASE_URL=`"$updatedDatabaseUrl`""
    Set-Content -LiteralPath $Path -Value $Target.Lines -Encoding UTF8

    return [PSCustomObject]@{
        HostClass = $Target.HostClass
        DatabaseName = $Name
    }
}

function Invoke-CheckedCommand {
    param(
        [string]$Label,
        [string]$FailureCategory,
        [scriptblock]$Command
    )

    Write-Output "Running: $Label"
    try {
        & $Command
    }
    catch {
        Stop-FreshValidationRun -Category $FailureCategory -Message "Failed: $Label"
    }

    if ($LASTEXITCODE -ne 0) {
        Stop-FreshValidationRun -Category $FailureCategory -Message "Failed: $Label"
    }
    Write-Output "Passed: $Label"
}

try {
    Assert-FreshDatabaseName -Name $DatabaseName
    $envTarget = Get-DatabaseTargetFromEnvFile -Path $EnvPath

    if ($PreflightOnly) {
        Write-RunSummary -Mode "preflight" -Result "pass"
        exit 0
    }

    $target = Set-DatabaseNameInEnvFile -Path $EnvPath -Name $DatabaseName -Target $envTarget

    Write-Output "Fresh validation target: hostClass=$($target.HostClass) databaseName=$($target.DatabaseName)"

    if ($PlanOnly) {
        Write-Output "PlanOnly: external commands skipped after secret-safe env target update."
        Write-RunSummary -Mode "plan" -Result "pass"
        exit 0
    }

    $dockerConfigPath = Join-Path -Path (Get-Location) -ChildPath ".runtime\docker-config"
    New-Item -ItemType Directory -Force -Path $dockerConfigPath | Out-Null
    $env:DOCKER_CONFIG = $dockerConfigPath

    Invoke-CheckedCommand -Label "docker compose up tiku-postgres" -FailureCategory "docker_unavailable" -Command { docker compose up -d tiku-postgres }
    Invoke-CheckedCommand -Label "create fresh local/dev database" -FailureCategory "database_create_failed" -Command { docker compose exec -T tiku-postgres createdb -U tiku $DatabaseName }
    Invoke-CheckedCommand -Label "reviewed Drizzle migrate" -FailureCategory "migration_failed" -Command { npx.cmd drizzle-kit migrate }
    Invoke-CheckedCommand -Label "dev seed" -FailureCategory "seed_failed" -Command { powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1 }
    Invoke-CheckedCommand -Label "validation data prep" -FailureCategory "validation_data_prep_failed" -Command { powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-ValidationDataPrep.ps1 }
    Invoke-CheckedCommand -Label "full e2e" -FailureCategory "e2e_failed" -Command { npm.cmd run test:e2e }
    Invoke-CheckedCommand -Label "build" -FailureCategory "build_failed" -Command { npm.cmd run build }

    Write-Output "Fresh validation run completed: hostClass=$($target.HostClass) databaseName=$($target.DatabaseName)"
    Write-RunSummary -Mode "full" -Result "pass"
}
catch {
    if ($script:FailureCategory -eq "none") {
        $script:FailureCategory = "unknown_failure"
    }

    $failedMode = if ($PreflightOnly) { "preflight" } elseif ($PlanOnly) { "plan" } else { "full" }
    Write-RunSummary -Mode $failedMode -Result "failed"
    Write-Output "Error: $($_.Exception.Message)"
    exit 1
}
