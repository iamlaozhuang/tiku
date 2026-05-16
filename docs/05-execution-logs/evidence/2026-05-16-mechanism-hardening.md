# Evidence: Mechanism Hardening

## Date

2026-05-16

## Scope

Repair governance and automation gaps found in the semi-automation review without adding dependencies or starting business feature implementation.

## Files Created Or Updated

- `AGENTS.md`
- `docs/03-standards/coding-style.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/system-design/frontend/01-style-tone.md`
- `docs/02-architecture/system-design/frontend/02-design-tokens.json`
- `eslint.config.mjs`
- `docs/06-issue-tracking/README.md`
- `docs/06-issue-tracking/bug-reports/README.md`
- `next.config.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `docs/05-execution-logs/task-plans/2026-05-16-mechanism-hardening.md`
- `docs/05-execution-logs/evidence/2026-05-16-mechanism-hardening.md`

## Decisions

- No dependencies were added or upgraded in this task.
- The missing `test` script remains an explicit Phase 1 gate to be handled by `phase-1-test-tooling-decision`.
- Remote repository setup remains unconfigured and must be handled by a separate task after a real remote target is provided.
- UI font policy now uses Noto Sans SC and JetBrains Mono; default Inter is not part of the active design baseline.
- Next.js Turbopack root is pinned to `process.cwd()` to keep nested worktree builds from inferring the parent repository as the workspace root.
- ESLint now ignores `.worktrees/**` and nested build/dependency outputs so isolated worktrees cannot pollute root quality gates.

## Validation

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

Build:

```powershell
npm.cmd run build
```

Initial sandbox result:

```text
Build compiled successfully, then failed during TypeScript with spawn EPERM.
```

Escalated result:

```text
Compiled successfully.
Finished TypeScript.
Generated static pages using 7 workers (8/8).
Routes generated: /, /_not-found, /content/papers, /design-system, /home, /login, /ops/users.
```

Merge-gate finding:

```text
Fast-forward merge succeeded, but the post-merge quality gate initially failed because ESLint scanned .worktrees/codex-mechanism-hardening/.next build artifacts.
```

Remediation:

```text
Added ESLint global ignores for .worktrees/** and nested build/dependency outputs, then re-ran the local gates.
```

Post-remediation validation:

```text
Readiness: passed; missing test script remains explicitly reported.
Quality gate: lint passed; typecheck passed; missing test script remains explicitly reported.
Build: passed with escalated execution because the non-escalated sandbox previously returned spawn EPERM during the Next.js TypeScript stage.
```

Residual gap:

- `test` script remains missing by design until `phase-1-test-tooling-decision` selects tooling and records human approval for dependencies.
