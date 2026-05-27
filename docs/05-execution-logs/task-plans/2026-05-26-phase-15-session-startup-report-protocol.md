# Phase 15 Session Startup Report Protocol Task Plan

**Task id:** `phase-15-session-startup-report-protocol`

**Branch:** `codex/phase-15-session-startup-report-protocol`

**Date:** 2026-05-26

## Goal

Add a durable startup report protocol so every resumed or queue-driven session begins with the status information the human owner needs before execution continues.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Allowed files:

- `docs/04-agent-system/sop/automation-loop.md`
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

## Implementation Steps

1. Add `Session Startup Report` to `automation-loop.md` after the startup read order.
2. Require branch/status, master alignment, local branch/worktree residue, project state, queue summary, next eligible task, blocked gates, and latest evidence.
3. Preserve the owner's explicit "report first / wait" control.
4. Update queue and project state for this task.
5. Record validation evidence.

## Validation Commands

- `Select-String -Path 'docs\04-agent-system\sop\automation-loop.md' -Pattern 'Session Startup Report'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- This task changes process documentation only.
- No business runtime, dependency, schema, migration, script, env, staging/prod/cloud, deploy, or real provider scope is touched.
- The new protocol explicitly preserves the user's preference to receive a status report and wait before execution when requested.
