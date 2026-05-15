param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId
)

$ErrorActionPreference = "Stop"

$taskPlanDirectory = "docs\05-execution-logs\task-plans"
$taskPlanDate = Get-Date -Format "yyyy-MM-dd"
$taskPlanPath = Join-Path -Path $taskPlanDirectory -ChildPath "$taskPlanDate-$TaskId.md"

if (Test-Path $taskPlanPath) {
    throw "Task plan already exists: $taskPlanPath"
}

New-Item -ItemType Directory -Force -Path $taskPlanDirectory | Out-Null

$taskPlanContent = @"
# Task Plan: $TaskId

## Required Reading

- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml

## Scope

- Task id: $TaskId
- Allowed files:
- Blocked files:

## Implementation Notes

- Keep edits scoped to the task.
- Follow ADR-002 runtime layering for code changes.
- Follow glossary and naming rules for DB, API, and UI work.

## Risk Gate

- Dependency change:
- Database migration:
- Auth or permission model:
- Secret or environment change:
- Destructive data operation:
- Deploy or merge:

## Validation Commands

```powershell
.\scripts\agent-system\Test-AgentSystemReadiness.ps1
.\scripts\agent-system\Invoke-QualityGate.ps1
```

## Evidence

- Commands run:
- Outputs:
- Missing gates:
- Residual risk:
"@

Set-Content -Path $taskPlanPath -Value $taskPlanContent -Encoding UTF8
Write-Output "Created task plan: $taskPlanPath"
