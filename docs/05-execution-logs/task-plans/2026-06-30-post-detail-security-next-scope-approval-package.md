# Post Detail Security Next Scope Approval Package Task Plan

## Task

- Task id: `post-detail-security-next-scope-approval-package-2026-06-30`
- Branch: `codex/post-detail-security-next-scope-approval-package-20260630`
- Goal: prepare a docs/state-only next-scope approval package after the local detail optimization and security review
  closeout, mapping future work into local-only follow-ups, fresh approval requirements, and still-blocked gates.
- Non-goals: no source/test/package edits, no DB connection or mutation, no schema/migration/seed, no Provider/AI call
  or configuration, no env/secret/credential access, no browser/e2e/dev server, no staging/prod/cloud/deploy, no release
  readiness, no final Pass, no Cost Calibration, no PR, and no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest detail/security closeout task plan, evidence, audit review, and acceptance records.

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-post-detail-security-next-scope-approval-package.md`
- `docs/05-execution-logs/task-plans/2026-06-30-post-detail-security-next-scope-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-30-post-detail-security-next-scope-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-post-detail-security-next-scope-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-30-post-detail-security-next-scope-approval-package.md`

## Boundaries

- Source/test/package: blocked.
- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshots, no traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage, or
  Authorization headers.
- Release: no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration.
- Dependencies: no package or lockfile change, no install/update/remove/audit-fix, and no registry lookup.
- Evidence: task IDs, statuses, counts, file paths, scope categories, validation commands, commit/branch/merge/push and
  cleanup summaries only.

## Approval Package Shape

The package will classify next-stage work as:

- `local_only`: safe follow-ups that can remain docs/state/source-read-only or later task-scoped low-risk local work.
- `fresh_approval_required`: runtime, DB, Provider, deployment, dependency, or decision gates that need a new explicit
  approval package before execution.
- `still_blocked`: actions that remain blocked under the current task and must not be inferred from prior approvals.

## Execution Plan

1. Confirm this task is materialized in state, queue, and task plan.
2. Produce traceability, evidence, audit review, and acceptance for the approval package only.
3. Record the next smallest recommended task without executing it.
4. Run declared validation, then commit, fast-forward merge, push, and cleanup if validation passes.

## Validation Commands

```powershell
rg -n "post-detail-security-next-scope-approval-package-2026-06-30|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/acceptance/2026-06-30-post-detail-security-next-scope-approval-package.md
rg -n "fresh_approval_required|still_blocked|local_only|no_runtime_execution|noRuntimeExecution: true" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-post-detail-security-next-scope-approval-package.md
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/task-plans/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/evidence/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/acceptance/2026-06-30-post-detail-security-next-scope-approval-package.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/task-plans/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/evidence/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-30-post-detail-security-next-scope-approval-package.md docs/05-execution-logs/acceptance/2026-06-30-post-detail-security-next-scope-approval-package.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId post-detail-security-next-scope-approval-package-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId post-detail-security-next-scope-approval-package-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId post-detail-security-next-scope-approval-package-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by `current_user_message_approved_execution_2026_06_30`.

This is not release readiness, not a final Pass, and not Cost Calibration.
