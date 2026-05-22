# Phase 8 Student Login Session UI Runtime Evidence

## Summary

Status: validated locally.

Branch: `codex/phase-8-student-login-session-ui-runtime`

Base: `master` after Phase 8 queue seed merge `54ce0e4`.

Task: `phase-8-student-login-session-ui-runtime`

## Scope

Implemented the local login UI at `src/app/(auth)/login/page.tsx`.

Changed E2E login coverage in `e2e/local-business-flow.spec.ts` from browser `fetch('/api/v1/sessions')` to visible form input and click interaction.

Added unit coverage in `tests/unit/student-login-ui.test.ts`.

No package, lockfile, `.env.example`, schema, or drizzle files were changed.

## Recovery And Readiness

- Read `AGENTS.md`, code taste commandments, ADRs, runtime slice contract, Phase 8 product surface contract, roadmap, automation SOPs, dependency gate, security gate, project state, task queue, task plan, prior evidence, and the security review file.
- `git status --short --branch`: branch `codex/phase-8-student-login-session-ui-runtime`, clean at recovery.
- `git log -3 --oneline`: `f2eb29a`, `54ce0e4`, `e8e754b`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory at recovery.
- Queue confirmation: task status was `in_progress`; allowed files include login page, session runtime surfaces, tests, E2E, task docs, state and queue; blocked files include package/lock files, `.env.example`, and `drizzle/**`.

## TDD Evidence

- Added `tests/unit/student-login-ui.test.ts` before implementation.
- First focused run missed the file because the test config includes `tests/unit/**/*.test.ts`; renamed from `.test.tsx` to `.test.ts`.
- Red run after rename: failed because placeholder page lacked `手机号`, `密码`, and login button controls.
- Green run after implementation: `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts` passed `6` tests.

Unit coverage:

- Submit remains disabled until phone and password are locally valid.
- Invalid credentials show safe feedback and do not redirect.
- Loading state disables submit and shows `登录中`.
- Runtime unavailable shows safe feedback and does not redirect.
- Student login stores only the local session token and routes to `/home`.
- Super admin login stores only the local session token and routes to `/ops/users`.
- DOM text assertions ensure the session token is not rendered.

## Browser Verification

Browser path:

- Browser plugin skill loaded.
- First in-app browser connection attempt timed out and reset the kernel.
- Second attempt connected to `iab`.

Local runtime setup:

- Initial UI login attempt showed `登录服务暂不可用，请稍后重试`.
- Dev server log showed `POST /api/v1/sessions 500` caused by database `ECONNREFUSED`.
- `docker compose up -d` first failed because the Docker API was not reachable.
- Docker Desktop was started with human-approved escalation.
- Docker API then required elevated access; `docker compose up -d` was rerun with approval and reported `tiku-postgres-dev Running`.
- `scripts/db/Seed-DevDatabase.ps1`: pass; seed counts included 1 admin, 1 student user, 1 organization, 1 personal auth, 1 paper, 1 paper question, and 1 model config.

Rendered checks at `http://127.0.0.1:3000/login`:

- Page identity: URL `/login`, title `题库系统 - 烟草行业职业技能考试平台`.
- Not blank: login form rendered with one `手机号` field, one `密码` field, and one `登录` button.
- Submit disabled before valid input: pass.
- Console health: no browser warn/error logs after final student and admin checks.
- Token exposure: DOM text did not contain token text or the stored token value during validated checks.
- Student interaction: form fill and click redirected to `/home`; student home showed 3 paper cards.
- Admin interaction: form fill and click redirected to `/ops/users`; admin user operations page rendered.

No session token values were written to evidence.

## Command Evidence

- `npm.cmd run test:unit`: pass, `89` files passed, `297` tests passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass.
  - `lint`: pass.
  - `typecheck`: pass.
  - `test:unit`: pass, `89` files passed, `297` tests passed.
  - `format:check`: pass.
- `npm.cmd run build`: pass; Next.js build completed and `/login` is listed as static route.
- `npm.cmd run test:e2e`: pass after moving token read until after URL navigation; `2` tests passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory.

Notes:

- A focused `lint` and `typecheck` attempt hit sandbox `EPERM` reading local tool entrypoints under `node_modules`; the full quality gate later passed.
- `npm.cmd run test:e2e` first hit sandbox `EPERM` reading the Playwright CLI; the same command passed with approved escalation.
- Generated Playwright artifacts remain ignored under `test-results/` and `playwright-report/`.

## Changed Files

- `src/app/(auth)/login/page.tsx`
- `e2e/local-business-flow.spec.ts`
- `tests/unit/student-login-ui.test.ts`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-login-session-ui-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-22-phase-8-student-login-session-ui-runtime-security-review.md`
- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-student-login-session-ui-runtime.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Residual Risk

- This task keeps the existing local session runtime and does not introduce cookie-based auth for student/admin pages.
- The local token remains in browser local storage for the MVP dev flow; no UI, console, screenshot, or evidence output includes the token value.
- Docker Desktop must be available for full local runtime and E2E validation.

## Local Merge Closeout

Date: 2026-05-22

User approval:

- Approved local merge of `codex/phase-8-student-login-session-ui-runtime` into `master`.
- Approved pushing `master` to `origin`.

Local merge:

- Switched to `master`.
- `git merge --no-ff codex/phase-8-student-login-session-ui-runtime -m "merge: phase 8 student login session ui runtime"`: pass after elevated retry for `.git/ORIG_HEAD.lock` permission.
- Merge commit: `c1dcacb`.

Validation on merged `master`:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass.
- `npm.cmd run build`: pass.
- `npm.cmd run test:e2e`: pass, `2` tests passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory, `master` ahead of `origin/master` before push.

Push:

- Push is approved by the user and will be recorded in the final handoff after execution.
