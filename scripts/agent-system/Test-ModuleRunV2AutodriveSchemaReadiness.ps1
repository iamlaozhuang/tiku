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
    [string]$SchemaPath = "docs\04-agent-system\state\autodrive-control-schema.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ExecutionProfileCatalogPath = "docs\04-agent-system\state\execution-profiles.yaml"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Add-Finding {
    param([Parameter(Mandatory = $true)][string]$Message)

    $script:findings.Add($Message)
    Write-Output $Message
}

function Write-AutodriveSchemaResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$NormalizationAction = "",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$NormalizedValidationCommand = ""
    )

    Write-Section -Title "Result"
    Write-Output "autodriveSchemaDecision: $Decision"
    if (-not [string]::IsNullOrWhiteSpace($NormalizationAction)) {
        Write-Output "normalizationAction: $NormalizationAction"
    }
    if (-not [string]::IsNullOrWhiteSpace($NormalizedValidationCommand)) {
        Write-Output "normalizedValidationCommand: $NormalizedValidationCommand"
    }
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Remove-ValueQuotes {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    $trimmedValue = $Value.Trim()
    if ($trimmedValue.Length -ge 2) {
        $firstChar = $trimmedValue.Substring(0, 1)
        $lastChar = $trimmedValue.Substring($trimmedValue.Length - 1, 1)
        if (($firstChar -eq '"' -and $lastChar -eq '"') -or ($firstChar -eq "'" -and $lastChar -eq "'")) {
            return $trimmedValue.Substring(1, $trimmedValue.Length - 2)
        }
    }

    return $trimmedValue
}

function Get-TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $currentId = ""
    $currentLines = New-Object System.Collections.Generic.List[string]

    foreach ($line in $Lines) {
        if ($line -match "^\s+- id:\s+(.+?)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentId)) {
                $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
            }
            $currentId = Remove-ValueQuotes -Value $Matches[1]
            $currentLines = New-Object System.Collections.Generic.List[string]
            $currentLines.Add($line)
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId)) {
            $currentLines.Add($line)
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentId)) {
        $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
    }

    return $blocks.ToArray()
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)][object[]]$Blocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($block in $Blocks) {
        if ($block.Id -eq $Id) {
            return $block.Lines
        }
    }

    return @()
}

function Get-CurrentTaskId {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

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
            return Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return ""
}

function Get-TaskScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return ""
}

function Get-TaskListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s{6}-\s+(.+?)\s*$") {
            $values.Add((Remove-ValueQuotes -Value $Matches[1]))
            continue
        }

        if ($insideList -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
}

function Get-TaskValidationLifecycleCommands {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    $commands = New-Object System.Collections.Generic.List[object]
    $insideSection = $false
    $currentPhase = ""

    foreach ($line in $Block) {
        if ($line -match "^\s{4}validationCommandLifecycle:\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if (-not $insideSection) {
            continue
        }

        if ($line -match "^\s{6}-\s+phase:\s*(.+?)\s*$") {
            $currentPhase = Remove-ValueQuotes -Value $Matches[1]
            continue
        }

        if ($line -match "^\s{8}command:\s*(.+?)\s*$") {
            $commands.Add([pscustomobject]@{
                Phase = $currentPhase
                Command = Remove-ValueQuotes -Value $Matches[1]
            })
        }
    }

    return $commands.ToArray()
}

function Test-TaskSectionPresent {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*$") {
            return $true
        }
    }

    return $false
}

function Test-TaskBlockContains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    return (($Block -join "`n") -match $Pattern)
}

function Test-RequiredListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Section,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$RequiredValues
    )

    $blockText = $Block -join "`n"
    foreach ($requiredValue in $RequiredValues) {
        if ($blockText -notmatch "(?m)^\s+-\s*$([regex]::Escape($requiredValue))\s*$") {
            Add-Finding "HARD_BLOCK_AUTODRIVE_SCHEMA_MISSING_VALUE $Section $requiredValue"
        }
    }
}

function Get-CatalogSectionKeys {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory = $true)][string]$Section
    )

    $keys = New-Object System.Collections.Generic.List[string]
    $insideSection = $false
    foreach ($line in ($Content -split "\r?\n")) {
        if (-not $insideSection -and $line -match "^$([regex]::Escape($Section)):\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\S") {
            break
        }

        if ($insideSection -and $line -match "^\s{2}([A-Za-z0-9_]+):\s*") {
            $keys.Add($Matches[1])
        }
    }

    return @($keys.ToArray() | Sort-Object -Unique)
}

function Test-CatalogValuePresent {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Values,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$ExpectedValue
    )

    return $Values -contains $ExpectedValue
}

function Test-ListContainsPathPattern {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Values,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern
    )

    $normalizedExpectedPattern = $ExpectedPattern.Replace("\", "/").TrimStart(".", "/")
    foreach ($value in $Values) {
        $normalizedValue = $value.Replace("\", "/").TrimStart(".", "/")
        if ($normalizedValue -eq $normalizedExpectedPattern) {
            return $true
        }
    }

    return $false
}

function Test-ProjectStateHasStandingLocalE2EApproval {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $content = $Lines -join "`n"
    return $content -match "(?s)standingLocalE2EValidationApproval:\s*.*?status:\s*approved"
}

function Test-ProjectStateHasStandingLocalLowRiskExperienceApproval {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $content = $Lines -join "`n"
    return $content -match "(?s)standingLocalLowRiskExperienceAdvancementApproval:\s*.*?status:\s*approved"
}

function Test-BroadFocusedPlaceholderCommand {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Command)

    return $Command.Trim() -match "^npm\.cmd\s+run\s+test\s+--\s+--run\s+focused\b"
}

function Test-ScopedUnitValidationCommand {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Command)

    $normalizedCommand = $Command.Replace("\", "/").Trim()
    if ($normalizedCommand -match "\.\.") {
        return $false
    }

    return $normalizedCommand -match "^npm\.cmd\s+run\s+test:unit\s+--\s+(src|tests)/[A-Za-z0-9._/-]+\.test\.ts$"
}

function Test-ValidationCommandsContainExactCommand {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ValidationCommands,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$ExpectedCommand
    )

    $normalizedExpectedCommand = $ExpectedCommand.Replace("\", "/").Trim()
    foreach ($validationCommand in $ValidationCommands) {
        $normalizedValidationCommand = $validationCommand.Replace("\", "/").Trim()
        if ($normalizedValidationCommand -eq $normalizedExpectedCommand) {
            return $true
        }
    }

    return $false
}

function Test-ValidationCommandNormalizationGate {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ValidationCommands
    )

    $normalizationMode = Get-TaskScalarValue -Block $TaskBlock -Key "validationCommandNormalization"
    if ([string]::IsNullOrWhiteSpace($normalizationMode)) {
        return
    }

    if ($normalizationMode -ne "approved_docs_only_placeholder_to_scoped_unit") {
        Add-Finding "HARD_BLOCK_VALIDATION_COMMAND_NORMALIZATION_MODE $normalizationMode"
    }

    $replacementCommand = Get-TaskScalarValue -Block $TaskBlock -Key "normalizedValidationCommand"
    if ([string]::IsNullOrWhiteSpace($replacementCommand)) {
        Add-Finding "HARD_BLOCK_VALIDATION_COMMAND_NORMALIZATION_MISSING_REPLACEMENT"
        return
    }

    if (-not (Test-ScopedUnitValidationCommand -Command $replacementCommand)) {
        Add-Finding "HARD_BLOCK_VALIDATION_COMMAND_NORMALIZATION_UNSAFE_REPLACEMENT $replacementCommand"
        return
    }

    $legacyPlaceholders = @($ValidationCommands | Where-Object { Test-BroadFocusedPlaceholderCommand -Command $_ })
    if ($legacyPlaceholders.Count -gt 0) {
        $script:normalizationRequired = $true
        $script:normalizationAction = "replace_legacy_focused_placeholder_with_scoped_unit"
        $script:normalizedValidationCommand = $replacementCommand
        return
    }

    if (-not (Test-ValidationCommandsContainExactCommand -ValidationCommands $ValidationCommands -ExpectedCommand $replacementCommand)) {
        Add-Finding "HARD_BLOCK_VALIDATION_COMMAND_NORMALIZATION_MISSING_REPLACEMENT_COMMAND $replacementCommand"
    }
}

function Get-AllValidationCommandTexts {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ValidationCommands,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$ValidationLifecycleCommands
    )

    $commands = New-Object System.Collections.Generic.List[string]
    foreach ($validationCommand in $ValidationCommands) {
        if (-not [string]::IsNullOrWhiteSpace($validationCommand)) {
            $commands.Add($validationCommand.Trim())
        }
    }
    foreach ($validationLifecycleCommand in $ValidationLifecycleCommands) {
        if ($null -ne $validationLifecycleCommand -and -not [string]::IsNullOrWhiteSpace($validationLifecycleCommand.Command)) {
            $commands.Add($validationLifecycleCommand.Command.Trim())
        }
    }

    return @($commands.ToArray() | Sort-Object -Unique)
}

function Get-RunnableValidationCommandTexts {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ValidationCommands,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$ValidationLifecycleCommands
    )

    $commands = New-Object System.Collections.Generic.List[string]
    foreach ($validationCommand in $ValidationCommands) {
        if (-not [string]::IsNullOrWhiteSpace($validationCommand)) {
            $commands.Add($validationCommand.Trim())
        }
    }
    foreach ($validationLifecycleCommand in $ValidationLifecycleCommands) {
        if ($null -eq $validationLifecycleCommand -or [string]::IsNullOrWhiteSpace($validationLifecycleCommand.Command)) {
            continue
        }
        if ($validationLifecycleCommand.Phase -in @("post_edit", "closeout")) {
            $commands.Add($validationLifecycleCommand.Command.Trim())
        }
    }

    return @($commands.ToArray() | Sort-Object -Unique)
}

function Test-LocalE2ECommandAllowed {
    param([Parameter(Mandatory = $true)][string]$Command)

    $trimmedCommand = $Command.Trim()
    if ($trimmedCommand -match "npm\.cmd\s+run\s+test:e2e:ui\b" -or
        $trimmedCommand -match "(^|\s)--(ui|headed|debug)\b" -or
        $trimmedCommand -match "\bplaywright\s+test\b") {
        return [pscustomobject]@{
            Allowed = $false
            Reason = "blocked mode"
            SpecPath = ""
        }
    }

    if ($trimmedCommand -match "^npm\.cmd\s+run\s+test:e2e\s+--\s+--list\s*$") {
        return [pscustomobject]@{
            Allowed = $true
            Reason = "list"
            SpecPath = ""
        }
    }

    $targetedSpecMatch = [regex]::Match($trimmedCommand, "^npm\.cmd\s+run\s+test:e2e\s+--\s+(e2e/[A-Za-z0-9._/-]+\.spec\.ts)\s*$")
    if (-not $targetedSpecMatch.Success) {
        return [pscustomobject]@{
            Allowed = $false
            Reason = "not whitelisted"
            SpecPath = ""
        }
    }

    $specPath = $targetedSpecMatch.Groups[1].Value
    if ($specPath -match "\.\." -or -not (Test-Path -LiteralPath $specPath -PathType Leaf)) {
        return [pscustomobject]@{
            Allowed = $false
            Reason = "missing or unsafe spec"
            SpecPath = $specPath
        }
    }

    return [pscustomobject]@{
        Allowed = $true
        Reason = "targeted existing spec"
        SpecPath = $specPath
    }
}

function Test-LocalE2EValidationGate {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ProjectStateLines,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ValidationCommands,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$ValidationLifecycleCommands,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$BlockedFiles,
        [Parameter(Mandatory = $false)][bool]$IgnoreFocusedPlaceholderForNormalization = $false,
        [Parameter(Mandatory = $false)][bool]$AllowListOnlyWithoutRuntimeCapability = $false
    )

    $allCommands = @(Get-RunnableValidationCommandTexts -ValidationCommands $ValidationCommands -ValidationLifecycleCommands $ValidationLifecycleCommands)
    if ($IgnoreFocusedPlaceholderForNormalization) {
        $allCommands = @($allCommands | Where-Object { -not (Test-BroadFocusedPlaceholderCommand -Command $_) })
    }
    $localE2ECommands = @(
        $allCommands | Where-Object {
            $_ -match "npm\.cmd\s+run\s+test:e2e\b" -or
            $_ -match "npm\.cmd\s+run\s+test:e2e:ui\b" -or
            $_ -match "^npm\.cmd\s+run\s+test(\s|$)" -or
            $_ -match "\bplaywright\s+test\b"
        }
    )

    if ($localE2ECommands.Count -eq 0) {
        if (Test-TaskBlockContains -Block $TaskBlock -Pattern "(?m)^\s+localE2EValidation:\s*") {
            if (-not (Test-TaskBlockContains -Block $TaskBlock -Pattern "(?m)^\s+localE2EValidation:\s*(blocked_without_task_approval|approved_local_only_existing_specs)\s*$")) {
                Add-Finding "HARD_BLOCK_LOCAL_E2E_CAPABILITY"
            }
        }
        return
    }

    if ($AllowListOnlyWithoutRuntimeCapability) {
        $nonListCommands = @(
            $localE2ECommands | Where-Object { $_.Trim() -notmatch "^npm\.cmd\s+run\s+test:e2e\s+--\s+--list\s*$" }
        )
        if ($nonListCommands.Count -eq 0) {
            foreach ($localE2ECommand in $localE2ECommands) {
                Write-Output "OK_LOCAL_E2E_LIST_COMMAND $localE2ECommand"
            }
            return
        }
    }

    if (-not (Test-ProjectStateHasStandingLocalE2EApproval -Lines $ProjectStateLines)) {
        Add-Finding "HARD_BLOCK_LOCAL_E2E_STANDING_APPROVAL"
    }

    if (-not (Test-TaskBlockContains -Block $TaskBlock -Pattern "(?m)^\s+localE2EValidation:\s*approved_local_only_existing_specs\s*$")) {
        Add-Finding "HARD_BLOCK_LOCAL_E2E_CAPABILITY"
    }

    foreach ($localE2ECommand in $localE2ECommands) {
        $commandDecision = Test-LocalE2ECommandAllowed -Command $localE2ECommand
        if (-not $commandDecision.Allowed) {
            if ($commandDecision.Reason -eq "missing or unsafe spec") {
                Add-Finding "HARD_BLOCK_LOCAL_E2E_SPEC $($commandDecision.SpecPath)"
            } else {
                Add-Finding "HARD_BLOCK_LOCAL_E2E_COMMAND $localE2ECommand"
            }
        } else {
            Write-Output "OK_LOCAL_E2E_COMMAND $localE2ECommand"
        }
    }

    foreach ($requiredBlockedFile in @(
            ".env.local",
            ".env.example",
            "package.json",
            "pnpm-lock.yaml",
            "package-lock.yaml",
            "package-lock.json",
            "src/db/schema/**",
            "drizzle/**",
            "playwright-report/**",
            "test-results/**"
        )) {
        if (-not (Test-ListContainsPathPattern -Values $BlockedFiles -ExpectedPattern $requiredBlockedFile)) {
            Add-Finding "HARD_BLOCK_LOCAL_E2E_BLOCKED_FILES $requiredBlockedFile"
        }
    }
}

$findings = New-Object System.Collections.Generic.List[string]
$normalizationRequired = $false
$normalizationAction = ""
$normalizedValidationCommand = ""

try {
    Write-Section -Title "Module Run v2 Autodrive Schema Readiness"
    Write-Output "autodriveSchemaMode: read_only"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $SchemaPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Add-Finding "HARD_BLOCK_MISSING_FILE $requiredPath"
        }
    }

    if ($findings.Count -gt 0) {
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "required durable files are missing" -ExitCode 1
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $schemaContent = Get-Content -LiteralPath $SchemaPath -Raw
    $profileCatalogPresent = Test-Path -LiteralPath $ExecutionProfileCatalogPath -PathType Leaf
    $profileCatalogContent = ""
    if ($profileCatalogPresent) {
        $profileCatalogContent = Get-Content -LiteralPath $ExecutionProfileCatalogPath -Raw
    }
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    Write-Output "taskId: $TaskId"
    Write-Output "schemaPath: $SchemaPath"
    Write-Output "executionProfileCatalogPath: $ExecutionProfileCatalogPath"
    Write-Output "executionProfileCatalog: $(if ($profileCatalogPresent) { "present" } else { "missing_legacy_defaults" })"

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_ID"
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "task id is missing" -ExitCode 1
    }

    if ($schemaContent -notmatch "taskAutodrivePolicy:" -or $schemaContent -notmatch "capabilities:" -or $schemaContent -notmatch "registryLifecycle:") {
        Add-Finding "HARD_BLOCK_SCHEMA_CONTRACT_INCOMPLETE $SchemaPath"
    }
    if ($schemaContent -match "executionProfiles:" -and $schemaContent -match [regex]::Escape("docs/04-agent-system/state/execution-profiles.yaml")) {
        Write-Output "schemaProfileCatalogReference: present"
    } else {
        Write-Output "schemaProfileCatalogReference: missing_legacy_compatible"
    }

    $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        Add-Finding "HARD_BLOCK_TASK_NOT_FOUND $TaskId"
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "task is not present in queue" -ExitCode 1
    }

    $status = Get-TaskScalarValue -Block $taskBlock -Key "status"
    $taskKind = Get-TaskScalarValue -Block $taskBlock -Key "taskKind"
    $evidencePath = Get-TaskScalarValue -Block $taskBlock -Key "evidencePath"
    $auditReviewPath = Get-TaskScalarValue -Block $taskBlock -Key "auditReviewPath"
    $allowedFiles = @(Get-TaskListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-TaskListValues -Block $taskBlock -Key "blockedFiles")
    $riskTypes = @(Get-TaskListValues -Block $taskBlock -Key "riskTypes")
    $validationCommands = @(Get-TaskListValues -Block $taskBlock -Key "validationCommands")
    $validationLifecycleCommands = @(Get-TaskValidationLifecycleCommands -Block $taskBlock)
    $validationCommandNormalization = Get-TaskScalarValue -Block $taskBlock -Key "validationCommandNormalization"
    $executionProfile = Get-TaskScalarValue -Block $taskBlock -Key "executionProfile"
    $evidenceMode = Get-TaskScalarValue -Block $taskBlock -Key "evidenceMode"
    $validationPolicy = Get-TaskScalarValue -Block $taskBlock -Key "validationPolicy"
    $queueSelectionMode = Get-TaskScalarValue -Block $taskBlock -Key "queueSelectionMode"
    if ([string]::IsNullOrWhiteSpace($executionProfile)) {
        $executionProfile = "legacy_explicit"
    }
    if ([string]::IsNullOrWhiteSpace($evidenceMode)) {
        $evidenceMode = "full"
    }
    if ([string]::IsNullOrWhiteSpace($validationPolicy)) {
        $validationPolicy = "legacy_explicit"
    }
    if ([string]::IsNullOrWhiteSpace($queueSelectionMode)) {
        $queueSelectionMode = "legacy_explicit"
    }

    $catalogProfiles = @()
    $catalogEvidenceModes = @()
    $catalogValidationPolicies = @()
    $catalogQueueSelectionModes = @()
    if ($profileCatalogPresent) {
        $catalogProfiles = @(Get-CatalogSectionKeys -Content $profileCatalogContent -Section "profiles")
        $catalogEvidenceModes = @(Get-CatalogSectionKeys -Content $profileCatalogContent -Section "evidenceModes")
        $catalogValidationPolicies = @(Get-CatalogSectionKeys -Content $profileCatalogContent -Section "validationPolicies")
        $catalogQueueSelectionModes = @(Get-CatalogSectionKeys -Content $profileCatalogContent -Section "queueSelectionModes")
    }

    Write-Section -Title "Task"
    Write-Output "status: $status"
    Write-Output "taskKind: $taskKind"
    Write-Output "executionProfile: $executionProfile"
    Write-Output "evidenceMode: $evidenceMode"
    Write-Output "validationPolicy: $validationPolicy"
    Write-Output "queueSelectionMode: $queueSelectionMode"
    Write-Output "allowedFileCount: $($allowedFiles.Count)"
    Write-Output "blockedFileCount: $($blockedFiles.Count)"
    Write-Output "riskTypeCount: $($riskTypes.Count)"
    Write-Output "validationCommandCount: $($validationCommands.Count)"
    Write-Output "validationLifecycleCommandCount: $($validationLifecycleCommands.Count)"
    Write-Output "validationCommandNormalization: $validationCommandNormalization"
    if ($profileCatalogPresent) {
        Write-Output "catalogProfileCount: $($catalogProfiles.Count)"
        Write-Output "catalogEvidenceModeCount: $($catalogEvidenceModes.Count)"
        Write-Output "catalogValidationPolicyCount: $($catalogValidationPolicies.Count)"
        Write-Output "catalogQueueSelectionModeCount: $($catalogQueueSelectionModes.Count)"
    }

    if ($status -in @("done", "closed", "pushed", "merged")) {
        Write-Output "not_executable_closed_task: $TaskId status=$status"
        Write-AutodriveSchemaResult -Decision "not_executable_closed_task" -Reason "task is terminal and should be treated as idle, not executable autodrive work" -ExitCode 0
    }

    if ($status -notin @("pending", "in_progress", "ready_for_closeout")) {
        Add-Finding "HARD_BLOCK_UNSUPPORTED_TASK_STATUS $TaskId status=$status"
    }
    if ([string]::IsNullOrWhiteSpace($taskKind)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_KIND $TaskId"
    }
    if ([string]::IsNullOrWhiteSpace($evidencePath)) {
        Add-Finding "HARD_BLOCK_MISSING_EVIDENCE_PATH $TaskId"
    }
    if ([string]::IsNullOrWhiteSpace($auditReviewPath)) {
        Add-Finding "HARD_BLOCK_MISSING_AUDIT_PATH $TaskId"
    }
    if ($allowedFiles.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_ALLOWED_FILES $TaskId"
    }
    if ($blockedFiles.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_BLOCKED_FILES $TaskId"
    }
    if ($riskTypes.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_RISK_TYPES $TaskId"
    }
    if ($validationCommands.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_VALIDATION_COMMANDS $TaskId"
    }
    if ($executionProfile -notin @("legacy_explicit", "docs_state_lite", "local_experience_audit", "local_unit_tdd", "repository_runtime_tdd", "local_full_flow", "local_low_risk_experience_batch", "schema_isolated", "dependency_isolated", "provider_local_smoke")) {
        Add-Finding "HARD_BLOCK_UNSUPPORTED_EXECUTION_PROFILE $TaskId profile=$executionProfile"
    }
    if ($evidenceMode -notin @("full", "lite")) {
        Add-Finding "HARD_BLOCK_UNSUPPORTED_EVIDENCE_MODE $TaskId evidenceMode=$evidenceMode"
    }
    if ($validationPolicy -notin @("legacy_explicit", "docs_state", "local_unit", "runtime_unit", "local_full_flow", "low_risk_experience_batch", "high_risk_isolated")) {
        Add-Finding "HARD_BLOCK_UNSUPPORTED_VALIDATION_POLICY $TaskId validationPolicy=$validationPolicy"
    }
    if ($queueSelectionMode -notin @("legacy_explicit", "ready_set")) {
        Add-Finding "HARD_BLOCK_UNSUPPORTED_QUEUE_SELECTION_MODE $TaskId queueSelectionMode=$queueSelectionMode"
    }
    if ($profileCatalogPresent) {
        if (-not (Test-CatalogValuePresent -Values $catalogProfiles -ExpectedValue $executionProfile)) {
            Add-Finding "HARD_BLOCK_EXECUTION_PROFILE_NOT_IN_CATALOG $TaskId profile=$executionProfile"
        }
        if (-not (Test-CatalogValuePresent -Values $catalogEvidenceModes -ExpectedValue $evidenceMode)) {
            Add-Finding "HARD_BLOCK_EVIDENCE_MODE_NOT_IN_CATALOG $TaskId evidenceMode=$evidenceMode"
        }
        if (-not (Test-CatalogValuePresent -Values $catalogValidationPolicies -ExpectedValue $validationPolicy)) {
            Add-Finding "HARD_BLOCK_VALIDATION_POLICY_NOT_IN_CATALOG $TaskId validationPolicy=$validationPolicy"
        }
        if (-not (Test-CatalogValuePresent -Values $catalogQueueSelectionModes -ExpectedValue $queueSelectionMode)) {
            Add-Finding "HARD_BLOCK_QUEUE_SELECTION_MODE_NOT_IN_CATALOG $TaskId queueSelectionMode=$queueSelectionMode"
        }
    }
    if ($validationLifecycleCommands.Count -gt 0) {
        $validLifecyclePhases = @("pre_edit", "post_edit", "closeout", "advisory_baseline")
        $hasRunnableCompletionPhase = $false
        foreach ($validationLifecycleCommand in $validationLifecycleCommands) {
            if ($validationLifecycleCommand.Phase -notin $validLifecyclePhases) {
                Add-Finding "HARD_BLOCK_INVALID_VALIDATION_LIFECYCLE_PHASE $($validationLifecycleCommand.Phase)"
            }
            if ($validationLifecycleCommand.Phase -in @("post_edit", "closeout")) {
                $hasRunnableCompletionPhase = $true
            }
        }
        if (-not $hasRunnableCompletionPhase) {
            Add-Finding "HARD_BLOCK_VALIDATION_LIFECYCLE_MISSING_COMPLETION_PHASE $TaskId"
        }
    }

    $blockedRiskTypes = @(
        "add_dependency",
        "dependency",
        "schema",
        "migration",
        "secret_or_env_change",
        "env_secret",
        "provider",
        "deploy",
        "payment",
        "external_service",
        "external-service",
        "cost_calibration",
        "cost-calibration"
    )
    foreach ($riskType in $riskTypes) {
        if ($blockedRiskTypes -contains $riskType.ToLowerInvariant()) {
            Add-Finding "HARD_BLOCK_RISK_GATE $riskType"
        }
    }
    if ($executionProfile -eq "local_low_risk_experience_batch" -and -not (Test-ProjectStateHasStandingLocalLowRiskExperienceApproval -Lines $projectStateLines)) {
        Add-Finding "HARD_BLOCK_LOW_RISK_EXPERIENCE_STANDING_APPROVAL"
    }
    Test-ValidationCommandNormalizationGate -TaskBlock $taskBlock -ValidationCommands $validationCommands

    if ($findings.Count -gt 0) {
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "base task metadata is unsafe for autodrive" -ExitCode 1
    }

    $hasAutodrivePolicy = Test-TaskSectionPresent -Block $taskBlock -Key "autodrivePolicy"
    $hasCapabilities = Test-TaskSectionPresent -Block $taskBlock -Key "capabilities"
    $hasCloseoutPolicy = Test-TaskSectionPresent -Block $taskBlock -Key "closeoutPolicy"
    $hasRegistryLifecycle = Test-TaskSectionPresent -Block $taskBlock -Key "registryLifecycle"

    Write-Section -Title "Autodrive Fields"
    Write-Output "autodrivePolicy: $($hasAutodrivePolicy.ToString().ToLowerInvariant())"
    Write-Output "capabilities: $($hasCapabilities.ToString().ToLowerInvariant())"
    Write-Output "closeoutPolicy: $($hasCloseoutPolicy.ToString().ToLowerInvariant())"
    Write-Output "registryLifecycle: $($hasRegistryLifecycle.ToString().ToLowerInvariant())"

    if (-not $hasAutodrivePolicy -or -not $hasCapabilities -or -not $hasCloseoutPolicy -or -not $hasRegistryLifecycle) {
        Write-AutodriveSchemaResult -Decision "proposal_only" -Reason "durable autodrive schema fields are incomplete" -ExitCode 0
    }

    $mode = ""
    foreach ($line in $taskBlock) {
        if ($line -match "^\s{6}mode:\s*(.+?)\s*$") {
            $mode = Remove-ValueQuotes -Value $Matches[1]
            break
        }
    }
    Write-Output "autodriveMode: $mode"

    if ($mode -notin @("guarded_serial", "guarded_parallel", "closeout_only")) {
        Write-AutodriveSchemaResult -Decision "proposal_only" -Reason "autodrive mode is proposal-only or unknown" -ExitCode 0
    }

    Test-RequiredListValues -Block $taskBlock -Section "blockedAgentActions" -RequiredValues @(
        "merge",
        "push",
        "pr",
        "deploy",
        "dependency_change",
        "schema_migration",
        "env_secret",
        "provider_call",
        "cost_calibration_gate"
    )

    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+localDockerDatabase:\s*(task_approval_required|approved_local_dev_only)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_LOCAL_DOCKER_DATABASE"
    }
    if (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+destructiveLocalDockerDatabase:\s*") {
        if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+destructiveLocalDockerDatabase:\s*(blocked_without_task_approval|approved_destructive_local_dev_only)\s*$")) {
            Add-Finding "HARD_BLOCK_CAPABILITY_DESTRUCTIVE_LOCAL_DOCKER_DATABASE"
        }
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+projectResourceRead:\s*(task_approval_required|approved_read_only_redacted)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_PROJECT_RESOURCE_READ"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+providerKey:\s*(env_destination_confirmation_required|approved_confirmed_local_destination)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_PROVIDER_KEY"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+providerCall:\s*(blocked_without_task_approval|approved_redacted_local_validation)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_PROVIDER_CALL"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+schemaMigration:\s*(blocked_without_task_approval|approved_migration_plan)\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_SCHEMA_MIGRATION"
    }
    Test-LocalE2EValidationGate -ProjectStateLines $projectStateLines -TaskBlock $taskBlock -ValidationCommands $validationCommands -ValidationLifecycleCommands $validationLifecycleCommands -BlockedFiles $blockedFiles -IgnoreFocusedPlaceholderForNormalization:$script:normalizationRequired -AllowListOnlyWithoutRuntimeCapability:($executionProfile -eq "local_low_risk_experience_batch")
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+costCalibrationGate:\s*blocked\s*$")) {
        Add-Finding "HARD_BLOCK_CAPABILITY_COST_CALIBRATION_GATE"
    }

    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+runStatus:\s*(active|recoverable|stopped|abandoned|cleanup_ready|closed)\s*$")) {
        Add-Finding "HARD_BLOCK_REGISTRY_LIFECYCLE_STATUS"
    }
    if (-not (Test-TaskBlockContains -Block $taskBlock -Pattern "(?m)^\s+redactionRequired:\s*true\s*$")) {
        Add-Finding "HARD_BLOCK_REGISTRY_REDACTION_REQUIRED"
    }

    if ($findings.Count -gt 0) {
        Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "durable autodrive schema has unsafe values" -ExitCode 1
    }

    if ($script:normalizationRequired) {
        Write-AutodriveSchemaResult -Decision "validation_command_normalization_required" -Reason "legacy focused validation placeholder must be replaced with the approved scoped unit command before autodrive execution" -ExitCode 0 -NormalizationAction $script:normalizationAction -NormalizedValidationCommand $script:normalizedValidationCommand
    }

    Write-AutodriveSchemaResult -Decision "can_autodrive" -Reason "durable autodrive schema is safe for guarded local action" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_AUTODRIVE_SCHEMA_EXCEPTION $($_.Exception.Message)"
    Write-AutodriveSchemaResult -Decision "stop_for_hard_block" -Reason "autodrive schema readiness script exception" -ExitCode 1
}
