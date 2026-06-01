# Phase 24 State Reconciliation Preflight Task Plan

## Required Reading

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Latest evidence: `docs/05-execution-logs/evidence/2026-06-01-phase-23-evidence-consolidation-closeout.md`

## Scope

- Task id: `phase-24-state-reconciliation-preflight`
- Branch: `codex/phase-24-fresh-validation-operationalization`
- Allowed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-06-01-phase-24-state-reconciliation-preflight.md`
  - `docs/05-execution-logs/evidence/2026-06-01-phase-24-state-reconciliation-preflight.md`
- Blocked files:
  - `.env.local`
  - `.env.example`
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.yaml`
  - `package-lock.json`
  - `scripts/**`
  - `src/**`
  - `tests/**`
  - `e2e/**`
  - `src/db/schema/**`
  - `drizzle/**`

## Implementation Notes

1. Record startup recovery facts: branch, status, master/origin alignment, local branches, worktrees, queue summary, blocked gates, latest evidence.
2. Register a new Phase 24 parent task and serial child tasks. Do not reuse closed, deferred, or blocked Phase 23 entries.
3. Reconcile `project-state.yaml` with Git reality:
   - `lastKnownMasterSha` and `lastKnownOriginMasterSha` must match `a9b7a8499ea9e378382767223986ffa819010fc5`.
   - `currentTask` must point at this Phase 24 child task.
   - `branch` must be `codex/phase-24-fresh-validation-operationalization`.
   - `handoff` must describe Phase 24 continuation and supersede stale Phase 23 merge/push/cleanup pending text.
4. Do not run DB, env, e2e, build, dependency, schema, or migration commands in this preflight.

## Risk Gate

- Dependency change: not allowed.
- Database migration: not run.
- Auth or permission model: not touched.
- Secret or environment change: not allowed.
- Destructive data operation: not allowed.
- Deploy or push: not run in this task.

## Validation Commands

```powershell
git status --short --branch
git rev-list --left-right --count master...origin/master
git branch --list
git branch --no-merged master
git worktree list
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

## Evidence

- Evidence path: `docs/05-execution-logs/evidence/2026-06-01-phase-24-state-reconciliation-preflight.md`
- Record command results without secrets.
- Mark this task blocked if Git reality cannot be reconciled without modifying prohibited files.
