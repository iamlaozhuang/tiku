# Active Queue Slimming Batch 08 Plan

## Task

- Task id: `active-queue-slimming-2026-06-20-batch-08`
- Branch: `codex/active-queue-slimming-batch-08`
- User approval: fresh user request to triage/register missing evidence for
  `standard-admin-ops-logs-local-full-flow-validation`, then continue docs/state-only active queue slimming batch 08.
- Scope: docs/state/log archival maintenance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/historical-evidence-debt.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-admin-content-ops-local-experience-packet.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-active-queue-slimming-batch-07.md`

## Baseline

- `git status --short --branch`: `## master...origin/master`
- `git rev-list --left-right --count master...origin/master`: `0 0`
- `Get-TikuProjectStatus.ps1`: `archiveCandidateCount: 6`
- `Get-TikuNextAction.ps1`: `missingHistoricalEvidence=1`, `unregisteredLegacyUnavailableEvidence=1`
- The missing task is closed, but its referenced evidence and audit files are absent locally.

## Implementation Plan

1. Register `standard-admin-ops-logs-local-full-flow-validation` in
   `docs/04-agent-system/state/historical-evidence-debt.yaml` as `registered_legacy_unavailable`.
2. Generate an exact archive manifest for remaining eligible archive candidates after registration, including the previous current recovery task exposed after the batch 08 pointer moves.
3. Move eligible terminal task blocks from `task-queue.yaml` to
   `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml` without semantic edits.
4. Update `task-history-index.yaml` entries for each moved id.
5. Add current batch 08 task metadata to active queue and update `project-state.yaml` with the batch summary.
6. Write evidence and audit review for batch 08.
7. Run scoped formatting and local gates before commit, then fast-forward merge to `master`, rerun master gates, push, and
   delete the merged short branch.

## Risk Controls

- Do not fabricate missing evidence or audit files.
- The historical debt register is provenance metadata only and must not satisfy runtime dependency evidence.
- Do not execute archived task business actions.
- Do not read or modify `.env*`.
- Do not modify source, tests, e2e specs, schema, migrations, package or lockfiles, scripts, deployment, provider/model,
  payment, OCR, export, external-service, PR, force-push, destructive DB, or Cost Calibration Gate scope.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `npx.cmd prettier --write --ignore-unknown <batch-08 changed docs/state/log files>`
- `npx.cmd prettier --check --ignore-unknown <batch-08 changed docs/state/log files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-slimming-2026-06-20-batch-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId active-queue-slimming-2026-06-20-batch-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId active-queue-slimming-2026-06-20-batch-08`
