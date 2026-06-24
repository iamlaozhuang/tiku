# Role Separated Local Account Runtime Rerun Scope Approval Package

packageId: ROLE_SEPARATED_LOCAL_ACCOUNT_RUNTIME_RERUN_SCOPE_2026_06_23
taskId: acceptance-role-separated-account-local-account-runtime-rerun-scope-approval-2026-06-23
packageStatus: prepared_not_approved_for_runtime_execution
preparedAt: "2026-06-23T09:35:00-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Plain-Language Summary

The local role-separated accounts have been created. The next useful acceptance step is to use those accounts in the
local browser and check whether each role can do what it should do, and cannot do what it should not do.

This package does not run that walkthrough. It asks laozhuang to approve the exact runtime scope for a later task.

## Credential Rule

The account credentials are in this local private file:

`D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

For the later runtime walkthrough:

- laozhuang opens this file locally;
- laozhuang enters the account and password into the browser;
- Codex must not read the private file;
- Codex must not ask laozhuang to paste passwords into chat;
- Codex must not type, store, screenshot, log, or commit any password value.

## What Approval Of This Package Allows

If laozhuang approves `ROLE_SEPARATED_LOCAL_ACCOUNT_RUNTIME_RERUN_SCOPE_2026_06_23`, the next task may run a local-only
runtime walkthrough with these limits:

- use only the local app at `http://127.0.0.1:3000` or `http://localhost:3000`;
- use only the already prepared local accounts;
- let laozhuang enter credentials manually;
- record redacted evidence for route access, visible role behavior, allowed actions, denied actions, and blockers;
- mark each row as `pass`, `fail`, or `blocked`;
- keep Provider, Cost Calibration, staging/prod, payment, deployment, and final acceptance Pass blocked.

## What Approval Still Does Not Allow

Approval of this package still does not allow:

- password values in chat, committed evidence, screenshots, logs, `.env*`, browser storage evidence, or terminal
  transcripts;
- Codex reading the private credential file;
- Codex entering credentials;
- changing source code, tests, fixtures, schema, migrations, dependencies, or env files;
- creating or modifying accounts beyond the already prepared local accounts;
- connecting to staging or production;
- calling Provider/model services;
- running Cost Calibration;
- touching payment or external services;
- claiming Standard MVP or Advanced MVP final Pass.

## Runtime Rows To Check

| Row                         | Plain-language purpose                                        | Must be able to do                                                     | Must be blocked from doing                                               |
| --------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `personal_standard_student` | A normal personal standard learner.                           | Log in, see learner home, see personal standard authorization context. | Admin pages, content operations, system operations, advanced-only proof. |
| `personal_advanced_student` | A personal learner with advanced entitlement.                 | Log in, see learner home, see advanced personal authorization context. | Admin pages, content operations, system operations.                      |
| `org_standard_employee`     | An employee under a standard enterprise authorization.        | Log in as employee and access employee-facing organization flow.       | Admin pages, content operations, system operations, advanced-only proof. |
| `org_advanced_employee`     | An employee under an advanced enterprise authorization.       | Log in as employee and access employee-facing organization flow.       | Admin pages, content operations, system operations.                      |
| `org_standard_admin`        | A standard enterprise boundary admin account.                 | Log in and show organization-bound admin context if surfaced.          | Content-only authoring, unrelated system-wide actions, advanced proof.   |
| `org_advanced_admin`        | An advanced enterprise boundary admin account.                | Log in and show organization-bound advanced context if surfaced.       | Content-only authoring and unrelated system-wide actions.                |
| `content_admin`             | A content operations account separated from system ops.       | Access content/knowledge/paper authoring areas that content ops owns.  | System ops pages such as user/org/auth management if denied by product.  |
| `ops_admin`                 | A system operations account separated from content authoring. | Access user, organization, authorization, audit, or ops areas.         | Content authoring actions if denied by product.                          |

## Evidence Fields Allowed

The later runtime evidence may record only:

- role row name;
- local account label;
- local route or workflow label;
- observed allowed behavior status;
- observed denied behavior status;
- visible error or access-denied class, if any;
- `pass`, `fail`, or `blocked`;
- redacted notes about missing product support.

It must not record:

- passwords;
- phone login values;
- session tokens;
- browser localStorage/sessionStorage values;
- Authorization headers;
- database URLs;
- raw database rows;
- full paper content;
- raw AI prompts or generated AI output.

## Known Limitation To Carry Into Runtime Review

The current schema has no independent `org_admin` enum. The two enterprise admin rows are organization-bound admin
accounts using the existing `ops_admin` role plus organization linkage.

That means the later runtime walkthrough can check whether these accounts behave as useful organization-bound admin
accounts, but it cannot by itself prove a fully separate first-class `org_admin` permission model. If the product needs
true enterprise-admin separation, that should stay as a model/design follow-up instead of being marked Pass here.

## Recommended Runtime Sequence After Approval

1. Confirm the local app is available at `http://127.0.0.1:3000`.
2. laozhuang logs out of any existing session.
3. laozhuang opens the private credential file locally.
4. For each row, laozhuang logs in manually with the relevant local account.
5. Codex records only route and behavior evidence, never credentials.
6. After each row, laozhuang logs out before moving to the next account.
7. Codex produces a final row-by-row `pass`, `fail`, or `blocked` summary.

## Approval Phrase

To approve the later runtime walkthrough, laozhuang should explicitly say:

`批准 ROLE_SEPARATED_LOCAL_ACCOUNT_RUNTIME_RERUN_SCOPE_2026_06_23`

That approval will authorize only the local runtime walkthrough described in this package. It will not authorize
Provider, Cost Calibration, staging/prod, payment, deployment, or final acceptance Pass.
