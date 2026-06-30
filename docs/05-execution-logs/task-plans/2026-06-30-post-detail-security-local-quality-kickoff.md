# Post Detail Security Local Quality Kickoff Plan

- Task id: `post-detail-security-local-quality-kickoff-2026-06-30`
- Branch: `codex/post-detail-security-local-quality-kickoff-20260630`
- Mode: docs/state-only startup package and queue materialization.
- Base: current `master` aligned with `origin/master` at `00eeba2df`.
- Goal: materialize the next local-only serial workstream for regression coverage reinforcement, low-risk UI/UX detail optimization, and governance queue cleanup.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest detail/security completion audit task plan, evidence, audit review, and acceptance.
- Latest post-detail security next-scope approval package task plan, evidence, audit review, acceptance, and traceability.

## Authorization

- Approval source: `current_user_request_post_detail_security_local_quality_goal_2026_06_30`.
- Approved local closeout for each task after validation: local commit, fast-forward merge to `master`, push to `origin/master`, and delete the merged short branch.
- PR creation, force-push, deployment, release readiness, final Pass, and Cost Calibration remain blocked.

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-post-detail-security-local-quality-kickoff.md`
- `docs/05-execution-logs/evidence/2026-06-30-post-detail-security-local-quality-kickoff.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-post-detail-security-local-quality-kickoff.md`
- `docs/05-execution-logs/acceptance/2026-06-30-post-detail-security-local-quality-kickoff.md`

## Boundaries

- DB: no connection, no raw rows, no mutation, no schema, no migration, no seed, no `drizzle-kit push`.
- AI/Provider: no Provider call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshots, no traces.
- Accounts/credentials: no env, secrets, connection strings, registry tokens, private account credentials, cookies, tokens, sessions, localStorage, or Authorization headers.
- Evidence: only task ids, file paths, scope categories, statuses, counts, validation commands, branch/commit/merge/push/cleanup summaries, and redacted expected/observed summaries.
- Dependencies: no package or lockfile change, no dependency install/update/remove/audit-fix, no registry lookup.

## Batch Queue

1. Batch 0: `post-detail-security-local-quality-kickoff-2026-06-30`
2. Batch 1: `regression-coverage-gap-inventory-2026-06-30`, `provider-metadata-redaction-regression-reinforcement-2026-06-30`, `log-list-query-boundary-regression-reinforcement-2026-06-30`, `student-session-marker-regression-reinforcement-2026-06-30`
3. Batch 2: `ui-ux-static-detail-inventory-2026-06-30`, `ui-token-layout-small-repair-2026-06-30`, `ui-state-feedback-small-repair-2026-06-30`, `ui-form-action-consistency-small-repair-2026-06-30`
4. Batch 3: `governance-closed-task-archive-index-cleanup-2026-06-30`

## Execution Plan

1. Materialize the goal, authorization, boundaries, redaction rules, validation commands, and closeout policy in state, queue, and this plan.
2. Seed the four serial batches as queue tasks. Each future task must still create its own short branch, exact task plan, exact allowedFiles/blockedFiles, evidence, validation, commit, fast-forward merge, push, and branch cleanup.
3. Do not perform source, test, UI, DB, Provider, browser, dependency, release, final Pass, or Cost Calibration work in this kickoff.
4. Run scoped docs/state validation and Module Run v2 gates.

## Validation Commands

```powershell
rg -n "post-detail-security-local-quality-kickoff-2026-06-30|regression-coverage-gap-inventory-2026-06-30|ui-ux-static-detail-inventory-2026-06-30|governance-closed-task-archive-index-cleanup-2026-06-30|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-post-detail-security-local-quality-kickoff.md
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-post-detail-security-local-quality-kickoff.md docs/05-execution-logs/evidence/2026-06-30-post-detail-security-local-quality-kickoff.md docs/05-execution-logs/audits-reviews/2026-06-30-post-detail-security-local-quality-kickoff.md docs/05-execution-logs/acceptance/2026-06-30-post-detail-security-local-quality-kickoff.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-post-detail-security-local-quality-kickoff.md docs/05-execution-logs/evidence/2026-06-30-post-detail-security-local-quality-kickoff.md docs/05-execution-logs/audits-reviews/2026-06-30-post-detail-security-local-quality-kickoff.md docs/05-execution-logs/acceptance/2026-06-30-post-detail-security-local-quality-kickoff.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId post-detail-security-local-quality-kickoff-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId post-detail-security-local-quality-kickoff-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId post-detail-security-local-quality-kickoff-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

After declared validation passes, this task may be committed, fast-forward merged to `master`, pushed to `origin/master`, and cleaned up by deleting the merged short branch.

This task is not release readiness, not final Pass, and not Cost Calibration.
