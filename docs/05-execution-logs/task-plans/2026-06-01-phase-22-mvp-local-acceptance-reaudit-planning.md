# Phase 22 MVP Local Acceptance Re-Audit Planning

## Summary

- Task id: `phase-22-mvp-local-acceptance-reaudit-planning`
- Branch: `codex/phase-22-mvp-local-acceptance-reaudit-planning`
- Base: `master`
- Goal: persist Phase 22 planning, reuse the existing 64-item requirement matrix, and define the local MVP acceptance verification plan without executing runtime or DB work.

## Startup Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Latest evidence: `docs/05-execution-logs/evidence/2026-06-01-fresh-local-dev-db-validation-flow-docs.md`
- Phase 18/19 audit reports and requirement traceability matrix.

## Scope

Allowed files:

- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/2026-06-01-phase-22-mvp-local-acceptance-reaudit-planning.md`

Blocked:

- `.env.local`, `.env.example`
- package and lockfiles
- `scripts/**`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- DB connection, migration, seed/bootstrap, raw SQL, `drizzle-kit push`, destructive data, dev server, browser verification, e2e, staging/prod/cloud/deploy, real provider, external service

## Work Plan

1. Persist the Phase 22 roadmap and interface contract.
2. Register the current docs-only planning task and a future local verification task.
3. Produce a re-audit planning report that:
   - confirms the old 64-item baseline;
   - maps Phase 22 status vocabulary;
   - groups the 64 rows into six local user journeys;
   - separates local product gaps from staging release blockers;
   - records required approvals before runtime verification.
4. Write evidence and run declared docs-only validation gates.

## Validation Commands

```powershell
git status --short --branch
git rev-list --left-right --count master...origin/master
git branch --list
git branch --no-merged master
git worktree list
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\02-architecture\interfaces\phase-22-mvp-local-acceptance-reaudit-contract.md docs\04-agent-system\milestones-goals\mvp-roadmap.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-01-phase-22-mvp-local-acceptance-reaudit-planning.md docs\05-execution-logs\evidence\2026-06-01-phase-22-mvp-local-acceptance-reaudit-planning.md docs\05-execution-logs\audits-reviews\2026-06-01-phase-22-mvp-local-acceptance-reaudit-planning.md
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

`build`, `test:e2e`, dev server, browser verification, DB, migration, and seed/bootstrap are skipped because this is a docs-only planning task and those actions require a later explicit approval.
