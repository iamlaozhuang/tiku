$ErrorActionPreference = "Stop"

function Get-ModuleRunV2Indent {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Line)

    if ($Line -match "^(\s*)") {
        return $Matches[1].Length
    }

    return 0
}

function Get-ModuleRunV2TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $currentId = ""
    $currentLines = New-Object System.Collections.Generic.List[string]
    $insideTasks = $false
    $taskItemIndent = -1

    foreach ($line in $Lines) {
        if ($line -match "^tasks:\s*$") {
            $insideTasks = $true
            continue
        }

        if (-not $insideTasks) {
            continue
        }

        if ($line -match "^(\s*)-\s+id:\s+(.+?)\s*$") {
            $lineIndent = $Matches[1].Length
            if ($taskItemIndent -lt 0) {
                $taskItemIndent = $lineIndent
            }

            if ($lineIndent -eq $taskItemIndent) {
                if (-not [string]::IsNullOrWhiteSpace($currentId)) {
                    $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
                }

                $currentId = $Matches[2].Trim()
                $currentLines = New-Object System.Collections.Generic.List[string]
                $currentLines.Add($line)
                continue
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId)) {
            if (-not [string]::IsNullOrWhiteSpace($line) -and (Get-ModuleRunV2Indent -Line $line) -lt $taskItemIndent) {
                break
            }

            $currentLines.Add($line)
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentId)) {
        $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
    }

    return $blocks.ToArray()
}

function Get-ModuleRunV2TaskBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Blocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($block in $Blocks) {
        if ($block.Id -eq $Id) {
            return @($block.Lines)
        }
    }

    return @()
}

function Get-ModuleRunV2ScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*?)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }

    return ""
}

function Get-ModuleRunV2ListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $inList = $false
    $baseIndent = 0

    foreach ($line in $Block) {
        if (-not $inList -and $line -match "^(\s+)$([regex]::Escape($Key)):\s*$") {
            $inList = $true
            $baseIndent = $Matches[1].Length
            continue
        }

        if (-not $inList) {
            continue
        }

        if ($line -match '^(\s*)\S') {
            $indent = $Matches[1].Length
            if ($indent -le $baseIndent) {
                break
            }
        }

        if ($line -match '^\s*-\s+(.+?)\s*$') {
            $value = $Matches[1].Trim()
            $value = ($value -replace '\s+#.*$', '').Trim().Trim('"').Trim("'")
            $values.Add($value)
        }
    }

    return $values.ToArray()
}

function Get-ModuleRunV2SectionScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$SectionKey,
        [Parameter(Mandatory = $true)][string]$ScalarKey
    )

    $insideSection = $false
    $sectionIndent = -1
    foreach ($line in $Block) {
        if (-not $insideSection -and $line -match "^(\s+)$([regex]::Escape($SectionKey)):\s*$") {
            $insideSection = $true
            $sectionIndent = $Matches[1].Length
            continue
        }

        if (-not $insideSection) {
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($line) -and (Get-ModuleRunV2Indent -Line $line) -le $sectionIndent) {
            break
        }

        if ($line -match "^\s+$([regex]::Escape($ScalarKey)):\s*(.*?)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }

    return ""
}

function Test-ModuleRunV2CloseoutPolicy {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

    $taskText = ($TaskBlock -join "`n")
    if ($taskText -notmatch "(?im)^\s+closeoutPolicy:\s*$") {
        return $false
    }

    $hasLocalCommit = $taskText -match "(?im)^\s+localCommit:\s*approved(?:\b|_by)" `
        -or $taskText -match "(?ims)^\s+localCommit:\s*\r?\n\s+approved:\s*true\s*$"
    $hasMergeTarget = $taskText -match "(?im)^\s+fastForwardMerge:\s*$" `
        -and $taskText -match "(?im)^\s+targetBranch:\s*master\s*$" `
        -and $taskText -match "(?ims)^\s+fastForwardMerge:\s*\r?\n(?:\s+.*\r?\n)*?\s+approved:\s*true\s*$"
    $hasPushTarget = $taskText -match "(?im)^\s+push:\s*$" `
        -and $taskText -match "(?im)^\s+target:\s*origin/master\s*$" `
        -and $taskText -match "(?ims)^\s+push:\s*\r?\n(?:\s+.*\r?\n)*?\s+approved:\s*true\s*$"
    $hasCleanup = $taskText -match "(?im)^\s+cleanup:\s*$" `
        -and $taskText -match "(?im)^\s+deleteShortBranch:\s*true\s*$"

    return $hasLocalCommit -and $hasMergeTarget -and $hasPushTarget -and $hasCleanup
}

function Get-ModuleRunV2EvidenceResultClass {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content)

    if ([string]::IsNullOrWhiteSpace($Content)) {
        return "unknown"
    }

    if ($Content -match "(?im)^\s*(?:-\s*)?result:\s*(pass|passed)\b" -or $Content -match "(?im)\bPassed:\s*") {
        return "pass"
    }

    if ($Content -match "(?im)^\s*(?:-\s*)?result:\s*blocked" -or $Content -match "(?i)\bblocked_validation_failure\b|\bBLOCKED_LOCAL_FULL_FLOW_VALIDATION\b") {
        return "blocked"
    }

    if ($Content -match "(?im)^\s*(?:-\s*)?result:\s*pending\b") {
        return "pending"
    }

    return "unknown"
}

function Get-ModuleRunV2ValidationSurface {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

    $validationPolicy = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "validationPolicy"
    if (-not [string]::IsNullOrWhiteSpace($validationPolicy)) {
        return $validationPolicy
    }

    $validationProfile = Get-ModuleRunV2ScalarValue -Block $TaskBlock -Key "validationProfile"
    if (-not [string]::IsNullOrWhiteSpace($validationProfile)) {
        return $validationProfile
    }

    return ""
}

function Get-ModuleRunV2OutputValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}
