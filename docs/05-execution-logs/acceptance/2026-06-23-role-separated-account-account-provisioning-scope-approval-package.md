# Role Separated Account Provisioning Scope Approval Package

packageId: ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23
taskId: acceptance-role-separated-account-account-provisioning-scope-approval-2026-06-23
packageStatus: prepared_not_approved_for_decision_or_execution
preparedAt: "2026-06-23T07:40:21-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Plain-Language Summary

The role-separated account gate is still blocked because the project does not have enough separated local accounts to
prove each role independently.

This is not a browser problem. The browser reached the local app and the operations backend. The issue is that the
available accounts are not enough:

- the personal learner account is mixed, so it cannot prove a clean standard-only or advanced-only learner;
- there is no separate advanced personal account available;
- there are no organization employee or organization admin accounts available for runtime proof;
- content operations and system operations use the same account, so they cannot prove role separation.

This package asks laozhuang to decide the next evidence strategy. It does not create accounts or provide passwords.

## What Approval Of This Package Allows

If laozhuang approves `ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23`, the next task may record a row-by-row
owner decision choosing one of these outcomes for each mandatory role row:

- `prepare_separated_local_account_or_seed_scope`
- `mvp_excluded_by_owner`
- `fixture_only_or_variance_accepted_by_owner`
- `keep_blocked`

The next task may also define the follow-up task list implied by those decisions.

## What Approval Still Does Not Allow

Approval of this package still does not allow Codex to:

- create, disable, reset, or modify accounts;
- read, write, or provide passwords;
- open or edit a credential document;
- enter credentials on behalf of laozhuang;
- record passwords, tokens, cookies, localStorage, Authorization headers, session values, `.env*`, database URLs, or
  secrets;
- run seed scripts or write to a database;
- change schema, migrations, package files, lockfiles, source code, fixtures, or e2e files;
- run browser walkthroughs or Playwright specs;
- call Provider/model services;
- run Cost Calibration;
- deploy staging/prod/cloud resources;
- touch payment or external services;
- claim Standard MVP or Advanced MVP final Pass.

Any later account provisioning, seed, fixture/e2e change, credential handoff, or runtime rerun must have its own narrower
approval package.

## Recommended Default

The most rigorous path is to prepare a later, separate local-only account provisioning or seed package for all eight
mandatory rows.

That later package should create or make available one separated local account per role row, with no passwords committed
to git and no secrets recorded in evidence. After those accounts exist and laozhuang can log in manually, the project can
rerun the seeded local runtime walkthrough.

This is the strongest path because it proves real role separation instead of accepting mixed accounts or fixture-only
confidence.

## Role-by-Role Decision Matrix

| Role row                    | Current blocker                                 | Recommended decision                            | Other owner choices                             | Why this matters                                                                                |
| --------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Current learner account has mixed authorization | `prepare_separated_local_account_or_seed_scope` | Accept mixed-account variance, or keep blocked  | Standard MVP needs clean standard-only learner evidence.                                        |
| `personal_advanced_student` | No advanced personal account/password available | `prepare_separated_local_account_or_seed_scope` | Exclude from MVP, accept fixture-only, or block | Advanced MVP needs a real advanced learner session without admin power.                         |
| `org_standard_employee`     | No separated account available                  | `prepare_separated_local_account_or_seed_scope` | Exclude from MVP, accept fixture-only, or block | Organization employee behavior differs from personal learner behavior.                          |
| `org_advanced_employee`     | No separated account available                  | `prepare_separated_local_account_or_seed_scope` | Exclude from MVP, accept fixture-only, or block | Advanced organization employee scope needs runtime proof.                                       |
| `org_standard_admin`        | No separated account available                  | `prepare_separated_local_account_or_seed_scope` | Exclude from MVP, accept fixture-only, or block | Organization admin must prove organization management without system-wide power.                |
| `org_advanced_admin`        | No separated account available                  | `prepare_separated_local_account_or_seed_scope` | Exclude from MVP, accept fixture-only, or block | Advanced organization admin needs both advanced entitlement and organization boundary evidence. |
| `content_admin`             | Same account as system operations               | `prepare_separated_local_account_or_seed_scope` | Accept combined-role variance, or keep blocked  | Content operations must be separable from system operations to prove least-privilege behavior.  |
| `ops_admin`                 | Same account as content operations              | `prepare_separated_local_account_or_seed_scope` | Accept combined-role variance, or keep blocked  | System operations must be separable from content operations to prove least-privilege behavior.  |

## Decision Options

### Option A: Prepare Separated Local Accounts For All Rows

This is the recommended option.

It means laozhuang wants the project to prepare a later execution package for clean local accounts or seed data for all
eight mandatory rows. The later execution package must still be reviewed before any account, seed, fixture, or runtime
work starts.

### Option B: Mixed Strategy

This means laozhuang chooses separated local accounts for some rows, and explicit owner variances or MVP exclusions for
other rows.

Every variance or exclusion must be named by exact role row. Nothing is inferred silently.

### Option C: Accept Fixture-Only Or Variance Evidence

This means laozhuang accepts that a row does not need real separated runtime evidence for this MVP acceptance phase.

This reduces execution work but weakens acceptance confidence. It should be used only when laozhuang is comfortable
saying the evidence is enough despite missing separated runtime accounts.

### Option D: Keep Blocked

This means no new account/seed/fixture work is approved now. The role-separated account gate remains Blocked.

## Credential Handling Rule For Later Tasks

If a later task is approved to prepare accounts, it must still follow these rules:

- no passwords committed to git;
- no password values in evidence;
- no `.env*` or secret contents in evidence;
- laozhuang remains the accountable owner for credentials;
- Codex may document account labels and role rows, but not credential values;
- any local-only credential handoff path must be explicitly approved and must be outside committed evidence.

## Approval Phrase

To approve the next row-by-row decision task, laozhuang should explicitly say:

`批准 ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23`

That approval will still not authorize actual account creation, password handling, seed/database writes, fixture/e2e
changes, browser runtime, Provider, Cost Calibration, staging/prod, payment, or final acceptance Pass.
