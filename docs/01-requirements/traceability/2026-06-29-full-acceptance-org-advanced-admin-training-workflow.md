# Full Acceptance Org Advanced Admin Training Workflow Traceability

- Task id: `full-acceptance-org-advanced-admin-training-workflow-2026-06-29`
- Branch: `codex/org-advanced-training-workflow-20260629`
- Status: pass for scoped row
- Date: `2026-06-29`

## Objective

Verify the owner-facing `org_advanced_admin.organization_training` workflow on localhost with redacted evidence. This
task covers organization training discoverability, organization context, training list/status/counts, create-or-draft
affordance, and app-normal local UI/API mutation only if the visible app provides a safe test-owned path.

This task does not execute Provider, direct DB, schema/migration/seed, dependency, source/test repair, staging/prod,
PR, force-push, release readiness, final Pass, or Cost Calibration actions.

## Mandatory Checklist Mapping

Source checklist:
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.

Mapped row:

- `org_advanced_admin.organization_training`

Required evidence categories:

- Organization workspace entry makes `企业训练` discoverable.
- Training page shows organization context and advanced authorization context without raw internal ids.
- Training list/status surface exposes assignment target, objective or title, `profession`, `level`, `subject`, counts
  or clear empty state.
- Draft/create/manage affordance is visible when allowed, or a clear unavailable/blocked state is recorded.
- If app-normal draft/create/update/delete cleanup is executed, evidence records only workflow/status/count summaries.
- No formal `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write is claimed by this workflow.

## Current Preconditions

- Current full unit baseline: pass, 318 files and 1437 tests.
- Current all-role session coverage: 8 of 8 roles have prior redacted session coverage.
- This task still needs its own `org_advanced_admin` session proof because workflow evidence must be current.

## Boundaries

Allowed:

- Localhost or `127.0.0.1` browser verification only.
- Test-owned `org_advanced_admin` login input or approved safe local session switching.
- App-normal local UI/API mutations for organization training workflow only if visible and safely cleanable.
- Redacted role/route/workflow/status/count evidence only.

Blocked:

- Direct DB access or mutation.
- Schema, migration, seed, destructive DB operations.
- Source/test/dependency/package/lockfile changes.
- AI Provider execution, Provider configuration, prompt/payload/raw AI IO.
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, raw DOM, screenshots,
  traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, and complete content evidence.
- Staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration.

## Completion Rule

This task may close only the scoped organization training workflow row as pass/blocked/fail. It cannot claim durable goal
completion.

## Coverage Result

- `org_advanced_admin.organization_training`: pass for current localhost route/control acceptance evidence.
- Evidence summary: role proof `org_advanced_admin`, route `/organization/organization-training`, organization/training
  context visible, profession/level/subject controls visible, create/draft affordance visible, visible failure counts
  zero, no mutation executed.
