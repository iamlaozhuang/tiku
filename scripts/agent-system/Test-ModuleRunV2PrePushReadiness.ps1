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
    [string]$EvidencePath = "",

    [Parameter(Mandatory = $false)]
    [string]$AuditReviewPath = "",

    [Parameter(Mandatory = $false)]
    [switch]$SkipRemoteAheadCheck,

    [Parameter(Mandatory = $false)]
    [ValidateSet("standard", "transition_only")]
    [string]$P1TransitionScopeMode = "standard",

    [Parameter(Mandatory = $false)]
    [string]$DocsOnlyBatchId = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("shadow", "hard_block")]
    [string]$DocsOnlyBatchMode = "hard_block",

    [Parameter(Mandatory = $false)]
    [string]$LowRiskExperienceBatchId = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("shadow", "hard_block")]
    [string]$LowRiskExperienceBatchMode = "hard_block"
)

$ErrorActionPreference = "Stop"
New-Variable -Name p1F0115ScopeCorrectionParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
New-Variable -Name p1F0115ScopeCorrectionBaseSha -Option Constant -Value "6bde2f2aec3d71fa0ce138b26f64243861cace6f"
New-Variable -Name p1F0115ScopeCorrectionAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md"
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
    "docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md"
)
New-Variable -Name p1F0115Phase11ScopeCorrectionBaseSha -Option Constant -Value "582c156afb0cdde8a3daa99785fda8540b56fe27"
New-Variable -Name p1F0115Phase11ScopeCorrectionAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-authorization.md"
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
    "docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
)
New-Variable -Name p1F0115ModulePrecommitHotfixBaseSha -Option Constant -Value "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
New-Variable -Name p1F0115ModulePrecommitHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-17-p1-remediation-efficiency-mechanism-tuning-authorization.md"
New-Variable -Name p1F0115ModulePrecommitHotfixFiles -Option Constant -Value @(
    "docs/04-agent-system/sop/p1-remediation-efficiency-loop.md",
    $p1F0115ModulePrecommitHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md",
    "docs/05-execution-logs/evidence/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md",
    "docs/05-execution-logs/audits-reviews/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0116DesignPathGuardHotfixBaseSha -Option Constant -Value "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
New-Variable -Name p1F0116DesignPathGuardHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-17-p1-f0116-designpath-guard-hotfix-authorization.md"
New-Variable -Name p1F0116DesignPathGuardHotfixFiles -Option Constant -Value @(
    $p1F0116DesignPathGuardHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-designpath-guard-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-17-p1-f0116-designpath-guard-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0116-designpath-guard-hotfix.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixParentTaskId -Option Constant -Value "p1-remediation-rc-02-employee-import-preflight-2026-07-17"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixBaseSha -Option Constant -Value "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixAuthorizationPath -Option Constant -Value "docs/05-execution-logs/acceptance/2026-07-18-p1-f0116-scope-correction-guard-hotfix-authorization.md"
New-Variable -Name p1F0116ScopeCorrectionGuardHotfixFiles -Option Constant -Value @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md",
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
New-Variable -Name p1F0117SpecApprovalTransitionHotfixFiles -Option Constant -Value @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $p1F0117SpecApprovalTransitionHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
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
New-Variable -Name p1F0117SmokeScopeCorrectionFiles -Option Constant -Value @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $p1F0117SmokeScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
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
New-Variable -Name p1F0117SmokeScopeCloseoutLifecycleHotfixFiles -Option Constant -Value @(
    $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md",
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)

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

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-CurrentTaskId {
    param(
        [Parameter(Mandatory = $true)]
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

function Get-CurrentTaskStatus {
    param([Parameter(Mandatory = $true)][string[]]$Lines)

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }
        if ($insideCurrentTask -and $line -match "^\S") { break }
        if ($insideCurrentTask -and $line -match "^\s+status:\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }
    return ""
}

function Test-RequiredPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$MissingCode,

        [Parameter(Mandatory = $true)]
        [string]$OkCode
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        Add-Finding "$MissingCode missing_path_value"
        return
    }

    if (-not (Test-Path -LiteralPath $Path)) {
        Add-Finding "$MissingCode $Path"
        return
    }

    Write-Output "$OkCode $Path"
}

function Get-ProjectScalar {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Lines) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-LowRiskExperienceBatchId {
    param([Parameter(Mandatory = $true)][string[]]$TaskBlock)

    $flatBatchId = Get-ScalarValue -Block $TaskBlock -Key "lowRiskExperienceBatchId"
    if (-not [string]::IsNullOrWhiteSpace($flatBatchId)) {
        return $flatBatchId
    }

    $insideBatch = $false
    foreach ($line in $TaskBlock) {
        if ($line -match "^\s+lowRiskExperienceBatch:\s*$") {
            $insideBatch = $true
            continue
        }

        if ($insideBatch -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if ($insideBatch -and $line -match "^\s+id:\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Test-GitAncestor {
    param(
        [Parameter(Mandatory = $true)][string]$AncestorSha,
        [Parameter(Mandatory = $true)][string]$DescendantSha
    )

    if ([string]::IsNullOrWhiteSpace($AncestorSha) -or [string]::IsNullOrWhiteSpace($DescendantSha)) {
        return $false
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & git cat-file -e "$AncestorSha^{commit}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            return $false
        }

        & git cat-file -e "$DescendantSha^{commit}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            return $false
        }

        & git merge-base --is-ancestor $AncestorSha $DescendantSha 2>$null
        return $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $candidatePath = $Path.Replace("\", "/")
    while ($candidatePath.StartsWith("./", [System.StringComparison]::Ordinal)) {
        $candidatePath = $candidatePath.Substring(2)
    }
    return $candidatePath.TrimStart("/")
}

function Test-P1F0115TransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha
    )

    if ($TaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskStatus -ne "in_progress" `
        -or $TaskStatus -ne "in_progress" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0115ScopeCorrectionBaseSha `
        -or [string]::IsNullOrWhiteSpace($StateMasterSha) `
        -or $StateMasterSha -ne $StateOriginMasterSha `
        -or -not (Test-GitAncestor -AncestorSha $StateMasterSha -DescendantSha $OriginMasterSha) `
        -or $OriginMasterSha -eq $MasterSha) {
        return $false
    }

    $headParentLine = ((& git rev-list --parents -n 1 $MasterSha) -join "").Trim()
    $headParentInspectionExitCode = $LASTEXITCODE
    $headParentParts = @($headParentLine -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($headParentInspectionExitCode -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $OriginMasterSha) {
        return $false
    }

    $committedNameStatus = @(& git diff-tree --no-commit-id --name-status --no-renames -r $MasterSha)
    $committedFileInspectionExitCode = $LASTEXITCODE
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    $hasInvalidCommittedStatus = $false
    foreach ($committedEntry in $committedNameStatus) {
        if ($committedEntry -notmatch '^([AM])\s+(.+)$') {
            $hasInvalidCommittedStatus = $true
            continue
        }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $committedFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0115ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($committedFileInspectionExitCode -ne 0 -or $hasInvalidCommittedStatus -or ($committedFiles -join "|") -cne ($expectedFiles -join "|")) {
        return $false
    }

    $parentAuthorizationPath = ((& git ls-tree -r --name-only $OriginMasterSha -- $p1F0115ScopeCorrectionAuthorizationPath) -join "").Trim()
    $parentAuthorizationInspectionExitCode = $LASTEXITCODE
    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0115ScopeCorrectionAuthorizationPath) -join "").Trim()
    $headAuthorizationInspectionExitCode = $LASTEXITCODE
    return $parentAuthorizationInspectionExitCode -eq 0 `
        -and [string]::IsNullOrWhiteSpace($parentAuthorizationPath) `
        -and $headAuthorizationInspectionExitCode -eq 0 `
        -and $headAuthorizationPath -eq $p1F0115ScopeCorrectionAuthorizationPath
}

function Test-P1F0115Phase11TransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha
    )

    if ($TaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskStatus -ne "in_progress" `
        -or $TaskStatus -ne "in_progress" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0115Phase11ScopeCorrectionBaseSha `
        -or [string]::IsNullOrWhiteSpace($StateMasterSha) `
        -or $StateMasterSha -ne $StateOriginMasterSha `
        -or -not (Test-GitAncestor -AncestorSha $StateMasterSha -DescendantSha $OriginMasterSha) `
        -or $OriginMasterSha -eq $MasterSha) {
        return $false
    }

    $headParentLine = ((& git rev-list --parents -n 1 $MasterSha) -join "").Trim()
    $headParentInspectionExitCode = $LASTEXITCODE
    $headParentParts = @($headParentLine -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($headParentInspectionExitCode -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $OriginMasterSha) {
        return $false
    }

    $committedNameStatus = @(& git diff-tree --no-commit-id --name-status --no-renames -r $MasterSha)
    $committedFileInspectionExitCode = $LASTEXITCODE
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    $hasInvalidCommittedStatus = $false
    foreach ($committedEntry in $committedNameStatus) {
        if ($committedEntry -notmatch '^([AM])\s+(.+)$') {
            $hasInvalidCommittedStatus = $true
            continue
        }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $committedFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0115Phase11ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($committedFileInspectionExitCode -ne 0 -or $hasInvalidCommittedStatus -or ($committedFiles -join "|") -cne ($expectedFiles -join "|")) {
        return $false
    }

    $parentAuthorizationPath = ((& git ls-tree -r --name-only $OriginMasterSha -- $p1F0115Phase11ScopeCorrectionAuthorizationPath) -join "").Trim()
    $parentAuthorizationInspectionExitCode = $LASTEXITCODE
    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0115Phase11ScopeCorrectionAuthorizationPath) -join "").Trim()
    $headAuthorizationInspectionExitCode = $LASTEXITCODE
    return $parentAuthorizationInspectionExitCode -eq 0 `
        -and [string]::IsNullOrWhiteSpace($parentAuthorizationPath) `
        -and $headAuthorizationInspectionExitCode -eq 0 `
        -and $headAuthorizationPath -eq $p1F0115Phase11ScopeCorrectionAuthorizationPath
}

function Test-P1F0115ModulePrecommitHotfixTransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha
    )

    if ($TaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskStatus -ne "ready_for_closeout" `
        -or $TaskStatus -ne "ready_for_closeout" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0115ModulePrecommitHotfixBaseSha `
        -or [string]::IsNullOrWhiteSpace($StateMasterSha) `
        -or $StateMasterSha -ne $StateOriginMasterSha `
        -or -not (Test-GitAncestor -AncestorSha $StateMasterSha -DescendantSha $OriginMasterSha) `
        -or $OriginMasterSha -eq $MasterSha) {
        return $false
    }

    $headParentLine = ((& git rev-list --parents -n 1 $MasterSha) -join "").Trim()
    $headParentParts = @($headParentLine -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($LASTEXITCODE -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $OriginMasterSha) {
        return $false
    }

    $committedNameStatus = @(& git diff-tree --no-commit-id --name-status --no-renames -r $MasterSha)
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in $committedNameStatus) {
        if ($entry -notmatch '^([AM])\s+(.+)$') { return $false }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $actualFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0115ModulePrecommitHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($actualFiles -join "|") -cne ($expectedFiles -join "|")) { return $false }

    $parentAuthorizationPath = ((& git ls-tree -r --name-only $OriginMasterSha -- $p1F0115ModulePrecommitHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or -not [string]::IsNullOrWhiteSpace($parentAuthorizationPath)) { return $false }
    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0115ModulePrecommitHotfixAuthorizationPath) -join "").Trim()
    return $LASTEXITCODE -eq 0 -and $headAuthorizationPath -eq $p1F0115ModulePrecommitHotfixAuthorizationPath
}

function Test-P1F0116DesignPathGuardHotfixTransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha
    )

    if ($TaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0115ScopeCorrectionParentTaskId `
        -or $StateCurrentTaskStatus -ne "ready_for_closeout" `
        -or $TaskStatus -ne "ready_for_closeout" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0116DesignPathGuardHotfixBaseSha `
        -or [string]::IsNullOrWhiteSpace($StateMasterSha) `
        -or $StateMasterSha -ne $StateOriginMasterSha `
        -or -not (Test-GitAncestor -AncestorSha $StateMasterSha -DescendantSha $OriginMasterSha) `
        -or $OriginMasterSha -eq $MasterSha) {
        return $false
    }

    $headParentLine = ((& git rev-list --parents -n 1 $MasterSha) -join "").Trim()
    $headParentParts = @($headParentLine -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($LASTEXITCODE -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $OriginMasterSha) {
        return $false
    }

    $committedNameStatus = @(& git diff-tree --no-commit-id --name-status --no-renames -r $MasterSha)
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in $committedNameStatus) {
        if ($entry -notmatch '^([AM])\s+(.+)$') { return $false }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $actualFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0116DesignPathGuardHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($actualFiles -join "|") -cne ($expectedFiles -join "|")) { return $false }

    $parentAuthorizationPath = ((& git ls-tree -r --name-only $OriginMasterSha -- $p1F0116DesignPathGuardHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or -not [string]::IsNullOrWhiteSpace($parentAuthorizationPath)) { return $false }
    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0116DesignPathGuardHotfixAuthorizationPath) -join "").Trim()
    return $LASTEXITCODE -eq 0 -and $headAuthorizationPath -eq $p1F0116DesignPathGuardHotfixAuthorizationPath
}

function Test-P1F0116ScopeCorrectionGuardHotfixTransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha
    )

    if ($TaskId -ne $p1F0116ScopeCorrectionGuardHotfixParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0116ScopeCorrectionGuardHotfixParentTaskId `
        -or $StateCurrentTaskStatus -ne "in_progress" `
        -or $TaskStatus -ne "in_progress" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0116ScopeCorrectionGuardHotfixBaseSha `
        -or [string]::IsNullOrWhiteSpace($StateMasterSha) `
        -or $StateMasterSha -ne $StateOriginMasterSha `
        -or -not (Test-GitAncestor -AncestorSha $StateMasterSha -DescendantSha $OriginMasterSha) `
        -or $OriginMasterSha -eq $MasterSha) {
        return $false
    }

    $headParentLine = ((& git rev-list --parents -n 1 $MasterSha) -join "").Trim()
    $headParentParts = @($headParentLine -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($LASTEXITCODE -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $OriginMasterSha) {
        return $false
    }

    $committedNameStatus = @(& git diff-tree --no-commit-id --name-status --no-renames -r $MasterSha)
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in $committedNameStatus) {
        if ($entry -notmatch '^([AM])\s+(.+)$') { return $false }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $actualFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0116ScopeCorrectionGuardHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($actualFiles -join "|") -cne ($expectedFiles -join "|")) { return $false }

    $parentAuthorizationPath = ((& git ls-tree -r --name-only $OriginMasterSha -- $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or -not [string]::IsNullOrWhiteSpace($parentAuthorizationPath)) { return $false }
    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath) -join "").Trim()
    return $LASTEXITCODE -eq 0 -and $headAuthorizationPath -eq $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath
}

function Test-P1F0117SpecApprovalTransitionHotfixTransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha
    )

    if ($TaskId -ne $p1F0117SpecApprovalTransitionHotfixParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0117SpecApprovalTransitionHotfixParentTaskId `
        -or $StateCurrentTaskStatus -ne "in_progress" `
        -or $TaskStatus -ne "in_progress" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0117SpecApprovalTransitionHotfixBaseSha `
        -or $StateMasterSha -ne $p1F0117SpecApprovalTransitionHotfixBaseSha `
        -or $StateOriginMasterSha -ne $p1F0117SpecApprovalTransitionHotfixBaseSha `
        -or $OriginMasterSha -eq $MasterSha) {
        return $false
    }

    $headParentParts = @(((& git rev-list --parents -n 1 $MasterSha) -join "").Trim() -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($LASTEXITCODE -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $OriginMasterSha) {
        return $false
    }

    $committedNameStatus = @(& git diff-tree --no-commit-id --name-status --no-renames -r $MasterSha)
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in $committedNameStatus) {
        if ($entry -notmatch '^([AM])\s+(.+)$') { return $false }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $actualFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0117SpecApprovalTransitionHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($actualFiles -join "|") -cne ($expectedFiles -join "|")) { return $false }

    $parentAuthorizationPath = ((& git ls-tree -r --name-only $OriginMasterSha -- $p1F0117SpecApprovalTransitionHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or -not [string]::IsNullOrWhiteSpace($parentAuthorizationPath)) { return $false }
    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0117SpecApprovalTransitionHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $headAuthorizationPath -ne $p1F0117SpecApprovalTransitionHotfixAuthorizationPath) { return $false }

    $authorizationText = ((& git show "${MasterSha}:$p1F0117SpecApprovalTransitionHotfixAuthorizationPath") -join "`n")
    $authorizationFieldContracts = @(
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
    )
    foreach ($fieldContract in $authorizationFieldContracts) {
        $fieldMatches = @([regex]::Matches($authorizationText, "(?im)^$([regex]::Escape($fieldContract.Key))\s*:.*$"))
        if ($fieldMatches.Count -ne 1 -or $fieldMatches[0].Value -notmatch $fieldContract.Expected) { return $false }
    }

    $authorizationFileSection = [regex]::Match($authorizationText, '(?ms)^##\s+Exact Files\s*$\r?\n(.*?)(?=^##\s+|\z)').Groups[1].Value
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SpecApprovalTransitionHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) { return $false }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Replacements = @(
            @{ Anchor = "  currentExecutionGate:`n    status: waiting_for_spec_review`n    reason: current_user_approved_f0117_option_a_and_schema_migration_source_only_but_written_spec_review_is_required`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n    resumeAction: review_written_f0117_nullable_deadline_spec_then_write_implementation_plan"; Replacement = "  currentExecutionGate:`n    status: satisfied`n    reason: current_user_approved_written_f0117_spec_2026_07_18`n    approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n    resumeAction: execute_f0117_redeem_code_nullable_deadline_plan_red_to_green" },
            @{ Anchor = "  lastKnownMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownOriginMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownRemoteMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff"; Replacement = "  lastKnownMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownOriginMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownRemoteMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7" }
        )},
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Replacements = @(
            @{ Anchor = "    currentExecutionGate:`n      status: waiting_for_spec_review`n      reason: current_user_approved_f0117_option_a_and_schema_migration_source_only_but_written_spec_review_is_required`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n      resumeAction: review_written_f0117_nullable_deadline_spec_then_write_implementation_plan"; Replacement = "    currentExecutionGate:`n      status: satisfied`n      reason: current_user_approved_written_f0117_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`n      resumeAction: execute_f0117_redeem_code_nullable_deadline_plan_red_to_green" }
        )}
    )) {
        $parentText = ((& git show "${OriginMasterSha}:$($projection.Path)") -join "`n") -replace "`r`n?", "`n"
        if ($LASTEXITCODE -ne 0) { return $false }
        $headText = ((& git show "${MasterSha}:$($projection.Path)") -join "`n") -replace "`r`n?", "`n"
        if ($LASTEXITCODE -ne 0) { return $false }
        $expectedText = $parentText
        foreach ($replacement in $projection.Replacements) {
            if ([regex]::Matches($expectedText, [regex]::Escape($replacement.Anchor)).Count -ne 1) { return $false }
            $expectedText = $expectedText.Replace($replacement.Anchor, $replacement.Replacement)
        }
        if ($headText -cne $expectedText) { return $false }
    }

    return $true
}

function Test-P1F0117SmokeScopeCorrectionTransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha,
        [Parameter(Mandatory = $true)][ValidateSet("standard", "transition_only")][string]$TransitionScopeMode
    )

    $findingCountBefore = $script:findings.Count
    $committedNameStatus = @(& git diff --name-status --no-renames $p1F0117SmokeScopeCorrectionBaseSha $MasterSha)
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in $committedNameStatus) {
        if ($entry -notmatch '^([AM])\s+(.+)$') {
            Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_FILE_SET_INVALID"
            break
        }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $actualFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0117SmokeScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($actualFiles -join "|") -cne ($expectedFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_FILE_SET_INVALID"
    }

    if ($TaskId -ne $p1F0117SmokeScopeCorrectionParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0117SmokeScopeCorrectionParentTaskId `
        -or $StateCurrentTaskStatus -ne "in_progress" `
        -or $TaskStatus -ne "in_progress" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0117SmokeScopeCorrectionBaseSha `
        -or $StateMasterSha -ne $p1F0117SmokeScopeCorrectionBaseSha `
        -or $StateOriginMasterSha -ne $p1F0117SmokeScopeCorrectionBaseSha `
        -or $OriginMasterSha -eq $MasterSha) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_CONTEXT_INVALID"
    }

    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0117SmokeScopeCorrectionAuthorizationPath) -join "").Trim()
    $authorizationText = ""
    $authorizationReadExitCode = $LASTEXITCODE
    if ($authorizationReadExitCode -ne 0 -or $headAuthorizationPath -ne $p1F0117SmokeScopeCorrectionAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
    } else {
        $authorizationText = ((& git show "${MasterSha}:$p1F0117SmokeScopeCorrectionAuthorizationPath") -join "`n")
        $authorizationReadExitCode = $LASTEXITCODE
    }
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
        if ($headAuthorizationPath -eq $p1F0117SmokeScopeCorrectionAuthorizationPath -and ($authorizationReadExitCode -ne 0 -or $fieldMatches.Count -ne 1 -or $fieldMatches[0].Value -notmatch $fieldContract.Expected)) {
            Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }
    $authorizationFileSection = [regex]::Match($authorizationText, '(?ms)^##\s+Exact Governance Files\s*$\r?\n(.*?)(?=^##\s+|\z)').Groups[1].Value
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SmokeScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_AUTHORIZATION_FILE_SET_INVALID"
    }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Label = "STATE"; Anchor = "  lastKnownMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownOriginMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownRemoteMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7"; Replacement = "  lastKnownMasterSha: $p1F0117SmokeScopeCorrectionBaseSha`n  lastKnownOriginMasterSha: $p1F0117SmokeScopeCorrectionBaseSha`n  lastKnownRemoteMasterSha: $p1F0117SmokeScopeCorrectionBaseSha" },
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Label = "QUEUE"; Anchor = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts"; Replacement = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - $p1F0117SmokeScopeCorrectionAllowedFile`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts" }
    )) {
        $parentText = ((& git show "${p1F0117SmokeScopeCorrectionBaseSha}:$($projection.Path)") -join "`n") -replace "`r`n?", "`n"
        $parentReadExitCode = $LASTEXITCODE
        $headText = ((& git show "${MasterSha}:$($projection.Path)") -join "`n") -replace "`r`n?", "`n"
        $headReadExitCode = $LASTEXITCODE
        $anchorCount = [regex]::Matches($parentText, [regex]::Escape($projection.Anchor)).Count
        $expectedText = if ($parentReadExitCode -eq 0 -and $headReadExitCode -eq 0 -and $anchorCount -eq 1) { $parentText.Replace($projection.Anchor, $projection.Replacement) } else { "" }
        if ([string]::IsNullOrWhiteSpace($expectedText) -or $headText -cne $expectedText) {
            Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_$($projection.Label)_DELTA_INVALID"
        }
    }

    if ($TransitionScopeMode -ne "transition_only") {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_REQUIRES_TRANSITION_ONLY"
    }

    $headParentParts = @(((& git rev-list --parents -n 1 $MasterSha) -join "").Trim() -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($LASTEXITCODE -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $p1F0117SmokeScopeCorrectionBaseSha) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_TOPOLOGY_INVALID"
    }

    $isReplay = $false
    foreach ($parentSha in @($headParentParts | Select-Object -Skip 1)) {
        $parentAuthorizationPath = ((& git ls-tree -r --name-only $parentSha -- $p1F0117SmokeScopeCorrectionAuthorizationPath) -join "").Trim()
        if ($LASTEXITCODE -eq 0 -and $parentAuthorizationPath -eq $p1F0117SmokeScopeCorrectionAuthorizationPath) { $isReplay = $true }
    }
    if ($isReplay) { Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_REPLAY" }

    return $script:findings.Count -eq $findingCountBefore
}

function Test-P1F0117SmokeScopeCloseoutLifecycleHotfixTransitionTopology {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskId,
        [Parameter(Mandatory = $true)][string]$StateCurrentTaskStatus,
        [Parameter(Mandatory = $true)][string]$TaskStatus,
        [Parameter(Mandatory = $true)][string]$CurrentBranch,
        [Parameter(Mandatory = $true)][string]$HeadSha,
        [Parameter(Mandatory = $true)][string]$MasterSha,
        [Parameter(Mandatory = $true)][string]$OriginMasterSha,
        [Parameter(Mandatory = $true)][string]$StateMasterSha,
        [Parameter(Mandatory = $true)][string]$StateOriginMasterSha,
        [Parameter(Mandatory = $true)][ValidateSet("standard", "transition_only")][string]$TransitionScopeMode
    )

    $findingCountBefore = $script:findings.Count
    $committedNameStatus = @(& git diff --name-status --no-renames $p1F0117SmokeScopeCloseoutLifecycleHotfixBaseSha $MasterSha)
    $committedFiles = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in $committedNameStatus) {
        if ($entry -notmatch '^([AM])\s+(.+)$') {
            Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_FILE_SET_INVALID"
            break
        }
        $committedFiles.Add((ConvertTo-NormalizedPath -Path $Matches[2]))
    }
    $actualFiles = @($committedFiles | Sort-Object -Unique)
    $expectedFiles = @($p1F0117SmokeScopeCloseoutLifecycleHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or ($actualFiles -join "|") -cne ($expectedFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_FILE_SET_INVALID"
    }

    if ($TaskId -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixParentTaskId `
        -or $StateCurrentTaskId -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixParentTaskId `
        -or $StateCurrentTaskStatus -ne "in_progress" `
        -or $TaskStatus -ne "in_progress" `
        -or $CurrentBranch -ne "master" `
        -or $HeadSha -ne $MasterSha `
        -or $OriginMasterSha -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixBaseSha `
        -or [string]::IsNullOrWhiteSpace($StateMasterSha) `
        -or $StateMasterSha -ne $StateOriginMasterSha `
        -or -not (Test-GitAncestor -AncestorSha $StateMasterSha -DescendantSha $OriginMasterSha) `
        -or $OriginMasterSha -eq $MasterSha) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_CONTEXT_INVALID"
    }

    $headAuthorizationPath = ((& git ls-tree -r --name-only $MasterSha -- $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath) -join "").Trim()
    $authorizationText = ""
    $authorizationReadExitCode = $LASTEXITCODE
    if ($authorizationReadExitCode -ne 0 -or $headAuthorizationPath -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_AUTHORIZATION_INVALID"
    } else {
        $authorizationText = ((& git show "${MasterSha}:$p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath") -join "`n")
        $authorizationReadExitCode = $LASTEXITCODE
    }
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
        if ($headAuthorizationPath -eq $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath -and ($authorizationReadExitCode -ne 0 -or $fieldMatches.Count -ne 1 -or $fieldMatches[0].Value -notmatch $fieldContract.Expected)) {
            Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }
    $authorizationFileSection = [regex]::Match($authorizationText, '(?ms)^##\s+Exact Governance Files\s*$\r?\n(.*?)(?=^##\s+|\z)').Groups[1].Value
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SmokeScopeCloseoutLifecycleHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_AUTHORIZATION_FILE_SET_INVALID"
    }

    if ($TransitionScopeMode -ne "transition_only") {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_REQUIRES_TRANSITION_ONLY"
    }

    $headParentParts = @(((& git rev-list --parents -n 1 $MasterSha) -join "").Trim() -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($LASTEXITCODE -ne 0 -or $headParentParts.Count -ne 2 -or $headParentParts[0] -ne $MasterSha -or $headParentParts[1] -ne $p1F0117SmokeScopeCloseoutLifecycleHotfixBaseSha) {
        Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_TOPOLOGY_INVALID"
    }

    $isReplay = $false
    foreach ($parentSha in @($headParentParts | Select-Object -Skip 1)) {
        $parentAuthorizationPath = ((& git ls-tree -r --name-only $parentSha -- $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath) -join "").Trim()
        if ($LASTEXITCODE -eq 0 -and $parentAuthorizationPath -eq $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath) { $isReplay = $true }
    }
    if ($isReplay) { Add-Finding "HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CLOSEOUT_LIFECYCLE_HOTFIX_REPLAY" }

    return $script:findings.Count -eq $findingCountBefore
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
        [string]$QueuePath
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
        [string]$QueuePath
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

Write-Section -Title "Module Run v2 Pre-Push Readiness"
Write-Output "prePushMode: hard_block"

foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing required file: $requiredPath"
    }
}

$insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
    throw "Module Run v2 pre-push readiness must run inside a Git worktree."
}

$projectStateLines = @(Get-Content -Path $ProjectStatePath | Where-Object { $_ -ne "" })
$queueLines = @(Get-Content -Path $QueuePath | Where-Object { $_ -ne "" })
$matrixContent = Get-Content -Path $MatrixPath -Raw

if ([string]::IsNullOrWhiteSpace($TaskId)) {
    $TaskId = Get-CurrentTaskId -Lines $projectStateLines
}

$taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
if ($taskBlock.Count -eq 0) {
    throw "Task not found in queue: $TaskId"
}

$taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
$executionProfile = Get-ScalarValue -Block $taskBlock -Key "executionProfile"

if ($taskStatus -eq "claimed") {
    $claimTransitionScopeTaskId = Get-ScalarValue -Block $taskBlock -Key "claimTransitionScopeTaskId"
    if (-not [string]::IsNullOrWhiteSpace($claimTransitionScopeTaskId)) {
        $programCurrentTaskId = Get-ProjectScalar -Lines $projectStateLines -Key "currentTaskId"
        $programLastClosedTaskId = Get-ProjectScalar -Lines $projectStateLines -Key "lastClosedTaskId"
        $claimTransitionScopeTaskBlock = @(Get-TaskBlock -Lines $queueLines -Id $claimTransitionScopeTaskId)
        if ($TaskId -ne $programCurrentTaskId -or $claimTransitionScopeTaskId -ne $programLastClosedTaskId) {
            Add-Finding "HARD_BLOCK_CLAIM_TRANSITION_PROGRAM_POINTER_MISMATCH $TaskId $claimTransitionScopeTaskId"
        } elseif ($claimTransitionScopeTaskBlock.Count -eq 0 -or (Get-ScalarValue -Block $claimTransitionScopeTaskBlock -Key "status") -ne "closed") {
            Add-Finding "HARD_BLOCK_CLAIM_TRANSITION_SCOPE_TASK_INVALID $claimTransitionScopeTaskId"
        } else {
            Write-Output "claimTransitionTaskId: $TaskId"
            Write-Output "claimTransitionScopeTaskId: $claimTransitionScopeTaskId"
            $TaskId = $claimTransitionScopeTaskId
            $taskBlock = $claimTransitionScopeTaskBlock
            $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
            $executionProfile = Get-ScalarValue -Block $taskBlock -Key "executionProfile"
        }
    }
}

if ([string]::IsNullOrWhiteSpace($EvidencePath)) {
    $EvidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
}

if ([string]::IsNullOrWhiteSpace($AuditReviewPath)) {
    $AuditReviewPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
}

if ([string]::IsNullOrWhiteSpace($LowRiskExperienceBatchId) -and $executionProfile -eq "local_low_risk_experience_batch") {
    $LowRiskExperienceBatchId = Get-LowRiskExperienceBatchId -TaskBlock $taskBlock
}

Write-Output "taskId: $TaskId"

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

Write-Section -Title "Git Readiness"
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
try {
    $gitReadinessOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path -Path $PSScriptRoot -ChildPath "Test-GitCompletionReadiness.ps1") -BaseBranch master 2>&1)
} finally {
    $ErrorActionPreference = $previousErrorActionPreference
}
if ($LASTEXITCODE -ne 0) {
    Add-Finding "HARD_BLOCK_GIT_READINESS_FAILED"
} else {
    Write-Output "OK_GIT_COMPLETION_READINESS"
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Add-Finding "HARD_BLOCK_DETACHED_HEAD"
} else {
    Write-Output "branch: $currentBranch"
}

if (-not $SkipRemoteAheadCheck -and -not [string]::IsNullOrWhiteSpace($currentBranch)) {
    $upstreamOutput = @(& git for-each-ref "--format=%(upstream:short)" "refs/heads/$currentBranch")
    $upstream = ($upstreamOutput -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($upstream)) {
        Write-Output "remoteAheadCheck: skipped_no_upstream"
    } else {
        $aheadBehind = ((& git rev-list --left-right --count "$upstream...HEAD") -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($aheadBehind)) {
            Add-Finding "HARD_BLOCK_REMOTE_AHEAD_CHECK_FAILED $upstream"
        } else {
            $parts = $aheadBehind -split "\s+"
            $remoteAheadCount = [int]$parts[0]
            $localAheadCount = [int]$parts[1]
            Write-Output "remoteAhead: $remoteAheadCount"
            Write-Output "localAhead: $localAheadCount"
            if ($remoteAheadCount -gt 0) {
                Add-Finding "HARD_BLOCK_REMOTE_AHEAD $upstream remoteAhead=$remoteAheadCount"
            }
        }
    }
}

$masterSha = ((& git rev-parse master) -join "").Trim()
$originMasterSha = ((& git rev-parse origin/master) -join "").Trim()
$headSha = ((& git rev-parse HEAD) -join "").Trim()
$stateMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownMasterSha"
$stateOriginMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownOriginMasterSha"
$stateCurrentTaskId = Get-CurrentTaskId -Lines $projectStateLines
$stateCurrentTaskStatus = Get-CurrentTaskStatus -Lines $projectStateLines
$canUseCloseoutShaAncestry = $taskStatus -in @("done", "closed", "ready_for_closeout")
$isP1TransitionScopeMode = $P1TransitionScopeMode -eq "transition_only"
$isP1F0115TransitionContext = $TaskId -eq $p1F0115ScopeCorrectionParentTaskId -or $stateCurrentTaskId -eq $p1F0115ScopeCorrectionParentTaskId
$isP1F0116TransitionContext = $TaskId -eq $p1F0116ScopeCorrectionGuardHotfixParentTaskId -or $stateCurrentTaskId -eq $p1F0116ScopeCorrectionGuardHotfixParentTaskId
$isP1F0117TransitionContext = $TaskId -eq $p1F0117SpecApprovalTransitionHotfixParentTaskId -or $stateCurrentTaskId -eq $p1F0117SpecApprovalTransitionHotfixParentTaskId
$p1F0117SmokeScopeCorrectionIdentityPaths = @(
    $p1F0117SmokeScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md"
)
$headPaths = @(& git ls-tree -r --name-only $masterSha -- $p1F0117SmokeScopeCorrectionIdentityPaths | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
$changedF0117SmokeScopeCorrectionIdentityPaths = @(& git diff --name-only --no-renames $originMasterSha $masterSha -- $p1F0117SmokeScopeCorrectionIdentityPaths | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
$isP1F0117SmokeScopeCorrectionCandidate = @($headPaths | Where-Object { $_ -in $p1F0117SmokeScopeCorrectionIdentityPaths }).Count -gt 0 `
    -and ($originMasterSha -eq $p1F0117SmokeScopeCorrectionBaseSha -or $changedF0117SmokeScopeCorrectionIdentityPaths.Count -gt 0)
$p1F0117SmokeScopeCloseoutLifecycleHotfixIdentityPaths = @(
    $p1F0117SmokeScopeCloseoutLifecycleHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md",
    "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md",
    "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md"
)
$headF0117SmokeScopeCloseoutLifecycleHotfixPaths = @(& git ls-tree -r --name-only $masterSha -- $p1F0117SmokeScopeCloseoutLifecycleHotfixIdentityPaths | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
$changedF0117SmokeScopeCloseoutLifecycleHotfixIdentityPaths = @(& git diff --name-only --no-renames $originMasterSha $masterSha -- $p1F0117SmokeScopeCloseoutLifecycleHotfixIdentityPaths | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
$isP1F0117SmokeScopeCloseoutLifecycleHotfixCandidate = @($headF0117SmokeScopeCloseoutLifecycleHotfixPaths | Where-Object { $_ -in $p1F0117SmokeScopeCloseoutLifecycleHotfixIdentityPaths }).Count -gt 0 `
    -and ($originMasterSha -eq $p1F0117SmokeScopeCloseoutLifecycleHotfixBaseSha -or $changedF0117SmokeScopeCloseoutLifecycleHotfixIdentityPaths.Count -gt 0)
$canUseGenericP1TransitionMasterAncestry = $isP1TransitionScopeMode `
    -and $taskStatus -eq "in_progress" `
    -and $currentBranch -eq "master" `
    -and $headSha -eq $masterSha `
    -and -not [string]::IsNullOrWhiteSpace($originMasterSha) `
    -and -not [string]::IsNullOrWhiteSpace($stateMasterSha) `
    -and $stateMasterSha -eq $stateOriginMasterSha `
    -and (Test-GitAncestor -AncestorSha $stateMasterSha -DescendantSha $originMasterSha) `
    -and $originMasterSha -ne $masterSha `
    -and (Test-GitAncestor -AncestorSha $originMasterSha -DescendantSha $masterSha)
$canUseP1F0117CloseoutTransitionMasterAncestry = $isP1TransitionScopeMode `
    -and $TaskId -eq $p1F0117SpecApprovalTransitionHotfixParentTaskId `
    -and $stateCurrentTaskId -eq $p1F0117SpecApprovalTransitionHotfixParentTaskId `
    -and $canUseCloseoutShaAncestry `
    -and $currentBranch -eq "master" `
    -and $headSha -eq $masterSha `
    -and -not [string]::IsNullOrWhiteSpace($originMasterSha) `
    -and -not [string]::IsNullOrWhiteSpace($stateMasterSha) `
    -and $stateMasterSha -eq $stateOriginMasterSha `
    -and (Test-GitAncestor -AncestorSha $stateMasterSha -DescendantSha $originMasterSha) `
    -and $originMasterSha -ne $masterSha `
    -and (Test-GitAncestor -AncestorSha $originMasterSha -DescendantSha $masterSha)
$canUseP1F0115TransitionMasterAncestry = $isP1TransitionScopeMode -and (Test-P1F0115TransitionTopology `
    -TaskId $TaskId `
    -StateCurrentTaskId $stateCurrentTaskId `
    -StateCurrentTaskStatus $stateCurrentTaskStatus `
    -TaskStatus $taskStatus `
    -CurrentBranch $currentBranch `
    -HeadSha $headSha `
    -MasterSha $masterSha `
    -OriginMasterSha $originMasterSha `
    -StateMasterSha $stateMasterSha `
    -StateOriginMasterSha $stateOriginMasterSha)
$canUseP1F0115Phase11TransitionMasterAncestry = $isP1TransitionScopeMode -and (Test-P1F0115Phase11TransitionTopology `
    -TaskId $TaskId `
    -StateCurrentTaskId $stateCurrentTaskId `
    -StateCurrentTaskStatus $stateCurrentTaskStatus `
    -TaskStatus $taskStatus `
    -CurrentBranch $currentBranch `
    -HeadSha $headSha `
    -MasterSha $masterSha `
    -OriginMasterSha $originMasterSha `
    -StateMasterSha $stateMasterSha `
    -StateOriginMasterSha $stateOriginMasterSha)
$canUseP1F0115ModulePrecommitHotfixTransitionMasterAncestry = $isP1TransitionScopeMode -and (Test-P1F0115ModulePrecommitHotfixTransitionTopology `
    -TaskId $TaskId `
    -StateCurrentTaskId $stateCurrentTaskId `
    -StateCurrentTaskStatus $stateCurrentTaskStatus `
    -TaskStatus $taskStatus `
    -CurrentBranch $currentBranch `
    -HeadSha $headSha `
    -MasterSha $masterSha `
    -OriginMasterSha $originMasterSha `
    -StateMasterSha $stateMasterSha `
    -StateOriginMasterSha $stateOriginMasterSha)
$isP1F0116DesignPathGuardHotfixTransitionTopology = Test-P1F0116DesignPathGuardHotfixTransitionTopology `
    -TaskId $TaskId `
    -StateCurrentTaskId $stateCurrentTaskId `
    -StateCurrentTaskStatus $stateCurrentTaskStatus `
    -TaskStatus $taskStatus `
    -CurrentBranch $currentBranch `
    -HeadSha $headSha `
    -MasterSha $masterSha `
    -OriginMasterSha $originMasterSha `
    -StateMasterSha $stateMasterSha `
    -StateOriginMasterSha $stateOriginMasterSha
$canUseP1F0116DesignPathGuardHotfixTransitionMasterAncestry = $isP1TransitionScopeMode -and $isP1F0116DesignPathGuardHotfixTransitionTopology
$isP1F0116ScopeCorrectionGuardHotfixTransitionTopology = Test-P1F0116ScopeCorrectionGuardHotfixTransitionTopology `
    -TaskId $TaskId `
    -StateCurrentTaskId $stateCurrentTaskId `
    -StateCurrentTaskStatus $stateCurrentTaskStatus `
    -TaskStatus $taskStatus `
    -CurrentBranch $currentBranch `
    -HeadSha $headSha `
    -MasterSha $masterSha `
    -OriginMasterSha $originMasterSha `
    -StateMasterSha $stateMasterSha `
    -StateOriginMasterSha $stateOriginMasterSha
$canUseP1F0116ScopeCorrectionGuardHotfixTransitionMasterAncestry = $isP1TransitionScopeMode -and $isP1F0116ScopeCorrectionGuardHotfixTransitionTopology
$isP1F0117SpecApprovalTransitionHotfixTransitionTopology = Test-P1F0117SpecApprovalTransitionHotfixTransitionTopology `
    -TaskId $TaskId `
    -StateCurrentTaskId $stateCurrentTaskId `
    -StateCurrentTaskStatus $stateCurrentTaskStatus `
    -TaskStatus $taskStatus `
    -CurrentBranch $currentBranch `
    -HeadSha $headSha `
    -MasterSha $masterSha `
    -OriginMasterSha $originMasterSha `
    -StateMasterSha $stateMasterSha `
    -StateOriginMasterSha $stateOriginMasterSha
$canUseP1F0117SpecApprovalTransitionHotfixTransitionMasterAncestry = $isP1TransitionScopeMode -and $isP1F0117SpecApprovalTransitionHotfixTransitionTopology
$isP1F0117SmokeScopeCorrectionTransitionTopology = if ($isP1F0117SmokeScopeCorrectionCandidate) {
    Test-P1F0117SmokeScopeCorrectionTransitionTopology `
        -TaskId $TaskId `
        -StateCurrentTaskId $stateCurrentTaskId `
        -StateCurrentTaskStatus $stateCurrentTaskStatus `
        -TaskStatus $taskStatus `
        -CurrentBranch $currentBranch `
        -HeadSha $headSha `
        -MasterSha $masterSha `
        -OriginMasterSha $originMasterSha `
        -StateMasterSha $stateMasterSha `
        -StateOriginMasterSha $stateOriginMasterSha `
        -TransitionScopeMode $P1TransitionScopeMode
} else { $false }
$canUseP1F0117SmokeScopeCorrectionTransitionMasterAncestry = $isP1TransitionScopeMode -and $isP1F0117SmokeScopeCorrectionTransitionTopology
$isP1F0117SmokeScopeCloseoutLifecycleHotfixTransitionTopology = if ($isP1F0117SmokeScopeCloseoutLifecycleHotfixCandidate) {
    Test-P1F0117SmokeScopeCloseoutLifecycleHotfixTransitionTopology `
        -TaskId $TaskId `
        -StateCurrentTaskId $stateCurrentTaskId `
        -StateCurrentTaskStatus $stateCurrentTaskStatus `
        -TaskStatus $taskStatus `
        -CurrentBranch $currentBranch `
        -HeadSha $headSha `
        -MasterSha $masterSha `
        -OriginMasterSha $originMasterSha `
        -StateMasterSha $stateMasterSha `
        -StateOriginMasterSha $stateOriginMasterSha `
        -TransitionScopeMode $P1TransitionScopeMode
} else { $false }
$canUseP1F0117SmokeScopeCloseoutLifecycleHotfixTransitionMasterAncestry = $isP1TransitionScopeMode -and $isP1F0117SmokeScopeCloseoutLifecycleHotfixTransitionTopology
$canUseP1TransitionMasterAncestry = if ($isP1F0115TransitionContext) {
    $canUseP1F0115TransitionMasterAncestry -or $canUseP1F0115Phase11TransitionMasterAncestry -or $canUseP1F0115ModulePrecommitHotfixTransitionMasterAncestry -or $canUseP1F0116DesignPathGuardHotfixTransitionMasterAncestry
} elseif ($isP1F0116TransitionContext) {
    $canUseP1F0116ScopeCorrectionGuardHotfixTransitionMasterAncestry
} elseif ($isP1F0117TransitionContext) {
    if ($isP1F0117SmokeScopeCloseoutLifecycleHotfixCandidate) {
        $canUseP1F0117SmokeScopeCloseoutLifecycleHotfixTransitionMasterAncestry
    } elseif ($isP1F0117SmokeScopeCorrectionCandidate) {
        $canUseP1F0117SmokeScopeCorrectionTransitionMasterAncestry
    } else {
        $canUseP1F0117SpecApprovalTransitionHotfixTransitionMasterAncestry -or $canUseP1F0117CloseoutTransitionMasterAncestry
    }
} else {
    $canUseGenericP1TransitionMasterAncestry
}

Write-Output "master: $masterSha"
Write-Output "originMaster: $originMasterSha"
Write-Output "stateMaster: $stateMasterSha"
Write-Output "stateOriginMaster: $stateOriginMasterSha"
if (-not $isP1F0115TransitionContext -and -not $isP1F0116TransitionContext -and -not $isP1F0117TransitionContext) {
    Write-Output "p1TransitionScopeMode: $P1TransitionScopeMode"
}

if ($isP1TransitionScopeMode -and -not $canUseP1TransitionMasterAncestry) {
    Add-Finding "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID"
}
if ($isP1F0116DesignPathGuardHotfixTransitionTopology -and -not $isP1TransitionScopeMode) {
    Add-Finding "HARD_BLOCK_P1_F0116_DESIGNPATH_HOTFIX_REQUIRES_TRANSITION_ONLY"
}
if ($isP1F0116ScopeCorrectionGuardHotfixTransitionTopology -and -not $isP1TransitionScopeMode) {
    Add-Finding "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_HOTFIX_REQUIRES_TRANSITION_ONLY"
}
if ($isP1F0117SpecApprovalTransitionHotfixTransitionTopology -and -not $isP1TransitionScopeMode) {
    Add-Finding "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_REQUIRES_TRANSITION_ONLY"
}

if ($stateMasterSha -ne $masterSha) {
    if ($canUseP1TransitionMasterAncestry) {
        Write-Output "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"
    } elseif ($canUseCloseoutShaAncestry -and (Test-GitAncestor -AncestorSha $stateMasterSha -DescendantSha $masterSha)) {
        Write-Output "OK_PRE_PUSH_STATE_SHA_ANCESTOR master"
    } else {
        Add-Finding "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master"
    }
}

if ($stateOriginMasterSha -ne $originMasterSha) {
    if ($canUseP1TransitionMasterAncestry) {
        Write-Output "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR origin/master"
    } elseif ($canUseCloseoutShaAncestry -and (Test-GitAncestor -AncestorSha $stateOriginMasterSha -DescendantSha $originMasterSha)) {
        Write-Output "OK_PRE_PUSH_STATE_SHA_ANCESTOR origin/master"
    } else {
        Add-Finding "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT origin/master"
    }
}

Write-Section -Title "Evidence And Audit"
Test-RequiredPath -Path $EvidencePath -MissingCode "HARD_BLOCK_MISSING_EVIDENCE" -OkCode "OK_EVIDENCE_PATH"
Test-RequiredPath -Path $AuditReviewPath -MissingCode "HARD_BLOCK_MISSING_AUDIT" -OkCode "OK_AUDIT_PATH"

if (-not [string]::IsNullOrWhiteSpace($DocsOnlyBatchId)) {
    Write-Section -Title "Docs-Only Batch Readiness"
    Invoke-DocsOnlyBatchReadiness -BatchId $DocsOnlyBatchId -Mode $DocsOnlyBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath
}
if (-not [string]::IsNullOrWhiteSpace($LowRiskExperienceBatchId)) {
    Write-Section -Title "Low-Risk Experience Batch Readiness"
    Invoke-LowRiskExperienceBatchReadiness -BatchId $LowRiskExperienceBatchId -Mode $LowRiskExperienceBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath
}

Write-Section -Title "Closeout Noise Policy"
Write-Output "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"
Write-Output "persistentPostMergeEvidenceRequiredWhen: missing_pre_merge_validation_or_state_sha_handoff_repair_or_failed_closeout_or_task_policy_requires"
Write-Output "finalHandoffShaPolicy: final_handoff_or_project_state"
Write-Output "stateShaPolicy: accepted_ancestor_checkpoint"

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    throw "Module Run v2 pre-push readiness failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

if ($isP1F0115TransitionContext) {
    Write-Output "p1TransitionScopeMode: $P1TransitionScopeMode"
    if ($canUseP1F0115TransitionMasterAncestry) {
        Write-Output "p1F0115TransitionTopology: exact_one_parent"
    }
    if ($canUseP1F0115Phase11TransitionMasterAncestry) {
        Write-Output "p1F0115Phase11TransitionTopology: exact_one_parent"
    }
    if ($canUseP1F0115ModulePrecommitHotfixTransitionMasterAncestry) {
        Write-Output "p1F0115ModulePrecommitHotfixTransitionTopology: exact_one_parent"
    }
    if ($canUseP1F0116DesignPathGuardHotfixTransitionMasterAncestry) {
        Write-Output "p1F0116DesignPathGuardHotfixTransitionTopology: exact_one_parent"
    }
}
if ($isP1F0116TransitionContext) {
    Write-Output "p1TransitionScopeMode: $P1TransitionScopeMode"
    if ($canUseP1F0116ScopeCorrectionGuardHotfixTransitionMasterAncestry) {
        Write-Output "p1F0116ScopeCorrectionGuardHotfixTransitionTopology: exact_one_parent"
    }
}
if ($isP1F0117TransitionContext) {
    Write-Output "p1TransitionScopeMode: $P1TransitionScopeMode"
    if ($canUseP1F0117SpecApprovalTransitionHotfixTransitionMasterAncestry) {
        Write-Output "p1F0117SpecApprovalTransitionHotfixTransitionTopology: exact_one_parent"
    }
    if ($canUseP1F0117SmokeScopeCorrectionTransitionMasterAncestry) {
        Write-Output "p1F0117SmokeScopeCorrectionTransitionTopology: exact_one_parent"
    }
    if ($canUseP1F0117SmokeScopeCloseoutLifecycleHotfixTransitionMasterAncestry) {
        Write-Output "p1F0117SmokeScopeCloseoutLifecycleHotfixTransitionTopology: exact_one_parent"
    }
}
Write-Output "pre-push readiness passed"
