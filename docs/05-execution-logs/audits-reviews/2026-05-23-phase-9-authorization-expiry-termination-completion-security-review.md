# Security Review: phase-9-authorization-expiry-termination-completion

## Metadata

- Task id: `phase-9-authorization-expiry-termination-completion`
- Branch: `codex/phase-9-authorization-expiry-termination-completion`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-23`
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/services/mock-exam-service.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/student-paper-service.ts`
- `src/server/services/mock-exam-service.test.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/student-paper-service.test.ts`

## Risk Types Reviewed

- `authorization`
- `session`
- `practice`
- `mock_exam`
- `audit_log`

## Abuse Cases Considered

- A student keeps using a practice after personal authorization expiry.
- A student keeps using a mock exam after personal authorization expiry.
- A student with cancelled or absent authorization submits answers or submits a mock exam for scoring.
- A student with enterprise authorization is denied because only personal authorization is considered.
- A disabled organization continues to grant enterprise authorization scope.
- Duplicate personal and enterprise authorization for the same profession/level creates an ambiguous selection blocker.
- A completed mock exam or historical record is mutated when authorization has already disappeared.
- API responses leak numeric database `id`, session tokens, password material, secrets, raw prompts, raw answers, or provider payloads.

## Data Exposure Review

- Changed DTOs still expose public identifiers only; no numeric auto-increment `id` is returned by the changed code paths.
- `student-paper-service` merges authorization scopes into `authorizationTypes`, `profession`, `level`, and `expiresAt`; it does not expose internal `personal_auth.id`, `org_auth.id`, `user.id`, or organization internal ids.
- Practice and mock exam termination responses return `data: null` for authorization-invalid operations, avoiding disclosure of paper snapshot or answer data after access is invalid.
- Existing successful practice/mock exam DTOs are unchanged and remain public-id based.
- No session token, password hash, secret, API key, raw prompt, raw answer, raw provider response, or raw provider error was added to API responses, tests, evidence, or logs.

## Authorization Boundary Review

- Practice and mock exam services now require a matching `profession`/`level` scope whose `expires_at` is strictly later than the service clock.
- Missing, expired, cancelled, not-yet-started, or disabled-organization authorization sources do not satisfy the effective scope because repository filters require:
  - active user;
  - active auth status;
  - start time at or before now;
  - expiry after now;
  - active organization for `org_auth`.
- When an in-progress practice or mock exam loses effective authorization, the service terminates it with `terminationReason: authorization_invalid` before returning the access-denied response.
- Completed or otherwise non-in-progress mock exams are not terminated by the lost-authorization path.
- Route handlers remain thin adapters that require authenticated student sessions through existing resolvers before service methods run.
- Admin org-auth cancellation and organization disable mutations remain unavailable in this slice; this task does not weaken admin permission checks or activate unaudited mutation routes.

## API Contract Review

- REST routes remain under `/api/v1/` and use existing kebab-case paths.
- Route parameters remain `publicId`; no database `id` is exposed in URLs.
- JSON keys remain camelCase.
- Response envelopes remain `{ code, message, data, pagination? }`.
- Optional empty data remains `null`; lists remain `[]`.
- No schema or migration changes were made.

## Test Coverage And Accepted Gaps

- Unit tests added for:
  - practice authorization expiry at `expires_at == now` terminating active progress;
  - practice lost-authorization read terminating active progress;
  - mock exam authorization expiry at `expires_at == now` terminating active session;
  - mock exam lost-authorization read terminating active session;
  - personal and org authorization for the same student paper scope merging into one selectable union.
- Full unit, quality gate, build, e2e, naming, and Git inventory commands passed or are recorded in evidence with the final Git inventory pending after this review artifact.
- Accepted gap: admin mutation routes for organization disable and org auth cancellation remain unavailable, so this task cannot test end-to-end admin-triggered termination from those actions.
- Accepted gap: no background expiry job updates `auth.status` to `expired`; runtime effective authorization uses status plus date bounds.
- Accepted gap: browser offline autosave for mock exam answer recovery is outside this task and remains covered by later student runtime/UI completion work.

## Verdict

`APPROVE`. The implementation tightens effective authorization checks, terminates in-progress practice and mock exam sessions when authorization disappears, preserves public-id-only API contracts, and does not introduce dependency, schema, secret, or external-provider risk. Accepted gaps are scoped to later queued admin and student runtime tasks.
