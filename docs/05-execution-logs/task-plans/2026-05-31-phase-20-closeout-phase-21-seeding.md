# Phase 20 Closeout And Phase 21 Seeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or perform the steps inline with checklist discipline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close Phase 20 as `50 closed + 2 accepted deferred blockers` and seed Phase 21 for those high-risk tail items.

**Architecture:** This is a docs-only governance task. It preserves original blocked task evidence, creates a Phase 21 contract for the deferred high-risk work, updates roadmap/queue/project-state, and records validation evidence without changing runtime code.

**Tech Stack:** Markdown, YAML task queue/state files, existing PowerShell readiness scripts, existing npm quality gates.

---

## Files

- Create: `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- Create: `docs/05-execution-logs/task-plans/2026-05-31-phase-20-closeout-phase-21-seeding.md`
- Create: `docs/05-execution-logs/evidence/2026-05-31-phase-20-closeout-phase-21-seeding.md`
- Modify: `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

## Steps

- [ ] **Step 1: Verify recovery point**

Run:

```powershell
git status --short --branch
git rev-list --left-right --count origin/master...HEAD
git branch --list codex/*
git worktree list --porcelain
```

Expected:

- `master...origin/master` is clean and aligned before branch creation.
- No `codex/*` branch remains.
- Only root worktree is registered.

- [ ] **Step 2: Create short-lived branch**

Run:

```powershell
git switch -c codex/phase-20-closeout-phase-21-seeding
```

Expected: branch is created from aligned `master`.

- [ ] **Step 3: Persist Phase 21 contract**

Create `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md` with:

- Phase 20 count summary.
- The two accepted deferred blockers.
- Required approval gates for `database_migration`, `auth_permission_model`, transaction/concurrency proof, and any future dependency work.
- Non-goals for env, dependency, schema without approval, staging/prod, cloud, deploy, real provider, and destructive operations.

- [ ] **Step 4: Update roadmap**

Modify `docs/04-agent-system/milestones-goals/mvp-roadmap.md` to add:

- Phase 20 closeout status.
- Phase 21 high-risk tail closure scope, non-goals, dependency order, and acceptance criteria.

- [ ] **Step 5: Seed queue**

Modify `docs/04-agent-system/state/task-queue.yaml` to add:

- `phase-20-closeout-phase-21-seeding` as a closed docs-only closeout task.
- `phase-21-tail-ai-scoring-retry-persistence-design` as pending docs-only planning.
- `phase-21-tail-ai-scoring-retry-persistence-implementation` as blocked pending approval.
- `phase-21-tail-admin-concurrency-permission-split-design` as pending docs-only planning.
- `phase-21-tail-admin-common-ux-state-audit` as blocked until split design is closed.
- `phase-21-tail-admin-write-concurrency-proof` as blocked until split design and approval are complete.
- `phase-21-tail-admin-permission-boundary-review` as blocked until split design and approval are complete.

- [ ] **Step 6: Update project state**

Modify `docs/04-agent-system/state/project-state.yaml`:

- Set `currentPhase` to `phase-21-high-risk-tail-closure`.
- Set `currentTask` to `phase-20-closeout-phase-21-seeding`.
- Set `handoff.nextRecommendedAction` to the first Phase 21 planning task.
- Set `handoff.lastSummaryPath` to this task evidence.

- [ ] **Step 7: Write evidence**

Create `docs/05-execution-logs/evidence/2026-05-31-phase-20-closeout-phase-21-seeding.md` with:

- Phase 20 counts.
- Deferred blockers and evidence paths.
- Phase transition six-layer self-check.
- Security and blocked-gate review.
- Validation command results.

- [ ] **Step 8: Validate**

Run:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\02-architecture\interfaces\phase-21-high-risk-tail-contract.md docs\04-agent-system\milestones-goals\mvp-roadmap.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-phase-20-closeout-phase-21-seeding.md docs\05-execution-logs\evidence\2026-05-31-phase-20-closeout-phase-21-seeding.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Expected: all commands pass. `build` and `test:e2e` are skipped because this task changes only docs/state and makes no runtime/browser claim.

- [ ] **Step 9: Commit, merge, push, cleanup**

Run:

```powershell
git add docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md docs/04-agent-system/milestones-goals/mvp-roadmap.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-05-31-phase-20-closeout-phase-21-seeding.md docs/05-execution-logs/evidence/2026-05-31-phase-20-closeout-phase-21-seeding.md
git commit -m "docs(agent): close phase 20 and seed phase 21 tail"
git switch master
git merge --no-ff codex/phase-20-closeout-phase-21-seeding -m "merge phase 20 closeout phase 21 seeding"
git push origin master
git branch -d codex/phase-20-closeout-phase-21-seeding
```

Expected: master is pushed, short branch is deleted, and final git status is clean/aligned.
