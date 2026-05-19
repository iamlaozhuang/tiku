# Phase 3 Paper Draft Composition Baseline Security Review

## Review Metadata

- Task id: `phase-3-paper-draft-composition-baseline`
- Branch: `codex/phase-3-paper-draft-composition-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-19`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/papers/**`
- `src/server/contracts/paper-draft-contract.ts`
- `src/server/mappers/paper-draft-mapper.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `src/server/services/paper-draft-route.ts`
- `src/server/services/paper-draft-route.test.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/paper-draft-service.test.ts`
- `src/server/validators/paper-draft.ts`

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `data_contract`
- `admin`

## Abuse Cases Considered

- Calling paper draft routes without authenticated admin context.
- Guessing or changing `publicId` or `paperQuestionPublicId` values to read or mutate draft composition.
- Adding a question to a non-draft paper.
- Updating or removing paper questions from a non-draft paper.
- Sending malformed JSON, invalid enum values, invalid duration, invalid score granularity, or invalid `sortOrder`.
- Attempting to expose internal numeric paper, paper_section, question_group, paper_question, material, or scoring point ids through API DTOs.
- Injecting internal ids into snapshots or material snapshots.

## Authorization Boundary Review

- Runtime Next.js route files are wired to `createUnavailablePaperDraftService()` and return a standard `503203` response until authenticated admin runtime wiring is implemented.
- No repository-backed draft paper reads or writes are exposed from committed route files without admin context.
- Service boundaries document draft paper metadata and composition operations for later admin integration.
- Follow-up runtime integration must inject authenticated admin context and content-role permission checks before enabling real mutations.

## Data Exposure Review

- Repository rows may contain numeric `id`, `paper_section_id`, and `question_group_id`, but mappers strip those fields from API DTOs.
- API DTOs expose `publicId`, `paperQuestionPublicId`-backed `publicId`, `sourceQuestionPublicId`, snapshots, scores, and display `sortOrder` values only.
- `questionSnapshot` and `materialSnapshot` are camelCase and contain no internal numeric ids, session data, admin phone numbers, secrets, or storage keys.
- Empty optional values use `null`, and empty child collections use `[]`.

## API Contract Review

- Route paths use `/api/v1/papers`, `[publicId]`, and `[paperQuestionPublicId]`.
- Nested composition route depth stays within the approved Phase 3 contract.
- API response shape remains `{ code, message, data, pagination? }`.
- JSON fields are camelCase.
- Error responses use standard envelopes with `data: null`.

## Test Coverage

- RED verified: targeted paper draft tests failed before implementation because `paper-draft-service` and `paper-draft-route` were missing.
- GREEN verified: targeted paper draft service/route tests pass after implementation.
- Full unit suite is covered in task evidence.
- Tests cover metadata create/list/detail/update, add/update/remove paper questions, snapshot output, `paperSection`, `questionGroup`, `sortOrder`, invalid input, missing paper, and non-draft composition rejection.

## Accepted Gaps

- No database-backed paper draft repository implementation in this baseline.
- No authenticated admin resolver is wired yet.
- No `audit_log` write is emitted yet; the approved contract allows explicitly queueing this until the audit module lands.
- Publish validation and immutable snapshot locking remain the next queued task.
