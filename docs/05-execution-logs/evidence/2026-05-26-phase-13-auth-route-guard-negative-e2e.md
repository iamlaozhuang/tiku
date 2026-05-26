# Phase 13 Auth Route Guard Negative E2E Evidence

**Task id:** `phase-13-auth-route-guard-negative-e2e`

**Branch:** `codex/phase-13-auth-route-guard-negative-e2e`

**Date:** 2026-05-26

**Feature commit:** `df1a62a test(auth): cover negative route guards`

**Merge commit:** current `HEAD` merge commit at closeout; final hash is reported from `git log` after amend.

## Actual Modified Files

- `e2e/local-auth-route-guard.spec.ts`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-13-auth-route-guard-negative-e2e.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-13-auth-route-guard-negative-e2e.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Actual Checked Files

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/01-requirements/`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/student-practice-mock-entry.spec.ts`
- `tests/unit/protected-route-guard-ui.test.ts`
- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
- `src/components/StudentAppLayout/StudentAppLayout.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`

## Gap Fix Summary

- `AUTH-GAP-001`: added browser coverage for unauthenticated representative student/admin protected routes.
- `AUTH-GAP-002`: added browser coverage for unauthenticated student deep links and stale synthetic local session token handling.
- No auth permission model, runtime source, schema, dependency, or env file was changed.

## Browser Operation Path

**Runtime:** Playwright-managed localhost web server.

**Actual paths:**

- No-session redirects: `/home`, `/ops/users`, `/content/questions`, `/practice?paperPublicId=paper-dev-theory`, `/mock-exam?paperPublicId=paper-dev-theory`, `/exam-report`, `/mistake-book`, `/profile`, `/redeem-code`.
- Stale-token redirect: `/home` with a synthetic local session token.

**Role / scenario / expected / actual:**

- Role: unauthenticated user.
- Scenario: visit protected student/admin routes with no local session.
- Expected: redirect to `/login`; protected admin navigation and student tablist are not rendered.
- Actual: focused e2e passed for 9 no-session routes.
- Role: no-auth student with stale local token.
- Scenario: visit `/home` with a synthetic stale local session token.
- Expected: `/api/v1/sessions` rejects the token, route redirects to `/login`, and the token is not visible in the DOM.
- Actual: focused e2e passed; the standard response had non-zero `code` and `data: null`.

## TDD Notes

- RED/coverage gap: pre-change `local-auth-route-guard` covered only `/home`, `/ops/users`, and `/content/questions`; it did not cover student deep links or stale local session tokens.
- First focused run after adding coverage failed because the test used the legacy mojibake button accessible name. The browser snapshot showed the login form was present, so the assertion was corrected to the stable form submit button.
- GREEN: `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts` passed with 10 Chromium tests.

## Command Results

- `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts` passed: 10 Chromium tests.
- `npm.cmd run test:e2e` passed: 22 Chromium tests.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` passed.
- `git diff --check` passed.
- `npm.cmd run format:check` passed as an extra formatting guard.

## Post-Merge Closeout

- Merged `codex/phase-13-auth-route-guard-negative-e2e` into `master` with `--no-ff`.
- Post-merge `npm.cmd run test:e2e` passed: 22 Chromium tests.
- Post-merge `npm.cmd run lint` passed.
- Post-merge `npm.cmd run typecheck` passed.
- Post-merge readiness, git readiness, `git diff --check`, and `format:check` passed.

## Runtime / UI / Test / Docs Touch

- Runtime touched: no.
- UI touched: no production UI source changed.
- Tests touched: yes, e2e route guard coverage.
- Docs touched: yes, task plan, evidence, project state, and task queue.

## Forbidden Scope Self-Check

- Did not add, remove, or upgrade dependencies.
- Did not modify `package.json`, package lockfiles, `.env.local`, or `.env.example`.
- Did not read or output env file contents.
- Did not connect to staging, prod, cloud, or any real provider.
- Did not modify schema or migration files.
- Did not change the auth permission model.
- Did not record secrets, tokens, Authorization headers, database URLs, raw prompt, raw answer, raw model response, raw provider payload, complete paper content, complete teaching material, OCR full text, or customer/private data.
- Did not expose internal numeric ids in external visible URLs.

## Taste Compliance Checklist

- [x] Naming follows glossary terms: `auth`, `session`, `student`, and `admin`.
- [x] API response shape was asserted as standard `code` plus `data` and not changed.
- [x] No hard-coded visual style, color, spacing, or component behavior was introduced.
- [x] No runtime state mutation patterns were added outside Playwright test setup.
- [x] No dependency, schema, env, provider, or destructive data changes were introduced.
- [x] Validation commands declared by the task queue were run and recorded.
