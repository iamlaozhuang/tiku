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

$codexConfigPath = "C:\Users\laozhuang\.codex\config.toml"
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

$superpowersPluginRootPath = "C:\Users\laozhuang\.codex\plugins\cache\openai-curated\superpowers"
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

$skillRootPath = "C:\Users\laozhuang\.codex\skills"
$skillNames = @(
    "ralplan",
    "ralph",
    "code-review",
    "code-simplifier",
    "drizzle-orm-expert",
    "postgresql",
    "postgres-best-practices",
    "nextjs-app-router-patterns",
    "nextjs-best-practices",
    "react-nextjs-development",
    "shadcn",
    "tailwind-design-system",
    "tailwind-patterns",
    "vercel-ai-sdk-expert",
    "rag-engineer",
    "rag-implementation",
    "playwright",
    "webapp-testing",
    "e2e-testing",
    "security-best-practices",
    "security-threat-model",
    "tdd-orchestrator",
    "tdd-workflow",
    "testing-patterns"
)

foreach ($skillName in $skillNames) {
    $skillPath = Join-Path -Path $skillRootPath -ChildPath $skillName
    if (Test-Path $skillPath) {
        Write-Output "OK skill path: $skillName"
    } else {
        Write-Output "MISSING skill path: $skillName"
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
