# Security Review: phase-8-student-mistake-book-runtime

## Metadata

- Task id: `phase-8-student-mistake-book-runtime`
- Branch: `codex/phase-8-student-mistake-book-runtime`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-22`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/mistake-books/route.ts`
- `src/app/api/v1/mistake-books/[publicId]/route.ts`
- `src/app/api/v1/mistake-books/[publicId]/favorite/route.ts`
- `src/app/api/v1/mistake-books/[publicId]/unfavorite/route.ts`
- `src/app/api/v1/mistake-books/[publicId]/mark-mastered/route.ts`
- `src/app/api/v1/mistake-books/[publicId]/remove/route.ts`
- `src/app/api/v1/mistake-books/[publicId]/ai-explanation/route.ts`
- `src/server/services/student-mistake-book-runtime.ts`
- `src/server/services/mistake-book-service.ts`
- `src/server/services/mistake-book-route.ts`
- `src/server/repositories/mistake-book-repository.ts`
- `src/server/mappers/mistake-book-mapper.ts`
- `tests/unit/phase-8-student-mistake-book-runtime.test.ts`

## Risk Types

- `mistake_book`
- `authorization`
- `api_contract`
- `student`
- `auth`
- `session`

## Abuse Cases Considered

- Missing or invalid session attempts to list another student's `mistake_book`.
- Admin session attempts to use student `mistake_book` API.
- Student changes `{publicId}` to another user's `mistake_book`.
- Student accesses an item outside current effective `authorization` scope.
- Client tries to trigger real AI provider through `ai_explanation`.
- Response accidentally leaks numeric database `id`, session token, password hash, secret, API key, raw prompt, raw answer, `code_hash`, or provider payload.

## Review Checklist

- Authentication required before user-specific data is returned: pass.
- Admin session rejected for student APIs: pass.
- Ownership checks combine `userPublicId` and `publicId`: pass.
- Current effective `authorization` scope is enforced: pass.
- URLs and DTOs expose public identifiers only: pass.
- Response shape stays `{ code, message, data, pagination? }`: pass.
- JSON keys are camelCase: pass.
- Empty lists return `[]` and optional empty values return `null`: pass.
- AI explanation does not call a real provider: pass.
- Secrets, tokens, password hashes, and session internals are not logged or
  returned: pass.

## Test Coverage

- `tests/unit/phase-8-student-mistake-book-runtime.test.ts` covers
  authenticated student access, missing session rejection, admin session
  rejection, unauthorized `publicId` not-found behavior, state action ownership,
  and `ai_explanation` unavailable behavior.
- Existing service/route/mapper/validator tests continue to cover pagination,
  DTO mapping, route parameter forwarding, unavailable auth, state transitions,
  and query normalization.
- Full `npm.cmd run test:unit`: pass, `92` files and `311` tests.

## Accepted Gaps

- `questionType` filtering remains a post-query filter in this minimal slice;
  SQL-level JSON filtering can be tightened in a future task if product paging
  semantics require it.
- `ai_explanation` remains unavailable until mock AI logging/redaction
  prerequisites are explicitly scoped.
