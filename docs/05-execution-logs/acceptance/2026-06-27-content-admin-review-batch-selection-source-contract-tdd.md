# Acceptance: content-admin review batch selection source contract TDD

Task ID: `content-admin-review-batch-selection-source-contract-tdd-approval-2026-06-27`

## Acceptance Criteria

- A local source contract returns redacted batch candidate selection preview data for content-admin generated results.
- Eligible candidates are content workspace, platform-owned, draft result candidates whose formal adoption remains blocked.
- Ineligible candidates include a safe validation state and blocked reason without exposing raw generated content or Provider payloads.
- The contract records selection/preview state only and marks batch adoption mutation as `not_executed`.
- Focused unit tests cover eligible and blocked candidates plus redaction boundaries.
- Scoped formatting, lint, typecheck, focused unit tests, `git diff --check`, and Module Run v2 gates pass before closeout.

## Result

Accepted for local source contract TDD closeout. The focused unit tests cover eligible and blocked candidates, invalid selected candidates, preview-only mutation state, and redaction boundaries.
