# Detail Security Next Approval Decision Package Task Plan

## Task

- Task id: `detail-security-next-approval-decision-package-2026-06-29`
- Branch: `codex/next-approval-decision-package-20260629`
- Source story: active thread goal continuation after the blocked remainder consolidation.
- Target closure item: define next-stage fresh approval decision units without unblocking or executing blocked work.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/**`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest task plan/evidence/audit/acceptance package for
  `detail-security-blocked-remainder-consolidation-2026-06-29`

## Authorization And Scope

This is a docs/state-only governance decision package. It may update only state, queue, traceability, task plan,
evidence, audit review, and acceptance files for this task.

This task does not grant fresh approval by itself. It records the exact approval units that a future human decision can
approve or keep blocked.

## Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-detail-security-next-approval-decision-package.md`
- `docs/05-execution-logs/task-plans/2026-06-29-detail-security-next-approval-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-security-next-approval-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-detail-security-next-approval-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-06-29-detail-security-next-approval-decision-package.md`

## Blocked Files And Actions

- No source, test, e2e, script, package, lockfile, schema, migration, seed, runtime config, or environment file changes.
- No dependency install/update/remove/audit-fix.
- No DB connection, raw row read, mutation, migration, seed, or `drizzle-kit push`.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI input/output, or Cost Calibration.
- No browser runtime, dev server, raw DOM, screenshots, traces, videos, HTML reports, or e2e execution.
- No staging/prod/cloud/deploy, release readiness, final Pass, PR, or force-push.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, env values, secrets, or connection
  strings in evidence.

## Plan

1. Materialize this docs/state-only decision package in state, queue, and this task plan.
2. Read the closed blocked remainder package and current queue.
3. Define minimal fresh approval units by blocker class, task IDs, priority, severity, and prohibited carry-over items.
4. Record recommended sequencing without approving or executing any blocked task.
5. Write traceability, evidence, audit, and acceptance docs.
6. Run scoped formatting, diff checks, and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch if validation passes.

## Planned Validation

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/task-plans/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/evidence/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/acceptance/2026-06-29-detail-security-next-approval-decision-package.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/task-plans/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/evidence/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-29-detail-security-next-approval-decision-package.md docs/05-execution-logs/acceptance/2026-06-29-detail-security-next-approval-decision-package.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml package-lock.yaml package-lock.json src tests e2e drizzle migrations seed scripts playwright-report test-results .next
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId detail-security-next-approval-decision-package-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId detail-security-next-approval-decision-package-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId detail-security-next-approval-decision-package-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved for this
docs/state-only task after validation passes. Blocked runtime, DB, Provider, dependency, staging, release, final, and
Cost Calibration gates remain blocked.

## Initial Status

- Status: `in_progress_materialized`.
- Fresh approval granted by this package: false.
- Source/test/runtime/dependency/DB/Provider/release/Cost Calibration work: blocked.
