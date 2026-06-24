# Acceptance Role Separated Account Local Account Runtime Rerun Scope Approval Plan

taskId: acceptance-role-separated-account-local-account-runtime-rerun-scope-approval-2026-06-23
packageIdToPrepare: ROLE_SEPARATED_LOCAL_ACCOUNT_RUNTIME_RERUN_SCOPE_2026_06_23
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Scope

This task prepares a fresh owner approval package for a later local runtime walkthrough using the role-separated local
accounts prepared by
`acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution-2026-06-23`.

Allowed work:

- write the runtime rerun approval package;
- record the proposed manual/browser walkthrough rows and evidence rules;
- update task queue and project state with package status;
- keep all credential values redacted.

Blocked work:

- no private credential file read by Codex;
- no credential entry by Codex;
- no password values in git, evidence, chat, screenshots, logs, env files, or terminal transcripts;
- no browser or Playwright runtime execution;
- no dev server start, Provider call, Cost Calibration, staging/prod, payment, deployment, PR, force push, or final
  acceptance Pass.

## Inputs

- Source provisioning evidence:
  `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution.md`
- Private credential file path recorded by prior task:
  `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

## Package Design

The package will ask laozhuang to approve a later runtime walkthrough with these guardrails:

1. laozhuang opens the private credential file locally and enters credentials manually.
2. Codex does not read the credential file and does not type passwords.
3. Runtime target is local only: `http://127.0.0.1:3000` or `http://localhost:3000`.
4. Evidence records only role row, route/workflow label, expected allowed behavior, expected denied behavior, observed
   result, and blocker notes.
5. Organization admin rows remain under a known limitation because the current schema has no first-class `org_admin`
   role.

## Verification Plan

- Run Prettier check on changed docs/state files.
- Run `git diff --check`.
- Run a redaction scan over changed files for private login/password markers.
- Run Module Run v2 pre-commit hardening for this task.
