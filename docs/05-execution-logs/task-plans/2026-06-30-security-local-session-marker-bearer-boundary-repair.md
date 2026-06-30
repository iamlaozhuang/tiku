# Security Local Session Marker Bearer Boundary Repair Plan

- Task id: `security-local-session-marker-bearer-boundary-repair-2026-06-30`
- Branch: `codex/security-local-session-marker-repair-20260630`
- Mode: local focused source/test security repair.
- Result target: cookie-backed session marker is treated as a sentinel and cannot flow into bearer-token Authorization construction.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest local automation session storage boundary review task plan, evidence, audit review, and acceptance.
- `codex-security:fix-finding` guidance for reproduce-first, minimal fix, and verification discipline.

## Goal

Reproduce the marker-to-bearer boundary issue with a focused unit regression. If the current runtime reader returns the
cookie-backed session marker as a stored student session token, repair the narrowest boundary so the marker is treated as
no bearer token while preserving legitimate local automation student-token behavior.

## Allowed Files

- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-login-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-security-local-session-marker-bearer-boundary-repair.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-local-session-marker-bearer-boundary-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-local-session-marker-bearer-boundary-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-local-session-marker-bearer-boundary-repair.md`

## Boundaries

- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider/AI call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshot, no trace.
- Credentials: no env, secrets, connection strings, registry tokens, account credentials, cookies, tokens, sessions,
  localStorage values, sessionStorage values, Authorization header values, or credential-bearing evidence.
- Dependencies: no `package.json`, lockfile, package manager, install, update, remove, registry lookup, audit fix, or
  lifecycle script change.
- Release: no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.
- Evidence: record task ids, file paths, synthetic marker labels, status counts, validation commands, and closeout
  summaries only. Do not record secrets, storage values, Authorization header values, raw DOM, screenshots, traces, DB
  rows, PII, Provider payloads, prompts, raw AI I/O, or full business content.

## Implementation Plan

1. Add a focused regression to `tests/unit/student-login-ui.test.ts` proving the cookie-backed session marker is not a
   valid stored student session token for bearer-token construction.
2. Run the focused unit test before source repair and record RED if it fails as expected.
3. Repair `getStoredStudentSessionToken` in `src/features/student/studentRuntimeApi.ts` so blank values and the marker
   return `null`, while legitimate local automation token strings still return.
4. Re-run focused unit tests and existing login UI tests to prove legitimate behavior remains intact.
5. Run focused lint, typecheck, scoped formatting, diff checks, and Module Run v2 gates.
6. Write redacted evidence, audit review, and acceptance.

## Validation Commands

```powershell
rg -n "security-local-session-marker-bearer-boundary-repair-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-local-session-marker-bearer-boundary-repair.md docs/05-execution-logs/acceptance/2026-06-30-security-local-session-marker-bearer-boundary-repair.md
npx.cmd vitest run tests/unit/student-login-ui.test.ts
npm.cmd run lint -- src/features/student/studentRuntimeApi.ts tests/unit/student-login-ui.test.ts
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown src/features/student/studentRuntimeApi.ts tests/unit/student-login-ui.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-local-session-marker-bearer-boundary-repair.md docs/05-execution-logs/evidence/2026-06-30-security-local-session-marker-bearer-boundary-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-security-local-session-marker-bearer-boundary-repair.md docs/05-execution-logs/acceptance/2026-06-30-security-local-session-marker-bearer-boundary-repair.md
npx.cmd prettier --check --ignore-unknown src/features/student/studentRuntimeApi.ts tests/unit/student-login-ui.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-local-session-marker-bearer-boundary-repair.md docs/05-execution-logs/evidence/2026-06-30-security-local-session-marker-bearer-boundary-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-security-local-session-marker-bearer-boundary-repair.md docs/05-execution-logs/acceptance/2026-06-30-security-local-session-marker-bearer-boundary-repair.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-local-session-marker-bearer-boundary-repair-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-local-session-marker-bearer-boundary-repair-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-local-session-marker-bearer-boundary-repair-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the
merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630`.

PR creation and force-push remain forbidden. This is not release readiness, not a final Pass, and not Cost Calibration.
