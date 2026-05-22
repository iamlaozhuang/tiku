# Phase 8 Student Login Session UI Runtime Security Review

## Status

Pre-implementation review opened.

## Scope

Task: `phase-8-student-login-session-ui-runtime`

High-risk areas:

- `auth`
- `session`
- `authorization`
- `secret`
- browser storage
- browser screenshots and evidence

## Initial Controls

- Reuse the existing `/api/v1/sessions` runtime boundary.
- Do not add dependencies.
- Do not add environment variables or secrets.
- Do not expose returned session tokens in visible UI, console logs, evidence, or screenshots.
- Do not change password verification, lockout, or single active session semantics without explicit evidence.
- Do not bypass login with hardcoded role state for the browser UI path.

## Review Items For Closeout

- Confirm invalid credentials return a safe message.
- Confirm session token is not rendered in DOM text.
- Confirm browser console does not log token-bearing payloads.
- Confirm E2E assertions do not serialize token values into evidence.
- Confirm admin/student redirects are based on returned user context, not guessed phone number patterns.
