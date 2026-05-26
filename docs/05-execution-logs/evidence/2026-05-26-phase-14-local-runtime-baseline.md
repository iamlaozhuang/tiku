# Phase 14 Local Runtime Baseline Evidence

**Task id:** `phase-14-local-runtime-baseline`

**Branch/worktree:** `codex/phase-14-local-runtime-baseline` / `.worktrees/phase-14-local-runtime-baseline`

**Date:** 2026-05-26

## Scope

Fix local runtime baseline instability observed after the local e2e diagnostic task:

- local Postgres client creation could exhaust connections during Next/Vitest/e2e runtime reuse;
- selected route handlers could surface thrown runtime errors as non-standard responses instead of the expected API envelope.

This task is local-only. It does not connect to staging, production, cloud, or any real provider.

## TDD Log

- RED: added `tests/unit/runtime-database-baseline.test.ts`.
  - First focused run failed because `@/server/services/route-error-response` did not exist.
  - This verified the test covered missing route error envelope behavior before production code was added.
- GREEN: implemented shared runtime Postgres client caching in `src/server/repositories/runtime-database.ts`.
- GREEN: added `src/server/services/route-error-response.ts`.
- GREEN: rewired local runtime repositories/auth helpers to reuse the shared client.
- GREEN: wrapped the baseline-sensitive route handlers with the standard error envelope helper.
- GREEN verification: focused unit test passed after implementation.

## Implementation Notes

- `getSharedRuntimePostgresClient()` caches `postgres` clients in process-global state keyed by database URL/cache key.
- `createLocalRuntimeDatabase()` now builds Drizzle from the shared client instead of constructing a new pool per local runtime repository instance.
- `resetSharedRuntimePostgresClientsForTest()` is test-only support for deterministic unit coverage.
- `createRouteHandlerWithErrorEnvelope()` converts unexpected thrown runtime errors into the standard `{ code, message, data }` JSON shape with HTTP 500.
- Route hardening was limited to the local baseline failure surface:
  - paper composition collection `POST`;
  - mock exam answer/submit `POST`;
  - effective authorization `GET`;
  - redeem code create/list endpoints;
  - student paper scope/list/detail endpoints.
- Post-merge e2e follow-up fixed two residual baseline issues:
  - `local-business-flow.spec.ts` now treats AI config page GET aborts as expected transition aborts when navigation cancels in-flight requests.
  - `role-based-full-flow.spec.ts` now uses a run-scoped no-auth student phone to avoid local dirty database collisions with an older fixed phone/password.

## Command Results

Worktree-local commands:

- `npm.cmd run test:unit -- tests/unit/runtime-database-baseline.test.ts`
  - First sandbox run was blocked by EPERM while reading root `node_modules`.
  - Escalated local-only rerun: passed, 1 file / 2 tests.
- `npm.cmd run lint`
  - First sandbox run was blocked by EPERM while reading root `node_modules`.
  - Escalated local-only rerun initially produced one warning in the new test.
  - After fixing the warning, rerun passed with no eslint findings.
- `npm.cmd run typecheck`
  - First sandbox run was blocked by EPERM while reading root `node_modules`.
  - Escalated local-only rerun passed.
- `npm.cmd run test:unit`
  - Escalated local-only run: 130 files passed, 1 file failed.
  - Failing test: `tests/unit/phase-8-student-mistake-book-runtime.test.ts`.
  - Failure reason: `DATABASE_URL is required for AI audit log runtime.`
  - Assessment: worktree environment limitation. The worktree intentionally does not copy or read `.env.local`; full unit must be rerun from the primary local checkout after merge.
- `npm.cmd run build`
  - Escalated local-only run failed before compiling app code.
  - Failure reason: Next/Turbopack could not resolve `next/package.json` from the worktree `src/app` when reusing dependencies from the primary checkout.
  - Assessment: worktree dependency-resolution limitation. Build must be rerun from the primary local checkout after merge.
- `git diff --check`
  - Passed.

Post-merge primary-checkout commands:

- `npm.cmd run test:unit`
  - Passed after merge in the primary checkout: 131 files / 524 tests.
- `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`
  - First post-merge run failed on expected transition abort classification for AI config GET requests.
  - After follow-up test hardening, rerun passed: 1 test.
- `npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts`
  - Passed: 1 test.
- `npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts`
  - First post-merge run failed because a fixed no-auth student phone already existed locally with a different password.
  - After switching to a run-scoped phone, rerun passed: 6 tests.
- `npm.cmd run test:e2e`
  - Passed: 25 tests.
- `npm.cmd run build`
  - Passed in the primary checkout.
- `npm.cmd run lint`
  - Passed.
- `npm.cmd run typecheck`
  - Passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Completed repository readiness inventory. It reported the current follow-up branch changes and the unpushed runtime merge commits as expected before final merge/push.
- `git diff --check`
  - Passed.

## Forbidden Scope Self-Check

- No dependency was added, removed, or upgraded.
- No package manifest or lockfile was modified.
- No `.env.local` or `.env.example` contents were read, changed, copied, or recorded.
- No staging, production, cloud, deploy, or real provider was contacted.
- No destructive migration, seed reset, or data rewrite was executed.
- No raw prompt, raw answer, raw model response, raw provider payload, Authorization header, database URL, token, secret, plaintext redeem code, generated password, full paper, full textbook, OCR full text, or private customer-like data is recorded here.

## 品味合规自检 Checklist

- [x] 共享连接池逻辑集中在 `runtime-database.ts`，没有把连接生命周期复制到各业务 repository。
- [x] 路由异常统一转换为标准 API envelope，没有引入 ad hoc JSON shape。
- [x] 没有新增依赖、迁移、脚本或环境配置。
- [x] 命名沿用 `runtime`, `authorization`, `redeem_code`, `mock_exam`, `mistake_book` 等既有术语。
- [x] 修改范围保持在本地 runtime baseline 所需边界内，没有顺手重构无关业务。
