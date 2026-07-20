param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("focused", "full")]
    [string]$Profile = "focused",

    [Parameter(Mandatory = $false)]
    [ValidateSet("all", "candidate_mutation", "path_boundary", "external_approval", "push_binding")]
    [string]$ReviewCase = "all"
)

$ErrorActionPreference = "Stop"
$kernelPath = Join-Path $PSScriptRoot "Test-MinimalSafetyKernel.ps1"
$gitLocalEnvironment = [ordered]@{}

if (-not (Test-Path -LiteralPath $kernelPath -PathType Leaf)) {
    throw "CHARACTERIZATION_RED: minimal safety kernel is missing: $kernelPath"
}

# Git hooks export repository-local variables such as GIT_DIR and GIT_INDEX_FILE.
# Fixture repositories must never inherit them, or `git -C <fixture>` can still
# address the caller's repository and mutate its config/index.
$gitLocalEnvironmentNames = @(& git rev-parse --local-env-vars 2>$null)
foreach ($environmentName in $gitLocalEnvironmentNames) {
    $environmentValue = [Environment]::GetEnvironmentVariable($environmentName, "Process")
    if ($null -ne $environmentValue) {
        $gitLocalEnvironment[$environmentName] = $environmentValue
        [Environment]::SetEnvironmentVariable($environmentName, $null, "Process")
    }
}

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $priorErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& git -C $RepositoryRoot @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $priorErrorActionPreference
    }
    if ($exitCode -ne 0) {
        throw "Git failed in $RepositoryRoot`: git $($Arguments -join ' ')`n$($output -join [Environment]::NewLine)"
    }
    return $output
}

function New-TaskContract {
    param(
        [Parameter(Mandatory = $true)][string[]]$AllowedFiles,
        [Parameter(Mandatory = $false)][object[]]$ValidationCommands = @(),
        [Parameter(Mandatory = $false)][hashtable]$Approvals = @{}
    )

    $approvalValues = [ordered]@{
        governance = $null
        dependency = $null
        database = $null
        permission = $null
        deployment = $null
        secretEnv = $null
    }
    foreach ($approvalKey in $Approvals.Keys) {
        $approvalValues[$approvalKey] = $Approvals[$approvalKey]
    }

    return [ordered]@{
        schemaVersion = 1
        taskId = "smoke-task"
        objective = "characterize the generic minimum safety invariants"
        allowedFiles = @($AllowedFiles)
        validationCommands = @($ValidationCommands)
        approvalSources = $approvalValues
        push = [ordered]@{
            target = "origin/master"
            requiresFreshApproval = $true
        }
    }
}

function New-ValidationCommand {
    param(
        [Parameter(Mandatory = $true)][ValidateSet("test", "lint", "typecheck", "other")][string]$Kind,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    $arguments = if ($ExitCode -eq 0) {
        @("status", "--porcelain")
    } else {
        @("diff", "--quiet", "--cached")
    }
    return [ordered]@{
        name = "$Kind-smoke"
        kind = $Kind
        executable = "git.exe"
        arguments = $arguments
    }
}

function New-PowerShellTestCommand {
    return [ordered]@{
        name = "fixture-test"
        kind = "test"
        executable = "powershell.exe"
        arguments = @("-NoProfile", "-File", "./Test-Smoke.ps1")
    }
}

function New-ProductValidationCommands {
    return @(
        [ordered]@{ name = "product-test"; kind = "test"; executable = "npm.cmd"; arguments = @("run", "test") },
        [ordered]@{ name = "product-lint"; kind = "lint"; executable = "npm.cmd"; arguments = @("run", "lint") },
        [ordered]@{ name = "product-typecheck"; kind = "typecheck"; executable = "npm.cmd"; arguments = @("run", "typecheck") }
    )
}

function New-SmokeRepository {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][object]$Contract,
        [Parameter(Mandatory = $false)][string]$InitialBranch = "codex/smoke"
    )

    $repositoryRoot = Join-Path $script:smokeRoot $Name
    New-Item -ItemType Directory -Path $repositoryRoot | Out-Null
    Invoke-Git -RepositoryRoot $repositoryRoot -Arguments @("init", "-b", $InitialBranch) | Out-Null
    Invoke-Git -RepositoryRoot $repositoryRoot -Arguments @("config", "user.name", "Minimal Kernel Smoke") | Out-Null
    Invoke-Git -RepositoryRoot $repositoryRoot -Arguments @("config", "user.email", "minimal-kernel-smoke@example.invalid") | Out-Null
    Invoke-Git -RepositoryRoot $repositoryRoot -Arguments @("config", "core.autocrlf", "false") | Out-Null
    $Contract | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $repositoryRoot "task-safety.json") -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $repositoryRoot "allowed.txt") -Value "baseline" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $repositoryRoot "Test-Smoke.ps1") -Value 'Write-Output "fixture test passed"' -Encoding UTF8
    [System.IO.File]::WriteAllText(
        (Join-Path $repositoryRoot "package.json"),
        '{"private":true,"scripts":{"test":"git status --porcelain","lint":"git status --porcelain","typecheck":"git status --porcelain"}}' + "`n",
        [System.Text.UTF8Encoding]::new($false)
    )
    Invoke-Git -RepositoryRoot $repositoryRoot -Arguments @("add", ".") | Out-Null
    Invoke-Git -RepositoryRoot $repositoryRoot -Arguments @("commit", "-m", "chore: seed smoke repository") | Out-Null
    return $repositoryRoot
}

function Set-FixtureValidationScript {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Content
    )

    [System.IO.File]::WriteAllText(
        (Join-Path $RepositoryRoot "Test-Smoke.ps1"),
        $Content + "`n",
        [System.Text.UTF8Encoding]::new($false)
    )
    Invoke-Git -RepositoryRoot $RepositoryRoot -Arguments @("add", "--", "Test-Smoke.ps1") | Out-Null
    Invoke-Git -RepositoryRoot $RepositoryRoot -Arguments @("commit", "-m", "test: configure validation fixture") | Out-Null
}

function Set-StagedFile {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $false)][string]$Content = "changed"
    )

    $fullPath = Join-Path $RepositoryRoot ($Path -replace "/", "\")
    $parentPath = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $parentPath)) {
        New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($fullPath, "$Content`n", [System.Text.UTF8Encoding]::new($false))
    Invoke-Git -RepositoryRoot $RepositoryRoot -Arguments @("add", "--", $Path) | Out-Null
}

function Invoke-Kernel {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push", "closeout")][string]$Phase,
        [Parameter(Mandatory = $false)][string[]]$PushUpdateLines = @(),
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$PushRemoteUrl = ""
    )

    if ($Phase -eq "pre_push" -and [string]::IsNullOrWhiteSpace($PushRemoteUrl)) {
        $PushRemoteUrl = (Invoke-Git -RepositoryRoot $RepositoryRoot -Arguments @("remote", "get-url", "origin") | Select-Object -First 1).Trim()
    }
    return @(& $kernelPath -Phase $Phase -RepositoryRoot $RepositoryRoot -ContractPath "task-safety.json" -PushRemoteName "origin" -PushRemoteUrl $PushRemoteUrl -PushUpdateLines $PushUpdateLines 2>&1)
}

function Assert-Passes {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $false)][string]$Pattern = "minimal safety kernel passed"
    )

    try {
        $output = @(& $Command)
    } catch {
        throw "$Label unexpectedly failed: $($_.Exception.Message)"
    }
    if (($output -join [Environment]::NewLine) -notmatch $Pattern) {
        throw "$Label did not emit '$Pattern'. Output: $($output -join [Environment]::NewLine)"
    }
    $script:caseCount++
}

function Assert-FailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][scriptblock]$Command
    )

    $failed = $false
    $message = ""
    try {
        $output = @(& $Command)
        $message = $output -join [Environment]::NewLine
    } catch {
        $failed = $true
        $message = $_.Exception.Message
    }
    if (-not $failed) {
        throw "$Label unexpectedly passed. Output: $message"
    }
    if ($message -notmatch $Pattern) {
        throw "$Label failed with the wrong reason. Expected '$Pattern', got: $message"
    }
    $script:caseCount++
}

$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-minimal-kernel-" + [guid]::NewGuid().ToString("N"))
$closeoutRoot = $null
$residualPath = $null
$caseCount = 0

try {
    New-Item -ItemType Directory -Path $smokeRoot | Out-Null
    $passingContract = New-TaskContract -AllowedFiles @("allowed.txt") -ValidationCommands @(
        (New-ValidationCommand -Kind other -ExitCode 0)
    )

    if ($ReviewCase -in @("all", "candidate_mutation")) {
        $stagedSmugglingContract = New-TaskContract -AllowedFiles @("allowed.txt") -ValidationCommands @(
            (New-PowerShellTestCommand)
        )
        $stagedSmugglingRoot = New-SmokeRepository -Name "validation-stages-extra-file" -Contract $stagedSmugglingContract
        Set-FixtureValidationScript -RepositoryRoot $stagedSmugglingRoot -Content @'
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "smuggled.md"), "smuggled`n")
git add -- smuggled.md
'@
        Set-StagedFile -RepositoryRoot $stagedSmugglingRoot -Path "allowed.txt"
        Assert-FailsWith -Label "validation stages unauthorized file" -Pattern "VALIDATION_MUTATED_CANDIDATE" -Command {
            Invoke-Kernel -RepositoryRoot $stagedSmugglingRoot -Phase pre_commit
        }

        $stagedRewriteRoot = New-SmokeRepository -Name "validation-rewrites-staged-file" -Contract $stagedSmugglingContract
        Set-FixtureValidationScript -RepositoryRoot $stagedRewriteRoot -Content @'
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "allowed.txt"), "rewritten`n")
git add -- allowed.txt
'@
        Set-StagedFile -RepositoryRoot $stagedRewriteRoot -Path "allowed.txt"
        Assert-FailsWith -Label "validation rewrites allowed staged content" -Pattern "VALIDATION_MUTATED_CANDIDATE" -Command {
            Invoke-Kernel -RepositoryRoot $stagedRewriteRoot -Phase pre_commit
        }

        $untrackedMutationRoot = New-SmokeRepository -Name "validation-creates-untracked-file" -Contract $stagedSmugglingContract
        Set-FixtureValidationScript -RepositoryRoot $untrackedMutationRoot -Content @'
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "untracked.md"), "untracked`n")
'@
        Set-StagedFile -RepositoryRoot $untrackedMutationRoot -Path "allowed.txt"
        Assert-FailsWith -Label "validation creates untracked file" -Pattern "VALIDATION_MUTATED_CANDIDATE" -Command {
            Invoke-Kernel -RepositoryRoot $untrackedMutationRoot -Phase pre_commit
        }
    }

    if ($ReviewCase -in @("all", "path_boundary")) {
        $workflowContract = New-TaskContract -AllowedFiles @(".github/workflows/check.yml") -ValidationCommands @(
            (New-ValidationCommand -Kind other -ExitCode 0)
        )
        $workflowRoot = New-SmokeRepository -Name "leading-dot-workflow" -Contract $workflowContract
        Set-StagedFile -RepositoryRoot $workflowRoot -Path ".github/workflows/check.yml"
        Assert-FailsWith -Label "leading-dot workflow risk" -Pattern "HIGH_RISK_APPROVAL_REQUIRED.*deployment" -Command {
            Invoke-Kernel -RepositoryRoot $workflowRoot -Phase pre_commit
        }

        $envContract = New-TaskContract -AllowedFiles @(".env.local") -ValidationCommands @(
            (New-ValidationCommand -Kind other -ExitCode 0)
        )
        $envRoot = New-SmokeRepository -Name "leading-dot-env" -Contract $envContract
        Set-StagedFile -RepositoryRoot $envRoot -Path ".env.local"
        Assert-FailsWith -Label "leading-dot env risk" -Pattern "HIGH_RISK_APPROVAL_REQUIRED.*secretEnv" -Command {
            Invoke-Kernel -RepositoryRoot $envRoot -Phase pre_commit
        }

        $dotSlashContract = New-TaskContract -AllowedFiles @("./src/product.ts") -ValidationCommands @(New-ProductValidationCommands)
        $dotSlashRoot = New-SmokeRepository -Name "exact-dot-slash-prefix" -Contract $dotSlashContract
        Set-StagedFile -RepositoryRoot $dotSlashRoot -Path "src/product.ts"
        Assert-Passes -Label "exact dot-slash prefix" -Command {
            Invoke-Kernel -RepositoryRoot $dotSlashRoot -Phase pre_commit
        }

        $escapeContract = New-TaskContract -AllowedFiles @("../escape.txt") -ValidationCommands @(
            (New-ValidationCommand -Kind other -ExitCode 0)
        )
        $escapeRoot = New-SmokeRepository -Name "parent-path-escape" -Contract $escapeContract
        Set-StagedFile -RepositoryRoot $escapeRoot -Path "escape.txt"
        Assert-FailsWith -Label "parent path escape" -Pattern "CONTRACT_PATH_INVALID" -Command {
            Invoke-Kernel -RepositoryRoot $escapeRoot -Phase pre_commit
        }

        $absoluteContract = New-TaskContract -AllowedFiles @("C:/escape.txt") -ValidationCommands @(
            (New-ValidationCommand -Kind other -ExitCode 0)
        )
        $absoluteRoot = New-SmokeRepository -Name "absolute-path-escape" -Contract $absoluteContract
        Set-StagedFile -RepositoryRoot $absoluteRoot -Path "escape.txt"
        Assert-FailsWith -Label "absolute path escape" -Pattern "CONTRACT_PATH_INVALID" -Command {
            Invoke-Kernel -RepositoryRoot $absoluteRoot -Phase pre_commit
        }
    }

    if ($ReviewCase -in @("all", "external_approval")) {
        $declaredApprovalId = "approval-smoke-dependency"
        $selfDeclaredApprovalContract = New-TaskContract -AllowedFiles @("package.json") -ValidationCommands @(
            (New-ValidationCommand -Kind other -ExitCode 0)
        ) -Approvals @{ dependency = $declaredApprovalId }
        $selfDeclaredApprovalRoot = New-SmokeRepository -Name "self-declared-high-risk-approval" -Contract $selfDeclaredApprovalContract
        Set-StagedFile -RepositoryRoot $selfDeclaredApprovalRoot -Path "package.json" -Content '{"private":true}'
        Remove-Item Env:TIKU_HIGH_RISK_APPROVALS -ErrorAction SilentlyContinue
        Assert-FailsWith -Label "self-declared high-risk approval" -Pattern "HIGH_RISK_APPROVAL_EXTERNAL_REQUIRED.*dependency" -Command {
            Invoke-Kernel -RepositoryRoot $selfDeclaredApprovalRoot -Phase pre_commit
        }

        $candidateTree = (Invoke-Git -RepositoryRoot $selfDeclaredApprovalRoot -Arguments @("write-tree") | Select-Object -First 1).Trim()
        $env:TIKU_HIGH_RISK_APPROVALS = @(
            [ordered]@{
                approvalId = $declaredApprovalId
                taskId = "wrong-task"
                risk = "dependency"
                candidateTree = $candidateTree
            }
        ) | ConvertTo-Json -Compress
        Assert-FailsWith -Label "approval bound to task" -Pattern "HIGH_RISK_APPROVAL_INVALID.*dependency" -Command {
            Invoke-Kernel -RepositoryRoot $selfDeclaredApprovalRoot -Phase pre_commit
        }
        $env:TIKU_HIGH_RISK_APPROVALS = @(
            [ordered]@{
                approvalId = $declaredApprovalId
                taskId = "smoke-task"
                risk = "database"
                candidateTree = $candidateTree
            }
        ) | ConvertTo-Json -Compress
        Assert-FailsWith -Label "approval bound to risk" -Pattern "HIGH_RISK_APPROVAL_INVALID.*dependency" -Command {
            Invoke-Kernel -RepositoryRoot $selfDeclaredApprovalRoot -Phase pre_commit
        }
        $env:TIKU_HIGH_RISK_APPROVALS = @(
            [ordered]@{
                approvalId = $declaredApprovalId
                taskId = "smoke-task"
                risk = "dependency"
                candidateTree = "0000000000000000000000000000000000000000"
            }
        ) | ConvertTo-Json -Compress
        Assert-FailsWith -Label "approval bound to candidate tree" -Pattern "HIGH_RISK_APPROVAL_INVALID.*dependency" -Command {
            Invoke-Kernel -RepositoryRoot $selfDeclaredApprovalRoot -Phase pre_commit
        }
        $env:TIKU_HIGH_RISK_APPROVALS = @(
            [ordered]@{
                approvalId = $declaredApprovalId
                taskId = "smoke-task"
                risk = "dependency"
                candidateTree = $candidateTree
            }
        ) | ConvertTo-Json -Compress
        Assert-Passes -Label "externally bound high-risk approval" -Command {
            Invoke-Kernel -RepositoryRoot $selfDeclaredApprovalRoot -Phase pre_commit
        }
        Remove-Item Env:TIKU_HIGH_RISK_APPROVALS -ErrorAction SilentlyContinue
    }

    if ($ReviewCase -in @("all", "push_binding")) {
        $pushBindingRoot = New-SmokeRepository -Name "push-binding" -Contract $passingContract -InitialBranch master
        $pushBindingRemote = Join-Path $smokeRoot "push-binding-remote.git"
        & git init --bare $pushBindingRemote *> $null
        Invoke-Git -RepositoryRoot $pushBindingRoot -Arguments @("remote", "add", "origin", $pushBindingRemote) | Out-Null
        Invoke-Git -RepositoryRoot $pushBindingRoot -Arguments @("config", "tiku.canonicalOriginUrl", $pushBindingRemote) | Out-Null
        Invoke-Git -RepositoryRoot $pushBindingRoot -Arguments @("push", "-u", "origin", "master") | Out-Null
        Set-StagedFile -RepositoryRoot $pushBindingRoot -Path "allowed.txt" -Content "push binding candidate"
        Invoke-Git -RepositoryRoot $pushBindingRoot -Arguments @("commit", "-m", "test: add push binding candidate") | Out-Null
        $bindingHeadSha = (Invoke-Git -RepositoryRoot $pushBindingRoot -Arguments @("rev-parse", "HEAD") | Select-Object -First 1).Trim()
        $bindingOriginSha = (Invoke-Git -RepositoryRoot $pushBindingRoot -Arguments @("rev-parse", "origin/master") | Select-Object -First 1).Trim()
        $bindingPushLine = "refs/heads/master $bindingHeadSha refs/heads/master $bindingOriginSha"
        $env:TIKU_PUSH_APPROVED = "1"
        Assert-FailsWith -Label "wrong push remote URL" -Pattern "PUSH_REMOTE_URL_INVALID" -Command {
            Invoke-Kernel -RepositoryRoot $pushBindingRoot -Phase pre_push -PushUpdateLines @($bindingPushLine) -PushRemoteUrl "https://example.invalid/wrong.git"
        }
        $wrongLocalShaLine = "refs/heads/master 0000000000000000000000000000000000000000 refs/heads/master $bindingOriginSha"
        Assert-FailsWith -Label "wrong push local SHA" -Pattern "PUSH_UPDATE_INVALID" -Command {
            Invoke-Kernel -RepositoryRoot $pushBindingRoot -Phase pre_push -PushUpdateLines @($wrongLocalShaLine)
        }
        $wrongOldShaLine = "refs/heads/master $bindingHeadSha refs/heads/master 0000000000000000000000000000000000000000"
        Assert-FailsWith -Label "wrong push remote old SHA" -Pattern "PUSH_UPDATE_INVALID" -Command {
            Invoke-Kernel -RepositoryRoot $pushBindingRoot -Phase pre_push -PushUpdateLines @($wrongOldShaLine)
        }
        $wrongTargetLine = "refs/heads/feature $bindingHeadSha refs/heads/feature $bindingOriginSha"
        Assert-FailsWith -Label "non-master push update" -Pattern "PUSH_UPDATE_INVALID" -Command {
            Invoke-Kernel -RepositoryRoot $pushBindingRoot -Phase pre_push -PushUpdateLines @($wrongTargetLine)
        }
        Assert-Passes -Label "fully bound push update" -Command {
            Invoke-Kernel -RepositoryRoot $pushBindingRoot -Phase pre_push -PushUpdateLines @($bindingPushLine)
        }
        Remove-Item Env:TIKU_PUSH_APPROVED -ErrorAction SilentlyContinue
    }

    if ($ReviewCase -ne "all") {
        Write-Output "Minimal safety kernel review characterization passed: case=$ReviewCase cases=$caseCount"
        return
    }

    $passingRoot = New-SmokeRepository -Name "ordinary-low-risk" -Contract $passingContract
    Set-StagedFile -RepositoryRoot $passingRoot -Path "allowed.txt"
    Assert-Passes -Label "ordinary low-risk task" -Command { Invoke-Kernel -RepositoryRoot $passingRoot -Phase pre_commit }

    $smugglingRoot = New-SmokeRepository -Name "product-smuggling" -Contract $passingContract
    Set-StagedFile -RepositoryRoot $smugglingRoot -Path "src/product.ts"
    Assert-FailsWith -Label "product file smuggling" -Pattern "SCOPE_VIOLATION.*src/product.ts" -Command {
        Invoke-Kernel -RepositoryRoot $smugglingRoot -Phase pre_commit
    }

    $extraFileRoot = New-SmokeRepository -Name "extra-file" -Contract $passingContract
    Set-StagedFile -RepositoryRoot $extraFileRoot -Path "extra.md"
    Assert-FailsWith -Label "extra file" -Pattern "SCOPE_VIOLATION.*extra.md" -Command {
        Invoke-Kernel -RepositoryRoot $extraFileRoot -Phase pre_commit
    }

    $dependencyContract = New-TaskContract -AllowedFiles @("package.json") -ValidationCommands @(
        (New-ValidationCommand -Kind other -ExitCode 0)
    )
    $dependencyRoot = New-SmokeRepository -Name "dependency-approval" -Contract $dependencyContract
    Set-StagedFile -RepositoryRoot $dependencyRoot -Path "package.json" -Content '{"private":true}'
    Assert-FailsWith -Label "unauthorized dependency" -Pattern "HIGH_RISK_APPROVAL_REQUIRED.*dependency" -Command {
        Invoke-Kernel -RepositoryRoot $dependencyRoot -Phase pre_commit
    }

    $masterRoot = New-SmokeRepository -Name "protected-branch" -Contract $passingContract -InitialBranch master
    Set-StagedFile -RepositoryRoot $masterRoot -Path "allowed.txt"
    Assert-FailsWith -Label "direct master" -Pattern "PROTECTED_BRANCH" -Command {
        Invoke-Kernel -RepositoryRoot $masterRoot -Phase pre_commit
    }

    $failingCommandContract = New-TaskContract -AllowedFiles @("allowed.txt") -ValidationCommands @(
        (New-ValidationCommand -Kind other -ExitCode 7)
    )
    $failingCommandRoot = New-SmokeRepository -Name "failed-validation" -Contract $failingCommandContract
    Set-StagedFile -RepositoryRoot $failingCommandRoot -Path "allowed.txt"
    Assert-FailsWith -Label "failed validation" -Pattern "VALIDATION_FAILED.*other-smoke" -Command {
        Invoke-Kernel -RepositoryRoot $failingCommandRoot -Phase pre_commit
    }

    $unsafeCommandContract = New-TaskContract -AllowedFiles @("allowed.txt") -ValidationCommands @(
        [ordered]@{
            name = "unsafe-command"
            kind = "other"
            executable = "powershell.exe"
            arguments = @("-NoProfile", "-Command", "exit 0")
        }
    )
    $unsafeCommandRoot = New-SmokeRepository -Name "unsafe-validation-command" -Contract $unsafeCommandContract
    Set-StagedFile -RepositoryRoot $unsafeCommandRoot -Path "allowed.txt"
    Assert-FailsWith -Label "unsafe validation command" -Pattern "VALIDATION_COMMAND_UNSAFE" -Command {
        Invoke-Kernel -RepositoryRoot $unsafeCommandRoot -Phase pre_commit
    }

    $unsafePackageExecContract = New-TaskContract -AllowedFiles @("allowed.txt") -ValidationCommands @(
        [ordered]@{
            name = "unsafe-package-exec"
            kind = "other"
            executable = "corepack.cmd"
            arguments = @("pnpm@11.9.0", "exec", "node", "-e", "process.exit(0)")
        }
    )
    $unsafePackageExecRoot = New-SmokeRepository -Name "unsafe-package-exec" -Contract $unsafePackageExecContract
    Set-StagedFile -RepositoryRoot $unsafePackageExecRoot -Path "allowed.txt"
    Assert-FailsWith -Label "unsafe package exec" -Pattern "VALIDATION_COMMAND_UNSAFE" -Command {
        Invoke-Kernel -RepositoryRoot $unsafePackageExecRoot -Phase pre_commit
    }

    $spoofedProductGatesContract = New-TaskContract -AllowedFiles @("src/product.ts") -ValidationCommands @(
        (New-ValidationCommand -Kind test -ExitCode 0),
        (New-ValidationCommand -Kind lint -ExitCode 0),
        (New-ValidationCommand -Kind typecheck -ExitCode 0)
    )
    $spoofedProductGatesRoot = New-SmokeRepository -Name "spoofed-product-gates" -Contract $spoofedProductGatesContract
    Set-StagedFile -RepositoryRoot $spoofedProductGatesRoot -Path "src/product.ts"
    Assert-FailsWith -Label "spoofed product gates" -Pattern "VALIDATION_KIND_MISMATCH" -Command {
        Invoke-Kernel -RepositoryRoot $spoofedProductGatesRoot -Phase pre_commit
    }

    $pushRoot = New-SmokeRepository -Name "push-approval" -Contract $passingContract -InitialBranch master
    $pushRemote = Join-Path $smokeRoot "push-remote.git"
    & git init --bare $pushRemote *> $null
    Invoke-Git -RepositoryRoot $pushRoot -Arguments @("remote", "add", "origin", $pushRemote) | Out-Null
    Invoke-Git -RepositoryRoot $pushRoot -Arguments @("config", "tiku.canonicalOriginUrl", $pushRemote) | Out-Null
    Invoke-Git -RepositoryRoot $pushRoot -Arguments @("push", "-u", "origin", "master") | Out-Null
    Set-StagedFile -RepositoryRoot $pushRoot -Path "allowed.txt" -Content "push candidate"
    Invoke-Git -RepositoryRoot $pushRoot -Arguments @("commit", "-m", "test: add one task commit") | Out-Null
    $headSha = (Invoke-Git -RepositoryRoot $pushRoot -Arguments @("rev-parse", "HEAD") | Select-Object -First 1).Trim()
    $originSha = (Invoke-Git -RepositoryRoot $pushRoot -Arguments @("rev-parse", "origin/master") | Select-Object -First 1).Trim()
    $pushLine = "refs/heads/master $headSha refs/heads/master $originSha"
    Remove-Item Env:TIKU_PUSH_APPROVED -ErrorAction SilentlyContinue
    Assert-FailsWith -Label "unauthorized push" -Pattern "PUSH_APPROVAL_REQUIRED" -Command {
        Invoke-Kernel -RepositoryRoot $pushRoot -Phase pre_push -PushUpdateLines @($pushLine)
    }

    $closeoutRoot = New-SmokeRepository -Name "residual-worktree" -Contract $passingContract -InitialBranch master
    $closeoutRemote = Join-Path $smokeRoot "closeout-remote.git"
    & git init --bare $closeoutRemote *> $null
    Invoke-Git -RepositoryRoot $closeoutRoot -Arguments @("remote", "add", "origin", $closeoutRemote) | Out-Null
    Invoke-Git -RepositoryRoot $closeoutRoot -Arguments @("push", "-u", "origin", "master") | Out-Null
    $residualPath = Join-Path $smokeRoot "residual-linked-worktree"
    Invoke-Git -RepositoryRoot $closeoutRoot -Arguments @("worktree", "add", "-b", "codex/residual", $residualPath, "HEAD") | Out-Null
    Assert-FailsWith -Label "residual worktree" -Pattern "RESIDUAL_WORKTREE" -Command {
        Invoke-Kernel -RepositoryRoot $closeoutRoot -Phase closeout
    }

    if ($Profile -eq "full") {
        $sourceContract = New-TaskContract -AllowedFiles @("src/product.ts") -ValidationCommands @(
            [ordered]@{
                name = "product-test"
                kind = "test"
                executable = "powershell.exe"
                arguments = @("-NoProfile", "-File", "./Test-Smoke.ps1")
            }
        )
        $sourceRoot = New-SmokeRepository -Name "missing-product-gates" -Contract $sourceContract
        Set-StagedFile -RepositoryRoot $sourceRoot -Path "src/product.ts"
        Assert-FailsWith -Label "missing lint and typecheck" -Pattern "PRODUCT_GATE_MISSING.*lint.*typecheck" -Command {
            Invoke-Kernel -RepositoryRoot $sourceRoot -Phase pre_commit
        }

        $env:TIKU_PUSH_APPROVED = "1"
        Assert-Passes -Label "authorized one-commit fast-forward push" -Command {
            Invoke-Kernel -RepositoryRoot $pushRoot -Phase pre_push -PushUpdateLines @($pushLine)
        }
        Remove-Item Env:TIKU_PUSH_APPROVED -ErrorAction SilentlyContinue

        Invoke-Git -RepositoryRoot $pushRoot -Arguments @("push", "origin", "master") | Out-Null
        Assert-Passes -Label "clean synchronized master" -Command {
            Invoke-Kernel -RepositoryRoot $pushRoot -Phase closeout
        }

        Set-StagedFile -RepositoryRoot $pushRoot -Path "allowed.txt" -Content "first extra commit"
        Invoke-Git -RepositoryRoot $pushRoot -Arguments @("commit", "-m", "test: first extra commit") | Out-Null
        Set-StagedFile -RepositoryRoot $pushRoot -Path "allowed.txt" -Content "second extra commit"
        Invoke-Git -RepositoryRoot $pushRoot -Arguments @("commit", "-m", "test: second extra commit") | Out-Null
        $env:TIKU_PUSH_APPROVED = "1"
        $multipleCommitHeadSha = (Invoke-Git -RepositoryRoot $pushRoot -Arguments @("rev-parse", "HEAD") | Select-Object -First 1).Trim()
        $multipleCommitOriginSha = (Invoke-Git -RepositoryRoot $pushRoot -Arguments @("rev-parse", "origin/master") | Select-Object -First 1).Trim()
        $multipleCommitPushLine = "refs/heads/master $multipleCommitHeadSha refs/heads/master $multipleCommitOriginSha"
        Assert-FailsWith -Label "multiple task commits" -Pattern "TASK_COMMIT_COUNT_INVALID" -Command {
            Invoke-Kernel -RepositoryRoot $pushRoot -Phase pre_push -PushUpdateLines @($multipleCommitPushLine)
        }
        Remove-Item Env:TIKU_PUSH_APPROVED -ErrorAction SilentlyContinue
    }

    Write-Output "Minimal safety kernel smoke passed: profile=$Profile cases=$caseCount"
} finally {
    try {
        Remove-Item Env:TIKU_PUSH_APPROVED -ErrorAction SilentlyContinue
        Remove-Item Env:TIKU_HIGH_RISK_APPROVALS -ErrorAction SilentlyContinue
        if ($null -ne $closeoutRoot -and $null -ne $residualPath -and (Test-Path -LiteralPath $residualPath)) {
            Invoke-Git -RepositoryRoot $closeoutRoot -Arguments @("worktree", "remove", "--force", $residualPath) | Out-Null
        }
        if (Test-Path -LiteralPath $smokeRoot) {
            $tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd("\") + "\"
            $resolvedSmokeRoot = [System.IO.Path]::GetFullPath($smokeRoot)
            if (-not $resolvedSmokeRoot.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
                -not (Split-Path -Leaf $resolvedSmokeRoot).StartsWith("tiku-minimal-kernel-", [System.StringComparison]::Ordinal)) {
                throw "Unsafe smoke cleanup path: $resolvedSmokeRoot"
            }
            Remove-Item -LiteralPath $smokeRoot -Recurse -Force
        }
    } finally {
        foreach ($environmentName in $gitLocalEnvironment.Keys) {
            [Environment]::SetEnvironmentVariable($environmentName, $gitLocalEnvironment[$environmentName], "Process")
        }
    }
}
