# Acceptance Role Separated Test Fixture Scope Approval Plan

taskId: acceptance-role-separated-account-test-fixture-scope-approval-2026-06-23
status: closed
createdAt: "2026-06-23T05:44:44-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Purpose

Prepare the owner approval package for a future test-only fixture supplement task. This task defines the exact role
rows, allowed file surfaces, validation boundary, evidence redaction rules, and stop conditions. It does not modify
fixture or e2e files.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-fixture-gap-decision.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-fixture-gap-decision.md`

## Allowed Work

- Write a docs-only approval package for test-only role fixture supplement.
- Define proposed role rows, fixture intent, allowed/denied behavior labels, and evidence rules.
- Define the exact future approval id and blocked work.
- Update project state and task queue to wait for owner approval.

## Blocked Work

- Editing `e2e/**`, `tests/**`, source, scripts, packages, lockfiles, schema, migrations, or env files.
- Creating or disabling accounts, changing passwords, running seed scripts, connecting to or mutating a database.
- Starting a dev server, using browser/Playwright runtime, calling Provider/model services, running Cost Calibration,
  staging/prod/cloud deploy, payment/external services, PR, force push, or final MVP pass.

## Execution Steps

1. Confirm prior fixture gap decision and current queue boundary.
2. Define the approval package `ROLE_SEPARATED_TEST_FIXTURE_SUPPLEMENT_SCOPE_2026_06_23`.
3. List the role rows, proposed fixture coverage, allowed file surfaces, validation boundary, and stop conditions.
4. Write evidence and self-review.
5. Update `project-state.yaml` and `task-queue.yaml`.
6. Run docs/static validation and record command results.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-test-fixture-scope-approval-2026-06-23`

## Validation Result

All planned docs/static validation commands passed after evidence and state updates.
