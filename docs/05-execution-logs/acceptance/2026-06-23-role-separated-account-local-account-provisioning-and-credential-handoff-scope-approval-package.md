# Role Separated Local Account Provisioning And Credential Handoff Scope Approval Package

packageId: ROLE_SEPARATED_LOCAL_ACCOUNT_PROVISIONING_AND_CREDENTIAL_HANDOFF_SCOPE_2026_06_23
taskId: acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-scope-approval-2026-06-23
packageStatus: prepared_not_approved_for_execution
preparedAt: "2026-06-23T08:56:57-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Plain-Language Summary

The role-separated account gate is still blocked because the local environment does not yet have clean, separated
accounts for the eight required role rows.

The next practical step is to create or seed local-only acceptance accounts and give laozhuang a safe way to know the
credentials.

This package does not create those accounts and does not create or reveal passwords. It asks laozhuang to approve the
exact execution boundary for a later task.

## What Approval Of This Package Allows

If laozhuang approves `ROLE_SEPARATED_LOCAL_ACCOUNT_PROVISIONING_AND_CREDENTIAL_HANDOFF_SCOPE_2026_06_23`, the next task
may execute a local-only account provisioning and credential handoff batch with these limits:

- target only the local `dev` environment at `127.0.0.1` / local database;
- create or seed the eight role-separated local acceptance accounts listed below;
- use synthetic, local-only account labels and no real customer data;
- create a local private credential file outside the git repository if that handoff path is selected;
- record only redacted account labels, role rows, and file path evidence;
- keep staging/prod, Provider, Cost Calibration, payment, and final MVP Pass blocked.

## Recommended Credential Handoff Path

Recommended path:

`local_private_credential_file_outside_repo`

This means the execution task may create one private markdown file outside the repository, for example:

`D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

That file may contain the local-only account usernames and passwords for laozhuang to open on this machine. It must not
be committed to git, copied into evidence, pasted into chat, shown in screenshots, written into `.env*`, or included in
logs.

Evidence may record only:

- the private file path;
- whether the file was created;
- the role rows covered;
- redacted account labels;
- no password values.

## Alternative Credential Handoff Path

Alternative path:

`owner_manual_password_setup`

This means laozhuang manually sets or resets every account password. Codex may document the account labels and role rows,
but Codex never knows the password values. This is the strongest privacy path, but it requires more manual work from
laozhuang.

## Keep Blocked Option

If laozhuang does not want either credential handoff path, the role-separated account gate remains Blocked.

## Role Account Scope

| Role row                    | Local account label                    | Required authorization shape        | Why needed                                                                                 |
| --------------------------- | -------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `personal_standard_student` | `acceptance.personal.standard.student` | personal standard learner only      | Proves standard personal learner behavior without advanced entitlement or admin power.     |
| `personal_advanced_student` | `acceptance.personal.advanced.student` | personal advanced learner only      | Proves advanced personal learner behavior without admin power.                             |
| `org_standard_employee`     | `acceptance.org.standard.employee`     | organization standard employee only | Proves standard organization employee behavior without organization admin or system power. |
| `org_advanced_employee`     | `acceptance.org.advanced.employee`     | organization advanced employee only | Proves advanced organization employee behavior under employee scope.                       |
| `org_standard_admin`        | `acceptance.org.standard.admin`        | organization standard admin only    | Proves organization admin behavior without system-wide operations power.                   |
| `org_advanced_admin`        | `acceptance.org.advanced.admin`        | organization advanced admin only    | Proves advanced organization admin behavior with organization boundary controls.           |
| `content_admin`             | `acceptance.content.admin`             | content operations only             | Proves content operations are separate from system operations.                             |
| `ops_admin`                 | `acceptance.ops.admin`                 | system operations only              | Proves system operations are separate from content authoring.                              |

## Evidence Expected From Later Execution

The later execution task should produce only redacted committed evidence:

- role row;
- local account label;
- provisioning method used: `seed`, `admin_ui`, or `existing_local_account_updated`;
- credential handoff path used;
- private credential file path if applicable;
- per-row setup status: `created`, `reused`, `blocked`, or `owner_manual_needed`;
- confirmation that no password values were committed.

## What Approval Still Does Not Allow

Approval of this package still does not allow:

- showing passwords in chat;
- committing passwords to git;
- writing passwords into evidence, screenshots, logs, `.env*`, browser storage evidence, or terminal transcripts;
- using real customer/customer-like personal data;
- touching staging or production;
- enabling Provider/model calls;
- running Cost Calibration;
- touching payment or external services;
- claiming Standard MVP or Advanced MVP final Pass;
- running browser walkthrough evidence after provisioning unless a later runtime scope is approved.

## Approval Phrase

To approve the next execution task, laozhuang should explicitly say:

`批准 ROLE_SEPARATED_LOCAL_ACCOUNT_PROVISIONING_AND_CREDENTIAL_HANDOFF_SCOPE_2026_06_23`

That approval will authorize only the local account provisioning and credential handoff execution described above. It
will not authorize staging/prod, Provider, Cost Calibration, payment, or final acceptance Pass.
