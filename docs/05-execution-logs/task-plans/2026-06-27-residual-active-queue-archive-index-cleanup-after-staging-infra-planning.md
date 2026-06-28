# Residual Active Queue Archive Index Cleanup After Staging Infra Planning

## Task

- Task id: `residual-active-queue-archive-index-cleanup-after-staging-infra-planning-2026-06-27`
- Branch: `codex/residual-archive-cleanup-staging-infra-20260627`
- Approval source: current user fresh approval for docs/state-only residual active queue archive/index cleanup after staging infrastructure planning.
- Scope: move only mechanism-diagnostic archive candidates and update the active queue, archive file, task history index, task plan, evidence, audit, acceptance, and project state.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack.md`
- `docs/02-architecture/adr/adr-002-runtime-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web.md`
- `docs/02-architecture/adr/adr-004-environment-isolation.md`
- `docs/02-architecture/adr/adr-005-staging-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Mechanism Diagnostic Source

Pre-task `Get-TikuProjectStatus.ps1` on `master` reported:

- `nextActionDecision: no_pending_task`
- `activeQueueNonTerminalCount: 3`
- `archiveCandidateCount: 2`
- `highRiskRepairBlockedCount: 0`
- first archive candidates:
  - `three-layer-goal-completion-blocker-triage-and-next-task-reseed-2026-06-27`
  - `residual-active-queue-archive-index-cleanup-after-staging-target-reseed-2026-06-27`

Only these two diagnostic candidates are eligible for movement in this task.

## Implementation Plan

1. Register the current cleanup task in `task-queue.yaml` with explicit allowed files, blocked files, caps, redaction rules, validation commands, and closeout policy.
2. Move exactly the two diagnostic candidate task blocks from active `task-queue.yaml` to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
3. Increment the archive metadata task count and update archive metadata to this task id.
4. Add lightweight lookup entries for both moved tasks to `docs/04-agent-system/state/task-history-index.yaml`.
5. Update `project-state.yaml` `currentTask` with the docs-only archive/index movement result and keep runtime gates blocked.
6. Write redacted evidence, audit review, and acceptance docs.

## Caps

- `maxDiagnosticTaskBlockMoves`: 2
- `maxTaskHistoryIndexUpdates`: 2
- `unregisteredTaskMoves`: 0
- `runtimeMutationsByThisTask`: 0
- `providerCallsByThisTask`: 0
- `costCalibrationExecutionsByThisTask`: 0
- `dbConnectionsByThisTask`: 0
- `browserRunsByThisTask`: 0
- `stagingProdDeployPaymentExternalServiceOcrExportExecutions`: 0
- `releaseReadinessClaims`: 0
- `finalPassClaims`: 0

## Redaction

Evidence may record task ids, moved task count, index update count, diagnostic counts, pass/fail/blocked, cap status, redaction status, and forbidden-action checklist.

Evidence must not record `.env*` content, secrets, tokens, DB URLs, Provider credentials, Authorization headers, raw prompts, raw responses, Provider payloads, raw generated AI content, full paper/material content, DB rows, SQL output, screenshots, traces, cookies, or localStorage.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md docs/05-execution-logs/evidence/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md docs/05-execution-logs/acceptance/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md docs/05-execution-logs/evidence/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md docs/05-execution-logs/acceptance/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-infra-planning.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId residual-active-queue-archive-index-cleanup-after-staging-infra-planning-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId residual-active-queue-archive-index-cleanup-after-staging-infra-planning-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId residual-active-queue-archive-index-cleanup-after-staging-infra-planning-2026-06-27 -SkipRemoteAheadCheck
```

## Stop Conditions

- A candidate outside the diagnostic list would need to be moved.
- A runtime, source, test, schema, migration, seed, package, lockfile, `.env*`, DB, Provider, Cost Calibration, browser/e2e, staging/prod/deploy/payment/OCR/export, PR, force push, release readiness, or final Pass action becomes necessary.
- Validation fails and cannot be repaired within this docs/state-only scope.
