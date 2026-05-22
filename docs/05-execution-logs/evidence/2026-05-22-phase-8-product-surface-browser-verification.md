# Phase 8 Product Surface Browser Verification Evidence

## Metadata

- Task id: `phase-8-product-surface-browser-verification`
- Branch: `codex/phase-8-product-surface-browser-verification`
- Base: `master`
- Evidence created at: `2026-05-22T23:54:00+08:00`
- Task plan: skipped by queue policy. `task-queue.yaml` declares `taskPlanPolicy: evidence_only` and allowed files do not include `docs/05-execution-logs/task-plans/**`.

## Recovery And Readiness

- Read `AGENTS.md`, code taste commandments, document management, local CI, testing/TDD, ADRs, runtime slice contract, Phase 8 product surface contract, MVP roadmap, automation SOP, dependency gate, security review gate, project state, task queue, and latest admin org/auth/redeem evidence.
- `git status --short --branch`: initial recovery on `master`, clean and synced with `origin/master`.
- `git log -5 --oneline`: latest `d93f3bd docs(agent): record admin org auth redeem ui push cleanup`.
- `git branch --list`: only `master`.
- `git branch -r`: `origin/HEAD -> origin/master`, `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass on recovery; no tracked, staged, untracked, or upstream differences.
- Created branch: `codex/phase-8-product-surface-browser-verification`.
- `Test-TaskClaimReadiness.ps1 -TaskId phase-8-product-surface-browser-verification`: pass; task status `pending`, dependencies complete, `taskPlanPolicy: evidence_only`.

## Scope

Allowed files:

- `docs/05-execution-logs/evidence/2026-05-22-phase-8-product-surface-browser-verification.md`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `src/**`
- `drizzle/**`

## E2E Coverage Added

- Extended `e2e/local-business-flow.spec.ts` only.
- Added student home navigation assertion for `/mistake-book`.
- Added `/mistake-book` browser verification after student login:
  - route renders `错题本`;
  - page body does not render the local session token;
  - page body does not render `code_hash`;
  - page body does not render raw answer sentinel text;
  - item state, when present, uses `data-public-id` and no `data-id`;
  - `AI讲解暂不可用` remains disabled;
  - favorite toggle is exercised when a row exists;
  - empty state and `/home` return link are verified when no row exists.
- Existing E2E coverage remains in the same flow for:
  - student login/session;
  - student profile and redeem-code UI;
  - student practice/mock/report and mock AI log path;
  - admin login/session;
  - admin organization, `org_auth`, employee, and redeem_code UI;
  - audit_log and ai_call_log list checks;
  - redaction checks for token, password, secret, API key sentinel, `code_hash`, plaintext card code, raw prompt, and raw answer sentinels.

## Browser Verification Tool Discovery

- `tool_search`: searched `node_repl js browser iab JavaScript execution browser-client`; result exposed `mcp__node_repl__.js`.
- `tool_search`: searched `browser iab agent.browser tabs selected browser-client.mjs`; no dedicated Browser skill/tool surfaced, but `node_repl` was available.
- Local browser client discovery:
  - found `C:\Users\jzzhu\.codex\plugins\cache\openai-bundled\chrome\26.519.31651\scripts\browser-client.mjs`;
  - imported `setupBrowserRuntime`;
  - `setupBrowserRuntime({ globals: globalThis })`: pass;
  - selected backend: `iab`, browser name `Codex In-app Browser`;
  - tab listing: pass, one initial `about:blank` tab.
- IAB smoke:
  - route `http://127.0.0.1:3000/login`;
  - title: `题库系统 - 烟草行业职业技能考试平台`;
  - DOM snapshot contained `手机号`, `密码`, and `登录`.
- IAB full-flow attempt:
  - first attempt failed because `waitForURL` requires a string URL, not a RegExp.
  - second attempt failed because direct `localStorage` access is unavailable in the IAB evaluation context.
  - third attempt reached `/home`, verified links for `/profile`, `/redeem-code`, and `/mistake-book`, but IAB did not preserve the app's local session state as expected, so `/profile` was not a reliable authenticated check.
- Fallback decision:
  - Project Playwright E2E was used as the canonical repeatable browser verification because the task explicitly requires `npm.cmd run test:e2e`, and IAB authenticated-session behavior was unreliable in this runtime.
  - Residual risk: IAB coverage is limited to route/smoke discovery and partial navigation; full auth/session assertions are covered by Playwright Chromium.
- Tab finalization:
  - first finalize call used the wrong shape and failed;
  - later finalize attempt was blocked by the IAB full-flow error before finalization;
  - residual open IAB tab risk is limited to the current Codex in-app Browser session and no Chrome/profile-backed tab was established.

## URL And Route Checks

- `/`: root page renders `题库系统`.
- `/login`: login form visible and submit disabled until phone/password inputs are filled.
- `/home`: student login redirects here; paper cards visible; links to `/profile`, `/redeem-code`, and `/mistake-book` verified.
- `/profile`: profile page renders `有效授权` and `个人授权记录`.
- `/redeem-code`: invalid valid-shaped code interaction returns `兑换码不存在` and does not show `兑换成功`.
- `/mistake-book`: route renders `错题本`; empty state or first item state is verified; disabled AI explanation state is enforced when an item exists.
- `/mock-exam?paperPublicId=paper-dev-theory`: route is non-empty before API flow.
- `/exam-report`: route is non-empty after mock submission/report creation.
- `/ops/users`, `/content/questions`, `/content/papers`, `/ops/ai-audit-logs`: admin pages are non-empty.
- `/ops/organizations`: renders `企业授权运营`.
- `/ops/redeem-codes`: renders `卡密管理`.

## Console, Network, Screenshot, And Attachment Status

- Playwright captured console errors and failed requests in `local-business-flow.spec.ts`.
- Final E2E assertion: `consoleErrors` equals `[]`; `networkFailures` equals `[]`.
- Playwright attachments generated by the passing run:
  - `root-page`
  - `student-home`
  - `student-profile`
  - `student-redeem-code`
  - `student-mistake-book`
  - `exam-report-page`
  - `admin-organizations`
  - `admin-redeem-codes`
- `playwright-report/index.html`: generated locally.
- `playwright-report/data/*.png`: screenshot attachments generated locally.
- Screenshot artifacts are Playwright report outputs and are not committed.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-8-product-surface-browser-verification`: pass.
- `docker compose ps`: pass; `tiku-postgres-dev` is `Up` and `healthy`, port `127.0.0.1:5432->5432/tcp`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- First `npm.cmd run test:e2e`: fail.
  - Root cause: Playwright reused a stale existing `127.0.0.1:3000` Next dev server due `reuseExistingServer: !process.env.CI`; `/mistake-book` returned the UI error state from the stale runtime.
  - Action: stopped the old `D:\tiku` dev server PID after sandbox denied the first stop attempt.
- Second `npm.cmd run test:e2e`: fail.
  - Root cause: fresh current-source server rendered the expected empty state, but Playwright strict mode found two `返回首页` links.
  - Action: scoped the empty-state link assertion with `.first()`.
- Final `npm.cmd run test:e2e`: pass, `2` Chromium tests passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass.
  - `lint`: pass.
  - `typecheck`: pass.
  - `test:unit`: pass, `96` files passed, `327` tests passed.
  - `format:check`: pass.
- `npm.cmd run build`: pass; route output includes `/mistake-book`, `/profile`, `/redeem-code`, `/ops/organizations`, and `/ops/redeem-codes`.
- Final `npm.cmd run test:e2e`: pass, `2` Chromium tests passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; expected task-scoped changes in `e2e/local-business-flow.spec.ts` plus this evidence file before commit.

## Security And Privacy Review

- No package, lockfile, `.env.example`, schema, migration, `drizzle/**`, production resource, external SMS/email/payment/AI provider, or `src/**` changes.
- Auth/session runtime is not bypassed; E2E logs in through `/login` and uses the app-stored local session token only inside browser context/API headers.
- No session token, password, secret, API key, `code_hash`, plaintext card code, raw prompt, raw answer, or numeric database `id` is asserted as visible or returned in admin API redaction checks.
- URLs use public routes and public identifiers only; no new URL or DTO exposes auto-increment `id`.
- `audit_log` and `ai_call_log` are verified through protected admin reads after student mock/report and learning-suggestion retry flow.

## Git Closeout

- implementationCommit: `286b5a5 test(e2e): verify phase 8 product surfaces`.
- merge: `3726e34 merge: phase 8 product surface browser verification`.
- master validation:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass on `master`.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass on `master`.
    - `lint`: pass.
    - `typecheck`: pass.
    - `test:unit`: pass, `96` files passed, `327` tests passed.
    - `format:check`: pass.
  - `npm.cmd run build`: pass on `master`; route output includes `/mistake-book`, `/profile`, `/redeem-code`, `/ops/organizations`, and `/ops/redeem-codes`.
  - `npm.cmd run test:e2e`: pass on `master`, `2` Chromium tests passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass on `master`.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass on `master`, ahead of `origin/master` by implementation and merge commits before state/evidence closeout commit.
- state closeout:
  - `docs/04-agent-system/state/project-state.yaml`: current task updated to `phase-8-product-surface-browser-verification`, status `closed`, plan path `null` because evidence-only.
  - `docs/04-agent-system/state/task-queue.yaml`: task status updated from `pending` to `closed`.
- closeoutEvidenceCommit: `c27bd8f docs(agent): close phase 8 product surface verification`.
- push:
  - `git fetch --prune`: pass before push.
  - `git rev-list --left-right --count origin/master...HEAD`: `0 3` before push.
  - `git push origin master`: pass, `d93f3bd..c27bd8f master -> master`.
- cleanup:
  - `git branch -d codex/phase-8-product-surface-browser-verification`: first sandbox run failed due `.git/refs` lock permission.
  - escalated `git branch -d codex/phase-8-product-surface-browser-verification`: pass, deleted local merged task branch.
  - `git fetch --prune`: pass after cleanup.
  - `git status --short --branch`: `## master...origin/master`.
  - `git branch --list`: only `master`.
  - `git branch -r`: `origin/HEAD -> origin/master`, `origin/master`.
  - `git rev-list --left-right --count origin/master...HEAD`: `0 0`.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass; no tracked, staged, untracked, or upstream differences.
- finalPushCleanupEvidenceCommit: pending; this update records the already-completed push and cleanup result.

## Residual Risk

- IAB backend was discovered and partially exercised, but full authenticated product-surface verification is backed by Playwright Chromium because IAB did not reliably preserve app local session state in this run.
- Playwright coverage uses one Chromium desktop project from `playwright.config.ts`; mobile viewport and non-Chromium browser matrix remain outside current project config.
- `/mistake-book` E2E is data-state tolerant: it verifies either empty state or first-row behavior. It does not force database mutation to manufacture a mistake row.
