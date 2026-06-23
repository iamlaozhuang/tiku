# Acceptance Role Separated Account Account Provisioning Decision Plan

taskId: acceptance-role-separated-account-account-provisioning-decision-2026-06-23
status: closed
createdAt: "2026-06-23T07:51:30-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23

## Purpose

Record laozhuang's approval of `ROLE_SEPARATED_ACCOUNT_PROVISIONING_SCOPE_2026_06_23` and convert it into a
row-by-row account provisioning decision for the role-separated account blocker.

Because laozhuang approved the package without naming any role-level MVP exclusion or fixture-only variance, this task
applies the package's recommended conservative path: all eight mandatory role rows need separated local accounts or
approved seed data before runtime evidence can close the blocker.

This task also records the credential handoff rule raised by laozhuang: if later accounts are created or seeded, the
owner must have a way to learn the credentials without committing passwords to git, evidence, or chat.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-account-provisioning-scope-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-seeded-local-runtime-run.md`

## Decision Scope

Allowed:

- record the approval package as consumed;
- assign each mandatory role row to `prepare_separated_local_account_or_seed_scope`;
- record that no role-level MVP exclusion or fixture-only variance is accepted;
- define credential handoff as a later explicit approval concern;
- create the next docs/state task to prepare a local account provisioning and credential handoff approval package.

Blocked:

- account creation, disablement, reset, password reset, or mutation;
- reading, writing, displaying, or entering passwords;
- opening or editing credential documents;
- seed scripts, database writes, schema migration, source/e2e changes, env/secret access;
- browser or Playwright runtime;
- Provider, Cost Calibration, staging/prod/cloud, payment, external services;
- Standard or Advanced MVP final Pass.

## Credential Handoff Principle

Later account provisioning must choose one approved handoff path before execution:

- owner manual password setup, where laozhuang sets or resets passwords and Codex never knows them;
- local private credential file outside the git repository, where Codex may write credentials only after explicit
  approval and evidence records only the path and redacted status;
- keep the blocker open if neither path is approved.

Passwords must not be written into committed docs, evidence, git history, chat, `.env*`, browser storage evidence, or
logs.

## Validation Plan

- Record the decision under `docs/05-execution-logs/acceptance/`.
- Record evidence and audit review documents.
- Update `project-state.yaml` and `task-queue.yaml`.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-account-provisioning-decision-2026-06-23`

## Validation Result

The row-by-row provisioning decision is recorded. All eight mandatory rows require separated local accounts or approved
seed data, and the next step is a separate scope approval package for account provisioning plus credential handoff.
