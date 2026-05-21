# Security Review: Phase 7 Student Flow Runtime Smoke

## Metadata

- Task id: `phase-7-student-flow-runtime-smoke`
- Branch: `codex/phase-7-student-flow-runtime-smoke`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-21

## Files Reviewed

- `src/server/services/student-flow-runtime.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/app/api/v1/student-papers/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`

## Risk Types Reviewed

- authorization
- student
- practice
- mock_exam
- exam_report
- api_contract

## Abuse Cases Considered

- A request with no session attempts to read student papers, practices, mock_exams, or exam_reports.
- A student changes a `{publicId}` route parameter to another user's resource.
- A student with expired, cancelled, disabled, or not-yet-started authorization attempts to access a paper.
- A student submits an answer for a paper question outside the persisted paper snapshot.
- A client attempts to infer numeric database ids from response bodies.

## Data Exposure Review

- API DTOs are still produced through existing mappers.
- Numeric database `id` values stay inside repository rows and are not returned by the runtime smoke test.
- Session tokens are consumed only through `authorization` headers and are not returned by student flow routes.
- The local repository derives `paperName` for reports from joined paper data and does not expose raw schema rows.

## Authorization Boundary Review

- Missing or invalid sessions return the existing standard `401001` user-session-required response.
- Admin sessions are rejected for student flow by requiring a non-null `userType`.
- Effective `personal_auth` scopes require active user, active authorization, `starts_at <= now`, and `expires_at > now`.
- Student paper, practice, mock_exam, and exam_report services re-check effective authorization before returning detail or accepting writes.
- `{publicId}` remains a lookup handle only; ownership is checked through `userPublicId` to user-id mapping in repository queries.

## API Contract Review

- Responses use existing `{ code, message, data, pagination? }` helpers.
- Route folders remain kebab-case and route params remain public identifiers.
- DTO fields remain camelCase through existing contract mappers.
- Empty list results return arrays inside standard response data and pagination metadata.
- Optional values are returned as `null` through existing mapper behavior.

## Test Coverage And Accepted Gaps

- RED/GREEN unit coverage was added for authenticated route runtime wiring across student papers, practice answer submission, mock_exam submission, and exam_report generation/detail.
- Full unit, quality gate, build, naming scan, and git inventory passed before this review verdict.
- Accepted gap: deferred routes stay unavailable for practice restart/terminate, mock_exam terminate, and learning suggestion retry until later tasks.
- Accepted gap: this task does not claim full local E2E runtime readiness; that remains queued for `phase-7-local-e2e-readiness-evidence`.

## Verdict

APPROVE
