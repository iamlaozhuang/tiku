$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $joinedOutput = $Output -join "`n"
    if ($joinedOutput -notmatch $Pattern) {
        throw "Expected output to match pattern: $Pattern`nActual:`n$joinedOutput"
    }
}

function New-SmokeRoot {
    $root = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-closeout-tooling-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $root | Out-Null
    return $root
}

function Write-FakeNodeTooling {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $false)][switch]$FailLint
    )

    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\.bin") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\typescript") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\prettier\bin") -Force | Out-Null
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\eslint.cmd") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\tsc.cmd") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\prettier.cmd") -Encoding ASCII
    "{}" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\typescript\package.json") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\prettier\bin\prettier.cjs") -Encoding ASCII
    '{"scripts":{"lint":"eslint","typecheck":"tsc --noEmit"}}' | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "package.json") -Encoding UTF8

    if ($FailLint) {
        $npmCommand = @"
@echo off
if "%1"=="run" if "%2"=="lint" (
  echo lint failed
  exit /b 7
)
if "%1"=="run" if "%2"=="typecheck" (
  echo typecheck ok
  exit /b 0
)
exit /b 9
"@
    } else {
        $npmCommand = @"
@echo off
if "%1"=="run" if "%2"=="lint" (
  echo lint ok
  exit /b 0
)
if "%1"=="run" if "%2"=="typecheck" (
  echo typecheck ok
  exit /b 0
)
exit /b 9
"@
    }
    $fakeBin = Join-Path -Path $Root -ChildPath "fake-bin"
    New-Item -ItemType Directory -Path $fakeBin | Out-Null
    Set-Content -LiteralPath (Join-Path -Path $fakeBin -ChildPath "npm.cmd") -Value $npmCommand -Encoding ASCII
    return $fakeBin
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2CloseoutLocalToolingReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing closeout local tooling readiness script: $scriptPath"
}

$originalPath = $env:Path
$roots = New-Object System.Collections.Generic.List[string]
try {
    $noPackageRoot = New-SmokeRoot
    $roots.Add($noPackageRoot)
    Push-Location $noPackageRoot
    $notApplicableOutput = @(& $scriptPath 2>&1)
    Pop-Location
    Assert-Contains -Output $notApplicableOutput -Pattern "closeoutLocalToolingDecision: not_applicable"

    $missingShimRoot = New-SmokeRoot
    $roots.Add($missingShimRoot)
    '{"scripts":{"lint":"eslint","typecheck":"tsc --noEmit"}}' | Set-Content -LiteralPath (Join-Path -Path $missingShimRoot -ChildPath "package.json") -Encoding UTF8
    New-Item -ItemType Directory -Path (Join-Path -Path $missingShimRoot -ChildPath "node_modules") | Out-Null
    Push-Location $missingShimRoot
    $missingShimOutput = @(powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath 2>&1)
    $missingShimExitCode = $LASTEXITCODE
    Pop-Location
    if ($missingShimExitCode -eq 0) {
        throw "Expected missing .bin shim case to exit non-zero. Output:`n$($missingShimOutput -join "`n")"
    }
    Assert-Contains -Output $missingShimOutput -Pattern "closeoutLocalToolingMissing: node_modules\\.bin"
    Assert-Contains -Output $missingShimOutput -Pattern "reason: local binary shims are missing"

    $readyRoot = New-SmokeRoot
    $roots.Add($readyRoot)
    $readyFakeBin = Write-FakeNodeTooling -Root $readyRoot
    $env:Path = "$readyFakeBin;$originalPath"
    Push-Location $readyRoot
    $readyOutput = @(& $scriptPath 2>&1)
    Pop-Location
    Assert-Contains -Output $readyOutput -Pattern "closeoutLocalToolingDecision: ready"
    Assert-Contains -Output $readyOutput -Pattern "closeoutLocalToolingCommand: npm.cmd run lint"
    Assert-Contains -Output $readyOutput -Pattern "closeoutLocalToolingCommand: npm.cmd run typecheck"

    $failedRoot = New-SmokeRoot
    $roots.Add($failedRoot)
    $failedFakeBin = Write-FakeNodeTooling -Root $failedRoot -FailLint
    $env:Path = "$failedFakeBin;$originalPath"
    Push-Location $failedRoot
    $failedOutput = @(powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath 2>&1)
    $failedExitCode = $LASTEXITCODE
    Pop-Location
    if ($failedExitCode -eq 0) {
        throw "Expected lint failure case to exit non-zero. Output:`n$($failedOutput -join "`n")"
    }
    Assert-Contains -Output $failedOutput -Pattern "closeoutLocalToolingDecision: stop_for_hard_block"
    Assert-Contains -Output $failedOutput -Pattern "closeoutLocalToolingFailedCommand: npm.cmd run lint"
} finally {
    $env:Path = $originalPath
    while ((Get-Location).Path -ne (Resolve-Path -LiteralPath $PSScriptRoot).Path -and (Get-Location).Path -like "$([System.IO.Path]::GetTempPath())*") {
        Pop-Location
    }
    foreach ($root in $roots) {
        if (Test-Path -LiteralPath $root) {
            Remove-Item -LiteralPath $root -Recurse -Force
        }
    }
}

Write-Output "Module Run v2 closeout local tooling readiness smoke passed"
