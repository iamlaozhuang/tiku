param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputDirectory = "docs\05-execution-logs\evidence"
)

$ErrorActionPreference = "Stop"

$evidenceDate = Get-Date -Format "yyyy-MM-dd"
$evidencePath = Join-Path -Path $OutputDirectory -ChildPath "$evidenceDate-$TaskId.md"

if (Test-Path $evidencePath) {
    throw "Task evidence already exists: $evidencePath"
}

$branchName = ((& git branch --show-current) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($branchName)) {
    $branchName = "(detached HEAD)"
}

$headSha = ((& git rev-parse --short HEAD) -join "").Trim()

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$evidenceContent = @'
# Evidence: @TASK_ID@

## Metadata

- Task id: `@TASK_ID@`
- Branch: `@BRANCH_NAME@`
- Head at evidence creation: `@HEAD_SHA@`
- Evidence created at: `@CREATED_AT@`

## Scope

Allowed files:

- 

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`

## Implementation Summary

- 

## Validation

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- naming conventions:
- readiness:
- quality gate:
- git completion readiness:
- build:
- test:e2e:

## Review

- Security review required:
- Review result:
- Accepted residual risk:

## Git Closeout

- implementationCommit:
- closeoutEvidenceCommit:
- merge:
- push:
- cleanup:

## Taste Compliance Self-Check

- Standard API response:
- Naming discipline:
- Public ID boundary:
- Layering:
- Dependency isolation:
- Schema and migration boundary:
- Evidence before conclusion:
'@

$evidenceContent = $evidenceContent.
    Replace("@TASK_ID@", $TaskId).
    Replace("@BRANCH_NAME@", $branchName).
    Replace("@HEAD_SHA@", $headSha).
    Replace("@CREATED_AT@", (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"))

Set-Content -Path $evidencePath -Value $evidenceContent -Encoding UTF8
Write-Output "Created task evidence: $evidencePath"
