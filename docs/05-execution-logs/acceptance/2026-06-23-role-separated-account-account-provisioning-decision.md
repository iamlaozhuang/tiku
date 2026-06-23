# Role Separated Account Account Provisioning Decision

taskId: acceptance-role-separated-account-account-provisioning-decision-2026-06-23
status: closed
result: pass_all_mandatory_rows_require_separated_local_accounts_with_credential_handoff_scope_needed
recordedAt: "2026-06-23T07:51:30-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23

## Plain-Language Decision

laozhuang approved `ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23`.

No role-level MVP exclusion and no fixture-only or mixed-account variance was named in that approval. Therefore the
conservative decision applies:

All eight mandatory role rows should move toward separated local account or approved seed-data preparation.

This does not mean accounts are created now. This decision only says what the next evidence path should be.

## Answer To The Credential Question

If later accounts are created, laozhuang still needs a safe way to know the usernames and passwords.

Codex should not put passwords in chat, git, committed markdown, evidence, screenshots, logs, `.env*`, browser storage,
or terminal transcripts that become evidence. That is why passwords are not printed in acceptance documents.

The practical solution is to approve one of these later handoff paths:

- `owner_manual_password_setup`: laozhuang sets or resets the passwords manually. This is the strongest privacy path
  because Codex never knows the password values.
- `local_private_credential_file_outside_repo`: after explicit approval, Codex may generate or collect the local-only
  credentials into one private file outside the git repository, then tell laozhuang the file path. Evidence records only
  the path and redacted completion status, not the password values.

Either path lets laozhuang know the credentials without putting secrets into the project history or acceptance evidence.

## Row-by-Row Decision

| Role row                    | Decision                                        | Exclusion accepted? | Fixture-only/variance accepted? | Credential handoff needed? | Meaning                                                                                                      |
| --------------------------- | ----------------------------------------------- | ------------------- | ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `personal_standard_student` | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need clean standard-only learner account proof; the mixed learner account is not enough.                     |
| `personal_advanced_student` | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need a dedicated advanced learner account and password known to laozhuang.                                   |
| `org_standard_employee`     | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need standard organization employee account proof without admin power.                                       |
| `org_advanced_employee`     | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need advanced organization employee account proof under employee scope.                                      |
| `org_standard_admin`        | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need standard organization admin account proof with organization boundary behavior.                          |
| `org_advanced_admin`        | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need advanced organization admin account proof with advanced entitlement and organization boundary behavior. |
| `content_admin`             | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need content-only operations proof separated from system operations.                                         |
| `ops_admin`                 | `prepare_separated_local_account_or_seed_scope` | no                  | no                              | yes                        | Need system-only operations proof separated from content operations.                                         |

## Gate Decision

The role-separated account blocker remains `Blocked`.

It can move toward closure only after a later approved task prepares the missing separated accounts or approved seed
data and then a separate runtime walkthrough collects redacted allowed/denied behavior evidence.

## Recommended Next Task

Recommended next task:

`acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-scope-approval-2026-06-23`

Recommended next package:

`ROLE_SEPARATED_LOCAL_ACCOUNT_PROVISIONING_AND_CREDENTIAL_HANDOFF_SCOPE_2026_06_23`

That task should prepare a narrow approval package for:

- which role accounts may be created or seeded;
- whether account creation happens through UI/manual owner action, script/seed, or existing admin tools;
- whether credentials are handled by owner manual password setup or a local private credential file outside git;
- what redacted evidence is allowed after account setup;
- what remains blocked until a later runtime approval.

## Still Not Authorized

This decision still does not authorize:

- creating, disabling, resetting, or modifying accounts;
- reading, writing, providing, displaying, or entering passwords;
- opening or editing credential documents;
- writing seed data or connecting to a database;
- changing schema, migrations, package files, lockfiles, source code, fixtures, or e2e files;
- running browser walkthroughs or Playwright specs;
- calling Provider/model services;
- running Cost Calibration;
- deploying staging/prod/cloud resources;
- touching payment or external services;
- claiming Standard MVP or Advanced MVP final Pass.
