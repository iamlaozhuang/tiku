# Phase 29 Staging Procurement Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recover the repository control state and confirm Phase 29 is a docs-only procurement-prep batch before any approval material is written.

**Architecture:** This task changes only governance documents and evidence. It does not authorize procurement, staging/prod connection, cloud resource creation, deployment, secret/env handling, DB access, provider calls, or product-code changes.

**Tech Stack:** Markdown, YAML queue/state files, Git read-only inventory, existing agent-system PowerShell checks.

---

### Task 1: Preflight Recovery

**Files:**

- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Create: `docs/05-execution-logs/evidence/2026-06-01-phase-29-staging-procurement-preflight.md`

- [ ] **Step 1: Read required governance sources**

  Confirm `AGENTS.md`, code taste, local CI, testing/TDD, ADRs, automation/security SOPs, fresh local/dev DB validation playbook, project state, task queue, blocked gates, and latest evidence have been read.

- [ ] **Step 2: Record startup Git inventory**

  Run and record:

  ```powershell
  git status --short --branch
  git rev-list --left-right --count master...origin/master
  git branch --list
  git branch --no-merged master
  git worktree list
  ```

- [ ] **Step 3: Confirm writable and blocked scope**

  Writable scope is limited to state, task queue, task plans, and evidence. Prohibited surfaces include `src/**`, `scripts/**`, `tests/**`, `e2e/**`, `.env*`, package/lockfiles, schema/drizzle/migrations, raw SQL, DB operations, staging/prod/cloud/deploy, real provider, external service, force push, and sensitive evidence.

- [ ] **Step 4: Register Phase 29 batch**

  Append a fresh batch parent and serial child tasks in `task-queue.yaml`. Do not reuse historical closed/deferred/blocked items.

- [ ] **Step 5: Write preflight evidence**

  Evidence must state that this batch prepares procurement/approval documents only and leaves all long-lived blocked gates blocked unless a later human approval unlocks them.
