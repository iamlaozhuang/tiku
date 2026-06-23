# Acceptance Role Separated Account Account Provisioning Scope Approval Plan

taskId: acceptance-role-separated-account-account-provisioning-scope-approval-2026-06-23
status: closed
createdAt: "2026-06-23T07:40:21-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
packageId: ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23

## Purpose

Prepare an owner-facing approval package for the account coverage gap that blocked the seeded local runtime run.

The runtime run proved that the blocker is not caused by browser availability. It is caused by missing or unseparated
role accounts. This task prepares a decision package only. It does not create accounts, read or provide passwords, run
seed scripts, write to a database, modify fixtures or e2e files, run browser/Playwright, access `.env*`, call Provider,
run Cost Calibration, deploy staging/prod, touch payment services, or claim final MVP Pass.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-seeded-local-runtime-run.md`

## Evidence Basis

- The seeded local runtime run closed as `blocked_seeded_local_runtime_requires_separated_accounts`.
- All eight mandatory role rows remain blocked.
- The personal learner account is not clean standard-only or advanced-only proof because it has mixed authorization
  state.
- laozhuang does not currently have a separate advanced personal account, organization employee/admin accounts, or
  separated content/system operations accounts.
- Content operations and system operations currently share one admin-like account, so role separation cannot be proven.

## Package Design

The package should let laozhuang decide, by role row, whether to:

- prepare a later separated local account or seed/fixture execution package;
- explicitly exclude the row from the current MVP;
- explicitly accept fixture-only or variance evidence for the row;
- or keep the row blocked.

The package must also state that approving this package does not authorize the risky execution itself. Any actual account
creation, seed script, fixture/e2e mutation, credential handoff, or runtime rerun still needs a later narrower approval.

## Validation Plan

- Create the approval package under `docs/05-execution-logs/acceptance/`.
- Record evidence and audit review documents.
- Update `project-state.yaml` and `task-queue.yaml`.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-account-provisioning-scope-approval-2026-06-23`

## Validation Result

The approval package is prepared and not approved for downstream decision or execution. The next task remains blocked
until laozhuang explicitly approves `ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23`.
