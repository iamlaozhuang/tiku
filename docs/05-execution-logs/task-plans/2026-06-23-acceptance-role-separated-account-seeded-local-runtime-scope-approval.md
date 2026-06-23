# Acceptance Role Separated Account Seeded Local Runtime Scope Approval Plan

taskId: acceptance-role-separated-account-seeded-local-runtime-scope-approval-2026-06-23
status: closed
createdAt: "2026-06-23T07:15:49-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
packageId: ROLE_SEPARATED_SEEDED_LOCAL_RUNTIME_SCOPE_2026_06_23

## Purpose

Prepare a clear owner-facing approval package for the next possible seeded local runtime walkthrough batch.

The previous owner decision requires seeded local runtime evidence for all eight mandatory role rows. This task prepares
the execution scope only. It does not create accounts, read password documents, enter credentials, run seeds, write to a
database, edit `.env*`, change schema, change source or e2e files, run browser or Playwright, call Provider, run Cost
Calibration, deploy staging/prod, touch payment services, or claim final MVP Pass.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-seeded-local-or-owner-exclusion-decision.md`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-seeded-local-or-owner-exclusion-scope-approval-package.md`

## Evidence Basis

- The role-separated account blocker remains `Blocked`.
- The owner-approved decision recorded no MVP exclusions and no fixture-only variance acceptance.
- All eight mandatory rows require seeded local runtime evidence before this blocker can close.
- Later runtime evidence must be redacted and must prove both allowed behavior and denied behavior for each role row.

## Package Design

The approval package must:

- name all eight mandatory role rows;
- explain the runtime walkthrough in plain language;
- define exactly what a later approval allows;
- define what remains blocked even after approval;
- state that laozhuang remains the accountable owner and Codex only records redacted evidence;
- stop the later runtime task if accounts are unavailable, credentials are missing, or any seed/account action would be
  required without a separate approval;
- keep Provider, Cost Calibration, staging/prod, payment, database, schema, env/secret, dependency, and final Pass gates
  closed.

## Validation Plan

- Create the approval package under `docs/05-execution-logs/acceptance/`.
- Record evidence and audit review documents.
- Update `project-state.yaml` and `task-queue.yaml`.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-seeded-local-runtime-scope-approval-2026-06-23`

## Validation Result

The package is prepared and not approved for execution yet. The next runtime task remains blocked until laozhuang
explicitly approves `ROLE_SEPARATED_SEEDED_LOCAL_RUNTIME_SCOPE_2026_06_23`.
