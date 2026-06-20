# Stage 1 Queue Health Baseline Plan

## Task

- Task id: `stage-1-queue-health-baseline-2026-06-20`
- Branch: `codex/stage-1-queue-health-baseline`
- User approval: user approved batch-212 merge/push/cleanup, then requested entry into stage 1 queue health baseline.
- Scope: docs/state-only active queue baseline maintenance.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`

## Baseline

- `master` and `origin/master` were synchronized at `c959985d160dcc039acf931fc05b9acbf84ecbf7` after batch-212 push.
- The merged short branch `codex/batch-212-ai-task-provider-lifecycle` was deleted locally.
- `Get-TikuProjectStatus.ps1` reported `archiveCandidateCount: 4`.
- `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` reported `archiveCandidateCount: 4`, `selfRepairCandidateCount: 0`, and `highRiskRepairBlockedCount: 22`.
- First archive candidates:
  - `active-queue-slimming-2026-06-20-batch-08`
  - `standard-core-student-experience-closure-readiness-audit`
  - `admin-content-ops-local-experience-packet`
  - `personal-learning-ai-local-experience-packet`

## Implementation Plan

1. Register a scoped stage 1 docs/state task in `task-queue.yaml`.
2. Move the 4 terminal archive candidates from active queue to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
3. Add corresponding `task-history-index.yaml` entries so archived dependencies remain resolvable.
4. Update `project-state.yaml` current task and stage 1 summary.
5. Record evidence and audit for the baseline pass.
6. Run scoped formatting and local governance gates.
7. Commit locally and stop before merge/push/cleanup unless a later fresh approval is given.

## Risk Controls

- Do not execute archived task business actions.
- Do not alter blocked task semantics or unblock high-risk gates.
- Do not modify source, tests, e2e, scripts, package/lockfiles, env files, schema, migrations, DB, provider/model, deploy, payment, OCR, export, external-service, PR, force-push, destructive DB, or Cost Calibration Gate scope.
- Preserve archived task blocks semantically; only move them from active queue to archive.
- Treat stage 2 blocked triage as a follow-up route, not part of this archive commit.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-20-stage-1-queue-health-baseline.md docs/05-execution-logs/evidence/2026-06-20-stage-1-queue-health-baseline.md docs/05-execution-logs/audits-reviews/2026-06-20-stage-1-queue-health-baseline.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-20-stage-1-queue-health-baseline.md docs/05-execution-logs/evidence/2026-06-20-stage-1-queue-health-baseline.md docs/05-execution-logs/audits-reviews/2026-06-20-stage-1-queue-health-baseline.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-1-queue-health-baseline-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId stage-1-queue-health-baseline-2026-06-20`
