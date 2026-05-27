# Phase 21 Implementation Plan Breakdown

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` only when a future human-approved implementation phase starts. This Phase 21 task is governance-only and must not implement business fixes.

**Goal:** Convert Phase 18/19/20 audit outputs into an executable, approval-aware implementation sequence.

**Architecture:** Phase 21 keeps all business code immutable and uses the existing task queue as the source of truth. It preserves the 51 Phase 20 finding-linked tasks while grouping them into smaller subphases by dependency, risk, module, role, and validation cost.

**Tech Stack:** Documentation/state only: Markdown, YAML, local agent readiness scripts, Prettier checks, naming convention checks, and the repository quality gate.

---

## Scope

Allowed files for this task:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked files and actions:

- No `src`, `tests`, `e2e`, `schema`, `drizzle`, `scripts`, `package.json`, lockfile, `.env.local`, or `.env.example` changes.
- No dependency add/remove/upgrade.
- No staging/prod/cloud/deploy/real provider connection.
- No destructive data operation.
- High-risk future work must keep separate human approval fields for `auth_permission_model`, `database_migration`, `secret_or_env_change`, `external_service_config`, `deploy`, `dependency_change`, and destructive data operations.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Phase 18 total audit report, traceability matrix, requirement audit catalog, and evidence.
- Phase 19 finding inventory, dedup/severity taxonomy, coverage matrix review, follow-up queue alignment report, and evidence.
- Phase 20 RA-01-08 re-audit report and evidence.

## Implementation Steps

- [x] **Step 1: Restore repository state from files**

  Read governance standards, ADRs, interfaces, `project-state.yaml`, `task-queue.yaml`, blocked gates, Phase 18/19/20 reports, and latest evidence. Confirm no Phase 21 task exists before writing.

- [x] **Step 2: Produce startup report**

  Report current branch, clean status, `master`/`origin/master` alignment, worktrees, current task, blocked gates, Phase 20 counts, and Phase 21 registration plan.

- [x] **Step 3: Create short-lived branch**

  Run:

  ```powershell
  git switch -c codex/phase-21-implementation-plan-breakdown
  ```

- [x] **Step 4: Register Phase 21 governance task**

  Append `phase-21-implementation-plan-breakdown` to `task-queue.yaml` as a docs-only planning task and update `project-state.yaml` to point to the Phase 21 planning handoff.

- [x] **Step 5: Write Phase 21 implementation breakdown report**

  Create `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md` with:
  - Phase 18/19/20 source summary.
  - 38 canonical findings to 51 Phase 20 tasks relationship.
  - Subphase sequence by dependency, risk, module, role, and validation cost.
  - Approval gates and role-specific validation strategy.
  - Local-only strategy and blocked-gate preservation.
  - Recommendation on future Phase 21/22+ queue entries.

- [x] **Step 6: Write evidence skeleton**

  Create `docs/05-execution-logs/evidence/2026-05-27-phase-21-implementation-plan-breakdown.md` with summary, scope, command list, forbidden-scope checks, and pending validation slots.

- [x] **Step 7: Run required validation**

  Run:

  ```powershell
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
  git diff --check
  node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-21-implementation-plan-breakdown.md docs\05-execution-logs\evidence\2026-05-27-phase-21-implementation-plan-breakdown.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-21-implementation-plan-breakdown.md
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
  ```

- [x] **Step 8: Update evidence with validation results**

  Record every required command as pass/fail/skipped with bounded notes.

- [ ] **Step 9: Commit, merge, push, and cleanup**

  Commit the docs/state-only change, merge into `master`, run post-merge checks required by closeout, push `origin/master`, delete the short-lived branch, and stop before any fix/test implementation task.

## Risk Controls

- Phase 21 does not unblock any long-lived blocked gate.
- Phase 21 does not claim runtime behavior changed.
- Future implementation sequencing must pause before high-risk tasks and record explicit human approval in each task's `humanApproval` field.
- Existing Phase 20 task granularity remains intact; Phase 21 adds planning structure and does not merge or delete fix tasks.
