# Acceptance: content-admin review result diff read-model source TDD

Task ID: `content-admin-review-result-diff-read-model-source-tdd-approval-2026-06-27`

## Acceptance Criteria

- A local source contract returns a redacted generated-result vs adopted formal-draft diff read-model.
- The read-model exposes only public references, masked previews, digests, field-level changed/unchanged/missing statuses, evidence metadata, and redaction state.
- Raw prompt, raw generated output, Provider payload, internal numeric IDs, DB, Provider, mutation, publish, browser/e2e, dev server, staging/prod/deploy/payment, and external service paths remain blocked.
- Focused unit tests cover changed/unchanged/missing states and redaction boundaries.
- Scoped formatting, lint, typecheck, focused unit tests, `git diff --check`, and Module Run v2 gates pass before closeout.

## Result

Accepted for local source-contract closeout. Focused unit tests, scoped Prettier, `git diff --check`, lint, typecheck, and Module Run v2 gates passed; no raw prompt/output/provider payload exposure, internal numeric ID exposure, Provider, DB, mutation, publish, browser/e2e, dev server, staging/prod/deploy/payment, or external service action was executed.
