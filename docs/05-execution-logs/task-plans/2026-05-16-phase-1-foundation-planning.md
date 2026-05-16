# Phase 1 Foundation Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Phase 0 automation output into a scoped Phase 1 foundation task queue and preserve the merge-time stash decision.

**Architecture:** This is a governance and planning task only. It updates the automation state, task registry, and execution evidence without touching application business code. Follow ADR-002 for future server boundaries and keep all dependency changes behind the dependency introduction gate.

**Tech Stack:** Markdown, YAML, PowerShell readiness scripts, npm lint/typecheck gates.

---

## Files

- Create: `docs/05-execution-logs/task-plans/2026-05-16-phase-1-foundation-planning.md`
- Create: `docs/05-execution-logs/evidence/2026-05-16-phase-1-foundation-planning.md`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`

## Stash Review Decision

The merge-time stash `stash@{0}` contains:

- Deleted `.codexrules`.
- Added `.husky/pre-commit` with `pnpm exec lint-staged`.
- Added `.prettierrc` with `prettier-plugin-tailwindcss`.
- Added `docs/05-execution-logs/task-plans/2026-05-14-全生命周期双核自动化机制实施方案.md`.
- Modified `package.json` and `pnpm-lock.yaml` to add `husky`, `lint-staged`, `prettier`, and `prettier-plugin-tailwindcss`.

Decision:

- Do not apply the stash wholesale.
- Treat `prettier`, `prettier-plugin-tailwindcss`, `lint-staged`, and `husky` package changes as a Phase 1 dependency decision requiring explicit human approval.
- Preserve the old task plan as historical reference in the stash for now; do not restore it into the active task plan directory unless it is rewritten to match Phase 0 SOP and ADR-002.
- Keep Phase 0's existing hook behavior (`lint` + `typecheck`) as the current effective gate until the formatting gate task is approved and implemented.

## Tasks

### Task 1: Record Phase 1 Planning Scope

**Files:**

- Create: `docs/05-execution-logs/task-plans/2026-05-16-phase-1-foundation-planning.md`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`

- [x] **Step 1: Read startup sources**

Read:

```powershell
Get-Content -Raw -LiteralPath AGENTS.md
Get-Content -Raw -LiteralPath docs/03-standards/doc-management.md
Get-Content -Raw -LiteralPath docs/03-standards/code-taste-ten-commandments.md
Get-ChildItem -LiteralPath docs/02-architecture/adr -File
Get-Content -Raw -LiteralPath docs/04-agent-system/state/project-state.yaml
Get-Content -Raw -LiteralPath docs/04-agent-system/state/task-queue.yaml
```

Expected: required governance, ADR, project state, and task queue files are readable.

- [x] **Step 2: Review merge stash without applying it**

Run:

```powershell
git stash show --stat 'stash@{0}'
git stash show --name-status --include-untracked 'stash@{0}'
git show 'stash@{0}:package.json'
git show 'stash@{0}^3:.husky/pre-commit'
git show 'stash@{0}^3:.prettierrc'
```

Expected: stash content is classified as dependency/tooling work, not directly restored.

- [x] **Step 3: Add Phase 1 task queue entries**

Append Phase 1 foundation tasks with explicit dependencies, risk types, allowed files, blocked files, validation commands, and evidence paths.

- [x] **Step 4: Update project handoff state**

Set handoff to the next claimable Phase 1 task and point `lastSummaryPath` to this evidence file.

### Task 2: Verify Planning Changes

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-16-phase-1-foundation-planning.md`

- [x] **Step 1: Run readiness**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Expected: readiness passes with the known missing `test` script note.

- [x] **Step 2: Run quality gate**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Expected: `lint` and `typecheck` pass; `test` remains missing until Phase 1 test tooling is selected.

- [x] **Step 3: Confirm worktree status**

Run:

```powershell
git status --short --branch
```

Expected: only the planned documentation and state files are modified or added.
