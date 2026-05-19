# Phase 4 Mistake Book Baseline Security Review

## Metadata

- Task id: `phase-4-mistake-book-baseline`
- Branch: `codex/phase-4-mistake-book-baseline`
- Base: `master`
- Review date: 2026-05-19
- Reviewer: Codex
- Risk types: `authorization`, `api_contract`, `data_contract`, `student`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/mistake-books/**`
- `src/server/contracts/mistake-book-contract.ts`
- `src/server/mappers/mistake-book-mapper.ts`
- `src/server/repositories/mistake-book-repository.ts`
- `src/server/services/mistake-book-route.ts`
- `src/server/services/mistake-book-service.ts`
- `src/server/validators/mistake-book.ts`
- Targeted unit tests for mapper, validator, service, and route adapter behavior.

## Abuse Cases Considered

- A student changes `publicId` to read or mutate another user's `mistake_book` item.
- A student attempts to view historical wrong answers after current `authorization` no longer covers the item `profession` and `level`.
- A client attempts to set arbitrary `mistakeBookStatus` or `isRemoved` values through action endpoints.
- A client attempts to trigger Phase 5 `ai_explanation` generation before AI/RAG is implemented.
- A client attempts to infer internal numeric ids from DTOs or URLs.

## Data Exposure Review

- DTOs expose public identifiers only and do not include numeric database `id`.
- Routes use `[publicId]`, never `[id]`.
- `questionSnapshot` and `latestAnswerSnapshot` are returned as stored student-facing snapshots; they are not recomputed from untrusted client input.
- Optional timestamp fields return `null`, not empty strings.
- Route files keep standard `{ code, message, data }` response contracts.

## Authorization Boundary Review

- Service methods require explicit `MistakeBookUserContext`.
- List behavior filters records by current effective `authorization` and hides removed records.
- Detail and action behavior combines user-owned lookup with current effective `authorization`.
- `favorite`, `unfavorite`, `mark-mastered`, and `remove` are explicit service methods; clients cannot pass arbitrary status transitions.
- Unauthorized detail/action reads return not-found style responses to reduce metadata leakage.
- `publicId` is treated only as a lookup key, not as an access-control mechanism.

## API Contract Review

- Routes live under `/api/v1/mistake-books`.
- Action subpaths are verb-style and kebab-case: `favorite`, `unfavorite`, `mark-mastered`, `remove`, and `ai-explanation`.
- JSON DTO fields are camelCase and preserve Tiku terminology: `mistakeBook`, `mistakeBookStatus`, `latestAnswerSnapshot`, `wrongCount`, `masteredAt`.
- Response body shape remains `{ code, message, data, pagination? }`.
- Phase 4 `ai-explanation` returns `422331` with `data: null`; no fabricated AI content or citation is returned.

## Test Coverage And Accepted Gaps

- Covered mapper DTO shape, internal id omission, nullable timestamp mapping, query normalization, authorization-filtered list, detail authorization loss, favorite/unfavorite state updates, mark-mastered timestamping, remove soft-state update, AI explanation not-available response, and route adapter session handling.
- Repository implementation is interface-only in this task; database transactionality and persistence integration are deferred to later tasks.
- Real session resolver remains unavailable, matching existing baseline route pattern.
- Removed records remain auditable through repository state but are hidden from default list behavior.

## Evidence

- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass after correcting `multi_choice` terminology.
- `npm.cmd run test:unit`: pass, 61 files and 184 tests.
- Mistake book route response contract scan: pass.
- Service keyword scan for `mistake_book`, `mastered`, and `authorization`: pass.
- `Test-NamingConventions.ps1`: pass.
- `npm.cmd run format:check`: pass after Prettier formatting of three new files.
