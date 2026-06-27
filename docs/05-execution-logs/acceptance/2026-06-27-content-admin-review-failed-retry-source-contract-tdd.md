# Acceptance: content-admin review failed retry source contract TDD

Task ID: `content-admin-review-failed-retry-source-contract-tdd-approval-2026-06-27`

## Acceptance Criteria

- A local source contract returns redacted failed retry request/state data for failed admin AI generation tasks.
- Retryable failed tasks expose a request-available state with retry counters and public task references.
- Non-failed, non-retryable, and retry-limit-reached tasks expose safe blocked states.
- The contract records Provider call, Provider credential read, Provider payload, retry mutation, and retry execution as not executed/not required.
- Focused unit tests cover available and blocked retry states plus redaction boundaries.
- Scoped formatting, lint, typecheck, focused unit tests, `git diff --check`, and Module Run v2 gates pass before closeout.

## Result

Accepted for local source-contract closeout. Focused unit tests, scoped Prettier, `git diff --check`, lint, typecheck, and Module Run v2 gates passed; no Provider, credential, retry mutation, DB, browser/e2e, dev server, publish, staging/prod/deploy/payment, or external service action was executed.
