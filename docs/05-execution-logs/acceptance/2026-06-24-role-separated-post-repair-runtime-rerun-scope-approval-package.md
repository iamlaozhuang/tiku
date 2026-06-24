# Role-Separated Post-Repair Runtime Rerun Scope Approval Package

## Status

- Package id: `ROLE_SEPARATED_POST_REPAIR_RUNTIME_RERUN_SCOPE_2026_06_24`.
- Prepared by task: `role-separated-post-repair-runtime-rerun-scope-approval-2026-06-24`.
- Package status: prepared, not approved for runtime execution by this task.
- Scope: future local-only runtime observation after the 2026-06-24 role-separated repair package.
- Runtime executed by this task: none.
- Final Pass claim: none.

## SSOT Read List

- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R1-R15 in the 2026-06-24 role-separated MVP alignment.
- Role Mapping Result: all 8 mandatory role rows are in the proposed future rerun scope.
- Acceptance Mapping Result: this package approves only a future approval decision surface. Runtime execution remains
  blocked until laozhuang explicitly approves this package id in a later turn or task.

## Future Runtime Scope

Allowed local targets after future approval:

- `http://127.0.0.1:3000`.
- `http://localhost:3000`.

Allowed observation method after future approval:

- Owner manually enters credentials in the local browser.
- Codex may observe only visible role, route, navigation, allowed/denied status, and redacted blocker summaries.
- Codex must not read credential files, type passwords, inspect browser storage, record screenshots, dump page HTML, or
  capture tokens/cookies.

Local dev server rule:

- Prefer reusing an already-running local target.
- If no local target is listening, the future runtime task must stop unless its approval explicitly allows starting the
  existing local dev command for `127.0.0.1:3000`.
- This package does not approve dev-server start.

## Mandatory Role Rows

| role                        | required allowed observation                                                                  | required denied or unavailable observation                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Standard learner home and authorized standard learning surfaces.                              | No advanced `AI训练`; direct advanced AI routes denied or standard-unavailable; backend routes denied.                 |
| `personal_advanced_student` | Discoverable learner `AI训练` with `AI出题` and `AI组卷` actions where local gates permit.    | No direct write to formal `question` or `paper`; backend routes denied.                                                |
| `org_standard_employee`     | Standard organization-authorized learner home.                                                | No `AI训练`; no `企业训练`; direct advanced or enterprise-training routes denied or standard-unavailable.              |
| `org_advanced_employee`     | Discoverable learner `AI训练` and assigned `企业训练` under valid organization context.       | No access outside scoped `organization`; no admin/global operations surfaces.                                          |
| `org_standard_admin`        | Organization workspace for employee management and organization authorization/status viewing. | No enterprise training management; no organization AI generation; no system operations or content workspace.           |
| `org_advanced_admin`        | Organization workspace with employee/auth status, enterprise training, and organization AI.   | No global system operations or content authoring outside scoped `organization`.                                        |
| `content_admin`             | Content workspace with content management plus `AI出题` and `AI组卷` draft/review entries.    | No global operations `redeem_code`, global `org_auth`, Provider, cost, or organization admin surfaces.                 |
| `ops_admin`                 | System operations workspace with users, organizations, `redeem_code`, `org_auth`, and logs.   | Content authoring routes denied; no content draft creation or content AI draft/review workspace unless later approved. |

## Allowed Evidence Fields

- `roleRow`.
- `localTarget`.
- `routeOrWorkflowLabel`.
- `expectedAllowedBehavior`.
- `observedAllowedStatus`.
- `expectedDeniedBehavior`.
- `observedDeniedStatus`.
- `visibleDeniedOrUnavailableClass`.
- `passFailBlocked`.
- `redactedBlockerNotes`.

## Evidence Redaction Rules

Future runtime evidence must not include:

- password values;
- credential file contents or paths outside approved labels;
- tokens, cookies, `localStorage`, `sessionStorage`, or Authorization headers;
- `.env*` contents or secret names with values;
- database URLs, raw database rows, internal auto-increment ids, or private account identifiers;
- prompt text, Provider payloads, raw AI outputs, generated content bodies, raw answers, full `paper` or `question`
  contents;
- plaintext `redeem_code`;
- screenshots, traces, HTML reports, or page text dumps unless a later task gives explicit redacted screenshot approval.

## Explicitly Blocked By This Package

- Runtime execution during this package task.
- Credential entry by Codex.
- Account creation, password reset, seed rerun, or fixture mutation.
- Source/test/e2e/script edits.
- Schema, migration, database read/write, or destructive database operation.
- Dependency/package/lockfile changes.
- `.env*`, Provider, Cost Calibration, staging/prod/cloud/deploy, payment, or external-service work.
- PR creation/update, force push, or final MVP Pass.

## Successor Task Proposal

- Proposed successor task id: `role-separated-post-repair-runtime-rerun-2026-06-24`.
- Proposed initial status: `blocked`.
- Required fresh approval: `ROLE_SEPARATED_POST_REPAIR_RUNTIME_RERUN_SCOPE_2026_06_24`.
- Successor task may execute only after laozhuang explicitly approves this package id and confirms credential-entry
  handling for that run.
