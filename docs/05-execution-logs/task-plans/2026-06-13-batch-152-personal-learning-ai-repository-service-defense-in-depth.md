# Batch 152 Implementation Plan

> **For agentic workers:** REQUIRED PROJECT RULES: read `AGENTS.md`,
> `docs/03-standards/code-taste-ten-commandments.md`, all ADRs under `docs/02-architecture/adr/`, project state,
> task queue, and recent evidence/audits before editing. Use TDD for source changes.

**Goal:** Harden personal AI request persistence so new pending task metadata is server-owned at the internal
repository/service boundary, not only at the route adapter.

**Architecture:** Keep the route/service/repository layering from ADR-002. Add focused repository-level regression
coverage first, then make `createOrReuseRequest` or its pending insert boundary sanitize result/evidence/reference
metadata for newly created pending personal AI generation tasks while preserving idempotent reuse of existing
repository-owned rows.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM types, Vitest, Module Run v2 governance scripts.

---

## Scope

Allowed files:

- `src/server/repositories/personal-ai-generation-request-repository.ts`
- `src/server/repositories/personal-ai-generation-request-repository.test.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/personal-ai-generation-request-flow-service.ts`
- `src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `src/server/services/ai-generation-task-request-service.ts`
- `src/server/services/ai-generation-task-request-service.test.ts`
- `src/server/models/ai-generation-task-request.ts`
- `src/server/validators/ai-generation-task-request.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`

Blocked files and actions:

- No env files, package files, lockfiles, schema/migration, drizzle files, e2e edits, materials, paper assets, generated
  test artifacts, provider calls, provider configuration, local provider sandbox, generated-content writes, deployment,
  payment, external-service, PR, force-push, or Cost Calibration work.

## Task Steps

### Task 1: Baseline and Plan

**Files:**

- Create:
  `docs/05-execution-logs/task-plans/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`

- [x] **Step 1: Confirm repository readiness**

Run:
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

Expected: branch is clean and has no commits ahead of `origin/master`.

- [x] **Step 2: Create this task plan**

Record TDD flow, allowedFiles/blockedFiles, validation commands, and high-risk blocks.

### Task 2: RED Repository Regression

**Files:**

- Modify: `src/server/repositories/personal-ai-generation-request-repository.test.ts`

- [x] **Step 1: Add failing test**

Add a focused repository test that calls `createOrReuseRequest` with stale client-supplied `resultPublicId`,
`evidenceStatus`, `citationCount`, and `aiCallLogPublicId`, then asserts the gateway insert receives server-owned
pending metadata: null result id, `none` evidence, zero citations, and null AI call log public id.

- [x] **Step 2: Verify RED**

Run:
`npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts`

Expected: fail because current repository forwards stale result/evidence/reference metadata to `insertPendingRequest`.

### Task 3: GREEN Repository Boundary

**Files:**

- Modify: `src/server/repositories/personal-ai-generation-request-repository.ts`

- [x] **Step 1: Implement minimal hardening**

Add a small internal normalization helper for new pending request creation so the repository passes server-owned pending
metadata into `insertPendingRequest`.

- [x] **Step 2: Verify GREEN**

Run:
`npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts`

Expected: repository test file passes.

### Task 4: Focused Regression Surface

**Files:**

- Validation only unless a focused test exposes a direct required change in already allowed files.

- [x] **Step 1: Run queue-declared focused tests**

Run:

```powershell
npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts
npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts
```

Expected: all pass.

### Task 5: Full Validation and Closeout

**Files:**

- Create:
  `docs/05-execution-logs/evidence/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`
- Create:
  `docs/05-execution-logs/audits-reviews/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] **Step 1: Run base quality gates**

Run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
git diff --check
```

Expected: all pass.

- [x] **Step 2: Record evidence and audit**

Evidence must include RED/GREEN anchors, validation output, blocked remainder, and next task candidate
`batch-153-personal-learning-ai-route-service-repository-metadata-security-review`.

- [x] **Step 3: Run Module Run v2 closeout**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-152-personal-learning-ai-repository-service-defense-in-depth
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-152-personal-learning-ai-repository-service-defense-in-depth
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-152-personal-learning-ai-repository-service-defense-in-depth
```

Expected: all pass.

## Risks and Controls

- Route-only hardening is insufficient; this task adds internal repository/service defense-in-depth.
- Idempotent reuse must not be sanitized because reused metadata is repository-owned existing state.
- Provider and generated-content work remain blocked; this task only affects local pending metadata ownership.
- No API envelope or JSON naming change is allowed.
