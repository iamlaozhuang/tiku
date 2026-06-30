# 2026-06-30 Student Session Marker Regression Reinforcement

## 任务

- Task ID: `student-session-marker-regression-reinforcement-2026-06-30`
- Branch: `codex/student-session-marker-regression-reinforcement-20260630`
- Scope: add a focused test-only regression assertion for blank or whitespace stored student session values.
- Expected implementation: modify `tests/unit/student-login-ui.test.ts` only, with no production source change unless the focused test exposes a current behavior defect.

## 已读取并遵守的规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest log query no-op evidence and regression coverage inventory evidence.

## 可写边界

Only these files may be modified:

- `tests/unit/student-login-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-student-session-marker-regression-reinforcement.md`
- `docs/05-execution-logs/evidence/2026-06-30-student-session-marker-regression-reinforcement.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-student-session-marker-regression-reinforcement.md`
- `docs/05-execution-logs/acceptance/2026-06-30-student-session-marker-regression-reinforcement.md`

## 只读复核对象

- `docs/05-execution-logs/evidence/2026-06-30-regression-coverage-gap-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-local-session-marker-bearer-boundary-repair.md`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-login-ui.test.ts`

## 禁止事项

- No package, lockfile, dependency, database, migration, seed, browser, e2e, Provider, AI, release, final Pass, Cost Calibration, PR, or force-push work.
- No staging/prod/cloud connections.
- No env, secret, connection string, credential, cookie, token, session, `localStorage`, or `Authorization` header values in evidence.
- No raw DOM, screenshot, trace, raw DB row, internal ID, PII, Provider payload, prompt, raw AI I/O, or full business-content evidence.

## 实施思路

1. Confirm the existing test covers marker rejection and valid local automation readback but lacks a direct blank or whitespace stored-value assertion.
2. Add the smallest focused assertion to the existing student session marker test.
3. Keep production source unchanged if current behavior already passes.
4. Run focused unit validation plus governance validation.
5. Commit, fast-forward merge into `master`, push `origin/master`, and delete the short branch.

## 风险防御

- Keep `src/**` blocked for writes unless the focused test exposes a current behavior defect requiring a separate explicit decision.
- Do not record actual storage, cookie, token, or Authorization values in evidence.
- Do not run browser, DB, Provider, AI, dependency, release, deployment, or Cost Calibration commands.

## 验证命令

- `npx.cmd vitest run tests/unit/student-login-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown tests/unit/student-login-ui.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-student-session-marker-regression-reinforcement.md docs/05-execution-logs/evidence/2026-06-30-student-session-marker-regression-reinforcement.md docs/05-execution-logs/audits-reviews/2026-06-30-student-session-marker-regression-reinforcement.md docs/05-execution-logs/acceptance/2026-06-30-student-session-marker-regression-reinforcement.md`
- `npx.cmd prettier --check --ignore-unknown tests/unit/student-login-ui.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-student-session-marker-regression-reinforcement.md docs/05-execution-logs/evidence/2026-06-30-student-session-marker-regression-reinforcement.md docs/05-execution-logs/audits-reviews/2026-06-30-student-session-marker-regression-reinforcement.md docs/05-execution-logs/acceptance/2026-06-30-student-session-marker-regression-reinforcement.md`
- `git diff --check`
- `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId student-session-marker-regression-reinforcement-2026-06-30`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId student-session-marker-regression-reinforcement-2026-06-30`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId student-session-marker-regression-reinforcement-2026-06-30 -SkipRemoteAheadCheck`
