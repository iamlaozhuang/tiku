param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml",

    [Parameter(Mandatory = $false)]
    [string[]]$ChangedFiles = @(),

    [Parameter(Mandatory = $false)]
    [string]$DocsOnlyBatchId = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("shadow", "hard_block")]
    [string]$DocsOnlyBatchMode = "hard_block",

    [Parameter(Mandatory = $false)]
    [string]$LowRiskExperienceBatchId = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("shadow", "hard_block")]
    [string]$LowRiskExperienceBatchMode = "hard_block",

    [Parameter(Mandatory = $false)]
    [switch]$SkipScopeScan
)

$ErrorActionPreference = "Stop"
# C4-ADAPTER-IMPLEMENTATION-BEGIN
$p1ApprovedSameTaskTransitionCommonPath = Join-Path $PSScriptRoot "P1ApprovedSameTaskTransition.Common.ps1"
. $p1ApprovedSameTaskTransitionCommonPath

function Invoke-P1ApprovedSameTaskTransitionAdapter {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$ContractText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$SourcePath,
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Facts
    )
    $contract = Read-P1ApprovedSameTaskTransitionContract -Text $ContractText -SourcePath $SourcePath
    return Test-P1ApprovedSameTaskTransition -Contract $contract -Facts $Facts
}

# C4-ADAPTER-IMPLEMENTATION-END

$p1MechanismBootstrapPreCommitScopeCorrectionTaskId = "p1-mechanism-execution-compatibility-v2-1-2026-07-19"
$p1MechanismBootstrapPreCommitScopeCorrectionBaseSha = "d0b71842657f8f4df7e72d5fa6514b94d20b2de4"
$p1MechanismBootstrapPreCommitScopeCorrectionBranch = "codex/p1-mechanism-bootstrap-manual-recognition"
$p1MechanismBootstrapPreCommitScopeCorrectionAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-19-p1-mechanism-execution-compatibility-v2-1-authorization.md"
$p1MechanismBootstrapPreCommitScopeCorrectionFiles = @(
    $p1MechanismBootstrapPreCommitScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
    "docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
    "docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1"
)
$p1MechanismBootstrapManualHashCorrectionBaseSha = "ea0c265884d67c948fefd8b61ce570f0e9f86b1e"
$p1MechanismBootstrapManualHashCorrectionOriginMasterSha = "ea0c265884d67c948fefd8b61ce570f0e9f86b1e"
$p1MechanismBootstrapManualHashCorrectionBranch = "codex/p1-mechanism-bootstrap-manual-recognition"
$p1MechanismBootstrapManualHashCorrectionFiles = @(
    "docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
    "docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1"
)

function Test-P1MechanismBootstrapManualHashCorrectionCandidate {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Files,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )
    $normalized = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $expected = @($p1MechanismBootstrapManualHashCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if ((@($normalized | Sort-Object -CaseSensitive) -join '|') -cne (@($expected | Sort-Object -CaseSensitive) -join '|')) { return $false }
    $statusLines = @(& git --no-optional-locks -C $RepositoryRoot diff --cached --name-status --no-renames --diff-filter=ACMRTD)
    if ($LASTEXITCODE -ne 0 -or $statusLines.Count -ne $expected.Count) { return $false }
    $statusPaths = [System.Collections.Generic.List[string]]::new()
    foreach ($line in $statusLines) {
        $match = [regex]::Match(([string]$line), '^M\t(.+)$')
        if (-not $match.Success) { return $false }
        $statusPaths.Add((ConvertTo-NormalizedPath -Path $match.Groups[1].Value))
    }
    if ($statusPaths.Count -ne @($statusPaths | Sort-Object -CaseSensitive -Unique).Count -or (@($statusPaths | Sort-Object -CaseSensitive) -join '|') -cne (@($expected | Sort-Object -CaseSensitive) -join '|')) { return $false }
    if (@(& git --no-optional-locks -C $RepositoryRoot diff --name-only --no-renames).Count -ne 0 -or @(& git --no-optional-locks -C $RepositoryRoot ls-files --others --exclude-standard).Count -ne 0) { return $false }
    $taskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $queueTask = @(Get-TaskBlock -Lines $QueueLines -Id $taskId)
    if ($taskId -cne 'p1-mechanism-execution-compatibility-v2-1-2026-07-19' -or (Get-CurrentTaskStatus -Lines $ProjectStateLines) -notin @('in_progress', 'ready_for_closeout') -or $queueTask.Count -eq 0 -or (Get-ScalarValue -Block $queueTask -Key 'status') -cne 'ready_for_closeout' -or (Get-ScalarValue -Block $queueTask -Key 'taskKind') -cne 'mechanism_hardening' -or (Get-ScalarValue -Block $queueTask -Key 'findingIds') -cne '[]' -or (Get-ScalarValue -Block $queueTask -Key 'productClosureContribution') -cne 'none') { return $false }
    $head = ((& git -C $RepositoryRoot rev-parse HEAD) -join '').Trim(); $origin = ((& git -C $RepositoryRoot rev-parse origin/master) -join '').Trim(); $branch = ((& git -C $RepositoryRoot branch --show-current) -join '').Trim()
    if ($head -cne $p1MechanismBootstrapManualHashCorrectionBaseSha -or $origin -cne $p1MechanismBootstrapManualHashCorrectionOriginMasterSha -or $branch -cne $p1MechanismBootstrapManualHashCorrectionBranch) { return $false }
    foreach ($path in @('docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md','docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md')) {
        $text = Get-Content -LiteralPath (Join-Path $RepositoryRoot ($path -replace '/', '\')) -Raw -Encoding UTF8
        if ($text -notmatch '(?m)^\s*-\s+manualHashSelfIntegrityCorrection:\s*approved_one_time\s*$' -or $text -notmatch ('(?m)^\s*-\s+manualHashSelfIntegrityBaseSha:\s*' + [regex]::Escape($p1MechanismBootstrapManualHashCorrectionBaseSha) + '\s*$') -or $text -notmatch ('(?m)^\s*-\s+manualHashSelfIntegrityOriginMasterSha:\s*' + [regex]::Escape($p1MechanismBootstrapManualHashCorrectionOriginMasterSha) + '\s*$')) { return $false }
    }
    return $true
}

function Test-P1MechanismBootstrapPreCommitScopeCorrectionCandidate {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Files,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )
    $normalizedFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $expectedFiles = @($p1MechanismBootstrapPreCommitScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $normalizedFileKey = @($normalizedFiles | Sort-Object -CaseSensitive) -join "|"
    $expectedFileKey = @($expectedFiles | Sort-Object -CaseSensitive) -join "|"
    if ($normalizedFileKey -cne $expectedFileKey) { return $false }
    $statusLines = @(& git --no-optional-locks -C $RepositoryRoot diff --cached --name-status --no-renames --diff-filter=ACMRTD)
    if ($LASTEXITCODE -ne 0 -or $statusLines.Count -ne $expectedFiles.Count) { return $false }
    $statusPaths = [System.Collections.Generic.List[string]]::new()
    foreach ($line in $statusLines) {
        $match = [regex]::Match(([string]$line), '^M\t(.+)$')
        if (-not $match.Success) { return $false }
        $statusPaths.Add((ConvertTo-NormalizedPath -Path $match.Groups[1].Value))
    }
    if ($statusPaths.Count -ne @($statusPaths | Sort-Object -CaseSensitive -Unique).Count) { return $false }
    $statusPathKey = @($statusPaths | Sort-Object -CaseSensitive) -join "|"
    if ($statusPathKey -cne $expectedFileKey) {
        return $false
    }
    $taskId = Get-CurrentTaskId -Lines $ProjectStateLines
    if ($taskId -cne $p1MechanismBootstrapPreCommitScopeCorrectionTaskId) { return $false }
    if ((Get-CurrentTaskStatus -Lines $ProjectStateLines) -cne 'ready_for_closeout') { return $false }
    $queueTask = @(Get-TaskBlock -Lines $QueueLines -Id $taskId)
    if ($queueTask.Count -eq 0 -or (Get-ScalarValue -Block $queueTask -Key 'status') -cne 'ready_for_closeout' -or (Get-ScalarValue -Block $queueTask -Key 'taskKind') -cne 'mechanism_hardening' -or (Get-ScalarValue -Block $queueTask -Key 'findingIds') -cne '[]' -or (Get-ScalarValue -Block $queueTask -Key 'productClosureContribution') -cne 'none') { return $false }
    $head = ((& git -C $RepositoryRoot rev-parse HEAD) -join '').Trim()
    $origin = ((& git -C $RepositoryRoot rev-parse origin/master) -join '').Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join '').Trim()
    if ($head -cne $p1MechanismBootstrapPreCommitScopeCorrectionBaseSha -or $origin -cne $head -or $branch -cne $p1MechanismBootstrapPreCommitScopeCorrectionBranch) { return $false }
    if (@(& git --no-optional-locks -C $RepositoryRoot diff --name-only --no-renames).Count -ne 0 -or @(& git --no-optional-locks -C $RepositoryRoot ls-files --others --exclude-standard).Count -ne 0) { return $false }
    $authorizationPath = Join-Path $RepositoryRoot ($p1MechanismBootstrapPreCommitScopeCorrectionAuthorizationPath -replace '/', '\')
    if (-not (Test-Path -LiteralPath $authorizationPath -PathType Leaf)) { return $false }
    $authorizationText = Get-Content -LiteralPath $authorizationPath -Raw -Encoding UTF8
    return $authorizationText -match '(?m)^Approval state:\s*approved\s*$' -and $authorizationText -match '(?m)^The current user approved one one-time, exact-allowlist pre-commit scope-correction channel'
}

$p1TransitionHotfixTaskId = "p1-prepush-transition-ancestor-gate-hotfix-2026-07-16"
$p1TransitionHotfixParentTaskId = "p1-remediation-program-bootstrap-2026-07-16"
$p1TransitionHotfixBaseSha = "4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3"
$p1TransitionHotfixBranch = "codex/p1-prepush-transition-hotfix"
$p1TransitionHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-16-p1-prepush-transition-hotfix-authorization.md"
$p1TransitionHotfixFiles = @(
    ".husky/pre-push",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $p1TransitionHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-16-p1-prepush-transition-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-prepush-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-16-p1-prepush-transition-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-16-p1-prepush-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-16-p1-remediation-program-bootstrap.md",
    "docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-program-bootstrap.md"
)
$p1F0132ScopeCorrectionTaskId = "p1-f0132-scope-correction-hotfix-2026-07-16"
$p1F0132ScopeCorrectionParentTaskId = "p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16"
$p1F0132ScopeCorrectionBaseSha = "5a5d9ac9c66f00991c17c3af7410958199d02a79"
$p1F0132ScopeCorrectionBranch = "codex/p1-f0132-scope-correction-hotfix"
$p1F0132ScopeCorrectionAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-16-p1-f0132-scope-correction-hotfix-authorization.md"
$p1F0132ScopeCorrectionEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-f0132-scope-correction-hotfix.md"
$p1F0132ScopeCorrectionAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0132-scope-correction-hotfix.md"
$p1F0132ScopeCorrectionAllowedFile = "tests/unit/phase-11-redeem-code-batch-management-loop.test.ts"
$p1F0132ScopeCorrectionQueueAnchor = @"
      - src/server/validators/redeem-code.test.ts
      - tests/unit/phase-8-student-authorization-redeem-runtime.test.ts
      - tests/unit/phase-21-admin-redeem-code-concurrency.test.ts
"@
$p1F0132ScopeCorrectionQueueReplacement = @"
      - src/server/validators/redeem-code.test.ts
      - tests/unit/phase-8-student-authorization-redeem-runtime.test.ts
      - tests/unit/phase-11-redeem-code-batch-management-loop.test.ts
      - tests/unit/phase-21-admin-redeem-code-concurrency.test.ts
"@
$p1F0132ScopeCorrectionFiles = @(
    "docs/04-agent-system/state/task-queue.yaml",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $p1F0132ScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix.md",
    $p1F0132ScopeCorrectionEvidencePath,
    $p1F0132ScopeCorrectionAuditPath
)
New-Variable -Name p1F0115Phase11ScopeCorrectionTaskId -Option Constant -Value "p1-f0115-phase11-scope-correction-hotfix-2026-07-17"
New-Variable -Name p1F0115Phase11ScopeCorrectionParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
New-Variable -Name p1F0115Phase11ScopeCorrectionBaseSha -Option Constant -Value "582c156afb0cdde8a3daa99785fda8540b56fe27"
New-Variable -Name p1F0115Phase11ScopeCorrectionBranch -Option Constant -Value "codex/p1-f0115-phase11-scope-correction-hotfix"
New-Variable -Name p1F0115Phase11ScopeCorrectionAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-authorization.md"
New-Variable -Name p1F0115Phase11ScopeCorrectionEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
New-Variable -Name p1F0115Phase11ScopeCorrectionAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
New-Variable -Name p1F0115Phase11ScopeCorrectionAllowedFile -Option Constant -Value "tests/unit/phase-11-system-ops-user-management-loop.test.ts"
New-Variable -Name p1F0115Phase11ScopeCorrectionQueueAnchor -Option Constant -Value @"
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
"@
New-Variable -Name p1F0115Phase11ScopeCorrectionQueueReplacement -Option Constant -Value @"
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-11-system-ops-user-management-loop.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
"@
New-Variable -Name p1F0115Phase11ScopeCorrectionFiles -Option Constant -Value @(
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
New-Variable -Name p1F0115ModulePrecommitHotfixTaskId -Option Constant -Value "p1-remediation-efficiency-mechanism-tuning-2026-07-17"
New-Variable -Name p1F0115ModulePrecommitHotfixParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
New-Variable -Name p1F0115ModulePrecommitHotfixBaseSha -Option Constant -Value "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
New-Variable -Name p1F0115ModulePrecommitHotfixBranch -Option Constant -Value "codex/p1-remediation-efficiency-mechanism-tuning"
New-Variable -Name p1F0115ModulePrecommitHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-17-p1-remediation-efficiency-mechanism-tuning-authorization.md"
New-Variable -Name p1F0115ModulePrecommitHotfixEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
New-Variable -Name p1F0115ModulePrecommitHotfixAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
New-Variable -Name p1F0115ModulePrecommitHotfixFiles -Option Constant -Value @(
    "docs/04-agent-system/sop/p1-remediation-efficiency-loop.md",
    $p1F0115ModulePrecommitHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md",
    $p1F0115ModulePrecommitHotfixEvidencePath,
    $p1F0115ModulePrecommitHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0116DesignPathGuardHotfixTaskId -Option Constant -Value "p1-f0116-designpath-guard-hotfix-2026-07-17"
New-Variable -Name p1F0116DesignPathGuardHotfixParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
New-Variable -Name p1F0116DesignPathGuardHotfixBaseSha -Option Constant -Value "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
New-Variable -Name p1F0116DesignPathGuardHotfixBranch -Option Constant -Value "codex/p1-f0116-designpath-guard-hotfix"
New-Variable -Name p1F0116DesignPathGuardHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-17-p1-f0116-designpath-guard-hotfix-authorization.md"
New-Variable -Name p1F0116DesignPathGuardHotfixEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
New-Variable -Name p1F0116DesignPathGuardHotfixAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
New-Variable -Name p1F0116DesignPathGuardHotfixFiles -Option Constant -Value @(
    $p1F0116DesignPathGuardHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-designpath-guard-hotfix.md",
    $p1F0116DesignPathGuardHotfixEvidencePath,
    $p1F0116DesignPathGuardHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixTaskId -Option Constant -Value "p1-f0116-scope-correction-guard-hotfix-2026-07-18"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-import-preflight-2026-07-17"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixBaseSha -Option Constant -Value "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixBranch -Option Constant -Value "codex/p1-f0116-scope-correction-hotfix"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-18-p1-f0116-scope-correction-guard-hotfix-authorization.md"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixFiles -Option Constant -Value @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md",
    $p1F0116ScopeCorrectionGuardHotfixEvidencePath,
    $p1F0116ScopeCorrectionGuardHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0117SpecApprovalTransitionHotfixTaskId -Option Constant -Value "p1-f0117-spec-approval-transition-hotfix-2026-07-18"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixParentTaskId -Option Constant -Value "p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixBaseSha -Option Constant -Value "366f17446e9fc75a777ebfe5977ad72db1062eb7"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixBranch -Option Constant -Value "codex/p1-f0117-spec-approval-transition-hotfix"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-spec-approval-transition-hotfix-authorization.md"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixHumanApprovalSource -Option Constant -Value "current user message approving F-0117 Option A, written specification, schema/migration source generation only, and execution on 2026-07-18"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixStandingAuthorizationSource -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md"
New-Variable -Name p1F0117SpecApprovalTransitionHotfixFiles -Option Constant -Value @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $p1F0117SpecApprovalTransitionHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    $p1F0117SpecApprovalTransitionHotfixEvidencePath,
    $p1F0117SpecApprovalTransitionHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0143SpecApprovalTransitionHotfixTaskId -Option Constant -Value "p1-f0143-spec-approval-transition-hotfix-2026-07-18"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-personal-ai-context-2026-07-18"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixBaseSha -Option Constant -Value "0fe8edae7a7efc00154f5c54227623be55796983"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixBranch -Option Constant -Value "codex/p1-f0143-spec-approval-transition-hotfix"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-spec-approval-transition-hotfix-authorization.md"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixHumanApprovalSource -Option Constant -Value "current user message approving one-time F-0143 spec-approval transition governance hotfix limited to P1/Module guards, corresponding smoke, exact state and evidence/audit; ancestor checkpoint only after transition-only guard passes; other in_progress SHA drift remains hard-blocked on 2026-07-18"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixStandingAuthorizationSource -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md"
New-Variable -Name p1F0143SpecApprovalTransitionHotfixFiles -Option Constant -Value @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $p1F0143SpecApprovalTransitionHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    $p1F0143SpecApprovalTransitionHotfixEvidencePath,
    $p1F0143SpecApprovalTransitionHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0117SmokeScopeCorrectionTaskId -Option Constant -Value "p1-f0117-smoke-scope-correction-guard-hotfix-2026-07-18"
New-Variable -Name p1F0117SmokeScopeCorrectionParentTaskId -Option Constant -Value "p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18"
New-Variable -Name p1F0117SmokeScopeCorrectionBaseSha -Option Constant -Value "3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a"
New-Variable -Name p1F0117SmokeScopeCorrectionBranch -Option Constant -Value "codex/f0117-smoke-scope-correction"
New-Variable -Name p1F0117SmokeScopeCorrectionAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix-authorization.md"
New-Variable -Name p1F0117SmokeScopeCorrectionHumanApprovalSource -Option Constant -Value "current user message approving one-time F-0117 smoke scope-correction on 2026-07-18"
New-Variable -Name p1F0117SmokeScopeCorrectionAllowedFile -Option Constant -Value "tests/unit/p1-employee-import-command-migration-source.test.ts"
New-Variable -Name p1F0117SmokeScopeCorrectionEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md"
New-Variable -Name p1F0117SmokeScopeCorrectionAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md"
New-Variable -Name p1F0117SmokeScopeCorrectionFiles -Option Constant -Value @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $p1F0117SmokeScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    $p1F0117SmokeScopeCorrectionEvidencePath,
    $p1F0117SmokeScopeCorrectionAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixTaskId -Option Constant -Value "p1-f0117-smoke-scope-closeout-lifecycle-hotfix-2026-07-18"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixParentTaskId -Option Constant -Value "p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixBaseSha -Option Constant -Value "71f150ceef0af54fca8d72db20a4254313630c7f"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixBranch -Option Constant -Value "codex/f0117-smoke-scope-closeout-fix"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix-authorization.md"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixHumanApprovalSource -Option Constant -Value "current user approval for an independent F-0117 governance hotfix limited to pre-push orchestration, P1 and Module guards, and smoke tests on 2026-07-18"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md"
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixFiles -Option Constant -Value @(
    $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md",
    $p1F0117SmokeScopeCloseoutLifecycleHotfixEvidencePath,
    $p1F0117SmokeScopeCloseoutLifecycleHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0115ScopeCorrectionTaskId -Option Constant -Value "p1-f0115-scope-correction-hotfix-2026-07-16"
New-Variable -Name p1F0115ScopeCorrectionParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
New-Variable -Name p1F0115ScopeCorrectionBaseSha -Option Constant -Value "6bde2f2aec3d71fa0ce138b26f64243861cace6f"
New-Variable -Name p1F0115ScopeCorrectionBranch -Option Constant -Value "codex/p1-f0115-scope-correction-hotfix"
New-Variable -Name p1F0115ScopeCorrectionAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md"
New-Variable -Name p1F0115ScopeCorrectionEvidencePath -Option Constant -Value "docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md"
New-Variable -Name p1F0115ScopeCorrectionAuditPath -Option Constant -Value "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md"
New-Variable -Name p1F0115ScopeCorrectionFiles -Option Constant -Value @(
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
New-Variable -Name p1F0115ScopeCorrectionCapabilityAuthorization -Option Constant -Value @"
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
"@
New-Variable -Name p1F0115ScopeCorrectionApprovalAnchor -Option Constant -Value @"
    approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
    authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
    executionProfile: R3
"@
New-Variable -Name p1F0115ScopeCorrectionApprovalReplacement -Option Constant -Value @"
    approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
    authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
    freshApprovalSource: docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md
    executionProfile: R3
"@
New-Variable -Name p1F0115ScopeCorrectionRollbackAnchor -Option Constant -Value @"
    rollbackOrStopCondition: stop_if_schema_migration_persistent_batch_command_database_runtime_external_distribution_service_or_other_finding_repair_is_required
"@
New-Variable -Name p1F0115ScopeCorrectionRollbackReplacement -Option Constant -Value @"
    rollbackOrStopCondition: stop_if_generated_migration_source_would_be_executed_or_if_dependency_database_provider_runtime_p2_pr_force_push_deploy_or_other_finding_repair_is_required
"@
New-Variable -Name p1F0115ScopeCorrectionFocusedGatesAnchor -Option Constant -Value @"
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
"@
New-Variable -Name p1F0115ScopeCorrectionFocusedGatesReplacement -Option Constant -Value @"
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
New-Variable -Name p1F0115ScopeCorrectionAllowedFilesAnchor -Option Constant -Value @"
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
"@
New-Variable -Name p1F0115ScopeCorrectionAllowedFilesReplacement -Option Constant -Value @"
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
New-Variable -Name p1F0115ScopeCorrectionBlockedFilesAnchor -Option Constant -Value @"
      - src/db/schema/**
      - drizzle/**
"@
New-Variable -Name p1F0115ScopeCorrectionBlockedFilesReplacement -Option Constant -Value ""
New-Variable -Name p1F0115ScopeCorrectionSchemaMigrationAnchor -Option Constant -Value @"
      schemaMigration: blocked_without_fresh_approval
"@
New-Variable -Name p1F0115ScopeCorrectionSchemaMigrationReplacement -Option Constant -Value @"
      schemaMigration: approved_source_generation_only_no_execution
"@
New-Variable -Name p1F0115ScopeCorrectionAcceptanceAnchor -Option Constant -Value @"
    acceptanceStandards:
      - JIT revalidation must first distinguish post-P0 covered atomic creation from any remaining batch exception, unknown-result or one-time-secret residual; superseded evidence cannot be reopened wholesale.
      - A committed employee account must contain auth_user, auth_account, user, employee and quota reservation in one transaction; any failure must leave no orphan credential or partial membership.
      - Batch import must preserve explainable committed-row results and must never expose an initial password for a row whose transaction did not commit.
      - Response-loss and retry safety must be proven within the current no-schema boundary; if durable batch idempotency or recoverable secret storage is required, stop and request separate approval rather than inventing persistence.
      - F-0115 can close only at static level after focused and full regression; RV-0018 remains pending and no schema, migration, dependency, database, Provider, browser/runtime, P2, PR, force push or deployment action occurs.
"@
New-Variable -Name p1F0115ScopeCorrectionAcceptanceReplacement -Option Constant -Value @"
    acceptanceStandards:
      - The command idempotency key and normalized request HMAC must make same-key/same-request resume safe and same-key/different-request fail with 409 without storing raw request, phone, name, or password.
      - Each row must atomically commit identity, credential, employee membership, current org_auth quota, outcome, and audit; deterministic rejection must roll back identity through a savepoint, and unknown outcome must remain recoverable rather than being marked rejected.
      - Generated credentials must start with an unknowable placeholder and only explicit revision-bound issue may rotate and return plaintext once; GET never returns plaintext, active sessions block issue, and confirm closes distribution.
      - F-0115 closes statically only after focused/full regression and two reviews; Drizzle generation may create migration source but no migration/database execution occurs, RV-0018 remains pending, and dependency/Provider/browser/P2/PR/force/deploy remain blocked.
"@
New-Variable -Name p1F0115ScopeCorrectionValidationAnchor -Option Constant -Value @"
      - corepack pnpm@10.15.1 exec vitest run src/server/services/employee-account-service.test.ts src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts --maxWorkers=1
"@
New-Variable -Name p1F0115ScopeCorrectionValidationReplacement -Option Constant -Value @"
      - corepack pnpm@10.15.1 exec vitest run src/db/schema/employee-import.test.ts src/server/validators/employee-import-command.test.ts src/server/services/employee-import-command-crypto.test.ts src/server/repositories/postgres-employee-import-command-repository.test.ts src/server/services/employee-import-command-service.test.ts src/server/services/employee-import-command-route.test.ts src/server/auth/local-session-runtime.test.ts src/features/admin/org-auth-redeem/employee-import-command-client.test.ts src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx tests/unit/p1-employee-import-command-atomicity.test.ts tests/unit/p1-employee-import-command-migration-source.test.ts tests/unit/p0-rc-02-organization-scope-quota-employee.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts --maxWorkers=1
"@

function Write-Section {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title
    )

    Write-Output ""
    Write-Output "== $Title =="
}

function Add-Finding {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $script:findings.Add($Message)
    Write-Output $Message
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Id
    )

    $startIndex = -1
    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+$([regex]::Escape($Id))\s*$") {
            $startIndex = $lineIndex
            break
        }
    }

    if ($startIndex -lt 0) {
        return @()
    }

    $endIndex = $Lines.Count
    for ($lineIndex = $startIndex + 1; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+\S+") {
            $endIndex = $lineIndex
            break
        }
    }

    return $Lines[$startIndex..($endIndex - 1)]
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s+-\s+(.+)\s*$") {
            $values.Add($Matches[1].Trim())
            continue
        }

        if ($insideList -and $line -match "^\s+\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }

    return ""
}

function Get-TaskPlanPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$TaskBlock,

        [Parameter(Mandatory = $true)]
        [string]$TaskId
    )

    $planPath = Get-ScalarValue -Block $TaskBlock -Key "planPath"
    if (-not [string]::IsNullOrWhiteSpace($planPath)) {
        return (ConvertTo-NormalizedPath -Path $planPath)
    }

    $taskPlanDirectory = Join-Path -Path $RepositoryRoot -ChildPath "docs\05-execution-logs\task-plans"
    if (-not (Test-Path -LiteralPath $taskPlanDirectory)) {
        return ""
    }

    $taskPlanCandidates = @(
        Get-ChildItem -LiteralPath $taskPlanDirectory -File -Filter "*.md" |
            Where-Object { $_.Name -match [regex]::Escape($TaskId) } |
            Sort-Object LastWriteTimeUtc -Descending
    )

    if ($taskPlanCandidates.Count -eq 0) {
        return ""
    }

    $relativePath = $taskPlanCandidates[0].FullName.Substring($RepositoryRoot.Length) -replace "^[\\/]+", ""
    return (ConvertTo-NormalizedPath -Path $relativePath)
}

function Test-RequirementSsotReadiness {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot,

        [Parameter(Mandatory = $true)]
        [string]$TaskId,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$TaskBlock,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    if ($TaskBlock.Count -eq 0) {
        Write-Output "requirementSsotReadiness: skipped_no_task_block"
        return
    }

    if ($Files.Count -eq 0) {
        Write-Output "requirementSsotReadiness: skipped_no_changed_files"
        return
    }

    $taskKind = Get-ScalarValue -Block $TaskBlock -Key "taskKind"
    if ([string]::IsNullOrWhiteSpace($taskKind)) {
        $taskKind = "unknown"
    }

    if ($taskKind -match "^(read_only|read_only_audit|terminal_diagnostic|diagnostic)$") {
        Write-Output "requirementSsotReadiness: advisory_skip_$taskKind"
        return
    }

    $strictRequirementKinds = @("implementation", "docs_requirement_alignment", "docs_only", "mechanism_hardening")
    $acceptanceMappingKinds = @("acceptance_runtime_walkthrough")
    $requiresStrictRequirementMapping = $strictRequirementKinds -contains $taskKind
    $requiresAcceptanceMapping = $acceptanceMappingKinds -contains $taskKind
    $requiresSsotReadList = $requiresStrictRequirementMapping -or $requiresAcceptanceMapping

    if (-not $requiresSsotReadList) {
        Write-Output "requirementSsotReadiness: advisory_skip_taskKind_$taskKind"
        return
    }

    $planPath = Get-TaskPlanPath -RepositoryRoot $RepositoryRoot -TaskBlock $TaskBlock -TaskId $TaskId
    if ([string]::IsNullOrWhiteSpace($planPath)) {
        Add-Finding "FAIL_SSOT_READ_LIST_MISSING task_plan_missing"
        return
    }

    $planFullPath = Resolve-ScanPath -RepositoryRoot $RepositoryRoot -Path $planPath
    if (-not (Test-Path -LiteralPath $planFullPath)) {
        Add-Finding "FAIL_SSOT_READ_LIST_MISSING task_plan_not_found $planPath"
        return
    }

    $planText = Get-Content -LiteralPath $planFullPath -Raw
    $normalizedPlanText = $planText.Replace("\", "/")
    $normalizedTaskText = (($TaskBlock -join "`n") + "`n" + ($Files -join "`n") + "`n" + $normalizedPlanText).Replace("\", "/")

    if ($normalizedPlanText -notmatch "(?m)^##\s+SSOT Read List\s*$") {
        Add-Finding "FAIL_SSOT_READ_LIST_MISSING $planPath"
    } else {
        Write-Output "OK_SSOT_READ_LIST $planPath"
    }

    $hasRequirementRoot = $normalizedPlanText -match [regex]::Escape("docs/01-requirements/00-index.md")
    $hasRequirementSource = $normalizedPlanText -match [regex]::Escape("docs/01-requirements/")
    $hasExecutionLogSource = $normalizedPlanText -match [regex]::Escape("docs/05-execution-logs/")

    if (-not $hasRequirementRoot) {
        Add-Finding "FAIL_REQUIREMENT_SOURCE_MISSING docs/01-requirements/00-index.md"
    }

    if ($hasExecutionLogSource -and -not $hasRequirementSource) {
        Add-Finding "FAIL_EXECUTION_LOG_ONLY_REQUIREMENT_SOURCE $planPath"
    }

    $mentionsAdvancedEdition = $normalizedTaskText -match "(?i)advanced-edition|advanced edition|advanced_edition|advanced mvp|advanced capability"
    if ($mentionsAdvancedEdition -and $normalizedPlanText -notmatch [regex]::Escape("docs/01-requirements/advanced-edition/00-index.md")) {
        Add-Finding "FAIL_ADVANCED_INDEX_MISSING docs/01-requirements/advanced-edition/00-index.md"
    }

    $authorizationPattern = "(?i)\b(org_auth|personal_auth|redeem_code|effectiveEdition|auth_upgrade)\b|edition-aware|authorization|授权|卡密"
    if ($normalizedTaskText -match $authorizationPattern -and $normalizedPlanText -notmatch [regex]::Escape("docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md")) {
        Add-Finding "FAIL_AUTHORIZATION_SSOT_MISSING docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md"
    }

    $roleSeparatedPattern = "(?i)role-separated|role separated|role acceptance|acceptance-role|角色验收"
    if ($normalizedTaskText -match $roleSeparatedPattern) {
        $requirementAlignmentPath = Get-ScalarValue -Block $TaskBlock -Key "requirementAlignmentPath"
        $hasQueueAlignmentPath = -not [string]::IsNullOrWhiteSpace($requirementAlignmentPath)
        $hasRoleAlignmentRead = $normalizedPlanText -match "docs/01-requirements/traceability/[^`r`n]*role-separated-mvp-requirement-alignment\.md"
        $hasRoleMatrixRead = $normalizedPlanText -match [regex]::Escape("docs/01-requirements/traceability/role-experience-fulfillment-matrix.md")

        if (-not $hasQueueAlignmentPath -and -not ($hasRoleAlignmentRead -and $hasRoleMatrixRead)) {
            Add-Finding "FAIL_ROLE_ALIGNMENT_SOURCE_MISSING role-separated traceability alignment and role-experience matrix"
        }
    }

    $mappingText = ""
    $mappingPaths = @(
        (Get-ScalarValue -Block $TaskBlock -Key "evidencePath"),
        (Get-ScalarValue -Block $TaskBlock -Key "auditReviewPath")
    )
    foreach ($mappingPath in $mappingPaths) {
        if ([string]::IsNullOrWhiteSpace($mappingPath)) {
            continue
        }

        $mappingFullPath = Resolve-ScanPath -RepositoryRoot $RepositoryRoot -Path $mappingPath
        if (Test-Path -LiteralPath $mappingFullPath) {
            $mappingText += "`n" + (Get-Content -LiteralPath $mappingFullPath -Raw)
        }
    }

    if ($requiresStrictRequirementMapping -or $requiresAcceptanceMapping) {
        $mappingHeadingPattern = "(?m)^##\s+(Requirement Mapping Result|Role Mapping Result|Acceptance Mapping Result)\s*$"
        if ($mappingText -match $mappingHeadingPattern) {
            Write-Output "OK_REQUIREMENT_MAPPING_RESULT"
        } else {
            Add-Finding "FAIL_REQUIREMENT_SOURCE_MISSING requirement_mapping_result_missing"
        }
    }
}

function Get-CurrentTaskId {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines
    )

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            break
        }

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function ConvertTo-NormalizedPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $candidatePath = $Path.Replace("\", "/")
    while ($candidatePath.StartsWith("./", [System.StringComparison]::Ordinal)) { $candidatePath = $candidatePath.Substring(2) }
    return $candidatePath.TrimStart("/")
}

function Test-PathPattern {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $normalizedPattern = ConvertTo-NormalizedPath -Path $Pattern

    if ($normalizedPattern.EndsWith("/**")) {
        $prefix = $normalizedPattern.Substring(0, $normalizedPattern.Length - 3)
        return $normalizedPath -eq $prefix -or $normalizedPath.StartsWith("$prefix/")
    }

    $escapedPattern = [regex]::Escape($normalizedPattern)
    $pathPattern = $escapedPattern.Replace("\*\*", ".*").Replace("\*", "[^/]*").Replace("\?", "[^/]")
    return [regex]::IsMatch($normalizedPath, "^$pathPattern$", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
}

function Get-MatchingPattern {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if (Test-PathPattern -Path $Path -Pattern $pattern) {
            return $pattern
        }
    }

    return ""
}

function Expand-FileInputs {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    $expandedFiles = New-Object System.Collections.Generic.List[string]
    foreach ($fileInput in $Files) {
        foreach ($filePart in ($fileInput -split ",")) {
            $trimmedFile = $filePart.Trim()
            if (-not [string]::IsNullOrWhiteSpace($trimmedFile)) {
                $expandedFiles.Add($trimmedFile)
            }
        }
    }

    return $expandedFiles.ToArray()
}

function Get-ChangedFiles {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$ExplicitFiles
    )

    $expandedExplicitFiles = @(Expand-FileInputs -Files $ExplicitFiles)
    if ($expandedExplicitFiles.Count -gt 0) {
        return $expandedExplicitFiles
    }

    $stagedFiles = @(& git diff --cached --name-only --diff-filter=ACMR)
    if ($stagedFiles.Count -gt 0) {
        return $stagedFiles
    }

    $workingTreeFiles = @(& git diff --name-only --diff-filter=ACMR)
    $untrackedFiles = @(& git ls-files --others --exclude-standard)
    return @($workingTreeFiles + $untrackedFiles | Sort-Object -Unique)
}

function Test-SeedTransactionFileSet {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    if ($Files.Count -lt 3) {
        return $false
    }

    $normalizedFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $hasQueue = $normalizedFiles -contains "docs/04-agent-system/state/task-queue.yaml"
    $evidenceFiles = @($normalizedFiles | Where-Object { $_ -match "^docs/05-execution-logs/evidence/\d{4}-\d{2}-\d{2}-[a-z0-9-]*auto-seed[a-z0-9-]*\.md$" })
    $auditFiles = @($normalizedFiles | Where-Object { $_ -match "^docs/05-execution-logs/audits-reviews/\d{4}-\d{2}-\d{2}-[a-z0-9-]*auto-seed[a-z0-9-]*\.md$" })

    foreach ($file in $normalizedFiles) {
        $isAllowedSeedFile = $file -eq "docs/04-agent-system/state/task-queue.yaml" `
            -or $file -eq "docs/04-agent-system/state/project-state.yaml" `
            -or $file -match "^docs/04-agent-system/state/[a-z0-9-]+-auto-seed-approval-decision\.yaml$" `
            -or $file -match "^docs/05-execution-logs/task-plans/\d{4}-\d{2}-\d{2}-[a-z0-9-]*auto-seed[a-z0-9-]*\.md$" `
            -or $file -match "^docs/05-execution-logs/evidence/\d{4}-\d{2}-\d{2}-[a-z0-9-]*auto-seed[a-z0-9-]*\.md$" `
            -or $file -match "^docs/05-execution-logs/audits-reviews/\d{4}-\d{2}-\d{2}-[a-z0-9-]*auto-seed[a-z0-9-]*\.md$" `
            -or $file -match "^docs/05-execution-logs/evidence/batch-\d+-[a-z0-9-]+\.md$" `
            -or $file -match "^docs/05-execution-logs/audits-reviews/batch-\d+-[a-z0-9-]+\.md$"

        if (-not $isAllowedSeedFile) {
            return $false
        }
    }

    return $hasQueue -and $evidenceFiles.Count -eq 1 -and $auditFiles.Count -eq 1
}

function Test-SeedTransactionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files
    )

    $normalizedFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $evidenceFile = [string]($normalizedFiles | Where-Object { $_ -match "^docs/05-execution-logs/evidence/\d{4}-\d{2}-\d{2}-[a-z0-9-]*auto-seed[a-z0-9-]*\.md$" } | Select-Object -First 1)
    $auditFile = [string]($normalizedFiles | Where-Object { $_ -match "^docs/05-execution-logs/audits-reviews/\d{4}-\d{2}-\d{2}-[a-z0-9-]*auto-seed[a-z0-9-]*\.md$" } | Select-Object -First 1)

    foreach ($seedLogFile in @($evidenceFile, $auditFile)) {
        if ([string]::IsNullOrWhiteSpace($seedLogFile)) {
            Add-Finding "HARD_BLOCK_SEED_TRANSACTION_MISSING_LOG_FILE"
            continue
        }

        $fullPath = Resolve-ScanPath -RepositoryRoot $RepositoryRoot -Path $seedLogFile
        if (-not (Test-Path -LiteralPath $fullPath)) {
            Add-Finding "HARD_BLOCK_SEED_TRANSACTION_LOG_FILE_MISSING $seedLogFile"
            continue
        }

        $content = Get-Content -LiteralPath $fullPath -Raw
        if ($content -notmatch "autoDriveLocalImplementationApproval") {
            Add-Finding "HARD_BLOCK_SEED_TRANSACTION_MISSING_APPROVAL_ANCHOR $seedLogFile"
        }
        if ($content -notmatch "Cost Calibration Gate remains blocked") {
            Add-Finding "HARD_BLOCK_SEED_TRANSACTION_MISSING_COST_GATE_ANCHOR $seedLogFile"
        }
    }
}

function Test-MechanicRepairFileSet {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    if ($Files.Count -eq 0) {
        return $false
    }

    $normalizedFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $mechanicLogFiles = @(
        $normalizedFiles | Where-Object {
            $_ -match "^docs/05-execution-logs/(task-plans|evidence|audits-reviews)/\d{4}-\d{2}-\d{2}-module-run-v2-mechanic-[a-z0-9-]+\.md$"
        }
    )
    if ($mechanicLogFiles.Count -eq 0) {
        return $false
    }

    foreach ($file in $normalizedFiles) {
        $isAllowedMechanicFile = $file -like "scripts/agent-system/*.ps1" `
            -or $file -eq "docs/04-agent-system/state/project-state.yaml" `
            -or $file -eq "docs/04-agent-system/state/autodrive-control-schema.yaml" `
            -or $file -eq "docs/04-agent-system/state/mechanism-source-of-truth-index.yaml" `
            -or $file -like "docs/04-agent-system/sop/*.md" `
            -or $file -match "^docs/05-execution-logs/(task-plans|evidence|audits-reviews)/\d{4}-\d{2}-\d{2}-module-run-v2-mechanic-[a-z0-9-]+\.md$"

        if (-not $isAllowedMechanicFile) {
            return $false
        }
    }

    return $true
}

function Test-MechanicRepairAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files
    )

    $normalizedFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $evidenceFile = [string]($normalizedFiles | Where-Object { $_ -like "docs/05-execution-logs/evidence/*-module-run-v2-mechanic-*.md" } | Select-Object -First 1)
    $auditFile = [string]($normalizedFiles | Where-Object { $_ -like "docs/05-execution-logs/audits-reviews/*-module-run-v2-mechanic-*.md" } | Select-Object -First 1)

    foreach ($mechanicLogFile in @($evidenceFile, $auditFile)) {
        if ([string]::IsNullOrWhiteSpace($mechanicLogFile)) {
            Add-Finding "HARD_BLOCK_MECHANIC_REPAIR_MISSING_LOG_FILE"
            continue
        }

        $fullPath = Resolve-ScanPath -RepositoryRoot $RepositoryRoot -Path $mechanicLogFile
        if (-not (Test-Path -LiteralPath $fullPath)) {
            Add-Finding "HARD_BLOCK_MECHANIC_REPAIR_LOG_FILE_MISSING $mechanicLogFile"
            continue
        }

        $content = Get-Content -LiteralPath $fullPath -Raw
        if ($content -notmatch "tiku-module-run-v2-autopilot") {
            Add-Finding "HARD_BLOCK_MECHANIC_REPAIR_MISSING_AUTOPILOT_ID $mechanicLogFile"
        }
        if ($content -notmatch "tiku-module-run-v2-mechanic-2") {
            Add-Finding "HARD_BLOCK_MECHANIC_REPAIR_MISSING_MECHANIC_ID $mechanicLogFile"
        }
        if ($content -notmatch "Cost Calibration Gate remains blocked") {
            Add-Finding "HARD_BLOCK_MECHANIC_REPAIR_MISSING_COST_GATE_ANCHOR $mechanicLogFile"
        }
    }
}

function Test-P1TransitionHotfixFileSet {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    $actualFiles = @($Files | ForEach-Object { $_.Replace("\", "/").TrimStart("/") } | Sort-Object -Unique)
    $expectedFiles = @($p1TransitionHotfixFiles | ForEach-Object { $_.Replace("\", "/").TrimStart("/") } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Get-CurrentTaskStatus {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines
    )

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }
        if ($insideCurrentTask -and $line -match "^\S") { break }
        if ($insideCurrentTask -and $line -match "^\s+status:\s*(.+)\s*$") { return $Matches[1].Trim() }
    }
    return ""
}

function Test-P1TransitionHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1TransitionHotfixParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1TransitionHotfixBaseSha -or $branch -ne $p1TransitionHotfixBranch -or $currentTaskId -ne $p1TransitionHotfixParentTaskId -or $currentTaskStatus -ne "ready_for_closeout" -or $parentQueueStatus -ne "ready_for_closeout") {
        Add-Finding "HARD_BLOCK_P1_TRANSITION_HOTFIX_CONTEXT_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1TransitionHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_TRANSITION_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1TransitionHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_TRANSITION_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationFullPath = Resolve-ScanPath -RepositoryRoot $RepositoryRoot -Path $p1TransitionHotfixAuthorizationPath
    $authorizationText = if (Test-Path -LiteralPath $authorizationFullPath -PathType Leaf) { Get-Content -LiteralPath $authorizationFullPath -Raw } else { "" }
    foreach ($authorizationPattern in @(
        '(?im)^Status:\s*approved\s*$',
        '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1TransitionHotfixTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1TransitionHotfixBaseSha))[\x60]?\s*$",
        '(?i)pre-push orchestration',
        '(?i)P1 guard',
        '(?i)Module Run guards',
        '(?i)smoke tests'
    )) {
        if ($authorizationText -notmatch $authorizationPattern) {
            Add-Finding "HARD_BLOCK_P1_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    if ($script:findings.Count -eq 0) { Write-Output "p1TransitionHotfixAuthorization: approved_one_time" }
}

function Test-P1F0132ScopeCorrectionFileSet {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0132ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Get-ScopeCorrectionMarkdownSection {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory = $true)][string]$HeadingPattern
    )

    $match = [regex]::Match($Content, "(?ms)^##\s+$HeadingPattern\s*$\r?\n(.*?)(?=^##\s+|\z)")
    if (-not $match.Success) { return "" }
    return $match.Groups[1].Value
}

function Get-P1F0132ScopeCorrectionIndexText {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $content = @(& git -C $RepositoryRoot show ":$normalizedPath" 2>$null)
    if ($LASTEXITCODE -ne 0) { return "" }
    return $content -join "`n"
}

function Test-P1F0132ScopeCorrectionReviewContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText
    )

    foreach ($evidenceMarker in @(
        "## Reading Evidence",
        "status: complete",
        "conflictsFound: false",
        "targetSourceReviewed: true",
        "targetTestsReviewed: true",
        "analogousImplementationReviewed: true",
        "Cost Calibration Gate remains blocked"
    )) {
        if ($evidenceText -notmatch [regex]::Escape($evidenceMarker)) { Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_EVIDENCE_INCOMPLETE $evidenceMarker" }
    }
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results")) {
        if ((Get-ScopeCorrectionMarkdownSection -Content $evidenceText -HeadingPattern ([regex]::Escape($evidenceSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_REVIEW_NOT_FINAL evidence_$($evidenceSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    foreach ($auditSection in @("Round 1", "Round 2")) {
        if ((Get-ScopeCorrectionMarkdownSection -Content $auditText -HeadingPattern ([regex]::Escape($auditSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_$($auditSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    if ((Get-ScopeCorrectionMarkdownSection -Content $auditText -HeadingPattern "Decision") -notmatch '(?im)^Decision:\s*APPROVE\s*$') {
        Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_decision"
    }
}

function Test-P1F0132ScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0132ScopeCorrectionParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1F0132ScopeCorrectionBaseSha -or $branch -ne $p1F0132ScopeCorrectionBranch -or $currentTaskId -ne $p1F0132ScopeCorrectionParentTaskId -or $currentTaskStatus -ne "in_progress" -or $parentQueueStatus -ne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0132ScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0132ScopeCorrectionAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0132ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0132ScopeCorrectionAuthorizationPath
    foreach ($authorizationPattern in @(
        '(?im)^Status:\s*approved\s*$',
        '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1F0132ScopeCorrectionTaskId))[\x60]?\s*$",
        "(?im)^Parent task:\s*[\x60]?$([regex]::Escape($p1F0132ScopeCorrectionParentTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1F0132ScopeCorrectionBaseSha))[\x60]?\s*$",
        "(?im)^Branch:\s*[\x60]?$([regex]::Escape($p1F0132ScopeCorrectionBranch))[\x60]?\s*$",
        [regex]::Escape($p1F0132ScopeCorrectionAllowedFile),
        '(?i)every other.+in_progress.+hard-block',
        '(?i)(?:hook bypass.+not (?:approved|authorized)|does not authorize[^\r\n]*hook bypass)'
    )) {
        if ($authorizationText -notmatch $authorizationPattern) {
            Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }

    $queueGitPath = ConvertTo-NormalizedPath -Path $QueuePath
    $parentQueueText = @(& git -C $RepositoryRoot show "HEAD:$queueGitPath" 2>$null) -join "`n"
    $currentQueueText = (Get-P1F0132ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $QueuePath) -replace "`r`n?", "`n"
    $queueAnchorCount = [regex]::Matches($parentQueueText, [regex]::Escape($p1F0132ScopeCorrectionQueueAnchor)).Count
    $expectedQueueText = if ($queueAnchorCount -eq 1 -and $parentQueueText -notmatch [regex]::Escape($p1F0132ScopeCorrectionAllowedFile)) {
        $parentQueueText.Replace($p1F0132ScopeCorrectionQueueAnchor, $p1F0132ScopeCorrectionQueueReplacement)
    } else {
        ""
    }
    if ([string]::IsNullOrWhiteSpace($expectedQueueText) -or $currentQueueText.TrimEnd("`n") -cne $expectedQueueText.TrimEnd("`n")) {
        Add-Finding "HARD_BLOCK_P1_F0132_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
    }

    $evidenceText = Get-P1F0132ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0132ScopeCorrectionEvidencePath
    $auditText = Get-P1F0132ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0132ScopeCorrectionAuditPath
    Test-P1F0132ScopeCorrectionReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0132ScopeCorrectionAuthorization: approved_one_time" }
}

function Test-P1F0115Phase11ScopeCorrectionFileSet {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files
    )

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0115Phase11ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Get-P1F0115Phase11ScopeCorrectionIndexText {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $content = @(& git -C $RepositoryRoot show ":$normalizedPath" 2>$null)
    if ($LASTEXITCODE -ne 0) { return "" }
    return $content -join "`n"
}

function Test-P1F0115Phase11ScopeCorrectionReviewContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText
    )

    foreach ($evidenceMarker in @(
        "## Reading Evidence", "status: complete", "conflictsFound: false",
        "targetSourceReviewed: true", "targetTestsReviewed: true",
        "analogousImplementationReviewed: true", "Cost Calibration Gate remains blocked"
    )) {
        if ($EvidenceText -notmatch [regex]::Escape($evidenceMarker)) { Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_EVIDENCE_INCOMPLETE $evidenceMarker" }
    }
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results")) {
        if ((Get-ScopeCorrectionMarkdownSection -Content $EvidenceText -HeadingPattern ([regex]::Escape($evidenceSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_REVIEW_NOT_FINAL evidence_$($evidenceSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    foreach ($auditSection in @("Round 1", "Round 2")) {
        if ((Get-ScopeCorrectionMarkdownSection -Content $AuditText -HeadingPattern ([regex]::Escape($auditSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_$($auditSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    if ((Get-ScopeCorrectionMarkdownSection -Content $AuditText -HeadingPattern "Decision") -notmatch '(?im)^Decision:\s*APPROVE\s*$') {
        Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_decision"
    }
}

function Test-P1F0115Phase11ScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0115Phase11ScopeCorrectionParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1F0115Phase11ScopeCorrectionBaseSha -or $branch -ne $p1F0115Phase11ScopeCorrectionBranch -or $currentTaskId -ne $p1F0115Phase11ScopeCorrectionParentTaskId -or $currentTaskStatus -ne "in_progress" -or $parentQueueStatus -ne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0115Phase11ScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0115Phase11ScopeCorrectionAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115Phase11ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115Phase11ScopeCorrectionAuthorizationPath
    foreach ($authorizationPattern in @(
        '(?im)^Status:\s*approved\s*$', '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionTaskId))[\x60]?\s*$",
        "(?im)^Parent task:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionParentTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionBaseSha))[\x60]?\s*$",
        "(?im)^Branch:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionBranch))[\x60]?\s*$",
        [regex]::Escape($p1F0115Phase11ScopeCorrectionAllowedFile),
        '(?i)every other.+in_progress.+hard-block',
        '(?i)(?:hook bypass.+not (?:approved|authorized)|does not authorize[^\r\n]*hook bypass)'
    )) {
        if ($authorizationText -notmatch $authorizationPattern) {
            Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }

    $queueGitPath = ConvertTo-NormalizedPath -Path $QueuePath
    $parentQueueText = @(& git -C $RepositoryRoot show "HEAD:$queueGitPath" 2>$null) -join "`n"
    $currentQueueText = (Get-P1F0115Phase11ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $QueuePath) -replace "`r`n?", "`n"
    $queueAnchorCount = [regex]::Matches($parentQueueText, [regex]::Escape($p1F0115Phase11ScopeCorrectionQueueAnchor)).Count
    $expectedQueueText = if ($queueAnchorCount -eq 1 -and $parentQueueText -notmatch [regex]::Escape($p1F0115Phase11ScopeCorrectionAllowedFile)) {
        $parentQueueText.Replace($p1F0115Phase11ScopeCorrectionQueueAnchor, $p1F0115Phase11ScopeCorrectionQueueReplacement)
    } else { "" }
    if ([string]::IsNullOrWhiteSpace($expectedQueueText) -or $currentQueueText.TrimEnd("`n") -cne $expectedQueueText.TrimEnd("`n")) {
        Add-Finding "HARD_BLOCK_P1_F0115_PHASE11_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
    }

    $evidenceText = Get-P1F0115Phase11ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115Phase11ScopeCorrectionEvidencePath
    $auditText = Get-P1F0115Phase11ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115Phase11ScopeCorrectionAuditPath
    Test-P1F0115Phase11ScopeCorrectionReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time" }
}

function Test-P1F0115ModulePrecommitHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0115ModulePrecommitHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Get-P1F0115ModulePrecommitHotfixIndexText {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $content = @(& git -C $RepositoryRoot show ":$normalizedPath" 2>$null)
    if ($LASTEXITCODE -ne 0) { return "" }
    return $content -join "`n"
}

function Test-P1F0115ModulePrecommitHotfixReviewContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText
    )

    $normalizedEvidenceText = $EvidenceText -replace "`r`n?", "`n"
    $normalizedAuditText = $AuditText -replace "`r`n?", "`n"
    $evidenceHasContradiction = $normalizedEvidenceText -match '(?im)^\s*(?:-\s*)?Result\s*:\s*fail\s*$' -or $normalizedEvidenceText -match '(?im)^\s*(?:-\s*)?Decision\s*:\s*REJECT\s*$'
    foreach ($section in @("Root-Cause Reproduction", "TDD Evidence", "Validation Results")) {
        $headingPattern = "(?im)^##\s+$([regex]::Escape($section))\s*$"
        $sectionText = Get-ScopeCorrectionMarkdownSection -Content $normalizedEvidenceText -HeadingPattern ([regex]::Escape($section))
        if ([regex]::Matches($normalizedEvidenceText, $headingPattern).Count -ne 1 -or [regex]::Matches($sectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $evidenceHasContradiction = $true
        }
    }
    $readingEvidenceSection = Get-ScopeCorrectionMarkdownSection -Content $normalizedEvidenceText -HeadingPattern "Reading Evidence"
    if ([regex]::Matches($normalizedEvidenceText, '(?im)^##\s+Reading Evidence\s*$').Count -ne 1) { $evidenceHasContradiction = $true }
    foreach ($markerPattern in @(
        '(?im)^\s*status\s*:\s*complete\s*$',
        '(?im)^\s*conflictsFound\s*:\s*false\s*$',
        '(?im)^\s*targetSourceReviewed\s*:\s*true\s*$',
        '(?im)^\s*targetTestsReviewed\s*:\s*true\s*$',
        '(?im)^\s*analogousImplementationReviewed\s*:\s*true\s*$',
        '(?im)^\s*Cost Calibration Gate remains blocked(?:\u3002|\.)?\s*$'
    )) {
        if ([regex]::Matches($readingEvidenceSection, $markerPattern).Count -ne 1) { $evidenceHasContradiction = $true }
    }
    if ($evidenceHasContradiction) { Add-Finding "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_ARTIFACT_CONTRADICTION evidence" }

    $auditHasContradiction = $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Result\s*:\s*fail\s*$' -or $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Decision\s*:\s*REJECT\s*$'
    foreach ($section in @("Round 1", "Round 2")) {
        $headingPattern = "(?im)^##\s+$([regex]::Escape($section))\s*$"
        $sectionText = Get-ScopeCorrectionMarkdownSection -Content $normalizedAuditText -HeadingPattern ([regex]::Escape($section))
        if ([regex]::Matches($normalizedAuditText, $headingPattern).Count -ne 1 -or [regex]::Matches($sectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $auditHasContradiction = $true
        }
    }
    if ([regex]::Matches($normalizedAuditText, '(?im)^##\s+Decision\s*$').Count -ne 1 -or [regex]::Matches($normalizedAuditText, '(?im)^\s*Decision\s*:\s*APPROVE\s*$').Count -ne 1) {
        $auditHasContradiction = $true
    }
    if ($auditHasContradiction) { Add-Finding "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_ARTIFACT_CONTRADICTION audit" }
}

function Test-P1F0115ModulePrecommitHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0115ModulePrecommitHotfixParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1F0115ModulePrecommitHotfixBaseSha -or $branch -ne $p1F0115ModulePrecommitHotfixBranch -or $currentTaskId -ne $p1F0115ModulePrecommitHotfixParentTaskId -or $currentTaskStatus -ne "ready_for_closeout" -or $parentQueueStatus -ne "ready_for_closeout") {
        Add-Finding "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0115ModulePrecommitHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0115ModulePrecommitHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115ModulePrecommitHotfixAuthorizationPath
    foreach ($fieldContract in @(
        '(?im)^Status:\s*approved\s*$',
        '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1F0115ModulePrecommitHotfixTaskId))[\x60]?\s*$",
        "(?im)^Parent task:\s*[\x60]?$([regex]::Escape($p1F0115ModulePrecommitHotfixParentTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1F0115ModulePrecommitHotfixBaseSha))[\x60]?\s*$",
        "(?im)^Branch:\s*[\x60]?$([regex]::Escape($p1F0115ModulePrecommitHotfixBranch))[\x60]?\s*$",
        '(?i)otherInProgressShaDrift:\s*hard_block',
        '(?i)hookBypass:\s*prohibited',
        '(?i)qualityGateReduction:\s*prohibited'
    )) {
        if ($authorizationText -notmatch $fieldContract) {
            Add-Finding "HARD_BLOCK_P1_F0115_MODULE_PRECOMMIT_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $evidenceText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115ModulePrecommitHotfixEvidencePath
    $auditText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115ModulePrecommitHotfixAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0115ModulePrecommitHotfixAuthorization: approved_one_time" }
}

function Test-P1F0116DesignPathGuardHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0116DesignPathGuardHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0116DesignPathGuardHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0116DesignPathGuardHotfixParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1F0116DesignPathGuardHotfixBaseSha -or $branch -ne $p1F0116DesignPathGuardHotfixBranch -or $currentTaskId -ne $p1F0116DesignPathGuardHotfixParentTaskId -or $currentTaskStatus -ne "ready_for_closeout" -or $parentQueueStatus -ne "ready_for_closeout") {
        Add-Finding "HARD_BLOCK_P1_F0116_DESIGNPATH_GUARD_HOTFIX_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0116_DESIGNPATH_GUARD_HOTFIX_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0116DesignPathGuardHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0116_DESIGNPATH_GUARD_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0116DesignPathGuardHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0116_DESIGNPATH_GUARD_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0116DesignPathGuardHotfixAuthorizationPath
    foreach ($pattern in @(
        '(?im)^Status:\s*approved\s*$',
        '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1F0116DesignPathGuardHotfixTaskId))[\x60]?\s*$",
        "(?im)^Parent task:\s*[\x60]?$([regex]::Escape($p1F0116DesignPathGuardHotfixParentTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1F0116DesignPathGuardHotfixBaseSha))[\x60]?\s*$",
        "(?im)^Branch:\s*[\x60]?$([regex]::Escape($p1F0116DesignPathGuardHotfixBranch))[\x60]?\s*$",
        '(?i)ancestorCheckpoint:\s*only_after_transition_only_guard_pass',
        '(?i)otherInProgressShaDrift:\s*hard_block',
        '(?i)hookBypass:\s*prohibited',
        '(?i)qualityGateReduction:\s*prohibited'
    )) {
        if ($authorizationText -notmatch $pattern) {
            Add-Finding "HARD_BLOCK_P1_F0116_DESIGNPATH_GUARD_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $evidenceText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0116DesignPathGuardHotfixEvidencePath
    $auditText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0116DesignPathGuardHotfixAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0116DesignPathGuardHotfixAuthorization: approved_one_time" }
}

function Test-P1F0116ScopeCorrectionGuardHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0116ScopeCorrectionGuardHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0116ScopeCorrectionGuardHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0116ScopeCorrectionGuardHotfixParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1F0116ScopeCorrectionGuardHotfixBaseSha -or $branch -ne $p1F0116ScopeCorrectionGuardHotfixBranch -or $currentTaskId -ne $p1F0116ScopeCorrectionGuardHotfixParentTaskId -or $currentTaskStatus -ne "in_progress" -or $parentQueueStatus -ne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath
    foreach ($pattern in @(
        '(?im)^Status:\s*approved\s*$',
        '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1F0116ScopeCorrectionGuardHotfixTaskId))[\x60]?\s*$",
        "(?im)^Parent task:\s*[\x60]?$([regex]::Escape($p1F0116ScopeCorrectionGuardHotfixParentTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1F0116ScopeCorrectionGuardHotfixBaseSha))[\x60]?\s*$",
        "(?im)^Branch:\s*[\x60]?$([regex]::Escape($p1F0116ScopeCorrectionGuardHotfixBranch))[\x60]?\s*$",
        '(?i)ancestorCheckpoint:\s*only_after_transition_only_guard_pass',
        '(?i)otherInProgressShaDrift:\s*hard_block',
        '(?i)hookBypass:\s*prohibited',
        '(?i)qualityGateReduction:\s*prohibited'
    )) {
        if ($authorizationText -notmatch $pattern) {
            Add-Finding "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Label = "STATE"; Replacements = @(
            @{ Anchor = "    reason: current_user_approved_p1_remediation_goal_2026_07_16`n    approvalRequestPath: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`n    resumeAction: review_approved_server_owned_employee_create_import_preflight_design_for_f0116"; Replacement = "    reason: current_user_approved_written_f0116_spec_2026_07_18`n    approvalRequestPath: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`n    resumeAction: execute_f0116_employee_import_server_preflight_plan_red_to_green" },
            @{ Anchor = "  lastKnownMasterSha: f466caa81260686d5a2fbcbf62ba08717bf56a82`n  lastKnownOriginMasterSha: f466caa81260686d5a2fbcbf62ba08717bf56a82`n  lastKnownRemoteMasterSha: f466caa81260686d5a2fbcbf62ba08717bf56a82"; Replacement = "  lastKnownMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownOriginMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownRemoteMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff" }
        )},
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Label = "QUEUE"; Replacements = @(
            @{ Anchor = "      - src/server/services/admin-organization-org-auth-runtime.ts`n      - tests/unit/phase-20-ra-01-04-employee-import.test.ts"; Replacement = "      - src/server/services/admin-organization-org-auth-runtime.ts`n      - tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts`n      - tests/unit/phase-20-ra-01-04-employee-import.test.ts" },
            @{ Anchor = "      - tests/unit/phase-11-system-ops-user-management-loop.test.ts`n      - tests/unit/p1-employee-import-command-atomicity.test.ts"; Replacement = "      - tests/unit/phase-11-system-ops-user-management-loop.test.ts`n      - tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`n      - tests/unit/p1-employee-import-command-atomicity.test.ts" },
            @{ Anchor = "      status: waiting_for_spec_review`n      reason: current_user_approved_design_option_a_but_written_spec_review_is_required`n      approvalRequestPath: docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`n      resumeAction: review_written_f0116_server_preflight_spec_then_write_implementation_plan"; Replacement = "      status: satisfied`n      reason: current_user_approved_written_f0116_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`n      resumeAction: execute_f0116_employee_import_server_preflight_plan_red_to_green" }
        )}
    )) {
        $parentText = (@(& git -C $RepositoryRoot show "HEAD:$($projection.Path)") -join "`n") -replace "`r`n?", "`n"
        $parentInspectionExitCode = $LASTEXITCODE
        $currentText = (Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $projection.Path) -replace "`r`n?", "`n"
        $expectedText = $parentText
        $validProjection = $parentInspectionExitCode -eq 0
        foreach ($replacement in $projection.Replacements) {
            if ([regex]::Matches($expectedText, [regex]::Escape($replacement.Anchor)).Count -ne 1) { $validProjection = $false; break }
            $expectedText = $expectedText.Replace($replacement.Anchor, $replacement.Replacement)
        }
        if (-not $validProjection -or $currentText -cne $expectedText) {
            Add-Finding "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_$($projection.Label)_DELTA_INVALID"
        }
    }

    $evidenceText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0116ScopeCorrectionGuardHotfixEvidencePath
    $auditText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0116ScopeCorrectionGuardHotfixAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0116ScopeCorrectionGuardHotfixAuthorization: approved_one_time" }
}

function Test-P1F0117SpecApprovalTransitionHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0117SpecApprovalTransitionHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0117SpecApprovalTransitionHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0117SpecApprovalTransitionHotfixParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1F0117SpecApprovalTransitionHotfixBaseSha -or $branch -ne $p1F0117SpecApprovalTransitionHotfixBranch -or $currentTaskId -ne $p1F0117SpecApprovalTransitionHotfixParentTaskId -or $currentTaskStatus -ne "in_progress" -or $parentQueueStatus -ne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0117SpecApprovalTransitionHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0117SpecApprovalTransitionHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SpecApprovalTransitionHotfixAuthorizationPath
    foreach ($fieldContract in @(
        @{ Key = 'Status'; Expected = '(?i)^Status:\s*approved\s*$' },
        @{ Key = 'Human approval source'; Expected = "(?i)^Human approval source:\s*$([regex]::Escape($p1F0117SpecApprovalTransitionHotfixHumanApprovalSource))\s*$" },
        @{ Key = 'Standing hotfix authorization source'; Expected = "(?i)^Standing hotfix authorization source:\s*[\x60]$([regex]::Escape($p1F0117SpecApprovalTransitionHotfixStandingAuthorizationSource))[\x60]\s*$" },
        @{ Key = 'Task ID'; Expected = "(?i)^Task ID:\s*[\x60]$([regex]::Escape($p1F0117SpecApprovalTransitionHotfixTaskId))[\x60]\s*$" },
        @{ Key = 'Parent task'; Expected = "(?i)^Parent task:\s*[\x60]$([regex]::Escape($p1F0117SpecApprovalTransitionHotfixParentTaskId))[\x60]\s*$" },
        @{ Key = 'Base'; Expected = "(?i)^Base:\s*[\x60]$([regex]::Escape($p1F0117SpecApprovalTransitionHotfixBaseSha))[\x60]\s*$" },
        @{ Key = 'Branch'; Expected = "(?i)^Branch:\s*[\x60]$([regex]::Escape($p1F0117SpecApprovalTransitionHotfixBranch))[\x60]\s*$" },
        @{ Key = 'gateProjection'; Expected = '(?i)^gateProjection:\s*waiting_for_spec_review_to_satisfied\s*$' },
        @{ Key = 'ancestorCheckpoint'; Expected = '(?i)^ancestorCheckpoint:\s*only_after_transition_only_guard_pass\s*$' },
        @{ Key = 'otherInProgressShaDrift'; Expected = '(?i)^otherInProgressShaDrift:\s*hard_block\s*$' },
        @{ Key = 'standardMode'; Expected = '(?i)^standardMode:\s*hard_block\s*$' },
        @{ Key = 'noDatabaseExecution'; Expected = '(?i)^noDatabaseExecution:\s*required\s*$' }
    )) {
        $fieldMatches = @([regex]::Matches($authorizationText, "(?im)^$([regex]::Escape($fieldContract.Key))\s*:.*$"))
        if ($fieldMatches.Count -ne 1 -or $fieldMatches[0].Value -notmatch $fieldContract.Expected) {
            Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $authorizationFileSection = Get-ScopeCorrectionMarkdownSection -Content $authorizationText -HeadingPattern "Exact Files"
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SpecApprovalTransitionHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID"
    }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Label = "STATE"; Replacements = @(
            @{ Anchor = "  currentExecutionGate:`n    status: waiting_for_spec_review`n    reason: current_user_approved_f0117_option_a_and_schema_migration_source_only_but_written_spec_review_is_required`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n    resumeAction: review_written_f0117_nullable_deadline_spec_then_write_implementation_plan"; Replacement = "  currentExecutionGate:`n    status: satisfied`n    reason: current_user_approved_written_f0117_spec_2026_07_18`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n    resumeAction: execute_f0117_redeem_code_nullable_deadline_plan_red_to_green" },
            @{ Anchor = "  lastKnownMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownOriginMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownRemoteMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff"; Replacement = "  lastKnownMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownOriginMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownRemoteMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7" }
        )},
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Label = "GATE_PROJECTION"; Replacements = @(
            @{ Anchor = "    currentExecutionGate:`n      status: waiting_for_spec_review`n      reason: current_user_approved_f0117_option_a_and_schema_migration_source_only_but_written_spec_review_is_required`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n      resumeAction: review_written_f0117_nullable_deadline_spec_then_write_implementation_plan"; Replacement = "    currentExecutionGate:`n      status: satisfied`n      reason: current_user_approved_written_f0117_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n      resumeAction: execute_f0117_redeem_code_nullable_deadline_plan_red_to_green" }
        )}
    )) {
        $parentText = (@(& git -C $RepositoryRoot show "HEAD:$($projection.Path)") -join "`n") -replace "`r`n?", "`n"
        $parentInspectionExitCode = $LASTEXITCODE
        $currentText = (Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $projection.Path) -replace "`r`n?", "`n"
        $expectedText = $parentText
        $validProjection = $parentInspectionExitCode -eq 0
        foreach ($replacement in $projection.Replacements) {
            if ([regex]::Matches($expectedText, [regex]::Escape($replacement.Anchor)).Count -ne 1) { $validProjection = $false; break }
            $expectedText = $expectedText.Replace($replacement.Anchor, $replacement.Replacement)
        }
        if (-not $validProjection -or $currentText -cne $expectedText) {
            $projectionFinding = if ($projection.Label -eq "STATE") {
                "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_STATE_INVALID"
            } else {
                "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID"
            }
            Add-Finding $projectionFinding
        }
    }

    $evidenceText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SpecApprovalTransitionHotfixEvidencePath
    $auditText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SpecApprovalTransitionHotfixAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0117SpecApprovalTransitionHotfixAuthorization: approved_one_time" }
}

function Test-P1F0143SpecApprovalTransitionHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $normalizedActualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $normalizedExpectedFiles = @($p1F0143SpecApprovalTransitionHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $actualFiles = @($normalizedActualFiles | Sort-Object -CaseSensitive -Unique)
    $expectedFiles = @($normalizedExpectedFiles | Sort-Object -CaseSensitive -Unique)
    if ($normalizedActualFiles.Count -ne $normalizedExpectedFiles.Count -or $actualFiles.Count -ne $expectedFiles.Count) { return $false }
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Get-P1F0143SpecApprovalTransitionHotfixIndexText {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) { return "" }
    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    try {
        $indexPaths = @(& git -C $RepositoryRoot ls-files --cached -- $normalizedPath)
        $indexInspectionExitCode = $LASTEXITCODE
    } catch {
        return ""
    }
    $normalizedIndexPaths = @($indexPaths | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if ($indexInspectionExitCode -ne 0 -or $normalizedIndexPaths.Count -ne 1 -or $normalizedIndexPaths[0] -cne $normalizedPath) { return "" }
    return Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $normalizedPath
}

function Test-P1F0143SpecApprovalTransitionHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0143SpecApprovalTransitionHotfixParentTaskId)
    $parentQueueTaskIdMatches = @([regex]::Matches(($parentTaskBlock -join "`n"), '(?m)^\s*-\s+id:\s*(\S+)\s*$'))
    $parentQueueTaskId = if ($parentQueueTaskIdMatches.Count -eq 1) { $parentQueueTaskIdMatches[0].Groups[1].Value } else { "" }
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -cne $p1F0143SpecApprovalTransitionHotfixBaseSha -or $branch -cne $p1F0143SpecApprovalTransitionHotfixBranch -or $currentTaskId -cne $p1F0143SpecApprovalTransitionHotfixParentTaskId -or $currentTaskStatus -cne "in_progress" -or $parentQueueTaskId -cne $p1F0143SpecApprovalTransitionHotfixParentTaskId -or $parentQueueStatus -cne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID"
    }

    $stagedNameStatus = @(& git -C $RepositoryRoot diff --cached --name-status --no-renames --diff-filter=ACMRTD)
    $stagedNameStatusExitCode = $LASTEXITCODE
    $stagedNameStatusFiles = [System.Collections.Generic.List[string]]::new()
    $isValidStagedNameStatus = $stagedNameStatusExitCode -eq 0
    foreach ($stagedEntry in $stagedNameStatus) {
        $stagedEntryMatch = [regex]::Match($stagedEntry, '^([AM])\t(.+)$')
        if (-not $stagedEntryMatch.Success) {
            $isValidStagedNameStatus = $false
            continue
        }
        $stagedNameStatusFiles.Add((ConvertTo-NormalizedPath -Path $stagedEntryMatch.Groups[2].Value))
    }
    if (-not $isValidStagedNameStatus -or -not (Test-P1F0143SpecApprovalTransitionHotfixFileSet -Files $stagedNameStatusFiles)) {
        Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0143SpecApprovalTransitionHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -ceq $p1F0143SpecApprovalTransitionHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0143SpecApprovalTransitionHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0143SpecApprovalTransitionHotfixAuthorizationPath
    foreach ($fieldContract in @(
        @{ Key = 'Status'; Expected = '^Status:\s*approved\s*$' },
        @{ Key = 'Human approval source'; Expected = "^Human approval source:\s*$([regex]::Escape($p1F0143SpecApprovalTransitionHotfixHumanApprovalSource))\s*$" },
        @{ Key = 'Standing hotfix authorization source'; Expected = "^Standing hotfix authorization source:\s*[\x60]$([regex]::Escape($p1F0143SpecApprovalTransitionHotfixStandingAuthorizationSource))[\x60]\s*$" },
        @{ Key = 'Task ID'; Expected = "^Task ID:\s*[\x60]$([regex]::Escape($p1F0143SpecApprovalTransitionHotfixTaskId))[\x60]\s*$" },
        @{ Key = 'Parent task'; Expected = "^Parent task:\s*[\x60]$([regex]::Escape($p1F0143SpecApprovalTransitionHotfixParentTaskId))[\x60]\s*$" },
        @{ Key = 'Base'; Expected = "^Base:\s*[\x60]$([regex]::Escape($p1F0143SpecApprovalTransitionHotfixBaseSha))[\x60]\s*$" },
        @{ Key = 'Branch'; Expected = "^Branch:\s*[\x60]$([regex]::Escape($p1F0143SpecApprovalTransitionHotfixBranch))[\x60]\s*$" },
        @{ Key = 'gateProjection'; Expected = '^gateProjection:\s*waiting_for_spec_review_to_satisfied\s*$' },
        @{ Key = 'ancestorCheckpoint'; Expected = '^ancestorCheckpoint:\s*only_after_transition_only_guard_pass\s*$' },
        @{ Key = 'otherInProgressShaDrift'; Expected = '^otherInProgressShaDrift:\s*hard_block\s*$' },
        @{ Key = 'standardMode'; Expected = '^standardMode:\s*hard_block\s*$' },
        @{ Key = 'noDatabaseExecution'; Expected = '^noDatabaseExecution:\s*required\s*$' }
    )) {
        $fieldMatches = @([regex]::Matches($authorizationText, "(?m)^$([regex]::Escape($fieldContract.Key))\s*:.*$"))
        if ($fieldMatches.Count -ne 1 -or -not [regex]::IsMatch($fieldMatches[0].Value, $fieldContract.Expected)) {
            Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $authorizationFileSection = Get-ScopeCorrectionMarkdownSection -Content $authorizationText -HeadingPattern "Exact Files"
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0143SpecApprovalTransitionHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID"
    }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Label = "STATE"; Replacements = @(
            @{ Anchor = "  currentExecutionGate:`n    status: waiting_for_spec_review`n    reason: current_user_approved_f0143_option_a_but_written_spec_review_is_required`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n    resumeAction: review_written_f0143_selected_context_spec_then_write_implementation_plan"; Replacement = "  currentExecutionGate:`n    status: satisfied`n    reason: current_user_approved_written_f0143_spec_2026_07_18`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n    resumeAction: execute_f0143_employee_personal_ai_selected_context_plan_red_to_green" },
            @{ Anchor = "  lastKnownMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b`n  lastKnownOriginMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b`n  lastKnownRemoteMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b"; Replacement = "  lastKnownMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983`n  lastKnownOriginMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983`n  lastKnownRemoteMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983" }
        )},
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Label = "GATE_PROJECTION"; Replacements = @(
            @{ Anchor = "    currentExecutionGate:`n      status: waiting_for_spec_review`n      reason: current_user_approved_f0143_option_a_but_written_spec_review_is_required`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n      resumeAction: review_written_f0143_selected_context_spec_then_write_implementation_plan"; Replacement = "    currentExecutionGate:`n      status: satisfied`n      reason: current_user_approved_written_f0143_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`n      resumeAction: execute_f0143_employee_personal_ai_selected_context_plan_red_to_green" }
        )}
    )) {
        $parentText = (@(& git -C $RepositoryRoot show "HEAD:$($projection.Path)") -join "`n") -replace "`r`n?", "`n"
        $parentInspectionExitCode = $LASTEXITCODE
        $currentText = (Get-P1F0143SpecApprovalTransitionHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $projection.Path) -replace "`r`n?", "`n"
        $expectedText = $parentText
        $validProjection = $parentInspectionExitCode -eq 0
        foreach ($replacement in $projection.Replacements) {
            if ([regex]::Matches($expectedText, [regex]::Escape($replacement.Anchor)).Count -ne 1) { $validProjection = $false; break }
            $expectedText = $expectedText.Replace($replacement.Anchor, $replacement.Replacement)
        }
        if (-not $validProjection -or $currentText -cne $expectedText) {
            $projectionFinding = if ($projection.Label -eq "STATE") {
                "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_STATE_INVALID"
            } else {
                "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID"
            }
            Add-Finding $projectionFinding
        }
    }

    $evidenceText = Get-P1F0143SpecApprovalTransitionHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0143SpecApprovalTransitionHotfixEvidencePath
    $auditText = Get-P1F0143SpecApprovalTransitionHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0143SpecApprovalTransitionHotfixAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0143SpecApprovalTransitionHotfixAuthorization: approved_one_time" }
}

function Test-P1F0117SmokeScopeCorrectionFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0117SmokeScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0117SmokeScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0117SmokeScopeCorrectionParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }
    if ($headSha -ne $p1F0117SmokeScopeCorrectionBaseSha -or $branch -ne $p1F0117SmokeScopeCorrectionBranch -or $currentTaskId -ne $p1F0117SmokeScopeCorrectionParentTaskId -or $currentTaskStatus -ne "in_progress" -or $parentQueueStatus -ne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0117SmokeScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0117SmokeScopeCorrectionAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SmokeScopeCorrectionAuthorizationPath
    foreach ($fieldContract in @(
        @{ Key = 'Status'; Expected = '(?i)^Status:\s*approved\s*$' },
        @{ Key = 'Task ID'; Expected = "(?i)^Task ID:\s*$([regex]::Escape($p1F0117SmokeScopeCorrectionTaskId))\s*$" },
        @{ Key = 'Parent task'; Expected = "(?i)^Parent task:\s*$([regex]::Escape($p1F0117SmokeScopeCorrectionParentTaskId))\s*$" },
        @{ Key = 'Base'; Expected = "(?i)^Base:\s*$([regex]::Escape($p1F0117SmokeScopeCorrectionBaseSha))\s*$" },
        @{ Key = 'Branch'; Expected = "(?i)^Branch:\s*$([regex]::Escape($p1F0117SmokeScopeCorrectionBranch))\s*$" },
        @{ Key = 'Human approval source'; Expected = "(?i)^Human approval source:\s*$([regex]::Escape($p1F0117SmokeScopeCorrectionHumanApprovalSource))\s*$" },
        @{ Key = 'Approved allowlist correction'; Expected = "(?i)^Approved allowlist correction:\s*$([regex]::Escape($p1F0117SmokeScopeCorrectionAllowedFile))\s*$" },
        @{ Key = 'ancestorCheckpoint'; Expected = '(?i)^ancestorCheckpoint:\s*only_after_transition_only_guard_pass\s*$' },
        @{ Key = 'otherInProgressShaDrift'; Expected = '(?i)^otherInProgressShaDrift:\s*hard_block\s*$' },
        @{ Key = 'standardMode'; Expected = '(?i)^standardMode:\s*hard_block\s*$' },
        @{ Key = 'replay'; Expected = '(?i)^replay:\s*hard_block\s*$' }
    )) {
        $fieldMatches = @([regex]::Matches($authorizationText, "(?im)^$([regex]::Escape($fieldContract.Key))\s*:.*$"))
        if ($fieldMatches.Count -ne 1 -or $fieldMatches[0].Value -notmatch $fieldContract.Expected) {
            Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }

    $authorizationFileSection = Get-ScopeCorrectionMarkdownSection -Content $authorizationText -HeadingPattern "Exact Governance Files"
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SmokeScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_AUTHORIZATION_FILE_SET_INVALID"
    }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Label = "STATE"; Anchor = "  lastKnownMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownOriginMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownRemoteMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7"; Replacement = "  lastKnownMasterSha: $p1F0117SmokeScopeCorrectionBaseSha`n  lastKnownOriginMasterSha: $p1F0117SmokeScopeCorrectionBaseSha`n  lastKnownRemoteMasterSha: $p1F0117SmokeScopeCorrectionBaseSha" },
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Label = "QUEUE"; Anchor = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts"; Replacement = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - $p1F0117SmokeScopeCorrectionAllowedFile`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts" }
    )) {
        $parentText = ((@(& git -C $RepositoryRoot show "HEAD:$($projection.Path)") -join "`n") -replace "`r`n?", "`n")
        $parentInspectionExitCode = $LASTEXITCODE
        $currentText = (Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $projection.Path) -replace "`r`n?", "`n"
        $anchorCount = [regex]::Matches($parentText, [regex]::Escape($projection.Anchor)).Count
        $expectedText = if ($parentInspectionExitCode -eq 0 -and $anchorCount -eq 1) { $parentText.Replace($projection.Anchor, $projection.Replacement) } else { "" }
        if ([string]::IsNullOrWhiteSpace($expectedText) -or $currentText -cne $expectedText) {
            if ($projection.Label -eq "STATE") {
                Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_STATE_DELTA_INVALID"
            } else {
                Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
            }
        }
    }

    $reviewFindingCountBefore = $script:findings.Count
    $evidenceText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SmokeScopeCorrectionEvidencePath
    $auditText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SmokeScopeCorrectionAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -gt $reviewFindingCountBefore) { Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_REVIEW_INVALID" }
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0117SmokeScopeCorrectionAuthorization: approved_one_time" }
}

function Test-P1F0117SmokeScopeCloseoutLifecycleHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0117SmokeScopeCloseoutLifecycleHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0117SmokeScopeCloseoutLifecycleHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0117SmokeScopeCloseoutLifecycleHotfixParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }
    if ($headSha -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixBaseSha -or $branch -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixBranch -or $currentTaskId -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixParentTaskId -or $currentTaskStatus -ne "in_progress" -or $parentQueueStatus -ne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_CONTEXT_INVALID"
    }

    & git -C $RepositoryRoot diff --quiet
    $unstagedTrackedExitCode = $LASTEXITCODE
    $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
    if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_PARTIAL_STAGE_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath
    foreach ($fieldContract in @(
        @{ Key = 'Status'; Expected = '(?i)^Status:\s*approved\s*$' },
        @{ Key = 'Task ID'; Expected = "(?i)^Task ID:\s*$([regex]::Escape($p1F0117SmokeScopeCloseoutLifecycleHotfixTaskId))\s*$" },
        @{ Key = 'Parent task'; Expected = "(?i)^Parent task:\s*$([regex]::Escape($p1F0117SmokeScopeCloseoutLifecycleHotfixParentTaskId))\s*$" },
        @{ Key = 'Base'; Expected = "(?i)^Base:\s*$([regex]::Escape($p1F0117SmokeScopeCloseoutLifecycleHotfixBaseSha))\s*$" },
        @{ Key = 'Branch'; Expected = "(?i)^Branch:\s*$([regex]::Escape($p1F0117SmokeScopeCloseoutLifecycleHotfixBranch))\s*$" },
        @{ Key = 'Human approval source'; Expected = "(?i)^Human approval source:\s*$([regex]::Escape($p1F0117SmokeScopeCloseoutLifecycleHotfixHumanApprovalSource))\s*$" },
        @{ Key = 'Lifecycle contract'; Expected = '(?i)^Lifecycle contract:\s*special_path_only_while_origin_at_base_and_master_is_exact_single_child\s*$' },
        @{ Key = 'Synced identity disposition'; Expected = '(?i)^Synced identity disposition:\s*generic_closeout_path\s*$' },
        @{ Key = 'ancestorCheckpoint'; Expected = '(?i)^ancestorCheckpoint:\s*only_after_transition_only_guard_pass\s*$' },
        @{ Key = 'otherInProgressShaDrift'; Expected = '(?i)^otherInProgressShaDrift:\s*hard_block\s*$' },
        @{ Key = 'standardMode'; Expected = '(?i)^standardMode:\s*hard_block\s*$' },
        @{ Key = 'replay'; Expected = '(?i)^replay:\s*hard_block\s*$' }
    )) {
        $fieldMatches = @([regex]::Matches($authorizationText, "(?im)^$([regex]::Escape($fieldContract.Key))\s*:.*$"))
        if ($fieldMatches.Count -ne 1 -or $fieldMatches[0].Value -notmatch $fieldContract.Expected) {
            Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $authorizationFileSection = Get-ScopeCorrectionMarkdownSection -Content $authorizationText -HeadingPattern "Exact Governance Files"
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SmokeScopeCloseoutLifecycleHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_AUTHORIZATION_FILE_SET_INVALID"
    }

    $reviewFindingCountBefore = $script:findings.Count
    $evidenceText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SmokeScopeCloseoutLifecycleHotfixEvidencePath
    $auditText = Get-P1F0115ModulePrecommitHotfixIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0117SmokeScopeCloseoutLifecycleHotfixAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -gt $reviewFindingCountBefore) { Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_REVIEW_INVALID" }
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorization: approved_one_time" }
}

function Test-P1F0115ScopeCorrectionFileSet {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0115ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Get-P1F0115ScopeCorrectionIndexText {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $content = @(& git -C $RepositoryRoot show ":$normalizedPath" 2>$null)
    if ($LASTEXITCODE -ne 0) { return "" }
    return $content -join "`n"
}

function Test-P1F0115ScopeCorrectionReviewContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText
    )

    $normalizedEvidenceText = $EvidenceText -replace "`r`n?", "`n"
    $normalizedAuditText = $AuditText -replace "`r`n?", "`n"
    $evidenceHasContradiction = $normalizedEvidenceText -match '(?im)^\s*(?:-\s*)?Result\s*:\s*fail\s*$' -or $normalizedEvidenceText -match '(?im)^\s*(?:-\s*)?Decision\s*:\s*REJECT\s*$'
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results")) {
        $evidenceHeadingPattern = "(?im)^##\s+$([regex]::Escape($evidenceSection))\s*$"
        $evidenceSectionText = Get-ScopeCorrectionMarkdownSection -Content $normalizedEvidenceText -HeadingPattern ([regex]::Escape($evidenceSection))
        if ([regex]::Matches($normalizedEvidenceText, $evidenceHeadingPattern).Count -ne 1 -or [regex]::Matches($evidenceSectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $evidenceHasContradiction = $true
        }
    }
    if ($evidenceHasContradiction) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION evidence"
    }

    $auditHasContradiction = $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Result\s*:\s*fail\s*$' -or $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Decision\s*:\s*REJECT\s*$'
    foreach ($auditSection in @("Round 1", "Round 2")) {
        $auditHeadingPattern = "(?im)^##\s+$([regex]::Escape($auditSection))\s*$"
        $auditSectionText = Get-ScopeCorrectionMarkdownSection -Content $normalizedAuditText -HeadingPattern ([regex]::Escape($auditSection))
        if ([regex]::Matches($normalizedAuditText, $auditHeadingPattern).Count -ne 1 -or [regex]::Matches($auditSectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $auditHasContradiction = $true
        }
    }
    if ([regex]::Matches($normalizedAuditText, '(?im)^##\s+Decision\s*$').Count -ne 1 -or [regex]::Matches($normalizedAuditText, '(?im)^\s*Decision\s*:\s*APPROVE\s*$').Count -ne 1) {
        $auditHasContradiction = $true
    }
    if ($auditHasContradiction) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION audit"
    }

    foreach ($evidenceMarker in @(
        "status: complete",
        "conflictsFound: false",
        "targetSourceReviewed: true",
        "targetTestsReviewed: true",
        "analogousImplementationReviewed: true",
        "Cost Calibration Gate remains blocked"
    )) {
        if ($EvidenceText -notmatch [regex]::Escape($evidenceMarker)) {
            Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_EVIDENCE_INCOMPLETE $evidenceMarker"
        }
    }
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results")) {
        if ((Get-ScopeCorrectionMarkdownSection -Content $EvidenceText -HeadingPattern ([regex]::Escape($evidenceSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_REVIEW_NOT_FINAL evidence_$($evidenceSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    foreach ($auditSection in @("Round 1", "Round 2")) {
        if ((Get-ScopeCorrectionMarkdownSection -Content $AuditText -HeadingPattern ([regex]::Escape($auditSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_$($auditSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    if ((Get-ScopeCorrectionMarkdownSection -Content $AuditText -HeadingPattern "Decision") -notmatch '(?im)^Decision:\s*APPROVE\s*$') {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_decision"
    }
}

function Test-P1F0115ScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$QueueLines
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
    $currentTaskId = Get-CurrentTaskId -Lines $ProjectStateLines
    $currentTaskStatus = Get-CurrentTaskStatus -Lines $ProjectStateLines
    $parentTaskBlock = @(Get-TaskBlock -Lines $QueueLines -Id $p1F0115ScopeCorrectionParentTaskId)
    $parentQueueStatus = if ($parentTaskBlock.Count -gt 0) { Get-ScalarValue -Block $parentTaskBlock -Key "status" } else { "" }

    if ($headSha -ne $p1F0115ScopeCorrectionBaseSha -or $branch -ne $p1F0115ScopeCorrectionBranch -or $currentTaskId -ne $p1F0115ScopeCorrectionParentTaskId -or $currentTaskStatus -ne "in_progress" -or $parentQueueStatus -ne "in_progress") {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_CONTEXT_INVALID"
    }

    $stagedFiles = @(& git -C $RepositoryRoot diff --cached --name-only --no-renames --diff-filter=ACMRTD | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $stagedFileInspectionExitCode = $LASTEXITCODE
    $stagedNameStatus = @(& git -C $RepositoryRoot diff --cached --name-status --no-renames --diff-filter=ACMRTD)
    $stagedNameStatusInspectionExitCode = $LASTEXITCODE
    $expectedFiles = @($p1F0115ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $hasInvalidStagedStatus = @($stagedNameStatus | Where-Object { $_ -notmatch '^[AM]\s+' }).Count -gt 0
    if ($stagedFileInspectionExitCode -ne 0 -or $stagedNameStatusInspectionExitCode -ne 0 -or $hasInvalidStagedStatus -or ($stagedFiles -join "|") -cne ($expectedFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_FILE_SET_INVALID"
    }

    $previousGitInspectionErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $hasIndexWorktreeSplit = $false
        foreach ($expectedFile in $expectedFiles) {
            $indexBlob = ((& git -C $RepositoryRoot rev-parse ":$expectedFile" 2>$null) -join "").Trim()
            $indexBlobInspectionExitCode = $LASTEXITCODE
            $worktreePath = Join-Path -Path $RepositoryRoot -ChildPath ($expectedFile -replace "/", "\")
            $worktreeBlob = if (Test-Path -LiteralPath $worktreePath -PathType Leaf) {
                ((& git -C $RepositoryRoot hash-object "--path=$expectedFile" -- $worktreePath) -join "").Trim()
            } else {
                ""
            }
            $worktreeBlobInspectionExitCode = $LASTEXITCODE
            if ($indexBlobInspectionExitCode -ne 0 -or $worktreeBlobInspectionExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($indexBlob) -or $indexBlob -ne $worktreeBlob) {
                $hasIndexWorktreeSplit = $true
                break
            }
        }
        $unstagedTrackedFiles = @(& git -C $RepositoryRoot diff --name-only --no-renames --diff-filter=ACMRTD)
        $unstagedTrackedInspectionExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard)
        $untrackedInspectionExitCode = $LASTEXITCODE
        if ($hasIndexWorktreeSplit -or $unstagedTrackedInspectionExitCode -ne 0 -or $unstagedTrackedFiles.Count -gt 0 -or $untrackedInspectionExitCode -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
        }
    } finally {
        $ErrorActionPreference = $previousGitInspectionErrorActionPreference
    }

    $materializedAuthorizationPath = ((& git -C $RepositoryRoot ls-tree -r --name-only HEAD -- $p1F0115ScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0115ScopeCorrectionAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $authorizationText = Get-P1F0115ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115ScopeCorrectionAuthorizationPath
    $normalizedAuthorizationText = $authorizationText -replace "`r`n?", "`n"
    foreach ($authorizationPattern in @(
        '(?im)^Status:\s*approved\s*$',
        '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1F0115ScopeCorrectionTaskId))[\x60]?\s*$",
        "(?im)^Parent task:\s*[\x60]?$([regex]::Escape($p1F0115ScopeCorrectionParentTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1F0115ScopeCorrectionBaseSha))[\x60]?\s*$",
        "(?im)^Branch:\s*[\x60]?$([regex]::Escape($p1F0115ScopeCorrectionBranch))[\x60]?\s*$",
        '(?i)every other.+in_progress.+hard-block',
        '(?i)(?:hook bypass.+not (?:approved|authorized)|does not authorize[^\r\n]*hook bypass)',
        '(?i)no product implementation.+migration/database execution.+dependency.+Provider.+browser/runtime.+P2.+PR.+force push.+deployment'
    )) {
        if ($authorizationText -notmatch $authorizationPattern) {
            Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }
    $capabilityAuthorizationSection = Get-ScopeCorrectionMarkdownSection -Content $normalizedAuthorizationText -HeadingPattern "Capability Authorization"
    $expectedCapabilityAuthorization = $p1F0115ScopeCorrectionCapabilityAuthorization -replace "`r`n?", "`n"
    $capabilityAuthorizationIsExact = [regex]::Matches($capabilityAuthorizationSection, [regex]::Escape($expectedCapabilityAuthorization)).Count -eq 1
    foreach ($capabilityAuthorizationLine in @($expectedCapabilityAuthorization -split "`n")) {
        $capabilityName = ($capabilityAuthorizationLine -split ':', 2)[0]
        if ([regex]::Matches($capabilityAuthorizationSection, "(?m)^$([regex]::Escape($capabilityName)):\s*.*$").Count -ne 1) {
            $capabilityAuthorizationIsExact = $false
        }
    }
    if (-not $capabilityAuthorizationIsExact) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID capability_authorization"
    }
    $authorizationHasContradiction = [regex]::Matches($normalizedAuthorizationText, '(?im)^##\s+Capability Authorization\s*$').Count -ne 1 -or
        [regex]::Matches($normalizedAuthorizationText, '(?im)^##\s+.*Authorization.*$').Count -ne 1 -or
        [regex]::Matches($normalizedAuthorizationText, '(?im)^\s*Status\s*:\s*approved\s*$').Count -ne 1 -or
        [regex]::Matches($normalizedAuthorizationText, '(?im)^\s*Status\s*:\s*.*$').Count -ne 1
    $canonicalCapabilityAuthorizationLines = @($expectedCapabilityAuthorization -split "`n")
    $actualCapabilityAuthorizationLines = @($capabilityAuthorizationSection -split "`n" | Where-Object { $_ -match '^[A-Za-z][A-Za-z0-9]*:\s*\S' })
    if (($actualCapabilityAuthorizationLines -join "`n") -cne ($canonicalCapabilityAuthorizationLines -join "`n")) {
        $authorizationHasContradiction = $true
    }
    foreach ($canonicalCapabilityAuthorizationLine in $canonicalCapabilityAuthorizationLines) {
        $canonicalCapabilityName = ($canonicalCapabilityAuthorizationLine -split ':', 2)[0]
        if ([regex]::Matches($normalizedAuthorizationText, "(?m)^$([regex]::Escape($canonicalCapabilityAuthorizationLine))$").Count -ne 1 -or
            [regex]::Matches($normalizedAuthorizationText, "(?m)^\s*$([regex]::Escape($canonicalCapabilityName))\s*:\s*.*$").Count -ne 1) {
            $authorizationHasContradiction = $true
        }
    }
    if ($authorizationHasContradiction) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION authorization"
    }
    $authorizationFileSection = Get-ScopeCorrectionMarkdownSection -Content $authorizationText -HeadingPattern "Exact Files"
    $authorizationFileLines = @($authorizationFileSection -split "`n" | Where-Object { $_ -match '^\s*-\s+[\x60]([^\x60]+)[\x60]\s*$' } | ForEach-Object { $Matches[1] })
    $authorizationBulletCount = @($authorizationFileSection -split "`n" | Where-Object { $_ -match '^\s*-\s+' }).Count
    if ($authorizationBulletCount -ne $p1F0115ScopeCorrectionFiles.Count -or ($authorizationFileLines -join "|") -cne ($p1F0115ScopeCorrectionFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID exact_files"
    }

    $queueGitPath = ConvertTo-NormalizedPath -Path $QueuePath
    $parentQueueText = (@(& git -C $RepositoryRoot show "HEAD:$queueGitPath" 2>$null) -join "`n") -replace "`r`n?", "`n"
    $parentQueueInspectionExitCode = $LASTEXITCODE
    $currentQueueText = (Get-P1F0115ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $QueuePath) -replace "`r`n?", "`n"
    $taskPattern = "(?ms)^  - id:\s*$([regex]::Escape($p1F0115ScopeCorrectionParentTaskId))\s*`n.*?(?=^  - id:|^standingAuthorization:|\z)"
    $parentTaskMatches = @([regex]::Matches($parentQueueText, $taskPattern))
    $currentTaskMatches = @([regex]::Matches($currentQueueText, $taskPattern))
    $queueDeltaIsValid = $parentQueueInspectionExitCode -eq 0 -and $parentTaskMatches.Count -eq 1 -and $currentTaskMatches.Count -eq 1
    if ($queueDeltaIsValid) {
        $parentTaskMatch = $parentTaskMatches[0]
        $currentTaskMatch = $currentTaskMatches[0]
        $expectedTaskBlock = $parentTaskMatch.Value
        $queueReplacements = @(
            @{ Label = "fresh_approval_source"; Anchor = $p1F0115ScopeCorrectionApprovalAnchor; Replacement = $p1F0115ScopeCorrectionApprovalReplacement },
            @{ Label = "rollback_boundary"; Anchor = $p1F0115ScopeCorrectionRollbackAnchor; Replacement = $p1F0115ScopeCorrectionRollbackReplacement },
            @{ Label = "focused_gates"; Anchor = $p1F0115ScopeCorrectionFocusedGatesAnchor; Replacement = $p1F0115ScopeCorrectionFocusedGatesReplacement },
            @{ Label = "product_allowlist"; Anchor = $p1F0115ScopeCorrectionAllowedFilesAnchor; Replacement = $p1F0115ScopeCorrectionAllowedFilesReplacement },
            @{ Label = "blocked_schema_and_drizzle_paths"; Anchor = $p1F0115ScopeCorrectionBlockedFilesAnchor; Replacement = $p1F0115ScopeCorrectionBlockedFilesReplacement },
            @{ Label = "schema_capability"; Anchor = $p1F0115ScopeCorrectionSchemaMigrationAnchor; Replacement = $p1F0115ScopeCorrectionSchemaMigrationReplacement },
            @{ Label = "acceptance_standards"; Anchor = $p1F0115ScopeCorrectionAcceptanceAnchor; Replacement = $p1F0115ScopeCorrectionAcceptanceReplacement },
            @{ Label = "focused_validation_command"; Anchor = $p1F0115ScopeCorrectionValidationAnchor; Replacement = $p1F0115ScopeCorrectionValidationReplacement }
        )
        foreach ($queueReplacement in $queueReplacements) {
            $anchorCount = [regex]::Matches($expectedTaskBlock, [regex]::Escape($queueReplacement.Anchor)).Count
            if ($anchorCount -ne 1) {
                Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID $($queueReplacement.Label)_anchor_count_$anchorCount"
                $queueDeltaIsValid = $false
                break
            }
            $expectedTaskBlock = $expectedTaskBlock.Replace($queueReplacement.Anchor, $queueReplacement.Replacement)
        }
        if ($queueDeltaIsValid) {
            foreach ($queueReplacement in @($queueReplacements | Where-Object { -not [string]::IsNullOrEmpty($_.Replacement) })) {
                $replacementCount = [regex]::Matches($currentTaskMatch.Value, [regex]::Escape($queueReplacement.Replacement)).Count
                if ($replacementCount -ne 1) {
                    Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID $($queueReplacement.Label)_replacement_count_$replacementCount"
                    $queueDeltaIsValid = $false
                }
            }
        }
        $parentPrefix = $parentQueueText.Substring(0, $parentTaskMatch.Index)
        $parentSuffix = $parentQueueText.Substring($parentTaskMatch.Index + $parentTaskMatch.Length)
        $currentPrefix = $currentQueueText.Substring(0, $currentTaskMatch.Index)
        $currentSuffix = $currentQueueText.Substring($currentTaskMatch.Index + $currentTaskMatch.Length)
        $expectedQueueText = $parentPrefix + $expectedTaskBlock + $parentSuffix
        if ($currentPrefix -cne $parentPrefix -or $currentSuffix -cne $parentSuffix -or $currentTaskMatch.Value -cne $expectedTaskBlock -or $currentQueueText -cne $expectedQueueText) {
            $queueDeltaIsValid = $false
        }
    }
    if (-not $queueDeltaIsValid) {
        Add-Finding "HARD_BLOCK_P1_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
    }

    $evidenceText = Get-P1F0115ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115ScopeCorrectionEvidencePath
    $auditText = Get-P1F0115ScopeCorrectionIndexText -RepositoryRoot $RepositoryRoot -Path $p1F0115ScopeCorrectionAuditPath
    Test-P1F0115ScopeCorrectionReviewContract -EvidenceText $evidenceText -AuditText $auditText
    $script:isP1F0115ScopeCorrectionCandidateValid = $script:findings.Count -eq $findingCountBefore
}

function Test-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $textExtensions = @(
        ".cjs",
        ".css",
        ".js",
        ".json",
        ".jsx",
        ".md",
        ".mjs",
        ".ps1",
        ".ts",
        ".tsx",
        ".txt",
        ".yaml",
        ".yml"
    )

    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    return $textExtensions -contains $extension -or [string]::IsNullOrWhiteSpace($extension)
}

function Resolve-ScanPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot,

        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return Join-Path -Path $RepositoryRoot -ChildPath $Path
}

function Test-IsExplicitNonSecretFixture {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value,
        [Parameter(Mandatory = $true)][bool]$WasQuoted,
        [Parameter(Mandatory = $true)][string]$FullPath,
        [Parameter(Mandatory = $true)][bool]$IsSqlExpression,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$SqlBody
    )

    $candidateValue = $Value.Trim().TrimEnd(',', ';', '}', ')', ']').Trim('"', "'", [char]96)
    $extension = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
    $sourceExtensions = @(".cjs", ".js", ".jsx", ".mjs", ".ps1", ".ts", ".tsx")

    if ($Label -eq "secret_assignment") {
        if ($candidateValue -in @("placeholder-password-hash-1", "placeholder-password-hash-2", "Bearer admin-session-token")) {
            return $true
        }
        if (-not $WasQuoted -and $extension -in $sourceExtensions -and $candidateValue -match '^[A-Za-z_$][A-Za-z0-9_$.]*$') {
            return $true
        }
        if ($IsSqlExpression -and $extension -in $sourceExtensions -and $SqlBody -notmatch '[''"]') {
            return $true
        }
    }

    if ($Label -in @("database_url", "database_connection_url")) {
        return $candidateValue -ceq "postgresql://tiku_plan_only:tiku_plan_only@127.0.0.1:5432/tiku_plan_only"
    }

    return $false
}

function Test-SensitiveEvidence {
    param(
        [Parameter(Mandatory = $true)]
        [string]$DisplayPath,

        [Parameter(Mandatory = $true)]
        [string]$FullPath
    )

    if (-not (Test-Path -LiteralPath $FullPath)) {
        return
    }

    if (-not (Test-TextFile -Path $FullPath)) {
        return
    }

    $apiKeyPattern = '(?i)\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*(?:(?<quote>[''"])(?<value>[^''"\r\n]{8,})\k<quote>|(?<sql>sql`(?<sqlBody>[^`]*)`)|(?<value>[^''"\s]{8,}))'
    $authHeaderPattern = "(?i)\bAuthori" + "zation\s*:\s*Bearer\s+\S+"
    $databaseUrlPattern = "(?i)\b[a-z0-9_]*DATABASE_URL\s*=\s*['""]?(?<value>[^'""\s]+)"
    $databaseConnectionPattern = "(?i)\b(?<value>postgres(?:ql)?://[^'""\s]+)"
    $privateKeyPattern = "BEGIN\s+(RSA\s+|OPENSSH\s+)?PRIVATE KEY"
    $providerKeyPattern = "(?<![A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}"
    $rawTerm = "ra" + "w"
    $promptTerm = "prom" + "pt"
    $responseTerm = "res" + "ponse"
    $answerTerm = "ans" + "wer"
    $providerPayloadTerm = "provider" + "Payload"
    $generatedContentTerm = "generated" + "Content"
    $aiProtectedFieldPattern = "(?i)\b($rawTerm[_-]?$promptTerm|$rawTerm[_-]?$responseTerm|$rawTerm[_-]?$answerTerm|$providerPayloadTerm|$generatedContentTerm)\b\s*[:=]\s*['""]?[^'""\s].{20,}"
    $redeemCodeField = "redeem" + "_code"
    $redeemCodePattern = "(?i)\b$redeemCodeField\b\s*[:=]\s*['""]?[A-Z0-9][A-Z0-9_-]{7,}"

    $patterns = @(
        @{ Label = "secret_assignment"; Pattern = $apiKeyPattern },
        @{ Label = "auth_header"; Pattern = $authHeaderPattern },
        @{ Label = "database_url"; Pattern = $databaseUrlPattern },
        @{ Label = "database_connection_url"; Pattern = $databaseConnectionPattern },
        @{ Label = "private_key"; Pattern = $privateKeyPattern },
        @{ Label = "provider_key"; Pattern = $providerKeyPattern },
        @{ Label = "ai_protected_text"; Pattern = $aiProtectedFieldPattern },
        @{ Label = "plaintext_redeem_code"; Pattern = $redeemCodePattern }
    )

    $lineNumber = 0
    foreach ($line in Get-Content -LiteralPath $FullPath) {
        $lineNumber++
        foreach ($pattern in $patterns) {
            foreach ($sensitiveMatch in [regex]::Matches($line, $pattern.Pattern)) {
                $wasQuoted = $sensitiveMatch.Groups["quote"].Success -and -not [string]::IsNullOrEmpty($sensitiveMatch.Groups["quote"].Value)
                $isSqlExpression = $sensitiveMatch.Groups["sql"].Success
                if (-not (Test-IsExplicitNonSecretFixture -Label $pattern.Label -Value $sensitiveMatch.Groups["value"].Value -WasQuoted $wasQuoted -FullPath $FullPath -IsSqlExpression $isSqlExpression -SqlBody $sensitiveMatch.Groups["sqlBody"].Value)) {
                    Add-Finding "HARD_BLOCK_SENSITIVE_EVIDENCE $DisplayPath`:$lineNumber $($pattern.Label)"
                }
            }
        }
    }
}

function Test-BannedTerminology {
    param(
        [Parameter(Mandatory = $true)]
        [string]$DisplayPath,

        [Parameter(Mandatory = $true)]
        [string]$FullPath
    )

    if (-not (Test-Path -LiteralPath $FullPath)) {
        return
    }

    if (-not (Test-TextFile -Path $FullPath)) {
        return
    }

    $bannedTerms = @(
        ("lic" + "ense"),
        ("exam" + "_paper")
    )

    $lineNumber = 0
    foreach ($line in Get-Content -LiteralPath $FullPath) {
        $lineNumber++
        foreach ($bannedTerm in $bannedTerms) {
            $termPattern = "\b$([regex]::Escape($bannedTerm))\b"
            if ($line -match $termPattern) {
                Add-Finding "HARD_BLOCK_BANNED_TERM $DisplayPath`:$lineNumber $bannedTerm"
            }
        }
    }
}

function Invoke-DocsOnlyBatchReadiness {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BatchId,

        [Parameter(Mandatory = $true)]
        [string]$Mode,

        [Parameter(Mandatory = $true)]
        [string]$ProjectStatePath,

        [Parameter(Mandatory = $true)]
        [string]$QueuePath,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    $batchScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2DocsOnlyBatchReadiness.ps1"
    if (-not (Test-Path -LiteralPath $batchScriptPath)) {
        Add-Finding "HARD_BLOCK_DOCS_ONLY_BATCH_READINESS_SCRIPT_MISSING $batchScriptPath"
        return
    }

    $batchArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $batchScriptPath,
        "-BatchId",
        $BatchId,
        "-Mode",
        $Mode,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath
    )

    if ($Files.Count -gt 0) {
        $batchArgs += "-ChangedFiles"
        $batchArgs += $Files
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $batchOutput = @(& powershell.exe @batchArgs 2>&1)
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $batchOutput | ForEach-Object { Write-Output $_ }
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_DOCS_ONLY_BATCH_READINESS_FAILED $BatchId"
    }
}

function Invoke-LowRiskExperienceBatchReadiness {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BatchId,

        [Parameter(Mandatory = $true)]
        [string]$Mode,

        [Parameter(Mandatory = $true)]
        [string]$ProjectStatePath,

        [Parameter(Mandatory = $true)]
        [string]$QueuePath,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    $batchScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2LowRiskExperienceBatchReadiness.ps1"
    if (-not (Test-Path -LiteralPath $batchScriptPath)) {
        Add-Finding "HARD_BLOCK_LOW_RISK_EXPERIENCE_BATCH_READINESS_SCRIPT_MISSING $batchScriptPath"
        return
    }

    $batchArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $batchScriptPath,
        "-BatchId",
        $BatchId,
        "-Mode",
        $Mode,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath
    )

    if ($Files.Count -gt 0) {
        $batchArgs += "-ChangedFiles"
        $batchArgs += $Files
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $batchOutput = @(& powershell.exe @batchArgs 2>&1)
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $batchOutput | ForEach-Object { Write-Output $_ }
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_LOW_RISK_EXPERIENCE_BATCH_READINESS_FAILED $BatchId"
    }
}

$findings = New-Object System.Collections.Generic.List[string]

Write-Section -Title "Module Run v2 Pre-Commit Hardening"
Write-Output "preCommitMode: hard_block"

foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing required file: $requiredPath"
    }
}

$insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
    throw "Module Run v2 pre-commit hardening must run inside a Git worktree."
}

$repositoryRoot = ((& git rev-parse --show-toplevel) -join "").Trim()
$projectStateLines = @(Get-Content -Path $ProjectStatePath)
$queueLines = @(Get-Content -Path $QueuePath)
$matrixContent = Get-Content -Path $MatrixPath -Raw
$filesToScan = @(Get-ChangedFiles -ExplicitFiles $ChangedFiles)
$isP1MechanismBootstrapPreCommitScopeCorrection = Test-P1MechanismBootstrapPreCommitScopeCorrectionCandidate -RepositoryRoot $repositoryRoot -Files $filesToScan -ProjectStateLines $projectStateLines -QueueLines $queueLines
$isP1MechanismBootstrapManualHashCorrection = Test-P1MechanismBootstrapManualHashCorrectionCandidate -RepositoryRoot $repositoryRoot -Files $filesToScan -ProjectStateLines $projectStateLines -QueueLines $queueLines
# C4-ADAPTER-ROUTING-BEGIN
$p1ApprovedSameTaskTransitionAutomatic = $null
$p1ApprovedSameTaskTransitionIsExactBootstrap = (Get-CurrentTaskId -Lines $projectStateLines) -ceq "p1-mechanism-execution-compatibility-v2-1-2026-07-19" `
    -and (Test-P1AstMechanismBootstrapFileSet -Files $filesToScan)
$p1ApprovedSameTaskTransitionNameStatus = @()
if (-not $p1ApprovedSameTaskTransitionIsExactBootstrap -and -not $isP1MechanismBootstrapPreCommitScopeCorrection -and -not $isP1MechanismBootstrapManualHashCorrection) {
    $p1ApprovedSameTaskTransitionNameStatus = @(Get-P1ApprovedSameTaskTransitionPreCommitNameStatus -RepositoryRoot $repositoryRoot)
}
$p1ApprovedSameTaskTransitionHistoricalExactRoutes = [ordered]@{
    "p1_transition_hotfix" = $p1TransitionHotfixFiles
    "p1_f0132_scope_correction" = $p1F0132ScopeCorrectionFiles
    "p1_f0115_phase11_scope_correction" = $p1F0115Phase11ScopeCorrectionFiles
    "p1_f0115_module_precommit_hotfix" = $p1F0115ModulePrecommitHotfixFiles
    "p1_f0116_designpath_guard_hotfix" = $p1F0116DesignPathGuardHotfixFiles
    "p1_f0116_scope_correction_guard_hotfix" = $p1F0116ScopeCorrectionGuardHotfixFiles
    "p1_f0117_spec_approval_transition_hotfix" = $p1F0117SpecApprovalTransitionHotfixFiles
    "p1_f0143_spec_approval_transition_hotfix" = $p1F0143SpecApprovalTransitionHotfixFiles
    "p1_f0117_smoke_scope_correction" = $p1F0117SmokeScopeCorrectionFiles
    "p1_f0117_smoke_scope_closeout_lifecycle_hotfix" = $p1F0117SmokeScopeCloseoutLifecycleHotfixFiles
    "p1_f0115_scope_correction" = $p1F0115ScopeCorrectionFiles
}
$p1ApprovedSameTaskTransitionHistoricalExactRoute = Select-P1ApprovedSameTaskTransitionHistoricalExactRoute `
    -NameStatusRecords $p1ApprovedSameTaskTransitionNameStatus `
    -HistoricalRoutes $p1ApprovedSameTaskTransitionHistoricalExactRoutes
if (-not $p1ApprovedSameTaskTransitionIsExactBootstrap -and -not $isP1MechanismBootstrapPreCommitScopeCorrection -and -not $isP1MechanismBootstrapManualHashCorrection -and -not $p1ApprovedSameTaskTransitionHistoricalExactRoute.Claimed) {
    $p1ApprovedSameTaskTransitionAutomatic = Get-P1ApprovedSameTaskTransitionStageInputs `
        -RepositoryRoot $repositoryRoot `
        -Phase pre_commit `
        -NameStatusRecords $p1ApprovedSameTaskTransitionNameStatus `
        -BaseReference "origin/master" `
        -CandidateReference ":" `
        -Branch ((& git -C $repositoryRoot branch --show-current) -join "").Trim() `
        -StatePath (($ProjectStatePath -replace '\\', '/').TrimStart('./')) `
        -QueuePath (($QueuePath -replace '\\', '/').TrimStart('./'))
}
if ($null -ne $p1ApprovedSameTaskTransitionAutomatic -and $p1ApprovedSameTaskTransitionAutomatic.Requested) {
    $p1ApprovedSameTaskTransitionDecision = Invoke-P1ApprovedSameTaskTransitionAdapter `
        -ContractText $p1ApprovedSameTaskTransitionAutomatic.ContractText `
        -SourcePath $p1ApprovedSameTaskTransitionAutomatic.SourcePath `
        -Facts $p1ApprovedSameTaskTransitionAutomatic.Facts
    foreach ($code in @($p1ApprovedSameTaskTransitionDecision.FindingCodes)) { Write-Output "p1ApprovedSameTaskTransitionCoreFinding: $code" }
    if (-not $p1ApprovedSameTaskTransitionDecision.Recognized -or -not $p1ApprovedSameTaskTransitionDecision.Valid) {
        Add-Finding "HARD_BLOCK_APPROVED_SAME_TASK_TRANSITION_INVALID $(@($p1ApprovedSameTaskTransitionDecision.FindingCodes) -join ',')"
    } else {
        Write-Output "p1ApprovedSameTaskTransitionMode: $($p1ApprovedSameTaskTransitionDecision.Mode)"
    }
}
# C4-ADAPTER-ROUTING-END
$isSeedTransactionScope = Test-SeedTransactionFileSet -Files $filesToScan
$isMechanicRepairScope = (-not $isSeedTransactionScope) -and (Test-MechanicRepairFileSet -Files $filesToScan)
$isP1TransitionHotfixScope = (-not $isSeedTransactionScope) -and (-not $isMechanicRepairScope) -and (Test-P1TransitionHotfixFileSet -Files $filesToScan)
$isP1F0132ScopeCorrectionScope = (-not $isSeedTransactionScope) -and (-not $isMechanicRepairScope) -and (-not $isP1TransitionHotfixScope) -and (Test-P1F0132ScopeCorrectionFileSet -Files $filesToScan)
$isP1F0115Phase11ScopeCorrectionScope = (-not $isSeedTransactionScope) -and (-not $isMechanicRepairScope) -and (-not $isP1TransitionHotfixScope) -and (-not $isP1F0132ScopeCorrectionScope) -and (Test-P1F0115Phase11ScopeCorrectionFileSet -Files $filesToScan)
$isP1F0115ModulePrecommitHotfixScope = (-not $isSeedTransactionScope) -and (-not $isMechanicRepairScope) -and (-not $isP1TransitionHotfixScope) -and (-not $isP1F0132ScopeCorrectionScope) -and (-not $isP1F0115Phase11ScopeCorrectionScope) -and (Test-P1F0115ModulePrecommitHotfixFileSet -Files $filesToScan)
$isP1F0116DesignPathGuardHotfixScope = (-not $isSeedTransactionScope) -and (-not $isMechanicRepairScope) -and (-not $isP1TransitionHotfixScope) -and (-not $isP1F0132ScopeCorrectionScope) -and (-not $isP1F0115Phase11ScopeCorrectionScope) -and (-not $isP1F0115ModulePrecommitHotfixScope) -and (Test-P1F0116DesignPathGuardHotfixFileSet -Files $filesToScan)
$isP1F0116ScopeCorrectionGuardHotfixScope = (-not $isSeedTransactionScope) -and (-not $isMechanicRepairScope) -and (-not $isP1TransitionHotfixScope) -and (-not $isP1F0132ScopeCorrectionScope) -and (-not $isP1F0115Phase11ScopeCorrectionScope) -and (-not $isP1F0115ModulePrecommitHotfixScope) -and (-not $isP1F0116DesignPathGuardHotfixScope) -and (Test-P1F0116ScopeCorrectionGuardHotfixFileSet -Files $filesToScan)
$normalizedFilesToScan = @($filesToScan | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
$p1F0117SmokeScopeCorrectionIdentityFiles = @(
    $p1F0117SmokeScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    $p1F0117SmokeScopeCorrectionEvidencePath,
    $p1F0117SmokeScopeCorrectionAuditPath
)
$isP1F0117SmokeScopeCorrectionCandidate = (-not $isSeedTransactionScope) `
    -and (-not $isMechanicRepairScope) `
    -and @($normalizedFilesToScan | Where-Object { $_ -in $p1F0117SmokeScopeCorrectionIdentityFiles }).Count -gt 0
$isP1F0117SmokeScopeCorrectionScope = $isP1F0117SmokeScopeCorrectionCandidate -and (Test-P1F0117SmokeScopeCorrectionFileSet -Files $filesToScan)
$p1F0117SmokeScopeCloseoutLifecycleHotfixIdentityFiles = @(
    $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md",
    $p1F0117SmokeScopeCloseoutLifecycleHotfixEvidencePath,
    $p1F0117SmokeScopeCloseoutLifecycleHotfixAuditPath
)
$isP1F0117SmokeScopeCloseoutLifecycleHotfixCandidate = (-not $isSeedTransactionScope) `
    -and (-not $isMechanicRepairScope) `
    -and @($normalizedFilesToScan | Where-Object { $_ -in $p1F0117SmokeScopeCloseoutLifecycleHotfixIdentityFiles }).Count -gt 0
$isP1F0117SmokeScopeCloseoutLifecycleHotfixScope = $isP1F0117SmokeScopeCloseoutLifecycleHotfixCandidate -and (Test-P1F0117SmokeScopeCloseoutLifecycleHotfixFileSet -Files $filesToScan)
$p1F0117IdentityFiles = @(
    $p1F0117SpecApprovalTransitionHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    $p1F0117SpecApprovalTransitionHotfixEvidencePath,
    $p1F0117SpecApprovalTransitionHotfixAuditPath
)
$isP1F0117SpecApprovalTransitionHotfixCandidate = (-not $isSeedTransactionScope) `
    -and (-not $isMechanicRepairScope) `
    -and "docs/04-agent-system/state/project-state.yaml" -in $normalizedFilesToScan `
    -and "docs/04-agent-system/state/task-queue.yaml" -in $normalizedFilesToScan `
    -and @($normalizedFilesToScan | Where-Object { $_ -in $p1F0117IdentityFiles }).Count -gt 0
$isP1F0117SpecApprovalTransitionHotfixScope = $isP1F0117SpecApprovalTransitionHotfixCandidate -and (Test-P1F0117SpecApprovalTransitionHotfixFileSet -Files $filesToScan)
$p1F0143IdentityFiles = @(
    $p1F0143SpecApprovalTransitionHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md",
    $p1F0143SpecApprovalTransitionHotfixEvidencePath,
    $p1F0143SpecApprovalTransitionHotfixAuditPath
)
$isP1F0143SpecApprovalTransitionHotfixCandidate = (-not $isSeedTransactionScope) `
    -and (-not $isMechanicRepairScope) `
    -and $normalizedFilesToScan -ccontains "docs/04-agent-system/state/project-state.yaml" `
    -and $normalizedFilesToScan -ccontains "docs/04-agent-system/state/task-queue.yaml" `
    -and @($normalizedFilesToScan | Where-Object { $p1F0143IdentityFiles -ccontains $_ }).Count -gt 0
$isP1F0143SpecApprovalTransitionHotfixScope = $isP1F0143SpecApprovalTransitionHotfixCandidate -and (Test-P1F0143SpecApprovalTransitionHotfixFileSet -Files $filesToScan)
$isP1F0115ScopeCorrectionScope = (-not $isSeedTransactionScope) -and (-not $isMechanicRepairScope) -and (-not $isP1TransitionHotfixScope) -and (-not $isP1F0132ScopeCorrectionScope) -and (-not $isP1F0115Phase11ScopeCorrectionScope) -and (-not $isP1F0115ModulePrecommitHotfixScope) -and (-not $isP1F0116DesignPathGuardHotfixScope) -and (-not $isP1F0116ScopeCorrectionGuardHotfixScope) -and (-not $isP1F0117SpecApprovalTransitionHotfixScope) -and (-not $isP1F0143SpecApprovalTransitionHotfixScope) -and (-not $isP1F0117SmokeScopeCorrectionScope) -and (-not $isP1F0117SmokeScopeCloseoutLifecycleHotfixScope) -and (Test-P1F0115ScopeCorrectionFileSet -Files $filesToScan)
$isP1F0115ScopeCorrectionCandidateValid = $false
$isP1F0117SpecApprovalTransitionHotfixAllowlistMismatch = $isP1F0117SpecApprovalTransitionHotfixCandidate -and -not $isP1F0117SpecApprovalTransitionHotfixScope
if ($isP1F0117SpecApprovalTransitionHotfixAllowlistMismatch) {
    Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALLOWLIST_MISMATCH"
}
$isP1F0143SpecApprovalTransitionHotfixAllowlistMismatch = $isP1F0143SpecApprovalTransitionHotfixCandidate -and -not $isP1F0143SpecApprovalTransitionHotfixScope
if ($isP1F0143SpecApprovalTransitionHotfixAllowlistMismatch) {
    Add-Finding "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_ALLOWLIST_MISMATCH"
}
if ($isP1F0117SmokeScopeCorrectionCandidate -and -not $isP1F0117SmokeScopeCorrectionScope) {
    Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_ALLOWLIST_MISMATCH"
}
if ($isP1F0117SmokeScopeCloseoutLifecycleHotfixCandidate -and -not $isP1F0117SmokeScopeCloseoutLifecycleHotfixScope) {
    Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_ALLOWLIST_MISMATCH"
}
$isDocsOnlyBatchScope = -not [string]::IsNullOrWhiteSpace($DocsOnlyBatchId)
$isLowRiskExperienceBatchScope = -not [string]::IsNullOrWhiteSpace($LowRiskExperienceBatchId)
$taskBlock = @()

if ($isDocsOnlyBatchScope -and $isLowRiskExperienceBatchScope) {
    throw "Use either DocsOnlyBatchId or LowRiskExperienceBatchId, not both."
}

if (-not $isSeedTransactionScope -and -not $isMechanicRepairScope -and -not $isP1TransitionHotfixScope -and -not $isP1F0132ScopeCorrectionScope -and -not $isP1F0115Phase11ScopeCorrectionScope -and -not $isP1F0115ModulePrecommitHotfixScope -and -not $isP1F0116DesignPathGuardHotfixScope -and -not $isP1F0116ScopeCorrectionGuardHotfixScope -and -not $isP1F0117SpecApprovalTransitionHotfixScope -and -not $isP1F0143SpecApprovalTransitionHotfixScope -and -not $isP1F0117SmokeScopeCorrectionScope -and -not $isP1F0117SmokeScopeCloseoutLifecycleHotfixScope -and -not $isP1F0115ScopeCorrectionScope -and -not $isP1MechanismBootstrapPreCommitScopeCorrection -and -not $isP1MechanismBootstrapManualHashCorrection -and -not $isDocsOnlyBatchScope -and -not $isLowRiskExperienceBatchScope -and [string]::IsNullOrWhiteSpace($TaskId)) {
    $TaskId = Get-CurrentTaskId -Lines $projectStateLines
}

if ($isSeedTransactionScope) {
    $TaskId = "module-run-v2-auto-seed-transaction"
    $allowedFiles = @(
        "docs/04-agent-system/state/task-queue.yaml",
        "docs/04-agent-system/state/project-state.yaml",
        "docs/04-agent-system/state/*-auto-seed-approval-decision.yaml",
        "docs/05-execution-logs/task-plans/*-auto-seed*.md",
        "docs/05-execution-logs/evidence/*-auto-seed*.md",
        "docs/05-execution-logs/audits-reviews/*-auto-seed*.md",
        "docs/05-execution-logs/evidence/batch-*.md",
        "docs/05-execution-logs/audits-reviews/batch-*.md"
    )
    $blockedFiles = @(
        ".env.local",
        ".env.example",
        "package.json",
        "pnpm-lock.yaml",
        "package-lock.yaml",
        "package-lock.json",
        "src/**",
        "tests/**",
        "e2e/**",
        "src/db/schema/**",
        "drizzle/**",
        "materials/**",
        "paper_assets/**",
        "docs/01-requirements/stories/**"
    )
} elseif ($isMechanicRepairScope) {
    $TaskId = "module-run-v2-mechanic-repair"
    $allowedFiles = @(
        "scripts/agent-system/*.ps1",
        "docs/04-agent-system/state/project-state.yaml",
        "docs/04-agent-system/state/autodrive-control-schema.yaml",
        "docs/04-agent-system/state/mechanism-source-of-truth-index.yaml",
        "docs/04-agent-system/sop/*.md",
        "docs/05-execution-logs/task-plans/*-module-run-v2-mechanic-*.md",
        "docs/05-execution-logs/evidence/*-module-run-v2-mechanic-*.md",
        "docs/05-execution-logs/audits-reviews/*-module-run-v2-mechanic-*.md"
    )
    $blockedFiles = @(
        ".env.local",
        ".env.example",
        "package.json",
        "pnpm-lock.yaml",
        "package-lock.yaml",
        "package-lock.json",
        "src/**",
        "tests/**",
        "e2e/**",
        "src/db/schema/**",
        "drizzle/**",
        "materials/**",
        "paper_assets/**",
        "docs/01-requirements/stories/**"
    )
} elseif ($isP1MechanismBootstrapManualHashCorrection) {
    $TaskId = "p1-mechanism-execution-compatibility-v2-1-2026-07-19"
    $allowedFiles = @($p1MechanismBootstrapManualHashCorrectionFiles)
    $blockedFiles = @("AGENTS.md", ".husky/**", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1MechanismBootstrapPreCommitScopeCorrection) {
    $TaskId = $p1MechanismBootstrapPreCommitScopeCorrectionTaskId
    $allowedFiles = @($p1MechanismBootstrapPreCommitScopeCorrectionFiles)
    $blockedFiles = @("AGENTS.md", ".husky/**", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1TransitionHotfixScope) {
    $TaskId = $p1TransitionHotfixTaskId
    $allowedFiles = @($p1TransitionHotfixFiles)
    $blockedFiles = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0132ScopeCorrectionScope) {
    $TaskId = $p1F0132ScopeCorrectionTaskId
    $allowedFiles = @($p1F0132ScopeCorrectionFiles)
    $blockedFiles = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0115Phase11ScopeCorrectionScope) {
    $TaskId = $p1F0115Phase11ScopeCorrectionTaskId
    $allowedFiles = @($p1F0115Phase11ScopeCorrectionFiles)
    $blockedFiles = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0115ModulePrecommitHotfixScope) {
    $TaskId = $p1F0115ModulePrecommitHotfixTaskId
    $allowedFiles = @($p1F0115ModulePrecommitHotfixFiles)
    $blockedFiles = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0116DesignPathGuardHotfixScope) {
    $TaskId = $p1F0116DesignPathGuardHotfixTaskId
    $allowedFiles = @($p1F0116DesignPathGuardHotfixFiles)
    $blockedFiles = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0116ScopeCorrectionGuardHotfixScope) {
    $TaskId = $p1F0116ScopeCorrectionGuardHotfixTaskId
    $allowedFiles = @($p1F0116ScopeCorrectionGuardHotfixFiles)
    $blockedFiles = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0117SpecApprovalTransitionHotfixScope) {
    $TaskId = $p1F0117SpecApprovalTransitionHotfixTaskId
    $allowedFiles = @($p1F0117SpecApprovalTransitionHotfixFiles)
    $blockedFiles = @("AGENTS.md", ".husky/**", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0143SpecApprovalTransitionHotfixScope) {
    $TaskId = $p1F0143SpecApprovalTransitionHotfixTaskId
    $allowedFiles = @($p1F0143SpecApprovalTransitionHotfixFiles)
    $blockedFiles = @("AGENTS.md", ".husky/**", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0117SmokeScopeCorrectionScope) {
    $TaskId = $p1F0117SmokeScopeCorrectionTaskId
    $allowedFiles = @($p1F0117SmokeScopeCorrectionFiles)
    $blockedFiles = @("AGENTS.md", ".husky/**", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isP1F0117SmokeScopeCloseoutLifecycleHotfixScope) {
    $TaskId = $p1F0117SmokeScopeCloseoutLifecycleHotfixTaskId
    $allowedFiles = @($p1F0117SmokeScopeCloseoutLifecycleHotfixFiles)
    $blockedFiles = @("AGENTS.md", ".husky/**", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**", "docs/04-agent-system/state/**")
} elseif ($isP1F0115ScopeCorrectionScope) {
    $TaskId = $p1F0115ScopeCorrectionTaskId
    $allowedFiles = @($p1F0115ScopeCorrectionFiles)
    $blockedFiles = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "src/**", "tests/**", "e2e/**", "src/db/schema/**", "drizzle/**", "migrations/**", ".env*", "D:/tiku-readonly-audit/**")
} elseif ($isDocsOnlyBatchScope) {
    $TaskId = "docs-only-batch:$DocsOnlyBatchId"
    $allowedFiles = @()
    $blockedFiles = @()
} elseif ($isLowRiskExperienceBatchScope) {
    $TaskId = "low-risk-experience-batch:$LowRiskExperienceBatchId"
    $allowedFiles = @()
    $blockedFiles = @()
} else {
    $taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        throw "Task not found in queue: $TaskId"
    }

    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
}

Write-Output "taskId: $TaskId"
if (-not $isP1F0115ScopeCorrectionScope) {
    Write-Output "preCommitScopeMode: $(if ($isSeedTransactionScope) { "seed_transaction" } elseif ($isMechanicRepairScope) { "mechanic_repair" } elseif ($isP1MechanismBootstrapManualHashCorrection) { "p1_mechanism_bootstrap_manual_hash_correction" } elseif ($isP1MechanismBootstrapPreCommitScopeCorrection) { "p1_mechanism_bootstrap_scope_correction" } elseif ($isP1TransitionHotfixScope) { "p1_transition_hotfix" } elseif ($isP1F0132ScopeCorrectionScope) { "p1_f0132_scope_correction" } elseif ($isP1F0115Phase11ScopeCorrectionScope) { "p1_f0115_phase11_scope_correction" } elseif ($isP1F0115ModulePrecommitHotfixScope) { "p1_f0115_module_precommit_hotfix" } elseif ($isP1F0116DesignPathGuardHotfixScope) { "p1_f0116_designpath_guard_hotfix" } elseif ($isP1F0116ScopeCorrectionGuardHotfixScope) { "p1_f0116_scope_correction_guard_hotfix" } elseif ($isP1F0117SpecApprovalTransitionHotfixScope) { "p1_f0117_spec_approval_transition_hotfix" } elseif ($isP1F0143SpecApprovalTransitionHotfixScope) { "p1_f0143_spec_approval_transition_hotfix" } elseif ($isP1F0117SmokeScopeCorrectionScope) { "p1_f0117_smoke_scope_correction" } elseif ($isP1F0117SmokeScopeCloseoutLifecycleHotfixScope) { "p1_f0117_smoke_scope_closeout_lifecycle_hotfix" } elseif ($isDocsOnlyBatchScope) { "docs_only_batch" } elseif ($isLowRiskExperienceBatchScope) { "low_risk_experience_batch" } else { "task" })"
}
Write-Output "filesToScan: $($filesToScan.Count)"

Write-Section -Title "Module Run v2 Anchors"
if ($matrixContent -match "moduleRunVersion:\s*2") {
    Write-Output "moduleRunVersion: 2"
} else {
    Add-Finding "HARD_BLOCK_MISSING_ANCHOR moduleRunVersion: 2"
}

if ($matrixContent -match "Cost Calibration Gate remains blocked") {
    Write-Output "Cost Calibration Gate remains blocked"
} else {
    Add-Finding "HARD_BLOCK_MISSING_ANCHOR Cost Calibration Gate remains blocked"
}

if ($isDocsOnlyBatchScope) {
    Write-Section -Title "Docs-Only Batch Readiness"
    Invoke-DocsOnlyBatchReadiness -BatchId $DocsOnlyBatchId -Mode $DocsOnlyBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -Files $filesToScan
}
if ($isLowRiskExperienceBatchScope) {
    Write-Section -Title "Low-Risk Experience Batch Readiness"
    Invoke-LowRiskExperienceBatchReadiness -BatchId $LowRiskExperienceBatchId -Mode $LowRiskExperienceBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -Files $filesToScan
}

Write-Section -Title "Requirement SSOT Readiness"
if ($isSeedTransactionScope -or $isMechanicRepairScope -or $isP1MechanismBootstrapPreCommitScopeCorrection -or $isP1MechanismBootstrapManualHashCorrection -or $isP1TransitionHotfixScope -or $isP1F0132ScopeCorrectionScope -or $isP1F0115Phase11ScopeCorrectionScope -or $isP1F0115ModulePrecommitHotfixScope -or $isP1F0116DesignPathGuardHotfixScope -or $isP1F0116ScopeCorrectionGuardHotfixScope -or $isP1F0117SpecApprovalTransitionHotfixScope -or $isP1F0143SpecApprovalTransitionHotfixScope -or $isP1F0117SmokeScopeCorrectionScope -or $isP1F0117SmokeScopeCloseoutLifecycleHotfixScope -or $isP1F0115ScopeCorrectionScope -or $isDocsOnlyBatchScope -or $isLowRiskExperienceBatchScope) {
    Write-Output "requirementSsotReadiness: skipped_$(
        if ($isSeedTransactionScope) { "seed_transaction" }
        elseif ($isP1MechanismBootstrapManualHashCorrection) { "p1_mechanism_bootstrap_manual_hash_correction" }
        elseif ($isP1MechanismBootstrapPreCommitScopeCorrection) { "p1_mechanism_bootstrap_scope_correction" }
        elseif ($isMechanicRepairScope) { "mechanic_repair" }
        elseif ($isP1TransitionHotfixScope) { "p1_transition_hotfix" }
        elseif ($isP1F0132ScopeCorrectionScope) { "p1_f0132_scope_correction" }
        elseif ($isP1F0115Phase11ScopeCorrectionScope) { "p1_f0115_phase11_scope_correction" }
        elseif ($isP1F0115ModulePrecommitHotfixScope) { "p1_f0115_module_precommit_hotfix" }
        elseif ($isP1F0116DesignPathGuardHotfixScope) { "p1_f0116_designpath_guard_hotfix" }
        elseif ($isP1F0116ScopeCorrectionGuardHotfixScope) { "p1_f0116_scope_correction_guard_hotfix" }
        elseif ($isP1F0117SpecApprovalTransitionHotfixScope) { "p1_f0117_spec_approval_transition_hotfix" }
        elseif ($isP1F0143SpecApprovalTransitionHotfixScope) { "p1_f0143_spec_approval_transition_hotfix" }
        elseif ($isP1F0117SmokeScopeCorrectionScope) { "p1_f0117_smoke_scope_correction" }
        elseif ($isP1F0117SmokeScopeCloseoutLifecycleHotfixScope) { "p1_f0117_smoke_scope_closeout_lifecycle_hotfix" }
        elseif ($isP1F0115ScopeCorrectionScope) { "p1_f0115_scope_correction" }
        elseif ($isDocsOnlyBatchScope) { "docs_only_batch" }
        else { "low_risk_experience_batch" }
    )"
} else {
    Test-RequirementSsotReadiness -RepositoryRoot $repositoryRoot -TaskId $TaskId -TaskBlock $taskBlock -Files $filesToScan
}

Write-Section -Title "Scope Scan"
if ($SkipScopeScan) {
    Write-Output "scopeScan: skipped"
} elseif ($isDocsOnlyBatchScope) {
    Write-Output "scopeScan: delegated_docs_only_batch"
} elseif ($isLowRiskExperienceBatchScope) {
    Write-Output "scopeScan: delegated_low_risk_experience_batch"
} elseif ($filesToScan.Count -eq 0) {
    Write-Output "scopeScan: no changed files"
} else {
    if ($isSeedTransactionScope) {
        Test-SeedTransactionAnchors -RepositoryRoot $repositoryRoot -Files $filesToScan
    } elseif ($isMechanicRepairScope) {
        Test-MechanicRepairAnchors -RepositoryRoot $repositoryRoot -Files $filesToScan
    } elseif ($isP1MechanismBootstrapManualHashCorrection) {
        Write-Output "P1 mechanism bootstrap manual-hash self-integrity correction anchors delegated to the P1 guard."
    } elseif ($isP1MechanismBootstrapPreCommitScopeCorrection) {
        Write-Output "P1 mechanism bootstrap pre-commit scope-correction anchors delegated to the P1 guard."
    } elseif ($isP1TransitionHotfixScope) {
        Test-P1TransitionHotfixAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0132ScopeCorrectionScope) {
        Test-P1F0132ScopeCorrectionAnchors -RepositoryRoot $repositoryRoot -QueuePath $QueuePath -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0115Phase11ScopeCorrectionScope) {
        Test-P1F0115Phase11ScopeCorrectionAnchors -RepositoryRoot $repositoryRoot -QueuePath $QueuePath -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0115ModulePrecommitHotfixScope) {
        Test-P1F0115ModulePrecommitHotfixAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0116DesignPathGuardHotfixScope) {
        Test-P1F0116DesignPathGuardHotfixAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0116ScopeCorrectionGuardHotfixScope) {
        Test-P1F0116ScopeCorrectionGuardHotfixAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0117SpecApprovalTransitionHotfixScope) {
        Test-P1F0117SpecApprovalTransitionHotfixAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0143SpecApprovalTransitionHotfixCandidate) {
        Test-P1F0143SpecApprovalTransitionHotfixAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0117SmokeScopeCorrectionScope) {
        Test-P1F0117SmokeScopeCorrectionAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0117SmokeScopeCloseoutLifecycleHotfixScope) {
        Test-P1F0117SmokeScopeCloseoutLifecycleHotfixAnchors -RepositoryRoot $repositoryRoot -ProjectStateLines $projectStateLines -QueueLines $queueLines
    } elseif ($isP1F0115ScopeCorrectionScope) {
        Test-P1F0115ScopeCorrectionAnchors -RepositoryRoot $repositoryRoot -QueuePath $QueuePath -ProjectStateLines $projectStateLines -QueueLines $queueLines
    }

    foreach ($changedFile in $filesToScan) {
        $allowedPattern = Get-MatchingPattern -Path $changedFile -Patterns $allowedFiles
        $blockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $blockedFiles

        if (-not [string]::IsNullOrWhiteSpace($allowedPattern)) {
            Write-Output "OK_SCOPE $changedFile matches $allowedPattern"
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($blockedPattern)) {
            Add-Finding "HARD_BLOCK_BLOCKED_FILE $changedFile matches $blockedPattern"
            continue
        }

        Add-Finding "HARD_BLOCK_OUT_OF_SCOPE $changedFile"
    }
}

Write-Section -Title "Sensitive Evidence Scan"
foreach ($changedFile in $filesToScan) {
    $fullPath = Resolve-ScanPath -RepositoryRoot $repositoryRoot -Path $changedFile
    Test-SensitiveEvidence -DisplayPath $changedFile -FullPath $fullPath
}

Write-Section -Title "Terminology Scan"
foreach ($changedFile in $filesToScan) {
    $fullPath = Resolve-ScanPath -RepositoryRoot $repositoryRoot -Path $changedFile
    Test-BannedTerminology -DisplayPath $changedFile -FullPath $fullPath
}

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    throw "Module Run v2 pre-commit hardening failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

if ($isP1F0115ScopeCorrectionScope -and $isP1F0115ScopeCorrectionCandidateValid) {
    Write-Output "preCommitScopeMode: p1_f0115_scope_correction"
    Write-Output "p1F0115ScopeCorrectionAuthorization: approved_one_time"
}
if ($isP1MechanismBootstrapPreCommitScopeCorrection) {
    Write-Output "preCommitScopeMode: p1_mechanism_bootstrap_scope_correction"
    Write-Output "p1MechanismBootstrapPreCommitScopeCorrection: approved_one_time"
}
if ($isP1MechanismBootstrapManualHashCorrection) {
    Write-Output "preCommitScopeMode: p1_mechanism_bootstrap_manual_hash_correction"
    Write-Output "p1MechanismBootstrapManualHashCorrection: approved_one_time"
}
Write-Output "pre-commit hardening passed"
