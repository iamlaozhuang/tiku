$ErrorActionPreference = "Stop"

$packageJsonPath = "package.json"

if (-not (Test-Path $packageJsonPath)) {
    throw "Missing package file: $packageJsonPath"
}

$packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
$scriptNames = $packageJson.scripts.PSObject.Properties.Name

foreach ($qualityScriptName in @("lint", "typecheck", "test")) {
    if ($scriptNames -contains $qualityScriptName) {
        Write-Output "RUN npm script: $qualityScriptName"
        & npm.cmd run $qualityScriptName
        if ($LASTEXITCODE -ne 0) {
            throw "Quality gate failed: $qualityScriptName"
        }
    } else {
        Write-Output "MISSING npm script: $qualityScriptName"
    }
}
