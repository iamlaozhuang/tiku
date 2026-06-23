# Acceptance Role Separated Account Runtime Walkthrough Plan

taskId: acceptance-role-separated-account-runtime-walkthrough-2026-06-23
status: closed
createdAt: "2026-06-23T06:28:58-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: current_user_execute_acceptance_role_separated_account_runtime_walkthrough_2026_06_23

## Purpose

Execute the local role-separated account runtime walkthrough within a narrow redacted boundary. This task checks what
the current local browser/runtime state can prove about mandatory role rows, then records pass/blocked outcomes without
claiming final Standard or Advanced MVP acceptance.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-coverage-batch-plan.md`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-fixture-gap-decision.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-test-fixture-runtime-run.md`

## Execution Boundary

- Local target only: `http://127.0.0.1:3000` or `http://localhost:3000`.
- Browser surface: current in-app browser session and local route checks only.
- Evidence mode: role labels, route labels, pass/blocked status, and redacted notes only.
- Credential handling: Codex must not read password documents, record passwords, record tokens, inspect cookies, dump
  localStorage, or enter new credentials unless laozhuang explicitly performs or directs that action in the browser.
- Account/data handling: no account creation, disablement, password reset, fixture mutation, seed execution, database
  write, schema migration, Provider call, Cost Calibration, staging/prod/cloud, payment, external service, PR, force
  push, or final acceptance Pass.

## Required Coverage Rows

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

Each row needs an allowed behavior and a denied behavior. If the current browser/session cannot prove a row, the row is
recorded as blocked rather than inferred from another role.

## Validation Plan

- Inspect current local browser page identity and visible route state.
- Exercise only non-destructive local route checks needed to establish allowed/denied behavior for the current session.
- Record unproven role rows as blocked with the missing account/session reason.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-runtime-walkthrough-2026-06-23`

## Validation Result

The current local browser session provided only partial learner evidence. It did not provide separated accounts or
sessions for the mandatory role rows. The walkthrough is therefore closed as Blocked, with the role-separated account
blocker still open.
