# Phase 20 Fix RA-03-01 Student Home Scope Guidance Evidence

## Summary

- Result: merged to `master` and validated locally; push and cleanup pending.
- Scope: student home runtime scope persistence and no-authorization redeem redirect guidance.
- Changed surfaces: `src/features/student/home/StudentHomePage.tsx`, `tests/unit/student-home-ui.test.ts`, `e2e/role-based-acceptance/role-based-full-flow.spec.ts`, task plan/evidence/state/queue.
- Gates: task branch and master validation passed; push and cleanup pending.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/auth permission model work.
- Residual gaps (`residualGaps`): push and branch cleanup pending.

## Task

- Task id: `phase-20-fix-ra-03-01-student-home-scope-guidance`
- Branch: `codex/phase-20-fix-ra-03-01-student-home-scope-guidance`
- Finding: `F-RA-03-01-001`
- Started at: `2026-05-27T06:25:07-07:00`
- Human approval: low-risk task registered by Phase 18 RA-03 audit; no high-risk approval required because this task stays in local student UI/runtime guidance behavior.

## Startup And Claim

- Previous task `phase-20-fix-ra-01-14-auth-expiry-reminder` was merged to `master`, pushed to `origin/master`, and its short-lived branch was deleted.
- `git status --short --branch` - `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master` - `0 0`.
- `git branch --no-merged master` - no output.
- `git worktree list` - only `D:/tiku  c219a29 [master]`.
- `git switch -c codex/phase-20-fix-ra-03-01-student-home-scope-guidance` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-01-student-home-scope-guidance` - pass.

## Scope Controls

- Allowed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, `docs/05-execution-logs/task-plans/**`, `docs/05-execution-logs/evidence/**`, `docs/05-execution-logs/audits-reviews/**`, `src/**`, `tests/**`, `e2e/**`.
- Blocked files: `.env.local`, `.env.example`, package manifests/lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`.
- High-risk gates: not triggered.

## TDD Evidence

- RED: `npm.cmd run test:unit -- student-home-ui.test.ts` after adding tests failed as expected because `tiku.studentHome.selectedScope` was `null` and `router.replace("/redeem-code")` was not called. Result: 2 failed, 6 passed.
- GREEN: `npm.cmd run test:unit -- student-home-ui.test.ts` after implementation passed. Result: 8 passed.
- Regression coverage:
  - Persists selected scope as `profession` and `level` only, then restores it on remount.
  - Redirects no-effective-authorization student home state to `/redeem-code` while preserving fallback no-auth UI.

## Implementation Evidence

- Added `tiku.studentHome.selectedScope` localStorage persistence for selected student home authorization scope.
- Runtime student home load now prefers explicit `rememberedScope`, then the persisted local scope, and falls back to the first available effective scope.
- Scope selection persists only public business fields (`profession`, `level`), not tokens or internal ids.
- No effective authorization state now triggers `router.replace("/redeem-code")`.
- Updated role-based e2e negative student flow to expect automatic `/redeem-code` navigation rather than clicking the fallback link.
- No API contract, repository, service, schema, migration, auth permission model, dependency, package, lockfile, `.env.local`, or `.env.example` changes.

## Validation Evidence

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-01-student-home-scope-guidance` - passed at task claim.
- `npm.cmd run test:unit -- student-home-ui.test.ts` - passed, 8 tests.
- `npm.cmd run test:unit` - passed, 131 files and 534 tests.
- `npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts` - passed, 6 tests.
- `npm.cmd run test:e2e` - passed, 25 tests. First full run failed at the old negative-flow click assertion after auto-redirect; e2e was updated to wait for `/redeem-code`, focused rerun passed, then full rerun passed.
- `npm.cmd run build` - passed. Next.js reported `Environments: .env.local`; this was framework auto-loading only, and `.env.local` was not read, copied, or modified by the agent.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - inventory completed on task branch.
- `git diff --check` - passed.
- Changed-file Prettier check - passed after `Prettier --write` formatted `StudentHomePage.tsx`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - passed: lint, typecheck, unit tests, and format check. One earlier QualityGate run failed because ESLint tried to scan a missing generated `test-results` directory; after e2e recreated the directory, rerun passed.
- Master validation after merge:
  - `git merge --ff-only codex/phase-20-fix-ra-03-01-student-home-scope-guidance` - passed, fast-forwarded `master` from `c219a29` to `b59b8f8`.
  - `npm.cmd run test:unit` - passed, 131 files and 534 tests.
  - `npm.cmd run test:e2e` - final rerun passed, 25 tests. One earlier full run had a transient admin audit loading timeout; focused `admin-audit-navigation.spec.ts` passed before the final full rerun.
  - `npm.cmd run build` - passed with approved escalation after a prior Google Fonts network/cache failure. Next.js reported `Environments: .env.local`; this was framework auto-loading only, and `.env.local` was not read, copied, or modified by the agent.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - inventory completed on `master`, ahead of `origin/master` by one implementation commit.
  - `git diff --check` - passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - passed after confirming and deleting corrupted generated `.next/dev/types` under the workspace.

## Closeout

- implementationCommit: `b59b8f85185987028be604a40b57d3d3096cc477`.
- merge: fast-forwarded into `master`.
- push: pending.
- cleanup: pending.
