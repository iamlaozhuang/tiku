# Phase 4 Exam Report Baseline Security Review

## Metadata

- Task id: `phase-4-exam-report-baseline`
- Branch: `codex/phase-4-exam-report-baseline`
- Base: `master`
- Review date: 2026-05-19
- Reviewer: Codex
- Risk types: `authorization`, `api_contract`, `data_contract`, `student`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/exam-reports/**`
- `src/server/contracts/exam-report-contract.ts`
- `src/server/mappers/exam-report-mapper.ts`
- `src/server/repositories/exam-report-repository.ts`
- `src/server/services/exam-report-route.ts`
- `src/server/services/exam-report-service.ts`
- `src/server/validators/exam-report.ts`
- Targeted unit tests for mapper, validator, service, and route adapter behavior.

## Abuse Cases Considered

- A student changes `publicId` to read another user's `exam_report`.
- A student attempts to view historical reports after current `authorization` no longer covers the report `profession` and `level`.
- A client attempts to generate an `exam_report` for a `terminated` `mock_exam`.
- A client attempts to trigger Phase 5 learning suggestion retry before AI/RAG is implemented.
- A client attempts to infer internal numeric ids from report DTOs or URLs.

## Data Exposure Review

- DTOs expose public identifiers only and do not include numeric database `id`.
- `reportSnapshot` is returned as an immutable student-facing snapshot and is produced from `paper_snapshot` and answer snapshots.
- `learningSuggestionSnapshot` returns `null` in Phase 4; no fabricated AI content or citations are returned.
- Optional fields return `null`, not empty strings.
- Route files keep standard `{ code, message, data }` response contracts.

## Authorization Boundary Review

- Service methods require explicit `ExamReportUserContext`.
- Report list filters rows by current effective `authorization`.
- Report detail combines user ownership lookup with current effective `authorization`.
- Report generation checks user-owned submitted `mock_exam` and current effective `authorization`.
- `publicId` is treated only as a lookup key, not as an access-control mechanism.
- Unauthorized detail reads return not-found style response to avoid metadata leakage.

## API Contract Review

- Routes live under `/api/v1/exam-reports`.
- Dynamic route parameter is `[publicId]`, never `[id]`.
- Phase 5 action route uses `retry-learning-suggestion`.
- JSON DTO fields are camelCase and preserve Tiku terminology: `examReport`, `mockExamPublicId`, `reportSnapshot`, `learningSuggestionSnapshot`.
- Response body shape remains `{ code, message, data, pagination? }`.

## Test Coverage And Accepted Gaps

- Covered mapper DTO shape, internal id omission, immutable detail snapshot, query normalization, report list authorization filtering, detail authorization loss, report generation, terminated mock exam rejection, retry not-available response, and route adapter session handling.
- Repository implementation is interface-only in this task; database transactionality and duplicate generation constraints are deferred to later integration tasks.
- Real session resolver remains unavailable, matching existing baseline route pattern.
- Phase 5 AI learning suggestion generation is not invoked.
- Knowledge node and question type aggregate scoring can be expanded from `reportSnapshot` in later analytics/UI tasks.

## Evidence

- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run test:unit`: pass, 57 files and 170 tests.
- Exam report route response contract scan: pass.
- Service keyword scan for `exam_report`, `snapshot`, and `scoring`: pass.
- `Test-NamingConventions.ps1`: pass.
- `npm.cmd run format:check`: pass after Prettier formatting of two new files.
