# Task Plan: fix-project-state-sha-sync-after-batch-122

## Scope

- Task id: `fix-project-state-sha-sync-after-batch-122`
- Branch: `codex/fix-project-state-sha-sync-after-batch-122`
- Task kind: docs/state governance repair
- Goal: synchronize `project-state.yaml` repository checkpoint and handoff metadata with the already pushed
  post-batch-122 master baseline.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent evidence and audit logs for batch-121 and batch-122

## Baseline

- Starting branch: `master`
- Working tree: clean
- Local `HEAD`: `b6f81531c5136f6785062a1b1d8c56ffa923aca6`
- `origin/master`: `b6f81531c5136f6785062a1b1d8c56ffa923aca6`
- `project-state.yaml` still records older accepted ancestor checkpoints:
  - `lastKnownMasterSha`: `231e9ef976c4c5ce57e5c4d9a204f02dad0cd976`
  - `lastKnownOriginMasterSha`: `03f1e5e21bb9478aff0cc92dfe4ed034123c13d6`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-fix-project-state-sha-sync-after-batch-122.md`
- `docs/05-execution-logs/evidence/2026-06-12-fix-project-state-sha-sync-after-batch-122.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-fix-project-state-sha-sync-after-batch-122.md`

## Blocked Files And Actions

- No `src/**`, `tests/**`, `e2e/**`, schema, migration, dependency, package, lockfile, env, secret, provider, deploy,
  payment, external-service, PR, force-push, or Cost Calibration Gate work.
- No product behavior changes.
- No raw AI content handling or provider calls.

## Implementation Approach

1. Register this task in `task-queue.yaml` as a closed docs/state governance repair with explicit closeout policy.
2. Update `project-state.yaml` to mark this governance repair as the latest current task.
3. Set repository checkpoints to the accepted ancestor baseline observed before this repair branch:
   `b6f81531c5136f6785062a1b1d8c56ffa923aca6`.
4. Preserve the `accepted_ancestor_checkpoint` SHA semantics; the final repair commit SHA will be reported in evidence
   and the final response instead of attempting self-referential state.
5. Write redacted evidence and an audit review.

## Validation Plan

- `git status --short --branch`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-project-state-sha-sync-after-batch-122`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-project-state-sha-sync-after-batch-122`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-project-state-sha-sync-after-batch-122`

## Risk Controls

- Keep the repair docs/state-only.
- Use allowed-file gates to catch accidental product/code changes.
- Record that package/lock/schema/env/provider/deploy/payment/external-service and Cost Calibration Gate remain blocked.
- Fast-forward merge only after validation passes.
