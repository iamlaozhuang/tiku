param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("pre_commit", "pre_push", "closeout")]
    [string]$Phase,

    [Parameter(Mandatory = $false)]
    [string]$RepositoryRoot = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ContractPath = "docs/04-agent-system/state/task-safety.json",

    [Parameter(Mandatory = $false)]
    [string]$PushRemoteName = "",

    [Parameter(Mandatory = $false)]
    [string]$PushRemoteUrl = "",

    [Parameter(Mandatory = $false)]
    [string[]]$PushUpdateLines = @()
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $false)][switch]$AllowFailure
    )

    $output = @(& git --no-optional-locks -C $script:repositoryRoot @Arguments 2>&1)
    $exitCode = $LASTEXITCODE
    if (-not $AllowFailure -and $exitCode -ne 0) {
        throw "GIT_COMMAND_FAILED: git $($Arguments -join ' ')`n$($output -join [Environment]::NewLine)"
    }
    return [pscustomobject]@{ Output = $output; ExitCode = $exitCode }
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $normalizedPath = $Path -replace "\\", "/"
    if ($normalizedPath.StartsWith("./", [System.StringComparison]::Ordinal)) {
        $normalizedPath = $normalizedPath.Substring(2)
    }
    $pathSegments = @($normalizedPath.Split("/"))
    if ([string]::IsNullOrWhiteSpace($normalizedPath) `
        -or $normalizedPath.StartsWith("/", [System.StringComparison]::Ordinal) `
        -or $normalizedPath -match '^[A-Za-z]:' `
        -or @($pathSegments | Where-Object { $_ -in @("", ".", "..") }).Count -gt 0) {
        throw "CONTRACT_PATH_INVALID: $Path"
    }
    return $normalizedPath
}

function Get-StringValues {
    param(
        [Parameter(Mandatory = $true)][object]$Value,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $values = @($Value)
    if ($values.Count -eq 0) {
        throw "CONTRACT_INVALID: $Label must not be empty"
    }
    $result = [System.Collections.Generic.List[string]]::new()
    foreach ($item in $values) {
        if ($item -isnot [string] -or [string]::IsNullOrWhiteSpace($item)) {
            throw "CONTRACT_INVALID: $Label contains a non-string or empty value"
        }
        $result.Add([string]$item)
    }
    return @($result)
}

function Test-PathMatches {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if ($Path -match $pattern) {
            return $true
        }
    }
    return $false
}

function Get-ChangedFiles {
    $staged = @((Invoke-Git -Arguments @("diff", "--cached", "--name-only", "--diff-filter=ACMRTD")).Output)
    $unstaged = @((Invoke-Git -Arguments @("diff", "--name-only", "--diff-filter=ACMRTD")).Output)
    $untracked = @((Invoke-Git -Arguments @("ls-files", "--others", "--exclude-standard")).Output)

    if ($unstaged.Count -gt 0 -or $untracked.Count -gt 0) {
        $dirtyFiles = @($unstaged + $untracked | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
        throw "WORKTREE_NOT_FULLY_STAGED: $($dirtyFiles -join ', ')"
    }
    if ($staged.Count -eq 0) {
        throw "EMPTY_TASK_DIFF"
    }
    return @($staged | ForEach-Object { ConvertTo-NormalizedPath -Path $_ } | Sort-Object -Unique)
}

function Get-StagedTreeIdentity {
    return ((Invoke-Git -Arguments @("write-tree")).Output -join "").Trim().ToLowerInvariant()
}

function Get-CandidateSnapshot {
    return [pscustomobject]@{
        Head = ((Invoke-Git -Arguments @("rev-parse", "HEAD")).Output -join "").Trim().ToLowerInvariant()
        StagedTree = Get-StagedTreeIdentity
        NameStatus = @((Invoke-Git -Arguments @("diff", "--cached", "--name-status", "--no-renames")).Output) -join "`n"
        WorktreeStatus = @((Invoke-Git -Arguments @("status", "--porcelain=v1", "--untracked-files=all")).Output) -join "`n"
    }
}

function Test-CandidateUnchanged {
    param(
        [Parameter(Mandatory = $true)][object]$BeforeSnapshot,
        [Parameter(Mandatory = $true)][string[]]$BeforeChangedFiles
    )

    try {
        $afterChangedFiles = @(Get-ChangedFiles)
        $afterSnapshot = Get-CandidateSnapshot
    } catch {
        throw "VALIDATION_MUTATED_CANDIDATE: $($_.Exception.Message)"
    }
    $changedFileIdentityBefore = @($BeforeChangedFiles | Sort-Object) -join "`n"
    $changedFileIdentityAfter = @($afterChangedFiles | Sort-Object) -join "`n"
    if ($BeforeSnapshot.Head -cne $afterSnapshot.Head `
        -or $BeforeSnapshot.StagedTree -cne $afterSnapshot.StagedTree `
        -or $BeforeSnapshot.NameStatus -cne $afterSnapshot.NameStatus `
        -or $BeforeSnapshot.WorktreeStatus -cne $afterSnapshot.WorktreeStatus `
        -or $changedFileIdentityBefore -cne $changedFileIdentityAfter) {
        throw "VALIDATION_MUTATED_CANDIDATE"
    }
}

function Test-TaskScope {
    param(
        [Parameter(Mandatory = $true)][string[]]$ChangedFiles,
        [Parameter(Mandatory = $true)][string[]]$AllowedFiles
    )

    $allowedSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
    foreach ($allowedFile in $AllowedFiles) {
        $normalizedAllowedFile = ConvertTo-NormalizedPath -Path $allowedFile
        if (-not $allowedSet.Add($normalizedAllowedFile)) {
            throw "CONTRACT_INVALID: duplicate allowed file $normalizedAllowedFile"
        }
    }

    foreach ($changedFile in $ChangedFiles) {
        if (-not $allowedSet.Contains($changedFile)) {
            throw "SCOPE_VIOLATION: $changedFile"
        }
    }
}

function Test-HighRiskApprovals {
    param(
        [Parameter(Mandatory = $true)][string[]]$ChangedFiles,
        [Parameter(Mandatory = $true)][object]$ApprovalSources,
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$CandidateTree
    )

    $riskPatterns = [ordered]@{
        dependency = @(
            '(^|/)package\.json$', '(^|/)(?:package-lock|pnpm-lock|yarn\.lock)', '(^|/)pnpm-workspace\.yaml$'
        )
        database = @(
            '^src/db/', '^drizzle/', '^migrations/', '^seed/', '^scripts/db/'
        )
        permission = @(
            '^src/.*/(?:auth|authorization|permission|rbac|role)(?:/|[-_.])',
            '^src/.*(?:auth|authorization|permission|rbac|role).*\.(?:ts|tsx|js|jsx)$'
        )
        deployment = @(
            '^\.github/workflows/', '(^|/)Dockerfile$', '(^|/)docker-compose.*\.ya?ml$',
            '(^|/)(?:render|vercel)\.json$', '^scripts/deploy/', '^infrastructure/'
        )
        secretEnv = @(
            '(^|/)\.env(?:\.|$)', '(^|/)(?:secret|secrets)(?:/|[-_.])'
        )
    }

    foreach ($riskName in $riskPatterns.Keys) {
        $affected = @($ChangedFiles | Where-Object { Test-PathMatches -Path $_ -Patterns $riskPatterns[$riskName] })
        if ($affected.Count -eq 0) {
            continue
        }
        $approvalProperty = $ApprovalSources.PSObject.Properties[$riskName]
        $approvalSource = if ($null -eq $approvalProperty) { "" } else { [string]$approvalProperty.Value }
        if ([string]::IsNullOrWhiteSpace($approvalSource)) {
            throw "HIGH_RISK_APPROVAL_REQUIRED: $riskName ($($affected -join ', '))"
        }
        if ([string]::IsNullOrWhiteSpace($env:TIKU_HIGH_RISK_APPROVALS)) {
            throw "HIGH_RISK_APPROVAL_EXTERNAL_REQUIRED: $riskName"
        }
        try {
            $approvalTokens = @($env:TIKU_HIGH_RISK_APPROVALS | ConvertFrom-Json)
        } catch {
            throw "HIGH_RISK_APPROVAL_INVALID: $riskName"
        }
        $matchingTokens = @($approvalTokens | Where-Object {
            [string]$_.approvalId -ceq $approvalSource `
                -and [string]$_.taskId -ceq $TaskId `
                -and [string]$_.risk -ceq $riskName `
                -and ([string]$_.candidateTree).ToLowerInvariant() -ceq $CandidateTree
        })
        if ($matchingTokens.Count -ne 1) {
            throw "HIGH_RISK_APPROVAL_INVALID: $riskName"
        }
    }
}

function Test-ValidationKindMatches {
    param(
        [Parameter(Mandatory = $true)][string]$Executable,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$Kind
    )

    if ($Kind -eq "other") {
        return $true
    }

    $normalizedExecutable = $Executable.ToLowerInvariant()
    $normalizedArguments = @($Arguments | ForEach-Object { $_.ToLowerInvariant() })
    switch -Regex ($normalizedExecutable) {
        '^npm\.cmd$' {
            $scriptName = if ($normalizedArguments.Count -ge 2) { $normalizedArguments[1] } else { "" }
            break
        }
        '^corepack\.cmd$' {
            if ($normalizedArguments.Count -lt 3) {
                return $false
            }
            if ($normalizedArguments[1] -eq "exec") {
                $toolKinds = @{ vitest = "test"; prettier = "lint"; eslint = "lint"; tsc = "typecheck" }
                return $toolKinds[$normalizedArguments[2]] -eq $Kind
            }
            $scriptName = $normalizedArguments[2]
            break
        }
        '^(?:powershell|pwsh)\.exe$' { return $Kind -eq "test" }
        default { return $false }
    }

    switch ($Kind) {
        "test" { return $scriptName -match '(^|[:_-])test($|[:_-])' }
        "lint" { return $scriptName -match '(^|[:_-])lint($|[:_-])' }
        "typecheck" { return $scriptName -match '(^|[:_-])type-?check($|[:_-])' }
        default { return $false }
    }
}

function Invoke-ValidationCommands {
    param(
        [Parameter(Mandatory = $true)][object[]]$Commands,
        [Parameter(Mandatory = $true)][string[]]$ChangedFiles
    )

    if ($Commands.Count -eq 0) {
        throw "CONTRACT_INVALID: validationCommands must not be empty"
    }

    $allowedExecutables = @("powershell.exe", "pwsh.exe", "npm.cmd", "corepack.cmd", "git.exe", "git")
    $commandKinds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($command in $Commands) {
        $name = [string]$command.name
        $kind = [string]$command.kind
        $executable = [string]$command.executable
        if ([string]::IsNullOrWhiteSpace($name) -or $kind -notin @("test", "lint", "typecheck", "other")) {
            throw "CONTRACT_INVALID: validation command name/kind"
        }
        if ($executable -notin $allowedExecutables) {
            throw "CONTRACT_INVALID: validation executable is not allowed: $executable"
        }
        $arguments = @($command.arguments)
        foreach ($argument in $arguments) {
            if ($argument -isnot [string] -or ([string]$argument).Contains([char]0)) {
                throw "CONTRACT_INVALID: validation command arguments must be strings without NUL"
            }
        }
        $normalizedExecutable = $executable.ToLowerInvariant()
        $normalizedArguments = @($arguments | ForEach-Object { ([string]$_).ToLowerInvariant() })
        $unsafe = $false
        switch -Regex ($normalizedExecutable) {
            '^npm\.cmd$' {
                $unsafe = $normalizedArguments.Count -lt 2 -or $normalizedArguments[0] -ne "run"
                break
            }
            '^corepack\.cmd$' {
                $unsafe = $normalizedArguments.Count -lt 3 `
                    -or $normalizedArguments[0] -notmatch '^pnpm@\d+\.\d+\.\d+$' `
                    -or $normalizedArguments[1] -notin @("run", "exec") `
                    -or @($normalizedArguments | Where-Object { $_ -in @("add", "install", "remove", "update", "dlx") }).Count -gt 0 `
                    -or ($normalizedArguments[1] -eq "exec" -and $normalizedArguments[2] -notin @("vitest", "prettier", "eslint", "tsc"))
                break
            }
            '^git(?:\.exe)?$' {
                $unsafe = $normalizedArguments.Count -eq 0 -or $normalizedArguments[0] -notin @(
                    "diff", "status", "rev-parse", "merge-base", "ls-files", "show", "log"
                )
                break
            }
            '^(?:powershell|pwsh)\.exe$' {
                $fileArgumentIndex = [array]::IndexOf($normalizedArguments, "-file")
                $unsafe = $fileArgumentIndex -lt 0 `
                    -or ($fileArgumentIndex + 1) -ge $arguments.Count `
                    -or @($normalizedArguments | Where-Object { $_ -in @("-command", "-c", "-encodedcommand", "-enc") }).Count -gt 0
                if (-not $unsafe) {
                    $scriptArgument = [string]$arguments[$fileArgumentIndex + 1]
                    $scriptCandidate = if ([System.IO.Path]::IsPathRooted($scriptArgument)) {
                        $scriptArgument
                    } else {
                        Join-Path $script:repositoryRoot $scriptArgument
                    }
                    try {
                        $validationScriptPath = (Resolve-Path -LiteralPath $scriptCandidate).Path
                        $repositoryPrefix = $script:repositoryRoot.TrimEnd("\", "/") + [System.IO.Path]::DirectorySeparatorChar
                        $unsafe = -not $validationScriptPath.StartsWith($repositoryPrefix, [System.StringComparison]::OrdinalIgnoreCase) `
                            -or [System.IO.Path]::GetFileName($validationScriptPath) -notmatch '^Test-.*\.ps1$'
                    } catch {
                        $unsafe = $true
                    }
                }
                break
            }
            default { $unsafe = $true }
        }
        if ($unsafe) {
            throw "VALIDATION_COMMAND_UNSAFE: $name"
        }
        if (-not (Test-ValidationKindMatches -Executable $executable -Arguments @($arguments) -Kind $kind)) {
            throw "VALIDATION_KIND_MISMATCH: $name kind=$kind"
        }
        [void]$commandKinds.Add($kind)
        Write-Output "validation: $name"
        $priorErrorActionPreference = $ErrorActionPreference
        Push-Location $script:repositoryRoot
        try {
            $ErrorActionPreference = "Continue"
            $validationOutput = @(& $executable @arguments 2>&1)
            $validationExitCode = $LASTEXITCODE
        } finally {
            $ErrorActionPreference = $priorErrorActionPreference
            Pop-Location
        }
        $validationOutput | ForEach-Object { Write-Output $_ }
        if ($validationExitCode -ne 0) {
            throw "VALIDATION_FAILED: $name exit=$validationExitCode"
        }
    }

    $productSourceChanged = @($ChangedFiles | Where-Object { $_ -match '^src/.*\.(?:ts|tsx|js|jsx)$' }).Count -gt 0
    $productTestChanged = @($ChangedFiles | Where-Object { $_ -match '^(?:tests|e2e)/' }).Count -gt 0
    $missingKinds = [System.Collections.Generic.List[string]]::new()
    if ($productSourceChanged) {
        foreach ($requiredKind in @("test", "lint", "typecheck")) {
            if (-not $commandKinds.Contains($requiredKind)) {
                $missingKinds.Add($requiredKind)
            }
        }
    } elseif ($productTestChanged -and -not $commandKinds.Contains("test")) {
        $missingKinds.Add("test")
    }
    if ($missingKinds.Count -gt 0) {
        throw "PRODUCT_GATE_MISSING: $($missingKinds -join ', ')"
    }
}

function Test-PreCommit {
    param([Parameter(Mandatory = $true)][object]$Contract)

    $branch = ((Invoke-Git -Arguments @("branch", "--show-current")).Output -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($branch) -or $branch -in @("master", "main")) {
        throw "PROTECTED_BRANCH: $branch"
    }

    $changedFiles = @(Get-ChangedFiles)
    $allowedFiles = @(Get-StringValues -Value $Contract.allowedFiles -Label "allowedFiles")
    Test-TaskScope -ChangedFiles $changedFiles -AllowedFiles $allowedFiles
    $candidateSnapshot = Get-CandidateSnapshot
    Test-HighRiskApprovals -ChangedFiles $changedFiles -ApprovalSources $Contract.approvalSources -TaskId ([string]$Contract.taskId) -CandidateTree $candidateSnapshot.StagedTree

    $diffCheck = Invoke-Git -Arguments @("diff", "--cached", "--check") -AllowFailure
    if ($diffCheck.ExitCode -ne 0) {
        throw "DIFF_CHECK_FAILED: $($diffCheck.Output -join [Environment]::NewLine)"
    }

    Invoke-ValidationCommands -Commands @($Contract.validationCommands) -ChangedFiles $changedFiles
    Test-CandidateUnchanged -BeforeSnapshot $candidateSnapshot -BeforeChangedFiles $changedFiles
}

function ConvertTo-NormalizedRemoteUrl {
    param([Parameter(Mandatory = $true)][string]$Url)

    $trimmedUrl = $Url.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmedUrl)) {
        throw "PUSH_REMOTE_URL_INVALID"
    }
    if ([System.IO.Path]::IsPathRooted($trimmedUrl)) {
        return "file:" + [System.IO.Path]::GetFullPath($trimmedUrl).TrimEnd("\", "/").ToLowerInvariant()
    }
    $absoluteUri = $null
    if ([System.Uri]::TryCreate($trimmedUrl, [System.UriKind]::Absolute, [ref]$absoluteUri)) {
        if ($absoluteUri.IsFile) {
            return "file:" + [System.IO.Path]::GetFullPath($absoluteUri.LocalPath).TrimEnd("\", "/").ToLowerInvariant()
        }
        if ($absoluteUri.Scheme -notin @("http", "https", "ssh", "git") `
            -or -not [string]::IsNullOrEmpty($absoluteUri.Query) `
            -or -not [string]::IsNullOrEmpty($absoluteUri.Fragment)) {
            throw "PUSH_REMOTE_URL_INVALID"
        }
        $remoteHost = $absoluteUri.IdnHost.ToLowerInvariant()
        if (-not $absoluteUri.IsDefaultPort) {
            $remoteHost += ":$($absoluteUri.Port)"
        }
        $remotePath = $absoluteUri.AbsolutePath.Trim("/") -replace '\.git$', ''
        return "$($absoluteUri.Scheme.ToLowerInvariant()):$remoteHost/$remotePath"
    }
    if ($trimmedUrl -match '^(?:[^@/]+@)?(?<host>[^:/]+):(?<path>.+)$') {
        $remotePath = $Matches.path.Trim("/") -replace '\.git$', ''
        return "ssh:$($Matches.host.ToLowerInvariant())/$remotePath"
    }
    $localRemotePath = Join-Path $script:repositoryRoot $trimmedUrl
    return "file:" + [System.IO.Path]::GetFullPath($localRemotePath).TrimEnd("\", "/").ToLowerInvariant()
}

function Test-PrePush {
    param([Parameter(Mandatory = $true)][object]$Contract)

    if ($env:TIKU_PUSH_APPROVED -ne "1") {
        throw "PUSH_APPROVAL_REQUIRED"
    }
    if ($PushRemoteName -ne "origin" -or [string]$Contract.push.target -ne "origin/master") {
        throw "PUSH_TARGET_INVALID: remote=$PushRemoteName target=$($Contract.push.target)"
    }
    $canonicalOriginResult = Invoke-Git -Arguments @("config", "--local", "--get", "tiku.canonicalOriginUrl") -AllowFailure
    $configuredOriginResult = Invoke-Git -Arguments @("remote", "get-url", "origin") -AllowFailure
    if ($canonicalOriginResult.ExitCode -ne 0 -or $configuredOriginResult.ExitCode -ne 0) {
        throw "PUSH_CANONICAL_ORIGIN_MISSING"
    }
    $canonicalOrigin = ConvertTo-NormalizedRemoteUrl -Url (($canonicalOriginResult.Output -join "").Trim())
    $configuredOrigin = ConvertTo-NormalizedRemoteUrl -Url (($configuredOriginResult.Output -join "").Trim())
    $hookOrigin = ConvertTo-NormalizedRemoteUrl -Url $PushRemoteUrl
    if ($canonicalOrigin -cne $configuredOrigin -or $canonicalOrigin -cne $hookOrigin) {
        throw "PUSH_REMOTE_URL_INVALID"
    }
    $branch = ((Invoke-Git -Arguments @("branch", "--show-current")).Output -join "").Trim()
    if ($branch -ne "master") {
        throw "PUSH_BRANCH_INVALID: $branch"
    }
    $status = @((Invoke-Git -Arguments @("status", "--porcelain")).Output)
    if ($status.Count -gt 0) {
        throw "PRE_PUSH_WORKTREE_NOT_CLEAN"
    }

    $originSha = ((Invoke-Git -Arguments @("rev-parse", "origin/master")).Output -join "").Trim()
    $headSha = ((Invoke-Git -Arguments @("rev-parse", "HEAD")).Output -join "").Trim()
    $ancestor = Invoke-Git -Arguments @("merge-base", "--is-ancestor", $originSha, $headSha) -AllowFailure
    if ($ancestor.ExitCode -ne 0) {
        throw "NON_FAST_FORWARD_PUSH"
    }
    $commitCount = [int](((Invoke-Git -Arguments @("rev-list", "--count", "origin/master..HEAD")).Output -join "").Trim())
    if ($commitCount -ne 1) {
        throw "TASK_COMMIT_COUNT_INVALID: $commitCount"
    }

    $normalizedPushUpdateLines = @(
        $PushUpdateLines |
            ForEach-Object { $_ -split "`r?`n" } |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    )
    if ($normalizedPushUpdateLines.Count -ne 1) {
        throw "PUSH_UPDATE_INVALID: expected exactly one update"
    }
    $pushUpdateLine = $normalizedPushUpdateLines[0].Trim()
    $fields = @($pushUpdateLine -split '\s+')
    if ($fields.Count -ne 4 `
        -or $fields[0] -cne "refs/heads/master" `
        -or $fields[2] -cne "refs/heads/master" `
        -or $fields[1].ToLowerInvariant() -cne $headSha.ToLowerInvariant() `
        -or $fields[3].ToLowerInvariant() -cne $originSha.ToLowerInvariant()) {
        throw "PUSH_UPDATE_INVALID: $pushUpdateLine"
    }
}

function Test-Closeout {
    $branch = ((Invoke-Git -Arguments @("branch", "--show-current")).Output -join "").Trim()
    if ($branch -ne "master") {
        throw "CLOSEOUT_BRANCH_INVALID: $branch"
    }
    if (@((Invoke-Git -Arguments @("status", "--porcelain")).Output).Count -gt 0) {
        throw "CLOSEOUT_WORKTREE_NOT_CLEAN"
    }
    $masterSha = ((Invoke-Git -Arguments @("rev-parse", "master")).Output -join "").Trim()
    $originSha = ((Invoke-Git -Arguments @("rev-parse", "origin/master")).Output -join "").Trim()
    if ($masterSha -ne $originSha) {
        throw "REMOTE_NOT_SYNCHRONIZED: master=$masterSha origin/master=$originSha"
    }
    $worktreeCount = @((Invoke-Git -Arguments @("worktree", "list", "--porcelain")).Output | Where-Object { $_ -match '^worktree\s+' }).Count
    if ($worktreeCount -ne 1) {
        throw "RESIDUAL_WORKTREE: count=$worktreeCount"
    }
    $shortBranches = @((Invoke-Git -Arguments @("for-each-ref", "--format=%(refname:short)", "refs/heads/codex/", "refs/heads/feat/", "refs/heads/fix/")).Output)
    if ($shortBranches.Count -gt 0) {
        throw "RESIDUAL_SHORT_BRANCH: $($shortBranches -join ', ')"
    }
}

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}
$script:repositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$contractFullPath = if ([System.IO.Path]::IsPathRooted($ContractPath)) {
    $ContractPath
} else {
    Join-Path $script:repositoryRoot ($ContractPath -replace "/", "\")
}
if (-not (Test-Path -LiteralPath $contractFullPath -PathType Leaf)) {
    throw "CONTRACT_MISSING: $contractFullPath"
}

$contract = Get-Content -LiteralPath $contractFullPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($contract.schemaVersion -ne 1 -or [string]::IsNullOrWhiteSpace([string]$contract.taskId) -or [string]::IsNullOrWhiteSpace([string]$contract.objective)) {
    throw "CONTRACT_INVALID: schemaVersion, taskId and objective are required"
}

switch ($Phase) {
    "pre_commit" { Test-PreCommit -Contract $contract }
    "pre_push" { Test-PrePush -Contract $contract }
    "closeout" { Test-Closeout }
}

Write-Output "minimal safety kernel passed: phase=$Phase taskId=$($contract.taskId)"
