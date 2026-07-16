param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Assert-Condition {
    param(
        [Parameter(Mandatory = $true)]
        [bool]$Condition,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-UniqueMatches {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Text,
        [Parameter(Mandatory = $true)]
        [string]$Pattern,
        [int]$Group = 1
    )

    return @([regex]::Matches($Text, $Pattern) | ForEach-Object { $_.Groups[$Group].Value } | Sort-Object -Unique)
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

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$auditRoot = "D:\tiku-readonly-audit"
$taskId = "p0-remediation-global-static-regression-baseline-freeze-2026-07-14"
$productStaticBaselineSha = "e136ca28acde82282a17c65ccfb828a01e872c0b"
$auditRepositorySha = "a84224fa12ec85b28e6acd945deba2afa28c6c02"

$baselinePath = Join-Path $repoRoot "docs\05-execution-logs\audits-reviews\2026-07-15-p0-remediation-static-baseline-v2.yaml"
$impactMapPath = Join-Path $repoRoot "docs\05-execution-logs\audits-reviews\2026-07-15-p0-remediation-p1-p2-impact-map.yaml"
$projectStatePath = Join-Path $repoRoot "docs\04-agent-system\state\project-state.yaml"
$taskQueuePath = Join-Path $repoRoot "docs\04-agent-system\state\task-queue.yaml"
$planPath = Join-Path $repoRoot "docs\05-execution-logs\task-plans\2026-07-14-p0-remediation-global-static-regression-baseline-freeze.md"
$evidencePath = Join-Path $repoRoot "docs\05-execution-logs\evidence\2026-07-14-p0-remediation-global-static-regression-baseline-freeze.md"
$auditReviewPath = Join-Path $repoRoot "docs\05-execution-logs\audits-reviews\2026-07-14-p0-remediation-global-static-regression-baseline-freeze.md"
$findingRegisterPath = Join-Path $auditRoot "findings\finding-register.yaml"
$runtimeBacklogPath = Join-Path $auditRoot "runtime\runtime-validation-backlog.yaml"

foreach ($requiredPath in @($baselinePath, $impactMapPath, $projectStatePath, $taskQueuePath, $planPath, $evidencePath, $auditReviewPath, $findingRegisterPath, $runtimeBacklogPath)) {
    Assert-Condition (Test-Path -LiteralPath $requiredPath) "P0_GLOBAL_BASELINE_MISSING_PATH $requiredPath"
}

$baselineText = Get-Content -Raw -LiteralPath $baselinePath
$impactMapText = Get-Content -Raw -LiteralPath $impactMapPath
$projectStateText = Get-Content -Raw -LiteralPath $projectStatePath
$taskQueueText = Get-Content -Raw -LiteralPath $taskQueuePath
$findingRegisterText = Get-Content -Raw -LiteralPath $findingRegisterPath
$runtimeBacklogText = Get-Content -Raw -LiteralPath $runtimeBacklogPath

$registerIdMatches = [regex]::Matches($findingRegisterText, 'findingId:[ \t]*(F-\d{4})')
$registerRiskMatches = [regex]::Matches($findingRegisterText, 'riskLevel:[ \t]*(P[012])')
$registerByRisk = @{
    P0 = @()
    P1 = @()
    P2 = @()
}
Assert-Condition ($registerIdMatches.Count -eq $registerRiskMatches.Count) "P0_GLOBAL_REGISTER_ID_RISK_ALIGNMENT_MISMATCH"
for ($index = 0; $index -lt $registerIdMatches.Count; $index++) {
    $registerByRisk[$registerRiskMatches[$index].Groups[1].Value] += $registerIdMatches[$index].Groups[1].Value
}
foreach ($risk in @("P0", "P1", "P2")) {
    $registerByRisk[$risk] = @($registerByRisk[$risk] | Sort-Object -Unique)
}

Assert-Condition ($registerIdMatches.Count -eq 178) "P0_GLOBAL_REGISTER_COUNT expected=178 actual=$($registerIdMatches.Count)"
Assert-Condition ($registerByRisk.P0.Count -eq 35) "P0_GLOBAL_REGISTER_P0_COUNT expected=35 actual=$($registerByRisk.P0.Count)"
Assert-Condition ($registerByRisk.P1.Count -eq 125) "P0_GLOBAL_REGISTER_P1_COUNT expected=125 actual=$($registerByRisk.P1.Count)"
Assert-Condition ($registerByRisk.P2.Count -eq 18) "P0_GLOBAL_REGISTER_P2_COUNT expected=18 actual=$($registerByRisk.P2.Count)"

$baselineP0Matches = [regex]::Matches($baselineText, 'findingId:\s*(F-\d{4})')
$baselineP0Ids = @($baselineP0Matches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
Assert-Condition ($baselineP0Matches.Count -eq 35) "P0_GLOBAL_BASELINE_P0_OCCURRENCES expected=35 actual=$($baselineP0Matches.Count)"
Assert-Condition ($baselineP0Ids.Count -eq 35) "P0_GLOBAL_BASELINE_P0_UNIQUE expected=35 actual=$($baselineP0Ids.Count)"
Assert-Condition (@(Compare-Object $registerByRisk.P0 $baselineP0Ids).Count -eq 0) "P0_GLOBAL_BASELINE_P0_SET_MISMATCH"
Assert-Condition ([regex]::Matches($baselineText, 'finalStaticStatus:[ \t]*static_remediated').Count -eq 36) "P0_GLOBAL_STATIC_REMEDIATION_COUNT_MISMATCH"
Assert-Condition ([regex]::Matches($baselineText, 'aliasOf:\s*F-\d{4}').Count -eq 5) "P0_GLOBAL_ALIAS_COUNT_MISMATCH"
Assert-Condition ($baselineText -match 'findingsDowngraded:\s*0') "P0_GLOBAL_DOWNGRADE_BOUNDARY_MISSING"
Assert-Condition ($baselineText -match 'duplicateFindingsRemoved:\s*0') "P0_GLOBAL_DUPLICATE_BOUNDARY_MISSING"

$specialCasesIndex = $impactMapText.IndexOf("specialCases:", [StringComparison]::Ordinal)
Assert-Condition ($specialCasesIndex -gt 0) "P0_GLOBAL_IMPACT_SPECIAL_CASE_BOUNDARY_MISSING"
$impactInventoryText = $impactMapText.Substring(0, $specialCasesIndex)
$impactMatches = [regex]::Matches($impactInventoryText, 'F-\d{4}')
$impactIds = @($impactMatches | ForEach-Object { $_.Value } | Sort-Object -Unique)
$registerP1P2Ids = @($registerByRisk.P1 + $registerByRisk.P2 | Sort-Object -Unique)
Assert-Condition ($impactMatches.Count -eq 143) "P0_GLOBAL_IMPACT_OCCURRENCES expected=143 actual=$($impactMatches.Count)"
Assert-Condition ($impactIds.Count -eq 143) "P0_GLOBAL_IMPACT_UNIQUE expected=143 actual=$($impactIds.Count)"
Assert-Condition (@(Compare-Object $registerP1P2Ids $impactIds).Count -eq 0) "P0_GLOBAL_IMPACT_SET_MISMATCH"
Assert-Condition ($impactMapText -match 'potentiallyCovered:\s*96') "P0_GLOBAL_IMPACT_POTENTIAL_COUNT_MISSING"
Assert-Condition ($impactMapText -match 'semanticChange:\s*35') "P0_GLOBAL_IMPACT_SEMANTIC_COUNT_MISSING"
Assert-Condition ($impactMapText -match 'revalidateAfterP0:\s*10') "P0_GLOBAL_IMPACT_REVALIDATE_COUNT_MISSING"
Assert-Condition ($impactMapText -match 'unrelatedDeferred:\s*2') "P0_GLOBAL_IMPACT_UNRELATED_COUNT_MISSING"
Assert-Condition ($impactMapText -match '(?ms)F-0013:.*?retainedStatus:\s*runtime_evidence_required') "P0_GLOBAL_F0013_RUNTIME_STATUS_NOT_RETAINED"

$runtimeIdMatches = [regex]::Matches($runtimeBacklogText, 'runtimeValidationId:[ \t]*(RV-\d{4})')
$runtimeIds = @($runtimeIdMatches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
$runtimePendingMatches = [regex]::Matches($runtimeBacklogText, 'status:[ \t]*pending')
$runtimeApprovalMatches = [regex]::Matches($runtimeBacklogText, 'approvalRequired:[ \t]*true')
Assert-Condition ($runtimeIdMatches.Count -eq 21) "P0_GLOBAL_RUNTIME_COUNT expected=21 actual=$($runtimeIdMatches.Count)"
Assert-Condition ($runtimeIds.Count -eq 21) "P0_GLOBAL_RUNTIME_UNIQUE expected=21 actual=$($runtimeIds.Count)"
Assert-Condition ($runtimePendingMatches.Count -eq 21) "P0_GLOBAL_RUNTIME_PENDING_COUNT expected=21 actual=$($runtimePendingMatches.Count)"
Assert-Condition ($runtimeApprovalMatches.Count -eq 21) "P0_GLOBAL_RUNTIME_APPROVAL_COUNT expected=21 actual=$($runtimeApprovalMatches.Count)"

$clusterIds = Get-UniqueMatches -Text $baselineText -Pattern 'clusterId:[ \t]*(RC-\d{2})'
Assert-Condition ($clusterIds.Count -eq 8) "P0_GLOBAL_CLUSTER_COUNT expected=8 actual=$($clusterIds.Count)"
$order = @("RC-01", "RC-02", "RC-03", "RC-04", "RC-05", "RC-06", "RC-07", "RC-08")
$orderIndex = @{}
for ($index = 0; $index -lt $order.Count; $index++) {
    $orderIndex[$order[$index]] = $index
}
$edgeMatches = [regex]::Matches($baselineText, '- \[(RC-\d{2}), (RC-\d{2})\]')
Assert-Condition ($edgeMatches.Count -eq 17) "P0_GLOBAL_EDGE_COUNT expected=17 actual=$($edgeMatches.Count)"
foreach ($edge in $edgeMatches) {
    $upstream = $edge.Groups[1].Value
    $downstream = $edge.Groups[2].Value
    Assert-Condition ($orderIndex[$upstream] -lt $orderIndex[$downstream]) "P0_GLOBAL_DEPENDENCY_CYCLE_OR_ORDER $upstream->$downstream"
}

$rcEvidencePaths = Get-UniqueMatches -Text $baselineText -Pattern 'evidencePath:[ \t]*([^\r\n]+)'
$rcAuditPaths = Get-UniqueMatches -Text $baselineText -Pattern 'auditPath:[ \t]*([^\r\n]+)'
Assert-Condition ($rcEvidencePaths.Count -eq 8) "P0_GLOBAL_RC_EVIDENCE_PATH_COUNT_MISMATCH"
Assert-Condition ($rcAuditPaths.Count -eq 8) "P0_GLOBAL_RC_AUDIT_PATH_COUNT_MISMATCH"
foreach ($relativePath in @($rcEvidencePaths + $rcAuditPaths)) {
    $absolutePath = Join-Path $repoRoot ($relativePath -replace '/', '\')
    Assert-Condition (Test-Path -LiteralPath $absolutePath) "P0_GLOBAL_RC_PROOF_MISSING $relativePath"
}

$expectedAuditHashes = @{
    "reports\2026-07-14-ap-fin-001-final-static-audit-synthesis.md" = "C3E3BEFBBD0BA55FB11B75ACD324AF566CBD343A1470495BA6F399328E0307E2"
    "reports\2026-07-14-ap-xr-002-nine-role-state-handoff-global-reconciliation.md" = "748541195D4C6C6725DD8BFC803C9F029FF1D1F911B009E37A6CCBDA3338D16E"
    "findings\finding-register.yaml" = "CDB8CE059566ABEDDA3D4C723E3F048ECFA677697053FB7765D6EF46273752F2"
    "runtime\runtime-validation-backlog.yaml" = "61AC94E58CBF10F7C0A8C729096C2158AAF7567DD4982B1A957B0F57042FBCAA"
    "runtime\runtime-acceptance-sequencing-ap-fin-001.yaml" = "7988442B3928580A6A84E5189BF192F62457F7375792BA105644A0AF07C1C6F0"
    "catalog\sources\final-completion-audit-ap-fin-001.yaml" = "1A0AFA955676E95CF98E71C5FCB40C4B2CD410EEB4664A00515B29DB00D27AAA"
}
foreach ($relativePath in $expectedAuditHashes.Keys) {
    $absolutePath = Join-Path $auditRoot $relativePath
    $actualHash = Get-FileSha256 -Path $absolutePath
    Assert-Condition ($actualHash -eq $expectedAuditHashes[$relativePath]) "P0_GLOBAL_AUDIT_HASH_MISMATCH $relativePath"
}

$auditHead = (& git -C $auditRoot rev-parse HEAD).Trim()
$auditStatus = @(& git -C $auditRoot status --short)
Assert-Condition ($auditHead -eq $auditRepositorySha) "P0_GLOBAL_AUDIT_HEAD_MISMATCH expected=$auditRepositorySha actual=$auditHead"
Assert-Condition ($auditStatus.Count -eq 0) "P0_GLOBAL_AUDIT_DIRTY"

& git -C $repoRoot merge-base --is-ancestor $productStaticBaselineSha HEAD
Assert-Condition ($LASTEXITCODE -eq 0) "P0_GLOBAL_PRODUCT_BASELINE_NOT_ANCESTOR"
$p1SuccessorActive = $projectStateText -match '(?ms)^p1RemediationSerialProgram:\s*\r?\n.*?^  status:\s*(?:in_progress|closed)\s*$'
$productBoundaryHead = if ($p1SuccessorActive) { "4cd2792f57d4eea3ac2770598b5490ebcfdead51" } else { "HEAD" }
$trackedProductDiff = @(& git -C $repoRoot diff --name-only $productStaticBaselineSha $productBoundaryHead -- src tests drizzle package.json pnpm-lock.yaml)
Assert-Condition ($trackedProductDiff.Count -eq 0) "P0_GLOBAL_FROZEN_PRODUCT_BOUNDARY_CHANGED $($trackedProductDiff -join ',')"

Assert-Condition ($projectStateText -match "currentTaskId:\s*$([regex]::Escape($taskId))") "P0_GLOBAL_PROJECT_STATE_CURRENT_TASK_MISMATCH"
Assert-Condition ($taskQueueText -match "currentTaskId:\s*$([regex]::Escape($taskId))") "P0_GLOBAL_TASK_QUEUE_CURRENT_TASK_MISMATCH"
$projectProgramClosed = $projectStateText -match '(?ms)^p0RemediationSerialProgram:\s*\r?\n.*?^  status:\s*closed\s*$'
$queueProgramClosed = $taskQueueText -match '(?ms)^p0RemediationSerialProgram:\s*\r?\n.*?^  status:\s*closed\s*$'
Assert-Condition ($projectProgramClosed -eq $queueProgramClosed) "P0_GLOBAL_PROGRAM_STATUS_MISMATCH"
$p0QueueProgramBlock = [regex]::Match($taskQueueText, '(?ms)^p0RemediationSerialProgram:\s*\r?\n(.*?)(?=^[A-Za-z]|\z)').Groups[1].Value
$wipCount = [regex]::Matches($p0QueueProgramBlock, '(?m)^    [^:\r\n]+:\s*(in_progress|ready_for_closeout)\s*$').Count
if ($projectProgramClosed) {
    Assert-Condition ($wipCount -eq 0) "P0_GLOBAL_CLOSED_PROGRAM_HAS_P0_WIP actual=$wipCount"
} else {
    Assert-Condition ($wipCount -eq 1) "P0_GLOBAL_WIP_NOT_ONE actual=$wipCount"
}

Write-Output "p0GlobalBaselineResult: pass"
Write-Output "p0FindingCount: 35"
Write-Output "p1P2ImpactCount: 143"
Write-Output "runtimePendingCount: 21"
Write-Output "rootCauseClusterCount: 8"
Write-Output "dependencyCycleCount: 0"
Write-Output "programStatus: $(if ($projectProgramClosed) { 'closed' } else { 'in_progress' })"
Write-Output "auditRepositorySha: $auditHead"
Write-Output "productStaticBaselineSha: $productStaticBaselineSha"
