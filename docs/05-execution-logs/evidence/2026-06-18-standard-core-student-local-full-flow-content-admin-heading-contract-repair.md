# standard-core-student-local-full-flow-content-admin-heading-contract-repair Evidence

## Summary

- Task id: `standard-core-student-local-full-flow-content-admin-heading-contract-repair`
- Branch: `codex/mechanism-throughput-readiness-tuning`
- Started: `2026-06-18T10:52:12-07:00`
- Closed: `2026-06-18T11:12:56-07:00`
- Result: `passed`
- Batch range: single serial standard core student local full-flow repair task.
- Commit: `bd24626a` current branch baseline; no new commit was created in this task because merge, push, and branch cleanup
  remain blocked by the user.
- localFullLoopGate: satisfied by the final targeted local Playwright rerun covering local auth route guard, student
  practice/mock entry, and local business flow.
- Cost Calibration Gate remains blocked.
- Scope: smallest student local full-flow contract repair for admin content heading visibility, admin ops cookie-backed
  session reads, and the e2e REST guard contract.

## Root Cause

- Admin login after a student local automation session left a stale student bearer value in `tiku.localSessionToken`.
  Admin content pages then used that stale bearer instead of the HttpOnly admin session cookie, hiding the expected
  `/content/questions` heading.
- Admin ops route handlers for audit logs, AI call logs, organizations, org_auths, redeem_codes, and model_configs read
  `request.headers.get("authorization")` directly. They did not resolve the cookie-backed admin marker through
  `tiku_session`.
- The local full-flow also expects a raw same-origin `/api/v1/users` request without an Authorization header to remain
  unauthenticated, while normal admin UI/API reads use the explicit `Bearer __cookie_backed_session__` marker.

## Implementation

- `src/app/(auth)/login/page.tsx`
  - After non-personal admin login, stores the existing cookie-backed session marker instead of leaving a stale student
    bearer or exposing an admin bearer token.
- `src/features/student/studentRuntimeApi.ts`
  - Exports the cookie-backed session marker and persistence helper.
- `src/features/admin/content-admin-runtime.tsx`
  - Sends the explicit cookie-backed marker for admin fetches while still using `credentials: same-origin`.
- `src/server/auth/session-cookie.ts`
  - Resolves real bearer tokens directly.
  - Resolves the cookie-backed marker through `tiku_session`.
  - Keeps route-guard cookie fallback compatible for `/api/v1/sessions`.
- `src/server/services/*`
  - Updated admin ops log, enterprise auth, redeem code, and model config runtimes to use the shared session cookie
    helper instead of direct header reads.
  - Kept `admin-flow-runtime` user/admin reads explicit-header guarded so raw cookie-only `/api/v1/users` remains
    unauthenticated.
- Focused unit coverage added for stale student-token replacement, cookie-backed admin marker routing, admin ops route
  reads, model config runtime reads, and raw cookie-only user read denial.

## RED Evidence

- RED: focused unit and targeted e2e checks reproduced stale student-token admin handoff, cookie-backed admin ops route
  auth failures, and the raw no-header `/api/v1/users` REST guard conflict before the final scoped repair.
- `npm.cmd run test:unit -- tests/unit/phase-22-content-admin-cookie-session-repair.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
  - Result: failed as expected.
  - Failures:
    - `getRequestAuthorization` returned `Bearer __cookie_backed_session__` instead of the cookie-backed bearer.
    - ops route reads returned `401001 Admin session is required`.
- Intermediate targeted e2e after ops marker repair:
  - Result: 11 passed, 1 failed.
  - Failure advanced to REST guard: `/api/v1/users` raw no-header read returned `0` instead of expected `401001`.
- Intermediate targeted e2e after over-strict global cookie-only denial:
  - Result: 10 passed, 2 failed.
  - Failure: student login stayed on `/login`, proving global cookie-only session fallback was still required for route
    guards.

## GREEN Evidence

- GREEN: focused unit, e2e list, targeted local e2e, diff check, lint, typecheck, and Module Run v2 pre-commit hardening
  pass after the final scoped repair.
- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/phase-22-content-admin-cookie-session-repair.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
  - Result: passed.
  - Summary: `10 passed (10)`, `76 passed (76)`.
- `npm.cmd run test:e2e -- --list`
  - Result: passed.
  - Summary: `31 tests in 14 files`.
- `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-business-flow.spec.ts`
  - Result: passed.
  - Summary: `12 passed`.
- `git diff --check`
  - Result: passed.
  - Note: Git printed the existing CRLF-to-LF working-copy warning for `task-queue.yaml`; exit code was `0`.
- `npm.cmd run lint`
  - Result: passed.
- `npm.cmd run typecheck`
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-local-full-flow-content-admin-heading-contract-repair`
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-content-admin-heading-contract-repair`
  - Result: passed.

## Risk And Boundaries

- No `.env*`, package/lockfile/dependency, schema/drizzle/migration, provider/model config, staging/prod/cloud/deploy,
  payment, external-service, destructive DB, e2e spec, PR, push, merge, branch cleanup, or Cost Calibration Gate changes.
- No admin bearer token is stored in localStorage; the browser-visible value is only `__cookie_backed_session__`.
- Blocked remainder: release, staging/prod, provider/model calls and configuration, payment, external-service, deploy,
  schema/drizzle/migration, dependency/package/lockfile, destructive DB, PR, force-push, merge, push, branch cleanup, and
  Cost Calibration Gate remain blocked.
- Next recommended step: run `standard-core-student-experience-closure-readiness-audit` now that the scoped local student
  full-flow validation passes.

## Thread Rollover Decision

- threadRolloverGate: not required; the next closure readiness audit can run in this same thread on the existing short
  branch.

## Next Module Run Candidate

- nextModuleRunCandidate: `standard-core-student-experience-closure-readiness-audit`.
