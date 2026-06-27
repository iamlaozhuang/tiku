# Acceptance: organization analytics admin UI implementation local validation

Task ID: `organization-analytics-admin-ui-implementation-local-validation-approval-2026-06-27`

## Acceptance Criteria

- Organization analytics route DTOs expose a redacted statistics boundary policy while continuing to omit scoped child organization identifier arrays.
- The organization analytics admin UI renders the policy boundary from local route data.
- The UI shows allowed summary statistics, blocked raw detail policies, and disabled export/fresh-approval status.
- The UI does not expose raw employee answers, raw AI generated content, prompt/provider payloads, hidden child organizations, internal ids, session tokens, browser runtime state, or student-visible content.
- Focused unit/component tests pass without browser/e2e/dev server execution.
- Scoped formatting, lint, typecheck, `git diff --check`, and Module Run v2 gates pass before closeout.

## Result

Accepted for local route-contract/source/component-test scope.

The organization analytics dashboard and employee-statistics route DTOs now expose redacted statistics boundary policy metadata while continuing to omit scoped child organization id arrays. The organization analytics admin UI renders the policy boundary from route data and keeps export blocked behind fresh approval. Acceptance excludes browser/e2e/dev-server runtime validation, DB mutation, Provider execution, formal publish, student-visible runtime, and release readiness.
