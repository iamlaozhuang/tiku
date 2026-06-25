# Organization Training Advanced Employee Visible-List 500 Runtime Diagnostic Repair Audit Review

Task id: `organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair-2026-06-25`

## Review Scope

Audit diagnostic-first handling of the `org_advanced_employee` visible-list HTTP 500:

- Governance and approval compliance.
- Redaction compliance.
- Read-only local diagnostic before source change.
- Minimal source repair only if root cause is proven as source.
- Focused validation only.
- No final MVP Pass claim.

## Findings

1. Resolved: `org_advanced_employee` visible-list 500 was caused by source SQL binding, not by missing assignment data.
   The repository passed an array of organization public ids to PostgreSQL JSONB `?|` as a single bound value. PostgreSQL
   treated the value as a malformed array literal and raised `22P02`, which the route envelope surfaced as
   `500` / `500001`.

## Scope Audit

- Diagnostic-first order was followed: DB/runtime state was inspected before source change.
- Source repair was limited to `src/server/repositories/organization-training-repository.ts` and its focused test.
- DB writes, seed writes, schema/migration, account/user/employee/authorization mutation, dependency/package/lockfile,
  Provider, Cost, staging/prod, payment, external services, PR, force-push, and final Pass work were not executed.
- Browser rerun did not click draft-save, submit, or readonly-summary actions, so no organization-training answer row was
  written by this task.

## Redaction Audit

- Evidence records role labels, route paths, counts, HTTP status/code pairs, and redacted status only.
- No raw credentials, phone numbers, passwords, tokens, cookies, local/session storage, Authorization headers, raw DB
  rows, raw public ids, raw DOM, screenshots, traces, Provider payloads, prompts, generated content, or private answer
  content were recorded.

## Acceptance Boundary

This task can only repair and verify the focused `org_advanced_employee` organization-training visible-list blocker. It does not execute the full eight-row rerun and cannot prove full role-separated runtime acceptance.

Do not claim Standard/Advanced MVP final Pass.

## Review Decision

Approved for focused repair closeout. This closes the `org_advanced_employee` visible-list 500 blocker only. Full
role-separated acceptance remains blocked until a separately governed full eight-row browser rerun passes.
