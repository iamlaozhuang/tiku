# Phase 15 Project State Closeout Reconciliation Task Plan

**Task id:** `phase-15-project-state-closeout-reconciliation`

**Branch:** `codex/phase-15-project-state-closeout-reconciliation`

**Date:** 2026-05-26

## Goal

Add closeout reconciliation rules so durable project state does not contradict clean Git reality after merge, push, and branch cleanup.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/03-standards/git-workflow.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Allowed files:

- `docs/04-agent-system/sop/automation-loop.md`
- `docs/03-standards/git-workflow.md`
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

1. Add project-state closeout reconciliation rules to `automation-loop.md`.
2. Add Git workflow closeout state reconciliation rules to `git-workflow.md`.
3. Add repository SHA tracking to `project-state.yaml`.
4. Update the queue and project state for this task.
5. Record validation evidence.

## Validation Commands

- `Select-String -Path 'docs\04-agent-system\sop\automation-loop.md','docs\03-standards\git-workflow.md' -Pattern 'closeout reconciliation|lastClosedTask|lastKnownMasterSha'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- This task changes process documentation and state metadata only.
- It does not alter business runtime, dependencies, schemas, migrations, scripts, environment files, staging/prod/cloud/provider access, or deployment.
- The new rule is intentionally descriptive; it does not automate destructive cleanup.
