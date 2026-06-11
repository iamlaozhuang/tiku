$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`nActual output:`n$($Output -join "`n")"
    }
}

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern
    )

    $output = @()
    $failed = $false
    try {
        $output = @(& $Command 2>&1)
    } catch {
        $failed = $true
        $output += $_.Exception.Message
    }

    if (-not $failed -and $LASTEXITCODE -eq 0) {
        throw "Expected command to fail with pattern: $ExpectedPattern"
    }

    Assert-Contains -Output $output -Pattern $ExpectedPattern
    return $output
}

function Write-ProjectState {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$AutomationId,
        [Parameter(Mandatory = $true)][string]$Status,
        [Parameter(Mandatory = $false)][switch]$PlannedPause
    )

    $plannedPauseBlock = ""
    if ($PlannedPause) {
        $plannedPauseBlock = @"
    plannedPauseStatus: active
    plannedPauseReason: user_requested_mechanism_tuning
    plannedPauseKeepsAutomationPaused: true
"@
    }

    @"
schemaVersion: 1
automation:
  unattendedControl:
    codexAutomationId: $AutomationId
    codexAutomationStatus: $Status
$plannedPauseBlock
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-AutomationToml {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$AutomationId,
        [Parameter(Mandatory = $true)][string]$Status,
        [Parameter(Mandatory = $false)][switch]$MissingStandingCloseoutAnchor,
        [Parameter(Mandatory = $false)][switch]$MissingLowRiskScopeAnchor
    )

    $prompt = "Current automation identity map tiku-module-run-v2-autopilot tiku-module-run-v2-autopilot-2 mechanic-2 on-demand Embedded mechanic policy standingUnattendedLocalCloseoutApproval low-risk local implementation tasks only local commit fast-forward merge to master push origin/master merged short-branch cleanup worktree parking High-risk capability gates remain blocked"
    if ($MissingStandingCloseoutAnchor) {
        $prompt = $prompt.Replace(" standingUnattendedLocalCloseoutApproval", "")
    }
    if ($MissingLowRiskScopeAnchor) {
        $prompt = $prompt.Replace(" low-risk local implementation tasks only", "")
    }

    @"
version = 1
id = "$AutomationId"
prompt = "$prompt"
status = "$Status"
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2AutomationRegistrationReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing registration readiness script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-registration-readiness-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $automationRoot = Join-Path -Path $fixtureRoot -ChildPath "automations"
    $onDemandRoot = Join-Path -Path $fixtureRoot -ChildPath "automation-on-demand"
    $primaryRoot = Join-Path -Path $automationRoot -ChildPath "tiku-module-run-v2-autopilot"
    $historicalRoot = Join-Path -Path $automationRoot -ChildPath "tiku-module-run-v2-autopilot-2"
    New-Item -ItemType Directory -Path $primaryRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $historicalRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $onDemandRoot -Force | Out-Null

    Write-ProjectState -Path $projectStatePath -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE"
    Write-AutomationToml -Path (Join-Path -Path $primaryRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE"
    Write-AutomationToml -Path (Join-Path -Path $historicalRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot-2" -Status "PAUSED"

    $readyOutput = @(& $scriptPath -ProjectStatePath $projectStatePath -AutomationRoot $automationRoot -OnDemandAutomationRoot $onDemandRoot)
    Assert-Contains -Output $readyOutput -Pattern "automationRegistrationDecision: ready"
    Assert-Contains -Output $readyOutput -Pattern "stopTaxonomy: no_task"

    Write-AutomationToml -Path (Join-Path -Path $primaryRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot" -Status "PAUSED"
    $pausedOutput = Invoke-ExpectFailure -Command { & $scriptPath -ProjectStatePath $projectStatePath -AutomationRoot $automationRoot -OnDemandAutomationRoot $onDemandRoot } -ExpectedPattern "HARD_BLOCK_AUTOMATION_STATUS_MISMATCH"
    Assert-Contains -Output $pausedOutput -Pattern "stopTaxonomy: registration_mismatch"

    Write-ProjectState -Path $projectStatePath -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE" -PlannedPause
    $plannedPauseOutput = @(& $scriptPath -ProjectStatePath $projectStatePath -AutomationRoot $automationRoot -OnDemandAutomationRoot $onDemandRoot)
    Assert-Contains -Output $plannedPauseOutput -Pattern "plannedPauseForTuning: true"
    Assert-Contains -Output $plannedPauseOutput -Pattern "automationRegistrationDecision: planned_pause_for_tuning"
    Assert-Contains -Output $plannedPauseOutput -Pattern "stopTaxonomy: planned_pause"

    Write-ProjectState -Path $projectStatePath -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE"

    Write-AutomationToml -Path (Join-Path -Path $primaryRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE" -MissingStandingCloseoutAnchor
    Invoke-ExpectFailure -Command { & $scriptPath -ProjectStatePath $projectStatePath -AutomationRoot $automationRoot -OnDemandAutomationRoot $onDemandRoot } -ExpectedPattern "HARD_BLOCK_MISSING_PROMPT_STANDING_CLOSEOUT" | Out-Null

    Write-AutomationToml -Path (Join-Path -Path $primaryRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE" -MissingLowRiskScopeAnchor
    Invoke-ExpectFailure -Command { & $scriptPath -ProjectStatePath $projectStatePath -AutomationRoot $automationRoot -OnDemandAutomationRoot $onDemandRoot } -ExpectedPattern "HARD_BLOCK_MISSING_PROMPT_LOW_RISK_LOCAL_IMPLEMENTATION_SCOPE" | Out-Null

    Write-AutomationToml -Path (Join-Path -Path $primaryRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-autopilot" -Status "ACTIVE"
    $mechanicRoot = Join-Path -Path $automationRoot -ChildPath "tiku-module-run-v2-mechanic-2"
    New-Item -ItemType Directory -Path $mechanicRoot -Force | Out-Null
    Write-AutomationToml -Path (Join-Path -Path $mechanicRoot -ChildPath "automation.toml") -AutomationId "tiku-module-run-v2-mechanic-2" -Status "ACTIVE"
    Invoke-ExpectFailure -Command { & $scriptPath -ProjectStatePath $projectStatePath -AutomationRoot $automationRoot -OnDemandAutomationRoot $onDemandRoot } -ExpectedPattern "HARD_BLOCK_UNEXPECTED_ACTIVE_AUTOMATION" | Out-Null

    Write-Output "registrationReadinessSmoke: passed"
} finally {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force -ErrorAction SilentlyContinue
}
