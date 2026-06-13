# Batch 151 Implementation Plan

> **For agentic workers:** REQUIRED PROJECT RULES: read `AGENTS.md`,
> `docs/03-standards/code-taste-ten-commandments.md`, all ADRs under `docs/02-architecture/adr/`, project state,
> task queue, and recent evidence/audits before editing. Use the queued allowedFiles and blockedFiles exactly.

**Goal:** Seed the next personal-learning-ai repository/service defense-in-depth tasks after batch-150.

**Architecture:** This is a docs-only Module Run v2 queue-seeding task. It records batch-152 through batch-155 as
independent follow-up tasks so source hardening, security review, existing local e2e validation, and blocked-gate refresh
remain separately reviewable.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, Vitest, Playwright, Module Run v2 governance scripts.

---

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`

Blocked files and actions:

- No `src/**`, `tests/**`, `e2e/**`, `drizzle/**`, `src/db/schema/**`, env files, package files, lockfiles, materials,
  paper assets, generated test artifacts, provider configuration, provider calls, local provider sandbox, generated
  content writes, deployment, payment, external-service, PR, force-push, schema/migration, or Cost Calibration work.

## Task Steps

### Task 1: Establish Baseline

**Files:**

- Read-only: project governance docs, state, queue, recent evidence/audits.

- [x] **Step 1: Confirm branch and clean status**

Run: `git status --porcelain=v1 -b`

Expected: short branch is clean before edits.

- [x] **Step 2: Run pre-edit readiness**

Run:
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

Expected: repository inventory completes with no tracked, staged, or untracked changes.

### Task 2: Seed Follow-Up Queue Entries

**Files:**

- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`

- [x] **Step 1: Add batch-151 closed task entry**

Record this docs-only task with closeout policy, allowedFiles, blockedFiles, validation commands, evidence path, audit
path, `status: closed`, and `result: pass`.

- [x] **Step 2: Add batch-152 pending implementation task**

Seed a scoped source hardening task whose allowedFiles include only the personal AI request repository/service/model
boundary and docs. The task must require server-owned pending metadata at the repository/service boundary and preserve
idempotent reuse metadata.

- [x] **Step 3: Add batch-153 pending security review task**

Seed a docs-only task to review route/service/repository metadata ownership closure.

- [x] **Step 4: Add batch-154 pending existing local e2e validation task**

Seed a validation-only task that may run only `npm.cmd run test:e2e -- --list` and
`npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`.

- [x] **Step 5: Add batch-155 pending blocked-gate refresh task**

Seed a docs-only blocked gate task for provider/env/dependency/local provider sandbox/generated-content/deploy/payment/
external-service/Cost Calibration boundaries.

### Task 3: Evidence and Audit

**Files:**

- Create:
  `docs/05-execution-logs/evidence/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`
- Create:
  `docs/05-execution-logs/audits-reviews/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`

- [x] **Step 1: Record evidence**

Evidence must include `RED:` and `GREEN:` anchors, validation log, blocked remainder, and the next task candidate.

- [x] **Step 2: Record audit review**

Audit must confirm only docs/state/queue/task-plan/evidence/audit files changed and high-risk surfaces remain blocked.

### Task 4: Validate

**Files:**

- Validation only.

- [x] **Step 1: Format/check docs**

Run:
`node .\node_modules\prettier\bin\prettier.cjs --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md docs/05-execution-logs/evidence/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`

Expected: pass.

- [x] **Step 2: Run diff check**

Run: `git diff --check`

Expected: pass.

- [x] **Step 3: Verify seeded anchors**

Run:
`Select-String -Path docs/04-agent-system/state/task-queue.yaml,docs/05-execution-logs/evidence/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md,docs/05-execution-logs/audits-reviews/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md -Pattern 'batch-152','batch-153','batch-154','batch-155','server-owned pending metadata','repository/service','Cost Calibration Gate remains blocked'`

Expected: all anchors present.

- [x] **Step 4: Run base quality gates**

Run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
```

Expected: all pass.

- [x] **Step 5: Run closeout scripts**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning
```

Expected: all pass before commit.

## Risks and Controls

- Queue overreach risk is controlled by exact allowedFiles and explicit blockedFiles on every seeded task.
- Provider/env/dependency/cost risk is controlled by `freshApprovalRequired` on blocked gate work and blocked
  capabilities on implementation tasks.
- E2E expansion risk is controlled by allowing only an existing local spec in batch-154.
- Schema/migration and dependency risk remains blocked because no seeded task includes package, lockfile, schema, or
  migration files.
