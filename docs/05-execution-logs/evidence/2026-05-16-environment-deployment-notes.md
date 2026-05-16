# Evidence: Environment Deployment Notes

## Date

2026-05-16

## Scope

Persist the user-provided development and deployment context:

- Development machine: Windows 11.
- Agent environment: Codex desktop.
- Docker is available.
- Domestic AI models include DeepSeek and Qwen.
- Production deployment target is Tencent Cloud.

## Files Created Or Updated

- `docs/02-architecture/system-design/development-and-deployment-environment.md`
- `docs/05-execution-logs/task-plans/2026-05-16-environment-deployment-notes.md`
- `docs/05-execution-logs/evidence/2026-05-16-environment-deployment-notes.md`

## Commands Run

Readiness:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result:

```text
OK file: AGENTS.md
OK file: docs\03-standards\code-taste-ten-commandments.md
OK file: docs\02-architecture\adr\adr-001-tech-stack-selection.md
OK file: docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md
OK file: docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md
OK file: docs\02-architecture\interfaces\global-db-api-skeleton.md
OK file: docs\04-agent-system\sop\automation-loop.md
OK file: docs\04-agent-system\sop\skill-dispatch-matrix.md
OK file: docs\04-agent-system\sop\dependency-introduction-gate.md
OK file: docs\04-agent-system\state\project-state.yaml
OK file: docs\04-agent-system\state\task-queue.yaml
OK file: docs\04-agent-system\milestones-goals\mvp-roadmap.md
OK file: package.json
OK npm script: lint
OK npm script: typecheck
MISSING npm script: test
OK skill path: ralplan
OK skill path: ralph
OK skill path: autopilot
OK skill path: code-review
OK skill path: code-simplifier
OK skill path: drizzle-orm-expert
OK skill path: postgresql
OK skill path: postgres-best-practices
OK skill path: nextjs-app-router-patterns
OK skill path: nextjs-best-practices
OK skill path: react-nextjs-development
OK skill path: shadcn
OK skill path: tailwind-design-system
OK skill path: tailwind-patterns
OK skill path: vercel-ai-sdk-expert
OK skill path: rag-engineer
OK skill path: rag-implementation
OK skill path: playwright-skill
OK skill path: webapp-testing
OK skill path: e2e-testing
OK skill path: tdd-orchestrator
OK skill path: tdd-workflow
OK skill path: testing-patterns
NOTE: Newly installed local skills require restarting Codex before they appear in the active skill list.
```

Quality gate:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result:

```text
RUN npm script: lint

> tiku-scaffold@0.1.0 lint
> eslint

RUN npm script: typecheck

> tiku-scaffold@0.1.0 typecheck
> tsc --noEmit

MISSING npm script: test
```
