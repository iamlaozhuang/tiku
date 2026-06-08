$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern"
    }
}

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedPattern
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
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PrePushReadiness.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing pre-push readiness script: $scriptPath"
}

$taskId = "module-run-v2-hook-automation-hardening-sequence"

$existingEvidencePath = "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-pre-commit-scan-hardening.md"
$existingAuditPath = "docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-pre-commit-scan-hardening.md"

$passOutput = @(& $scriptPath -TaskId $taskId -EvidencePath $existingEvidencePath -AuditReviewPath $existingAuditPath -SkipRemoteAheadCheck)
Assert-Contains -Output $passOutput -Pattern "Module Run v2 Pre-Push Readiness"
Assert-Contains -Output $passOutput -Pattern "prePushMode: hard_block"
Assert-Contains -Output $passOutput -Pattern "OK_EVIDENCE_PATH"
Assert-Contains -Output $passOutput -Pattern "OK_AUDIT_PATH"
Assert-Contains -Output $passOutput -Pattern "Cost Calibration Gate remains blocked"

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_EVIDENCE" -Command {
    & $scriptPath -TaskId $taskId -EvidencePath "docs/05-execution-logs/evidence/missing-pre-push-fixture.md" -SkipRemoteAheadCheck
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_AUDIT" -Command {
    & $scriptPath -TaskId $taskId -AuditReviewPath "docs/05-execution-logs/audits-reviews/missing-pre-push-fixture.md" -SkipRemoteAheadCheck
}

$fixtureTaskId = "module-run-v2-pre-push-post-push-ancestor-smoke"
$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "tiku-module-run-v2-pre-push-smoke"
$fixtureProjectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
$fixtureQueuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
$ancestorSha = ((& git rev-parse master~1) -join "").Trim()

if ([string]::IsNullOrWhiteSpace($ancestorSha)) {
    throw "Missing master ancestor fixture SHA"
}

New-Item -ItemType Directory -Force -Path $fixtureRoot | Out-Null

@"
schemaVersion: 1
project:
  name: tiku
  currentPhase: smoke
repository:
  lastKnownMasterSha: $ancestorSha
  lastKnownOriginMasterSha: $ancestorSha
currentTask:
  id: $fixtureTaskId
  status: done
"@ | Set-Content -Path $fixtureProjectStatePath -Encoding UTF8

@"
tasks:
  - id: $fixtureTaskId
    evidencePath: $existingEvidencePath
    auditReviewPath: $existingAuditPath
    status: done
"@ | Set-Content -Path $fixtureQueuePath -Encoding UTF8

$ancestorOutput = @(& $scriptPath -TaskId $fixtureTaskId -ProjectStatePath $fixtureProjectStatePath -QueuePath $fixtureQueuePath -SkipRemoteAheadCheck)
Assert-Contains -Output $ancestorOutput -Pattern "OK_PRE_PUSH_STATE_SHA_ANCESTOR master"
Assert-Contains -Output $ancestorOutput -Pattern "OK_PRE_PUSH_STATE_SHA_ANCESTOR origin/master"
Assert-Contains -Output $ancestorOutput -Pattern "pre-push readiness passed"

@"
schemaVersion: 1
project:
  name: tiku
  currentPhase: smoke
repository:
  lastKnownMasterSha: not-a-valid-ancestor
  lastKnownOriginMasterSha: not-a-valid-ancestor
currentTask:
  id: $fixtureTaskId
  status: done
"@ | Set-Content -Path $fixtureProjectStatePath -Encoding UTF8

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT" -Command {
    & $scriptPath -TaskId $fixtureTaskId -ProjectStatePath $fixtureProjectStatePath -QueuePath $fixtureQueuePath -SkipRemoteAheadCheck
}

Write-Output "Module Run v2 pre-push readiness smoke passed"
