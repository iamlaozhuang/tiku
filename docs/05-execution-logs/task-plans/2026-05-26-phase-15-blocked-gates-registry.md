# Phase 15 Blocked Gates Registry Task Plan

**Task id:** `phase-15-blocked-gates-registry`

**Branch:** `codex/phase-15-blocked-gates-registry`

**Date:** 2026-05-26

## Goal

Create a durable registry for long-lived approval gates so real provider, staging/prod/cloud, dependency, secret/env, deploy, and destructive data red lines are easy to recover across sessions.

## Scope

Allowed files:

- `docs/04-agent-system/state/blocked-gates.yaml`
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

1. Add `blocked-gates.yaml` with long-lived approval gates only.
2. Reference the registry from `automation-loop.md`.
3. Update queue and project state for this task.
4. Record validation evidence.

## Validation Commands

- `Test-Path 'docs\04-agent-system\state\blocked-gates.yaml'`
- `Select-String -Path 'docs\04-agent-system\state\blocked-gates.yaml' -Pattern 'real-provider|staging|prod|secret_or_env_change|deploy'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- This task creates a registry only; it does not unblock any gate.
- No provider/cloud/staging/prod/deploy/env/dependency/destructive data action is performed.
