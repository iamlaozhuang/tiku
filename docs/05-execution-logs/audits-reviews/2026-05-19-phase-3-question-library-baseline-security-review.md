# Phase 3 Question Library Baseline Security Review

## Review Metadata

- Task id: `phase-3-question-library-baseline`
- Branch: `codex/phase-3-question-library-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-19`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/questions/**`
- `src/server/contracts/question-contract.ts`
- `src/server/mappers/question-mapper.ts`
- `src/server/repositories/question-repository.ts`
- `src/server/services/question-route.ts`
- `src/server/services/question-route.test.ts`
- `src/server/services/question-service.ts`
- `src/server/services/question-service.test.ts`
- `src/server/validators/question.ts`

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `data_contract`
- `admin`

## Abuse Cases Considered

- Calling question routes without authenticated admin context.
- Guessing or changing `publicId` values to read, edit, disable, or copy question content.
- Editing a locked source question after published paper references exist.
- Sending malformed JSON, oversized rich text, invalid score granularity, or invalid enum values.
- Attempting to expose internal numeric `id`, `question_id`, or `material_id` through DTO mapping.
- Using material association as an authorization boundary instead of a read/mapping boundary.

## Authorization Boundary Review

- Runtime Next.js route files are wired to `createUnavailableQuestionService()` and return a standard `503202` response until authenticated admin runtime wiring is implemented.
- No repository-backed reads or writes are exposed from committed route files without admin context.
- Service boundaries document question list/create/detail/update/disable/copy operations for later admin integration.
- Follow-up admin runtime integration must inject authenticated admin context and content-role permission checks before enabling real mutations.

## Data Exposure Review

- `QuestionAccessRow.id`, `material_id`, `question_option.id`, `question_option.question_id`, `scoring_point.id`, and `scoring_point.question_id` remain repository-internal.
- API DTOs expose `publicId`, `materialPublicId`, `questionOptions`, `scoringPoints`, `analysisRichText`, and `standardAnswerRichText` using camelCase only.
- `knowledgeNodePublicIds` and `tagPublicIds` return empty arrays because their schema relationships were explicitly deferred by the schema baseline.
- No session, password, token, admin phone, storage key, or internal numeric id is returned.
- Empty optional values use `null`, and empty relationship lists use `[]`.

## API Contract Review

- Route paths use `/api/v1/questions` and `[publicId]` route params.
- Route folders use kebab-case plural nouns and verb action subpaths `disable` and `copy`.
- API response shape remains `{ code, message, data, pagination? }`.
- JSON fields are camelCase.
- Question list uses pagination metadata.
- Error responses use standard envelopes with `data: null`.

## Test Coverage

- RED verified: targeted question tests failed before implementation because `question-service` and `question-route` were missing.
- GREEN verified: targeted question service/route tests pass after implementation.
- Full unit suite is covered in task evidence.
- Material association mapping is tested to expose `materialPublicId` without leaking `id` or `material_id`.

## Accepted Gaps

- No database-backed question repository implementation in this baseline.
- No authenticated admin resolver is wired yet.
- No `audit_log` write is emitted yet; the approved contract allows explicitly queueing this until the audit module lands.
- Knowledge node and tag relationship DTOs are present as empty arrays until validated relationship schema exists.
