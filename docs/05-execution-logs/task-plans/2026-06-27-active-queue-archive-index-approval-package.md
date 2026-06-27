# Active Queue Archive Index Approval Package Plan

Task id: `active-queue-archive-index-approval-package-2026-06-27`

Branch: `codex/active-queue-archive-approval-20260627`

Task kind: `docs_state_approval_package`

moduleRunVersion: 2

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`

## Evidence-Only Sources

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Requirement Decision Map

- The goal requires continued movement toward three-layer closure and cleanup of related high-risk packages.
- The active queue has no executable pending task, while the local PostgreSQL route smoke execution remains blocked until fresh approval.
- Queue archival is maintenance, not product acceptance. It may reduce active queue noise only after a separate archive/index movement approval.
- Cost Calibration Gate remains blocked.

## Conflict Check

No conflict was found between the requirement and mechanism sources. The mechanism allows preparing a docs/state-only
approval package under the docs fast lane, but `task-queue-archival-and-index-governance.md` explicitly requires fresh
approval before moving active queue entries to archive files or updating `task-history-index.yaml`.

## Allowed Scope

- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create this task plan.
- Create evidence, audit review, and acceptance documents under `docs/05-execution-logs/`.
- Record the observed queue slimming diagnostic and a future copyable archive/index approval text.

## Blocked Scope

- No `docs/04-agent-system/state/archive/**` write.
- No `docs/04-agent-system/state/task-history-index.yaml` write.
- No source, tests, e2e, schema, migration, seed, dependency, package, lockfile, `.env*`, credential, browser, DB,
  Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, PR, force push, release readiness, or final
  Pass action.

## Implementation Plan

1. Create the docs/state-only task packet.
2. Record the observed queue diagnostic and exact future archive/index candidate set.
3. Update project state and task queue to close this approval package without moving archive/index files.
4. Run scoped formatting and mechanism gates.
5. Commit, ff-only merge to `master`, push `origin/master`, and delete the short branch if gates pass under the
   materialized docs/state closeout policy.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-active-queue-archive-index-approval-package.md docs/05-execution-logs/evidence/2026-06-27-active-queue-archive-index-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-active-queue-archive-index-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-active-queue-archive-index-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-active-queue-archive-index-approval-package.md docs/05-execution-logs/evidence/2026-06-27-active-queue-archive-index-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-active-queue-archive-index-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-active-queue-archive-index-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-archive-index-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId active-queue-archive-index-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId active-queue-archive-index-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any archive file or task history index edit becomes necessary.
- Any runtime, DB, browser, Provider, Cost Calibration, staging/prod, payment, external-service, PR, force push, release
  readiness, or final Pass action becomes necessary.
- The observed archive candidate set becomes ambiguous.
- Evidence would need to include sensitive values.
