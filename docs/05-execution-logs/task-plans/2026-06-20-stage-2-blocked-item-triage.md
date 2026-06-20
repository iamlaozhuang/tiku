# Stage 2 Blocked Item Triage Plan

## Task

- Task id: `stage-2-blocked-item-triage-2026-06-20`
- Branch: `codex/stage-2-blocked-item-triage`
- User approval: user fresh-approved stage 1 FF merge/push/cleanup, then requested stage 2 blocked item triage from `master`.
- Scope: docs/state-only blocked item classification and next-action routing, plus minimal entry-hygiene archival of the
  prior closed stage 1 task exposed as the only queue slimming candidate after merge.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Baseline

- Stage 1 queue health baseline was fast-forward merged into `master`, pushed to `origin/master`, and the local short branch was deleted.
- New stage 2 branch: `codex/stage-2-blocked-item-triage`.
- `Get-TikuProjectStatus.ps1` reports `archiveCandidateCount: 0`.
- Active queue non-terminal count: `23`.
- Blocked-class inventory: `blocked: 16`, `blocked_validation_failure: 4`.
- Pending executable tasks: `batch-213`, `batch-214`, and `batch-215`; these are not stage 2 blocked triage targets.

## Implementation Plan

1. Register a scoped stage 2 docs/state task in `task-queue.yaml`.
2. Archive `stage-1-queue-health-baseline-2026-06-20` as entry hygiene if local diagnostics expose it as the only queue
   slimming candidate after merge.
3. Create `docs/04-agent-system/state/blocked-item-triage-2026-06-20.yaml`.
4. Classify every active queue `blocked` or `blocked_validation_failure` item under one primary category:
   - `fresh approval required`
   - `exact_scope required`
   - `blocked_validation_failure`
   - `high-risk gated`
   - `product choice required`
5. For each blocked item, record the next step as one of: approval, fix, abandon, defer, or wait external.
6. Update `project-state.yaml` current task and stage 2 summary.
7. Write evidence and audit review.
8. Run scoped formatting and governance validation.
9. Commit locally and stop before stage 2 merge/push/cleanup unless a later fresh approval is given.

## Risk Controls

- Do not change blocked task semantics or unblock any task.
- Do not execute provider, env, schema, deploy, payment, OCR, export, Cost Calibration Gate, or external-service work.
- Do not modify source, tests, e2e, scripts, package/lockfiles, schema, migrations, or env files.
- Do not claim pending implementation tasks or start `batch-213`.
- Keep the output as a decision surface only.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/blocked-item-triage-2026-06-20.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-20-stage-2-blocked-item-triage.md docs/05-execution-logs/evidence/2026-06-20-stage-2-blocked-item-triage.md docs/05-execution-logs/audits-reviews/2026-06-20-stage-2-blocked-item-triage.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/blocked-item-triage-2026-06-20.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-20-stage-2-blocked-item-triage.md docs/05-execution-logs/evidence/2026-06-20-stage-2-blocked-item-triage.md docs/05-execution-logs/audits-reviews/2026-06-20-stage-2-blocked-item-triage.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-2-blocked-item-triage-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId stage-2-blocked-item-triage-2026-06-20`
