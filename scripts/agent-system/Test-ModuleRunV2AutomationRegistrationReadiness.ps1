param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [string]$AutomationRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$OnDemandAutomationRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$ExpectedAutomationId = ""
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

function Write-RegistrationResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$StopTaxonomy,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "automationRegistrationDecision: $Decision"
    Write-Output "stopTaxonomy: $StopTaxonomy"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-ProjectScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Lines) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim().Trim('"')
        }
    }

    return ""
}

function Get-TomlString {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if ($Content -match "(?m)^\s*$([regex]::Escape($Key))\s*=\s*""((?:\\""|[^""])*)""\s*$") {
        return ($Matches[1] -replace '\\"', '"')
    }

    return ""
}

function Test-PromptAnchor {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Prompt,
        [Parameter(Mandatory = $true)][string]$Anchor,
        [Parameter(Mandatory = $true)][string]$Code
    )

    if ($Prompt -notmatch [regex]::Escape($Anchor)) {
        Add-Finding "$Code $Anchor"
    } else {
        Write-Output "OK_PROMPT_ANCHOR $Anchor"
    }
}

$findings = New-Object System.Collections.Generic.List[string]
$registrationPlannedPauseForTuning = $false
$registrationStatusMismatchFound = $false
$registrationStatusMismatchProjectStatus = ""
$registrationStatusMismatchTomlStatus = ""
$registrationStatusMismatchTomlPath = ""

try {
    Write-Section -Title "Module Run v2 Automation Registration Readiness"
    Write-Output "automationRegistrationMode: hard_block"

    if ([string]::IsNullOrWhiteSpace($AutomationRoot)) {
        $AutomationRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\automations"
    }
    if ([string]::IsNullOrWhiteSpace($OnDemandAutomationRoot)) {
        $OnDemandAutomationRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\automation-on-demand"
    }

    Write-Output "automationRoot: $AutomationRoot"
    Write-Output "onDemandAutomationRoot: $OnDemandAutomationRoot"

    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        Add-Finding "HARD_BLOCK_MISSING_PROJECT_STATE $ProjectStatePath"
        Write-RegistrationResult -Decision "stop_for_hard_block" -StopTaxonomy "registration_mismatch" -Reason "project state is missing" -ExitCode 1
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $projectAutomationId = Get-ProjectScalar -Lines $projectStateLines -Key "codexAutomationId"
    $projectAutomationStatus = Get-ProjectScalar -Lines $projectStateLines -Key "codexAutomationStatus"
    $plannedPauseStatus = Get-ProjectScalar -Lines $projectStateLines -Key "plannedPauseStatus"
    $plannedPauseReason = Get-ProjectScalar -Lines $projectStateLines -Key "plannedPauseReason"
    $plannedPauseKeepsAutomationPaused = Get-ProjectScalar -Lines $projectStateLines -Key "plannedPauseKeepsAutomationPaused"
    if ([string]::IsNullOrWhiteSpace($ExpectedAutomationId)) {
        $ExpectedAutomationId = $projectAutomationId
    }

    Write-Output "projectCodexAutomationId: $projectAutomationId"
    Write-Output "projectCodexAutomationStatus: $projectAutomationStatus"
    Write-Output "expectedAutomationId: $ExpectedAutomationId"
    Write-Output "plannedPauseStatus: $(if ([string]::IsNullOrWhiteSpace($plannedPauseStatus)) { 'none' } else { $plannedPauseStatus })"
    if (-not [string]::IsNullOrWhiteSpace($plannedPauseReason)) {
        Write-Output "plannedPauseReason: $plannedPauseReason"
    }

    if ([string]::IsNullOrWhiteSpace($projectAutomationId) -or [string]::IsNullOrWhiteSpace($projectAutomationStatus)) {
        Write-RegistrationResult -Decision "not_configured" -StopTaxonomy "no_task" -Reason "project-state has no codex automation registration" -ExitCode 0
    }

    if ($projectAutomationId -ne $ExpectedAutomationId) {
        Add-Finding "HARD_BLOCK_PROJECT_AUTOMATION_ID_MISMATCH expected=$ExpectedAutomationId actual=$projectAutomationId"
    }

    if (-not (Test-Path -LiteralPath $AutomationRoot)) {
        Add-Finding "HARD_BLOCK_MISSING_AUTOMATION_ROOT $AutomationRoot"
    } else {
        $automationDirs = New-Object System.Collections.Generic.List[object]
        $allAutomationDirs = @(Get-ChildItem -LiteralPath $AutomationRoot -Directory -ErrorAction SilentlyContinue)
        foreach ($automationDir in $allAutomationDirs) {
            $automationTomlPath = Join-Path -Path $automationDir.FullName -ChildPath "automation.toml"
            if (-not (Test-Path -LiteralPath $automationTomlPath)) {
                continue
            }

            $automationToml = Get-Content -LiteralPath $automationTomlPath -Raw
            $automationStatus = Get-TomlString -Content $automationToml -Key "status"
            Write-Output "automationRegistration: $($automationDir.Name); status=$automationStatus"
            if ($automationStatus -eq "ACTIVE") {
                $automationDirs.Add($automationDir) | Out-Null
            }
        }
        Write-Output "activeAutomationRegistrationCount: $($automationDirs.Count)"
        foreach ($automationDir in $automationDirs) {
            Write-Output "activeAutomationRegistration: $($automationDir.Name)"
            if ($automationDir.Name -ne $ExpectedAutomationId) {
                Add-Finding "HARD_BLOCK_UNEXPECTED_ACTIVE_AUTOMATION $($automationDir.Name)"
            }
        }

        $expectedTomlPath = Join-Path -Path (Join-Path -Path $AutomationRoot -ChildPath $ExpectedAutomationId) -ChildPath "automation.toml"
        if (-not (Test-Path -LiteralPath $expectedTomlPath)) {
            Add-Finding "HARD_BLOCK_MISSING_PRIMARY_AUTOMATION_TOML $expectedTomlPath"
        } else {
            $tomlContent = Get-Content -LiteralPath $expectedTomlPath -Raw
            $tomlId = Get-TomlString -Content $tomlContent -Key "id"
            $tomlStatus = Get-TomlString -Content $tomlContent -Key "status"
            $tomlPrompt = Get-TomlString -Content $tomlContent -Key "prompt"

            Write-Output "tomlAutomationId: $tomlId"
            Write-Output "tomlAutomationStatus: $tomlStatus"

            if ($tomlId -ne $ExpectedAutomationId) {
                Add-Finding "HARD_BLOCK_TOML_AUTOMATION_ID_MISMATCH expected=$ExpectedAutomationId actual=$tomlId"
            }
            $isPlannedPauseForTuning = $projectAutomationStatus -eq "ACTIVE" `
                -and $tomlStatus -eq "PAUSED" `
                -and $plannedPauseStatus -eq "active" `
                -and $plannedPauseKeepsAutomationPaused -eq "true"

            if ($tomlStatus -ne $projectAutomationStatus -and -not $isPlannedPauseForTuning) {
                Add-Finding "HARD_BLOCK_AUTOMATION_STATUS_MISMATCH project=$projectAutomationStatus toml=$tomlStatus"
                $script:registrationStatusMismatchFound = $true
                $script:registrationStatusMismatchProjectStatus = $projectAutomationStatus
                $script:registrationStatusMismatchTomlStatus = $tomlStatus
                $script:registrationStatusMismatchTomlPath = $expectedTomlPath
            }
            if ($projectAutomationStatus -eq "ACTIVE" -and $tomlStatus -ne "ACTIVE" -and -not $isPlannedPauseForTuning) {
                Add-Finding "HARD_BLOCK_PRIMARY_AUTOMATION_NOT_ACTIVE status=$tomlStatus"
            }
            if ($isPlannedPauseForTuning) {
                $registrationPlannedPauseForTuning = $true
                Write-Output "plannedPauseForTuning: true"
                Write-Output "plannedPauseLocalAutomationStatus: $tomlStatus"
            }

            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "Current automation identity map" -Code "HARD_BLOCK_MISSING_PROMPT_IDENTITY_MAP"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "tiku-module-run-v2-autopilot" -Code "HARD_BLOCK_MISSING_PROMPT_PRIMARY_IDENTITY"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "tiku-module-run-v2-autopilot-2" -Code "HARD_BLOCK_MISSING_PROMPT_HISTORICAL_AUTOPILOT"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "mechanic-2" -Code "HARD_BLOCK_MISSING_PROMPT_MECHANIC_BOUNDARY"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "on-demand" -Code "HARD_BLOCK_MISSING_PROMPT_ON_DEMAND_BOUNDARY"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "standingUnattendedLocalCloseoutApproval" -Code "HARD_BLOCK_MISSING_PROMPT_STANDING_CLOSEOUT"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "low-risk local implementation tasks only" -Code "HARD_BLOCK_MISSING_PROMPT_LOW_RISK_LOCAL_IMPLEMENTATION_SCOPE"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "local commit" -Code "HARD_BLOCK_MISSING_PROMPT_LOCAL_COMMIT_CLOSEOUT"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "fast-forward merge to master" -Code "HARD_BLOCK_MISSING_PROMPT_FAST_FORWARD_MERGE_CLOSEOUT"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "push origin/master" -Code "HARD_BLOCK_MISSING_PROMPT_PUSH_CLOSEOUT"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "merged short-branch cleanup" -Code "HARD_BLOCK_MISSING_PROMPT_BRANCH_CLEANUP_CLOSEOUT"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "worktree parking" -Code "HARD_BLOCK_MISSING_PROMPT_WORKTREE_PARKING_CLOSEOUT"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "High-risk capability gates remain blocked" -Code "HARD_BLOCK_MISSING_PROMPT_HIGH_RISK_BLOCKED"
            Test-PromptAnchor -Prompt $tomlPrompt -Anchor "Embedded mechanic policy" -Code "HARD_BLOCK_MISSING_PROMPT_EMBEDDED_MECHANIC_POLICY"
        }
    }

    $onDemandMechanicPath = Join-Path -Path $OnDemandAutomationRoot -ChildPath "tiku-module-run-v2-mechanic-2\automation.toml"
    if (Test-Path -LiteralPath $onDemandMechanicPath) {
        $mechanicToml = Get-Content -LiteralPath $onDemandMechanicPath -Raw
        $mechanicStatus = Get-TomlString -Content $mechanicToml -Key "status"
        Write-Output "onDemandMechanic2Status: $mechanicStatus"
        if ($mechanicStatus -eq "ACTIVE") {
            Add-Finding "HARD_BLOCK_ON_DEMAND_MECHANIC_ACTIVE"
        }
    } else {
        Write-Output "onDemandMechanic2Status: not_present"
    }

    if ($findings.Count -gt 0) {
        if ($registrationStatusMismatchFound) {
            Write-Output "registrationReconcileAction: align_project_state_or_toml"
            Write-Output "registrationReconcileStatePath: $ProjectStatePath"
            Write-Output "registrationReconcileTomlPath: $registrationStatusMismatchTomlPath"
            Write-Output "registrationReconcileObservedStatus: project=$registrationStatusMismatchProjectStatus; toml=$registrationStatusMismatchTomlStatus"
            Write-Output "registrationReconcileNextCommand: record an activation reconcile task or restore the primary automation TOML status before rerun"
        }
        Write-RegistrationResult -Decision "stop_for_hard_block" -StopTaxonomy "registration_mismatch" -Reason "automation registration failed with $($findings.Count) finding(s)" -ExitCode 1
    }

    if ($registrationPlannedPauseForTuning) {
        Write-RegistrationResult -Decision "planned_pause_for_tuning" -StopTaxonomy "planned_pause" -Reason "local automation is intentionally paused for mechanism tuning" -ExitCode 0
    }

    Write-RegistrationResult -Decision "ready" -StopTaxonomy "no_task" -Reason "automation registration is consistent" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_AUTOMATION_REGISTRATION_EXCEPTION $($_.Exception.Message)"
    Write-RegistrationResult -Decision "stop_for_hard_block" -StopTaxonomy "registration_mismatch" -Reason "automation registration script exception" -ExitCode 1
}
