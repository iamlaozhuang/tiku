# Active Queue Slimming First Window

## Task

- Task id: `active-queue-slimming-2026-06-20-first-window`
- Branch: `codex/active-queue-slimming-first-window`
- Scope: docs/state-only queue archival maintenance
- User instruction: explain `idle_no_pending_task`, then continue safe local docs/state advancement.

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
- `Get-TikuProjectStatus.ps1`: `queueSlimmingDecision: slimming_candidates`, `archiveCandidateCount: 221`, `projectStatusSafeToProceed: false` for executable task selection.

## Exact Archive Batch

Archive the first five diagnostic archive candidates only:

1. `queue-matrix-drift-readonly-audit`
2. `manual_fresh_approval_required_before_any_ap08_org_data_export_execution`
3. `manual_fresh_approval_required_before_any_ap07_ocr_auto_import_execution`
4. `manual_fresh_approval_required_before_any_ap06_online_payment_execution`
5. `manual_fresh_approval_required_before_any_ap03_provider_staging_execution`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-20-active-queue-slimming-first-window.md`
- `docs/05-execution-logs/evidence/2026-06-20-active-queue-slimming-first-window.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-active-queue-slimming-first-window.md`

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
- Keep active queue recovery context by retaining the current L123 packet-limit task and all non-terminal blocked tasks.
- Verify moved ids are absent from active queue and present in archive and history index.
- Stop if validation requires source/test/e2e repair or any high-risk execution.
