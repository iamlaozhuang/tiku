# Phase 4 Student Home UI Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for implementation and superpowers:verification-before-completion before closeout. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the mobile-first student home UI baseline for `US-03-01` so authorized students can choose a scope, see theory/skill paper groups, and enter `practice` or `mock_exam` flows through public identifiers only.

**Architecture:** Keep the page as a thin App Router entry under `src/app/(student)/home/page.tsx`. Put reusable, testable student UI state and rendering under `src/features/student/home/` and reusable student-facing components under `src/components/student/`. Use Phase 4 `StudentPaperScopeDto` and `StudentPaperSummaryDto` contracts instead of inventing DTOs.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4 design tokens, Vitest, Testing Library.

---

## Required Sources Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-mistake-book-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mistake-book-baseline-security-review.md`

## Scope Controls

- Branch/worktree: `codex/phase-4-student-home-ui-baseline` at `F:\tiku\.worktrees\phase-4-student-home-ui-baseline`.
- Allowed implementation files:
  - `src/app/(student)/**`
  - `src/components/student/**`
  - `src/features/student/**`
  - `src/server/contracts/**`
  - `tests/unit/**`
  - `e2e/**`
  - task plan, evidence, security review, project state, and task queue.
- Blocked files:
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.json`
  - `src/db/schema/**`
  - `drizzle/**`
  - `.env.example`

## Implementation Tasks

### Task 1: Student Home State Model

**Files:**

- Create: `src/features/student/home/StudentHomePage.tsx`
- Create: `tests/unit/student-home-ui.test.ts`

- [ ] **Step 1: Write RED tests for scope selection and grouping**

  Add tests that render `StudentHomePage` with fixture scopes and papers, then assert:
  - the first scope is selected when no remembered scope is provided;
  - papers are grouped under `理论` and `技能`;
  - paper cards use `data-public-id`, never `data-id`;
  - practice and mock links contain `paperPublicId` query values, not numeric ids.

- [ ] **Step 2: Run targeted RED command**

  Run:

  ```powershell
  npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts
  ```

  Expected: fail because `src/features/student/home/StudentHomePage` does not exist.

- [ ] **Step 3: Implement minimal state and rendering**

  Implement `StudentHomePage` with typed props:
  - `scopes: StudentPaperScopeDto[]`
  - `papers: StudentPaperSummaryDto[]`
  - `rememberedScope?: { profession: Profession; level: number }`
  - `state?: "ready" | "loading" | "error"`

  The component should render selected scope controls, subject-grouped papers sorted by `publishedAt` descending, loading skeleton, empty/no-authorization guidance, and error fallback.

- [ ] **Step 4: Run targeted GREEN command**

  Run:

  ```powershell
  npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts
  ```

  Expected: pass.

### Task 2: Student Home Route Baseline

**Files:**

- Modify: `src/app/(student)/home/page.tsx`

- [ ] **Step 1: Connect the route to the feature component**

  Replace the placeholder Phase 2 page with `StudentHomePage` and a local baseline fixture. The fixture exists only as UI baseline data until real session-bound API hydration is introduced.

- [ ] **Step 2: Confirm route compiles**

  Run:

  ```powershell
  npm.cmd run typecheck
  ```

  Expected: pass.

### Task 3: Evidence, Security Review, and State

**Files:**

- Create/update: `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-home-ui-baseline.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-student-home-ui-baseline-security-review.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] **Step 1: Run queue validation commands**

  Run:

  ```powershell
  npm.cmd run lint
  npm.cmd run typecheck
  npm.cmd run test:unit
  npm.cmd run build
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
  ```

- [ ] **Step 2: Write evidence and security review**

  Evidence records RED/GREEN, validation output, changed files, blocked-file compliance, and accepted UI baseline gaps.

  Security review covers authorization display boundaries, public identifier use, lack of numeric ids, DTO contract shape, and no secret/session exposure.

- [ ] **Step 3: Update queue and project state**

  Mark `phase-4-student-home-ui-baseline` as `done`, set current task back to idle, and set `nextRecommendedAction` to `claim_phase_4_practice_ui_baseline`.

## Risk Defense

- No dependency changes or package lock changes.
- No schema, migration, or env changes.
- No API route behavior changes in this task.
- UI fixtures must not include internal numeric database ids.
- Student home actions route with `paperPublicId` query parameters and do not expose auto-increment ids.
- Loading, empty/no-authorization, and error states are first-class UI states per the Code Taste Ten Commandments.
