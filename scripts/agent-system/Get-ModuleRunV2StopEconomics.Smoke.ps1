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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-ModuleRunV2StopEconomics.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing stop economics script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-stop-economics-" + [guid]::NewGuid().ToString("N"))
$runRegistryRoot = Join-Path -Path $fixtureRoot -ChildPath "automation-runs"
$terminalEnvelopePath = Join-Path -Path $fixtureRoot -ChildPath "terminal-envelope.txt"

try {
    New-Item -ItemType Directory -Path $runRegistryRoot -Force | Out-Null

    @"
{
  "runId": "hard-block",
  "severity": "hard_block",
  "stopTaxonomy": "hard_block",
  "requiresHuman": true,
  "safeToProceed": false,
  "nextCommand": "repair automation registration",
  "stopCardDecision": "hard_block",
  "canAutoRecover": false,
  "blockerClass": "registration_mismatch",
  "statePolicy": "durable_state_written",
  "stateWritten": "run_registry",
  "noWriteReason": "",
  "resumePointer": "automationRegistrationDecision",
  "runnerStepCount": 3
}
"@ | Set-Content -LiteralPath (Join-Path -Path $runRegistryRoot -ChildPath "hard-block.json") -Encoding UTF8

    @"
{
  "runId": "auto-recoverable",
  "severity": "auto_recoverable",
  "stopTaxonomy": "approval_missing",
  "requiresHuman": false,
  "safeToProceed": true,
  "nextCommand": "rerun with standingUnattendedLocalCloseoutApproval",
  "stopCardDecision": "auto_recoverable",
  "canAutoRecover": true,
  "blockerClass": "approval_missing",
  "statePolicy": "no_write_accounted",
  "stateWritten": "none",
  "noWriteReason": "PlanOnly does not write queue",
  "resumePointer": "seed_proposal_available",
  "runnerStepCount": 1
}
"@ | Set-Content -LiteralPath (Join-Path -Path $runRegistryRoot -ChildPath "auto-recoverable.json") -Encoding UTF8

    @"
{
  "runId": "approval-required",
  "severity": "approval_required",
  "stopTaxonomy": "approval_missing",
  "requiresHuman": true,
  "safeToProceed": false,
  "nextCommand": "provide AutoSeedApprovalStatement",
  "stopCardDecision": "manual_required",
  "canAutoRecover": false,
  "blockerClass": "approval_missing",
  "statePolicy": "no_write_accounted",
  "stateWritten": "none",
  "noWriteReason": "approval required before write",
  "resumePointer": "seed_proposal_available"
}
"@ | Set-Content -LiteralPath (Join-Path -Path $runRegistryRoot -ChildPath "approval-required.json") -Encoding UTF8

    @"
{
  "runId": "incomplete",
  "severity": "advisory",
  "stopTaxonomy": "advisory",
  "requiresHuman": false,
  "safeToProceed": true,
  "nextCommand": "record advisory summary",
  "stopCardDecision": "auto_recoverable",
  "canAutoRecover": true,
  "blockerClass": "advisory",
  "statePolicy": "no_write_accounted",
  "stateWritten": "none",
  "noWriteReason": "advisory dry run"
}
"@ | Set-Content -LiteralPath (Join-Path -Path $runRegistryRoot -ChildPath "incomplete.json") -Encoding UTF8

    @"
runnerSeverity: auto_recoverable
stopTaxonomy: approval_missing
requiresHuman: false
safeToProceed: true
nextCommand: rerun non-PlanOnly runner
stopCardDecision: auto_recoverable
canAutoRecover: true
blockerClass: approval_missing
statePolicy: no_write_accounted
stateWritten: none
noWriteReason: terminal envelope fixture
resumePointer: runnerDecision=seed_proposal_available
runnerStepCount: 2
"@ | Set-Content -LiteralPath $terminalEnvelopePath -Encoding UTF8

    $output = @(
        & $scriptPath `
            -RunRegistryRoot $runRegistryRoot `
            -TerminalEnvelopePath $terminalEnvelopePath
    )

    Assert-Contains -Output $output -Pattern "^stopEconomicsMode: read_only$"
    Assert-Contains -Output $output -Pattern "^runRegistryFilesRead: 4$"
    Assert-Contains -Output $output -Pattern "^terminalEnvelopeFilesRead: 1$"
    Assert-Contains -Output $output -Pattern "^recordCount: 5$"
    Assert-Contains -Output $output -Pattern "^falseStopCandidateCount: 3$"
    Assert-Contains -Output $output -Pattern "^hardBlockCount: 1$"
    Assert-Contains -Output $output -Pattern "^approvalReuseCandidateCount: 3$"
    Assert-Contains -Output $output -Pattern "^handoffCompletenessCount: 4$"
    Assert-Contains -Output $output -Pattern "^stopCardCompletenessCount: 5$"
    Assert-Contains -Output $output -Pattern "^autoRecoverStopCardCount: 3$"
    Assert-Contains -Output $output -Pattern "^meanRunnerSteps: 2$"
    Assert-Contains -Output $output -Pattern "^stopEconomicsDecision: summarized$"
    Assert-Contains -Output $output -Pattern "Cost Calibration Gate remains blocked"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 stop economics smoke passed"
