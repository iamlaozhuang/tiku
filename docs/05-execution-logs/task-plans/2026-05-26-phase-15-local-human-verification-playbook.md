# Phase 15 Local Human Verification Playbook Task Plan

**Task id:** `phase-15-local-human-verification-playbook`

**Branch:** `codex/phase-15-local-human-verification-playbook`

**Date:** 2026-05-26

## Goal

Add a local human verification SOP for browser-accompanied local product checks with explicit local-only, no-env, no-provider, and gap-recording boundaries.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-14-local-human-experience-verification.md`

## Scope

Allowed files:

- `docs/04-agent-system/sop/local-human-verification.md`
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

1. Create `local-human-verification.md`.
2. Define local-only hard boundaries.
3. Define startup checklist and role/route matrix.
4. Define browser evidence and gap handling rules.
5. Reference the SOP from `automation-loop.md`.
6. Update queue and project state for this task.

## Validation Commands

- `Test-Path 'docs\04-agent-system\sop\local-human-verification.md'`
- `Select-String -Path 'docs\04-agent-system\sop\local-human-verification.md' -Pattern 'localhost|127.0.0.1|real provider|.env.local'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- This is a documentation-only mechanism task.
- It does not start a dev server, open a browser, run real provider calls, read env files, deploy, change dependencies, or modify source code.
- It explicitly preserves the user's local-only verification boundary.
