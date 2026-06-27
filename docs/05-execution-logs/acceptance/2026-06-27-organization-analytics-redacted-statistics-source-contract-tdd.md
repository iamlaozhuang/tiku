# Acceptance: organization analytics redacted statistics source contract TDD

Task ID: `organization-analytics-redacted-statistics-source-contract-tdd-approval-2026-06-27`

## Acceptance Criteria

- Dashboard and employee statistics summaries expose an explicit redacted statistics boundary contract.
- The boundary contract states allowed organization-scope summary statistics and blocked raw-content/export/cross-organization policies.
- Focused unit tests cover the source contract.
- Raw employee answer content, raw learner AI content, prompts, Provider payloads, internal numeric ids, export artifacts, DB execution, Provider execution, browser/e2e execution, and external-service execution remain absent.
- Scoped formatting, lint, typecheck, focused unit tests, `git diff --check`, and Module Run v2 gates pass before closeout.

## Result

Accepted for local source TDD closeout. Dashboard and employee statistics service summaries now carry an explicit redacted statistics boundary contract, with focused tests covering the contract and no DB/Provider/browser/export execution.
