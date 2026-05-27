# Phase 15 Evidence Summary Template Task Plan

**Task id:** `phase-15-evidence-summary-template`

**Branch:** `codex/phase-15-evidence-summary-template`

**Date:** 2026-05-26

## Goal

Add a lightweight evidence summary template so each future evidence file exposes result, scope, gates, forbidden scope, and residual gaps before detailed logs.

## Scope

Allowed files:

- `docs/04-agent-system/sop/automation-loop.md`
- `docs/03-standards/local-ci.md`
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

1. Add an `Evidence Summary` section to `automation-loop.md`.
2. Add the summary block requirement to `local-ci.md`.
3. Update queue and project state for this task.
4. Record validation evidence.

## Validation Commands

- `Select-String -Path 'docs\04-agent-system\sop\automation-loop.md','docs\03-standards\local-ci.md' -Pattern 'Evidence Summary|result|forbiddenScope|residualGaps'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- This task changes evidence guidance only.
- It does not modify scripts, business runtime, dependencies, schemas, migrations, env files, staging/prod/cloud/provider access, or deployment.
