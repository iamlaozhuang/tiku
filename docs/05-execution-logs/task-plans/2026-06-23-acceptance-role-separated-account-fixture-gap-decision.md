# Acceptance Role Separated Account Fixture Gap Decision Plan

taskId: acceptance-role-separated-account-fixture-gap-decision-2026-06-23
status: closed
createdAt: "2026-06-23T05:02:46-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Purpose

Decide how each recorded role-separated account gap should be handled before runtime walkthrough: test-only fixture
supplement, seeded local account expansion, explicit MVP exclusion, or continued blocker. This task is decision-only
and does not perform fixture, seed, account, database, or runtime changes.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-inventory.md`

## Allowed Work

- Classify each role gap by recommended handling.
- Record the lowest-risk next step and the stronger final acceptance evidence needed later.
- Record required fresh approvals for fixture mutation, seeded account expansion, database work, browser runtime, and
  final blocker closure.
- Update docs/state/task queue only.

## Blocked Work

- Editing fixture files, e2e files, source files, scripts, database schema, migrations, package files, or env files.
- Creating accounts, disabling accounts, changing passwords, running seed scripts, connecting to or mutating a database.
- Starting a dev server, using browser/Playwright runtime, calling Provider/model services, running Cost Calibration,
  deploying staging/prod/cloud resources, touching payment/external services, PR, force push, or final MVP pass.

## Execution Steps

1. Use the inventory evidence to list every mandatory row and boundary row.
2. Decide the recommended handling for each row.
3. Separate "next low-risk supplement" from "later L5/L6 runtime proof".
4. Write decision evidence and self-review.
5. Update `project-state.yaml` and `task-queue.yaml`.
6. Run docs/static validation and record the results.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-fixture-gap-decision-2026-06-23`

## Validation Result

All planned docs/static validation commands passed after evidence and state updates.
