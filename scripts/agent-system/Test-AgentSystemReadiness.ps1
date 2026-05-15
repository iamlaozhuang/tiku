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
    "docs\04-agent-system\state\project-state.yaml",
    "docs\04-agent-system\state\task-queue.yaml",
    "docs\04-agent-system\milestones-goals\mvp-roadmap.md",
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
foreach ($qualityScriptName in @("lint", "typecheck", "test")) {
    if ($scriptNames -contains $qualityScriptName) {
        Write-Output "OK npm script: $qualityScriptName"
    } else {
        Write-Output "MISSING npm script: $qualityScriptName"
    }
}

$skillRootPath = "C:\Users\laozhuang\.codex\skills"
$skillNames = @(
    "ralplan",
    "ralph",
    "autopilot",
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
    "playwright-skill",
    "webapp-testing",
    "e2e-testing",
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

Write-Output "NOTE: Newly installed local skills require restarting Codex before they appear in the active skill list."

if ($missingRequiredFileCount -gt 0) {
    throw "Agent system readiness failed because required files are missing."
}
