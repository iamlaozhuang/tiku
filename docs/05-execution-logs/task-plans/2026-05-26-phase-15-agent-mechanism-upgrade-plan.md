# Phase 15 Agent Mechanism Upgrade Plan

**Task id:** `phase-15-agent-mechanism-upgrade-plan`

**Branch:** `codex/phase-15-agent-mechanism-upgrade-plan`

**Date:** 2026-05-26

## Goal

Create a docs-only Phase 15 mechanism upgrade queue that turns the semi-automation review into small, independently verifiable tasks.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent Phase 12 through Phase 14 evidence files

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Steps

1. Record this planning task in the queue as the Phase 15 entry task.
2. Seed six follow-up tasks:
   - session startup report protocol;
   - project-state closeout reconciliation;
   - local human verification playbook;
   - blocked gates registry;
   - evidence summary template;
   - lightweight task kind labels.
3. Update `project-state.yaml` to point to Phase 15 mechanism upgrade planning.
4. Write evidence showing the queue was seeded and no forbidden scope was touched.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- This is a docs/state planning task only.
- No source, test, script, schema, migration, dependency, lockfile, env, staging, prod, cloud, deploy, or real provider scope is allowed.
- The task queue is seeded with narrow allowed files so later tasks remain independently reviewable.
- User approval for this mechanism upgrade batch is recorded in evidence; remote push and branch cleanup are authorized for these Phase 15 mechanism tasks.
