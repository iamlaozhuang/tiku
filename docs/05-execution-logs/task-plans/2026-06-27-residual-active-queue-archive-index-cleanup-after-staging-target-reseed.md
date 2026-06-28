# Residual Active Queue Archive/Index Cleanup After Staging Target Reseed

## Task

- Task id: `residual-active-queue-archive-index-cleanup-after-staging-target-reseed-2026-06-27`
- Branch: `codex/residual-active-queue-archive-cleanup-20260627`
- Task kind: `docs_state_archive_index_cleanup`
- Approval source: current user fresh approval for docs/state-only residual active queue archive/index cleanup after staging target reseed.

## Read List

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
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `scripts/agent-system/Get-TikuProjectStatus.ps1` output

## Requirement And Decision Map

- Requirement SSOT: this is a governance cleanup task, not a product requirement implementation. The active requirement index was read only to confirm no product behavior is being changed.
- Relevant decisions:
  - ADR-004 and ADR-005 keep staging/prod/deploy/secret boundaries separate from docs-only state cleanup.
  - ADR-006 keeps Provider/env/package capabilities gated unless explicitly task-approved.
  - Task Queue Archival And Index Governance SOP authorizes the shape only; the current user approval authorizes this specific movement.
- Evidence-only sources: prior task evidence and audit records are used only to confirm terminal historical task eligibility.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md`
- `docs/05-execution-logs/evidence/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md`
- `docs/05-execution-logs/acceptance/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md`

Blocked files and actions:

- No `src/**`, `tests/**`, `e2e/**`, schema, migration, seed, package, lockfile, or `.env*` changes.
- No browser, dev server, e2e, DB, Provider, Cost Calibration, staging/prod/deploy/payment/OCR/export execution.
- No PR, force push, release readiness, or final Pass claim.

## Candidate List

Only mechanism-diagnostic archive candidates may be moved:

- `active-queue-archive-index-apply-after-layer-2-postgres-package-2026-06-27`
- `three-layer-acceptance-final-evidence-review-2026-06-27`
- `active-queue-archive-index-approval-package-2026-06-27`
- `active-queue-nonterminal-closeout-triage-approval-package-2026-06-27`
- Second-pass diagnostic after this task became `currentTask`:
  `layer-3-staging-target-materialization-and-next-task-reseed-2026-06-27`

Retained blocked/nonterminal tasks:

- `layer-3-staging-pre-release-redacted-execution-after-target-materialization-2026-06-27`
- `organization-analytics-local-browser-smoke-validation-approval-2026-06-27`
- `acceptance-l5-standard-role-flow-run-2026-06-23`

## Approach

1. Register this task in `task-queue.yaml` with concrete `allowedFiles`, `blockedFiles`, caps, redaction, validation commands, and closeout policy.
2. Move exactly the four diagnostic candidates from `task-queue.yaml` to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml` without semantic edits to the task bodies.
3. Add four lookup entries to `task-history-index.yaml`.
4. Update `project-state.yaml` with the current task, movement counts, and blocked residual gates.
5. Write redacted evidence, audit review, and acceptance records.

## Caps

- Max task blocks moved: 5
- Max task-history-index entries added: 5
- Runtime calls/mutations: 0
- Provider calls: 0
- DB connections: 0
- Browser/e2e runs: 0
- Cost Calibration executions: 0
- Unregistered task moves: 0

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md docs/05-execution-logs/evidence/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md docs/05-execution-logs/audits-reviews/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md docs/05-execution-logs/acceptance/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md docs/05-execution-logs/evidence/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md docs/05-execution-logs/audits-reviews/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md docs/05-execution-logs/acceptance/2026-06-27-residual-active-queue-archive-index-cleanup-after-staging-target-reseed.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId residual-active-queue-archive-index-cleanup-after-staging-target-reseed-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId residual-active-queue-archive-index-cleanup-after-staging-target-reseed-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId residual-active-queue-archive-index-cleanup-after-staging-target-reseed-2026-06-27 -SkipRemoteAheadCheck
```

## Stop Conditions

- Any candidate id is absent, ambiguous, nonterminal, or already indexed in a conflicting way.
- Evidence or audit path required by the candidate is absent.
- A move would affect any task outside the four diagnostic candidates.
- Any changed file exceeds the approved docs/state/archive/index/evidence scope.
- A gate requires browser, DB, Provider, Cost Calibration, staging/prod, payment, external service, `.env*`, source, test, package, lockfile, PR, force push, release readiness, or final Pass work.
