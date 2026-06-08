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
    [switch]$SkipScopeScan
)

$ErrorActionPreference = "Stop"

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

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)]
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

function ConvertTo-NormalizedPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $candidatePath = $Path.Replace("\", "/")
    return $candidatePath.TrimStart(".", "/")
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

    return $normalizedPath -like $normalizedPattern
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

    $apiKeyPattern = "(?i)\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*['""]?[^'""\s]{8,}"
    $authHeaderPattern = "(?i)\bAuthori" + "zation\s*:\s*Bearer\s+\S+"
    $databaseUrlPattern = "(?i)\b[a-z0-9_]*DATABASE_URL\s*=\s*\S+"
    $databaseConnectionPattern = "(?i)\bpostgres(?:ql)?://[^'""\s]+"
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
            if ($line -match $pattern.Pattern) {
                Add-Finding "HARD_BLOCK_SENSITIVE_EVIDENCE $DisplayPath`:$lineNumber $($pattern.Label)"
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

if ([string]::IsNullOrWhiteSpace($TaskId)) {
    $TaskId = Get-CurrentTaskId -Lines $projectStateLines
}

$taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
if ($taskBlock.Count -eq 0) {
    throw "Task not found in queue: $TaskId"
}

$allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
$blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
$filesToScan = @(Get-ChangedFiles -ExplicitFiles $ChangedFiles)

Write-Output "taskId: $TaskId"
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

Write-Section -Title "Scope Scan"
if ($SkipScopeScan) {
    Write-Output "scopeScan: skipped"
} elseif ($filesToScan.Count -eq 0) {
    Write-Output "scopeScan: no changed files"
} else {
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

Write-Output "pre-commit hardening passed"
