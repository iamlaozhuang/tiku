param(
    [Parameter(Mandatory = $false)]
    [string]$LeasePath = "",

    [Parameter(Mandatory = $false)]
    [string]$CurrentWorktreePath = "",

    [Parameter(Mandatory = $false)]
    [string]$CurrentTaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$NowUtc = ""
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Write-LeaseResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "automationLeaseDecision: $Decision"
    Write-Output "reason: $Reason"
    exit $ExitCode
}

function Test-GitWorktreeDirty {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $false
    }

    $insideWorktree = ((& git -C $Path rev-parse --is-inside-work-tree 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") {
        return $false
    }

    $status = @(& git -C $Path status --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return $true
    }

    return $status.Count -gt 0
}

if ([string]::IsNullOrWhiteSpace($LeasePath)) {
    $LeasePath = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\automation-run-lease.json"
}

if ([string]::IsNullOrWhiteSpace($CurrentWorktreePath)) {
    $CurrentWorktreePath = (Get-Location).Path
}

$effectiveNow = [DateTimeOffset]::UtcNow
if (-not [string]::IsNullOrWhiteSpace($NowUtc)) {
    $effectiveNow = [DateTimeOffset]::Parse($NowUtc).ToUniversalTime()
}

Write-Section -Title "Module Run v2 Automation Lease Readiness"
Write-Output "automationLeaseMode: hard_block"
Write-Output "leasePath: $LeasePath"
Write-Output "currentWorktreePath: $CurrentWorktreePath"
if (-not [string]::IsNullOrWhiteSpace($CurrentTaskId)) {
    Write-Output "currentTaskId: $CurrentTaskId"
}
Write-Output "nowUtc: $($effectiveNow.ToString("o"))"

if (-not (Test-Path -LiteralPath $LeasePath)) {
    Write-LeaseResult -Decision "no_active_lease" -Reason "lease file is missing" -ExitCode 0
}

try {
    $leaseJson = Get-Content -LiteralPath $LeasePath -Raw | ConvertFrom-Json
} catch {
    Write-LeaseResult -Decision "stop_invalid_lease" -Reason "lease file is not valid JSON" -ExitCode 1
}

$leaseRunId = [string]$leaseJson.runId
$leaseTaskId = [string]$leaseJson.taskId
$leaseWorktreePath = [string]$leaseJson.worktreePath
$leaseOwner = [string]$leaseJson.owner
$expiresAtText = [string]$leaseJson.expiresAtUtc

Write-Section -Title "Lease"
Write-Output "runId: $leaseRunId"
Write-Output "taskId: $leaseTaskId"
Write-Output "owner: $leaseOwner"
Write-Output "worktreePath: $leaseWorktreePath"
Write-Output "expiresAtUtc: $expiresAtText"

if ([string]::IsNullOrWhiteSpace($leaseRunId) -or [string]::IsNullOrWhiteSpace($leaseWorktreePath) -or [string]::IsNullOrWhiteSpace($expiresAtText)) {
    Write-LeaseResult -Decision "stop_invalid_lease" -Reason "lease is missing required runId, worktreePath, or expiresAtUtc" -ExitCode 1
}

try {
    $expiresAt = [DateTimeOffset]::Parse($expiresAtText).ToUniversalTime()
} catch {
    Write-LeaseResult -Decision "stop_invalid_lease" -Reason "lease expiresAtUtc is not parseable" -ExitCode 1
}

if ($expiresAt -gt $effectiveNow) {
    Write-LeaseResult -Decision "stop_existing_run_active" -Reason "non-expired lease is present" -ExitCode 1
}

$dirtyExpiredWorktree = Test-GitWorktreeDirty -Path $leaseWorktreePath
if ($dirtyExpiredWorktree) {
    Write-LeaseResult -Decision "stop_expired_dirty_lease" -Reason "expired lease worktree has uncommitted changes" -ExitCode 1
}

Write-LeaseResult -Decision "expired_lease_reclaimable" -Reason "lease is expired and worktree is clean or unavailable" -ExitCode 0
