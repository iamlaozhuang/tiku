# Phase 4 Exam Report Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:test-driven-development` and `superpowers:verification-before-completion`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Phase 4 `exam_report` API baseline for submitted `mock_exam` attempts without changing schema, dependencies, migrations, or env files.

**Architecture:** Follow ADR-002 route handler -> service -> repository -> mapper/validator/contract layering. `exam_report` reads must be user-owned and authorization-filtered, expose only `publicId` values, and return standard `{ code, message, data }` responses. Report generation creates immutable report snapshots from submitted `mock_exam` rows and saved `answer_record` rows; Phase 5 AI learning suggestions remain nullable or not available.

**Tech Stack:** Next.js App Router route handlers, TypeScript service/repository contracts, Vitest unit tests, existing API response helpers.

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
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-mock-exam-session-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mock-exam-session-baseline-security-review.md`

## Scope Controls

Allowed implementation files:

- `src/app/api/v1/exam-reports/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-exam-report-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-exam-report-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-exam-report-baseline-security-review.md`

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

- Create: `src/server/contracts/exam-report-contract.ts`
- Create: `src/server/repositories/exam-report-repository.ts`
- Create: `src/server/mappers/exam-report-mapper.ts`
- Create: `src/server/mappers/exam-report-mapper.test.ts`

- [ ] Write a failing mapper test for `ExamReportSummaryDto` and `ExamReportDetailDto`.
- [ ] Run `npm.cmd run test:unit -- src/server/mappers/exam-report-mapper.test.ts` and confirm it fails because the mapper module is missing.
- [ ] Implement DTO types, repository row/input types, and mapper functions.
- [ ] Re-run the mapper test and confirm it passes.

### Task 2: Validators

**Files:**

- Create: `src/server/validators/exam-report.ts`
- Create: `src/server/validators/exam-report.test.ts`

- [ ] Write failing tests for list query normalization and Phase 5 retry input normalization.
- [ ] Run `npm.cmd run test:unit -- src/server/validators/exam-report.test.ts` and confirm it fails because the validator module is missing.
- [ ] Implement conservative validators for `page`, `pageSize`, `status`, `search`, and `requestedFromClientAt`.
- [ ] Re-run the validator test and confirm it passes.

### Task 3: Service Behavior

**Files:**

- Create: `src/server/services/exam-report-service.ts`
- Create: `src/server/services/exam-report-service.test.ts`

- [ ] Write failing tests for report list authorization filtering, detail access by `publicId`, generation from completed `mock_exam`, terminated attempt rejection, and Phase 5 retry not-available response.
- [ ] Run `npm.cmd run test:unit -- src/server/services/exam-report-service.test.ts` and confirm it fails because the service module is missing.
- [ ] Implement `createExamReportService` with explicit user context, effective authorization checks, immutable `report_snapshot`, `learning_suggestion_snapshot: null`, and no AI calls.
- [ ] Re-run the service test and confirm it passes.

### Task 4: Route Adapters And API Routes

**Files:**

- Create: `src/server/services/exam-report-route.ts`
- Create: `src/server/services/exam-report-route.test.ts`
- Create: `src/app/api/v1/exam-reports/route.ts`
- Create: `src/app/api/v1/exam-reports/[publicId]/route.ts`
- Create: `src/app/api/v1/exam-reports/[publicId]/retry-learning-suggestion/route.ts`

- [ ] Write failing route adapter tests for collection/detail/retry handlers and missing session response.
- [ ] Run `npm.cmd run test:unit -- src/server/services/exam-report-route.test.ts` and confirm it fails because the route adapter module is missing.
- [ ] Implement route adapters and thin Next.js route files using unavailable service/resolver defaults.
- [ ] Re-run the route adapter test and confirm it passes.

### Task 5: Evidence, Security Review, And State

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-19-phase-4-exam-report-baseline.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-exam-report-baseline-security-review.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] Run the task validation commands from `task-queue.yaml`.
- [ ] Run `npm.cmd run format:check` because new files are added.
- [ ] Run `Test-AgentSystemReadiness.ps1`, `Invoke-QualityGate.ps1`, and `Test-GitCompletionReadiness.ps1`.
- [ ] Write evidence with command outputs, changed files, TDD red/green notes, commit/merge/push/cleanup fields.
- [ ] Write security review with verdict `APPROVE` only if authorization, DTO exposure, and API response checks pass.
- [ ] Mark `phase-4-exam-report-baseline` as `done`, update `nextRecommendedAction` to `claim_phase_4_mistake_book_baseline`, and keep the current task idle after closeout.

## Risk Defense

- Do not expose numeric database `id` in DTOs or routes.
- Combine report detail lookup with user ownership and effective `authorization`; `publicId` is not a permission boundary.
- Return `null` for unavailable `learningSuggestionSnapshot`; do not fabricate AI output in Phase 4.
- Do not generate reports for `terminated` `mock_exam` attempts.
- Preserve report immutability by storing `reportSnapshot` and returning it instead of recomputing historical display from mutable paper/question data.
- Keep route handlers thin and keep business rules in `src/server/services/exam-report-service.ts`.
- Use existing naming: `exam_report`, `mock_exam`, `answer_record`, `learning_suggestion`.

## Verification Plan

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `Select-String -Path 'src\app\api\v1\exam-reports\**\*.ts' -Pattern 'code|message|data'`
- `Select-String -Path 'src\server\services\*.ts' -Pattern 'exam_report|snapshot|scoring'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `npm.cmd run format:check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Plan Self-Review

- Spec coverage: covers US-03-07 reports, US-03-08 list behavior baseline, Phase 4 contract API and DTO requirements, authorization and snapshot invariants.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation slots are left.
- Type consistency: DTO names, repository row names, route names, and service names use the `exam_report` glossary term and API camelCase fields.
