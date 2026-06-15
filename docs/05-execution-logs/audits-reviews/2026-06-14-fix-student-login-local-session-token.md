# Audit Review: fix-student-login-local-session-token

## Review Result

- Result: BLOCKED_VALIDATION_FAILURE
- Task id: `fix-student-login-local-session-token`
- Branch: `codex/fix-student-login-local-session-token`
- Date: 2026-06-14

## Findings

### P1 - Login session persistence tests encode conflicting security decisions

The targeted student login UI test requires storing the returned session token in `tiku.localSessionToken`, while the
existing auth boundary test explicitly forbids `localStorage` usage in the login page and verifies a server-session-only
contract with `exposeBearerTokenToClient: false`.

Impact: the task cannot satisfy the targeted bugfix and the full unit suite with a one-file login-page change. Resolving
this requires a product/security decision on whether login is server-session-only or client bearer-token based.

### P2 - Full-suite student-experience timeout was not reproduced as a targeted blocker

The full unit run timed out one student-experience test, but rerunning that test together with the auth boundary test
passed the student-experience file. The remaining reproducible failure is the auth boundary conflict.

Impact: do not widen the task to student-experience code based on the full-suite timeout alone.

## Boundary Review

- Source implementation change attempted only in `src/app/(auth)/login/page.tsx`.
- No schema/migration, dependency/package/lockfile, env/secret, provider, e2e, deploy, payment, external-service, PR, or
  force-push work was performed.
- No token value, Authorization header, password, secret, database URL, row data, provider payload, model response, or
  private user data is recorded.
- The task stopped before local commit, merge, push, and branch cleanup because validation failed.

## Recommendation

Require a fresh scoped decision before continuing:

- Option A: preserve `server_session` and `exposeBearerTokenToClient: false`; update the student login/runtime tests and
  any protected-route token expectations accordingly.
- Option B: approve client bearer-token persistence; then update the auth boundary contract, auth boundary test, and
  related security evidence in a task that explicitly permits that security boundary change.

Until that decision is made, this branch should not be merged.
