# Phase 4 Answer Record Schema Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for schema/model code changes. Steps use checkbox (`- [ ]`) syntax for tracking.

**Task id:** `phase-4-answer-record-schema-baseline`

**Goal:** Add the Phase 4 storage and type baseline for `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book` without generating migrations or adding runtime APIs.

**Architecture:** Drizzle ORM schema remains the source of truth in `src/db/schema/`. `src/server/models/` exposes inferred row and enum types only. This task does not add repository, service, route handler, validator, mapper, frontend, dependency, lockfile, env, or migration changes.

**Tech Stack:** TypeScript, Drizzle ORM, PostgreSQL schema definitions, Vitest.

---

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/03-standards/glossary.yaml`
- `docs/03-standards/testing-tdd.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-answer-record-schema-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-answer-record-schema-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-answer-record-schema-baseline-security-review.md`
- `src/db/schema/**`
- `src/server/models/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files And Non-Goals

- Do not modify `package.json`, `pnpm-lock.yaml`, or `package-lock.json`.
- Do not modify `drizzle/**`; no migration generation in this task.
- Do not modify `src/app/**`.
- Do not modify `src/server/services/**`, `src/server/repositories/**`, `src/server/contracts/**`, `src/server/mappers/**`, or `src/server/validators/**`.
- Do not modify `.env.example`.
- Do not implement student APIs or scoring logic.

## Implementation Tasks

### Task 1: Red Test For Student Experience Schema

**Files:**

- Create: `src/db/schema/student-experience.test.ts`

- [x] Write a Vitest test that asserts:
  - Drizzle table names are `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book`.
  - Contract columns from `student-experience-contract.md` exist.
  - Contract index names exist, including public-id unique indexes and ownership/session indexes.
  - Status enum arrays match the Phase 4 contract.

- [x] Run `npm.cmd run test:unit -- src/db/schema/student-experience.test.ts`.

Expected before implementation: fail because `src/db/schema/student-experience` does not exist.

### Task 2: Implement Drizzle Schema Baseline

**Files:**

- Create: `src/db/schema/student-experience.ts`
- Modify: `src/db/schema/index.ts`

- [x] Add enum values:
  - `examModeValues`: `practice`, `mock_exam`
  - `examStatusValues`: `in_progress`, `scoring`, `scoring_partial_failed`, `completed`, `terminated`
  - `practiceStatusValues`: `in_progress`, `completed`, `expired`, `terminated`
  - `answerRecordStatusValues`: `draft`, `saved`, `submitted`, `scored`, `scoring_failed`
  - `mistakeBookSourceValues`: `wrong_answer`, `favorite`
  - `mistakeBookStatusValues`: `unmastered`, `mastered`, `removed`
- [x] Define Drizzle enums using registered or contract-approved enum names.
- [x] Define `practice`, `mockExam`, `answerRecord`, `examReport`, and `mistakeBook` tables.
- [x] Use `jsonb` for `paper_snapshot`, `question_snapshot`, `answer_snapshot`, `report_snapshot`, `learning_suggestion_snapshot`, and `latest_answer_snapshot`.
- [x] Use internal numeric `id` only in schema rows and `public_id` for public lookup-ready tables.
- [x] Use named indexes from the approved contract.
- [x] Define Drizzle relations to `user`, `paper`, `paperQuestion`, `practice`, and `mockExam` where the schema boundary can express them.
- [x] Export the new schema module from `src/db/schema/index.ts`.

### Task 3: Red Test For Domain Model Exports

**Files:**

- Create: `src/server/models/student-experience.test.ts`

- [x] Write a Vitest test that asserts:
  - Model exports expose the Phase 4 enum arrays.
  - Example `PracticeRow`, `MockExamRow`, `AnswerRecordRow`, `ExamReportRow`, and `MistakeBookRow` objects use snake_case database row fields.
  - Row examples do not expose camelCase API identifiers.

- [x] Run `npm.cmd run test:unit -- src/server/models/student-experience.test.ts`.

Expected before implementation: fail because `src/server/models/student-experience` does not exist.

### Task 4: Implement Model Type Exports

**Files:**

- Create: `src/server/models/student-experience.ts`

- [x] Export enum value arrays from the schema module.
- [x] Export enum union types.
- [x] Export `InferSelectModel` and `InferInsertModel` row types for the five Phase 4 tables.
- [x] Keep DTO contracts out of this task because `src/server/contracts/**` is blocked.

### Task 5: Security Review, Evidence, And Queue State

**Files:**

- Create: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-answer-record-schema-baseline-security-review.md`
- Create: `docs/05-execution-logs/evidence/2026-05-19-phase-4-answer-record-schema-baseline.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] Record security review with verdict `APPROVE` only if the schema avoids secret/session exposure and does not create API leakage.
- [x] Mark `phase-4-answer-record-schema-baseline` as `done`.
- [x] Set next recommended action to `claim_phase_4_student_paper_access_baseline`.
- [x] Record validation output in evidence.

## Validation Commands

Run exactly the queue-declared commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
Select-String -Path 'src\db\schema\*.ts' -Pattern 'practice|mock_exam|answer_record|exam_report|mistake_book'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Also run closeout checks before merge/push:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Risk Defenses

- No migration file is generated, so there is no database mutation in this task.
- Snapshot JSON fields are schema storage only; service/API filtering comes in later tasks.
- Public URLs will use `public_id`/`publicId`; numeric `id` stays internal.
- `mock_exam` answers can be stored without exposing correctness or analysis because this task defines storage only, not DTOs.
- Existing `paper` and `paper_question` snapshots remain the student-visible source for published content.
