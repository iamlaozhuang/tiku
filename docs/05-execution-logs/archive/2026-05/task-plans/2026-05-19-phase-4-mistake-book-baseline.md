# Phase 4 Mistake Book Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:test-driven-development` and `superpowers:verification-before-completion`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Phase 4 `mistake_book` API baseline for authorized student review, favorite/unfavorite, mark-mastered, remove, and Phase 5 AI explanation not-available handling.

**Architecture:** Follow ADR-002 route handler -> service -> repository -> mapper/validator/contract layering. `mistake_book` reads and writes must be user-owned and authorization-filtered, expose only `publicId`, and return standard `{ code, message, data, pagination? }` responses. Phase 4 does not invoke AI; `ai-explanation` returns a documented not-available response.

**Tech Stack:** Next.js App Router route handlers, TypeScript service/repository contracts, Vitest unit tests, existing API response helpers.

---

## Required Sources Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-exam-report-baseline.md`

## Scope Controls

Allowed implementation files:

- `src/app/api/v1/mistake-books/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-mistake-book-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-mistake-book-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mistake-book-baseline-security-review.md`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`

## Implementation Tasks

### Task 1: Contracts, Repository Shape, And Mapper

**Files:**

- Create: `src/server/contracts/mistake-book-contract.ts`
- Create: `src/server/repositories/mistake-book-repository.ts`
- Create: `src/server/mappers/mistake-book-mapper.ts`
- Create: `src/server/mappers/mistake-book-mapper.test.ts`

- [ ] Write failing mapper tests for `MistakeBookItemDto` and internal id omission.
- [ ] Run `npm.cmd run test:unit -- src/server/mappers/mistake-book-mapper.test.ts` and confirm it fails because the mapper module is missing.
- [ ] Implement DTO types, repository row/input types, and mapper functions.
- [ ] Re-run the mapper test and confirm it passes.

### Task 2: Validators

**Files:**

- Create: `src/server/validators/mistake-book.ts`
- Create: `src/server/validators/mistake-book.test.ts`

- [ ] Write failing tests for list query normalization: page, pageSize, questionType, source, status, isFavorite.
- [ ] Run `npm.cmd run test:unit -- src/server/validators/mistake-book.test.ts` and confirm it fails because the validator module is missing.
- [ ] Implement conservative validators; unsupported values normalize to `null`.
- [ ] Re-run the validator test and confirm it passes.

### Task 3: Service Behavior

**Files:**

- Create: `src/server/services/mistake-book-service.ts`
- Create: `src/server/services/mistake-book-service.test.ts`

- [ ] Write failing tests for authorization-filtered list, detail access, favorite/unfavorite, mark-mastered, remove, and AI explanation not-available response.
- [ ] Run `npm.cmd run test:unit -- src/server/services/mistake-book-service.test.ts` and confirm it fails because the service module is missing.
- [ ] Implement `createMistakeBookService` with explicit user context, effective authorization checks, and state transition methods.
- [ ] Re-run the service test and confirm it passes.

### Task 4: Route Adapters And API Routes

**Files:**

- Create: `src/server/services/mistake-book-route.ts`
- Create: `src/server/services/mistake-book-route.test.ts`
- Create: `src/app/api/v1/mistake-books/route.ts`
- Create: `src/app/api/v1/mistake-books/[publicId]/route.ts`
- Create: `src/app/api/v1/mistake-books/[publicId]/favorite/route.ts`
- Create: `src/app/api/v1/mistake-books/[publicId]/unfavorite/route.ts`
- Create: `src/app/api/v1/mistake-books/[publicId]/mark-mastered/route.ts`
- Create: `src/app/api/v1/mistake-books/[publicId]/remove/route.ts`
- Create: `src/app/api/v1/mistake-books/[publicId]/ai-explanation/route.ts`

- [ ] Write failing route adapter tests for collection/detail/action handlers and missing session response.
- [ ] Run `npm.cmd run test:unit -- src/server/services/mistake-book-route.test.ts` and confirm it fails because the route adapter module is missing.
- [ ] Implement route adapters and thin Next.js route files using unavailable service/resolver defaults.
- [ ] Re-run the route adapter test and confirm it passes.

### Task 5: Evidence, Security Review, And State

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-19-phase-4-mistake-book-baseline.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mistake-book-baseline-security-review.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] Run the task validation commands from `task-queue.yaml`.
- [ ] Run `npm.cmd run format:check` because new files are added.
- [ ] Run `Test-AgentSystemReadiness.ps1`, `Invoke-QualityGate.ps1`, and `Test-GitCompletionReadiness.ps1`.
- [ ] Write evidence with command outputs, TDD red/green notes, changed files, commit/merge/push/cleanup fields.
- [ ] Write security review with verdict `APPROVE` only if authorization, DTO exposure, public id, and action-state checks pass.
- [ ] Mark `phase-4-mistake-book-baseline` as `done`, update `nextRecommendedAction` to `claim_phase_4_student_home_ui_baseline`, and keep the current task idle after closeout.

## Risk Defense

- Do not expose numeric database `id` in DTOs or routes.
- Combine `publicId` lookup with user ownership and effective `authorization`; `publicId` is not a permission boundary.
- Hide unauthorized records with not-found style responses.
- Keep removed records auditable internally but hidden by default list semantics.
- `mark-mastered`, `favorite`, `unfavorite`, and `remove` must be explicit service methods and must not accept arbitrary status from clients.
- Do not invoke `ai_explanation` in Phase 4; return a documented not-available response.
- Use `mistake_book`, `authorization`, `mastered`, and glossary terms consistently.

## Verification Plan

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `Select-String -Path 'src\app\api\v1\mistake-books\**\*.ts' -Pattern 'code|message|data'`
- `Select-String -Path 'src\server\services\*.ts' -Pattern 'mistake_book|mastered|authorization'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `npm.cmd run format:check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Plan Self-Review

- Spec coverage: covers US-03-09 list/detail/action baseline, authorization hiding, pagination, favorite/remove/mastered state operations, and Phase 5 AI explanation deferral.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation slots are left.
- Type consistency: DTO, repository, service, route, and validator names use `mistake_book` terminology and API camelCase fields.
