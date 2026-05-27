# Phase 20 Fix RA-01-14 Auth Expiry Reminder Evidence

## Summary

- Result: implementation validated on task branch.
- Scope: student home UI authorization expiry reminder and focused tests.
- Changed surfaces: `src/features/student/home/StudentHomePage.tsx`, `tests/unit/student-home-ui.test.ts`, task plan/evidence/state/queue.
- Gates: task branch validation passed; closeout merge/push/cleanup pending.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/auth permission model work.
- Residual gaps (`residualGaps`): implementation commit, master merge verification, push, and branch cleanup pending.

## Task

- Task id: `phase-20-fix-ra-01-14-auth-expiry-reminder`
- Branch: `codex/phase-20-fix-ra-01-14-auth-expiry-reminder`
- Finding: `F-RA-01-14-001`
- Started at: `2026-05-27T05:52:02-07:00`
- Human approval: low-risk task registered by Phase 18 RA-01 audit; no high-risk approval required because this task stays in local student UI behavior.

## Startup And Claim

- Previous task `phase-20-fix-ra-02-06-material-reference-list` was merged to `master`, pushed to `origin/master`, and its short-lived branch was deleted.
- `git status --short --branch` - `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master` - `0 0`.
- `git branch --no-merged master` - no output.
- `git worktree list` - only `D:/tiku  dd127e9 [master]`.
- `git switch -c codex/phase-20-fix-ra-01-14-auth-expiry-reminder` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-14-auth-expiry-reminder` - pass.

## Scope Controls

- Allowed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, `docs/05-execution-logs/task-plans/**`, `docs/05-execution-logs/evidence/**`, `docs/05-execution-logs/audits-reviews/**`, `src/**`, `tests/**`, `e2e/**`.
- Blocked files: `.env.local`, `.env.example`, package manifests/lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`.
- High-risk gates: not triggered.

## TDD Evidence

- RED: `npm.cmd run test:unit -- student-home-ui.test.ts` after adding tests failed as expected because `[data-testid="auth-expiry-reminder"]` was missing. Result: 2 failed, 5 passed.
- GREEN: `npm.cmd run test:unit -- student-home-ui.test.ts` after implementation passed. Result: 7 passed.
- Regression coverage:
  - Shows the nearest authorization expiry reminder when a scope expires within 15 days and does not show a 16-day scope.
  - Dismisses the reminder into localStorage for the current local day only and shows it again on the next local day.

## Implementation Evidence

- Added pure client-side reminder selection on the student home page using existing `StudentPaperScopeDto.expiresAt` values.
- Added localStorage suppression keyed by `profession`, `level`, and `expiresAt`; suppression stores only a local date string and does not affect authorization checks.
- Added a warning-token banner with a redeem-code link and icon-only dismiss control.
- No API contract, repository, service, schema, migration, auth permission model, dependency, package, lockfile, `.env.local`, or `.env.example` changes.

## Validation Evidence

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-14-auth-expiry-reminder` - passed at task claim. A later rerun after marking the task `in_progress` failed with `Task is not claimable`, which matches the script's claim-only semantics.
- `npm.cmd run test:unit -- student-home-ui.test.ts` - passed, 7 tests.
- `npm.cmd run test:unit` - passed, 131 files and 533 tests.
- `npm.cmd run test:e2e` - passed, 25 tests.
- `npm.cmd run build` - passed. Next.js reported `Environments: .env.local`; this was framework auto-loading only, and `.env.local` was not read, copied, or modified by the agent.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - inventory completed on task branch.
- `git diff --check` - passed.
- Changed-file Prettier check with `node .\node_modules\prettier\bin\prettier.cjs --check ...` - passed after sandbox EPERM was rerun with approved escalation.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - passed: lint, typecheck, unit tests, and format check.
- Standalone `npm.cmd run typecheck` in sandbox hit `EPERM` reading local `node_modules`; the same typecheck passed inside `Invoke-QualityGate.ps1`.

## Closeout

- implementationCommit: pending.
- merge: pending.
- push: pending.
- cleanup: pending.
