# Phase 15 Task Kind Lightweight Labels Task Plan

**Task id:** `phase-15-task-kind-lightweight-labels`

**Branch:** `codex/phase-15-task-kind-lightweight-labels`

**Date:** 2026-05-26

## Goal

Document lightweight `taskKind` labels for new queue tasks without backfilling historical task entries.

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

1. Add `taskKind` guidance and allowed values to `automation-loop.md`.
2. Preserve the no-backfill rule for historical queue tasks.
3. Update queue and project state for this final Phase 15 mechanism task.
4. Record validation evidence.

## Validation Commands

- `Select-String -Path 'docs\04-agent-system\sop\automation-loop.md','docs\04-agent-system\state\task-queue.yaml' -Pattern 'taskKind|read_only|docs_only|implementation|local_verification|closeout|blocked_gate'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- This task changes queue metadata guidance only.
- It does not change validation scripts, source code, dependencies, schemas, migrations, env files, staging/prod/cloud/provider access, or deployment.
