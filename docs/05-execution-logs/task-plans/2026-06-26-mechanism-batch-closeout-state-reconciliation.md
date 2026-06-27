# Mechanism batch closeout state reconciliation task plan

Task id: `mechanism-batch-closeout-state-reconciliation-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md`

## Requirement Decision Map

- This is a docs/state closeout reconciliation task.
- `docs/01-requirements/00-index.md` is read only to confirm no product requirement is changed.
- The relevant mechanism rule is the closeout gate: completed merge, push, cleanup, final SHA, and task state must be recoverable from durable state or final handoff.
- Git reality before this task: `master`, `origin/master`, and `HEAD` are aligned at `d47db49e906442f2e857760bd02ab884e4c08066`; the predecessor short branch no longer exists.

## Requirement Mapping

This task maps to mechanism health only:

1. Mark `mechanism-batch-execution-package-and-smoke-runner-2026-06-26` closed in durable state and active queue.
2. Record the final master/origin SHA and cleanup facts.
3. Add a small closed reconciliation task packet with evidence and audit review.
4. Keep the next product step as an approval/boundary package, not implementation.

No product runtime behavior is claimed.

## Evidence-Only Sources

- The predecessor evidence and audit review are historical validation sources.
- `git log`, `git status`, and `git rev-parse` outputs are used as closeout fact sources.

## Conflict Check

No product requirement conflict exists. The only conflict is durable state drift: Git closeout is complete, while state and queue still say the predecessor task is `ready_for_closeout`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-mechanism-batch-closeout-state-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-06-26-mechanism-batch-closeout-state-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-mechanism-batch-closeout-state-reconciliation.md`

## Blocked Scope

- Product source, tests, route behavior, UI, schema, migration, package, lockfile, script, env/secret, Provider, DB, browser/e2e/dev-server, staging/prod, payment, external service, publish, student-visible content, deployment, release readiness, PR, force push, Cost Calibration Gate, and final Pass.

## Implementation Plan

1. Open `codex/mechanism-closeout-state-reconciliation-20260626`.
2. Add this plan, evidence, and audit review.
3. Update `project-state.yaml` and `task-queue.yaml` to record the predecessor task as closed.
4. Record the next recommended task as an AI generation product boundary execution package approval.
5. Run scoped Prettier write/check, `git diff --check`, Module Run v2 precommit hardening, project status diagnostic, and pre-push readiness.
6. Commit, ff-only merge to `master`, push `origin/master`, and delete the short branch.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-mechanism-batch-closeout-state-reconciliation.md docs/05-execution-logs/evidence/2026-06-26-mechanism-batch-closeout-state-reconciliation.md docs/05-execution-logs/audits-reviews/2026-06-26-mechanism-batch-closeout-state-reconciliation.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-mechanism-batch-closeout-state-reconciliation.md docs/05-execution-logs/evidence/2026-06-26-mechanism-batch-closeout-state-reconciliation.md docs/05-execution-logs/audits-reviews/2026-06-26-mechanism-batch-closeout-state-reconciliation.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-batch-closeout-state-reconciliation-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId mechanism-batch-closeout-state-reconciliation-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any file outside allowed scope needs edits.
- Any command would require product runtime, DB, Provider, env/secret, browser/e2e/dev-server, staging/prod, payment, external service, publish, or deployment work.
- Evidence would need to record sensitive data or raw product content.
