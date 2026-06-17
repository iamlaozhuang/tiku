param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskId,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputDirectory = "docs\05-execution-logs\evidence",

    [Parameter(Mandatory = $false)]
    [ValidateSet("full", "lite")]
    [string]$EvidenceMode = "full"
)

$ErrorActionPreference = "Stop"

$evidenceDate = Get-Date -Format "yyyy-MM-dd"
$evidencePath = Join-Path -Path $OutputDirectory -ChildPath "$evidenceDate-$TaskId.md"

if (Test-Path -LiteralPath $evidencePath) {
    throw "Task evidence already exists: $evidencePath"
}

$branchName = ((& git branch --show-current) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($branchName)) {
    $branchName = "(detached HEAD)"
}

$headSha = ((& git rev-parse --short HEAD) -join "").Trim()
$repositoryRoot = ((& git rev-parse --show-toplevel) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($repositoryRoot)) {
    $repositoryRoot = (Get-Location).Path
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$templatePath = Join-Path -Path $repositoryRoot -ChildPath "docs\05-execution-logs\templates\module-run-v2-evidence-template.md"
if ($EvidenceMode -eq "lite") {
    $evidenceContent = @'
# Evidence: @TASK_ID@

## Module Run V2 Anchors

- Task id: `@TASK_ID@`
- Branch: `@BRANCH_NAME@`
- Head at evidence creation: `@HEAD_SHA@`
- Evidence created at: `@CREATED_AT@`
- Evidence mode: lite
- Result: pending

## Scope

- Allowed files: pending.
- Blocked files: `package.json`, lockfiles, `src/**`, `src/db/schema/**`, `drizzle/**`, `e2e/**`, `.env*`.
- Blocked gates: env/secret, provider/model, schema/migration, dependency, staging/prod/cloud/deploy, payment, external-service, Browser/dev-server/Playwright/e2e unless the current task explicitly allows it.

## Validation

- Commands: pending.
- Results: pending.

## Redaction And Safety

- `.env*` access/output/edit: not performed.
- Secret/token/cookie/Authorization header/database URL exposure: not performed.
- Provider payload/raw prompt/raw answer exposure: not performed.
- Public identifier inventory exposure: not performed.
- Row/private data exposure: not performed.
- Cost Calibration Gate: blocked.

## Blocked Remainder

- Pending closeout review.

## Review

- Residual risk: pending.
- Audit review: pending.
'@
} elseif (Test-Path -LiteralPath $templatePath) {
    $evidenceContent = Get-Content -LiteralPath $templatePath -Raw
} else {
    $evidenceContent = @'
# Evidence: @TASK_ID@

## Module Run V2 Anchors

- Task id: `@TASK_ID@`
- Branch: `@BRANCH_NAME@`
- Head at evidence creation: `@HEAD_SHA@`
- Evidence created at: `@CREATED_AT@`
- Evidence mode: full
- Task kind: pending.
- Batch range: @BATCH_RANGE@
- localFullLoopGate: pending.
- threadRolloverGate: pending.
- automationHandoffPolicy: pending.
- nextModuleRunCandidate: pending.
- nextTaskPolicy: intentionally_not_seeded
- nextTaskPolicyReason: pending until closeout identifies a valid next task or records why none is seeded.
- Cost Calibration Gate remains blocked.
- RED: pending.
- GREEN: pending.
- Commit: pending.
- result: pending

## Scope

Allowed files:

- 

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `package-lock.yaml`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`

## Implementation Summary

- 

## Needs Recheck

- needs_recheck: false
- nextTaskPolicy: intentionally_not_seeded
- nextTaskPolicyReason: no needs_recheck recorded at evidence creation.

## Validation

```powershell
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `git diff --check`: pending.
- `npm.cmd run lint`: pending.
- `npm.cmd run typecheck`: pending.
- `Test-GitCompletionReadiness.ps1`: pending.

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
}

$evidenceContent = $evidenceContent.
    Replace("@TASK_ID@", $TaskId).
    Replace("@BRANCH_NAME@", $branchName).
    Replace("@HEAD_SHA@", $headSha).
    Replace("@CREATED_AT@", (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")).
    Replace("@BATCH_RANGE@", "single task pending closeout")

Set-Content -LiteralPath $evidencePath -Value $evidenceContent -Encoding UTF8
Write-Output "Created task evidence: $evidencePath"
Write-Output "evidenceMode: $EvidenceMode"
