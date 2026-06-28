# Archive Staging Infrastructure Readiness Planning

## Task

- Task id: `archive-staging-infrastructure-readiness-planning-2026-06-27`
- Branch: `codex/archive-staging-infra-readiness-20260627`
- Task kind: `docs_state_archive_index_cleanup`
- Approval source: current user approval to move remaining `staging-infrastructure-readiness-planning-2026-06-27`, follow mechanism governance, then commit, ff-only merge, push, and cleanup.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`

## Diagnostic Source

Pre-task `Get-TikuProjectStatus.ps1` on `master` reported:

- `nextActionDecision: no_pending_task`
- `activeQueueNonTerminalCount: 3`
- `archiveCandidateCount: 1`
- `highRiskRepairBlockedCount: 0`
- `firstArchiveCandidates: staging-infrastructure-readiness-planning-2026-06-27`

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- This task's task plan, evidence, audit review, and acceptance docs.

## Blocked Scope

- Source, tests, e2e, schema, migration, seed, package, lockfile, `.env*`.
- Browser, dev-server, e2e.
- DB connection/read/write/migration/seed/destructive action.
- Provider call/configuration, Provider credential handling, Cost Calibration.
- Cloud purchase, cloud dashboard login, staging/prod/deploy/payment/OCR/export/external-service execution.
- PR, force push, release readiness, final Pass.

## Plan

1. Register this archive/index cleanup task in the active queue with concrete allowed files, blocked files, caps, validation commands, redaction, and closeout policy.
2. Move exactly `staging-infrastructure-readiness-planning-2026-06-27` from active queue to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
3. Increment archive metadata task count from `1224` to `1225` and update archive metadata to this task.
4. Add one lookup entry to `docs/04-agent-system/state/task-history-index.yaml`.
5. Update `project-state.yaml` to record this docs/state-only cleanup and the remaining blocked gates.
6. Write evidence, audit review, and acceptance.
7. Run scoped formatting, diff, queue diagnostic, project status, and ModuleRunV2 closeout gates.
8. Commit, ff-only merge to `master`, run master gates, push `origin/master`, and delete the merged short branch.

## Caps

- `maxDiagnosticTaskBlockMoves`: 1
- `maxTaskHistoryIndexUpdates`: 1
- `unregisteredTaskMoves`: 0
- Runtime, DB, Provider, Cost Calibration, browser, staging/prod/deploy/payment/OCR/export executions: 0
- Release readiness claims: 0
- Final Pass claims: 0

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-27-archive-staging-infrastructure-readiness-planning.md docs/05-execution-logs/evidence/2026-06-27-archive-staging-infrastructure-readiness-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-archive-staging-infrastructure-readiness-planning.md docs/05-execution-logs/acceptance/2026-06-27-archive-staging-infrastructure-readiness-planning.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-27-archive-staging-infrastructure-readiness-planning.md docs/05-execution-logs/evidence/2026-06-27-archive-staging-infrastructure-readiness-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-archive-staging-infrastructure-readiness-planning.md docs/05-execution-logs/acceptance/2026-06-27-archive-staging-infrastructure-readiness-planning.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId archive-staging-infrastructure-readiness-planning-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId archive-staging-infrastructure-readiness-planning-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId archive-staging-infrastructure-readiness-planning-2026-06-27 -SkipRemoteAheadCheck
```

## Stop Conditions

- More than one active queue task would need movement.
- The candidate is already archived or already indexed.
- An active non-terminal task would lose a recoverable dependency without an index entry.
- Any blocked runtime, source, DB, Provider, Cost Calibration, staging/prod/deploy/payment/OCR/export, PR, force push, release readiness, or final Pass action becomes necessary.
