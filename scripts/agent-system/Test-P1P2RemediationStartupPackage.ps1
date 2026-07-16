[CmdletBinding()]
param(
    [string]$RepositoryRoot = "",
    [string]$AuditRepositoryRoot = "D:/tiku-readonly-audit",
    [switch]$SkipLiveRemote
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "../..")).Path
}

$expectedMasterSha = "0643ad4d6346453f3324d86b6e003c6726c808ef"
$p0ProductBaselineSha = "e136ca28acde82282a17c65ccfb828a01e872c0b"
$expectedAuditSha = "a84224fa12ec85b28e6acd945deba2afa28c6c02"
$statePath = Join-Path $RepositoryRoot "docs/04-agent-system/state/project-state.yaml"
$queuePath = Join-Path $RepositoryRoot "docs/04-agent-system/state/task-queue.yaml"
$registerPath = Join-Path $AuditRepositoryRoot "findings/finding-register.yaml"
$runtimeBacklogPath = Join-Path $AuditRepositoryRoot "runtime/runtime-validation-backlog.yaml"
$ledgerPath = Join-Path $RepositoryRoot "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml"
$mapPath = Join-Path $RepositoryRoot "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml"
$clusterPath = Join-Path $RepositoryRoot "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml"
$generatorPath = Join-Path $RepositoryRoot "scripts/agent-system/New-P1P2RemediationStartupArtifacts.ps1"

$requiredFiles = @(
    $statePath,
    $queuePath,
    (Join-Path $RepositoryRoot "docs/05-execution-logs/task-plans/2026-07-15-p1-p2-remediation-startup-package-v1.md"),
    (Join-Path $RepositoryRoot "docs/05-execution-logs/task-plans/2026-07-15-p1-remediation-serial-program.md"),
    (Join-Path $RepositoryRoot "docs/05-execution-logs/evidence/2026-07-15-p1-p2-remediation-startup-package-v1.md"),
    (Join-Path $RepositoryRoot "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-startup-package-v1.md"),
    $ledgerPath,
    $mapPath,
    $clusterPath,
    $generatorPath,
    $PSCommandPath
)

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw "ASSERTION FAILED: $Message" }
}

function Write-Pass {
    param([string]$Message)
    Write-Output "PASS $Message"
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

function Get-FindingIds {
    param([string]$Text)
    return @([regex]::Matches($Text, '(?m)^  - findingId:\s*"?(F-\d{4})"?\s*$') | ForEach-Object { $_.Groups[1].Value })
}

function Get-ScalarFromBlock {
    param([string]$Block, [string]$Key)
    $match = [regex]::Match($Block, "(?m)^    $([regex]::Escape($Key)):\s*`"?([^`"\r\n]+)`"?\s*$")
    if (-not $match.Success) { return "" }
    return $match.Groups[1].Value.Trim()
}

function Assert-SetEqual {
    param([string[]]$Expected, [string[]]$Actual, [string]$Label)
    $expectedSorted = @($Expected | Sort-Object -Unique)
    $actualSorted = @($Actual | Sort-Object -Unique)
    Assert-True ($expectedSorted.Count -eq $actualSorted.Count) "$Label count mismatch"
    Assert-True (($expectedSorted -join ",") -eq ($actualSorted -join ",")) "$Label set mismatch"
}

foreach ($path in $requiredFiles) {
    Assert-True (Test-Path -LiteralPath $path) "required recovery artifact missing: $path"
}
Write-Pass "recovery artifact surface exists"

$stateText = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8
$queueText = Get-Content -LiteralPath $queuePath -Raw -Encoding UTF8
$registerText = Get-Content -LiteralPath $registerPath -Raw -Encoding UTF8
$runtimeBacklogText = Get-Content -LiteralPath $runtimeBacklogPath -Raw -Encoding UTF8
$ledgerText = Get-Content -LiteralPath $ledgerPath -Raw -Encoding UTF8
$mapText = Get-Content -LiteralPath $mapPath -Raw -Encoding UTF8
$clusterText = Get-Content -LiteralPath $clusterPath -Raw -Encoding UTF8
$successorMode = $stateText -match "(?m)^p1RemediationSerialProgram:\s*$"
$successorBaselineSha = "4cd2792f57d4eea3ac2770598b5490ebcfdead51"

$originMasterSha = (& git -C $RepositoryRoot rev-parse origin/master).Trim()
$currentHeadSha = (& git -C $RepositoryRoot rev-parse HEAD).Trim()
if ($successorMode) {
    & git -C $RepositoryRoot merge-base --is-ancestor $successorBaselineSha $originMasterSha
    Assert-True ($LASTEXITCODE -eq 0) "origin/master is not descended from the frozen P1 successor baseline: $originMasterSha"
    & git -C $RepositoryRoot merge-base --is-ancestor $originMasterSha $currentHeadSha
    Assert-True ($LASTEXITCODE -eq 0) "current HEAD is not a fast-forward descendant of origin/master: head=$currentHeadSha origin=$originMasterSha"
} else {
    $allowedRemoteShas = @($expectedMasterSha, $currentHeadSha)
    Assert-True ($originMasterSha -in $allowedRemoteShas) "origin/master drift outside pre-closeout baseline/current package HEAD: $originMasterSha"
}
if (-not $SkipLiveRemote) {
    $liveLine = (& git -C $RepositoryRoot ls-remote origin refs/heads/master).Trim()
    Assert-True (-not [string]::IsNullOrWhiteSpace($liveLine)) "live remote master missing"
    $liveSha = $liveLine.Split("`t")[0]
    Assert-True ($liveSha -eq $originMasterSha) "live remote and origin/master disagree: live=$liveSha origin=$originMasterSha"
}
Write-Pass "origin/live are synchronized at an allowed pre/post-closeout SHA ($originMasterSha)"

$productPaths = @("src", "tests", "drizzle", "e2e", "package.json", "pnpm-lock.yaml", "package-lock.json", "yarn.lock")
if ($successorMode) {
    $frozenStartupProductDiff = @(& git -C $RepositoryRoot diff --name-only "$p0ProductBaselineSha..$successorBaselineSha" -- @productPaths | Where-Object { $_ })
    Assert-True ($frozenStartupProductDiff.Count -eq 0) "frozen startup product boundary drifted before successor baseline: $($frozenStartupProductDiff -join ', ')"
    Write-Pass "frozen startup product-zero-change boundary remains valid; successor task scope is governed separately"
} else {
    $committedProductDiff = @(& git -C $RepositoryRoot diff --name-only "$p0ProductBaselineSha..HEAD" -- @productPaths | Where-Object { $_ })
    $workingProductDiff = @(& git -C $RepositoryRoot diff --name-only -- @productPaths | Where-Object { $_ })
    $cachedProductDiff = @(& git -C $RepositoryRoot diff --cached --name-only -- @productPaths | Where-Object { $_ })
    Assert-True ($committedProductDiff.Count -eq 0) "committed product drift after P0 business baseline: $($committedProductDiff -join ', ')"
    Assert-True ($workingProductDiff.Count -eq 0) "unstaged product changes exist: $($workingProductDiff -join ', ')"
    Assert-True ($cachedProductDiff.Count -eq 0) "staged product changes exist: $($cachedProductDiff -join ', ')"
    Write-Pass "business source/tests/schema/dependencies remain unchanged"
}

$auditHead = (& git -C $AuditRepositoryRoot rev-parse HEAD).Trim()
$auditStatus = @(& git -C $AuditRepositoryRoot status --short)
Assert-True ($auditHead -eq $expectedAuditSha) "audit HEAD drift: $auditHead"
Assert-True ($auditStatus.Count -eq 0) "audit repository is dirty"
& git -C $AuditRepositoryRoot fsck --full --no-dangling *> $null
Assert-True ($LASTEXITCODE -eq 0) "audit git fsck failed"
$auditHashes = [ordered]@{
    "reports/2026-07-14-ap-fin-001-final-static-audit-synthesis.md" = "C3E3BEFBBD0BA55FB11B75ACD324AF566CBD343A1470495BA6F399328E0307E2"
    "reports/2026-07-14-ap-xr-002-nine-role-state-handoff-global-reconciliation.md" = "748541195D4C6C6725DD8BFC803C9F029FF1D1F911B009E37A6CCBDA3338D16E"
    "findings/finding-register.yaml" = "CDB8CE059566ABEDDA3D4C723E3F048ECFA677697053FB7765D6EF46273752F2"
    "runtime/runtime-validation-backlog.yaml" = "61AC94E58CBF10F7C0A8C729096C2158AAF7567DD4982B1A957B0F57042FBCAA"
    "runtime/runtime-acceptance-sequencing-ap-fin-001.yaml" = "7988442B3928580A6A84E5189BF192F62457F7375792BA105644A0AF07C1C6F0"
    "catalog/sources/final-completion-audit-ap-fin-001.yaml" = "1A0AFA955676E95CF98E71C5FCB40C4B2CD410EEB4664A00515B29DB00D27AAA"
}
foreach ($entry in $auditHashes.GetEnumerator()) {
    $actualHash = Get-FileSha256 -Path (Join-Path $AuditRepositoryRoot $entry.Key)
    Assert-True ($actualHash -eq $entry.Value) "audit artifact hash drift: $($entry.Key)"
}
Write-Pass "read-only audit HEAD, cleanliness, fsck and six frozen hashes"

$runtimeBlocks = @([regex]::Matches($runtimeBacklogText, "(?ms)^  - runtimeValidationId:\s*(RV-\d{4})\s*\r?\n(.*?)(?=^  - runtimeValidationId:|\z)"))
Assert-True ($runtimeBlocks.Count -eq 21) "runtime backlog must contain 21 items"
Assert-True (@($runtimeBlocks | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique).Count -eq 21) "runtime validation IDs must be unique"
foreach ($runtimeBlock in $runtimeBlocks) {
    Assert-True ($runtimeBlock.Groups[2].Value -match "(?m)^    status:\s*pending\s*$") "runtime item not pending: $($runtimeBlock.Groups[1].Value)"
    Assert-True ($runtimeBlock.Groups[2].Value -match "(?m)^    approvalRequired:\s*true\s*$") "runtime item approval boundary missing: $($runtimeBlock.Groups[1].Value)"
}
Write-Pass "21 runtime validations remain unique, pending and approval-required"

$registerBlocks = @([regex]::Matches($registerText, "(?ms)^  - findingId:\s*(F-\d{4})\s*\r?\n(.*?)(?=^  - findingId:|\z)"))
$expectedIds = @()
$expectedP1 = 0
$expectedP2 = 0
foreach ($match in $registerBlocks) {
    $riskMatch = [regex]::Match($match.Groups[2].Value, "(?m)^    riskLevel:\s*(P[012])\s*$")
    if (-not $riskMatch.Success -or $riskMatch.Groups[1].Value -notin @("P1", "P2")) { continue }
    $expectedIds += $match.Groups[1].Value
    if ($riskMatch.Groups[1].Value -eq "P1") { $expectedP1++ } else { $expectedP2++ }
}
Assert-True ($expectedIds.Count -eq 143 -and $expectedP1 -eq 125 -and $expectedP2 -eq 18) "source register P1/P2 count mismatch"
Assert-True (@($expectedIds | Sort-Object -Unique).Count -eq 143) "source register P1/P2 IDs not unique"

$ledgerIds = Get-FindingIds $ledgerText
$mapIds = Get-FindingIds $mapText
Assert-True ($ledgerIds.Count -eq 143 -and @($ledgerIds | Sort-Object -Unique).Count -eq 143) "ledger must contain 143 unique findings"
Assert-True ($mapIds.Count -eq 143 -and @($mapIds | Sort-Object -Unique).Count -eq 143) "post-P0 map must contain 143 unique findings"
Assert-SetEqual -Expected $expectedIds -Actual $ledgerIds -Label "source register vs ledger"
Assert-SetEqual -Expected $expectedIds -Actual $mapIds -Label "source register vs post-P0 map"
Write-Pass "125 P1 + 18 P2 appear exactly once in register, ledger and map"

$allowedEvidenceStatuses = @("confirmed", "baseline_changed", "root_cause_alias", "duplicate_candidate", "false_positive_candidate", "runtime_evidence_required")
$allowedDispositions = @("remediation_required", "statically_closed_by_p0", "partially_covered_by_p0", "requirement_superseded", "runtime_hold", "pending_deep_revalidation")
$allowedExecutionStatuses = @("pending", "in_progress", "ready_for_closeout", "closed")
$ledgerBlocks = @([regex]::Matches($ledgerText, '(?ms)^  - findingId:\s*"(F-\d{4})"\s*\r?\n(.*?)(?=^  - findingId:|\z)'))
$p1Count = 0; $p2Count = 0
$impactCounts = @{}; $evidenceCounts = @{}; $dispositionCounts = @{}; $executionCounts = @{}
foreach ($match in $ledgerBlocks) {
    $block = $match.Groups[2].Value
    $risk = Get-ScalarFromBlock $block "riskLevel"
    $evidence = Get-ScalarFromBlock $block "evidenceStatus"
    $disposition = Get-ScalarFromBlock $block "disposition"
    $execution = Get-ScalarFromBlock $block "executionStatus"
    $impact = Get-ScalarFromBlock $block "p0ImpactCategory"
    $cluster = Get-ScalarFromBlock $block "candidateRootCauseCluster"
    if ($risk -eq "P1") { $p1Count++ } elseif ($risk -eq "P2") { $p2Count++ } else { throw "invalid risk for $($match.Groups[1].Value): $risk" }
    Assert-True ($evidence -in $allowedEvidenceStatuses) "invalid evidence status for $($match.Groups[1].Value)"
    Assert-True ($disposition -in $allowedDispositions) "invalid disposition for $($match.Groups[1].Value)"
    Assert-True ($execution -in $allowedExecutionStatuses) "invalid execution status for $($match.Groups[1].Value)"
    Assert-True ($cluster -match "^P[12]-RC-\d{2}$") "missing candidate cluster for $($match.Groups[1].Value)"
    foreach ($pair in @(@($impactCounts,$impact),@($evidenceCounts,$evidence),@($dispositionCounts,$disposition),@($executionCounts,$execution))) {
        if (-not $pair[0].ContainsKey($pair[1])) { $pair[0][$pair[1]] = 0 }
        $pair[0][$pair[1]]++
    }
}
Assert-True ($p1Count -eq 125 -and $p2Count -eq 18) "ledger risk counts mismatch"
Assert-True ($impactCounts["potentiallyCovered"] -eq 96 -and $impactCounts["semanticChange"] -eq 35 -and $impactCounts["revalidateAfterP0"] -eq 10 -and $impactCounts["unrelatedDeferred"] -eq 2) "P0 impact category counts drift"
Assert-True (-not $dispositionCounts.ContainsKey("statically_closed_by_p0")) "level-1 review must not claim static closure"
Assert-True (-not $dispositionCounts.ContainsKey("requirement_superseded")) "level-1 review must not claim requirement supersession"
Assert-True ($executionCounts.Count -eq 1 -and $executionCounts["pending"] -eq 143) "all findings must remain pending at startup"

$f0013 = @($ledgerBlocks | Where-Object { $_.Groups[1].Value -eq "F-0013" })
Assert-True ($f0013.Count -eq 1) "F-0013 must appear once"
Assert-True ((Get-ScalarFromBlock $f0013.Groups[2].Value "evidenceStatus") -eq "runtime_evidence_required") "F-0013 evidence status changed"
Assert-True ((Get-ScalarFromBlock $f0013.Groups[2].Value "disposition") -eq "runtime_hold") "F-0013 runtime hold missing"
Write-Pass "status dimensions are independent; no unsupported closure/downgrade; F-0013 remains runtime hold"

$clusterBlocks = @([regex]::Matches($clusterText, '(?ms)^  - clusterId:\s*"(P[12]-RC-\d{2})"\s*\r?\n(.*?)(?=^  - clusterId:|\z)'))
Assert-True ($clusterBlocks.Count -eq 13) "expected 13 candidate cluster definitions"
$membershipIds = @()
foreach ($match in $clusterBlocks) {
    Assert-True ($match.Groups[2].Value -match "(?m)^    coveredFindingIds:") "cluster membership missing: $($match.Groups[1].Value)"
    $members = @([regex]::Matches($match.Groups[2].Value, "F-\d{4}") | ForEach-Object { $_.Value })
    $membershipIds += $members
    $declaredCount = [int](Get-ScalarFromBlock $match.Groups[2].Value "findingCount")
    Assert-True ($declaredCount -eq $members.Count) "cluster count mismatch: $($match.Groups[1].Value)"
    $contractItems = @([regex]::Matches($match.Groups[2].Value, '(?m)^      -\s*".*?"\s*$'))
    Assert-True ($contractItems.Count -eq 12) "acceptance contract must have 12 dimensions: $($match.Groups[1].Value)"
}
Assert-True ($membershipIds.Count -eq 143 -and @($membershipIds | Sort-Object -Unique).Count -eq 143) "cluster membership must cover 143 findings exactly once"
Assert-SetEqual -Expected $ledgerIds -Actual $membershipIds -Label "ledger vs candidate cluster membership"

$edges = @([regex]::Matches($clusterText, '(?m)^  - \["(P1-RC-\d{2})", "(P1-RC-\d{2})"\]\s*$'))
$nodes = @($clusterBlocks | Where-Object { $_.Groups[1].Value -like "P1-*" } | ForEach-Object { $_.Groups[1].Value })
$incoming = @{}; $adjacent = @{}
foreach ($node in $nodes) { $incoming[$node] = 0; $adjacent[$node] = @() }
foreach ($edge in $edges) {
    $from = $edge.Groups[1].Value; $to = $edge.Groups[2].Value
    Assert-True ($incoming.ContainsKey($from) -and $incoming.ContainsKey($to)) "DAG edge references unknown node"
    $incoming[$to]++; $adjacent[$from] += $to
}
$ready = [System.Collections.Generic.Queue[string]]::new()
foreach ($node in $nodes) { if ($incoming[$node] -eq 0) { $ready.Enqueue($node) } }
$visited = 0
while ($ready.Count -gt 0) {
    $node = $ready.Dequeue(); $visited++
    foreach ($next in $adjacent[$node]) { $incoming[$next]--; if ($incoming[$next] -eq 0) { $ready.Enqueue($next) } }
}
Assert-True ($visited -eq $nodes.Count) "P1 candidate dependency graph contains a cycle"
Assert-True ($clusterText -match 'p2ImplementationGate:\s*"p1_static_baseline_frozen"') "P2 implementation gate missing"
Write-Pass "13 clusters cover all findings, each has a 12-part contract, P1 DAG is acyclic, P2 is gated"

Assert-True ($stateText -notmatch "(?m)^p1P2Remediation(?:Startup)?Program:") "startup task must not bloat the top-level recovery surface"
Assert-True ($queueText -notmatch "(?m)^p1P2RemediationStartupProgram:") "startup task must remain in activeTasks, not a new top-level queue program"
if ($successorMode) {
    Assert-True ($stateText -match "(?ms)^lastClosedStartupTask:\s*\r?\n.*?^  id:\s*p1-p2-remediation-startup-package-v1-2026-07-15\s*$") "closed startup recovery metadata missing from project state"
    Assert-True ($stateText -match "(?ms)^lastClosedStartupTask:\s*\r?\n.*?^  startupPackage:\s*$") "nested startup recovery metadata missing"
    Assert-True ($stateText -match "(?ms)^lastClosedStartupTask:\s*\r?\n.*?^  implementationBoundary:\s*\r?\n.*?p1Implementation:\s*blocked_requires_new_goal_and_authorization") "historical P1/P2 authorization boundary missing"
    $successorTaskId = [regex]::Match($stateText, "(?ms)^p1RemediationSerialProgram:\s*\r?\n(.*?)(?=^[A-Za-z]|\z)").Groups[1].Value | ForEach-Object { [regex]::Match($_, "(?m)^  currentTaskId:\s*(\S+)\s*$").Groups[1].Value }
    Assert-True (-not [string]::IsNullOrWhiteSpace($successorTaskId)) "P1 successor currentTaskId missing"
    Assert-True ($stateText -match "(?ms)^currentTask:\s*\r?\n.*?^  id:\s*$([regex]::Escape($successorTaskId))\s*$") "P1 successor currentTask missing from project state"
} else {
    Assert-True ($stateText -match "(?ms)^currentTask:\s*\r?\n.*?^  id:\s*p1-p2-remediation-startup-package-v1-2026-07-15\s*$") "startup currentTask missing from project state"
    Assert-True ($stateText -match "(?ms)^currentTask:\s*\r?\n.*?^  startupPackage:\s*$") "nested startup recovery metadata missing"
    Assert-True ($stateText -match "(?ms)^currentTask:\s*\r?\n.*?^  implementationBoundary:\s*\r?\n.*?p1Implementation:\s*blocked_requires_new_goal_and_authorization") "P1/P2 implementation authorization boundary missing"
}
Assert-True ($queueText -match "(?m)^\s+- id:\s+p1-p2-remediation-startup-package-v1-2026-07-15$") "startup task missing from activeTasks"
$activeSection = [regex]::Match($queueText, "(?ms)^activeTasks:\s*(.*)\z").Groups[1].Value
$inProgressCount = @([regex]::Matches($activeSection, "(?m)^    status:\s*in_progress\s*$")).Count
if ($successorMode) {
    Assert-True ($inProgressCount -eq 1) "WIP=1 violated while P1 successor program is active"
} else {
    $startupStatusMatch = [regex]::Match($stateText, "(?ms)^currentTask:\s*\r?\n(.*?)(?=^[A-Za-z]|\z)")
    Assert-True $startupStatusMatch.Success "cannot read startup currentTask state"
    $programStatus = [regex]::Match($startupStatusMatch.Groups[1].Value, "(?m)^  status:\s*(\S+)\s*$").Groups[1].Value
    if ($programStatus -eq "in_progress") {
        Assert-True ($inProgressCount -eq 1) "WIP=1 violated while startup program is active"
    } elseif ($programStatus -in @("closed_local", "closed")) {
        Assert-True ($inProgressCount -eq 0) "closed startup must have WIP=0"
    } else {
        throw "invalid startup program status: $programStatus"
    }
}
if ($successorMode) {
    $historicalStartupTaskBlock = [regex]::Match($queueText, "(?ms)^  - id:\s*p1-p2-remediation-startup-package-v1-2026-07-15\s*\r?\n(.*?)(?=^  - id:|^standingAuthorization:|\z)").Groups[1].Value
    Assert-True ($historicalStartupTaskBlock -match "p1Implementation:\s*blocked_requires_new_goal_and_authorization") "historical P1 implementation boundary changed"
    Assert-True ($historicalStartupTaskBlock -match "p2Implementation:\s*blocked_until_p1_frozen_and_new_goal") "historical P2 implementation boundary changed"
    Write-Pass "state/queue are recoverable, WIP=1 holds, and the successor uses a separate authorization surface"
} else {
    Assert-True ($queueText -match "p1Implementation:\s*blocked_requires_new_goal_and_authorization") "P1 implementation must remain blocked"
    Assert-True ($queueText -match "p2Implementation:\s*blocked_until_p1_frozen_and_new_goal") "P2 implementation must remain blocked"
    Write-Pass "state/queue are recoverable, WIP policy holds, P1/P2 implementation remains unauthorized"
}

$allowedChangedFiles = @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    "docs/05-execution-logs/task-plans/2026-07-15-p1-p2-remediation-startup-package-v1.md",
    "docs/05-execution-logs/task-plans/2026-07-15-p1-remediation-serial-program.md",
    "docs/05-execution-logs/evidence/2026-07-15-p1-p2-remediation-startup-package-v1.md",
    "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-startup-package-v1.md",
    "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml",
    "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml",
    "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml",
    "scripts/agent-system/New-P1P2RemediationStartupArtifacts.ps1",
    "scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1"
)
$changedFiles = @(& git -C $RepositoryRoot diff --name-only $expectedMasterSha | ForEach-Object { $_.Replace("\", "/") })
$untrackedFiles = @(& git -C $RepositoryRoot ls-files --others --exclude-standard | ForEach-Object { $_.Replace("\", "/") })
$allChangedFiles = @($changedFiles + $untrackedFiles | Sort-Object -Unique)
if ($successorMode) {
    $immutableStartupFiles = @(
        "docs/05-execution-logs/task-plans/2026-07-15-p1-p2-remediation-startup-package-v1.md",
        "docs/05-execution-logs/task-plans/2026-07-15-p1-remediation-serial-program.md",
        "docs/05-execution-logs/evidence/2026-07-15-p1-p2-remediation-startup-package-v1.md",
        "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-startup-package-v1.md",
        "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml",
        "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml",
        "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml",
        "scripts/agent-system/New-P1P2RemediationStartupArtifacts.ps1"
    )
    $successorChangedFiles = @(
        @(& git -C $RepositoryRoot diff --name-only $successorBaselineSha | ForEach-Object { $_.Replace("\", "/") }) +
        $untrackedFiles |
            Sort-Object -Unique
    )
    $changedFrozenStartupFiles = @($successorChangedFiles | Where-Object { $_ -in $immutableStartupFiles })
    Assert-True ($changedFrozenStartupFiles.Count -eq 0) "immutable startup artifacts changed under successor Program: $($changedFrozenStartupFiles -join ', ')"
    Write-Pass "closed startup artifacts remain immutable under the P1 successor Program"
} else {
    $unexpectedFiles = @($allChangedFiles | Where-Object { $_ -notin $allowedChangedFiles })
    Assert-True ($unexpectedFiles.Count -eq 0) "unexpected files outside startup allowlist: $($unexpectedFiles -join ', ')"
    Write-Pass "change surface is limited to startup governance artifacts"
}

if ($successorMode) {
    $frozenStartupHashes = @{
        $ledgerPath = "47C87F1D47C78853C166B0271F031E88E3BD02C02E3991BAD1DB2C28F231739B"
        $mapPath = "A6B6207551C31816C0B4308F1CD19318ECF03FD9EB243C762041ECE776A3BF59"
        $clusterPath = "9EAEC9396FA0F5BFFF5A8DF34B50A4329DB4AB6821F78AC8815985EF8BE085CB"
    }
    foreach ($path in $frozenStartupHashes.Keys) {
        Assert-True ((Get-FileSha256 -Path $path) -eq $frozenStartupHashes[$path]) "frozen startup artifact hash drift: $path"
    }
    Write-Pass "ledger/map/cluster hashes remain frozen without executing a writer"
} else {
    $beforeHashes = @{}
    foreach ($path in @($ledgerPath, $mapPath, $clusterPath)) { $beforeHashes[$path] = Get-FileSha256 -Path $path }
    & pwsh.exe -NoProfile -File $generatorPath -RepositoryRoot $RepositoryRoot -AuditRepositoryRoot $AuditRepositoryRoot *> $null
    Assert-True ($LASTEXITCODE -eq 0) "generator rerun failed"
    foreach ($path in @($ledgerPath, $mapPath, $clusterPath)) {
        $afterHash = Get-FileSha256 -Path $path
        Assert-True ($afterHash -eq $beforeHashes[$path]) "generator is not deterministic: $path"
    }
    Write-Pass "ledger/map/cluster generation is deterministic"
}

Write-Output "PASS P1/P2 remediation startup package v1.0 validation completed"
Write-Output "SUMMARY P1=125 P2=18 total=143 impact=96/35/10/2 F-0013=runtime_hold clusters=13 cycle=0"
