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

function Get-OutputValue {
    param(
        [Parameter(Mandatory = $true)][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.*)$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "New-ModuleRunV2RecoveryPacket.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing recovery packet script: $scriptPath"
}

$smokeRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-recovery-packet-" + [guid]::NewGuid().ToString("N"))
$handoffRoot = Join-Path -Path $smokeRoot -ChildPath "handoffs"
$worktreeRoot = Join-Path -Path $smokeRoot -ChildPath "worktree"
New-Item -ItemType Directory -Path $handoffRoot,$worktreeRoot -Force | Out-Null

try {
    $secretNeedle = "secret" + "-token"
    $dbNeedle = ("post" + "gres") + "://user:pass"
    $sensitiveCommand = "npm.cmd run lint " +
        ("Author" + "ization") + ": Bearer $secretNeedle " +
        ("DATABASE" + "_URL") + "=$dbNeedle@host/db"

    $firstOutput = @(
        & $scriptPath `
            -TaskId "batch-999-recovery-smoke" `
            -WorktreePath $worktreeRoot `
            -Branch "codex/recovery-smoke" `
            -FailureClass "local_tooling_missing_dependency" `
            -FailedCommand $sensitiveCommand `
            -LastPassedGate "pre-push readiness" `
            -CloseoutTransactionState "closeout_local_tooling_failed" `
            -ChangedFiles "docs/04-agent-system/state/task-queue.yaml","docs/04-agent-system/state/project-state.yaml" `
            -NextCommand "restore node_modules then rerun approved closeout" `
            -HandoffRoot $handoffRoot 2>&1
    )

    Assert-Contains -Output $firstOutput -Pattern "recoveryPacketDecision: written"
    Assert-Contains -Output $firstOutput -Pattern "safeToAdopt: false"
    $packetPath = Get-OutputValue -Output $firstOutput -Key "recoveryPacketPath"
    if (-not (Test-Path -LiteralPath $packetPath)) {
        throw "Expected recovery packet to exist: $packetPath"
    }

    $packetContent = Get-Content -LiteralPath $packetPath -Raw
    if ($packetContent -match [regex]::Escape($secretNeedle) -or $packetContent -match [regex]::Escape($dbNeedle)) {
        throw "Recovery packet leaked sensitive command content."
    }
    if ($packetContent -notmatch "<redacted>") {
        throw "Recovery packet did not include redaction marker."
    }

    $secondOutput = @(
        & $scriptPath `
            -TaskId "batch-999-recovery-smoke" `
            -WorktreePath $worktreeRoot `
            -Branch "codex/recovery-smoke" `
            -FailureClass "local_tooling_missing_dependency" `
            -FailedCommand $sensitiveCommand `
            -LastPassedGate "pre-push readiness" `
            -CloseoutTransactionState "closeout_local_tooling_failed" `
            -ChangedFiles "docs/04-agent-system/state/task-queue.yaml","docs/04-agent-system/state/project-state.yaml" `
            -NextCommand "restore node_modules then rerun approved closeout" `
            -HandoffRoot $handoffRoot 2>&1
    )
    Assert-Contains -Output $secondOutput -Pattern "recoveryPacketDecision: reused"
    $secondPacketPath = Get-OutputValue -Output $secondOutput -Key "recoveryPacketPath"
    if ($packetPath -ne $secondPacketPath) {
        throw "Expected repeated blocker to reuse the same recovery packet."
    }
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 recovery packet smoke passed"
