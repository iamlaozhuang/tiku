# Phase 9 Student Experience UI Completion Task Plan

## Metadata

- Task id: `phase-9-student-experience-ui-completion`
- Branch: `codex/phase-9-student-experience-ui-completion`
- Base: `master`
- Created at: `2026-05-23T00:00:00+08:00`

## Read Before Implementation

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-student-mock-exam-report-runtime-completion.md`

## Queue Boundary

Allowed files:

- This task plan and final evidence.
- `src/app/(student)/**`
- `src/features/student/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Goal

Complete the Phase 9 student experience UI runtime gap for the mobile-first Web surface by wiring existing student UI pages to the approved REST runtime where it already exists: `home`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.

## Implementation Strategy

1. Keep all API calls inside student feature components and reuse the existing local session token boundary `tiku.localSessionToken`.
2. Preserve existing fixture props for deterministic unit tests and non-runtime visual fallback, but make route defaults load from `/api/v1/*`.
3. Add RED tests before runtime UI changes:
   - `StudentHomePage` loads scopes and papers through `/api/v1/student-papers/scopes` and `/api/v1/student-papers`.
   - `StudentPracticePage` starts/resumes a practice through `/api/v1/practices` and submits answers through `/api/v1/practices/{publicId}/answers`.
   - `StudentMockExamPage` starts/loads a mock exam, saves answers, and submits through `/api/v1/mock-exams`.
   - `StudentExamReportPage` loads detail through `/api/v1/exam-reports/{publicId}`.
   - Add an exam report record-list UI backed by `/api/v1/exam-reports`, including search/status filters for `US-03-08`.
4. Keep mock exam answering free of correctness, `standard_answer`, `analysis`, `ai_hint`, or `ai_explanation` before submit.
5. Do not add dependencies, do not modify server/auth/authorization runtime, and do not expose internal `id` or session token in rendered DOM.

## Risk Defense

- If API response `code` is non-zero or `data` is `null`, render typed error or unauthorized states instead of silently falling back to fixture data.
- If no authorization scopes are returned, guide the student to redeem code without leaking paper metadata.
- If `paperPublicId`, `practicePublicId`, `mockExamPublicId`, or `examReportPublicId` is missing, render a clear empty state rather than using an internal numeric identifier.
- Keep AI-only controls disabled or status-only when the runtime belongs to later Phase 9 AI tasks.
- Avoid expanding product scope beyond student UI runtime and the already contracted mock exam record list.

## TDD And Verification Plan

1. Run focused unit tests after adding RED tests and confirm expected failures.
2. Implement the smallest runtime wiring needed for the tests to pass.
3. Run focused unit tests again.
4. Run the queue validation commands and capture results in evidence:
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-experience-ui-completion`
   - `npm.cmd run test:unit`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
   - `npm.cmd run build`
   - `npm.cmd run test:e2e`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Matrix Conflict Notes

- `phase-9-mvp-acceptance-contract` includes AI scoring, AI explanation, AI hint, learning suggestions, and RAG citations. Those are outside this task's allowed files and remain for later Phase 9 AI/RAG tasks.
- `mistake_book` already uses runtime API in the existing UI. This task may add filters if needed, but should not modify server-side mistake book behavior.
