# Acceptance Role Separated Account Coverage Review Plan

taskId: acceptance-role-separated-account-coverage-review-2026-06-23
status: closed
createdAt: "2026-06-23T06:44:49-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Purpose

Review the existing role-separated account coverage evidence and decide whether the blocker can close, must remain
blocked, or requires role-level owner exclusions. This task decides only the role-separated account blocker. It cannot
claim Standard MVP or Advanced MVP final Pass.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-fixture-gap-decision.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-test-fixture-supplement.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-test-fixture-runtime-run.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-runtime-walkthrough.md`

## Review Inputs

- Account inventory result: mandatory role rows ready for final blocker closure are 0 of 8.
- Gap decision result: fixture-first and seeded-runtime-second remain the approved sequencing; no mandatory row has a
  silent MVP exclusion.
- Test fixture supplement result: seven missing fixture rows are covered at the contract level; auditor is excluded from
  this supplement.
- Single-spec runtime result: the fixture contract passed in the approved single-spec runtime run.
- Browser walkthrough result: current local browser session provides only partial learner evidence; six mandatory rows
  remain unproven at runtime.

## Decision Rules

- A mandatory row can close only with role-specific allowed behavior and denied behavior evidence.
- Fixture-only evidence can improve contract confidence, but it cannot replace required real login/session evidence if
  owner acceptance requires runtime confidence.
- Any mandatory row without sufficient evidence must keep the blocker `Blocked` unless laozhuang records an explicit
  role-level MVP exclusion or acceptance variance.
- Provider, Cost Calibration, staging, production, payment, external services, env/secret access, account creation,
  database seed/write, schema migration, and final MVP pass remain outside this task.

## Validation Plan

- Record a decision document under `docs/05-execution-logs/acceptance/`.
- Record evidence and audit review documents.
- Update `project-state.yaml` and `task-queue.yaml` with the closed review result and next recommended task.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-coverage-review-2026-06-23`

## Validation Result

The review is closed as Blocked. The blocker remains open, and the next recommended task is to prepare the seeded local
account or owner exclusion scope approval package.
