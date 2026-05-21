# Phase 7 Student Flow Runtime Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for implementation and superpowers:verification-before-completion before any completion claim. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Phase 7 P1 student paper, practice, mock_exam, and exam_report route groups with a narrow local runtime smoke path.

**Architecture:** Keep App Router route handlers thin. Resolve the authenticated student from the existing session runtime, then call existing service contracts backed by Drizzle repositories. Only MVP methods move to runtime; deferred routes such as practice restart/terminate, mock_exam terminate, and learning suggestion retry may remain unavailable unless required by the smoke path.

**Tech Stack:** Next.js App Router, TypeScript, Drizzle ORM, PostgreSQL dev database, Vitest.

---

## Required Reads

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-auth-session-runtime-baseline.md`

## Scope

Allowed task files are exactly the queue scope for `phase-7-student-flow-runtime-smoke`. Blocked files remain `package.json`, lockfiles, `drizzle/**`, and `.env.example`.

No dependency, migration, or environment variable changes are planned.

## TDD Tasks

### Task 1: Student Runtime Wiring

**Files:**

- Create: `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- Create or modify: `src/server/repositories/student-flow-runtime-repository.ts`
- Create or modify: `src/server/services/student-flow-runtime.ts`
- Modify: `src/app/api/v1/student-papers/**`

- [ ] Write RED tests proving authenticated student paper routes no longer use unavailable services and reject missing authorization.
- [ ] Run `npm.cmd run test:unit -- tests/unit/phase-7-student-flow-runtime-smoke.test.ts` and record the expected failure.
- [ ] Implement the minimal student user resolver and student paper repository runtime.
- [ ] Run the focused unit test and confirm GREEN.

### Task 2: Practice Runtime Smoke

**Files:**

- Modify: `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- Modify: `src/server/repositories/student-flow-runtime-repository.ts`
- Modify: `src/server/services/student-flow-runtime.ts`
- Modify: `src/app/api/v1/practices/**`

- [ ] Add RED tests for starting practice and submitting one objective answer with public identifiers only.
- [ ] Run focused unit tests and record the expected failure.
- [ ] Implement minimal practice repository methods for start/detail/answer.
- [ ] Run focused unit tests and confirm GREEN.

### Task 3: Mock Exam And Exam Report Runtime Smoke

**Files:**

- Modify: `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- Modify: `src/server/repositories/student-flow-runtime-repository.ts`
- Modify: `src/server/services/student-flow-runtime.ts`
- Modify: `src/app/api/v1/mock-exams/**`
- Modify: `src/app/api/v1/exam-reports/**`

- [ ] Add RED tests for starting mock_exam, saving answer, submitting, generating report, and reading report.
- [ ] Run focused unit tests and record the expected failure.
- [ ] Implement minimal mock_exam and exam_report repository methods.
- [ ] Keep deferred methods unavailable where the runtime slice contract allows deferral.
- [ ] Run focused unit tests and confirm GREEN.

### Task 4: Validation And Evidence

**Files:**

- Modify: `docs/05-execution-logs/evidence/2026-05-21-phase-7-student-flow-runtime-smoke.md`
- Modify: `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-student-flow-runtime-smoke-security-review.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] Run task validation commands from `task-queue.yaml`.
- [ ] Write command outputs and residual risks to evidence.
- [ ] Complete security review with verdict `APPROVE` before merge.
- [ ] Verify no blocked files changed.

## Risk Controls

- Authorization filter must happen before returning paper, practice, mock_exam, or exam_report data.
- Public route parameters stay `publicId`; numeric database `id` values stay inside repositories.
- API responses keep `{ code, message, data, pagination? }`.
- JSON DTO fields remain camelCase through existing mappers.
- No real AI provider is called; learning suggestion retry remains deferred.
- Restart/terminate routes remain deferred unless a focused test proves they are necessary for smoke cleanup.
