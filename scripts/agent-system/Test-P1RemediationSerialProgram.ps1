param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [string]$RepositoryRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$AuditRepositoryRoot = "D:\tiku-readonly-audit",

    [Parameter(Mandatory = $false)]
    [ValidateSet("manual", "pre_commit", "pre_push")]
    [string]$Phase = "manual",

    [Parameter(Mandatory = $false)]
    [string[]]$ChangedFiles = @(),

    [Parameter(Mandatory = $false)]
    [switch]$SkipGitChecks,

    [Parameter(Mandatory = $false)]
    [switch]$SkipExternalIntegrityChecks,

    [Parameter(Mandatory = $false)]
    [string]$PushRemoteName = "",

    [Parameter(Mandatory = $false)]
    [string]$PushRemoteUrl = "",

    [Parameter(Mandatory = $false)]
    [string[]]$PushUpdateLines = @()
)

$ErrorActionPreference = "Stop"
$programKey = "p1RemediationSerialProgram"
$expectedProgramId = "p1-remediation-2026-07-16"
$expectedPolicy = "wip_one_dynamic_task_materialization"
$expectedShas = @{
    baselineSha = "4cd2792f57d4eea3ac2770598b5490ebcfdead51"
    p0ProductStaticBaselineSha = "e136ca28acde82282a17c65ccfb828a01e872c0b"
    auditRepositorySha = "a84224fa12ec85b28e6acd945deba2afa28c6c02"
}
$expectedPointerValues = @{
    standingAuthorizationSource = "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md"
    serialPlanPath = "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md"
    findingLedgerPath = "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml"
    postP0MapPath = "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml"
    clusterPath = "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml"
    runtimeBacklogPath = "D:/tiku-readonly-audit/runtime/runtime-validation-backlog.yaml"
    guardScriptPath = "scripts/agent-system/Test-P1RemediationSerialProgram.ps1"
}
$expectedFrozenArtifactHashes = @{
    findingLedgerPath = "47C87F1D47C78853C166B0271F031E88E3BD02C02E3991BAD1DB2C28F231739B"
    postP0MapPath = "A6B6207551C31816C0B4308F1CD19318ECF03FD9EB243C762041ECE776A3BF59"
    clusterPath = "9EAEC9396FA0F5BFFF5A8DF34B50A4329DB4AB6821F78AC8815985EF8BE085CB"
}
$globalBlockedPatterns = @("AGENTS.md", "package.json", "package-lock.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "yarn.lock", ".env*")
$programControlPatterns = @(
    ".husky/**",
    "scripts/agent-system/Test-P0Remediation*.ps1",
    "scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram*.ps1",
    "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md"
)
$scopeControlPaths = @("docs/04-agent-system/state/project-state.yaml", "docs/04-agent-system/state/task-queue.yaml")
$protectedImplementationPatterns = @("src/**", "tests/**", "e2e/**", "drizzle/**", "migrations/**", "seed/**")
$expectedCandidateOrder = @(
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
$allowedTaskStatuses = @("pending", "in_progress", "ready_for_closeout", "closed")
$activeTaskStatuses = @("in_progress", "ready_for_closeout")
$checkpointOrder = @("taskCommit", "masterMerge", "originMasterSync", "worktreeCleanup", "shortBranchCleanup")
$p1TransitionHotfixTaskId = "p1-prepush-transition-ancestor-gate-hotfix-2026-07-16"
$p1TransitionHotfixParentTaskId = "p1-remediation-program-bootstrap-2026-07-16"
$p1TransitionHotfixBaseSha = "4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3"
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
$p1F0115Phase11ScopeCorrectionTaskId = "p1-f0115-phase11-scope-correction-hotfix-2026-07-17"
$p1F0115Phase11ScopeCorrectionParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
$p1F0115Phase11ScopeCorrectionBaseSha = "582c156afb0cdde8a3daa99785fda8540b56fe27"
$p1F0115Phase11ScopeCorrectionBranch = "codex/p1-f0115-phase11-scope-correction-hotfix"
$p1F0115Phase11ScopeCorrectionAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-authorization.md"
$p1F0115Phase11ScopeCorrectionEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
$p1F0115Phase11ScopeCorrectionAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
$p1F0115Phase11ScopeCorrectionAllowedFile = "tests/unit/phase-11-system-ops-user-management-loop.test.ts"
$p1F0115Phase11ScopeCorrectionQueueAnchor = @"
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
"@
$p1F0115Phase11ScopeCorrectionQueueReplacement = @"
      - tests/unit/admin-user-org-auth-ops-baseline.test.ts
      - tests/unit/phase-11-system-ops-user-management-loop.test.ts
      - tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
"@
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
$p1F0115ModulePrecommitHotfixTaskId = "p1-remediation-efficiency-mechanism-tuning-2026-07-17"
$p1F0115ModulePrecommitHotfixParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
$p1F0115ModulePrecommitHotfixBaseSha = "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
$p1F0115ModulePrecommitHotfixBranch = "codex/p1-remediation-efficiency-mechanism-tuning"
$p1F0115ModulePrecommitHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-remediation-efficiency-mechanism-tuning-authorization.md"
$p1F0115ModulePrecommitHotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
$p1F0115ModulePrecommitHotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
$p1F0115ModulePrecommitHotfixFiles = @(
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
$p1F0116DesignPathGuardHotfixTaskId = "p1-f0116-designpath-guard-hotfix-2026-07-17"
$p1F0116DesignPathGuardHotfixParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
$p1F0116DesignPathGuardHotfixBaseSha = "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
$p1F0116DesignPathGuardHotfixBranch = "codex/p1-f0116-designpath-guard-hotfix"
$p1F0116DesignPathGuardHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-f0116-designpath-guard-hotfix-authorization.md"
$p1F0116DesignPathGuardHotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
$p1F0116DesignPathGuardHotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
$p1F0116DesignPathGuardHotfixFiles = @(
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
$p1F0116ScopeCorrectionGuardHotfixTaskId = "p1-f0116-scope-correction-guard-hotfix-2026-07-18"
$p1F0116ScopeCorrectionGuardHotfixParentTaskId = "p1-remediation-rc-02-employee-import-preflight-2026-07-17"
$p1F0116ScopeCorrectionGuardHotfixBaseSha = "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
$p1F0116ScopeCorrectionGuardHotfixBranch = "codex/p1-f0116-scope-correction-hotfix"
$p1F0116ScopeCorrectionGuardHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0116-scope-correction-guard-hotfix-authorization.md"
$p1F0116ScopeCorrectionGuardHotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
$p1F0116ScopeCorrectionGuardHotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
$p1F0116ScopeCorrectionGuardHotfixFiles = @(
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
$p1F0117SpecApprovalTransitionHotfixTaskId = "p1-f0117-spec-approval-transition-hotfix-2026-07-18"
$p1F0117SpecApprovalTransitionHotfixParentTaskId = "p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18"
$p1F0117SpecApprovalTransitionHotfixBaseSha = "366f17446e9fc75a777ebfe5977ad72db1062eb7"
$p1F0117SpecApprovalTransitionHotfixBranch = "codex/p1-f0117-spec-approval-transition-hotfix"
$p1F0117SpecApprovalTransitionHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-spec-approval-transition-hotfix-authorization.md"
$p1F0117SpecApprovalTransitionHotfixHumanApprovalSource = "current user message approving F-0117 Option A, written specification, schema/migration source generation only, and execution on 2026-07-18"
$p1F0117SpecApprovalTransitionHotfixStandingAuthorizationSource = "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md"
$p1F0117SpecApprovalTransitionHotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md"
$p1F0117SpecApprovalTransitionHotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md"
$p1F0117SpecApprovalTransitionHotfixFiles = @(
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
$findings = [System.Collections.Generic.List[string]]::new()

function Add-Finding {
    param([Parameter(Mandatory = $true)][string]$Code)
    $script:findings.Add($Code)
}

function Get-Indent {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Line)
    if ($Line -match "^(\s*)") { return $Matches[1].Length }
    return 0
}

function Get-DirectChildIndent {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    if ($Block.Count -eq 0) { return -1 }
    $parentIndent = Get-Indent -Line $Block[0]
    $childIndents = @(
        for ($lineIndex = 1; $lineIndex -lt $Block.Count; $lineIndex++) {
            if (-not [string]::IsNullOrWhiteSpace($Block[$lineIndex]) -and $Block[$lineIndex] -notmatch '^\s*#') {
                $lineIndent = Get-Indent -Line $Block[$lineIndex]
                if ($lineIndent -gt $parentIndent) { $lineIndent }
            }
        }
    )
    if ($childIndents.Count -eq 0) { return -1 }
    return ($childIndents | Measure-Object -Minimum).Minimum
}

function Get-TopLevelBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $start = -1
    for ($index = 0; $index -lt $Lines.Count; $index++) {
        if ($Lines[$index] -match "^$([regex]::Escape($Key)):\s*$") {
            $start = $index
            break
        }
    }
    if ($start -lt 0) { return @() }

    $end = $Lines.Count
    for ($index = $start + 1; $index -lt $Lines.Count; $index++) {
        if (-not [string]::IsNullOrWhiteSpace($Lines[$index]) -and (Get-Indent -Line $Lines[$index]) -eq 0) {
            $end = $index
            break
        }
    }
    return @($Lines[$start..($end - 1)])
}

function Get-TopLevelKeys {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    return @(
        $Lines | ForEach-Object {
            if ($_ -match "^([A-Za-z][A-Za-z0-9_-]*):") { $Matches[1] }
        }
    )
}

function Test-CanonicalYamlSurfaceSyntax {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Label
    )

    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        $line = $Lines[$lineIndex]
        if ([string]::IsNullOrWhiteSpace($line) -or $line -match '^\s*#') { continue }
        if ($line -match "`t" -or $line -match '^\s*(?:-\s+)?<<\s*:' -or $line -match '^\s*(?:-\s+)?(?:"[^"]+"|''[^'']+'')\s*:' -or $line -match '^\s*(?:-\s+)?[A-Za-z][A-Za-z0-9_-]*\s+:') {
            Add-Finding "P1_PROGRAM_NONCANONICAL_YAML_KEY $Label line=$($lineIndex + 1)"
            continue
        }
        if ((Get-Indent -Line $line) -eq 0 -and $line -notmatch '^[A-Za-z][A-Za-z0-9_-]*:(?:\s.*)?$') {
            Add-Finding "P1_PROGRAM_NONCANONICAL_TOP_LEVEL $Label line=$($lineIndex + 1)"
        }
    }
}

function Test-DirectMappingKeysUnique {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if ($Block.Count -eq 0) { return }
    $directIndent = Get-DirectChildIndent -Block $Block
    $keys = [System.Collections.Generic.List[string]]::new()
    if ($Block[0] -match '^\s*-\s+([A-Za-z][A-Za-z0-9_-]*):') { $keys.Add($Matches[1]) }
    for ($lineIndex = 1; $lineIndex -lt $Block.Count; $lineIndex++) {
        if ($directIndent -ge 0 -and (Get-Indent -Line $Block[$lineIndex]) -eq $directIndent -and $Block[$lineIndex] -match '^\s*([A-Za-z][A-Za-z0-9_-]*):') {
            $keys.Add($Matches[1])
        }
    }
    foreach ($duplicateKey in @($keys | Group-Object | Where-Object { $_.Count -gt 1 })) {
        Add-Finding "P1_PROGRAM_DUPLICATE_MAPPING_KEY $Label $($duplicateKey.Name)"
    }
}

function Get-SectionBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $start = -1
    $indent = -1
    $directIndent = Get-DirectChildIndent -Block $Block
    for ($index = 1; $index -lt $Block.Count; $index++) {
        if ($directIndent -ge 0 -and (Get-Indent -Line $Block[$index]) -eq $directIndent -and $Block[$index] -match "^(\s+)$([regex]::Escape($Key)):\s*$") {
            $start = $index
            $indent = $Matches[1].Length
            break
        }
    }
    if ($start -lt 0) { return @() }

    $end = $Block.Count
    for ($index = $start + 1; $index -lt $Block.Count; $index++) {
        if (-not [string]::IsNullOrWhiteSpace($Block[$index]) -and (Get-Indent -Line $Block[$index]) -le $indent) {
            $end = $index
            break
        }
    }
    return @($Block[$start..($end - 1)])
}

function Get-ChildBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$ParentKey,
        [Parameter(Mandatory = $true)][string]$ChildKey
    )

    $parent = @(Get-SectionBlock -Block $Block -Key $ParentKey)
    if ($parent.Count -eq 0) { return @() }
    return @(Get-SectionBlock -Block $parent -Key $ChildKey)
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $directIndent = Get-DirectChildIndent -Block $Block
    for ($lineIndex = 1; $lineIndex -lt $Block.Count; $lineIndex++) {
        $line = $Block[$lineIndex]
        if ($directIndent -ge 0 -and (Get-Indent -Line $line) -eq $directIndent -and $line -match "^\s+$([regex]::Escape($Key)):\s*(.*?)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }
    return ""
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = [System.Collections.Generic.List[string]]::new()
    $section = @(Get-SectionBlock -Block $Block -Key $Key)
    if ($section.Count -eq 0 -or $section[0] -match '\[\]') { return $values.ToArray() }
    $listIndent = Get-DirectChildIndent -Block $section
    for ($lineIndex = 1; $lineIndex -lt $section.Count; $lineIndex++) {
        $line = $section[$lineIndex]
        if ($listIndent -ge 0 -and (Get-Indent -Line $line) -eq $listIndent -and $line -match "^\s+-\s+(.+?)\s*$") {
            $values.Add($Matches[1].Trim().Trim('"').Trim("'"))
        }
    }
    return $values.ToArray()
}

function Get-FlatMapping {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $mapping = @{}
    $section = @(Get-SectionBlock -Block $Block -Key $Key)
    $directIndent = Get-DirectChildIndent -Block $section
    for ($lineIndex = 1; $lineIndex -lt $section.Count; $lineIndex++) {
        $line = $section[$lineIndex]
        if ($directIndent -ge 0 -and (Get-Indent -Line $line) -eq $directIndent -and $line -match "^\s+([^:#][^:]*):\s*(.*?)\s*$") {
            $mapping[$Matches[1].Trim()] = $Matches[2].Trim().Trim('"').Trim("'")
        }
    }
    return $mapping
}

function Get-ListItemBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    $items = [System.Collections.Generic.List[object]]::new()
    $starts = [System.Collections.Generic.List[int]]::new()
    $itemIndent = Get-DirectChildIndent -Block $Block
    for ($index = 0; $index -lt $Block.Count; $index++) {
        if ($Block[$index] -match "^(\s*)-\s+id:\s+(\S+)\s*$") {
            if ($Matches[1].Length -eq $itemIndent) { $starts.Add($index) }
        }
    }
    for ($itemIndex = 0; $itemIndex -lt $starts.Count; $itemIndex++) {
        $start = $starts[$itemIndex]
        $end = if ($itemIndex + 1 -lt $starts.Count) { $starts[$itemIndex + 1] - 1 } else { $Block.Count - 1 }
        $itemBlock = @($Block[$start..$end])
        $id = if ($itemBlock[0] -match "-\s+id:\s+(\S+)\s*$") { $Matches[1].Trim().Trim('"').Trim("'") } else { "" }
        $items.Add([pscustomobject]@{ Id = $id; Block = $itemBlock })
    }
    return $items.ToArray()
}

function Resolve-RepositoryPath {
    param([Parameter(Mandatory = $true)][string]$Root, [Parameter(Mandatory = $true)][string]$Path)
    if ([System.IO.Path]::IsPathRooted($Path)) { return [System.IO.Path]::GetFullPath($Path) }
    return [System.IO.Path]::GetFullPath((Join-Path -Path $Root -ChildPath ($Path -replace "/", "\")))
}

function Get-CanonicalPath {
    param([Parameter(Mandatory = $true)][string]$Root, [Parameter(Mandatory = $true)][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) { return "" }
    return (Resolve-RepositoryPath -Root $Root -Path $Path).TrimEnd("\", "/")
}

function Get-CanonicalRepositoryPath {
    param([Parameter(Mandatory = $true)][string]$Root, [Parameter(Mandatory = $true)][string]$Path)

    $canonicalRoot = (Get-CanonicalPath -Root $Root -Path $Root)
    $canonicalPath = (Get-CanonicalPath -Root $Root -Path $Path)
    if ([string]::IsNullOrWhiteSpace($canonicalPath)) { return "" }
    $rootPrefix = $canonicalRoot + [System.IO.Path]::DirectorySeparatorChar
    if ($canonicalPath -ine $canonicalRoot -and -not $canonicalPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) { return "" }
    return $canonicalPath
}

function Get-FileSha256 {
    param([Parameter(Mandatory = $true)][string]$Path)

    $stream = [System.IO.File]::OpenRead($Path)
    try {
        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        try {
            return ([System.BitConverter]::ToString($sha256.ComputeHash($stream))).Replace("-", "")
        } finally {
            $sha256.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
}

function Invoke-GitInIsolatedRepository {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string[]]$GitArguments
    )

    $localEnvironmentNames = @(& git -C $RepositoryRoot rev-parse --local-env-vars)
    if ($LASTEXITCODE -ne 0) { throw "Unable to enumerate Git local environment variables." }
    $savedEnvironment = @{}
    foreach ($name in $localEnvironmentNames) {
        $value = [Environment]::GetEnvironmentVariable($name, [EnvironmentVariableTarget]::Process)
        if ($null -ne $value) { $savedEnvironment[$name] = $value }
        Remove-Item -LiteralPath "Env:$name" -ErrorAction SilentlyContinue
    }
    try {
        $output = @(& git --no-optional-locks -C $Root @GitArguments)
        $exitCode = $LASTEXITCODE
    } finally {
        foreach ($name in $localEnvironmentNames) {
            if ($savedEnvironment.ContainsKey($name)) {
                [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], [EnvironmentVariableTarget]::Process)
            } else {
                Remove-Item -LiteralPath "Env:$name" -ErrorAction SilentlyContinue
            }
        }
    }
    return [pscustomobject]@{ ExitCode = $exitCode; Output = $output }
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)
    $normalizedPath = $Path.Replace("\", "/")
    while ($normalizedPath.StartsWith("./", [System.StringComparison]::Ordinal)) { $normalizedPath = $normalizedPath.Substring(2) }
    return $normalizedPath.TrimStart("/")
}

function Test-P1TransitionHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { $_.Replace("\", "/").TrimStart("/") } | Sort-Object -Unique)
    $expectedFiles = @($p1TransitionHotfixFiles | ForEach-Object { $_.Replace("\", "/").TrimStart("/") } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1TransitionHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $taskStatus = Get-ScalarValue -Block $CurrentTaskBlock -Key "status"
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1TransitionHotfixBaseSha -or $branch -ne "codex/p1-prepush-transition-hotfix") {
            Add-Finding "P1_PROGRAM_HOTFIX_CONTEXT_INVALID pre_commit"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1TransitionHotfixBaseSha -or $originMasterSha -ne $p1TransitionHotfixBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_HOTFIX_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1TransitionHotfixParentTaskId -or $taskStatus -ne "ready_for_closeout") {
        Add-Finding "P1_PROGRAM_HOTFIX_TASK_CONTEXT_INVALID"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1TransitionHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1TransitionHotfixAuthorizationPath) {
        Add-Finding "P1_PROGRAM_HOTFIX_ALREADY_MATERIALIZED"
    }

    $authorizationFullPath = Resolve-RepositoryPath -Root $Root -Path $p1TransitionHotfixAuthorizationPath
    $authorizationText = if (Test-Path -LiteralPath $authorizationFullPath -PathType Leaf) { Get-Content -LiteralPath $authorizationFullPath -Raw -Encoding UTF8 } else { "" }
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
            Add-Finding "P1_PROGRAM_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1HotfixAuthorization: approved_one_time" }
}

function Get-GitFileText {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Reference,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) { return "" }
    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $content = @(& git -C $Root show "${Reference}:$normalizedPath" 2>$null)
    if ($LASTEXITCODE -ne 0) { return "" }
    return $content -join "`n"
}

function Get-GitSnapshotFileText {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][ValidateSet("INDEX", "HEAD")][string]$Snapshot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) { return "" }
    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $objectPath = if ($Snapshot -eq "INDEX") { ":$normalizedPath" } else { "HEAD:$normalizedPath" }
    $content = @(& git -C $Root show $objectPath 2>$null)
    if ($LASTEXITCODE -ne 0) { return "" }
    return $content -join "`n"
}

function Test-P1F0132ScopeCorrectionFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0132ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
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
        if ($evidenceText -notmatch [regex]::Escape($evidenceMarker)) { Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_EVIDENCE_INCOMPLETE $evidenceMarker" }
    }
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results")) {
        if ((Get-MarkdownSection -Content $evidenceText -HeadingPattern ([regex]::Escape($evidenceSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_REVIEW_NOT_FINAL evidence_$($evidenceSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    foreach ($auditSection in @("Round 1", "Round 2")) {
        if ((Get-MarkdownSection -Content $auditText -HeadingPattern ([regex]::Escape($auditSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_$($auditSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    if ((Get-MarkdownSection -Content $auditText -HeadingPattern "Decision") -notmatch '(?im)^Decision:\s*APPROVE\s*$') {
        Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_decision"
    }
}

function Test-P1F0132ScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $taskStatus = Get-ScalarValue -Block $CurrentTaskBlock -Key "status"
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0132ScopeCorrectionBaseSha -or $branch -ne $p1F0132ScopeCorrectionBranch) {
            Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1F0132ScopeCorrectionBaseSha -or $originMasterSha -ne $p1F0132ScopeCorrectionBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1F0132ScopeCorrectionParentTaskId -or $taskStatus -ne "in_progress") {
        Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0132ScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0132ScopeCorrectionAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0132ScopeCorrectionAuthorizationPath
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
            Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }

    $queueGitPath = ConvertTo-NormalizedPath -Path $QueuePath
    $parentQueueText = (Get-GitFileText -Root $Root -Reference $parentReference -Path $queueGitPath) -replace "`r`n?", "`n"
    $currentQueueText = (Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $QueuePath) -replace "`r`n?", "`n"
    $queueAnchorCount = [regex]::Matches($parentQueueText, [regex]::Escape($p1F0132ScopeCorrectionQueueAnchor)).Count
    $expectedQueueText = if ($queueAnchorCount -eq 1 -and $parentQueueText -notmatch [regex]::Escape($p1F0132ScopeCorrectionAllowedFile)) {
        $parentQueueText.Replace($p1F0132ScopeCorrectionQueueAnchor, $p1F0132ScopeCorrectionQueueReplacement)
    } else {
        ""
    }
    if ([string]::IsNullOrWhiteSpace($expectedQueueText) -or $currentQueueText.TrimEnd("`n") -cne $expectedQueueText.TrimEnd("`n")) {
        Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
    }

    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0132ScopeCorrectionEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0132ScopeCorrectionAuditPath
    Test-P1F0132ScopeCorrectionReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0132ScopeCorrectionAuthorization: approved_one_time" }
}

function Test-P1F0115Phase11ScopeCorrectionFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0115Phase11ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0115Phase11ScopeCorrectionReviewContract {
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
        if ($EvidenceText -notmatch [regex]::Escape($evidenceMarker)) { Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_EVIDENCE_INCOMPLETE $evidenceMarker" }
    }
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results")) {
        if ((Get-MarkdownSection -Content $EvidenceText -HeadingPattern ([regex]::Escape($evidenceSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_REVIEW_NOT_FINAL evidence_$($evidenceSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    foreach ($auditSection in @("Round 1", "Round 2")) {
        if ((Get-MarkdownSection -Content $AuditText -HeadingPattern ([regex]::Escape($auditSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_$($auditSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    if ((Get-MarkdownSection -Content $AuditText -HeadingPattern "Decision") -notmatch '(?im)^Decision:\s*APPROVE\s*$') {
        Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_decision"
    }
}

function Test-P1F0115Phase11ScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $taskStatus = Get-ScalarValue -Block $CurrentTaskBlock -Key "status"
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0115Phase11ScopeCorrectionBaseSha -or $branch -ne $p1F0115Phase11ScopeCorrectionBranch) {
            Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1F0115Phase11ScopeCorrectionBaseSha -or $originMasterSha -ne $p1F0115Phase11ScopeCorrectionBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1F0115Phase11ScopeCorrectionParentTaskId -or $taskStatus -ne "in_progress") {
        Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0115Phase11ScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0115Phase11ScopeCorrectionAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115Phase11ScopeCorrectionAuthorizationPath
    foreach ($authorizationPattern in @(
        '(?im)^Status:\s*approved\s*$',
        '(?im)^Human approval source:\s*current user message',
        "(?im)^Task ID:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionTaskId))[\x60]?\s*$",
        "(?im)^Parent task:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionParentTaskId))[\x60]?\s*$",
        "(?im)^Base:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionBaseSha))[\x60]?\s*$",
        "(?im)^Branch:\s*[\x60]?$([regex]::Escape($p1F0115Phase11ScopeCorrectionBranch))[\x60]?\s*$",
        [regex]::Escape($p1F0115Phase11ScopeCorrectionAllowedFile),
        '(?i)every other.+in_progress.+hard-block',
        '(?i)(?:hook bypass.+not (?:approved|authorized)|does not authorize[^\r\n]*hook bypass)'
    )) {
        if ($authorizationText -notmatch $authorizationPattern) {
            Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }

    $queueGitPath = ConvertTo-NormalizedPath -Path $QueuePath
    $parentQueueText = (Get-GitFileText -Root $Root -Reference $parentReference -Path $queueGitPath) -replace "`r`n?", "`n"
    $currentQueueText = (Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $QueuePath) -replace "`r`n?", "`n"
    $queueAnchorCount = [regex]::Matches($parentQueueText, [regex]::Escape($p1F0115Phase11ScopeCorrectionQueueAnchor)).Count
    $expectedQueueText = if ($queueAnchorCount -eq 1 -and $parentQueueText -notmatch [regex]::Escape($p1F0115Phase11ScopeCorrectionAllowedFile)) {
        $parentQueueText.Replace($p1F0115Phase11ScopeCorrectionQueueAnchor, $p1F0115Phase11ScopeCorrectionQueueReplacement)
    } else {
        ""
    }
    if ([string]::IsNullOrWhiteSpace($expectedQueueText) -or $currentQueueText.TrimEnd("`n") -cne $expectedQueueText.TrimEnd("`n")) {
        Add-Finding "P1_PROGRAM_F0115_PHASE11_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
    }

    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115Phase11ScopeCorrectionEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115Phase11ScopeCorrectionAuditPath
    Test-P1F0115Phase11ScopeCorrectionReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time" }
}

function Test-P1F0115ModulePrecommitHotfixFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0115ModulePrecommitHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
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
        $sectionText = Get-MarkdownSection -Content $normalizedEvidenceText -HeadingPattern ([regex]::Escape($section))
        if ([regex]::Matches($normalizedEvidenceText, $headingPattern).Count -ne 1 -or [regex]::Matches($sectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $evidenceHasContradiction = $true
        }
    }
    $readingEvidenceSection = Get-MarkdownSection -Content $normalizedEvidenceText -HeadingPattern "Reading Evidence"
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
    if ($evidenceHasContradiction) { Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_ARTIFACT_CONTRADICTION evidence" }

    $auditHasContradiction = $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Result\s*:\s*fail\s*$' -or $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Decision\s*:\s*REJECT\s*$'
    foreach ($section in @("Round 1", "Round 2")) {
        $headingPattern = "(?im)^##\s+$([regex]::Escape($section))\s*$"
        $sectionText = Get-MarkdownSection -Content $normalizedAuditText -HeadingPattern ([regex]::Escape($section))
        if ([regex]::Matches($normalizedAuditText, $headingPattern).Count -ne 1 -or [regex]::Matches($sectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $auditHasContradiction = $true
        }
    }
    if ([regex]::Matches($normalizedAuditText, '(?im)^##\s+Decision\s*$').Count -ne 1 -or [regex]::Matches($normalizedAuditText, '(?im)^\s*Decision\s*:\s*APPROVE\s*$').Count -ne 1) {
        $auditHasContradiction = $true
    }
    if ($auditHasContradiction) { Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_ARTIFACT_CONTRADICTION audit" }
}

function Test-P1F0115ModulePrecommitHotfixAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $taskStatus = Get-ScalarValue -Block $CurrentTaskBlock -Key "status"
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0115ModulePrecommitHotfixBaseSha -or $branch -ne $p1F0115ModulePrecommitHotfixBranch) {
            Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1F0115ModulePrecommitHotfixBaseSha -or $originMasterSha -ne $p1F0115ModulePrecommitHotfixBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1F0115ModulePrecommitHotfixParentTaskId -or $taskStatus -ne "ready_for_closeout") {
        Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0115ModulePrecommitHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0115ModulePrecommitHotfixAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115ModulePrecommitHotfixAuthorizationPath
    foreach ($pattern in @(
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
        if ($authorizationText -notmatch $pattern) {
            Add-Finding "P1_PROGRAM_F0115_MODULE_PRECOMMIT_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115ModulePrecommitHotfixEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115ModulePrecommitHotfixAuditPath
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
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $taskStatus = Get-ScalarValue -Block $CurrentTaskBlock -Key "status"
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0116DesignPathGuardHotfixBaseSha -or $branch -ne $p1F0116DesignPathGuardHotfixBranch) {
            Add-Finding "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1F0116DesignPathGuardHotfixBaseSha -or $originMasterSha -ne $p1F0116DesignPathGuardHotfixBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1F0116DesignPathGuardHotfixParentTaskId -or $taskStatus -ne "ready_for_closeout") {
        Add-Finding "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0116DesignPathGuardHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0116DesignPathGuardHotfixAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0116DesignPathGuardHotfixAuthorizationPath
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
            Add-Finding "P1_PROGRAM_F0116_DESIGNPATH_GUARD_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0116DesignPathGuardHotfixEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0116DesignPathGuardHotfixAuditPath
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
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowNull()][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $normalizedCurrentTaskBlock = @($CurrentTaskBlock | Where-Object { $null -ne $_ })
    $taskStatus = if ($normalizedCurrentTaskBlock.Count -eq 0) { "" } else { Get-ScalarValue -Block $normalizedCurrentTaskBlock -Key "status" }
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0116ScopeCorrectionGuardHotfixBaseSha -or $branch -ne $p1F0116ScopeCorrectionGuardHotfixBranch) {
            Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1F0116ScopeCorrectionGuardHotfixBaseSha -or $originMasterSha -ne $p1F0116ScopeCorrectionGuardHotfixBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1F0116ScopeCorrectionGuardHotfixParentTaskId -or $taskStatus -ne "in_progress") {
        Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0116ScopeCorrectionGuardHotfixAuthorizationPath
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
            Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Label = "state"; Replacements = @(
            @{ Anchor = "    reason: current_user_approved_p1_remediation_goal_2026_07_16`n    approvalRequestPath: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`n    resumeAction: review_approved_server_owned_employee_create_import_preflight_design_for_f0116"; Replacement = "    reason: current_user_approved_written_f0116_spec_2026_07_18`n    approvalRequestPath: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`n    resumeAction: execute_f0116_employee_import_server_preflight_plan_red_to_green" },
            @{ Anchor = "  lastKnownMasterSha: f466caa81260686d5a2fbcbf62ba08717bf56a82`n  lastKnownOriginMasterSha: f466caa81260686d5a2fbcbf62ba08717bf56a82`n  lastKnownRemoteMasterSha: f466caa81260686d5a2fbcbf62ba08717bf56a82"; Replacement = "  lastKnownMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownOriginMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff`n  lastKnownRemoteMasterSha: f6b14825f41a83b3f9dd3994ec9c1936876b12ff" }
        )},
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Label = "queue"; Replacements = @(
            @{ Anchor = "      - src/server/services/admin-organization-org-auth-runtime.ts`n      - tests/unit/phase-20-ra-01-04-employee-import.test.ts"; Replacement = "      - src/server/services/admin-organization-org-auth-runtime.ts`n      - tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts`n      - tests/unit/phase-20-ra-01-04-employee-import.test.ts" },
            @{ Anchor = "      - tests/unit/phase-11-system-ops-user-management-loop.test.ts`n      - tests/unit/p1-employee-import-command-atomicity.test.ts"; Replacement = "      - tests/unit/phase-11-system-ops-user-management-loop.test.ts`n      - tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`n      - tests/unit/p1-employee-import-command-atomicity.test.ts" },
            @{ Anchor = "      status: waiting_for_spec_review`n      reason: current_user_approved_design_option_a_but_written_spec_review_is_required`n      approvalRequestPath: docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`n      resumeAction: review_written_f0116_server_preflight_spec_then_write_implementation_plan"; Replacement = "      status: satisfied`n      reason: current_user_approved_written_f0116_spec_2026_07_18`n      approvalRequestPath: docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`n      resumeAction: execute_f0116_employee_import_server_preflight_plan_red_to_green" }
        )}
    )) {
        $parentText = (Get-GitFileText -Root $Root -Reference $parentReference -Path $projection.Path) -replace "`r`n?", "`n"
        $currentText = (Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $projection.Path) -replace "`r`n?", "`n"
        $expectedText = $parentText
        $validProjection = $true
        foreach ($replacement in $projection.Replacements) {
            if ([regex]::Matches($expectedText, [regex]::Escape($replacement.Anchor)).Count -ne 1) { $validProjection = $false; break }
            $expectedText = $expectedText.Replace($replacement.Anchor, $replacement.Replacement)
        }
        if (-not $validProjection -or $currentText -cne $expectedText) {
            Add-Finding "P1_PROGRAM_F0116_SCOPE_CORRECTION_GUARD_HOTFIX_$($projection.Label.ToUpperInvariant())_DELTA_INVALID"
        }
    }

    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0116ScopeCorrectionGuardHotfixEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0116ScopeCorrectionGuardHotfixAuditPath
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
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowNull()][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $normalizedCurrentTaskBlock = @($CurrentTaskBlock | Where-Object { $null -ne $_ })
    $taskStatus = if ($normalizedCurrentTaskBlock.Count -eq 0) { "" } else { Get-ScalarValue -Block $normalizedCurrentTaskBlock -Key "status" }
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0117SpecApprovalTransitionHotfixBaseSha -or $branch -ne $p1F0117SpecApprovalTransitionHotfixBranch) {
            Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1F0117SpecApprovalTransitionHotfixBaseSha -or $originMasterSha -ne $p1F0117SpecApprovalTransitionHotfixBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1F0117SpecApprovalTransitionHotfixParentTaskId -or $taskStatus -ne "in_progress") {
        Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0117SpecApprovalTransitionHotfixAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0117SpecApprovalTransitionHotfixAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0117SpecApprovalTransitionHotfixAuthorizationPath
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
            Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID"
            break
        }
    }

    $authorizationFileSection = Get-MarkdownSection -Content $authorizationText -HeadingPattern "Exact Files"
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SpecApprovalTransitionHotfixFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID"
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
        $parentText = (Get-GitFileText -Root $Root -Reference $parentReference -Path $projection.Path) -replace "`r`n?", "`n"
        $currentText = (Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $projection.Path) -replace "`r`n?", "`n"
        $expectedText = $parentText
        $validProjection = $true
        foreach ($replacement in $projection.Replacements) {
            if ([regex]::Matches($expectedText, [regex]::Escape($replacement.Anchor)).Count -ne 1) { $validProjection = $false; break }
            $expectedText = $expectedText.Replace($replacement.Anchor, $replacement.Replacement)
        }
        if (-not $validProjection -or $currentText -cne $expectedText) {
            $projectionFinding = if ($projection.Label -eq "STATE") {
                "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_STATE_INVALID"
            } else {
                "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID"
            }
            Add-Finding $projectionFinding
        }
    }

    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0117SpecApprovalTransitionHotfixEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0117SpecApprovalTransitionHotfixAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0117SpecApprovalTransitionHotfixAuthorization: approved_one_time" }
}

function Test-P1F0117SmokeScopeCorrectionFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0117SmokeScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0117SmokeScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowNull()][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $findingCountBefore = $script:findings.Count
    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $normalizedCurrentTaskBlock = @($CurrentTaskBlock | Where-Object { $null -ne $_ })
    $taskStatus = if ($normalizedCurrentTaskBlock.Count -eq 0) { "" } else { Get-ScalarValue -Block $normalizedCurrentTaskBlock -Key "status" }
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0117SmokeScopeCorrectionBaseSha -or $branch -ne $p1F0117SmokeScopeCorrectionBranch) {
            Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        if ($unstagedTrackedExitCode -ne 0 -or $LASTEXITCODE -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        if ($headParents.Count -ne 2 -or $headParents[1] -ne $p1F0117SmokeScopeCorrectionBaseSha -or $originMasterSha -ne $p1F0117SmokeScopeCorrectionBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
    }

    if ($CurrentTaskId -ne $p1F0117SmokeScopeCorrectionParentTaskId -or $taskStatus -ne "in_progress") {
        Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0117SmokeScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0117SmokeScopeCorrectionAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0117SmokeScopeCorrectionAuthorizationPath
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
            Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }

    $authorizationFileSection = Get-MarkdownSection -Content $authorizationText -HeadingPattern "Exact Governance Files"
    $authorizationFiles = @([regex]::Matches($authorizationFileSection, '(?m)^\s*\d+\.\s+`([^`]+)`\s*$') | ForEach-Object { ConvertTo-NormalizedPath -Path $_.Groups[1].Value })
    $expectedAuthorizationFiles = @($p1F0117SmokeScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    if (($authorizationFiles -join "|") -cne ($expectedAuthorizationFiles -join "|")) {
        Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_AUTHORIZATION_FILE_SET_INVALID"
    }

    foreach ($projection in @(
        @{ Path = "docs/04-agent-system/state/project-state.yaml"; Label = "STATE"; Anchor = "  lastKnownMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownOriginMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7`n  lastKnownRemoteMasterSha: 366f17446e9fc75a777ebfe5977ad72db1062eb7"; Replacement = "  lastKnownMasterSha: $p1F0117SmokeScopeCorrectionBaseSha`n  lastKnownOriginMasterSha: $p1F0117SmokeScopeCorrectionBaseSha`n  lastKnownRemoteMasterSha: $p1F0117SmokeScopeCorrectionBaseSha" },
        @{ Path = "docs/04-agent-system/state/task-queue.yaml"; Label = "QUEUE"; Anchor = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts"; Replacement = "      - tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`n      - $p1F0117SmokeScopeCorrectionAllowedFile`n      - tests/unit/phase-8-admin-redeem-code-runtime.test.ts" }
    )) {
        $parentText = (Get-GitFileText -Root $Root -Reference $parentReference -Path $projection.Path) -replace "`r`n?", "`n"
        $currentText = (Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $projection.Path) -replace "`r`n?", "`n"
        $anchorCount = [regex]::Matches($parentText, [regex]::Escape($projection.Anchor)).Count
        $expectedText = if ($anchorCount -eq 1) { $parentText.Replace($projection.Anchor, $projection.Replacement) } else { "" }
        if ([string]::IsNullOrWhiteSpace($expectedText) -or $currentText -cne $expectedText) {
            if ($projection.Label -eq "STATE") {
                Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_STATE_DELTA_INVALID"
            } else {
                Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
            }
        }
    }

    $reviewFindingCountBefore = $script:findings.Count
    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0117SmokeScopeCorrectionEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0117SmokeScopeCorrectionAuditPath
    Test-P1F0115ModulePrecommitHotfixReviewContract -EvidenceText $evidenceText -AuditText $auditText
    if ($script:findings.Count -gt $reviewFindingCountBefore) { Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_REVIEW_INVALID" }
    if ($script:findings.Count -eq $findingCountBefore) { Write-Output "p1F0117SmokeScopeCorrectionAuthorization: approved_one_time" }
}

function Test-P1F0115ScopeCorrectionFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $actualFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    $expectedFiles = @($p1F0115ScopeCorrectionFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
    return ($actualFiles -join "|") -ceq ($expectedFiles -join "|")
}

function Test-P1F0115ScopeCorrectionReviewContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText
    )

    $normalizedEvidenceText = $EvidenceText -replace "`r`n?", "`n"
    $normalizedAuditText = $AuditText -replace "`r`n?", "`n"
    $evidenceHasContradiction = $normalizedEvidenceText -match '(?im)^\s*(?:-\s*)?Result\s*:\s*fail\s*$' -or $normalizedEvidenceText -match '(?im)^\s*(?:-\s*)?Decision\s*:\s*REJECT\s*$'
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results", "Scope Freeze")) {
        $evidenceHeadingPattern = "(?im)^##\s+$([regex]::Escape($evidenceSection))\s*$"
        $evidenceSectionText = Get-MarkdownSection -Content $normalizedEvidenceText -HeadingPattern ([regex]::Escape($evidenceSection))
        if ([regex]::Matches($normalizedEvidenceText, $evidenceHeadingPattern).Count -ne 1 -or [regex]::Matches($evidenceSectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $evidenceHasContradiction = $true
        }
    }
    $readingEvidenceHeadingCount = [regex]::Matches($normalizedEvidenceText, '(?im)^##\s+Reading Evidence\s*$').Count
    $readingEvidenceSection = Get-MarkdownSection -Content $normalizedEvidenceText -HeadingPattern "Reading Evidence"
    if ($readingEvidenceHeadingCount -ne 1 -or [regex]::Matches($normalizedEvidenceText, '(?im)^\s*-\s*Evidence status\s*:\s*pass\s*$').Count -ne 1) {
        $evidenceHasContradiction = $true
    }
    foreach ($readingEvidenceMarkerPattern in @(
        '(?im)^\s*status\s*:\s*complete\s*$',
        '(?im)^\s*conflictsFound\s*:\s*false\s*$',
        '(?im)^\s*targetSourceReviewed\s*:\s*true\s*$',
        '(?im)^\s*targetTestsReviewed\s*:\s*true\s*$',
        '(?im)^\s*analogousImplementationReviewed\s*:\s*true\s*$',
        '(?im)^\s*Cost Calibration Gate remains blocked\s*$'
    )) {
        if ([regex]::Matches($readingEvidenceSection, $readingEvidenceMarkerPattern).Count -ne 1) { $evidenceHasContradiction = $true }
    }
    if ($evidenceHasContradiction) { Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION evidence" }

    $auditHasContradiction = $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Result\s*:\s*fail\s*$' -or $normalizedAuditText -match '(?im)^\s*(?:-\s*)?Decision\s*:\s*REJECT\s*$'
    foreach ($auditSection in @("Round 1", "Round 2")) {
        $auditHeadingPattern = "(?im)^##\s+$([regex]::Escape($auditSection))\s*$"
        $auditSectionText = Get-MarkdownSection -Content $normalizedAuditText -HeadingPattern ([regex]::Escape($auditSection))
        if ([regex]::Matches($normalizedAuditText, $auditHeadingPattern).Count -ne 1 -or [regex]::Matches($auditSectionText, '(?im)^\s*Result\s*:\s*pass\s*$').Count -ne 1) {
            $auditHasContradiction = $true
        }
    }
    if ([regex]::Matches($normalizedAuditText, '(?im)^##\s+Decision\s*$').Count -ne 1 -or [regex]::Matches($normalizedAuditText, '(?im)^\s*Decision\s*:\s*APPROVE\s*$').Count -ne 1) {
        $auditHasContradiction = $true
    }
    if ($auditHasContradiction) { Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION audit" }

    foreach ($evidenceMarker in @(
        "Evidence status: pass",
        "## Reading Evidence",
        "status: complete",
        "conflictsFound: false",
        "targetSourceReviewed: true",
        "targetTestsReviewed: true",
        "analogousImplementationReviewed: true",
        "Cost Calibration Gate remains blocked"
    )) {
        if ($EvidenceText -notmatch [regex]::Escape($evidenceMarker)) { Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_EVIDENCE_INCOMPLETE $evidenceMarker" }
    }
    foreach ($evidenceSection in @("Requirement Mapping Result", "Root-Cause Reproduction", "TDD Evidence", "Validation Results", "Scope Freeze")) {
        if ((Get-MarkdownSection -Content $EvidenceText -HeadingPattern ([regex]::Escape($evidenceSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_REVIEW_NOT_FINAL evidence_$($evidenceSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    foreach ($auditSection in @("Round 1", "Round 2")) {
        if ((Get-MarkdownSection -Content $AuditText -HeadingPattern ([regex]::Escape($auditSection))) -notmatch '(?im)^Result:\s*pass\s*$') {
            Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_$($auditSection.Replace(' ', '_').ToLowerInvariant())"
        }
    }
    if ((Get-MarkdownSection -Content $AuditText -HeadingPattern "Decision") -notmatch '(?im)^Decision:\s*APPROVE\s*$') {
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_REVIEW_NOT_FINAL audit_decision"
    }
}

function Test-P1F0115ScopeCorrectionAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$CurrentTaskId,
        [Parameter(Mandatory = $true)][AllowNull()][AllowEmptyCollection()][AllowEmptyString()][string[]]$CurrentTaskBlock,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$CurrentPhase
    )

    $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
    $branch = ((& git -C $Root branch --show-current) -join "").Trim()
    $normalizedCurrentTaskBlock = @($CurrentTaskBlock | Where-Object { $null -ne $_ })
    $taskStatus = if ($normalizedCurrentTaskBlock.Count -eq 0) { "" } else { Get-ScalarValue -Block $normalizedCurrentTaskBlock -Key "status" }
    $parentReference = "HEAD"

    if ($CurrentPhase -eq "pre_commit") {
        if ($headSha -ne $p1F0115ScopeCorrectionBaseSha -or $branch -ne $p1F0115ScopeCorrectionBranch) {
            Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_CONTEXT_INVALID pre_commit"
        }
        & git -C $Root diff --quiet
        $unstagedTrackedExitCode = $LASTEXITCODE
        $untrackedFiles = @(& git -C $Root ls-files --others --exclude-standard)
        $untrackedInspectionExitCode = $LASTEXITCODE
        if ($unstagedTrackedExitCode -ne 0 -or $untrackedInspectionExitCode -ne 0 -or $untrackedFiles.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
        }
    } else {
        $headParents = @(((& git -C $Root rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        $parentInspectionExitCode = $LASTEXITCODE
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        $originInspectionExitCode = $LASTEXITCODE
        if ($parentInspectionExitCode -ne 0 -or $originInspectionExitCode -ne 0 -or $headParents.Count -ne 2 -or $headParents[1] -ne $p1F0115ScopeCorrectionBaseSha -or $originMasterSha -ne $p1F0115ScopeCorrectionBaseSha -or $branch -ne "master") {
            Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_CONTEXT_INVALID pre_push"
        } else {
            $parentReference = $headParents[1]
        }
        $worktreeStatus = @(& git -C $Root status --porcelain)
        if ($LASTEXITCODE -ne 0 -or $worktreeStatus.Count -gt 0) {
            Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_PARTIAL_STAGE_INVALID"
        }
    }

    if ($CurrentTaskId -ne $p1F0115ScopeCorrectionParentTaskId -or $taskStatus -ne "in_progress") {
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_CONTEXT_INVALID task"
    }

    $materializedAuthorizationPath = ((& git -C $Root ls-tree -r --name-only $parentReference -- $p1F0115ScopeCorrectionAuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_PARENT_INSPECTION_FAILED"
    } elseif ($materializedAuthorizationPath -eq $p1F0115ScopeCorrectionAuthorizationPath) {
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_ALREADY_MATERIALIZED"
    }

    $contentSnapshot = if ($CurrentPhase -eq "pre_commit") { "INDEX" } else { "HEAD" }
    $authorizationText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115ScopeCorrectionAuthorizationPath
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
            Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID"
            break
        }
    }
    $capabilityAuthorizationSection = Get-MarkdownSection -Content $normalizedAuthorizationText -HeadingPattern "Capability Authorization"
    $capabilityAuthorizationIsExact = [regex]::Matches($capabilityAuthorizationSection, [regex]::Escape($p1F0115ScopeCorrectionCapabilityAuthorization)).Count -eq 1
    foreach ($capabilityAuthorizationLine in @($p1F0115ScopeCorrectionCapabilityAuthorization -split "`n")) {
        $capabilityName = ($capabilityAuthorizationLine -split ':', 2)[0]
        if ([regex]::Matches($capabilityAuthorizationSection, "(?m)^$([regex]::Escape($capabilityName)):\s*.*$").Count -ne 1) {
            $capabilityAuthorizationIsExact = $false
        }
    }
    if (-not $capabilityAuthorizationIsExact) {
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID capability_authorization"
    }
    $authorizationHasContradiction = [regex]::Matches($normalizedAuthorizationText, '(?im)^##\s+Capability Authorization\s*$').Count -ne 1 -or
        [regex]::Matches($normalizedAuthorizationText, '(?im)^##\s+.*Authorization.*$').Count -ne 1 -or
        [regex]::Matches($normalizedAuthorizationText, '(?im)^\s*Status\s*:\s*approved\s*$').Count -ne 1 -or
        [regex]::Matches($normalizedAuthorizationText, '(?im)^\s*Status\s*:\s*.*$').Count -ne 1
    $canonicalCapabilityAuthorizationLines = @($p1F0115ScopeCorrectionCapabilityAuthorization -split "`n")
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
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_ARTIFACT_CONTRADICTION authorization"
    }
    $authorizationFileSection = Get-MarkdownSection -Content $authorizationText -HeadingPattern "Exact Files"
    $authorizationFileLines = @($authorizationFileSection -split "`n" | Where-Object { $_ -match '^\s*-\s+[\x60]([^\x60]+)[\x60]\s*$' } | ForEach-Object { $Matches[1] })
    $authorizationBulletCount = @($authorizationFileSection -split "`n" | Where-Object { $_ -match '^\s*-\s+' }).Count
    if ($authorizationBulletCount -ne $p1F0115ScopeCorrectionFiles.Count -or ($authorizationFileLines -join "|") -cne ($p1F0115ScopeCorrectionFiles -join "|")) {
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_AUTHORIZATION_INVALID exact_files"
    }

    $queueGitPath = ConvertTo-NormalizedPath -Path $QueuePath
    $parentQueueText = (Get-GitFileText -Root $Root -Reference $parentReference -Path $queueGitPath) -replace "`r`n?", "`n"
    $currentQueueText = (Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $QueuePath) -replace "`r`n?", "`n"
    $taskPattern = "(?ms)^  - id:\s*$([regex]::Escape($p1F0115ScopeCorrectionParentTaskId))\s*`n.*?(?=^  - id:|^standingAuthorization:|\z)"
    $parentTaskMatches = @([regex]::Matches($parentQueueText, $taskPattern))
    $currentTaskMatches = @([regex]::Matches($currentQueueText, $taskPattern))
    $queueDeltaIsValid = $parentTaskMatches.Count -eq 1 -and $currentTaskMatches.Count -eq 1
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
                Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID $($queueReplacement.Label)_anchor_count_$anchorCount"
                $queueDeltaIsValid = $false
                break
            }
            $expectedTaskBlock = $expectedTaskBlock.Replace($queueReplacement.Anchor, $queueReplacement.Replacement)
        }
        if ($queueDeltaIsValid) {
            foreach ($queueReplacement in @($queueReplacements | Where-Object { -not [string]::IsNullOrEmpty($_.Replacement) })) {
                $replacementCount = [regex]::Matches($currentTaskMatch.Value, [regex]::Escape($queueReplacement.Replacement)).Count
                if ($replacementCount -ne 1) {
                    Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID $($queueReplacement.Label)_replacement_count_$replacementCount"
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
        Add-Finding "P1_PROGRAM_F0115_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
    }

    $evidenceText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115ScopeCorrectionEvidencePath
    $auditText = Get-GitSnapshotFileText -Root $Root -Snapshot $contentSnapshot -Path $p1F0115ScopeCorrectionAuditPath
    Test-P1F0115ScopeCorrectionReviewContract -EvidenceText $evidenceText -AuditText $auditText
}

function Get-NormalizedCloseoutProjection {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][ValidateSet("state", "queue")][string]$Kind
    )

    $normalized = [System.Collections.Generic.List[string]]::new()
    $insideStateCurrentTask = $false
    $insideQueueTask = $false
    foreach ($line in $Lines) {
        if ($Kind -eq "state") {
            if ($line -match '^currentTask:\s*$') {
                $insideStateCurrentTask = $true
            } elseif ($insideStateCurrentTask -and $line -match '^\S') {
                $insideStateCurrentTask = $false
            } elseif ($insideStateCurrentTask -and $line -match '^  id:\s+(\S+)\s*$' -and $Matches[1] -ne $TaskId) {
                $insideStateCurrentTask = $false
            }
        } elseif ($line -match '^  - id:\s+(\S+)\s*$') {
            $insideQueueTask = $Matches[1] -eq $TaskId
        }

        if ($line -match "^    $([regex]::Escape($TaskId)):\s+(?:in_progress|ready_for_closeout)\s*$") {
            $normalized.Add("    ${TaskId}: <closeout-status>")
        } elseif ($Kind -eq "state" -and $insideStateCurrentTask -and $line -match '^  status:\s+(?:in_progress|ready_for_closeout)\s*$') {
            $normalized.Add("  status: <closeout-status>")
        } elseif ($Kind -eq "queue" -and $insideQueueTask -and $line -match '^    status:\s+(?:in_progress|ready_for_closeout)\s*$') {
            $normalized.Add("    status: <closeout-status>")
        } else {
            $normalized.Add($line)
        }
    }
    return $normalized -join "`n"
}

function Test-PathPattern {
    param([Parameter(Mandatory = $true)][string]$Path, [Parameter(Mandatory = $true)][string]$Pattern)
    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $normalizedPattern = ConvertTo-NormalizedPath -Path $Pattern
    if ($normalizedPattern.EndsWith("/**")) {
        $prefix = $normalizedPattern.Substring(0, $normalizedPattern.Length - 3)
        return $normalizedPath -eq $prefix -or $normalizedPath.StartsWith("$prefix/")
    }
    if ($normalizedPattern.Contains("*")) {
        $regex = "^" + [regex]::Escape($normalizedPattern).Replace("\*", "[^/]*") + "$"
        return $normalizedPath -match $regex
    }
    return $normalizedPath -eq $normalizedPattern
}

function Get-CandidateIdsFromPlan {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$PlanText)

    $ids = [System.Collections.Generic.List[string]]::new()
    foreach ($line in ($PlanText -split "`r?`n")) {
        if ($line -match '^\|\s*(?:0?[1-9]|10)\s*\|\s*`([^`]+)`\s*\|') {
            $ids.Add($Matches[1])
        }
    }
    return $ids.ToArray()
}

function Get-FindingBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$LedgerText)
    return @([regex]::Matches($LedgerText, '(?ms)^  - findingId:\s*"?([^"\r\n]+)"?\s*\r?\n(.*?)(?=^  - findingId:|\z)'))
}

function Get-MarkdownSection {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory = $true)][string]$HeadingPattern
    )

    $match = [regex]::Match($Content, "(?ms)^##\s+$HeadingPattern\s*$\r?\n(.*?)(?=^##\s+|\z)")
    if (-not $match.Success) { return "" }
    return $match.Groups[1].Value
}

function Test-FinalReviewContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText,
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $false)][string]$FindingPrefix = "P1_PROGRAM_REVIEW_NOT_FINAL"
    )

    foreach ($reviewContract in @(
        @{ Label = "evidence_round_1"; Text = (Get-MarkdownSection -Content $EvidenceText -HeadingPattern "Round 1[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "evidence_round_2"; Text = (Get-MarkdownSection -Content $EvidenceText -HeadingPattern "Round 2[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "evidence_validation"; Text = (Get-MarkdownSection -Content $EvidenceText -HeadingPattern "Validation Results[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "audit_round_1"; Text = (Get-MarkdownSection -Content $AuditText -HeadingPattern "Round 1[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "audit_round_2"; Text = (Get-MarkdownSection -Content $AuditText -HeadingPattern "Round 2[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "audit_final"; Text = (Get-MarkdownSection -Content $AuditText -HeadingPattern "Final Disposition[^\r\n]*"); Pattern = '(?im)^(?:Result:\s*pass|Decision:\s*APPROVE)\s*$' }
    )) {
        if ([string]::IsNullOrWhiteSpace($reviewContract.Text) -or $reviewContract.Text -notmatch $reviewContract.Pattern -or $reviewContract.Text -match '(?im)^\s*Pending(?:\s|\.|$)') {
            Add-Finding "$FindingPrefix $TaskId $($reviewContract.Label)"
        }
    }
}

function Test-ScopeFreezeReviewContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    foreach ($reviewContract in @(
        @{ Label = "jit_revalidation"; Text = (Get-MarkdownSection -Content $EvidenceText -HeadingPattern "JIT Revalidation Result[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "scope_freeze"; Text = (Get-MarkdownSection -Content $EvidenceText -HeadingPattern "Scope Freeze[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "audit_round_1"; Text = (Get-MarkdownSection -Content $AuditText -HeadingPattern "Round 1[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "audit_round_2"; Text = (Get-MarkdownSection -Content $AuditText -HeadingPattern "Round 2[^\r\n]*"); Pattern = '(?im)^Result:\s*pass\s*$' },
        @{ Label = "transition_disposition"; Text = (Get-MarkdownSection -Content $AuditText -HeadingPattern "Transition Disposition[^\r\n]*"); Pattern = '(?im)^Decision:\s*APPROVE_SCOPE\s*$' }
    )) {
        if ([string]::IsNullOrWhiteSpace($reviewContract.Text) -or $reviewContract.Text -notmatch $reviewContract.Pattern -or $reviewContract.Text -match '(?im)^\s*Pending(?:\s|\.|$)') {
            Add-Finding "P1_PROGRAM_SCOPE_FREEZE_REVIEW_INCOMPLETE $TaskId $($reviewContract.Label)"
        }
    }
}

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) { $RepositoryRoot = (Get-Location).Path }
$RepositoryRoot = [System.IO.Path]::GetFullPath($RepositoryRoot)
$stateFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $ProjectStatePath
$queueFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $QueuePath
foreach ($requiredFile in @($stateFullPath, $queueFullPath)) {
    if (-not (Test-Path -LiteralPath $requiredFile -PathType Leaf)) { throw "P1_PROGRAM_REQUIRED_FILE_MISSING $requiredFile" }
}

$stateLines = @(Get-Content -LiteralPath $stateFullPath -Encoding UTF8)
$queueLines = @(Get-Content -LiteralPath $queueFullPath -Encoding UTF8)
Test-CanonicalYamlSurfaceSyntax -Lines $stateLines -Label "project-state"
Test-CanonicalYamlSurfaceSyntax -Lines $queueLines -Label "task-queue"
foreach ($topLevelSurface in @(
    @{ Label = "project-state"; Keys = @(Get-TopLevelKeys -Lines $stateLines) },
    @{ Label = "task-queue"; Keys = @(Get-TopLevelKeys -Lines $queueLines) }
)) {
    foreach ($duplicateKey in @($topLevelSurface.Keys | Group-Object | Where-Object { $_.Count -gt 1 })) {
        Add-Finding "P1_PROGRAM_DUPLICATE_TOP_LEVEL_KEY $($topLevelSurface.Label) $($duplicateKey.Name)"
    }
}
$stateProgram = @(Get-TopLevelBlock -Lines $stateLines -Key $programKey)
$queueProgram = @(Get-TopLevelBlock -Lines $queueLines -Key $programKey)
if ($stateProgram.Count -eq 0 -or $queueProgram.Count -eq 0) { throw "P1_PROGRAM_STATE_MISSING" }
Test-DirectMappingKeysUnique -Block $stateProgram -Label "project-state $programKey"
Test-DirectMappingKeysUnique -Block $queueProgram -Label "task-queue $programKey"

foreach ($programBlock in @($stateProgram, $queueProgram)) {
    if ((Get-ScalarValue -Block $programBlock -Key "programId") -ne $expectedProgramId) { Add-Finding "P1_PROGRAM_ID_INVALID" }
    if ((Get-ScalarValue -Block $programBlock -Key "activityStatePolicy") -ne $expectedPolicy) { Add-Finding "P1_PROGRAM_POLICY_INVALID" }
    $findingCountsBlock = @(Get-SectionBlock -Block $programBlock -Key "findingCounts")
    Test-DirectMappingKeysUnique -Block $findingCountsBlock -Label "$programKey findingCounts"
    if ((Get-ScalarValue -Block $findingCountsBlock -Key "p1") -ne "125") { Add-Finding "P1_PROGRAM_P1_COUNT_INVALID" }
    if ((Get-ScalarValue -Block $findingCountsBlock -Key "p2") -ne "18") { Add-Finding "P1_PROGRAM_P2_COUNT_INVALID" }
    if ((Get-ScalarValue -Block $programBlock -Key "runtimeValidationCount") -ne "21") { Add-Finding "P1_PROGRAM_RUNTIME_COUNT_INVALID" }

    $p2 = @(Get-SectionBlock -Block $programBlock -Key "p2Implementation")
    Test-DirectMappingKeysUnique -Block $p2 -Label "$programKey p2Implementation"
    if ((Get-ScalarValue -Block $p2 -Key "approved") -ne "false" -or (Get-ScalarValue -Block $p2 -Key "status") -ne "impact_mapping_only") {
        Add-Finding "P1_PROGRAM_P2_SCOPE_EXPANDED"
    }
    $runtime = @(Get-SectionBlock -Block $programBlock -Key "runtimeAcceptance")
    Test-DirectMappingKeysUnique -Block $runtime -Label "$programKey runtimeAcceptance"
    if ((Get-ScalarValue -Block $runtime -Key "approved") -ne "false" -or (Get-ScalarValue -Block $runtime -Key "status") -ne "excluded_from_program") {
        Add-Finding "P1_PROGRAM_RUNTIME_SCOPE_EXPANDED"
    }
    $deployment = @(Get-SectionBlock -Block $programBlock -Key "deployment")
    Test-DirectMappingKeysUnique -Block $deployment -Label "$programKey deployment"
    if ((Get-ScalarValue -Block $deployment -Key "approved") -ne "false" -or (Get-ScalarValue -Block $deployment -Key "status") -notmatch "^blocked") {
        Add-Finding "P1_PROGRAM_DEPLOYMENT_AUTO_AUTHORIZED"
    }
}

$stateStatus = Get-ScalarValue -Block $stateProgram -Key "status"
$queueStatus = Get-ScalarValue -Block $queueProgram -Key "status"
if ($stateStatus -notin @("in_progress", "closed") -or $stateStatus -ne $queueStatus) { Add-Finding "P1_PROGRAM_STATUS_INVALID" }

foreach ($shaKey in @("baselineSha", "p0ProductStaticBaselineSha", "auditRepositorySha")) {
    $stateSha = Get-ScalarValue -Block $stateProgram -Key $shaKey
    $queueSha = Get-ScalarValue -Block $queueProgram -Key $shaKey
    if ($stateSha -ne $expectedShas[$shaKey] -or $stateSha -ne $queueSha) { Add-Finding "P1_PROGRAM_SHA_MISMATCH $shaKey" }
}

$pointerDefinitions = @(
    @{ Label = "authorization"; Key = "standingAuthorizationSource" },
    @{ Label = "serial_plan"; Key = "serialPlanPath" },
    @{ Label = "finding_ledger"; Key = "findingLedgerPath" },
    @{ Label = "post_p0_map"; Key = "postP0MapPath" },
    @{ Label = "clusters"; Key = "clusterPath" },
    @{ Label = "runtime_backlog"; Key = "runtimeBacklogPath" },
    @{ Label = "guard"; Key = "guardScriptPath" }
)
$pointerValues = @{}
foreach ($pointer in $pointerDefinitions) {
    $stateValue = Get-ScalarValue -Block $stateProgram -Key $pointer.Key
    $queueValue = Get-ScalarValue -Block $queueProgram -Key $pointer.Key
    $pointerValues[$pointer.Key] = $stateValue
    if ([string]::IsNullOrWhiteSpace($stateValue) -or $stateValue -ne $queueValue) {
        Add-Finding "P1_PROGRAM_POINTER_MISMATCH $($pointer.Label)"
        continue
    }
    if (-not $SkipExternalIntegrityChecks -and $stateValue -ne $expectedPointerValues[$pointer.Key]) {
        Add-Finding "P1_PROGRAM_POINTER_NOT_CANONICAL $($pointer.Label)"
    }
    if (-not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $stateValue) -PathType Leaf)) {
        Add-Finding "P1_PROGRAM_ARTIFACT_MISSING $($pointer.Label)"
    }
    if (-not $SkipExternalIntegrityChecks -and $expectedFrozenArtifactHashes.ContainsKey($pointer.Key)) {
        $artifactFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $stateValue
        if ((Test-Path -LiteralPath $artifactFullPath -PathType Leaf) -and (Get-FileSha256 -Path $artifactFullPath) -ne $expectedFrozenArtifactHashes[$pointer.Key]) {
            Add-Finding "P1_PROGRAM_FROZEN_ARTIFACT_HASH_MISMATCH $($pointer.Label)"
        }
    }
}

$stateCandidates = @(Get-ListValues -Block $stateProgram -Key "candidateClusterOrder")
$queueCandidates = @(Get-ListValues -Block $queueProgram -Key "candidateClusterOrder")
$planCandidates = @()
$serialPlanPath = $pointerValues["serialPlanPath"]
if (-not [string]::IsNullOrWhiteSpace($serialPlanPath)) {
    $serialPlanFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $serialPlanPath
    if (Test-Path -LiteralPath $serialPlanFullPath -PathType Leaf) {
        $planCandidates = @(Get-CandidateIdsFromPlan -PlanText (Get-Content -LiteralPath $serialPlanFullPath -Raw -Encoding UTF8))
    }
}
if (($stateCandidates -join "|") -ne ($expectedCandidateOrder -join "|") -or ($queueCandidates -join "|") -ne ($expectedCandidateOrder -join "|") -or ($planCandidates -join "|") -ne ($expectedCandidateOrder -join "|")) {
    Add-Finding "P1_PROGRAM_CANDIDATE_ORDER_MISMATCH"
}

$stateMaterialized = @(Get-ListValues -Block $stateProgram -Key "materializedTaskIds")
$queueMaterialized = @(Get-ListValues -Block $queueProgram -Key "materializedTaskIds")
if ($stateMaterialized.Count -eq 0 -or ($stateMaterialized -join "|") -ne ($queueMaterialized -join "|") -or @($stateMaterialized | Select-Object -Unique).Count -ne $stateMaterialized.Count) {
    Add-Finding "P1_PROGRAM_MATERIALIZED_TASKS_INVALID"
}
$stateCompleted = @(Get-ListValues -Block $stateProgram -Key "completedTaskIds")
$queueCompleted = @(Get-ListValues -Block $queueProgram -Key "completedTaskIds")
if (($stateCompleted -join "|") -ne ($queueCompleted -join "|") -or @($stateCompleted | Select-Object -Unique).Count -ne $stateCompleted.Count -or @($stateCompleted | Where-Object { $_ -notin $stateMaterialized }).Count -gt 0) {
    Add-Finding "P1_PROGRAM_COMPLETED_TASKS_INVALID"
}

$stateCurrentTaskId = Get-ScalarValue -Block $stateProgram -Key "currentTaskId"
$queueCurrentTaskId = Get-ScalarValue -Block $queueProgram -Key "currentTaskId"
if ([string]::IsNullOrWhiteSpace($stateCurrentTaskId) -or $stateCurrentTaskId -ne $queueCurrentTaskId -or $stateCurrentTaskId -notin $stateMaterialized) {
    Add-Finding "P1_PROGRAM_CURRENT_TASK_INVALID"
}
$currentCandidateClusterId = Get-ScalarValue -Block $stateProgram -Key "currentCandidateClusterId"
if ($currentCandidateClusterId -ne (Get-ScalarValue -Block $queueProgram -Key "currentCandidateClusterId") -or $currentCandidateClusterId -notin $expectedCandidateOrder) {
    Add-Finding "P1_PROGRAM_CURRENT_CANDIDATE_INVALID"
}
if ($stateCurrentTaskId -eq "p1-remediation-program-bootstrap-2026-07-16" -and $currentCandidateClusterId -ne "P1-RC-01") {
    Add-Finding "P1_PROGRAM_BOOTSTRAP_CANDIDATE_INVALID"
}
$stateStatuses = Get-FlatMapping -Block $stateProgram -Key "taskStatusById"
$queueStatuses = Get-FlatMapping -Block $queueProgram -Key "taskStatusById"
Test-DirectMappingKeysUnique -Block @(Get-SectionBlock -Block $stateProgram -Key "taskStatusById") -Label "project-state taskStatusById"
Test-DirectMappingKeysUnique -Block @(Get-SectionBlock -Block $queueProgram -Key "taskStatusById") -Label "task-queue taskStatusById"
Test-DirectMappingKeysUnique -Block @(Get-SectionBlock -Block $stateProgram -Key "closeoutCheckpoints") -Label "project-state closeoutCheckpoints"
foreach ($taskId in $stateMaterialized) {
    if (-not $stateStatuses.ContainsKey($taskId) -or -not $queueStatuses.ContainsKey($taskId)) {
        Add-Finding "P1_PROGRAM_TASK_STATUS_MISSING $taskId"
        continue
    }
    if ($stateStatuses[$taskId] -notin $allowedTaskStatuses -or $stateStatuses[$taskId] -ne $queueStatuses[$taskId]) {
        Add-Finding "P1_PROGRAM_TASK_STATUS_INVALID $taskId"
    }
}
$activeProgramTasks = @($stateMaterialized | Where-Object { $stateStatuses.ContainsKey($_) -and $stateStatuses[$_] -in $activeTaskStatuses })
if ($activeProgramTasks.Count -gt 1) { Add-Finding "P1_PROGRAM_MULTIPLE_ACTIVE_TASKS" }
if ($stateStatus -eq "in_progress" -and ($activeProgramTasks.Count -ne 1 -or $activeProgramTasks[0] -ne $stateCurrentTaskId)) {
    Add-Finding "P1_PROGRAM_ACTIVE_TASK_POINTER_MISMATCH"
}
$expectedCompletedTasks = if ($stateStatus -eq "in_progress") { @($stateMaterialized | Where-Object { $_ -ne $stateCurrentTaskId }) } else { @($stateMaterialized) }
if (($stateCompleted -join "|") -ne ($expectedCompletedTasks -join "|")) {
    Add-Finding "P1_PROGRAM_MATERIALIZED_COMPLETED_PARTITION_INVALID"
}

foreach ($taskId in $stateCompleted) {
    if ($stateStatuses[$taskId] -ne "closed") { Add-Finding "P1_PROGRAM_COMPLETED_TASK_NOT_CLOSED $taskId" }
    $checkpoint = @(Get-ChildBlock -Block $stateProgram -ParentKey "closeoutCheckpoints" -ChildKey $taskId)
    Test-DirectMappingKeysUnique -Block $checkpoint -Label "project-state closeoutCheckpoints $taskId"
    foreach ($checkpointKey in $checkpointOrder) {
        if ((Get-ScalarValue -Block $checkpoint -Key $checkpointKey) -ne "pass") { Add-Finding "P1_PROGRAM_PREVIOUS_CLOSEOUT_INCOMPLETE $taskId $checkpointKey" }
    }
}
[string[]]$currentCheckpoint = @()
if (-not [string]::IsNullOrWhiteSpace($stateCurrentTaskId)) {
    $currentCheckpoint = @(Get-ChildBlock -Block $stateProgram -ParentKey "closeoutCheckpoints" -ChildKey $stateCurrentTaskId)
}
Test-DirectMappingKeysUnique -Block $currentCheckpoint -Label "project-state closeoutCheckpoints $stateCurrentTaskId"
if ($currentCheckpoint.Count -eq 0) {
    Add-Finding "P1_PROGRAM_CURRENT_CHECKPOINT_MISSING $stateCurrentTaskId"
} else {
    $seenPending = $false
    foreach ($checkpointKey in $checkpointOrder) {
        $value = Get-ScalarValue -Block $currentCheckpoint -Key $checkpointKey
        if ($value -notin @("pending", "pass")) { Add-Finding "P1_PROGRAM_CHECKPOINT_STATUS_INVALID $stateCurrentTaskId $checkpointKey" }
        if ($value -eq "pending") { $seenPending = $true } elseif ($seenPending) { Add-Finding "P1_PROGRAM_CHECKPOINT_NOT_MONOTONIC $stateCurrentTaskId $checkpointKey" }
    }
}

$topCurrentTask = @(Get-TopLevelBlock -Lines $stateLines -Key "currentTask")
Test-DirectMappingKeysUnique -Block $topCurrentTask -Label "project-state currentTask"
if ((Get-ScalarValue -Block $topCurrentTask -Key "id") -ne $stateCurrentTaskId -or (Get-ScalarValue -Block $topCurrentTask -Key "status") -ne $stateStatuses[$stateCurrentTaskId]) {
    Add-Finding "P1_PROGRAM_TOP_LEVEL_CURRENT_TASK_MISMATCH"
}
$activeTasks = @(Get-ListItemBlocks -Block (Get-TopLevelBlock -Lines $queueLines -Key "activeTasks"))
$activeQueueTasks = @($activeTasks | Where-Object { (Get-ScalarValue -Block $_.Block -Key "status") -in $activeTaskStatuses })
if ($stateStatus -eq "in_progress" -and ($activeQueueTasks.Count -ne 1 -or $activeQueueTasks[0].Id -ne $stateCurrentTaskId)) {
    Add-Finding "P1_PROGRAM_ACTIVE_TASKS_INVALID"
}

$programTaskFindingAssignments = @{}
$programTaskArtifactAssignments = @{}
$completedTaskArtifactPaths = [System.Collections.Generic.List[string]]::new()
$completedFindingIds = [System.Collections.Generic.List[string]]::new()
foreach ($materializedTaskId in $stateMaterialized) {
    $materializedTaskBlocks = @($activeTasks | Where-Object { $_.Id -eq $materializedTaskId })
    if ($materializedTaskBlocks.Count -ne 1) {
        Add-Finding "P1_PROGRAM_MATERIALIZED_TASK_QUEUE_BLOCK_INVALID $materializedTaskId"
        continue
    }
    $materializedTaskBlock = @($materializedTaskBlocks[0].Block)
    Test-DirectMappingKeysUnique -Block $materializedTaskBlock -Label "task-queue task $materializedTaskId"
    foreach ($requiredExecutionField in @("branch", "worktreePath")) {
        if ([string]::IsNullOrWhiteSpace((Get-ScalarValue -Block $materializedTaskBlock -Key $requiredExecutionField))) {
            Add-Finding "P1_PROGRAM_TASK_BOUNDARY_MISSING $materializedTaskId $requiredExecutionField"
        }
    }
    foreach ($artifactKey in @("planPath", "evidencePath", "auditReviewPath")) {
        $artifactPath = Get-ScalarValue -Block $materializedTaskBlock -Key $artifactKey
        if ([string]::IsNullOrWhiteSpace($artifactPath)) {
            Add-Finding "P1_PROGRAM_TASK_BOUNDARY_MISSING $materializedTaskId $artifactKey"
            continue
        }
        $normalizedArtifactPath = ConvertTo-NormalizedPath -Path $artifactPath
        $canonicalArtifactPath = Get-CanonicalRepositoryPath -Root $RepositoryRoot -Path $artifactPath
        if ([string]::IsNullOrWhiteSpace($canonicalArtifactPath)) {
            Add-Finding "P1_PROGRAM_TASK_ARTIFACT_OUTSIDE_REPOSITORY $materializedTaskId $normalizedArtifactPath"
            continue
        }
        if ($programTaskArtifactAssignments.ContainsKey($canonicalArtifactPath)) {
            Add-Finding "P1_PROGRAM_TASK_ARTIFACT_PATH_REUSED $normalizedArtifactPath"
        } else {
            $programTaskArtifactAssignments[$canonicalArtifactPath] = $materializedTaskId
        }
        if ($materializedTaskId -in $stateCompleted) { $completedTaskArtifactPaths.Add($canonicalArtifactPath) }
    }
    if ($materializedTaskId -eq "p1-remediation-program-bootstrap-2026-07-16") { continue }

    $taskCandidate = Get-ScalarValue -Block $materializedTaskBlock -Key "candidateRootCauseCluster"
    $taskFindingIds = @(Get-ListValues -Block $materializedTaskBlock -Key "findingIds")
    $isGlobalFreezeTask = $taskCandidate -eq "P1-GLOBAL-STATIC-REGRESSION-BASELINE-FREEZE"
    if ($taskCandidate -notin $expectedCandidateOrder) {
        Add-Finding "P1_PROGRAM_TASK_CANDIDATE_INVALID $materializedTaskId"
    }
    if ($materializedTaskId -eq $stateCurrentTaskId -and $taskCandidate -ne $currentCandidateClusterId) {
        Add-Finding "P1_PROGRAM_TASK_CANDIDATE_POINTER_MISMATCH $materializedTaskId"
    }
    if ((-not $isGlobalFreezeTask -and $taskFindingIds.Count -eq 0) -or ($isGlobalFreezeTask -and $taskFindingIds.Count -ne 0) -or @($taskFindingIds | Select-Object -Unique).Count -ne $taskFindingIds.Count) {
        Add-Finding "P1_PROGRAM_TASK_FINDING_SET_INVALID $materializedTaskId"
    }
    foreach ($requiredTaskField in @("authorityPath", "businessInvariant", "adversarialFailureMode", "rollbackOrStopCondition")) {
        if ([string]::IsNullOrWhiteSpace((Get-ScalarValue -Block $materializedTaskBlock -Key $requiredTaskField))) {
            Add-Finding "P1_PROGRAM_TASK_BOUNDARY_MISSING $materializedTaskId $requiredTaskField"
        }
    }
    foreach ($findingId in $taskFindingIds) {
        if ($programTaskFindingAssignments.ContainsKey($findingId)) {
            Add-Finding "P1_PROGRAM_FINDING_ASSIGNED_MORE_THAN_ONCE $findingId"
        } else {
            $programTaskFindingAssignments[$findingId] = $materializedTaskId
        }
        if ($materializedTaskId -in $stateCompleted) { $completedFindingIds.Add($findingId) }
    }
}

$currentQueueTask = @($activeTasks | Where-Object { $_.Id -eq $stateCurrentTaskId })
$taskBlock = if ($currentQueueTask.Count -eq 1) { @($currentQueueTask[0].Block) } else { @() }
$filesToCheck = @()
if ($stateStatus -eq "in_progress") {
    $filesToCheck = @($ChangedFiles | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($filesToCheck.Count -eq 0 -and -not $SkipGitChecks) {
        if ($Phase -eq "pre_commit") { $filesToCheck = @(& git -C $RepositoryRoot diff --cached --name-only --no-renames --diff-filter=ACMRTD) }
        elseif ($Phase -eq "pre_push") { $filesToCheck = @(& git -C $RepositoryRoot diff --name-only --no-renames --diff-filter=ACMRTD origin/master..HEAD) }
    }
}
$normalizedFilesToCheck = @($filesToCheck | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
$canonicalFilesToCheck = [System.Collections.Generic.List[string]]::new()
foreach ($fileToCheck in $filesToCheck) {
    $canonicalFileToCheck = Get-CanonicalRepositoryPath -Root $RepositoryRoot -Path $fileToCheck
    if ([string]::IsNullOrWhiteSpace($canonicalFileToCheck)) {
        Add-Finding "P1_PROGRAM_CHANGED_FILE_OUTSIDE_REPOSITORY $fileToCheck"
    } else {
        $canonicalFilesToCheck.Add($canonicalFileToCheck)
    }
}
$effectiveScopeControlPaths = if ($SkipExternalIntegrityChecks) { @((ConvertTo-NormalizedPath -Path $ProjectStatePath), (ConvertTo-NormalizedPath -Path $QueuePath)) } else { $scopeControlPaths }
$scopeControlChanged = @($normalizedFilesToCheck | Where-Object { $_ -in $effectiveScopeControlPaths }).Count -gt 0
$protectedImplementationChanged = @($normalizedFilesToCheck | Where-Object { $candidatePath = $_; @($protectedImplementationPatterns | Where-Object { Test-PathPattern -Path $candidatePath -Pattern $_ }).Count -gt 0 }).Count -gt 0
$isP1TransitionHotfixScope = $Phase -in @("pre_commit", "pre_push") -and (Test-P1TransitionHotfixFileSet -Files $filesToCheck)
$isP1F0132ScopeCorrectionScope = $Phase -in @("pre_commit", "pre_push") -and (Test-P1F0132ScopeCorrectionFileSet -Files $filesToCheck)
$isP1F0115Phase11ScopeCorrectionScope = $Phase -in @("pre_commit", "pre_push") -and (Test-P1F0115Phase11ScopeCorrectionFileSet -Files $filesToCheck)
$isP1F0115ModulePrecommitHotfixScope = $Phase -in @("pre_commit", "pre_push") -and (Test-P1F0115ModulePrecommitHotfixFileSet -Files $filesToCheck)
$isP1F0116DesignPathGuardHotfixScope = $Phase -in @("pre_commit", "pre_push") -and (Test-P1F0116DesignPathGuardHotfixFileSet -Files $filesToCheck)
$isP1F0116ScopeCorrectionGuardHotfixScope = $Phase -in @("pre_commit", "pre_push") -and (Test-P1F0116ScopeCorrectionGuardHotfixFileSet -Files $filesToCheck)
$p1F0117SmokeScopeCorrectionIdentityFiles = @(
    $p1F0117SmokeScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md",
    $p1F0117SmokeScopeCorrectionEvidencePath,
    $p1F0117SmokeScopeCorrectionAuditPath
)
$isP1F0117SmokeScopeCorrectionCandidate = $Phase -in @("pre_commit", "pre_push") `
    -and @($normalizedFilesToCheck | Where-Object { $_ -in $p1F0117SmokeScopeCorrectionIdentityFiles }).Count -gt 0
$isP1F0117SmokeScopeCorrectionScope = $isP1F0117SmokeScopeCorrectionCandidate -and (Test-P1F0117SmokeScopeCorrectionFileSet -Files $filesToCheck)
$p1F0117IdentityFiles = @(
    $p1F0117SpecApprovalTransitionHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    $p1F0117SpecApprovalTransitionHotfixEvidencePath,
    $p1F0117SpecApprovalTransitionHotfixAuditPath
)
$isP1F0117SpecApprovalTransitionHotfixCandidate = $Phase -in @("pre_commit", "pre_push") `
    -and "docs/04-agent-system/state/project-state.yaml" -in $normalizedFilesToCheck `
    -and "docs/04-agent-system/state/task-queue.yaml" -in $normalizedFilesToCheck `
    -and @($normalizedFilesToCheck | Where-Object { $_ -in $p1F0117IdentityFiles }).Count -gt 0
$isP1F0117SpecApprovalTransitionHotfixScope = $isP1F0117SpecApprovalTransitionHotfixCandidate -and (Test-P1F0117SpecApprovalTransitionHotfixFileSet -Files $filesToCheck)
$isP1F0115ScopeCorrectionScope = $Phase -in @("pre_commit", "pre_push") -and (Test-P1F0115ScopeCorrectionFileSet -Files $filesToCheck)
$isP1F0115ScopeCorrectionCandidateValid = $false
if ($isP1F0117SmokeScopeCorrectionCandidate -and -not $isP1F0117SmokeScopeCorrectionScope) {
    Add-Finding "P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_ALLOWLIST_MISMATCH"
}
if ($isP1F0117SpecApprovalTransitionHotfixCandidate -and -not $isP1F0117SpecApprovalTransitionHotfixScope) {
    Add-Finding "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALLOWLIST_MISMATCH"
}
if ($isP1TransitionHotfixScope) {
    Test-P1TransitionHotfixAnchors -Root $RepositoryRoot -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0132ScopeCorrectionScope) {
    Test-P1F0132ScopeCorrectionAnchors -Root $RepositoryRoot -QueuePath $QueuePath -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0115Phase11ScopeCorrectionScope) {
    Test-P1F0115Phase11ScopeCorrectionAnchors -Root $RepositoryRoot -QueuePath $QueuePath -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0115ModulePrecommitHotfixScope) {
    Test-P1F0115ModulePrecommitHotfixAnchors -Root $RepositoryRoot -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0116DesignPathGuardHotfixScope) {
    Test-P1F0116DesignPathGuardHotfixAnchors -Root $RepositoryRoot -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0116ScopeCorrectionGuardHotfixScope) {
    Test-P1F0116ScopeCorrectionGuardHotfixAnchors -Root $RepositoryRoot -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0117SpecApprovalTransitionHotfixScope) {
    Test-P1F0117SpecApprovalTransitionHotfixAnchors -Root $RepositoryRoot -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0117SmokeScopeCorrectionScope) {
    Test-P1F0117SmokeScopeCorrectionAnchors -Root $RepositoryRoot -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
}
if ($isP1F0115ScopeCorrectionScope) {
    $f0115FindingCountBefore = $findings.Count
    Test-P1F0115ScopeCorrectionAnchors -Root $RepositoryRoot -QueuePath $QueuePath -CurrentTaskId $stateCurrentTaskId -CurrentTaskBlock $taskBlock -CurrentPhase $Phase
    $isP1F0115ScopeCorrectionCandidateValid = $f0115FindingCountBefore -eq 0 -and $findings.Count -eq 0
}

$parentProgram = @()
$parentTasks = @()
$parentCurrentTaskId = ""
$parentStateLines = @()
$parentQueueLines = @()
$parentReference = if ($Phase -eq "pre_push") { "origin/master" } else { "HEAD" }
if (-not $SkipGitChecks) {
    $stateGitPath = ConvertTo-NormalizedPath -Path $ProjectStatePath
    $queueGitPath = ConvertTo-NormalizedPath -Path $QueuePath
    $parentStateText = Get-GitFileText -Root $RepositoryRoot -Reference $parentReference -Path $stateGitPath
    $parentQueueText = Get-GitFileText -Root $RepositoryRoot -Reference $parentReference -Path $queueGitPath
    if (-not [string]::IsNullOrWhiteSpace($parentStateText)) { $parentStateLines = @($parentStateText -split "`n") }
    if (-not [string]::IsNullOrWhiteSpace($parentQueueText)) {
        $parentQueueLines = @($parentQueueText -split "`n")
        $parentProgram = @(Get-TopLevelBlock -Lines $parentQueueLines -Key $programKey)
        if ($parentProgram.Count -gt 0) {
            $parentCurrentTaskId = Get-ScalarValue -Block $parentProgram -Key "currentTaskId"
            $parentTasks = @(Get-ListItemBlocks -Block (Get-TopLevelBlock -Lines $parentQueueLines -Key "activeTasks"))
        }
    }
}
$isBootstrapInitialization = $parentProgram.Count -eq 0 -and $stateCurrentTaskId -eq "p1-remediation-program-bootstrap-2026-07-16"
$isTaskTransition = $parentProgram.Count -gt 0 -and $parentCurrentTaskId -ne $stateCurrentTaskId
$isSteadyTask = $parentProgram.Count -gt 0 -and $parentCurrentTaskId -eq $stateCurrentTaskId
$parentStatuses = if ($parentProgram.Count -gt 0) { Get-FlatMapping -Block $parentProgram -Key "taskStatusById" } else { @{} }
$isSameTaskCloseoutTransition = $isSteadyTask -and $parentStatuses.ContainsKey($stateCurrentTaskId) -and $parentStatuses[$stateCurrentTaskId] -eq "in_progress" -and $stateStatuses[$stateCurrentTaskId] -eq "ready_for_closeout"
if (-not $SkipGitChecks -and $parentProgram.Count -eq 0 -and -not $isBootstrapInitialization) {
    Add-Finding "P1_PROGRAM_TRANSITION_PARENT_MISSING"
}
if ($isSteadyTask -and $scopeControlChanged -and -not $isSameTaskCloseoutTransition -and -not $isP1F0132ScopeCorrectionScope -and -not $isP1F0115Phase11ScopeCorrectionScope -and -not $isP1F0115ModulePrecommitHotfixScope -and -not $isP1F0116DesignPathGuardHotfixScope -and -not $isP1F0116ScopeCorrectionGuardHotfixScope -and -not $isP1F0117SpecApprovalTransitionHotfixScope -and -not $isP1F0117SmokeScopeCorrectionScope -and -not $isP1F0115ScopeCorrectionCandidateValid) {
    Add-Finding "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION"
}
if ($isSameTaskCloseoutTransition) {
    $closeoutParentStateLines = @($parentStateLines)
    $closeoutParentQueueLines = @($parentQueueLines)
    $closeoutFilesToCheck = @($normalizedFilesToCheck)
    if ($Phase -eq "pre_push" -and -not $SkipGitChecks) {
        $headParents = @(((& git -C $RepositoryRoot rev-list --parents -n 1 HEAD) -join "").Trim() -split '\s+')
        if ($LASTEXITCODE -ne 0 -or $headParents.Count -ne 2) {
            Add-Finding "P1_PROGRAM_CLOSEOUT_TIP_PARENT_INVALID"
            $closeoutParentStateLines = @()
            $closeoutParentQueueLines = @()
            $closeoutFilesToCheck = @()
        } else {
            $closeoutParentReference = $headParents[1]
            $closeoutParentStateText = Get-GitFileText -Root $RepositoryRoot -Reference $closeoutParentReference -Path $stateGitPath
            $closeoutParentQueueText = Get-GitFileText -Root $RepositoryRoot -Reference $closeoutParentReference -Path $queueGitPath
            $closeoutParentStateLines = if ([string]::IsNullOrWhiteSpace($closeoutParentStateText)) { @() } else { @($closeoutParentStateText -split "`n") }
            $closeoutParentQueueLines = if ([string]::IsNullOrWhiteSpace($closeoutParentQueueText)) { @() } else { @($closeoutParentQueueText -split "`n") }
            $closeoutFilesToCheck = @(& git -C $RepositoryRoot diff --name-only --no-renames --diff-filter=ACMRTD "$closeoutParentReference..HEAD" | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
        }
    }
    $closeoutParentProgram = if ($closeoutParentQueueLines.Count -gt 0) { @(Get-TopLevelBlock -Lines $closeoutParentQueueLines -Key $programKey) } else { @() }
    $closeoutParentStatuses = if ($closeoutParentProgram.Count -gt 0) { Get-FlatMapping -Block $closeoutParentProgram -Key "taskStatusById" } else { @{} }
    if (-not $closeoutParentStatuses.ContainsKey($stateCurrentTaskId) -or $closeoutParentStatuses[$stateCurrentTaskId] -ne "in_progress") {
        Add-Finding "P1_PROGRAM_CLOSEOUT_STATUS_DIRECTION_INVALID"
    }
    $expectedCloseoutFiles = @($effectiveScopeControlPaths | Sort-Object -Unique)
    $actualCloseoutFiles = @($closeoutFilesToCheck | Sort-Object -Unique)
    if (($actualCloseoutFiles -join "|") -ne ($expectedCloseoutFiles -join "|")) {
        Add-Finding "P1_PROGRAM_CLOSEOUT_FILE_SCOPE_INVALID"
    }
    if ($closeoutParentStateLines.Count -eq 0 -or (Get-NormalizedCloseoutProjection -Lines $closeoutParentStateLines -TaskId $stateCurrentTaskId -Kind state) -cne (Get-NormalizedCloseoutProjection -Lines $stateLines -TaskId $stateCurrentTaskId -Kind state)) {
        Add-Finding "P1_PROGRAM_CLOSEOUT_PROJECTION_CHANGED project-state"
    }
    if ($closeoutParentQueueLines.Count -eq 0 -or (Get-NormalizedCloseoutProjection -Lines $closeoutParentQueueLines -TaskId $stateCurrentTaskId -Kind queue) -cne (Get-NormalizedCloseoutProjection -Lines $queueLines -TaskId $stateCurrentTaskId -Kind queue)) {
        Add-Finding "P1_PROGRAM_CLOSEOUT_PROJECTION_CHANGED task-queue"
    }
    if ($Phase -eq "pre_push") {
        if ($parentStateLines.Count -eq 0 -or (Get-NormalizedCloseoutProjection -Lines $parentStateLines -TaskId $stateCurrentTaskId -Kind state) -cne (Get-NormalizedCloseoutProjection -Lines $stateLines -TaskId $stateCurrentTaskId -Kind state)) {
            Add-Finding "P1_PROGRAM_CLOSEOUT_RANGE_PROJECTION_CHANGED project-state"
        }
        if ($parentQueueLines.Count -eq 0 -or (Get-NormalizedCloseoutProjection -Lines $parentQueueLines -TaskId $stateCurrentTaskId -Kind queue) -cne (Get-NormalizedCloseoutProjection -Lines $queueLines -TaskId $stateCurrentTaskId -Kind queue)) {
            Add-Finding "P1_PROGRAM_CLOSEOUT_RANGE_PROJECTION_CHANGED task-queue"
        }
    }
}
if ($Phase -eq "pre_commit" -and -not $SkipGitChecks) {
    $stagedPaths = @(& git -C $RepositoryRoot diff --cached --name-only --no-renames --diff-filter=ACMRTD | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $unstagedPaths = @(& git -C $RepositoryRoot diff --name-only --no-renames --diff-filter=ACMRTD | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    foreach ($divergentPath in @($stagedPaths | Where-Object { $_ -in $unstagedPaths })) {
        Add-Finding "P1_PROGRAM_STAGED_WORKTREE_DIVERGENCE $divergentPath"
    }
}
$validatedDesignPath = ""
if ($taskBlock.Count -gt 0) {
    $declaredDesignPath = Get-ScalarValue -Block $taskBlock -Key "designPath"
    if (-not [string]::IsNullOrWhiteSpace($declaredDesignPath)) {
        $normalizedDesignPath = ConvertTo-NormalizedPath -Path $declaredDesignPath
        $canonicalDesignPath = Get-CanonicalRepositoryPath -Root $RepositoryRoot -Path $declaredDesignPath
        if ([string]::IsNullOrWhiteSpace($canonicalDesignPath) `
            -or $normalizedDesignPath -notmatch '^docs/superpowers/specs/[a-z0-9][a-z0-9.-]*\.md$' `
            -or $normalizedDesignPath -match '(^|/)\.\.(/|$)') {
            Add-Finding "P1_PROGRAM_DESIGN_PATH_INVALID $declaredDesignPath"
        } else {
            $validatedDesignPath = $normalizedDesignPath
        }
    }
    $currentTaskGovernancePathList = [System.Collections.Generic.List[string]]::new()
    foreach ($scopeControlPath in $effectiveScopeControlPaths) { $currentTaskGovernancePathList.Add($scopeControlPath) }
    foreach ($governancePathKey in @("planPath", "evidencePath", "auditReviewPath", "freshApprovalSource")) {
        $governancePath = Get-ScalarValue -Block $taskBlock -Key $governancePathKey
        if (-not [string]::IsNullOrWhiteSpace($governancePath)) { $currentTaskGovernancePathList.Add((ConvertTo-NormalizedPath -Path $governancePath)) }
    }
    if (-not [string]::IsNullOrWhiteSpace($validatedDesignPath)) { $currentTaskGovernancePathList.Add($validatedDesignPath) }
    $currentTaskGovernancePaths = @($currentTaskGovernancePathList.ToArray())
    $protectedImplementationChanged = @($normalizedFilesToCheck | Where-Object { $_ -notin $currentTaskGovernancePaths }).Count -gt 0
    if ($isP1F0132ScopeCorrectionScope -or $isP1F0115Phase11ScopeCorrectionScope -or $isP1F0115ModulePrecommitHotfixScope -or $isP1F0116DesignPathGuardHotfixScope -or $isP1F0116ScopeCorrectionGuardHotfixScope -or $isP1F0117SpecApprovalTransitionHotfixScope -or $isP1F0117SmokeScopeCorrectionScope -or $isP1F0115ScopeCorrectionCandidateValid) { $protectedImplementationChanged = $false }
    foreach ($artifact in @(
        @{ Label = "plan"; Key = "planPath" },
        @{ Label = "evidence"; Key = "evidencePath" },
        @{ Label = "audit"; Key = "auditReviewPath" }
    )) {
        $path = Get-ScalarValue -Block $taskBlock -Key $artifact.Key
        if ([string]::IsNullOrWhiteSpace($path) -or -not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $path) -PathType Leaf)) {
            Add-Finding "P1_PROGRAM_TASK_ARTIFACT_MISSING $stateCurrentTaskId $($artifact.Label)"
        }
    }

    $evidenceText = ""
    $auditText = ""
    foreach ($reviewArtifact in @(
        @{ Key = "evidencePath"; Target = "evidence" },
        @{ Key = "auditReviewPath"; Target = "audit" }
    )) {
        $path = Get-ScalarValue -Block $taskBlock -Key $reviewArtifact.Key
        if (-not [string]::IsNullOrWhiteSpace($path)) {
            $fullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $path
            if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
                if ($reviewArtifact.Target -eq "evidence") { $evidenceText = Get-Content -LiteralPath $fullPath -Raw -Encoding UTF8 }
                else { $auditText = Get-Content -LiteralPath $fullPath -Raw -Encoding UTF8 }
            }
        }
    }
    foreach ($marker in @("## Requirement Mapping Result", "## Reading Evidence", "status: complete", "conflictsFound: false", "targetSourceReviewed: true", "targetTestsReviewed: true", "analogousImplementationReviewed: true")) {
        if ($evidenceText -notmatch [regex]::Escape($marker)) { Add-Finding "P1_PROGRAM_EVIDENCE_INCOMPLETE $stateCurrentTaskId $marker" }
    }
    $executionStage = Get-ScalarValue -Block $taskBlock -Key "executionStage"
    if ($stateCurrentTaskId -eq "p1-remediation-program-bootstrap-2026-07-16") {
        if ($executionStage -ne "verification_complete") { Add-Finding "P1_PROGRAM_BOOTSTRAP_EXECUTION_STAGE_INVALID" }
    } elseif ($executionStage -ne "scope_frozen") {
        Add-Finding "P1_PROGRAM_TASK_EXECUTION_STAGE_INVALID $stateCurrentTaskId"
    }
    $requiresFinalReview = $executionStage -eq "verification_complete" -or $protectedImplementationChanged
    if ($requiresFinalReview) {
        Test-FinalReviewContract -EvidenceText $evidenceText -AuditText $auditText -TaskId $stateCurrentTaskId
    } else {
        Test-ScopeFreezeReviewContract -EvidenceText $evidenceText -AuditText $auditText -TaskId $stateCurrentTaskId
    }

    $taskBranch = Get-ScalarValue -Block $taskBlock -Key "branch"
    if (-not [string]::IsNullOrWhiteSpace($taskBranch)) {
        & git check-ref-format --branch $taskBranch *> $null
        if ($LASTEXITCODE -ne 0 -or $taskBranch -notmatch '^(?:codex|feat|fix)/[a-z0-9][a-z0-9._/-]*$') {
            Add-Finding "P1_PROGRAM_TASK_BRANCH_INVALID $stateCurrentTaskId $taskBranch"
        }
    }
    if ($Phase -eq "pre_commit" -and -not $SkipGitChecks -and -not $isP1TransitionHotfixScope -and -not $isP1F0132ScopeCorrectionScope -and -not $isP1F0115Phase11ScopeCorrectionScope -and -not $isP1F0115ModulePrecommitHotfixScope -and -not $isP1F0116DesignPathGuardHotfixScope -and -not $isP1F0116ScopeCorrectionGuardHotfixScope -and -not $isP1F0117SpecApprovalTransitionHotfixScope -and -not $isP1F0117SmokeScopeCorrectionScope -and -not $isP1F0115ScopeCorrectionCandidateValid) {
        $actualBranch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
        if ($actualBranch -ne $taskBranch) {
            Add-Finding "P1_PROGRAM_TASK_BRANCH_BINDING_MISMATCH $stateCurrentTaskId expected=$taskBranch actual=$actualBranch"
        }
        $taskWorktreePath = Get-ScalarValue -Block $taskBlock -Key "worktreePath"
        $canonicalTaskWorktreePath = if ([string]::IsNullOrWhiteSpace($taskWorktreePath)) { "" } else { Get-CanonicalPath -Root $RepositoryRoot -Path $taskWorktreePath }
        $canonicalRepositoryRoot = Get-CanonicalPath -Root $RepositoryRoot -Path $RepositoryRoot
        if ([string]::IsNullOrWhiteSpace($canonicalTaskWorktreePath) -or $canonicalTaskWorktreePath -ine $canonicalRepositoryRoot) {
            Add-Finding "P1_PROGRAM_TASK_WORKTREE_BINDING_MISMATCH $stateCurrentTaskId expected=$taskWorktreePath actual=$canonicalRepositoryRoot"
        }
    }

    $closeoutPolicy = @(Get-SectionBlock -Block $taskBlock -Key "closeoutPolicy")
    Test-DirectMappingKeysUnique -Block $closeoutPolicy -Label "task-queue $stateCurrentTaskId closeoutPolicy"
    $expectedAuthorizationSource = if ($SkipExternalIntegrityChecks) { $pointerValues["standingAuthorizationSource"] } else { $expectedPointerValues["standingAuthorizationSource"] }
    if ((Get-ScalarValue -Block $taskBlock -Key "authorizationSource") -ne $expectedAuthorizationSource -or (Get-ScalarValue -Block $closeoutPolicy -Key "authorizationSource") -ne $expectedAuthorizationSource) {
        Add-Finding "P1_PROGRAM_TASK_AUTHORIZATION_SOURCE_INVALID $stateCurrentTaskId"
    }
    $localCommit = @(Get-SectionBlock -Block $closeoutPolicy -Key "localCommit")
    Test-DirectMappingKeysUnique -Block $localCommit -Label "task-queue $stateCurrentTaskId localCommit"
    if ((Get-ScalarValue -Block $localCommit -Key "approved") -ne "true") { Add-Finding "P1_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId localCommit" }
    $merge = @(Get-SectionBlock -Block $closeoutPolicy -Key "fastForwardMerge")
    Test-DirectMappingKeysUnique -Block $merge -Label "task-queue $stateCurrentTaskId fastForwardMerge"
    if ((Get-ScalarValue -Block $merge -Key "approved") -ne "true" -or (Get-ScalarValue -Block $merge -Key "targetBranch") -ne "master") { Add-Finding "P1_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId fastForwardMerge" }
    $push = @(Get-SectionBlock -Block $closeoutPolicy -Key "push")
    Test-DirectMappingKeysUnique -Block $push -Label "task-queue $stateCurrentTaskId push"
    if ((Get-ScalarValue -Block $push -Key "approved") -ne "true" -or (Get-ScalarValue -Block $push -Key "target") -ne "origin/master") { Add-Finding "P1_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId push" }
    $cleanup = @(Get-SectionBlock -Block $closeoutPolicy -Key "cleanup")
    Test-DirectMappingKeysUnique -Block $cleanup -Label "task-queue $stateCurrentTaskId cleanup"
    if ((Get-ScalarValue -Block $cleanup -Key "deleteShortBranch") -ne "true") { Add-Finding "P1_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId cleanup" }

    $capabilities = @(Get-SectionBlock -Block $taskBlock -Key "capabilities")
    Test-DirectMappingKeysUnique -Block $capabilities -Label "task-queue $stateCurrentTaskId capabilities"
    foreach ($blockedCapability in @("runtimeAcceptance", "browserRuntimeValidation", "p2Implementation", "stagingProdDeploy", "forcePush", "pr", "costCalibrationGate")) {
        if ((Get-ScalarValue -Block $capabilities -Key $blockedCapability) -notmatch "^blocked") { Add-Finding "P1_PROGRAM_BLOCKED_CAPABILITY_NOT_PRESERVED $stateCurrentTaskId $blockedCapability" }
    }
    foreach ($approvalCapability in @("dependencyIntroduction", "schemaMigration", "databaseMutation", "providerCall")) {
        $value = Get-ScalarValue -Block $capabilities -Key $approvalCapability
        if ([string]::IsNullOrWhiteSpace($value)) { Add-Finding "P1_PROGRAM_APPROVAL_GATED_CAPABILITY_MISSING $stateCurrentTaskId $approvalCapability" }
        elseif ($value -notmatch "^blocked") {
            if ($isP1F0115ScopeCorrectionCandidateValid -and $approvalCapability -eq "schemaMigration" -and $value -eq "approved_source_generation_only_no_execution") { continue }
            $freshApprovalSource = Get-ScalarValue -Block $taskBlock -Key "freshApprovalSource"
            $freshApprovalFullPath = if ([string]::IsNullOrWhiteSpace($freshApprovalSource)) { "" } else { Resolve-RepositoryPath -Root $RepositoryRoot -Path $freshApprovalSource }
            $freshApprovalIsCanonical = $freshApprovalSource -match '^docs/05-execution-logs/acceptance/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$' -and $freshApprovalSource -ne $expectedAuthorizationSource
            if (-not $freshApprovalIsCanonical -or -not (Test-Path -LiteralPath $freshApprovalFullPath -PathType Leaf)) {
                Add-Finding "P1_PROGRAM_FRESH_APPROVAL_SOURCE_MISSING $stateCurrentTaskId $approvalCapability"
            } else {
                $freshApprovalText = Get-Content -LiteralPath $freshApprovalFullPath -Raw -Encoding UTF8
                if ($freshApprovalText -notmatch '(?im)^Status:\s*approved\s*$' -or $freshApprovalText -notmatch "(?i)human approval" -or $freshApprovalText -notmatch [regex]::Escape($stateCurrentTaskId) -or $freshApprovalText -notmatch [regex]::Escape($approvalCapability)) {
                    Add-Finding "P1_PROGRAM_FRESH_APPROVAL_CONTENT_INVALID $stateCurrentTaskId $approvalCapability"
                }
            }
        }
    }

    $allowedFiles = if ($isP1TransitionHotfixScope) {
        @($p1TransitionHotfixFiles)
    } elseif ($isP1F0132ScopeCorrectionScope) {
        @($p1F0132ScopeCorrectionFiles)
    } elseif ($isP1F0115Phase11ScopeCorrectionScope) {
        @($p1F0115Phase11ScopeCorrectionFiles)
    } elseif ($isP1F0115ModulePrecommitHotfixScope) {
        @($p1F0115ModulePrecommitHotfixFiles)
    } elseif ($isP1F0116DesignPathGuardHotfixScope) {
        @($p1F0116DesignPathGuardHotfixFiles)
    } elseif ($isP1F0116ScopeCorrectionGuardHotfixScope) {
        @($p1F0116ScopeCorrectionGuardHotfixFiles)
    } elseif ($isP1F0117SpecApprovalTransitionHotfixScope) {
        @($p1F0117SpecApprovalTransitionHotfixFiles)
    } elseif ($isP1F0117SmokeScopeCorrectionScope) {
        @($p1F0117SmokeScopeCorrectionFiles)
    } elseif ($isP1F0115ScopeCorrectionCandidateValid) {
        @($p1F0115ScopeCorrectionFiles)
    } else {
        @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    }
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
    if ($isTaskTransition) {
        if (-not $scopeControlChanged) { Add-Finding "P1_PROGRAM_TRANSITION_CONTROL_FILES_MISSING" }
        if ($protectedImplementationChanged) { Add-Finding "P1_PROGRAM_TRANSITION_CONTAINS_IMPLEMENTATION_CHANGE" }

        $transitionAllowedFiles = [System.Collections.Generic.List[string]]::new()
        foreach ($transitionPath in @(
            $effectiveScopeControlPaths +
            @(
                (Get-ScalarValue -Block $taskBlock -Key "planPath"),
                (Get-ScalarValue -Block $taskBlock -Key "evidencePath"),
                (Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"),
                $validatedDesignPath,
                (Get-ScalarValue -Block $taskBlock -Key "freshApprovalSource")
            )
        )) {
            if (-not [string]::IsNullOrWhiteSpace($transitionPath)) {
                $canonicalTransitionPath = Get-CanonicalRepositoryPath -Root $RepositoryRoot -Path $transitionPath
                if (-not [string]::IsNullOrWhiteSpace($canonicalTransitionPath)) { $transitionAllowedFiles.Add($canonicalTransitionPath) }
            }
        }
        foreach ($transitionChangedFile in $filesToCheck) {
            $normalizedTransitionChangedFile = ConvertTo-NormalizedPath -Path $transitionChangedFile
            $canonicalTransitionChangedFile = Get-CanonicalRepositoryPath -Root $RepositoryRoot -Path $transitionChangedFile
            if ([string]::IsNullOrWhiteSpace($canonicalTransitionChangedFile) -or $canonicalTransitionChangedFile -notin $transitionAllowedFiles) { Add-Finding "P1_PROGRAM_TRANSITION_FILE_SCOPE_INVALID $normalizedTransitionChangedFile" }
            if ($canonicalTransitionChangedFile -in $completedTaskArtifactPaths) { Add-Finding "P1_PROGRAM_TRANSITION_TOUCHES_PREDECESSOR_ARTIFACT $normalizedTransitionChangedFile" }
        }

        $parentCurrentTaskBlocks = @($parentTasks | Where-Object { $_.Id -eq $parentCurrentTaskId })
        if ($parentCurrentTaskBlocks.Count -ne 1 -or $parentCurrentTaskId -notin $stateCompleted) {
            Add-Finding "P1_PROGRAM_TRANSITION_PREDECESSOR_NOT_CLOSED $parentCurrentTaskId"
        } else {
            $parentCurrentTaskBlock = @($parentCurrentTaskBlocks[0].Block)
            $parentEvidencePath = Get-ScalarValue -Block $parentCurrentTaskBlock -Key "evidencePath"
            $parentAuditPath = Get-ScalarValue -Block $parentCurrentTaskBlock -Key "auditReviewPath"
            $parentEvidenceText = Get-GitFileText -Root $RepositoryRoot -Reference $parentReference -Path $parentEvidencePath
            $parentAuditText = Get-GitFileText -Root $RepositoryRoot -Reference $parentReference -Path $parentAuditPath
            Test-FinalReviewContract -EvidenceText $parentEvidenceText -AuditText $parentAuditText -TaskId $parentCurrentTaskId -FindingPrefix "P1_PROGRAM_TRANSITION_PREDECESSOR_REVIEW_NOT_FINAL"

            foreach ($parentArtifactPath in @(
                (Get-ScalarValue -Block $parentCurrentTaskBlock -Key "planPath"),
                $parentEvidencePath,
                $parentAuditPath
            )) {
                $canonicalParentArtifactPath = if ([string]::IsNullOrWhiteSpace($parentArtifactPath)) { "" } else { Get-CanonicalRepositoryPath -Root $RepositoryRoot -Path $parentArtifactPath }
                if (-not [string]::IsNullOrWhiteSpace($canonicalParentArtifactPath) -and $canonicalParentArtifactPath -in $canonicalFilesToCheck) {
                    Add-Finding "P1_PROGRAM_TRANSITION_TOUCHES_PREDECESSOR_ARTIFACT $(ConvertTo-NormalizedPath -Path $parentArtifactPath)"
                }
            }

            if (-not $SkipGitChecks) {
                $parentBranch = Get-ScalarValue -Block $parentCurrentTaskBlock -Key "branch"
                if ([string]::IsNullOrWhiteSpace($parentBranch)) {
                    Add-Finding "P1_PROGRAM_TRANSITION_PREDECESSOR_BRANCH_MISSING $parentCurrentTaskId"
                } else {
                    & git -C $RepositoryRoot show-ref --verify --quiet "refs/heads/$parentBranch"
                    if ($LASTEXITCODE -eq 0) {
                        Add-Finding "P1_PROGRAM_TRANSITION_PREDECESSOR_BRANCH_NOT_CLEANED $parentBranch"
                    }
                }

                $parentWorktreePath = Get-ScalarValue -Block $parentCurrentTaskBlock -Key "worktreePath"
                if ([string]::IsNullOrWhiteSpace($parentWorktreePath)) {
                    Add-Finding "P1_PROGRAM_TRANSITION_PREDECESSOR_WORKTREE_MISSING $parentCurrentTaskId"
                } else {
                    $resolvedParentWorktreePath = (Resolve-RepositoryPath -Root $RepositoryRoot -Path $parentWorktreePath).TrimEnd("\", "/")
                    $registeredWorktreePaths = @(& git -C $RepositoryRoot worktree list --porcelain | Where-Object { $_ -match '^worktree\s+(.+)$' } | ForEach-Object { ([System.IO.Path]::GetFullPath($Matches[1])).TrimEnd("\", "/") })
                    if ((Test-Path -LiteralPath $resolvedParentWorktreePath) -or @($registeredWorktreePaths | Where-Object { $_ -ieq $resolvedParentWorktreePath }).Count -gt 0) {
                        Add-Finding "P1_PROGRAM_TRANSITION_PREDECESSOR_WORKTREE_NOT_CLEANED $parentWorktreePath"
                    }
                }
            }

            foreach ($parentTask in $parentTasks) {
                $currentParentTask = @($activeTasks | Where-Object { $_.Id -eq $parentTask.Id })
                if ($currentParentTask.Count -ne 1) {
                    Add-Finding "P1_PROGRAM_TRANSITION_PARENT_TASK_CONTRACT_MISSING $($parentTask.Id)"
                    continue
                }
                $parentTaskContract = @(foreach ($line in $parentTask.Block) { if ($line -match '^\s+status:\s*') { $line -replace 'status:\s*.*$', 'status: <transition-status>' } else { $line } }) -join "`n"
                $currentTaskContract = @(foreach ($line in $currentParentTask[0].Block) { if ($line -match '^\s+status:\s*') { $line -replace 'status:\s*.*$', 'status: <transition-status>' } else { $line } }) -join "`n"
                if ($parentTaskContract -cne $currentTaskContract) {
                    Add-Finding "P1_PROGRAM_TRANSITION_PARENT_TASK_CONTRACT_CHANGED $($parentTask.Id)"
                }
            }
        }

        if (-not $SkipGitChecks -and $Phase -ne "pre_push") {
            $transitionHead = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
            $transitionOrigin = ((& git -C $RepositoryRoot rev-parse origin/master) -join "").Trim()
            if ($transitionHead -ne $transitionOrigin) { Add-Finding "P1_PROGRAM_TRANSITION_REQUIRES_SYNCHRONIZED_PARENT" }
        }
    }
    if ($scopeControlChanged -and $protectedImplementationChanged -and (-not $isBootstrapInitialization -or $SkipGitChecks) -and -not $isSameTaskCloseoutTransition -and -not $isP1F0132ScopeCorrectionScope -and -not $isP1F0115Phase11ScopeCorrectionScope -and -not $isP1F0115ModulePrecommitHotfixScope -and -not $isP1F0116DesignPathGuardHotfixScope -and -not $isP1F0116ScopeCorrectionGuardHotfixScope -and -not $isP1F0117SpecApprovalTransitionHotfixScope -and -not $isP1F0117SmokeScopeCorrectionScope -and -not $isP1F0115ScopeCorrectionCandidateValid) {
        Add-Finding "P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE"
    }
    if ($protectedImplementationChanged) {
        foreach ($requiredReviewPathKey in @("evidencePath", "auditReviewPath")) {
            $requiredReviewPath = ConvertTo-NormalizedPath -Path (Get-ScalarValue -Block $taskBlock -Key $requiredReviewPathKey)
            if ($requiredReviewPath -notin $normalizedFilesToCheck) { Add-Finding "P1_PROGRAM_IMPLEMENTATION_WITHOUT_FRESH_REVIEW $requiredReviewPathKey" }
        }
    }
    $taskKind = Get-ScalarValue -Block $taskBlock -Key "taskKind"
    foreach ($changedFile in $filesToCheck) {
        $effectiveBlockedFiles = @($globalBlockedPatterns + $blockedFiles + $(if ($taskKind -eq "mechanism_hardening" -or $isP1F0132ScopeCorrectionScope -or $isP1F0115Phase11ScopeCorrectionScope -or $isP1F0115ModulePrecommitHotfixScope -or $isP1F0116DesignPathGuardHotfixScope -or $isP1F0116ScopeCorrectionGuardHotfixScope -or $isP1F0117SpecApprovalTransitionHotfixScope -or $isP1F0117SmokeScopeCorrectionScope -or $isP1F0115ScopeCorrectionCandidateValid) { @() } else { $programControlPatterns }) | Sort-Object -Unique)
        if (@($effectiveBlockedFiles | Where-Object { Test-PathPattern -Path $changedFile -Pattern $_ }).Count -gt 0) {
            Add-Finding "P1_PROGRAM_BLOCKED_FILES_VIOLATION $changedFile"
            continue
        }
        if (@($allowedFiles | Where-Object { Test-PathPattern -Path $changedFile -Pattern $_ }).Count -eq 0) {
            Add-Finding "P1_PROGRAM_ALLOWED_FILES_VIOLATION $changedFile"
        }
    }
}

$ledgerFindingCandidateById = @{}
$ledgerIds = @()
$ledgerPath = $pointerValues["findingLedgerPath"]
if (-not [string]::IsNullOrWhiteSpace($ledgerPath)) {
    $ledgerFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $ledgerPath
    if (Test-Path -LiteralPath $ledgerFullPath -PathType Leaf) {
        $ledgerText = Get-Content -LiteralPath $ledgerFullPath -Raw -Encoding UTF8
        $findingBlocks = @(Get-FindingBlocks -LedgerText $ledgerText)
        $ids = @($findingBlocks | ForEach-Object { $_.Groups[1].Value.Trim() })
        $ledgerIds = @($ids)
        $p1Count = 0
        $p2Count = 0
        $f0013Found = $false
        foreach ($findingBlock in $findingBlocks) {
            $findingId = $findingBlock.Groups[1].Value.Trim()
            $body = $findingBlock.Groups[2].Value
            $risk = if ($body -match '(?m)^    riskLevel:\s*"?([^"\r\n]+)"?\s*$') { $Matches[1].Trim() } else { "" }
            $execution = if ($body -match '(?m)^    executionStatus:\s*"?([^"\r\n]+)"?\s*$') { $Matches[1].Trim() } else { "" }
            $ledgerFindingCandidateById[$findingId] = if ($body -match '(?m)^    candidateRootCauseCluster:\s*"?([^"\r\n]+)"?\s*$') { $Matches[1].Trim() } else { "" }
            if ($risk -eq "P1") { $p1Count++ }
            elseif ($risk -eq "P2") {
                $p2Count++
                if ($execution -ne "pending") { Add-Finding "P1_PROGRAM_P2_EXECUTION_STARTED $findingId" }
            }
            if ($findingId -eq "F-0013") {
                $f0013Found = $true
                $evidence = if ($body -match '(?m)^    evidenceStatus:\s*"?([^"\r\n]+)"?\s*$') { $Matches[1].Trim() } else { "" }
                $disposition = if ($body -match '(?m)^    disposition:\s*"?([^"\r\n]+)"?\s*$') { $Matches[1].Trim() } else { "" }
                if ($evidence -ne "runtime_evidence_required" -or $disposition -ne "runtime_hold" -or $execution -ne "pending") {
                    Add-Finding "P1_PROGRAM_F0013_RUNTIME_HOLD_CHANGED"
                }
            }
        }
        if ($findingBlocks.Count -ne 143 -or @($ids | Select-Object -Unique).Count -ne 143 -or $p1Count -ne 125 -or $p2Count -ne 18) {
            Add-Finding "P1_PROGRAM_FINDING_IDENTITY_COUNT_INVALID"
        }
        if (-not $f0013Found) { Add-Finding "P1_PROGRAM_F0013_RUNTIME_HOLD_CHANGED" }
    }
}

$postP0MapPath = $pointerValues["postP0MapPath"]
if (-not [string]::IsNullOrWhiteSpace($postP0MapPath)) {
    $postP0MapFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $postP0MapPath
    if (Test-Path -LiteralPath $postP0MapFullPath -PathType Leaf) {
        $mapIds = @(Get-FindingBlocks -LedgerText (Get-Content -LiteralPath $postP0MapFullPath -Raw -Encoding UTF8) | ForEach-Object { $_.Groups[1].Value.Trim() })
        if ((@($ledgerIds | Sort-Object) -join "|") -ne (@($mapIds | Sort-Object) -join "|")) {
            Add-Finding "P1_PROGRAM_FINDING_ID_SET_MISMATCH"
        }
    }
}

foreach ($findingId in $programTaskFindingAssignments.Keys) {
    if ($findingId -notin $ledgerIds) {
        Add-Finding "P1_PROGRAM_TASK_UNKNOWN_FINDING $findingId"
        continue
    }
    $assignedTaskId = $programTaskFindingAssignments[$findingId]
    $assignedTaskBlock = @($activeTasks | Where-Object { $_.Id -eq $assignedTaskId } | ForEach-Object { $_.Block })
    $assignedCandidate = Get-ScalarValue -Block $assignedTaskBlock -Key "candidateRootCauseCluster"
    if ($ledgerFindingCandidateById[$findingId] -ne $assignedCandidate) {
        Add-Finding "P1_PROGRAM_TASK_FINDING_CANDIDATE_MISMATCH $assignedTaskId $findingId"
    }
}

$clusterPath = $pointerValues["clusterPath"]
if (-not [string]::IsNullOrWhiteSpace($clusterPath)) {
    $clusterFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $clusterPath
    if (Test-Path -LiteralPath $clusterFullPath -PathType Leaf) {
        $clusterText = Get-Content -LiteralPath $clusterFullPath -Raw -Encoding UTF8
        $candidateIndex = [array]::IndexOf($expectedCandidateOrder, $currentCandidateClusterId)
        if ($candidateIndex -gt 0) {
            foreach ($priorCandidate in $expectedCandidateOrder[0..($candidateIndex - 1)]) {
                if ($priorCandidate -eq "P1-GLOBAL-STATIC-REGRESSION-BASELINE-FREEZE") { continue }
                $priorBlockMatch = [regex]::Match($clusterText, "(?ms)^  - clusterId:\s*`"?$([regex]::Escape($priorCandidate))`"?\s*\r?\n(.*?)(?=^  - clusterId:|\z)")
                if (-not $priorBlockMatch.Success) {
                    Add-Finding "P1_PROGRAM_CLUSTER_CONTRACT_MISSING $priorCandidate"
                    continue
                }
                $priorFindingIds = @([regex]::Matches($priorBlockMatch.Groups[1].Value, 'F-\d{4}') | ForEach-Object { $_.Value } | Select-Object -Unique)
                foreach ($priorFindingId in $priorFindingIds) {
                    if ($priorFindingId -notin $completedFindingIds) { Add-Finding "P1_PROGRAM_CANDIDATE_ADVANCED_BEFORE_FINDING_COMPLETE $priorCandidate $priorFindingId" }
                }
            }
        }
    }
}

$runtimeBacklogPath = $pointerValues["runtimeBacklogPath"]
if (-not [string]::IsNullOrWhiteSpace($runtimeBacklogPath)) {
    $runtimeFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $runtimeBacklogPath
    if (Test-Path -LiteralPath $runtimeFullPath -PathType Leaf) {
        $runtimeText = Get-Content -LiteralPath $runtimeFullPath -Raw -Encoding UTF8
        $runtimeBlocks = @([regex]::Matches($runtimeText, '(?ms)^  - runtimeValidationId:\s*(RV-\d+)\s*\r?\n(.*?)(?=^  - runtimeValidationId:|\z)'))
        if ($runtimeBlocks.Count -ne 21 -or @($runtimeBlocks | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique).Count -ne 21) {
            Add-Finding "P1_PROGRAM_RUNTIME_BACKLOG_COUNT_INVALID"
        }
        foreach ($runtimeBlock in $runtimeBlocks) {
            $body = $runtimeBlock.Groups[2].Value
            $statusMatch = [regex]::Match($body, '(?m)^    status:\s*([^\r\n]+)\s*$')
            $approvalMatch = [regex]::Match($body, '(?m)^    approvalRequired:\s*([^\r\n]+)\s*$')
            $runtimeStatus = if ($statusMatch.Success) { $statusMatch.Groups[1].Value.Trim() } else { "" }
            $runtimeApproval = if ($approvalMatch.Success) { $approvalMatch.Groups[1].Value.Trim() } else { "" }
            if ($runtimeStatus -ne "pending" -or $runtimeApproval -ne "true") {
                Add-Finding "P1_PROGRAM_RUNTIME_BACKLOG_STATE_CHANGED $($runtimeBlock.Groups[1].Value)"
            }
        }
    }
}

$authorizationSource = $pointerValues["standingAuthorizationSource"]
$stateAuthorizationBlock = @(Get-TopLevelBlock -Lines $stateLines -Key "standingAuthorization")
$queueAuthorizationBlock = @(Get-TopLevelBlock -Lines $queueLines -Key "standingAuthorization")
Test-DirectMappingKeysUnique -Block $stateAuthorizationBlock -Label "project-state standingAuthorization"
Test-DirectMappingKeysUnique -Block $queueAuthorizationBlock -Label "task-queue standingAuthorization"
$stateAuthorization = Get-ScalarValue -Block $stateAuthorizationBlock -Key "source"
$queueAuthorization = Get-ScalarValue -Block $queueAuthorizationBlock -Key "source"
if ($stateAuthorization -ne $authorizationSource -or $queueAuthorization -ne $authorizationSource) { Add-Finding "P1_PROGRAM_STANDING_AUTHORIZATION_MISMATCH" }
if (-not [string]::IsNullOrWhiteSpace($authorizationSource)) {
    $authorizationFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $authorizationSource
    if (Test-Path -LiteralPath $authorizationFullPath -PathType Leaf) {
        $authorizationText = Get-Content -LiteralPath $authorizationFullPath -Raw -Encoding UTF8
        if ($authorizationText -notmatch '(?im)^Status:\s*approved\s*$' -or $authorizationText -notmatch '(?i)human approval') {
            Add-Finding "P1_PROGRAM_STANDING_AUTHORIZATION_CONTENT_INVALID"
        }
        if (-not $SkipExternalIntegrityChecks) {
            foreach ($authorizationPattern in @(
                [regex]::Escape($expectedProgramId),
                '(?i)origin/master',
                '(?is)P2.*(?:No P2 implementation|impact-mapping only)',
                '(?is)runtime.*(?:not approved|remain pending|excluded)',
                '(?is)(?:Provider|database).*(?:not approved|blocked|No[^.\r\n]*approved)',
                '(?is)(?:force push|deployment).*(?:not authorized|fresh user approval)'
            )) {
                if ($authorizationText -notmatch $authorizationPattern) { Add-Finding "P1_PROGRAM_STANDING_AUTHORIZATION_BOUNDARY_MISSING $authorizationPattern" }
            }
        }
    }
}

if (-not $SkipExternalIntegrityChecks) {
    $expectedAuditSha = $expectedShas["auditRepositorySha"]
    $auditHeadResult = Invoke-GitInIsolatedRepository -Root $AuditRepositoryRoot -GitArguments @("rev-parse", "HEAD")
    $auditHead = (($auditHeadResult.Output) -join "").Trim()
    if ($auditHeadResult.ExitCode -ne 0 -or $auditHead -ne $expectedAuditSha) { Add-Finding "P1_PROGRAM_AUDIT_HEAD_DRIFT" }
    $auditStatusResult = Invoke-GitInIsolatedRepository -Root $AuditRepositoryRoot -GitArguments @("status", "--porcelain")
    if ($auditStatusResult.ExitCode -ne 0 -or @($auditStatusResult.Output).Count -gt 0) { Add-Finding "P1_PROGRAM_AUDIT_WORKTREE_DIRTY" }
}

if (-not $SkipGitChecks) {
    $insideWorktree = ((& git -C $RepositoryRoot rev-parse --is-inside-work-tree) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") { Add-Finding "P1_PROGRAM_NOT_IN_GIT_WORKTREE" }
    else {
        if (@(& git -C $RepositoryRoot diff --name-only --diff-filter=U).Count -gt 0) { Add-Finding "P1_PROGRAM_UNMERGED_PATHS" }
        $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
        if ($Phase -eq "pre_commit" -and $branch -in @("master", "main")) { Add-Finding "P1_PROGRAM_PROTECTED_BRANCH_COMMIT" }
        if ($Phase -eq "pre_push") {
            & git -C $RepositoryRoot merge-base --is-ancestor origin/master HEAD
            if ($LASTEXITCODE -ne 0) { Add-Finding "P1_PROGRAM_NON_FAST_FORWARD_PUSH" }
            if (@(& git -C $RepositoryRoot status --porcelain).Count -gt 0) { Add-Finding "P1_PROGRAM_PRE_PUSH_WORKTREE_NOT_CLEAN" }

            $effectivePushUpdateLines = @($PushUpdateLines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
            if ($effectivePushUpdateLines.Count -eq 0 -and [Console]::IsInputRedirected) {
                $effectivePushUpdateLines = @(([Console]::In.ReadToEnd() -split "`r?`n") | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
            }
            $configuredOriginUrl = ((& git -C $RepositoryRoot remote get-url origin) -join "").Trim()
            if ($PushRemoteName -ne "origin" -or [string]::IsNullOrWhiteSpace($PushRemoteUrl) -or $PushRemoteUrl -ne $configuredOriginUrl) {
                Add-Finding "P1_PROGRAM_PRE_PUSH_REMOTE_INVALID"
            }
            if ($effectivePushUpdateLines.Count -ne 1) {
                Add-Finding "P1_PROGRAM_PRE_PUSH_UPDATE_COUNT_INVALID"
            } else {
                $pushFields = @($effectivePushUpdateLines[0] -split '\s+')
                if ($pushFields.Count -ne 4) {
                    Add-Finding "P1_PROGRAM_PRE_PUSH_UPDATE_FORMAT_INVALID"
                } else {
                    $headSha = ((& git -C $RepositoryRoot rev-parse HEAD) -join "").Trim()
                    $originMasterSha = ((& git -C $RepositoryRoot rev-parse origin/master) -join "").Trim()
                    if ($pushFields[0] -ne "refs/heads/master" -or $pushFields[1] -ne $headSha -or $pushFields[2] -ne "refs/heads/master" -or $pushFields[3] -ne $originMasterSha -or $pushFields[1] -match '^0{40}$') {
                        Add-Finding "P1_PROGRAM_PRE_PUSH_REF_INVALID"
                    }
                }
            }
        }
    }
}

if ($stateStatus -eq "closed") {
    if ($activeProgramTasks.Count -ne 0 -or @($stateMaterialized | Where-Object { $stateStatuses[$_] -ne "closed" -or $_ -notin $stateCompleted }).Count -gt 0) {
        Add-Finding "P1_PROGRAM_CLOSED_WITH_OPEN_TASK"
    }
}

if ($findings.Count -gt 0) { throw ($findings -join [Environment]::NewLine) }

$isP1F0115ScopeCorrectionAuthorized = $isP1F0115ScopeCorrectionCandidateValid
$p1TransitionScopeMode = if ($Phase -eq "pre_push" -and (($isTaskTransition -and -not $protectedImplementationChanged) -or $isP1F0132ScopeCorrectionScope -or $isP1F0115Phase11ScopeCorrectionScope -or $isP1F0115ModulePrecommitHotfixScope -or $isP1F0116DesignPathGuardHotfixScope -or $isP1F0116ScopeCorrectionGuardHotfixScope -or $isP1F0117SpecApprovalTransitionHotfixScope -or $isP1F0117SmokeScopeCorrectionScope -or $isP1F0115ScopeCorrectionAuthorized)) { "transition_only" } else { "standard" }

Write-Output "p1ProgramGuardResult: $(if ($stateStatus -eq 'closed') { 'pass_closed_program' } else { 'pass' })"
Write-Output "p1TransitionScopeMode: $p1TransitionScopeMode"
if ($isP1F0115ScopeCorrectionAuthorized) { Write-Output "p1F0115ScopeCorrectionAuthorization: approved_one_time" }
if ($isP1F0115Phase11ScopeCorrectionScope) { Write-Output "p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time" }
if ($isP1F0115ModulePrecommitHotfixScope) { Write-Output "p1F0115ModulePrecommitHotfixAuthorization: approved_one_time" }
if ($isP1F0116DesignPathGuardHotfixScope) { Write-Output "p1F0116DesignPathGuardHotfixAuthorization: approved_one_time" }
if ($isP1F0116ScopeCorrectionGuardHotfixScope) { Write-Output "p1F0116ScopeCorrectionGuardHotfixAuthorization: approved_one_time" }
if ($isP1F0117SpecApprovalTransitionHotfixScope) { Write-Output "p1F0117SpecApprovalTransitionHotfixAuthorization: approved_one_time" }
if ($isP1F0117SmokeScopeCorrectionScope) { Write-Output "p1F0117SmokeScopeCorrectionAuthorization: approved_one_time" }
Write-Output "programId: $expectedProgramId"
Write-Output "currentTaskId: $stateCurrentTaskId"
Write-Output "currentCandidateClusterId: $(Get-ScalarValue -Block $stateProgram -Key 'currentCandidateClusterId')"
Write-Output "materializedTaskCount: $($stateMaterialized.Count)"
Write-Output "findingCounts: P1=125 P2=18"
Write-Output "runtimeValidationCount: 21"
Write-Output "phase: $Phase"
