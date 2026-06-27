# Acceptance: content-admin review adoption history read-model source TDD

Task ID: `content-admin-review-adoption-history-read-model-source-tdd-approval-2026-06-27`

## Acceptance Criteria

- A local source contract returns a read-only adoption history traceability read-model.
- The read-model exposes chronological public-reference events, masked metadata summaries, digests, event counts, first/latest event timestamps, and redaction state.
- History mutation, formal publish, raw prompt/output/provider payload exposure, internal numeric IDs, DB, Provider, browser/e2e, dev server, staging/prod/deploy/payment, and external service paths remain blocked.
- Focused unit tests cover traceable and empty history states plus redaction boundaries.
- Scoped formatting, lint, typecheck, focused unit tests, `git diff --check`, and Module Run v2 gates pass before closeout.

## Result

Accepted for local source-contract closeout. Focused unit tests, scoped Prettier, `git diff --check`, lint, typecheck, and Module Run v2 gates passed; no history mutation, formal publish, raw prompt/output/provider payload exposure, internal numeric ID exposure, Provider, DB, browser/e2e, dev server, staging/prod/deploy/payment, or external service action was executed.
