param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Reason
)

$ErrorActionPreference = "Stop"

$failureReportDirectory = "docs\06-issue-tracking\bug-reports"
$failureReportDate = Get-Date -Format "yyyy-MM-dd"
$failureReportPath = Join-Path -Path $failureReportDirectory -ChildPath "$failureReportDate-$TaskId.md"

if (Test-Path $failureReportPath) {
    throw "Failure report already exists: $failureReportPath"
}

New-Item -ItemType Directory -Force -Path $failureReportDirectory | Out-Null

$failureReportContent = @"
# Failure Report: $TaskId

## Reason

$Reason

## Required Human Decision

- Decision needed:
- Accepted risk:
- Next action:

## Related State Paths

- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/04-agent-system/sop/automation-loop.md
"@

Set-Content -Path $failureReportPath -Value $failureReportContent -Encoding UTF8
Write-Output "Created failure report: $failureReportPath"
