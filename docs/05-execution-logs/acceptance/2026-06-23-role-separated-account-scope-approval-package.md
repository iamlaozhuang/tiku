# Role Separated Account Scope Approval Package

packageId: ROLE_SEPARATED_ACCOUNT_SCOPE_2026_06_23
status: prepared_not_approved_for_execution
preparedAt: "2026-06-23T03:58:00-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## What This Approval Would Allow

If laozhuang approves `ROLE_SEPARATED_ACCOUNT_SCOPE_2026_06_23`, the next task may perform a redacted inventory of
existing local seeded accounts and test-only fixture account labels for the role-separated coverage matrix.

That inventory may record:

- role label;
- account label or fixture label;
- whether the role appears covered, missing, duplicated, or unclear;
- route/workflow labels that should be checked later;
- gap summary and recommendation.

That inventory must not record passwords, cookies, tokens, Authorization headers, raw localStorage, `.env*` values,
database URLs, raw database rows, Provider payloads, raw prompts, raw AI outputs, full `paper`, full `material`, raw
answer content, or staging/prod data.

## What This Approval Would Not Allow

This approval would not allow:

- creating accounts;
- disabling accounts;
- changing passwords;
- editing fixture files;
- running a seed script;
- connecting to or mutating a database;
- starting a dev server;
- using browser or Playwright runtime;
- calling Provider/model services;
- changing Provider configuration;
- running Cost Calibration;
- deploying staging/prod/cloud resources;
- touching payment or external services;
- creating or updating a PR;
- force push;
- claiming final Standard or Advanced MVP `Pass`.

## Mandatory Role Rows

| Row                         | Plain-language meaning                                             | Why it matters                                                                                           |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | A normal individual learner on standard edition                    | Proves baseline learner access without advanced or admin privileges.                                     |
| `personal_advanced_student` | An individual learner on advanced edition                          | Proves advanced entitlement is separated from standard learner access.                                   |
| `org_standard_employee`     | An organization employee under standard organization authorization | Proves employee access is not confused with personal access or admin access.                             |
| `org_advanced_employee`     | An organization employee under advanced organization authorization | Proves advanced organization entitlement works without giving admin power.                               |
| `org_standard_admin`        | A standard organization administrator                              | Proves the admin can manage only their own organization at standard scope.                               |
| `org_advanced_admin`        | An advanced organization administrator                             | Proves advanced organization admin scope without global system power.                                    |
| `content_admin`             | A content operations user                                          | Proves content work is separated from user/account/system operations.                                    |
| `ops_admin`                 | A system operations user                                           | Proves user, organization, authorization, and audit operations are separated from learner/content flows. |

Boundary rows:

- `unauthenticated_visitor`: proves protected pages reject users who are not logged in.
- `super_admin`: may be used for setup or comparison, but cannot replace separated role evidence.
- `auditor`: only included if the app has a distinct read-only audit/evidence role.

## Later Runtime Checks

After inventory and any gap decision, each mandatory row should later have:

- one successful login/session check;
- one allowed workflow or route check;
- one denied workflow or route check;
- one session switch or logout boundary check when moving to the next role;
- one redaction statement.

## Stop Conditions For Later Execution

The batch must stop or remain `Blocked` if:

- a mandatory role has no safe account or fixture and no owner-accepted MVP exclusion;
- one account is reused to represent several roles without a product reason;
- a student or employee can access admin, content, ops, Provider, cost, staging, or production-like controls;
- an organization role can see or manage another organization's data;
- evidence cannot be redacted safely;
- the check would require secrets, passwords, database values, provider payloads, or staging/prod data.

## Requested Owner Decision

Approve or reject this package:

- Approve: allow the next task to inventory existing local seeded account and fixture labels only.
- Reject or revise: do not inventory yet; update the role matrix or evidence rules first.
