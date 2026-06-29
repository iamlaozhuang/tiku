# Full Acceptance Org Standard Employee Boundary Workflow Traceability

- Task id: `full-acceptance-org-standard-employee-boundary-workflow-2026-06-29`
- Branch: `codex/org-standard-employee-boundary-20260629`
- Status: pass for scoped rows
- Date: `2026-06-29`

## Objective

Verify the owner-facing `org_standard_employee` learner surface and advanced-capability denial boundaries on localhost
with redacted evidence. This task covers learner-facing entry, organization context, authorized standard learning
surface, and denial/unavailable behavior for learner AI generation and enterprise training routes.

This task does not execute Provider, direct DB, schema/migration/seed, dependency, source/test repair, staging/prod,
PR, force-push, release readiness, final Pass, or Cost Calibration actions.

## Mandatory Checklist Mapping

Source checklist:
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.

Mapped rows:

- `org_standard_employee.shared_employee_checks`
- `org_standard_employee.standard_learning`
- `org_standard_employee.advanced_capability_denial`

Required evidence categories:

- Employee starts in a learner-facing surface, not an admin workspace.
- Organization context is visible when the employee uses `org_auth`.
- Standard organization-authorized learning surface is reachable or a clear no-data/no-authorization state is recorded.
- Learner `AI训练`, `AI出题`, `AI组卷`, and `企业训练` are not usable for standard employee.
- Direct access to advanced-only routes returns permission denied, standard-unavailable, redirect, or another safe
  blocked state.
- Evidence records only role, route, workflow, status, count, and failure-class summaries.

## Boundaries

Allowed:

- Localhost or `127.0.0.1` browser verification only.
- Test-owned `org_standard_employee` login input.
- Read-only navigation and denial/unavailable checks.
- Redacted role/route/workflow/status/count evidence only.

Blocked:

- App data mutation.
- Direct DB access or mutation.
- Schema, migration, seed, destructive DB operations.
- Source/test/dependency/package/lockfile changes.
- AI Provider execution, Provider configuration, prompt/payload/raw AI IO.
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, raw DOM, screenshots,
  traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, and complete content evidence.
- Staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration.

## Completion Rule

This task may close only the scoped `org_standard_employee` rows as pass/blocked/fail. It cannot claim durable goal
completion.

## Coverage Result

- `org_standard_employee.shared_employee_checks`: pass for learner-facing route/status evidence.
- `org_standard_employee.standard_learning`: pass for standard learning surface evidence.
- `org_standard_employee.advanced_capability_denial`: pass for current direct-route denial/unavailable evidence.
- Evidence summary: login succeeded for the test-owned standard employee fixture, final learner route `/home` exposed
  standard learning context, AI and enterprise training entry counts were zero, direct learner AI route checks were
  unavailable, direct organization advanced route checks were safely blocked at login, visible generic errors were zero,
  and no mutation was executed.
