# Phase 8 Student Login Session UI Runtime Security Review

## Metadata

- Task id: `phase-8-student-login-session-ui-runtime`
- Branch: `codex/phase-8-student-login-session-ui-runtime`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-22
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/services/session-service.ts`
- `src/server/validators/session-login.ts`
- `src/server/contracts/auth-contract.ts`
- `e2e/local-business-flow.spec.ts`
- `tests/unit/student-login-ui.test.ts`

## Risk Types

- `auth`
- `session`
- `authorization`
- `frontend_runtime`
- `e2e`
- `secret`

## Abuse Cases Considered

- Invalid credential probing must receive a safe generic message.
- Runtime/database outage must not expose stack traces in the UI.
- Role redirect must use returned user context instead of phone number patterns.
- Session token must not be rendered in DOM text, console output, screenshot content, or evidence.
- E2E assertions must not serialize session tokens into recorded payloads.
- UI must not bypass `/api/v1/sessions` or hardcode role state.

## Data Exposure Review

- The UI posts only `phone` and `password` to `/api/v1/sessions`.
- The returned token is written only to `localStorage` key `tiku.localSessionToken` for the local MVP browser flow.
- The token is not displayed in UI text and is not logged.
- Browser evidence records token presence/absence only as boolean or DOM absence, not the token value.
- E2E uses the stored token for subsequent API authorization but does not attach or print token values.

## Authorization Boundary Review

- The implementation reuses the existing session route and local session runtime.
- Password verification, lockout, single-active-session creation, and session lookup remain in existing service/runtime code.
- Student redirect goes to `/home`.
- Admin roles `super_admin`, `ops_admin`, and `content_admin`, or a non-null `adminPublicId`, route to `/ops/users`.
- No backend auth or authorization weakening was introduced.

## API Contract Review

- `/api/v1/sessions` remains the only login transport boundary used by the UI.
- No REST route shape changed.
- No API response envelope changed.
- UI handling expects the existing `{ code, message, data }` envelope.
- No numeric database id is exposed in URLs or DTOs by this task.

## Test Coverage

- Unit tests cover disabled submit, invalid credentials, loading state, runtime unavailable, student redirect, admin redirect, and token non-rendering.
- Browser verification covers rendered `/login`, student UI login to `/home`, admin UI login to `/ops/users`, no browser warn/error logs, and no token in DOM text.
- E2E now logs in through the visible UI instead of direct browser fetch.

## Accepted Gaps

- The local MVP flow still stores the opaque session token in `localStorage`; this is an existing local runtime strategy, not a production auth hardening task.
- Cookie/session propagation to all pages is deferred to a future scoped task if required.

## Checklist

- Authentication required before protected API use: unchanged and covered by existing session runtime.
- Public URLs expose public identifiers only: unchanged.
- Response body shape stays `{ code, message, data, pagination? }`: unchanged.
- JSON keys stay camelCase: unchanged.
- Empty optional values remain `null`: unchanged.
- Secrets, password hashes, and session internals are not returned beyond the existing login token contract: pass.
- Tokens are not logged or rendered: pass.
- State-changing backend behavior introduced: none.

## Verdict

`APPROVE`
