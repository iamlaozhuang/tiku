# Acceptance Role Separated Account Inventory Plan

taskId: acceptance-role-separated-account-inventory-2026-06-23
status: closed
createdAt: "2026-06-23T04:32:18-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_ACCOUNT_SCOPE_2026_06_23

## Purpose

Inventory the existing safe local seed account labels and fixture account labels that can support the role-separated
acceptance blocker. This task records only redacted labels, coverage judgments, and gaps. It does not create accounts,
change passwords, edit fixtures, run browser or Playwright runtime, connect to a database, or claim final MVP pass.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-scope-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-seeded-local-account-run.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-fixture-only-role-coverage-run.md`

## Allowed Work

- Map the mandatory role rows to existing redacted account or fixture labels.
- Record whether each row is fully covered, partially covered, fixture-only, authorization-only, or missing.
- Record the next evidence needed for each incomplete row.
- Update docs/state/task queue for this inventory task.

## Blocked Work

- Password, token, cookie, localStorage, database URL, raw database row, `.env*`, provider payload, raw prompt, raw AI
  output, full `paper`, full `material`, raw answer, or staging/prod evidence capture.
- Account creation, account disable, password reset, fixture mutation, seed execution, database connection or write.
- Dev server, browser runtime, Playwright runtime, Provider/model call, Cost Calibration, staging/prod/cloud deploy,
  payment, external service, PR, force push, or final acceptance pass.

## Execution Steps

1. Confirm the owner approval package and current queue state.
2. Inventory each mandatory row using only existing redacted evidence and safe file labels.
3. Record boundary rows for unauthenticated visitor, `super_admin`, and auditor support.
4. Write evidence and self-review with explicit residual gaps.
5. Update `project-state.yaml` and `task-queue.yaml` so the next executable task is the fixture/seed gap decision.
6. Run docs/static validation and record command results.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-inventory-2026-06-23`

## Validation Result

All planned docs/static validation commands passed after evidence and state updates.
