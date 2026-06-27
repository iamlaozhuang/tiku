# Acceptance: content-admin review batch retry diff history UI local validation

Task ID: `content-admin-review-batch-retry-diff-history-ui-local-validation-approval-2026-06-27`

## Acceptance Criteria

- Content-admin review traceability UI renders local validation states for batch selection, failed retry, result diff, and adoption history.
- All related mutation/publish/runtime affordances remain disabled or marked not executed.
- No public ID list, raw prompt/output/provider payload, Provider, DB, mutation, publish, student-visible runtime, browser/e2e, dev server, staging/prod/deploy/payment, or external service is introduced.
- Focused component/unit tests cover the local validation surface and fetch boundary.
- Scoped formatting, lint, typecheck, focused tests, `git diff --check`, and Module Run v2 gates pass before closeout.

## Result

Accepted for local UI validation after focused unit/component coverage, scoped formatting checks, `git diff --check`, lint, typecheck, final closeout-state Module Run v2 pre-commit hardening, project status diagnostic, and pre-push readiness passed.
