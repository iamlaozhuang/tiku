param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$DatabaseName = "tiku_fresh_phase24_$(Get-Date -Format 'yyyyMMddHHmmss')",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$EnvPath = ".env.local",

    [Parameter(Mandatory = $false)]
    [switch]$PlanOnly
)

$ErrorActionPreference = "Stop"

function Assert-FreshDatabaseName {
    param([string]$Name)

    if ($Name -notmatch "^tiku_fresh_phase24_[a-z0-9_]+$") {
        throw "Blocked: databaseName must use the tiku_fresh_phase24_* local/dev prefix."
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

    throw "Blocked: DATABASE_URL is missing from the env file."
}

function Get-UnquotedEnvValue {
    param([string]$Line)

    $separatorIndex = $Line.IndexOf("=")
    if ($separatorIndex -lt 1) {
        throw "Blocked: DATABASE_URL line is malformed."
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

function Set-DatabaseNameInEnvFile {
    param(
        [string]$Path,
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Blocked: env file is missing."
    }

    $lines = @(Get-Content -LiteralPath $Path -Encoding UTF8)
    $databaseUrlLine = Get-EnvDatabaseUrlLine -Lines $lines
    $databaseUrl = Get-UnquotedEnvValue -Line $databaseUrlLine.Line

    try {
        $databaseUri = [System.Uri]::new($databaseUrl)
    }
    catch {
        throw "Blocked: DATABASE_URL is malformed."
    }

    $hostClass = Get-HostClass -HostName $databaseUri.Host
    if ($hostClass -ne "loopback") {
        throw "Blocked: DATABASE_URL host is not local/dev loopback."
    }

    $uriBuilder = [System.UriBuilder]::new($databaseUri)
    $uriBuilder.Path = $Name
    $updatedDatabaseUrl = $uriBuilder.Uri.AbsoluteUri
    $lines[$databaseUrlLine.Index] = "DATABASE_URL=`"$updatedDatabaseUrl`""
    Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8

    return [PSCustomObject]@{
        HostClass = $hostClass
        DatabaseName = $Name
    }
}

function Invoke-CheckedCommand {
    param(
        [string]$Label,
        [scriptblock]$Command
    )

    Write-Output "Running: $Label"
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Failed: $Label"
    }
    Write-Output "Passed: $Label"
}

Assert-FreshDatabaseName -Name $DatabaseName
$target = Set-DatabaseNameInEnvFile -Path $EnvPath -Name $DatabaseName

Write-Output "Fresh validation target: hostClass=$($target.HostClass) databaseName=$($target.DatabaseName)"

if ($PlanOnly) {
    Write-Output "PlanOnly: external commands skipped after secret-safe env target update."
    exit 0
}

$dockerConfigPath = Join-Path -Path (Get-Location) -ChildPath ".runtime\docker-config"
New-Item -ItemType Directory -Force -Path $dockerConfigPath | Out-Null
$env:DOCKER_CONFIG = $dockerConfigPath

Invoke-CheckedCommand -Label "docker compose up tiku-postgres" -Command { docker compose up -d tiku-postgres }
Invoke-CheckedCommand -Label "create fresh local/dev database" -Command { docker compose exec -T tiku-postgres createdb -U tiku $DatabaseName }
Invoke-CheckedCommand -Label "reviewed Drizzle migrate" -Command { npx.cmd drizzle-kit migrate }
Invoke-CheckedCommand -Label "dev seed" -Command { powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1 }
Invoke-CheckedCommand -Label "validation data prep" -Command { powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-ValidationDataPrep.ps1 }
Invoke-CheckedCommand -Label "full e2e" -Command { npm.cmd run test:e2e }
Invoke-CheckedCommand -Label "build" -Command { npm.cmd run build }

Write-Output "Fresh validation run completed: hostClass=$($target.HostClass) databaseName=$($target.DatabaseName)"
