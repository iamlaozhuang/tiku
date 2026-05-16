# Mechanism Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the governance, automation, UI-token consistency, and documentation gaps found in the semi-automation review so the mechanism remains stable before business implementation accelerates.

**Architecture:** This task hardens the project control plane rather than adding business features. It updates standards, SOPs, task state, issue-tracking structure, and low-risk UI foundation inconsistencies while leaving dependency additions, remote repository setup, and test framework installation behind explicit future approval gates.

**Tech Stack:** Markdown, YAML, Next.js App Router, Tailwind CSS v4, existing PowerShell readiness scripts, npm lint/typecheck/build gates.

---

## Files

- Modify: `AGENTS.md`
- Modify: `docs/03-standards/coding-style.md`
- Modify: `docs/03-standards/git-workflow.md`
- Modify: `docs/03-standards/local-ci.md`
- Modify: `docs/03-standards/testing-tdd.md`
- Modify: `docs/04-agent-system/sop/automation-loop.md`
- Modify: `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/02-architecture/system-design/frontend/01-style-tone.md`
- Modify: `docs/02-architecture/system-design/frontend/02-design-tokens.json`
- Modify: `next.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `docs/06-issue-tracking/README.md`
- Create: `docs/06-issue-tracking/bug-reports/README.md`
- Create: `docs/05-execution-logs/task-plans/2026-05-16-mechanism-hardening.md`
- Create: `docs/05-execution-logs/evidence/2026-05-16-mechanism-hardening.md`

## Task 1: Governance And Automation Rules

- [x] Fill empty standards documents for coding style, Git/worktree lifecycle, local CI, and testing/TDD.
- [x] Add explicit worktree, evidence, branch cleanup, and missing-test-gate rules to `AGENTS.md`.
- [x] Extend automation SOP with context management, remote repository handling, and post-merge cleanup.
- [x] Extend skill dispatch with mandatory skill usage by lifecycle stage.

## Task 2: Documentation Structure

- [x] Add `docs/06-issue-tracking/README.md`.
- [x] Add `docs/06-issue-tracking/bug-reports/README.md`.
- [x] Ensure failure reports have a durable destination referenced by SOP.

## Task 3: UI Foundation Consistency

- [x] Remove the Inter/Geist contradiction from UI docs and root layout.
- [x] Map Tailwind font variables to project-owned CSS variables.
- [x] Align shadcn-compatible CSS variables with Tiku brand tokens rather than default neutral primary values.
- [x] Pin Next.js Turbopack root to the active project directory so nested worktrees do not infer the parent repository as the build root.

## Task 4: State And Queue

- [x] Add `phase-1-mechanism-hardening` to the task queue.
- [x] Update project state handoff to keep the next recommended task at `phase-1-test-tooling-decision`.
- [x] Record this evidence path.

## Task 5: Verification

- [x] Run readiness:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

- [x] Run quality gate:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

- [x] Run build:

```powershell
npm.cmd run build
```

- [x] Record any remaining known gap, especially the missing `test` script until the test-tooling decision is approved.
