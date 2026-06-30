# Detail Optimization Security Review Goal Closeout Rollup Task Plan

## Task

- Task id: `detail-optimization-security-review-goal-closeout-rollup-2026-06-30`
- Branch: `codex/detail-security-goal-closeout-rollup-20260630`
- Goal: close the local detail optimization and security review goal with a docs/state rollup, preserving all release,
  final Pass, and Cost Calibration prohibitions.
- Non-goals: no source/test/package edits, no DB connection or mutation, no schema/migration/seed, no Provider/AI call
  or configuration, no env/secret/credential access, no browser/e2e/dev server, no staging/prod/cloud/deploy, no release
  readiness, no final Pass, no Cost Calibration, no PR, and no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest detail optimization, security review, evidence, audit, acceptance, and task-plan files for the current goal.

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md`
- `docs/05-execution-logs/task-plans/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md`

## Boundaries

- Source/test/package: blocked.
- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshots, no traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage, or
  Authorization headers.
- Release: no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration.
- Evidence: task IDs, statuses, counts, file paths, validation commands, commit/branch/merge/push/cleanup summaries only.

## Execution Plan

1. Confirm this task is materialized in state, queue, and task plan.
2. Summarize completed inventory, review, repair split, and local repair tasks.
3. Record blocked high-risk remainder without executing blocked gates.
4. Produce traceability, evidence, audit review, and acceptance.
5. Run declared validation, then commit, fast-forward merge, push, and cleanup if validation passes.

## Validation Commands

```powershell
rg -n "detail-optimization-security-review-goal-closeout-rollup-2026-06-30|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/acceptance/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md
rg -n "closed_pnpm_package_manager_metadata_remediated|closed_no_current_actionable_repair_confirmed|pass_root_entry_token_hover_and_active_feedback_repaired|pass_no_current_actionable_coverage_gap_confirmed" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/task-plans/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/evidence/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/audits-reviews/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/acceptance/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/task-plans/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/evidence/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/audits-reviews/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md docs/05-execution-logs/acceptance/2026-06-30-detail-optimization-security-review-goal-closeout-rollup.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId detail-optimization-security-review-goal-closeout-rollup-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId detail-optimization-security-review-goal-closeout-rollup-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId detail-optimization-security-review-goal-closeout-rollup-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by the initial current-goal docs/state closeout authorization.

This is not release readiness, not a final Pass, and not Cost Calibration.
