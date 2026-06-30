# Security Local Automation Session Storage Boundary Review Plan

- Task id: `security-local-automation-session-storage-boundary-review-2026-06-30`
- Branch: `codex/security-local-session-storage-review-20260630`
- Mode: local docs/state plus source-read-only security review.
- Result target: refresh the local automation session storage and Authorization construction boundary without runtime execution or source repair.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest local security static inventory task plan, evidence, audit review, and acceptance.
- Latest log list query filter boundary hardening task plan, evidence, audit review, and acceptance.
- `codex-security:security-scan` guidance for security-review discipline only; the exhaustive scan workflow is not executed because this task is a queue-scoped source-read-only review.

## Goal

Recheck the P2 local automation session storage boundary candidate identified by the static inventory. The review must
inspect only the listed owner files, confirm whether the localhost automation-only storage bridge and any Authorization
header construction are guarded by explicit local/test boundaries, and either close the candidate as no current
actionable repair or split a future minimal repair task. This task does not edit source or tests.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-security-local-automation-session-storage-boundary-review.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-local-automation-session-storage-boundary-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-local-automation-session-storage-boundary-review.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-local-automation-session-storage-boundary-review.md`

## Read-Only Source Scope

- `src/features/student/studentRuntimeApi.ts`
- `src/app/(auth)/login/page.tsx`
- `src/server/contracts/user-auth/session-boundary.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`

## Boundaries

- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider/AI call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshot, no trace.
- Credentials: no env, secrets, connection strings, registry tokens, account credentials, cookies, tokens, sessions,
  localStorage values, sessionStorage values, Authorization header values, or credential-bearing evidence.
- Dependencies: no `package.json`, lockfile, package manager, install, update, remove, registry lookup, audit fix, or
  lifecycle script change.
- Source/test: read-only only. If a repair is confirmed, split a future task with fresh exact allowedFiles before any edit.
- Release: no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.
- Evidence: record task ids, file paths, boundary categories, status counts, validation commands, and closeout summaries
  only. Do not record secrets, storage values, Authorization header values, raw DOM, screenshots, traces, DB rows, PII,
  Provider payloads, prompts, raw AI I/O, or full business content.

## Review Plan

1. Confirm the task is materialized in state, queue, and this plan before reading source owner files.
2. Inspect the read-only source scope for localStorage/sessionStorage use, cookie-backed marker handling, and
   Authorization header construction.
3. Check whether the reviewed logic is gated to localhost/test automation and avoids using client-controlled storage as
   a production authorization source.
4. Check tests for coverage of the local-only bridge and personal auth/session boundary without recording raw storage,
   cookie, token, or Authorization values.
5. Record a redacted review matrix. If no current actionable issue is confirmed, close as no-op review. If a repair is
   confirmed, split a future minimal source/test repair task and keep this task source-read-only.
6. Run docs/state formatting, diff checks, blocked-path diff, and Module Run v2 closeout gates.

## Validation Commands

```powershell
rg -n "security-local-automation-session-storage-boundary-review-2026-06-30|securityFollowupCentralApproval20260630|sourceReadOnly: true|noRuntimeExecution: true|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-local-automation-session-storage-boundary-review.md docs/05-execution-logs/acceptance/2026-06-30-security-local-automation-session-storage-boundary-review.md
rg -n "localStorage|sessionStorage|Authorization|cookie|studentRuntimeApi|session-boundary" src/features/student/studentRuntimeApi.ts src/app/(auth)/login/page.tsx src/server/contracts/user-auth/session-boundary.ts tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-local-automation-session-storage-boundary-review.md docs/05-execution-logs/evidence/2026-06-30-security-local-automation-session-storage-boundary-review.md docs/05-execution-logs/audits-reviews/2026-06-30-security-local-automation-session-storage-boundary-review.md docs/05-execution-logs/acceptance/2026-06-30-security-local-automation-session-storage-boundary-review.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-local-automation-session-storage-boundary-review.md docs/05-execution-logs/evidence/2026-06-30-security-local-automation-session-storage-boundary-review.md docs/05-execution-logs/audits-reviews/2026-06-30-security-local-automation-session-storage-boundary-review.md docs/05-execution-logs/acceptance/2026-06-30-security-local-automation-session-storage-boundary-review.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-local-automation-session-storage-boundary-review-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-local-automation-session-storage-boundary-review-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-local-automation-session-storage-boundary-review-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the
merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630`.

PR creation and force-push remain forbidden. This is not release readiness, not a final Pass, and not Cost Calibration.
