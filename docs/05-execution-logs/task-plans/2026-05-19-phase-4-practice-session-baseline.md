# Phase 4 Practice Session Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for validators, mappers, service, and route code changes. Steps use checkbox (`- [ ]`) syntax for tracking.

**Task id:** `phase-4-practice-session-baseline`

**Goal:** Implement the student practice lifecycle API baseline for start/resume, detail, answer submission with objective feedback, restart, and termination without changing schema, dependencies, or frontend code.

**Architecture:** Follow ADR-002 layering: Next route files stay thin, route handlers resolve user context and parse transport input, service owns practice lifecycle and authorization rules, repository files define data access contracts, validators normalize request bodies, mappers convert snake_case repository rows to camelCase DTOs, and contracts define API response shapes. Runtime route files use an unavailable service plus unauthenticated resolver until real session and database wiring lands.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Vitest, existing API response helpers.

---

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-paper-access-baseline.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-practice-session-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-practice-session-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-practice-session-baseline-security-review.md`
- `src/app/api/v1/practices/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files And Non-Goals

- Do not modify `package.json`, `pnpm-lock.yaml`, or `package-lock.json`.
- Do not modify `src/db/schema/**`, `drizzle/**`, or `.env.example`.
- Do not implement mock exam, exam report, mistake book APIs, Phase 5 AI explanation/scoring, frontend pages, or real Better Auth session wiring.
- Do not expose numeric database `id` values in routes or DTOs.
- Do not read mutable question/material rows directly from student practice display code; consume `paper_snapshot`.

## Planned Files

- Create `src/server/contracts/practice-contract.ts`
- Create `src/server/repositories/practice-repository.ts`
- Create `src/server/mappers/practice-mapper.ts`
- Create `src/server/mappers/practice-mapper.test.ts`
- Create `src/server/validators/practice.ts`
- Create `src/server/validators/practice.test.ts`
- Create `src/server/services/practice-service.ts`
- Create `src/server/services/practice-service.test.ts`
- Create `src/server/services/practice-route.ts`
- Create `src/server/services/practice-route.test.ts`
- Create `src/app/api/v1/practices/route.ts`
- Create `src/app/api/v1/practices/[publicId]/route.ts`
- Create `src/app/api/v1/practices/[publicId]/answers/route.ts`
- Create `src/app/api/v1/practices/[publicId]/restart/route.ts`
- Create `src/app/api/v1/practices/[publicId]/terminate/route.ts`

## Implementation Tasks

### Task 1: Red Tests For Mapper And Validator

- [x] Add mapper tests proving `practice` and `answer_record` rows map from snake_case repository rows to camelCase `PracticeDto` and `PracticeAnswerFeedbackDto`.
- [x] Mapper tests must prove `paperSnapshot` and `answerRecordPublicId` are exposed, while internal numeric ids are absent.
- [x] Add validator tests proving:
  - Start input accepts only a non-empty `paperPublicId`.
  - Answer input normalizes `paperQuestionPublicId`, `selectedLabels`, `textAnswer`, and `savedFromClientAt`.
  - Invalid answer payload returns `null`.
- [x] Run targeted mapper/validator tests and confirm they fail because files are missing.

### Task 2: Implement Contracts, Mapper, Validator, Repository Types

- [x] Define `PracticeDto`, `PracticeAnswerFeedbackDto`, and structured answer snapshot types.
- [x] Define repository row contracts for practice rows, published practice paper rows, answer record rows, and mistake book upsert result rows.
- [x] Implement mapper functions with ISO timestamp formatting and no numeric id output.
- [x] Implement validator normalization without adding dependencies.
- [x] Run targeted mapper/validator tests and confirm they pass.

### Task 3: Red Tests For Practice Service

- [x] Add service tests proving:
  - `startPractice` creates a new 15-day `practice` for a published paper in current `authorization`.
  - `startPractice` resumes an existing active practice for the same user and paper.
  - Expired active practice is expired before a new practice starts.
  - `getPractice` hides missing, non-owned, expired, or unauthorized practice content.
  - `submitPracticeAnswer` reads question data from `paper_snapshot`, creates an `answer_record`, returns objective correctness plus `standardAnswerRichText` and `analysisRichText`, and updates `mistake_book` for wrong objective answers.
  - Objective questions cannot be answered twice.
  - `restartPractice` terminates the current active progress and starts a fresh one.
  - `terminatePractice` marks the session terminated and hides content from later student reads.
- [x] Run targeted service test and confirm it fails before implementation.

### Task 4: Implement Practice Service

- [x] Implement `createPracticeService` with injected repository, clock, and public id factory.
- [x] Keep `practice`, `answer_record`, and `mistake_book` terms explicit in service code for queue validation and readability.
- [x] Enforce user ownership, current effective authorization, published paper baseline, active state, and 15-day expiry.
- [x] Use only `paper_snapshot` to locate student-visible questions and feedback.
- [x] Return standard `{ code, message, data }` responses.
- [x] Run targeted service test and confirm it passes.

### Task 5: Red Tests For Practice Route Handlers

- [x] Add route tests proving:
  - Missing user context returns `{ code: 401001, message, data: null }`.
  - `POST /practices` parses JSON and calls `startPractice`.
  - `GET /practices/{publicId}` passes route `publicId`.
  - `POST /practices/{publicId}/answers` parses answer JSON.
  - `POST /practices/{publicId}/restart` and `/terminate` pass route `publicId`.
- [x] Run targeted route test and confirm it fails before implementation.

### Task 6: Implement Route Handlers And Runtime Route Files

- [x] Implement `createPracticeRouteHandlers`.
- [x] Create route files under `src/app/api/v1/practices/**`.
- [x] Runtime route files use unavailable service and unavailable resolver, matching existing baseline routes.
- [x] Include a local `responseContract` object in each route file containing `code`, `message`, and `data` to satisfy queue route contract scanning.
- [x] Run targeted route test and confirm it passes.

### Task 7: Security Review, Evidence, And Queue State

- [x] Create security review with verdict `APPROVE` only if ownership, authorization, expiry, and feedback boundaries are explicit.
- [x] Mark `phase-4-practice-session-baseline` as `done`.
- [x] Update `project-state.yaml` next recommended action to `claim_phase_4_mock_exam_session_baseline`.
- [x] Write evidence with red/green tests and validation output.

## Validation Commands

Run exactly the queue-declared commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
Select-String -Path 'src\app\api\v1\practices\**\*.ts' -Pattern 'code|message|data'
Select-String -Path 'src\server\services\*.ts' -Pattern 'practice|answer_record|mistake_book'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Also run:

```powershell
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Risk Defenses

- No schema, migration, dependency, env, or frontend changes.
- Student route handlers never return repository rows directly.
- `publicId` lookups are always combined with user context, ownership, authorization, and session status.
- Practice feedback can return `standardAnswerRichText` and `analysisRichText` only after an answer is submitted.
- Mock exam behavior is intentionally excluded so this task does not accidentally leak answers into exam mode.
