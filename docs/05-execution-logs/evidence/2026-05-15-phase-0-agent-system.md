# Evidence: Phase 0 Agent System

## Date

2026-05-15

## Scope

This evidence records Phase 0 architecture freeze and automation control work on branch `codex/agent-system-phase-0`.

## Files Created Or Updated

- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `scripts/agent-system/Read-ProjectState.ps1`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `scripts/agent-system/New-TaskPlan.ps1`
- `scripts/agent-system/Update-TaskStatus.ps1`
- `scripts/agent-system/New-FailureReport.ps1`
- `scripts/agent-system/Invoke-QualityGate.ps1`
- `.husky/pre-commit`
- `.husky/_/pre-commit`
- `.husky/_/h`
- `package.json`
- `tsconfig.json`
- `eslint.config.mjs`

## Commits

- `d7efd26 docs(architecture): add multi-client runtime adr`
- `094c3fd docs(architecture): add workplace desktop compatibility adr`
- `c06e0ef docs(architecture): add global db api skeleton`
- `84df887 docs(agent): add automation sops`
- `2fa81af docs(agent): add automation state and roadmap`
- `2d124d5 feat(agent): add automation script skeleton`
- `5e33fe3 chore(agent): tighten local automation gates`

## Commands Run

```powershell
Test-Path 'docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md'
Select-String -Path 'docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md' -Pattern 'Server Actions only|no REST|without API'
Test-Path 'docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md'
Select-String -Path 'docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md' -Pattern 'certified|已认证|完全符合|采购合规'
Test-Path 'docs\02-architecture\interfaces\global-db-api-skeleton.md'
Select-String -Path 'docs\02-architecture\interfaces\global-db-api-skeleton.md' -Pattern 'license|exam_paper'
Get-ChildItem -Path 'scripts\agent-system' -Filter '*.ps1' | ForEach-Object { [System.Management.Automation.PSParser]::Tokenize((Get-Content $_.FullName -Raw), [ref]$null) }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Read-ProjectState.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run typecheck
npm.cmd run lint
& 'C:\Program Files\Git\bin\sh.exe' '.husky/_/pre-commit'
git commit -m "chore(agent): tighten local automation gates"
```

## Command Outputs

Readiness check:

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

```text
RUN npm script: lint
> tiku-scaffold@0.1.0 lint
> eslint

RUN npm script: typecheck
> tiku-scaffold@0.1.0 typecheck
> tsc --noEmit

MISSING npm script: test
```

Pre-commit hook:

```text
> tiku-scaffold@0.1.0 lint F:\tiku\.worktrees\codex-agent-system-phase-0
> eslint

> tiku-scaffold@0.1.0 typecheck F:\tiku\.worktrees\codex-agent-system-phase-0
> tsc --noEmit
```

## Missing Gates

- `test` npm script is intentionally not added in Phase 0 because test tooling has not been selected or approved.
- `lint-staged` is not used in the current hook because it is not installed and adding it would be a dependency change requiring human approval.

## Plan Deviations

- The original hook plan mentioned `pnpm exec lint-staged`. The implemented hook uses `pnpm run lint` and `pnpm run typecheck` so the gate is immediately executable without adding a dependency.
- The repository `core.hooksPath` points to `.husky/_`, so `.husky/_/pre-commit` and `.husky/_/h` were added alongside `.husky/pre-commit` to make the real Git hook path enforce the same gate.
- Direct `.ps1` execution is blocked by the local PowerShell execution policy. Automation commands should use `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <script>` on this machine.

## Reviews

- Task 4/5 document review found no blocking issues after state fixes.
- Task 6 script review found no blocking issues.
- Task 7 gate review found the hook path issue; the issue was fixed by adding `.husky/_/pre-commit` and shared `.husky/_/h`, then verified.

## Next Recommended Action

Start Phase 1 foundation work from the Phase 0 state source:

1. Restart Codex so newly installed local skills appear in the active skill list.
2. Read `docs/04-agent-system/state/project-state.yaml`.
3. Claim the first Phase 1 task only after it has a scoped task plan and approval status.
4. Select test tooling before adding a `test` npm script.
