# Full Acceptance Ops Admin Session Material Completion

## Status

- Date: 2026-06-28
- Task id: `full-acceptance-ops-admin-session-material-completion-2026-06-28`
- Scope: Stage A continuation for the previously blocked `ops_admin` current-session row.
- Runtime claim: pending local browser execution.
- Implementation claim: none.

2026-07-02 supersession note: any historical `ops_admin.resource_knowledge_and_logs` wording in this material is not an
active permission grant for resource management. Resource/`knowledge_base` write actions and vector rebuild belong to
the content workspace for `content_admin` / `super_admin`; `ops_admin` retains only explicitly scoped operations and
redacted log-summary responsibilities.

## Mandatory Checklist Gate

This task is governed by:

- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`

Relevant checklist rows:

- `ops_admin.workspace_and_denials`
- `ops_admin.user_organization_employee_operations`
- `ops_admin.enterprise_authorization_and_atomic_scope`
- `ops_admin.employee_import`
- `ops_admin.redeem_code`
- `ops_admin.resource_knowledge_and_logs` (historical row name; resource-write scope superseded)

This task can only close the current-session `ops_admin` coverage gap left by
`full-acceptance-option-a-session-coverage-2026-06-28`. It cannot claim final Pass, release readiness, or full durable
goal completion.

## Approved Input

The owner identified the test-owned local `ops_admin` material location:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`
- Role marker: `8. acceptance.ops.admin`

The private file is read-only input. Credential values, account identifiers, cookies, tokens, sessions, localStorage,
Authorization headers, or raw account file content must not be copied into evidence, committed files, terminal output,
or final summaries.

## Execution Boundary

Allowed:

- localhost or 127.0.0.1 browser execution only.
- test-owned `ops_admin` login/session switching using the approved private material as input only.
- redacted role, route, workflow, status, and count evidence.
- read-only source inspection only if needed to locate safe local operations routes.

Blocked:

- local UI/API mutation or write-flow execution.
- direct DB access, DB write, schema, migration, seed, or `drizzle-kit push`.
- Provider call, Provider configuration, Provider credential read, prompt payload, raw AI input/output, or Cost
  Calibration.
- source/test/package/lockfile changes.
- staging/prod/deploy, PR, force push, release readiness, final Pass.
- screenshots, traces, raw DOM, env contents, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, raw
  account content, or complete `question`/`paper`/`material`/`resource`/`chunk` content in evidence.

## Acceptance Criteria

The task passes if:

- the `ops_admin` test-owned login/session can be used without recording sensitive material;
- at least one operations workspace route/status surface is verified locally for `ops_admin`;
- sampled denied surfaces remain denied or unavailable at status-summary level;
- no Provider, DB, mutation, source/test/package/schema/deploy, final Pass, or sensitive evidence boundary is crossed;
- evidence maps the result back to the mandatory owner-facing role checklist.

If the private material is unusable, the task records a redacted blocked result and preserves the durable goal as
incomplete.
