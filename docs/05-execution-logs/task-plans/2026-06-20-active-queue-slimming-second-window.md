# Active Queue Slimming Second Window

## Task

- Task id: `active-queue-slimming-2026-06-20-second-window`
- Branch: `codex/active-queue-slimming-second-window`
- Scope: docs/state-only queue archival maintenance
- User approval: "批准继续进行下一批归档任务。"

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Local Baseline

- `git status --short --branch`: clean on `master...origin/master` before branch creation.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- `Get-TikuNextAction.ps1`: `recommendedAction: idle_no_pending_task`.
- `Get-TikuProjectStatus.ps1`: `queueSlimmingDecision: slimming_candidates`, `archiveCandidateCount: 217`.

## Exact Archive Batch

Archive the next five diagnostic archive candidates only:

1. `l123-docs-state-packet-limit-governance-sync`
2. `ap-11-source-governance-change-control-fresh-approval-required`
3. `mechanism-l123-acceleration-governance-and-readiness-classifier`
4. `ap-10-current-checkpoint-audit-repair-l1-fresh-approval-required`
5. `ap-05-standard-org-self-service-scope-change-user-choice-required`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-20-active-queue-slimming-second-window.md`
- `docs/05-execution-logs/evidence/2026-06-20-active-queue-slimming-second-window.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-active-queue-slimming-second-window.md`

## Hard Blocks

No source, tests, e2e, DB, env/secret, provider/model, schema/migration, dependency/package/lockfile, staging/prod/cloud/deploy, payment, OCR, export, external-service, Cost Calibration Gate, PR, force push, destructive DB, or sensitive evidence work.

## Implementation Plan

1. Create this docs-only task plan.
2. Add this archive task to the active queue as closed after validation metadata is recorded.
3. Move the exact five closed task entries from active queue to `task-queue-archive-2026-06.yaml`.
4. Add matching `task-history-index.yaml` entries.
5. Update `project-state.yaml` current task and queue slimming summary.
6. Write evidence and audit review.
7. Run scoped formatting and required local gates.
8. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and delete the merged branch.

## Risk Controls

- Preserve archived task bodies without semantic edits.
- Keep all non-terminal blocked tasks in active queue.
- Verify moved ids are absent from active queue and present in archive and history index.
- Stop if validation requires source/test/e2e repair or any high-risk execution.
