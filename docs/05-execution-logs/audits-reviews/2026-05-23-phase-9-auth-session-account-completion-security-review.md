# Security Review: phase-9-auth-session-account-completion

## Metadata

- Task id: `phase-9-auth-session-account-completion`
- Branch: `codex/phase-9-auth-session-account-completion`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-23`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/api/v1/users/route.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/session-boundary.ts`
- `src/server/services/session-service.ts`
- `src/server/auth/local-session-runtime.test.ts`
- `src/server/services/session-service.test.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/student-register-ui.test.ts`

## Risk Types Reviewed

- `auth`
- `session`
- `password`
- `account_lock`
- `audit_log`
- `secret`

## Abuse Cases Considered

- Duplicate phone registration.
- Weak or invalid password accepted.
- Student registration accidentally creates admin access.
- Old single-active student session remains valid after new login.
- Disabled account can still login or keep using a session.
- Admin session behavior violates the role/session boundary.
- Password reset leaks plaintext password, hashes, or secrets.
- API response leaks numeric database `id`.
- Evidence, UI, logs, or test output expose session tokens or credential material.

## Data Exposure Review

- `POST /api/v1/users` returns the existing registration DTO with public user fields and `nextAction`; it does not return password, password hash, auth user id, session token, secret, or numeric database `id`.
- `/register` redirects to `/redeem-code` after success and does not store or render credentials.
- Login UI maps disabled-account errors without rendering session tokens or credential material.
- Admin login still returns the opaque login token by the existing session-login contract; tests and evidence do not expose real credentials or production secrets.

## Authorization Boundary Review

- Personal registration creates only `user_type: personal` plus `student`; it does not create `admin` records or admin roles.
- Existing admin `GET /api/v1/users` remains protected by `createAdminFlowRuntimeRouteHandlers`.
- Disabled accounts are rejected before credential verification and before new session creation.
- Existing current-session resolution uses active account lookup; disabled users no longer resolve as authenticated on subsequent requests.
- Admin login now uses 8-hour multi-session behavior to align with US-06-13 without revoking other admin sessions.

## API Contract Review

- `/api/v1/users` keeps `GET` for admin user list and wires `POST` for personal registration.
- External route identifiers remain public identifiers; no auto-increment `id` is exposed.
- JSON fields remain camelCase.
- Optional values are `null`, not empty strings.
- Response envelopes stay standard.

## Test Coverage And Accepted Gaps

- Unit coverage added for local personal registration runtime, registration UI validation/success/duplicate feedback, disabled-account login feedback, disabled-account login rejection, and admin 8-hour multi-session login.
- Full unit, quality gate, build, e2e, naming, and Git readiness commands passed.
- Accepted gap: password reset remains deferred to `phase-9-admin-ops-runtime-ui-completion` because safe password delivery, admin mutation UI, and audit-log persistence are outside the current implementation boundary.
- Accepted gap: admin failed-login lockout needs persisted admin lock fields or an equivalent approved storage design, which would require schema/migration work blocked by this task.
- Accepted gap: account-disable termination of active practice/mock sessions remains in later termination/student runtime tasks.

## Verdict

`APPROVE` for the implemented auth/session/account subset. The accepted gaps above are non-blocking for this task because implementing them safely would require queue-owned admin ops, termination, or schema work that this task is not allowed to expand into.
