$ErrorActionPreference = "Stop"

$requiredFilePaths = @(
    "AGENTS.md",
    "docs\03-standards\code-taste-ten-commandments.md",
    "docs\02-architecture\adr\adr-001-tech-stack-selection.md",
    "docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md",
    "docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md",
    "docs\02-architecture\interfaces\global-db-api-skeleton.md",
    "docs\04-agent-system\sop\automation-loop.md",
    "docs\04-agent-system\sop\skill-dispatch-matrix.md",
    "docs\04-agent-system\sop\dependency-introduction-gate.md",
    "docs\04-agent-system\sop\security-review-gate.md",
    "docs\04-agent-system\state\project-state.yaml",
    "docs\04-agent-system\state\task-queue.yaml",
    "docs\04-agent-system\milestones-goals\mvp-roadmap.md",
    "scripts\agent-system\Test-GitCompletionReadiness.ps1",
    "scripts\agent-system\Test-NamingConventions.ps1",
    "scripts\agent-system\Test-TaskClaimReadiness.ps1",
    "scripts\agent-system\Add-TaskEvidenceResult.ps1",
    "scripts\agent-system\New-TaskEvidence.ps1",
    "package.json"
)

$missingRequiredFileCount = 0
foreach ($requiredFilePath in $requiredFilePaths) {
    if (Test-Path $requiredFilePath) {
        Write-Output "OK file: $requiredFilePath"
    } else {
        Write-Output "MISSING file: $requiredFilePath"
        $missingRequiredFileCount++
    }
}

$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$scriptNames = $packageJson.scripts.PSObject.Properties.Name
$missingQualityScriptCount = 0
foreach ($qualityScriptName in @("lint", "typecheck", "test", "test:unit", "format:check")) {
    if ($scriptNames -contains $qualityScriptName) {
        Write-Output "OK npm script: $qualityScriptName"
    } else {
        Write-Output "MISSING npm script: $qualityScriptName"
        $missingQualityScriptCount++
    }
}

$codexHomePath = $env:CODEX_HOME
if ([string]::IsNullOrWhiteSpace($codexHomePath)) {
    $codexHomePath = Join-Path -Path $env:USERPROFILE -ChildPath ".codex"
}

Write-Output "Codex home: $codexHomePath"

$codexConfigPath = Join-Path -Path $codexHomePath -ChildPath "config.toml"
if (Test-Path $codexConfigPath) {
    $codexConfig = Get-Content -Path $codexConfigPath -Raw
    if ($codexConfig -match '\[plugins\."superpowers@openai-curated"\]' -and $codexConfig -match '\[plugins\."superpowers@openai-curated"\]\s*enabled\s*=\s*true') {
        Write-Output "OK plugin enabled: superpowers@openai-curated"
    } else {
        Write-Output "MISSING plugin enabled: superpowers@openai-curated"
    }
} else {
    Write-Output "MISSING Codex config: $codexConfigPath"
}

$superpowersPluginRootPath = Join-Path -Path $codexHomePath -ChildPath "plugins\cache\openai-curated\superpowers"
$superpowersSkillNames = @(
    "brainstorming",
    "dispatching-parallel-agents",
    "executing-plans",
    "finishing-a-development-branch",
    "receiving-code-review",
    "requesting-code-review",
    "subagent-driven-development",
    "systematic-debugging",
    "test-driven-development",
    "using-git-worktrees",
    "using-superpowers",
    "verification-before-completion",
    "writing-plans",
    "writing-skills"
)

if (Test-Path $superpowersPluginRootPath) {
    $superpowersPluginSkillRoots = Get-ChildItem -Path $superpowersPluginRootPath -Directory -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -eq "skills" }

    foreach ($skillName in $superpowersSkillNames) {
        $skillFound = $false
        foreach ($skillRoot in $superpowersPluginSkillRoots) {
            $skillPath = Join-Path -Path $skillRoot.FullName -ChildPath $skillName
            if (Test-Path $skillPath) {
                $skillFound = $true
                break
            }
        }

        if ($skillFound) {
            Write-Output "OK superpowers skill path: $skillName"
        } else {
            Write-Output "MISSING superpowers skill path: $skillName"
        }
    }
} else {
    Write-Output "MISSING plugin cache: superpowers@openai-curated"
}

$skillRootPath = Join-Path -Path $codexHomePath -ChildPath "skills"

function Test-LocalSkillPath {
    param([string]$SkillName)

    $skillPath = Join-Path -Path $skillRootPath -ChildPath $SkillName
    return Test-Path $skillPath
}

function Test-PluginSkillPath {
    param(
        [string]$PluginName,
        [string]$SkillName
    )

    $pluginRootPath = Join-Path -Path $codexHomePath -ChildPath "plugins\cache\openai-curated\$PluginName"
    if (-not (Test-Path $pluginRootPath)) {
        return $false
    }

    $pluginSkillPath = Get-ChildItem -Path $pluginRootPath -Recurse -Filter "SKILL.md" -ErrorAction SilentlyContinue |
        Where-Object { (Split-Path -Leaf (Split-Path -Parent $_.FullName)) -eq $SkillName } |
        Select-Object -First 1

    return $null -ne $pluginSkillPath
}

$capabilityChecks = @(
    [PSCustomObject]@{ Name = "ralplan"; LocalSkills = @("ralplan"); PluginSkills = @(); Optional = $true; Notes = "No trusted local or plugin source configured." },
    [PSCustomObject]@{ Name = "ralph"; LocalSkills = @("ralph"); PluginSkills = @(); Optional = $true; Notes = "No trusted local or plugin source configured." },
    [PSCustomObject]@{ Name = "code-review"; LocalSkills = @("code-review"); PluginSkills = @(@("coderabbit", "coderabbit-review"), @("superpowers", "requesting-code-review")); Optional = $false; Notes = "Covered by CodeRabbit and Superpowers review workflows." },
    [PSCustomObject]@{ Name = "code-simplifier"; LocalSkills = @("code-simplifier"); PluginSkills = @(); Optional = $true; Notes = "No trusted local or plugin source configured." },
    [PSCustomObject]@{ Name = "drizzle-orm-expert"; LocalSkills = @("drizzle-orm-expert"); PluginSkills = @(); Optional = $true; Notes = "No exact trusted source configured; rely on project ADR and Drizzle docs when needed." },
    [PSCustomObject]@{ Name = "postgresql"; LocalSkills = @("postgresql"); PluginSkills = @(@("build-web-apps", "supabase-best-practices")); Optional = $false; Notes = "Covered by Postgres best-practice plugin guidance." },
    [PSCustomObject]@{ Name = "postgres-best-practices"; LocalSkills = @("postgres-best-practices"); PluginSkills = @(@("build-web-apps", "supabase-best-practices")); Optional = $false; Notes = "Covered by Postgres best-practice plugin guidance." },
    [PSCustomObject]@{ Name = "nextjs-app-router-patterns"; LocalSkills = @("nextjs-app-router-patterns"); PluginSkills = @(@("vercel", "nextjs")); Optional = $false; Notes = "Covered by Vercel Next.js skill." },
    [PSCustomObject]@{ Name = "nextjs-best-practices"; LocalSkills = @("nextjs-best-practices"); PluginSkills = @(@("vercel", "nextjs"), @("build-web-apps", "react-best-practices")); Optional = $false; Notes = "Covered by Vercel Next.js and React best-practice skills." },
    [PSCustomObject]@{ Name = "react-nextjs-development"; LocalSkills = @("react-nextjs-development"); PluginSkills = @(@("build-web-apps", "react-best-practices"), @("vercel", "react-best-practices")); Optional = $false; Notes = "Covered by React and Next.js plugin guidance." },
    [PSCustomObject]@{ Name = "shadcn"; LocalSkills = @("shadcn"); PluginSkills = @(@("build-web-apps", "shadcn-best-practices"), @("vercel", "shadcn")); Optional = $false; Notes = "Covered by shadcn plugin guidance." },
    [PSCustomObject]@{ Name = "tailwind-design-system"; LocalSkills = @("tailwind-design-system"); PluginSkills = @(@("build-web-apps", "frontend-app-builder"), @("build-web-apps", "shadcn-best-practices")); Optional = $false; Notes = "Covered by frontend builder and shadcn guidance." },
    [PSCustomObject]@{ Name = "tailwind-patterns"; LocalSkills = @("tailwind-patterns"); PluginSkills = @(@("build-web-apps", "frontend-app-builder")); Optional = $false; Notes = "Covered by frontend builder guidance." },
    [PSCustomObject]@{ Name = "vercel-ai-sdk-expert"; LocalSkills = @("vercel-ai-sdk-expert"); PluginSkills = @(@("vercel", "ai-sdk")); Optional = $false; Notes = "Covered by Vercel AI SDK skill." },
    [PSCustomObject]@{ Name = "rag-engineer"; LocalSkills = @("rag-engineer"); PluginSkills = @(); Optional = $true; Notes = "No exact trusted source configured; use AI SDK and Postgres skills plus project ADRs." },
    [PSCustomObject]@{ Name = "rag-implementation"; LocalSkills = @("rag-implementation"); PluginSkills = @(); Optional = $true; Notes = "No exact trusted source configured; use AI SDK and Postgres skills plus project ADRs." },
    [PSCustomObject]@{ Name = "playwright"; LocalSkills = @("playwright"); PluginSkills = @(); Optional = $false; Notes = "Installed as a local skill." },
    [PSCustomObject]@{ Name = "playwright-interactive"; LocalSkills = @("playwright-interactive"); PluginSkills = @(); Optional = $false; Notes = "Installed as a local curated skill." },
    [PSCustomObject]@{ Name = "webapp-testing"; LocalSkills = @("webapp-testing"); PluginSkills = @(@("build-web-apps", "frontend-testing-debugging"), @("vercel", "verification")); Optional = $false; Notes = "Covered by frontend testing and verification plugin guidance." },
    [PSCustomObject]@{ Name = "e2e-testing"; LocalSkills = @("e2e-testing", "playwright"); PluginSkills = @(@("build-web-apps", "frontend-testing-debugging")); Optional = $false; Notes = "Covered by local Playwright plus frontend testing guidance." },
    [PSCustomObject]@{ Name = "security-best-practices"; LocalSkills = @("security-best-practices"); PluginSkills = @(); Optional = $false; Notes = "Installed as a local skill." },
    [PSCustomObject]@{ Name = "security-threat-model"; LocalSkills = @("security-threat-model"); PluginSkills = @(); Optional = $false; Notes = "Installed as a local skill." },
    [PSCustomObject]@{ Name = "tdd-orchestrator"; LocalSkills = @("tdd-orchestrator"); PluginSkills = @(@("superpowers", "test-driven-development")); Optional = $false; Notes = "Covered by Superpowers TDD workflow." },
    [PSCustomObject]@{ Name = "tdd-workflow"; LocalSkills = @("tdd-workflow"); PluginSkills = @(@("superpowers", "test-driven-development")); Optional = $false; Notes = "Covered by Superpowers TDD workflow." },
    [PSCustomObject]@{ Name = "testing-patterns"; LocalSkills = @("testing-patterns"); PluginSkills = @(@("superpowers", "test-driven-development"), @("build-web-apps", "frontend-testing-debugging")); Optional = $false; Notes = "Covered by TDD and frontend testing guidance." },
    [PSCustomObject]@{ Name = "github-publish"; LocalSkills = @("yeet"); PluginSkills = @(@("github", "yeet")); Optional = $false; Notes = "Installed locally and covered by GitHub plugin." },
    [PSCustomObject]@{ Name = "github-pr-feedback"; LocalSkills = @("gh-address-comments"); PluginSkills = @(@("github", "gh-address-comments")); Optional = $false; Notes = "Installed locally and covered by GitHub plugin." },
    [PSCustomObject]@{ Name = "github-ci-debug"; LocalSkills = @("gh-fix-ci"); PluginSkills = @(@("github", "gh-fix-ci")); Optional = $false; Notes = "Installed locally and covered by GitHub plugin." }
)

foreach ($capabilityCheck in $capabilityChecks) {
    $localMatches = @()
    foreach ($localSkillName in $capabilityCheck.LocalSkills) {
        if (Test-LocalSkillPath -SkillName $localSkillName) {
            $localMatches += $localSkillName
        }
    }

    $pluginMatches = @()
    $pluginSkillItems = @()
    foreach ($pluginSkillItem in @($capabilityCheck.PluginSkills)) {
        if ($pluginSkillItem -is [array]) {
            $pluginSkillItems += $pluginSkillItem[0]
            $pluginSkillItems += $pluginSkillItem[1]
        } else {
            $pluginSkillItems += $pluginSkillItem
        }
    }

    for ($pluginSkillIndex = 0; $pluginSkillIndex -lt $pluginSkillItems.Count; $pluginSkillIndex += 2) {
        $pluginName = $pluginSkillItems[$pluginSkillIndex]
        $pluginSkillName = $pluginSkillItems[$pluginSkillIndex + 1]
        if (Test-PluginSkillPath -PluginName $pluginName -SkillName $pluginSkillName) {
            $pluginMatches += "$($pluginName):$($pluginSkillName)"
        }
    }

    if ($localMatches.Count -gt 0) {
        Write-Output "OK local skill capability: $($capabilityCheck.Name) via $($localMatches -join ', ')"
    } elseif ($pluginMatches.Count -gt 0) {
        Write-Output "OK plugin-covered capability: $($capabilityCheck.Name) via $($pluginMatches -join ', ')"
    } elseif ($capabilityCheck.Optional) {
        Write-Output "OPTIONAL unresolved capability: $($capabilityCheck.Name) - $($capabilityCheck.Notes)"
    } else {
        Write-Output "MISSING required capability: $($capabilityCheck.Name) - $($capabilityCheck.Notes)"
    }
}

$reservedSkillNames = @("autopilot")
foreach ($skillName in $reservedSkillNames) {
    $skillPath = Join-Path -Path $skillRootPath -ChildPath $skillName
    if (Test-Path $skillPath) {
        Write-Output "RESERVED skill path present but inactive unless explicitly enabled: $skillName"
    } else {
        Write-Output "RESERVED skill path not installed: $skillName"
    }
}

Write-Output "NOTE: Newly installed local skills require restarting Codex before they appear in the active skill list."

if ($missingRequiredFileCount -gt 0) {
    throw "Agent system readiness failed because required files are missing."
}

if ($missingQualityScriptCount -gt 0) {
    throw "Agent system readiness failed because quality scripts are missing."
}
