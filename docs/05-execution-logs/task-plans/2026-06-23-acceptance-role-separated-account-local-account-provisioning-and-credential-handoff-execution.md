# Acceptance Role Separated Account Local Provisioning And Credential Handoff Execution Plan

taskId: acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution-2026-06-23
approvalConsumed: ROLE_SEPARATED_LOCAL_ACCOUNT_PROVISIONING_AND_CREDENTIAL_HANDOFF_SCOPE_2026_06_23
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Scope

This task prepares local-only role-separated acceptance accounts and a private credential handoff file outside the git
repository.

Allowed work:

- execute local dev account provisioning against the local database only;
- create or update synthetic local acceptance users, admins, organizations, personal authorizations, and organization
  authorizations for the eight approved role rows;
- create the private credential handoff file at
  `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`;
- write committed evidence with role labels, account classes, and redacted setup status only.

Blocked work:

- no password values in git, evidence, chat, screenshots, logs, env files, or browser storage evidence;
- no staging or production access;
- no Provider/model call or Provider enablement;
- no Cost Calibration, payment, external-service, deployment, PR, force push, or final acceptance Pass;
- no browser or Playwright runtime walkthrough in this task.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Execution Approach

1. Reuse the existing local dev seed first so prerequisite base rows are present.
2. Run a one-time local Node.js provisioning script from the terminal without adding it to the repository.
3. Generate account passwords in memory and write them only to the approved private file outside the repository.
4. Use Better Auth password hashing for `auth_account.password`; do not hand-roll credential hashing.
5. Use deterministic public IDs, phone numbers, and labels so reruns are idempotent and can update the same local
   acceptance rows.
6. Represent standard and advanced personal learners with separate `personal_auth` rows and `edition` values.
7. Represent standard and advanced enterprise users with separate local organizations and `org_auth` rows, each linked
   through `org_auth_organization`.
8. Represent content and system operations with separate `admin` rows using existing allowed `content_admin` and
   `ops_admin` role values.
9. Record the current limitation that the schema has no independent `org_admin` enum; enterprise admin rows are
   provisioned as organization-bound admin accounts using the existing admin model.

## Verification Plan

- Confirm the provisioning script returns only a redacted summary.
- Confirm the private credential file exists outside `D:\tiku`.
- Confirm committed docs do not contain password-like plaintext markers.
- Run Prettier on changed docs/state files.
- Run `git diff --check`.
- Run Module Run v2 pre-commit hardening for this task.

## Risk Controls

- The private credential file is outside the repository and is not referenced as a staged file.
- Evidence records the file path and role labels only.
- The execution does not read or write staging/prod data.
- The execution does not run browser walkthrough evidence; that requires a later approval.
- Any runtime coverage claim remains blocked until laozhuang performs or approves a separate walkthrough rerun.
