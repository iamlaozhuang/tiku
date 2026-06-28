# Local Full Loop Active Queue Slimming After Post Provider Rollup Plan

## Task

- Task id: `local-full-loop-active-queue-slimming-after-post-provider-rollup-2026-06-28`
- Branch: `codex/local-full-loop-queue-slimming-20260628`
- Task kind: `docs_state_archive_index_cleanup`
- Approval: current user approved executing the recommended queue/state hygiene task with local commit, fast-forward
  merge to `master`, push to `origin/master`, and short-branch cleanup.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`

## Requirement Decision Map

| Source                     | Decision used                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Task queue archival SOP    | Closed historical tasks may move only through an approved docs-only archive/index task.                   |
| Active queue slimming plan | Keep non-terminal tasks, current recovery pointer, and a recent terminal recovery window in active queue. |
| Task lifecycle SOP         | Create task plan before substantive docs/state edits and run scoped validation before closeout.           |
| ADR-004/ADR-005            | No staging/prod/deploy, env/secret, Provider, migration, or release/final work is implied.                |

## Requirement Mapping

| Requirement                      | Plan                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Preserve historical traceability | Move exact terminal task blocks to the June archive and add history index entries.                         |
| Keep active recovery usable      | Keep current task and the terminal recovery window in `task-queue.yaml`; verify ProjectStatus afterwards.  |
| Reduce active queue noise        | Move the diagnostic archive candidates produced after post-Provider rollup.                                |
| Preserve blocked gates           | Keep Cost Calibration, release readiness, final Pass, Provider, env, DB/runtime, and deploy gates blocked. |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-post-provider-rollup-evidence.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-rollup-evidence.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Conflict Check

No conflict found. `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` reports terminal active-queue tasks exceed the recovery
window. The approved task is docs/state archive/index cleanup only, matching the archival SOP. No requirement source
authorizes runtime, Provider, DB, source/test, schema, dependency, staging/prod, payment/OCR/export, Cost Calibration,
release readiness, or final Pass work.

## Archive Scope

Move terminal historical tasks selected by the current queue slimming diagnostic after registering this task as the
current recovery pointer. Expected movement:

- Source: `docs/04-agent-system/state/task-queue.yaml`
- Target archive: `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- Target index: `docs/04-agent-system/state/task-history-index.yaml`
- Expected moved task count: 19
- Current task remains active and is not moved.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-active-queue-slimming-after-post-provider-rollup.md`
- `docs/05-execution-logs/task-plans/2026-06-28-local-full-loop-active-queue-slimming-after-post-provider-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-active-queue-slimming-after-post-provider-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-local-full-loop-active-queue-slimming-after-post-provider-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-28-local-full-loop-active-queue-slimming-after-post-provider-rollup.md`

## Blocked Scope

No source/test/e2e/script/package/lockfile/schema/migration/seed/DB/runtime/browser/dev-server/Provider/env/staging/prod/
deploy/payment/OCR/export/external-service/PR/force-push/Cost Calibration/release readiness/final Pass work.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-active-queue-slimming-after-post-provider-rollup-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-active-queue-slimming-after-post-provider-rollup-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if any moved task lacks evidence/audit metadata, a non-terminal dependency would become unresolvable, changed files
exceed allowed scope, validation fails after repair, or any blocked gate becomes necessary.
