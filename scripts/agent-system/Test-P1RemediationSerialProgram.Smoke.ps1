param()

$ErrorActionPreference = "Stop"

$guardPath = Join-Path $PSScriptRoot "Test-P1RemediationSerialProgram.ps1"
$modulePreCommitGuardPath = Join-Path $PSScriptRoot "Test-ModuleRunV2PreCommitHardening.ps1"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$phase11ScopeCorrectionGuardText = Get-Content -LiteralPath $guardPath -Raw -Encoding UTF8
# C6-MANUAL-CONTRACT-RECOGNITION-BEGIN
$manualMechanismContractMarkers = @(
    "p1MechanismBootstrapManualContractTreeSha256",
    "Get-P1MechanismBootstrapCommittedManualContractTreeSha256",
    "P1_PROGRAM_MECHANISM_BOOTSTRAP_MANUAL_CONTRACT_INVALID"
)
$missingManualMechanismContractMarkers = @($manualMechanismContractMarkers | Where-Object { -not $phase11ScopeCorrectionGuardText.Contains($_) })
if ($missingManualMechanismContractMarkers.Count -gt 0) {
    throw "P1 manual mechanism contract recognition RED: $($missingManualMechanismContractMarkers -join ', ')"
}
# C6-MANUAL-CONTRACT-RECOGNITION-END

# C6-MANUAL-CONTRACT-RECOGNITION-RUNTIME-BEGIN
$manualMechanismContractProbeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-manual-contract-" + [guid]::NewGuid().ToString("N"))
try {
    & git -c core.longpaths=true -c core.fsmonitor=false -c maintenance.auto=false -c gc.auto=0 clone --quiet --shared --no-checkout $repositoryRoot $manualMechanismContractProbeRoot
    if ($LASTEXITCODE -ne 0) { throw "Unable to create committed manual mechanism contract probe." }
    & git -C $manualMechanismContractProbeRoot -c core.longpaths=true -c core.fsmonitor=false checkout --quiet HEAD
    if ($LASTEXITCODE -ne 0) { throw "Unable to materialize committed manual mechanism contract probe." }
    & git -C $manualMechanismContractProbeRoot branch -M master
    if ($LASTEXITCODE -ne 0) { throw "Unable to bind committed manual mechanism contract probe to master." }
    & git -C $manualMechanismContractProbeRoot config core.autocrlf false
    if ($LASTEXITCODE -ne 0) { throw "Unable to stabilize manual mechanism contract probe line endings." }
    foreach ($manualMechanismContractProbePath in @(
            "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
            "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
            "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
            "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1"
        )) {
        $manualMechanismContractProbeSourcePath = Join-Path $repositoryRoot ($manualMechanismContractProbePath -replace '/', '\')
        $manualMechanismContractProbeDestinationPath = Join-Path $manualMechanismContractProbeRoot ($manualMechanismContractProbePath -replace '/', '\')
        Copy-Item -LiteralPath $manualMechanismContractProbeSourcePath -Destination $manualMechanismContractProbeDestinationPath -Force
    }
    & git -C $manualMechanismContractProbeRoot config user.name "P1 Manual Mechanism Contract Smoke"
    & git -C $manualMechanismContractProbeRoot config user.email "p1-manual-mechanism-contract-smoke@example.invalid"
    & git -C $manualMechanismContractProbeRoot add -- scripts/agent-system/Test-P1RemediationSerialProgram.ps1 scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1 scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
    & git -C $manualMechanismContractProbeRoot commit --quiet -m "test committed manual mechanism contract"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit manual mechanism contract probe." }
    $manualMechanismContractProbeHead = ((& git -C $manualMechanismContractProbeRoot rev-parse HEAD) -join '').Trim()
    & git -C $manualMechanismContractProbeRoot update-ref refs/remotes/origin/master $manualMechanismContractProbeHead
    if ($LASTEXITCODE -ne 0) { throw "Unable to bind manual mechanism contract probe remote checkpoint." }
    function Invoke-ManualMechanismContractProbe {
        param([Parameter(Mandatory = $true)][string]$ProbeRoot)
        $previousErrorActionPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = "Continue"
            $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $guardPath -RepositoryRoot $ProbeRoot -Phase manual 2>&1)
            $exitCode = $LASTEXITCODE
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
        return [pscustomobject]@{ ExitCode = $exitCode; Output = @($output) }
    }
    $manualMechanismContractProbeResult = Invoke-ManualMechanismContractProbe -ProbeRoot $manualMechanismContractProbeRoot
    $manualMechanismContractProbeOutput = @($manualMechanismContractProbeResult.Output)
    if ($manualMechanismContractProbeResult.ExitCode -ne 0 -or ($manualMechanismContractProbeOutput -join "`n") -notmatch "p1MechanismBootstrapAuthorization: approved_one_time") {
        throw "P1 committed manual mechanism contract probe RED:`n$($manualMechanismContractProbeOutput -join "`n")"
    }
    if (($manualMechanismContractProbeOutput -join "`n") -notmatch "p1TransitionScopeMode: standard") {
        throw "P1 committed manual mechanism contract probe incorrectly changed manual scope mode."
    }
    Add-Content -LiteralPath (Join-Path $manualMechanismContractProbeRoot "scripts/agent-system/Test-P1RemediationSerialProgram.ps1") -Value "# manual contract ordinary drift negative" -Encoding UTF8
    $manualMechanismContractDirtyResult = Invoke-ManualMechanismContractProbe -ProbeRoot $manualMechanismContractProbeRoot
    $manualMechanismContractDirtyOutput = @($manualMechanismContractDirtyResult.Output)
    if ($manualMechanismContractDirtyResult.ExitCode -eq 0 -or ($manualMechanismContractDirtyOutput -join "`n") -notmatch "P1_PROGRAM_MECHANISM_BOOTSTRAP_MANUAL_CONTRACT_INVALID") {
        throw "P1 committed manual mechanism contract ordinary-drift negative unexpectedly passed."
    }
    & git -C $manualMechanismContractProbeRoot checkout --quiet -- scripts/agent-system/Test-P1RemediationSerialProgram.ps1
    & git -C $manualMechanismContractProbeRoot branch -M codex/manual-contract-negative
    $manualMechanismContractBranchResult = Invoke-ManualMechanismContractProbe -ProbeRoot $manualMechanismContractProbeRoot
    $manualMechanismContractBranchOutput = @($manualMechanismContractBranchResult.Output)
    if ($manualMechanismContractBranchResult.ExitCode -eq 0 -or ($manualMechanismContractBranchOutput -join "`n") -notmatch "P1_PROGRAM_MECHANISM_BOOTSTRAP_MANUAL_CONTRACT_INVALID") {
        throw "P1 committed manual mechanism contract branch-topology negative unexpectedly passed."
    }
    & git -C $manualMechanismContractProbeRoot branch -M master
} finally {
    if (Test-Path -LiteralPath $manualMechanismContractProbeRoot) {
        $resolvedManualMechanismContractProbeRoot = [System.IO.Path]::GetFullPath($manualMechanismContractProbeRoot)
        $tempPrefix = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
        if (-not $resolvedManualMechanismContractProbeRoot.StartsWith($tempPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or [System.IO.Path]::GetFileName($resolvedManualMechanismContractProbeRoot) -notmatch '^tiku-manual-contract-[0-9a-f]{32}$') {
            throw "P1 manual mechanism contract probe cleanup boundary invalid: $resolvedManualMechanismContractProbeRoot"
        }
        $longManualMechanismContractProbeRoot = "\\?\$resolvedManualMechanismContractProbeRoot"
        try {
            foreach ($probeFile in [System.IO.Directory]::EnumerateFiles($longManualMechanismContractProbeRoot, "*", [System.IO.SearchOption]::AllDirectories)) {
                [System.IO.File]::SetAttributes($probeFile, [System.IO.FileAttributes]::Normal)
            }
        } catch [System.IO.DirectoryNotFoundException] {
        }
        if ([System.IO.Directory]::Exists($longManualMechanismContractProbeRoot)) {
            [System.IO.Directory]::Delete($longManualMechanismContractProbeRoot, $true)
        }
    }
}
# C6-MANUAL-CONTRACT-RECOGNITION-RUNTIME-END

# C6-PRE-COMMIT-MECHANISM-SCOPE-CORRECTION-BEGIN
$preCommitMechanismScopeCorrectionMarkers = @(
    "isP1MechanismBootstrapPreCommitScopeCorrectionCandidate",
    "Test-P1MechanismBootstrapPreCommitScopeCorrectionAnchors",
    "P1_PROGRAM_MECHANISM_BOOTSTRAP_PRE_COMMIT_SCOPE_CORRECTION_INVALID"
)
$missingPreCommitMechanismScopeCorrectionMarkers = @($preCommitMechanismScopeCorrectionMarkers | Where-Object { -not $phase11ScopeCorrectionGuardText.Contains($_) })
if ($missingPreCommitMechanismScopeCorrectionMarkers.Count -gt 0) {
    throw "P1 pre-commit mechanism scope-correction RED: $($missingPreCommitMechanismScopeCorrectionMarkers -join ', ')"
}
# C6-PRE-COMMIT-MECHANISM-SCOPE-CORRECTION-END

# C6-PRE-COMMIT-MECHANISM-SCOPE-CORRECTION-RUNTIME-BEGIN
$preCommitMechanismScopeCorrectionProbeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-precommit-scope-correction-" + [guid]::NewGuid().ToString("N"))
try {
    & git -c core.longpaths=true -c core.fsmonitor=false -c maintenance.auto=false -c gc.auto=0 clone --quiet --shared --no-checkout $repositoryRoot $preCommitMechanismScopeCorrectionProbeRoot
    if ($LASTEXITCODE -ne 0) { throw "Unable to create pre-commit mechanism scope-correction probe." }
    & git -C $preCommitMechanismScopeCorrectionProbeRoot -c core.longpaths=true -c core.fsmonitor=false checkout --quiet HEAD
    if ($LASTEXITCODE -ne 0) { throw "Unable to materialize pre-commit mechanism scope-correction probe." }
    & git -C $preCommitMechanismScopeCorrectionProbeRoot branch -M codex/p1-mechanism-bootstrap-manual-recognition
    & git -C $preCommitMechanismScopeCorrectionProbeRoot config core.autocrlf false
    & git -C $preCommitMechanismScopeCorrectionProbeRoot config user.name "P1 Mechanism Pre-Commit Scope Correction Smoke"
    & git -C $preCommitMechanismScopeCorrectionProbeRoot config user.email "p1-mechanism-precommit-scope-correction@example.invalid"
    $preCommitMechanismScopeCorrectionFiles = @(
        "docs/05-execution-logs/acceptance/2026-07-19-p1-mechanism-execution-compatibility-v2-1-authorization.md",
        "docs/05-execution-logs/task-plans/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
        "docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
        "docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
        "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
        "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1"
    )
    foreach ($preCommitMechanismScopeCorrectionPath in $preCommitMechanismScopeCorrectionFiles) {
        Copy-Item -LiteralPath (Join-Path $repositoryRoot ($preCommitMechanismScopeCorrectionPath -replace '/', '\')) -Destination (Join-Path $preCommitMechanismScopeCorrectionProbeRoot ($preCommitMechanismScopeCorrectionPath -replace '/', '\')) -Force
    }
    & git -C $preCommitMechanismScopeCorrectionProbeRoot add -- $preCommitMechanismScopeCorrectionFiles
    $preCommitMechanismScopeCorrectionProbeHead = ((& git -C $preCommitMechanismScopeCorrectionProbeRoot rev-parse HEAD) -join '').Trim()
    & git -C $preCommitMechanismScopeCorrectionProbeRoot update-ref refs/remotes/origin/master $preCommitMechanismScopeCorrectionProbeHead
    function Invoke-PreCommitMechanismScopeCorrectionGuard {
        param([Parameter(Mandatory = $true)][string]$ProbeRoot, [Parameter(Mandatory = $true)][string]$ScriptPath)
        $previousErrorActionPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = "Continue"
            $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ScriptPath -RepositoryRoot $ProbeRoot -Phase pre_commit 2>&1)
            $exitCode = $LASTEXITCODE
        } finally { $ErrorActionPreference = $previousErrorActionPreference }
        return [pscustomobject]@{ ExitCode = $exitCode; Output = @($output) }
    }
    $preCommitMechanismScopeCorrectionProbe = Invoke-PreCommitMechanismScopeCorrectionGuard -ProbeRoot $preCommitMechanismScopeCorrectionProbeRoot -ScriptPath (Join-Path $preCommitMechanismScopeCorrectionProbeRoot "scripts/agent-system/Test-P1RemediationSerialProgram.ps1")
    $preCommitMechanismScopeCorrectionProbeOutput = @($preCommitMechanismScopeCorrectionProbe.Output)
    if ($preCommitMechanismScopeCorrectionProbe.ExitCode -ne 0 -or ($preCommitMechanismScopeCorrectionProbeOutput -join "`n") -notmatch "p1MechanismBootstrapPreCommitScopeCorrection: approved_one_time") {
        throw "P1 pre-commit mechanism scope-correction positive probe RED:`n$($preCommitMechanismScopeCorrectionProbeOutput -join "`n")"
    }
    Push-Location $preCommitMechanismScopeCorrectionProbeRoot
    try {
        $preCommitMechanismModuleOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1" 2>&1)
        if ($LASTEXITCODE -ne 0 -or ($preCommitMechanismModuleOutput -join "`n") -notmatch "p1MechanismBootstrapPreCommitScopeCorrection: approved_one_time") {
            throw "Module pre-commit mechanism scope-correction positive probe RED:`n$($preCommitMechanismModuleOutput -join "`n")"
        }
    } finally { Pop-Location }
    Add-Content -LiteralPath (Join-Path $preCommitMechanismScopeCorrectionProbeRoot "scripts/agent-system/Test-P1RemediationSerialProgram.ps1") -Value "# pre-commit mechanism scope-correction ordinary drift negative" -Encoding UTF8
    $preCommitMechanismScopeCorrectionDirty = Invoke-PreCommitMechanismScopeCorrectionGuard -ProbeRoot $preCommitMechanismScopeCorrectionProbeRoot -ScriptPath (Join-Path $preCommitMechanismScopeCorrectionProbeRoot "scripts/agent-system/Test-P1RemediationSerialProgram.ps1")
    if ($preCommitMechanismScopeCorrectionDirty.ExitCode -eq 0 -or ($preCommitMechanismScopeCorrectionDirty.Output -join "`n") -notmatch "P1_PROGRAM_MECHANISM_BOOTSTRAP_PRE_COMMIT_SCOPE_CORRECTION_INVALID") {
        throw "P1 pre-commit mechanism scope-correction ordinary-drift negative unexpectedly passed."
    }
    & git -C $preCommitMechanismScopeCorrectionProbeRoot checkout --quiet -- scripts/agent-system/Test-P1RemediationSerialProgram.ps1
    & git -C $preCommitMechanismScopeCorrectionProbeRoot branch -M codex/wrong-mechanism-scope-correction
    $preCommitMechanismScopeCorrectionBranch = Invoke-PreCommitMechanismScopeCorrectionGuard -ProbeRoot $preCommitMechanismScopeCorrectionProbeRoot -ScriptPath (Join-Path $preCommitMechanismScopeCorrectionProbeRoot "scripts/agent-system/Test-P1RemediationSerialProgram.ps1")
    if ($preCommitMechanismScopeCorrectionBranch.ExitCode -eq 0 -or ($preCommitMechanismScopeCorrectionBranch.Output -join "`n") -notmatch "P1_PROGRAM_MECHANISM_BOOTSTRAP_PRE_COMMIT_SCOPE_CORRECTION_INVALID") {
        throw "P1 pre-commit mechanism scope-correction branch negative unexpectedly passed."
    }
    & git -C $preCommitMechanismScopeCorrectionProbeRoot branch -M codex/p1-mechanism-bootstrap-manual-recognition
} finally {
    if (Test-Path -LiteralPath $preCommitMechanismScopeCorrectionProbeRoot) {
        $resolvedPreCommitMechanismScopeCorrectionProbeRoot = [System.IO.Path]::GetFullPath($preCommitMechanismScopeCorrectionProbeRoot)
        $tempPrefix = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
        if (-not $resolvedPreCommitMechanismScopeCorrectionProbeRoot.StartsWith($tempPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or [System.IO.Path]::GetFileName($resolvedPreCommitMechanismScopeCorrectionProbeRoot) -notmatch '^tiku-precommit-scope-correction-[0-9a-f]{32}$') { throw "Pre-commit mechanism scope-correction cleanup boundary invalid: $resolvedPreCommitMechanismScopeCorrectionProbeRoot" }
        $longPreCommitMechanismScopeCorrectionProbeRoot = "\\?\$resolvedPreCommitMechanismScopeCorrectionProbeRoot"
        try { foreach ($probeFile in [System.IO.Directory]::EnumerateFiles($longPreCommitMechanismScopeCorrectionProbeRoot, "*", [System.IO.SearchOption]::AllDirectories)) { [System.IO.File]::SetAttributes($probeFile, [System.IO.FileAttributes]::Normal) } } catch [System.IO.DirectoryNotFoundException] { }
        if ([System.IO.Directory]::Exists($longPreCommitMechanismScopeCorrectionProbeRoot)) { [System.IO.Directory]::Delete($longPreCommitMechanismScopeCorrectionProbeRoot, $true) }
    }
}
# C6-PRE-COMMIT-MECHANISM-SCOPE-CORRECTION-RUNTIME-END

# C4-ADAPTER-CONSISTENCY-BEGIN
$approvedSameTaskTransitionAdapterMarkers = @("P1ApprovedSameTaskTransition.Common.ps1", "Get-P1ApprovedSameTaskTransitionStageInputs", "p1ApprovedSameTaskTransitionAutomatic", "function Invoke-P1ApprovedSameTaskTransitionAdapter", "Read-P1ApprovedSameTaskTransitionContract", "Test-P1ApprovedSameTaskTransition", "p1ApprovedSameTaskTransitionCoreFinding")
$missingApprovedSameTaskTransitionAdapterMarkers = @($approvedSameTaskTransitionAdapterMarkers | Where-Object { -not $phase11ScopeCorrectionGuardText.Contains($_) })
if ($missingApprovedSameTaskTransitionAdapterMarkers.Count -gt 0) { throw "P1 guard adapter consistency RED: $($missingApprovedSameTaskTransitionAdapterMarkers -join ', ')" }
# C4-ADAPTER-CONSISTENCY-END
$phase11ScopeCorrectionPatterns = @(
    "p1F0115Phase11ScopeCorrectionTaskId",
    "Test-P1F0115Phase11ScopeCorrectionFileSet",
    "Test-P1F0115Phase11ScopeCorrectionAnchors",
    "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time",
    "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_QUEUE_DELTA_INVALID",
    "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID",
    "582c156afb0cdde8a3daa99785fda8540b56fe27",
    "tests/unit/phase-11-system-ops-user-management-loop.test.ts"
)
$missingPhase11ScopeCorrectionPatterns = @($phase11ScopeCorrectionPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingPhase11ScopeCorrectionPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0115 phase-11 scope-correction contract: $($missingPhase11ScopeCorrectionPatterns -join ', ')"
}
$modulePrecommitHotfixPatterns = @(
    "p1F0115ModulePrecommitHotfixTaskId",
    "Test-P1F0115ModulePrecommitHotfixFileSet",
    "Test-P1F0115ModulePrecommitHotfixAnchors",
    "p1F0115ModulePrecommitHotfixAuthorization: approved_one_time",
    "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
)
$missingModulePrecommitHotfixPatterns = @($modulePrecommitHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingModulePrecommitHotfixPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0115 Module pre-commit hotfix contract: $($missingModulePrecommitHotfixPatterns -join ', ')"
}
$f0116DesignPathHotfixPatterns = @(
    "p1F0116DesignPathGuardHotfixTaskId",
    "Test-P1F0116DesignPathGuardHotfixFileSet",
    "Test-P1F0116DesignPathGuardHotfixAnchors",
    "p1F0116DesignPathGuardHotfixAuthorization: approved_one_time",
    "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
)
$missingF0116DesignPathHotfixPatterns = @($f0116DesignPathHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0116DesignPathHotfixPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0116 designPath hotfix contract: $($missingF0116DesignPathHotfixPatterns -join ', ')"
}
$f0116ScopeCorrectionHotfixPatterns = @(
    "p1F0116ScopeCorrectionGuardHotfixTaskId",
    "Test-P1F0116ScopeCorrectionGuardHotfixFileSet",
    "Test-P1F0116ScopeCorrectionGuardHotfixAnchors",
    "p1F0116ScopeCorrectionGuardHotfixAuthorization: approved_one_time",
    "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
)
$missingF0116ScopeCorrectionHotfixPatterns = @($f0116ScopeCorrectionHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0116ScopeCorrectionHotfixPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0116 scope-correction hotfix contract: $($missingF0116ScopeCorrectionHotfixPatterns -join ', ')"
}
$f0117SpecApprovalHotfixPatterns = @(
    "p1F0117SpecApprovalTransitionHotfixTaskId",
    "Test-P1F0117SpecApprovalTransitionHotfixFileSet",
    "Test-P1F0117SpecApprovalTransitionHotfixAnchors",
    "p1F0117SpecApprovalTransitionHotfixAuthorization: approved_one_time",
    "366f17446e9fc75a777ebfe5977ad72db1062eb7",
    "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID"
)
$missingF0117SpecApprovalHotfixPatterns = @($f0117SpecApprovalHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0117SpecApprovalHotfixPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0117 spec-approval transition contract: $($missingF0117SpecApprovalHotfixPatterns -join ', ')"
}
$f0143SpecApprovalHotfixPatterns = @(
    "p1F0143SpecApprovalTransitionHotfixTaskId",
    "Test-P1F0143SpecApprovalTransitionHotfixFileSet",
    "Test-P1F0143SpecApprovalTransitionHotfixAnchors",
    "p1F0143SpecApprovalTransitionHotfixAuthorization: approved_one_time",
    "0fe8edae7a7efc00154f5c54227623be55796983",
    "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID",
    "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID"
)
$missingF0143SpecApprovalHotfixPatterns = @($f0143SpecApprovalHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0143SpecApprovalHotfixPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0143 spec-approval transition contract: $($missingF0143SpecApprovalHotfixPatterns -join ', ')"
}
$f0117SmokeScopeCorrectionPatterns = @(
    "p1F0117SmokeScopeCorrectionTaskId",
    "Test-P1F0117SmokeScopeCorrectionFileSet",
    "Test-P1F0117SmokeScopeCorrectionAnchors",
    "p1F0117SmokeScopeCorrectionAuthorization: approved_one_time",
    "3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a",
    "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
)
$missingF0117SmokeScopeCorrectionPatterns = @($f0117SmokeScopeCorrectionPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0117SmokeScopeCorrectionPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0117 smoke scope-correction contract: $($missingF0117SmokeScopeCorrectionPatterns -join ', ')"
}
$f0117SmokeScopeCloseoutLifecycleHotfixPatterns = @(
    "p1F0117SmokeScopeCloseoutLifecycleHotfixTaskId",
    "Test-P1F0117SmokeScopeCloseoutLifecycleHotfixFileSet",
    "Test-P1F0117SmokeScopeCloseoutLifecycleHotfixAnchors",
    "p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorization: approved_one_time",
    "71f150ceef0af54fca8d72db20a4254313630c7f",
    "P1_PROGRAM_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_ALLOWLIST_MISMATCH"
)
$missingF0117SmokeScopeCloseoutLifecycleHotfixPatterns = @($f0117SmokeScopeCloseoutLifecycleHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0117SmokeScopeCloseoutLifecycleHotfixPatterns.Count -gt 0) {
    throw "P1 guard is RED for the F-0117 smoke scope closeout lifecycle hotfix contract: $($missingF0117SmokeScopeCloseoutLifecycleHotfixPatterns -join ', ')"
}
$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p1-remediation-program-" + [guid]::NewGuid().ToString("N"))
$bootstrapTask = "p1-remediation-program-bootstrap-2026-07-16"
$authorizationPath = "authorization.md"
$p1F0115ScopeCorrectionTaskId = "p1-f0115-scope-correction-hotfix-2026-07-16"
$p1F0115ScopeCorrectionParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
$p1F0115ScopeCorrectionBaseSha = "6bde2f2aec3d71fa0ce138b26f64243861cace6f"
$p1F0115ScopeCorrectionBranch = "codex/p1-f0115-scope-correction-hotfix"
$p1F0115ScopeCorrectionAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md"
$p1F0115ScopeCorrectionEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md"
$p1F0115ScopeCorrectionAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md"
$p1F0115ScopeCorrectionFiles = @(
    "docs/04-agent-system/state/task-queue.yaml",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $p1F0115ScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix.md",
    $p1F0115ScopeCorrectionEvidencePath,
    $p1F0115ScopeCorrectionAuditPath
)
$p1F0115FixtureRemote = Join-Path $smokeRoot "f0115-origin.git"
$p1F0115Phase11ScopeCorrectionTaskId = "p1-f0115-phase11-scope-correction-hotfix-2026-07-17"
$p1F0115Phase11ScopeCorrectionParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
$p1F0115Phase11ScopeCorrectionBaseSha = "582c156afb0cdde8a3daa99785fda8540b56fe27"
$p1F0115Phase11ScopeCorrectionBranch = "codex/p1-f0115-phase11-scope-correction-hotfix"
$p1F0115Phase11ScopeCorrectionAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-authorization.md"
$p1F0115Phase11ScopeCorrectionEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
$p1F0115Phase11ScopeCorrectionAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
$p1F0115Phase11ScopeCorrectionAllowedFile = "tests/unit/phase-11-system-ops-user-management-loop.test.ts"
$p1F0115Phase11ScopeCorrectionFiles = @(
    "docs/04-agent-system/state/task-queue.yaml",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $p1F0115Phase11ScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md",
    $p1F0115Phase11ScopeCorrectionEvidencePath,
    $p1F0115Phase11ScopeCorrectionAuditPath
)
$p1F0115Phase11FixtureRemote = Join-Path $smokeRoot "f0115-phase11-origin.git"
$candidateOrder = @(
    "P1-RC-01",
    "P1-RC-02",
    "P1-RC-03",
    "P1-RC-04",
    "P1-RC-05",
    "P1-RC-06",
    "P1-RC-07",
    "P1-RC-08",
    "P1-RC-09",
    "P1-GLOBAL-STATIC-REGRESSION-BASELINE-FREEZE"
)

function New-LedgerText {
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('findings:')
    for ($index = 1; $index -le 125; $index++) {
        $findingId = if ($index -eq 13) { "F-0013" } else { "P1-$($index.ToString('000'))" }
        $evidenceStatus = if ($findingId -eq "F-0013") { "runtime_evidence_required" } else { "baseline_changed" }
        $disposition = if ($findingId -eq "F-0013") { "runtime_hold" } else { "pending_deep_revalidation" }
        $lines.Add("  - findingId: `"$findingId`"")
        $lines.Add('    riskLevel: "P1"')
        $lines.Add("    evidenceStatus: `"$evidenceStatus`"")
        $lines.Add("    disposition: `"$disposition`"")
        $lines.Add('    executionStatus: "pending"')
        $lines.Add('    candidateRootCauseCluster: "P1-RC-01"')
    }
    for ($index = 1; $index -le 18; $index++) {
        $lines.Add("  - findingId: `"P2-$($index.ToString('000'))`"")
        $lines.Add('    riskLevel: "P2"')
        $lines.Add('    evidenceStatus: "baseline_changed"')
        $lines.Add('    disposition: "pending_deep_revalidation"')
        $lines.Add('    executionStatus: "pending"')
    }
    return $lines -join "`n"
}

function New-RuntimeBacklogText {
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('runtimeValidations:')
    for ($index = 1; $index -le 21; $index++) {
        $lines.Add("  - runtimeValidationId: RV-$($index.ToString('0000'))")
        $lines.Add('    status: pending')
        $lines.Add('    approvalRequired: true')
    }
    return $lines -join "`n"
}

function Add-IndentToBlockChildrenWithDuplicateKey {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$BlockHeader,
        [Parameter(Mandatory = $true)][string]$DuplicateKey,
        [Parameter(Mandatory = $true)][string]$DuplicateValue
    )

    $output = [System.Collections.Generic.List[string]]::new()
    $insideBlock = $false
    $duplicateAdded = $false
    $parentIndent = -1
    foreach ($line in ($Content -split "`r?`n")) {
        if (-not $insideBlock -and $line -eq $BlockHeader) {
            $insideBlock = $true
            $parentIndent = $line.Length - $line.TrimStart().Length
            $output.Add($line)
            continue
        }
        if ($insideBlock -and -not [string]::IsNullOrWhiteSpace($line) -and ($line.Length - $line.TrimStart().Length) -le $parentIndent) {
            $insideBlock = $false
        }
        if ($insideBlock) {
            $originalIndent = $line.Length - $line.TrimStart().Length
            $output.Add("  $line")
            if (-not $duplicateAdded -and $originalIndent -eq ($parentIndent + 2) -and $line -match "^\s+$([regex]::Escape($DuplicateKey)):") {
                $output.Add((' ' * ($parentIndent + 4)) + "$DuplicateKey`: $DuplicateValue")
                $duplicateAdded = $true
            }
        } else {
            $output.Add($line)
        }
    }
    if (-not $duplicateAdded) { throw "Failed to build nonstandard-indent fixture for $BlockHeader/$DuplicateKey" }
    return $output -join "`n"
}

function Add-WrapperToBlock {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$BlockHeader
    )

    $output = [System.Collections.Generic.List[string]]::new()
    $insideBlock = $false
    $parentIndent = -1
    foreach ($line in ($Content -split "`r?`n")) {
        if (-not $insideBlock -and $line -eq $BlockHeader) {
            $insideBlock = $true
            $parentIndent = $line.Length - $line.TrimStart().Length
            $output.Add($line)
            $output.Add((' ' * ($parentIndent + 2)) + 'wrapper:')
            continue
        }
        if ($insideBlock -and -not [string]::IsNullOrWhiteSpace($line) -and ($line.Length - $line.TrimStart().Length) -le $parentIndent) {
            $insideBlock = $false
        }
        if ($insideBlock) { $output.Add("  $line") } else { $output.Add($line) }
    }
    return $output -join "`n"
}

function Get-FileFingerprint {
    param([Parameter(Mandatory = $true)][string]$Path)

    $stream = [System.IO.File]::OpenRead($Path)
    try {
        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        try {
            $hash = ([System.BitConverter]::ToString($sha256.ComputeHash($stream))).Replace("-", "")
        } finally {
            $sha256.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
    $item = Get-Item -LiteralPath $Path
    return "$hash|$($item.LastWriteTimeUtc.Ticks)|$($item.Length)"
}

$candidateList = ($candidateOrder | ForEach-Object { "    - $_" }) -join "`n"
$baseState = @"
schemaVersion: 1
p1RemediationSerialProgram:
  programId: p1-remediation-2026-07-16
  status: in_progress
  activityStatePolicy: wip_one_dynamic_task_materialization
  baselineSha: 4cd2792f57d4eea3ac2770598b5490ebcfdead51
  p0ProductStaticBaselineSha: e136ca28acde82282a17c65ccfb828a01e872c0b
  auditRepositorySha: a84224fa12ec85b28e6acd945deba2afa28c6c02
  currentTaskId: $bootstrapTask
  currentCandidateClusterId: P1-RC-01
  candidateClusterOrder:
$candidateList
  materializedTaskIds:
    - $bootstrapTask
  completedTaskIds: []
  standingAuthorizationSource: $authorizationPath
  serialPlanPath: serial-plan.md
  findingLedgerPath: finding-ledger.yaml
  postP0MapPath: post-p0-map.yaml
  clusterPath: clusters.yaml
  runtimeBacklogPath: runtime-backlog.yaml
  guardScriptPath: guard.ps1
  findingCounts:
    p1: 125
    p2: 18
  runtimeValidationCount: 21
  p2Implementation:
    approved: false
    status: impact_mapping_only
  runtimeAcceptance:
    approved: false
    status: excluded_from_program
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  taskStatusById:
    $bootstrapTask`: in_progress
  closeoutCheckpoints:
    $bootstrapTask`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
currentTask:
  id: $bootstrapTask
  status: in_progress
standingAuthorization:
  source: $authorizationPath
"@

$baseQueue = @"
schemaVersion: 1
p1RemediationSerialProgram:
  programId: p1-remediation-2026-07-16
  status: in_progress
  activityStatePolicy: wip_one_dynamic_task_materialization
  baselineSha: 4cd2792f57d4eea3ac2770598b5490ebcfdead51
  p0ProductStaticBaselineSha: e136ca28acde82282a17c65ccfb828a01e872c0b
  auditRepositorySha: a84224fa12ec85b28e6acd945deba2afa28c6c02
  currentTaskId: $bootstrapTask
  currentCandidateClusterId: P1-RC-01
  candidateClusterOrder:
$candidateList
  materializedTaskIds:
    - $bootstrapTask
  completedTaskIds: []
  standingAuthorizationSource: $authorizationPath
  serialPlanPath: serial-plan.md
  findingLedgerPath: finding-ledger.yaml
  postP0MapPath: post-p0-map.yaml
  clusterPath: clusters.yaml
  runtimeBacklogPath: runtime-backlog.yaml
  guardScriptPath: guard.ps1
  findingCounts:
    p1: 125
    p2: 18
  runtimeValidationCount: 21
  p2Implementation:
    approved: false
    status: impact_mapping_only
  runtimeAcceptance:
    approved: false
    status: excluded_from_program
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  taskStatusById:
    $bootstrapTask`: in_progress
activeTasks:
  - id: $bootstrapTask
    status: in_progress
    taskKind: mechanism_hardening
    executionStage: verification_complete
    branch: codex/bootstrap-fixture
    worktreePath: bootstrap-worktree-fixture
    executionProfile: R3
    authorizationSource: $authorizationPath
    reviewMode: evidence_two_rounds
    planPath: task-plan.md
    evidencePath: evidence.md
    auditReviewPath: audit.md
    allowedFiles:
      - state.yaml
      - queue.yaml
      - task-plan.md
      - evidence.md
      - audit.md
    blockedFiles:
      - src/**
      - tests/**
      - package.json
    capabilities:
      dependencyIntroduction: blocked_without_fresh_approval
      schemaMigration: blocked_without_fresh_approval
      databaseMutation: blocked_without_fresh_approval
      providerCall: blocked_without_fresh_approval
      runtimeAcceptance: blocked_out_of_program
      browserRuntimeValidation: blocked_out_of_program
      p2Implementation: blocked_out_of_program
      stagingProdDeploy: blocked_requires_fresh_user_approval
      forcePush: blocked
      pr: blocked
      costCalibrationGate: blocked
    closeoutPolicy:
      authorizationSource: $authorizationPath
      localCommit:
        approved: true
      fastForwardMerge:
        approved: true
        targetBranch: master
      push:
        approved: true
        target: origin/master
      cleanup:
        deleteShortBranch: true
standingAuthorization:
  source: $authorizationPath
"@

$basePlan = @"
# P1 Serial Program

| Order | Candidate | Meaning |
| --- | --- | --- |
| 01 | ``P1-RC-01`` | identity |
| 02 | ``P1-RC-02`` | organization |
| 03 | ``P1-RC-03`` | authorization |
| 04 | ``P1-RC-04`` | API |
| 05 | ``P1-RC-05`` | content |
| 06 | ``P1-RC-06`` | knowledge |
| 07 | ``P1-RC-07`` | AI |
| 08 | ``P1-RC-08`` | learner |
| 09 | ``P1-RC-09`` | training |
| 10 | ``P1-GLOBAL-STATIC-REGRESSION-BASELINE-FREEZE`` | freeze |
"@

$baseEvidence = @"
# Evidence

- Evidence status: pass
- Result: pass

## Requirement Mapping Result

pass

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## Round 1 — Root cause and state machine

Result: pass

## Round 2 — Approval and recovery

Result: pass

## Validation Results

Result: pass
"@

$baseAudit = @"
# Audit

## Round 1 — Root cause and state machine

Result: pass

## Round 2 — Approval and recovery

Result: pass

## Final Disposition

Decision: APPROVE
"@

function Write-CaseFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$StateText,
        [Parameter(Mandatory = $true)][string]$QueueText,
        [Parameter(Mandatory = $false)][string]$LedgerText = (New-LedgerText),
        [Parameter(Mandatory = $false)][string]$RuntimeText = (New-RuntimeBacklogText)
    )

    $root = Join-Path $smokeRoot $Name
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $root "state.yaml") -Value $StateText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "queue.yaml") -Value $QueueText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "serial-plan.md") -Value $basePlan -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "task-plan.md") -Value "## SSOT Read List`n`n- docs/01-requirements/00-index.md`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "evidence.md") -Value $baseEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "audit.md") -Value $baseAudit -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root $authorizationPath) -Value "Status: approved`nhuman approval`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "finding-ledger.yaml") -Value $LedgerText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "post-p0-map.yaml") -Value $LedgerText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "clusters.yaml") -Value "clusters: []`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "runtime-backlog.yaml") -Value $RuntimeText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "guard.ps1") -Value "# fixture`n" -Encoding UTF8
    return $root
}

function Invoke-Guard {
    param([Parameter(Mandatory = $true)][string]$Root, [string[]]$ChangedFiles = @())

    return @(
        & $guardPath `
            -RepositoryRoot $Root `
            -ProjectStatePath "state.yaml" `
            -QueuePath "queue.yaml" `
            -AuditRepositoryRoot $Root `
            -Phase manual `
            -ChangedFiles $ChangedFiles `
            -SkipGitChecks `
            -SkipExternalIntegrityChecks
    )
}

function Assert-FailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [string[]]$ChangedFiles = @()
    )

    $failed = $false
    try {
        $output = Invoke-Guard -Root $Root -ChangedFiles $ChangedFiles
    } catch {
        $failed = $true
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "Expected '$Pattern', got:`n$($_.Exception.Message)`n$($_.ScriptStackTrace)"
        }
    }
    if (-not $failed) {
        throw "Negative P1 Program fixture unexpectedly passed.`n$($output -join "`n")"
    }
}

function Assert-PrePushFailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$RemoteName,
        [Parameter(Mandatory = $true)][string]$RemoteUrl,
        [Parameter(Mandatory = $true)][string]$UpdateLine,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $failed = $false
    try {
        & $guardPath -RepositoryRoot $Root -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $Root -Phase pre_push -PushRemoteName $RemoteName -PushRemoteUrl $RemoteUrl -PushUpdateLines $UpdateLine -SkipExternalIntegrityChecks
    } catch {
        $failed = $true
        if ($_.Exception.Message -notmatch $Pattern) { throw "Expected '$Pattern', got:`n$($_.Exception.Message)" }
    }
    if (-not $failed) { throw "Negative pre-push fixture unexpectedly passed." }
}

function Replace-F0115QueueAnchor {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Anchor,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Replacement,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $anchorCount = [regex]::Matches($Content, [regex]::Escape($Anchor)).Count
    if ($anchorCount -ne 1) { throw "F-0115 fixture anchor '$Label' expected once, found $anchorCount." }
    return $Content.Replace($Anchor, $Replacement)
}

function ConvertTo-F0115ScopeCorrectionQueue {
    param([Parameter(Mandatory = $true)][string]$QueueText)

    $normalizedQueue = $QueueText -replace "`r`n?", "`n"
    $taskPattern = "(?ms)^  - id:\s*$([regex]::Escape($p1F0115ScopeCorrectionParentTaskId))\s*`n.*?(?=^  - id:|^standingAuthorization:|\z)"
    $taskMatch = [regex]::Match($normalizedQueue, $taskPattern)
    if (-not $taskMatch.Success) { throw "F-0115 fixture parent task block is missing." }
    if ([regex]::Matches($normalizedQueue, $taskPattern).Count -ne 1) { throw "F-0115 fixture parent task block is not unique." }
    $parentTaskBlock = $taskMatch.Value

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "fresh approval source" -Anchor @"
    approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
    authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
    executionProfile: R3
"@ -Replacement @"
    approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
    authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
    freshApprovalSource: docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md
    executionProfile: R3
"@

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "rollback boundary" -Anchor @"
    rollbackOrStopCondition: stop_if_schema_migration_persistent_batch_command_database_runtime_external_distribution_service_or_other_finding_repair_is_required
"@ -Replacement @"
    rollbackOrStopCondition: stop_if_generated_migration_source_would_be_executed_or_if_dependency_database_provider_runtime_p2_pr_force_push_deploy_or_other_finding_repair_is_required
"@

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "focused gates" -Anchor @"
    focusedGates:
      - jit_post_p0_credential_membership_transaction_boundary
      - auth_user_auth_account_user_employee_quota_atomicity
      - employee_creation_failure_rolls_back_all_identity_side_effects
      - account_phone_conflict_and_concurrent_retry_fail_closed
      - batch_row_exception_returns_explainable_partial_result_without_losing_success_rows
      - one_time_initial_password_only_for_committed_rows
      - response_loss_and_retry_boundary_explicitly_classified
      - operations_or_super_admin_write_boundary_preserved
      - focused_service_repository_route_and_static_regression
      - full_static_regression
      - two_round_adversarial_review
"@ -Replacement @"
    focusedGates:
      - persistent_employee_import_command_idempotency_and_request_hmac
      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity
      - row_savepoint_rolls_back_all_identity_side_effects_before_rejection
      - unknown_result_remains_recoverable_and_is_never_reclassified_as_rejected
      - generated_credential_placeholder_rotate_revision_and_confirm_distribution
      - login_and_issue_share_advisory_lock_with_deterministic_multi_lock_order
      - canonical_and_legacy_routes_are_no_store_and_redacted
      - operations_or_super_admin_write_and_actor_visibility_boundaries
      - drizzle_generated_migration_source_only_without_execution
      - focused_service_repository_route_ui_and_static_regression
      - full_static_regression
      - two_round_adversarial_review
"@

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "product allowlist" -Anchor @"
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - src/server/services/employee-account-service.ts
      - src/server/services/employee-account-service.test.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts
      - src/server/services/admin-organization-org-auth-runtime.ts
      - src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
      - tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts
"@ -Replacement @"
    allowedFiles:
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
      - docs/superpowers/specs/2026-07-16-employee-import-command-recovery-design.md
      - docs/superpowers/plans/2026-07-16-employee-import-command-recovery.md
      - src/db/schema/employee-import.ts
      - src/db/schema/employee-import.test.ts
      - src/db/schema/index.ts
      - drizzle/*_p1_rc_02_employee_import_command_recovery.sql
      - drizzle/meta/*_snapshot.json
      - drizzle/meta/_journal.json
      - src/server/contracts/employee-import-command-contract.ts
      - src/server/validators/employee-import-command.ts
      - src/server/validators/employee-import-command.test.ts
      - src/server/services/employee-import-command-crypto.ts
      - src/server/services/employee-import-command-crypto.test.ts
      - src/server/repositories/employee-import-command-repository.ts
      - src/server/repositories/postgres-employee-import-command-repository.ts
      - src/server/repositories/postgres-employee-import-command-repository.test.ts
      - src/server/services/employee-import-command-service.ts
      - src/server/services/employee-import-command-service.test.ts
      - src/server/services/employee-import-command-route.ts
      - src/server/services/employee-import-command-route.test.ts
      - src/app/api/v1/employee-import-commands/route.ts
      - src/app/api/v1/employee-import-commands/[publicId]/route.ts
      - src/app/api/v1/employee-import-commands/[publicId]/issue-credentials/route.ts
      - src/app/api/v1/employee-import-commands/[publicId]/confirm-distribution/route.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.ts
      - src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts
      - src/server/services/admin-organization-org-auth-runtime.ts
      - src/server/contracts/admin-user-org-auth-ops-contract.ts
      - src/server/contracts/employee-account-contract.ts
      - src/server/services/employee-account-service.ts
      - src/server/services/employee-account-service.test.ts
      - src/server/auth/local-session-runtime.test.ts
      - src/features/admin/org-auth-redeem/employee-import-command-client.ts
      - src/features/admin/org-auth-redeem/employee-import-command-client.test.ts
      - src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts
      - src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx
      - src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.tsx
      - src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx
      - src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx
      - tests/unit/p1-employee-import-command-atomicity.test.ts
      - tests/unit/p1-employee-import-command-migration-source.test.ts
      - tests/unit/p0-rc-02-organization-scope-quota-employee.test.ts
      - tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts
      - tests/unit/phase-20-ra-01-04-employee-import.test.ts
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
      - tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts
      - tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts
      - tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts
"@

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "blocked schema and drizzle paths" -Anchor @"
      - src/db/schema/**
      - drizzle/**
"@ -Replacement ""

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "schema capability" -Anchor @"
      schemaMigration: blocked_without_fresh_approval
"@ -Replacement @"
      schemaMigration: approved_source_generation_only_no_execution
"@

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "acceptance standards" -Anchor @"
    acceptanceStandards:
      - JIT revalidation must first distinguish post-P0 covered atomic creation from any remaining batch exception, unknown-result or one-time-secret residual; superseded evidence cannot be reopened wholesale.
      - A committed employee account must contain auth_user, auth_account, user, employee and quota reservation in one transaction; any failure must leave no orphan credential or partial membership.
      - Batch import must preserve explainable committed-row results and must never expose an initial password for a row whose transaction did not commit.
      - Response-loss and retry safety must be proven within the current no-schema boundary; if durable batch idempotency or recoverable secret storage is required, stop and request separate approval rather than inventing persistence.
      - F-0115 can close only at static level after focused and full regression; RV-0018 remains pending and no schema, migration, dependency, database, Provider, browser/runtime, P2, PR, force push or deployment action occurs.
"@ -Replacement @"
    acceptanceStandards:
      - The command idempotency key and normalized request HMAC must make same-key/same-request resume safe and same-key/different-request fail with 409 without storing raw request, phone, name, or password.
      - Each row must atomically commit identity, credential, employee membership, current org_auth quota, outcome, and audit; deterministic rejection must roll back identity through a savepoint, and unknown outcome must remain recoverable rather than being marked rejected.
      - Generated credentials must start with an unknowable placeholder and only explicit revision-bound issue may rotate and return plaintext once; GET never returns plaintext, active sessions block issue, and confirm closes distribution.
      - F-0115 closes statically only after focused/full regression and two reviews; Drizzle generation may create migration source but no migration/database execution occurs, RV-0018 remains pending, and dependency/Provider/browser/P2/PR/force/deploy remain blocked.
"@

    $parentTaskBlock = Replace-F0115QueueAnchor -Content $parentTaskBlock -Label "focused validation command" -Anchor @"
      - corepack pnpm@10.15.1 exec vitest run src/server/services/employee-account-service.test.ts src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts --maxWorkers=1
"@ -Replacement @"
      - corepack pnpm@10.15.1 exec vitest run src/db/schema/employee-import.test.ts src/server/validators/employee-import-command.test.ts src/server/services/employee-import-command-crypto.test.ts src/server/repositories/postgres-employee-import-command-repository.test.ts src/server/services/employee-import-command-service.test.ts src/server/services/employee-import-command-route.test.ts src/server/auth/local-session-runtime.test.ts src/features/admin/org-auth-redeem/employee-import-command-client.test.ts src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx tests/unit/p1-employee-import-command-atomicity.test.ts tests/unit/p1-employee-import-command-migration-source.test.ts tests/unit/p0-rc-02-organization-scope-quota-employee.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts --maxWorkers=1
"@

    return $normalizedQueue.Substring(0, $taskMatch.Index) + $parentTaskBlock + $normalizedQueue.Substring($taskMatch.Index + $taskMatch.Length)
}

function Set-F0115FixtureFile {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $fullPath = Join-Path $Root ($Path -replace "/", "\")
    $parentPath = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $parentPath)) { New-Item -ItemType Directory -Path $parentPath -Force | Out-Null }
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($fullPath, ($Content -replace "`r`n?", "`n"), $utf8WithoutBom)
}

function Initialize-F0115FixtureRemote {
    if (Test-Path -LiteralPath $p1F0115FixtureRemote) { return }
    & git -c core.longpaths=true clone --quiet --bare $repositoryRoot $p1F0115FixtureRemote
    if ($LASTEXITCODE -ne 0) { throw "Unable to create F-0115 fixture remote." }
    & git --git-dir=$p1F0115FixtureRemote update-ref refs/heads/master $p1F0115ScopeCorrectionBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Unable to pin F-0115 fixture remote base." }
    & git --git-dir=$p1F0115FixtureRemote symbolic-ref HEAD refs/heads/master
    if ($LASTEXITCODE -ne 0) { throw "Unable to set F-0115 fixture remote HEAD." }
}

function New-F0115Fixture {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [string]$Branch = $p1F0115ScopeCorrectionBranch,
        [switch]$AdvanceBase
    )

    Initialize-F0115FixtureRemote
    $root = Join-Path $smokeRoot $Name
    & git -c core.longpaths=true clone --quiet --no-checkout --branch master $p1F0115FixtureRemote $root
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone F-0115 fixture '$Name'." }
    & git -C $root config user.name "P1 F-0115 Scope Smoke"
    & git -C $root config user.email "p1-f0115-scope-smoke@example.invalid"
    & git -C $root config core.autocrlf false
    & git -C $root config core.longpaths true
    & git -C $root config core.safecrlf false
    & git -C $root sparse-checkout init --no-cone
    if ($LASTEXITCODE -ne 0) { throw "Unable to initialize F-0115 sparse fixture '$Name'." }
    $sparsePatterns = @(
        "/.gitattributes",
        "/docs/04-agent-system/",
        "/docs/05-execution-logs/acceptance/2026-07-16-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-16-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-16-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-15-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-16-p1-*",
        "/scripts/agent-system/",
        "/src/server/services/employee-account-service.ts"
    )
    & git -C $root sparse-checkout set --no-cone $sparsePatterns
    if ($LASTEXITCODE -ne 0) { throw "Unable to configure F-0115 sparse fixture '$Name'." }
    & git -C $root switch --quiet master
    if ($LASTEXITCODE -ne 0) { throw "Unable to materialize F-0115 sparse fixture '$Name'." }
    & git -C $root switch --quiet -c $Branch
    if ($LASTEXITCODE -ne 0) { throw "Unable to create F-0115 fixture branch '$Branch'." }
    if ($AdvanceBase) {
        $wrongBasePath = "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md"
        $wrongBaseText = Get-Content -LiteralPath (Join-Path $root ($wrongBasePath -replace "/", "\")) -Raw -Encoding UTF8
        Set-F0115FixtureFile -Root $root -Path $wrongBasePath -Content "$wrongBaseText`n<!-- F-0115 wrong-base fixture advance marker -->"
        & git -C $root add -- $wrongBasePath
        & git -C $root commit --quiet -m "advance wrong F-0115 base"
        if ($LASTEXITCODE -ne 0) { throw "Unable to advance F-0115 wrong-base fixture." }
    }
    return $root
}

function Set-F0115Candidate {
    param([Parameter(Mandatory = $true)][string]$Root)

    $parentQueue = @(& git -C $Root show "${p1F0115ScopeCorrectionBaseSha}:docs/04-agent-system/state/task-queue.yaml") -join "`n"
    if ($LASTEXITCODE -ne 0) { throw "Unable to read F-0115 parent queue." }
    $candidateQueue = ConvertTo-F0115ScopeCorrectionQueue -QueueText $parentQueue
    Set-F0115FixtureFile -Root $Root -Path "docs/04-agent-system/state/task-queue.yaml" -Content $candidateQueue

    $authorizationFileList = @($p1F0115ScopeCorrectionFiles | ForEach-Object { "- ``$_``" }) -join "`n"
    $authorizationText = @"
# P1 F-0115 Scope-Correction Authorization

Status: approved
Human approval source: current user message
Task ID: ``$p1F0115ScopeCorrectionTaskId``
Parent task: ``$p1F0115ScopeCorrectionParentTaskId``
Base: ``$p1F0115ScopeCorrectionBaseSha``
Branch: ``$p1F0115ScopeCorrectionBranch``

## Exact Files

$authorizationFileList

## Capability Authorization

schemaMigration: approved_source_generation_only_no_execution
dependencyIntroduction: blocked_without_fresh_approval
databaseMutation: blocked_without_fresh_user_approval
providerCall: blocked_without_fresh_approval
runtimeAcceptance: blocked_out_of_program
browserRuntimeValidation: blocked_out_of_program
p2Implementation: blocked_out_of_program
stagingProdDeploy: blocked_requires_fresh_user_approval
forcePush: blocked
pr: blocked
costCalibrationGate: blocked

Every other in_progress SHA mismatch remains a hard-block.
Hook bypass is not approved.
No product implementation, migration/database execution, dependency, Provider, browser/runtime, P2, PR, force push, or deployment is authorized by this governance commit.
"@
    Set-F0115FixtureFile -Root $Root -Path $p1F0115ScopeCorrectionAuthorizationPath -Content $authorizationText

    $evidenceText = @"
# P1 F-0115 Scope-Correction Evidence

- Evidence status: pass
- Result: pass

## Requirement Mapping Result

Result: pass

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked

## Root-Cause Reproduction

Result: pass

## TDD Evidence

Result: pass

## Validation Results

Result: pass

## Scope Freeze

Result: pass
"@
    Set-F0115FixtureFile -Root $Root -Path $p1F0115ScopeCorrectionEvidencePath -Content $evidenceText

    $auditText = @"
# P1 F-0115 Scope-Correction Audit

## Round 1

Result: pass

## Round 2

Result: pass

## Decision

Decision: APPROVE
"@
    Set-F0115FixtureFile -Root $Root -Path $p1F0115ScopeCorrectionAuditPath -Content $auditText

    foreach ($fixturePath in @($p1F0115ScopeCorrectionFiles | Where-Object {
        $_ -notin @(
            "docs/04-agent-system/state/task-queue.yaml",
            $p1F0115ScopeCorrectionAuthorizationPath,
            $p1F0115ScopeCorrectionEvidencePath,
            $p1F0115ScopeCorrectionAuditPath
        )
    })) {
        Set-F0115FixtureFile -Root $Root -Path $fixturePath -Content "# F-0115 governance fixture: $fixturePath"
    }
    & git -C $Root add -- $p1F0115ScopeCorrectionFiles
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage F-0115 scope-correction fixture." }
}

function Invoke-F0115Guard {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$Phase
    )

    if ($Phase -eq "pre_commit") {
        return @(& $guardPath -RepositoryRoot $Root -Phase pre_commit -SkipExternalIntegrityChecks)
    }
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $originSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
    $originUrl = ((& git -C $Root remote get-url origin) -join "").Trim()
    $updateLine = "refs/heads/master $headSha refs/heads/master $originSha"
    return @(& $guardPath -RepositoryRoot $Root -Phase pre_push -PushRemoteName origin -PushRemoteUrl $originUrl -PushUpdateLines $updateLine -SkipExternalIntegrityChecks)
}

function Invoke-F0115PreCommitProcess {
    param([Parameter(Mandatory = $true)][string]$Root)

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        $processOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $guardPath -RepositoryRoot $Root -Phase pre_commit -SkipExternalIntegrityChecks 2>&1)
        $processExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
    return [pscustomobject]@{
        ExitCode = $processExitCode
        OutputText = $processOutput -join "`n"
    }
}

function Assert-F0115ExactCandidateIndex {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $cachedStatusLines = @(& git -C $Root diff --cached --name-status --no-renames --diff-filter=ACMRTD)
    $cachedStatusExitCode = $LASTEXITCODE
    $cachedPaths = [System.Collections.Generic.List[string]]::new()
    $hasInvalidStatus = $false
    foreach ($cachedStatusLine in $cachedStatusLines) {
        if ($cachedStatusLine -notmatch '^(?:A|M)\t(.+)$') {
            $hasInvalidStatus = $true
            continue
        }
        $cachedPaths.Add($Matches[1])
    }
    $actualCachedPaths = @($cachedPaths.ToArray() | Sort-Object -Unique)
    $expectedCachedPaths = @($p1F0115ScopeCorrectionFiles | Sort-Object -Unique)
    $unstagedPaths = @(& git -C $Root diff --name-only)
    $unstagedExitCode = $LASTEXITCODE
    $untrackedPaths = @(& git -C $Root ls-files --others --exclude-standard)
    $untrackedExitCode = $LASTEXITCODE
    if (
        $cachedStatusExitCode -ne 0 -or
        $cachedStatusLines.Count -ne 12 -or
        $hasInvalidStatus -or
        ($actualCachedPaths -join "|") -cne ($expectedCachedPaths -join "|") -or
        $unstagedExitCode -ne 0 -or
        $unstagedPaths.Count -ne 0 -or
        $untrackedExitCode -ne 0 -or
        $untrackedPaths.Count -ne 0
    ) {
        throw "F-0115 contradiction fixture '$Label' must contain exact twelve staged A/M paths with zero unstaged or untracked paths."
    }
}

function Assert-F0115ProcessFailsWithoutSuccessMarkers {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $result = Invoke-F0115PreCommitProcess -Root $Root
    if ($result.ExitCode -eq 0) {
        throw "F-0115 contradiction negative '$Label' unexpectedly passed.`n$($result.OutputText)"
    }
    if ($result.OutputText -notmatch $Pattern) {
        throw "F-0115 contradiction negative '$Label' expected '$Pattern', got:`n$($result.OutputText)"
    }
    if ($result.OutputText -match '(?m)^p1ProgramGuardResult:\s*pass|p1F0115ScopeCorrectionAuthorization:\s*approved_one_time|p1TransitionScopeMode:\s*transition_only') {
        throw "F-0115 contradiction negative '$Label' leaked a success marker.`n$($result.OutputText)"
    }
}

function Assert-F0115FailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$Phase,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $failed = $false
    try {
        $output = Invoke-F0115Guard -Root $Root -Phase $Phase
    } catch {
        $failed = $true
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "F-0115 negative '$Label' expected '$Pattern', got:`n$($_.Exception.Message)`n$($_.ScriptStackTrace)"
        }
    }
    if (-not $failed) { throw "F-0115 negative '$Label' unexpectedly passed.`n$($output -join "`n")" }
}

function Initialize-F0115Phase11FixtureRemote {
    if (Test-Path -LiteralPath $p1F0115Phase11FixtureRemote) { return }

    & git -c core.longpaths=true clone --quiet --bare $repositoryRoot $p1F0115Phase11FixtureRemote
    if ($LASTEXITCODE -ne 0) { throw "Unable to create F-0115 phase-11 fixture remote." }
    & git --git-dir=$p1F0115Phase11FixtureRemote update-ref refs/heads/master $p1F0115Phase11ScopeCorrectionBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Unable to pin F-0115 phase-11 fixture base." }
    & git --git-dir=$p1F0115Phase11FixtureRemote symbolic-ref HEAD refs/heads/master
    if ($LASTEXITCODE -ne 0) { throw "Unable to set F-0115 phase-11 fixture remote HEAD." }
}

function New-F0115Phase11Fixture {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [string]$Branch = $p1F0115Phase11ScopeCorrectionBranch,
        [switch]$AdvanceBase
    )

    Initialize-F0115Phase11FixtureRemote
    $root = Join-Path $smokeRoot $Name
    & git -c core.longpaths=true clone --quiet --no-checkout --branch master $p1F0115Phase11FixtureRemote $root
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone F-0115 phase-11 fixture '$Name'." }
    & git -C $root config user.name "P1 F-0115 Phase-11 Scope Smoke"
    & git -C $root config user.email "p1-f0115-phase11-scope-smoke@example.invalid"
    & git -C $root config core.autocrlf false
    & git -C $root config core.longpaths true
    & git -C $root config core.safecrlf false
    & git -C $root sparse-checkout init --no-cone
    if ($LASTEXITCODE -ne 0) { throw "Unable to initialize F-0115 phase-11 sparse fixture '$Name'." }
    $sparsePatterns = @(
        "/.gitattributes",
        "/docs/04-agent-system/",
        "/docs/05-execution-logs/acceptance/2026-07-16-p1-*",
        "/docs/05-execution-logs/acceptance/2026-07-17-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-16-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-17-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-16-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-17-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-15-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-16-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-17-p1-*",
        "/scripts/agent-system/",
        "/src/server/services/employee-account-service.ts"
    )
    & git -C $root sparse-checkout set --no-cone $sparsePatterns
    if ($LASTEXITCODE -ne 0) { throw "Unable to configure F-0115 phase-11 sparse fixture '$Name'." }
    & git -C $root switch --quiet master
    if ($LASTEXITCODE -ne 0) { throw "Unable to materialize F-0115 phase-11 fixture '$Name'." }
    & git -C $root switch --quiet -c $Branch
    if ($LASTEXITCODE -ne 0) { throw "Unable to create F-0115 phase-11 fixture branch '$Branch'." }
    if ($AdvanceBase) {
        $wrongBasePath = "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md"
        $wrongBaseText = Get-Content -LiteralPath (Join-Path $root ($wrongBasePath -replace "/", "\")) -Raw -Encoding UTF8
        Set-F0115FixtureFile -Root $root -Path $wrongBasePath -Content "$wrongBaseText`n<!-- F-0115 phase-11 wrong-base marker -->"
        & git -C $root add -- $wrongBasePath
        & git -C $root commit --quiet -m "advance wrong F-0115 phase-11 base"
        if ($LASTEXITCODE -ne 0) { throw "Unable to advance F-0115 phase-11 wrong-base fixture." }
    }
    return $root
}

function Set-F0115Phase11Candidate {
    param([Parameter(Mandatory = $true)][string]$Root)

    $parentQueue = @(& git -C $Root show "${p1F0115Phase11ScopeCorrectionBaseSha}:docs/04-agent-system/state/task-queue.yaml") -join "`n"
    if ($LASTEXITCODE -ne 0) { throw "Unable to read F-0115 phase-11 parent queue." }
    $parentQueue = $parentQueue -replace "`r`n?", "`n"
    $queueAnchor = "      - tests/unit/admin-user-org-auth-ops-baseline.test.ts`n      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts"
    $queueReplacement = "      - tests/unit/admin-user-org-auth-ops-baseline.test.ts`n      - $p1F0115Phase11ScopeCorrectionAllowedFile`n      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts"
    if ([regex]::Matches($parentQueue, [regex]::Escape($queueAnchor)).Count -ne 1 -or $parentQueue -match [regex]::Escape($p1F0115Phase11ScopeCorrectionAllowedFile)) {
        throw "F-0115 phase-11 queue fixture anchor is not exact."
    }
    Set-F0115FixtureFile -Root $Root -Path "docs/04-agent-system/state/task-queue.yaml" -Content $parentQueue.Replace($queueAnchor, $queueReplacement)

    $authorizationFileList = @($p1F0115Phase11ScopeCorrectionFiles | ForEach-Object { "- ``$_``" }) -join "`n"
    Set-F0115FixtureFile -Root $Root -Path $p1F0115Phase11ScopeCorrectionAuthorizationPath -Content @"
# P1 F-0115 Phase-11 Scope-Correction Authorization

Status: approved
Human approval source: current user message
Task ID: ``$p1F0115Phase11ScopeCorrectionTaskId``
Parent task: ``$p1F0115Phase11ScopeCorrectionParentTaskId``
Base: ``$p1F0115Phase11ScopeCorrectionBaseSha``
Branch: ``$p1F0115Phase11ScopeCorrectionBranch``

Approved allowlist correction: ``$p1F0115Phase11ScopeCorrectionAllowedFile``

## Exact Files

$authorizationFileList

Every other in_progress SHA mismatch remains a hard-block.
Hook bypass is not approved.
"@
    Set-F0115FixtureFile -Root $Root -Path $p1F0115Phase11ScopeCorrectionEvidencePath -Content @"
# P1 F-0115 Phase-11 Scope-Correction Evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked

## Requirement Mapping Result

Result: pass

## Root-Cause Reproduction

Result: pass

## TDD Evidence

Result: pass

## Validation Results

Result: pass
"@
    Set-F0115FixtureFile -Root $Root -Path $p1F0115Phase11ScopeCorrectionAuditPath -Content @"
# P1 F-0115 Phase-11 Scope-Correction Audit

## Round 1

Result: pass

## Round 2

Result: pass

## Decision

Decision: APPROVE
"@
    foreach ($fixturePath in @($p1F0115Phase11ScopeCorrectionFiles | Where-Object {
        $_ -notin @(
            "docs/04-agent-system/state/task-queue.yaml",
            $p1F0115Phase11ScopeCorrectionAuthorizationPath,
            $p1F0115Phase11ScopeCorrectionEvidencePath,
            $p1F0115Phase11ScopeCorrectionAuditPath
        )
    })) {
        Set-F0115FixtureFile -Root $Root -Path $fixturePath -Content "# F-0115 phase-11 governance fixture: $fixturePath"
    }
    & git -C $Root add -- $p1F0115Phase11ScopeCorrectionFiles
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage F-0115 phase-11 scope-correction fixture." }
}

function Invoke-F0115Phase11Guard {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$Phase
    )

    if ($Phase -eq "pre_commit") {
        return @(& $guardPath -RepositoryRoot $Root -Phase pre_commit -SkipExternalIntegrityChecks)
    }
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $originSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
    $originUrl = ((& git -C $Root remote get-url origin) -join "").Trim()
    $updateLine = "refs/heads/master $headSha refs/heads/master $originSha"
    return @(& $guardPath -RepositoryRoot $Root -Phase pre_push -PushRemoteName origin -PushRemoteUrl $originUrl -PushUpdateLines $updateLine -SkipExternalIntegrityChecks)
}

function Assert-F0115Phase11FailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$Phase,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $failed = $false
    try {
        $output = Invoke-F0115Phase11Guard -Root $Root -Phase $Phase
    } catch {
        $failed = $true
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "F-0115 phase-11 negative '$Label' expected '$Pattern', got:`n$($_.Exception.Message)"
        }
        if ($_.Exception.Message -match '(?m)^p1ProgramGuardResult:\s*pass|p1F0115Phase11ScopeCorrectionAuthorization:\s*approved_one_time|p1TransitionScopeMode:\s*transition_only') {
            throw "F-0115 phase-11 negative '$Label' leaked a success marker.`n$($_.Exception.Message)"
        }
    }
    if (-not $failed) { throw "F-0115 phase-11 negative '$Label' unexpectedly passed.`n$($output -join "`n")" }
}

try {
    $p1GuardText = Get-Content -LiteralPath $guardPath -Raw -Encoding UTF8
    foreach ($scopeCorrectionPattern in @(
        'Test-P1F0132ScopeCorrectionFileSet',
        'Test-P1F0132ScopeCorrectionAnchors',
        'p1F0132ScopeCorrectionAuthorization: approved_one_time',
        'P1_PROGRAM_F0132_SCOPE_CORRECTION_QUEUE_DELTA_INVALID',
        'P1_PROGRAM_F0132_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID',
        'Get-GitSnapshotFileText',
        'scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1',
        'scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1'
    )) {
        if ($p1GuardText -notmatch [regex]::Escape($scopeCorrectionPattern)) {
            throw "P1 guard is missing F-0132 scope-correction contract: $scopeCorrectionPattern"
        }
    }
    $f0115ScopeCorrectionPatterns = @(
        'Test-P1F0115ScopeCorrectionFileSet',
        'Test-P1F0115ScopeCorrectionAnchors',
        'p1F0115ScopeCorrectionAuthorization: approved_one_time',
        'P1_PROGRAM_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID',
        'P1_PROGRAM_F0115_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID'
    )
    $missingF0115ScopeCorrectionPatterns = @($f0115ScopeCorrectionPatterns | Where-Object {
        $p1GuardText -notmatch [regex]::Escape($_)
    })

    $prePushHookPath = Join-Path $repositoryRoot ".husky\pre-push"
    $prePushHookText = Get-Content -LiteralPath $prePushHookPath -Raw -Encoding UTF8
    $pushUpdateCaptureIndex = $prePushHookText.IndexOf('push_updates=$(cat)')
    $p1GuardIndex = $prePushHookText.IndexOf('Test-P1RemediationSerialProgram.ps1')
    $moduleGuardIndex = $prePushHookText.IndexOf('Test-ModuleRunV2PrePushReadiness.ps1')
    if ($pushUpdateCaptureIndex -lt 0 -or $p1GuardIndex -lt 0 -or $moduleGuardIndex -lt 0 -or $pushUpdateCaptureIndex -gt $p1GuardIndex -or $p1GuardIndex -gt $moduleGuardIndex) {
        throw "Pre-push hook does not preserve stdin and run P1 transition validation before Module Run."
    }
    if ($prePushHookText -notmatch 'p1TransitionScopeMode: transition_only' -or $prePushHookText -notmatch '-P1TransitionScopeMode transition_only') {
        throw "Pre-push hook does not conditionally forward the P1 transition-only scope mode."
    }

    $positiveRoot = Write-CaseFiles -Name "positive" -StateText $baseState -QueueText $baseQueue
    $positiveOutput = Invoke-Guard -Root $positiveRoot -ChangedFiles @("state.yaml", "queue.yaml")
    if (($positiveOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") {
        throw "Positive P1 Program fixture did not report pass.`n$($positiveOutput -join "`n")"
    }

    $dotfileAliasQueue = $baseQueue.Replace("      - audit.md", "      - audit.md`n      - .governance-hook")
    $dotfileAliasRoot = Write-CaseFiles -Name "dotfile-alias" -StateText $baseState -QueueText $dotfileAliasQueue
    Set-Content -LiteralPath (Join-Path $dotfileAliasRoot "governance-hook") -Value "alias must not match a dotfile allowlist entry" -Encoding UTF8
    Assert-FailsWith -Root $dotfileAliasRoot -ChangedFiles @("governance-hook", "evidence.md", "audit.md") -Pattern "P1_PROGRAM_ALLOWED_FILES_VIOLATION governance-hook"

    $reorderedList = $candidateList.Replace("    - P1-RC-01`n    - P1-RC-02", "    - P1-RC-02`n    - P1-RC-01")
    $reorderedRoot = Write-CaseFiles -Name "reordered" -StateText $baseState.Replace($candidateList, $reorderedList) -QueueText $baseQueue.Replace($candidateList, $reorderedList)
    Assert-FailsWith -Root $reorderedRoot -Pattern "P1_PROGRAM_CANDIDATE_ORDER_MISMATCH"

    $duplicateProgramStateRoot = Write-CaseFiles -Name "duplicate-program-state" -StateText ($baseState + "`np1RemediationSerialProgram:`n  programId: fake-last-wins`n") -QueueText $baseQueue
    Assert-FailsWith -Root $duplicateProgramStateRoot -Pattern "P1_PROGRAM_DUPLICATE_TOP_LEVEL_KEY project-state p1RemediationSerialProgram"

    $duplicateProgramQueueRoot = Write-CaseFiles -Name "duplicate-program-queue" -StateText $baseState -QueueText ($baseQueue + "`np1RemediationSerialProgram:`n  programId: fake-last-wins`n")
    Assert-FailsWith -Root $duplicateProgramQueueRoot -Pattern "P1_PROGRAM_DUPLICATE_TOP_LEVEL_KEY task-queue p1RemediationSerialProgram"

    $quotedProgramRoot = Write-CaseFiles -Name "quoted-program-key" -StateText ($baseState + "`n`"p1RemediationSerialProgram`":`n  programId: fake-last-wins`n") -QueueText $baseQueue
    Assert-FailsWith -Root $quotedProgramRoot -Pattern "P1_PROGRAM_NONCANONICAL_YAML_KEY"

    $spacedProgramRoot = Write-CaseFiles -Name "spaced-program-key" -StateText $baseState -QueueText ($baseQueue + "`np1RemediationSerialProgram :`n  programId: fake-last-wins`n")
    Assert-FailsWith -Root $spacedProgramRoot -Pattern "P1_PROGRAM_NONCANONICAL_YAML_KEY"

    $mergeProgramRoot = Write-CaseFiles -Name "merge-program-key" -StateText ($baseState + "`n<<: *successor`n") -QueueText $baseQueue
    Assert-FailsWith -Root $mergeProgramRoot -Pattern "P1_PROGRAM_NONCANONICAL_YAML_KEY"

    $duplicateChildProgramIdState = $baseState.Replace("  programId: p1-remediation-2026-07-16`n  status: in_progress", "  programId: p1-remediation-2026-07-16`n  programId: fake-last-wins`n  status: in_progress")
    $duplicateChildProgramIdRoot = Write-CaseFiles -Name "duplicate-child-program-id" -StateText $duplicateChildProgramIdState -QueueText $baseQueue
    Assert-FailsWith -Root $duplicateChildProgramIdRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*programId"

    $duplicateChildStatusQueue = $baseQueue.Replace("  programId: p1-remediation-2026-07-16`n  status: in_progress", "  programId: p1-remediation-2026-07-16`n  status: in_progress`n  status: closed")
    $duplicateChildStatusRoot = Write-CaseFiles -Name "duplicate-child-status" -StateText $baseState -QueueText $duplicateChildStatusQueue
    Assert-FailsWith -Root $duplicateChildStatusRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*status"

    $fourSpaceProgramState = Add-IndentToBlockChildrenWithDuplicateKey -Content $baseState -BlockHeader "p1RemediationSerialProgram:" -DuplicateKey "programId" -DuplicateValue "fake-last-wins"
    $fourSpaceProgramRoot = Write-CaseFiles -Name "four-space-program-duplicate" -StateText $fourSpaceProgramState -QueueText $baseQueue
    Assert-FailsWith -Root $fourSpaceProgramRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*programId"

    $nonstandardCloseoutQueue = Add-IndentToBlockChildrenWithDuplicateKey -Content $baseQueue -BlockHeader "    closeoutPolicy:" -DuplicateKey "authorizationSource" -DuplicateValue "fake-last-wins"
    $nonstandardCloseoutRoot = Write-CaseFiles -Name "nonstandard-closeout-duplicate" -StateText $baseState -QueueText $nonstandardCloseoutQueue
    Assert-FailsWith -Root $nonstandardCloseoutRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*authorizationSource"

    $commentPoisonProgramState = $baseState.Replace("p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16", "p1RemediationSerialProgram:`n # ignored YAML comment`n  programId: p1-remediation-2026-07-16`n  programId: fake-last-wins")
    $commentPoisonProgramRoot = Write-CaseFiles -Name "comment-poison-program" -StateText $commentPoisonProgramState -QueueText $baseQueue
    Assert-FailsWith -Root $commentPoisonProgramRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*programId"

    $commentPoisonCloseoutQueue = $baseQueue.Replace("    closeoutPolicy:`n      authorizationSource:", "    closeoutPolicy:`n     # ignored YAML comment`n      authorizationSource: fake-first`n      authorizationSource:")
    $commentPoisonCloseoutRoot = Write-CaseFiles -Name "comment-poison-closeout" -StateText $baseState -QueueText $commentPoisonCloseoutQueue
    Assert-FailsWith -Root $commentPoisonCloseoutRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*authorizationSource"

    $wrappedProgramState = Add-WrapperToBlock -Content $baseState -BlockHeader "p1RemediationSerialProgram:"
    $wrappedProgramRoot = Write-CaseFiles -Name "wrapped-program" -StateText $wrappedProgramState -QueueText $baseQueue
    Assert-FailsWith -Root $wrappedProgramRoot -Pattern "P1_PROGRAM_ID_INVALID"

    $wrappedCloseoutQueue = Add-WrapperToBlock -Content $baseQueue -BlockHeader "    closeoutPolicy:"
    $wrappedCloseoutRoot = Write-CaseFiles -Name "wrapped-closeout" -StateText $baseState -QueueText $wrappedCloseoutQueue
    Assert-FailsWith -Root $wrappedCloseoutRoot -Pattern "P1_PROGRAM_TASK_AUTHORIZATION_SOURCE_INVALID|P1_PROGRAM_CLOSEOUT_POLICY_INVALID"

    $secondTask = "p1-remediation-identity-phone-uniqueness-2026-07-16"
    $multiState = $baseState.Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $secondTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: in_progress`n    $secondTask`: in_progress")
    $multiQueue = $baseQueue.Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $secondTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: in_progress`n    $secondTask`: in_progress")
    $multiRoot = Write-CaseFiles -Name "multi-wip" -StateText $multiState -QueueText $multiQueue
    Assert-FailsWith -Root $multiRoot -Pattern "P1_PROGRAM_MULTIPLE_ACTIVE_TASKS"

    $p2Queue = $baseQueue.Replace("p2Implementation: blocked_out_of_program", "p2Implementation: approved")
    $p2Root = Write-CaseFiles -Name "p2" -StateText $baseState -QueueText $p2Queue
    Assert-FailsWith -Root $p2Root -Pattern "P1_PROGRAM_BLOCKED_CAPABILITY_NOT_PRESERVED.*p2Implementation"

    $runtimeQueue = $baseQueue.Replace("browserRuntimeValidation: blocked_out_of_program", "browserRuntimeValidation: approved")
    $runtimeRoot = Write-CaseFiles -Name "runtime" -StateText $baseState -QueueText $runtimeQueue
    Assert-FailsWith -Root $runtimeRoot -Pattern "P1_PROGRAM_BLOCKED_CAPABILITY_NOT_PRESERVED.*browserRuntimeValidation"

    $f0013Ledger = (New-LedgerText).Replace('evidenceStatus: "runtime_evidence_required"', 'evidenceStatus: "baseline_changed"')
    $f0013Root = Write-CaseFiles -Name "f0013" -StateText $baseState -QueueText $baseQueue -LedgerText $f0013Ledger
    Assert-FailsWith -Root $f0013Root -Pattern "P1_PROGRAM_F0013_RUNTIME_HOLD_CHANGED"

    $p2Ledger = (New-LedgerText).Replace(
        "findingId: `"P2-001`"`n    riskLevel: `"P2`"`n    evidenceStatus: `"baseline_changed`"`n    disposition: `"pending_deep_revalidation`"`n    executionStatus: `"pending`"",
        "findingId: `"P2-001`"`n    riskLevel: `"P2`"`n    evidenceStatus: `"baseline_changed`"`n    disposition: `"remediation_required`"`n    executionStatus: `"in_progress`""
    )
    $p2LedgerRoot = Write-CaseFiles -Name "p2-ledger" -StateText $baseState -QueueText $baseQueue -LedgerText $p2Ledger
    Assert-FailsWith -Root $p2LedgerRoot -Pattern "P1_PROGRAM_P2_EXECUTION_STARTED"

    $scopeRoot = Write-CaseFiles -Name "scope" -StateText $baseState -QueueText $baseQueue
    Assert-FailsWith -Root $scopeRoot -Pattern "P1_PROGRAM_BLOCKED_FILES_VIOLATION" -ChangedFiles @("src/app/page.tsx")

    $pushRoot = Write-CaseFiles -Name "push" -StateText $baseState -QueueText $baseQueue.Replace("target: origin/master", "target: origin/other")
    Assert-FailsWith -Root $pushRoot -Pattern "P1_PROGRAM_CLOSEOUT_POLICY_INVALID.*push"

    $missingRoot = Write-CaseFiles -Name "missing" -StateText $baseState -QueueText $baseQueue
    Remove-Item -LiteralPath (Join-Path $missingRoot "post-p0-map.yaml")
    Assert-FailsWith -Root $missingRoot -Pattern "P1_PROGRAM_ARTIFACT_MISSING.*post_p0_map"

    $pendingReviewRoot = Write-CaseFiles -Name "pending-review" -StateText $baseState -QueueText $baseQueue
    Set-Content -LiteralPath (Join-Path $pendingReviewRoot "evidence.md") -Value $baseEvidence.Replace("Result: pass", "Pending.") -Encoding UTF8
    Assert-FailsWith -Root $pendingReviewRoot -Pattern "P1_PROGRAM_REVIEW_NOT_FINAL"

    $missingBranchRoot = Write-CaseFiles -Name "missing-branch" -StateText $baseState -QueueText $baseQueue.Replace("    branch: codex/bootstrap-fixture`n", "")
    Assert-FailsWith -Root $missingBranchRoot -Pattern "P1_PROGRAM_TASK_BOUNDARY_MISSING.*branch"

    $missingWorktreeRoot = Write-CaseFiles -Name "missing-worktree" -StateText $baseState -QueueText $baseQueue.Replace("    worktreePath: bootstrap-worktree-fixture`n", "")
    Assert-FailsWith -Root $missingWorktreeRoot -Pattern "P1_PROGRAM_TASK_BOUNDARY_MISSING.*worktreePath"

    $artifactEscapeRoot = Write-CaseFiles -Name "artifact-escape" -StateText $baseState -QueueText $baseQueue.Replace("planPath: task-plan.md", "planPath: ../task-plan.md")
    Assert-FailsWith -Root $artifactEscapeRoot -Pattern "P1_PROGRAM_TASK_ARTIFACT_OUTSIDE_REPOSITORY"

    $approvalQueue = $baseQueue.Replace("schemaMigration: blocked_without_fresh_approval", "schemaMigration: approved`n    freshApprovalSource: README.md")
    $approvalRoot = Write-CaseFiles -Name "approval-laundering" -StateText $baseState -QueueText $approvalQueue
    Set-Content -LiteralPath (Join-Path $approvalRoot "README.md") -Value "Status: approved`nhuman approval`n$bootstrapTask`nschemaMigration`n" -Encoding UTF8
    Assert-FailsWith -Root $approvalRoot -Pattern "P1_PROGRAM_FRESH_APPROVAL_SOURCE_MISSING"

    $selfScopeQueue = $baseQueue.Replace("      - audit.md", "      - audit.md`n      - src/**").Replace("      - src/**`n", "")
    $selfScopeRoot = Write-CaseFiles -Name "scope-self-modification" -StateText $baseState -QueueText $selfScopeQueue
    Assert-FailsWith -Root $selfScopeRoot -Pattern "P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE" -ChangedFiles @("queue.yaml", "src/app/page.tsx")

    $staleReviewQueue = $baseQueue.Replace("      - audit.md", "      - audit.md`n      - src/**").Replace("      - src/**`n      - tests/**", "      - tests/**")
    $staleReviewRoot = Write-CaseFiles -Name "stale-review" -StateText $baseState -QueueText $staleReviewQueue
    Assert-FailsWith -Root $staleReviewRoot -Pattern "P1_PROGRAM_IMPLEMENTATION_WITHOUT_FRESH_REVIEW" -ChangedFiles @("src/app/page.tsx")

    $controlPath = "scripts/agent-system/Test-P1RemediationSerialProgram.ps1"
    $controlRewriteQueue = $baseQueue.Replace("taskKind: mechanism_hardening", "taskKind: remediation").Replace("      - audit.md", "      - audit.md`n      - $controlPath")
    $controlRewriteRoot = Write-CaseFiles -Name "control-rewrite" -StateText $baseState -QueueText $controlRewriteQueue
    Assert-FailsWith -Root $controlRewriteRoot -Pattern "P1_PROGRAM_BLOCKED_FILES_VIOLATION.*Test-P1RemediationSerialProgram.ps1" -ChangedFiles @($controlPath)

    $fakeLedger = (New-LedgerText).Replace('findingId: "P1-001"', 'findingId: "P1-999"')
    $fakeIdRoot = Write-CaseFiles -Name "fake-id" -StateText $baseState -QueueText $baseQueue -LedgerText $fakeLedger
    Set-Content -LiteralPath (Join-Path $fakeIdRoot "post-p0-map.yaml") -Value (New-LedgerText) -Encoding UTF8
    Assert-FailsWith -Root $fakeIdRoot -Pattern "P1_PROGRAM_FINDING_ID_SET_MISMATCH"

    $omittedTask = "p1-remediation-omitted-closeout-2026-07-16"
    $omittedState = $baseState.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $omittedTask").Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $omittedTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $omittedTask`: in_progress")
    $omittedQueue = $baseQueue.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $omittedTask").Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $omittedTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $omittedTask`: in_progress")
    $omittedRoot = Write-CaseFiles -Name "omitted-closeout" -StateText $omittedState -QueueText $omittedQueue
    Assert-FailsWith -Root $omittedRoot -Pattern "P1_PROGRAM_MATERIALIZED_COMPLETED_PARTITION_INVALID"

    $prePushRoot = Write-CaseFiles -Name "pre-push-contract" -StateText $baseState -QueueText $baseQueue
    $prePushRemote = Join-Path $smokeRoot "pre-push-remote.git"
    New-Item -ItemType Directory -Path (Join-Path $prePushRoot "src") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $prePushRoot "src/deleted.ts") -Value "export const deletedFixture = true;`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $prePushRoot "src/renamed.ts") -Value "export const renamedFixture = true;`n" -Encoding UTF8
    & git -C $prePushRoot init -b master *> $null
    & git -C $prePushRoot config user.name "P1 Guard Smoke"
    & git -C $prePushRoot config user.email "p1-guard-smoke@example.invalid"
    & git -C $prePushRoot config core.autocrlf false
    & git -C $prePushRoot add .
    & git -C $prePushRoot commit -m "fixture" *> $null
    & git init --bare $prePushRemote *> $null
    & git -C $prePushRoot remote add origin $prePushRemote
    & git -C $prePushRoot push --quiet -u origin master 2>$null
    $prePushHead = ((& git -C $prePushRoot rev-parse HEAD) -join "").Trim()
    $prePushOriginUrl = ((& git -C $prePushRoot remote get-url origin) -join "").Trim()
    $validUpdateLine = "refs/heads/master $prePushHead refs/heads/master $prePushHead"
    $validPrePushOutput = @(& $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $prePushOriginUrl -PushUpdateLines $validUpdateLine -SkipExternalIntegrityChecks)
    if (($validPrePushOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Positive pre-push contract fixture failed." }
    if (($validPrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: standard") { throw "Ordinary pre-push fixture did not preserve standard scope mode." }
    $stdinPrePushOutput = @($validUpdateLine | & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $prePushOriginUrl -SkipExternalIntegrityChecks)
    if (($stdinPrePushOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Positive redirected-stdin pre-push fixture failed." }
    Assert-PrePushFailsWith -Root $prePushRoot -RemoteName "backup" -RemoteUrl $prePushOriginUrl -UpdateLine $validUpdateLine -Pattern "P1_PROGRAM_PRE_PUSH_REMOTE_INVALID"
    $wrongRefLine = "refs/heads/master $prePushHead refs/heads/other $prePushHead"
    Assert-PrePushFailsWith -Root $prePushRoot -RemoteName "origin" -RemoteUrl $prePushOriginUrl -UpdateLine $wrongRefLine -Pattern "P1_PROGRAM_PRE_PUSH_REF_INVALID"

    Remove-Item -LiteralPath (Join-Path $prePushRoot "src/deleted.ts")
    & git -C $prePushRoot add -A
    $deleteFailed = $false
    try {
        & $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $deleteFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_BLOCKED_FILES_VIOLATION.*src/deleted.ts") { throw }
    }
    if (-not $deleteFailed) { throw "Staged deletion fixture unexpectedly passed." }
    & git -C $prePushRoot restore --staged src/deleted.ts
    & git -C $prePushRoot restore src/deleted.ts

    & git -C $prePushRoot mv src/renamed.ts src/renamed-new.ts
    $renameFailed = $false
    try {
        & $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $renameFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_BLOCKED_FILES_VIOLATION.*src/renamed") { throw }
    }
    if (-not $renameFailed) { throw "Staged rename fixture unexpectedly passed." }

    if ($missingF0115ScopeCorrectionPatterns.Count -eq 0) {
        $f0115PositiveRoot = New-F0115Fixture -Name "f0115-positive"
        Set-F0115Candidate -Root $f0115PositiveRoot
        $f0115PreCommitOutput = Invoke-F0115Guard -Root $f0115PositiveRoot -Phase pre_commit
        if (($f0115PreCommitOutput -join "`n") -notmatch "p1F0115ScopeCorrectionAuthorization: approved_one_time") {
            throw "Exact F-0115 pre-commit fixture did not emit one-time authorization."
        }
        if (($f0115PreCommitOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") {
            throw "Exact F-0115 pre-commit fixture did not pass."
        }
        & git -C $f0115PositiveRoot commit --quiet -m "correct F-0115 frozen scope"
        if ($LASTEXITCODE -ne 0) { throw "Unable to commit exact F-0115 pre-push fixture." }
        & git -C $f0115PositiveRoot branch -M master
        if ($LASTEXITCODE -ne 0) { throw "Unable to prepare exact F-0115 pre-push branch." }
        $f0115PrePushOutput = Invoke-F0115Guard -Root $f0115PositiveRoot -Phase pre_push
        if (($f0115PrePushOutput -join "`n") -notmatch "p1F0115ScopeCorrectionAuthorization: approved_one_time") {
            throw "Exact one-parent F-0115 pre-push fixture did not emit one-time authorization."
        }
        if (($f0115PrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: transition_only") {
            throw "Exact one-parent F-0115 pre-push fixture did not emit transition-only scope mode."
        }

    $f0115WrongBaseRoot = New-F0115Fixture -Name "f0115-wrong-base" -AdvanceBase
    Set-F0115Candidate -Root $f0115WrongBaseRoot
    Assert-F0115FailsWith -Root $f0115WrongBaseRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_CONTEXT_INVALID" -Label "wrong base"

    $f0115WrongBranchRoot = New-F0115Fixture -Name "f0115-wrong-branch" -Branch "codex/p1-f0115-wrong-branch"
    Set-F0115Candidate -Root $f0115WrongBranchRoot
    Assert-F0115FailsWith -Root $f0115WrongBranchRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_CONTEXT_INVALID" -Label "wrong branch"

    $f0115WrongTaskRoot = New-F0115Fixture -Name "f0115-wrong-task"
    Set-F0115Candidate -Root $f0115WrongTaskRoot
    $f0115WrongTaskQueuePath = Join-Path $f0115WrongTaskRoot "docs\04-agent-system\state\task-queue.yaml"
    $f0115WrongTaskQueue = (Get-Content -LiteralPath $f0115WrongTaskQueuePath -Raw -Encoding UTF8).Replace(
        "  - id: $p1F0115ScopeCorrectionParentTaskId",
        "  - id: p1-remediation-rc-02-wrong-task-2026-07-16"
    )
    Set-F0115FixtureFile -Root $f0115WrongTaskRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content $f0115WrongTaskQueue
    & git -C $f0115WrongTaskRoot add docs/04-agent-system/state/task-queue.yaml
    Assert-F0115FailsWith -Root $f0115WrongTaskRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_CONTEXT_INVALID" -Label "wrong task"

    $f0115WrongStatusRoot = New-F0115Fixture -Name "f0115-wrong-status"
    Set-F0115Candidate -Root $f0115WrongStatusRoot
    $f0115WrongStatusQueuePath = Join-Path $f0115WrongStatusRoot "docs\04-agent-system\state\task-queue.yaml"
    $f0115WrongStatusQueue = Get-Content -LiteralPath $f0115WrongStatusQueuePath -Raw -Encoding UTF8
    $f0115WrongStatusQueue = [regex]::Replace(
        $f0115WrongStatusQueue,
        "(?ms)(^  - id:\s*$([regex]::Escape($p1F0115ScopeCorrectionParentTaskId))\s*\r?\n.*?^    status:)\s*in_progress",
        '${1} pending',
        1
    )
    Set-F0115FixtureFile -Root $f0115WrongStatusRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content $f0115WrongStatusQueue
    & git -C $f0115WrongStatusRoot add docs/04-agent-system/state/task-queue.yaml
    Assert-F0115FailsWith -Root $f0115WrongStatusRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_CONTEXT_INVALID" -Label "wrong status"

    $f0115InvalidApprovalRoot = New-F0115Fixture -Name "f0115-invalid-approval"
    Set-F0115Candidate -Root $f0115InvalidApprovalRoot
    $f0115InvalidApprovalPath = Join-Path $f0115InvalidApprovalRoot ($p1F0115ScopeCorrectionAuthorizationPath -replace "/", "\")
    $f0115InvalidApproval = (Get-Content -LiteralPath $f0115InvalidApprovalPath -Raw -Encoding UTF8).Replace("Status: approved", "Status: pending")
    Set-F0115FixtureFile -Root $f0115InvalidApprovalRoot -Path $p1F0115ScopeCorrectionAuthorizationPath -Content $f0115InvalidApproval
    & git -C $f0115InvalidApprovalRoot add -- $p1F0115ScopeCorrectionAuthorizationPath
    Assert-F0115FailsWith -Root $f0115InvalidApprovalRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID" -Label "invalid approval"

    $f0115MissingSchemaApprovalRoot = New-F0115Fixture -Name "f0115-missing-schema-approval"
    Set-F0115Candidate -Root $f0115MissingSchemaApprovalRoot
    $f0115MissingSchemaApprovalPath = Join-Path $f0115MissingSchemaApprovalRoot ($p1F0115ScopeCorrectionAuthorizationPath -replace "/", "\")
    $f0115MissingSchemaApproval = (Get-Content -LiteralPath $f0115MissingSchemaApprovalPath -Raw -Encoding UTF8).Replace(
        "schemaMigration: approved_source_generation_only_no_execution`n",
        ""
    )
    Set-F0115FixtureFile -Root $f0115MissingSchemaApprovalRoot -Path $p1F0115ScopeCorrectionAuthorizationPath -Content $f0115MissingSchemaApproval
    & git -C $f0115MissingSchemaApprovalRoot add -- $p1F0115ScopeCorrectionAuthorizationPath
    Assert-F0115FailsWith -Root $f0115MissingSchemaApprovalRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID" -Label "missing schema approval marker"

    $f0115TamperedPreservedApprovalRoot = New-F0115Fixture -Name "f0115-tampered-preserved-approval"
    Set-F0115Candidate -Root $f0115TamperedPreservedApprovalRoot
    $f0115TamperedPreservedApprovalPath = Join-Path $f0115TamperedPreservedApprovalRoot ($p1F0115ScopeCorrectionAuthorizationPath -replace "/", "\")
    $f0115TamperedPreservedApproval = (Get-Content -LiteralPath $f0115TamperedPreservedApprovalPath -Raw -Encoding UTF8).Replace(
        "dependencyIntroduction: blocked_without_fresh_approval",
        "dependencyIntroduction: approved"
    )
    Set-F0115FixtureFile -Root $f0115TamperedPreservedApprovalRoot -Path $p1F0115ScopeCorrectionAuthorizationPath -Content $f0115TamperedPreservedApproval
    & git -C $f0115TamperedPreservedApprovalRoot add -- $p1F0115ScopeCorrectionAuthorizationPath
    Assert-F0115FailsWith -Root $f0115TamperedPreservedApprovalRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID" -Label "tampered preserved capability marker"

    $f0115ContradictoryAuthorizationRoot = New-F0115Fixture -Name "f0115-contradictory-authorization"
    Set-F0115Candidate -Root $f0115ContradictoryAuthorizationRoot
    $f0115ContradictoryAuthorizationFullPath = Join-Path $f0115ContradictoryAuthorizationRoot ($p1F0115ScopeCorrectionAuthorizationPath -replace "/", "\")
    $f0115ContradictoryAuthorization = Get-Content -LiteralPath $f0115ContradictoryAuthorizationFullPath -Raw -Encoding UTF8
    Set-F0115FixtureFile -Root $f0115ContradictoryAuthorizationRoot -Path $p1F0115ScopeCorrectionAuthorizationPath -Content @"
$f0115ContradictoryAuthorization

## Capability Authorization

schemaMigration: approved_execution
databaseMutation: approved
dependencyIntroduction: approved
"@
    & git -C $f0115ContradictoryAuthorizationRoot add -- $p1F0115ScopeCorrectionAuthorizationPath
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage the F-0115 contradictory authorization fixture." }
    Assert-F0115ExactCandidateIndex -Root $f0115ContradictoryAuthorizationRoot -Label "contradictory authorization"
    Assert-F0115ProcessFailsWithoutSuccessMarkers -Root $f0115ContradictoryAuthorizationRoot -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION authorization" -Label "contradictory authorization"

    $f0115ContradictoryAuditRoot = New-F0115Fixture -Name "f0115-contradictory-audit"
    Set-F0115Candidate -Root $f0115ContradictoryAuditRoot
    $f0115ContradictoryAuditFullPath = Join-Path $f0115ContradictoryAuditRoot ($p1F0115ScopeCorrectionAuditPath -replace "/", "\")
    $f0115ContradictoryAudit = Get-Content -LiteralPath $f0115ContradictoryAuditFullPath -Raw -Encoding UTF8
    Set-F0115FixtureFile -Root $f0115ContradictoryAuditRoot -Path $p1F0115ScopeCorrectionAuditPath -Content @"
$f0115ContradictoryAudit

## Round 2

Result: fail

## Decision

Decision: REJECT
"@
    & git -C $f0115ContradictoryAuditRoot add -- $p1F0115ScopeCorrectionAuditPath
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage the F-0115 contradictory audit fixture." }
    Assert-F0115ExactCandidateIndex -Root $f0115ContradictoryAuditRoot -Label "contradictory audit"
    Assert-F0115ProcessFailsWithoutSuccessMarkers -Root $f0115ContradictoryAuditRoot -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION audit" -Label "contradictory audit"

    $f0115GlobalFindingRoot = New-F0115Fixture -Name "f0115-global-finding-after-valid-anchors"
    Set-F0115Candidate -Root $f0115GlobalFindingRoot
    $f0115GlobalCachedPaths = @(& git -C $f0115GlobalFindingRoot diff --cached --name-only | Sort-Object -Unique)
    $f0115ExpectedCachedPaths = @($p1F0115ScopeCorrectionFiles | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($f0115GlobalCachedPaths -join "|") -cne ($f0115ExpectedCachedPaths -join "|")) {
        throw "F-0115 post-anchor global-finding fixture no longer stages the exact twelve paths."
    }
    $f0115CandidateControlResult = Invoke-F0115PreCommitProcess -Root $f0115GlobalFindingRoot
    if (
        $f0115CandidateControlResult.ExitCode -ne 0 -or
        $f0115CandidateControlResult.OutputText -notmatch "p1ProgramGuardResult: pass" -or
        $f0115CandidateControlResult.OutputText -notmatch "p1F0115ScopeCorrectionAuthorization: approved_one_time"
    ) {
        throw "Exact F-0115 control fixture did not observably enter the candidate-valid path.`n$($f0115CandidateControlResult.OutputText)"
    }
    $f0115ParentEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md"
    & git -C $f0115GlobalFindingRoot update-index --assume-unchanged -- $f0115ParentEvidencePath
    if ($LASTEXITCODE -ne 0) { throw "Unable to isolate the F-0115 post-candidate review-contract fixture." }
    $f0115ParentEvidenceFullPath = Join-Path $f0115GlobalFindingRoot ($f0115ParentEvidencePath -replace "/", "\")
    $f0115ParentEvidence = Get-Content -LiteralPath $f0115ParentEvidenceFullPath -Raw -Encoding UTF8
    if ([regex]::Matches($f0115ParentEvidence, [regex]::Escape("targetTestsReviewed: true")).Count -ne 1) {
        throw "F-0115 post-candidate review-contract fixture requires one targetTestsReviewed marker."
    }
    Set-F0115FixtureFile -Root $f0115GlobalFindingRoot -Path $f0115ParentEvidencePath -Content $f0115ParentEvidence.Replace(
        "targetTestsReviewed: true",
        "targetTestsReviewed: false"
    )
    $f0115GlobalUnstagedPaths = @(& git -C $f0115GlobalFindingRoot diff --name-only)
    if ($LASTEXITCODE -ne 0 -or $f0115GlobalUnstagedPaths.Count -ne 0) {
        throw "F-0115 post-candidate review-contract fixture leaked an unstaged path into anchor validation."
    }
    $f0115GlobalCachedPathsAfterTamper = @(& git -C $f0115GlobalFindingRoot diff --cached --name-only | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($f0115GlobalCachedPathsAfterTamper -join "|") -cne ($f0115ExpectedCachedPaths -join "|")) {
        throw "F-0115 post-candidate review-contract fixture no longer stages the exact twelve paths after hidden tamper."
    }
    $f0115GlobalFindingResult = Invoke-F0115PreCommitProcess -Root $f0115GlobalFindingRoot
    if ($f0115GlobalFindingResult.ExitCode -eq 0 -or $f0115GlobalFindingResult.OutputText -notmatch "P1_PROGRAM_EVIDENCE_INCOMPLETE $([regex]::Escape($p1F0115ScopeCorrectionParentTaskId)) targetTestsReviewed: true") {
        throw "F-0115 post-candidate review-contract fixture did not fail on the intended global finding.`n$($f0115GlobalFindingResult.OutputText)"
    }
    if ($f0115GlobalFindingResult.OutputText -match "p1F0115ScopeCorrectionAuthorization: approved_one_time|p1TransitionScopeMode: transition_only") {
        throw "Failed F-0115 post-candidate global finding leaked authorization or transition-only output.`n$($f0115GlobalFindingResult.OutputText)"
    }

    $f0115ScalarDeltaRoot = New-F0115Fixture -Name "f0115-scalar-delta"
    Set-F0115Candidate -Root $f0115ScalarDeltaRoot
    $f0115ScalarQueuePath = Join-Path $f0115ScalarDeltaRoot "docs\04-agent-system\state\task-queue.yaml"
    $f0115ScalarQueue = (Get-Content -LiteralPath $f0115ScalarQueuePath -Raw -Encoding UTF8).Replace(
        "rollbackOrStopCondition: stop_if_generated_migration_source_would_be_executed_or_if_dependency_database_provider_runtime_p2_pr_force_push_deploy_or_other_finding_repair_is_required",
        "rollbackOrStopCondition: stop_if_generated_migration_source_would_be_executed"
    )
    Set-F0115FixtureFile -Root $f0115ScalarDeltaRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content $f0115ScalarQueue
    & git -C $f0115ScalarDeltaRoot add docs/04-agent-system/state/task-queue.yaml
    Assert-F0115FailsWith -Root $f0115ScalarDeltaRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "scalar queue delta"

    $f0115ListDeltaRoot = New-F0115Fixture -Name "f0115-list-delta"
    Set-F0115Candidate -Root $f0115ListDeltaRoot
    $f0115ListQueuePath = Join-Path $f0115ListDeltaRoot "docs\04-agent-system\state\task-queue.yaml"
    $f0115ListQueue = (Get-Content -LiteralPath $f0115ListQueuePath -Raw -Encoding UTF8).Replace(
        "      - unknown_result_remains_recoverable_and_is_never_reclassified_as_rejected",
        "      - unknown_result_is_rejected"
    )
    Set-F0115FixtureFile -Root $f0115ListDeltaRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content $f0115ListQueue
    & git -C $f0115ListDeltaRoot add docs/04-agent-system/state/task-queue.yaml
    Assert-F0115FailsWith -Root $f0115ListDeltaRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "list queue delta"

    $f0115OrderDeltaRoot = New-F0115Fixture -Name "f0115-order-delta"
    Set-F0115Candidate -Root $f0115OrderDeltaRoot
    $f0115OrderQueuePath = Join-Path $f0115OrderDeltaRoot "docs\04-agent-system\state\task-queue.yaml"
    $f0115OrderQueue = (Get-Content -LiteralPath $f0115OrderQueuePath -Raw -Encoding UTF8).Replace(
        "      - persistent_employee_import_command_idempotency_and_request_hmac`r`n      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity",
        "      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity`r`n      - persistent_employee_import_command_idempotency_and_request_hmac"
    ).Replace(
        "      - persistent_employee_import_command_idempotency_and_request_hmac`n      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity",
        "      - auth_user_auth_account_user_employee_current_org_auth_quota_atomicity`n      - persistent_employee_import_command_idempotency_and_request_hmac"
    )
    Set-F0115FixtureFile -Root $f0115OrderDeltaRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content $f0115OrderQueue
    & git -C $f0115OrderDeltaRoot add docs/04-agent-system/state/task-queue.yaml
    Assert-F0115FailsWith -Root $f0115OrderDeltaRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "ordered queue delta"

    $f0115MissingPathRoot = New-F0115Fixture -Name "f0115-missing-path"
    Set-F0115Candidate -Root $f0115MissingPathRoot
    & git -C $f0115MissingPathRoot restore --source=HEAD --staged --worktree scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
    if ($LASTEXITCODE -ne 0) { throw "Unable to prepare F-0115 missing-path fixture." }
    Assert-F0115FailsWith -Root $f0115MissingPathRoot -Phase pre_commit -Pattern "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION" -Label "missing hotfix path"

    $f0115ExtraPathRoot = New-F0115Fixture -Name "f0115-extra-path"
    Set-F0115Candidate -Root $f0115ExtraPathRoot
    Set-F0115FixtureFile -Root $f0115ExtraPathRoot -Path "f0115-extra.md" -Content "extra governance path"
    & git -C $f0115ExtraPathRoot add --sparse -- f0115-extra.md
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage the F-0115 sparse extra-path fixture." }
    $f0115ExtraCachedPaths = @(& git -C $f0115ExtraPathRoot diff --cached --name-only | Sort-Object -Unique)
    $f0115ExpectedExtraPaths = @($p1F0115ScopeCorrectionFiles + "f0115-extra.md" | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or $f0115ExtraCachedPaths.Count -ne 13 -or ($f0115ExtraCachedPaths -join "|") -cne ($f0115ExpectedExtraPaths -join "|")) {
        throw "F-0115 extra-path fixture must stage the exact twelve paths plus f0115-extra.md."
    }
    Assert-F0115FailsWith -Root $f0115ExtraPathRoot -Phase pre_commit -Pattern "P1_PROGRAM_ALLOWED_FILES_VIOLATION f0115-extra\.md" -Label "extra hotfix path"

    $f0115PartialStageRoot = New-F0115Fixture -Name "f0115-partial-stage"
    Set-F0115Candidate -Root $f0115PartialStageRoot
    Add-Content -LiteralPath (Join-Path $f0115PartialStageRoot "docs\04-agent-system\state\task-queue.yaml") -Value "# unstaged divergence" -Encoding UTF8
    Assert-F0115FailsWith -Root $f0115PartialStageRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID" -Label "partial staging"

    $f0115ProductPathRoot = New-F0115Fixture -Name "f0115-product-path"
    Set-F0115Candidate -Root $f0115ProductPathRoot
    $f0115ProductPath = "src/server/services/employee-account-service.ts"
    $f0115ProductText = Get-Content -LiteralPath (Join-Path $f0115ProductPathRoot ($f0115ProductPath -replace "/", "\")) -Raw -Encoding UTF8
    Set-F0115FixtureFile -Root $f0115ProductPathRoot -Path $f0115ProductPath -Content "$f0115ProductText`n// F-0115 product path must not enter governance commit"
    & git -C $f0115ProductPathRoot add src/server/services/employee-account-service.ts
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage the F-0115 product-path fixture." }
    Assert-F0115FailsWith -Root $f0115ProductPathRoot -Phase pre_commit -Pattern "P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE" -Label "product path"

    $f0115ReplayRoot = New-F0115Fixture -Name "f0115-replay"
    Set-F0115Candidate -Root $f0115ReplayRoot
    & git -C $f0115ReplayRoot commit --quiet -m "materialize F-0115 correction once"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit F-0115 replay parent." }
    foreach ($replayPath in $p1F0115ScopeCorrectionFiles) {
        $replayText = Get-Content -LiteralPath (Join-Path $f0115ReplayRoot ($replayPath -replace "/", "\")) -Raw -Encoding UTF8
        Set-F0115FixtureFile -Root $f0115ReplayRoot -Path $replayPath -Content "$replayText`n# replay attempt"
    }
    & git -C $f0115ReplayRoot add -- $p1F0115ScopeCorrectionFiles
    Assert-F0115FailsWith -Root $f0115ReplayRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_SCOPE_CORRECTION_(?:ALREADY_MATERIALIZED|CONTEXT_INVALID)" -Label "replay"

    $f0115SteadyDriftRoot = New-F0115Fixture -Name "f0115-ordinary-steady-drift" -Branch "codex/p1-rc02-employee-creation-atomicity"
    $f0115SteadyQueuePath = "docs/04-agent-system/state/task-queue.yaml"
    $f0115SteadyQueueText = Get-Content -LiteralPath (Join-Path $f0115SteadyDriftRoot ($f0115SteadyQueuePath -replace "/", "\")) -Raw -Encoding UTF8
    $f0115SteadyQueueText = $f0115SteadyQueueText.Replace(
        "      - tests/unit/admin-user-org-auth-ops-baseline.test.ts`n      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`n      - tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts",
        "      - tests/unit/admin-user-org-auth-ops-baseline.test.ts`n      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`n      - tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts`n      - tests/unit/ordinary-steady-task-drift.test.ts"
    )
    Set-F0115FixtureFile -Root $f0115SteadyDriftRoot -Path $f0115SteadyQueuePath -Content $f0115SteadyQueueText
    & git -C $f0115SteadyDriftRoot add -- $f0115SteadyQueuePath
    Assert-F0115FailsWith -Root $f0115SteadyDriftRoot -Phase pre_commit -Pattern "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION" -Label "ordinary steady-task scope drift"
    }

    $f0115Phase11PositiveRoot = New-F0115Phase11Fixture -Name "f0115-phase11-positive"
    Set-F0115Phase11Candidate -Root $f0115Phase11PositiveRoot
    $f0115Phase11PreCommitOutput = Invoke-F0115Phase11Guard -Root $f0115Phase11PositiveRoot -Phase pre_commit
    if (($f0115Phase11PreCommitOutput -join "`n") -notmatch "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time") {
        throw "F-0115 phase-11 pre-commit positive fixture did not authorize the exact candidate."
    }
    & git -C $f0115Phase11PositiveRoot commit --quiet -m "test F-0115 phase-11 exact transition"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit F-0115 phase-11 positive fixture." }
    & git -C $f0115Phase11PositiveRoot branch -M master
    if ($LASTEXITCODE -ne 0) { throw "Unable to move F-0115 phase-11 positive fixture to master." }
    $f0115Phase11PrePushOutput = Invoke-F0115Phase11Guard -Root $f0115Phase11PositiveRoot -Phase pre_push
    if (($f0115Phase11PrePushOutput -join "`n") -notmatch "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time") {
        throw "F-0115 phase-11 pre-push positive fixture did not authorize the exact candidate."
    }
    if (($f0115Phase11PrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: transition_only") {
        throw "F-0115 phase-11 pre-push positive fixture did not emit transition_only."
    }

    $f0115Phase11WrongBranchRoot = New-F0115Phase11Fixture -Name "f0115-phase11-wrong-branch" -Branch "codex/p1-f0115-phase11-wrong-branch"
    Set-F0115Phase11Candidate -Root $f0115Phase11WrongBranchRoot
    Assert-F0115Phase11FailsWith -Root $f0115Phase11WrongBranchRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID pre_commit" -Label "wrong branch"

    $f0115Phase11WrongStatusRoot = New-F0115Phase11Fixture -Name "f0115-phase11-wrong-status"
    Set-F0115Phase11Candidate -Root $f0115Phase11WrongStatusRoot
    $f0115Phase11WrongStatusQueuePath = "docs/04-agent-system/state/task-queue.yaml"
    $f0115Phase11WrongStatusQueue = Get-Content -LiteralPath (Join-Path $f0115Phase11WrongStatusRoot ($f0115Phase11WrongStatusQueuePath -replace "/", "\")) -Raw -Encoding UTF8
    $f0115Phase11WrongStatusPattern = "(?ms)(^  - id:\s*$([regex]::Escape($p1F0115Phase11ScopeCorrectionParentTaskId))\s*\r?\n.*?^    status:)\s*in_progress"
    $f0115Phase11WrongStatusCandidate = [regex]::Replace($f0115Phase11WrongStatusQueue, $f0115Phase11WrongStatusPattern, '${1} ready_for_closeout', 1)
    if ($f0115Phase11WrongStatusCandidate -ceq $f0115Phase11WrongStatusQueue) { throw "Unable to build F-0115 phase-11 wrong-status fixture." }
    Set-F0115FixtureFile -Root $f0115Phase11WrongStatusRoot -Path $f0115Phase11WrongStatusQueuePath -Content $f0115Phase11WrongStatusCandidate
    & git -C $f0115Phase11WrongStatusRoot add -- $f0115Phase11WrongStatusQueuePath
    Assert-F0115Phase11FailsWith -Root $f0115Phase11WrongStatusRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID task" -Label "wrong status"

    $f0115Phase11WrongBaseRoot = New-F0115Phase11Fixture -Name "f0115-phase11-wrong-base" -AdvanceBase
    Set-F0115Phase11Candidate -Root $f0115Phase11WrongBaseRoot
    Assert-F0115Phase11FailsWith -Root $f0115Phase11WrongBaseRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID pre_commit" -Label "wrong base"

    $f0115Phase11ElevenFileRoot = New-F0115Phase11Fixture -Name "f0115-phase11-eleven-files"
    Set-F0115Phase11Candidate -Root $f0115Phase11ElevenFileRoot
    $f0115Phase11OmittedPath = "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
    & git -C $f0115Phase11ElevenFileRoot reset --quiet HEAD -- $f0115Phase11OmittedPath
    & git -C $f0115Phase11ElevenFileRoot restore --worktree -- $f0115Phase11OmittedPath
    if (@(& git -C $f0115Phase11ElevenFileRoot diff --cached --name-only).Count -ne 11) { throw "F-0115 phase-11 eleven-file fixture is not exact." }
    Assert-F0115Phase11FailsWith -Root $f0115Phase11ElevenFileRoot -Phase pre_commit -Pattern "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION" -Label "eleven files"

    $f0115Phase11ThirteenFileRoot = New-F0115Phase11Fixture -Name "f0115-phase11-thirteen-files"
    Set-F0115Phase11Candidate -Root $f0115Phase11ThirteenFileRoot
    $f0115Phase11ExtraGovernancePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-extra-governance.md"
    Set-F0115FixtureFile -Root $f0115Phase11ThirteenFileRoot -Path $f0115Phase11ExtraGovernancePath -Content "# extra governance file"
    & git -C $f0115Phase11ThirteenFileRoot add -- $f0115Phase11ExtraGovernancePath
    if (@(& git -C $f0115Phase11ThirteenFileRoot diff --cached --name-only).Count -ne 13) { throw "F-0115 phase-11 thirteen-file fixture is not exact." }
    Assert-F0115Phase11FailsWith -Root $f0115Phase11ThirteenFileRoot -Phase pre_commit -Pattern "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION" -Label "thirteen files"

    $f0115Phase11ProductRoot = New-F0115Phase11Fixture -Name "f0115-phase11-extra-product"
    Set-F0115Phase11Candidate -Root $f0115Phase11ProductRoot
    $f0115Phase11ProductPath = "src/server/services/employee-account-service.ts"
    $f0115Phase11ProductText = Get-Content -LiteralPath (Join-Path $f0115Phase11ProductRoot ($f0115Phase11ProductPath -replace "/", "\")) -Raw -Encoding UTF8
    Set-F0115FixtureFile -Root $f0115Phase11ProductRoot -Path $f0115Phase11ProductPath -Content "$f0115Phase11ProductText`n// product path must not enter phase-11 governance"
    & git -C $f0115Phase11ProductRoot add -- $f0115Phase11ProductPath
    Assert-F0115Phase11FailsWith -Root $f0115Phase11ProductRoot -Phase pre_commit -Pattern "P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE" -Label "extra product path"

    $f0115Phase11QueueBytesRoot = New-F0115Phase11Fixture -Name "f0115-phase11-queue-extra-bytes"
    Set-F0115Phase11Candidate -Root $f0115Phase11QueueBytesRoot
    $f0115Phase11QueuePath = "docs/04-agent-system/state/task-queue.yaml"
    $f0115Phase11QueueBytes = Get-Content -LiteralPath (Join-Path $f0115Phase11QueueBytesRoot ($f0115Phase11QueuePath -replace "/", "\")) -Raw -Encoding UTF8
    Set-F0115FixtureFile -Root $f0115Phase11QueueBytesRoot -Path $f0115Phase11QueuePath -Content "$f0115Phase11QueueBytes`n# forbidden extra queue byte"
    & git -C $f0115Phase11QueueBytesRoot add -- $f0115Phase11QueuePath
    Assert-F0115Phase11FailsWith -Root $f0115Phase11QueueBytesRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_QUEUE_DELTA_INVALID" -Label "queue extra bytes"

    $f0115Phase11PartialStageRoot = New-F0115Phase11Fixture -Name "f0115-phase11-partial-stage"
    Set-F0115Phase11Candidate -Root $f0115Phase11PartialStageRoot
    $f0115Phase11PartialAudit = Get-Content -LiteralPath (Join-Path $f0115Phase11PartialStageRoot ($p1F0115Phase11ScopeCorrectionAuditPath -replace "/", "\")) -Raw -Encoding UTF8
    Set-F0115FixtureFile -Root $f0115Phase11PartialStageRoot -Path $p1F0115Phase11ScopeCorrectionAuditPath -Content "$f0115Phase11PartialAudit`nUnstaged divergence"
    Assert-F0115Phase11FailsWith -Root $f0115Phase11PartialStageRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID" -Label "partial staging"

    $f0115Phase11ReplayRoot = New-F0115Phase11Fixture -Name "f0115-phase11-approval-replay"
    Set-F0115Phase11Candidate -Root $f0115Phase11ReplayRoot
    & git -C $f0115Phase11ReplayRoot commit --quiet -m "materialize F-0115 phase-11 approval once"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit F-0115 phase-11 replay parent." }
    foreach ($replayPath in $p1F0115Phase11ScopeCorrectionFiles) {
        $replayText = Get-Content -LiteralPath (Join-Path $f0115Phase11ReplayRoot ($replayPath -replace "/", "\")) -Raw -Encoding UTF8
        Set-F0115FixtureFile -Root $f0115Phase11ReplayRoot -Path $replayPath -Content "$replayText`n# approval replay attempt"
    }
    & git -C $f0115Phase11ReplayRoot add -- $p1F0115Phase11ScopeCorrectionFiles
    Assert-F0115Phase11FailsWith -Root $f0115Phase11ReplayRoot -Phase pre_commit -Pattern "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_ALREADY_MATERIALIZED" -Label "approval replay"

    $f0115Phase11MultiCommitRoot = New-F0115Phase11Fixture -Name "f0115-phase11-multi-commit"
    Set-F0115Phase11Candidate -Root $f0115Phase11MultiCommitRoot
    & git -C $f0115Phase11MultiCommitRoot reset --quiet HEAD
    & git -C $f0115Phase11MultiCommitRoot add -- "docs/04-agent-system/state/task-queue.yaml"
    & git -C $f0115Phase11MultiCommitRoot commit --quiet -m "split F-0115 phase-11 queue delta"
    if ($LASTEXITCODE -ne 0) { throw "Unable to create first F-0115 phase-11 split commit." }
    $f0115Phase11RemainingFiles = @($p1F0115Phase11ScopeCorrectionFiles | Where-Object { $_ -ne "docs/04-agent-system/state/task-queue.yaml" })
    & git -C $f0115Phase11MultiCommitRoot add -- $f0115Phase11RemainingFiles
    & git -C $f0115Phase11MultiCommitRoot commit --quiet -m "split F-0115 phase-11 governance artifacts"
    if ($LASTEXITCODE -ne 0) { throw "Unable to create second F-0115 phase-11 split commit." }
    & git -C $f0115Phase11MultiCommitRoot branch -M master
    Assert-F0115Phase11FailsWith -Root $f0115Phase11MultiCommitRoot -Phase pre_push -Pattern "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID pre_push" -Label "multi-commit transition"

    $transitionRoot = Write-CaseFiles -Name "task-transition" -StateText $baseState -QueueText $baseQueue
    $transitionRemote = Join-Path $smokeRoot "transition-remote.git"
    & git -C $transitionRoot init -b master *> $null
    & git -C $transitionRoot config user.name "P1 Transition Smoke"
    & git -C $transitionRoot config user.email "p1-transition-smoke@example.invalid"
    & git -C $transitionRoot config core.autocrlf false
    & git -C $transitionRoot add .
    & git -C $transitionRoot commit -m "bootstrap parent" *> $null
    & git init --bare $transitionRemote *> $null
    & git -C $transitionRoot remote add origin $transitionRemote
    & git -C $transitionRoot push --quiet -u origin master 2>$null
    & git -C $transitionRoot switch --quiet -c codex/transition-scope 2>$null

    $transitionTask = "p1-remediation-transition-fixture-2026-07-16"
    $oldCheckpointBlock = @"
  closeoutCheckpoints:
    $bootstrapTask`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
currentTask:
  id: $bootstrapTask
  status: in_progress
"@
    $newCheckpointBlock = @"
  closeoutCheckpoints:
    $bootstrapTask`:
      taskCommit: pass
      masterMerge: pass
      originMasterSync: pass
      worktreeCleanup: pass
      shortBranchCleanup: pass
    $transitionTask`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
currentTask:
  id: $transitionTask
  status: in_progress
"@
    $transitionState = $baseState.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $transitionTask").Replace("    - $bootstrapTask`n  completedTaskIds: []", "    - $bootstrapTask`n    - $transitionTask`n  completedTaskIds:`n    - $bootstrapTask").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $transitionTask`: in_progress").Replace($oldCheckpointBlock, $newCheckpointBlock)

    $transitionTaskBlock = @"
  - id: $transitionTask
    status: in_progress
    taskKind: remediation
    executionStage: scope_frozen
    branch: codex/transition-scope
    worktreePath: $transitionRoot
    executionProfile: R3
    authorizationSource: $authorizationPath
    candidateRootCauseCluster: P1-RC-01
    findingIds:
      - P1-001
    authorityPath: identity writer
    businessInvariant: unique identity
    adversarialFailureMode: duplicate identity
    rollbackOrStopCondition: stop on requirement conflict
    reviewMode: evidence_two_rounds
    designPath: docs/superpowers/specs/next-design.md
    planPath: next-plan.md
    evidencePath: next-evidence.md
    auditReviewPath: next-audit.md
    allowedFiles:
      - state.yaml
      - queue.yaml
      - next-plan.md
      - next-evidence.md
      - next-audit.md
      - docs/superpowers/specs/next-design.md
      - src/**
      - tests/**
    blockedFiles:
      - package.json
      - pnpm-lock.yaml
    capabilities:
      dependencyIntroduction: blocked_without_fresh_approval
      schemaMigration: blocked_without_fresh_approval
      databaseMutation: blocked_without_fresh_approval
      providerCall: blocked_without_fresh_approval
      runtimeAcceptance: blocked_out_of_program
      browserRuntimeValidation: blocked_out_of_program
      p2Implementation: blocked_out_of_program
      stagingProdDeploy: blocked_requires_fresh_user_approval
      forcePush: blocked
      pr: blocked
      costCalibrationGate: blocked
    closeoutPolicy:
      authorizationSource: $authorizationPath
      localCommit:
        approved: true
      fastForwardMerge:
        approved: true
        targetBranch: master
      push:
        approved: true
        target: origin/master
      cleanup:
        deleteShortBranch: true
"@
    $transitionQueue = $baseQueue.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $transitionTask").Replace("    - $bootstrapTask`n  completedTaskIds: []", "    - $bootstrapTask`n    - $transitionTask`n  completedTaskIds:`n    - $bootstrapTask").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $transitionTask`: in_progress").Replace("  - id: $bootstrapTask`n    status: in_progress", "  - id: $bootstrapTask`n    status: closed").Replace("standingAuthorization:", "$transitionTaskBlock`nstandingAuthorization:")

    $scopeEvidence = @"
# Scope Evidence

- Evidence status: scope_frozen
- Result: pass

## Requirement Mapping Result

pass

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## JIT Revalidation Result

Result: pass

## Scope Freeze

Result: pass
"@
    $scopeAudit = @"
# Scope Audit

## Round 1 — JIT root cause

Result: pass

## Round 2 — Scope and approval

Result: pass

## Transition Disposition

Decision: APPROVE_SCOPE
"@
    Set-Content -LiteralPath (Join-Path $transitionRoot "state.yaml") -Value $transitionState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "next-plan.md") -Value "# Next plan`n" -Encoding UTF8
    New-Item -ItemType Directory -Path (Join-Path $transitionRoot "docs/superpowers/specs") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $transitionRoot "docs/superpowers/specs/next-design.md") -Value "# Approved design`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "next-evidence.md") -Value $scopeEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "next-audit.md") -Value $scopeAudit -Encoding UTF8
    & git -C $transitionRoot add state.yaml queue.yaml next-plan.md next-evidence.md next-audit.md docs/superpowers/specs/next-design.md

    $aliasTransitionQueue = $transitionQueue.Replace("evidencePath: next-evidence.md", "evidencePath: subdir/../evidence.md")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $aliasTransitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $aliasFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $aliasFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TASK_ARTIFACT_PATH_REUSED") { throw }
    }
    if (-not $aliasFailed) { throw "Predecessor artifact alias fixture unexpectedly passed." }

    $mutatedParentQueue = $transitionQueue.Replace("      - audit.md", "      - audit.md`n      - predecessor-extra.md")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $mutatedParentQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $parentContractFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $parentContractFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PARENT_TASK_CONTRACT_CHANGED") { throw }
    }
    if (-not $parentContractFailed) { throw "Parent task contract mutation fixture unexpectedly passed." }

    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml

    $fakeBranchQueue = $transitionQueue.Replace("branch: codex/transition-scope", "branch: codex/fake-transition-scope")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $fakeBranchQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $fakeBranchFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $fakeBranchFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TASK_BRANCH_BINDING_MISMATCH") { throw }
    }
    if (-not $fakeBranchFailed) { throw "Fake current-task branch fixture unexpectedly passed." }

    $fakeWorktreePath = Join-Path $transitionRoot "fake-worktree"
    $fakeWorktreeQueue = $transitionQueue.Replace("worktreePath: $transitionRoot", "worktreePath: $fakeWorktreePath")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $fakeWorktreeQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $fakeWorktreeFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $fakeWorktreeFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TASK_WORKTREE_BINDING_MISMATCH") { throw }
    }
    if (-not $fakeWorktreeFailed) { throw "Fake current-task worktree fixture unexpectedly passed." }

    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    & git -C $transitionRoot branch codex/bootstrap-fixture master
    $branchCleanupFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $branchCleanupFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PREDECESSOR_BRANCH_NOT_CLEANED") { throw }
    }
    if (-not $branchCleanupFailed) { throw "Residual predecessor branch fixture unexpectedly passed." }
    & git -C $transitionRoot branch -D codex/bootstrap-fixture *> $null

    $residualWorktreePath = Join-Path $transitionRoot "bootstrap-worktree-fixture"
    New-Item -ItemType Directory -Path $residualWorktreePath -Force | Out-Null
    $worktreeCleanupFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $worktreeCleanupFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PREDECESSOR_WORKTREE_NOT_CLEANED") { throw }
    }
    if (-not $worktreeCleanupFailed) { throw "Residual predecessor worktree fixture unexpectedly passed." }
    Remove-Item -LiteralPath $residualWorktreePath -Recurse -Force

    Set-Content -LiteralPath (Join-Path $transitionRoot "undeclared-design.md") -Value "# Undeclared design`n" -Encoding UTF8
    & git -C $transitionRoot add undeclared-design.md
    $undeclaredDesignFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $undeclaredDesignFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_FILE_SCOPE_INVALID undeclared-design.md") { throw }
    }
    if (-not $undeclaredDesignFailed) { throw "Undeclared design artifact fixture unexpectedly passed." }
    & git -C $transitionRoot reset -- undeclared-design.md *> $null
    Remove-Item -LiteralPath (Join-Path $transitionRoot "undeclared-design.md") -Force

    $productDesignQueue = $transitionQueue.Replace("designPath: docs/superpowers/specs/next-design.md", "designPath: src/hidden-transition.ts")
    New-Item -ItemType Directory -Path (Join-Path $transitionRoot "src") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $transitionRoot "src/hidden-transition.ts") -Value "export {};`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $productDesignQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml src/hidden-transition.ts
    $productDesignFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $productDesignFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_DESIGN_PATH_INVALID src/hidden-transition.ts") { throw }
    }
    if (-not $productDesignFailed) { throw "Product path declared as designPath unexpectedly passed." }
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    & git -C $transitionRoot reset -- src/hidden-transition.ts *> $null
    Remove-Item -LiteralPath (Join-Path $transitionRoot "src") -Recurse -Force

    $nestedDesignPath = "docs/superpowers/specs/nested/hidden-design.md"
    $nestedDesignQueue = $transitionQueue.Replace("designPath: docs/superpowers/specs/next-design.md", "designPath: $nestedDesignPath")
    New-Item -ItemType Directory -Path (Join-Path $transitionRoot "docs/superpowers/specs/nested") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $transitionRoot $nestedDesignPath) -Value "# Nested design`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $nestedDesignQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml $nestedDesignPath
    $nestedDesignFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $nestedDesignFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_DESIGN_PATH_INVALID $([regex]::Escape($nestedDesignPath))") { throw }
    }
    if (-not $nestedDesignFailed) { throw "Nested designPath unexpectedly passed." }
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    & git -C $transitionRoot reset -- $nestedDesignPath *> $null
    Remove-Item -LiteralPath (Join-Path $transitionRoot "docs/superpowers/specs/nested") -Recurse -Force

    foreach ($invalidDesignPath in @("docs/superpowers/specs/../../src/hidden.ts", "D:/outside/spec.md")) {
        $invalidDesignQueue = $transitionQueue.Replace("designPath: docs/superpowers/specs/next-design.md", "designPath: $invalidDesignPath")
        Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $invalidDesignQueue -Encoding UTF8
        & git -C $transitionRoot add queue.yaml
        $invalidDesignFailed = $false
        try {
            & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
        } catch {
            $invalidDesignFailed = $true
            if ($_.Exception.Message -notmatch "P1_PROGRAM_DESIGN_PATH_INVALID") { throw }
        }
        if (-not $invalidDesignFailed) { throw "Invalid designPath unexpectedly passed: $invalidDesignPath" }
    }
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml

    $transitionOutput = @(& $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    if (($transitionOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Positive task-transition fixture failed." }
    & git -C $transitionRoot commit -m "freeze next task scope" *> $null
    $transitionHead = ((& git -C $transitionRoot rev-parse HEAD) -join "").Trim()
    $transitionOrigin = ((& git -C $transitionRoot rev-parse origin/master) -join "").Trim()
    $transitionOriginUrl = ((& git -C $transitionRoot remote get-url origin) -join "").Trim()
    $transitionUpdate = "refs/heads/master $transitionHead refs/heads/master $transitionOrigin"
    $transitionPrePushOutput = @(& $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $transitionOriginUrl -PushUpdateLines $transitionUpdate -SkipExternalIntegrityChecks)
    if (($transitionPrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: transition_only") { throw "Governance-only task transition did not emit transition-only scope mode." }
    & git -C $transitionRoot push --quiet origin HEAD:master 2>$null

    $washedQueue = $transitionQueue.Replace("      - src/**", "      - src/**`n      - src/expanded/**")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $washedQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $washFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $washFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION") { throw }
    }
    if (-not $washFailed) { throw "Two-step scope laundering fixture unexpectedly passed." }

    $pendingParentRoot = Write-CaseFiles -Name "pending-parent-transition" -StateText $baseState -QueueText $baseQueue
    $pendingParentRemote = Join-Path $smokeRoot "pending-parent-remote.git"
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "evidence.md") -Value $baseEvidence.Replace("Result: pass", "Pending.") -Encoding UTF8
    & git -C $pendingParentRoot init -b master *> $null
    & git -C $pendingParentRoot config user.name "P1 Pending Parent Smoke"
    & git -C $pendingParentRoot config user.email "p1-pending-parent-smoke@example.invalid"
    & git -C $pendingParentRoot config core.autocrlf false
    & git -C $pendingParentRoot add .
    & git -C $pendingParentRoot commit -m "pending bootstrap parent" *> $null
    & git init --bare $pendingParentRemote *> $null
    & git -C $pendingParentRoot remote add origin $pendingParentRemote
    & git -C $pendingParentRoot push --quiet -u origin master 2>$null
    & git -C $pendingParentRoot switch --quiet -c codex/transition-scope 2>$null
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "evidence.md") -Value $baseEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "state.yaml") -Value $transitionState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "queue.yaml") -Value $transitionQueue.Replace("worktreePath: $transitionRoot", "worktreePath: $pendingParentRoot") -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "next-plan.md") -Value "# Next plan`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "next-evidence.md") -Value $scopeEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "next-audit.md") -Value $scopeAudit -Encoding UTF8
    & git -C $pendingParentRoot add state.yaml queue.yaml next-plan.md next-evidence.md next-audit.md
    $pendingParentFailed = $false
    try {
        & $guardPath -RepositoryRoot $pendingParentRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $pendingParentRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $pendingParentFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PREDECESSOR_REVIEW_NOT_FINAL") { throw }
    }
    if (-not $pendingParentFailed) { throw "Pending parent commit laundering fixture unexpectedly passed." }

    $closeoutRoot = Write-CaseFiles -Name "same-task-closeout" -StateText $baseState -QueueText $baseQueue
    $closeoutParentQueue = $baseQueue.Replace("worktreePath: bootstrap-worktree-fixture", "worktreePath: $closeoutRoot").Replace("      - audit.md`n    blockedFiles:", "      - audit.md`n`n    blockedFiles:")
    Set-Content -LiteralPath (Join-Path $closeoutRoot "queue.yaml") -Value $closeoutParentQueue -Encoding UTF8
    & git -C $closeoutRoot init -b master *> $null
    & git -C $closeoutRoot config user.name "P1 Closeout Smoke"
    & git -C $closeoutRoot config user.email "p1-closeout-smoke@example.invalid"
    & git -C $closeoutRoot config core.autocrlf false
    & git -C $closeoutRoot add .
    & git -C $closeoutRoot commit -m "create active bootstrap task" *> $null
    & git -C $closeoutRoot switch --quiet -c codex/bootstrap-fixture 2>$null
    $closeoutState = $baseState.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutState = [regex]::Replace($closeoutState, '(?ms)(^currentTask:\r?\n(?:^  .*\r?\n)*?^  status:)\s+in_progress\s*$', '${1} ready_for_closeout')
    $closeoutQueue = $closeoutParentQueue.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutQueue = [regex]::Replace($closeoutQueue, "(?ms)(^  - id:\s+$([regex]::Escape($bootstrapTask))\s*\r?\n(?:^    .*\r?\n)*?^    status:)\s+in_progress\s*$", '${1} ready_for_closeout')
    Set-Content -LiteralPath (Join-Path $closeoutRoot "state.yaml") -Value $closeoutState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutRoot "queue.yaml") -Value $closeoutQueue -Encoding UTF8
    & git -C $closeoutRoot add state.yaml queue.yaml
    $closeoutOutput = @(& $guardPath -RepositoryRoot $closeoutRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    if (($closeoutOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Same-task closeout fixture failed." }

    $launderedCloseoutQueue = $closeoutQueue.Replace("      - audit.md", "      - audit.md`n      - expanded.md")
    Set-Content -LiteralPath (Join-Path $closeoutRoot "queue.yaml") -Value $launderedCloseoutQueue -Encoding UTF8
    & git -C $closeoutRoot add queue.yaml
    $closeoutLaunderingFailed = $false
    try {
        & $guardPath -RepositoryRoot $closeoutRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $closeoutLaunderingFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_CLOSEOUT_PROJECTION_CHANGED") { throw }
    }
    if (-not $closeoutLaunderingFailed) { throw "Same-task closeout scope laundering fixture unexpectedly passed." }

    $closeoutPushRoot = Write-CaseFiles -Name "same-task-closeout-pre-push" -StateText $baseState -QueueText $baseQueue
    $closeoutPushRemote = Join-Path $smokeRoot "same-task-closeout-pre-push-origin.git"
    $closeoutPushParentQueue = $baseQueue.Replace("worktreePath: bootstrap-worktree-fixture", "worktreePath: $closeoutPushRoot").Replace("      - audit.md", "      - audit.md`n      - src/allowed.ts`n")
    $closeoutPushParentQueue = [regex]::Replace($closeoutPushParentQueue, '(?m)^      - src/\*\*\r?\n', '')
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $closeoutPushParentQueue -Encoding UTF8
    & git -C $closeoutPushRoot init -b master *> $null
    & git -C $closeoutPushRoot config user.name "P1 Closeout Pre-push Smoke"
    & git -C $closeoutPushRoot config user.email "p1-closeout-pre-push-smoke@example.invalid"
    & git -C $closeoutPushRoot config core.autocrlf false
    & git -C $closeoutPushRoot add .
    & git -C $closeoutPushRoot commit -m "materialize active implementation task" *> $null
    & git init --bare $closeoutPushRemote *> $null
    & git -C $closeoutPushRoot remote add origin $closeoutPushRemote
    & git -C $closeoutPushRoot push --quiet -u origin master 2>$null
    & git -C $closeoutPushRoot switch --quiet -c codex/bootstrap-fixture 2>$null
    New-Item -ItemType Directory -Path (Join-Path $closeoutPushRoot "src") | Out-Null
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "src/allowed.ts") -Value "export const closeoutProbe = true;" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "evidence.md") -Value "$baseEvidence`nImplementation validation: pass`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "audit.md") -Value "$baseAudit`nImplementation review: pass`n" -Encoding UTF8
    & git -C $closeoutPushRoot add src/allowed.ts evidence.md audit.md
    & git -C $closeoutPushRoot commit -m "implement allowed task change" *> $null
    $closeoutPushImplementationHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $closeoutPushState = $baseState.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutPushState = [regex]::Replace($closeoutPushState, '(?ms)(^currentTask:\r?\n(?:^  .*\r?\n)*?^  status:)\s+in_progress\s*$', '${1} ready_for_closeout')
    $closeoutPushQueue = $closeoutPushParentQueue.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutPushQueue = [regex]::Replace($closeoutPushQueue, "(?ms)(^  - id:\s+$([regex]::Escape($bootstrapTask))\s*\r?\n(?:^    .*\r?\n)*?^    status:)\s+in_progress\s*$", '${1} ready_for_closeout')
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $closeoutPushState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $closeoutPushQueue -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml
    & git -C $closeoutPushRoot commit -m "mark task ready for closeout" *> $null
    $closeoutPushHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $closeoutPushOrigin = ((& git -C $closeoutPushRoot rev-parse origin/master) -join "").Trim()
    $closeoutPushOriginUrl = ((& git -C $closeoutPushRoot remote get-url origin) -join "").Trim()
    $closeoutPushUpdate = "refs/heads/master $closeoutPushHead refs/heads/master $closeoutPushOrigin"
    $closeoutPushOutput = @(& $guardPath -RepositoryRoot $closeoutPushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutPushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $closeoutPushOriginUrl -PushUpdateLines $closeoutPushUpdate -SkipExternalIntegrityChecks)
    if (($closeoutPushOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Same-task closeout pre-push fixture failed." }
    if (($closeoutPushOutput -join "`n") -notmatch "p1TransitionScopeMode: standard") { throw "Same-task closeout fixture incorrectly emitted transition-only scope mode." }

    & git -C $closeoutPushRoot switch --quiet master 2>$null
    & git -C $closeoutPushRoot branch -D codex/bootstrap-fixture *> $null
    & git -C $closeoutPushRoot switch --quiet -c codex/bootstrap-fixture $closeoutPushImplementationHead 2>$null
    $launderedCloseoutPushQueue = $closeoutPushQueue.Replace("      - audit.md", "      - audit.md`n      - expanded.md")
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $closeoutPushState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $launderedCloseoutPushQueue -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml
    & git -C $closeoutPushRoot commit -m "attempt closeout scope laundering" *> $null
    $launderedCloseoutPushHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $launderedCloseoutPushUpdate = "refs/heads/master $launderedCloseoutPushHead refs/heads/master $closeoutPushOrigin"
    $closeoutPushLaunderingFailed = $false
    try {
        & $guardPath -RepositoryRoot $closeoutPushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutPushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $closeoutPushOriginUrl -PushUpdateLines $launderedCloseoutPushUpdate -SkipExternalIntegrityChecks
    } catch {
        $closeoutPushLaunderingFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_CLOSEOUT_PROJECTION_CHANGED") { throw }
    }
    if (-not $closeoutPushLaunderingFailed) { throw "Same-task closeout pre-push scope laundering fixture unexpectedly passed." }

    & git -C $closeoutPushRoot switch --quiet master 2>$null
    & git -C $closeoutPushRoot branch -D codex/bootstrap-fixture *> $null
    & git -C $closeoutPushRoot switch --quiet -c codex/bootstrap-fixture origin/master 2>$null
    $intermediateLaunderedState = $baseState.Replace("      taskCommit: pending", "      taskCommit: pass").Replace("standingAuthorization:", "historicalMarker: changed`nstandingAuthorization:")
    $intermediateLaunderedQueue = $closeoutPushParentQueue.Replace("      - src/allowed.ts", "      - src/allowed.ts`n      - src/expanded.ts").Replace("dependencyIntroduction: blocked_without_fresh_approval", "dependencyIntroduction: blocked_different_reason")
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $intermediateLaunderedState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $intermediateLaunderedQueue -Encoding UTF8
    New-Item -ItemType Directory -Path (Join-Path $closeoutPushRoot "src") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "src/expanded.ts") -Value "export const expandedScope = true;" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "evidence.md") -Value "$baseEvidence`nIntermediate implementation validation: pass`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "audit.md") -Value "$baseAudit`nIntermediate implementation review: pass`n" -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml src/expanded.ts evidence.md audit.md
    & git -C $closeoutPushRoot commit -m "attempt intermediate scope laundering" *> $null
    $intermediateCloseoutState = $intermediateLaunderedState.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $intermediateCloseoutState = [regex]::Replace($intermediateCloseoutState, '(?ms)(^currentTask:\r?\n(?:^  .*\r?\n)*?^  status:)\s+in_progress\s*$', '${1} ready_for_closeout')
    $intermediateCloseoutQueue = $intermediateLaunderedQueue.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $intermediateCloseoutQueue = [regex]::Replace($intermediateCloseoutQueue, "(?ms)(^  - id:\s+$([regex]::Escape($bootstrapTask))\s*\r?\n(?:^    .*\r?\n)*?^    status:)\s+in_progress\s*$", '${1} ready_for_closeout')
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $intermediateCloseoutState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $intermediateCloseoutQueue -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml
    & git -C $closeoutPushRoot commit -m "add pure closeout tip after laundering" *> $null
    $intermediateCloseoutHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $intermediateCloseoutUpdate = "refs/heads/master $intermediateCloseoutHead refs/heads/master $closeoutPushOrigin"
    $intermediateLaunderingFailed = $false
    try {
        & $guardPath -RepositoryRoot $closeoutPushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutPushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $closeoutPushOriginUrl -PushUpdateLines $intermediateCloseoutUpdate -SkipExternalIntegrityChecks
    } catch {
        $intermediateLaunderingFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_CLOSEOUT_RANGE_PROJECTION_CHANGED") { throw }
    }
    if (-not $intermediateLaunderingFailed) { throw "Intermediate same-task closeout scope laundering fixture unexpectedly passed." }

    $moduleHotfixRoot = Join-Path $smokeRoot "f0115-module-precommit-hotfix"
    $moduleHotfixBaseSha = "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
    $moduleHotfixBranch = "codex/p1-remediation-efficiency-mechanism-tuning"
    $moduleHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-remediation-efficiency-mechanism-tuning-authorization.md"
    $moduleHotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
    $moduleHotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
    $moduleHotfixFiles = @(
        "docs/04-agent-system/sop/p1-remediation-efficiency-loop.md",
        $moduleHotfixAuthorizationPath,
        "docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md",
        $moduleHotfixEvidencePath,
        $moduleHotfixAuditPath,
        "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
        "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
    )
    & git -c core.longpaths=true clone --quiet --shared --no-checkout $repositoryRoot $moduleHotfixRoot
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone F-0115 Module hotfix fixture." }
    & git -C $moduleHotfixRoot config user.name "P1 F-0115 Module Hotfix Smoke"
    & git -C $moduleHotfixRoot config user.email "p1-f0115-module-hotfix-smoke@example.invalid"
    & git -C $moduleHotfixRoot config core.autocrlf false
    & git -C $moduleHotfixRoot config core.longpaths true
    & git -C $moduleHotfixRoot config core.safecrlf false
    & git -C $moduleHotfixRoot sparse-checkout init --no-cone
    if ($LASTEXITCODE -ne 0) { throw "Unable to initialize F-0115 Module hotfix sparse fixture." }
    $moduleHotfixSparsePatterns = @(
        "/.gitattributes",
        "/docs/04-agent-system/",
        "/docs/05-execution-logs/acceptance/2026-07-16-p1-*",
        "/docs/05-execution-logs/acceptance/2026-07-17-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-16-p1-*",
        "/docs/05-execution-logs/task-plans/2026-07-17-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-16-p1-*",
        "/docs/05-execution-logs/evidence/2026-07-17-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-15-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-16-p1-*",
        "/docs/05-execution-logs/audits-reviews/2026-07-17-p1-*",
        "/scripts/agent-system/"
    )
    & git -C $moduleHotfixRoot sparse-checkout set --no-cone $moduleHotfixSparsePatterns
    if ($LASTEXITCODE -ne 0) { throw "Unable to configure F-0115 Module hotfix sparse fixture." }
    & git -C $moduleHotfixRoot switch --quiet -C $moduleHotfixBranch $moduleHotfixBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Unable to materialize F-0115 Module hotfix sparse fixture." }
    & git -C $moduleHotfixRoot update-ref refs/remotes/origin/master $moduleHotfixBaseSha
    foreach ($scriptFile in @($moduleHotfixFiles | Where-Object { $_ -like "scripts/*" })) {
        Add-Content -LiteralPath (Join-Path $moduleHotfixRoot ($scriptFile -replace "/", "\")) -Value "# F-0115 Module hotfix smoke marker" -Encoding UTF8
    }
    $authorizationFileList = @($moduleHotfixFiles | ForEach-Object { "- ``$_``" }) -join "`n"
    $moduleHotfixAuthorization = @(
        "# F-0115 Module Hotfix Authorization",
        "",
        "Status: approved",
        "Human approval source: current user message",
        "Task ID: p1-remediation-efficiency-mechanism-tuning-2026-07-17",
        "Parent task: p1-remediation-rc-02-employee-creation-atomicity-2026-07-16",
        "Base: $moduleHotfixBaseSha",
        "Branch: $moduleHotfixBranch",
        "",
        "otherInProgressShaDrift: hard_block",
        "hookBypass: prohibited",
        "qualityGateReduction: prohibited",
        "",
        "## Exact Files",
        "",
        $authorizationFileList
    ) -join "`n"
    Set-F0115FixtureFile -Root $moduleHotfixRoot -Path "docs/04-agent-system/sop/p1-remediation-efficiency-loop.md" -Content "# P1 Efficiency SOP`n"
    Set-F0115FixtureFile -Root $moduleHotfixRoot -Path $moduleHotfixAuthorizationPath -Content $moduleHotfixAuthorization
    Set-F0115FixtureFile -Root $moduleHotfixRoot -Path "docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md" -Content "# Plan`n`nCost Calibration Gate remains blocked."
    $moduleHotfixEvidence = @(
        "# Evidence", "", "## Reading Evidence", "status: complete", "conflictsFound: false",
        "targetSourceReviewed: true", "targetTestsReviewed: true", "analogousImplementationReviewed: true",
        "Cost Calibration Gate remains blocked.", "",
        "## Root-Cause Reproduction", "Result: pass", "", "## TDD Evidence", "Result: pass", "",
        "## Validation Results", "Result: pass"
    ) -join "`n"
    Set-F0115FixtureFile -Root $moduleHotfixRoot -Path $moduleHotfixEvidencePath -Content $moduleHotfixEvidence
    $moduleHotfixAudit = @(
        "# Audit", "", "## Round 1", "Result: pass", "", "## Round 2", "Result: pass", "",
        "## Decision", "Decision: APPROVE"
    ) -join "`n"
    Set-F0115FixtureFile -Root $moduleHotfixRoot -Path $moduleHotfixAuditPath -Content $moduleHotfixAudit
    & git -C $moduleHotfixRoot add -- $moduleHotfixFiles

    Set-F0115FixtureFile -Root $moduleHotfixRoot -Path $moduleHotfixAuditPath -Content "$moduleHotfixAudit`n## Round 2`nResult: pass`nResult: fail`n## Decision`nDecision: REJECT"
    & git -C $moduleHotfixRoot add -- $moduleHotfixAuditPath
    $p1ContradictionFailed = $false
    try {
        & $guardPath -RepositoryRoot $moduleHotfixRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $p1ContradictionFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_ARTIFACT_CONTRADICTION audit") { throw }
    }
    if (-not $p1ContradictionFailed) { throw "P1 guard accepted a contradictory F-0115 Module hotfix audit." }
    $moduleContradictionFailed = $false
    Push-Location $moduleHotfixRoot
    try {
        try {
            & $modulePreCommitGuardPath
        } catch {
            $moduleContradictionFailed = $true
            if ($_.Exception.Message -notmatch "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_ARTIFACT_CONTRADICTION audit") { throw }
        }
    } finally {
        Pop-Location
    }
    if (-not $moduleContradictionFailed) { throw "Module pre-commit guard accepted a contradictory F-0115 Module hotfix audit." }
    Set-F0115FixtureFile -Root $moduleHotfixRoot -Path $moduleHotfixAuditPath -Content $moduleHotfixAudit
    & git -C $moduleHotfixRoot add -- $moduleHotfixAuditPath

    $moduleHotfixPreCommitOutput = @(& $guardPath -RepositoryRoot $moduleHotfixRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    if (($moduleHotfixPreCommitOutput -join "`n") -notmatch "p1F0115ModulePrecommitHotfixAuthorization: approved_one_time") {
        throw "F-0115 Module hotfix exact pre-commit candidate was not authorized."
    }
    & git -C $moduleHotfixRoot commit --quiet -m "test exact F-0115 Module hotfix"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit F-0115 Module hotfix fixture." }
    & git -C $moduleHotfixRoot branch -M master
    $moduleHotfixHeadSha = ((& git -C $moduleHotfixRoot rev-parse HEAD) -join "").Trim()
    $moduleHotfixOriginUrl = ((& git -C $moduleHotfixRoot remote get-url origin) -join "").Trim()
    $moduleHotfixUpdateLine = "refs/heads/master $moduleHotfixHeadSha refs/heads/master $moduleHotfixBaseSha"
    $moduleHotfixPrePushOutput = @(& $guardPath -RepositoryRoot $moduleHotfixRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $moduleHotfixOriginUrl -PushUpdateLines $moduleHotfixUpdateLine -SkipExternalIntegrityChecks)
    if (($moduleHotfixPrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: transition_only") {
        throw "F-0115 Module hotfix exact pre-push candidate was not transition-only."
    }
    Add-Content -LiteralPath (Join-Path $moduleHotfixRoot ($moduleHotfixEvidencePath -replace "/", "\")) -Value "replay" -Encoding UTF8
    & git -C $moduleHotfixRoot add -- $moduleHotfixEvidencePath
    & git -C $moduleHotfixRoot commit --quiet -m "attempt F-0115 Module hotfix replay"
    $moduleHotfixReplaySha = ((& git -C $moduleHotfixRoot rev-parse HEAD) -join "").Trim()
    $moduleHotfixReplayUpdate = "refs/heads/master $moduleHotfixReplaySha refs/heads/master $moduleHotfixBaseSha"
    $moduleHotfixReplayFailed = $false
    try {
        & $guardPath -RepositoryRoot $moduleHotfixRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $moduleHotfixOriginUrl -PushUpdateLines $moduleHotfixReplayUpdate -SkipExternalIntegrityChecks
    } catch {
        $moduleHotfixReplayFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_(?:CONTEXT_INVALID|ALREADY_MATERIALIZED)|P1_PROGRAM_ALLOWED_FILES_VIOLATION") { throw }
    }
    if (-not $moduleHotfixReplayFailed) { throw "F-0115 Module hotfix replay unexpectedly passed." }

    # C6-FIXTURE-HERMETICITY-BEGIN
    function Remove-C6ShortTempRoot {
        param([Parameter(Mandatory = $true)][string]$Root)

        $resolvedRoot = [System.IO.Path]::GetFullPath($Root)
        $resolvedTempPrefix = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
        $rootName = [System.IO.Path]::GetFileName($resolvedRoot)
        if (-not $resolvedRoot.StartsWith($resolvedTempPrefix, [System.StringComparison]::OrdinalIgnoreCase) `
            -or $rootName -notmatch '^tiku-c6[mi]-[0-9a-f]{32}$') {
            throw "P1_C6_TEMP_CLEANUP_BOUNDARY_INVALID root=$resolvedRoot"
        }

        $longRoot = "\\?\$resolvedRoot"
        for ($cleanupAttempt = 1; $cleanupAttempt -le 5; $cleanupAttempt++) {
            if (-not [System.IO.Directory]::Exists($longRoot)) { return }
            try {
                try {
                    foreach ($fixtureFile in [System.IO.Directory]::EnumerateFiles($longRoot, "*", [System.IO.SearchOption]::AllDirectories)) {
                        [System.IO.File]::SetAttributes($fixtureFile, [System.IO.FileAttributes]::Normal)
                    }
                } catch [System.IO.DirectoryNotFoundException] {
                    # A child may disappear while the recursive enumerator advances; the root check below remains authoritative.
                }
                [System.IO.Directory]::Delete($longRoot, $true)
            } catch [System.IO.DirectoryNotFoundException] {
                # A concurrent child/root disappearance is benign only when the final root assertion succeeds.
            } catch [System.IO.IOException] {
                if ($cleanupAttempt -eq 5) { throw }
            } catch [System.UnauthorizedAccessException] {
                if ($cleanupAttempt -eq 5) { throw }
            }
            if (-not [System.IO.Directory]::Exists($longRoot)) { return }
            if ($cleanupAttempt -lt 5) { Start-Sleep -Milliseconds (50 * $cleanupAttempt) }
        }
        throw "P1_C6_TEMP_CLEANUP_INCOMPLETE root=$resolvedRoot"
    }

    $isolatedManualAuditRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-c6m-" + [guid]::NewGuid().ToString("N"))
    $foreignIndexRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-c6i-" + [guid]::NewGuid().ToString("N"))
    $committedBaselineSha = "61303d935e58e65103563fcb0fa865d7bfb6cf3e"

    $originalGitIndexFile = [Environment]::GetEnvironmentVariable("GIT_INDEX_FILE", [EnvironmentVariableTarget]::Process)
    try {
        Remove-Item -LiteralPath "Env:GIT_INDEX_FILE" -ErrorAction SilentlyContinue
        & git -c core.longpaths=true -c core.fsmonitor=false -c maintenance.auto=false -c gc.auto=0 clone --quiet --no-local --no-checkout $repositoryRoot $isolatedManualAuditRoot
        if ($LASTEXITCODE -ne 0) { throw "Unable to create self-contained committed manual audit clone." }
        & git -C $isolatedManualAuditRoot config core.longpaths true
        & git -C $isolatedManualAuditRoot config core.autocrlf false
        & git -C $isolatedManualAuditRoot config core.fsmonitor false
        & git -C $isolatedManualAuditRoot config core.untrackedCache false
        & git -C $isolatedManualAuditRoot config maintenance.auto false
        & git -C $isolatedManualAuditRoot config gc.auto 0
        & git -C $isolatedManualAuditRoot config gc.autoDetach false
        $isolatedAlternatesPath = Join-Path $isolatedManualAuditRoot ".git/objects/info/alternates"
        if (Test-Path -LiteralPath $isolatedAlternatesPath) { throw "Committed manual audit clone unexpectedly uses Git alternates." }
        & git -C $isolatedManualAuditRoot -c core.longpaths=true -c core.fsmonitor=false checkout --quiet --detach $committedBaselineSha
        if ($LASTEXITCODE -ne 0) { throw "Unable to check out committed manual audit baseline." }
        $isolatedManualAuditHead = ((& git -C $isolatedManualAuditRoot rev-parse HEAD) -join "").Trim()
        $isolatedManualAuditStatus = @(& git -C $isolatedManualAuditRoot -c core.fsmonitor=false status --porcelain=v1 --untracked-files=all)
        if ($isolatedManualAuditHead -cne $committedBaselineSha -or $isolatedManualAuditStatus.Count -ne 0) {
            throw "Committed manual audit baseline is not exact and clean."
        }
        foreach ($isolatedRequiredArtifact in @(
                "docs/04-agent-system/state/project-state.yaml",
                "docs/04-agent-system/state/task-queue.yaml",
                "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md",
                "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md",
                "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml",
                "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml",
                "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml"
            )) {
            if (-not (Test-Path -LiteralPath (Join-Path $isolatedManualAuditRoot ($isolatedRequiredArtifact -replace "/", "\")) -PathType Leaf)) {
                throw "Committed manual audit baseline is missing canonical artifact: $isolatedRequiredArtifact"
            }
        }

        New-Item -ItemType Directory -Path $foreignIndexRoot | Out-Null
        Set-Content -LiteralPath (Join-Path $foreignIndexRoot "foreign-index-sentinel.txt") -Value "foreign index" -Encoding UTF8
        & git -C $foreignIndexRoot init -b master *> $null
        & git -C $foreignIndexRoot config user.name "P1 Foreign Index Smoke"
        & git -C $foreignIndexRoot config user.email "p1-foreign-index-smoke@example.invalid"
        & git -C $foreignIndexRoot config core.autocrlf false
        & git -C $foreignIndexRoot config core.fsmonitor false
        & git -C $foreignIndexRoot config core.untrackedCache false
        & git -C $foreignIndexRoot config maintenance.auto false
        & git -C $foreignIndexRoot config gc.auto 0
        & git -C $foreignIndexRoot config gc.autoDetach false
        & git -C $foreignIndexRoot add foreign-index-sentinel.txt
        & git -C $foreignIndexRoot -c core.fsmonitor=false -c maintenance.auto=false -c gc.auto=0 commit --quiet -m "create foreign index fixture"
        if ($LASTEXITCODE -ne 0) { throw "Unable to commit foreign Git index fixture." }
        if (@(& git -C $foreignIndexRoot -c core.fsmonitor=false status --porcelain=v1 --untracked-files=all).Count -ne 0) {
            throw "Foreign Git index fixture is not clean after commit."
        }

        $foreignIndexPath = ((& git -C $foreignIndexRoot rev-parse --git-path index) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($foreignIndexPath)) { throw "Unable to resolve foreign Git index." }
        if (-not [System.IO.Path]::IsPathRooted($foreignIndexPath)) { $foreignIndexPath = Join-Path $foreignIndexRoot $foreignIndexPath }
        $foreignIndexPath = [System.IO.Path]::GetFullPath($foreignIndexPath)
        $foreignGitPrefix = [System.IO.Path]::GetFullPath(((& git -C $foreignIndexRoot rev-parse --absolute-git-dir) -join "").Trim()).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
        $manualAuditGitPrefix = [System.IO.Path]::GetFullPath(((& git -C $isolatedManualAuditRoot rev-parse --absolute-git-dir) -join "").Trim()).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
        if (-not $foreignIndexPath.StartsWith($foreignGitPrefix, [System.StringComparison]::OrdinalIgnoreCase) `
            -or $foreignIndexPath.StartsWith($manualAuditGitPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Cross-repository isolation fixture did not use a genuinely foreign Git index."
        }

        [Environment]::SetEnvironmentVariable("GIT_INDEX_FILE", $foreignIndexPath, [EnvironmentVariableTarget]::Process)
        $isolatedAuditOutput = @(
            & $guardPath `
                -RepositoryRoot $isolatedManualAuditRoot `
                -ProjectStatePath "docs/04-agent-system/state/project-state.yaml" `
                -QueuePath "docs/04-agent-system/state/task-queue.yaml" `
                -Phase manual
        )
        if (($isolatedAuditOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Cross-repository Git environment isolation fixture failed." }
        if (($isolatedAuditOutput -join "`n") -notmatch "p1TransitionScopeMode: standard") { throw "Committed manual audit fixture did not remain in standard scope mode." }
    } finally {
        if ($null -ne $originalGitIndexFile) {
            [Environment]::SetEnvironmentVariable("GIT_INDEX_FILE", $originalGitIndexFile, [EnvironmentVariableTarget]::Process)
        } else {
            Remove-Item -LiteralPath "Env:GIT_INDEX_FILE" -ErrorAction SilentlyContinue
        }
        $isolatedFixtureCleanupFailures = [System.Collections.Generic.List[string]]::new()
        foreach ($isolatedFixtureRoot in @($isolatedManualAuditRoot, $foreignIndexRoot)) {
            try {
                Remove-C6ShortTempRoot -Root $isolatedFixtureRoot
            } catch {
                $isolatedFixtureCleanupFailures.Add($_.Exception.Message)
            }
        }
        if ($isolatedFixtureCleanupFailures.Count -gt 0) {
            throw "P1_C6_TEMP_CLEANUP_FAILED $($isolatedFixtureCleanupFailures -join '; ')"
        }
    }
    # C6-FIXTURE-HERMETICITY-END

    $f0116HotfixRoot = Join-Path $smokeRoot "f0116-designpath-guard-hotfix"
    $f0116HotfixBaseSha = "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
    $f0116HotfixBranch = "codex/p1-f0116-designpath-guard-hotfix"
    $f0116HotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-f0116-designpath-guard-hotfix-authorization.md"
    $f0116HotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
    $f0116HotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
    $f0116HotfixFiles = @(
        $f0116HotfixAuthorizationPath,
        "docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-designpath-guard-hotfix.md",
        $f0116HotfixEvidencePath,
        $f0116HotfixAuditPath,
        "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
        "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
    )
    & git -c core.longpaths=true clone --quiet --shared --no-checkout $repositoryRoot $f0116HotfixRoot
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone F-0116 designPath hotfix fixture." }
    & git -C $f0116HotfixRoot config user.name "P1 F-0116 DesignPath Hotfix Smoke"
    & git -C $f0116HotfixRoot config user.email "p1-f0116-designpath-hotfix@example.invalid"
    & git -C $f0116HotfixRoot config core.autocrlf false
    & git -C $f0116HotfixRoot config core.longpaths true
    & git -C $f0116HotfixRoot sparse-checkout init --no-cone
    & git -C $f0116HotfixRoot sparse-checkout set --no-cone $moduleHotfixSparsePatterns
    & git -C $f0116HotfixRoot switch --quiet -C $f0116HotfixBranch $f0116HotfixBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Unable to materialize F-0116 designPath hotfix fixture." }
    & git -C $f0116HotfixRoot update-ref refs/remotes/origin/master $f0116HotfixBaseSha
    foreach ($scriptFile in @($f0116HotfixFiles | Where-Object { $_ -like "scripts/*" })) {
        Add-Content -LiteralPath (Join-Path $f0116HotfixRoot ($scriptFile -replace "/", "\")) -Value "# F-0116 designPath hotfix smoke marker" -Encoding UTF8
    }
    $f0116AuthorizationFileList = @($f0116HotfixFiles | ForEach-Object { "- ``$_``" }) -join "`n"
    $f0116HotfixAuthorization = @(
        "# Authorization", "", "Status: approved", "Human approval source: current user message",
        "Task ID: p1-f0116-designpath-guard-hotfix-2026-07-17",
        "Parent task: p1-remediation-rc-02-employee-creation-atomicity-2026-07-16",
        "Base: $f0116HotfixBaseSha", "Branch: $f0116HotfixBranch", "",
        "ancestorCheckpoint: only_after_transition_only_guard_pass",
        "otherInProgressShaDrift: hard_block", "hookBypass: prohibited", "qualityGateReduction: prohibited", "",
        "## Exact Files", "", $f0116AuthorizationFileList
    ) -join "`n"
    $f0116HotfixEvidence = @(
        "# Evidence", "", "## Reading Evidence", "status: complete", "conflictsFound: false",
        "targetSourceReviewed: true", "targetTestsReviewed: true", "analogousImplementationReviewed: true",
        "Cost Calibration Gate remains blocked.", "", "## Root-Cause Reproduction", "Result: pass", "",
        "## TDD Evidence", "Result: pass", "", "## Validation Results", "Result: pass"
    ) -join "`n"
    $f0116HotfixAudit = @(
        "# Audit", "", "## Round 1", "Result: pass", "", "## Round 2", "Result: pass", "",
        "## Decision", "Decision: APPROVE"
    ) -join "`n"
    Set-F0115FixtureFile -Root $f0116HotfixRoot -Path $f0116HotfixAuthorizationPath -Content $f0116HotfixAuthorization
    Set-F0115FixtureFile -Root $f0116HotfixRoot -Path "docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-designpath-guard-hotfix.md" -Content "# Plan`n"
    Set-F0115FixtureFile -Root $f0116HotfixRoot -Path $f0116HotfixEvidencePath -Content $f0116HotfixEvidence
    Set-F0115FixtureFile -Root $f0116HotfixRoot -Path $f0116HotfixAuditPath -Content $f0116HotfixAudit
    & git -C $f0116HotfixRoot add -- $f0116HotfixFiles

    & git -C $f0116HotfixRoot branch -m codex/wrong-f0116-designpath-hotfix
    $f0116WrongBranchFailed = $false
    try {
        & $guardPath -RepositoryRoot $f0116HotfixRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $f0116WrongBranchFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_CONTEXT_INVALID pre_commit") { throw }
    }
    if (-not $f0116WrongBranchFailed) { throw "F-0116 designPath hotfix wrong branch unexpectedly passed." }
    & git -C $f0116HotfixRoot branch -m $f0116HotfixBranch

    $f0116ExtraFilePath = "docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-extra.md"
    Set-F0115FixtureFile -Root $f0116HotfixRoot -Path $f0116ExtraFilePath -Content "extra"
    & git -C $f0116HotfixRoot add -- $f0116ExtraFilePath
    $f0116ExtraFileFailed = $false
    try {
        & $guardPath -RepositoryRoot $f0116HotfixRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $f0116ExtraFileFailed = $true
    }
    if (-not $f0116ExtraFileFailed) { throw "F-0116 designPath hotfix extra file unexpectedly passed." }
    & git -C $f0116HotfixRoot reset -- $f0116ExtraFilePath *> $null
    Remove-Item -LiteralPath (Join-Path $f0116HotfixRoot ($f0116ExtraFilePath -replace "/", "\")) -Force

    $f0116PreCommitOutput = @(& $guardPath -RepositoryRoot $f0116HotfixRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    if (($f0116PreCommitOutput -join "`n") -notmatch "p1F0116DesignPathGuardHotfixAuthorization: approved_one_time") { throw "P1 did not authorize exact F-0116 designPath hotfix." }
    Push-Location $f0116HotfixRoot
    try {
        $f0116ModulePreCommitOutput = @(& $modulePreCommitGuardPath)
    } finally {
        Pop-Location
    }
    if (($f0116ModulePreCommitOutput -join "`n") -notmatch "p1F0116DesignPathGuardHotfixAuthorization: approved_one_time") { throw "Module pre-commit did not authorize exact F-0116 designPath hotfix." }

    & git -C $f0116HotfixRoot commit --quiet -m "test exact F-0116 designPath hotfix"
    & git -C $f0116HotfixRoot branch -M master
    $f0116HotfixHeadSha = ((& git -C $f0116HotfixRoot rev-parse HEAD) -join "").Trim()
    $f0116HotfixOriginUrl = ((& git -C $f0116HotfixRoot remote get-url origin) -join "").Trim()
    $f0116HotfixUpdateLine = "refs/heads/master $f0116HotfixHeadSha refs/heads/master $f0116HotfixBaseSha"
    $f0116PrePushOutput = @(& $guardPath -RepositoryRoot $f0116HotfixRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $f0116HotfixOriginUrl -PushUpdateLines $f0116HotfixUpdateLine -SkipExternalIntegrityChecks)
    if (($f0116PrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: transition_only") { throw "Exact F-0116 designPath hotfix was not transition-only." }
    Add-Content -LiteralPath (Join-Path $f0116HotfixRoot ($f0116HotfixEvidencePath -replace "/", "\")) -Value "replay" -Encoding UTF8
    & git -C $f0116HotfixRoot add -- $f0116HotfixEvidencePath
    & git -C $f0116HotfixRoot commit --quiet -m "attempt F-0116 designPath hotfix replay"
    $f0116ReplaySha = ((& git -C $f0116HotfixRoot rev-parse HEAD) -join "").Trim()
    $f0116ReplayUpdate = "refs/heads/master $f0116ReplaySha refs/heads/master $f0116HotfixBaseSha"
    $f0116ReplayFailed = $false
    try {
        & $guardPath -RepositoryRoot $f0116HotfixRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $f0116HotfixOriginUrl -PushUpdateLines $f0116ReplayUpdate -SkipExternalIntegrityChecks
    } catch {
        $f0116ReplayFailed = $true
    }
    if (-not $f0116ReplayFailed) { throw "F-0116 designPath hotfix replay unexpectedly passed." }

    $f0116ScopeRoot = Join-Path $smokeRoot "f0116-scope-correction-guard-hotfix"
    $f0116ScopeBaseSha = "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
    $f0116ScopeTransitionSnapshotSha = "992fc119a"
    $f0116ScopeBranch = "codex/p1-f0116-scope-correction-hotfix"
    $f0116ScopeAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0116-scope-correction-guard-hotfix-authorization.md"
    $f0116ScopeEvidencePath = "docs/05-execution-logs/evidence/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
    $f0116ScopeAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
    $f0116ScopeFiles = @(
        "docs/04-agent-system/state/project-state.yaml",
        "docs/04-agent-system/state/task-queue.yaml",
        $f0116ScopeAuthorizationPath,
        "docs/05-execution-logs/task-plans/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md",
        $f0116ScopeEvidencePath,
        $f0116ScopeAuditPath,
        "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
        "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
    )
    & git -c core.longpaths=true clone --quiet --shared --no-checkout $repositoryRoot $f0116ScopeRoot
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone F-0116 scope-correction hotfix fixture." }
    & git -C $f0116ScopeRoot config user.name "P1 F-0116 Scope Correction Smoke"
    & git -C $f0116ScopeRoot config user.email "p1-f0116-scope-correction@example.invalid"
    & git -C $f0116ScopeRoot config core.autocrlf false
    & git -C $f0116ScopeRoot config core.longpaths true
    & git -C $f0116ScopeRoot sparse-checkout init --no-cone
    & git -C $f0116ScopeRoot sparse-checkout set --no-cone -- @($moduleHotfixSparsePatterns + $f0116ScopeFiles)
    & git -C $f0116ScopeRoot switch --quiet -C $f0116ScopeBranch $f0116ScopeBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Unable to materialize F-0116 scope-correction hotfix fixture." }
    & git -C $f0116ScopeRoot update-ref refs/remotes/origin/master $f0116ScopeBaseSha
    foreach ($candidatePath in $f0116ScopeFiles) {
        if ($candidatePath -in @("docs/04-agent-system/state/project-state.yaml", "docs/04-agent-system/state/task-queue.yaml")) {
            $candidateContent = ((& git -C $repositoryRoot show "${f0116ScopeTransitionSnapshotSha}:$candidatePath") -join "`n")
            if ($LASTEXITCODE -ne 0) { throw "Missing historical F-0116 transition snapshot file: $candidatePath" }
        } else {
            $sourcePath = Join-Path $repositoryRoot ($candidatePath -replace "/", "\")
            if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing F-0116 scope candidate file: $candidatePath" }
            $candidateContent = [System.IO.File]::ReadAllText($sourcePath)
        }
        Set-F0115FixtureFile -Root $f0116ScopeRoot -Path $candidatePath -Content $candidateContent
    }
    Set-F0115FixtureFile -Root $f0116ScopeRoot -Path $f0116ScopeEvidencePath -Content @"
# F-0116 scope-correction guard hotfix evidence

## Reading Evidence
status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked.
Result: pass

## Root-Cause Reproduction
Result: pass

## TDD Evidence
Result: pass

## Validation Results
Result: pass
"@
    Set-F0115FixtureFile -Root $f0116ScopeRoot -Path $f0116ScopeAuditPath -Content @"
# F-0116 scope-correction guard hotfix audit

## Round 1
Result: pass

## Round 2
Result: pass

## Decision
Decision: APPROVE
"@
    & git -C $f0116ScopeRoot add -- $f0116ScopeFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage exact F-0116 scope-correction candidate." }

    & git -C $f0116ScopeRoot branch -m codex/wrong-f0116-scope-correction
    $f0116ScopeWrongBranchFailed = $false
    try {
        & $guardPath -RepositoryRoot $f0116ScopeRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $f0116ScopeWrongBranchFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_CONTEXT_INVALID pre_commit") { throw }
    }
    if (-not $f0116ScopeWrongBranchFailed) { throw "F-0116 scope-correction wrong branch unexpectedly passed." }
    & git -C $f0116ScopeRoot branch -m $f0116ScopeBranch

    & git -C $f0116ScopeRoot reset -- $f0116ScopeAuditPath *> $null
    $f0116ScopePartialFailed = $false
    try {
        & $guardPath -RepositoryRoot $f0116ScopeRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $f0116ScopePartialFailed = $true
    }
    if (-not $f0116ScopePartialFailed) { throw "F-0116 scope-correction partial stage unexpectedly passed." }
    & git -C $f0116ScopeRoot add -- $f0116ScopeAuditPath

    $f0116ScopeQueuePath = Join-Path $f0116ScopeRoot "docs\04-agent-system\state\task-queue.yaml"
    Add-Content -LiteralPath $f0116ScopeQueuePath -Value "# unauthorized F-0116 scope delta" -Encoding UTF8
    & git -C $f0116ScopeRoot add -- "docs/04-agent-system/state/task-queue.yaml"
    $f0116ScopeDeltaFailed = $false
    try {
        & $guardPath -RepositoryRoot $f0116ScopeRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $f0116ScopeDeltaFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_QUEUE_DELTA_INVALID") { throw }
    }
    if (-not $f0116ScopeDeltaFailed) { throw "F-0116 scope-correction extra queue delta unexpectedly passed." }
    $f0116ScopeTransitionQueue = ((& git -C $repositoryRoot show "${f0116ScopeTransitionSnapshotSha}:docs/04-agent-system/state/task-queue.yaml") -join "`n")
    if ($LASTEXITCODE -ne 0) { throw "Unable to restore historical F-0116 transition queue snapshot." }
    Set-F0115FixtureFile -Root $f0116ScopeRoot -Path "docs/04-agent-system/state/task-queue.yaml" -Content $f0116ScopeTransitionQueue
    & git -C $f0116ScopeRoot add -- "docs/04-agent-system/state/task-queue.yaml"

    $f0116ScopePreCommitOutput = @(& $guardPath -RepositoryRoot $f0116ScopeRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    if (($f0116ScopePreCommitOutput -join "`n") -notmatch "p1F0116ScopeCorrectionGuardHotfixAuthorization: approved_one_time") { throw "P1 did not authorize exact F-0116 scope-correction hotfix." }
    Push-Location $f0116ScopeRoot
    try {
        $f0116ScopeModuleOutput = @(& $modulePreCommitGuardPath)
    } finally {
        Pop-Location
    }
    if (($f0116ScopeModuleOutput -join "`n") -notmatch "p1F0116ScopeCorrectionGuardHotfixAuthorization: approved_one_time") { throw "Module pre-commit did not authorize exact F-0116 scope-correction hotfix." }

    & git -C $f0116ScopeRoot commit --quiet -m "test exact F-0116 scope-correction hotfix"
    & git -C $f0116ScopeRoot branch -M master
    $f0116ScopeHeadSha = ((& git -C $f0116ScopeRoot rev-parse HEAD) -join "").Trim()
    $f0116ScopeOriginUrl = ((& git -C $f0116ScopeRoot remote get-url origin) -join "").Trim()
    $f0116ScopeUpdateLine = "refs/heads/master $f0116ScopeHeadSha refs/heads/master $f0116ScopeBaseSha"
    $f0116ScopePrePushOutput = @(& $guardPath -RepositoryRoot $f0116ScopeRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $f0116ScopeOriginUrl -PushUpdateLines $f0116ScopeUpdateLine -SkipExternalIntegrityChecks)
    if (($f0116ScopePrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: transition_only") { throw "Exact F-0116 scope-correction hotfix was not transition-only." }
    Add-Content -LiteralPath (Join-Path $f0116ScopeRoot ($f0116ScopeEvidencePath -replace "/", "\")) -Value "replay" -Encoding UTF8
    & git -C $f0116ScopeRoot add -- $f0116ScopeEvidencePath
    & git -C $f0116ScopeRoot commit --quiet -m "attempt F-0116 scope-correction replay"
    $f0116ScopeReplaySha = ((& git -C $f0116ScopeRoot rev-parse HEAD) -join "").Trim()
    $f0116ScopeReplayUpdate = "refs/heads/master $f0116ScopeReplaySha refs/heads/master $f0116ScopeBaseSha"
    $f0116ScopeReplayFailed = $false
    try {
        & $guardPath -RepositoryRoot $f0116ScopeRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $f0116ScopeOriginUrl -PushUpdateLines $f0116ScopeReplayUpdate -SkipExternalIntegrityChecks
    } catch {
        $f0116ScopeReplayFailed = $true
    }
    if (-not $f0116ScopeReplayFailed) { throw "F-0116 scope-correction replay unexpectedly passed." }

    $readOnlyProbeRoot = Join-Path $smokeRoot "read-only-audit-probe"
    New-Item -ItemType Directory -Path $readOnlyProbeRoot | Out-Null
    Set-Content -LiteralPath (Join-Path $readOnlyProbeRoot "tracked.txt") -Value "probe" -Encoding UTF8
    & git -C $readOnlyProbeRoot init -b master *> $null
    & git -C $readOnlyProbeRoot config user.name "P1 Read-only Probe"
    & git -C $readOnlyProbeRoot config user.email "p1-read-only-probe@example.invalid"
    & git -C $readOnlyProbeRoot config core.autocrlf false
    & git -C $readOnlyProbeRoot add tracked.txt
    & git -C $readOnlyProbeRoot commit -m "create read-only probe" *> $null
    $probeIndexPath = ((& git -C $readOnlyProbeRoot rev-parse --git-path index) -join "").Trim()
    if (-not [System.IO.Path]::IsPathRooted($probeIndexPath)) { $probeIndexPath = Join-Path $readOnlyProbeRoot $probeIndexPath }
    $probeFile = Get-Item -LiteralPath (Join-Path $readOnlyProbeRoot "tracked.txt")
    $probeFile.LastWriteTimeUtc = $probeFile.LastWriteTimeUtc.AddSeconds(2)
    $indexFingerprintBefore = Get-FileFingerprint -Path $probeIndexPath
    $probeStatus = @(& git --no-optional-locks -C $readOnlyProbeRoot status --porcelain)
    if ($LASTEXITCODE -ne 0 -or $probeStatus.Count -ne 0) { throw "Read-only audit status probe failed." }
    $indexFingerprintAfter = Get-FileFingerprint -Path $probeIndexPath
    if ($indexFingerprintAfter -ne $indexFingerprintBefore) { throw "Read-only audit status changed the disposable repository index." }

    if ($missingF0115ScopeCorrectionPatterns.Count -gt 0) {
        Write-Output "Existing P1 remediation smoke regression passed: 8 positive, 48 negative"
        throw "P1 guard is missing F-0115 scope-correction marker/mode contract: $($missingF0115ScopeCorrectionPatterns -join ', ')"
    }
    Write-Output "P1 remediation serial program guard smoke passed: 15 positive, 81 negative"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
