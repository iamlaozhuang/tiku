param(
    [Parameter(Mandatory = $false)]
    [string]$RepositoryPath = "."
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Write-ToolingResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$FailedCommand = ""
    )

    Write-Section -Title "Result"
    Write-Output "closeoutLocalToolingDecision: $Decision"
    if (-not [string]::IsNullOrWhiteSpace($FailedCommand)) {
        Write-Output "closeoutLocalToolingFailedCommand: $FailedCommand"
    }
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Invoke-ToolingCommand {
    param(
        [Parameter(Mandatory = $true)][string]$CommandLabel,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    Write-Output "closeoutLocalToolingCommand: $CommandLabel"
    $commandOutput = @(& npm.cmd @Arguments 2>&1)
    $exitCode = $LASTEXITCODE
    foreach ($line in $commandOutput) {
        Write-Output "closeoutLocalToolingOutput: $line"
    }

    if ($exitCode -ne 0) {
        Write-Output "closeoutLocalToolingExitCode: $exitCode"
        Write-ToolingResult -Decision "stop_for_hard_block" -Reason "closeout local tooling command failed" -ExitCode 1 -FailedCommand $CommandLabel
    }

    Write-Output "closeoutLocalToolingCommandResult: pass"
}

try {
    $repositoryRoot = (Resolve-Path -LiteralPath $RepositoryPath).Path
    Push-Location $repositoryRoot

    Write-Section -Title "Module Run v2 Closeout Local Tooling Readiness"
    Write-Output "closeoutLocalToolingMode: hard_block"
    Write-Output "repositoryPath: $repositoryRoot"

    if (-not (Test-Path -LiteralPath "package.json")) {
        Write-ToolingResult -Decision "not_applicable" -Reason "package.json is absent" -ExitCode 0
    }

    if (-not (Test-Path -LiteralPath "node_modules")) {
        Write-Output "closeoutLocalToolingMissing: node_modules"
        Write-ToolingResult -Decision "stop_for_hard_block" -Reason "node_modules is missing" -ExitCode 1
    }

    $requiredToolingPaths = @(
        "node_modules\.bin\eslint.cmd",
        "node_modules\.bin\tsc.cmd",
        "node_modules\.bin\prettier.cmd",
        "node_modules\typescript\package.json",
        "node_modules\prettier\bin\prettier.cjs"
    )

    $missingToolingPaths = @($requiredToolingPaths | Where-Object { -not (Test-Path -LiteralPath $_) })
    foreach ($missingToolingPath in $missingToolingPaths) {
        Write-Output "closeoutLocalToolingMissing: $missingToolingPath"
    }

    if ($missingToolingPaths.Count -gt 0) {
        Write-ToolingResult -Decision "stop_for_hard_block" -Reason "required local JS tooling paths are missing" -ExitCode 1
    }

    $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($null -eq $npmCommand) {
        Write-Output "closeoutLocalToolingMissing: npm.cmd"
        Write-ToolingResult -Decision "stop_for_hard_block" -Reason "npm.cmd is unavailable" -ExitCode 1
    }

    Invoke-ToolingCommand -CommandLabel "npm.cmd run lint" -Arguments @("run", "lint")
    Invoke-ToolingCommand -CommandLabel "npm.cmd run typecheck" -Arguments @("run", "typecheck")

    Write-ToolingResult -Decision "ready" -Reason "closeout local tooling commands passed" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_CLOSEOUT_LOCAL_TOOLING_EXCEPTION $($_.Exception.Message)"
    Write-ToolingResult -Decision "stop_for_hard_block" -Reason "closeout local tooling readiness encountered an error" -ExitCode 1
} finally {
    if ((Get-Location).Path -eq $repositoryRoot) {
        Pop-Location
    }
}
