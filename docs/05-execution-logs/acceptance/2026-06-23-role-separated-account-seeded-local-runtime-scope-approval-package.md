# Role Separated Account Seeded Local Runtime Scope Approval Package

packageId: ROLE_SEPARATED_SEEDED_LOCAL_RUNTIME_SCOPE_2026_06_23
taskId: acceptance-role-separated-account-seeded-local-runtime-scope-approval-2026-06-23
packageStatus: prepared_not_approved_for_execution
preparedAt: "2026-06-23T07:15:49-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Plain-Language Summary

The role-separated account gate is still blocked. The reason is simple: the project has not yet shown, in a real local
runtime session, that every required role can do what it should do and is blocked from what it should not do.

This package prepares the next possible runtime walkthrough. It does not create accounts, does not read or record
passwords, does not change the database, and does not run the browser yet.

If laozhuang approves this package, the next task may collect redacted local runtime evidence for the eight required
role rows, but only within the safety limits below.

## What Approval Of This Package Allows

If laozhuang approves `ROLE_SEPARATED_SEEDED_LOCAL_RUNTIME_SCOPE_2026_06_23`, the next task may run a local-only
seeded account walkthrough for these eight rows:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

The next task may record only redacted evidence:

- the role row name;
- the local route or workflow label that was checked;
- whether the role can perform its expected allowed behavior;
- whether the role is denied from one required forbidden behavior;
- whether the row is `pass`, `fail`, or `blocked`;
- a short console or runtime health summary if a local browser walkthrough is used.

The walkthrough must stay local:

- `http://127.0.0.1:<local-port>`
- `http://localhost:<local-port>`

## What Approval Still Does Not Allow

Even if this package is approved, Codex still may not:

- create, disable, reset, or modify any account;
- read the test-account password document;
- enter credentials on behalf of laozhuang;
- record passwords, tokens, cookies, localStorage, Authorization headers, session values, `.env*`, database URLs, or
  secrets;
- run seed scripts or write to a database;
- change schema, migrations, package files, lockfiles, source code, or e2e files;
- change Provider configuration or call Provider/model services;
- run Cost Calibration;
- deploy staging/prod/cloud resources;
- touch payment or external services;
- access staging/prod data;
- claim Standard MVP or Advanced MVP final Pass.

If the later runtime task discovers that an account is missing, unusable, or requires a seed/reset/create action, it must
stop and record that role as `blocked`. It must not fix the account inside the runtime task.

## Runtime Walkthrough Matrix

| Order | Role row                    | Plain-language role                    | Required allowed evidence                                   | Required denied evidence                                          | Stop condition                                                                 |
| ----- | --------------------------- | -------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1     | `personal_standard_student` | Individual standard-edition learner    | Learner can reach ordinary learner pages and standard flow. | Learner cannot enter content operations or system operations.     | Stop if the account is not cleanly standard-only or shows mixed edition state. |
| 2     | `personal_advanced_student` | Individual advanced-edition learner    | Learner can reach learner pages and advanced learner flow.  | Learner cannot enter organization admin, content, or ops power.   | Stop if advanced entitlement cannot be shown without admin power.              |
| 3     | `org_standard_employee`     | Standard-edition organization employee | Employee can use organization-scoped learner/work flow.     | Employee cannot manage organization admin or system operations.   | Stop if no separated employee session exists.                                  |
| 4     | `org_advanced_employee`     | Advanced-edition organization employee | Employee can use advanced organization-scoped flow.         | Employee cannot manage organization admin or system operations.   | Stop if advanced org employee entitlement cannot be shown.                     |
| 5     | `org_standard_admin`        | Standard organization administrator    | Admin can perform standard organization admin workflow.     | Admin cannot cross into system operations or unrelated org scope. | Stop if organization boundary cannot be verified.                              |
| 6     | `org_advanced_admin`        | Advanced organization administrator    | Admin can perform advanced organization admin workflow.     | Admin cannot cross into system operations or unrelated org scope. | Stop if advanced entitlement and org boundary cannot both be verified.         |
| 7     | `content_admin`             | Content operations user                | User can reach a content operations workflow.               | User cannot perform system operations.                            | Stop if no positive content operations workflow is available.                  |
| 8     | `ops_admin`                 | System operations user                 | User can reach a system operations workflow.                | User cannot edit content as content operations unless permitted.  | Stop if no positive system operations workflow is available.                   |

## Recommended Execution Order

Run the later walkthrough in this order:

1. Learner rows: `personal_standard_student`, `personal_advanced_student`.
2. Organization employee rows: `org_standard_employee`, `org_advanced_employee`.
3. Organization admin rows: `org_standard_admin`, `org_advanced_admin`.
4. Operations rows: `content_admin`, `ops_admin`.

This order starts with the least privileged flows and moves toward higher operational power. It also makes failures
easier to interpret because learner access, organization access, and operations access are not mixed together.

## Credential Handling Rule

laozhuang remains responsible for any account selection and credential entry.

Codex may only observe the resulting local UI state and record redacted role/route/status evidence. Codex must not open
the password document, copy passwords, type passwords, inspect session storage, or preserve any credential-like material.

## Evidence Template For The Later Runtime Task

For each row, the later runtime task should record:

| Field                   | Required value                                               |
| ----------------------- | ------------------------------------------------------------ |
| Role row                | One of the eight exact role rows above.                      |
| Account source          | `seeded_local_account_confirmed_by_owner` or `blocked`.      |
| Allowed workflow label  | Short route or workflow name only.                           |
| Allowed workflow result | `pass`, `fail`, or `blocked`.                                |
| Denied workflow label   | Short route or workflow name only.                           |
| Denied workflow result  | `pass`, `fail`, or `blocked`.                                |
| Redaction check         | Confirm no password, token, cookie, localStorage, or secret. |
| Row decision            | `pass`, `fail`, or `blocked`.                                |

## Pass, Fail, And Blocked Rules

- A row is `pass` only when both required allowed behavior and denied behavior are proven with redacted local runtime
  evidence.
- A row is `fail` when the role can do something it must not do, or cannot do something it must be able to do while the
  account and workflow are otherwise usable.
- A row is `blocked` when the account, credential, seed, local server, workflow, or redaction condition prevents a safe
  walkthrough.
- The overall role-separated account gate remains `Blocked` until all mandatory rows are `pass` or have a later explicit
  owner-approved MVP exclusion.

## Approval Phrase

To approve the next local runtime walkthrough scope, laozhuang should explicitly say:

`批准 ROLE_SEPARATED_SEEDED_LOCAL_RUNTIME_SCOPE_2026_06_23`

That approval still does not authorize account creation, credential-document access by Codex, database seed/write,
schema changes, Provider calls, Cost Calibration, staging/prod, payment, or final acceptance Pass.
