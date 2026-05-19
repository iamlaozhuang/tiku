# Phase 4 Mock Exam Session Baseline Security Review

## Metadata

- Task id: `phase-4-mock-exam-session-baseline`
- Branch: `codex/phase-4-mock-exam-session`
- Base: `master`
- Review date: 2026-05-19
- Reviewer: Codex
- Risk types: `authorization`, `api_contract`, `data_contract`, `student`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/mock-exams/**`
- `src/server/contracts/mock-exam-contract.ts`
- `src/server/mappers/mock-exam-mapper.ts`
- `src/server/repositories/mock-exam-repository.ts`
- `src/server/services/mock-exam-route.ts`
- `src/server/services/mock-exam-service.ts`
- `src/server/validators/mock-exam.ts`
- Targeted unit tests for mapper, validator, service, and route adapter behavior.

## Abuse Cases Considered

- A student changes `publicId` to access another user's `mock_exam`.
- A student starts a `mock_exam` for a paper outside effective `authorization`.
- A student saves answers after submission, termination, or server deadline expiry.
- A client attempts to infer answers during `mock_exam` by inspecting answer save responses.
- A terminated attempt tries to trigger scoring or report generation.

## Data Exposure Review

- DTOs expose public identifiers only and do not include numeric database `id`.
- Answer save response returns `AnswerRecordDto` with `isCorrect`, `score`, and `submittedAt` as `null` before submission.
- Answer save response does not include `standardAnswerRichText`, `analysisRichText`, `aiHint`, or `aiExplanation`.
- Route files keep standard `{ code, message, data }` responses.
- Optional fields return `null`, not empty strings.

## Authorization Boundary Review

- Service methods require explicit `MockExamUserContext`.
- Paper start checks published paper lookup plus effective `authorization`.
- Existing `mock_exam` lookups combine user ownership and effective authorization.
- `publicId` is treated only as a lookup key, not as an access-control mechanism.
- Unauthorized reads return a not-found style response to avoid leaking metadata.

## API Contract Review

- Routes live under `/api/v1/mock-exams`.
- Dynamic route parameter is `[publicId]`, never `[id]`.
- Action subpaths use `answers`, `submit`, and `terminate`.
- JSON DTO fields are camelCase and preserve Tiku terminology: `mockExam`, `answerRecord`, `serverNow`, `serverDeadlineAt`.

## Test Coverage And Accepted Gaps

- Covered start/resume, authorization denial, deadline auto-submit, answer save without feedback leakage, manual submit objective scoring, unanswered count, termination, mapper shape, validators, and route adapters.
- Repository implementation is interface-only in this task; database transactionality and conflict handling are deferred to later integration tasks.
- Phase 4 does not generate `exam_report` here; report generation is deferred to `phase-4-exam-report-baseline`.
- Phase 5 `ai_scoring` is not invoked; subjective score remains `null`.
- Real session resolver remains unavailable, matching existing baseline route pattern.

## Evidence

- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run test:unit`: pass, 53 files and 156 tests.
- Mock exam route response contract scan: pass.
- Service keyword scan for `mock_exam`, `server`, and `terminated`: pass.
- `Test-NamingConventions.ps1`: pass.
- `npm.cmd run format:check`: pass after Prettier formatting of five new files.
