# Phase 4 Student Paper Access Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for service, mapper, validator, and route code changes. Steps use checkbox (`- [ ]`) syntax for tracking.

**Task id:** `phase-4-student-paper-access-baseline`

**Goal:** Implement the authorized student paper scopes, list, and detail API baseline without changing schema, migrations, dependencies, or frontend code.

**Architecture:** Follow ADR-002 layering: route handlers stay thin, service owns authorization and paper access rules, repository files define data access contracts, validators normalize transport input, mappers convert snake_case storage rows to camelCase DTOs, and contracts define API shapes. Runtime route files use an unavailable service plus unauthenticated resolver until real session wiring lands, matching existing API baselines.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Vitest, existing API response helpers.

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
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-paper-access-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-paper-access-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-student-paper-access-baseline-security-review.md`
- `src/app/api/v1/student-papers/**`
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
- Do not implement practice, mock exam, report, mistake book, frontend pages, or real Better Auth session wiring.
- Do not expose numeric database `id` values in routes or DTOs.
- Do not return `draft` or `archived` papers from student-facing access.

## Planned Files

- Create `src/server/contracts/student-paper-contract.ts`
- Create `src/server/repositories/student-paper-repository.ts`
- Create `src/server/mappers/student-paper-mapper.ts`
- Create `src/server/mappers/student-paper-mapper.test.ts`
- Create `src/server/validators/student-paper.ts`
- Create `src/server/validators/student-paper.test.ts`
- Create `src/server/services/student-paper-service.ts`
- Create `src/server/services/student-paper-service.test.ts`
- Create `src/server/services/student-paper-route.ts`
- Create `src/server/services/student-paper-route.test.ts`
- Create `src/app/api/v1/student-papers/route.ts`
- Create `src/app/api/v1/student-papers/scopes/route.ts`
- Create `src/app/api/v1/student-papers/[publicId]/route.ts`

## Implementation Tasks

### Task 1: Red Tests For Mapper And Validator

- [x] Add mapper tests proving:
  - Storage rows in snake_case become DTOs in camelCase.
  - Student paper summaries include `publicId`, `name`, `profession`, `level`, `subject`, `paperType`, `durationMinute`, `totalScore`, `publishedAt`, `questionCount`, `canPractice`, and `canMockExam`.
  - Detail DTO includes `paperSnapshot` and no internal numeric `id`.
- [x] Add validator tests proving:
  - Query strings normalize to `profession`, `level`, `subject`, pagination, and `publishedAt` descending.
  - Invalid profession/subject become `null` and invalid page size is clamped by existing pagination behavior.
- [x] Run targeted tests and confirm they fail because files are missing.

### Task 2: Implement Contracts, Mapper, Validator, Repository Types

- [x] Define `StudentPaperScopeDto`, `StudentPaperSummaryDto`, `StudentPaperDetailDto`, and `StudentPaperListDto`.
- [x] Define repository row contracts for effective authorization scopes and published student papers.
- [x] Implement mapper functions with ISO timestamp formatting and no numeric id output.
- [x] Implement validator normalization without adding dependencies.
- [x] Run targeted mapper/validator tests and confirm they pass.

### Task 3: Red Tests For Service Authorization Rules

- [x] Add service tests proving:
  - `listScopes` returns effective authorization scopes.
  - `listStudentPapers` returns only `published` papers matching effective `authorization`.
  - A single authorized scope can be inferred when no `profession`/`level` query is provided.
  - Multiple scopes without explicit selection return a typed `4223xx` error instead of leaking paper metadata.
  - Out-of-scope requests return `4033xx`.
  - Detail access returns a paper only when `publicId`, ownership context, published status, and effective authorization match.
  - Missing or unauthorized detail access returns `4043xx` with `data: null`.
- [x] Run targeted service test and confirm it fails before implementation.

### Task 4: Implement Student Paper Service

- [x] Implement `createStudentPaperService`.
- [x] Keep `authorization`, `paper_snapshot`, and `published` terms explicit in service code for queue validation and code readability.
- [x] Use current effective authorization from repository rows and do not trust `publicId` alone.
- [x] Return standard `{ code, message, data, pagination? }` responses.
- [x] Run targeted service test and confirm it passes.

### Task 5: Red Tests For Route Handlers

- [x] Add route tests proving:
  - Missing user context returns `{ code: 401001, message, data: null }`.
  - `GET /student-papers/scopes` calls service with user context.
  - `GET /student-papers` passes query parameters to service.
  - `GET /student-papers/{publicId}` passes route `publicId` to service.
- [x] Run targeted route test and confirm it fails before implementation.

### Task 6: Implement Route Handlers And Runtime Route Files

- [x] Implement `createStudentPaperRouteHandlers`.
- [x] Create route files under `src/app/api/v1/student-papers/**`.
- [x] Runtime route files use unavailable service and unavailable resolver, matching existing baseline routes.
- [x] Include a local `responseContract` object in each route file containing `code`, `message`, and `data` to satisfy queue route contract scanning.
- [x] Run targeted route test and confirm it passes.

### Task 7: Security Review, Evidence, And Queue State

- [x] Create security review with verdict `APPROVE` only if user ownership and authorization boundaries are explicit.
- [x] Mark `phase-4-student-paper-access-baseline` as `done`.
- [x] Update `project-state.yaml` next recommended action to `claim_phase_4_practice_session_baseline`.
- [x] Write evidence with red/green tests and validation output.

## Validation Commands

Run exactly the queue-declared commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
Select-String -Path 'src\app\api\v1\student-papers\**\*.ts' -Pattern 'code|message|data'
Select-String -Path 'src\server\services\*.ts' -Pattern 'authorization|paper_snapshot|published'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Also run:

```powershell
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Risk Defenses

- No schema, migration, dependency, env, or frontend changes.
- Route handlers are thin adapters and never return database rows directly.
- Student list and detail access must combine user context and effective `authorization`; `publicId` is never treated as permission.
- Student-facing DTOs expose `publicId` and camelCase fields only.
- Draft and archived papers stay excluded from student-facing access.
