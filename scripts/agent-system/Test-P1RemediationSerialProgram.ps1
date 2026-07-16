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
        [Environment]::SetEnvironmentVariable($name, $null, [EnvironmentVariableTarget]::Process)
    }
    try {
        $output = @(& git --no-optional-locks -C $Root @GitArguments)
        $exitCode = $LASTEXITCODE
    } finally {
        foreach ($name in $localEnvironmentNames) {
            $value = if ($savedEnvironment.ContainsKey($name)) { $savedEnvironment[$name] } else { $null }
            [Environment]::SetEnvironmentVariable($name, $value, [EnvironmentVariableTarget]::Process)
        }
    }
    return [pscustomobject]@{ ExitCode = $exitCode; Output = $output }
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)
    return $Path.Replace("\", "/").TrimStart(".", "/")
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

function Get-NormalizedCloseoutProjection {
    param(
        [Parameter(Mandatory = $true)][string[]]$Lines,
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
if ($isSteadyTask -and $scopeControlChanged -and -not $isSameTaskCloseoutTransition) {
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
if ($taskBlock.Count -gt 0) {
    $currentTaskGovernancePathList = [System.Collections.Generic.List[string]]::new()
    foreach ($scopeControlPath in $effectiveScopeControlPaths) { $currentTaskGovernancePathList.Add($scopeControlPath) }
    foreach ($governancePathKey in @("planPath", "evidencePath", "auditReviewPath", "freshApprovalSource")) {
        $governancePath = Get-ScalarValue -Block $taskBlock -Key $governancePathKey
        if (-not [string]::IsNullOrWhiteSpace($governancePath)) { $currentTaskGovernancePathList.Add((ConvertTo-NormalizedPath -Path $governancePath)) }
    }
    $currentTaskGovernancePaths = @($currentTaskGovernancePathList.ToArray())
    $protectedImplementationChanged = @($normalizedFilesToCheck | Where-Object { $_ -notin $currentTaskGovernancePaths }).Count -gt 0
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
    if ($Phase -eq "pre_commit" -and -not $SkipGitChecks) {
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

    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
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
    if ($scopeControlChanged -and $protectedImplementationChanged -and (-not $isBootstrapInitialization -or $SkipGitChecks) -and -not $isSameTaskCloseoutTransition) {
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
        $effectiveBlockedFiles = @($globalBlockedPatterns + $blockedFiles + $(if ($taskKind -eq "mechanism_hardening") { @() } else { $programControlPatterns }) | Sort-Object -Unique)
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

Write-Output "p1ProgramGuardResult: $(if ($stateStatus -eq 'closed') { 'pass_closed_program' } else { 'pass' })"
Write-Output "programId: $expectedProgramId"
Write-Output "currentTaskId: $stateCurrentTaskId"
Write-Output "currentCandidateClusterId: $(Get-ScalarValue -Block $stateProgram -Key 'currentCandidateClusterId')"
Write-Output "materializedTaskCount: $($stateMaterialized.Count)"
Write-Output "findingCounts: P1=125 P2=18"
Write-Output "runtimeValidationCount: 21"
Write-Output "phase: $Phase"
