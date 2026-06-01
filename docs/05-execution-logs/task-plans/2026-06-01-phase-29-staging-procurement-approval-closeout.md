# Phase 29 Staging Procurement Approval Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before claiming completion, committing, merging, pushing, or cleaning up. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the Phase 29 docs-only batch with validation evidence, blocked-gate decisions, and approved Git closeout actions.

**Architecture:** Closeout consolidates child evidence, records which gates remain blocked, and states what human approvals are required before `phase-30-staging-dry-run-after-approval`. It performs no staging implementation.

**Tech Stack:** Markdown evidence, YAML queue/state, Git, existing PowerShell agent-system gates, `Invoke-QualityGate.ps1`.

---

### Task 1: Closeout Validation And Git Handoff

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/05-execution-logs/evidence/2026-06-01-phase-29-staging-procurement-approval-closeout.md`
- Create: `docs/05-execution-logs/evidence/2026-06-01-phase-29-staging-procurement-and-approval-prep-batch.md`

- [ ] **Step 1: Re-read requirements checklist**

  Confirm all Phase 29 required outputs exist and no prohibited scope was touched.

- [ ] **Step 2: Run required validation commands**

  Run:

  ```powershell
  git status --short --branch
  git rev-list --left-right --count master...origin/master
  git branch --list
  git branch --no-merged master
  git worktree list
  git diff --check
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
  ```

- [ ] **Step 3: Record closeout evidence**

  Include command results, skipped runtime/e2e rationale, blocked gates, next approvals for Phase 30, and evidence hygiene statement.

- [ ] **Step 4: Commit, merge, push, and cleanup**

  User approval covers commit, merge to `master`, push `master`, and cleanup of the merged short-lived branch. Force push remains prohibited. Record final master/origin alignment and branch cleanup result.
