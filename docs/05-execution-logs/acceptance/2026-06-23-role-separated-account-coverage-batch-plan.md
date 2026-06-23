# Role Separated Account Coverage Batch Plan

## Status

- Date: `2026-06-23`
- Batch id: `standard-advanced-mvp-role-separated-account-coverage-batch-2026-06-23`
- Status: `seeded_not_executed`
- Scope: fill the remaining role-separated account coverage blocker for Standard and Advanced MVP acceptance.
- Release claim: none.
- Production claim: none.

## Plain-Language Goal

This batch answers one question: when different kinds of users log in with their own separated accounts, does each person
see and do only what that role should see and do?

It is not enough to log in as one powerful account and click around. We need separate evidence for personal standard,
personal advanced, organization employee, organization admin, content operations, and system operations. We also need to
prove important negative cases: a student cannot enter admin pages, an organization employee cannot manage all users, and
an operations account cannot silently become a content editor unless that is an intentional product rule.

## Why Before Provider, Cost, And Staging

Provider, Cost Calibration, and staging are more expensive and higher-risk gates. They also depend on trustworthy account
and authorization coverage. If role separation is unclear locally, staging evidence will be hard to trust. Therefore this
batch stays local and proves the identity and authorization baseline first.

## Required Coverage Matrix

| Coverage row                | Account must represent                           | Must verify allowed behavior                                                                                                   | Must verify denied behavior                                                                                                                    |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `unauthenticated_visitor`   | No logged-in user                                | Can reach login and public-safe pages.                                                                                         | Protected student, admin, content, and ops routes require login.                                                                               |
| `personal_standard_student` | Individual learner with standard `personal_auth` | Can use standard student flows: `practice`, `mock_exam`, `exam_report`, `mistake_book`, and `profile`.                         | Cannot access organization admin, content admin, ops admin, advanced-only, Provider, or staging controls.                                      |
| `personal_advanced_student` | Individual learner with advanced `personal_auth` | Can use all standard student flows plus advanced entitlement display or advanced feature entry where implemented.              | Cannot access organization admin, content admin, ops admin, Provider, staging, or another user's data.                                         |
| `org_standard_employee`     | Employee under standard `org_auth`               | Can use assigned organization learning, standard practice or mock flows, and own reports.                                      | Cannot manage organization users, global users, content, Provider, staging, or other employees' private reports.                               |
| `org_advanced_employee`     | Employee under advanced `org_auth`               | Can use assigned organization learning with advanced entitlement display or advanced feature entry where implemented.          | Cannot manage organization users, global users, content, Provider, staging, or unrelated organization data.                                    |
| `org_standard_admin`        | Organization admin for standard organization     | Can manage own organization employees, assignments, training visibility, and organization-level reports where implemented.     | Cannot manage other organizations, global users, content, Provider, staging, advanced-only controls, or production-like settings.              |
| `org_advanced_admin`        | Organization admin for advanced organization     | Can manage own organization employees and advanced organization entitlement surfaces where implemented.                        | Cannot manage other organizations, global users, content, Provider, staging, or production-like settings.                                      |
| `content_admin`             | Content operations account                       | Can reach question, material, paper, tag, and `knowledge_node` content surfaces where implemented.                             | Cannot disable users, change organization authorization, operate Provider/staging/cost gates, or view private learner data unnecessarily.      |
| `ops_admin`                 | System operations account                        | Can reach user, organization, `redeem_code`, `authorization`, `audit_log`, and evidence/governance surfaces where implemented. | Cannot edit learning content unless explicitly designed, cannot execute Provider/staging/cost gates, and cannot claim acceptance `Pass` alone. |
| `super_admin`               | Highest-privilege setup account                  | May be used only to prepare or compare governance coverage.                                                                    | Must not replace the mandatory separated-role evidence rows.                                                                                   |
| `auditor`                   | Read-only audit/evidence role, if supported      | Can inspect redacted evidence/audit views where implemented.                                                                   | Cannot mutate users, content, authorization, Provider, staging, or cost settings.                                                              |

## What Counts As Evidence

For each mandatory row, the runtime evidence should record:

- account label, not password;
- role/context label;
- environment label, normally local `dev`;
- login result;
- at least one allowed route or workflow result;
- at least one denied route or workflow result;
- logout or session switch confirmation when moving between roles;
- defect severity if anything fails;
- redaction statement.

Evidence must not record passwords, tokens, cookies, Authorization headers, `.env*` values, database URLs, raw
localStorage, raw provider payloads, raw prompts, raw AI outputs, full answer content, full paper content, or
staging/prod data.

## Acceptance Rules

The role-separated blocker can be considered closed only when all mandatory rows have one of these outcomes:

- `pass`: the role has a separated account or fixture and required allowed/denied checks pass;
- `not_implemented_with_owner_acceptance`: the role or surface is intentionally not in MVP and laozhuang accepts the
  exclusion in evidence;
- `blocked`: the role cannot be proven, has no account, has no safe data, or has a defect that prevents trustworthy
  verification.

The whole batch remains `Blocked` if any mandatory row is `blocked`, if evidence cannot be redacted safely, or if one
account is reused to stand in for multiple roles without a clear product reason.

## Serial Tasks

| Order | Task id                                                             | Purpose                                                               | Initial status | Execution boundary                                                                  |
| ----- | ------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| 0     | `acceptance-role-separated-account-coverage-batch-seed-2026-06-23`  | Register this batch and its coverage matrix.                          | closed         | Docs/state only.                                                                    |
| 1     | `acceptance-role-separated-account-scope-approval-2026-06-23`       | Prepare the exact account, fixture, route, redaction, and stop rules. | pending        | Docs-only; no account or runtime action.                                            |
| 2     | `acceptance-role-separated-account-inventory-2026-06-23`            | Inventory existing safe local/fixture accounts and identify gaps.     | pending        | Read-only inventory unless separately approved; no password evidence.               |
| 3     | `acceptance-role-separated-account-fixture-gap-decision-2026-06-23` | Decide whether missing roles need test-only fixture or seed changes.  | pending        | Decision package only; no fixture, seed, or DB mutation.                            |
| 4     | `acceptance-role-separated-account-runtime-walkthrough-2026-06-23`  | Run approved local walkthrough for mandatory rows.                    | blocked        | Requires fresh approval after scope and inventory.                                  |
| 5     | `acceptance-role-separated-account-coverage-review-2026-06-23`      | Decide whether this blocker is closed, failed, or still blocked.      | blocked        | Uses only prior evidence; no Provider, Cost Calibration, staging, or release claim. |

## Stop Conditions

Stop and mark the relevant task `Blocked` if:

- a role needs a real password, secret, cookie, database URL, raw localStorage value, or `.env*` content in evidence;
- a missing role requires fixture, seed, or database mutation without fresh approval;
- a route exposes another role's private data;
- a student or employee can access admin, ops, Provider, cost, staging, or production-like controls;
- a role cannot log in or cannot be separated from another role;
- evidence cannot distinguish personal standard, personal advanced, organization standard, and organization advanced
  contexts.

## Final Decision Rule

This batch does not decide final Standard or Advanced MVP acceptance by itself. It only decides whether the
role-separated account blocker is closed. Final MVP `Pass` still requires the separate final review to combine this
evidence with all other acceptance gates.
