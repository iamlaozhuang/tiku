# Full Acceptance Remaining Coverage Audit Plan

- Task id: `full-acceptance-remaining-coverage-audit-2026-06-29`
- Branch: `codex/full-acceptance-coverage-audit-20260629`
- Status: claimed
- Date: `2026-06-29`

## Goal

Reconcile existing redacted full-acceptance evidence against the mandatory owner-facing checklist, identify remaining
unproven workflow rows, and seed the next executable local acceptance task.

## Authorization

This task consumes the active durable goal and inherited per-task local closeout approval. It does not consume Stage A
or Stage B runtime approval because it performs no browser, account, or mutation work.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ai-generation-detail-role-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-content-admin-formal-content-readonly.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-db-alignment-repair.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Execution Steps

1. Classify existing redacted evidence as pass, blocked, partial, or still-unproven for each mandatory role group.
2. Preserve the full unit baseline as current-green precondition.
3. Record remaining coverage classes without raw sensitive evidence.
4. Seed the next narrow executable task for the first remaining checklist row.
5. Run scoped Prettier, diff, and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and clean up the short branch.

## Blocked

- Browser, dev server, e2e, DB, account fixture reads, AI Provider, source/test/dependency/schema/migration/seed,
  staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-remaining-coverage-audit.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-remaining-coverage-audit.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-remaining-coverage-audit.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-remaining-coverage-audit.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-remaining-coverage-audit.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-remaining-coverage-audit-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-remaining-coverage-audit-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-remaining-coverage-audit-2026-06-29 -SkipRemoteAheadCheck`
