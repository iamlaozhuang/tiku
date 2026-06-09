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

function Invoke-Bridge {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [string[]]$ScriptArguments
    )

    $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath @ScriptArguments 2>&1)
    return [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = $output }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2CodexThreadBridgeReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing Codex thread bridge readiness script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-thread-bridge-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $safeHandoffPath = Join-Path -Path $fixtureRoot -ChildPath "safe-handoff.md"
    @"
thread rollover handoff:
decision: require_new_thread
reason: safe bridge smoke fixture
mode: local_auto_candidate
phase: module-run-v2-autodrive-phase-5
task: module-run-v2-autodrive-phase-5
branch: codex/module-run-v2-autodrive-phase-5
commit: pending-local-commit
latest task plan: docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-autodrive-phase-5.md
latest evidence: docs/05-execution-logs/evidence/2026-06-09-module-run-v2-autodrive-phase-5.md
latest audit review: docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-autodrive-phase-5.md
blocked gates:
- Cost Calibration Gate remains blocked
allowed next task: none
forbidden scope:
- product implementation
- env or secret writes
- provider calls
- schema or migration work
validation: smoke fixture only
git state: task scoped
run registry: not used
adoption allowed: false
cleanup allowed: false
read order:
1. AGENTS.md
2. docs/03-standards/code-taste-ten-commandments.md
3. docs/02-architecture/adr/
4. docs/04-agent-system/state/project-state.yaml
5. docs/04-agent-system/state/task-queue.yaml
user decision needed: none
"@ | Set-Content -LiteralPath $safeHandoffPath -Encoding UTF8

    $launchResult = Invoke-Bridge -ScriptArguments @(
        "-ThreadRolloverDecision", "require_new_thread",
        "-ThreadLaunchApproved",
        "-ThreadToolAvailable",
        "-HandoffPath", $safeHandoffPath
    )
    if ($launchResult.ExitCode -ne 0) {
        throw "Expected launch-ready bridge result to pass"
    }
    Assert-Contains -Output $launchResult.Output -Pattern "threadBridgeDecision: ready_for_agent_thread_launch"
    Assert-Contains -Output $launchResult.Output -Pattern "codexThreadAction: create_thread"
    Assert-Contains -Output $launchResult.Output -Pattern "redactedHandoff: verified"

    $continueResult = Invoke-Bridge -ScriptArguments @("-ThreadRolloverDecision", "continue_current_thread")
    if ($continueResult.ExitCode -ne 0) {
        throw "Expected continue-current-thread bridge result to pass"
    }
    Assert-Contains -Output $continueResult.Output -Pattern "threadBridgeDecision: continue_current_thread"
    Assert-Contains -Output $continueResult.Output -Pattern "codexThreadAction: none"

    $startupOutputPath = Join-Path -Path $fixtureRoot -ChildPath "startup-active-owner.txt"
    @"
startupDecision: exit_active_owner_present
reason: active owner has a fresh heartbeat
"@ | Set-Content -LiteralPath $startupOutputPath -Encoding UTF8

    $activeOwnerResult = Invoke-Bridge -ScriptArguments @(
        "-ThreadRolloverDecision", "require_new_thread",
        "-ThreadLaunchApproved",
        "-ThreadToolAvailable",
        "-HandoffPath", $safeHandoffPath,
        "-StartupOutputPath", $startupOutputPath
    )
    if ($activeOwnerResult.ExitCode -ne 0) {
        throw "Expected active-owner bridge result to exit quietly"
    }
    Assert-Contains -Output $activeOwnerResult.Output -Pattern "threadBridgeDecision: exit_active_owner_present"
    Assert-Contains -Output $activeOwnerResult.Output -Pattern "active owner"

    $unsafeHandoffPath = Join-Path -Path $fixtureRoot -ChildPath "unsafe-handoff.md"
    $blockedHeaderLine = ("Author" + "ization: Bear" + "er redacted-fixture-token")
    @(
        "thread rollover handoff:",
        "latest evidence: docs/05-execution-logs/evidence/example.md",
        "latest audit review: docs/05-execution-logs/audits-reviews/example.md",
        "blocked gates:",
        "- Cost Calibration Gate remains blocked",
        "read order:",
        "1. AGENTS.md",
        $blockedHeaderLine
    ) | Set-Content -LiteralPath $unsafeHandoffPath -Encoding UTF8

    $unsafeResult = Invoke-Bridge -ScriptArguments @(
        "-ThreadRolloverDecision", "require_new_thread",
        "-ThreadLaunchApproved",
        "-ThreadToolAvailable",
        "-HandoffPath", $unsafeHandoffPath
    )
    if ($unsafeResult.ExitCode -eq 0) {
        throw "Expected unsafe handoff bridge result to fail"
    }
    Assert-Contains -Output $unsafeResult.Output -Pattern "threadBridgeDecision: stop_for_hard_block"
    Assert-Contains -Output $unsafeResult.Output -Pattern "redactedHandoff: unsafe"

    $missingApprovalResult = Invoke-Bridge -ScriptArguments @(
        "-ThreadRolloverDecision", "require_new_thread",
        "-HandoffPath", $safeHandoffPath
    )
    if ($missingApprovalResult.ExitCode -eq 0) {
        throw "Expected missing approval bridge result to fail"
    }
    Assert-Contains -Output $missingApprovalResult.Output -Pattern "threadBridgeDecision: manual_required"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 Codex thread bridge readiness smoke passed"
